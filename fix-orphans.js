const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.$queryRaw`SELECT * FROM "Student" WHERE "firstName" = 'Ummay'`;
  console.log("Students:", students);

  const users = await prisma.$queryRaw`SELECT * FROM "dataentryUser" WHERE "firstName" = 'Ummay'`;
  console.log("DataEntryUsers:", users);

  if (students.length === 0 && users.length > 0) {
    const res = await prisma.$executeRaw`DELETE FROM "dataentryUser" WHERE "firstName" = 'Ummay'`;
    console.log("Deleted orphaned users:", res);
  }
  
  await prisma.$disconnect();
}
main();
