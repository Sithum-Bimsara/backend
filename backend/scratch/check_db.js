const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.deal.groupBy({
    by: ['category'],
    _count: {
      id: true
    }
  });
  console.log('Categories in Deal table:', JSON.stringify(categories, null, 2));

  const sampleDeals = await prisma.deal.findMany({
    take: 5,
    select: { id: true, title: true, category: true }
  });
  console.log('Sample Deals:', JSON.stringify(sampleDeals, null, 2));

  const propertiesCount = await prisma.property.count();
  console.log('Total Properties:', propertiesCount);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
