import type { ParsedTransaction } from "../smsParser";

const PATTERNS = [
  /SNB\b.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on\s+\d|\n|$)/i,
  /البنك\s+الأهلي.*?(?:خصم|اقتطع|أُجريت).*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:في|لدى)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\n|$)/iu,
  /أُجريت\s+عملية.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?في\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\n|$)/iu,
  /تم\s+خصم\s+.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:لدى|في)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+في\s+\d|\n|$)/iu,
];

export function matchesSNB(sms: string): boolean {
  return /الأهلي\s+السعودي|البنك\s+الأهلي|SNB\b|NCB\b/i.test(sms);
}

export function parseSNB(sms: string): ParsedTransaction | null {
  for (const p of PATTERNS) {
    const m = sms.match(p);
    if (m?.[1] && m?.[2]) {
      const amount = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0) {
        return {
          bankName: "البنك الأهلي السعودي",
          amount,
          merchantName: m[2].trim().replace(/\s+/g, " ").substring(0, 60),
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}
