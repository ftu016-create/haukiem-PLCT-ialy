import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileCheck,
  Printer,
  Search,
  X,
  AlertTriangle,
  BarChart3,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Plus,
  Trash2,
  RotateCcw,
  UserPlus,
  Sparkles,
} from 'lucide-react';
import {
  AuditLogEntry,
  FilterState,
  MonthlyBreakdown,
  NormalizedRecord,
  PersonStat,
  RoleStat,
  StatisticsOverview,
} from '../types';
import {
  calculateWorkshopAnalysis,
  getDetailedViolationList,
  DEFAULT_RECOMMENDATIONS,
  generateSmartEvaluationAndRecommendations,
  getDefaultEvaluationNotes,
  AUDIT_TEAM_MEMBERS,
} from '../engine/statisticsEngine';
import { exportToWord, triggerPrintReport } from '../utils/exportService';

interface ReportViewProps {
  overview: StatisticsOverview;
  records: NormalizedRecord[];
  allParsedRecords: NormalizedRecord[];
  personalStats: PersonStat[];
  roleStats: RoleStat[];
  monthlyStats: MonthlyBreakdown[];
  filters: FilterState;
  onChangeFilters?: React.Dispatch<React.SetStateAction<FilterState>>;
  auditLogs?: AuditLogEntry[];
}

