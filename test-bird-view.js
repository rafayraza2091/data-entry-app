const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.$queryRaw`
    SELECT id, "firstName", "secondName", subjects 
    FROM "Student" 
    WHERE status = 'Active' 
    ORDER BY "firstName" ASC
  `;
  console.log(JSON.stringify(students.slice(0, 2), null, 2));
  await prisma.$disconnect();
}
main();
