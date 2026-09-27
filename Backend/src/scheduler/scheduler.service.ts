import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue('product-sync') private productSyncQueue: Queue,
    @InjectQueue('pascabayar-recovery') private pascabayarRecoveryQueue: Queue,
    private prisma: PrismaService
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing BullMQ Scheduler (Production Only)');
    
    await this.setupCronJobs();
  }

  private async setupCronJobs() {
    this.logger.log('Reading cron schedules from database...');
    let pengaturan = await this.prisma.pengaturanUmum.findFirst();
    let schedules: { name: string; time: string }[] = [];

    if (pengaturan && pengaturan.bullmq_schedules) {
      try {
        schedules = JSON.parse(pengaturan.bullmq_schedules);
      } catch (e) {
        this.logger.error('Failed to parse bullmq_schedules JSON', e);
      }
    } else {
      // Default fallback
      schedules = [
        { name: 'Pagi', time: '00:00' },
        { name: 'Sore', time: '07:00' }
      ];
    }

    for (const schedule of schedules) {
      if (schedule.time && schedule.time.includes(':')) {
        const [hour, minute] = schedule.time.split(':');
        const cronExpression = `${minute} ${hour} * * *`;
        const jobId = `daily-product-sync-${schedule.time}`;

        await this.productSyncQueue.add(
          'daily-sync',
          { name: schedule.name, time: schedule.time },
          {
            repeat: {
              pattern: cronExpression,
            },
            jobId: jobId, // Deduplication key
          },
        );
        this.logger.log(`Added cron job [${schedule.name}] at ${schedule.time} (${cronExpression})`);
      }
    }
    // Pemulihan transaksi pascabayar pending/ambigu dijalankan periodik,
    // terpisah dari jadwal sinkron katalog agar tidak memicu sync produk.
    await this.pascabayarRecoveryQueue.add(
      'recover-pending',
      {},
      {
        repeat: { pattern: '*/5 * * * *' },
        jobId: 'pascabayar-recovery',
      },
    );
    this.logger.log('Recovery pascabayar dijadwalkan setiap 5 menit.');

    this.logger.log('All cron jobs added successfully.');
  }

  @OnEvent('pengaturan.updated')
  async handlePengaturanUpdated(bullmq_schedules_json: string) {
    this.logger.log('Pengaturan updated. Reloading schedules...');
    
    // Remove existing repeatable jobs
    const repeatableJobs = await this.productSyncQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.productSyncQueue.removeRepeatableByKey(job.key);
      this.logger.log(`Removed existing repeatable job: ${job.key}`);
    }

    // Read new schedules and set them up
    await this.setupCronJobs();
  }
}
