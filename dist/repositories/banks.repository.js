"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../db/prisma"));
const error_manager_1 = require("../managers/error.manager");
class BankRepository {
    async insertMany(data) {
        try {
            const result = await prisma_1.default.bank.createMany({
                data,
                skipDuplicates: true,
            });
            return { inserted: result.count };
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error inserting banks: ${error.message}`);
        }
    }
    async findAllBanks() {
        try {
            const banks = await prisma_1.default.bank.findMany();
            return banks;
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error fetching banks: ${error.message}`);
        }
    }
    async findBanksWithSkipAndLimit(limit, skip) {
        try {
            const [banks, totalItems] = await Promise.all([
                prisma_1.default.bank.findMany({
                    skip: Math.max(0, skip),
                    take: Math.max(1, limit),
                    orderBy: { bank_name: "asc" },
                }),
                prisma_1.default.bank.count(),
            ]);
            return { banks, totalItems };
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error fetching paginated banks: ${error.message}`);
        }
    }
    async findByBankCode(bankCode) {
        try {
            return await prisma_1.default.bank.findUnique({
                where: { bank_code: bankCode },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding bank by code: ${error.message}`);
        }
    }
}
exports.default = BankRepository;
//# sourceMappingURL=banks.repository.js.map