export const ReportView: React.FC<ReportViewProps> = ({
  overview,
  records,
  allParsedRecords,
  personalStats,
  roleStats,
  monthlyStats,
  filters,
  onChangeFilters,
}) => {
  const [reportType, setReportType] = useState<'month' | 'year'>(
    filters.month === 'all' ? 'year' : 'month'
  );
  const [reportMonth, setReportMonth] = useState<number>(
    filters.month === 'all' ? 8 : filters.month
  );
  const [reportYear, setReportYear] = useState<number>(
    filters.year === 'all' ? 2026 : filters.year
  );

  // Danh sách kiến nghị Mục III (Được khởi tạo theo số liệu thực tế kết hợp chỉ đạo của phân xưởng, có thể sửa, thêm/xóa)
  const [recommendations, setRecommendations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ialy_report_recommendations_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return generateSmartEvaluationAndRecommendations(overview, reportMonth, reportYear);
  });

  const handleUpdateRecommendation = (idx: number, val: string) => {
    setRecommendations((prev) => {
      const updated = [...prev];
      updated[idx] = val;
      try {
        localStorage.setItem('ialy_report_recommendations_v4', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleAddRecommendation = () => {
    setRecommendations((prev) => {
      const updated = [...prev, ''];
      try {
        localStorage.setItem('ialy_report_recommendations_v4', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteRecommendation = (idx: number) => {
    setRecommendations((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      try {
        localStorage.setItem('ialy_report_recommendations_v4', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleResetRecommendations = () => {
    setRecommendations(DEFAULT_RECOMMENDATIONS);
    try {
      localStorage.setItem('ialy_report_recommendations_v4', JSON.stringify(DEFAULT_RECOMMENDATIONS));
    } catch (e) {}
  };

  // Danh sách thành viên tham gia hậu kiểm (Có thể thêm, xóa thành viên linh hoạt)
  const DEFAULT_MEMBERS = [
    'Nguyễn Văn Toàn',
    'A Ran',
    'Võ Quang Minh',
    'Thái Trần Hoàng Vũ',
    'Nguyễn Hồng Quang',
    'Phùng Ngọc Tú',
  ];

  const [auditMembers, setAuditMembers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ialy_audit_members_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_MEMBERS;
  });

  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = () => {
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    setAuditMembers((prev) => {
      const updated = [...prev, trimmed];
      try {
        localStorage.setItem('ialy_audit_members_v4', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setNewMemberName('');
  };

  const handleDeleteMember = (idx: number) => {
    setAuditMembers((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      try {
        localStorage.setItem('ialy_audit_members_v4', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleResetMembers = () => {
    setAuditMembers(DEFAULT_MEMBERS);
    try {
      localStorage.setItem('ialy_audit_members_v4', JSON.stringify(DEFAULT_MEMBERS));
    } catch (e) {}
  };

  // Modal xem chi tiết danh sách phiếu/lệnh lỗi khi nhấp vào cột biểu đồ
  const [drilldownType, setDrilldownType] = useState<'PCT' | 'LCT' | 'ALL' | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  const workshopStats = calculateWorkshopAnalysis(records, personalStats);
  const { pctViolations, lctViolations } = useMemo(
    () => getDetailedViolationList(records),
    [records]
  );

  // 1. Phân loại danh sách Phiếu công tác (PCT)
  const pctList = useMemo(() => records.filter((r) => r.documentType === 'PCT'), [records]);
  const pctErrorList = useMemo(
    () =>
      pctList.filter(
        (r) => r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0
      ),
    [pctList]
  );
  const pctErrorRate = pctList.length > 0 ? ((pctErrorList.length / pctList.length) * 100).toFixed(1) : '0.0';

  // 2. Phân loại danh sách Lệnh công tác (LCT)
  const lctList = useMemo(() => records.filter((r) => r.documentType === 'LCT'), [records]);
  const lctErrorList = useMemo(
    () =>
      lctList.filter(
        (r) => r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0
      ),
    [lctList]
  );
  const lctErrorRate = lctList.length > 0 ? ((lctErrorList.length / lctList.length) * 100).toFixed(1) : '0.0';

  // 3. Tổng hợp Phiếu + Lệnh công tác
  const totalDocsList = records;
  const totalErrorList = useMemo(
    () =>
      totalDocsList.filter(
        (r) => r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0
      ),
    [totalDocsList]
  );
  const totalErrorRate = totalDocsList.length > 0 ? ((totalErrorList.length / totalDocsList.length) * 100).toFixed(1) : '0.0';

  // Danh sách hiển thị trong Modal Drilldown
  const activeModalRecords = useMemo(() => {
    let baseList: NormalizedRecord[] = [];
    if (drilldownType === 'PCT') baseList = pctErrorList;
    else if (drilldownType === 'LCT') baseList = lctErrorList;
    else if (drilldownType === 'ALL') baseList = totalErrorList;

    if (!modalSearchTerm.trim()) return baseList;
    const q = modalSearchTerm.toLowerCase().trim();
    return baseList.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.jobName.toLowerCase().includes(q) ||
        r.leader.toLowerCase().includes(q) ||
        r.issuer.toLowerCase().includes(q) ||
        r.unit.toLowerCase().includes(q) ||
        r.parsedErrors.some((e) => e.message.toLowerCase().includes(q))
    );
  }, [drilldownType, pctErrorList, lctErrorList, totalErrorList, modalSearchTerm]);

  const handleSmartGenerateRecommendations = () => {
    const smart = generateSmartEvaluationAndRecommendations(
      overview,
      reportMonth,
      reportYear,
      pctViolations.length,
      lctViolations.length
    );
    setRecommendations(smart);
    try {
      localStorage.setItem('ialy_report_recommendations_v4', JSON.stringify(smart));
    } catch (e) {}
  };

  const handleExportWord = () => {
    exportToWord({
      overview,
      records,
      personalStats,
      monthlyStats,
      reportType,
      reportMonth,
      reportYear,
      recommendationsText: recommendations.filter((r) => r.trim()).join('\n'),
      auditMembers,
    });
  };

  const handlePrint = () => {
    triggerPrintReport();
  };

  return (
    <div className="space-y-6">
      {/* Định dạng trang in PDF chuẩn hành chính Nghị định 30:
          Khổ A4, Times New Roman, cỡ chữ 13pt, lề trái 3cm, trên/dưới/phải 2cm */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm 20mm 20mm 30mm !important; /* trên: 2cm, phải: 2cm, dưới: 2cm, trái: 3cm */
          }
          body, html {
            background-color: #ffffff !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
            line-height: 1.35 !important;
            color: #000000 !important;
          }
          .print-paper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
            page-break-inside: auto;
            margin-top: 6pt !important;
            margin-bottom: 12pt !important;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead, tbody, tr {
            background-color: transparent !important;
            background: transparent !important;
          }
          th, td {
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
            border: 1px solid #000000 !important;
            color: #000000 !important;
            background-color: transparent !important;
            background: transparent !important;
            padding: 5pt 7pt !important;
            line-height: 1.35 !important;
          }
          th {
            font-weight: bold !important;
            text-align: center !important;
          }
          input, textarea {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Thanh điều khiển Báo cáo Tháng / Năm (Đã loại bỏ khối banner trùng lặp theo yêu cầu) */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 shadow-xs print:hidden flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setReportType('month');
                onChangeFilters?.((prev) => ({ ...prev, month: reportMonth, year: reportYear }));
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                reportType === 'month'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Báo cáo Tháng
            </button>
            <button
              onClick={() => {
                setReportType('year');
                onChangeFilters?.((prev) => ({ ...prev, month: 'all', year: reportYear }));
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                reportType === 'year'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Báo cáo Năm
            </button>
          </div>

          {reportType === 'month' && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-500">Kỳ tháng:</span>
              <select
                value={reportMonth}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10);
                  setReportMonth(m);
                  onChangeFilters?.((prev) => ({ ...prev, month: m, year: reportYear }));
                }}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m < 10 ? '0' + m : m}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500">Năm:</span>
            <select
              value={reportYear}
              onChange={(e) => {
                const y = parseInt(e.target.value, 10);
                setReportYear(y);
                onChangeFilters?.((prev) => ({
                  ...prev,
                  year: y,
                  month: reportType === 'month' ? reportMonth : 'all',
                }));
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportWord}
            title="Xuất văn bản Word (.doc)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Xuất file Word (.doc)</span>
          </button>
          <button
            onClick={handlePrint}
            title="In trực tiếp hoặc Lưu file PDF"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo cáo / Lưu PDF</span>
          </button>
        </div>
      </div>

      {/* Official Corporate Report Layout */}
      <div className="print-paper bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Formal Corporate Header */}
        <div className="flex justify-between items-start pb-4 mb-6">
          <div className="text-center w-[40%]">
            <p className="text-xs sm:text-sm font-bold uppercase text-slate-800 print:text-black whitespace-nowrap print:text-[11.5pt]">
              CÔNG TY THỦY ĐIỆN IALY
            </p>
            <p className="text-xs sm:text-sm font-bold uppercase text-slate-900 print:text-black whitespace-nowrap print:text-[11.5pt]">
              PX VẬN HÀNH IALY
            </p>
            <div className="w-24 sm:w-28 border-b border-slate-900 mx-auto mt-1 print:border-black"></div>
          </div>

          <div className="text-center w-[60%]">
            <p className="text-xs sm:text-sm font-bold uppercase text-slate-800 print:text-black whitespace-nowrap print:text-[11pt]">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 print:text-black whitespace-nowrap print:text-[11.5pt]">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <div className="w-32 sm:w-36 border-b border-slate-900 mx-auto mt-1 print:border-black"></div>
            <p className="text-[11px] sm:text-xs text-slate-600 print:text-black italic mt-1.5 whitespace-nowrap">
              Gia Lai, ngày ..... tháng ..... năm 202...
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 print:text-black tracking-tight">
            BÁO CÁO
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-800 print:text-black mt-1">
            Về việc kết quả hậu kiểm PCT, LCT {reportType === 'month' ? `tháng ${reportMonth < 10 ? '0' + reportMonth : reportMonth}/${reportYear}` : `năm ${reportYear}`}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* MỤC I: VIỆC THỰC HIỆN PCT */}
        {/* ========================================================================= */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 print:text-black">
              <span><b>I. Việc thực hiện PCT:</b></span>
            </h3>
          </div>

          {/* Bảng danh sách chi tiết các phiếu công tác có nội dung không phù hợp */}
          <div className="border border-slate-300 rounded-lg overflow-x-auto print:border-black mb-4">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 print:bg-transparent print:border-black print:text-black">
                <tr>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-slate-300 print:border-black w-14">
                    Số
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-slate-300 print:border-black w-16">
                    Loại
                  </th>
                  <th rowSpan={2} className="py-2.5 px-4 text-left border-r border-slate-300 print:border-black">
                    Nội dung không phù hợp
                  </th>
                  <th colSpan={2} className="py-1 px-3 text-center border-b border-r border-slate-300 print:border-black w-48">
                    Người liên quan
                  </th>
                  <th rowSpan={2} className="py-2.5 px-4 text-left w-48">
                    Lý do không phù hợp
                  </th>
                </tr>
                <tr>
                  <th className="py-1.5 px-2 text-center border-r border-slate-300 print:border-black w-24">
                    VHIALY
                  </th>
                  <th className="py-1.5 px-2 text-center border-r border-slate-300 print:border-black w-24">
                    PXSC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-black">
                {pctViolations.length > 0 ? (
                  pctViolations.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 print:bg-transparent">
                      <td className="py-2 px-3 text-center font-bold border-r border-slate-200 print:border-black print:text-black">
                        {v.docNumber}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.workType}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200 print:border-black print:text-black leading-relaxed">
                        {v.content}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.vhialyPerson}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.pxscPerson}
                      </td>
                      <td className="py-2 px-4 print:border-black print:text-black text-slate-700 leading-relaxed">
                        {v.reason}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center italic text-slate-500 print:text-black">
                      Không phát hiện nội dung không phù hợp trong kỳ kiểm tra.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tiêu đề phân cách rõ ràng để 2 bảng không bị dính sát nhau */}
          <div className="mt-8 mb-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 print:text-black">
              * Tổng hợp số liệu Phiếu công tác (PCT):
            </h4>
          </div>

          {/* Bảng tổng hợp số liệu PCT */}
          <div className="border border-slate-300 rounded-lg overflow-x-auto print:border-black mb-6">
            <table className="w-full text-xs text-center">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 print:bg-transparent print:border-black print:text-black">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300 print:border-black">PCT đã cấp số</th>
                  <th className="py-2 px-3 border-r border-slate-300 print:border-black">PCT không thực hiện</th>
                  <th className="py-2 px-3 border-r border-slate-300 print:border-black">PCT giấy</th>
                  <th className="py-2 px-3 border-r border-slate-300 print:border-black">PCT đang thực hiện</th>
                  <th className="py-2 px-3 print:border-black">PCT không phù hợp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-black">
                <tr>
                  <td className="py-2 px-3 font-bold border-r border-slate-200 print:border-black print:text-black font-mono">
                    {overview.totalPCT}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 print:border-black print:text-black font-mono">0</td>
                  <td className="py-2 px-3 border-r border-slate-200 print:border-black print:text-black font-mono">0</td>
                  <td className="py-2 px-3 border-r border-slate-200 print:border-black print:text-black font-mono">
                    {overview.pctValid}
                  </td>
                  <td className="py-2 px-3 font-bold text-rose-600 print:text-black font-mono">
                    {overview.pctWithErrors}
                  </td>
                </tr>
                <tr className="bg-slate-50/50 print:bg-transparent italic text-slate-600 print:text-black font-mono text-[11px]">
                  <td className="py-1 px-3 border-r border-slate-200 print:border-black">100%</td>
                  <td className="py-1 px-3 border-r border-slate-200 print:border-black">0%</td>
                  <td className="py-1 px-3 border-r border-slate-200 print:border-black">0%</td>
                  <td className="py-1 px-3 border-r border-slate-200 print:border-black">
                    {overview.totalPCT > 0 ? (100 - Number(overview.pctErrorRate)).toFixed(2) : '100'}%
                  </td>
                  <td className="py-1 px-3 font-bold text-rose-700 print:text-black">{overview.pctErrorRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MỤC II: VIỆC THỰC HIỆN LCT */}
        {/* ========================================================================= */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 print:text-black">
              <span><b>II. Việc thực hiện LCT:</b></span>
            </h3>
          </div>

          {/* Bảng danh sách chi tiết các lệnh công tác có nội dung không phù hợp */}
          <div className="border border-slate-300 rounded-lg overflow-x-auto print:border-black mb-4">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 print:bg-transparent print:border-black print:text-black">
                <tr>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-slate-300 print:border-black w-14">
                    Số
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-slate-300 print:border-black w-16">
                    Loại
                  </th>
                  <th rowSpan={2} className="py-2.5 px-4 text-left border-r border-slate-300 print:border-black">
                    Nội dung không phù hợp
                  </th>
                  <th colSpan={2} className="py-1 px-3 text-center border-b border-r border-slate-300 print:border-black w-48">
                    Người liên quan
                  </th>
                  <th rowSpan={2} className="py-2.5 px-4 text-left w-48">
                    Lý do không phù hợp
                  </th>
                </tr>
                <tr>
                  <th className="py-1.5 px-2 text-center border-r border-slate-300 print:border-black w-24">
                    VHIALY
                  </th>
                  <th className="py-1.5 px-2 text-center border-r border-slate-300 print:border-black w-24">
                    PXSC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-black">
                {lctViolations.length > 0 ? (
                  lctViolations.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 print:bg-transparent">
                      <td className="py-2 px-3 text-center font-bold border-r border-slate-200 print:border-black print:text-black">
                        {v.docNumber}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.workType}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200 print:border-black print:text-black leading-relaxed">
                        {v.content}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.vhialyPerson}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.pxscPerson}
                      </td>
                      <td className="py-2 px-4 print:border-black print:text-black text-slate-700 leading-relaxed">
                        {v.reason}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center italic text-slate-500 print:text-black">
                      Không phát hiện nội dung không phù hợp trong kỳ kiểm tra.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Tiêu đề phân cách rõ ràng để 2 bảng không bị dính sát nhau */}
          <div className="mt-8 mb-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 print:text-black">
              * Tổng hợp số liệu Lệnh công tác (LCT):
            </h4>
          </div>

          {/* Bảng tổng hợp số liệu LCT */}
          <div className="border border-slate-300 rounded-lg overflow-x-auto print:border-black mb-6">
            <table className="w-full text-xs text-center">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 print:bg-transparent print:border-black print:text-black">
                <tr>
                  <th className="py-2 px-3 border-r border-slate-300 print:border-black">Tổng LCT được cấp số</th>
                  <th className="py-2 px-3 border-r border-slate-300 print:border-black">LCT không thực hiện</th>
                  <th className="py-2 px-3 border-r border-slate-300 print:border-black">LCT giấy</th>
                  <th className="py-2 px-3 print:border-black">LCT không phù hợp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-black">
                <tr>
                  <td className="py-2 px-3 font-bold border-r border-slate-200 print:border-black print:text-black font-mono">
                    {overview.totalLCT}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200 print:border-black print:text-black font-mono">0</td>
                  <td className="py-2 px-3 border-r border-slate-200 print:border-black print:text-black font-mono">0</td>
                  <td className="py-2 px-3 font-bold text-rose-600 print:text-black font-mono">
                    {overview.lctWithErrors}
                  </td>
                </tr>
                <tr className="bg-slate-50/50 print:bg-transparent italic text-slate-600 print:text-black font-mono text-[11px]">
                  <td className="py-1 px-3 border-r border-slate-200 print:border-black">100%</td>
                  <td className="py-1 px-3 border-r border-slate-200 print:border-black">0%</td>
                  <td className="py-1 px-3 border-r border-slate-200 print:border-black">0%</td>
                  <td className="py-1 px-3 font-bold text-rose-700 print:text-black">{overview.lctErrorRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Cột Biểu đồ phần trăm dạng tròn trực quan có màu */}
        <div className="my-8 pt-6 border-t border-slate-200 print:border-none print:pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 print:text-black">
              <BarChart3 className="w-4 h-4 text-blue-600 print:hidden" />
              <span><b>Biểu đồ tỷ lệ vi phạm trực quan:</b></span>
            </h3>
            <span className="text-[11px] text-slate-500 italic print:hidden">
              (Nhấp vào từng cột để mở danh sách chi tiết các phiếu, lệnh vi phạm)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Cột 1: TỶ LỆ PHIẾU CÔNG TÁC (PCT) LỖI */}
            <div
              onClick={() => {
                setDrilldownType('PCT');
                setModalSearchTerm('');
              }}
              className="bg-white rounded-xl border-2 border-blue-600 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group print:border-none print:shadow-none print:p-0"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-blue-100 text-blue-700 print:hidden">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900 print:text-blue-900 whitespace-nowrap">
                      Phiếu công tác (PCT)
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500 opacity-60 group-hover:opacity-100 transition print:hidden" />
                </div>

                <div className="my-2 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#dbeafe" strokeWidth="11" />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#2563eb"
                        strokeWidth="11"
                        strokeDasharray={238.76}
                        strokeDashoffset={238.76 * (1 - Math.min(Math.max(Number(pctErrorRate), 0), 100) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xl font-black font-mono tracking-tight text-blue-700">
                        {pctErrorRate}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-slate-700 print:text-black font-medium">
                    <strong className="text-rose-600 print:text-black font-bold">{pctErrorList.length}</strong> / {pctList.length} phiếu có lỗi
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-blue-100 text-center print:hidden">
                <span className="text-xs font-bold text-blue-600 group-hover:text-blue-800 inline-flex items-center gap-1">
                  <span>Xem danh sách {pctErrorList.length} phiếu lỗi</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>

            {/* Cột 2: TỶ LỆ LỆNH CÔNG TÁC (LCT) LỖI */}
            <div
              onClick={() => {
                setDrilldownType('LCT');
                setModalSearchTerm('');
              }}
              className="bg-white rounded-xl border-2 border-emerald-600 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group print:border-none print:shadow-none print:p-0"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 print:hidden">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 print:text-emerald-900 whitespace-nowrap">
                      Lệnh công tác (LCT)
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover:opacity-100 transition print:hidden" />
                </div>

                <div className="my-2 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#d1fae5" strokeWidth="11" />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#059669"
                        strokeWidth="11"
                        strokeDasharray={238.76}
                        strokeDashoffset={238.76 * (1 - Math.min(Math.max(Number(lctErrorRate), 0), 100) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xl font-black font-mono tracking-tight text-emerald-700">
                        {lctErrorRate}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-slate-700 print:text-black font-medium">
                    <strong className="text-rose-600 print:text-black font-bold">{lctErrorList.length}</strong> / {lctList.length} lệnh có lỗi
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-emerald-100 text-center print:hidden">
                <span className="text-xs font-bold text-emerald-600 group-hover:text-emerald-800 inline-flex items-center gap-1">
                  <span>Xem danh sách {lctErrorList.length} lệnh lỗi</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>

            {/* Cột 3: TỔNG PHIẾU + LỆNH LỖI */}
            <div
              onClick={() => {
                setDrilldownType('ALL');
                setModalSearchTerm('');
              }}
              className="bg-white rounded-xl border-2 border-rose-600 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group print:border-none print:shadow-none print:p-0"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-rose-100 text-rose-700 print:hidden">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-900 print:text-rose-900 whitespace-nowrap">
                      Tổng Phiếu + Lệnh lỗi
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-rose-500 opacity-60 group-hover:opacity-100 transition print:hidden" />
                </div>

                <div className="my-2 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ffe4e6" strokeWidth="11" />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#e11d48"
                        strokeWidth="11"
                        strokeDasharray={238.76}
                        strokeDashoffset={238.76 * (1 - Math.min(Math.max(Number(totalErrorRate), 0), 100) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xl font-black font-mono tracking-tight text-rose-700">
                        {totalErrorRate}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-slate-700 print:text-black font-medium">
                    <strong className="text-rose-600 print:text-black font-bold">{totalErrorList.length}</strong> / {totalDocsList.length} hồ sơ có lỗi
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-rose-100 text-center print:hidden">
                <span className="text-xs font-bold text-rose-600 group-hover:text-rose-800 inline-flex items-center gap-1">
                  <span>Xem danh sách {totalErrorList.length} phiếu + lệnh lỗi</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MỤC III: KIẾN NGHỊ (Chỉnh sửa trực tiếp - Đã bỏ Mục IV trùng lặp) */}
        {/* ========================================================================= */}
        <div className="my-8 pt-6 border-t border-slate-200 print:border-none print:pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 print:text-black flex items-center gap-2">
              <span><b>III. Đánh giá & Kiến nghị:</b></span>
              <span className="text-[11px] text-slate-500 font-normal italic print:hidden">
                ({recommendations.length} nội dung - có thể chỉnh sửa trực tiếp, thêm/xóa)
              </span>
            </h3>

            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handleSmartGenerateRecommendations}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer font-bold shadow-xs"
                title="Tự động tính toán số liệu và sinh ra các ý đánh giá & kiến nghị thực tế"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Đánh giá theo số liệu thực tế</span>
              </button>
              <button
                type="button"
                onClick={handleResetRecommendations}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer font-medium"
                title="Khôi phục 4 ý kiến nghị gốc ban đầu"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Mẫu kiến nghị gốc</span>
              </button>
              <button
                type="button"
                onClick={handleAddRecommendation}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer font-semibold"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm ý</span>
              </button>
            </div>
          </div>

          {/* Trình chỉnh sửa tương tác các ý kiến nghị (Ẩn khi in ấn) */}
          <div className="space-y-3 print:hidden">
            {recommendations.map((rec, rIdx) => (
              <div
                key={rIdx}
                className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:bg-white transition"
              >
                <span className="text-xs font-bold text-slate-400 mt-2 select-none shrink-0 w-5">
                  {rIdx + 1}.
                </span>
                <textarea
                  rows={2}
                  value={rec}
                  onChange={(e) => handleUpdateRecommendation(rIdx, e.target.value)}
                  placeholder={`Nhập nội dung ý kiến nghị thứ ${rIdx + 1}...`}
                  className="flex-1 bg-transparent border-none text-xs text-slate-800 leading-relaxed focus:outline-hidden resize-y p-1"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteRecommendation(rIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer mt-1"
                  title="Xóa ý kiến nghị này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {recommendations.length === 0 && (
              <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs">
                Chưa có ý kiến nghị nào. Nhấp &ldquo;Thêm ý kiến nghị&rdquo; hoặc &ldquo;Khôi phục mẫu chuẩn&rdquo;.
              </div>
            )}
          </div>

          {/* Bản in PDF / xem văn bản chuẩn hành chính Nghị định 30 */}
          <div className="hidden print:block space-y-2 text-[13pt] text-black leading-relaxed">
            {recommendations
              .filter((r) => r.trim())
              .map((rec, rIdx) => (
                <p key={rIdx} className="text-justify mb-2 leading-relaxed" style={{ textIndent: '1.27cm' }}>
                  {rec.trim().startsWith('-') ? rec.trim() : `- ${rec.trim()}`}
                </p>
              ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CÁC THÀNH VIÊN THAM GIA HẬU KIỂM (Có thể thêm hoặc xóa linh hoạt) */}
        {/* ========================================================================= */}
        <div className="my-8 pt-6 border-t border-slate-200 print:border-none print:pt-2 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h4 className="font-bold text-xs sm:text-sm print:text-[13pt] text-slate-900 print:text-black">
              <b>Các thành viên tham gia hậu kiểm:</b>
              <span className="text-[11px] text-slate-500 font-normal italic ml-2 print:hidden">
                ({auditMembers.length} thành viên)
              </span>
            </h4>

            <button
              type="button"
              onClick={handleResetMembers}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer font-medium print:hidden"
              title="Khôi phục danh sách thành viên mặc định"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi phục danh sách chuẩn</span>
            </button>
          </div>

          {/* Thanh thêm thành viên mới (Chỉ hiện trên giao diện Web) */}
          <div className="flex items-center gap-2 mb-4 print:hidden">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                placeholder="Nhập họ và tên thành viên tham gia mới..."
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            <button
              type="button"
              onClick={handleAddMember}
              disabled={!newMemberName.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Thêm thành viên</span>
            </button>
          </div>

          {/* Danh sách thành viên hiển thị trên Web (Có nút xóa) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-800 print:hidden">
            {auditMembers.map((name, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition group"
              >
                <span className="font-medium text-slate-800">
                  <span className="text-slate-400 font-bold mr-1.5">{idx + 1}.</span>
                  {name}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteMember(idx)}
                  className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                  title={`Xóa ${name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Bản in chuẩn 2 cột dạng văn bản hành chính không có nút xóa */}
          <div className="hidden print:grid grid-cols-2 gap-x-8 gap-y-1 text-[13pt] text-black">
            <div>
              {auditMembers.slice(0, Math.ceil(auditMembers.length / 2)).map((name, idx) => (
                <p key={idx} className="mb-0.5">
                  {idx + 1}. {name}
                </p>
              ))}
            </div>
            <div>
              {auditMembers.slice(Math.ceil(auditMembers.length / 2)).map((name, idx) => {
                const actualIndex = Math.ceil(auditMembers.length / 2) + idx + 1;
                return (
                  <p key={idx} className="mb-0.5">
                    {actualIndex}. {name}
                  </p>
                );
              })}
            </div>
          </div>
        </div>

        {/* Formal Corporate Signatures */}
        <div className="flex justify-between items-start pt-6 text-xs sm:text-sm">
          <div className="w-48 text-left text-xs sm:text-[11pt]">
            <p className="font-bold italic text-slate-800 print:text-black">Nơi nhận:</p>
            <p className="text-slate-600 print:text-black">- LĐPX (để b/c);</p>
            <p className="text-slate-600 print:text-black">- PXSC (để biết);</p>
            <p className="text-slate-600 print:text-black">- Lưu ATV.</p>
          </div>
          <div className="w-56 text-center">
            <p className="font-bold uppercase text-slate-900 print:text-black print:text-[12pt]">
              TRƯỞNG NHÓM
            </p>
            <p className="text-[10px] sm:text-xs text-slate-400 print:text-black italic mt-0.5">
              (Ký, ghi rõ họ tên)
            </p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 print:text-black text-xs sm:text-[13pt]">
              Trần Thanh Chương
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CHI TIẾT DANH SÁCH PHIẾU/LỆNH LỖI KHI NHẤP VÀO CỘT BIỂU ĐỒ */}
      {/* ========================================================================= */}
      {drilldownType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl text-white ${
                    drilldownType === 'PCT'
                      ? 'bg-blue-600'
                      : drilldownType === 'LCT'
                      ? 'bg-emerald-600'
                      : 'bg-rose-600'
                  }`}
                >
                  {drilldownType === 'PCT' ? (
                    <FileText className="w-5 h-5" />
                  ) : drilldownType === 'LCT' ? (
                    <FileCheck className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {drilldownType === 'PCT' && 'Danh sách Chi tiết Phiếu công tác (PCT) có vi phạm'}
                    {drilldownType === 'LCT' && 'Danh sách Chi tiết Lệnh công tác (LCT) có vi phạm'}
                    {drilldownType === 'ALL' && 'Danh sách Chi tiết Tất cả Phiếu & Lệnh công tác có vi phạm'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tổng cộng: <strong className="text-rose-600 font-bold">{activeModalRecords.length}</strong> hồ sơ vi phạm
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDrilldownType(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter inside modal */}
            <div className="px-6 py-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm nhanh mã phiếu, người CHTT, nội dung vi phạm..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Modal Body / Table of records */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeModalRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs">Không tìm thấy hồ sơ vi phạm nào phù hợp với từ khóa.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeModalRecords.map((rec, idx) => (
                    <div
                      key={rec.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition"
                    >
                      {/* Top Bar: Code, Type, Date, Personnel */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              rec.documentType === 'PCT'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {rec.documentType}
                          </span>
                          <span className="font-mono text-sm font-black text-slate-900">
                            {rec.code}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Ngày kiểm: {rec.auditDate || `Tháng ${rec.month}/${rec.year}`}
                        </div>
                      </div>

                      {/* Content: Job & Personnel */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2.5 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                            Công việc & Đơn vị:
                          </span>
                          <p className="font-semibold text-slate-800">{rec.jobName}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{rec.unit}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                            Nhân sự phụ trách:
                          </span>
                          <p className="text-slate-700">
                            Người CHTT: <strong className="text-slate-900">{rec.leader}</strong>
                          </p>
                          <p className="text-slate-600 text-[11px]">
                            Người cấp phiếu: {rec.issuer}
                          </p>
                          {rec.approver && !rec.approver.includes('Không áp dụng') && (
                            <p className="text-slate-500 text-[11px]">
                              Người cho phép: {rec.approver}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Errors list for this document */}
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider flex items-center gap-1 mb-1.5">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Nội dung vi phạm phát hiện ({rec.parsedErrors.length} lỗi):</span>
                        </span>
                        <div className="space-y-1.5">
                          {rec.parsedErrors.map((err, eIdx) => (
                            <div
                              key={err.id || eIdx}
                              className="bg-white p-2.5 rounded-lg border border-rose-200 text-xs flex items-start gap-2"
                            >
                              <span className="text-rose-600 font-black text-sm leading-tight">•</span>
                              <div className="flex-1">
                                <p className="text-slate-800 font-medium">{err.message}</p>
                                {err.ruleReference && (
                                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    Căn cứ: {err.ruleReference}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDrilldownType(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
              >
                Đóng danh sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
