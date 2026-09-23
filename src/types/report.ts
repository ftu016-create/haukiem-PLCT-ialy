export interface ViolationItem {
  id: string;
  number: string; // Số PCT hoặc LCT (e.g. "387", "142", "266", "257")
  type: string; // Loại (e.g. "Điện", "TCNH", "Điện (Giấy)", "TCNH (Giấy)")
  content: string; // Nội dung không phù hợp
  relatedVh: string; // Người liên quan - VHIALY (Vận hành)
  relatedPxsc: string; // Người liên quan - PXSC (Sửa chữa) hoặc đơn vị khác
  reason: string; // Lý do không phù hợp
}

export interface PctStatistics {
  totalIssued: number; // Tổng PCT đã cấp số
  notExecuted: number; // PCT không thực hiện
  paperForm: number; // PCT giấy
  inProgress: number; // PCT đang thực hiện
  nonCompliant: number; // PCT không phù hợp
}

export interface LctStatistics {
  totalIssued: number; // Tổng LCT được cấp số
  notExecuted: number; // LCT không thực hiện
  paperForm: number; // LCT giấy
  nonCompliant: number; // LCT không phù hợp
  notes?: string; // Ghi chú
}

export interface ReportData {
  id: string;
  updatedAt: string;
  general: {
    companyName: string; // e.g. "CÔNG TY THỦY ĐIỆN IALY"
    departmentName: string; // e.g. "PX VẬN HÀNH IALY"
    location: string; // e.g. "Gia Lai"
    reportDate: string; // e.g. "2026-08-27"
    month: number; // e.g. 8
    year: number; // e.g. 2026
    reportTitle: string; // "BÁO CÁO"
    reportSubtitle: string; // "Về việc kết quả hậu kiểm PCT, LCT tháng 8/2026"
  };
  pct: {
    stats: PctStatistics;
    violations: ViolationItem[];
  };
  lct: {
    stats: LctStatistics;
    violations: ViolationItem[];
  };
  recommendations: string[];
  signatories: {
    members: string[]; // Các thành viên tham gia hậu kiểm
    recipients?: string[]; // Nơi nhận (nếu có)
    leadTitle: string; // "TRƯỞNG NHÓM"
    leadName: string; // "Trần Thanh Chương"
    leadSignatureUrl?: string; // Chữ ký ảnh nếu có
  };
}
