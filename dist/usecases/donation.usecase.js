"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const donation_repository_1 = __importDefault(require("../repositories/donation.repository"));
class DonationUseCase {
    constructor() {
        this.donationRepository = new donation_repository_1.default();
    }
    async createDonation(data) {
        return this.donationRepository.createDonation(data);
    }
    async getDonationsByDonor(donorId) {
        return this.donationRepository.findDonationsByDonorId(donorId);
    }
    async getDonationsByBeneficiary(beneficiaryId) {
        return this.donationRepository.findDonationsByBeneficiaryId(beneficiaryId);
    }
    async countDonationsByDonor(donorId) {
        return this.donationRepository.countByDonor(donorId);
    }
    async getDonationsByDonorInRange(donorId, start, end) {
        return this.donationRepository.findInDateRangeForDonor(donorId, start, end);
    }
    async getDonationForBeneficiary(donationId, beneficiaryId) {
        return this.donationRepository.findOneForBeneficiary(donationId, beneficiaryId);
    }
    async getDonationWithTransaction(donationId) {
        return this.donationRepository.findDonationWithTransaction(donationId);
    }
}
exports.default = DonationUseCase;
//# sourceMappingURL=donation.usecase.js.map