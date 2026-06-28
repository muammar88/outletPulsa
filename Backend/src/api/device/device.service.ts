import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RegisterDeviceDto, ValidateDeviceDto } from './dto/device.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DeviceService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDeviceDto) {
    console.log(`[Device Register] Menerima request registrasi device. Payload:`, dto);
    
    let deviceCode = dto.device_code;
    
    // Jika device_code dikirimkan klien, periksa apakah sudah ada di database
    if (deviceCode) {
      console.log(`[Device Register] Klien mengirimkan device_code: ${deviceCode}. Mencari di database...`);
      const existingDevice = await this.prisma.deviceConnected.findUnique({
        where: { device_code: deviceCode }
      });
      
      if (existingDevice) {
        console.log(`[Device Register] Device ditemukan di database. Menggunakan data existing.`);
        return {
          message: 'Perangkat berhasil digunakan ulang',
          data: {
            device_code: existingDevice.device_code,
          },
        };
      }
      // Device_code lama tidak ditemukan di DB (mungkin dihapus admin),
      // generate device_code baru yang proper
      console.log(`[Device Register] Device tidak ditemukan di database. Generate device_code baru...`);
      deviceCode = 'DEV-' + uuidv4().toUpperCase().split('-')[0] + '-' + Date.now().toString().slice(-6);
    } else {
      console.log(`[Device Register] Klien tidak mengirimkan device_code. Generate kode baru...`);
      deviceCode = 'DEV-' + uuidv4().toUpperCase().split('-')[0] + '-' + Date.now().toString().slice(-6);
    }

    console.log(`[Device Register] Menyimpan ke database dengan device_code: ${deviceCode}`);
    const device = await this.prisma.deviceConnected.create({
      data: {
        device_code: deviceCode,
        device_name: dto.device_name,
        device_brand: dto.device_brand,
        device_model: dto.device_model,
        os_name: dto.os_name,
        os_version: dto.os_version,
        app_version: dto.app_version,
      },
    });

    return {
      message: 'Perangkat berhasil diregistrasi',
      data: {
        device_code: device.device_code,
      },
    };
  }

  async validate(dto: ValidateDeviceDto) {
    console.log(`[Device Validate] Menerima request validasi untuk device_code: ${dto.device_code}`);
    const device = await this.prisma.deviceConnected.findUnique({
      where: { device_code: dto.device_code },
    });

    if (!device) {
      console.log(`[Device Validate] Gagal: Perangkat ${dto.device_code} tidak terdaftar di database.`);
      return {
        message: 'Perangkat tidak terdaftar',
        data: {
          valid: false,
        }
      };
    }

    console.log(`[Device Validate] Sukses: Perangkat ${dto.device_code} valid.`);
    return {
      message: 'Perangkat terdaftar',
      data: {
        valid: true,
        device: device
      },
    };
  }

  async getDevice(deviceCode: string) {
    const device = await this.prisma.deviceConnected.findUnique({
      where: { device_code: deviceCode },
      include: {
        member: {
          select: { id: true, fullname: true, whatsappnumber: true, kode: true }
        }
      }
    });

    if (!device) {
      throw new NotFoundException('Perangkat tidak ditemukan');
    }

    return {
      message: 'Detail perangkat',
      data: device,
    };
  }
}
