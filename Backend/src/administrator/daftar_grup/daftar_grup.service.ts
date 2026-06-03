import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';

@Injectable()
export class DaftarGrupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto, adminId: number) {
    const existing = await this.prisma.group.findUnique({
      where: { name: createGroupDto.name },
    });

    if (existing) {
      throw new BadRequestException('Nama grup sudah digunakan');
    }

    const group = await this.prisma.group.create({
      data: {
        name: createGroupDto.name,
        description: createGroupDto.description,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'CREATE_GROUP',
        entity: 'Group',
        entityId: group.id.toString(),
        description: `Membuat grup baru: ${group.name}`,
      },
    });

    return group;
  }

  async findAll(page: number, limit: number, search: string) {
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        name: { contains: search, mode: 'insensitive' as any },
      }),
    };

    const [list, total] = await Promise.all([
      this.prisma.group.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          permissions: {
            include: { permission: true },
          },
          _count: {
            select: { users: true },
          }
        },
      }),
      this.prisma.group.count({ where }),
    ]);

    return {
      list,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!group) throw new NotFoundException('Grup tidak ditemukan');
    return group;
  }

  async update(id: number, updateGroupDto: UpdateGroupDto, adminId: number) {
    const group = await this.findOne(id);

    if (group.name === 'Administrator') {
      throw new BadRequestException('Grup Administrator bersifat sistem dan tidak dapat diubah');
    }

    if (updateGroupDto.name && updateGroupDto.name !== group.name) {
      const existing = await this.prisma.group.findUnique({
        where: { name: updateGroupDto.name },
      });
      if (existing) throw new BadRequestException('Nama grup sudah digunakan');
    }

    const updated = await this.prisma.group.update({
      where: { id },
      data: updateGroupDto,
    });

    await this.prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE_GROUP',
        entity: 'Group',
        entityId: group.id.toString(),
        description: `Mengubah grup: ${group.name} -> ${updated.name}`,
      },
    });

    return updated;
  }

  async remove(id: number, adminId: number) {
    const group = await this.findOne(id);

    if (group.name === 'Administrator') {
      throw new BadRequestException('Grup Administrator bersifat sistem dan tidak dapat dihapus');
    }

    const userCount = await this.prisma.user.count({ where: { groupId: id } });
    if (userCount > 0) {
      throw new BadRequestException('Grup tidak bisa dihapus karena masih memiliki pengguna');
    }

    await this.prisma.$transaction([
      this.prisma.groupPermission.deleteMany({ where: { groupId: id } }),
      this.prisma.group.delete({ where: { id } }),
      this.prisma.activityLog.create({
        data: {
          userId: adminId,
          action: 'DELETE_GROUP',
          entity: 'Group',
          entityId: group.id.toString(),
          description: `Menghapus grup: ${group.name}`,
        },
      }),
    ]);

    return { message: 'Berhasil menghapus grup' };
  }

  async getPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async assignPermissions(id: number, dto: AssignPermissionDto, adminId: number) {
    const group = await this.findOne(id);

    if (group.name === 'Administrator') {
      throw new BadRequestException('Hak akses grup Administrator bersifat sistem dan tidak dapat diubah');
    }

    await this.prisma.$transaction(async (prisma) => {
      // Remove all current permissions
      await prisma.groupPermission.deleteMany({ where: { groupId: id } });

      // Add new permissions
      if (dto.permissionIds && dto.permissionIds.length > 0) {
        const data = dto.permissionIds.map(permId => ({
          groupId: id,
          permissionId: permId,
        }));
        await prisma.groupPermission.createMany({ data });
      }

      await prisma.activityLog.create({
        data: {
          userId: adminId,
          action: 'UPDATE_GROUP_PERMISSIONS',
          entity: 'Group',
          entityId: group.id.toString(),
          description: `Memperbarui hak akses grup: ${group.name} (${dto.permissionIds.length} akses)`,
        },
      });
    });

    return this.findOne(id);
  }
}
