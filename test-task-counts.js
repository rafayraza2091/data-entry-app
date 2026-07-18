const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const totalTasks = await prisma.taskEntry.count();
  
  const lastWeek = new Date();
  lastWeek.setHours(0, 0, 0, 0);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const recentTasks = await prisma.taskEntry.count({
    where: { createdAt: { gte: lastWeek } }
  });
  
  console.log('Total tasks:', totalTasks);
  console.log('Tasks created in last 7 days:', recentTasks);
}

main().catch(console.error).finally(() => prisma.$disconnect());
