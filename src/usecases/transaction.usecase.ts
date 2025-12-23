import { Prisma, Transaction } from "@prisma/client";
import TransactionRepository from "@repositories/transaction.repository";

class TransactionUseCase {
  private transactionRepository: TransactionRepository;

  constructor() {
    this.transactionRepository = new TransactionRepository();
  }

  async createTransaction(
    data: Prisma.TransactionUncheckedCreateInput
  ): Promise<Transaction> {
    return this.transactionRepository.createTransaction(data);
  }

  async getByDonationId(donationId: string): Promise<Transaction | null> {
    return this.transactionRepository.findByDonationId(donationId);
  }

  async getByIdempotencyKey(idempotencyKey: string): Promise<Transaction | null> {
    return this.transactionRepository.findByIdempotencyKey(idempotencyKey);
  }

  async updateStatus(id: string, status: string): Promise<Transaction> {
    return this.transactionRepository.updateStatus(id, status);
  }

  async handleInternalWalletTransfer(
    senderWalletId: string,
    receiverWalletId: string,
    amount: number
  ): Promise<void> {
    return this.transactionRepository.handleInternalWalletTransfer(
      senderWalletId,
      receiverWalletId,
      amount
    );
  }
}

export default TransactionUseCase;
