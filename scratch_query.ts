import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.dataentryUser.findMany({
    where: {
      OR: [
        { firstName: { contains: 'saim', mode: 'insensitive' } },
        { firstName: { contains: 'ayyan', mode: 'insensitive' } }
      ]
    }
  })
  console.log(JSON.stringify(users, null, 2))
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
