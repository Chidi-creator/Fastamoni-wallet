import AccountUseCase from "@usecases/account.usecase";
import BankUsecase from "@usecases/bank.usecase";
import { resolveBankAccountRequest } from "./types/bank";
import { Account, Prisma } from "@prisma/client";
import { FlutterwaveBankRequest } from "@providers/bankAccounts/types/banks";
import { flutterwaveBankResolver } from "@providers/index";
import { ProviderError } from "@managers/error.manager";
import logger from "./logger.service";

class AccountService {
  bankUsecase: BankUsecase;
  accountUsecase: AccountUseCase;

  constructor() {
    this.bankUsecase = new BankUsecase();
    this.accountUsecase = new AccountUseCase();
  }
  async resolveBankAccount(
    userId: string,
    data: resolveBankAccountRequest
  ): Promise<Account> {
    const payload: FlutterwaveBankRequest = {
      account_number: data.account_number,
      account_bank: data.bank_code,
    };
    try {
      const response = await flutterwaveBankResolver.callResolveBankAccountAPI(
        payload
      );

      let accountData = {} as Prisma.AccountUncheckedCreateInput;

      if (response.status === "success") {
        const bank = await this.bankUsecase.findByBankCode(data.bank_code);
        if (!bank) {
          logger.error(
            `Bank with code ${data.bank_code} not found in local database.`
          );
          throw new ProviderError(
            `Bank with code ${data.bank_code} not found in local database.`
          );
        }
        if (bank.id == null || bank.id == undefined) {
          logger.error(
            `Bank with code ${data.bank_code} has no id in local database.`
          );
          throw new ProviderError(
            `Bank with code ${data.bank_code} has no id in local database.`
          );
        }

        accountData = {
          bankId: bank.id,
          userId: userId,
          account_number: data.account_number,
          bank_code: data.bank_code,
          account_name: response.data.account_name,
        };
      }
      return this.accountUsecase.createAccount(accountData);
    } catch (error: any) {
      logger.error(`Error resolving bank account: ${error.message}`);
      throw new ProviderError(`Error resolving bank account: ${error.message}`);
    }
  }
}

export default AccountService;
