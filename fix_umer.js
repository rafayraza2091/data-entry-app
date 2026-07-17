const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('1234', 10);
  
  // 1. Create the user
  const user = await prisma.dataentryUser.create({
    data: {
      username: 'umer',
      password: hashedPassword,
      firstName: 'Umer',
      lastName: 'Waseem',
      role: 'STUDENT',
    }
  });
  
  console.log('Created user:', user);

  // 2. Link it to the student
  const updatedStudent = await prisma.student.update({
    where: { id: 3 }, // Based on the previous query where Umer's ID was 3
    data: {
      userId: user.id
    }
  });

  console.log('Updated student:', updatedStudent);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
