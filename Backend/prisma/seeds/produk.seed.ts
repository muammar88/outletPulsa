import { PrismaClient, ProdukStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export default async function seedProduk(prisma: PrismaClient) {
  console.log('Menjalankan seeding Produk...');
  
  const jsonPath = path.join(__dirname, 'produks.json');
  if (!fs.existsSync(jsonPath)) {
    console.log(`File JSON tidak ditemukan di ${jsonPath}`);
    return;
  }

  // Ambil ID valid dari database untuk verifikasi Foreign Key
  const validOperators = await prisma.operator.findMany({ select: { id: true } });
  const validServers = await prisma.server.findMany({ select: { id: true } });
  const operatorIds = new Set(validOperators.map(o => o.id));
  const serverIds = new Set(validServers.map(s => s.id));
  
  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const produksData = rawData.map((item: any) => ({
    id: item.id,
    operatorId: operatorIds.has(item.operatorId) ? item.operatorId : null,
    kode: item.kode,
    name: item.name,
    purchase_price: item.purchase_price,
    markup: item.markup,
    serverId: serverIds.has(item.serverId) ? item.serverId : null,
    status: 'inactive', // Default non-active sesuai kebutuhan
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

  if (produksData.length === 0) return;
  console.log(`Menemukan ${produksData.length} data produk. Memulai insert ke database...`);
  
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < produksData.length; i += chunkSize) {
    const chunk = produksData.slice(i, i + chunkSize);
    try {
      await prisma.produk.createMany({ data: chunk, skipDuplicates: true });
      inserted += chunk.length;
    } catch (error) {
      console.error(`Gagal insert chunk ${i} - ${i + chunk.length}:`, (error as Error).message);
    }
  }
  console.log(`Seeding Produk selesai. Berhasil memproses ${inserted} produk.`);
}
