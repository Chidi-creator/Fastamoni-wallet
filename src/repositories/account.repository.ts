import prisma from "@db/prisma";
import { Account, Prisma } from "@prisma/client";
import { DatabaseError } from "@managers/error.manager";
class AccountRepository {
  // Repository methods here

  async createAccount(data: Prisma.AccountUncheckedCreateInput): Promise<Account> {
    try {
      return await prisma.account.create({
        data,
      });
    } catch (error: any) {
      throw new DatabaseError(`Error creating account: ${error.message}`);
    }
  }

  async findAccountsByUserId(userId: string): Promise<Account[]> {
    try {
      return await prisma.account.findMany({
        where: { userId },
      });
    } catch (error: any) {
      throw new DatabaseError(`Error finding accounts by user ID: ${error.message}`);
    }
  }
  async deleteAccount(id: string): Promise<Account> {
    try {
      // Soft delete by setting deletedAt
      return await prisma.account.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (error: any) {
      throw new DatabaseError(`Error deleting account: ${error.message}`);
    }
  }
}
export default AccountRepository;
