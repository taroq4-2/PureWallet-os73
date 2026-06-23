import type { ParsedTransaction } from "../smsParser";

const PATTERNS = [
  /Riyad\s+Bank.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on\s+\d|\n|$)/i,
  /بنك\s+الرياض.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:لدى|في|من)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\n|$)/iu,
  /RIYADBANK.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on|\n|$)/i,
  /تم\s+(?:خصم|إجراء\s+عملية).*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:لدى|في)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+في\s+\d|\n|$)/iu,
];

export function matchesRiyad(sms: string): boolean {
  return /بنك\s+الرياض|Riyad\s+Bank|RIYADBANK/i.test(sms);
}

export function parseRiyad(sms: string): ParsedTransaction | null {
  for (const p of PATTERNS) {
    const m = sms.match(p);
    if (m?.[1] && m?.[2]) {
      const amount = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0) {
        return {
          bankName: "بنك الرياض",
          amount,
          merchantName: m[2].trim().replace(/\s+/g, " ").substring(0, 60),
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}
