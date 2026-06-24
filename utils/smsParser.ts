/**
 * SMS Parser — delegates to bank-specific parsers
 * ─────────────────────────────────────────────────────────────────────────
 * Each bank has its own dedicated parser module under utils/banks/.
 * The dispatcher tries each parser in order; the first match wins.
 *
 * parseSms(body, sender?) — pass the SMS address/sender for best accuracy.
 * The sender field (e.g. "AlRajhiBank", "SNB-AIAhli") is the most reliable
 * way to identify the bank, since the SMS body may not contain the bank name.
 */
import {
  ALRAJHI_SENDERS,
  ANB_SENDERS,
  RIYAD_SENDERS,
  SNB_SENDERS,
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

/**
 * All known bank sender IDs — used to pre-filter SMS from inbox.
 * Normalised to uppercase with dashes/spaces removed for matching.
 */
export const ALL_BANK_SENDERS = [
  ...ALRAJHI_SENDERS,
  ...SNB_SENDERS,
  ...ANB_SENDERS,
  ...RIYAD_SENDERS,
  // Extra common variants
  "SABB", "SAB", "ALBILAD", "BILAD", "ALJAZIRA", "JAZIRA", "ALINMA",
];

export function isKnownBankSender(sender: string): boolean {
  const s = sender.toUpperCase().replace(/[-_\s]/g, "");
  return ALL_BANK_SENDERS.some((known) =>
    s.includes(known.toUpperCase().replace(/[-_\s]/g, ""))
  );
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
  matches: (sms: string, sender?: string) => boolean;
  parse:   (sms: string, sender?: string) => ParsedTransaction | null;
}

const BANKS: BankEntry[] = [
  { matches: matchesAlRajhi, parse: parseAlRajhi },
  { matches: matchesSNB,     parse: parseSNB     },
  { matches: matchesANB,     parse: parseANB     },
  { matches: matchesRiyad,   parse: parseRiyad   },
];

/**
 * Parses a bank SMS into a ParsedTransaction.
 *
 * @param sms    - The full SMS message body.
 * @param sender - The SMS sender address / originator (e.g. "AlRajhiBank").
 *                 Providing the sender greatly improves bank detection accuracy.
 *
 * Returns null for OTP messages, unknown senders, or unrecognised formats.
 */
export function parseSms(sms: string, sender?: string): ParsedTransaction | null {
  if (!sms?.trim()) return null;
  if (isOtpMessage(sms)) return null;

  for (const bank of BANKS) {
    if (bank.matches(sms, sender)) {
      return bank.parse(sms, sender);
    }
  }
  return null;
}

/**
 * Detects the bank display name from the SMS sender ID.
 */
export function detectBank(sender: string): string {
  const s = sender.toUpperCase().replace(/[-_\s]/g, "");
  if (s.includes("ALRAJHI") || s.includes("RAJHI")) return "بنك الراجحي";
  if (s.includes("SNB") || s.includes("AHLI") || s.includes("NCB")) return "البنك الأهلي السعودي";
  if (s.includes("ANB") || s.includes("ARABNATIONAL"))               return "البنك العربي الوطني";
  if (s.includes("RIYAD"))                                            return "بنك الرياض";
  if (s.includes("SABB") || s.includes("SAB"))                       return "بنك ساب";
  if (s.includes("ALBILAD") || s.includes("BILAD"))                  return "بنك البلاد";
  if (s.includes("ALJAZIRA") || s.includes("JAZIRA"))                return "بنك الجزيرة";
  if (s.includes("ALINMA") || s.includes("INMA"))                    return "بنك الإنماء";
  return "بنك";
}
