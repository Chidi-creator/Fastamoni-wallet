import { env } from "@config/env";
import axios from "axios";
import { FlutterwaveBankRequest, FlutterwaveAccountResolveResponse } from "./types/banks";
import logger from "@services/logger.service";

class FlutterwaveBankResolver {
  private static instance: FlutterwaveBankResolver;
  url: string;
  apiKey: string;

  private constructor() {
    this.url = "https://api.flutterwave.com/v3/accounts/resolve";
    this.apiKey = env.FLUTTERWAVE_SANDBOX_SECRET_KEY;
  }

  //singleton instance
  public static getInstance(): FlutterwaveBankResolver {
    if (!FlutterwaveBankResolver.instance) {
      FlutterwaveBankResolver.instance = new FlutterwaveBankResolver();
    }
    return FlutterwaveBankResolver.instance;
  }

  //call flutterwave api to resolve bank account
   async callResolveBankAccountAPI(
    bankData: FlutterwaveBankRequest  ): Promise<FlutterwaveAccountResolveResponse> {
    const response = await axios.post<FlutterwaveAccountResolveResponse>(
      this.url,
      bankData,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.status !== "success") {
      logger.error(
        `Flutterwave API Error: ${response.data.message}`
      );

      throw new Error(`Flutterwave API Error: ${response.data.message}`);
    }
    return response.data;
  }
}
export default FlutterwaveBankResolver;
