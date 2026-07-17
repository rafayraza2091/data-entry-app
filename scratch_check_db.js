const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany();
  const teachers = await prisma.teacher.findMany();
  const admins = await prisma.admin.findMany();
  const dataentryUsers = await prisma.dataentryUser.findMany();

  console.log(`Students total: ${students.length}`);
  console.log(`Teachers total: ${teachers.length}`);
  console.log(`Admins total: ${admins.length}`);
  console.log(`DataentryUsers total: ${dataentryUsers.length}`);
  
  const linkedStudents = students.filter(s => s.userId !== null).length;
  const linkedTeachers = teachers.filter(t => t.userId !== null).length;
  const linkedAdmins = admins.filter(a => a.userId !== null).length;
  console.log(`Linked Students: ${linkedStudents}`);
  console.log(`Linked Teachers: ${linkedTeachers}`);
  console.log(`Linked Admins: ${linkedAdmins}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
