const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = await prisma.taskEntry.count({
    where: { createdAt: { gte: today } }
  });
  
  console.log('Tasks created today:', todayTasks);
}

main().catch(console.error).finally(() => prisma.$disconnect());
