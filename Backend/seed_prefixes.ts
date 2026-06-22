import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const sqlContent = fs.readFileSync('D:\\DEEP EASY\\prefixes.sql', 'utf-8');
  
  const regex = /\((\d+),\s*(\d+),\s*'([^']+)'/g;
  let match;
  
  const prefixes: any[] = [];
  while ((match = regex.exec(sqlContent)) !== null) {
    const id = parseInt(match[1]);
    const operatorId = parseInt(match[2]);
    const prefix = match[3];
    
    prefixes.push({
      id,
      operatorId,
      prefix,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log(`Found ${prefixes.length} prefixes to insert.`);

  if (prefixes.length > 0) {
    try {
      await prisma.prefix.createMany({
        data: prefixes,
        skipDuplicates: true,
      });
      console.log('Successfully seeded prefixes!');
      
      try {
        await prisma.$executeRawUnsafe(`SELECT setval('"Prefix_id_seq"', (SELECT MAX(id) FROM "Prefix"));`);
        console.log('Sequence updated');
      } catch (e) {
        console.log('Could not update sequence (might not be postgres or sequence name differs)', e.message);
      }
    } catch (err) {
      console.error('Error inserting prefixes:', err);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
