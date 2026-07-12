import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.taskEntry.findMany();
  for (const task of tasks) {
    if (task.reporter && task.reporter.includes(' .')) {
      console.log(`Found reporter in Task ${task.id}: ${task.reporter}`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
