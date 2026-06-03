import { PrismaClient } from '@prisma/client';

export default async function rbacSeed(prisma: PrismaClient) {
  // 1. Create Permissions based on menus
  const permissions = [
    'Dashboard',
    'Daftar Member',
    'Deposit',
    'Transaksi Pulsa',
    'Semua Produk',
    'Semua Server',
    'Daftar Agen',
    'Kategori',
    'Operator',
    'Log',
    'Daftar Grup',
    'Daftar Pengguna',
    'Pengaturan Umum'
  ];

  for (const name of permissions) {
    await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2. Create Administrator Group
  const adminGroup = await prisma.group.upsert({
    where: { name: 'Administrator' },
    update: {},
    create: {
      name: 'Administrator',
      description: 'Grup dengan hak akses penuh (Super Admin)',
    },
  });

  // 3. Assign all permissions to Administrator Group
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.groupPermission.upsert({
      where: {
        groupId_permissionId: {
          groupId: adminGroup.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        groupId: adminGroup.id,
        permissionId: perm.id,
      },
    });
  }

  // 4. Assign Admin User to Administrator Group
  await prisma.user.updateMany({
    where: { type: 'administrator' },
    data: { groupId: adminGroup.id },
  });
}
