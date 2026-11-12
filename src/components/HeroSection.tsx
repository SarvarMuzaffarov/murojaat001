import React from 'react';
import { 
  Send, 
  Search, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';

interface HeroSectionProps {
  onGoToSubmit: () => void;
  onGoToCheck: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGoToSubmit,
  onGoToCheck
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0f3b75] via-[#124285] to-[#0f3b75] text-white">
      {/* Decorative subtle texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20 text-center">
        {/* Branch Title Ribbon */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium mb-6">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
          <span>Toshkent kimyo-texnologiya instituti Yangiyer filiali</span>
        </div>

        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Murojaatlar portali
          </h1>

          <div className="text-emerald-400 text-xl sm:text-2xl font-bold">
            "Murojaatingiz biz uchun muhim!"
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
            Talabalar, professor-o‘qituvchilar, filial xodimlari, ota-onalar va fuqarolarning murojaat, taklif va shikoyatlarini qabul qilish hamda ko‘rib chiqish bo‘yicha rasmiy platforma.
          </p>

          {/* Core Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/10">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Ro‘yxatdan o‘tish talab etilmaydi</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/10">
              <Clock className="w-4 h-4 text-teal-300 shrink-0" />
              <span>Onlayn holat nazorati</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Rasmiy javob kafolati</span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onGoToSubmit}
              className="group w-full sm:w-auto flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm sm:text-base cursor-pointer"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              <span>Murojaat yuborish</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </button>

            <button
              onClick={onGoToCheck}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold px-8 py-3.5 rounded-xl border border-white/25 backdrop-blur-md transition-all text-sm sm:text-base cursor-pointer"
            >
              <Search className="w-4 h-4 text-teal-300" />
              <span>Murojaat holatini tekshirish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
