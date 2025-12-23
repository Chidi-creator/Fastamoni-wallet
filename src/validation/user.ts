import { Prisma } from "@prisma/client";
import joi, { object } from "joi";

export const validateUserCreation = (object: Prisma.UserCreateInput) => {
  const schema = joi.object({
    firstname: joi.string().min(2).max(30).required(),
    lastname: joi.string().min(2).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().min(5).required(),
  });
  return schema.validate(object);
};


export const validateUserUpdate = (object: Prisma.UserUpdateInput) => {
  const schema = joi.object({
    firstname: joi.string().min(2).max(30).optional(),
    lastname: joi.string().min(2).max(30).optional(),
    email: joi.string().email().optional(),    
    password: joi.string().min(6).optional(),
  });
  return schema.validate(object);
}