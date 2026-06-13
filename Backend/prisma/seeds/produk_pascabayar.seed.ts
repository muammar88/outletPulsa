import { PrismaClient, ProdukStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const parseDate = (val: string) => {
  if (!val || val.includes('0000-00-00')) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

export default async function seedProdukPascabayar(prisma: PrismaClient) {
  console.log('Mengekstrak data Produk Pascabayar dari produk_pascabayars.sql...');
  
  const sqlPath = path.join(__dirname, 'sql', 'produk_pascabayars.sql');
  if (!fs.existsSync(sqlPath)) {
    console.log(`File SQL tidak ditemukan di ${sqlPath}`);
    return;
  }

  // Ambil ID valid dari database untuk verifikasi Foreign Key
  const validKategoris = await prisma.kategori.findMany({ select: { id: true } });
  const validServers = await prisma.server.findMany({ select: { id: true } });
  const kategoriIds = new Set(validKategoris.map(k => k.id));
  const serverIds = new Set(validServers.map(s => s.id));
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  // Regex untuk membaca value INSERT INTO `produk_pascabayars`
  const insertRegex = /INSERT INTO `produk_pascabayars` \([^)]+\) VALUES\s*([\s\S]*?);/g;
  
  let match;
  const produksData: any[] = [];
  const valRegex = /'(?:[^']|'')*'|NULL|-?\d+(?:\.\d+)?/g;

  while ((match = insertRegex.exec(sql)) !== null) {
    const block = match[1];
    const rowStrings = block.split(/\),\s*\(/);
    
    for (let rowStr of rowStrings) {
      rowStr = rowStr.replace(/^\s*\(/, '').replace(/\)\s*$/, '');
      
      const values: any[] = [];
      let valMatch;
      while ((valMatch = valRegex.exec(rowStr)) !== null) {
        let val = valMatch[0];
        if (val === 'NULL') {
          values.push(null);
        } else if (val.startsWith("'")) {
          values.push(val.slice(1, -1).replace(/''/g, "'"));
        } else {
          values.push(Number(val));
        }
      }
      
      // INSERT INTO produk_pascabayars (id, kategoriId, kode, name, fee, comission, outletFee, serverId, status, createdAt, updatedAt)
      if (values.length >= 11) {
        const kategoriId = values[1];
        const serverId = values[7];

        produksData.push({
          id: values[0],
          kategoriId: kategoriIds.has(kategoriId) ? kategoriId : null,
          kode: values[2],
          name: values[3],
          fee: values[4],
          comission: values[5],
          outletFee: values[6],
          serverId: serverIds.has(serverId) ? serverId : null,
          status: values[8] as ProdukStatus,
          createdAt: parseDate(values[9]),
          updatedAt: parseDate(values[10]),
        });
      }
    }
  }

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
}
