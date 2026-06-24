import type { ParsedTransaction } from "../smsParser";

/**
 * SNB (البنك الأهلي السعودي) SMS patterns.
 * Sender IDs: SNB-AIAhli, SNB, NCBSms
 * Patterns work whether or not "SNB" / "الأهلي" appears in the body.
 */
const PATTERNS: RegExp[] = [
  // SNB English: SAR 120.00 at MERCHANT
  /SNB\b[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on\s+\d|\n|$)/i,

  // Arabic: أُجريت عملية / خصم
  /(?:أُجريت\s+عملية|تم\s+(?:خصم|إتمام))[^\n]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)(?:[^\n]*?)(?:في|لدى)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\n|$)/iu,

  // Arabic: البنك الأهلي … خصم … في …
  /البنك\s+الأهلي[^\n]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)(?:[^\n]*?)(?:في|لدى)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\n|$)/iu,

  // English (no bank name): Deducted SAR 120.00 at MERCHANT
  /[Dd]educted(?:\s+from[^\n]*?)?\s+SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([^\n.،]{2,60}?)(?:\s+[Rr]ef|\s+[Bb]al|\.\s*\d|\n|$)/i,

  // Purchase SAR 120.00 at MERCHANT
  /[Pp]urchase\s+(?:of\s+)?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([^\n.،]{2,60}?)(?:\s+[Rr]ef|\.|\n|$)/i,

  // Generic Arabic debit fallback
  /تم\s+خصم\s+.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)(?:[^\n]*?)(?:لدى|في)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+في\s+\d|\n|$)/iu,
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
