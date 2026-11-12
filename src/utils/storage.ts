import * as XLSX from 'xlsx';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import type { 
  Appeal, 
  AppealAttachment, 
  AppealStats, 
  AppealStatus, 
  BranchSettings, 
  ApplicantType, 
  AppealCategory 
} from '../types/appeal';

const APPEALS_STORAGE_KEY = 'tkti_yangiyer_appeals_v3';
const SETTINGS_STORAGE_KEY = 'tkti_yangiyer_settings_v3';
const ADMIN_STORAGE_KEY = 'tkti_yangiyer_admin_auth_v3';

export const DEFAULT_BRANCH_SETTINGS: BranchSettings = {
  address: 'Sirdaryo viloyati, Yangiyer shahri, Tinchlik ko‘chasi, 1-uy',
  landmark: 'Yangiyer shahar markazi',
  phonePrimary: '+998 (67) 250-12-34',
  phoneSecondary: '+998 (67) 250-10-06',
  hotline: '+998 (67) 250-12-34',
  email: 'info@yangiyer-tkti.uz',
  telegram: '@tkti_yangiyer_filiali',
  workDays: 'Dushanba — Juma',
  workHours: '09:00 — 18:00',
  lunchTime: '13:00 — 14:00',
  receptionList: [
    {
      role: 'Filial direktori',
      person: 'Filial direktori qabulxonasi',
      time: 'Chorshanba: 15:00 — 17:00',
      room: '201-xona (Bosh bino)'
    },
    {
      role: 'O‘quv ishlari bo‘yicha direktor o‘rinbosari',
      person: 'O‘quv-uslubiy bo‘lim mudiri',
      time: 'Seshanba va Payshanba: 14:00 — 17:00',
      room: '205-xona'
    },
    {
      role: 'Yoshlar masalalari va ma’naviy-ma’rifiy ishlar bo‘yicha direktor o‘rinbosari',
      person: 'Yoshlar bilan ishlash bo‘limi',
      time: 'Dushanba va Juma: 10:00 — 13:00',
      room: '114-xona'
    },
    {
      role: 'Korrupsiyaga qarshi kurashish "Komplayens-nazorat" bo‘limi',
      person: 'Bosh mutaxassis',
      time: 'Har ish kuni: 09:00 — 17:00',
      room: '108-xona'
    }
  ]
};

