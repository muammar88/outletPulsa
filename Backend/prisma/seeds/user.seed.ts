import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export default async function userSeed(prisma: PrismaClient) {
  const adminExists = await prisma.user.findFirst({
    where: { 
      kode: 'admin' 
    }
  });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'admin',
        kode: 'admin',
        password: await bcrypt.hash('admin123', 10),
        type: 'administrator',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  } else {
    await prisma.user.update({
      where: { id: adminExists.id },
      data: {
        name: 'admin',
        password: await bcrypt.hash('admin123', 10),
        type: 'administrator',
        updatedAt: new Date(),
      }
    });
  }
}
