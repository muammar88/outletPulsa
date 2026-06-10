const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getConnectedSellers(id) {
  const data = await prisma.digiflazzSellerProduct.findMany({
    where: { productDigiflazzId: id },
    include: {
      digiflazzSeller: true,
    },
    orderBy: { price: 'asc' },
  });
  console.log(data.length);
}

getConnectedSellers(1).catch(console.error).finally(() => prisma.$disconnect());
