import { PrismaClient, ProdukStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

export default async function seedProdukPascabayar(prisma: PrismaClient) {
  console.log('Menjalankan seeding Produk Pascabayar...');
  
  const jsonPath = path.join(__dirname, 'produk_pascabayars.json');
  if (!fs.existsSync(jsonPath)) {
    console.log(`File JSON tidak ditemukan di ${jsonPath}`);
    return;
  }

  const validKategoris = await prisma.kategori.findMany({ select: { id: true } });
  const validOperators = await prisma.operator.findMany({ select: { id: true } });
  const validServers = await prisma.server.findMany({ select: { id: true } });

  const kategoriIds = new Set(validKategoris.map(k => k.id));
  const operatorIds = new Set(validOperators.map(o => o.id));
  const serverIds = new Set(validServers.map(s => s.id));

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const produksData = rawData.map((item: any) => ({
    id: item.id,
    kategoriId: kategoriIds.has(item.kategoriId) ? item.kategoriId : null,
    kode: item.kode != null ? String(item.kode) : null,
    name: item.name != null ? String(item.name) : null,
    fee: item.fee,
    comission: item.komisi,
    outletFee: 0,
    serverId: serverIds.has(item.serverId) ? item.serverId : null,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));

  if (produksData.length === 0) return;
  console.log(`Menemukan ${produksData.length} data produk pascabayar. Memulai insert ke database...`);
  
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < produksData.length; i += chunkSize) {
    const chunk = produksData.slice(i, i + chunkSize);
    try {
      await prisma.produkPascabayar.createMany({ data: chunk, skipDuplicates: true });
      inserted += chunk.length;
    } catch (error) {
      console.error(`Gagal insert chunk ${i} - ${i + chunk.length}:`, (error as Error).message);
    }
  }
  console.log(`Seeding Produk Pascabayar selesai. Berhasil memproses ${inserted} produk pascabayar.`);
}
