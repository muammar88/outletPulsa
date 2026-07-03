import { Injectable, Logger, OnModuleInit, NotFoundException, ForbiddenException } from '@nestjs/common';
import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { PrismaService } from '../prisma.service';
import { SocketService } from '../socket/socket.service';

interface SendPengumumanDto {
  title: string;
  body: string;
  imageUrl?: string;
  payload?: any;
  pengumumanType: string;
  targetType: 'All' | 'User' | 'Device';
  targetId?: string; // Member ID stringified or Device Code
  createdBy?: number;
}

@Injectable()
export class PengumumanService implements OnModuleInit {
  private readonly logger = new Logger(PengumumanService.name);

  constructor(
    private prisma: PrismaService,
    private socketService: SocketService
  ) {}

  onModuleInit() {
    if (!getApps().length) {
      try {
        // We use try-catch so it won't crash if credentials are not set
        if (process.env.FIREBASE_PROJECT_ID) {
            initializeApp({
                credential: cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                })
            });
            this.logger.log('Firebase Admin SDK initialized with cert.');
        } else {
             initializeApp({
                credential: applicationDefault(),
            });
            this.logger.log('Firebase Admin SDK initialized with Application Default Credentials.');
        }
      } catch (error) {
        this.logger.warn('Failed to initialize Firebase Admin SDK. Please check credentials: ' + error.message);
      }
    }
  }

  /**
   * Main entry point to send pengumumans
   */
  async sendPengumuman(dto: SendPengumumanDto) {
    // 1. Insert into Pengumuman table
    const pengumuman = await this.prisma.pengumuman.create({
      data: {
        title: dto.title,
        body: dto.body,
        image_url: dto.imageUrl,
        payload: dto.payload ? JSON.stringify(dto.payload) : null,
        pengumuman_type: dto.pengumumanType,
        target_type: dto.targetType,
        target_id: dto.targetId,
        created_by: dto.createdBy,
        status: 'Sending',
      },
    });

    try {
      if (dto.targetType === 'Device' && dto.targetId) {
        await this.sendToDevice(pengumuman, dto.targetId);
      } else if (dto.targetType === 'User' && dto.targetId) {
        await this.sendToUser(pengumuman, parseInt(dto.targetId));
      } else if (dto.targetType === 'All') {
        await this.sendBroadcast(pengumuman);
      }

      await this.prisma.pengumuman.update({
        where: { id: pengumuman.id },
        data: { status: 'Success', sent_at: new Date() },
      });
      this.logger.log(`Pengumuman ${pengumuman.id} processed successfully`);

      // Emit via Socket.IO for realtime updates in Flutter Info tab
      const announcementData = {
        id: pengumuman.id,
        title: pengumuman.title,
        content: pengumuman.body,
        createdAt: pengumuman.createdAt,
      };

      if (dto.targetType === 'All') {
         this.socketService.emitAnnouncement(announcementData);
      } else if (dto.targetType === 'User' && dto.targetId) {
         this.socketService.emitAnnouncement(announcementData, parseInt(dto.targetId));
      }

    } catch (error) {
      await this.prisma.pengumuman.update({
        where: { id: pengumuman.id },
        data: { status: 'Failed', sent_at: new Date() },
      });
      this.logger.error(`Failed to process pengumuman ${pengumuman.id}:`, error);
    }
  }

  public async sendToDevice(pengumuman: any, deviceCode: string) {
    const device = await this.prisma.deviceConnected.findUnique({
      where: { device_code: deviceCode },
    });

    if (!device) return;

    await this.processRecipientAndSend(pengumuman, device);
  }

  public async sendToUser(pengumuman: any, memberId: number) {
    const devices = await this.prisma.deviceConnected.findMany({
      where: { member_id: memberId },
    });

    for (const device of devices) {
      await this.processRecipientAndSend(pengumuman, device);
    }
  }

  public async sendBroadcast(pengumuman: any) {
    const devices = await this.prisma.deviceConnected.findMany({
      where: { fcm_token: { not: null } },
    });

    const existingRecipients = await this.prisma.pengumumanRecipient.findMany({
      where: {
        pengumuman_id: pengumuman.id,
        device_code: { in: devices.map(d => d.device_code) }
      }
    });

    const recipientMap = new Map();
    for (const rec of existingRecipients) {
      recipientMap.set(rec.device_code, rec);
    }

    let success = 0;
    let retried = 0;
    let skipped = 0;
    let failed = 0;

    for (const device of devices) {
      const existing = recipientMap.get(device.device_code);
      if (existing) {
        if (existing.status.toUpperCase() === 'FAILED') {
          const isSuccess = await this.processRecipientAndSend(pengumuman, device, existing.id);
          if (isSuccess) retried++; else failed++;
        } else {
          skipped++;
        }
      } else {
        const isSuccess = await this.processRecipientAndSend(pengumuman, device);
        if (isSuccess) success++; else failed++;
      }
    }

    return { total: devices.length, success, retried, skipped, failed };
  }

  public async processRecipientAndSend(pengumuman: any, device: any, existingRecipientId?: number) {
    let recipientId = existingRecipientId;

    if (!recipientId) {
      const recipient = await this.prisma.pengumumanRecipient.create({
        data: {
          pengumuman_id: pengumuman.id,
          member_id: device.member_id,
          device_code: device.device_code,
          status: 'Pending',
        },
      });
      recipientId = recipient.id;
    } else {
      await this.prisma.pengumumanRecipient.update({
        where: { id: recipientId },
        data: { status: 'Pending', error_message: null },
      });
    }

    if (!device.fcm_token) {
      await this.prisma.pengumumanRecipient.update({
        where: { id: recipientId },
        data: { status: 'Failed', error_message: 'No FCM Token' },
      });
      return false;
    }

    try {
      let parsedPayload: Record<string, string> = {};
      if (pengumuman.payload) {
        const rawPayload = JSON.parse(pengumuman.payload);
        for (const key in rawPayload) {
          if (rawPayload[key] !== null && rawPayload[key] !== undefined) {
            parsedPayload[key] = String(rawPayload[key]);
          }
        }
      }

      const message = {
        token: device.fcm_token,
        notification: {
          title: pengumuman.title,
          body: pengumuman.body,
        },
        data: {
          pengumumanId: pengumuman.id.toString(),
          pengumumanType: pengumuman.pengumuman_type,
          ...parsedPayload,
        },
      };

      if (pengumuman.image_url) {
        message.notification['imageUrl'] = pengumuman.image_url;
      }

      await getMessaging().send(message as any);

      await this.prisma.pengumumanRecipient.update({
        where: { id: recipientId },
        data: { status: 'Delivered', delivered_at: new Date() },
      });
      return true;
    } catch (error) {
      let errorMessage = error.message;
      let status = 'Failed';

      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        await this.prisma.deviceConnected.update({
          where: { id: device.id },
          data: { fcm_token: null },
        });
        errorMessage = 'Invalid token removed';
      }

      await this.prisma.pengumumanRecipient.update({
        where: { id: recipientId },
        data: { status, error_message: errorMessage },
      });
      this.logger.error(`FCM send failed for device ${device.device_code}: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Helper for System Events
   */
  async sendTransactionStatus(memberId: number, title: string, body: string, payload?: any, type: string = 'Transaction') {
    return this.sendPengumuman({
      title,
      body,
      pengumumanType: type,
      targetType: 'User',
      targetId: memberId.toString(),
      payload,
    });
  }

  async getMobileHistory(memberId: number, deviceCode?: string) {
    const whereClause: any = {
      OR: [
        { member_id: memberId }
      ],
      pengumuman: {
        pengumuman_type: {
          notIn: ['Deposit', 'Transaction', 'System', 'deposit']
        }
      }
    };
    
    if (deviceCode) {
      whereClause.OR.push({ device_code: deviceCode });
    }

    const recipients = await this.prisma.pengumumanRecipient.findMany({
      where: whereClause,
      include: { pengumuman: true },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
    });

    const map = new Map();
    for (const rec of recipients) {
      if (!map.has(rec.pengumuman_id)) {
        map.set(rec.pengumuman_id, rec);
      } else {
        // If we already have a record, replace it ONLY if the current one matches this deviceCode
        if (rec.device_code === deviceCode) {
          map.set(rec.pengumuman_id, rec);
        }
      }
    }

    const deduplicated = Array.from(map.values());
    deduplicated.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return deduplicated;
  }

  async markAsRead(recipientId: number, memberId: number, deviceCode?: string) {
    const recipient = await this.prisma.pengumumanRecipient.findUnique({
      where: { id: recipientId },
    });

    if (!recipient) {
      throw new NotFoundException('Pengumuman tidak ditemukan');
    }

    if (recipient.member_id !== memberId && recipient.device_code !== deviceCode) {
      throw new ForbiddenException('Akses ditolak');
    }

    if (recipient.status === 'Read') {
      return recipient;
    }

    return this.prisma.pengumumanRecipient.update({
      where: { id: recipientId },
      data: {
          status: 'Read',
          read_at: new Date()
      }
    });
  }

  async updateFcmToken(deviceCode: string, fcmToken: string) {
      return this.prisma.deviceConnected.update({
          where: { device_code: deviceCode },
          data: { fcm_token: fcmToken }
      });
  }
}
