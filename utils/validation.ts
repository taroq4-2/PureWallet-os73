import { z } from "zod";

export const TransactionInputSchema = z.object({
  bankName: z.string().min(1, "اسم البنك مطلوب").max(100),
  amount: z
    .number({ invalid_type_error: "المبلغ يجب أن يكون رقماً" })
    .positive("المبلغ يجب أن يكون أكبر من صفر")
    .max(999_999, "المبلغ كبير جداً"),
  merchantName: z
    .string()
    .min(1, "اسم المتجر مطلوب")
    .max(200, "اسم المتجر طويل جداً"),
  timestamp: z.number().int().positive(),
  categoryId: z.string().min(1),
  isManual: z.boolean().optional().default(false),
});

export type TransactionInput = z.infer<typeof TransactionInputSchema>;

export const PinSchema = z
  .string()
  .length(4, "الرمز يجب أن يكون 4 أرقام")
  .regex(/^\d{4}$/, "الرمز يجب أن يحتوي على أرقام فقط");

export function normalizeMerchantName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, "");
}

export function maskAccountNumber(account: string): string {
  if (account.length <= 4) return account;
  return "*".repeat(account.length - 4) + account.slice(-4);
}
