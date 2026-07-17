const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.dataentryUser.findUnique({
    where: { username: 'umer' }
  });
  
  if (user) {
    console.log('Found user:', user);
    const updatedStudent = await prisma.student.update({
      where: { id: 3 }, 
      data: { userId: user.id }
    });
    console.log('Updated student:', updatedStudent);
  } else {
    console.log('User not found!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
