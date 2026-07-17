const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany({
    where: { userId: { not: null } },
    select: { userId: true, firstName: true, secondName: true }
  });
  console.log('Admins:', admins);
}
main().catch(console.error).finally(() => prisma.$disconnect());
