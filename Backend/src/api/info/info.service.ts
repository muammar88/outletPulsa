import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class InfoService {
  constructor(private readonly prisma: PrismaService) {}

  private mapToListObject(notifs: any[], isRead: boolean) {
    const list: Record<string, any> = {};
    notifs.forEach((notif, idx) => {
      list[idx.toString()] = {
        id: notif.id,
        title: notif.title,
        desc: notif.description,
        status_baca: isRead,
        createdAt: notif.createdAt,
      };
    });
    return {
      list,
    };
  }

  async getBelumBaca(memberKode: string) {
    const member = await this.prisma.member.findFirst({ where: { kode: memberKode } });
    if (!member) throw new NotFoundException('Member not found');

    const notifs = await this.prisma.notif.findMany({
      where: {
        notifMemberReads: {
          none: {
            memberId: member.id,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.mapToListObject(notifs, false);
  }

  async getSudahBaca(memberKode: string) {
    const member = await this.prisma.member.findFirst({ where: { kode: memberKode } });
    if (!member) throw new NotFoundException('Member not found');

    const notifs = await this.prisma.notif.findMany({
      where: {
        notifMemberReads: {
          some: {
            memberId: member.id,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.mapToListObject(notifs, true);
  }

  async getDetail(id: number, memberKode: string) {
    const member = await this.prisma.member.findFirst({ where: { kode: memberKode } });
    if (!member) throw new NotFoundException('Member not found');

    const notif = await this.prisma.notif.findUnique({
      where: { id },
      include: {
        notifMemberReads: {
          where: { memberId: member.id },
        },
      },
    });

    if (!notif) {
      throw new NotFoundException('Info not found');
    }

    const isRead = notif.notifMemberReads.length > 0;

    return {
      error: false,
      error_msg: '',
      data: {
        id: notif.id,
        title: notif.title,
        desc: notif.description,
        status_baca: isRead,
        createdAt: notif.createdAt,
      },
    };
  }

  async updateStatusBaca(notifId: number, memberKode: string) {
    const member = await this.prisma.member.findFirst({ where: { kode: memberKode } });
    if (!member) throw new NotFoundException('Member not found');

    const existing = await this.prisma.notifMemberRead.findFirst({
      where: { notifId, memberId: member.id },
    });

    if (!existing) {
      await this.prisma.notifMemberRead.create({
        data: {
          notifId,
          memberId: member.id,
        },
      });
    }

    return {
      error: false,
      error_msg: 'Berhasil update status baca',
      data: {},
    };
  }
}
