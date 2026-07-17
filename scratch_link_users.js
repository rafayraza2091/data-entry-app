const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({ where: { userId: null } });
  const teachers = await prisma.teacher.findMany({ where: { userId: null } });
  const admins = await prisma.admin.findMany({ where: { userId: null } });

  console.log(`Unlinked Students: ${students.length}`);
  console.log(`Unlinked Teachers: ${teachers.length}`);
  console.log(`Unlinked Admins: ${admins.length}`);

  let linked = 0;
  for (const s of students) {
    const du = await prisma.dataentryUser.findFirst({
      where: { firstName: s.firstName, lastName: s.secondName, role: 'STUDENT' }
    });
    if (du) {
      await prisma.student.update({ where: { id: s.id }, data: { userId: du.id } });
      linked++;
    }
  }

  for (const t of teachers) {
    const du = await prisma.dataentryUser.findFirst({
      where: { firstName: t.firstName, lastName: t.secondName, role: 'TEACHER' }
    });
    if (du) {
      await prisma.teacher.update({ where: { id: t.id }, data: { userId: du.id } });
      linked++;
    }
  }

  for (const a of admins) {
    const du = await prisma.dataentryUser.findFirst({
      where: { firstName: a.firstName, lastName: a.secondName, role: 'COORDINATOR' }
    });
    if (du) {
      await prisma.admin.update({ where: { id: a.id }, data: { userId: du.id } });
      linked++;
    }
  }

  console.log(`Successfully linked ${linked} users.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
