/**
 * Core Data Models & Types for Phiếu & Lệnh Công tác Audit System
 */

export type DocumentType = 'PCT' | 'LCT';

export type ErrorSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type ErrorCategory =
  | 'Chữ ký & Thủ tục'
  | 'Thời gian & Trình tự'
  | 'Biện pháp an toàn & Tiếp địa'
  | 'Nhân viên & Vị trí làm việc'
  | 'Nội dung & Phạm vi công việc'
  | 'Khác';

export interface ParsedErrorItem {
  id: string;
  severity: ErrorSeverity;
  message: string;
  ruleReference: string;
  category: ErrorCategory;
}

export interface RawSheetRecord {
  stt: string;
  code: string;
  jobName: string;
  inspectorName: string;
  inspectorEmail: string;
  unit: string;
  issuer: string;
  leader: string;
  approver: string;
  result: string;
  safetyScore: string;
  errorCount: string;
  rawErrors: string;
  auditDate: string;
}

export interface NormalizedRecord {
  id: string;
  rawIndex: number;
  stt: string;
  code: string;
  documentType: DocumentType;
  jobName: string;
  inspectorName: string;
  inspectorEmail: string;
  unit: string;
  issuer: string;
  leader: string;
  approver: string;
  result: 'Có sai sót' | 'Hợp lệ' | 'Chưa xác định';
  safetyScore: number;
  errorCount: number;
  rawErrors: string;
  parsedErrors: ParsedErrorItem[];
  auditDate: string; // YYYY-MM-DD
  year: number;
  month: number; // 1-12
  canonicalFingerprint: string;
  isDuplicate: boolean;
  duplicateOfIndex?: number;
  hasSameCodeDiffData?: boolean;
  anomalyFlags: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'DUPLICATE_REMOVED' | 'SAME_CODE_KEPT' | 'SYNC_SHEET' | 'ANOMALY_DETECTED' | 'CONFIG_UPDATED';
  title: string;
  details: string;
  code?: string;
  fingerprint?: string;
  count?: number;
}

export type UserRole = 'ADMIN' | 'VIEWER';

export interface SyncState {
  lastSyncTime: string | null;
  status: 'idle' | 'syncing' | 'success' | 'error';
  sourceUrl: string;
  totalRawRows: number;
  totalUniqueRows: number;
  totalDuplicatesRemoved: number;
  errorMessage?: string;
}

export interface FilterState {
  year: number | 'all';
  month: number | 'all';
  documentType: 'all' | DocumentType;
  unit: string;
  severity: 'all' | ErrorSeverity;
  searchQuery: string;
  statusFilter: 'all' | 'error_only' | 'valid_only';
}

export interface StatisticsOverview {
  totalPCT: number;
  totalLCT: number;
  pctWithErrors: number;
  pctValid: number;
  pctErrorRate: number;
  lctWithErrors: number;
  lctValid: number;
  lctErrorRate: number;
  totalDocuments: number;
  documentsWithErrors: number;
  validDocuments: number;
  totalErrors: number;
  totalPeopleWithErrors: number;
  errorRate: number; // (documentsWithErrors / totalDocuments) * 100
  errorDensity: number; // (totalErrors / totalDocuments) * 100
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}

export type Workshop = 'Phân xưởng Sửa chữa' | 'Phân xưởng Vận hành' | 'Liên phân xưởng';

export interface WorkshopStat {
  workshopName: 'Phân xưởng Vận hành' | 'Phân xưởng Sửa chữa';
  shortName: 'PXVH' | 'PXSC';
  roles: string[];
  totalErrors: number;
  violationDocuments: number;
  peopleCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  errorShare: number; // Tỷ trọng lỗi (%)
}

export interface PersonStat {
  name: string;
  roles: string[];
  workshop: Workshop;
  totalErrors: number;
  documentsCount: number;
  errorDocumentsCount: number; // Tổng số phiếu, lệnh (hồ sơ) vi phạm
  monthsWithErrorsCount: number; // Số tháng có hồ sơ vi phạm
  monthsWithErrors: number[];
  monthlyViolations: { [month: number]: number }; // Số phiếu/lệnh vi phạm trong từng tháng
  monthlyErrors: { [month: number]: number };
  lastErrorDate: string | null;
  hasMonthlyAlert: boolean; // >= 2 hồ sơ vi phạm trong 1 tháng
  hasYearlyAlert: boolean; // vi phạm tại >= 2 tháng trong năm
}

export interface RoleStat {
  roleName: string;
  personCount: number;
  documentCount: number;
  errorDocumentCount: number;
  totalErrors: number;
  errorRate: number;
  errorDensity: number;
  persons: { name: string; errorCount: number; docCount: number }[];
}

export interface MonthlyBreakdown {
  month: number;
  monthLabel: string;
  totalDocuments: number;
  pctCount: number;
  lctCount: number;
  errorDocuments: number;
  validDocuments: number;
  totalErrors: number;
  errorRate: number;
  errorDensity: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}
