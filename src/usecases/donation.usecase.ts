import { Prisma, Donation } from "@prisma/client";
import DonationRepository from "@repositories/donation.repository";

class DonationUseCase {
  private donationRepository: DonationRepository;

  constructor() {
    this.donationRepository = new DonationRepository();
  }

  async createDonation(data: Prisma.DonationUncheckedCreateInput): Promise<Donation> {
    return this.donationRepository.createDonation(data);
  }

  async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    return this.donationRepository.findDonationsByDonorId(donorId);
  }

  async getDonationsByBeneficiary(beneficiaryId: string): Promise<Donation[]> {
    return this.donationRepository.findDonationsByBeneficiaryId(beneficiaryId);
  }

  async countDonationsByDonor(donorId: string): Promise<number> {
    return this.donationRepository.countByDonor(donorId);
  }

  async getDonationsByDonorInRange(
    donorId: string,
    start: Date,
    end: Date
  ): Promise<Donation[]> {
    return this.donationRepository.findInDateRangeForDonor(donorId, start, end);
  }

  async getDonationForBeneficiary(
    donationId: string,
    beneficiaryId: string
  ): Promise<Donation | null> {
    return this.donationRepository.findOneForBeneficiary(donationId, beneficiaryId);
  }

  async getDonationWithTransaction(donationId: string): Promise<Donation | null> {
    return this.donationRepository.findDonationWithTransaction(donationId);
  }
}

export default DonationUseCase;
