const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const student = await prisma.student.create({
      data: {
        firstName: "Test",
        secondName: "Test",
        address: "Test",
        mobileNumber: "Test",
        email: "test@test.com",
        otherInfo: "Test",
        className: "1",
        schoolName: "Test - Test"
      }
    });
    console.log("Created student:", student);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
