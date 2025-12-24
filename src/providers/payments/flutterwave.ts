import axios from "axios";
import { env } from "@config/env";
import logger from "@services/logger.service";

export interface InitiateTransferRequest {
  account_bank: string;
  account_number: string;
  amount: number;
  currency: string;
  debit_currency?: string;
  destination_branch_code?: string;
  callback_url?: string;
  narration?: string;
  reference?: string;
  meta?: Record<string, any> | null;
}

export interface InitiateTransferResponse {
  status: string;
  message: string;
  data?: {
    id: number;
    account_number: string;
    bank_code: string;
    full_name?: string;
    created_at?: string;
    currency?: string;
    debit_currency?: string;
    amount?: number;
    fee?: number;
    status?: string;
    reference?: string;
    narration?: string;
    requires_approval?: number;
    is_approved?: number;
    bank_name?: string;
    complete_message?: string;
    meta?: Record<string, any> | null;
  };
}

class FlutterwavePaymentProvider {
  private static instance: FlutterwavePaymentProvider;
  private transferUrl = "https://api.flutterwave.com/v3/transfers";
  private apiKey = env.FLUTTERWAVE_SANDBOX_SECRET_KEY;

  public static getInstance(): FlutterwavePaymentProvider {
    if (!FlutterwavePaymentProvider.instance) {
      FlutterwavePaymentProvider.instance = new FlutterwavePaymentProvider();
    }
    return FlutterwavePaymentProvider.instance;
  }

  async initiateTransfer(
    request: InitiateTransferRequest
  ): Promise<InitiateTransferResponse> {
    try {
      logger.info("Initiating Flutterwave bank transfer", {
        account_bank: request.account_bank,
        account_number: request.account_number,
        amount: request.amount,
        currency: request.currency,
      });

      const response = await axios.post<InitiateTransferResponse>(
        this.transferUrl,
        request,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status !== "success") {
        logger.error(`Flutterwave transfer API error: ${response.data.message}`);
      }

      return response.data;
    } catch (error: any) {
      logger.error(`Flutterwave transfer error: ${error.message}`, {
        response: error?.response?.data,
      });
      throw error;
    }
  }
}

export default FlutterwavePaymentProvider;
