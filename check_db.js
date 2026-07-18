const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const tasks = await prisma.taskEntry.findMany({
    orderBy: { id: 'desc' },
    take: 5
  });
  console.log(tasks.map(t => ({ id: t.id, status: t.status, obtainedMarks: t.obtainedMarks, totalMarks: t.totalMarks })));
}
run();
