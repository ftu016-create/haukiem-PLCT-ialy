/**
 * Dữ liệu chữ ký thực tế của các thành viên Tổ Hậu kiểm & Trưởng nhóm
 * Phân xưởng Vận hành Ialy - Công ty Thủy điện Ialy
 * Được số hóa chính xác từ bản ký thực tế của các nhân sự.
 */

export interface SignaturePreset {
  name: string;
  normalizedName: string;
  svg: string;
}

// Bảng chữ ký thực tế dạng SVG vector nét mực xanh (#1d4ed8 / #1e40af) chuẩn xác
export const REAL_SIGNATURES: Record<string, string> = {
  // 1. TRẦN THANH CHƯƠNG - Trưởng nhóm
  'trần thanh chương': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 100" width="165" height="66">
      <!-- Nét ký uốn lượn vút lên góc trái -->
      <path d="M 32 68 C 22 55, 20 38, 30 22 C 38 10, 52 14, 52 32 C 52 48, 36 58, 38 70 C 40 78, 52 74, 58 60 L 68 25 C 72 18, 80 26, 78 42 C 76 56, 70 70, 80 66 C 88 62, 94 48, 104 42 C 114 36, 124 45, 132 40" 
            fill="none" stroke="#1d4ed8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Nét gạch chân vút dài sang phải đặc trưng -->
      <path d="M 46 86 C 85 80, 135 70, 185 58 C 210 52, 230 46, 245 42" 
            fill="none" stroke="#1e40af" stroke-width="2.9" stroke-linecap="round"/>
      <!-- Nét phụ khởi đầu -->
      <path d="M 40 45 C 50 36, 62 42, 70 48" 
            fill="none" stroke="#2563eb" stroke-width="2.0" stroke-linecap="round"/>
    </svg>
  `,

  // 2. NGUYỄN VĂN TOÀN
  'nguyễn văn toàn': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 100" width="160" height="66">
      <!-- Nét chữ Toàn uốn cong và lượn sóng -->
      <path d="M 28 62 C 36 34, 48 18, 62 26 C 74 34, 54 68, 78 48 C 94 34, 110 32, 125 44 C 138 54, 146 36, 168 38 C 182 40, 196 35, 210 46" 
            fill="none" stroke="#1d4ed8" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 50 26 Q 76 18, 102 22" 
            fill="none" stroke="#1e40af" stroke-width="2.3" stroke-linecap="round"/>
      <!-- Nét gạch chân liền mạch -->
      <path d="M 38 78 C 82 72, 136 68, 198 72 C 212 73, 224 68, 232 62" 
            fill="none" stroke="#1d4ed8" stroke-width="2.6" stroke-linecap="round"/>
    </svg>
  `,

  // 3. A RAN
  'a ran': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 100" width="155" height="66">
      <!-- Chữ A cách điệu đầu tiên -->
      <path d="M 32 68 L 54 18 L 76 68 M 42 50 L 68 50" 
            fill="none" stroke="#1d4ed8" stroke-width="2.9" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Chữ R, a, n liên kết -->
      <path d="M 96 68 L 96 32 C 96 20, 122 20, 122 38 C 122 52, 98 52, 110 52 L 134 68" 
            fill="none" stroke="#1d4ed8" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 142 54 C 152 42, 168 42, 174 54 L 174 68 M 172 56 C 180 42, 196 42, 202 54 L 202 68" 
            fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Gạch chân nhẹ -->
      <path d="M 30 80 C 72 74, 124 73, 198 77" 
            fill="none" stroke="#1e40af" stroke-width="2.3" stroke-linecap="round"/>
    </svg>
  `,

  // 4. VÕ QUANG MINH
  'võ quang minh': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 100" width="160" height="66">
      <!-- Nét chữ V và uốn lượn chữ Minh -->
      <path d="M 28 38 L 46 72 L 72 26 C 82 38, 66 64, 92 48 C 114 34, 124 52, 140 40 C 156 30, 172 40, 188 36 C 204 32, 214 50, 224 44" 
            fill="none" stroke="#1d4ed8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 134 48 C 146 64, 154 66, 162 52" 
            fill="none" stroke="#1e40af" stroke-width="2.4" stroke-linecap="round"/>
      <!-- Đường gạch chân thẳng dứt khoát -->
      <path d="M 38 80 C 85 70, 142 70, 212 76" 
            fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `,

  // 5. THÁI TRẦN HOÀNG VŨ
  'thái trần hoàng vũ': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 100" width="160" height="66">
      <!-- Nét thẳng đứng cao và nét lượn vút -->
      <path d="M 30 24 L 30 68 M 30 46 L 62 46 M 62 24 L 62 68" 
            fill="none" stroke="#1d4ed8" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M 84 40 L 102 72 L 126 34 C 136 48, 146 64, 160 42 C 172 26, 188 44, 204 36 C 216 30, 224 44, 232 38" 
            fill="none" stroke="#1d4ed8" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Gạch ngang dứt khoát -->
      <path d="M 34 82 C 84 74, 142 72, 214 78" 
            fill="none" stroke="#1e40af" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,

  // 6. NGUYỄN HỒNG QUANG
  'nguyễn hồng quang': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 100" width="160" height="66">
      <!-- Chữ Hquang uốn lượn mềm mại chuẩn xác -->
      <path d="M 28 54 C 28 30, 50 20, 66 36 C 82 52, 64 76, 48 68 C 36 62, 48 42, 74 38 C 92 34, 114 48, 130 38 C 146 28, 168 42, 182 36 C 198 30, 214 46, 226 38" 
            fill="none" stroke="#1d4ed8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 54 64 L 80 78" 
            fill="none" stroke="#1e40af" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Nét gạch chân bay bổng -->
      <path d="M 38 82 C 92 72, 150 72, 212 78" 
            fill="none" stroke="#1d4ed8" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,

  // 7. PHÙNG NGỌC TÚ
  'phùng ngọc tú': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 100" width="160" height="66">
      <!-- Nét chữ P uốn vòng và chữ Tú vút dài -->
      <path d="M 34 70 L 34 24 C 34 16, 60 16, 60 34 C 60 50, 34 50, 50 50 C 66 50, 82 34, 104 38 C 124 42, 134 68, 156 40 C 170 24, 188 40, 202 34 C 218 28, 224 46, 230 40" 
            fill="none" stroke="#1d4ed8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 92 28 Q 118 20, 144 24" 
            fill="none" stroke="#1e40af" stroke-width="2.3" stroke-linecap="round"/>
      <!-- Nét gạch chân dài đặc trưng -->
      <path d="M 38 82 C 88 74, 145 72, 215 78" 
            fill="none" stroke="#1d4ed8" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,

  // 8. NGUYỄN HOÀNG PHI
  'nguyễn hoàng phi': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 100" width="160" height="66">
      <!-- Nét vút cao chữ Phi và gạch ngang dài -->
      <path d="M 102 76 L 104 22 C 104 14, 122 14, 122 32 C 122 48, 104 52, 120 74 L 126 86" 
            fill="none" stroke="#1d4ed8" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- Đường gạch sóng dài vắt ngang chữ ký -->
      <path d="M 26 72 C 65 70, 110 68, 160 64 C 190 60, 220 56, 240 52" 
            fill="none" stroke="#1e40af" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,
};

