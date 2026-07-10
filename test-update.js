const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const student = await prisma.student.findFirst();
    if (!student) return console.log("No student found");
    
    console.log("Updating student:", student.id);
    const res = await prisma.student.update({
      where: { id: student.id },
      data: {
        firstName: "Abdul",
        secondName: "Hadi",
        address: "Government colony",
        mobileNumber: "1234",
        email: "abdulhadi@gmail.com",
        fatherName: "asdf",
        parentContact1: "",
        parentContact2: "",
        className: "7",
        schoolName: "BeaconHouse - Boys'",
        status: "Left",
        subjects: ["English", "History", "Geography", "Mathematics"],
        otherInfo: ""
      }
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Prisma Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}
main();
