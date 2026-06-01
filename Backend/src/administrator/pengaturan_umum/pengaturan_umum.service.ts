import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdatePengaturanUmumDto } from './dto/update-pengaturan-umum.dto';

@Injectable()
export class PengaturanUmumService {
  constructor(private prisma: PrismaService) {}

  async getPengaturan() {
    let pengaturan = await this.prisma.pengaturanUmum.findFirst();
    
    // Jika belum ada data pengaturan, inisialisasi default
    if (!pengaturan) {
      pengaturan = await this.prisma.pengaturanUmum.create({
        data: {
          nama_aplikasi: 'Outlet Pulsa',
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
      
      if (!pengaturan) {
        pengaturan = await this.prisma.pengaturanUmum.create({
          data: updatePengaturanUmumDto,
        });
      } else {
        pengaturan = await this.prisma.pengaturanUmum.update({
          where: { id: pengaturan.id },
          data: updatePengaturanUmumDto,
        });
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
