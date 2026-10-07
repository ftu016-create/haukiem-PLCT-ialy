// Dịch vụ quản lý và tạo chữ ký điện tử cho các thành viên tổ hậu kiểm Ialy

// Bộ chữ ký mẫu dạng SVG vector với nét bút mực xanh (#1e40af / #1d4ed8) chân thực chuẩn Ialy
const PRESET_SIGNATURES: Record<string, string> = {
  'trần thanh chương': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 95" width="165" height="68">
      <path d="M 25 58 C 35 25, 48 12, 65 24 C 80 34, 58 72, 75 62 C 92 50, 102 28, 120 36 C 132 44, 125 60, 142 44 C 158 28, 175 35, 192 42 C 205 46, 218 38, 228 36" fill="none" stroke="#1d4ed8" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 42 38 Q 65 28 92 36 T 138 32" fill="none" stroke="#1e40af" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M 32 74 C 75 66, 130 63, 195 67 C 212 68, 222 62, 232 58" fill="none" stroke="#1e40af" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 175 52 C 185 58, 202 60, 215 54" fill="none" stroke="#2563eb" stroke-width="2.1" stroke-linecap="round"/>
    </svg>
  `,
  'nguyễn văn toàn': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 95" width="160" height="68">
      <path d="M 22 64 C 32 30, 45 16, 60 26 C 72 36, 52 70, 80 46 C 96 32, 112 30, 126 44 C 138 56, 148 36, 170 38 C 186 40, 202 34, 215 48" fill="none" stroke="#1d4ed8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 48 26 Q 75 18 102 22" fill="none" stroke="#1e40af" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M 38 76 C 80 70, 135 66, 195 71 C 210 72, 220 67, 226 62" fill="none" stroke="#1d4ed8" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,
  'a ran': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 95" width="155" height="68">
      <path d="M 32 68 L 54 18 L 76 68 M 42 50 L 68 50" fill="none" stroke="#1d4ed8" stroke-width="2.9" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 96 68 L 96 32 C 96 20, 122 20, 122 38 C 122 52, 98 52, 110 52 L 134 68" fill="none" stroke="#1d4ed8" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 142 54 C 152 42, 168 42, 174 54 L 174 68 M 172 56 C 180 42, 196 42, 202 54 L 202 68" fill="none" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 28 78 C 70 72, 120 71, 195 76" fill="none" stroke="#1e40af" stroke-width="2.3" stroke-linecap="round"/>
    </svg>
  `,
  'võ quang minh': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 95" width="160" height="68">
      <path d="M 26 36 L 45 72 L 70 24 C 80 36, 64 62, 90 46 C 112 32, 122 50, 138 38 C 154 28, 170 38, 186 35 C 202 32, 212 50, 222 44" fill="none" stroke="#1d4ed8" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 132 46 C 144 62, 152 64, 160 50" fill="none" stroke="#1e40af" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M 38 78 C 85 68, 140 68, 208 75" fill="none" stroke="#1d4ed8" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `,
  'thái trần hoàng vũ': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 95" width="160" height="68">
      <path d="M 26 26 L 26 68 M 26 47 L 58 47 M 58 26 L 58 68" fill="none" stroke="#1d4ed8" stroke-width="2.7" stroke-linecap="round"/>
      <path d="M 80 40 L 98 72 L 122 34 C 132 48, 142 64, 156 42 C 168 26, 185 44, 200 36 C 212 31, 220 44, 228 40" fill="none" stroke="#1d4ed8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 32 80 C 80 73, 138 71, 208 77" fill="none" stroke="#1e40af" stroke-width="2.3" stroke-linecap="round"/>
    </svg>
  `,
  'nguyễn hồng quang': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 95" width="160" height="68">
      <path d="M 26 52 C 26 30, 48 22, 64 36 C 80 50, 64 74, 48 68 C 36 63, 48 44, 72 40 C 90 36, 112 50, 128 40 C 144 30, 165 44, 180 38 C 196 32, 212 47, 222 40" fill="none" stroke="#1d4ed8" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 52 63 L 78 76" fill="none" stroke="#1e40af" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M 38 80 C 90 71, 148 71, 208 76" fill="none" stroke="#1d4ed8" stroke-width="2.3" stroke-linecap="round"/>
    </svg>
  `,
  'phùng ngọc tú': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 95" width="160" height="68">
      <path d="M 32 68 L 32 26 C 32 18, 58 18, 58 36 C 58 52, 32 52, 48 52 C 64 52, 80 36, 102 40 C 122 44, 132 68, 154 42 C 168 26, 185 42, 200 36 C 215 31, 222 47, 228 42" fill="none" stroke="#1d4ed8" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 90 30 Q 116 21 142 25" fill="none" stroke="#1e40af" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M 38 79 C 85 73, 142 71, 210 77" fill="none" stroke="#1d4ed8" stroke-width="2.3" stroke-linecap="round"/>
    </svg>
  `,
};

// Chuẩn hóa tên để tìm chữ ký
export function cleanName(raw: string): string {
  return raw
    .replace(/^\d+[\s.]*/, '') // bỏ số thứ tự "1. ", "2. "
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Tạo chữ ký mẫu động cho bất kỳ tên nào chưa có sẵn trong danh sách
function generateDynamicSignatureSvg(name: string): string {
  const words = name.trim().split(/\s+/);
  const lastName = words[words.length - 1] || 'Ký';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 90" width="155" height="65">
      <path d="M 28 52 C 38 22, 55 16, 70 32 C 86 48, 65 68, 92 54 C 112 42, 128 36, 148 46 C 164 54, 180 40, 196 44" fill="none" stroke="#1d4ed8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 44 34 Q 75 24 108 30" fill="none" stroke="#1e40af" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M 32 70 C 72 63, 125 61, 188 67" fill="none" stroke="#1d4ed8" stroke-width="2.4" stroke-linecap="round"/>
      <text x="145" y="60" font-family="'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive, sans-serif" font-size="17" fill="#1e40af" font-style="italic" opacity="0.75">${lastName}</text>
    </svg>
  `;
}

