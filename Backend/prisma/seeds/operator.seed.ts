import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export default async function seedOperator(prisma: PrismaClient) {
  console.log('Menjalankan seeding Operator...');
  
  const jsonPath = path.join(__dirname, 'operators.json');
  if (!fs.existsSync(jsonPath)) {
    console.log(`File JSON tidak ditemukan di ${jsonPath}`);
    return;
  }
  
  const validKategoris = await prisma.kategori.findMany({ select: { id: true } });
  const kategoriIds = new Set(validKategoris.map(k => k.id));

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const datalist = rawData.map((item: any) => ({
    ...item,
    kategoriId: kategoriIds.has(item.kategoriId) ? item.kategoriId : null
  }));

  if (datalist.length === 0) return;
  console.log(`Menemukan ${datalist.length} data operator. Memulai insert ke database...`);
  
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < datalist.length; i += chunkSize) {
    const chunk = datalist.slice(i, i + chunkSize);
    try {
      await prisma.operator.createMany({ data: chunk, skipDuplicates: true });
      inserted += chunk.length;
    } catch (error) {
      console.error(`Gagal insert chunk ${i} - ${i + chunk.length}:`, (error as Error).message);
    }
  }
  console.log(`Seeding Operator selesai. Berhasil memproses ${inserted} operator.`);
}
