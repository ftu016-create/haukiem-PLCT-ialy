import {
  MonthlyBreakdown,
  NormalizedRecord,
  PersonStat,
  StatisticsOverview,
} from '../types';
import {
  calculateWorkshopAnalysis,
  getDetailedViolationList,
  DEFAULT_RECOMMENDATIONS,
} from '../engine/statisticsEngine';

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
 * Fully compliant with EVN administrative document layout standards (Nghị định 30/2020/NĐ-CP)
 */
export function exportToWord({
  overview,
  records,
  personalStats,
  monthlyStats,
  reportType,
  reportMonth,
  reportYear,
  recommendationsText,
  auditMembers,
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
  recommendationsText?: string;
  auditMembers?: string[];
  customNotes?: any;
  evaluationNote?: string;
}) {
  const workshopStats = calculateWorkshopAnalysis(records, personalStats);
  const { pctViolations, lctViolations } = getDetailedViolationList(records);

  const titleText =
    reportType === 'month'
      ? `Về việc kết quả hậu kiểm PCT, LCT tháng ${reportMonth < 10 ? '0' + reportMonth : reportMonth}/${reportYear}`
      : `Về việc kết quả hậu kiểm PCT, LCT năm ${reportYear}`;

  // Chuẩn bị danh sách kiến nghị (dựa trên văn bản người dùng chỉnh sửa hoặc mặc định)
  const recParagraphs = recommendationsText && recommendationsText.trim()
    ? recommendationsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : DEFAULT_RECOMMENDATIONS.map((r) => `- ${r}`);

  // Chuẩn bị danh sách thành viên tham gia hậu kiểm
  const members = auditMembers && auditMembers.length > 0
    ? auditMembers
    : [
        'Nguyễn Văn Toàn',
        'A Ran',
        'Võ Quang Minh',
        'Thái Trần Hoàng Vũ',
        'Nguyễn Hồng Quang',
        'Phùng Ngọc Tú',
      ];

  const midPoint = Math.ceil(members.length / 2);
  const leftColMembers = members.slice(0, midPoint);
  const rightColMembers = members.slice(midPoint);

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
    .indent-para {
      text-indent: 1.27cm !important;
      mso-char-indent-count: 0 !important;
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
      margin-bottom: 8pt;
      mso-para-margin-top: 0pt;
      mso-para-margin-bottom: 8pt;
      color: #000000;
      line-height: 1.2;
    }
    .section-title {
      font-weight: bold;
      font-size: 13pt;
      margin-top: 14pt;
      margin-bottom: 6pt;
      mso-para-margin-top: 14pt;
      mso-para-margin-bottom: 6pt;
      color: #000000;
      line-height: 1.25;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4pt;
      margin-bottom: 6pt;
      mso-para-margin-top: 4pt;
      mso-para-margin-bottom: 6pt;
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      color: #000000;
    }
    table.data-table th, table.data-table td, table.data-table p, table.data-table div {
      border: 1px solid #000000;
      padding: 4.5pt 5.5pt;
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
    <!-- Header Block Chuẩn văn bản hành chính -->
    <table class="header-table" style="width: 100%; margin-top: 0pt; margin-bottom: 12pt; border: none !important;">
      <tr>
        <td style="width: 38%; text-align: center; vertical-align: top; padding: 0; border: none !important;">
          <div style="font-size: 11.5pt; font-weight: bold; color: #000000; text-transform: uppercase; margin: 0; line-height: 100%;">CÔNG TY THỦY ĐIỆN IALY</div>
          <div style="font-size: 11.5pt; font-weight: bold; color: #000000; text-transform: uppercase; margin: 0; line-height: 100%;">PX VẬN HÀNH IALY</div>
          <div style="width: 115px; border-bottom: 1px solid #000000; margin: 2pt auto 0 auto;"></div>
        </td>
        <td style="width: 62%; text-align: center; vertical-align: top; padding: 0; border: none !important;" nowrap="nowrap">
          <div style="font-size: 11pt; font-weight: bold; color: #000000; text-transform: uppercase; white-space: nowrap; word-break: keep-all; margin: 0; line-height: 100%;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 11.5pt; font-weight: bold; color: #000000; white-space: nowrap; margin: 0; line-height: 100%;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="width: 145px; border-bottom: 1px solid #000000; margin: 2pt auto 4pt auto;"></div>
          <div style="font-size: 11pt; font-style: italic; color: #000000; white-space: nowrap; margin: 0; line-height: 100%;">Gia Lai, ngày ..... tháng ..... năm 202...</div>
        </td>
      </tr>
    </table>

    <!-- Tiêu đề Báo cáo -->
    <div style="text-align: center; margin-top: 6pt; margin-bottom: 6pt;">
      <div class="report-title">BÁO CÁO</div>
      <div class="report-subtitle">${titleText}</div>
    </div>

    <!-- ========================================================================= -->
    <!-- MỤC I: VIỆC THỰC HIỆN PCT -->
    <!-- ========================================================================= -->
    <div class="section-title">
      <b>I. Việc thực hiện PCT:</b>
    </div>

    <!-- Bảng danh sách chi tiết các phiếu công tác có nội dung không phù hợp -->
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 8%;">Số</th>
          <th rowspan="2" style="width: 9%;">Loại</th>
          <th rowspan="2" style="width: 37%;">Nội dung không phù hợp</th>
          <th colspan="2" style="width: 26%;">Người liên quan</th>
          <th rowspan="2" style="width: 20%;">Lý do không phù hợp</th>
        </tr>
        <tr>
          <th style="width: 13%;">VHIALY</th>
          <th style="width: 13%;">PXSC</th>
        </tr>
      </thead>
      <tbody>
        ${
          pctViolations.length > 0
            ? pctViolations
                .map(
                  (v) => `
        <tr>
          <td class="text-center bold">${v.docNumber}</td>
          <td class="text-center">${v.workType}</td>
          <td>${v.content}</td>
          <td class="text-center">${v.vhialyPerson}</td>
          <td class="text-center">${v.pxscPerson}</td>
          <td>${v.reason}</td>
        </tr>`
                )
                .join('')
            : `
        <tr>
          <td colspan="6" class="text-center italic" style="padding: 10pt;">Không phát hiện nội dung không phù hợp trong kỳ kiểm tra.</td>
        </tr>`
        }
      </tbody>
    </table>

    <!-- Tiêu đề phân cách rõ ràng để 2 bảng KHÔNG BỊ DÍNH SÁT NHAU -->
    <p style="font-weight: bold; font-size: 11pt; margin-top: 14pt; margin-bottom: 4pt; color: #000000; mso-para-margin-top: 14pt; mso-para-margin-bottom: 4pt;">
      <b>* Tổng hợp số liệu Phiếu công tác (PCT):</b>
    </p>

    <!-- Bảng tổng hợp số liệu PCT chuẩn mẫu đính kèm -->
    <table class="data-table" style="margin-top: 4pt; margin-bottom: 14pt;">
      <thead>
        <tr>
          <th style="width: 20%;">PCT đã cấp số</th>
          <th style="width: 20%;">PCT không thực hiện</th>
          <th style="width: 20%;">PCT giấy</th>
          <th style="width: 20%;">PCT đang thực hiện</th>
          <th style="width: 20%;">PCT không phù hợp</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center bold">${overview.totalPCT}</td>
          <td class="text-center">0</td>
          <td class="text-center">0</td>
          <td class="text-center">${overview.pctValid}</td>
          <td class="text-center bold" style="color: #000000;">${overview.pctWithErrors}</td>
        </tr>
        <tr>
          <td class="text-center italic">100%</td>
          <td class="text-center italic">0%</td>
          <td class="text-center italic">0%</td>
          <td class="text-center italic">${overview.totalPCT > 0 ? (100 - Number(overview.pctErrorRate)).toFixed(2) : '100'}%</td>
          <td class="text-center italic bold">${overview.pctErrorRate}%</td>
        </tr>
      </tbody>
    </table>

    <!-- ========================================================================= -->
    <!-- MỤC II: VIỆC THỰC HIỆN LCT -->
    <!-- ========================================================================= -->
    <div class="section-title" style="margin-top: 16pt;">
      <b>II. Việc thực hiện LCT:</b>
    </div>

    <!-- Bảng danh sách chi tiết các lệnh công tác có nội dung không phù hợp -->
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 8%;">Số</th>
          <th rowspan="2" style="width: 9%;">Loại</th>
          <th rowspan="2" style="width: 37%;">Nội dung không phù hợp</th>
          <th colspan="2" style="width: 26%;">Người liên quan</th>
          <th rowspan="2" style="width: 20%;">Lý do không phù hợp</th>
        </tr>
        <tr>
          <th style="width: 13%;">VHIALY</th>
          <th style="width: 13%;">PXSC</th>
        </tr>
      </thead>
      <tbody>
        ${
          lctViolations.length > 0
            ? lctViolations
                .map(
                  (v) => `
        <tr>
          <td class="text-center bold">${v.docNumber}</td>
          <td class="text-center">${v.workType}</td>
          <td>${v.content}</td>
          <td class="text-center">${v.vhialyPerson}</td>
          <td class="text-center">${v.pxscPerson}</td>
          <td>${v.reason}</td>
        </tr>`
                )
                .join('')
            : `
        <tr>
          <td colspan="6" class="text-center italic" style="padding: 10pt;">Không phát hiện nội dung không phù hợp trong kỳ kiểm tra.</td>
        </tr>`
        }
      </tbody>
    </table>

    <!-- Tiêu đề phân cách rõ ràng để 2 bảng LCT KHÔNG BỊ DÍNH SÁT NHAU -->
    <p style="font-weight: bold; font-size: 11pt; margin-top: 14pt; margin-bottom: 4pt; color: #000000; mso-para-margin-top: 14pt; mso-para-margin-bottom: 4pt;">
      <b>* Tổng hợp số liệu Lệnh công tác (LCT):</b>
    </p>

    <!-- Bảng tổng hợp số liệu LCT chuẩn mẫu đính kèm -->
    <table class="data-table" style="margin-top: 4pt; margin-bottom: 14pt;">
      <thead>
        <tr>
          <th style="width: 25%;">Tổng LCT được cấp số</th>
          <th style="width: 25%;">LCT không thực hiện</th>
          <th style="width: 25%;">LCT giấy</th>
          <th style="width: 25%;">LCT không phù hợp</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center bold">${overview.totalLCT}</td>
          <td class="text-center">0</td>
          <td class="text-center">0</td>
          <td class="text-center bold">${overview.lctWithErrors}</td>
        </tr>
        <tr>
          <td class="text-center italic">100%</td>
          <td class="text-center italic">0%</td>
          <td class="text-center italic">0%</td>
          <td class="text-center italic bold">${overview.lctErrorRate}%</td>
        </tr>
      </tbody>
    </table>

    <!-- 3 Cột Biểu đồ phần trăm dạng tròn trực quan -->
    <table class="header-table" style="width: 100%; margin-top: 10pt; margin-bottom: 14pt; border: none !important;">
      <tr>
        <td style="width: 33.3%; padding: 4pt 2pt; vertical-align: top; text-align: center; border: none !important;" nowrap="nowrap">
          <div style="font-weight: bold; font-size: 10pt; color: #1e40af; text-align: center; margin-bottom: 4pt; text-transform: uppercase; white-space: nowrap;">
            PHIẾU CÔNG TÁC (PCT)
          </div>
          <div style="text-align: center; margin: 4pt 0;">
            <img src="chart_pct.png" width="96" height="96" alt="${overview.pctErrorRate}%" style="display: block; margin: 0 auto; width: 96px; height: 96px; border: none !important;" />
          </div>
          <div style="font-size: 11pt; text-align: center; color: #000000; margin-top: 4pt; white-space: nowrap;">
            <b>${overview.pctWithErrors}</b> / ${overview.totalPCT} phiếu có lỗi
          </div>
        </td>
        <td style="width: 33.3%; padding: 4pt 2pt; vertical-align: top; text-align: center; border: none !important;" nowrap="nowrap">
          <div style="font-weight: bold; font-size: 10pt; color: #065f46; text-align: center; margin-bottom: 4pt; text-transform: uppercase; white-space: nowrap;">
            LỆNH CÔNG TÁC (LCT)
          </div>
          <div style="text-align: center; margin: 4pt 0;">
            <img src="chart_lct.png" width="96" height="96" alt="${overview.lctErrorRate}%" style="display: block; margin: 0 auto; width: 96px; height: 96px; border: none !important;" />
          </div>
          <div style="font-size: 11pt; text-align: center; color: #000000; margin-top: 4pt; white-space: nowrap;">
            <b>${overview.lctWithErrors}</b> / ${overview.totalLCT} lệnh có lỗi
          </div>
        </td>
        <td style="width: 33.3%; padding: 4pt 2pt; vertical-align: top; text-align: center; border: none !important;" nowrap="nowrap">
          <div style="font-weight: bold; font-size: 10pt; color: #9f1239; text-align: center; margin-bottom: 4pt; text-transform: uppercase; white-space: nowrap;">
            TỔNG PHIẾU + LỆNH LỖI
          </div>
          <div style="text-align: center; margin: 4pt 0;">
            <img src="chart_total.png" width="96" height="96" alt="${overview.errorRate}%" style="display: block; margin: 0 auto; width: 96px; height: 96px; border: none !important;" />
          </div>
          <div style="font-size: 11pt; text-align: center; color: #000000; margin-top: 4pt; white-space: nowrap;">
            <b>${overview.documentsWithErrors}</b> / ${overview.totalDocuments} hồ sơ có lỗi
          </div>
        </td>
      </tr>
    </table>

    <!-- ========================================================================= -->
    <!-- MỤC III: ĐÁNH GIÁ & KIẾN NGHỊ (Đã bỏ Mục IV trùng lặp theo yêu cầu) -->
    <!-- ========================================================================= -->
    <div class="section-title">
      <b>III. Đánh giá & Kiến nghị:</b>
    </div>
    <div style="margin-top: 4pt; margin-bottom: 12pt;">
      ${recParagraphs
        .map(
          (para) =>
            `<p class="indent-para" style="margin-top: 6pt; margin-bottom: 6pt; mso-para-margin-top: 6pt; mso-para-margin-bottom: 6pt; line-height: 1.25; text-align: justify; font-size: 12.5pt; color: #000000; text-indent: 1.27cm; mso-char-indent-count: 0;">${
              para.startsWith('-') ? para : `- ${para}`
            }</p>`
        )
        .join('')}
    </div>

    <!-- Các thành viên tham gia hậu kiểm (Động: có thể thêm/xóa) -->
    <div style="margin-top: 14pt; margin-bottom: 6pt;">
      <p style="font-weight: bold; font-size: 12.5pt; margin-bottom: 4pt;"><b>Các thành viên tham gia hậu kiểm:</b></p>
      <table class="header-table" style="width: 100%; border: none !important;">
        <tr>
          <td style="width: 50%; vertical-align: top; border: none !important;">
            ${leftColMembers
              .map(
                (name, idx) =>
                  `<div style="font-size: 12pt; line-height: 1.35;">${idx + 1}. ${name}</div>`
              )
              .join('')}
          </td>
          <td style="width: 50%; vertical-align: top; border: none !important;">
            ${rightColMembers
              .map(
                (name, idx) =>
                  `<div style="font-size: 12pt; line-height: 1.35;">${midPoint + idx + 1}. ${name}</div>`
              )
              .join('')}
          </td>
        </tr>
      </table>
    </div>

    <!-- Nơi nhận và Chữ ký TRƯỞNG NHÓM Trần Thanh Chương -->
    <table class="header-table" style="width: 100%; margin-top: 20pt; border: none !important;">
      <tr>
        <td style="width: 50%; vertical-align: top; border: none !important;">
          <div style="font-weight: bold; font-size: 11pt; font-style: italic;">Nơi nhận:</div>
          <div style="font-size: 10.5pt;">- LĐPX (để b/c);</div>
          <div style="font-size: 10.5pt;">- PXSC (để biết);</div>
          <div style="font-size: 10.5pt;">- Lưu ATV.</div>
        </td>
        <td style="width: 50%; text-align: center; vertical-align: top; border: none !important;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 12pt; color: #000000; line-height: 1.25;">TRƯỞNG NHÓM</div>
          <div style="font-size: 10.5pt; font-style: italic; color: #000000; line-height: 1.25; margin-top: 1pt;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 55px;"></div>
          <div style="font-weight: bold; font-size: 12.5pt; color: #000000;">Trần Thanh Chương</div>
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
