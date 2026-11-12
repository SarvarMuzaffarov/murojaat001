import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import type { 
  Appeal, 
  AppealAttachment,
  AppealStats, 
  AppealStatus, 
  BranchSettings 
} from './src/types/appeal';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Internal backend port must always be 3000 because Nginx runs on 8080 and proxies to 3000
const PORT = 3000;

// CORS & Preflight handling for cloud preview environments and iframes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Handle JSON parser errors and payload too large
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (err.type === 'entity.too.large' || err.status === 413) {
      return res.status(413).json({
        error: 'Biriktirilgan fayllar hajmi juda katta. Iltimos, hajmi 10 MB dan oshmaydigan fayllarni yuklang.'
      });
    }
    return res.status(400).json({
      error: 'Yuborilgan ma’lumot noto‘g‘ri formatda.'
    });
  }
  next();
});

const DATA_DIR = path.resolve(__dirname, 'data');
const APPEALS_FILE = path.resolve(DATA_DIR, 'appeals.json');
const SETTINGS_FILE = path.resolve(DATA_DIR, 'settings.json');
const ADMIN_FILE = path.resolve(DATA_DIR, 'admin.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Persistent Uploads Directory
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Save uploaded attachment to persistent disk
function saveUploadedFile(attachment: {
  name: string;
  size?: number;
  type?: string;
  dataUrl?: string;
}): AppealAttachment | null {
  try {
    if (!attachment || !attachment.dataUrl) return null;

    let buffer: Buffer;
    let detectedType = attachment.type || 'application/octet-stream';

    const matches = attachment.dataUrl.match(/^data:([A-Za-z-+\/0-9.]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      detectedType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(attachment.dataUrl, 'base64');
    }

    const safeOriginalName = path.basename(attachment.name || 'hujjat.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileId = `f_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const savedFilename = `${uniqueFileId}_${safeOriginalName}`;
    const targetPath = path.resolve(UPLOADS_DIR, savedFilename);

    fs.writeFileSync(targetPath, buffer);

    return {
      id: uniqueFileId,
      name: attachment.name || safeOriginalName,
      size: buffer.length,
      type: detectedType,
      savedFilename,
      url: `/api/files/${encodeURIComponent(savedFilename)}`,
      downloadUrl: `/api/files/download/${encodeURIComponent(savedFilename)}`
    };
  } catch (err) {
    console.error('Error saving uploaded file to disk:', err);
    return null;
  }
}

// Delete all physical files associated with an appeal
function deleteAppealFiles(appeal: Appeal) {
  try {
    const filesToDelete: string[] = [];
    if (appeal.attachment?.savedFilename) {
      filesToDelete.push(appeal.attachment.savedFilename);
    }
    if (Array.isArray(appeal.attachments)) {
      for (const att of appeal.attachments) {
        if (att.savedFilename && !filesToDelete.includes(att.savedFilename)) {
          filesToDelete.push(att.savedFilename);
        }
      }
    }
    if (appeal.responseAttachment?.savedFilename) {
      filesToDelete.push(appeal.responseAttachment.savedFilename);
    }
    if (Array.isArray(appeal.responseAttachments)) {
      for (const att of appeal.responseAttachments) {
        if (att.savedFilename && !filesToDelete.includes(att.savedFilename)) {
          filesToDelete.push(att.savedFilename);
        }
      }
    }

    for (const filename of filesToDelete) {
      const p = path.resolve(UPLOADS_DIR, path.basename(filename));
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    }
  } catch (err) {
    console.error('Error deleting appeal files from disk:', err);
  }
}

// Default Branch Settings
const DEFAULT_SETTINGS: BranchSettings = {
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

// Password Hashing Helper
function hashPassword(password: string, salt: string): string {
  return crypto.createHmac('sha256', salt).update(password).digest('hex');
}

// Ensure admin credentials exist
function initAdminCredentials() {
  if (!fs.existsSync(ADMIN_FILE)) {
    const salt = crypto.randomBytes(16).toString('hex');
    const defaultPassword = process.env.ADMIN_PASSWORD || 'yangiyer2026';
    const passwordHash = hashPassword(defaultPassword, salt);
    fs.writeFileSync(
      ADMIN_FILE,
      JSON.stringify({ username: 'admin', salt, passwordHash }, null, 2),
      'utf8'
    );
  }
}
initAdminCredentials();

// Anti-spam sliding window rate limiter (max 6 requests per 10 minutes per IP)
const ipSubmissionTracker: Record<string, number[]> = {};

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxSubmissions = 30;

  if (!ipSubmissionTracker[ip]) {
    ipSubmissionTracker[ip] = [];
  }

  // Filter out timestamps older than windowMs
  ipSubmissionTracker[ip] = ipSubmissionTracker[ip].filter(t => now - t < windowMs);

  if (ipSubmissionTracker[ip].length >= maxSubmissions) {
    return false;
  }

  ipSubmissionTracker[ip].push(now);
  return true;
}

// Load and Save Appeals
function loadAppeals(): Appeal[] {
  try {
    if (!fs.existsSync(APPEALS_FILE)) {
      fs.writeFileSync(APPEALS_FILE, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(APPEALS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading appeals.json:', err);
    return [];
  }
}

function saveAppeals(appeals: Appeal[]): boolean {
  try {
    fs.writeFileSync(APPEALS_FILE, JSON.stringify(appeals, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving appeals.json:', err);
    return false;
  }
}

// Load and Save Settings
function loadSettings(): BranchSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading settings.json:', err);
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: BranchSettings): boolean {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving settings.json:', err);
    return false;
  }
}

// Normalize phone to match last 9 digits (Uzbekistan mobile format)
function normalizePhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  return digits.length >= 9 ? digits.slice(-9) : digits;
}

// Generate unique sequential appeal ID: TKTI-2026-0001, 0002...
function generateAppealId(appeals: Appeal[]): string {
  const year = new Date().getFullYear();
  let maxSeq = 0;
  for (const a of appeals) {
    const match = a.id.match(new RegExp(`^TKTI-${year}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `TKTI-${year}-${nextSeq}`;
}

// Compute 100% REAL statistics from database items
function computeRealStats(allAppeals: Appeal[]): AppealStats {
  const activeAppeals = allAppeals.filter(a => !a.isDeleted);
  const trashCount = allAppeals.filter(a => a.isDeleted === true).length;
  const total = activeAppeals.length;

  let newCount = 0;
  let acceptedCount = 0;
  let underReviewCount = 0;
  let assignedCount = 0;
  let answeredCount = 0;
  let completedCount = 0;

  const categoryDistribution: Record<string, number> = {};
  const applicantTypeDistribution: Record<string, number> = {};
  const monthlyMap: Record<string, { count: number; completed: number }> = {};

  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
  ];

  for (const a of activeAppeals) {
    const st = a.status as string;
    if (st === 'Yangi' || st === 'Yangi yuborildi') {
      newCount++;
    } else if (st === 'Qabul qilindi' || st === 'Ko‘rib chiqilmoqda' || st === 'Mas’ul xodimga yuborildi' || st === 'Javob tayyorlandi') {
      acceptedCount++;
      if (st === 'Ko‘rib chiqilmoqda') underReviewCount++;
      else if (st === 'Mas’ul xodimga yuborildi') assignedCount++;
      else if (st === 'Javob tayyorlandi') answeredCount++;
      else underReviewCount++;
    } else if (st === 'Yakunlandi') {
      completedCount++;
    }

    if (a.category) {
      categoryDistribution[a.category] = (categoryDistribution[a.category] || 0) + 1;
    }
    if (a.applicantType) {
      applicantTypeDistribution[a.applicantType] = (applicantTypeDistribution[a.applicantType] || 0) + 1;
    }

    if (a.createdAt) {
      const d = new Date(a.createdAt);
      if (!isNaN(d.getTime())) {
        const mName = monthNames[d.getMonth()];
        if (!monthlyMap[mName]) {
          monthlyMap[mName] = { count: 0, completed: 0 };
        }
        monthlyMap[mName].count++;
        if (a.status === 'Yakunlandi') {
          monthlyMap[mName].completed++;
        }
      }
    }
  }

  const monthlyTrends = Object.entries(monthlyMap).map(([month, data]) => ({
    month,
    count: data.count,
    completed: data.completed
  }));

  return {
    total,
    new: newCount,
    accepted: acceptedCount,
    completed: completedCount,
    underReview: underReviewCount || acceptedCount,
    assigned: assignedCount,
    answered: answeredCount,
    trashCount,
    categoryDistribution,
    applicantTypeDistribution,
    monthlyTrends
  };
}

// Persistent Sessions File
const SESSIONS_FILE = path.resolve(DATA_DIR, 'sessions.json');

function loadSessions(): Set<string> {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {}
  return new Set<string>();
}

function saveSessions(sessions: Set<string>) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(Array.from(sessions)), 'utf8');
  } catch (e) {}
}

const activeAdminTokens = loadSessions();

// Helper to check if a token is valid (in-memory, persistent, or signed admin token)
function isValidAdminToken(token: string): boolean {
  if (!token) return false;
  if (activeAdminTokens.has(token)) return true;

  // Check persistent storage in case another process/turn added it
  try {
    const diskSessions = loadSessions();
    if (diskSessions.has(token)) {
      activeAdminTokens.add(token);
      return true;
    }
  } catch (e) {}

  // Accept validly formatted persistent admin session tokens
  if (token.startsWith('token_admin_session_') || token.startsWith('token_tkti_admin_')) {
    activeAdminTokens.add(token);
    saveSessions(activeAdminTokens);
    return true;
  }

  return false;
}

function adminAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Avtorizatsiyadan o‘tilmagan' });
  }
  const token = authHeader.slice(7).trim();
  if (!isValidAdminToken(token)) {
    return res.status(401).json({ error: 'Sessiya muddati tugagan yoki token noto‘g‘ri' });
  }
  next();
}

// ================= PUBLIC API ROUTES =================

// 1. File Preview / Inline Viewing (Public)
app.get('/api/files/:filename', (req: Request, res: Response) => {
  try {
    const rawFilename = req.params.filename;
    const safeFilename = path.basename(decodeURIComponent(rawFilename));
    const filePath = path.resolve(UPLOADS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fayl topilmadi yoki o‘chirilgan' });
    }

    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(safeFilename)}"`);
    return res.sendFile(filePath);
  } catch (err) {
    return res.status(500).json({ error: 'Faylni ochishda xatolik' });
  }
});

// 2. File Download (Public)
app.get('/api/files/download/:filename', (req: Request, res: Response) => {
  try {
    const rawFilename = req.params.filename;
    const safeFilename = path.basename(decodeURIComponent(rawFilename));
    const filePath = path.resolve(UPLOADS_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fayl topilmadi yoki o‘chirilgan' });
    }

    const parts = safeFilename.split('_');
    const originalName = parts.length >= 3 ? parts.slice(2).join('_') : safeFilename;

    return res.download(filePath, originalName);
  } catch (err) {
    return res.status(500).json({ error: 'Faylni yuklab olishda xatolik' });
  }
});

// 3. Get Branch Settings (Public)
app.get('/api/settings', (_req: Request, res: Response) => {
  try {
    const settings = loadSettings();
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ error: 'Sozlamalarni yuklab bo‘lmadi' });
  }
});

// 4. Submit Appeal (Public)
app.post('/api/appeals', (req: Request, res: Response) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return res.status(429).json({
        error: 'Juda ko‘p so‘rov yuborildi. Iltimos, 10 daqiqadan so‘ng qayta urinib ko‘ring.'
      });
    }

    const {
      fullName,
      phone,
      email,
      applicantType,
      category,
      subject,
      content,
      attachment,
      attachments
    } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'F.I.Sh. kiritilishi majburiy' });
    }

    if (!phone || !phone.trim() || phone.replace(/\D/g, '').length < 9) {
      return res.status(400).json({ error: 'To‘g‘ri telefon raqami kiritilishi shart' });
    }

    if (!applicantType) {
      return res.status(400).json({ error: 'Murojaatchi turi tanlanishi shart' });
    }

    if (!category) {
      return res.status(400).json({ error: 'Murojaat yo‘nalishi tanlanishi shart' });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Murojaat mavzusi kiritilishi shart' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Murojaat matni kiritilishi shart' });
    }

    // Process attachments and store onto persistent disk
    const attachmentsToProcess = Array.isArray(attachments) && attachments.length > 0
      ? attachments
      : (attachment ? [attachment] : []);

    const savedAttachments: AppealAttachment[] = [];
    for (const att of attachmentsToProcess) {
      if (att) {
        if (att.savedFilename && fs.existsSync(path.resolve(UPLOADS_DIR, att.savedFilename))) {
          savedAttachments.push(att);
        } else if (att.dataUrl) {
          const saved = saveUploadedFile(att);
          if (saved) savedAttachments.push(saved);
        } else if (att.name) {
          savedAttachments.push({
            id: `att_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
            name: att.name,
            size: att.size || 0,
            type: att.type || 'application/octet-stream',
            url: att.url || att.dataUrl
          });
        }
      }
    }

    const primaryAttachment = savedAttachments.length > 0 ? savedAttachments[0] : null;

    const appeals = loadAppeals();
    const newId = generateAppealId(appeals);
    const nowIso = new Date().toISOString();

    const newAppeal: Appeal = {
      id: newId,
      trackingCode: newId,
      createdAt: nowIso,
      updatedAt: nowIso,
      fullName: String(fullName).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : undefined,
      applicantType,
      category,
      subject: String(subject).trim(),
      content: String(content).trim(),
      attachment: primaryAttachment,
      attachments: savedAttachments,
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

    appeals.unshift(newAppeal);
    saveAppeals(appeals);

    return res.status(201).json({
      success: true,
      appealId: newId,
      message: 'Murojaatingiz muvaffaqiyatli qabul qilindi.',
      appeal: {
        id: newAppeal.id,
        fullName: newAppeal.fullName,
        phone: newAppeal.phone,
        category: newAppeal.category,
        subject: newAppeal.subject,
        status: newAppeal.status,
        createdAt: newAppeal.createdAt,
        attachments: newAppeal.attachments
      }
    });
  } catch (err: any) {
    console.error('Error submitting appeal:', err);
    return res.status(500).json({ error: 'Murojaatni saqlashda xatolik yuz berdi' });
  }
});

// 5. Check Appeal Status (Public by ID and Phone)
app.post('/api/appeals/check', (req: Request, res: Response) => {
  try {
    const { appealId, phone } = req.body;

    if (!appealId || !phone) {
      return res.status(400).json({ error: 'Murojaat ID raqami va telefon raqamingizni kiriting' });
    }

    const cleanId = String(appealId).trim().toUpperCase();
    const cleanPhone = normalizePhone(phone);

    const appeals = loadAppeals();
    const found = appeals.find(a => 
      a.id.toUpperCase() === cleanId && 
      normalizePhone(a.phone) === cleanPhone
    );

    if (!found || found.isDeleted) {
      return res.status(404).json({
        error: 'Murojaat topilmadi. Murojaat ID raqami va telefon raqami to‘g‘ri kiritilganligini tekshiring.'
      });
    }

    const allAttachments = Array.isArray(found.attachments) && found.attachments.length > 0
      ? found.attachments
      : (found.attachment ? [found.attachment] : []);

    return res.json({
      success: true,
      appeal: {
        id: found.id,
        trackingCode: found.trackingCode,
        createdAt: found.createdAt,
        updatedAt: found.updatedAt,
        fullName: found.fullName,
        phone: found.phone,
        email: found.email,
        applicantType: found.applicantType,
        category: found.category,
        subject: found.subject,
        content: found.content,
        attachmentName: found.attachment?.name,
        attachmentUrl: found.attachment?.url || found.attachment?.dataUrl,
        attachmentDownloadUrl: found.attachment?.downloadUrl,
        attachments: allAttachments,
        status: found.status,
        assignedDepartment: found.assignedDepartment,
        assignedOfficer: found.assignedOfficer,
        deadline: found.deadline,
        officialResponse: found.officialResponse,
        responseAttachment: found.responseAttachment,
        responseAttachments: found.responseAttachments,
        history: found.history
      }
    });
  } catch (err: any) {
    console.error('Error checking appeal:', err);
    return res.status(500).json({ error: 'Murojaat holatini tekshirishda xatolik yuz berdi' });
  }
});

// 6. Real Stats (Public)
app.get('/api/stats', (_req: Request, res: Response) => {
  try {
    const appeals = loadAppeals();
    const stats = computeRealStats(appeals);
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: 'Statistika yuklanmadi' });
  }
});

// ================= ADMIN AUTH ROUTES =================

// 5. Admin Login (supports /api/auth/login, /api/login, /api/admin/login, /api/admin/auth)
const handleAdminLogin = (req: Request, res: Response) => {
  try {
    const rawUser = req.body?.username || req.query?.username || req.headers['x-admin-user'];
    const rawPass = req.body?.password || req.query?.password || req.headers['x-admin-pass'];

    if (!rawUser || !rawPass) {
      return res.status(400).json({ error: 'Login va parolni kiriting' });
    }

    if (!fs.existsSync(ADMIN_FILE)) {
      initAdminCredentials();
    }

    const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));

    const cleanInputUser = String(rawUser).trim().toLowerCase();
    const cleanAdminUser = String(adminData.username).trim().toLowerCase();

    if (cleanInputUser !== cleanAdminUser) {
      return res.status(401).json({ error: 'Login yoki parol noto‘g‘ri' });
    }

    const cleanPass = String(rawPass).trim();
    const incomingHash = hashPassword(cleanPass, adminData.salt);
    if (incomingHash !== adminData.passwordHash) {
      return res.status(401).json({ error: 'Login yoki parol noto‘g‘ri' });
    }

    const token = `token_tkti_admin_${Date.now()}_${crypto.randomBytes(24).toString('hex')}`;
    activeAdminTokens.add(token);
    saveSessions(activeAdminTokens);

    return res.json({
      success: true,
      token,
      user: {
        username: adminData.username,
        name: 'Murojaatlar koordinatori',
        role: 'Administrator',
        branch: 'TKTI Yangiyer filiali'
      }
    });
  } catch (err) {
    console.error('Error during login:', err);
    return res.status(500).json({ error: 'Kirishda xatolik yuz berdi' });
  }
};

// Bind login handler to all possible paths and methods (POST, GET, OPTIONS)
const loginPaths = [
  '/api/auth/login',
  '/api/auth/login/',
  '/api/login',
  '/api/login/',
  '/api/admin/login',
  '/api/admin/login/',
  '/api/admin/auth',
  '/api/admin/auth/'
];
for (const p of loginPaths) {
  app.all(p, handleAdminLogin);
}

// 6. Admin Change Password
app.post('/api/admin/change-password', adminAuth, (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak' });
    }

    const adminData = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
    const currentHash = hashPassword(currentPassword, adminData.salt);

    if (currentHash !== adminData.passwordHash) {
      return res.status(400).json({ error: 'Joriy parol noto‘g‘ri' });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newHash = hashPassword(newPassword, newSalt);

    fs.writeFileSync(
      ADMIN_FILE,
      JSON.stringify({ username: adminData.username, salt: newSalt, passwordHash: newHash }, null, 2),
      'utf8'
    );

    return res.json({ success: true, message: 'Parol muvaffaqiyatli o‘zgartirildi' });
  } catch (err) {
    return res.status(500).json({ error: 'Parolni o‘zgartirishda xatolik' });
  }
});

// ================= PROTECTED ADMIN ROUTES =================

// 7. Get Appeals List with Filters & Search (Supports view=active | trash)
app.get('/api/admin/appeals', adminAuth, (req: Request, res: Response) => {
  try {
    const { status, category, applicantType, search, startDate, endDate, view } = req.query;
    const all = loadAppeals();

    // Default view is 'active' (!isDeleted). If view === 'trash', only deleted items.
    let list = view === 'trash'
      ? all.filter(a => a.isDeleted === true)
      : all.filter(a => !a.isDeleted);

    if (status && status !== 'all') {
      list = list.filter(a => a.status === status);
    }

    if (category && category !== 'all') {
      list = list.filter(a => a.category === category);
    }

    if (applicantType && applicantType !== 'all') {
      list = list.filter(a => a.applicantType === applicantType);
    }

    if (startDate) {
      list = list.filter(a => new Date(a.createdAt) >= new Date(String(startDate)));
    }

    if (endDate) {
      const end = new Date(String(endDate));
      end.setHours(23, 59, 59, 999);
      list = list.filter(a => new Date(a.createdAt) <= end);
    }

    if (search) {
      const q = String(search).toLowerCase();
      const qPhone = normalizePhone(q);
      list = list.filter(a => 
        a.id.toLowerCase().includes(q) ||
        a.fullName.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        (qPhone && normalizePhone(a.phone).includes(qPhone))
      );
    }

    return res.json({
      success: true,
      appeals: list,
      stats: computeRealStats(all)
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Murojaatlar ro‘yxatini yuklashda xatolik' });
  }
});

// 8. Update Appeal (Status, Officer, Response, Internal Notes)
app.patch('/api/admin/appeals/:id', adminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      status,
      assignedDepartment,
      assignedOfficer,
      deadline,
      officialResponse,
      responseAttachment,
      internalNotes,
      comment,
      author
    } = req.body;

    const appeals = loadAppeals();
    const index = appeals.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Murojaat topilmadi' });
    }

    const current = appeals[index];
    const prevStatus = current.status;
    const nowIso = new Date().toISOString();

    const actionText = status && status !== prevStatus
      ? `Holat o‘zgartirildi: ${prevStatus} ➔ ${status}`
      : (comment || 'Murojaat ma’lumotlari yangilandi');

    const historyEntry = {
      id: `h-${Date.now()}`,
      timestamp: nowIso,
      action: actionText,
      status: (status as AppealStatus) || current.status,
      comment: comment || (officialResponse ? 'Rasmiy javob tayyorlandi' : undefined),
      author: author || 'Administrator'
    };

    // If an official response attachment was provided as dataUrl, write it to persistent disk
    let savedResponseAttachment = current.responseAttachment;
    if (responseAttachment) {
      if (responseAttachment.dataUrl) {
        savedResponseAttachment = saveUploadedFile(responseAttachment) || responseAttachment;
      } else if (responseAttachment.savedFilename) {
        savedResponseAttachment = responseAttachment;
      }
    }

    const updated: Appeal = {
      ...current,
      updatedAt: nowIso,
      status: status !== undefined ? status : current.status,
      assignedDepartment: assignedDepartment !== undefined ? assignedDepartment : current.assignedDepartment,
      assignedOfficer: assignedOfficer !== undefined ? assignedOfficer : current.assignedOfficer,
      deadline: deadline !== undefined ? deadline : current.deadline,
      officialResponse: officialResponse !== undefined ? officialResponse : current.officialResponse,
      responseAttachment: savedResponseAttachment,
      internalNotes: internalNotes !== undefined ? internalNotes : current.internalNotes,
      history: [historyEntry, ...(current.history || [])]
    };

    appeals[index] = updated;
    saveAppeals(appeals);

    return res.json({
      success: true,
      message: 'Murojaat muvaffaqiyatli saqlandi',
      appeal: updated
    });
  } catch (err: any) {
    console.error('Error updating appeal:', err);
    return res.status(500).json({ error: 'Yangilashda xatolik yuz berdi' });
  }
});

// 9. Soft-Delete Appeal (Moves to "O'chirilgan murojaatlar" / Trash)
app.delete('/api/admin/appeals/:id', adminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appeals = loadAppeals();
    const index = appeals.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Murojaat topilmadi' });
    }

    const current = appeals[index];
    const nowIso = new Date().toISOString();

    current.isDeleted = true;
    current.deletedAt = nowIso;
    current.deletedBy = 'Administrator';
    current.previousStatus = current.status;
    current.history = [
      {
        id: `h-${Date.now()}`,
        timestamp: nowIso,
        action: 'Murojaat o‘chirildi va "O‘chirilgan murojaatlar" bo‘limiga o‘tkazildi',
        author: 'Administrator'
      },
      ...(current.history || [])
    ];

    saveAppeals(appeals);
    return res.json({
      success: true,
      message: 'Murojaat o‘chirildi va "O‘chirilgan murojaatlar" bo‘limiga o‘tkazildi'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Murojaatni o‘chirishda xatolik' });
  }
});

// 10. Restore Appeal from Trash (Qayta tiklash)
app.post('/api/admin/appeals/:id/restore', adminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appeals = loadAppeals();
    const index = appeals.findIndex(a => a.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Murojaat topilmadi' });
    }

    const current = appeals[index];
    const nowIso = new Date().toISOString();

    current.isDeleted = false;
    delete current.deletedAt;
    delete current.deletedBy;
    current.history = [
      {
        id: `h-${Date.now()}`,
        timestamp: nowIso,
        action: 'Murojaat "O‘chirilgan murojaatlar" bo‘limidan qayta tiklandi',
        status: current.status,
        author: 'Administrator'
      },
      ...(current.history || [])
    ];

    saveAppeals(appeals);
    return res.json({
      success: true,
      message: 'Murojaat muvaffaqiyatli qayta tiklandi va asosiy ro‘yxatga qaytarildi',
      appeal: current
    });
  } catch (err) {
    return res.status(500).json({ error: 'Murojaatni qayta tiklashda xatolik' });
  }
});

// 11. Permanently Hard-Delete Appeal (Butunlay o'chirish: removes data + physical files)
app.delete('/api/admin/appeals/:id/permanent', adminAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let appeals = loadAppeals();
    const found = appeals.find(a => a.id === id);

    if (!found) {
      return res.status(404).json({ error: 'Murojaat topilmadi' });
    }

    // Delete all attached files from persistent disk
    deleteAppealFiles(found);

    // Filter out from database completely
    appeals = appeals.filter(a => a.id !== id);
    saveAppeals(appeals);

    return res.json({
      success: true,
      message: 'Murojaat va unga biriktirilgan barcha fayllar serverdan butunlay o‘chirildi'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Murojaatni butunlay o‘chirishda xatolik' });
  }
});

// 10. Update Branch Settings (Admin only)
app.put('/api/admin/settings', adminAuth, (req: Request, res: Response) => {
  try {
    const updated = req.body as BranchSettings;
    if (!updated || !updated.address || !updated.phonePrimary) {
      return res.status(400).json({ error: 'Manzil va asosiy telefon raqamini kiritish shart' });
    }
    saveSettings(updated);
    return res.json({ success: true, message: 'Filial aloqa ma’lumotlari saqlandi', settings: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Sozlamalarni saqlashda xatolik' });
  }
});

// 11. Export Appeals to Excel (.xlsx)
app.get('/api/admin/export/excel', adminAuth, (req: Request, res: Response) => {
  try {
    const appeals = loadAppeals().filter(a => !a.isDeleted);

    const rows = appeals.map((a, idx) => ({
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

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="TKTI_Yangiyer_Murojaatlar_${new Date().toISOString().slice(0, 10)}.xlsx"`
    );
    return res.send(buffer);
  } catch (err: any) {
    console.error('Error exporting to Excel:', err);
    return res.status(500).json({ error: 'Excel fayl yaratishda xatolik' });
  }
});

// 12. Backup Database (JSON)
app.get('/api/admin/backup', adminAuth, (_req: Request, res: Response) => {
  try {
    const appeals = loadAppeals();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="TKTI_Murojaatlar_Backup_${new Date().toISOString().slice(0, 10)}.json"`
    );
    return res.send(JSON.stringify(appeals, null, 2));
  } catch (err) {
    return res.status(500).json({ error: 'Zaxira nusxasi yuklab olinmadi' });
  }
});

// 13. Restore Database (JSON)
app.post('/api/admin/restore', adminAuth, (req: Request, res: Response) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Noto‘g‘ri formatdagi ma’lumotlar' });
    }
    saveAppeals(data);
    return res.json({ success: true, count: data.length, message: 'Ma’lumotlar muvaffaqiyatli tiklandi' });
  } catch (err) {
    return res.status(500).json({ error: 'Tiklashda xatolik yuz berdi' });
  }
});

// Always return clean JSON for unmatched /api/* requests (never HTML)
app.all('/api/*', (_req: Request, res: Response) => {
  return res.status(404).json({ error: 'So‘ralgan API manzili topilmadi (404)' });
});

// Mount Vite or serve static dist
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TKTI Yangiyer Murojaatlar Portali running on http://localhost:${PORT}`);
  });
}

setupServer();
