import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class SchedulerService implements OnModuleInit {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(@InjectQueue('product-sync') private productSyncQueue: Queue) {}

  async onModuleInit() {
    this.logger.log('Initializing BullMQ Scheduler (Production Only)');

    // Hapus semua delayed / waiting jobs yang tersangkut (opsional tapi disarankan)
    // await this.productSyncQueue.obliterate({ force: true });
    
    await this.setupCronJobs();
  }

  private async setupCronJobs() {
    this.logger.log('Adding cron jobs to queue...');
    
    await this.productSyncQueue.add(
      'daily-sync',
      {},
      {
        repeat: {
          pattern: '0 0,7 * * *', // Setiap jam 00:00 dan 07:00
        },
        jobId: 'daily-product-sync', // Deduplication key
      },
    );

    this.logger.log('Cron jobs added successfully.');
  }
}
