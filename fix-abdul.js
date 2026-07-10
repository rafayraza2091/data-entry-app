const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const student = await prisma.$queryRaw`SELECT id, "firstName", status FROM "Student" WHERE "firstName" = 'Abdul'`;
    console.log("Before:", student);

    const res = await prisma.$executeRaw`
      UPDATE "Student" 
      SET status = 'Active'
      WHERE id = ${student[0].id}
    `;
    console.log("Updated rows:", res);
    
    const after = await prisma.$queryRaw`SELECT id, "firstName", status FROM "Student" WHERE "firstName" = 'Abdul'`;
    console.log("After:", after);
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
