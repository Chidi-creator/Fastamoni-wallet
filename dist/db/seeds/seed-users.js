"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const logger_service_1 = __importDefault(require("../../services/logger.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function seedUsers() {
    try {
        logger_service_1.default.info("Seeding test user...");
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: "test@example.com" },
        });
        if (existingUser) {
            logger_service_1.default.info("Test user already exists");
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash("password123", 10);
        const hashedPin = await bcrypt_1.default.hash("1234", 10);
        const user = await prisma_1.default.user.create({
            data: {
                firstname: "Test",
                lastname: "User",
                email: "test@example.com",
                password: hashedPassword,
                pinHash: hashedPin,
            },
        });
        // Create wallet
        await prisma_1.default.wallet.create({
            data: {
                userId: user.id,
                wallet_number: "1234567890",
                bank_name: "Test Bank",
                bank_code: "001",
            },
        });
        logger_service_1.default.info("Test user seeded successfully");
    }
    catch (error) {
        logger_service_1.default.error("Error seeding test user", error);
    }
}
exports.default = seedUsers;
//# sourceMappingURL=seed-users.js.map