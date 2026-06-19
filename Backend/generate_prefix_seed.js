const fs = require('fs');

const sqlContent = fs.readFileSync('D:\\DEEP EASY\\prefixes.sql', 'utf-8');
const regex = /\((\d+),\s*(\d+),\s*'([^']+)'/g;
let match;
const prefixes = [];

while ((match = regex.exec(sqlContent)) !== null) {
  prefixes.push({
    id: parseInt(match[1]),
    operatorId: parseInt(match[2]),
    prefix: match[3],
  });
}

let seedContent = `import { PrismaClient } from '@prisma/client';

export default async function prefixSeed(prisma: PrismaClient) {
  const prefixes = [\n`;

for (const p of prefixes) {
  seedContent += `    { id: ${p.id}, operatorId: ${p.operatorId}, prefix: '${p.prefix}' },\n`;
}

seedContent += `  ];

  console.log('Inserting prefixes...');
  await prisma.prefix.createMany({
    data: prefixes,
    skipDuplicates: true,
  });

  try {
    await prisma.$executeRawUnsafe(\`SELECT setval('"Prefix_id_seq"', (SELECT MAX(id) FROM "Prefix"));\`);
    console.log('Prefix Sequence updated');
  } catch (e: any) {
    console.log('Could not update sequence (might not be postgres or sequence name differs)', e.message);
  }
}
`;

fs.writeFileSync('d:\\PROJECT\\NODEJS\\outletPulsa\\Backend\\prisma\\seeds\\prefix.seed.ts', seedContent);
console.log('prefix.seed.ts generated successfully.');
