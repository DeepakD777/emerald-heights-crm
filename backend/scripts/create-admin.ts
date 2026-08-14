import "dotenv/config";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { prisma } from "../src/lib/prisma";

const rl = readline.createInterface({
  input,
  output,
});

async function main() {
  try {
    console.log("\n=== Emerald Heights - Create Admin ===\n");

    const name = (await rl.question("Admin name: ")).trim();
    const email = (await rl.question("Admin email: ")).trim().toLowerCase();
    const password = await rl.question("Admin password: ");

    if (!name || !email || !password) {
      throw new Error("Name, email and password are required.");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: {
        email,
      },
    });

    if (existingAdmin) {
      throw new Error("An admin with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        passwordHash,
        isActive: true,
      },
    });

    console.log("\n✅ Admin account created successfully!");
    console.log(`Name : ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role : ADMIN`);
  } catch (error) {
    console.error("\n❌ Failed to create admin:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();