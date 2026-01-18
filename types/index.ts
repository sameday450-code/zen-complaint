/**
 * Type Definitions for the Complaint Reporting System
 */

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Station {
  id: string;
  name: string;
  location?: string;
  description?: string;
  qrCodeUrl?: string;
  qrCodeData: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Complaint {
  id: string;
  stationId: string;
  customerName: string;
  customerPhone: string;
  category: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submissionMethod: 'qr_code' | 'voice_call';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  deletedAt?: Date;
  station?: Station;
  mediaFiles?: MediaFile[];
  voiceCall?: VoiceCall;
}

export interface MediaFile {
  id: string;
  complaintId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  storageKey: string;
  uploadedAt: Date;
  deletedAt?: Date;
}

export interface Notification {
  id: string;
  complaintId?: string;
  title: string;
  message: string;
  type: 'new_complaint' | 'status_update' | 'system';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  complaint?: Complaint;
}

export interface VoiceCall {
  id: string;
  complaintId: string;
  phoneNumber: string;
  callDuration?: number;
  callSid?: string;
  recordingUrl?: string;
  transcription?: string;
  voiceData?: any;
  status: 'initiated' | 'in-progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

export interface ActivityLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy?: string;
  details?: any;
  ipAddress?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// WebSocket Event Types
export interface SocketEvents {
  'join-admin': () => void;
  'leave-admin': () => void;
  'new-complaint': (complaint: Complaint) => void;
  'complaint-update': (complaint: Complaint) => void;
  'station-update': (data: { action: string; station: Station }) => void;
  'notification': (notification: Notification) => void;
}

// Form Types
export interface ComplaintFormData {
  stationId: string;
  customerName: string;
  customerPhone: string;
  category: string;
  description: string;
}

export interface StationFormData {
  name: string;
  location?: string;
  description?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  name: string;
}

// Statistics Types
export interface DashboardStats {
  totalStations: number;
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  todayComplaints: number;
  averageResolutionTime: number;
}
