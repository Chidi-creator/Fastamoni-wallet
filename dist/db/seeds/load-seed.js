"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importStar(require("../../db/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function loadTestSeed() {
    try {
        console.log('Connecting to database...');
        await (0, prisma_1.connectDatabase)();
        // Cleanup existing test data
        console.log('Cleaning up old test data...');
        // Find test users first to clean up related data
        const testUsers = await prisma_1.default.user.findMany({
            where: { email: { startsWith: 'test' } },
            select: { id: true }
        });
        const testUserIds = testUsers.map(u => u.id);
        if (testUserIds.length > 0) {
            // Delete transactions for these users (as donor or beneficiary)
            // Find donations first
            const donations = await prisma_1.default.donation.findMany({
                where: {
                    OR: [
                        { donorId: { in: testUserIds } },
                        { beneficiaryId: { in: testUserIds } }
                    ]
                },
                select: { id: true }
            });
            const donationIds = donations.map(d => d.id);
            if (donationIds.length > 0) {
                await prisma_1.default.transaction.deleteMany({
                    where: { donationId: { in: donationIds } }
                });
                await prisma_1.default.donation.deleteMany({
                    where: { id: { in: donationIds } }
                });
            }
        }
        await prisma_1.default.wallet.deleteMany({ where: { user: { email: { startsWith: 'test' } } } });
        await prisma_1.default.user.deleteMany({ where: { email: { startsWith: 'test' } } });
        console.log('Creating test user...');
        // Use low rounds for seed user - checking env var just in case, but hardcoded 1 is fine for test user
        const rounds = process.env.LOAD_TEST_MODE === 'true' ? 1 : 1;
        const hashedPassword = await bcrypt_1.default.hash('password123', rounds);
        const hashedPin = await bcrypt_1.default.hash('1234', rounds);
        await prisma_1.default.user.create({
            data: {
                firstname: 'Test',
                lastname: 'User',
                email: 'test@example.com',
                password: hashedPassword,
                pinHash: hashedPin,
                wallet: {
                    create: {
                        wallet_number: '1234567890',
                        bank_name: 'Test Bank',
                        bank_code: '044',
                    }
                }
            }
        });
        console.log('Load test seed completed successfully.');
    }
    catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
    finally {
        await (0, prisma_1.disconnectDatabase)();
    }
}
loadTestSeed();
//# sourceMappingURL=load-seed.js.map