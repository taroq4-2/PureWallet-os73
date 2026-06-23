export interface BankTemplate {
  bankName: string;
  description: string;
  patternCount: number;
  patterns: RegExp[];
  extractAmount: (match: RegExpMatchArray) => number;
  extractMerchant: (match: RegExpMatchArray) => string;
}

export const BANK_REGEX_TEMPLATES: BankTemplate[] = [
  {
    bankName: "بنك الراجحي",
    description: "رسائل خصم بطاقة الراجحي وكريم كارد",
    patternCount: 3,
    patterns: [
      /تم\s+الخصم\s+من\s+حسابك\s+مبلغ\s+([\d,.]+)\s+ريال?\s+.*?(?:في|لدى|من)\s+(.+?)(?:\s+التاريخ|\s+الرصيد|$)/i,
      /خُصم\s+من\s+حسابك\s+([\d,.]+)\s+ريال?\s+(?:من\s+خلال\s+)?(.+?)(?:\s*-|\s+التاريخ|$)/i,
      /شراء\s+بمبلغ\s+([\d,.]+)\s+ريال?\s+من\s+(.+?)(?:\s+رقم|\s+التاريخ|$)/i,
    ],
    extractAmount: (m) => parseFloat(m[1]?.replace(/,/g, "") ?? "0"),
    extractMerchant: (m) => m[2]?.trim() ?? "غير معروف",
  },
  {
    bankName: "البنك الأهلي السعودي",
    description: "رسائل خصم بطاقة الأهلي وتحويلات أهلي",
    patternCount: 3,
    patterns: [
      /تم\s+(?:إتمام\s+)?(?:عملية\s+)?الشراء\s+بمبلغ\s+([\d,.]+)\s+ريال?\s+(?:من\s+)?(.+?)(?:\s+التاريخ|\s+رقم|$)/i,
      /عملية\s+شراء\s+([\d,.]+)\s+ريال?\s+من\s+(.+?)(?:\s+تاريخ|\s+رصيد|$)/i,
      /مدفوعات\s+([\d,.]+)\s+ريال?\s+(.+?)(?:\s+التاريخ|$)/i,
    ],
    extractAmount: (m) => parseFloat(m[1]?.replace(/,/g, "") ?? "0"),
    extractMerchant: (m) => m[2]?.trim() ?? "غير معروف",
  },
  {
    bankName: "بنك الرياض",
    description: "رسائل خصم بطاقة الرياض",
    patternCount: 2,
    patterns: [
      /خُصم\s+من\s+حسابك\s+مبلغ\s+([\d,.]+)\s+ريال?\s+لدى\s+(.+?)(?:\s+الرصيد|\s+التاريخ|$)/i,
      /بطاقة\s+الرياض\s+.*?([\d,.]+)\s+ريال?\s+(?:في|لدى|من)\s+(.+?)(?:\s|$)/i,
    ],
    extractAmount: (m) => parseFloat(m[1]?.replace(/,/g, "") ?? "0"),
    extractMerchant: (m) => m[2]?.trim() ?? "غير معروف",
  },
  {
    bankName: "بنك ساب",
    description: "رسائل خصم بطاقة ساب",
    patternCount: 2,
    patterns: [
      /تم\s+الخصم\s+([\d,.]+)\s+(?:ر\.س|ريال)\s+(?:من\s+حسابك\s+)?(?:لدى|في|من)\s+(.+?)(?:\s|$)/i,
      /شراء\s+بمبلغ\s+([\d,.]+)\s+ريال?\s+(.+?)(?:\s+رقم|$)/i,
    ],
    extractAmount: (m) => parseFloat(m[1]?.replace(/,/g, "") ?? "0"),
    extractMerchant: (m) => m[2]?.trim() ?? "غير معروف",
  },
  {
    bankName: "بنك البلاد",
    description: "رسائل خصم بطاقة البلاد",
    patternCount: 2,
    patterns: [
      /خُصم\s+([\d,.]+)\s+ريال?\s+من\s+حسابك\s+(?:في|لدى)?\s*(.+?)(?:\s+الرصيد|$)/i,
      /تم\s+الخصم\s+من\s+بطاقتك\s+([\d,.]+)\s+ريال?\s+(.+?)(?:\s|$)/i,
    ],
    extractAmount: (m) => parseFloat(m[1]?.replace(/,/g, "") ?? "0"),
    extractMerchant: (m) => m[2]?.trim() ?? "غير معروف",
  },
  {
    bankName: "بنك الجزيرة",
    description: "رسائل خصم بطاقة الجزيرة",
    patternCount: 2,
    patterns: [
      /مبلغ\s+([\d,.]+)\s+ريال?\s+(?:من\s+حسابك\s+)?(?:في|لدى|من)\s+(.+?)(?:\s+التاريخ|$)/i,
      /خصم\s+بطاقة\s+([\d,.]+)\s+ريال?\s+(.+?)(?:\s|$)/i,
    ],
    extractAmount: (m) => parseFloat(m[1]?.replace(/,/g, "") ?? "0"),
    extractMerchant: (m) => m[2]?.trim() ?? "غير معروف",
  },
];

export interface ParsedTransaction {
  bankName: string;
  amount: number;
  merchantName: string;
}

export function parseOTPMessage(message: string): ParsedTransaction | null {
  const otpSignals = [
    /رمز\s+التحقق/i,
    /كلمة\s+المرور\s+لمرة\s+واحدة/i,
    /OTP/i,
    /رمز\s+التفعيل/i,
    /verification\s+code/i,
  ];
  if (otpSignals.some((r) => r.test(message))) return null;

  for (const template of BANK_REGEX_TEMPLATES) {
    for (const pattern of template.patterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = template.extractAmount(match);
        const merchantName = template.extractMerchant(match);
        if (amount > 0 && merchantName.length > 0) {
          return { bankName: template.bankName, amount, merchantName };
        }
      }
    }
  }
  return null;
}
