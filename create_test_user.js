const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.dataentryUser.upsert({
    where: { username: 'testowner' },
    update: { password: hashedPassword, role: 'OWNER' },
    create: {
      username: 'testowner',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'Owner',
      role: 'OWNER',
    },
  });
  console.log('Test user created:', user.username);
}

main().catch(console.error).finally(() => prisma.$disconnect());
