import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.taskEntry.findMany();
  console.log('Total tasks:', tasks.length);
  
  let updatedTasks = 0;
  for (const task of tasks) {
    if (task.assignee && task.assignee.includes(' .')) {
      const newAssignee = task.assignee.replace(' .', '');
      await prisma.taskEntry.update({
        where: { id: task.id },
        data: { assignee: newAssignee }
      });
      console.log(`Updated Task ${task.id}: ${task.assignee} -> ${newAssignee}`);
      updatedTasks++;
    }
  }
  
  const queries = await prisma.queryEntry.findMany();
  let updatedQueries = 0;
  for (const query of queries) {
    if (query.studentName && query.studentName.includes(' .')) {
      const newStudentName = query.studentName.replace(' .', '');
      await prisma.queryEntry.update({
        where: { id: query.id },
        data: { studentName: newStudentName }
      });
      console.log(`Updated Query ${query.id}: ${query.studentName} -> ${newStudentName}`);
      updatedQueries++;
    }
  }

  console.log(`Finished! Updated ${updatedTasks} tasks and ${updatedQueries} queries.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
