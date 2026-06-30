import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PengumumanService } from 'src/pengumuman/pengumuman.service';

@Injectable()
export class AdminPengumumanService {
  constructor(
    private prisma: PrismaService,
    private pengumumanService: PengumumanService,
  ) {}

  async getAll(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = '',
    sortBy: string = 'createdAt',
    sortDesc: boolean = true,
  ) {
    const skip = (page - 1) * limit;

    let where: any = {};
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }
    if (status !== '') {
      where.is_active = status === 'true';
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortDesc ? 'desc' : 'asc';

    const [data, total] = await Promise.all([
      this.prisma.pengumuman.findMany({
        where: {
          ...where,
          pengumuman_type: 'Announcement', // ONLY ANNOUNCEMENT TYPE
        },
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.pengumuman.count({ where: { ...where, pengumuman_type: 'Announcement' } }),
    ]);

    // Map body and image_url back to content and attachment for frontend compatibility
    const mappedData = data.map(item => ({
      ...item,
      content: item.body,
      attachment: item.image_url,
      status: item.is_active,
    }));

    return {
      list: mappedData,
      total,
      page,
      limit,
    };
  }

  async getById(id: number) {
    const pengumuman = await this.prisma.pengumuman.findUnique({
      where: { id },
    });
    if (!pengumuman || pengumuman.pengumuman_type !== 'Announcement') {
      throw new NotFoundException(`Pengumuman dengan ID ${id} tidak ditemukan`);
    }
    return {
      ...pengumuman,
      content: pengumuman.body,
      attachment: pengumuman.image_url,
      status: pengumuman.is_active,
    };
  }

  async create(data: any, createdBy: number) {
    return this.prisma.pengumuman.create({
      data: {
        title: data.title,
        body: data.content,
        is_active: data.status,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        priority: data.priority,
        image_url: data.attachment,
        created_by: createdBy,
        pengumuman_type: 'Announcement',
        target_type: 'All',
        status: 'Draft',
      },
    });
  }

  async update(id: number, data: any) {
    await this.getById(id); // Ensure exists
    return this.prisma.pengumuman.update({
      where: { id },
      data: {
        title: data.title,
        body: data.content,
        is_active: data.status,
        start_date: new Date(data.start_date),
        end_date: new Date(data.end_date),
        priority: data.priority,
        image_url: data.attachment,
      },
    });
  }

  async delete(id: number) {
    await this.getById(id);
    return this.prisma.pengumuman.delete({
      where: { id },
    });
  }

  async publish(id: number, adminId: number) {
    const pengumuman = await this.prisma.pengumuman.findUnique({ where: { id } });
    if (!pengumuman) {
      throw new NotFoundException(`Pengumuman dengan ID ${id} tidak ditemukan`);
    }

    try {
      // Update status to Sending
      await this.prisma.pengumuman.update({
        where: { id },
        data: { status: 'Sending' }
      });

      // Send to all devices and capture summary
      const summary = await this.pengumumanService.sendBroadcast(pengumuman);

      // Update status to Success
      await this.prisma.pengumuman.update({
        where: { id },
        data: { status: 'Success', sent_at: new Date() }
      });

      return { message: 'Push pengumuman selesai diproses', summary };
    } catch (error) {
      await this.prisma.pengumuman.update({
        where: { id },
        data: { status: 'Failed' }
      });
      throw error;
    }
  }
}
