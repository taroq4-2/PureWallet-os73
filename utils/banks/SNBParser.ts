import type { ParsedTransaction } from "../smsParser";

/**
 * SNB (البنك الأهلي السعودي) SMS patterns — senders: SNB-AIAhli, SNB, NCBSms
 * Patterns work whether or not "SNB"/"الأهلي" appears in the body.
 * Merchant names may contain dots (e.g. NOON.COM, AMAZON.COM).
 */
const PATTERNS: RegExp[] = [
  // SNB English with bank name: SNB … SAR 120.00 … at MERCHANT
  /SNB\b[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|Bal|on\s+\d)|\n|$)/i,

  // Arabic: أُجريت عملية / تم خصم
  /(?:أُجريت\s+عملية|تم\s+(?:خصم|إتمام))[^\n]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:في|لدى)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ|التاريخ)|\s+\d{1,2}\/\d|\n|$)/iu,

  // Arabic: البنك الأهلي … في/لدى …
  /البنك\s+الأهلي[^\n]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:في|لدى)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ)|\s+\d{1,2}\/\d|\n|$)/iu,

  // English (no bank name in body): Deducted SAR 120.00 … at MERCHANT
  /[Dd]educted[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|Bal|ref|bal)|\s+\d{1,2}\/\d|\n|$)/i,

  // English: Purchase SAR 120.00 at MERCHANT
  /[Pp]urchase[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|ref)|\.\s*$|\n|$)/i,

  // Arabic generic debit fallback
  /تم\s+خصم[^\n]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:لدى|في)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ)|\s+\d{1,2}\/\d|\n|$)/iu,
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