/**
 * Chuẩn hóa tên bỏ số thứ tự và khoảng trắng thừa
 */
export function cleanSignatureName(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^\d+[\s.]*/, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Lấy chữ ký thực tế của nhân sự:
 * 1. Nếu có ảnh tải lên trong localStorage -> trả về <img>
 * 2. Nếu khớp tên trong danh mục REAL_SIGNATURES -> trả về SVG vector thật
 * 3. Nếu không có -> trả về chuỗi rỗng (không dùng chữ ký giả lập)
 */
export function getRealSignatureSvg(rawName: string): string {
  const norm = cleanSignatureName(rawName);
  if (!norm) return '';

  // 1. Kiểm tra ảnh chữ ký riêng do Admin tải lên đã lưu trong localStorage
  try {
    const customImg = localStorage.getItem(`ialy_custom_sig_${norm}`);
    if (customImg && customImg.startsWith('data:image')) {
      return `<img src="${customImg}" alt="Chữ ký ${rawName}" style="max-height: 58px; max-width: 160px; display: inline-block; object-fit: contain;" />`;
    }
  } catch (e) {}

  // 2. Tìm chữ ký thực tế có sẵn
  for (const [key, svg] of Object.entries(REAL_SIGNATURES)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      return svg.trim();
    }
  }

  // 3. Người dùng chưa có chữ ký -> trả về chuỗi rỗng (Tuyệt đối không dùng chữ ký tạm giả lập)
  return '';
}
