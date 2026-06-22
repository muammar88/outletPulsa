import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdatePengaturanUmumDto } from './dto/update-pengaturan-umum.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PengaturanUmumService {
  constructor(private prisma: PrismaService, private eventEmitter: EventEmitter2) {}

  async getPengaturan() {
    let pengaturan = await this.prisma.pengaturanUmum.findFirst();
    
    // Jika belum ada data pengaturan, inisialisasi default
    if (!pengaturan) {
      pengaturan = await this.prisma.pengaturanUmum.create({
        data: {
          nama_aplikasi: 'Outlet Pulsa',
          bullmq_schedules: JSON.stringify([
            { name: "Pagi", time: "00:00" },
            { name: "Sore", time: "07:00" }
          ])
        },
      });
    }

    return {
      statusCode: 200,
      message: 'Berhasil mengambil pengaturan umum',
      data: pengaturan,
    };
  }

  async update(updatePengaturanUmumDto: UpdatePengaturanUmumDto) {
    try {
      let pengaturan = await this.prisma.pengaturanUmum.findFirst();
      let updatedSchedules = false;
      
      if (!pengaturan) {
        pengaturan = await this.prisma.pengaturanUmum.create({
          data: updatePengaturanUmumDto,
        });
        if (updatePengaturanUmumDto.bullmq_schedules) {
          updatedSchedules = true;
        }
      } else {
        if (updatePengaturanUmumDto.bullmq_schedules !== pengaturan.bullmq_schedules) {
          updatedSchedules = true;
        }
        pengaturan = await this.prisma.pengaturanUmum.update({
          where: { id: pengaturan.id },
          data: updatePengaturanUmumDto,
        });
      }

      if (updatedSchedules) {
        this.eventEmitter.emit('pengaturan.updated', pengaturan.bullmq_schedules);
      }

      return {
        statusCode: 200,
        message: 'Pengaturan berhasil diperbarui',
        data: pengaturan,
      };
    } catch (error) {
      throw new BadRequestException('Gagal memperbarui pengaturan');
    }
  }
}
