import React, { useState, useEffect } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Printer, 
  ChevronRight,
  FileText,
  Paperclip
} from 'lucide-react';
import { getStatusBadgeConfig } from '../utils/constants';
import type { Appeal, AppealStatus } from '../types/appeal';
import { checkAppealUnified } from '../utils/storage';

interface CheckStatusSectionProps {
  initialAppealId?: string;
  initialPhone?: string;
  onGoToSubmit: () => void;
}

export const CheckStatusSection: React.FC<CheckStatusSectionProps> = ({
  initialAppealId = '',
  initialPhone = '',
  onGoToSubmit
}) => {
  const [appealId, setAppealId] = useState(initialAppealId);
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appealData, setAppealData] = useState<Appeal | null>(null);

  useEffect(() => {
    if (initialAppealId && initialPhone) {
      setAppealId(initialAppealId);
      setPhone(initialPhone);
      handleSearchWith(initialAppealId, initialPhone);
    }
  }, [initialAppealId, initialPhone]);

  const handleSearchWith = async (id: string, ph: string) => {
    setErrorMessage(null);

    const cleanId = id.trim().toUpperCase();
    const cleanPh = ph.trim();

    if (!cleanId || !cleanPh) {
      setErrorMessage('Murojaat ID raqami va telefon raqamingizni kiriting');
      return;
    }

    setIsLoading(true);

    try {
      const appeal = await checkAppealUnified(cleanId, cleanPh);
      setAppealData(appeal);
    } catch (err: any) {
      setErrorMessage(err.message || 'Murojaat topilmadi. Murojaat ID raqami va telefon raqami to‘g‘ri kiritilganligini tekshiring.');
      setAppealData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchWith(appealId, phone);
  };

  // 3 Stepper Stages (Yangi, Qabul qilindi, Yakunlandi)
  const stages: { key: AppealStatus; label: string; desc: string }[] = [
    { key: 'Yangi', label: '1. Yangi', desc: 'Murojaat tizimga yuborildi' },
    { key: 'Qabul qilindi', label: '2. Qabul qilindi', desc: 'Admin tomonidan tasdiqlandi' },
    { key: 'Yakunlandi', label: '3. Yakunlandi', desc: 'Ijro to‘liq yakunlandi' }
  ];

  const getStepIndex = (status: AppealStatus | string): number => {
    switch (status) {
      case 'Yangi': return 0;
      case 'Qabul qilindi':
      case 'Ko‘rib chiqilmoqda':
      case 'Mas’ul xodimga yuborildi':
      case 'Mas’ul bo‘limga yuborildi':
      case 'Javob tayyorlandi': return 1;
      case 'Yakunlandi': return 2;
      default: return 0;
    }
  };

  const currentStepIdx = appealData ? getStepIndex(appealData.status) : 0;

  return (
    <div className="py-8 sm:py-12 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f3b75] to-[#174b8c] px-6 py-6 sm:px-8 text-white">
            <h2 className="text-2xl font-extrabold tracking-tight">
              Murojaat holatini tekshirish
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1">
              Murojaat yuborganingizda berilgan ID raqam va telefon raqamingizni kiriting.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 sm:p-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Murojaat ID raqami <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={appealId}
                  onChange={(e) => setAppealId(e.target.value.toUpperCase())}
                  placeholder="Masalan: TKTI-2026-0001"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f3b75] text-sm font-mono uppercase bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telefon raqamingiz <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f3b75] text-sm bg-white text-slate-900"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Begona shaxslar arizangizni ko‘ra olmaydi.
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0f3b75] hover:bg-[#164685] text-white font-bold rounded-xl shadow-md transition-colors text-xs sm:text-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Tekshirilmoqda...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Tekshirish</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Found Appeal Details */}
        {appealData && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden space-y-6">
            <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Murojaat raqami:
                  </span>
                  <span className="text-xl font-mono font-extrabold text-[#0f3b75]">
                    {appealData.id}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Sana: {new Date(appealData.createdAt).toLocaleString('uz-UZ')}
                </div>
              </div>

              <div>
                {(() => {
                  const cfg = getStatusBadgeConfig(appealData.status);
                  return (
                    <span
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                      <span>{appealData.status}</span>
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* 3-Stage Stepper */}
            <div className="px-6 py-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ijro bosqichlari (3 bosqichli monitoring)
                </h4>
                <span className="text-xs font-semibold text-[#0f3b75]">
                  Joriy holat: <span className="font-bold">{appealData.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {stages.map((st, idx) => {
                  const isDone = idx < currentStepIdx || (idx === currentStepIdx && appealData.status === 'Yakunlandi');
                  const isCurrent = idx === currentStepIdx && appealData.status !== 'Yakunlandi';

                  return (
                    <div
                      key={st.key}
                      className={`p-3.5 rounded-xl border text-xs transition-all relative ${
                        isDone
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                          : isCurrent
                          ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 text-[#0f3b75] shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          isDone
                            ? 'bg-emerald-200/60 text-emerald-800'
                            : isCurrent
                            ? 'bg-blue-200/60 text-blue-900'
                            : 'bg-slate-200/60 text-slate-500'
                        }`}>
                          {isDone ? '✓ Bajarildi' : isCurrent ? '● Jarayonda' : `${idx + 1}-bosqich`}
                        </span>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></div>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 text-sm mb-0.5">
                        {st.label}
                      </div>
                      <div className="text-[11px] text-slate-500 leading-snug">
                        {st.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Official Response if any */}
            {appealData.officialResponse && (
              <div className="mx-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      TKTI Rasmiy Javob
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      Mas’ul: {appealData.assignedOfficer || appealData.assignedDepartment || 'Filial rahbariyati'}
                    </span>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-emerald-100">
                  {appealData.officialResponse}
                </div>

                {appealData.responseAttachment?.dataUrl && (
                  <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-200 rounded-xl text-xs">
                    <span className="font-medium text-slate-800">
                      {appealData.responseAttachment.name}
                    </span>
                    <a
                      href={appealData.responseAttachment.dataUrl}
                      download={appealData.responseAttachment.name}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold"
                    >
                      <Download className="w-3 h-3" />
                      <span>Yuklab olish</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Appeal Text & Info */}
            <div className="px-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Murojaatchi:</span>
                  <strong className="text-slate-900">{appealData.fullName}</strong> ({appealData.applicantType})
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block">Yo‘nalish:</span>
                  <strong className="text-slate-900">{appealData.category}</strong>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm space-y-1">
                <span className="text-xs text-slate-500 font-bold block">Mavzu:</span>
                <div className="font-bold text-slate-900">{appealData.subject}</div>
                <span className="text-xs text-slate-500 font-bold block pt-2">Murojaat matni:</span>
                <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                  {appealData.content}
                </p>

                {/* Biriktirilgan fayllar */}
                {((appealData.attachments && appealData.attachments.length > 0) || appealData.attachment) && (
                  <div className="pt-3 border-t border-slate-200 mt-2 space-y-2">
                    <span className="text-xs text-slate-500 font-bold block">
                      Biriktirilgan hujjatlar:
                    </span>
                    <div className="space-y-2">
                      {(appealData.attachments && appealData.attachments.length > 0
                        ? appealData.attachments
                        : (appealData.attachment ? [appealData.attachment] : [])
                      ).map((att, idx) => {
                        const viewUrl = att.url || att.dataUrl;
                        const dlUrl = att.downloadUrl || att.url || att.dataUrl;
                        return (
                          <div
                            key={att.id || idx}
                            className="flex flex-wrap items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="font-semibold text-slate-800 truncate">
                                {att.name}
                              </span>
                              {att.size > 0 && (
                                <span className="text-slate-400 text-[11px]">
                                  ({(att.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {viewUrl && (
                                <a
                                  href={viewUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                                >
                                  <span>Ko‘rish</span>
                                </a>
                              )}
                              {dlUrl && (
                                <a
                                  href={dlUrl}
                                  download={att.name}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0f3b75] hover:bg-[#1a4b87] text-white font-bold rounded-lg transition-colors"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Yuklab olish</span>
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            {appealData.history && appealData.history.length > 0 && (
              <div className="px-6 pb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Amallar tarixi
                </h4>
                <div className="space-y-2">
                  {appealData.history.map((h, i) => (
                    <div key={h.id || i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">{h.action}</strong>
                        <span className="text-[10px] text-slate-400">
                          {new Date(h.timestamp).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                      {h.comment && <div className="text-slate-600 mt-0.5">{h.comment}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="p-5 bg-slate-50/70 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors no-print cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chop etish</span>
              </button>

              <button
                onClick={onGoToSubmit}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0f3b75] hover:bg-[#154685] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <span>Yangi murojaat yuborish</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
