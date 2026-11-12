import type { AppealCategory, ApplicantType, AppealStatus } from '../types/appeal';

export const APPLICANT_TYPES: ApplicantType[] = [
  'Talaba',
  'Professor-o‘qituvchi',
  'Filial xodimi',
  'Ota-ona',
  'Fuqaro'
];

export const APPEAL_CATEGORIES: { value: AppealCategory; label: string; desc: string; icon: string }[] = [
  {
    value: 'Ta’lim jarayoni',
    label: 'Ta’lim jarayoni',
    desc: 'Darslar jadvali, fanlar, imtihonlar, oraliq nazoratlar va amaliyotlar',
    icon: 'GraduationCap'
  },
  {
    value: 'Kontrakt va moliyaviy masalalar',
    label: 'Kontrakt va moliyaviy masalalar',
    desc: 'To‘lov-shartnoma, stipendiya, bo‘lib to‘lash va imtiyozlar',
    icon: 'CreditCard'
  },
  {
    value: 'Yotoqxona',
    label: 'Yotoqxona',
    desc: 'Talabalar turar joyiga joylashish, shart-sharoitlar va xona ta’minoti',
    icon: 'Home'
  },
  {
    value: 'Ishga joylashish',
    label: 'Ishga joylashish',
    desc: 'Filialdagi bo‘sh ish o‘rinlari, tanlovlar va kadrlar masalalari',
    icon: 'Briefcase'
  },
  {
    value: 'Taklif va tashabbuslar',
    label: 'Taklif va tashabbuslar',
    desc: 'Filial faoliyatini rivojlantirishga oid g‘oyalar va innovatsion takliflar',
    icon: 'Lightbulb'
  },
  {
    value: 'Shikoyat',
    label: 'Shikoyat',
    desc: 'Kamchiliklar, xizmat ko‘rsatish sifati yoki qoidabuzarliklar bo‘yicha',
    icon: 'AlertCircle'
  },
  {
    value: 'Korrupsiyaga oid murojaatlar',
    label: 'Korrupsiyaga oid murojaatlar',
    desc: 'Ta’limdagi shaffoflik, noqonuniy talablar va komplayens nazorat',
    icon: 'ShieldAlert'
  },
  {
    value: 'Boshqa masalalar',
    label: 'Boshqa masalalar',
    desc: 'Boshqa barcha masalalar va so‘rovlar',
    icon: 'HelpCircle'
  }
];

export const APPEAL_STATUSES: AppealStatus[] = [
  'Yangi',
  'Qabul qilindi',
  'Yakunlandi'
];

export const BRANCH_DEPARTMENTS = [
  'Filial direktori qabulxonasi',
  'O‘quv-uslubiy bo‘lim',
  'Yoshlar bilan ishlash, ma’naviyat va ma’rifat bo‘limi',
  'Ilmiy tadqiqotlar, innovatsiyalar va ilmiy-pedagogik kadrlarni tayyorlash bo‘limi',
  'Buxgalteriya va moliya bo‘limi',
  'Talabalar turar joyi (TTJ) ma’muriyati',
  'Korrupsiyaga qarshi kurashish "Komplayens-nazorat" bo‘limi',
  'Kadrlar bo‘limi (Inson resurslari)',
  'Axborot-resurs markazi (Kutubxona)',
  'Axborot texnologiyalari va raqamlashtirish markazi',
  'Xo‘jalik va moddiy-texnik ta’minot bo‘limi'
];

export function getStatusBadgeConfig(status: AppealStatus | string): {
  bg: string;
  text: string;
  border: string;
  iconName: string;
} {
  switch (status) {
    case 'Yangi':
    case 'Yangi yuborildi':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconName: 'Send'
      };
    case 'Qabul qilindi':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        iconName: 'Inbox'
      };
    case 'Ko‘rib chiqilmoqda':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        iconName: 'Clock'
      };
    case 'Mas’ul xodimga yuborildi':
    case 'Mas’ul bo‘limga yuborildi':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconName: 'Share2'
      };
    case 'Javob tayyorlandi':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-200',
        iconName: 'FileCheck'
      };
    case 'Yakunlandi':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconName: 'CheckCircle2'
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        iconName: 'Circle'
      };
  }
}
