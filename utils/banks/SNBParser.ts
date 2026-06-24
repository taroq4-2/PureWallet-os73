import type { ParsedTransaction } from "../smsParser";

/**
 * SNB (البنك الأهلي السعودي) SMS patterns.
 * Senders: SNB-AIAhli, SNB, NCBSms
 */
const EN_SNB =
  /SNB\b[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|Bal|on\s+\d)|\n|$)/i;

const AR_AJRIYAT =
  /(?:أُجريت\s+عملية|تم\s+(?:خصم|إتمام))[^\n]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:في|لدى)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ|التاريخ|في|على)|\s+\d{1,2}[\/\-]\d|\n|$)/iu;

const AR_AHLI =
  /البنك\s+الأهلي[^\n]*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:في|لدى)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ|في)|\s+\d{1,2}[\/\-]\d|\n|$)/iu;

const EN_DEDUCTED =
  /[Dd]educted[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|Bal|ref|bal)|\s+\d{1,2}[\/\-]\d|\n|$)/i;

const EN_PURCHASE =
  /[Pp]urchase[^\n]*?SAR\s*([\d,]+(?:\.\d{1,2})?)[^\n]*?(?:at|At|@)\s+([A-Za-z0-9][^\n،]{1,59}?)(?:\s+(?:Ref|ref)|\.?\s*$|\n|$)/i;

const AR_GENERIC_DEBIT =
  /تم\s+خصم[^\n]*(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR)[^\n]*?(?:لدى|في)\s+([^\n،]{2,60}?)(?:\s+(?:رقم|بتاريخ|في|على)|\s+\d{1,2}[\/\-]\d|\n|$)/iu;

const PATTERNS = [EN_SNB, AR_AJRIYAT, AR_AHLI, EN_DEDUCTED, EN_PURCHASE, AR_GENERIC_DEBIT];

function cleanMerchant(raw: string): string {
  return raw
    .trim()
    .replace(/\s+(?:في|على|بتاريخ|التاريخ|الرصيد|رقم).*$/u, "")
    .replace(/\s+\d{1,2}[\/\-]\d.*$/, "")
    .replace(/\s+/g, " ")
    .substring(0, 60);
}

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
          merchantName: cleanMerchant(m[2]),
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}