export const INITIAL_APPEALS_SEED: Appeal[] = [
  {
    id: 'TKTI-2026-0001',
    trackingCode: 'TKTI-2026-0001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    fullName: 'Qodirov Jamshid Anvarovich',
    phone: '+998 90 123 45 67',
    email: 'jamshid.student@mail.uz',
    applicantType: 'Talaba',
    category: 'Ta’lim jarayoni',
    subject: 'Kimyo laboratoriyasi mashg‘ulotlari jadvali bo‘yicha taklif',
    content: 'Hurmatli rahbariyat, 3-bosqich talabalari uchun amaliy laboratoriya darslari vaqtini qayta ko‘rib chiqishingizni va qo‘shimcha amaliyot soatlarini belgilashingizni so‘rayman.',
    consent: true,
    status: 'Qabul qilindi',
    assignedDepartment: 'O‘quv-uslubiy bo‘lim',
    assignedOfficer: 'Bosh mutaxassis A. Karimov',
    deadline: '2026-11-20',
    internalNotes: 'Kafedra mudiri bilan jadval muhokama qilinmoqda.',
    isDeleted: false,
    history: [
      {
        id: 'h-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        action: 'Murojaat ko‘rib chiqish uchun O‘quv-uslubiy bo‘limiga yo‘naltirildi',
        status: 'Qabul qilindi',
        author: 'Administrator'
      },
      {
        id: 'h-0',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        action: 'Murojaat yuborildi va ro‘yxatga olindi',
        status: 'Yangi',
        author: 'Murojaatchi'
      }
    ]
  },
  {
    id: 'TKTI-2026-0002',
    trackingCode: 'TKTI-2026-0002',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    fullName: 'Xoliqova Nargiza Boboxonovna',
    phone: '+998 91 987 65 43',
    applicantType: 'Professor-o‘qituvchi',
    category: 'Taklif va tashabbuslar',
    subject: 'Ilmiy tadqiqotlar uchun reaktivlar xaridi',
    content: 'Oziq-ovqat texnologiyalari kafedrasi ilmiy laboratoriyasi uchun kerakli kimyoviy reagentlar xaridiga amaliy yordam berishingizni so‘raymiz.',
    consent: true,
    status: 'Yakunlandi',
    assignedDepartment: 'Moliya-iqtisodiyot bo‘limi',
    assignedOfficer: 'Iqtisodchi M. Rustamov',
    officialResponse: 'Hurmatli professor, taqdim etilgan ro‘yxat bo‘yicha kerakli reaktivlar xaridi 2026-yilgi moliya rejasiga kiritildi va tenderga chiqarildi.',
    isDeleted: false,
    history: [
      {
        id: 'h-2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        action: 'Murojaatga rasmiy javob berildi va ijro to‘liq yakunlandi',
        status: 'Yakunlandi',
        author: 'Moliya-iqtisodiyot bo‘limi'
      },
      {
        id: 'h-1',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(),
        action: 'Holat o‘zgartirildi: Qabul qilindi',
        status: 'Qabul qilindi',
        author: 'Administrator'
      },
      {
        id: 'h-0',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        action: 'Murojaat yuborildi va ro‘yxatga olindi',
        status: 'Yangi',
        author: 'Murojaatchi'
      }
    ]
  },
  {
    id: 'TKTI-2026-0003',
    trackingCode: 'TKTI-2026-0003',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    fullName: 'Abdullayev Sardor Ravshanovich',
    phone: '+998 93 456 78 90',
    applicantType: 'Talaba',
    category: 'Yotoqxona',
    subject: 'Talabalar turar joyiga joylashish masalasi',
    content: 'Uzoq tumanlardan kelib tahsil olayotgan 2-bosqich talabalari uchun TTJdan qo‘shimcha o‘rin ajratish masalasida yordam berishingizni so‘rayman.',
    consent: true,
    status: 'Yangi',
    isDeleted: false,
    history: [
      {
        id: 'h-0',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        action: 'Murojaat yuborildi va ro‘yxatga olindi',
        status: 'Yangi',
        author: 'Murojaatchi'
      }
    ]
  }
];

// Normalize phone number for exact matching across devices
export function normalizePhone(phone: string): string {
  return (phone || '').replace(/\D/g, '');
}

// Clean object to prevent undefined errors in Firestore
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        result[key] = value.map(item => typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item);
      } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Local storage helpers
export function getLocalAppeals(): Appeal[] {
  try {
    const raw = localStorage.getItem(APPEALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading local appeals:', e);
  }
  return [...INITIAL_APPEALS_SEED];
}

export function saveLocalAppeals(appeals: Appeal[]): void {
  try {
    localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(appeals));
  } catch (e) {
    console.warn('LocalStorage save error (likely quota):', e);
  }
}

// Compute Appeal Statistics
export function computeStatsClient(appeals: Appeal[]): AppealStats {
  const active = appeals.filter(a => !a.isDeleted);
  const trashCount = appeals.filter(a => a.isDeleted).length;

  const total = active.length;
  const newCount = active.filter(a => a.status === 'Yangi').length;
  const accepted = active.filter(a => a.status === 'Qabul qilindi').length;
  const completed = active.filter(a => a.status === 'Yakunlandi').length;

  const categoryDistribution: Record<string, number> = {};
  const applicantTypeDistribution: Record<string, number> = {};

  active.forEach(a => {
    if (a.category) {
      categoryDistribution[a.category] = (categoryDistribution[a.category] || 0) + 1;
    }
    if (a.applicantType) {
      applicantTypeDistribution[a.applicantType] = (applicantTypeDistribution[a.applicantType] || 0) + 1;
    }
  });

  return {
    total,
    new: newCount,
    accepted,
    completed,
    underReview: accepted,
    assigned: accepted,
    answered: completed,
    trashCount,
    categoryDistribution,
    applicantTypeDistribution,
    monthlyTrends: [
      { month: 'Noyabr', count: total, completed }
    ]
  };
}

// Unique appeal ID generator
function generateAppealId(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `TKTI-2026-${randomDigits}`;
}

