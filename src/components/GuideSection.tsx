import React, { useState } from 'react';
import { 
  FileText, 
  Hash, 
  Clock, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';

export const GuideSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const steps = [
    {
      num: '01',
      title: 'Ma’lumotlarni to‘ldiring',
      desc: 'F.I.Sh., telefon raqamingiz, toifangiz va murojaat yo‘nalishini tanlab, matnni bayon eting. Zarurat bo‘lsa, asoslovchi fayl biriktiring.',
      icon: FileText,
      color: 'bg-blue-50 text-[#0f3b75] border-blue-200'
    },
    {
      num: '02',
      title: 'Maxsus ID raqam oling',
      desc: 'Yuborish tugmasini bosgach, tizim sizga unikal murojaat raqamini (masalan: TKTI-2026-0001) beradi. Uni saqlab qo‘ying.',
      icon: Hash,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      num: '03',
      title: 'Ijroni onlayn kuzating',
      desc: '"Holatni tekshirish" bo‘limida ID va telefoningizni kiritib, arizangiz qaysi bo‘limda ko‘rib chiqilayotganini bilib boring.',
      icon: Clock,
      color: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      num: '04',
      title: 'Rasmiy javob oling',
      desc: 'Mas’ul bo‘lim tomonidan tayyorlangan va filial rahbariyati tasdiqlagan rasmiy javob xati va ilovalarini to‘g‘ridan-to‘g‘ri yuklab oling.',
      icon: CheckCircle,
      color: 'bg-teal-50 text-teal-800 border-teal-200'
    }
  ];

  const faqs = [
    {
      q: 'Murojaat yuborish uchun ro‘yxatdan o‘tish shartmi?',
      a: 'Yo‘q, ro‘yxatdan o‘tish yoki murakkab parollar yaratish talab etilmaydi. Faqat F.I.Sh. va telefon raqamingizni kiritishingiz kifoya.'
    },
    {
      q: 'Murojaatlar qancha muddatda ko‘rib chiqiladi?',
      a: 'O‘zbekiston Respublikasi "Jismoniy va yuridik shaxslarning murojaatlari to‘g‘risida"gi Qonuniga muvofiq arizalar va shikoyatlar 15 kun ichida, qo‘shimcha o‘rganish yoki tekshirish talab qilinsa 1 oygacha bo‘lgan muddatda ko‘rib chiqiladi.'
    },
    {
      q: 'Mening murojaatimni boshqa shaxslar ko‘ra oladimi?',
      a: 'Yo‘q. Platformada qat’iy shaxsiy daxlsizlik ta’minlangan. Murojaat tafsilotlari faqat uning egasi (ID va telefon raqami mos kelganda) va filialning vakolatli mas’ul xodimlari uchungina ochiq bo‘ladi.'
    },
    {
      q: 'Murojaatga qanday fayllarni biriktirish mumkin?',
      a: 'PDF, Word hujjatlari (.docx, .doc) hamda rasm formatidagi (.jpg, .jpeg, .png) fayllarni biriktirishingiz mumkin. Maksimal ruxsat etilgan hajm — 10 MB.'
    },
    {
      q: 'Korrupsiyaviy holatlar bo‘yicha qanday murojaat qilinadi?',
      a: 'Yo‘nalish sifatida "Korrupsiyaga oid murojaatlar"ni tanlang. Ushbu xabarlar to‘g‘ridan-to‘g‘ri filialning "Komplayens-nazorat" bo‘limi tomonidan alohida maxfiylik asosida tekshiriladi.'
    }
  ];

  return (
    <div className="py-12 sm:py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Oddiy va shaffof jarayon
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b75]">
            Murojaat yuborish bo‘yicha qisqa yo‘riqnoma
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Platformadan foydalanish juda oson va har qanday foydalanuvchi uchun tushunarli.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.num}
                className="relative bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-5 border border-slate-200/80 transition-all hover:shadow-xs group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-extrabold text-slate-400">
                      {st.num}
                    </span>
                    <div className={`p-2 rounded-xl border ${st.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0f3b75] transition-colors mb-1.5">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto pt-2 space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#0f3b75] flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>Ko‘p beriladigan savollar</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-4 py-3.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-800">
                    {faq.q}
                  </span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#0f3b75] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
