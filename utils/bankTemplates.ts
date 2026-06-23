export interface BankTemplate {
  bankName: string;
  patternCount: number;
  description: string;
}

export const BANK_REGEX_TEMPLATES: BankTemplate[] = [
  {
    bankName: "بنك الراجحي",
    patternCount: 4,
    description: "يدعم رسائل الخصم والشراء والسحب باللغتين",
  },
  {
    bankName: "البنك الأهلي السعودي (SNB)",
    patternCount: 4,
    description: "يدعم رسائل الشراء والخصم بالعربية والإنجليزية",
  },
  {
    bankName: "البنك العربي الوطني (ANB)",
    patternCount: 4,
    description: "يدعم رسائل ANB بالعربية والإنجليزية",
  },
  {
    bankName: "بنك الرياض",
    patternCount: 4,
    description: "يدعم رسائل الخصم والشراء وعمليات البطاقة",
  },
];
