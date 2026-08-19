const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  const code = "TEST12345";
  const subjectId = "cm006h6j70002usj26c6rsw0m"; // I need a valid subjectId
  // Let's just find ANY subject
  const subject = await prisma.subject.findFirst();
  if (!subject) return console.log("No subject");
  
  // Create an unused code
  const created = await prisma.accessCode.create({
    data: {
      code,
      accessType: "YEARLY",
      subjectId: subject.id,
      validMonths: [1,2],
      isUsed: false
    }
  });

  console.log("Created code:", created.code);

  const sessionId = "cm0061e860000usj2l35l1b8n"; // Let's find ANY student
  const student = await prisma.user.findFirst({ where: { role: "STUDENT" } });
  if (!student) return console.log("No student");

  try {
    await prisma.$transaction(async (tx) => {
      await tx.accessCode.update({
        where: { id: created.id },
        data: { isUsed: true, studentId: student.id },
      });

      const existingEnrollment = await tx.enrollment.findUnique({
        where: { studentId_subjectId: { studentId: student.id, subjectId: created.subjectId } }
      });

      if (existingEnrollment) {
        const existingMonths = existingEnrollment.enrolledMonths || [];
        const codeMonths = created.validMonths || [];
        const newMonths = new Set([...existingMonths, ...codeMonths]);
        if (created.accessType === "YEARLY") [1,2,3,4,5,6,7,8,9,10,11,12].forEach(m => newMonths.add(m));
        await tx.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { enrolledMonths: Array.from(newMonths) },
        });
      } else {
        const initialMonths = created.accessType === "YEARLY" ? [1,2,3,4,5,6,7,8,9,10,11,12] : (created.validMonths || []);
        await tx.enrollment.create({
          data: { studentId: student.id, subjectId: created.subjectId, enrolledMonths: initialMonths }
        });
      }
    });
    console.log("Transaction SUCCESS!");
  } catch (err) {
    console.error("TRANSACTION FAILED:", err);
  }
}
test();
