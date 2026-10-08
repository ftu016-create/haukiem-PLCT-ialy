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
import {
  createSignatureCanvasBase64,
  getMemberSignatureDataUri,
  getSignaturePngBase64,
} from './signatureService';

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

    // 4. Center text: Percentage (bold Times New Roman, no decimals)
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

// Chuẩn hóa tên đơn giản để tìm khớp chữ ký
function cleanMemberName(raw: string): string {
  return raw
    .replace(/^\d+[\s.]*/, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Xuất báo cáo chính thức sang định dạng Microsoft Word (.doc)
 * Tuân thủ đầy đủ thể thức văn bản hành chính EVN (Nghị định 30/2020/NĐ-CP)
 */
export async function exportToWord({
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
  documentDate,
  signedMembers = {},
  isLeaderSigned = true,
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
  documentDate?: string;
  signedMembers?: Record<string, boolean>;
  isLeaderSigned?: boolean;
}) {
  const { pctViolations, lctViolations } = getDetailedViolationList(records);

  const titleText =
    reportType === 'month'
      ? `Về việc kết quả hậu kiểm PCT, LCT tháng ${reportMonth < 10 ? '0' + reportMonth : reportMonth}/${reportYear}`
      : `Về việc kết quả hậu kiểm PCT, LCT năm ${reportYear}`;

  // Chuẩn bị danh sách kiến nghị (dựa trên văn bản người dùng chỉnh sửa hoặc mặc định)
  const recParagraphs =
    recommendationsText && recommendationsText.trim()
      ? recommendationsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : DEFAULT_RECOMMENDATIONS.map((r) => `- ${r}`);

  // Chuẩn bị danh sách thành viên tham gia hậu kiểm
  const members =
    auditMembers && auditMembers.length > 0
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

  // Tính toán số liệu thống kê người vi phạm và tỷ lệ của PXVH và PXSC
  const allViolations = [...pctViolations, ...lctViolations];
  const vhPersonsSet = new Set<string>();
  const scPersonsSet = new Set<string>();
  let vhViolationCount = 0;
  let scViolationCount = 0;

  allViolations.forEach((v) => {
    if (v.vhialyPerson && v.vhialyPerson !== '/' && !v.vhialyPerson.toLowerCase().includes('chưa rõ')) {
      vhPersonsSet.add(v.vhialyPerson);
      vhViolationCount++;
    }
    if (v.pxscPerson && v.pxscPerson !== '/' && !v.pxscPerson.toLowerCase().includes('chưa rõ')) {
      scPersonsSet.add(v.pxscPerson);
      scViolationCount++;
    }
  });

  // Hồ sơ có vi phạm theo phân xưởng
  const vhDocsSet = new Set<string>();
  const scDocsSet = new Set<string>();
  records.forEach((r) => {
    if (r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0) {
      if (r.issuer || r.approver) vhDocsSet.add(r.id);
      if (r.leader || r.workers) scDocsSet.add(r.id);
    }
  });

  const totalViolators = vhPersonsSet.size + scPersonsSet.size;
  const totalWorkshopErrors = Math.max(vhViolationCount + scViolationCount, 1);
  const vhErrorShare = Math.round((vhViolationCount / totalWorkshopErrors) * 100);
  const scErrorShare = 100 - vhErrorShare;

  // Tỷ lệ phần trăm làm tròn không lấy sau dấu phẩy (49% thay vì 49.00%)
  const roundedPctErrorRate = Math.round(Number(overview.pctErrorRate));
  const roundedLctErrorRate = Math.round(Number(overview.lctErrorRate));
  const roundedTotalErrorRate = Math.round(Number(overview.errorRate));

  // Tạo ảnh biểu đồ tròn định dạng PNG base64 để nhúng MHTML cho Microsoft Word
  const pctBase64 = wrapBase64(
    createDonutChartBase64(
      roundedPctErrorRate,
      '#2563eb',
      '#dbeafe',
      `${roundedPctErrorRate}%`
    )
  );

  const lctBase64 = wrapBase64(
    createDonutChartBase64(
      roundedLctErrorRate,
      '#059669',
      '#d1fae5',
      `${roundedLctErrorRate}%`
    )
  );

  const totalBase64 = wrapBase64(
    createDonutChartBase64(
      roundedTotalErrorRate,
      '#e11d48',
      '#ffe4e6',
      `${roundedTotalErrorRate}%`
    )
  );

  // Chuẩn bị ảnh chữ ký Base64 của Trưởng nhóm và các thành viên được tích chọn
  const mhtmlAttachments: Array<{ location: string; base64: string }> = [
    { location: 'chart_pct.png', base64: pctBase64 },
    { location: 'chart_lct.png', base64: lctBase64 },
    { location: 'chart_total.png', base64: totalBase64 },
  ];

  // Chữ ký Trưởng nhóm
  let leaderSigHtml = `<div style="height: 55px;"></div>`;
  if (isLeaderSigned) {
    const leaderRaw = await getSignaturePngBase64('Trần Thanh Chương');
    const leaderBase64 = wrapBase64(leaderRaw);
    if (leaderBase64) {
      mhtmlAttachments.push({ location: 'sig_leader.png', base64: leaderBase64 });
      leaderSigHtml = `
        <div style="height: 55px; text-align: center; margin: 2pt 0;">
          <img src="sig_leader.png" width="130" height="50" alt="Chữ ký Trần Thanh Chương" style="display: block; margin: 0 auto; border: none !important;" />
        </div>
      `;
    }
  }

  // Chữ ký từng thành viên
  const memberSigMap: Record<string, string> = {};
  for (let idx = 0; idx < members.length; idx++) {
    const mName = members[idx];
    const cName = cleanMemberName(mName);
    let isSigned = true;
    if (signedMembers[mName] !== undefined) {
      isSigned = signedMembers[mName];
    } else if (signedMembers[cName] !== undefined) {
      isSigned = signedMembers[cName];
    } else {
      for (const [k, v] of Object.entries(signedMembers)) {
        if (cleanMemberName(k) === cName) {
          isSigned = v;
          break;
        }
      }
    }

    if (isSigned) {
      const sigRaw = await getSignaturePngBase64(mName);
      const sigImgBase64 = wrapBase64(sigRaw);
      if (sigImgBase64) {
        const fileLoc = `sig_mem_${idx}.png`;
        mhtmlAttachments.push({ location: fileLoc, base64: sigImgBase64 });
        memberSigMap[mName] = fileLoc;
      }
    }
  }

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Báo cáo hậu kiểm PCT, LCT</title>
  <!--[if gte mso 9]>
  <xml>
   <w:WordDocument>
    <w:View>Print</w:View>
    <w:Zoom>100</w:Zoom>
    <w:DoNotOptimizeForBrowser/>
   </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 841.9pt 595.3pt; /* Khổ giấy A4 ngang (Landscape) */
      mso-page-orientation: landscape;
      margin: 2.0cm 2.0cm 2.0cm 2.5cm;
    }
    @page Section1 {
      size: 841.9pt 595.3pt; /* Khổ giấy A4 ngang (Landscape) */
      mso-page-orientation: landscape;
      margin: 2.0cm 2.0cm 2.0cm 2.5cm; /* Trên 2cm, Dưới 2cm, Phải 2cm, Trái 2.5cm */
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
    /* Tiêu ngữ: 0pt 0pt, Single line spacing */
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
      margin-bottom: 2pt;
      color: #000000;
    }
    .report-subtitle {
      font-size: 13pt;
      font-weight: bold;
      text-align: center;
      margin-top: 0pt;
      margin-bottom: 12pt;
      color: #000000;
    }
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 14pt;
      margin-bottom: 6pt;
      color: #000000;
    }
    /* Bảng dữ liệu vi phạm */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4pt;
      margin-bottom: 10pt;
      font-size: 11pt;
    }
    table.data-table th, table.data-table td {
      border: 1px solid #000000;
      padding: 4.5pt 5pt;
      vertical-align: middle;
      color: #000000;
    }
    table.data-table th {
      background-color: #f1f5f9;
      font-weight: bold;
      text-align: center;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .italic { font-style: italic; }
  </style>
</head>
<body>
  <div class="Section1">
    <!-- Tiêu ngữ chuẩn thể thức EVN -->
    <table class="header-table" style="width: 100%; border: none !important;">
      <tr>
        <td style="width: 48%; text-align: center; vertical-align: top; border: none !important;">
          <div style="font-size: 12pt; font-weight: bold; color: #000000; text-transform: uppercase; white-space: nowrap; word-break: keep-all; margin: 0; line-height: 100%;">CÔNG TY THỦY ĐIỆN IALY</div>
          <div style="font-size: 12pt; font-weight: bold; color: #000000; text-transform: uppercase; white-space: nowrap; word-break: keep-all; margin: 0; line-height: 100%;">PHÂN XƯỞNG VẬN HÀNH IALY</div>
          <div style="width: 130px; border-bottom: 1px solid #000000; margin: 3pt auto 4pt auto;"></div>
        </td>
        <td style="width: 52%; text-align: center; vertical-align: top; border: none !important;">
          <div style="font-size: 12pt; font-weight: bold; color: #000000; text-transform: uppercase; white-space: nowrap; word-break: keep-all; margin: 0; line-height: 100%;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div style="font-size: 12pt; font-weight: bold; color: #000000; white-space: nowrap; margin: 0; line-height: 100%;">Độc lập - Tự do - Hạnh phúc</div>
          <div style="width: 145px; border-bottom: 1px solid #000000; margin: 3pt auto 4pt auto;"></div>
          <div style="font-size: 13pt; font-style: italic; color: #000000; white-space: nowrap; margin: 0; line-height: 100%;">${documentDate && documentDate.trim() ? documentDate : 'Gia Lai, ngày ..... tháng ..... năm 202...'}</div>
        </td>
      </tr>
    </table>

    <!-- Tiêu đề Báo cáo -->
    <div style="text-align: center; margin-top: 6pt; margin-bottom: 6pt;">
      <div class="report-title">BÁO CÁO</div>
      <div class="report-subtitle">${titleText}</div>
    </div>

    <!-- ========================================================================= -->
    <!-- MỤC I: VIỆC THỰC HIỆN PCT (Có STT và cột Ghi chú) -->
    <!-- ========================================================================= -->
    <div class="section-title">
      <b>I. Việc thực hiện PCT:</b>
    </div>

    <!-- Bảng danh sách chi tiết các phiếu công tác có nội dung không phù hợp -->
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 6%;">STT</th>
          <th rowspan="2" style="width: 10%;">Số phiếu</th>
          <th rowspan="2" style="width: 11%;">Loại</th>
          <th rowspan="2" style="width: 43%;">Nội dung không phù hợp</th>
          <th colspan="2" style="width: 20%;">Người liên quan</th>
          <th rowspan="2" style="width: 10%;">Ghi chú</th>
        </tr>
        <tr>
          <th style="width: 10%;">VHIALY</th>
          <th style="width: 10%;">PXSC</th>
        </tr>
      </thead>
      <tbody>
        ${
          pctViolations.length > 0
            ? pctViolations
                .map(
                  (v, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center bold">${v.docNumber}</td>
          <td class="text-center">${v.workType}</td>
          <td>${v.content}</td>
          <td class="text-center">${v.vhialyPerson}</td>
          <td class="text-center">${v.pxscPerson}</td>
          <td class="text-center">${v.note || ''}</td>
        </tr>`
                )
                .join('')
            : `
        <tr>
          <td colspan="7" class="text-center italic" style="padding: 10pt;">Không phát hiện nội dung không phù hợp trong kỳ kiểm tra.</td>
        </tr>`
        }
      </tbody>
    </table>

    <!-- ========================================================================= -->
    <!-- MỤC II: VIỆC THỰC HIỆN LCT (Có STT và cột Ghi chú) -->
    <!-- ========================================================================= -->
    <div class="section-title" style="margin-top: 14pt;">
      <b>II. Việc thực hiện LCT:</b>
    </div>

    <!-- Bảng danh sách chi tiết các lệnh công tác có nội dung không phù hợp -->
    <table class="data-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 6%;">STT</th>
          <th rowspan="2" style="width: 10%;">Số lệnh</th>
          <th rowspan="2" style="width: 11%;">Loại</th>
          <th rowspan="2" style="width: 43%;">Nội dung không phù hợp</th>
          <th colspan="2" style="width: 20%;">Người liên quan</th>
          <th rowspan="2" style="width: 10%;">Ghi chú</th>
        </tr>
        <tr>
          <th style="width: 10%;">VHIALY</th>
          <th style="width: 10%;">PXSC</th>
        </tr>
      </thead>
      <tbody>
        ${
          lctViolations.length > 0
            ? lctViolations
                .map(
                  (v, idx) => `
        <tr>
          <td class="text-center">${idx + 1}</td>
          <td class="text-center bold">${v.docNumber}</td>
          <td class="text-center">${v.workType}</td>
          <td>${v.content}</td>
          <td class="text-center">${v.vhialyPerson}</td>
          <td class="text-center">${v.pxscPerson}</td>
          <td class="text-center">${v.note || ''}</td>
        </tr>`
                )
                .join('')
            : `
        <tr>
          <td colspan="7" class="text-center italic" style="padding: 10pt;">Không phát hiện nội dung không phù hợp trong kỳ kiểm tra.</td>
        </tr>`
        }
      </tbody>
    </table>

    <!-- ========================================================================= -->
    <!-- BIỂU ĐỒ CỘT SO SÁNH SỐ LIỆU PCT VÀ LCT (Thay thế 2 bảng tổng hợp cũ) -->
    <!-- ========================================================================= -->
    <p style="font-weight: bold; font-size: 13pt; margin-top: 14pt; margin-bottom: 4pt; color: #000000;">
      <b>* Tổng hợp số liệu so sánh Phiếu công tác (PCT) và Lệnh công tác (LCT):</b>
    </p>
    <table class="data-table" style="margin-top: 4pt; margin-bottom: 12pt;">
      <thead>
        <tr>
          <th style="width: 25%;">Phân loại</th>
          <th style="width: 18%;">Tổng số cấp</th>
          <th style="width: 18%;">Hợp lệ</th>
          <th style="width: 18%;">Có sai sót</th>
          <th style="width: 21%;">Tỷ lệ vi phạm (%)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="bold">Phiếu công tác (PCT)</td>
          <td class="text-center bold">${overview.totalPCT}</td>
          <td class="text-center">${overview.pctValid}</td>
          <td class="text-center bold">${overview.pctWithErrors}</td>
          <td class="text-center bold">${roundedPctErrorRate}%</td>
        </tr>
        <tr>
          <td class="bold">Lệnh công tác (LCT)</td>
          <td class="text-center bold">${overview.totalLCT}</td>
          <td class="text-center">${overview.lctValid}</td>
          <td class="text-center bold">${overview.lctWithErrors}</td>
          <td class="text-center bold">${roundedLctErrorRate}%</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td class="bold">Tổng cộng (PCT + LCT)</td>
          <td class="text-center bold">${overview.totalDocuments}</td>
          <td class="text-center bold">${Math.max(0, overview.totalDocuments - overview.documentsWithErrors)}</td>
          <td class="text-center bold">${overview.documentsWithErrors}</td>
          <td class="text-center bold">${roundedTotalErrorRate}%</td>
        </tr>
      </tbody>
    </table>

    <!-- ========================================================================= -->
    <!-- BIỂU ĐỒ SO SÁNH VI PHẠM THEO PHÂN XƯỞNG (TRỰC QUAN, RÕ RÀNG, DỄ NHÌN) -->
    <!-- ========================================================================= -->
    <p style="font-weight: bold; font-size: 13pt; margin-top: 14pt; margin-bottom: 4pt; color: #000000;">
      <b>* So sánh tỷ lệ vi phạm theo phân xưởng (PXVH vs PXSC):</b>
    </p>
    <table class="header-table" style="width: 100%; border-collapse: separate; border-spacing: 8pt 0; margin-top: 4pt; margin-bottom: 8pt; border: none !important;">
      <tr>
        <!-- Cột Phân xưởng Vận hành -->
        <td style="width: 50%; border: 1px solid #93c5fd; background-color: #eff6ff; padding: 8pt; vertical-align: top; text-align: left;">
          <div style="font-size: 11pt; font-weight: bold; color: #1e40af; text-transform: uppercase; margin-bottom: 3pt;">
            Phân xưởng Vận hành (PXVH)
          </div>
          <div style="font-size: 20pt; font-weight: bold; color: #1d4ed8; line-height: 1.1; margin-bottom: 4pt;">
            ${vhErrorShare}% <span style="font-size: 10pt; font-weight: normal; color: #475569;">tỷ lệ vi phạm</span>
          </div>
          <div style="font-size: 11pt; color: #1e293b; line-height: 1.4;">
            &bull; Nhân sự vi phạm: <b>${vhPersonsSet.size} người</b><br />
            &bull; Phiếu/lệnh vi phạm: <b>${vhDocsSet.size}</b><br />
            &bull; Tổng số lỗi phát hiện: <b>${vhViolationCount} lỗi</b>
          </div>
        </td>

        <!-- Cột Phân xưởng Sửa chữa -->
        <td style="width: 50%; border: 1px solid #fed7aa; background-color: #fff7ed; padding: 8pt; vertical-align: top; text-align: left;">
          <div style="font-size: 11pt; font-weight: bold; color: #c2410c; text-transform: uppercase; margin-bottom: 3pt;">
            Phân xưởng Sửa chữa (PXSC)
          </div>
          <div style="font-size: 20pt; font-weight: bold; color: #ea580c; line-height: 1.1; margin-bottom: 4pt;">
            ${scErrorShare}% <span style="font-size: 10pt; font-weight: normal; color: #475569;">tỷ lệ vi phạm</span>
          </div>
          <div style="font-size: 11pt; color: #1e293b; line-height: 1.4;">
            &bull; Nhân sự vi phạm: <b>${scPersonsSet.size} người</b><br />
            &bull; Phiếu/lệnh vi phạm: <b>${scDocsSet.size}</b><br />
            &bull; Tổng số lỗi phát hiện: <b>${scViolationCount} lỗi</b>
          </div>
        </td>
      </tr>
    </table>

    <!-- Thanh đối xứng tỷ lệ phần trăm phân xưởng -->
    <table style="width: 100%; border-collapse: collapse; margin-top: 2pt; margin-bottom: 14pt; border: 1px solid #cbd5e1;">
      <tr>
        <td style="width: ${vhErrorShare}%; background-color: #2563eb; color: #ffffff; text-align: center; padding: 5pt 2pt; font-size: 10.5pt; font-weight: bold;">
          PXVH: ${vhErrorShare}% (${vhViolationCount} lỗi)
        </td>
        <td style="width: ${scErrorShare}%; background-color: #ea580c; color: #ffffff; text-align: center; padding: 5pt 2pt; font-size: 10.5pt; font-weight: bold;">
          PXSC: ${scErrorShare}% (${scViolationCount} lỗi)
        </td>
      </tr>
    </table>

    <!-- ========================================================================= -->
    <!-- TỶ LỆ VI PHẠM (Đổi tên từ 'Biểu đồ tỷ lệ vi phạm trực quan:') -->
    <!-- ========================================================================= -->
    <div class="section-title" style="margin-top: 14pt;">
      <b>Tỷ lệ vi phạm:</b>
    </div>
    <table class="header-table" style="width: 100%; margin-top: 6pt; margin-bottom: 14pt; border: none !important;">
      <tr>
        <td style="width: 33.3%; padding: 4pt 2pt; vertical-align: top; text-align: center; border: none !important;" nowrap="nowrap">
          <div style="font-weight: bold; font-size: 10pt; color: #1e40af; text-align: center; margin-bottom: 4pt; text-transform: uppercase; white-space: nowrap;">
            PHIẾU CÔNG TÁC (PCT)
          </div>
          <div style="text-align: center; margin: 4pt 0;">
            <img src="chart_pct.png" width="96" height="96" alt="${roundedPctErrorRate}%" style="display: block; margin: 0 auto; width: 96px; height: 96px; border: none !important;" />
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
            <img src="chart_lct.png" width="96" height="96" alt="${roundedLctErrorRate}%" style="display: block; margin: 0 auto; width: 96px; height: 96px; border: none !important;" />
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
            <img src="chart_total.png" width="96" height="96" alt="${roundedTotalErrorRate}%" style="display: block; margin: 0 auto; width: 96px; height: 96px; border: none !important;" />
          </div>
          <div style="font-size: 11pt; text-align: center; color: #000000; margin-top: 4pt; white-space: nowrap;">
            <b>${overview.documentsWithErrors}</b> / ${overview.totalDocuments} phiếu/lệnh có lỗi
          </div>
        </td>
      </tr>
    </table>

    <!-- ========================================================================= -->
    <!-- MỤC III: ĐÁNH GIÁ & KIẾN NGHỊ -->
    <!-- ========================================================================= -->
    <div class="section-title">
      <b>III. Đánh giá & Kiến nghị:</b>
    </div>
    <div style="margin-top: 4pt; margin-bottom: 12pt;">
      ${recParagraphs
        .map(
          (para) =>
            `<p class="indent-para" style="margin-top: 6pt; margin-bottom: 6pt; mso-para-margin-top: 6pt; mso-para-margin-bottom: 6pt; line-height: 1.25; text-align: justify; font-size: 13pt; color: #000000; text-indent: 1.27cm; mso-char-indent-count: 0;">${
              para.startsWith('-') ? para : `- ${para}`
            }</p>`
        )
        .join('')}
    </div>

    <!-- CÁC THÀNH VIÊN THAM GIA HẬU KIỂM (Tự động chèn chữ ký khi được chọn) -->
    <div style="margin-top: 14pt; margin-bottom: 6pt;">
      <p style="font-weight: bold; font-size: 13pt; margin-bottom: 4pt;"><b>Các thành viên tham gia hậu kiểm:</b></p>
      <table class="header-table" style="width: 100%; border: none !important;">
        <tr>
          <td style="width: 50%; vertical-align: top; border: none !important;">
            ${leftColMembers
              .map((name, idx) => {
                const sigLoc = memberSigMap[name];
                return `
                  <div style="font-size: 13pt; line-height: 1.35; margin-bottom: 4pt;">
                    <div>${idx + 1}. ${name}</div>
                    ${
                      sigLoc
                        ? `<div style="margin: 1pt 0 4pt 15pt;"><img src="${sigLoc}" width="115" height="42" alt="Chữ ký ${name}" style="display: block; border: none !important;" /></div>`
                        : ''
                    }
                  </div>
                `;
              })
              .join('')}
          </td>
          <td style="width: 50%; vertical-align: top; border: none !important;">
            ${rightColMembers
              .map((name, idx) => {
                const sigLoc = memberSigMap[name];
                return `
                  <div style="font-size: 13pt; line-height: 1.35; margin-bottom: 4pt;">
                    <div>${midPoint + idx + 1}. ${name}</div>
                    ${
                      sigLoc
                        ? `<div style="margin: 1pt 0 4pt 15pt;"><img src="${sigLoc}" width="115" height="42" alt="Chữ ký ${name}" style="display: block; border: none !important;" /></div>`
                        : ''
                    }
                  </div>
                `;
              })
              .join('')}
          </td>
        </tr>
      </table>
    </div>

    <!-- ========================================================================= -->
    <!-- NƠI NHẬN (CỠ CHỮ 12 CHO 'Nơi nhận:', CỠ CHỮ 11 CHO DANH SÁCH) & TRƯỞNG NHÓM -->
    <!-- ========================================================================= -->
    <table class="header-table" style="width: 100%; margin-top: 20pt; border: none !important;">
      <tr>
        <td style="width: 50%; vertical-align: top; border: none !important;">
          <div style="font-weight: bold; font-size: 12pt; font-style: italic; margin-bottom: 2pt;">Nơi nhận:</div>
          <div style="font-size: 11pt; line-height: 1.35;">- LĐPX (để b/c);</div>
          <div style="font-size: 11pt; line-height: 1.35;">- PXSC (để biết);</div>
          <div style="font-size: 11pt; line-height: 1.35;">- Lưu ATV.</div>
        </td>
        <td style="width: 50%; text-align: center; vertical-align: top; border: none !important;">
          <div style="font-weight: bold; text-transform: uppercase; font-size: 13pt; color: #000000; line-height: 1.25;">TRƯỞNG NHÓM</div>
          <div style="font-size: 11pt; font-style: italic; color: #000000; line-height: 1.25; margin-top: 1pt;">(Ký, ghi rõ họ tên)</div>
          ${leaderSigHtml}
          <div style="font-weight: bold; font-size: 13pt; color: #000000;">Trần Thanh Chương</div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;

  // Đóng gói tài liệu MHTML Multipart
  const boundary = '----=_NextPart_Office_Report_Doc';
  let mhtmlContent = `MIME-Version: 1.0
Content-Type: multipart/related; boundary="${boundary}"

--${boundary}
Content-Type: text/html; charset="utf-8"
Content-Transfer-Encoding: 8bit

${htmlContent}
`;

  // Thêm tất cả ảnh đính kèm (biểu đồ tròn + chữ ký) vào MHTML
  mhtmlAttachments.forEach((att) => {
    mhtmlContent += `
--${boundary}
Content-Type: image/png
Content-Transfer-Encoding: base64
Content-Location: ${att.location}

${att.base64}
`;
  });

  mhtmlContent += `\n--${boundary}--\n`;

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
 * Kích hoạt hộp thoại in ấn tiêu chuẩn của trình duyệt
 */
export function triggerPrintReport() {
  window.print();
}
