import { z } from "zod";

export const PLAN_VALUES = ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"] as const;

export const loginSchema = z.object({
  username: z.string().min(1, "Informe o usuário"),
  password: z.string().min(1, "Informe a senha"),
});

const dateStringSchema = z
  .string()
  .min(1, "Data obrigatória")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Data inválida");

const currencySchema = z
  .string()
  .min(1, "Informe o valor")
  .refine((value) => !Number.isNaN(Number(value.replace(",", "."))), "Valor inválido")
  .transform((value) => Math.round(Number(value.replace(",", ".")) * 100));

export const subscriberSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  contact: z.string().trim().min(1, "Informe o contato"),
  plan: z.enum(PLAN_VALUES),
  startDate: dateStringSchema,
  expiresAt: dateStringSchema,
  amount: currencySchema,
});

export const subscriberUpdateSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  contact: z.string().trim().min(1, "Informe o contato"),
  plan: z.enum(PLAN_VALUES),
  startDate: dateStringSchema,
  expiresAt: dateStringSchema,
  cancelled: z.boolean(),
});

export const paymentSchema = z.object({
  amount: currencySchema,
  plan: z.enum(PLAN_VALUES),
  paidAt: dateStringSchema,
  newExpiresAt: dateStringSchema,
});
