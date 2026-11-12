import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  Building2, 
  Send as TelegramIcon
} from 'lucide-react';
import type { BranchSettings } from '../types/appeal';

interface ContactSectionProps {
  settings: BranchSettings | null;
  onGoToSubmit: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ settings, onGoToSubmit }) => {
  const address = settings?.address || 'Sirdaryo viloyati, Yangiyer shahri, Tinchlik ko‘chasi, 1-uy';
  const landmark = settings?.landmark || 'Yangiyer shahar markazi';
  const phonePrimary = settings?.phonePrimary || '+998 (67) 250-12-34';
  const phoneSecondary = settings?.phoneSecondary || '+998 (67) 250-10-06';
  const hotline = settings?.hotline || '+998 (67) 250-12-34';
  const email = settings?.email || 'info@yangiyer-tkti.uz';
  const telegram = settings?.telegram || '@tkti_yangiyer_filiali';
  const workDays = settings?.workDays || 'Dushanba — Juma';
  const workHours = settings?.workHours || '09:00 — 18:00';
  const lunchTime = settings?.lunchTime || '13:00 — 14:00';
  const receptionList = settings?.receptionList || [];

  return (
    <div className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Aloqa va manzil
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f3b75]">
            Filial aloqa ma’lumotlari
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Savollar, murojaatlar yoki shaxsiy qabul bo‘yicha rasmiy aloqa kanallari.
          </p>
        </div>

        {/* 4 Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Manzil */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0f3b75] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Manzilimiz</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {address}
            </p>
            {landmark && (
              <div className="text-[11px] text-slate-500">
                Mo‘ljal: {landmark}
              </div>
            )}
          </div>

          {/* Telefonlar */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Telefonlar</h3>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Ishonch telefoni:</span>
                <a href={`tel:${phonePrimary.replace(/\s+/g, '')}`} className="font-bold text-emerald-700 hover:underline">
                  {hotline}
                </a>
              </div>
              {phoneSecondary && (
                <div>
                  <span className="text-slate-500 text-[11px] block">Devonxona:</span>
                  <a href={`tel:${phoneSecondary.replace(/\s+/g, '')}`} className="font-medium text-slate-800 hover:underline">
                    {phoneSecondary}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Ish tartibi */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Ish vaqti</h3>
            <div className="space-y-0.5 text-xs text-slate-600">
              <div><strong>{workDays}:</strong> {workHours}</div>
              {lunchTime && <div><strong>Tushlik:</strong> {lunchTime}</div>}
              <div className="text-[11px] text-emerald-700 font-semibold pt-1">
                * Onlayn portal 24/7 ishlaydi
              </div>
            </div>
          </div>

          {/* Elektron aloqa */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Elektron aloqa</h3>
            <div className="space-y-1.5 text-xs">
              {email && (
                <div>
                  <span className="text-slate-500 text-[11px] block">Elektron pochta:</span>
                  <a href={`mailto:${email}`} className="font-medium text-[#0f3b75] hover:underline">
                    {email}
                  </a>
                </div>
              )}
              {telegram && (
                <div>
                  <span className="text-slate-500 text-[11px] block">Telegram kanal:</span>
                  <span className="font-medium text-blue-600">
                    {telegram}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Qabul jadvali */}
        {receptionList.length > 0 && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0f3b75] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Filial rahbariyati tomonidan fuqarolarni qabul qilish jadvali</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-200/60 text-slate-700 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-3 rounded-l-lg">Lavozim</th>
                    <th className="p-3">Bo‘lim / Mas’ul</th>
                    <th className="p-3">Qabul vaqti</th>
                    <th className="p-3 rounded-r-lg">Xona</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {receptionList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-100/50">
                      <td className="p-3 font-semibold text-slate-900">{item.role}</td>
                      <td className="p-3 text-slate-700">{item.person}</td>
                      <td className="p-3 text-emerald-800 font-medium">{item.time}</td>
                      <td className="p-3 text-slate-600">{item.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
