"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma")); // Import the configured client
const bcrypt_1 = __importDefault(require("bcrypt"));
async function debugSeed() {
    try {
        console.log("Starting debug seed...");
        // verify connection
        await prisma_1.default.$connect();
        console.log("Connected to database successfully via app's Prisma client.");
        const email = "test@example.com";
        // Check existing
        const existing = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existing) {
            console.log(`User ${email} exists with ID: ${existing.id}`);
            // verify it has a wallet
            const wallet = await prisma_1.default.wallet.findUnique({ where: { userId: existing.id } });
            if (wallet) {
                console.log(`User has wallet: ${wallet.wallet_number}`);
                // Ensure password matches 'password123'
                const isMatch = await bcrypt_1.default.compare('password123', existing.password);
                console.log(`Password 'password123' match: ${isMatch}`);
                if (!isMatch) {
                    console.log("Updating password...");
                    const hashedPassword = await bcrypt_1.default.hash('password123', 10);
                    await prisma_1.default.user.update({
                        where: { id: existing.id },
                        data: { password: hashedPassword }
                    });
                    console.log("Password updated.");
                }
            }
            else {
                console.log("User exists but has NO wallet. Creating wallet...");
                await prisma_1.default.wallet.create({
                    data: {
                        userId: existing.id,
                        wallet_number: "1234567890",
                        bank_name: "Test Bank",
                        bank_code: "001",
                    },
                });
                console.log("Wallet created.");
            }
        }
        else {
            console.log(`User ${email} does NOT exist. Creating...`);
            const hashedPassword = await bcrypt_1.default.hash("password123", 10);
            const hashedPin = await bcrypt_1.default.hash("1234", 10);
            const newUser = await prisma_1.default.user.create({
                data: {
                    firstname: "Test",
                    lastname: "User",
                    email: "test@example.com",
                    password: hashedPassword,
                    pinHash: hashedPin,
                },
            });
            console.log(`User created: ${newUser.id}`);
            await prisma_1.default.wallet.create({
                data: {
                    userId: newUser.id,
                    wallet_number: "1234567890",
                    bank_name: "Test Bank",
                    bank_code: "001",
                },
            });
            console.log("Wallet created.");
        }
        console.log("Debug seed completed.");
    }
    catch (error) {
        console.error("Debug Seed Error:", error);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
debugSeed();
//# sourceMappingURL=debug-seed.js.map