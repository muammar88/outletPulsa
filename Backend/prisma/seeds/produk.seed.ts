import { PrismaClient, ProdukType, ProdukStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const parseDate = (val: string) => {
  if (!val || val.includes('0000-00-00')) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

export default async function seedProduk(prisma: PrismaClient) {
  console.log('Mengekstrak data Produk dari produks.sql...');
  
  const sqlPath = path.join(__dirname, 'sql', 'produks.sql');
  if (!fs.existsSync(sqlPath)) {
    console.log(`File SQL tidak ditemukan di ${sqlPath}`);
    return;
  }

  // Ambil ID valid dari database untuk verifikasi Foreign Key
  const validOperators = await prisma.operator.findMany({ select: { id: true } });
  const validServers = await prisma.server.findMany({ select: { id: true } });
  const operatorIds = new Set(validOperators.map(o => o.id));
  const serverIds = new Set(validServers.map(s => s.id));
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const insertRegex = /INSERT INTO `produks` \([^)]+\) VALUES\s*([\s\S]*?);/g;
  
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
      
      if (values.length >= 11) {
        const operatorId = values[1];
        const serverId = values[7];

        produksData.push({
          id: values[0],
          operatorId: operatorIds.has(operatorId) ? operatorId : null,
          kode: values[2],
          name: values[3],
          purchase_price: parseInt(values[5]),
          markup: parseInt(values[6]),
          serverId: serverIds.has(serverId) ? serverId : null,
          status: values[8] as ProdukStatus,
          createdAt: parseDate(values[9]),
          updatedAt: parseDate(values[10]),
        });
      }
    }
  }

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
}
