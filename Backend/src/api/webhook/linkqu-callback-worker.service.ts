import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { SocketService } from '../../socket/socket.service';
import { PengumumanService } from '../../pengumuman/pengumuman.service';
import { verifyLinkQuCallbackPayload } from './linkqu-verifier';
import { LinkquCallbackProcessorService } from './linkqu-callback-processor.service';
import * as crypto from 'crypto';

@Injectable()
export class LinkquCallbackWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LinkquCallbackWorkerService.name);
  private workerTimer: NodeJS.Timeout | null = null;
  private readonly workerId: string;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly socketService: SocketService,
    private readonly pengumumanService: PengumumanService,
    private readonly linkquProcessor: LinkquCallbackProcessorService,
  ) {
    this.workerId = `worker-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  }

  onModuleInit() {
    this.logger.log(`[LinkquCallbackWorker] Initialized with ID: ${this.workerId}`);
    // Start background polling loop every 10 seconds (in test/prod)
    if (process.env.NODE_ENV !== 'test') {
      this.workerTimer = setInterval(() => {
        this.processBatch().catch((err) => {
          this.logger.error(`[LinkquCallbackWorker] Unhandled batch error: ${err.message}`, err.stack);
        });
      }, 10000);
    }
  }

  onModuleDestroy() {
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = null;
    }
  }

  getWorkerId(): string {
    return this.workerId;
  }

  /**
   * Mengambil dan mengunci batch item inbox yang:
   * 1. Status PENDING dan next_retry_at <= now()
   * ATAU
   * 2. Status PROCESSING dan lease kedaluwarsa (locked_until < now()) -> Recovery worker yang crash!
   */
  async claimBatch(workerId: string, batchSize = 10, leaseDurationMs = 30000): Promise<any[]> {
    const now = new Date();

    const candidates = await this.prisma.paymentGatewayCallbackInbox.findMany({
      where: {
        OR: [
          {
            status: 'PENDING',
            next_retry_at: { lte: now },
          },
          {
            status: 'PROCESSING',
            locked_until: { lt: now }, // Recovery crashed worker
          },
        ],
      },
      take: batchSize,
      orderBy: { created_at: 'asc' },
    });

    const claimedItems: any[] = [];
    const leaseExpires = new Date(Date.now() + leaseDurationMs);

    for (const candidate of candidates) {
      const claimResult = await this.prisma.paymentGatewayCallbackInbox.updateMany({
        where: {
          id: candidate.id,
          OR: [
            { status: 'PENDING' },
            { status: 'PROCESSING', locked_until: { lt: now } },
          ],
        },
        data: {
          status: 'PROCESSING',
          locked_by: workerId,
          locked_until: leaseExpires,
          updated_at: new Date(),
        },
      });

      if (claimResult.count > 0) {
        claimedItems.push({
          ...candidate,
          status: 'PROCESSING',
          locked_by: workerId,
          locked_until: leaseExpires,
        });
      }
    }

    return claimedItems;
  }

  /**
   * Menjalankan pemrosesan satu batch kandidat inbox
   */
  async processBatch(batchSize = 10, leaseDurationMs = 30000): Promise<{ processed: number; failed: number; retried: number }> {
    if (this.isProcessing) {
      return { processed: 0, failed: 0, retried: 0 };
    }

    this.isProcessing = true;
    let processed = 0;
    let failed = 0;
    let retried = 0;

    try {
      const items = await this.claimBatch(this.workerId, batchSize, leaseDurationMs);

      for (const item of items) {
        const result = await this.processInboxItem(item, this.workerId);
        if (result.status === 'PROCESSED') processed++;
        else if (result.status === 'RETRY') retried++;
        else failed++;
      }
    } finally {
      this.isProcessing = false;
    }

    return { processed, failed, retried };
  }

  /**
   * Memproses satu item inbox dengan verifikasi kepemilikan fencing token (locked_by & locked_until)
   */
  async processInboxItem(
    item: any,
    workerId: string,
  ): Promise<{ status: 'PROCESSED' | 'RETRY' | 'FAILED' | 'CONFLICT' | 'FENCING_REJECTED'; message?: string }> {
    // 1. Validasi Kepemilikan Lease (Fencing Token Check)
    const now = new Date();
    if (item.locked_by !== workerId || (item.locked_until && item.locked_until < now)) {
      this.logger.warn(`[LinkquCallbackWorker] Fencing rejected for item ${item.id}: lease stolen or expired`);
      return { status: 'FENCING_REJECTED', message: 'Lease expired or stolen' };
    }

    // 2. Re-Autentikasi Penuh (Fail-Closed: Worker tidak pernah mempercayai payload tanpa verifikasi ulang)
    let parsedPayload: any;
    let parsedHeaders: any;
    try {
      parsedPayload = JSON.parse(item.payload);
      parsedHeaders = item.headers ? JSON.parse(item.headers) : undefined;
    } catch (e: any) {
      await this.markItemTerminal(item.id, workerId, 'FAILED', `Malformed JSON payload/headers: ${e.message}`);
      return { status: 'FAILED', message: 'Malformed JSON' };
    }

    const pengaturan = await this.prisma.pengaturanUmum.findFirst();
    const signatureKey = pengaturan?.linkqu_signature_key || process.env.LINKQU_SIGNATURE_KEY;
    const configuredClientId = pengaturan?.linkqu_client_id;

    const verification = verifyLinkQuCallbackPayload(
      parsedPayload,
      signatureKey,
      configuredClientId,
      parsedHeaders,
    );

    if (!verification.isValid || !verification.data) {
      await this.markItemTerminal(
        item.id,
        workerId,
        'FAILED',
        `Replay authentication failed: ${verification.message}`,
      );
      this.logger.warn(`[LinkquCallbackWorker] Re-authentication failed for item ${item.id}: ${verification.message}`);
      return { status: 'FAILED', message: verification.message };
    }

    // 3. Serahkan ke processor
    return this.linkquProcessor.processWorkerItem(item, workerId, verification.data);
  }

  private async markItemTerminal(
    id: number,
    workerId: string,
    status: 'FAILED' | 'MANUAL_REVIEW' | 'CONFLICT',
    errorMsg: string,
  ) {
    const now = new Date();
    await this.prisma.paymentGatewayCallbackInbox.updateMany({
      where: {
        id,
        locked_by: workerId,
        locked_until: { gte: now },
      },
      data: {
        status,
        last_error: errorMsg,
        locked_by: null,
        locked_until: null,
        updated_at: new Date(),
      },
    });
  }
}
