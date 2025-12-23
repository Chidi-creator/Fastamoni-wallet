import prisma from "@db/prisma";
import { Prisma, Donation } from "@prisma/client";
import { DatabaseError } from "@managers/error.manager";

class DonationRepository {
  async createDonation(
    data: Prisma.DonationUncheckedCreateInput
  ): Promise<Donation> {
    try {
      return await prisma.donation.create({
        data,
      });
    } catch (error: any) {
      throw new DatabaseError(`Error creating donation: ${error.message}`);
    }
  }

  async findDonationsByDonorId(donorId: string): Promise<Donation[]> {
    try {
      return await prisma.donation.findMany({
        where: { donorId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error: any) {
      throw new DatabaseError(
        `Error finding donations by donor ID: ${error.message}`
      );
    }
  }
  async findDonationsByBeneficiaryId(
    beneficiaryId: string
  ): Promise<Donation[]> {
    try {
      return await prisma.donation.findMany({
        where: { beneficiaryId },
        orderBy: { createdAt: "desc" },
      });
    } catch (error: any) {
      throw new DatabaseError(
        `Error finding donations by beneficiary ID: ${error.message}`
      );
    }
  }

  async countByDonor(donorId: string): Promise<number> {
    try {
      return await prisma.donation.count({ where: { donorId } });
    } catch (error: any) {
      throw new DatabaseError(
        `Error counting donations by donor ID: ${error.message}`
      );
    }
  }

  async findInDateRangeForDonor(
    donorId: string,
    start: Date,
    end: Date
  ): Promise<Donation[]> {
    try {
      return await prisma.donation.findMany({
        where: {
          donorId,
          createdAt: {
            gte: start,
            lte: end,
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error: any) {
      throw new DatabaseError(
        `Error finding donations by donor in range: ${error.message}`
      );
    }
  }

  async findOneForBeneficiary(
    donationId: string,
    beneficiaryId: string
  ): Promise<Donation | null> {
    try {
      return await prisma.donation.findFirst({
        where: { id: donationId, beneficiaryId },
      });
    } catch (error: any) {
      throw new DatabaseError(
        `Error finding donation for beneficiary: ${error.message}`
      );
    }
  }

  async findDonationWithTransaction(
    donationId: string
  ): Promise<Donation | null> {
    try {
      return await prisma.donation.findUnique({
        where: { id: donationId },
        include: { transaction: true },
      });
    } catch (error: any) {
      throw new DatabaseError(
        `Error finding donation with transaction: ${error.message}`
      );
    }
  }
}

export default DonationRepository;
