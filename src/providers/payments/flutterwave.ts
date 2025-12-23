import axios from "axios";
import { env } from "@config/env";
import logger from "@services/logger.service";

export interface InitiatePaymentRequest {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url?: string;
  customer: {
    email: string;
    name?: string;
  };
  narration?: string;
}

export interface InitiatePaymentResponse {
  status: string;
  message: string;
  data?: {
    link: string;
    id?: number;
  };
}

class FlutterwavePaymentProvider {
  private static instance: FlutterwavePaymentProvider;
  private url = "https://api.flutterwave.com/v3/payments";
  private apiKey = env.FLUTTERWAVE_SANDBOX_SECRET_KEY;

  public static getInstance(): FlutterwavePaymentProvider {
    if (!FlutterwavePaymentProvider.instance) {
      FlutterwavePaymentProvider.instance = new FlutterwavePaymentProvider();
    }
    return FlutterwavePaymentProvider.instance;
  }

  async initiatePayment(
    request: InitiatePaymentRequest
  ): Promise<InitiatePaymentResponse> {
    try {
      logger.info("Initiating Flutterwave payment", { tx_ref: request.tx_ref, amount: request.amount });

      const response = await axios.post<InitiatePaymentResponse>(this.url, request, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status !== "success") {
        logger.error(`Flutterwave payment API error: ${response.data.message}`);
      }

      return response.data;
    } catch (error: any) {
      logger.error(`Flutterwave payment error: ${error.message}`, {
        response: error?.response?.data,
      });
      throw error;
    }
  }
}

export default FlutterwavePaymentProvider;
