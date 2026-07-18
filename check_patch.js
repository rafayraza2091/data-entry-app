const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const fetch = (await import('node-fetch')).default;
  console.log("Checking DB directly to see if any tasks have obtainedMarks...");
  const tasks = await prisma.taskEntry.findMany({
    where: { obtainedMarks: { not: null } }
  });
  console.log("Tasks with marks:", tasks.length);
  if (tasks.length > 0) {
    console.log("Example:", tasks[0].id, tasks[0].obtainedMarks, tasks[0].totalMarks);
  }
}
run();
