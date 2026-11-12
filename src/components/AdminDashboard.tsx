import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  FileSpreadsheet, 
  Database, 
  Upload, 
  RefreshCw, 
  Edit3, 
  Trash2,
  Settings,
  KeyRound,
  CheckCircle2, 
  Clock, 
  Send, 
  Inbox, 
  AlertCircle,
  FileText,
  UserCheck,
  Building2,
  RotateCcw,
  AlertTriangle,
  Paperclip,
  Download,
  Check
} from 'lucide-react';
import { 
  APPEAL_CATEGORIES, 
  APPEAL_STATUSES, 
  APPLICANT_TYPES, 
  getStatusBadgeConfig 
} from '../utils/constants';
import { AdminAppealModal } from './AdminAppealModal';
import type { Appeal, AppealStats, BranchSettings } from '../types/appeal';
import { safeFetchJson } from '../utils/api';

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onSettingsUpdated: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  token,
  onLogout,
  onSettingsUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'appeals' | 'trash' | 'settings' | 'security'>('appeals');
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [stats, setStats] = useState<AppealStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApplicantType, setSelectedApplicantType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected for edit modal
  const [editingAppeal, setEditingAppeal] = useState<Appeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Settings state
  const [settingsData, setSettingsData] = useState<BranchSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState<string | null>(null);

  // Security (password change) state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // In-app Delete Confirmation Dialog State (never blocked in iframes)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    appealId: string;
    isPermanent: boolean;
    isDeleting: boolean;
  }>({
    isOpen: false,
    appealId: '',
    isPermanent: false,
    isDeleting: false
  });

  // In-app Notification / Toast
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Fetch appeals from backend (respects activeTab view)
  const fetchAppeals = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.append('view', activeTab === 'trash' ? 'trash' : 'active');
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedApplicantType !== 'all') params.append('applicantType', selectedApplicantType);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const data = await safeFetchJson<{
        success: boolean;
        appeals: Appeal[];
        stats: AppealStats;
      }>(`/api/admin/appeals?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAppeals(data.appeals || []);
      setStats(data.stats || null);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Avtorizatsiyadan o‘tilmagan')) {
        onLogout();
        return;
      }
      setErrorMessage(err.message || 'Murojaatlar ro‘yxatini yuklashda xatolik yuz berdi');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const data = await safeFetchJson<BranchSettings>('/api/settings');
      setSettingsData(data);
    } catch (err) {
      console.error('Settings load error:', err);
    }
  };

  useEffect(() => {
    fetchAppeals();
    fetchSettings();
  }, [activeTab, selectedStatus, selectedCategory, selectedApplicantType, startDate, endDate]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedApplicantType('all');
    setStartDate('');
    setEndDate('');
  };

  const handleOpenEdit = (appeal: Appeal) => {
    setEditingAppeal(appeal);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = (updated: Appeal) => {
    setAppeals(prev => prev.map(a => a.id === updated.id ? updated : a));
    fetchAppeals();
  };

  // 1. Request Soft Delete (opens in-app modal)
  const requestSoftDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteDialog({
      isOpen: true,
      appealId: id,
      isPermanent: false,
      isDeleting: false
    });
  };

  // 2. Request Permanent Hard-Delete (opens in-app modal)
  const requestPermanentDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteDialog({
      isOpen: true,
      appealId: id,
      isPermanent: true,
      isDeleting: false
    });
  };

  // 3. Confirm Delete (Executed when user clicks "Ha, o‘chirilsin" in in-app modal)
  const handleConfirmDelete = async () => {
    const { appealId, isPermanent } = deleteDialog;
    if (!appealId) return;

    setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

    try {
      const endpoint = isPermanent
        ? `/api/admin/appeals/${appealId}/permanent`
        : `/api/admin/appeals/${appealId}`;

      await safeFetchJson(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      setDeleteDialog({ isOpen: false, appealId: '', isPermanent: false, isDeleting: false });

      if (editingAppeal?.id === appealId) {
        setIsModalOpen(false);
        setEditingAppeal(null);
      }

      showToast(
        isPermanent
          ? `${appealId} raqamli murojaat va fayllari serverdan butunlay o‘chirildi.`
          : `${appealId} raqamli murojaat "O‘chirilgan murojaatlar" bo‘limiga o‘tkazildi.`,
        'success'
      );

      fetchAppeals();
    } catch (err: any) {
      setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
      showToast(err.message || 'O‘chirishda xatolik yuz berdi', 'error');
    }
  };

  // 4. Restore appeal from trash
  const handleRestoreAppeal = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await safeFetchJson(`/api/admin/appeals/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast(`${id} raqamli murojaat muvaffaqiyatli qayta tiklandi va asosiy ro‘yxatga qaytarildi.`, 'success');
      fetchAppeals();
    } catch (err: any) {
      showToast(err.message || 'Qayta tiklashda xatolik yuz berdi', 'error');
    }
  };

  // Quick 3-Stage Confirmation by Admin
  const handleQuickStatusChange = async (id: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const comment = newStatus === 'Qabul qilindi' 
        ? 'Administrator tomonidan qabul qilindi va ijroga tasdiqlandi'
        : 'Administrator tomonidan ijro to‘liq yakunlandi va tasdiqlandi';

      await safeFetchJson(`/api/admin/appeals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          comment
        })
      });

      showToast(`${id} holati "${newStatus}" ga o‘zgartirildi`, 'success');
      fetchAppeals();
    } catch (err: any) {
      showToast(err.message || 'Holatni yangilashda xatolik yuz berdi', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsData) return;
    setIsSavingSettings(true);
    setSettingsSuccessMsg(null);

    try {
      await safeFetchJson('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settingsData)
      });
      setSettingsSuccessMsg('Filial aloqa ma’lumotlari muvaffaqiyatli saqlandi!');
      onSettingsUpdated();
      setTimeout(() => setSettingsSuccessMsg(null), 3000);
    } catch (err: any) {
      showToast(err.message || 'Saqlashda xatolik', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: 'Yangi parollar bir-biriga mos kelmadi', isError: true });
      return;
    }

    setIsChangingPassword(true);

    try {
      await safeFetchJson('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      setPasswordMsg({ text: 'Parol muvaffaqiyatli yangilandi!', isError: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Xatolik yuz berdi', isError: true });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Export Excel
  const handleExportExcel = async () => {
    try {
      const response = await fetch('/api/admin/export/excel', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Excel fayl yaratilmadi');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TKTI_Yangiyer_Murojaatlar_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Excel hisoboti muvaffaqiyatli yuklab olindi!', 'success');
    } catch (err: any) {
      showToast('Excel yuklab olishda xatolik: ' + err.message, 'error');
    }
  };

  // Backup DB
  const handleDownloadBackup = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Zaxira yuklab olinmadi');
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TKTI_Murojaatlar_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Ma’lumotlar bazasi zaxira nusxasi yuklandi!', 'success');
    } catch (err: any) {
      showToast('Zaxira olishda xatolik: ' + err.message, 'error');
    }
  };

  return (
    <div className="py-8 bg-slate-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                Admin Panel
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                TKTI Yangiyer filiali ma’muriyati
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f3b75] mt-1">
              Murojaatlarni boshqarish markazi
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel (.xlsx) yuklash</span>
            </button>

            <button
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-slate-600" />
              <span>Zaxira (JSON)</span>
            </button>

            <button
              onClick={fetchAppeals}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title="Yangilash"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Real Metrics Cards (matching 3 stages) */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div 
              onClick={() => setSelectedStatus('all')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedStatus === 'all' ? 'ring-2 ring-[#0f3b75] bg-white' : 'bg-white hover:bg-slate-50'} border-slate-200 shadow-xs`}
            >
              <div className="text-xs font-bold text-slate-500 uppercase">Jami murojaatlar</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
            </div>

            <div 
              onClick={() => setSelectedStatus('Yangi')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedStatus === 'Yangi' ? 'ring-2 ring-blue-600 bg-blue-50' : 'bg-white hover:bg-blue-50/40'} border-blue-200 shadow-xs`}
            >
              <div className="text-xs font-bold text-blue-700 uppercase">1. Yangi murojaatlar</div>
              <div className="text-2xl font-extrabold text-blue-700 mt-1">{stats.new}</div>
            </div>

            <div 
              onClick={() => setSelectedStatus('Qabul qilindi')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedStatus === 'Qabul qilindi' ? 'ring-2 ring-indigo-600 bg-indigo-50' : 'bg-white hover:bg-indigo-50/40'} border-indigo-200 shadow-xs`}
            >
              <div className="text-xs font-bold text-indigo-700 uppercase">2. Qabul qilindi</div>
              <div className="text-2xl font-extrabold text-indigo-700 mt-1">{stats.accepted ?? stats.underReview ?? 0}</div>
            </div>

            <div 
              onClick={() => setSelectedStatus('Yakunlandi')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedStatus === 'Yakunlandi' ? 'ring-2 ring-emerald-600 bg-emerald-50' : 'bg-white hover:bg-emerald-50/40'} border-emerald-200 shadow-xs`}
            >
              <div className="text-xs font-bold text-emerald-700 uppercase">3. Yakunlangan</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.completed}</div>
            </div>
          </div>
        )}

        {/* Tab Navigation in Admin: Murojaatlar | Filial Aloqa Sozlamalari | Xavfsizlik */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => { setActiveTab('appeals'); handleResetFilters(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'appeals'
                ? 'bg-[#0f3b75] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Murojaatlar ro‘yxati {stats ? `(${stats.total})` : ''}</span>
          </button>

          <button
            onClick={() => { setActiveTab('trash'); handleResetFilters(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'trash'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>O‘chirilgan murojaatlar</span>
            {stats?.trashCount !== undefined && stats.trashCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                activeTab === 'trash' ? 'bg-white text-rose-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {stats.trashCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-[#0f3b75] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Aloqa va manzil sozlamalari</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-[#0f3b75] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Parolni o‘zgartirish</span>
          </button>
        </div>

        {/* TAB 1: APPEALS */}
        {activeTab === 'appeals' && (
          <div className="space-y-4">
            {/* Filter toolbar */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
                <div className="lg:col-span-4 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ID, F.I.Sh., telefon yoki matn orqali..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
                  />
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
                  >
                    <option value="all">Barcha holatlar</option>
                    {APPEAL_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
                  >
                    <option value="all">Barcha yo‘nalishlar</option>
                    {APPEAL_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <select
                    value={selectedApplicantType}
                    onChange={(e) => setSelectedApplicantType(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f3b75]"
                  >
                    <option value="all">Barcha toifalar</option>
                    {APPLICANT_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-center gap-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-1/2 px-1.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-700"
                    title="Boshlanish sanasi"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-1/2 px-1.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-700"
                    title="Tugash sanasi"
                  />
                </div>
              </div>

              {(searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedApplicantType !== 'all' || startDate || endDate) && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Filtr natijalari ko‘rsatilmoqda</span>
                  <button
                    onClick={handleResetFilters}
                    className="text-rose-600 font-semibold hover:underline cursor-pointer"
                  >
                    Filtrlarni tozalash
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              {isLoading ? (
                <div className="p-10 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-[#0f3b75] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <span className="text-xs">Yuklanmoqda...</span>
                </div>
              ) : appeals.length === 0 ? (
                <div className="p-10 text-center text-slate-500 space-y-1.5">
                  <AlertCircle className="w-7 h-7 text-slate-300 mx-auto" />
                  <div className="font-semibold text-slate-700 text-sm">Murojaat mavjud emas</div>
                  <p className="text-xs text-slate-400">
                    Hozircha hech qanday murojaat kiritilmagan yoki qidiruvga mos kelmadi.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px]">
                      <tr>
                        <th className="py-3 px-4">ID va Sana</th>
                        <th className="py-3 px-4">Murojaatchi</th>
                        <th className="py-3 px-4">Yo‘nalish</th>
                        <th className="py-3 px-4">Mavzu</th>
                        <th className="py-3 px-4">Holati</th>
                        <th className="py-3 px-4">Mas’ul</th>
                        <th className="py-3 px-4 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {appeals.map((appeal) => {
                        const badge = getStatusBadgeConfig(appeal.status);
                        return (
                          <tr
                            key={appeal.id}
                            onClick={() => handleOpenEdit(appeal)}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-mono font-bold text-[#0f3b75]">
                                {appeal.id}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {new Date(appeal.createdAt).toLocaleDateString('uz-UZ')}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">
                                {appeal.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {appeal.applicantType} • {appeal.phone}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-800">
                              {appeal.category}
                            </td>

                            <td className="py-3 px-4 max-w-xs">
                              <div className="truncate font-medium text-slate-900" title={appeal.subject}>
                                {appeal.subject}
                              </div>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                <span>{appeal.status}</span>
                              </span>
                            </td>

                            <td className="py-3 px-4 text-slate-600">
                              <span className="text-[11px] block font-medium text-slate-800">
                                {appeal.assignedOfficer || appeal.assignedDepartment || 'Biriktirilmagan'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {/* Quick 3-stage admin confirmation button */}
                                {appeal.status === 'Yangi' && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleQuickStatusChange(appeal.id, 'Qabul qilindi', e)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                                    title="Qabul qilindi deb tasdiqlash"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Qabul qilish</span>
                                  </button>
                                )}
                                {appeal.status === 'Qabul qilindi' && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleQuickStatusChange(appeal.id, 'Yakunlandi', e)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                                    title="Yakunlandi deb tasdiqlash"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Yakunlash</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(appeal)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0f3b75] hover:bg-[#154685] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Ochish</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => requestSoftDelete(appeal.id, e)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="O‘chirish (Chiqindi qutisiga o‘tkazish)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: TRASH (O'chirilgan murojaatlar) */}
        {activeTab === 'trash' && (
          <div className="space-y-4">
            {/* Warning / Informational Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="font-bold block text-sm text-amber-950 mb-0.5">
                  O‘chirilgan murojaatlar bo‘limi (Chiqindi qutisi)
                </strong>
                Ushbu bo‘limda vaqtincha o‘chirilgan murojaatlar saqlanadi. Ular asosiy ro‘yxat va umumiy ko‘rsatkichlardan chiqarilgan. Kerak bo‘lganda murojaatni asl holatida va biriktirilgan hujjatlari bilan <strong>"Qayta tiklash"</strong> orqali asosiy ro‘yxatga qaytarishingiz yoki zarur bo‘lsa serverdan <strong>"Butunlay o‘chirish"</strong> mumkin.
              </div>
            </div>

            {/* Trash Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-[#0f3b75] text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Chiqindi qutisidagi murojaatlar ({appeals.length})</span>
                </h3>
              </div>

              {appeals.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  <Trash2 className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
                  <span className="font-medium text-slate-500">Hozirda o‘chirilgan murojaatlar mavjud emas</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Murojaat ID</th>
                        <th className="py-3 px-4">Murojaatchi</th>
                        <th className="py-3 px-4">Yo‘nalish</th>
                        <th className="py-3 px-4">Mavzu</th>
                        <th className="py-3 px-4">Oldingi holati</th>
                        <th className="py-3 px-4">O‘chirilgan vaqt</th>
                        <th className="py-3 px-4 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {appeals.map((appeal) => {
                        const badge = getStatusBadgeConfig(appeal.previousStatus || appeal.status);
                        return (
                          <tr
                            key={appeal.id}
                            className="hover:bg-slate-50/80 transition-colors"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-mono font-bold text-slate-700">
                                {appeal.id}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                Yuborilgan: {new Date(appeal.createdAt).toLocaleDateString('uz-UZ')}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-900">
                                {appeal.fullName}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {appeal.applicantType} • {appeal.phone}
                              </div>
                            </td>

                            <td className="py-3 px-4 text-slate-800">
                              {appeal.category}
                            </td>

                            <td className="py-3 px-4 max-w-xs">
                              <div className="truncate font-medium text-slate-900" title={appeal.subject}>
                                {appeal.subject}
                              </div>
                              {((appeal.attachments && appeal.attachments.length > 0) || appeal.attachment) && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-0.5">
                                  <Paperclip className="w-3 h-3" />
                                  Hujjat mavjud
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                                <span>{appeal.previousStatus || appeal.status}</span>
                              </span>
                            </td>

                            <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                              {appeal.deletedAt
                                ? new Date(appeal.deletedAt).toLocaleString('uz-UZ')
                                : 'Sana yo‘q'}
                            </td>

                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(appeal)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                                  title="Ko‘rish"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Ko‘rish</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleRestoreAppeal(appeal.id, e)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                                  title="Asosiy ro‘yxatga qayta tiklash"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Qayta tiklash</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => requestPermanentDelete(appeal.id, e)}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                                  title="Butunlay o‘chirish"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Butunlay o‘chirish</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS (Editable Branch Info) */}
        {activeTab === 'settings' && settingsData && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0f3b75] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <span>Filial aloqa va manzil ma’lumotlarini tahrirlash</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ushbu ma’lumotlar "Aloqa" sahifasida va tizim bo‘ylab avtomatik aks ettiriladi.
              </p>
            </div>

            {settingsSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{settingsSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Filial manzili
                  </label>
                  <input
                    type="text"
                    value={settingsData.address}
                    onChange={(e) => setSettingsData({ ...settingsData, address: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Mo‘ljal
                  </label>
                  <input
                    type="text"
                    value={settingsData.landmark}
                    onChange={(e) => setSettingsData({ ...settingsData, landmark: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ishonch telefoni (Asosiy)
                  </label>
                  <input
                    type="text"
                    value={settingsData.phonePrimary}
                    onChange={(e) => setSettingsData({ ...settingsData, phonePrimary: e.target.value, hotline: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Devonxona / Qabulxona telefoni
                  </label>
                  <input
                    type="text"
                    value={settingsData.phoneSecondary}
                    onChange={(e) => setSettingsData({ ...settingsData, phoneSecondary: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Elektron pochta
                  </label>
                  <input
                    type="email"
                    value={settingsData.email}
                    onChange={(e) => setSettingsData({ ...settingsData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Telegram rasmiy manzil
                  </label>
                  <input
                    type="text"
                    value={settingsData.telegram}
                    onChange={(e) => setSettingsData({ ...settingsData, telegram: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ish kunlari
                  </label>
                  <input
                    type="text"
                    value={settingsData.workDays}
                    onChange={(e) => setSettingsData({ ...settingsData, workDays: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ish vaqti va tushlik
                  </label>
                  <input
                    type="text"
                    value={settingsData.workHours}
                    onChange={(e) => setSettingsData({ ...settingsData, workHours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isSavingSettings ? 'Saqlanmoqda...' : 'Sozlamalarni saqlash'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: SECURITY (Change Password) */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 max-w-lg space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0f3b75] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <span>Administrator parolini o‘zgartirish</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tizim xavfsizligi uchun parolingizni muntazam yangilab turing.
              </p>
            </div>

            {passwordMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${passwordMsg.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {passwordMsg.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Joriy parol
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Amaldagi parolni kiriting"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Yangi parol (kamida 6 ta belgi)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Yangi kuchli parol"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Yangi parolni takrorlang
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Yangi parolni qayta kiriting"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 bg-[#0f3b75] hover:bg-[#164685] text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isChangingPassword ? 'O‘zgartirilmoqda...' : 'Parolni yangilash'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <AdminAppealModal
        appeal={editingAppeal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdateSuccess={handleUpdateSuccess}
        onDeleteAppeal={requestSoftDelete}
        token={token}
      />

      {/* IN-APP DELETE CONFIRMATION MODAL (100% reliable in iframes) */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {deleteDialog.isPermanent
                    ? 'Butunlay o‘chirishni tasdiqlaysizmi?'
                    : 'Murojaatni o‘chirishni tasdiqlaysizmi?'}
                </h3>
                <span className="font-mono text-xs font-bold text-[#0f3b75]">
                  ID: {deleteDialog.appealId}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {deleteDialog.isPermanent ? (
                <span className="text-rose-700 font-medium">
                  OGOHLANTIRISH: Ushbu murojaat va unga biriktirilgan barcha fayllar serverdan butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.
                </span>
              ) : (
                <span>
                  Ushbu murojaat asosiy ro‘yxatdan olib tashlanadi va <strong>"O‘chirilgan murojaatlar"</strong> (Chiqindi qutisi) bo‘limiga o‘tkaziladi. Uni istalgan vaqtda qayta tiklashingiz mumkin.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleteDialog.isDeleting}
                onClick={() => setDeleteDialog({ isOpen: false, appealId: '', isPermanent: false, isDeleting: false })}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                disabled={deleteDialog.isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer disabled:opacity-75"
              >
                {deleteDialog.isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>O‘chirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Ha, o‘chirilsin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border animate-in slide-in-from-bottom-5 duration-200 bg-slate-900 text-white border-slate-800">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
};
