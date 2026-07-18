const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const updated = await prisma.taskEntry.update({
      where: { id: 320 },
      data: { obtainedMarks: 8, totalMarks: 10 }
    });
    console.log("Updated:", updated.obtainedMarks, updated.totalMarks);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
