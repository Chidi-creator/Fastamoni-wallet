import joi from "joi";

import { resolveBankAccountRequest } from "@services/types/bank";

export const validateAccountCreation = (object: resolveBankAccountRequest) => {
  const schema = joi.object({
    account_number: joi.string().required(),
    bank_code: joi.string().required(),
  });
  return schema.validate(object);
};
