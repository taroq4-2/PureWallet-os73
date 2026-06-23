import type { ParsedTransaction } from "../smsParser";

const PATTERNS = [
  /ANB\b.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on\s+\d|\n|$)/i,
  /العربي\s+الوطني.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:لدى|في|من)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\n|$)/iu,
  /Arab\s+National.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on|\n|$)/i,
  /تم\s+(?:خصم|سحب).*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:لدى|في|من)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\n|$)/iu,
];

export function matchesANB(sms: string): boolean {
  return /العربي\s+الوطني|Arab\s+National|ANB\b/i.test(sms);
}

export function parseANB(sms: string): ParsedTransaction | null {
  for (const p of PATTERNS) {
    const m = sms.match(p);
    if (m?.[1] && m?.[2]) {
      const amount = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0) {
        return {
          bankName: "البنك العربي الوطني",
          amount,
          merchantName: m[2].trim().replace(/\s+/g, " ").substring(0, 60),
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}
