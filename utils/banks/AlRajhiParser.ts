import type { ParsedTransaction } from "../smsParser";

const PATTERNS = [
  /تم\s+(?:الخصم|خصم|سحب|إتمام\s+عملية\s+شراء|شراء)\s+.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س).*?(?:لدى|في|من)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\s+في\s+\d|\n|$)/iu,
  /Al[\s-]?Rajhi\b.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?(?:at|At)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on\s+\d|\n|$)/i,
  /تم\s+(?:إتمام\s+)?(?:عملية\s+)?الشراء.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:في|من|لدى)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\n|$)/iu,
  /خصم\s+مبلغ\s+(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:لدى|في)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+على|\n|$)/iu,
];

export function matchesAlRajhi(sms: string): boolean {
  return (
    /الراجحي|ALRAJHI|Al[\s-]?Rajhi/i.test(sms)
  );
}

export function parseAlRajhi(sms: string): ParsedTransaction | null {
  for (const p of PATTERNS) {
    const m = sms.match(p);
    if (m?.[1] && m?.[2]) {
      const amount = parseFloat(m[1].replace(/,/g, ""));
      if (!isNaN(amount) && amount > 0) {
        return {
          bankName: "بنك الراجحي",
          amount,
          merchantName: m[2].trim().replace(/\s+/g, " ").substring(0, 60),
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}
