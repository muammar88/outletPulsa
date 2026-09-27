import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PascabayarRecoveryService } from '../providers/pascabayar/pascabayar-recovery.service';

/**
 * Worker periodik pemulihan transaksi pascabayar pending/ambigu.
 * Dijalankan dari queue terpisah supaya tidak tercampur dengan job sinkron katalog.
 */
@Processor('pascabayar-recovery', { concurrency: 1 })
export class PascabayarRecoveryProcessor extends WorkerHost {
  private readonly logger = new Logger(PascabayarRecoveryProcessor.name);

  constructor(private readonly recovery: PascabayarRecoveryService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    return await this.recovery.recoverPending();
  }
}
