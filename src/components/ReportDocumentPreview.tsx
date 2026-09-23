import React from 'react';
import { ReportData } from '../types/report';
import {
  calculatePctPercentages,
  calculateLctPercentages,
  formatVietnameseDate,
} from '../utils/calculations';

interface ReportDocumentPreviewProps {
  data: ReportData;
}

export const ReportDocumentPreview: React.FC<ReportDocumentPreviewProps> = ({ data }) => {
  const pctPercents = calculatePctPercentages(data.pct.stats);
  const lctPercents = calculateLctPercentages(data.lct.stats);

  const formattedDate = formatVietnameseDate(
    data.general.location || 'Gia Lai',
    data.general.reportDate
  );

  // PCT Horizontal Chart calculation - Wide proportional bar chart
  const pctTotal = data.pct.stats.totalIssued > 0 ? data.pct.stats.totalIssued : 1;
  const pctData = [
    {
      label: 'PCT không thực hiện',
      count: data.pct.stats.notExecuted,
      pct: pctPercents.notExecutedPct,
      color: '#2563eb', // blue
      ratio: data.pct.stats.notExecuted / pctTotal,
    },
    {
      label: 'PCT giấy',
      count: data.pct.stats.paperForm,
      pct: pctPercents.paperFormPct,
      color: '#dc2626', // red
      ratio: data.pct.stats.paperForm / pctTotal,
    },
    {
      label: 'PCT đang thực hiện',
      count: data.pct.stats.inProgress,
      pct: pctPercents.inProgressPct,
      color: '#16a34a', // green
      ratio: data.pct.stats.inProgress / pctTotal,
    },
    {
      label: 'PCT không phù hợp',
      count: data.pct.stats.nonCompliant,
      pct: pctPercents.nonCompliantPct,
      color: '#d97706', // amber
      ratio: data.pct.stats.nonCompliant / pctTotal,
    },
  ];

  // LCT Horizontal Chart calculation - Wide proportional bar chart
  const lctTotal = data.lct.stats.totalIssued > 0 ? data.lct.stats.totalIssued : 1;
  const lctData = [
    {
      label: 'LCT không thực hiện',
      count: data.lct.stats.notExecuted,
      pct: lctPercents.notExecutedPct,
      color: '#2563eb',
      ratio: data.lct.stats.notExecuted / lctTotal,
    },
    {
      label: 'LCT giấy',
      count: data.lct.stats.paperForm,
      pct: lctPercents.paperFormPct,
      color: '#dc2626',
      ratio: data.lct.stats.paperForm / lctTotal,
    },
    {
      label: 'LCT không phù hợp',
      count: data.lct.stats.nonCompliant,
      pct: lctPercents.nonCompliantPct,
      color: '#d97706',
      ratio: data.lct.stats.nonCompliant / lctTotal,
    },
  ];

  // SVG Chart Metrics
  const chartWidth = 720;
  const barStartX = 185;
  const maxBarLength = 450;
  const endX = barStartX + maxBarLength;

  return (
    <div
      id="report-document-root"
      className="bg-white shadow-2xl mx-auto my-4 text-black font-['Times_New_Roman',serif] leading-relaxed select-text w-[210mm] min-h-[297mm] p-[20mm_15mm_20mm_22mm] text-[13pt] box-border"
    >
      {/* 1. Header: Two Columns with proper width - NO VERTICAL LINE */}
      <div className="flex justify-between items-start pb-4">
        {/* Left Column: Company (40%) */}
        <div className="w-[40%] text-center">
          <div className="text-[11.5pt] uppercase tracking-normal">
            {data.general.companyName}
          </div>
          <div className="font-bold text-[11.5pt] uppercase tracking-tight">
            {data.general.departmentName}
          </div>
          <div className="w-24 h-[1px] bg-black mx-auto mt-1 mb-1"></div>
        </div>

        {/* Right Column: Motto & Date (60%) - NEVER WRAPS "NAM" */}
        <div className="w-[60%] text-center">
          <div className="font-bold text-[11.5pt] uppercase tracking-tight whitespace-nowrap">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </div>
          <div className="font-bold text-[12.5pt] tracking-normal whitespace-nowrap">
            Độc lập - Tự do - Hạnh phúc
          </div>
          <div className="w-32 h-[1px] bg-black mx-auto mt-1 mb-1.5"></div>
          <div className="italic text-[12pt] whitespace-nowrap">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* 2. Document Title */}
      <div className="text-center mt-5 mb-6">
        <h1 className="font-bold text-[15pt] uppercase tracking-wider mb-1">
          {data.general.reportTitle}
        </h1>
        <h2 className="font-bold text-[13.5pt] tracking-tight">
          {data.general.reportSubtitle}
        </h2>
      </div>

      {/* 3. Section I: PCT */}
      <div className="mb-6">
        <h3 className="font-bold text-[13pt] mb-2">
          I. Việc thực hiện PCT:
        </h3>
        <p className="text-[13pt] mb-2 font-semibold">
          1. Danh sách chi tiết PCT có nội dung không phù hợp:
        </p>

        {/* Table I.1: PCT Violations - EXACT MATCH TO USER TEMPLATE */}
        <table className="table-fixed w-full border-collapse border border-black text-[10.5pt] mb-4">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th rowSpan={2} className="border border-black p-1.5 w-[8%] text-center align-middle">Số</th>
              <th rowSpan={2} className="border border-black p-1.5 w-[9%] text-center align-middle">Loại</th>
              <th rowSpan={2} className="border border-black p-1.5 w-[43%] text-center align-middle">Nội dung không phù hợp</th>
              <th colSpan={2} className="border border-black p-1 text-center align-middle">Người liên quan</th>
              <th rowSpan={2} className="border border-black p-1.5 w-[20%] text-center align-middle">Lý do không phù hợp</th>
            </tr>
            <tr className="bg-slate-100 font-bold text-center">
              <th className="border border-black p-1 w-[10%] text-center">VHIALY</th>
              <th className="border border-black p-1 w-[10%] text-center">PXSC</th>
            </tr>
          </thead>
          <tbody>
            {data.pct.violations.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-black p-3 text-center italic text-slate-500">
                  Không có PCT nào có nội dung không phù hợp trong kỳ hậu kiểm.
                </td>
              </tr>
            ) : (
              data.pct.violations.map((item, index) => (
                <tr key={item.id} className="align-top">
                  <td className="border border-black p-1.5 text-center font-bold">{item.number || (index + 1)}</td>
                  <td className="border border-black p-1.5 text-center">{item.type}</td>
                  <td className="border border-black p-1.5 text-left break-words leading-snug">{item.content}</td>
                  <td className="border border-black p-1.5 text-center break-words text-[10pt] leading-tight">
                    {item.relatedVh?.trim() || '/'}
                  </td>
                  <td className="border border-black p-1.5 text-center break-words text-[10pt] leading-tight">
                    {item.relatedPxsc?.trim() || '/'}
                  </td>
                  <td className="border border-black p-1.5 text-left break-words text-[10pt] leading-tight">{item.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PCT Horizontal Bar Chart - FULL WIDTH, PROPORTIONAL BARS */}
        <div className="my-4 p-3.5 border border-slate-300 rounded-lg bg-white">
          <div className="text-center font-bold text-[11pt] mb-2.5 text-slate-900">
            Biểu đồ tỷ lệ thực hiện Phiếu công tác (PCT)
          </div>
          <svg
            id="svg-pct-chart"
            className="w-full h-auto"
            viewBox={`0 0 ${chartWidth} 165`}
            style={{ maxHeight: '180px' }}
          >
            {/* Gridlines and X-Axis Scale */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
              const tickX = barStartX + tick * maxBarLength;
              return (
                <g key={i}>
                  <line
                    x1={tickX}
                    y1={10}
                    x2={tickX}
                    y2={132}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={tickX}
                    y={148}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="Times New Roman"
                    fill="#64748b"
                  >
                    {Math.round(tick * 100)}%
                  </text>
                </g>
              );
            })}

            {/* Base axis line */}
            <line
              x1={barStartX}
              y1={132}
              x2={endX}
              y2={132}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />

            {/* 4 Category Bars */}
            {pctData.map((item, idx) => {
              const y = 16 + idx * 28;
              const barLength = Math.round(item.ratio * maxBarLength);
              return (
                <g key={idx}>
                  {/* Category Label */}
                  <text
                    x={barStartX - 12}
                    y={y + 14}
                    textAnchor="end"
                    fontSize="12"
                    fontFamily="Times New Roman"
                    fill="#1e293b"
                    fontWeight="500"
                  >
                    {item.label}
                  </text>

                  {/* Gray background track */}
                  <rect
                    x={barStartX}
                    y={y}
                    width={maxBarLength}
                    height="18"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    rx="3"
                  />

                  {/* Colored bar fill */}
                  {barLength > 0 && (
                    <rect
                      x={barStartX}
                      y={y}
                      width={barLength}
                      height="18"
                      fill={item.color}
                      rx="3"
                    />
                  )}

                  {/* Value label */}
                  <text
                    x={Math.max(barStartX + barLength + 8, barStartX + 8)}
                    y={y + 13}
                    fontSize="11.5"
                    fontWeight="bold"
                    fontFamily="Times New Roman"
                    fill={barLength > 100 ? '#ffffff' : '#0f172a'}
                    textAnchor={barLength > 100 ? 'end' : 'start'}
                    dx={barLength > 100 ? -8 : 0}
                  >
                    {item.count} ({item.pct})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Table I.2: PCT Summary Stats */}
        <p className="text-[13pt] mb-2 font-semibold">
          2. Bảng tổng hợp số liệu thực hiện PCT:
        </p>
        <table className="w-full border-collapse border border-black text-[11pt] text-center mb-6">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-black p-2 w-[14%]"></th>
              <th className="border border-black p-2 w-[17%]">Tổng PCT đã cấp số</th>
              <th className="border border-black p-2 w-[17%]">PCT không thực hiện</th>
              <th className="border border-black p-2 w-[17%]">PCT giấy</th>
              <th className="border border-black p-2 w-[17%]">PCT đang thực hiện</th>
              <th className="border border-black p-2 w-[18%]">PCT không phù hợp</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 font-normal">Tỷ lệ %</td>
              <td className="border border-black p-2">100%</td>
              <td className="border border-black p-2">{pctPercents.notExecutedPct}</td>
              <td className="border border-black p-2">{pctPercents.paperFormPct}</td>
              <td className="border border-black p-2">{pctPercents.inProgressPct}</td>
              <td className="border border-black p-2">{pctPercents.nonCompliantPct}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-normal">Số lượng</td>
              <td className="border border-black p-2 font-semibold">{data.pct.stats.totalIssued}</td>
              <td className="border border-black p-2">{data.pct.stats.notExecuted}</td>
              <td className="border border-black p-2">{data.pct.stats.paperForm}</td>
              <td className="border border-black p-2">{data.pct.stats.inProgress}</td>
              <td className="border border-black p-2">{data.pct.stats.nonCompliant}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Section II: LCT */}
      <div className="mb-6">
        <h3 className="font-bold text-[13pt] mb-2">
          II. Việc thực hiện LCT:
        </h3>
        <p className="text-[13pt] mb-2 font-semibold">
          1. Danh sách chi tiết LCT có nội dung không phù hợp:
        </p>

        {/* Table II.1: LCT Violations - EXACT MATCH TO USER TEMPLATE */}
        <table className="table-fixed w-full border-collapse border border-black text-[10.5pt] mb-4">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th rowSpan={2} className="border border-black p-1.5 w-[8%] text-center align-middle">Số</th>
              <th rowSpan={2} className="border border-black p-1.5 w-[9%] text-center align-middle">Loại</th>
              <th rowSpan={2} className="border border-black p-1.5 w-[43%] text-center align-middle">Nội dung không phù hợp</th>
              <th colSpan={2} className="border border-black p-1 text-center align-middle">Người liên quan</th>
              <th rowSpan={2} className="border border-black p-1.5 w-[20%] text-center align-middle">Lý do không phù hợp</th>
            </tr>
            <tr className="bg-slate-100 font-bold text-center">
              <th className="border border-black p-1 w-[10%] text-center">VHIALY</th>
              <th className="border border-black p-1 w-[10%] text-center">PXSC</th>
            </tr>
          </thead>
          <tbody>
            {data.lct.violations.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-black p-3 text-center italic text-slate-500">
                  Không có LCT nào có nội dung không phù hợp trong kỳ hậu kiểm.
                </td>
              </tr>
            ) : (
              data.lct.violations.map((item, index) => (
                <tr key={item.id} className="align-top">
                  <td className="border border-black p-1.5 text-center font-bold">{item.number || (index + 1)}</td>
                  <td className="border border-black p-1.5 text-center">{item.type}</td>
                  <td className="border border-black p-1.5 text-left break-words leading-snug">{item.content}</td>
                  <td className="border border-black p-1.5 text-center break-words text-[10pt] leading-tight">
                    {item.relatedVh?.trim() || '/'}
                  </td>
                  <td className="border border-black p-1.5 text-center break-words text-[10pt] leading-tight">
                    {item.relatedPxsc?.trim() || '/'}
                  </td>
                  <td className="border border-black p-1.5 text-left break-words text-[10pt] leading-tight">{item.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* LCT Horizontal Bar Chart - FULL WIDTH, PROPORTIONAL BARS */}
        <div className="my-4 p-3.5 border border-slate-300 rounded-lg bg-white">
          <div className="text-center font-bold text-[11pt] mb-2.5 text-slate-900">
            Biểu đồ tỷ lệ thực hiện Lệnh công tác (LCT)
          </div>
          <svg
            id="svg-lct-chart"
            className="w-full h-auto"
            viewBox={`0 0 ${chartWidth} 135`}
            style={{ maxHeight: '150px' }}
          >
            {/* Gridlines and X-Axis Scale */}
            {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
              const tickX = barStartX + tick * maxBarLength;
              return (
                <g key={i}>
                  <line
                    x1={tickX}
                    y1={10}
                    x2={tickX}
                    y2={104}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={tickX}
                    y={120}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="Times New Roman"
                    fill="#64748b"
                  >
                    {Math.round(tick * 100)}%
                  </text>
                </g>
              );
            })}

            {/* Base axis line */}
            <line
              x1={barStartX}
              y1={104}
              x2={endX}
              y2={104}
              stroke="#94a3b8"
              strokeWidth="1.5"
            />

            {/* 3 Category Bars */}
            {lctData.map((item, idx) => {
              const y = 16 + idx * 28;
              const barLength = Math.round(item.ratio * maxBarLength);
              return (
                <g key={idx}>
                  {/* Category Label */}
                  <text
                    x={barStartX - 12}
                    y={y + 14}
                    textAnchor="end"
                    fontSize="12"
                    fontFamily="Times New Roman"
                    fill="#1e293b"
                    fontWeight="500"
                  >
                    {item.label}
                  </text>

                  {/* Gray background track */}
                  <rect
                    x={barStartX}
                    y={y}
                    width={maxBarLength}
                    height="18"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    rx="3"
                  />

                  {/* Colored bar fill */}
                  {barLength > 0 && (
                    <rect
                      x={barStartX}
                      y={y}
                      width={barLength}
                      height="18"
                      fill={item.color}
                      rx="3"
                    />
                  )}

                  {/* Value label */}
                  <text
                    x={Math.max(barStartX + barLength + 8, barStartX + 8)}
                    y={y + 13}
                    fontSize="11.5"
                    fontWeight="bold"
                    fontFamily="Times New Roman"
                    fill={barLength > 100 ? '#ffffff' : '#0f172a'}
                    textAnchor={barLength > 100 ? 'end' : 'start'}
                    dx={barLength > 100 ? -8 : 0}
                  >
                    {item.count} ({item.pct})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Table II.2: LCT Summary Stats */}
        <p className="text-[13pt] mb-2 font-semibold">
          2. Bảng tổng hợp số liệu thực hiện LCT:
        </p>
        <table className="w-full border-collapse border border-black text-[11pt] text-center mb-6">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-black p-2 w-[15%]"></th>
              <th className="border border-black p-2 w-[19%]">Tổng LCT được cấp số</th>
              <th className="border border-black p-2 w-[17%]">LCT không thực hiện</th>
              <th className="border border-black p-2 w-[15%]">LCT giấy</th>
              <th className="border border-black p-2 w-[18%]">LCT không phù hợp</th>
              <th className="border border-black p-2 w-[16%]">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-2 font-normal">Tỷ lệ %</td>
              <td className="border border-black p-2">100%</td>
              <td className="border border-black p-2">{lctPercents.notExecutedPct}</td>
              <td className="border border-black p-2">{lctPercents.paperFormPct}</td>
              <td className="border border-black p-2">{lctPercents.nonCompliantPct}</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-normal">Số lượng</td>
              <td className="border border-black p-2 font-semibold">{data.lct.stats.totalIssued}</td>
              <td className="border border-black p-2">{data.lct.stats.notExecuted}</td>
              <td className="border border-black p-2">{data.lct.stats.paperForm}</td>
              <td className="border border-black p-2">{data.lct.stats.nonCompliant}</td>
              <td className="border border-black p-2 font-normal">{data.lct.stats.notes || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Section III: Recommendations - First line indented (1.27 cm) */}
      <div className="mb-8">
        <h3 className="font-bold text-[13pt] mb-2">
          III. Kiến nghị:
        </h3>
        <div className="space-y-2 text-justify">
          {data.recommendations.map((rec, i) => (
            <p key={i} style={{ textIndent: '1.27cm' }} className="text-[13pt] leading-normal">
              - {rec}
            </p>
          ))}
        </div>
      </div>

      {/* 6. Signatories Block - WIDE CELL, NAMES NEVER BREAK */}
      <div className="mt-8 pt-4 flex justify-between items-start">
        {/* Left Column: Members (60% width to prevent name wrapping) */}
        <div className="w-[60%] pr-4">
          <div className="font-bold text-[12pt] mb-2.5">
            Các thành viên tham gia hậu kiểm:
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11.5pt] font-semibold">
            {data.signatories.members.map((member, i) => (
              <div key={i} className="whitespace-nowrap tracking-tight">
                {i + 1}. {member}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Leader Sign (40% width) */}
        <div className="w-[40%] text-center flex flex-col items-center">
          <div className="font-bold uppercase text-[12.5pt] tracking-wider">
            {data.signatories.leadTitle}
          </div>
          {/* Signature Area */}
          <div className="h-24 flex items-center justify-center my-1 relative">
            {data.signatories.leadSignatureUrl ? (
              <img
                src={data.signatories.leadSignatureUrl}
                alt="Chữ ký"
                className="max-h-20 max-w-[180px] object-contain"
              />
            ) : (
              <div className="h-20" />
            )}
          </div>
          <div className="font-bold text-[13pt] whitespace-nowrap">
            {data.signatories.leadName}
          </div>
        </div>
      </div>
    </div>
  );
};
