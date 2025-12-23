export interface CreditWalletPayload {
    account_number: string;
    amount: number;
    currency: string;
    description?: string;
}

export interface DepositPayload {
    amount: number;
    currency: string;
    email: string;
    name?: string;
    redirect_url?: string;
    narration?: string;
}

export interface WithdrawToAccountPayload {
    bank_code: string; // Bank code
    account_number: string;
    amount: number;
    narration?: string;
    currency: string;
}