/**
 * Kiểm tra xem người này có chữ ký tùy chỉnh (ảnh hoặc vẽ tay) đã lưu không
 */
export function hasCustomSignature(rawName: string): boolean {
  const norm = cleanName(rawName);
  try {
    const customImg = localStorage.getItem(`ialy_custom_sig_${norm}`);
    return !!(customImg && customImg.startsWith('data:image'));
  } catch (e) {
    return false;
  }
}

/**
 * Lấy mã HTML/SVG của chữ ký cho một người cụ thể
 */
export function getMemberSignatureSvg(rawName: string): string {
  const norm = cleanName(rawName);

  // 1. Kiểm tra xem người dùng có tải lên ảnh chữ ký riêng không trong localStorage
  try {
    const customImg = localStorage.getItem(`ialy_custom_sig_${norm}`);
    if (customImg && customImg.startsWith('data:image')) {
      return `<img src="${customImg}" alt="Chữ ký ${rawName}" style="max-height: 60px; max-width: 155px; display: inline-block; object-fit: contain;" />`;
    }
  } catch (e) {}

  // 2. Tìm chữ ký mẫu có sẵn
  for (const [key, svg] of Object.entries(PRESET_SIGNATURES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return svg.trim();
    }
  }

  // 3. Tạo chữ ký vector động
  return generateDynamicSignatureSvg(rawName).trim();
}

/**
 * Chuyển đổi SVG hoặc ảnh thành Base64 Data URI để nhúng vào văn bản Word
 */
