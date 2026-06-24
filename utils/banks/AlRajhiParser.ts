import type { ParsedTransaction } from "../smsParser";

/**
 * AlRajhi SMS patterns.
 * NOTE: these patterns intentionally do NOT require "الراجحي" / "AlRajhi"
 * in the body — the sender ID (AlRajhiBank) is used for bank identification
 * before this parser is called (see smsParser.ts sender-first routing).
 */
const PATTERNS: RegExp[] = [
  // تم الخصم من حسابك 250.00 ريال لدى CARREFOUR
  /تم\s+(?:الخصم|خصم|سحب)\s+(?:من\s+(?:حسابك|حسابكم|بطاقتك)\s+)?(?:مبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)(?:[^\n]*?)(?:لدى|في|من)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\s+في\s+\d|\n|$)/iu,

  // إتمام عملية شراء / الشراء
  /(?:إتمام\s+)?(?:عملية\s+)?(?:الشراء|شراء)(?:[^\n]*?)(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)(?:[^\n]*?)(?:لدى|في|من)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+بتاريخ|\n|$)/iu,

  // English: Al Rajhi / ALRAJHI … SAR 120.00 … at MERCHANT
  /Al[\s-]?Rajhi\b[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)\s*(?:deducted)?[^\n]*?(?:at|At|@)\s+([^\n.،]{2,60}?)(?:\s+Ref|\s+on\s+\d|\n|$)/i,

  // English (no bank name): Deducted SAR 120.00 at MERCHANT Ref …
  /[Dd]educted(?:\s+from[^\n]*?)?\s+SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([^\n.،]{2,60}?)(?:\s+[Rr]ef|\s+[Bb]al|\.\s*\d|\n|$)/i,

  // Purchase of SAR 120.00 at MERCHANT
  /[Pp]urchase\s+of\s+SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([^\n.،]{2,60}?)(?:\s+[Rr]ef|\.|\n|$)/i,

  // خُصم مبلغ (general)
  /خُصم\s+(?:مبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)(?:[^\n]*?)(?:لدى|في)\s+([^\n.،,\d]{2,60}?)(?:\s+رقم|\s+على|\n|$)/iu,
];

export function matchesAlRajhi(sms: string): boolean {
  return /الراجحي|ALRAJHI|Al[\s-]?Rajhi/i.test(sms);
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
