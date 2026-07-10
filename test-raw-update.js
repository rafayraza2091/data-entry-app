const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const subjects = ['English', 'History'];
    const res = await prisma.$executeRaw`
      UPDATE "Student" 
      SET subjects = ${subjects} 
      WHERE id = 8
    `;
    console.log("Updated rows:", res);
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
