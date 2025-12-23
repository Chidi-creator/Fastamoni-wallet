import { Bank, Prisma } from "@prisma/client";
import BankRepository from "@repositories/banks.repository";

class BankUsecase {
  bankRepository: BankRepository;

  constructor() {
    this.bankRepository = new BankRepository();
  }
  async insertMany(
    data: Prisma.BankCreateInput[]
  ): Promise<{ inserted: number }> {
    return this.bankRepository.insertMany(data);
  }
  async findAllBanks(): Promise<Bank[]> {
    return this.bankRepository.findAllBanks();
  }
}
export default BankUsecase;
