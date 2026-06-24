import type { ParsedTransaction } from "../smsParser";

/**
 * AlRajhi SMS patterns — sender: AlRajhiBank
 * Patterns intentionally do NOT require "الراجحي"/"AlRajhi" in the body.
 * Merchant names may contain dots (e.g. NOON.COM, AMAZON.COM).
 */
const PATTERNS: RegExp[] = [
  // Arabic: تم الخصم من حسابك 250.00 ريال لدى CARREFOUR رقم ...
  /تم\s+(?:الخصم|خصم|سحب)\s+(?:من\s+(?:حسابك|حسابكم|بطاقتك)\s+)?(?:مبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)[^\n]*?(?:لدى|في|من)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ|التاريخ|الرصيد)|\s+\d{1,2}\/\d|\n|$)/iu,

  // Arabic: إتمام عملية شراء / الشراء
  /(?:إتمام\s+)?(?:عملية\s+)?(?:الشراء|شراء)[^\n]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:لدى|في|من)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ|التاريخ)|\s+\d{1,2}\/\d|\n|$)/iu,

  // Arabic: خُصم مبلغ ...
  /خُصم\s+(?:مبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:لدى|في)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|على|بتاريخ)|\s+\d{1,2}\/\d|\n|$)/iu,

  // English with bank name: Al Rajhi … SAR 120.00 … at MERCHANT
  /Al[\s-]?Rajhi\b[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)\s*[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|Bal|on\s+\d)|\n|$)/i,

  // English (no bank name in body): Deducted SAR 120.00 … at MERCHANT
  /[Dd]educted[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|Bal|ref|bal)|\s+\d{1,2}\/\d|\n|$)/i,

  // English: Purchase of SAR 45.00 at MERCHANT
  /[Pp]urchase[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|ref)|\.\s*$|\n|$)/i,
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
