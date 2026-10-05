import {
  MonthlyBreakdown,
  NormalizedRecord,
  PersonStat,
  StatisticsOverview,
} from '../types';
import { calculateWorkshopAnalysis } from '../engine/statisticsEngine';

function createDonutChartBase64(
  percentage: number,
  primaryColor: string,
  trackColor: string,
  valueText: string
): string {
  try {
    const canvas = document.createElement('canvas');
    const size = 240;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const cx = size / 2;
    const cy = size / 2;
    const radius = 88;
    const strokeWidth = 26;

    // 1. Transparent background
    ctx.clearRect(0, 0, size, size);

    // 2. Track ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = trackColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // 3. Progress arc
    const validPct = Math.min(Math.max(percentage, 0), 100);
    if (validPct > 0) {
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (validPct / 100) * (Math.PI * 2);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // 4. Center text: Percentage (bold Times New Roman)
    ctx.font = 'bold 44px "Times New Roman", Times, serif';
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(valueText, cx, cy);

    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.replace(/^data:image\/png;base64,/, '');
  } catch (e) {
    console.error('Failed to generate donut chart image for Word', e);
    return '';
  }
}

function wrapBase64(str: string, width = 76): string {
  let result = '';
  for (let i = 0; i < str.length; i += width) {
    result += str.substring(i, i + width) + '\r\n';
  }
  return result;
}

/**
 * Export official report directly to Microsoft Word (.doc)
 * Fully compliant with EVN administrative document layout standards (Nghị định 30/2020/NĐ-CP):
 * - Page format: A4
 * - Font: Times New Roman, cỡ chữ 13pt
 * - Margins: Lề trái 3cm (30mm), lề trên 2cm (20mm), lề dưới 2cm (20mm), lề phải 2cm (20mm)
 * - Paragraph Spacing: Before 6pt, After 6pt, Line spacing Single
 * - Pure black text for all document contents and tables (không tô màu nền bảng)
 * - Circular Donut charts retain visual color indicators
 */
export function exportToWord({
  overview,
  records,
  personalStats,
  monthlyStats,
  reportType,
  reportMonth,
  reportYear,
  customNotes,
  evaluationNote,
}: {
  overview: StatisticsOverview;
  records: NormalizedRecord[];
  personalStats: PersonStat[];
  monthlyStats: MonthlyBreakdown[];
  reportType: 'month' | 'year';
  reportMonth: number;
  reportYear: number;
  customNotes?: { [key: number]: string };
  evaluationNote?: string;
}) {
  const workshopStats = calculateWorkshopAnalysis(records, personalStats);

  const titleText =
    reportType === 'month'
      ? `Về việc kết quả hậu kiểm PCT, LCT tháng ${reportMonth < 10 ? '0' + reportMonth : reportMonth}/${reportYear}`
      : `Về việc kết quả hậu kiểm PCT, LCT năm ${reportYear}`;

  // Ghi chú mặc định để trống cho thoáng theo yêu cầu người dùng
  const notes = {
    1: customNotes?.[1] || '',
    2: customNotes?.[2] || '',
    3: customNotes?.[3] || '',
    4: customNotes?.[4] || '',
    5: customNotes?.[5] || '',
    6: customNotes?.[6] || '',
    7: customNotes?.[7] || '',
  };

  // Tạo ảnh biểu đồ tròn định dạng PNG base64 để nhúng MHTML cho Microsoft Word
  const pctBase64 = wrapBase64(
    createDonutChartBase64(
      Number(overview.pctErrorRate) || 0,
      '#2563eb',
      '#dbeafe',
      `${overview.pctErrorRate}%`
    )
  );

  const lctBase64 = wrapBase64(
    createDonutChartBase64(
      Number(overview.lctErrorRate) || 0,
      '#059669',
      '#d1fae5',
      `${overview.lctErrorRate}%`
    )
  );

  const totalBase64 = wrapBase64(
    createDonutChartBase64(
      Number(overview.errorRate) || 0,
      '#e11d48',
      '#ffe4e6',
      `${overview.errorRate}%`
    )
  );

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Báo cáo hậu kiểm PCT, LCT</title>
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* Khổ A4 chuẩn */
      margin: 2.0cm 2.0cm 2.0cm 3.0cm; /* Lề chuẩn Nghị định 30: Trên 2cm, Dưới 2cm, Phải 2cm, Trái 3cm */
      mso-header-margin: 36.0pt;
      mso-footer-margin: 36.0pt;
      mso-paper-source: 0;
    }
    div.Section1 { page: Section1; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      line-height: 1.25;
      color: #000000;
      margin: 0;
      padding: 0;
    }
    /* Tiêu ngữ: 0pt 0pt, Single line spacing theo yêu cầu */
    .header-table, .header-table td, .header-table tr, .header-table div {
      border: none !important;
      padding: 0;
      background-color: transparent !important;
      margin-top: 0pt !important;
      margin-bottom: 0pt !important;
      mso-para-margin-top: 0pt !important;
      mso-para-margin-bottom: 0pt !important;
      mso-para-margin: 0pt !important;
      line-height: 100% !important;
      mso-line-height-rule: exactly;
    }
    /* Đoạn với đoạn: 6pt 6pt theo yêu cầu */
    p {
      margin-top: 6pt;
      margin-bottom: 6pt;
      mso-para-margin-top: 6pt;
      mso-para-margin-bottom: 6pt;
      line-height: 1.25;
      color: #000000;
    }
    .report-title {
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
      margin-top: 6pt;
      margin-bottom: 4pt;
      mso-para-margin-top: 6pt;
      mso-para-margin-bottom: 4pt;
      color: #000000;
      line-height: 1.2;
    }
    .report-subtitle {
      font-size: 13pt;
      font-weight: bold;
      text-align: center;
      margin-top: 0pt;
      margin-bottom: 6pt;
      mso-para-margin-top: 0pt;
      mso-para-margin-bottom: 6pt;
      color: #000000;
      line-height: 1.2;
    }
    .section-title {
      font-weight: bold;
      font-size: 13pt;
      margin-top: 6pt;
      margin-bottom: 6pt;
      mso-para-margin-top: 6pt;
      mso-para-margin-bottom: 6pt;
      color: #000000;
      line-height: 1.2;
    }
    /* Cái bảng căn như hình: Before 0pt, After 0pt, Line spacing Single */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6pt;
      margin-bottom: 6pt;
      mso-para-margin-top: 6pt;
      mso-para-margin-bottom: 6pt;
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      color: #000000;
    }
    table.data-table th, table.data-table td, table.data-table p, table.data-table div {
      border: 1px solid #000000;
      padding: 4.5pt 6pt;
      font-size: 12pt;
      font-family: 'Times New Roman', Times, serif;
      vertical-align: middle;
      color: #000000;
      margin-top: 0pt !important;
      margin-bottom: 0pt !important;
      mso-para-margin-top: 0pt !important;
      mso-para-margin-bottom: 0pt !important;
      mso-para-margin: 0pt !important;
      line-height: 100% !important;
      mso-line-height-rule: exactly;
      text-indent: 0cm !important;
      background-color: transparent !important;
    }
    table.data-table th {
      font-weight: bold;
      text-align: center;
      background-color: transparent !important;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- Header Block Chuẩn văn bản hành chính (Tiêu ngữ 0pt 0pt, cột phải 62% và cỡ chữ 11pt để không bị rớt chữ NAM) -->
    <table class="header-table" style="width: 100%; margin-top: 0pt; margin-bottom: 12pt; border: none !important;">
      <tr>
        <td style="width: 38%; text-align: center; vertical-align: top; padding: 0; border: none !important;">
          <div style="font-size: 11.5pt; font-weight: bold; color: #000000; text-transform: uppercase; margin: 0; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; line-height: 100%; mso-line-height-rule: exactly;">CÔNG TY THỦY ĐIỆN IALY</div>
          <div style="font-size: 11.5pt; font-weight: bold; color: #000000; text-transform: uppercase; margin: 0; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; line-height: 100%; mso-line-height-rule: exactly;">PX VẬN HÀNH IALY</div>
          <div style="width: 115px; border-bottom: 1px solid #000000; margin: 2pt auto 0 auto;"></div>
        </td>
        <td style="width: 62%; text-align: center; vertical-align: top; padding: 0; border: none !important;" nowrap="nowrap">
          <div style="font-size: 11pt; font-weight: bold; color: #000000; text-transform: uppercase; white-space: nowrap; word-break: keep-all; margin: 0; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; line-height: 100%; mso-line-height-rule: exactly;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 11.5pt; font-weight: bold; color: #000000; white-space: nowrap; margin: 0; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; line-height: 100%; mso-line-height-rule: exactly;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="width: 145px; border-bottom: 1px solid #000000; margin: 2pt auto 4pt auto;"></div>
          <div style="font-size: 11pt; font-style: italic; color: #000000; white-space: nowrap; margin: 0; margin-top: 0pt; margin-bottom: 0pt; mso-para-margin-top: 0pt; mso-para-margin-bottom: 0pt; line-height: 100%; mso-line-height-rule: exactly;">Gia Lai, ngày ..... tháng ..... năm 202...</div>
        </td>
      </tr>
    </table>

    <!-- Tiêu đề Báo cáo (Đoạn với đoạn 6pt 6pt) -->
    <div style="text-align: center; margin-top: 6pt; margin-bottom: 6pt;">
      <div class="report-title">BÁO CÁO</div>
      <div class="report-subtitle">${titleText}</div>
    </div>

    <!-- Section I: Biểu đồ trực quan và Kết quả kiểm tra (6pt 6pt) -->
    <div class="section-title">
      <b>I. Biểu đồ tỷ lệ vi phạm & kết quả soát phiếu công tác, lệnh công tác</b>
    </div>

    <!-- 3 Cột Biểu đồ phần trăm dạng tròn trực quan (Sửa chữ TỔNG PHIẾU + LỆNH LỖI luôn trên 1 dòng duy nhất) -->
    <table class="header-table" style="width: 100%; margin-top: 6pt; margin-bottom: 12pt; border: none !important;">
      <tr>
        <!-- Cột 1: Phiếu công tác (PCT) lỗi -->
        <td style="width: 33.3%; padding: 4pt 2pt; vertical-align: top; text-align: center; border: none !important;" nowrap="nowrap">
          <div style="font-weight: bold; font-size: 10pt; color: #1e40af; text-align: center; margin-bottom: 4pt; text-transform: uppercase; white-space: nowrap; word-break: keep-all;" nowrap="nowrap">
            PHIẾU CÔNG TÁC (PCT)
          </div>
          <div style="text-align: center; margin: 4pt 0;">
            <img src="chart_pct.png" width="96" height="96" alt="${overview.pctErrorRate}%" style="display: block; margin: 0 auto; width: 96px; height: 96px; border: none !important;" />
          </div>
          <div style="font-size: 11pt; text-align: center; color: #000000; margin-top: 4pt; white-space: nowrap;" nowrap="nowrap">
            <b>${overview.pctWithErrors}</b> / ${overview.totalPCT} phiếu có lỗi
          </div>
        </td>

        <!-- Cột 2: Lệnh công tác (LCT) lỗi -->
        <td style="width: 33.3%; padding: 4pt 2pt; vertical-align: top; text-align: center; border: none !important;" nowrap="nowrap">
          <div style="font-weight: bold; font-size: 10pt; color: #065f46; text-align: center; margin-bottom: 4pt; text-transform: uppercase; white-space: nowrap; word-break: keep-all;" nowrap="nowrap">
            LỆNH CÔNG TÁC (LCT)
          </div>
          <div style="text-align: center; margin: 4pt 0;">
            <img src="chart_lct.png" width="96" height="96" alt="${overview.lctErrorRate}%" style="display: block; margin: 0 auto; width: 96px; height: 96px; border: none !important;" />
          </div>
          <div style="font-size: 11pt; text-align: center; color: #000000; margin-top: 4pt; white-space: nowrap;" nowrap="nowrap">
            <b>${overview.lctWithErrors}</b> / ${overview.totalLCT} lệnh có lỗi
          </div>
        </td>

        <!-- Cột 3: Tổng Phiếu + Lệnh lỗi (Cố định 1 dòng, không bị xuống dòng theo yêu cầu Hình 1) -->
        <td style="width: 33.3%; padding: 4pt 2pt; vertical-align: top; text-align: center; border: none !important;" nowrap="nowrap">
          <div style="font-weight: bold; font-size: 10pt; color: #9f1239; text-align: center; margin-bottom: 4pt; text-transform: uppercase; white-space: nowrap; word-break: keep-all;" nowrap="nowrap">
            TỔNG PHIẾU + LỆNH LỖI
          </div>
          <div style="text-align: center; margin: 4pt 0;">
            <img src="chart_total.png" width="96" height="96" alt="${overview.errorRate}%" style="display: block; margin: 0 auto; width: 96px; height: 96px; border: none !important;" />
          </div>
          <div style="font-size: 11pt; text-align: center; color: #000000; margin-top: 4pt; white-space: nowrap;" nowrap="nowrap">
            <b>${overview.documentsWithErrors}</b> / ${overview.totalDocuments} hồ sơ có lỗi
          </div>
        </td>
      </tr>
    </table>

    <!-- Bảng tổng hợp số liệu hành chính chuẩn (Không tô màu nền, toàn bộ chữ màu đen, chia cột chuẩn) -->
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 8%;">STT</th>
          <th style="width: 48%;">Chỉ số giám sát / Thống kê</th>
          <th style="width: 18%;">Kết quả</th>
          <th style="width: 26%;">Ghi chú</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center">1</td>
          <td>Tổng số Phiếu công tác (PCT) đã kiểm tra</td>
          <td class="text-center bold">${overview.totalPCT}</td>
          <td>${notes[1] || '&nbsp;'}</td>
        </tr>
        <tr>
          <td class="text-center">2</td>
          <td>Tổng số Lệnh công tác (LCT) đã kiểm tra</td>
          <td class="text-center bold">${overview.totalLCT}</td>
          <td>${notes[2] || '&nbsp;'}</td>
        </tr>
        <tr>
          <td class="text-center">3</td>
          <td class="bold">Tổng Phiếu và Lệnh công tác đã kiểm tra (Sau loại trùng)</td>
          <td class="text-center bold">${overview.totalDocuments}</td>
          <td>${notes[3] || '&nbsp;'}</td>
        </tr>
        <tr>
          <td class="text-center">4</td>
          <td>Số Phiếu và Lệnh công tác có vi phạm</td>
          <td class="text-center bold">${overview.documentsWithErrors}</td>
          <td>${notes[4] || '&nbsp;'}</td>
        </tr>
        <tr>
          <td class="text-center">5</td>
          <td>Tổng số lỗi phát hiện</td>
          <td class="text-center bold">${overview.totalErrors}</td>
          <td>${notes[5] || '&nbsp;'}</td>
        </tr>
        <tr>
          <td class="text-center">6</td>
          <td class="bold">Tỷ lệ Phiếu và Lệnh công tác vi phạm (%)</td>
          <td class="text-center bold">${overview.errorRate}%</td>
          <td>${notes[6] || '&nbsp;'}</td>
        </tr>
        <tr>
          <td class="text-center">7</td>
          <td>Số cá nhân liên đới phát hiện sai sót</td>
          <td class="text-center bold">${overview.totalPeopleWithErrors}</td>
          <td>${notes[7] || '&nbsp;'}</td>
        </tr>
      </tbody>
    </table>

    ${
      reportType === 'year'
        ? `
    <!-- Section II: 12 Months (Cột Tháng trên 1 dòng duy nhất, không ngắt dòng) -->
    <div class="section-title">
      <b>II. Diễn biến số liệu qua 12 tháng trong năm ${reportYear}</b>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 18%; white-space: nowrap; word-break: keep-all;" nowrap="nowrap">Tháng</th>
          <th style="width: 13%;">Số PCT</th>
          <th style="width: 13%;">Số LCT</th>
          <th style="width: 16%;">Tổng Phiếu/Lệnh</th>
          <th style="width: 13%;">Số vi phạm</th>
          <th style="width: 13%;">Tổng số lỗi</th>
          <th style="width: 14%;">Tỷ lệ vi phạm (%)</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyStats
          .map(
            (m) => `
        <tr>
          <td class="text-center bold" style="white-space: nowrap; word-break: keep-all;" nowrap="nowrap">${m.monthLabel.replace(/\s+/g, '&nbsp;')}</td>
          <td class="text-center">${m.pctCount}</td>
          <td class="text-center">${m.lctCount}</td>
          <td class="text-center bold">${m.totalDocuments}</td>
          <td class="text-center bold">${m.errorDocuments}</td>
          <td class="text-center bold">${m.totalErrors}</td>
          <td class="text-center">${m.errorRate}%</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    `
        : ''
    }

    <!-- Section: Workshop Breakdown (Bỏ cột Chức danh quy định theo yêu cầu) -->
    <div class="section-title">
      <b>${reportType === 'month' ? 'II.' : 'III.'} Tổng hợp theo phân xưởng (PXVH & PXSC)</b>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 40%; text-align: left;">Đơn vị / Phân xưởng</th>
          <th style="width: 15%;">Số cá nhân</th>
          <th style="width: 15%;">Phiếu/Lệnh vi phạm</th>
          <th style="width: 15%;">Tổng lỗi</th>
          <th style="width: 15%;">Tỷ trọng (%)</th>
        </tr>
      </thead>
      <tbody>
        ${workshopStats
          .map(
            (ws) => `
        <tr>
          <td class="bold">${ws.workshopName} (${ws.shortName})</td>
          <td class="text-center">${ws.peopleCount}</td>
          <td class="text-center bold">${ws.violationDocuments}</td>
          <td class="text-center bold">${ws.totalErrors}</td>
          <td class="text-center bold">${ws.errorShare}%</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    ${
      evaluationNote && evaluationNote.trim()
        ? `
    <!-- Section: Evaluation & Recommendations (Bỏ khung viền, thụt đầu dòng 1.27cm chuẩn hành chính) -->
    <div class="section-title">
      <b>${reportType === 'month' ? 'III.' : 'IV.'} Đánh giá, kiến nghị & ghi chú bổ sung</b>
    </div>
    <div style="margin-top: 6pt; margin-bottom: 6pt; mso-para-margin-top: 6pt; mso-para-margin-bottom: 6pt;">
      ${evaluationNote
        .split('\n')
        .filter((line) => line.trim())
        .map(
          (para) =>
            `<p style="text-indent: 1.27cm; margin-top: 6pt; margin-bottom: 6pt; mso-para-margin-top: 6pt; mso-para-margin-bottom: 6pt; line-height: 1.25; text-align: justify; font-size: 13pt; color: #000000;">${para}</p>`
        )
        .join('')}
    </div>
    `
        : ''
    }

    <!-- Signature -->
    <table class="header-table" style="width: 100%; margin-top: 24pt; border: none !important;">
      <tr>
        <td style="width: 50%; border: none !important;"></td>
        <td style="width: 50%; text-align: center; border: none !important;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12.5pt; color: #000000; line-height: 1.25;">NGƯỜI LẬP BÁO CÁO</div>
          <div style="font-size: 11pt; font-style: italic; color: #000000; line-height: 1.25; margin-top: 2pt;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 65px;"></div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  // Đóng gói tài liệu MHTML Multipart để Microsoft Word hiển thị biểu đồ tròn dạng ảnh nội tuyến
  const boundary = '----=_NextPart_Office_Report_Doc';
  const mhtmlContent = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: 8bit

${htmlContent}

--${boundary}
Content-Type: image/png
Content-Transfer-Encoding: base64
Content-Location: chart_pct.png

${pctBase64}

--${boundary}
Content-Type: image/png
Content-Transfer-Encoding: base64
Content-Location: chart_lct.png

${lctBase64}

--${boundary}
Content-Type: image/png
Content-Transfer-Encoding: base64
Content-Location: chart_total.png

${totalBase64}

--${boundary}--
`;

  const blob = new Blob(['\ufeff' + mhtmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName =
    reportType === 'month'
      ? `Bao_cao_hau_kiem_thang_${reportMonth < 10 ? '0' + reportMonth : reportMonth}_${reportYear}.doc`
      : `Bao_cao_hau_kiem_nam_${reportYear}.doc`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Triggers standard browser print dialog for high-quality administrative PDF export
 */
export function triggerPrintReport() {
  window.print();
}
