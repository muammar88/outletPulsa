import { PrismaClient, ServerStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export default async function seedServer(prisma: PrismaClient) {
  console.log('Menjalankan seeding Server...');
  
  const jsonPath = path.join(__dirname, 'servers.json');
  if (!fs.existsSync(jsonPath)) {
    console.log(`File JSON tidak ditemukan di ${jsonPath}`);
    return;
  }
  
  const datalist = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  if (datalist.length === 0) return;
  console.log(`Menemukan ${datalist.length} data server. Memulai insert ke database...`);
  
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < datalist.length; i += chunkSize) {
    const chunk = datalist.slice(i, i + chunkSize);
    try {
      await prisma.server.createMany({ data: chunk, skipDuplicates: true });
      inserted += chunk.length;
    } catch (error) {
      console.error(`Gagal insert chunk ${i} - ${i + chunk.length}:`, (error as Error).message);
    }
  }
  console.log(`Seeding Server selesai. Berhasil memproses ${inserted} server.`);
}
