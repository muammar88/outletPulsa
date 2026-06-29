import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { PrismaService } from '../prisma.service';

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

  constructor(private prisma: PrismaService) {}

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

    await this.createRecipientAndSend(pengumuman, device);
  }

  public async sendToUser(pengumuman: any, memberId: number) {
    const devices = await this.prisma.deviceConnected.findMany({
      where: { member_id: memberId },
    });

    for (const device of devices) {
      await this.createRecipientAndSend(pengumuman, device);
    }
  }

  public async sendBroadcast(pengumuman: any) {
    const devices = await this.prisma.deviceConnected.findMany({
      where: { fcm_token: { not: null } },
    });

    for (const device of devices) {
      await this.createRecipientAndSend(pengumuman, device);
    }
  }

  public async createRecipientAndSend(pengumuman: any, device: any) {
    const recipient = await this.prisma.pengumumanRecipient.create({
      data: {
        pengumuman_id: pengumuman.id,
        member_id: device.member_id,
        device_code: device.device_code,
        status: 'Pending',
      },
    });

    if (!device.fcm_token) {
      await this.prisma.pengumumanRecipient.update({
        where: { id: recipient.id },
        data: { status: 'Failed', error_message: 'No FCM Token' },
      });
      return;
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
        pengumuman: {
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
        message.pengumuman['imageUrl'] = pengumuman.image_url;
      }

      await getMessaging().send(message as any);

      await this.prisma.pengumumanRecipient.update({
        where: { id: recipient.id },
        data: { status: 'Delivered', delivered_at: new Date() },
      });
    } catch (error) {
      let errorMessage = error.message;
      let status = 'Failed';

      // Handle invalid token
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
        where: { id: recipient.id },
        data: { status, error_message: errorMessage },
      });
      this.logger.error(`FCM send failed for device ${device.device_code}: ${errorMessage}`);
    }
  }

  /**
   * Helper for System Events
   */
  async sendTransactionStatus(memberId: number, title: string, body: string, payload?: any) {
    return this.sendPengumuman({
      title,
      body,
      pengumumanType: 'Transaction',
      targetType: 'User',
      targetId: memberId.toString(),
      payload,
    });
  }

  async getMobileHistory(memberId: number) {
     return this.prisma.pengumumanRecipient.findMany({
        where: { member_id: memberId },
        include: { pengumuman: true },
        orderBy: { createdAt: 'desc' }
     });
  }

  async markAsRead(recipientId: number) {
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
