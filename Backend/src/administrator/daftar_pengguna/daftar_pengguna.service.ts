import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class DaftarPenggunaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, adminId: number) {
    const existing = await this.prisma.user.findFirst({
      where: { kode: createUserDto.kode },
    });

    if (existing) {
      throw new BadRequestException('Username/Kode sudah digunakan');
    }

    if (createUserDto.groupId) {
      const group = await this.prisma.group.findUnique({ where: { id: createUserDto.groupId } });
      if (group && group.name === 'Administrator') {
        throw new BadRequestException('Grup Administrator bersifat sistem dan tidak dapat dipilih untuk pengguna lain');
      }
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        kode: createUserDto.kode,
        password: hashedPassword,
        groupId: createUserDto.groupId || null,
        type: 'administrator',
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id.toString(),
        description: `Membuat pengguna baru: ${user.name} (${user.kode})`,
      },
    });

    const { password, refreshToken, ...result } = user;
    return result;
  }

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as any } },
          { kode: { contains: search, mode: 'insensitive' as any } },
        ],
      }),
    };

    const [list, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          group: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const sanitizedList = list.map(({ password, refreshToken, ...rest }) => rest);

    return {
      list: sanitizedList,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    const { password, refreshToken, ...result } = user;
    return result;
  }

  async update(id: number, updateUserDto: UpdateUserDto, adminId: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    if (user.kode === 'admin') {
      throw new BadRequestException('Pengguna administrator bersifat sistem dan tidak dapat diubah');
    }

    if (updateUserDto.kode && updateUserDto.kode !== user.kode) {
      const existing = await this.prisma.user.findFirst({
        where: { kode: updateUserDto.kode },
      });
      if (existing) throw new BadRequestException('Username/Kode sudah digunakan');
    }

    if (updateUserDto.groupId) {
      const group = await this.prisma.group.findUnique({ where: { id: updateUserDto.groupId } });
      if (group && group.name === 'Administrator') {
        throw new BadRequestException('Grup Administrator bersifat sistem dan tidak dapat dipilih untuk pengguna lain');
      }
    }

    const data: any = {
      name: updateUserDto.name,
      kode: updateUserDto.kode,
      groupId: updateUserDto.groupId,
    };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: user.id.toString(),
        description: `Mengubah pengguna: ${user.name} -> ${updated.name}`,
      },
    });

    const { password, refreshToken, ...result } = updated;
    return result;
  }

  async remove(id: number, adminId: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    if (user.kode === 'admin') {
      throw new BadRequestException('Pengguna administrator bersifat sistem dan tidak dapat dihapus');
    }

    if (user.id === adminId) {
      throw new BadRequestException('Tidak dapat menghapus akun Anda sendiri');
    }

    await this.prisma.$transaction([
      this.prisma.user.delete({ where: { id } }),
      this.prisma.activityLog.create({
        data: {
          userId: adminId,
          action: 'DELETE_USER',
          entity: 'User',
          entityId: user.id.toString(),
          description: `Menghapus pengguna: ${user.name} (${user.kode})`,
        },
      }),
    ]);

    return { message: 'Berhasil menghapus pengguna' };
  }
}
