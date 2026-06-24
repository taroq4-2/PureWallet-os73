/**
 * SMS Parser — delegates to bank-specific parsers
 * ─────────────────────────────────────────────────────────────────────────
 * Sender-first routing: when msg.address (sender ID) is provided it is used
 * to pick the correct parser directly — fixing the case where the SMS body
 * does NOT include the bank name (very common for Saudi banks).
 *
 * Registered sender IDs
 *   AlRajhiBank  → بنك الراجحي
 *   SNB-AIAhli   → البنك الأهلي السعودي
 *   ANBSaudi     → البنك العربي الوطني
 *   RiyadBank    → بنك الرياض
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

// ── OTP guard ─────────────────────────────────────────────────────────────────
const OTP_KEYWORDS = [
  "OTP", "Verification Code", "one-time", "temporary password",
  "رمز التحقق", "رمز التأكيد", "رمز تفعيل", "رمز مؤقت",
  "كلمة المرور المؤقتة", "تأكيد الدخول", "رمز الدخول", "رمز المرور",
];

export function isOtpMessage(sms: string): boolean {
  const lower = sms.toLowerCase();
  return OTP_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

// ── Sender → bank key map ─────────────────────────────────────────────────────
/**
 * Normalised (uppercase, non-alphanumeric stripped) sender IDs.
 * Extend this list to support additional banks.
 */
export const KNOWN_SENDER_MAP: Record<string, string> = {
  // بنك الراجحي
  ALRAJHIBANK:  "alrajhi",
  ALRAJHI:      "alrajhi",
  RAJHIBANK:    "alrajhi",
  RAJHI:        "alrajhi",

  // البنك الأهلي السعودي (SNB / NCB)
  SNBAIAHLI:    "snb",
  SNBAHLI:      "snb",
  ASNB:         "snb",
  SNB:          "snb",
  NCBSMS:       "snb",
  NCB:          "snb",

  // البنك العربي الوطني
  ANBSAUDI:     "anb",
  ANB:          "anb",

  // بنك الرياض
  RIYADBANK:    "riyad",
  RIYAD:        "riyad",
};

function normSender(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function resolveSenderBank(sender: string): string | null {
  if (!sender) return null;
  const s = normSender(sender);
  if (KNOWN_SENDER_MAP[s]) return KNOWN_SENDER_MAP[s];
  // Substring fallback — covers variants like "AlRajhiBank-Alerts"
  if (s.includes("ALRAJHI") || s.includes("RAJHI"))                  return "alrajhi";
  if (s.includes("SNB") || s.includes("AIAHLI") || s.includes("AHLI")) return "snb";
  if (s.includes("ANB"))                                             return "anb";
  if (s.includes("RIYAD"))                                           return "riyad";
  return null;
}

// ── Parser registry ───────────────────────────────────────────────────────────
type BankParser  = (sms: string) => ParsedTransaction | null;
type BankMatcher = (sms: string) => boolean;

const PARSER_MAP: Record<string, BankParser> = {
  alrajhi: parseAlRajhi,
  snb:     parseSNB,
  anb:     parseANB,
  riyad:   parseRiyad,
};

interface BankEntry { matches: BankMatcher; parse: BankParser }
const BANKS: BankEntry[] = [
  { matches: matchesAlRajhi, parse: parseAlRajhi },
  { matches: matchesSNB,     parse: parseSNB     },
  { matches: matchesANB,     parse: parseANB     },
  { matches: matchesRiyad,   parse: parseRiyad   },
];

// ── Main entry point ──────────────────────────────────────────────────────────
/**
 * Parses a bank SMS into a ParsedTransaction.
 *
 * @param sms    Raw SMS body text
 * @param sender Sender address / alphanumeric ID (e.g. "AlRajhiBank",
 *               "SNB-AIAhli").  When present, sender-first routing selects
 *               the correct parser even when the bank name is missing from
 *               the message body.
 */
export function parseSms(sms: string, sender?: string): ParsedTransaction | null {
  if (!sms?.trim()) return null;
  if (isOtpMessage(sms)) return null;

  // 1 ── Sender-first routing ───────────────────────────────────────────────
  if (sender) {
    const bankKey = resolveSenderBank(sender);
    if (bankKey) {
      const parser = PARSER_MAP[bankKey];
      if (parser) {
        const result = parser(sms);
        if (result) return result;
        // Pattern mismatch — fall through to content scan
      }
    }
  }

  // 2 ── Content-based fallback ─────────────────────────────────────────────
  for (const bank of BANKS) {
    if (bank.matches(sms)) {
      return bank.parse(sms);
    }
  }

  return null;
}

/** Human-readable bank name from sender ID. */
export function detectBank(sender: string): string {
  const s = sender.toUpperCase();
  if (s.includes("ALRAJHI") || s.includes("RAJHI"))        return "بنك الراجحي";
  if (s.includes("SNB")     || s.includes("AIAHLI"))       return "البنك الأهلي السعودي";
  if (s.includes("ANB")     || s.includes("ARABNATIONAL"))  return "البنك العربي الوطني";
  if (s.includes("RIYAD"))                                 return "بنك الرياض";
  if (s.includes("SABB")    || s.includes("SAB"))           return "بنك ساب";
  if (s.includes("ALBILAD") || s.includes("BILAD"))         return "بنك البلاد";
  return "بنك";
}

/** Returns supported sender IDs grouped by bank for display in UI. */
export function getKnownSenderDisplay(): { bank: string; senders: string[] }[] {
  return [
    { bank: "بنك الراجحي",          senders: ["AlRajhiBank"] },
    { bank: "البنك الأهلي السعودي", senders: ["SNB-AIAhli", "SNB"] },
    { bank: "البنك العربي الوطني",  senders: ["ANBSaudi",   "ANB"] },
    { bank: "بنك الرياض",           senders: ["RiyadBank"] },
  ];
}
