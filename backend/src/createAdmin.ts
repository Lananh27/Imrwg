import bcrypt from "bcrypt";
import { prisma } from "./lib/prisma";

async function main() {
  const email = "admin@gmail.com";
  const plainPassword = "123456";

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    const updatedAdmin = await prisma.user.update({
      where: {
        email,
      },
      data: {
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Admin account updated:");
    console.log({
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
    });
  } else {
    const createdAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("Admin account created:");
    console.log({
      id: createdAdmin.id,
      email: createdAdmin.email,
      role: createdAdmin.role,
    });
  }

  console.log("Login with:");
  console.log("Email:", email);
  console.log("Password:", plainPassword);
}

main()
  .catch((error) => {
    console.error("CREATE ADMIN ERROR:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });