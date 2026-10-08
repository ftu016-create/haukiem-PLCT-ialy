// Dịch vụ quản lý và tạo chữ ký điện tử cho các thành viên tổ hậu kiểm Ialy
import {
  cleanSignatureName,
  getRealSignatureSvg,
  REAL_SIGNATURES,
} from '../data/signatureData';

export { cleanSignatureName, getRealSignatureSvg, REAL_SIGNATURES };

export function cleanName(raw: string): string {
  return cleanSignatureName(raw);
}

/**
 * Kiểm tra xem người này có chữ ký tùy chỉnh (ảnh đã tải lên) trong localStorage hay không
 */
export function hasCustomSignature(rawName: string): boolean {
  const norm = cleanSignatureName(rawName);
  try {
    const customImg = localStorage.getItem(`ialy_custom_sig_${norm}`);
    return !!(customImg && customImg.startsWith('data:image'));
  } catch (e) {
    return false;
  }
}

/**
 * Lấy mã HTML/SVG của chữ ký cho một người cụ thể
 * Trả về chuỗi rỗng nếu không có chữ ký (không dùng chữ ký giả lập tạm thời)
 */
export function getMemberSignatureSvg(rawName: string): string {
  return getRealSignatureSvg(rawName);
}

/**
 * Chuyển đổi SVG hoặc ảnh thành Base64 Data URI để nhúng vào văn bản Word
 */
export function getMemberSignatureDataUri(rawName: string): string {
  const norm = cleanSignatureName(rawName);

  try {
    const customImg = localStorage.getItem(`ialy_custom_sig_${norm}`);
    if (customImg && customImg.startsWith('data:image')) {
      return customImg;
    }
  } catch (e) {}

  const svgStr = getRealSignatureSvg(rawName);
  if (!svgStr) return '';

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
 * Cắt một vùng hình chữ nhật từ ảnh chữ ký
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
  const norm = cleanSignatureName(rawName);
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
 * Xóa ảnh chữ ký tùy chỉnh, quay về chữ ký thực tế mặc định
 */
export function resetCustomMemberSignature(rawName: string): void {
  const norm = cleanSignatureName(rawName);
  try {
    localStorage.removeItem(`ialy_custom_sig_${norm}`);
  } catch (e) {}
}

/**
 * Tạo Base64 PNG của chữ ký để chèn ảnh nội tuyến vào tài liệu Word MHTML
 */
export function createSignatureCanvasBase64(rawName: string): string {
  const norm = cleanSignatureName(rawName);

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

  // 2. Nếu có chữ ký vector thực tế, chuyển sang Data URI
  const svgStr = getRealSignatureSvg(rawName);
  if (!svgStr) return '';

  if (svgStr.startsWith('<img')) {
    const match = svgStr.match(/src="data:image\/[^;]+;base64,([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
}
