import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Send, 
  Inbox, 
  Users, 
  PieChart, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import type { AppealStats } from '../types/appeal';

interface StatsSectionProps {
  stats: AppealStats | null;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const total = stats?.total ?? 0;
  const newCount = stats?.new ?? 0;
  const underReview = stats?.underReview ?? 0;
  const answered = stats?.answered ?? 0;
  const completed = stats?.completed ?? 0;

  const categoryEntries = Object.entries(stats?.categoryDistribution || {});
  const applicantEntries = Object.entries(stats?.applicantTypeDistribution || {});
  const monthlyTrends = stats?.monthlyTrends || [];

  const maxCategoryCount = Math.max(...categoryEntries.map(([, count]) => count), 1);

  return (
    <div className="py-10 sm:py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Haqiqiy ma’lumotlar
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b75]">
            Murojaatlar statistikasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Ma’lumotlar bazasida mavjud bo‘lgan barcha murojaatlarning real ko‘rsatkichlari.
          </p>
        </div>

        {/* 5 Real Metrics Cards (As requested by user) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. Jami */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Jami murojaatlar</span>
              <div className="p-1.5 bg-blue-50 text-[#0f3b75] rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Bazadagi umumiy soni</span>
            </div>
          </div>

          {/* 2. Yangi */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Yangi</span>
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">{newCount}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Ro‘yxatga olingan</span>
            </div>
          </div>

          {/* 3. Ko'rib chiqilayotgan */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Ko‘rib chiqilmoqda</span>
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">{underReview}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Mutaxassislar ko‘rigida</span>
            </div>
          </div>

          {/* 4. Javob berilgan / tayyorlangan */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-teal-200 bg-teal-50/20 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Javob tayyorlangan</span>
              <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-700">{answered}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">Javob xati mavjud</span>
            </div>
          </div>

          {/* 5. Yakunlangan */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Yakunlangan</span>
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{completed}</div>
              <span className="text-[11px] text-slate-500 mt-0.5 block">To‘liq hal qilingan</span>
            </div>
          </div>
        </div>

        {/* If no data in database */}
        {total === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <PieChart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Hozircha ma’lumotlar bazasida murojaatlar mavjud emas
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Foydalanuvchilar tomonidan yangi murojaat yuborilishi bilan yo‘nalishlar va toifalar bo‘yicha statistika avtomatik shakllanadi.
            </p>
          </div>
        ) : (
          /* Real Data Distribution */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category breakdown */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-[#0f3b75]" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Yo‘nalishlar bo‘yicha real taqsimot
                  </h3>
                </div>
                <span className="text-xs text-slate-500">{categoryEntries.length} ta yo‘nalish</span>
              </div>

              <div className="space-y-3">
                {categoryEntries.map(([catName, count]) => {
                  const percentage = Math.round((count / total) * 100);
                  const barWidth = Math.round((count / maxCategoryCount) * 100);

                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800">{catName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0f3b75]">{count} ta</span>
                          <span className="text-slate-400">({percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Applicant types and month history */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Murojaatchi toifalari kesimi
                  </h3>
                </div>

                <div className="space-y-2">
                  {applicantEntries.map(([typeName, count]) => {
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={typeName} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                        <span className="font-medium text-slate-800">{typeName}</span>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{count} ta</strong>
                          <span className="text-slate-400">({pct}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Real counts */}
              {monthlyTrends.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      Oylar bo‘yicha tushum dinamikasi
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs">
                    {monthlyTrends.map((m) => (
                      <div key={m.month} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">{m.month}</span>
                        <strong className="text-base font-extrabold text-[#0f3b75] block mt-0.5">
                          {m.count} ta
                        </strong>
                        <span className="text-[10px] text-emerald-600 block mt-0.5">
                          {m.completed} yakunlangan
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
