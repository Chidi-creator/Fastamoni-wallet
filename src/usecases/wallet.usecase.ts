import { Prisma, Wallet } from "@prisma/client";
import WalletRepository from "@repositories/wallet.repository";
import logger from "@services/logger.service";

class WalletUsecase {
  walletRepository: WalletRepository;

  constructor() {
    this.walletRepository = new WalletRepository();
  }

  async InitialiseWalletForUser(
    data: Prisma.WalletUncheckedCreateInput
  ): Promise<Wallet> {
    logger.info("Initializing wallet for user with data:", data);
    return this.walletRepository.create(data);
  }

  async getWalletById(id: string): Promise<Wallet | null> {
    return this.walletRepository.findById(id);
  }
  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    return this.walletRepository.findByUserId(userId);
  }
  async updateWallet(
    id: string,
    data: Prisma.WalletUpdateInput
  ): Promise<Wallet> {
    return this.walletRepository.update(id, data);
  }
  async deleteWallet(id: string): Promise<Wallet> {
    return this.walletRepository.delete(id);
  }
  async getWalletByAccountNumber(
    walletNumber: string
  ): Promise<Wallet | null> {
    return this.walletRepository.findWalletByAccountNumber(walletNumber);
  }
}
export default WalletUsecase;
