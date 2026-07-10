const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`DELETE FROM "Student" WHERE "firstName" = 'Test' AND "secondName" = 'Student'`;
  await prisma.$executeRaw`DELETE FROM "dataentryUser" WHERE "username" = 'teststudent'`;
  await prisma.$disconnect();
}
main();
