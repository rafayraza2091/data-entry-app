const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const startDate = "2026-07-16T12:16";
  const endDate = "2026-07-18T12:16";
  
  const tasks = await prisma.taskEntry.count({
    where: {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
  });
  
  console.log('Tasks found:', tasks);
}

main().catch(console.error).finally(() => prisma.$disconnect());