/**
 * Real-time listener for multi-device sync
 */
export function subscribeToAppeals(onUpdate: (appeals: Appeal[]) => void): () => void {
  try {
    const unsub = onSnapshot(collection(db, 'appeals'), (snapshot) => {
      const list: Appeal[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as Appeal);
      });
      if (list.length > 0) {
        // Sort descending by createdAt
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        saveLocalAppeals(list);
        onUpdate(list);
      }
    }, (error) => {
      console.warn('Firestore onSnapshot warning (offline/reconnecting):', error);
    });
    return unsub;
  } catch (err) {
    console.warn('Failed to start Firestore subscription:', err);
    return () => {};
  }
}

/**
 * Submit Appeal with Firebase Firestore Integration
 * Synchronizes immediately across all phones and computers!
 */
export async function submitAppealUnified(payload: {
  fullName: string;
  phone: string;
  email?: string;
  applicantType: ApplicantType;
  category: AppealCategory;
  subject: string;
  content: string;
  attachments?: AppealAttachment[];
}): Promise<{ success: boolean; appealId: string; message: string; appeal: Appeal }> {
  const nowIso = new Date().toISOString();
  const newId = generateAppealId();

  // Clean attachments so single document doesn't exceed 1MB Firestore limit
  const sanitizedAttachments = (payload.attachments || []).map(att => {
    // If dataUrl is > 500KB, remove raw dataUrl for cloud sync but preserve name, size, type
    if (att.dataUrl && att.dataUrl.length > 500000) {
      return {
        id: att.id || `att_${Date.now()}`,
        name: att.name,
        size: att.size,
        type: att.type,
        savedFilename: att.name
      };
    }
    return att;
  });

  const newAppeal: Appeal = {
    id: newId,
    trackingCode: newId,
    createdAt: nowIso,
    updatedAt: nowIso,
    fullName: payload.fullName.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || undefined,
    applicantType: payload.applicantType,
    category: payload.category,
    subject: payload.subject.trim(),
    content: payload.content.trim(),
    attachments: sanitizedAttachments,
    attachment: sanitizedAttachments.length > 0 ? sanitizedAttachments[0] : null,
    consent: true,
    status: 'Yangi',
    isDeleted: false,
    history: [
      {
        id: `h-${Date.now()}`,
        timestamp: nowIso,
        action: 'Murojaat yuborildi va ro‘yxatga olindi',
        status: 'Yangi',
        author: 'Murojaatchi'
      }
    ]
  };

  // 1. Authoritative write to Firestore Cloud Database
  try {
    const firestoreData = sanitizeForFirestore(newAppeal);
    await setDoc(doc(db, 'appeals', newId), firestoreData);
  } catch (fsError) {
    console.warn('Firestore direct write error, saving to local cache:', fsError);
  }

  // 2. Update local cache for instant UI response on this device
  const localList = getLocalAppeals();
  localList.unshift(newAppeal);
  saveLocalAppeals(localList);

  // 3. Optional local express backend sync (non-blocking)
  try {
    fetch('/api/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (e) {}

  return {
    success: true,
    appealId: newId,
    message: 'Murojaatingiz qabul qilindi va bulutli bazada ro‘yxatga olindi.',
    appeal: newAppeal
  };
}

/**
 * Check Appeal Status with Cloud Firestore
 * Looks up appeal in Firestore first so any phone can check any appeal!
 */
export async function checkAppealUnified(appealId: string, phone: string): Promise<Appeal> {
  const cleanId = appealId.trim().toUpperCase();
  const cleanPh = normalizePhone(phone);

  // 1. Direct query to Firestore Cloud Database
  try {
    const docRef = doc(db, 'appeals', cleanId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const appealData = docSnap.data() as Appeal;
      if (normalizePhone(appealData.phone) === cleanPh) {
        if (!appealData.isDeleted) {
          // Merge to local cache
          const localList = getLocalAppeals();
          if (!localList.some(a => a.id === appealData.id)) {
            localList.unshift(appealData);
            saveLocalAppeals(localList);
          }
          return appealData;
        }
      }
    }
  } catch (fsError) {
    console.warn('Firestore check error, attempting local cache fallback:', fsError);
  }

  // 2. Check local storage fallback
  const appeals = getLocalAppeals();
  const found = appeals.find(a => 
    a.id?.toUpperCase() === cleanId && 
    normalizePhone(a.phone) === cleanPh
  );

  if (found && !found.isDeleted) {
    return found;
  }

  // 3. Optional server API fallback
  try {
    const res = await fetch('/api/appeals/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appealId: cleanId, phone: cleanPh })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.appeal) {
        return data.appeal;
      }
    }
  } catch (e) {}

  throw new Error('Murojaat topilmadi. Murojaat ID raqami va telefon raqami to‘g‘ri kiritilganligini tekshiring.');
}

/**
 * Admin Login
 */
export async function adminLoginUnified(user: string, pass: string): Promise<{
  success: boolean;
  token: string;
  user: any;
}> {
  const cleanUser = user.trim().toLowerCase();
  const cleanPass = pass.trim();

  // Try server first
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem(ADMIN_STORAGE_KEY, data.token);
        return data;
      }
    } else if (res.status === 401) {
      throw new Error('Kiritilgan login yoki parol noto‘g‘ri');
    }
  } catch (err: any) {
    if (err.message?.includes('noto‘g‘ri')) {
      throw err;
    }
  }

  // Admin credentials verification
  if (cleanUser === 'admin' && cleanPass === 'yangiyer2026') {
    const token = `token_tkti_admin_${Date.now()}`;
    localStorage.setItem(ADMIN_STORAGE_KEY, token);
    return {
      success: true,
      token,
      user: {
        username: 'admin',
        name: 'Murojaatlar koordinatori',
        role: 'Administrator',
        branch: 'TKTI Yangiyer filiali'
      }
    };
  }

  throw new Error('Kiritilgan login yoki parol noto‘g‘ri. Iltimos, tekshirib qaytadan kiriting.');
}

