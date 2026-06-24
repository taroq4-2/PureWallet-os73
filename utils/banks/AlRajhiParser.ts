import type { ParsedTransaction } from "../smsParser";

/**
 * AlRajhi SMS patterns — sender: AlRajhiBank
 * Works even when the bank name is absent from the SMS body.
 */
const ARABIC_DEBIT =
  /تم\s+(?:الخصم|خصم|سحب)\s+(?:من\s+(?:حسابك|حسابكم|بطاقتك)\s+)?(?:مبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س)[^\n]*?(?:لدى|في|من)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ|التاريخ|الرصيد|في|على)|\s+\d{1,2}[\/\-]\d|\n|$)/iu;

const ARABIC_PURCHASE =
  /(?:إتمام\s+)?(?:عملية\s+)?(?:الشراء|شراء)[^\n]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:لدى|في|من)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ|التاريخ|في|على)|\s+\d{1,2}[\/\-]\d|\n|$)/iu;

const ARABIC_KHASAMA =
  /خُصم\s+(?:مبلغ\s+)?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:لدى|في)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|على|بتاريخ|في)|\s+\d{1,2}[\/\-]\d|\n|$)/iu;

const EN_WITH_NAME =
  /Al[\s-]?Rajhi\b[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|Bal|on\s+\d)|\n|$)/i;

const EN_DEDUCTED =
  /[Dd]educted[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|Bal|ref|bal)|\s+\d{1,2}[\/\-]\d|\n|$)/i;

const EN_PURCHASE =
  /[Pp]urchase[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|ref)|\.?\s*$|\n|$)/i;

const PATTERNS = [ARABIC_DEBIT, ARABIC_PURCHASE, ARABIC_KHASAMA, EN_WITH_NAME, EN_DEDUCTED, EN_PURCHASE];

function cleanMerchant(raw: string): string {
  return raw
    .trim()
    .replace(/\s+(?:في|على|بتاريخ|التاريخ|الرصيد|رقم).*$/u, "")
    .replace(/\s+\d{1,2}[\/\-]\d.*$/, "")
    .replace(/\s+/g, " ")
    .substring(0, 60);
}

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
          merchantName: cleanMerchant(m[2]),
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}
