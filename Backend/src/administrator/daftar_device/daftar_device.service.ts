import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetDeviceDto } from './dto/get-device.dto';

@Injectable()
export class DaftarDeviceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetDeviceDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { device_name: { contains: search, mode: 'insensitive' as any } },
            { device_code: { contains: search, mode: 'insensitive' as any } },
            { device_brand: { contains: search, mode: 'insensitive' as any } },
            {
              member: {
                OR: [
                  { fullname: { contains: search, mode: 'insensitive' as any } },
                  { whatsappnumber: { contains: search, mode: 'insensitive' as any } },
                ]
              }
            }
          ],
        }
      : {};

    const [list, total] = await Promise.all([
      this.prisma.deviceConnected.findMany({
        where,
        skip,
        take: limit,
        orderBy: { last_login: 'desc' },
        include: {
          member: {
            select: {
              id: true,
              fullname: true,
              whatsappnumber: true,
            }
          }
        }
      }),
      this.prisma.deviceConnected.count({ where }),
    ]);

    // Calculate online/offline status dynamically (e.g. online if last login within 15 minutes)
    const now = new Date();
    const fifteenMinutes = 15 * 60 * 1000;

    const formattedList = list.map(device => {
      let isOnline = false;
      if (device.last_login) {
        const lastLoginTime = new Date(device.last_login).getTime();
        if (now.getTime() - lastLoginTime <= fifteenMinutes) {
          isOnline = true;
        }
      }
      return {
        ...device,
        status: isOnline ? 'Online' : 'Offline',
      };
    });

    return {
      list: formattedList,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const device = await this.prisma.deviceConnected.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            fullname: true,
            whatsappnumber: true,
          }
        }
      }
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    let isOnline = false;
    if (device.last_login) {
      const now = new Date();
      const fifteenMinutes = 15 * 60 * 1000;
      const lastLoginTime = new Date(device.last_login).getTime();
      if (now.getTime() - lastLoginTime <= fifteenMinutes) {
        isOnline = true;
      }
    }

    return {
      ...device,
      status: isOnline ? 'Online' : 'Offline',
    };
  }

  async remove(id: number) {
    const device = await this.prisma.deviceConnected.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    await this.prisma.deviceConnected.delete({
      where: { id },
    });

    return { message: `Device with ID ${id} successfully deleted` };
  }
}
