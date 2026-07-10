const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const students = await prisma.student.findMany();
    console.log("Total students:", students.length);
    if (students.length > 0) {
      console.log("First student status:", students[0].status);
      console.log("Statuses of all students:", students.map(s => s.status).join(", "));
    }
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
