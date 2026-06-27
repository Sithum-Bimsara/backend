import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deals = await prisma.deal.findMany({
    select: { title: true, category: true }
  });
  console.log('Current Deals:', JSON.stringify(deals, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
