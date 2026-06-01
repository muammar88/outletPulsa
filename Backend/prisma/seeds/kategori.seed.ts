import { PrismaClient, ProdukType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const parseDate = (val: string) => {
  if (!val || val.includes('0000-00-00')) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

export default async function seedKategori(prisma: PrismaClient) {
  console.log('Mengekstrak data Kategori dari kategoris.sql...');
  
  const sqlPath = path.resolve(process.cwd(), '../kategoris.sql');
  if (!fs.existsSync(sqlPath)) {
    console.log(`File SQL tidak ditemukan di ${sqlPath}`);
    return;
  }
  
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  const insertRegex = /INSERT INTO `kategoris` \([^)]+\) VALUES\s*([\s\S]*?);/g;
  
  let match;
  const datalist: any[] = [];
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
      
      if (values.length >= 6) {
        datalist.push({
          id: values[0],
          kode: values[1],
          name: values[2],
          type: values[3] as ProdukType,
          createdAt: parseDate(values[4]),
          updatedAt: parseDate(values[5]),
        });
      }
    }
  }

  if (datalist.length === 0) return;
  console.log(`Menemukan ${datalist.length} data kategori. Memulai insert ke database...`);
  
  const chunkSize = 500;
  let inserted = 0;
  for (let i = 0; i < datalist.length; i += chunkSize) {
    const chunk = datalist.slice(i, i + chunkSize);
    try {
      await prisma.kategori.createMany({ data: chunk, skipDuplicates: true });
      inserted += chunk.length;
    } catch (error) {
      console.error(`Gagal insert chunk ${i} - ${i + chunk.length}:`, (error as Error).message);
    }
  }
}
