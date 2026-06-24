import type { ParsedTransaction } from "../smsParser";

export const SNB_SENDERS = [
  "SNB-AIAhli",
  "SNB",
  "NCB",
  "AhlBank",
  "AHLIBANK",
  "AhliSaudi",
  "AHLISAUDI",
];

const AMOUNT_MERCHANT_PATTERNS = [
  // Arabic: "أُجريت عملية سحب/دفع بمبلغ SAR 500 لدى/في كارفور"
  /(?:أُجريت|اجريت)\s+عملية[^]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)[^]*?(?:لدى|في|من|عند)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|\s+المرجع|$)/iu,
  // Arabic: "تم خصم X ريال ... لدى Y"
  /(?:تم\s+)?(?:خصم|سحب|اقتطع)\s+(?:مبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)[^]*?(?:لدى|في|من)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|\s+بتاريخ|$)/iu,
  // Arabic: "بمبلغ X ريال لدى/في Y"
  /بمبلغ\s+(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)[^]*?(?:لدى|في|عند)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|$)/iu,
  // Arabic: "مبلغ X ريال في Y"
  /مبلغ\s+(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^]*?(?:لدى|في)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|\s+بتاريخ|$)/iu,
  // English: "SAR X at Y" or "SNB SAR X at Y"
  /(?:SAR|SR)\s+([\d,]+(?:\.\d{1,2})?)[^]*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on\s+\d|\s*\n|$)/i,
  // English with bank prefix
  /SNB\b[^]*?(?:SAR|SR)\s*([\d,]+(?:\.\d{1,2})?)[^]*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s*\n|$)/i,
];

export function matchesSNB(sms: string, sender?: string): boolean {
  if (sender) {
    const s = sender.toUpperCase().replace(/[-_\s]/g, "");
    if (s.includes("SNB") || s.includes("AHLI") || s.includes("NCB")) return true;
  }
  return /الأهلي\s+السعودي|البنك\s+الأهلي|SNB\b|NCB\b/i.test(sms);
}

export function parseSNB(sms: string, sender?: string): ParsedTransaction | null {
  for (const p of AMOUNT_MERCHANT_PATTERNS) {
    const m = sms.match(p);
    if (m?.[1] && m?.[2]) {
      const amount = parseFloat(m[1].replace(/,/g, ""));
      const merchant = m[2].trim().replace(/\s+/g, " ").substring(0, 60);
      if (!isNaN(amount) && amount > 0 && merchant.length >= 2) {
        return {
          bankName: "البنك الأهلي السعودي",
          amount,
          merchantName: merchant,
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}
