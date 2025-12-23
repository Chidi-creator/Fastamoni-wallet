export interface EnvConfig {
  DATABASE_URL: string;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_SECURE: boolean;
  MAIL_SERVICE: string;
  FLUTTERWAVE_SANDBOX_SECRET_KEY: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;

}
