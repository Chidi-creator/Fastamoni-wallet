"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
require("dotenv/config");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const env_1 = require("../config/env");
const connectionString = env_1.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set in the environment.");
}
const pool = new pg_1.Pool({
    connectionString,
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    }
}
async function disconnectDatabase() {
    try {
        await prisma.$disconnect();
        await pool.end();
        console.log("Database disconnected");
    }
    catch (error) {
        console.error("Failed to disconnect database:", error);
    }
}
exports.default = prisma;
//# sourceMappingURL=prisma.js.map