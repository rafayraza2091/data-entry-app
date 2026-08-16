const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const existingOwner = await prisma.dataentryUser.findFirst({
    where: {
      OR: [
        { username: 'owner' },
        { role: 'OWNER' }
      ]
    }
  });

  if (existingOwner) {
    console.log(`Owner account already exists (${existingOwner.username}). Skipping creation.`);
    return;
  }

  const hashedPassword = await bcrypt.hash('password', 10);
  const owner = await prisma.dataentryUser.create({
    data: {
      username: 'owner',
      password: hashedPassword,
      firstName: 'Owner',
      lastName: '',
      role: 'OWNER',
    }
  });

  // Ensure owner is also present in admin table
  await prisma.admin.create({
    data: {
      userId: owner.id,
      firstName: 'Owner',
      secondName: '',
      address: 'N/A',
      mobileNumber: 'N/A',
      email: '',
    }
  }).catch(() => {});

  console.log('✓ Auto-created default owner user: username="owner", password="password"');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