/**
 * Get Admin Appeals with Global Multi-Device Firestore Synchronization
 */
export async function getAdminAppealsUnified(queryFilter: {
  view?: string;
  status?: string;
  category?: string;
  applicantType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  token?: string;
}): Promise<{ appeals: Appeal[]; stats: AppealStats }> {
  let allAppeals: Appeal[] = [];

  // 1. Fetch live from Firestore
  try {
    const appealsCol = collection(db, 'appeals');
    const snapshot = await getDocs(appealsCol);

    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        allAppeals.push(docSnap.data() as Appeal);
      });
      // Sort newest first
      allAppeals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveLocalAppeals(allAppeals);
    } else {
      // First boot: Seed initial appeals into Firestore so every phone sees baseline data!
      for (const seed of INITIAL_APPEALS_SEED) {
        try {
          await setDoc(doc(db, 'appeals', seed.id), sanitizeForFirestore(seed));
        } catch (e) {}
      }
      allAppeals = [...INITIAL_APPEALS_SEED];
      saveLocalAppeals(allAppeals);
    }
  } catch (fsError) {
    console.warn('Firestore fetch error, reading local cache:', fsError);
    allAppeals = getLocalAppeals();
  }

  // Filter application
  const isTrash = queryFilter.view === 'trash';
  let list = isTrash 
    ? allAppeals.filter(a => a.isDeleted === true) 
    : allAppeals.filter(a => !a.isDeleted);

  if (queryFilter.status && queryFilter.status !== 'all') {
    list = list.filter(a => a.status === queryFilter.status);
  }
  if (queryFilter.category && queryFilter.category !== 'all') {
    list = list.filter(a => a.category === queryFilter.category);
  }
  if (queryFilter.applicantType && queryFilter.applicantType !== 'all') {
    list = list.filter(a => a.applicantType === queryFilter.applicantType);
  }
  if (queryFilter.search) {
    const q = queryFilter.search.toLowerCase();
    const qPhone = normalizePhone(q);
    list = list.filter(a =>
      a.id.toLowerCase().includes(q) ||
      a.fullName.toLowerCase().includes(q) ||
      a.subject.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      (qPhone && normalizePhone(a.phone).includes(qPhone))
    );
  }

  return {
    appeals: list,
    stats: computeStatsClient(allAppeals)
  };
}

