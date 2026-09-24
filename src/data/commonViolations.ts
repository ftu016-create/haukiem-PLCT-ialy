export interface ViolationPreset {
  id: string;
  category: 'PCT' | 'LCT' | 'BOTH';
  type: string;
  content: string;
  reason: string;
  relatedVhDefault?: string;
  relatedPxscDefault?: string;
}

// Fixed 6 members list as requested
export const MEMBER_OPTIONS = [
  'Nguyễn Văn Toàn',
  'A Ran',
  'Võ Quang Minh',
  'Thái Trần Hoàng Vũ',
  'Nguyễn Hồng Quang',
  'Phùng Ngọc Tú',
];

// Work types for dropdowns
export const WORK_TYPES = [
  'Điện',
  'TCNH',
  'Điện (Giấy)',
  'TCNH (Giấy)',
];

// Standard violation reasons
export const STANDARD_REASONS = [
  'Theo Điều 21 tại Mẫu 4, Phụ lục 7 của Quy trình an toàn của EVN theo QĐ số 278 ngày 25/02/2026',
  'Lỗi SMIS: Sau khi ký xong bị mất thông tin',
];

// PCT Violation options
export const PCT_VIOLATION_OPTIONS = [
  'Những thiết bị, đường dây, đoạn đường dây đã cắt điện: Không ghi Họ tên.',
  'Phần D: Kết thúc công việc: Đơn vị công tác đã tích, khi ký xong không có dấu tích vào ô vuông.',
  'Mục 2. “Thủ tục cho phép công tác”: Người cho phép đã kiểm tra, đánh dấu nhưng không ghi rõ họ và tên',
  'Mục 6. “Kết thúc công tác” trên phần mềm không ký',
  'Mục 2.3. “Đã làm rào chắn và treo biển báo tại”: Đã nhận diện mối nguy nhưng thiếu mục treo biển báo',
  'Tại mục 6. Kết thúc công tác: Người CHTT không đánh dấu vào 03 mục khẳng định trước khi giao cho Người cho phép.',
  'Không tải phiếu giấy.',
  'Tại mục 3.1: Người CHTT không tích vào ô Đơn vị QLVH đã thực hiện đủ và đúng các biện pháp an toàn',
  'Tại mục 2.1. Những thiết bị, đường dây, đoạn đường dây đã cắt điện: Người cho phép không điền tên ĐVQLVH và họ tên',
];

// LCT Violation options
export const LCT_VIOLATION_OPTIONS = [
  'Phần B, Mục 2.3: Người CHTT không tạo nội dung tại cột Trình tự công việc và Điều kiện an toàn.',
  'Tại Phần B, Mục 2.3: Người CHTT không nhập thời gian tại cột kết thúc.',
  'Phần B, Mục 3. Kết thúc công tác: Người CHTT không nhập tên Người ra lệnh khi kết thúc công việc.',
  'Phần C, Kết thúc công tác: Người cấp lệnh không tích vào các ô “Đơn vị vận hành khẳng định”',
  'Phần B, Thực hiện lệnh: Người cấp lệnh không tạo mục “Kiểm tra các biện pháp an toàn trước khi thực hiện công tác”',
  'Phần B: Nhân viên ĐCT không ký ra khỏi vị trí làm việc',
];

export const COMMON_VIOLATIONS_PRESETS: ViolationPreset[] = [
  ...PCT_VIOLATION_OPTIONS.map((content, idx) => ({
    id: `pct-pre-${idx + 1}`,
    category: 'PCT' as const,
    type: 'Điện',
    content,
    reason: STANDARD_REASONS[0],
    relatedVhDefault: 'Trực chính',
    relatedPxscDefault: 'Đơn vị công tác',
  })),
  ...LCT_VIOLATION_OPTIONS.map((content, idx) => ({
    id: `lct-pre-${idx + 1}`,
    category: 'LCT' as const,
    type: 'Điện',
    content,
    reason: STANDARD_REASONS[0],
    relatedVhDefault: 'Người cấp lệnh',
    relatedPxscDefault: 'Người CHTT',
  })),
];
