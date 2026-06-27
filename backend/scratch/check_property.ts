import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const propertyId = '07211f07-5e73-4d52-bc91-6e1d367ed509';
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      merchant: true,
    },
  });

  if (!property) {
    console.log('Property not found in DB');
  } else {
    console.log('Property found:');
    console.log('ID:', property.id);
    console.log('Name:', property.name);
    console.log('IsActive:', property.isActive);
    console.log('Merchant ID:', property.merchant.id);
    console.log('Merchant Verification Status:', property.merchant.verificationStatus);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
