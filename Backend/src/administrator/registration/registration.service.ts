import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { GetRegistrationDto } from './dto/get-registration.dto';

@Injectable()
export class RegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetRegistrationDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const search = query.search || '';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { whatsapp: { contains: search, mode: 'insensitive' } },
        { fullname: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [list, total] = await Promise.all([
      this.prisma.temp_registrasi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.temp_registrasi.count({ where }),
    ]);

    return {
      list,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async remove(id: number) {
    const registration = await this.prisma.temp_registrasi.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }

    return this.prisma.temp_registrasi.delete({
      where: { id },
    });
  }
}
