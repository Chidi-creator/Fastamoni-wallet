export interface FlutterwaveBankRequest {
  account_number: string;
  account_bank: string;
}

export interface FlutterwaveAccountResolveResponse {
  status: string;
  message: string;
  data: {
    account_number: string;
    account_name: string;
  };
}
