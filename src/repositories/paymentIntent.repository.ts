import prisma from "@db/prisma";
import { PaymentIntent, Prisma } from "@prisma/client";
import { DatabaseError } from "@managers/error.manager";

class PaymentIntentRepository {
  async create(data: Prisma.PaymentIntentUncheckedCreateInput): Promise<PaymentIntent> {
    try {
      return await prisma.paymentIntent.create({ data });
    } catch (error: any) {
      throw new DatabaseError(`Error creating payment intent: ${error.message}`);
    }
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<PaymentIntent | null> {
    try {
      return await prisma.paymentIntent.findUnique({ where: { idempotencyKey } });
    } catch (error: any) {
      throw new DatabaseError(`Error finding payment intent by idempotency key: ${error.message}`);
    }
  }

  async findByReference(reference: string): Promise<PaymentIntent | null> {
    try {
      return await prisma.paymentIntent.findUnique({ where: { reference } });
    } catch (error: any) {
      throw new DatabaseError(`Error finding payment intent by reference: ${error.message}`);
    }
  }

  async updateStatusAndRaw(
    id: string,
    status: string,
    rawResponse?: Prisma.InputJsonValue
  ): Promise<PaymentIntent> {
    try {
      return await prisma.paymentIntent.update({
        where: { id },
        data: { status, rawResponse },
      });
    } catch (error: any) {
      throw new DatabaseError(`Error updating payment intent: ${error.message}`);
    }
  }
}

export default PaymentIntentRepository;
