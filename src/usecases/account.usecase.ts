import { Account, Prisma } from "@prisma/client";
import AccountRepository from "@repositories/account.repository";

class AccountUseCase {
    accountRepository: AccountRepository;

    constructor() {
        this.accountRepository = new AccountRepository();
    }
    async createAccount(data: Prisma.AccountUncheckedCreateInput): Promise<Account> {
        return this.accountRepository.createAccount(data);
    }
    async getAccountsByUserId(userId: string): Promise<Account[]> {
        return this.accountRepository.findAccountsByUserId(userId);
    }
    async deleteAccount(id: string): Promise<Account> {
        return this.accountRepository.deleteAccount(id);
    }
    
}
export default AccountUseCase;