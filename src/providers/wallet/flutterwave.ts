import { env } from "@config/env";
import logger from "@services/logger.service";
import { CreateWalletRequest, CreateWalletResponse } from "./types/wallet";
import axios from "axios";

class FlutterwaveWalletProvider {
  private static instance: FlutterwaveWalletProvider;
  url: string;
  apiKey: string;

  constructor() {
    this.url = "https://api.flutterwave.com/v3/virtual-account-numbers";
    this.apiKey = env.FLUTTERWAVE_SANDBOX_SECRET_KEY;
  }

  public static getInstance(): FlutterwaveWalletProvider {
    if (!FlutterwaveWalletProvider.instance) {
      FlutterwaveWalletProvider.instance = new FlutterwaveWalletProvider();
    }
    return FlutterwaveWalletProvider.instance;
  }

  async createWallet(
    request: CreateWalletRequest
  ): Promise<CreateWalletResponse> {
    logger.info(`Creating wallet with Flutterwave for account: ${request.firstname}`);
    const response = await axios.post<CreateWalletResponse>(this.url, request, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data.status !== "success") {
      logger.error(`Flutterwave API Error: ${response.data.message}`);
    }

    return response.data;
  }
}

export default FlutterwaveWalletProvider;
