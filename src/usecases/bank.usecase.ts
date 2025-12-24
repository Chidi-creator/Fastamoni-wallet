import { Bank, Prisma } from "@prisma/client";
import BankRepository from "@repositories/banks.repository";
import CacheService from "@services/cache.service";

class BankUsecase {
  bankRepository: BankRepository;
  private cacheService: CacheService;

  constructor() {
    this.bankRepository = new BankRepository();
    this.cacheService = new CacheService();
  }
  async insertMany(
    data: Prisma.BankCreateInput[]
  ): Promise<{ inserted: number }> {
    return this.bankRepository.insertMany(data);
  }
  async findAllBanks(): Promise<Bank[]> {
    return this.bankRepository.findAllBanks();
  }

  async findBanksWithSkipAndLimit(
    limit: number,
    skip: number
  ): Promise<{ banks: Bank[]; totalItems: number }> {
    const cacheKey = `banks:limit:${limit}:skip:${skip}`;
    const cached = await this.cacheService.get<{ banks: Bank[]; totalItems: number }>(cacheKey);
    if (cached) {
      return cached;
    }
    const result = await this.bankRepository.findBanksWithSkipAndLimit(limit, skip);
    await this.cacheService.set(cacheKey, result, 3600); // Cache for 1 hour
    return result;
  }

  async findByBankCode(bankCode: string): Promise<Bank | null> {
    return this.bankRepository.findByBankCode(bankCode);
  }
}
export default BankUsecase;
