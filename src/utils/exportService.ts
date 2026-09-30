import * as XLSX from 'xlsx';
import {
  AuditLogEntry,
  FilterState,
  MonthlyBreakdown,
  NormalizedRecord,
  PersonStat,
  StatisticsOverview,
} from '../types';
import { calculateWorkshopAnalysis } from '../engine/statisticsEngine';

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
}: {
  overview: StatisticsOverview;
  records: NormalizedRecord[];
  personalStats: PersonStat[];
  monthlyStats: MonthlyBreakdown[];
  reportType: 'month' | 'year';
  reportMonth: number;
  reportYear: number;
}) {
  const workshopStats = calculateWorkshopAnalysis(records, personalStats);

  const titleText =
    reportType === 'month'
      ? `Về việc kết quả hậu kiểm PCT, LCT tháng ${reportMonth < 10 ? '0' + reportMonth : reportMonth}/${reportYear}`
      : `Về việc kết quả hậu kiểm PCT, LCT năm ${reportYear}`;

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Báo cáo hậu kiểm PCT, LCT</title>
  <style>
    @page Section1 {
      size: 595.3pt 841.9pt; /* A4 */
      margin: 1.5cm 1.5cm 1.5cm 2.0cm;
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
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      margin-bottom: 12px;
    }
    th, td {
      border: 1px solid #333333;
      padding: 6px 8px;
      font-size: 12pt;
      vertical-align: middle;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: center;
    }
    .header-table, .header-table td {
      border: none !important;
      padding: 2px 4px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
    .uppercase { text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- Header Block -->
    <table class="header-table" style="width: 100%; margin-bottom: 20px;">
      <tr>
        <td style="width: 45%; text-align: center; vertical-align: top;">
          <div style="font-size: 11pt; font-weight: bold;">CÔNG TY THỦY ĐIỆN IALY</div>
          <div style="font-size: 11pt; font-weight: bold; color: #1e3a8a;">PX VẬN HÀNH IALY</div>
          <div style="width: 100px; border-bottom: 1px solid #000; margin: 4px auto 0 auto;"></div>
        </td>
        <td style="width: 55%; text-align: center; vertical-align: top;">
          <div style="font-size: 11pt; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 11pt; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="width: 140px; border-bottom: 1px solid #000; margin: 4px auto 6px auto;"></div>
          <div style="font-size: 11pt; font-style: italic;">Gia Lai, ngày ..... tháng ..... năm 202...</div>
        </td>
      </tr>
    </table>

    <!-- Title -->
    <div style="text-align: center; margin: 20px 0;">
      <div style="font-size: 16pt; font-weight: bold; text-transform: uppercase;">BÁO CÁO</div>
      <div style="font-size: 13pt; font-weight: bold; margin-top: 4px;">${titleText}</div>
    </div>

    <!-- Section I -->
    <div style="font-weight: bold; font-size: 13pt; margin-top: 15px; margin-bottom: 6px;">
      I. KẾT QUẢ SOÁT PHIẾU CÔNG TÁC, LỆNH CÔNG TÁC
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 40px;">STT</th>
          <th>Chỉ số giám sát / Thống kê</th>
          <th style="width: 90px;">Kết quả</th>
          <th>Diễn giải phương pháp tính</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="text-center">1</td>
          <td>Tổng số Phiếu công tác (PCT) đã kiểm tra</td>
          <td class="text-center bold">${overview.totalPCT}</td>
          <td>Phiếu công tác thực tế tại các tổ máy & trạm</td>
        </tr>
        <tr>
          <td class="text-center">2</td>
          <td>Tổng số Lệnh công tác (LCT) đã kiểm tra</td>
          <td class="text-center bold">${overview.totalLCT}</td>
          <td>Lệnh công tác không áp dụng người cho phép</td>
        </tr>
        <tr style="background-color: #f8fafc; font-weight: bold;">
          <td class="text-center">3</td>
          <td>Tổng Phiếu và Lệnh công tác đã kiểm tra (Sau loại trùng)</td>
          <td class="text-center">${overview.totalDocuments}</td>
          <td>Dữ liệu chuẩn hóa duy nhất</td>
        </tr>
        <tr>
          <td class="text-center">4</td>
          <td>Số Phiếu và Lệnh công tác có vi phạm</td>
          <td class="text-center bold" style="color: #b91c1c;">${overview.documentsWithErrors}</td>
          <td>Hợp lệ: ${overview.validDocuments}</td>
        </tr>
        <tr>
          <td class="text-center">5</td>
          <td>Tổng số lỗi phát hiện</td>
          <td class="text-center bold" style="color: #b45309;">${overview.totalErrors}</td>
          <td>CRITICAL: ${overview.criticalCount} | WARNING: ${overview.warningCount} | INFO: ${overview.infoCount}</td>
        </tr>
        <tr style="background-color: #fef2f2;">
          <td class="text-center">6</td>
          <td class="bold">Tỷ lệ Phiếu và Lệnh công tác vi phạm (%)</td>
          <td class="text-center bold" style="color: #b91c1c;">${overview.errorRate}%</td>
          <td>(Số Phiếu/Lệnh vi phạm / Tổng số Phiếu/Lệnh) × 100</td>
        </tr>
        <tr>
          <td class="text-center">7</td>
          <td>Số cá nhân liên đới phát hiện sai sót</td>
          <td class="text-center bold">${overview.totalPeopleWithErrors}</td>
          <td>Người cấp phiếu, CHTT, Người cho phép</td>
        </tr>
      </tbody>
    </table>

    ${
      reportType === 'year'
        ? `
    <!-- Section II: 12 Months -->
    <div style="font-weight: bold; font-size: 13pt; margin-top: 20px; margin-bottom: 6px;">
      II. DIỄN BIẾN SỐ LIỆU QUA 12 THÁNG TRONG NĂM ${reportYear}
    </div>
    <table>
      <thead>
        <tr>
          <th>Tháng</th>
          <th>Tổng Phiếu/Lệnh</th>
          <th>PCT</th>
          <th>LCT</th>
          <th>Vi phạm</th>
          <th>Hợp lệ</th>
          <th>Tổng lỗi</th>
          <th>Tỷ lệ vi phạm</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyStats
          .map(
            (m) => `
        <tr>
          <td class="text-center bold">${m.monthLabel}</td>
          <td class="text-center">${m.totalDocuments}</td>
          <td class="text-center">${m.pctCount}</td>
          <td class="text-center">${m.lctCount}</td>
          <td class="text-center bold" style="color: #b91c1c;">${m.errorDocuments}</td>
          <td class="text-center" style="color: #047857;">${m.validDocuments}</td>
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
    <div style="font-weight: bold; font-size: 13pt; margin-top: 20px; margin-bottom: 6px;">
      ${reportType === 'month' ? 'II.' : 'III.'} TỔNG HỢP THEO PHÂN XƯỞNG (PXVH & PXSC)
    </div>
    <div style="font-size: 11pt; font-style: italic; margin-bottom: 6px; color: #444;">
      (Quy định phân định: Người CHTT, Nhân viên ĐCT thuộc Phân xưởng Sửa chữa; Người cấp phiếu, Người cho phép thuộc Phân xưởng Vận hành)
    </div>
    <table>
      <thead>
        <tr>
          <th>Đơn vị / Phân xưởng</th>
          <th>Chức danh quy định</th>
          <th style="width: 80px;">Số cá nhân</th>
          <th style="width: 110px;">Phiếu/Lệnh vi phạm</th>
          <th style="width: 80px;">Tổng lỗi</th>
          <th style="width: 90px;">Tỷ trọng (%)</th>
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
          <td class="text-center bold" style="color: #b91c1c;">${ws.violationDocuments}</td>
          <td class="text-center bold" style="color: #b45309;">${ws.totalErrors}</td>
          <td class="text-center bold">${ws.errorShare}%</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <!-- Section: Personal Analysis -->
    <div style="font-weight: bold; font-size: 13pt; margin-top: 20px; margin-bottom: 6px;">
      ${reportType === 'month' ? 'III.' : 'IV.'} TỔNG HỢP TRÁCH NHIỆM & CẢNH BÁO CÁ NHÂN
    </div>
    <table>
      <thead>
        <tr>
          <th style="width: 40px;">STT</th>
          <th>Họ và tên cán bộ</th>
          <th>Chức danh đảm nhiệm</th>
          <th>Phiếu/Lệnh tham gia</th>
          <th>Tổng số lỗi</th>
          <th>Số tháng có lỗi</th>
          <th>Ghi chú cảnh báo</th>
        </tr>
      </thead>
      <tbody>
        ${personalStats
          .slice(0, 15)
          .map(
            (p, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="bold">${p.name}</td>
          <td>${p.roles.join(', ')}</td>
          <td class="text-center">${p.documentsCount}</td>
          <td class="text-center bold" style="color: #b91c1c;">${p.totalErrors}</td>
          <td class="text-center">${p.monthsWithErrorsCount}</td>
          <td class="text-center">${
            p.hasMonthlyAlert || p.hasYearlyAlert
              ? '<span style="color: #dc2626; font-weight: bold;">[!] Cảnh báo tần suất vi phạm</span>'
              : 'Bình thường'
          }</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <!-- Signature -->
    <table class="header-table" style="width: 100%; margin-top: 40px;">
      <tr>
        <td style="width: 50%;"></td>
        <td style="width: 50%; text-align: center;">
          <div style="font-weight: bold; text-transform: uppercase;">NGƯỜI LẬP BÁO CÁO</div>
          <div style="font-size: 10pt; font-style: italic; color: #555;">(Ký, ghi rõ họ tên)</div>
          <div style="height: 70px;"></div>
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
  const link = document.createElement('a');
  link.href = url;
  const fileName =
    reportType === 'month'
      ? `Bao_Cao_Hau_Kiem_PCT_LCT_Thang_${reportMonth}_${reportYear}.doc`
      : `Bao_Cao_Hau_Kiem_PCT_LCT_Nam_${reportYear}.doc`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean browser print dialog with print styling for PDF generation
 */
export function triggerPrintReport() {
  window.print();
}
