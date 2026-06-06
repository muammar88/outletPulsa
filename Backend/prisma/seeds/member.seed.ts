import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export default async function memberSeed(prisma: PrismaClient) {
  const passwordHash = await bcrypt.hash('member123', 10);
  const adminPasswordHash = await bcrypt.hash('admin', 10);

  const members = [
    {
      kode: 'MBR006',
      fullname: 'Admin User',
      whatsappnumber: '085262802141',
      kode_agen: null,
      password: adminPasswordHash,
      saldo: 1000000,
      status: 'verfied',
    },
    {
      kode: 'MBR001',
      fullname: 'Budi Santoso',
      whatsappnumber: '081234567890',
      kode_agen: null,
      password: passwordHash,
      saldo: 150000,
      status: 'verfied',
    },
    {
      kode: 'MBR002',
      fullname: 'Siti Aminah',
      whatsappnumber: '089876543210',
      kode_agen: 'MBR001',
      password: passwordHash,
      saldo: 500000,
      status: 'verfied',
    },
    {
      kode: 'MBR003',
      fullname: 'Rudi Hermawan',
      whatsappnumber: '085678901234',
      kode_agen: 'MBR001',
      password: passwordHash,
      saldo: 25000,
      status: 'unverified',
    },
    {
      kode: 'MBR004',
      fullname: 'Dewi Lestari',
      whatsappnumber: '081112223334',
      kode_agen: 'MBR002',
      password: passwordHash,
      saldo: 1000000,
      status: 'verfied',
    },
    {
      kode: 'MBR005',
      fullname: 'Andi Wijaya',
      whatsappnumber: '087778889990',
      kode_agen: null,
      password: passwordHash,
      saldo: 0,
      status: 'unverified',
    },
  ];

  for (const member of members) {
    const existingMember = await prisma.member.findFirst({
      where: { kode: member.kode },
    });

    if (!existingMember) {
      await prisma.member.create({
        data: member as any,
      });
    } else {
      await prisma.member.update({
        where: { id: existingMember.id },
        data: member as any,
      });
    }
  }
}
