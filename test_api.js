const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const dateStr = "2026-07-09"; 
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(dateStr);
  endOfDay.setHours(23, 59, 59, 999);
  console.log("Searching between:", startOfDay, "and", endOfDay);

  const tasks = await prisma.taskEntry.findMany({
    where: {
      dueDate: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    select: { id: true, dueDate: true }
  });
  console.log("Tasks found for 2026-07-09:", tasks.length);
}
main().finally(() => prisma.$disconnect());
