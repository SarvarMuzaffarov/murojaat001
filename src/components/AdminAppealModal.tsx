import React, { useState } from 'react';
import { 
  X, 
  Paperclip, 
  Download, 
  Building2, 
  AlertCircle, 
  Save, 
  History, 
  Check, 
  Trash2,
  FileCheck,
  Send,
  Inbox
} from 'lucide-react';
import { 
  APPEAL_STATUSES, 
  BRANCH_DEPARTMENTS, 
  getStatusBadgeConfig 
} from '../utils/constants';
import type { Appeal, AppealStatus, AppealAttachment } from '../types/appeal';
import { updateAppealUnified } from '../utils/storage';

interface AdminAppealModalProps {
  appeal: Appeal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: (updated: Appeal) => void;
  onDeleteAppeal?: (appealId: string) => void;
  token: string;
}

export const AdminAppealModal: React.FC<AdminAppealModalProps> = ({
  appeal,
  isOpen,
  onClose,
  onUpdateSuccess,
  onDeleteAppeal,
  token
}) => {
  if (!isOpen || !appeal) return null;

  const [status, setStatus] = useState<AppealStatus>(appeal.status);
  const [assignedDepartment, setAssignedDepartment] = useState(appeal.assignedDepartment || '');
  const [assignedOfficer, setAssignedOfficer] = useState(appeal.assignedOfficer || '');
  const [deadline, setDeadline] = useState(appeal.deadline || '');
  const [officialResponse, setOfficialResponse] = useState(appeal.officialResponse || '');
  const [responseAttachment, setResponseAttachment] = useState<AppealAttachment | null>(appeal.responseAttachment || null);
  const [internalNotes, setInternalNotes] = useState(appeal.internalNotes || '');
  const [actionComment, setActionComment] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResponseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setResponseAttachment({
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const updated = await updateAppealUnified(appeal.id, {
        status,
        assignedDepartment,
        assignedOfficer,
        deadline,
        officialResponse,
        responseAttachment,
        internalNotes
      }, token);

      setSaveSuccess(true);
      onUpdateSuccess(updated);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const currentBadge = getStatusBadgeConfig(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f3b75] to-[#1a4b87] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-extrabold bg-white/10 px-3 py-1 rounded-lg border border-white/20">
              {appeal.id}
            </span>
            <span className="text-xs text-slate-200 hidden sm:inline">
              Sana: {new Date(appeal.createdAt).toLocaleString('uz-UZ')}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${currentBadge.bg} ${currentBadge.text} ${currentBadge.border}`}>
              {status}
            </span>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Murojaat ma'lumotlari */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-slate-500 text-xs block">Murojaatchi:</span>
                <strong className="text-slate-900 block">{appeal.fullName}</strong>
                <span className="text-slate-500 text-xs">{appeal.applicantType}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Telefon:</span>
                <a href={`tel:${appeal.phone}`} className="font-bold text-[#0f3b75] hover:underline">
                  {appeal.phone}
                </a>
              </div>
              <div>
                <span className="text-slate-500 text-xs block">Yo‘nalish:</span>
                <strong className="text-slate-900 block">{appeal.category}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-bold block mb-0.5">Mavzu:</span>
              <div className="font-bold text-slate-900 text-sm">{appeal.subject}</div>
            </div>

            <div>
              <span className="text-xs text-slate-500 font-bold block mb-0.5">Murojaat matni:</span>
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {appeal.content}
              </div>
            </div>

            {/* Biriktirilgan fayllar */}
            {((appeal.attachments && appeal.attachments.length > 0) || appeal.attachment) && (
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-xs text-slate-500 font-bold block">
                  Biriktirilgan hujjatlar:
                </span>
                <div className="space-y-2">
                  {(appeal.attachments && appeal.attachments.length > 0
                    ? appeal.attachments
                    : (appeal.attachment ? [appeal.attachment] : [])
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
                          <span className="font-semibold text-slate-900 truncate">
                            {att.name}
                          </span>
                          {att.size > 0 && (
                            <span className="text-slate-500 text-[11px]">
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
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <span>Ko‘rish</span>
                            </a>
                          )}
                          {dlUrl && (
                            <a
                              href={dlUrl}
                              download={att.name}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0f3b75] hover:bg-[#164685] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
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

          {/* Administrator boshqaruv shakli */}
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-sm font-bold text-[#0f3b75] border-b border-slate-200 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>3 bosqichli ijro boshqaruvi va tasdiqlash</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Joriy: <strong className="text-slate-900">{status}</strong>
              </span>
            </h4>

            {/* 3-Bosqichli Tezkor Tasdiqlash Tugmalari */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-3.5">
              <span className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                Admin tomonidan bosqichni tasdiqlash:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('Yangi');
                    setActionComment('Holat "Yangi" sifatida qayta belgilandi');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'Yangi'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>1. Yangi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatus('Qabul qilindi');
                    setActionComment('Administrator tomonidan qabul qilindi va ijroga tasdiqlandi');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'Qabul qilindi'
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>2. Qabul qilindi</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatus('Yakunlandi');
                    setActionComment('Administrator tomonidan ijro to‘liq yakunlandi va tasdiqlandi');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'Yakunlandi'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>3. Yakunlandi</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Murojaat holati <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AppealStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
                >
                  {APPEAL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ijro muddati
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mas’ul bo‘lim
                </label>
                <select
                  value={assignedDepartment}
                  onChange={(e) => setAssignedDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
                >
                  <option value="">-- Bo‘limni tanlang --</option>
                  {BRANCH_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mas’ul ijrochi xodim (F.I.Sh.)
                </label>
                <input
                  type="text"
                  value={assignedOfficer}
                  onChange={(e) => setAssignedOfficer(e.target.value)}
                  placeholder="Masalan: Rustamov A.B."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
                />
              </div>
            </div>

            {/* Rasmiy javob matni */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Murojaatchiga rasmiy javob matni
              </label>
              <textarea
                rows={3}
                value={officialResponse}
                onChange={(e) => setOfficialResponse(e.target.value)}
                placeholder="Murojaat bo‘yicha qabul qilingan qaror yoki rasmiy tushuntirish..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
              ></textarea>
            </div>

            {/* Javob fayli */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Javob fayli (ixtiyoriy)
              </label>
              {responseAttachment ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">{responseAttachment.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResponseAttachment(null)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-3.5 py-2 border border-dashed border-slate-300 hover:border-[#0f3b75] rounded-xl cursor-pointer text-xs font-medium text-slate-600 bg-slate-50 hover:bg-blue-50/40 transition-colors">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span>Javob faylini biriktirish</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.jpg,.png"
                    onChange={handleResponseFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Ichki izoh */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ichki xizmat izohi <span className="text-slate-400 font-normal">(Faqat xodimlar uchun)</span>
              </label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Ichki nazorat yoki xodimlararo izoh..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
              ></textarea>
            </div>

            {/* Amallar tarixi */}
            {appeal.history && appeal.history.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4" />
                  <span>Amallar tarixi</span>
                </h5>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {appeal.history.map((h, i) => (
                    <div key={h.id || i} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">{h.action}</strong>
                        <span className="text-[10px] text-slate-500">
                          {new Date(h.timestamp).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                      {h.comment && <div className="text-slate-600 mt-0.5">{h.comment}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Yopish
                </button>
                {onDeleteAppeal && (
                  <button
                    type="button"
                    onClick={() => onDeleteAppeal(appeal.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                    title="Murojaatni o‘chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>O‘chirish</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                {isSaving ? (
                  <span>Saqlanmoqda...</span>
                ) : saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saqlandi!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Saqlash</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
