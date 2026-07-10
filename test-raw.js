const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const students = await prisma.$queryRaw`SELECT id, "firstName", "secondName", subjects FROM "Student" WHERE status = 'Active' ORDER BY "firstName" ASC`;
    console.log("Raw students:", students);
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