export function getMemberSignatureDataUri(rawName: string): string {
  const norm = cleanName(rawName);

  try {
    const customImg = localStorage.getItem(`ialy_custom_sig_${norm}`);
    if (customImg && customImg.startsWith('data:image')) {
      return customImg;
    }
  } catch (e) {}

  const svgStr = getMemberSignatureSvg(rawName);
  if (svgStr.startsWith('<img')) {
    const match = svgStr.match(/src="([^"]+)"/);
    if (match) return match[1];
  }

  // Mã hóa SVG sang data uri
  const encoded = encodeURIComponent(svgStr)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;utf8,${encoded}`;
}

/**
 * Tự động làm sạch nền trắng/xám của ảnh chụp chữ ký thành trong suốt
 * và làm nổi bật nét mực xanh bi
 */
export async function cleanImageBackground(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Xử lý từng pixel: loại bỏ màu nền trắng/xám giấy chụp
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Độ sáng của pixel
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          if (brightness > 215) {
            // Nền giấy sáng -> làm trong suốt hoàn toàn
            data[i + 3] = 0;
          } else if (brightness > 185) {
            // Vùng chuyển tiếp mờ
            data[i + 3] = Math.round((215 - brightness) * 8);
          } else {
            // Nét mực: tăng độ tương phản nét bút
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrl);
    }
  });
}

/**
 * Cắt một vùng hình chữ nhật từ ảnh chữ ký chung
 */
export async function cropImageArea(
  dataUrl: string,
  box: { x: number; y: number; width: number; height: number; imgWidth: number; imgHeight: number }
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = async () => {
        const scaleX = img.width / box.imgWidth;
        const scaleY = img.height / box.imgHeight;

        const cropX = Math.max(0, box.x * scaleX);
        const cropY = Math.max(0, box.y * scaleY);
        const cropW = Math.min(img.width - cropX, box.width * scaleX);
        const cropH = Math.min(img.height - cropY, box.height * scaleY);

        if (cropW <= 0 || cropH <= 0) {
          resolve(dataUrl);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = cropW;
        canvas.height = cropH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        const rawCrop = canvas.toDataURL('image/png');
        const cleaned = await cleanImageBackground(rawCrop);
        resolve(cleaned);
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrl);
    }
  });
}

/**
 * Lưu ảnh chữ ký tải lên từ file cho người dùng (tự động làm sạch nền)
 */
export async function saveCustomMemberSignature(rawName: string, dataUrl: string): Promise<string> {
  const norm = cleanName(rawName);
  try {
    const cleaned = await cleanImageBackground(dataUrl);
    localStorage.setItem(`ialy_custom_sig_${norm}`, cleaned);
    return cleaned;
  } catch (e) {
    console.error('Không thể lưu ảnh chữ ký:', e);
    try {
      localStorage.setItem(`ialy_custom_sig_${norm}`, dataUrl);
    } catch (err) {}
    return dataUrl;
  }
}

/**
 * Xóa ảnh chữ ký tùy chỉnh, quay về chữ ký mặc định
 */
export function resetCustomMemberSignature(rawName: string): void {
  const norm = cleanName(rawName);
  try {
    localStorage.removeItem(`ialy_custom_sig_${norm}`);
  } catch (e) {}
}

/**
 * Tạo Base64 PNG của chữ ký để chèn ảnh nội tuyến vào tài liệu Word MHTML
 */
export function createSignatureCanvasBase64(rawName: string): string {
  const norm = cleanName(rawName);

  // 1. Kiểm tra ảnh tải lên tùy chỉnh (PNG, JPEG, WEBP...)
  try {
    const customImg = localStorage.getItem(`ialy_custom_sig_${norm}`);
    if (customImg && customImg.startsWith('data:image')) {
      const match = customImg.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (e) {}

  // 2. Vẽ chữ ký nét mực xanh chuyên nghiệp trên canvas
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, 240, 90);

    // Vẽ nét bút mực xanh (#1d4ed8) chân thực
    ctx.strokeStyle = '#1d4ed8';
    ctx.fillStyle = '#1e40af';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Vẽ nét uốn lượn chữ ký
    ctx.beginPath();
    ctx.moveTo(35, 55);
    ctx.bezierCurveTo(45, 25, 60, 15, 75, 28);
    ctx.bezierCurveTo(90, 42, 65, 72, 85, 58);
    ctx.bezierCurveTo(105, 45, 120, 25, 140, 38);
    ctx.bezierCurveTo(155, 48, 165, 35, 185, 40);
    ctx.bezierCurveTo(200, 44, 215, 36, 225, 42);
    ctx.stroke();

    // Nét gạch dưới phóng khoáng đặc trưng của chữ ký
    ctx.beginPath();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2.4;
    ctx.moveTo(40, 72);
    ctx.bezierCurveTo(80, 64, 140, 62, 215, 68);
    ctx.stroke();

    // Tên viết tay nghệ thuật phía đuôi
    const words = rawName.replace(/^\d+[\s.]*/, '').trim().split(/\s+/);
    const shortSign = words[words.length - 1] || 'Ký';
    ctx.font = 'italic 16px "Brush Script MT", "Dancing Script", "Segoe Script", cursive, sans-serif';
    ctx.fillText(shortSign, 150, 58);

    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.replace(/^data:image\/png;base64,/, '');
  } catch (e) {
    console.error('Lỗi khi vẽ chữ ký canvas:', e);
    return '';
  }
}
