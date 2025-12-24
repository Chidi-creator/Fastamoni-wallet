"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../db/prisma"));
const error_manager_1 = require("../managers/error.manager");
class DonationRepository {
    async createDonation(data) {
        try {
            return await prisma_1.default.donation.create({
                data,
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error creating donation: ${error.message}`);
        }
    }
    async findDonationsByDonorId(donorId) {
        try {
            return await prisma_1.default.donation.findMany({
                where: { donorId },
                orderBy: { createdAt: "desc" },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding donations by donor ID: ${error.message}`);
        }
    }
    async findDonationsByBeneficiaryId(beneficiaryId) {
        try {
            return await prisma_1.default.donation.findMany({
                where: { beneficiaryId },
                orderBy: { createdAt: "desc" },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding donations by beneficiary ID: ${error.message}`);
        }
    }
    async countByDonor(donorId) {
        try {
            return await prisma_1.default.donation.count({ where: { donorId } });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error counting donations by donor ID: ${error.message}`);
        }
    }
    async findInDateRangeForDonor(donorId, start, end) {
        try {
            return await prisma_1.default.donation.findMany({
                where: {
                    donorId,
                    createdAt: {
                        gte: start,
                        lte: end,
                    },
                },
                orderBy: { createdAt: "desc" },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding donations by donor in range: ${error.message}`);
        }
    }
    async findOneForBeneficiary(donationId, beneficiaryId) {
        try {
            return await prisma_1.default.donation.findFirst({
                where: { id: donationId, beneficiaryId },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding donation for beneficiary: ${error.message}`);
        }
    }
    async findDonationWithTransaction(donationId) {
        try {
            return await prisma_1.default.donation.findUnique({
                where: { id: donationId },
                include: { transaction: true },
            });
        }
        catch (error) {
            throw new error_manager_1.DatabaseError(`Error finding donation with transaction: ${error.message}`);
        }
    }
}
exports.default = DonationRepository;
//# sourceMappingURL=donation.repository.js.map