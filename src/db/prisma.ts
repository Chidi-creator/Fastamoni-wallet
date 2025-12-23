import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";

const connectionString = env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment.");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    await pool.end();
    console.log("Database disconnected");
  } catch (error) {
    console.error("Failed to disconnect database:", error);
  }
}

export default prisma;
