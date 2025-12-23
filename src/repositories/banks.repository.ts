import prisma from "@db/prisma";
import { Prisma, Bank } from "@prisma/client";
import { DatabaseError } from "@managers/error.manager";

class BankRepository {
  async insertMany(
    data: Prisma.BankCreateInput[]
  ): Promise<{ inserted: number }> {
    try {
      const result = await prisma.bank.createMany({
        data,
        skipDuplicates: true,
      });

      return { inserted: result.count };
    } catch (error: any) {
      throw new DatabaseError(`Error inserting banks: ${error.message}`);
    }
  }
  async findAllBanks(): Promise<Bank[]> {
    try {
      const banks = await prisma.bank.findMany();
      return banks;
    } catch (error: any) {
      throw new DatabaseError(`Error fetching banks: ${error.message}`);
    }
  }

  async findBanksWithSkipAndLimit(
    limit: number,
    skip: number
  ): Promise<{ banks: Bank[]; totalItems: number }> {
    try {
      const [banks, totalItems] = await Promise.all([
        prisma.bank.findMany({
          skip: Math.max(0, skip),
          take: Math.max(1, limit),
          orderBy: { bank_name: "asc" },
        }),
        prisma.bank.count(),
      ]);

      return { banks, totalItems };
    } catch (error: any) {
      throw new DatabaseError(
        `Error fetching paginated banks: ${error.message}`
      );
    }
  }
}

export default BankRepository;
