export interface ParsedTransaction {
  bankName: string;
  amount: number;
  merchantName: string;
  timestamp: number;
}

const OTP_KEYWORDS = [
  "OTP", "Verification Code", "one-time", "temporary password",
  "رمز التحقق", "رمز التأكيد", "رمز تفعيل", "رمز مؤقت",
  "كلمة المرور المؤقتة", "تأكيد الدخول", "رمز الدخول",
];

interface BankPattern {
  bankName: string;
  patterns: RegExp[];
}

const BANK_PATTERNS: BankPattern[] = [
  {
    bankName: "بنك الراجحي",
    patterns: [
      /تم (?:الخصم|خصم|سحب).*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR|ر\.س).*?(?:لدى|في|من)\s+([^\n.،,]+?)(?:\s+رقم|\s+بتاريخ|\s+في|\n|$)/i,
      /Al Rajhi.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?at\s+([^\n.،]+?)(?:\s+Ref|\s+on|\n|$)/i,
      /تم شراء.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:في|من|لدى)\s+([^\n.،,]+?)(?:\s+رقم|\s+بتاريخ|\n|$)/i,
    ],
  },
  {
    bankName: "البنك الأهلي السعودي",
    patterns: [
      /SNB.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?at\s+([^\n.،]+?)(?:\s+Ref|\s+on|\n|$)/i,
      /أُجريت عملية.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?في\s+([^\n.،,]+?)(?:\s+رقم|\s+بتاريخ|\n|$)/i,
      /تم خصم.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:لدى|في)\s+([^\n.،,]+?)(?:\s+رقم|\s+في|\n|$)/i,
    ],
  },
  {
    bankName: "بنك الرياض",
    patterns: [
      /Riyad Bank.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?at\s+([^\n.،]+?)(?:\s+Ref|\s+on|\n|$)/i,
      /بنك الرياض.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:لدى|في)\s+([^\n.،,]+?)(?:\s+رقم|\s+بتاريخ|\n|$)/i,
    ],
  },
  {
    bankName: "بنك ساب",
    patterns: [
      /SABB?.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?at\s+([^\n.،]+?)(?:\s+Ref|\s+on|\n|$)/i,
      /بنك ساب.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:SAR|ريال).*?(?:في|لدى|من)\s+([^\n.،,]+?)(?:\s+رقم|\s+بتاريخ|\n|$)/i,
    ],
  },
  {
    bankName: "بنك البلاد",
    patterns: [
      /Albilad.*?SAR\s*([\d,]+(?:\.\d{1,2})?).*?at\s+([^\n.،]+?)(?:\s+Ref|\s+on|\n|$)/i,
      /بنك البلاد.*?(\d[\d,]*(?:\.\d{1,2})?)\s*(?:ريال|SAR).*?(?:لدى|في)\s+([^\n.،,]+?)(?:\s+رقم|\s+بتاريخ|\n|$)/i,
    ],
  },
];

export function isOtpMessage(sms: string): boolean {
  const lower = sms.toLowerCase();
  return OTP_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export function parseSms(sms: string): ParsedTransaction | null {
  if (!sms || sms.trim().length === 0) return null;
  if (isOtpMessage(sms)) return null;

  for (const bank of BANK_PATTERNS) {
    for (const pattern of bank.patterns) {
      const match = sms.match(pattern);
      if (match?.[1] && match?.[2]) {
        const amount = parseFloat(match[1].replace(/,/g, ""));
        if (isNaN(amount) || amount <= 0) continue;
        return {
          bankName: bank.bankName,
          amount,
          merchantName: match[2].trim().replace(/\s+/g, " ").substring(0, 60),
          timestamp: Date.now(),
        };
      }
    }
  }
  return null;
}

export function detectBank(sender: string): string {
  const s = sender.toUpperCase();
  if (s.includes("ALRAJHI") || s.includes("RAJHI")) return "بنك الراجحي";
  if (s.includes("SNB") || s.includes("ANB") || s.includes("AHLI")) return "البنك الأهلي السعودي";
  if (s.includes("RIYAD")) return "بنك الرياض";
  if (s.includes("SABB") || s.includes("SAB")) return "بنك ساب";
  if (s.includes("ALBILAD") || s.includes("BILAD")) return "بنك البلاد";
  if (s.includes("ALJAZIRA") || s.includes("JAZIRA")) return "بنك الجزيرة";
  return "بنك";
}
