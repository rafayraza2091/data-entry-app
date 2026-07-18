const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const result = await prisma.taskEntry.updateMany({
    where: { totalMarks: null },
    data: { totalMarks: 10 }
  });
  console.log("Updated tasks:", result.count);
}
run();
