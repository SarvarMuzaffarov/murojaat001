import React, { useState } from 'react';
import { 
  Send, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  FileUp, 
  X, 
  Copy, 
  Check, 
  Printer, 
  User, 
  Phone, 
  Mail, 
  BookOpen, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { APPLICANT_TYPES, APPEAL_CATEGORIES } from '../utils/constants';
import type { ApplicantType, AppealCategory, AppealAttachment } from '../types/appeal';
import { safeFetchJson } from '../utils/api';

interface AppealFormSectionProps {
  onCheckAppeal: (appealId: string, phone: string) => void;
  onRefreshStats: () => void;
}

export const AppealFormSection: React.FC<AppealFormSectionProps> = ({
  onCheckAppeal,
  onRefreshStats
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [email, setEmail] = useState('');
  const [applicantType, setApplicantType] = useState<ApplicantType>('Talaba');
  const [category, setCategory] = useState<AppealCategory>('Ta’lim jarayoni');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<AppealAttachment[]>([]);
  const [consent, setConsent] = useState(false);

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedAppealId, setSubmittedAppealId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Phone input formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setPhone(val);
  };

  // Handle file attachment (Supports multiple files up to 5, total max 15MB)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 5) {
      setErrorMessage('Maksimal 5 tagacha hujjat biriktirish mumkin!');
      e.target.value = '';
      return;
    }

    const currentTotalSize = attachments.reduce((acc, a) => acc + (a.size || 0), 0);
    let newIncomingSize = 0;

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(ext)) {
        setErrorMessage(`"${file.name}" fayl formati qo‘llab-quvvatlanmaydi. Faqat PDF, DOC, DOCX, JPG, PNG formatidagi fayllarni yuklashingiz mumkin.`);
        e.target.value = '';
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" fayli 10 MB dan katta. Iltimos, kichikroq hajmdagi fayl tanlang.`);
        e.target.value = '';
        return;
      }

      newIncomingSize += file.size;
    }

    if (currentTotalSize + newIncomingSize > 15 * 1024 * 1024) {
      setErrorMessage('Biriktirilayotgan barcha fayllarning umumiy hajmi 15 MB dan oshmasligi lozim.');
      e.target.value = '';
      return;
    }

    setErrorMessage(null);

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          {
            id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl: reader.result as string
          }
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanFullName = fullName.trim();
    if (!cleanFullName || cleanFullName.length < 3) {
      setErrorMessage('Iltimos, Familiya, Ism va Sharifingizni to‘liq kiriting');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 9) {
      setErrorMessage('Telefon raqamingizni to‘liq kiriting (kamida 9 ta raqam)');
      return;
    }

    const cleanSubject = subject.trim();
    if (!cleanSubject) {
      setErrorMessage('Murojaat mavzusini kiriting');
      return;
    }

    const cleanContent = content.trim();
    if (!cleanContent || cleanContent.length < 10) {
      setErrorMessage('Murojaat matnini batafsilroq bayon eting (kamida 10 ta belgi)');
      return;
    }

    if (!consent) {
      setErrorMessage('Iltimos, shaxsiy ma’lumotlarni qayta ishlashga rozilik bildiring');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await safeFetchJson<{
        success: boolean;
        appealId: string;
        message: string;
        appeal: any;
      }>('/api/appeals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: cleanFullName,
          phone: phone.trim(),
          email: email.trim() || undefined,
          applicantType,
          category,
          subject: cleanSubject,
          content: cleanContent,
          attachments,
          attachment: attachments.length > 0 ? attachments[0] : null
        })
      });

      setSubmittedAppealId(data.appealId);
      onRefreshStats();
    } catch (err: any) {
      setErrorMessage(err.message || 'Murojaat yuborishda xatolik yuz berdi. Qaytadan urinib ko‘ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const resetForm = () => {
    setFullName('');
    setPhone('+998 ');
    setEmail('');
    setApplicantType('Talaba');
    setCategory('Ta’lim jarayoni');
    setSubject('');
    setContent('');
    setAttachments([]);
    setConsent(false);
    setSubmittedAppealId(null);
  };

  return (
    <div className="py-8 sm:py-12 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {submittedAppealId ? (
          /* Submission Receipt Screen */
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-7 text-white text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-md mb-3">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Murojaatingiz qabul qilindi!
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
                Toshkent kimyo-texnologiya instituti Yangiyer filiali ma’muriyati arizangizni ro‘yxatga oldi.
              </p>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              <div className="bg-slate-50 border-2 border-dashed border-emerald-500/40 rounded-2xl p-5 text-center space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Murojaat raqamingiz (ID):
                </span>
                <div className="text-3xl font-extrabold text-[#0f3b75] font-mono tracking-wider">
                  {submittedAppealId}
                </div>
                <p className="text-xs text-slate-500">
                  Ushbu raqam va telefon raqamingiz orqali murojaat holati va rasmiy javobni kuzatib borasiz.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => copyToClipboard(submittedAppealId)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Nusxalandi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Raqamdan nusxa olish</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 shadow-xs transition-colors no-print cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-slate-600" />
                    <span>Kvitansiyani chop etish</span>
                  </button>
                </div>
              </div>

              {/* Summary Details */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Murojaatchi:</span>{' '}
                    <strong className="text-slate-900">{fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Telefon:</span>{' '}
                    <strong className="text-slate-900">{phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Toifasi:</span>{' '}
                    <strong className="text-slate-900">{applicantType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Yo‘nalishi:</span>{' '}
                    <strong className="text-slate-900">{category}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Mavzu:</span>{' '}
                    <strong className="text-slate-900">{subject}</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => onCheckAppeal(submittedAppealId, phone)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0f3b75] hover:bg-[#154685] text-white font-bold rounded-xl shadow-md transition-colors text-xs sm:text-sm cursor-pointer"
                >
                  <span>Holatini hoziroq tekshirish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={resetForm}
                  className="inline-flex items-center justify-center px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-xs sm:text-sm cursor-pointer"
                >
                  Yangi murojaat yuborish
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Main Submission Form */
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-6 sm:px-8 bg-gradient-to-r from-[#0f3b75] to-[#1e4e8c] text-white">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-emerald-400">
                Onlayn qabul
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Murojaat yuborish
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1">
                Ma’lumotlarni to‘ldiring. Ro‘yxatdan o‘tish talab etilmaydi.
              </p>
            </div>

            {errorMessage && (
              <div className="mx-6 mt-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Xatolik:</strong> {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              {/* F.I.Sh. */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Familiya, Ism, Sharifingiz <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masalan: Abdullayev Otabek Rustamovich"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f3b75] text-sm text-slate-900 bg-white"
                />
              </div>

              {/* Telefon va Pochta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Telefon raqamingiz <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+998 90 123 45 67"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f3b75] text-sm text-slate-900 bg-white"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Holatni tekshirish uchun ushbu raqam ishlatiladi.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Elektron pochta <span className="text-slate-400 font-normal">(ixtiyoriy)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="misol@mail.uz"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f3b75] text-sm text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Toifa va Yo'nalish */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Murojaatchi turi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={applicantType}
                    onChange={(e) => setApplicantType(e.target.value as ApplicantType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f3b75] text-sm text-slate-900 bg-white font-medium"
                  >
                    {APPLICANT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Murojaat yo‘nalishi <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AppealCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f3b75] text-sm text-slate-900 bg-white font-medium"
                  >
                    {APPEAL_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mavzu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Murojaat mavzusi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Qisqa va aniq sarlavha"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f3b75] text-sm text-slate-900 bg-white"
                />
              </div>

              {/* Matn */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Murojaat matni <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-500">{content.length} belgi</span>
                </div>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Murojaatingiz, taklif yoki shikoyatingiz mazmunini batafsil yozing..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0f3b75] text-sm text-slate-900 bg-white leading-relaxed"
                ></textarea>
              </div>

              {/* Fayl biriktirish */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Fayl biriktirish <span className="text-slate-400 font-normal">(ixtiyoriy, PDF, JPG, PNG, DOCX - max 10MB)</span>
                  </label>
                  {attachments.length > 0 && (
                    <span className="text-xs text-emerald-700 font-semibold">{attachments.length}/5 fayl</span>
                  )}
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2 mb-2.5">
                    {attachments.map((att, idx) => (
                      <div
                        key={att.id || idx}
                        className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">
                            {att.name}
                          </span>
                          <span className="text-slate-500">
                            ({(att.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Faylni o‘chirish"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {attachments.length < 5 && (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-[#0f3b75] rounded-xl cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all text-center">
                    <FileUp className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700">
                      {attachments.length > 0 ? '+ Yana fayl qo‘shish' : 'Hujjat yoki rasmni tanlang'}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Bir nechta fayl tanlashingiz mumkin
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Shaxsiy ma'lumotlarni qayta ishlashga rozilik */}
              <div className="pt-1">
                <label className="flex items-start sm:items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="mt-0.5 sm:mt-0 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-slate-700 font-medium">
                    Shaxsiy ma’lumotlarni qayta ishlashga roziman <span className="text-rose-500">*</span>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !consent}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer ${
                    !consent || isSubmitting
                      ? 'bg-slate-400 cursor-not-allowed opacity-80'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Yuborilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Murojaatni yuborish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
