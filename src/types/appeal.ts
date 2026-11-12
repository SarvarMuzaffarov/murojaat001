export type ApplicantType =
  | 'Talaba'
  | 'Professor-o‘qituvchi'
  | 'Filial xodimi'
  | 'Ota-ona'
  | 'Fuqaro';

export type AppealCategory =
  | 'Ta’lim jarayoni'
  | 'Kontrakt va moliyaviy masalalar'
  | 'Yotoqxona'
  | 'Ishga joylashish'
  | 'Taklif va tashabbuslar'
  | 'Shikoyat'
  | 'Korrupsiyaga oid murojaatlar'
  | 'Boshqa masalalar';

export type AppealStatus =
  | 'Yangi'
  | 'Qabul qilindi'
  | 'Yakunlandi';

export interface HistoryItem {
  id: string;
  timestamp: string;
  action: string;
  status?: AppealStatus;
  comment?: string;
  author: string;
}

export interface AppealAttachment {
  id?: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  downloadUrl?: string;
  savedFilename?: string;
  dataUrl?: string;
}

export interface Appeal {
  id: string;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  phone: string;
  email?: string;
  applicantType: ApplicantType;
  category: AppealCategory;
  subject: string;
  content: string;
  attachment?: AppealAttachment | null;
  attachments?: AppealAttachment[];
  consent: boolean;
  status: AppealStatus;
  assignedDepartment?: string;
  assignedOfficer?: string;
  deadline?: string;
  officialResponse?: string;
  responseAttachment?: AppealAttachment | null;
  responseAttachments?: AppealAttachment[];
  internalNotes?: string;
  history: HistoryItem[];
  // O'chirilgan murojaatlar (Soft delete)
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  previousStatus?: AppealStatus;
}

export interface AppealStats {
  total: number;
  new: number;
  accepted: number;
  completed: number;
  underReview?: number;
  assigned?: number;
  answered?: number;
  trashCount?: number;
  categoryDistribution: Record<string, number>;
  applicantTypeDistribution: Record<string, number>;
  monthlyTrends: { month: string; count: number; completed: number }[];
}

export interface ReceptionScheduleItem {
  role: string;
  person: string;
  time: string;
  room: string;
}

export interface BranchSettings {
  address: string;
  landmark: string;
  phonePrimary: string;
  phoneSecondary: string;
  hotline: string;
  email: string;
  telegram: string;
  workDays: string;
  workHours: string;
  lunchTime: string;
  receptionList: ReceptionScheduleItem[];
}
