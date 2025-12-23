import { PaymentIntent, Prisma } from "@prisma/client";
import PaymentIntentRepository from "@repositories/paymentIntent.repository";

class PaymentIntentUseCase {
  private repo: PaymentIntentRepository;

  constructor() {
    this.repo = new PaymentIntentRepository();
  }

  create(data: Prisma.PaymentIntentUncheckedCreateInput): Promise<PaymentIntent> {
    return this.repo.create(data);
  }

  findByIdempotencyKey(key: string): Promise<PaymentIntent | null> {
    return this.repo.findByIdempotencyKey(key);
  }

  findByReference(ref: string): Promise<PaymentIntent | null> {
    return this.repo.findByReference(ref);
  }

  updateStatusAndRaw(
    id: string,
    status: string,
    raw?: Prisma.InputJsonValue
  ): Promise<PaymentIntent> {
    return this.repo.updateStatusAndRaw(id, status, raw);
  }
}

export default PaymentIntentUseCase;