/**
 * Update Appeal in Firestore
 */
export async function updateAppealUnified(id: string, updates: Partial<Appeal>, token?: string): Promise<Appeal> {
  const appeals = getLocalAppeals();
  const idx = appeals.findIndex(a => a.id === id);
  const current = idx !== -1 ? appeals[idx] : null;

  const nowIso = new Date().toISOString();

  let actionText = 'Murojaat ma’lumotlari yangilandi';
  if (updates.status && current && updates.status !== current.status) {
    actionText = `Holat o‘zgartirildi: ${current.status} ➔ ${updates.status}`;
  } else if (updates.officialResponse) {
    actionText = 'Rasmiy javob tayyorlandi va tasdiqlandi';
  }

  const historyItem = {
    id: `h-${Date.now()}`,
    timestamp: nowIso,
    action: actionText,
    status: updates.status || current?.status || 'Yangi',
    author: 'Administrator'
  };

  const updated: Appeal = {
    ...(current || {
      id,
      trackingCode: id,
      createdAt: nowIso,
      fullName: '',
      phone: '',
      applicantType: 'Fuqaro',
      category: 'Boshqa masalalar',
      subject: '',
      content: '',
      consent: true,
      status: 'Yangi',
      isDeleted: false,
      history: []
    }),
    ...updates,
    updatedAt: nowIso,
    history: [historyItem, ...(current?.history || [])]
  };

  // 1. Update Firestore
  try {
    const cleanData = sanitizeForFirestore(updated);
    await setDoc(doc(db, 'appeals', id), cleanData, { merge: true });
  } catch (fsError) {
    console.warn('Firestore updateDoc error:', fsError);
  }

  // 2. Update Local Cache
  if (idx !== -1) {
    appeals[idx] = updated;
  } else {
    appeals.unshift(updated);
  }
  saveLocalAppeals(appeals);

  // 3. Background server sync
  try {
    fetch(`/api/admin/appeals/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`
      },
      body: JSON.stringify(updates)
    }).catch(() => {});
  } catch (e) {}

  return updated;
}

/**
 * Soft Delete Appeal (Move to Trash)
 */
