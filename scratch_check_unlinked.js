const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({ where: { userId: null } });
  console.log('Still unlinked:', students.map(s => s.firstName + ' ' + s.secondName));
}
main().catch(console.error).finally(() => prisma.$disconnect());
