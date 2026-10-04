// Danh sách nhân sự chính thức của Phân xưởng Vận hành Ialy (PXVH)
// Được dùng làm căn cứ đối soát chuẩn xác 100%
export const PXVH_ROSTER: string[] = [
  'Nguyễn Văn Nghị',
  'Nguyễn Hoàng Phi',
  'Nguyễn Thị Hiền',
  'Đỗ Thanh Phong',
  'Trần Thanh Chương',
  'Nguyễn Hùng',
  'Nguyễn Tiến Danh',
  'Vũ Đức Cường',
  'Phan Văn Hùng',
  'Hoàng Ngọc Ân',
  'Nguyễn Tấn Phước',
  'Phạm Văn Von',
  'Võ Quang Minh',
  'Ngô Xuân Vỹ',
  'Phạm Văn Mạnh',
  'Nguyễn Lâm Tiến',
  'Nguyễn Hồng Quang',
  'Nguyễn Khánh Toàn',
  'Nguyễn Quang Minh',
  'Tạ Văn Hà',
  'Lê Trí Dũng',
  'Ngô Xuân Đoàn',
  'Nguyễn Ngọc Hùng',
  'Lê Văn Dân',
  'Thái Trần Hoàng Vũ',
  'Trần Hữu Thuận',
  'Trần Văn Thiên',
  'Hà Văn Chăn',
  'Đỗ Văn Anh',
  'Trần Nhật Huy',
  'Lê Hoài Bảo',
  'Rmah Thắng',
  'Nguyễn Văn Trường',
  'Nguyễn Văn Toàn',
  'Nguyễn Yên Nam',
  'Nguyễn Phi Được',
  'Phạm Văn Toàn',
  'Lê Văn Tích',
  'Lê Thành Cao',
  'Hoàng Văn Thăng',
  'Lê Thế Đàm',
  'Trịnh Xuân An',
  'Võ Thành Trung',
  'Lê Vũ Minh Trung',
  'Phạm Thanh Tùng',
  'Bùi Chí Thanh',
  'Mai Xuân Sơn',
  'Nguyễn Trung Chính',
  'Nguyễn Vinh Quang',
  'Phan Ngọc Hùng',
  'Kiều Cao Khởi',
  'Bùi Ngọc Thuận',
  'Trần Tiến Quân',
  'Cù Minh Trung',
  'Tào Trọng Thi',
  'Phùng Ngọc Tú',
  'Phạm Đình Đức',
  'Nguyễn Văn Trung',
  'Hoàng Tấn Hùng',
  'Trần Trung Liêm',
  'Lê Hướng',
  'Trương Đình Thắng',
  'Nguyễn Khắc Học',
  'P.Thăn',
  'Phạm Hồng Thắng',
  'A Ran',
  'Vũ Huy Hùng',
  'Nguyễn Thành Nguyên',
  'Lê Trọng Toàn',
];

// Hàm chuẩn hóa chuỗi tên để so khớp không phân biệt hoa thường / khoảng trắng / dấu chấm
export function normalizePersonName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.]/g, '');
}

const pxvhNormalizedSet = new Set(PXVH_ROSTER.map((name) => normalizePersonName(name)));

// Kiểm tra xem một người có thuộc Phân xưởng Vận hành hay không
export function isPXVHMember(name: string): boolean {
  if (!name) return false;
  const norm = normalizePersonName(name);
  if (pxvhNormalizedSet.has(norm)) return true;

  // Hỗ trợ kiểm tra biến thể viết tắt hoặc họ tên không dấu / thừa khoảng trắng
  for (const official of PXVH_ROSTER) {
    const offNorm = normalizePersonName(official);
    if (norm === offNorm) return true;
    if (offNorm.length > 5 && norm.includes(offNorm)) return true;
  }
  return false;
}

// Kiểm tra đơn vị hoặc chức danh có phải là Đơn vị ngoài / Nhà thầu / Thầu ngoài không
export function isExternalUnit(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('đơn vị ngoài') ||
    lower.includes('nhà thầu') ||
    lower.includes('thầu ngoài') ||
    lower.includes('đv ngoài') ||
    lower.includes('ngoài công ty') ||
    lower.includes('thuê ngoài')
  );
}

// Danh mục đơn vị chuẩn theo yêu cầu của người dùng
export const STANDARD_UNITS = [
  'Tất cả',
  'Công ty Thủy điện Ialy',
  'Phân xưởng Vận hành',
  'Phân xưởng Sửa chữa',
  'Đơn vị ngoài',
] as const;

export type StandardUnit = (typeof STANDARD_UNITS)[number];
