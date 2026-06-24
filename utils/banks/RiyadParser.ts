import type { ParsedTransaction } from "../smsParser";

export const RIYAD_SENDERS = [
  "RiyadBank",
  "RIYADBANK",
  "RIYAD",
  "Riyad",
];

const AMOUNT_MERCHANT_PATTERNS = [
  /(?:تم\s+)?(?:خصم|سحب|اقتطع|إجراء\s+عملية)\s+(?:مبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)[^]*?(?:لدى|في|من|عند)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|\s+بتاريخ|$)/iu,
  /بمبلغ\s+(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)[^]*?(?:لدى|في|عند)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|$)/iu,
  /مبلغ\s+(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^]*?(?:لدى|في)\s+([^\n\d،.]{2,60}?)(?:\s*[\n\r]|\s+رقم|\s+بتاريخ|$)/iu,
  /(?:SAR|SR)\s+([\d,]+(?:\.\d{1,2})?)[^]*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on\s+\d|\s*\n|$)/i,
  /Riyad\s*Bank[^]*?(?:SAR|SR)\s*([\d,]+(?:\.\d{1,2})?)[^]*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s*\n|$)/i,
];

export function matchesRiyad(sms: string, sender?: string): boolean {
  if (sender) {
    const s = sender.toUpperCase().replace(/[-_\s]/g, "");
    if (s.includes("RIYAD")) return true;
  }
  return /بنك\s+الرياض|Riyad\s+Bank|RIYADBANK/i.test(sms);
}

export function parseRiyad(sms: string, sender?: string): ParsedTransaction | null {
  for (const p of AMOUNT_MERCHANT_PATTERNS) {
    const m = sms.match(p);
    if (m?.[1] && m?.[2]) {
      const amount = parseFloat(m[1].replace(/,/g, ""));
      const merchant = m[2].trim().replace(/\s+/g, " ").substring(0, 60);
      if (!isNaN(amount) && amount > 0 && merchant.length >= 2) {
        return {
          bankName: "بنك الرياض",
          amount,
          merchantName: merchant,
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}
