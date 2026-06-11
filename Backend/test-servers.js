const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.server.findMany().then(console.log).finally(() => prisma.$disconnect());
