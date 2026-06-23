/**
 * SMS Parser — delegates to bank-specific parsers
 * ─────────────────────────────────────────────────────────────────────────
 * Each bank has its own dedicated parser module under utils/banks/.
 * The dispatcher tries each parser in order; the first match wins.
 */
import {
  matchesAlRajhi, parseAlRajhi,
  matchesSNB,     parseSNB,
  matchesANB,     parseANB,
  matchesRiyad,   parseRiyad,
} from "./banks";

export interface ParsedTransaction {
  bankName: string;
  amount: number;
  merchantName: string;
  timestamp: number;
}

const OTP_KEYWORDS = [
  "OTP",
  "Verification Code",
  "one-time",
  "temporary password",
  "رمز التحقق",
  "رمز التأكيد",
  "رمز تفعيل",
  "رمز مؤقت",
  "كلمة المرور المؤقتة",
  "تأكيد الدخول",
  "رمز الدخول",
  "رمز المرور",
];

export function isOtpMessage(sms: string): boolean {
  const lower = sms.toLowerCase();
  return OTP_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

interface BankEntry {
  matches: (sms: string) => boolean;
  parse: (sms: string) => ParsedTransaction | null;
}

const BANKS: BankEntry[] = [
  { matches: matchesAlRajhi, parse: parseAlRajhi },
  { matches: matchesSNB,     parse: parseSNB     },
  { matches: matchesANB,     parse: parseANB     },
  { matches: matchesRiyad,   parse: parseRiyad   },
];

/**
 * Parses a bank SMS into a ParsedTransaction.
 * Returns null for OTP messages, unknown senders, or unrecognised formats.
 */
export function parseSms(sms: string): ParsedTransaction | null {
  if (!sms?.trim()) return null;
  if (isOtpMessage(sms)) return null;

  for (const bank of BANKS) {
    if (bank.matches(sms)) {
      return bank.parse(sms);
    }
  }
  return null;
}

/**
 * Detects the bank name from the SMS sender ID.
 */
export function detectBank(sender: string): string {
  const s = sender.toUpperCase();
  if (s.includes("ALRAJHI") || s.includes("RAJHI"))   return "بنك الراجحي";
  if (s.includes("SNB")     || s.includes("AHLI"))    return "البنك الأهلي السعودي";
  if (s.includes("ANB")     || s.includes("ARABNATIONAL")) return "البنك العربي الوطني";
  if (s.includes("RIYAD"))                            return "بنك الرياض";
  if (s.includes("SABB")    || s.includes("SAB"))     return "بنك ساب";
  if (s.includes("ALBILAD") || s.includes("BILAD"))   return "بنك البلاد";
  if (s.includes("ALJAZIRA")|| s.includes("JAZIRA"))  return "بنك الجزيرة";
  return "بنك";
}
