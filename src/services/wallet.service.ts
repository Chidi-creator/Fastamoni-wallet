import { Wallet, Prisma } from "@prisma/client";
import { flutterwaveWalletProvider } from "@providers/index";
import { CreateWalletRequest } from "@providers/wallet/types/wallet";
import WalletUsecase from "@usecases/wallet.usecase";
import logger from "./logger.service";

class WalletService {
  walletUsecase: WalletUsecase;

  constructor() {
    this.walletUsecase = new WalletUsecase();
  }

  async callFlutterwaveWalletCreation(
    userId: string,
    data: CreateWalletRequest
  ): Promise<Wallet> {
    try {
      const response = await flutterwaveWalletProvider.createWallet(data);
      let walletData = {} as Prisma.WalletUncheckedCreateInput;

      if (response.status === "success" && response.data) {
        walletData = {
          userId: userId,
          wallet_number: response.data.account_number,
          bank_code: data.bank_code,
          bank_name: response.data.bank_name,
        };
      }
      return this.walletUsecase.InitialiseWalletForUser(walletData);
    } catch (error: any) {
      logger.error(
        `Error creating wallet for user ${userId} with Flutterwave: ${error.message}`
      );
      throw error;
    }
  }
}
export default WalletService;
