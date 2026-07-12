import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany();
  const studentNames = students.map(s => `${s.firstName} ${s.secondName || ''}`.trim());
  
  const mapping = {
    'Ayyan': 'Ayyan Jawad',
    'Ali': 'Ali Shehzad',
    'Saim': 'Saim Sheraz',
    'Hassan': 'Hassan Jawad',
  };

  const tasks = await prisma.taskEntry.findMany();
  let updatedTasks = 0;
  for (const task of tasks) {
    if (task.assignee && mapping[task.assignee]) {
      const newAssignee = mapping[task.assignee];
      await prisma.taskEntry.update({
        where: { id: task.id },
        data: { assignee: newAssignee }
      });
      console.log(`Updated Task ${task.id}: ${task.assignee} -> ${newAssignee}`);
      updatedTasks++;
    }
  }

  console.log(`Finished! Updated ${updatedTasks} tasks.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
