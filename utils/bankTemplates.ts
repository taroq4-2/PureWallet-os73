export interface BankTemplate {
  bankName: string;
  patternCount: number;
  description: string;
}

export const BANK_REGEX_TEMPLATES: BankTemplate[] = [
  {
    bankName: "بنك الراجحي",
    patternCount: 3,
    description: "يدعم رسائل الخصم والشراء والسحب باللغتين",
  },
  {
    bankName: "البنك الأهلي السعودي (SNB)",
    patternCount: 3,
    description: "يدعم رسائل الشراء والخصم بالعربية والإنجليزية",
  },
  {
    bankName: "بنك الرياض",
    patternCount: 2,
    description: "يدعم رسائل الخصم والشراء",
  },
  {
    bankName: "بنك ساب",
    patternCount: 2,
    description: "يدعم رسائل SABB باللغتين",
  },
  {
    bankName: "بنك البلاد",
    patternCount: 2,
    description: "يدعم رسائل Bank Albilad",
  },
];
