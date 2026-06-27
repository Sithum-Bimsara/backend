import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const inventories = await prisma.roomInventory.findMany({
    include: { slots: true }
  });
  console.log(JSON.stringify(inventories, null, 2));
}

main();
