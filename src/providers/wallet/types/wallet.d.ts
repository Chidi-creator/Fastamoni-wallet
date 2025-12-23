export interface CreateWalletRequest {
  email: string;
  currency: string;
  firstname: string;
  lastname: string;
  is_permanent: boolean;
  bank_code: string;
  bvn: string;
}

export interface CreateWalletResponse {
  status: string;
  message:  string;
  data: Record<string, any>;
}
