import prisma from "../prisma";
import logger from "@services/logger.service";
import bcrypt from "bcrypt";

async function seedUsers() {
  try {
    logger.info("Seeding test user...");

    const existingUser = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    });

    if (existingUser) {
      logger.info("Test user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("password123", 10);
    const hashedPin = await bcrypt.hash("1234", 10);

    const user = await prisma.user.create({
      data: {
        firstname: "Test",
        lastname: "User",
        email: "test@example.com",
        password: hashedPassword,
        pinHash: hashedPin,
      },
    });

    // Create wallet
    await prisma.wallet.create({
      data: {
        userId: user.id,
        wallet_number: "1234567890",
        bank_name: "Test Bank",
        bank_code: "001",
      },
    });

    logger.info("Test user seeded successfully");
  } catch (error) {
    logger.error("Error seeding test user", error);
  }
}

export default seedUsers;