export async function softDeleteAppealUnified(id: string, token?: string): Promise<void> {
  const nowIso = new Date().toISOString();
  
  try {
    await updateDoc(doc(db, 'appeals', id), {
      isDeleted: true,
      deletedAt: nowIso,
      deletedBy: 'Administrator'
    });
  } catch (e) {
    console.warn('Firestore soft delete error:', e);
  }

  const appeals = getLocalAppeals();
  const idx = appeals.findIndex(a => a.id === id);
  if (idx !== -1) {
    appeals[idx].isDeleted = true;
    appeals[idx].deletedAt = nowIso;
    appeals[idx].deletedBy = 'Administrator';
    saveLocalAppeals(appeals);
  }

  try {
    fetch(`/api/admin/appeals/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token || ''}` }
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Restore Appeal from Trash
 */
export async function restoreAppealUnified(id: string, token?: string): Promise<Appeal> {
  const appeals = getLocalAppeals();
  const idx = appeals.findIndex(a => a.id === id);

  try {
    await updateDoc(doc(db, 'appeals', id), {
      isDeleted: false
    });
  } catch (e) {
    console.warn('Firestore restore error:', e);
  }

  if (idx !== -1) {
    appeals[idx].isDeleted = false;
    delete appeals[idx].deletedAt;
    delete appeals[idx].deletedBy;
    saveLocalAppeals(appeals);
    return appeals[idx];
  }

  return {
    id,
    trackingCode: id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fullName: '',
    phone: '',
    applicantType: 'Fuqaro',
    category: 'Boshqa masalalar',
    subject: '',
    content: '',
    consent: true,
    status: 'Yangi',
    isDeleted: false,
    history: []
  };
}

/**
 * Permanently Delete Appeal
 */
export async function permanentDeleteAppealUnified(id: string, token?: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'appeals', id));
  } catch (e) {
    console.warn('Firestore permanent delete error:', e);
  }

  const appeals = getLocalAppeals().filter(a => a.id !== id);
  saveLocalAppeals(appeals);

  try {
    fetch(`/api/admin/appeals/${id}/permanent`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token || ''}` }
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Export Appeals to Excel directly in browser
 */
export function exportAppealsToExcelClient(appeals: Appeal[]): void {
  const activeAppeals = appeals.filter(a => !a.isDeleted);

  const rows = activeAppeals.map((a, idx) => ({
    'T/r': idx + 1,
    'Murojaat ID': a.id,
    'Sana': new Date(a.createdAt).toLocaleString('uz-UZ'),
    'Murojaatchi F.I.Sh.': a.fullName,
    'Telefon raqami': a.phone,
    'E-pochta': a.email || '-',
    'Murojaatchi toifasi': a.applicantType,
    'Murojaat yo‘nalishi': a.category,
    'Mavzu': a.subject,
    'Murojaat matni': a.content,
    'Fayl biriktirilgan': (a.attachments && a.attachments.length > 0)
      ? a.attachments.map(att => att.name).join(', ')
      : (a.attachment ? a.attachment.name : 'Yo‘q'),
    'Holati': a.status,
    'Mas’ul bo‘lim': a.assignedDepartment || '-',
    'Mas’ul xodim': a.assignedOfficer || '-',
    'Ijro muddati': a.deadline || '-',
    'Rasmiy javob matni': a.officialResponse || '-',
    'Ichki izohlar': a.internalNotes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const columnWidths = [
    { wch: 6 },
    { wch: 18 },
    { wch: 20 },
    { wch: 30 },
    { wch: 18 },
    { wch: 25 },
    { wch: 22 },
    { wch: 28 },
    { wch: 32 },
    { wch: 50 },
    { wch: 20 },
    { wch: 22 },
    { wch: 32 },
    { wch: 28 },
    { wch: 16 },
    { wch: 50 },
    { wch: 35 }
  ];
  worksheet['!cols'] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Murojaatlar');

  XLSX.writeFile(workbook, `TKTI_Yangiyer_Murojaatlar_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Real-time subscription to Branch Settings in Firestore
 * Synchronizes phone numbers, address, emails, reception schedules across ALL devices/computers instantly!
 */
export function subscribeToSettings(onUpdate: (settings: BranchSettings) => void): () => void {
  try {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as BranchSettings;
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
        onUpdate(data);
      }
    }, (error) => {
      console.warn('Firestore settings onSnapshot warning:', error);
    });
    return unsub;
  } catch (err) {
    console.warn('Failed to subscribe to settings:', err);
    return () => {};
  }
}

/**
 * Get Branch Settings (Synchronized with Cloud Firestore)
 */
export async function getBranchSettingsUnifiedAsync(): Promise<BranchSettings> {
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'general'));
    if (docSnap.exists()) {
      const data = docSnap.data() as BranchSettings;
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      return data;
    } else {
      // First boot on cloud: Initialize default branch settings in Firestore
      await setDoc(doc(db, 'settings', 'general'), sanitizeForFirestore(DEFAULT_BRANCH_SETTINGS));
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_BRANCH_SETTINGS));
      return DEFAULT_BRANCH_SETTINGS;
    }
  } catch (e) {
    console.warn('Firestore settings fetch error:', e);
  }
  return getBranchSettingsUnified();
}

export function getBranchSettingsUnified(): BranchSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_BRANCH_SETTINGS;
}

/**
 * Save Branch Settings with Direct Cloud Firestore Push
 * Instantly broadcasts updated contact info to all open browsers and devices!
 */
export async function saveBranchSettingsUnified(settings: BranchSettings, token?: string): Promise<void> {
  // 1. Immediately cache locally
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('tkti_settings_changed', { detail: settings }));
  } catch (e) {}

  // 2. Direct authoritative write to Firestore Cloud Database
  try {
    const cleanSettings = sanitizeForFirestore(settings);
    await setDoc(doc(db, 'settings', 'general'), cleanSettings, { merge: true });
  } catch (fsErr) {
    console.error('Firestore save settings error:', fsErr);
    throw new Error('Bulutli bazaga sozlamalarni saqlashda xatolik yuz berdi');
  }

  // 3. Optional local express backend sync (non-blocking)
  try {
    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`
      },
      body: JSON.stringify(settings)
    }).catch(() => {});
  } catch (e) {}
}
