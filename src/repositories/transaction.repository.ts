import prisma from "@db/prisma";
import { Prisma, Transaction } from "@prisma/client";
import { DatabaseError } from "@managers/error.manager";

class TransactionRepository {
  async createTransaction(
    data: Prisma.TransactionUncheckedCreateInput
  ): Promise<Transaction> {
    try {
      return await prisma.transaction.create({ data });
    } catch (error: any) {
      throw new DatabaseError(`Error creating transaction: ${error.message}`);
    }
  }

  async findByDonationId(donationId: string): Promise<Transaction | null> {
    try {
      return await prisma.transaction.findUnique({ where: { donationId } });
    } catch (error: any) {
      throw new DatabaseError(`Error finding transaction by donation: ${error.message}`);
    }
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null> {
    try {
      return await prisma.transaction.findUnique({ where: { idempotencyKey } });
    } catch (error: any) {
      throw new DatabaseError(`Error finding transaction by idempotency key: ${error.message}`);
    }
  }

  async updateStatus(id: string, status: string): Promise<Transaction> {
    try {
      return await prisma.transaction.update({ where: { id }, data: { status } });
    } catch (error: any) {
      throw new DatabaseError(`Error updating transaction status: ${error.message}`);
    }
  }

  // Handles wallet-to-wallet transfer atomically using conditional updates to avoid race conditions.
  async handleInternalWalletTransfer(
    senderWalletId: string,
    receiverWalletId: string,
    amount: number
  ): Promise<void> {
    if (amount <= 0) {
      throw new DatabaseError("Transfer amount must be positive");
    }

    try {
      await prisma.$transaction(async (tx) => {
        // Decrement sender balance only if sufficient funds; updateMany + gte guard prevents race.
        const senderResult = await tx.wallet.updateMany({
          where: {
            id: senderWalletId,
            balance: { gte: amount },
          },
          data: { balance: { decrement: amount } },
        });

        if (senderResult.count === 0) {
          throw new DatabaseError("Insufficient balance or sender wallet not found");
        }

        // Ensure receiver exists; increment balance.
        const receiver = await tx.wallet.update({
          where: { id: receiverWalletId },
          data: { balance: { increment: amount } },
        });

        if (!receiver) {
          throw new DatabaseError("Receiver wallet not found");
        }
      });
    } catch (error: any) {
      throw new DatabaseError(`Error handling internal wallet transfer: ${error.message}`);
    }
  }
}

export default TransactionRepository;
