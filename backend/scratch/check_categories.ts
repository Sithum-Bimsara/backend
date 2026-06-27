import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deals = await prisma.deal.findMany({
    select: { category: true }
  });
  const categories = [...new Set(deals.map(d => d.category))];
  console.log('Unique Categories:', categories);
}

main().catch(console.error).finally(() => prisma.$disconnect());
