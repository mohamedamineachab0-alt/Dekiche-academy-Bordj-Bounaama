import { prisma } from './lib/prisma';

async function main() {
  const existingUser = await prisma.user.findFirst({
    where: { phoneNumber: "0562388085" }
  });
  
  if (existingUser) {
    console.log("Updating existing user to ADMIN...");
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: "ADMIN", fullName: "amine" }
    });
    console.log("Updated!");
  } else {
    console.log("Creating new ADMIN user...");
    await prisma.user.create({
      data: {
        fullName: "amine",
        phoneNumber: "0562388085",
        passwordHash: "",
        role: "ADMIN"
      }
    });
    console.log("Created!");
  }
}

main().catch(console.error).finally(() => process.exit(0));
