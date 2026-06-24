import type { ParsedTransaction } from "../smsParser";

/**
 * Known sender IDs for AlRajhi Bank.
 * Add any variant you encounter from your device.
 */
export const ALRAJHI_SENDERS = [
  "AlRajhiBank",
  "AlRajhi",
  "ALRAJHI",
  "Alrajhi",
  "al-rajhi",
  "RAJHI",
];

const AMOUNT_MERCHANT_PATTERNS = [
  // Arabic: "تم خصم مبلغ 250.00 ريال من حسابكم ... لدى كارفور"
  /(?:تم\s+)?(?:خصم|اقتطع|سحب)\s+(?:مبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)[^]*?(?:لدى|في|من|عند)\s+([^\n\d،.،]{2,60}?)(?:\s*[\n\r]|\s+رقم|\s+بتاريخ|\s+الرصيد|\s+المرجع|$)/iu,
  // Arabic: "إتمام عملية الشراء بمبلغ X ... لدى Y"
  /(?:عملية\s+)?(?:الشراء|شراء)\s+(?:بمبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^]*?(?:لدى|في|من)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|\s+المرجع|$)/iu,
  // Arabic generic: "بمبلغ X ريال لدى Y"
  /بمبلغ\s+(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)[^]*?(?:لدى|في|عند)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|$)/iu,
  // Arabic: "مبلغ X ريال في/لدى Y"
  /مبلغ\s+(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^]*?(?:لدى|في)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|\s+بتاريخ|$)/iu,
  // English: "SAR 250.00 at Carrefour"
  /(?:SAR|SR)\s+([\d,]+(?:\.\d{1,2})?)[^]*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on\s+\d|\s*\n|$)/i,
  // English with bank name: "Al-Rajhi SAR 100 at McDonald's"
  /Al[\s-]?Rajhi[^]*?(?:SAR|SR)\s*([\d,]+(?:\.\d{1,2})?)[^]*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s*\n|$)/i,
];

export function matchesAlRajhi(sms: string, sender?: string): boolean {
  if (sender) {
    const s = sender.toUpperCase().replace(/[-_\s]/g, "");
    if (s.includes("ALRAJHI") || s.includes("RAJHI")) return true;
  }
  return /الراجحي|ALRAJHI|Al[\s-]?Rajhi/i.test(sms);
}

export function parseAlRajhi(sms: string, sender?: string): ParsedTransaction | null {
  for (const p of AMOUNT_MERCHANT_PATTERNS) {
    const m = sms.match(p);
    if (m?.[1] && m?.[2]) {
      const amount = parseFloat(m[1].replace(/,/g, ""));
      const merchant = m[2].trim().replace(/\s+/g, " ").substring(0, 60);
      if (!isNaN(amount) && amount > 0 && merchant.length >= 2) {
        return {
          bankName: "بنك الراجحي",
          amount,
          merchantName: merchant,
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}
