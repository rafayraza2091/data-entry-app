const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const allUsers = await prisma.dataentryUser.findMany({
      select: {
        firstName: true,
        lastName: true,
        role: true,
      },
      orderBy: { firstName: 'asc' }
    });

    const rawStudents = allUsers.filter(u => u.role === 'STUDENT');

    const studentsDb = await prisma.student.findMany({
      select: { firstName: true, secondName: true, className: true }
    });

    const students = rawStudents.map(u => {
      const studentData = studentsDb.find(s => s.firstName === u.firstName && s.secondName === u.lastName);
      return {
        ...u,
        className: studentData?.className || ''
      };
    });
    console.log(JSON.stringify(students, null, 2));
}
main();
