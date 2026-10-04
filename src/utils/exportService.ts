import {
  MonthlyBreakdown,
  NormalizedRecord,
  PersonStat,
  StatisticsOverview,
} from '../types';
import { calculateWorkshopAnalysis } from '../engine/statisticsEngine';

/**
 * Export official report directly to Microsoft Word (.doc)
 * Fully compliant with EVN administrative document layout standards (Nghị định 30/2020/NĐ-CP):
 * - Page format: A4
 * - Font: Times New Roman, cỡ chữ 13pt
 * - Margins: Lề trái 3cm (30mm), lề trên 2cm (20mm), lề dưới 2cm (20mm), lề phải 2cm (20mm)
 * - Paragraph Spacing: Before 6pt, After 6pt, Line spacing Single
 * - Pure black text for all document contents and tables (không tô màu nền bảng)
 * - Charts retain visual color indicators (biểu đồ có màu)
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
      line-height: 1.35;
      color: #000000;
    }
    p, div.p-spacing {
      margin-top: 5pt;
      margin-bottom: 5pt;
      line-height: 1.35;
      color: #000000;
    }
    .report-title {
      font-size: 15pt;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
      margin-top: 6pt;
      margin-bottom: 4pt;
      color: #000000;
    }
    .report-subtitle {
      font-size: 13pt;
      font-weight: bold;
      text-align: center;
      margin-top: 0;
      margin-bottom: 14pt;
      color: #000000;
    }
    .section-title {
      font-weight: bold;
      font-size: 13pt;
      margin-top: 14pt;
      margin-bottom: 6pt;
      color: #000000;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6pt;
      margin-bottom: 12pt;
      font-family: 'Times New Roman', Times, serif;
      font-size: 13pt;
      color: #000000;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #000000;
      padding: 6pt 8pt;
      font-size: 13pt;
      font-family: 'Times New Roman', Times, serif;
      vertical-align: middle;
      color: #000000;
      line-height: 1.35;
      background-color: transparent !important;
    }
    table.data-table th {
      font-weight: bold;
      text-align: center;
      background-color: transparent !important;
    }
    .header-table, .header-table td {
      border: none !important;
      padding: 0;
      background-color: transparent !important;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
    .uppercase { text-transform: uppercase; }
    .chart-card {
      padding: 10pt;
      vertical-align: top;
      border-radius: 6pt;
      background-color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- Header Block Chuẩn văn bản hành chính -->
    <table class="header-table" style="width: 100%; margin-bottom: 14pt;">
      <tr>
        <td style="width: 45%; text-align: center; vertical-align: top; padding: 0;">
          <div style="font-size: 12pt; font-weight: bold; color: #000000; text-transform: uppercase;">CÔNG TY THỦY ĐIỆN IALY</div>
          <div style="font-size: 12pt; font-weight: bold; color: #000000; text-transform: uppercase;">PX VẬN HÀNH IALY</div>
          <div style="width: 110px; border-bottom: 1px solid #000000; margin: 3pt auto 0 auto;"></div>
        </td>
        <td style="width: 55%; text-align: center; vertical-align: top; padding: 0;">
          <div style="font-size: 12pt; font-weight: bold; color: #000000; text-transform: uppercase;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 12pt; font-weight: bold; color: #000000;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="width: 150px; border-bottom: 1px solid #000000; margin: 3pt auto 5pt auto;"></div>
          <div style="font-size: 12pt; font-style: italic; color: #000000;">Gia Lai, ngày ..... tháng ..... năm 202...</div>
        </td>
      </tr>
    </table>

    <!-- Tiêu đề Báo cáo -->
    <div style="text-align: center; margin: 12pt 0 16pt 0;">
      <div class="report-title">BÁO CÁO</div>
      <div class="report-subtitle">${titleText}</div>
    </div>

    <!-- Section I: Biểu đồ dạng cột và Kết quả kiểm tra -->
    <div class="section-title">
      I. BIỂU ĐỒ TỶ LỆ VI PHẠM & KẾT QUẢ SOÁT PHIẾU CÔNG TÁC, LỆNH CÔNG TÁC
    </div>

    <!-- 3 Cột Biểu đồ trực quan có màu sắc sinh động, không chứa lỗi tiêu biểu/nội dung lỗi -->
    <table class="header-table" style="width: 100%; margin-bottom: 14pt;">
      <tr>
        <!-- Cột 1: Phiếu công tác (PCT) lỗi -->
        <td style="width: 33.3%; padding: 4pt; vertical-align: top;">
          <div class="chart-card" style="border: 1.5pt solid #2563eb;">
            <div style="font-weight: bold; font-size: 11.5pt; color: #1e40af; text-align: center;">
              PHIẾU CÔNG TÁC (PCT)
            </div>
            <!-- Thanh cột biểu đồ trực quan có màu -->
            <div style="background-color: #dbeafe; height: 11px; width: 100%; border-radius: 5px; overflow: hidden; margin: 6pt 0 4pt 0;">
              <div style="background-color: #2563eb; width: ${Math.max(Number(overview.pctErrorRate), 4)}%; height: 100%;"></div>
            </div>
            <div style="font-size: 19pt; font-weight: bold; color: #1d4ed8; text-align: center; margin: 2pt 0;">
              ${overview.pctErrorRate}%
            </div>
            <div style="font-size: 10.5pt; text-align: center; color: #000000;">
              <b>${overview.pctWithErrors}</b> / ${overview.totalPCT} phiếu có lỗi
            </div>
          </div>
        </td>

        <!-- Cột 2: Lệnh công tác (LCT) lỗi -->
        <td style="width: 33.3%; padding: 4pt; vertical-align: top;">
          <div class="chart-card" style="border: 1.5pt solid #059669;">
            <div style="font-weight: bold; font-size: 11.5pt; color: #065f46; text-align: center;">
              LỆNH CÔNG TÁC (LCT)
            </div>
            <!-- Thanh cột biểu đồ trực quan có màu -->
            <div style="background-color: #d1fae5; height: 11px; width: 100%; border-radius: 5px; overflow: hidden; margin: 6pt 0 4pt 0;">
              <div style="background-color: #059669; width: ${Math.max(Number(overview.lctErrorRate), 4)}%; height: 100%;"></div>
            </div>
            <div style="font-size: 19pt; font-weight: bold; color: #047857; text-align: center; margin: 2pt 0;">
              ${overview.lctErrorRate}%
            </div>
            <div style="font-size: 10.5pt; text-align: center; color: #000000;">
              <b>${overview.lctWithErrors}</b> / ${overview.totalLCT} lệnh có lỗi
            </div>
          </div>
        </td>

        <!-- Cột 3: Tổng Phiếu + Lệnh lỗi -->
        <td style="width: 33.3%; padding: 4pt; vertical-align: top;">
          <div class="chart-card" style="border: 1.5pt solid #e11d48;">
            <div style="font-weight: bold; font-size: 11.5pt; color: #9f1239; text-align: center;">
              TỔNG PHIẾU + LỆNH LỖI
            </div>
            <!-- Thanh cột biểu đồ trực quan có màu -->
            <div style="background-color: #ffe4e6; height: 11px; width: 100%; border-radius: 5px; overflow: hidden; margin: 6pt 0 4pt 0;">
              <div style="background-color: #e11d48; width: ${Math.max(Number(overview.errorRate), 4)}%; height: 100%;"></div>
            </div>
            <div style="font-size: 19pt; font-weight: bold; color: #be123c; text-align: center; margin: 2pt 0;">
              ${overview.errorRate}%
            </div>
            <div style="font-size: 10.5pt; text-align: center; color: #000000;">
              <b>${overview.documentsWithErrors}</b> / ${overview.totalDocuments} hồ sơ có lỗi
            </div>
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
    <!-- Section II: 12 Months -->
    <div class="section-title">
      II. DIỄN BIẾN SỐ LIỆU QUA 12 THÁNG TRONG NĂM ${reportYear}
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 14%;">Tháng</th>
          <th style="width: 14%;">Số PCT</th>
          <th style="width: 14%;">Số LCT</th>
          <th style="width: 15%;">Tổng Phiếu/Lệnh</th>
          <th style="width: 14%;">Số vi phạm</th>
          <th style="width: 14%;">Tổng số lỗi</th>
          <th style="width: 15%;">Tỷ lệ vi phạm (%)</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyStats
          .map(
            (m) => `
        <tr>
          <td class="text-center bold">${m.monthLabel}</td>
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

    <!-- Section: Workshop Breakdown -->
    <div class="section-title">
      ${reportType === 'month' ? 'II.' : 'III.'} TỔNG HỢP THEO PHÂN XƯỞNG (PXVH & PXSC)
    </div>
    <div style="font-size: 11pt; font-style: italic; margin-bottom: 6pt; color: #000000;">
      (Quy định phân định: Người CHTT, Nhân viên ĐCT thuộc Phân xưởng Sửa chữa; Người cấp phiếu, Người cho phép thuộc Phân xưởng Vận hành)
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 26%;">Đơn vị / Phân xưởng</th>
          <th style="width: 34%;">Chức danh quy định</th>
          <th style="width: 10%;">Số cá nhân</th>
          <th style="width: 10%;">Phiếu/Lệnh vi phạm</th>
          <th style="width: 10%;">Tổng lỗi</th>
          <th style="width: 10%;">Tỷ trọng (%)</th>
        </tr>
      </thead>
      <tbody>
        ${workshopStats
          .map(
            (ws) => `
        <tr>
          <td class="bold">${ws.workshopName} (${ws.shortName})</td>
          <td>${ws.roles.join(', ')}</td>
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
    <!-- Section: Evaluation & Recommendations -->
    <div class="section-title">
      ${reportType === 'month' ? 'III.' : 'IV.'} ĐÁNH GIÁ, KIẾN NGHỊ & GHI CHÚ BỔ SUNG
    </div>
    <div style="border: 1px solid #000000; padding: 8pt 10pt; font-size: 13pt; line-height: 1.35; margin-bottom: 12pt; background-color: #ffffff; color: #000000;">
      ${evaluationNote.replace(/\n/g, '<br/>')}
    </div>
    `
        : ''
    }

    <!-- Signature -->
    <table class="header-table" style="width: 100%; margin-top: 24pt;">
      <tr>
        <td style="width: 50%;"></td>
        <td style="width: 50%; text-align: center;">
          <div style="font-weight: bold; text-transform: uppercase; color: #000000;">NGƯỜI LẬP BÁO CÁO</div>
          <div style="font-size: 11pt; font-style: italic; color: #000000;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 60px;"></div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  const blob = new Blob(['\ufeff' + htmlContent], {
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
