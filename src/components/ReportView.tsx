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
import { calculateWorkshopAnalysis } from '../engine/statisticsEngine';
import { exportToWord, triggerPrintReport } from '../utils/exportService';

interface ReportViewProps {
  overview: StatisticsOverview;
  records: NormalizedRecord[];
  allParsedRecords: NormalizedRecord[];
  personalStats: PersonStat[];
  roleStats: RoleStat[];
  monthlyStats: MonthlyBreakdown[];
  filters: FilterState;
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
}) => {
  const [reportType, setReportType] = useState<'month' | 'year'>('month');
  const [reportMonth, setReportMonth] = useState<number>(
    filters.month === 'all' ? 9 : filters.month
  );
  const [reportYear, setReportYear] = useState<number>(
    filters.year === 'all' ? 2026 : filters.year
  );

  // Ghi chú cho 7 mục tại Bảng I (Mặc định để trống cho thoáng, có thể nhấp trực tiếp để sửa nội dung và lưu vào Word/PDF)
  const [customNotes, setCustomNotes] = useState<{ [key: number]: string }>(() => {
    try {
      const saved = localStorage.getItem('ialy_report_custom_notes_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      1: '',
      2: '',
      3: '',
      4: '',
      5: '',
      6: '',
      7: '',
    };
  });

  // Đánh giá, kiến nghị và ghi chú bổ sung (Có thể sửa trực tiếp và xuất Word/PDF)
  const [evaluationNote, setEvaluationNote] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('ialy_report_evaluation_note');
      if (saved !== null) return saved;
    } catch (e) {}
    return 'Qua công tác hậu kiểm, các đơn vị và cá nhân cơ bản đã chấp hành tốt quy trình an toàn điện. Đề nghị các cá nhân và đơn vị tiếp tục chấn chỉnh các thiếu sót nêu trên, đặc biệt là việc ghi chép đầy đủ nội dung, thời gian và biện pháp an toàn trước khi cho phép vào làm việc.';
  });

  const handleUpdateNote = (key: number, val: string) => {
    setCustomNotes((prev) => {
      const updated = { ...prev, [key]: val };
      try {
        localStorage.setItem('ialy_report_custom_notes_v3', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleUpdateEvaluation = (val: string) => {
    setEvaluationNote(val);
    try {
      localStorage.setItem('ialy_report_evaluation_note', val);
    } catch (e) {}
  };

  // Modal xem chi tiết danh sách phiếu/lệnh lỗi khi nhấp vào cột biểu đồ
  const [drilldownType, setDrilldownType] = useState<'PCT' | 'LCT' | 'ALL' | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  const workshopStats = calculateWorkshopAnalysis(records, personalStats);

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

  const handleExportWord = () => {
    exportToWord({
      overview,
      records,
      personalStats,
      monthlyStats,
      reportType,
      reportMonth,
      reportYear,
      customNotes,
      evaluationNote,
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

      {/* Configuration & Action Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Báo cáo & Xuất văn bản</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xuất văn bản Word và PDF theo thể thức hành chính chuẩn (Khổ A4, Times New Roman 13pt, lề trái 3cm, trên/dưới/phải 2cm)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportWord}
              title="Xuất văn bản Word (.doc / .docx)"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Xuất file Word (.doc)</span>
            </button>
            <button
              onClick={handlePrint}
              title="In trực tiếp hoặc Lưu file PDF"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Báo cáo / Lưu PDF</span>
            </button>
          </div>
        </div>

        {/* Report Selector Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setReportType('month')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                reportType === 'month'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Báo cáo Tháng
            </button>
            <button
              onClick={() => setReportType('year')}
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
                onChange={(e) => setReportMonth(parseInt(e.target.value, 10))}
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
              onChange={(e) => setReportYear(parseInt(e.target.value, 10))}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>
      </div>

      {/* Official Corporate Report Layout */}
      <div className="print-paper bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Formal Corporate Header */}
        <div className="flex justify-between items-start pb-4 mb-6">
          <div className="text-center w-[45%]">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 print:text-black">
              CÔNG TY THỦY ĐIỆN IALY
            </p>
            <p className="text-xs sm:text-sm font-bold uppercase text-slate-900 print:text-black">
              PX VẬN HÀNH IALY
            </p>
            <div className="w-24 sm:w-28 border-b border-slate-900 mx-auto mt-1 print:border-black"></div>
          </div>

          <div className="text-center w-[55%]">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 print:text-black">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 print:text-black">Độc lập - Tự do - Hạnh phúc</p>
            <div className="w-32 sm:w-36 border-b border-slate-900 mx-auto mt-1 print:border-black"></div>
            <p className="text-[11px] sm:text-xs text-slate-600 print:text-black italic mt-1.5">
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
        {/* MỤC 1: BIỂU ĐỒ DẠNG CỘT TỶ LỆ PHIẾU LỖI, LỆNH LỖI, TỔNG LỖI */}
        {/* ========================================================================= */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>I. BIỂU ĐỒ TỶ LỆ VI PHẠM & KẾT QUẢ SOÁT PHIẾU CÔNG TÁC, LỆNH CÔNG TÁC</span>
            </h3>
            <span className="text-[11px] text-slate-500 italic print:hidden">
              (Nhấp vào từng cột để mở danh sách chi tiết các phiếu, lệnh vi phạm)
            </span>
          </div>

          {/* 3 Cột Biểu đồ trực quan có màu, không chứa mục lỗi tiêu biểu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Cột 1: TỶ LỆ PHIẾU CÔNG TÁC (PCT) LỖI */}
            <div
              onClick={() => {
                setDrilldownType('PCT');
                setModalSearchTerm('');
              }}
              className="bg-gradient-to-b from-blue-50/70 via-white to-blue-50/30 rounded-2xl border-2 border-blue-200 hover:border-blue-500 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-blue-100 text-blue-700">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                      Phiếu công tác (PCT)
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500 opacity-60 group-hover:opacity-100 transition print:hidden" />
                </div>

                {/* Visual Bar Column Representation */}
                <div className="my-3 bg-slate-100 rounded-xl p-2.5 flex flex-col items-center">
                  <div className="w-full bg-slate-200 h-28 rounded-lg relative overflow-hidden flex flex-col justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-b-lg transition-all duration-500"
                      style={{ height: `${Math.max(Number(pctErrorRate), 8)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-2xl font-black text-blue-700 font-mono tracking-tight">
                      {pctErrorRate}%
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      <strong className="text-rose-600 font-bold">{pctErrorList.length}</strong> / {pctList.length} phiếu có lỗi
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Link Footer - Ẩn khi In / Xuất PDF theo yêu cầu */}
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
              className="bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/30 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                      Lệnh công tác (LCT)
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover:opacity-100 transition print:hidden" />
                </div>

                {/* Visual Bar Column Representation */}
                <div className="my-3 bg-slate-100 rounded-xl p-2.5 flex flex-col items-center">
                  <div className="w-full bg-slate-200 h-28 rounded-lg relative overflow-hidden flex flex-col justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-b-lg transition-all duration-500"
                      style={{ height: `${Math.max(Number(lctErrorRate), 8)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                      {lctErrorRate}%
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      <strong className="text-rose-600 font-bold">{lctErrorList.length}</strong> / {lctList.length} lệnh có lỗi
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Link Footer - Ẩn khi In / Xuất PDF theo yêu cầu */}
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
              className="bg-gradient-to-b from-rose-50/70 via-white to-rose-50/30 rounded-2xl border-2 border-rose-200 hover:border-rose-500 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-rose-100 text-rose-700">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
                      Tổng Phiếu + Lệnh lỗi
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-rose-500 opacity-60 group-hover:opacity-100 transition print:hidden" />
                </div>

                {/* Visual Bar Column Representation */}
                <div className="my-3 bg-slate-100 rounded-xl p-2.5 flex flex-col items-center">
                  <div className="w-full bg-slate-200 h-28 rounded-lg relative overflow-hidden flex flex-col justify-end">
                    <div
                      className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-b-lg transition-all duration-500"
                      style={{ height: `${Math.max(Number(totalErrorRate), 8)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-2xl font-black text-rose-700 font-mono tracking-tight">
                      {totalErrorRate}%
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      <strong className="text-rose-600 font-bold">{totalErrorList.length}</strong> / {totalDocsList.length} hồ sơ có lỗi
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Link Footer - Ẩn khi In / Xuất PDF theo yêu cầu */}
              <div className="mt-2 pt-2 border-t border-rose-100 text-center print:hidden">
                <span className="text-xs font-bold text-rose-600 group-hover:text-rose-800 inline-flex items-center gap-1">
                  <span>Xem danh sách {totalErrorList.length} phiếu + lệnh lỗi</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          </div>

          {/* Bảng I Tổng hợp số liệu hành chính chuẩn (Ghi chú để trống cho thoáng, có thể nhấp vào để chỉnh sửa) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden print:border-black">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 print:bg-transparent print:border-black print:text-black">
                <tr>
                  <th className="py-2.5 px-3 text-center w-14 border-r border-slate-300 print:border-black">STT</th>
                  <th className="py-2.5 px-4 text-left border-r border-slate-300 print:border-black">Chỉ số giám sát / Thống kê</th>
                  <th className="py-2.5 px-4 text-center border-r border-slate-300 print:border-black w-36">Kết quả</th>
                  <th className="py-2.5 px-4 text-left w-56">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-black">
                <tr className="print:bg-transparent">
                  <td className="py-2.5 px-3 text-center border-r border-slate-200 print:border-black print:text-black">1</td>
                  <td className="py-2.5 px-4 font-medium border-r border-slate-200 print:border-black print:text-black">
                    Tổng số Phiếu công tác (PCT) đã kiểm tra
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold font-mono border-r border-slate-200 print:border-black print:text-black">
                    {overview.totalPCT}
                  </td>
                  <td className="py-1 px-3 print:text-black">
                    <textarea
                      rows={1}
                      value={customNotes[1]}
                      onChange={(e) => handleUpdateNote(1, e.target.value)}
                      className="print:hidden w-full bg-transparent hover:bg-blue-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs text-slate-700 border border-transparent hover:border-slate-300 focus:border-blue-500 transition resize-y"
                      placeholder="Để trống hoặc nhập ghi chú..."
                      title="Nhấp vào để chỉnh sửa nội dung ghi chú"
                    />
                    <div className="hidden print:block text-black text-[13pt] font-normal leading-snug">
                      {customNotes[1] || ''}
                    </div>
                  </td>
                </tr>
                <tr className="print:bg-transparent">
                  <td className="py-2.5 px-3 text-center border-r border-slate-200 print:border-black print:text-black">2</td>
                  <td className="py-2.5 px-4 font-medium border-r border-slate-200 print:border-black print:text-black">
                    Tổng số Lệnh công tác (LCT) đã kiểm tra
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold font-mono border-r border-slate-200 print:border-black print:text-black">
                    {overview.totalLCT}
                  </td>
                  <td className="py-1 px-3 print:text-black">
                    <textarea
                      rows={1}
                      value={customNotes[2]}
                      onChange={(e) => handleUpdateNote(2, e.target.value)}
                      className="print:hidden w-full bg-transparent hover:bg-blue-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs text-slate-700 border border-transparent hover:border-slate-300 focus:border-blue-500 transition resize-y"
                      placeholder="Để trống hoặc nhập ghi chú..."
                      title="Nhấp vào để chỉnh sửa nội dung ghi chú"
                    />
                    <div className="hidden print:block text-black text-[13pt] font-normal leading-snug">
                      {customNotes[2] || ''}
                    </div>
                  </td>
                </tr>
                <tr className="bg-slate-50/60 font-semibold print:bg-transparent">
                  <td className="py-2.5 px-3 text-center border-r border-slate-200 print:border-black print:text-black">3</td>
                  <td className="py-2.5 px-4 border-r border-slate-200 print:border-black print:text-black">
                    Tổng Phiếu và Lệnh công tác đã kiểm tra (Sau loại trùng)
                  </td>
                  <td className="py-2.5 px-4 text-center font-black font-mono border-r border-slate-200 text-blue-900 print:text-black">
                    {overview.totalDocuments}
                  </td>
                  <td className="py-1 px-3 print:text-black">
                    <textarea
                      rows={1}
                      value={customNotes[3]}
                      onChange={(e) => handleUpdateNote(3, e.target.value)}
                      className="print:hidden w-full bg-transparent hover:bg-blue-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs text-slate-700 border border-transparent hover:border-slate-300 focus:border-blue-500 transition resize-y font-normal"
                      placeholder="Để trống hoặc nhập ghi chú..."
                      title="Nhấp vào để chỉnh sửa nội dung ghi chú"
                    />
                    <div className="hidden print:block text-black text-[13pt] font-normal leading-snug">
                      {customNotes[3] || ''}
                    </div>
                  </td>
                </tr>
                <tr className="print:bg-transparent">
                  <td className="py-2.5 px-3 text-center border-r border-slate-200 print:border-black print:text-black">4</td>
                  <td className="py-2.5 px-4 font-medium border-r border-slate-200 print:border-black print:text-black">
                    Số Phiếu và Lệnh công tác có vi phạm
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold font-mono text-rose-600 border-r border-slate-200 print:border-black print:text-black">
                    {overview.documentsWithErrors}
                  </td>
                  <td className="py-1 px-3 print:text-black">
                    <textarea
                      rows={1}
                      value={customNotes[4]}
                      onChange={(e) => handleUpdateNote(4, e.target.value)}
                      className="print:hidden w-full bg-transparent hover:bg-blue-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs text-slate-700 border border-transparent hover:border-slate-300 focus:border-blue-500 transition resize-y"
                      placeholder="Để trống hoặc nhập ghi chú..."
                      title="Nhấp vào để chỉnh sửa nội dung ghi chú"
                    />
                    <div className="hidden print:block text-black text-[13pt] font-normal leading-snug">
                      {customNotes[4] || ''}
                    </div>
                  </td>
                </tr>
                <tr className="print:bg-transparent">
                  <td className="py-2.5 px-3 text-center border-r border-slate-200 print:border-black print:text-black">5</td>
                  <td className="py-2.5 px-4 font-medium border-r border-slate-200 print:border-black print:text-black">
                    Tổng số lỗi phát hiện
                  </td>
                  <td className="py-2.5 px-4 text-center font-black font-mono text-amber-600 border-r border-slate-200 print:border-black print:text-black">
                    {overview.totalErrors}
                  </td>
                  <td className="py-1 px-3 print:text-black">
                    <textarea
                      rows={1}
                      value={customNotes[5]}
                      onChange={(e) => handleUpdateNote(5, e.target.value)}
                      className="print:hidden w-full bg-transparent hover:bg-blue-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs text-slate-700 border border-transparent hover:border-slate-300 focus:border-blue-500 transition resize-y"
                      placeholder="Để trống hoặc nhập ghi chú..."
                      title="Nhấp vào để chỉnh sửa nội dung ghi chú"
                    />
                    <div className="hidden print:block text-black text-[13pt] font-normal leading-snug">
                      {customNotes[5] || ''}
                    </div>
                  </td>
                </tr>
                <tr className="bg-rose-50/40 print:bg-transparent">
                  <td className="py-2.5 px-3 text-center border-r border-slate-200 print:border-black print:text-black">6</td>
                  <td className="py-2.5 px-4 font-bold text-rose-900 border-r border-slate-200 print:border-black print:text-black">
                    Tỷ lệ Phiếu và Lệnh công tác vi phạm (%)
                  </td>
                  <td className="py-2.5 px-4 text-center font-black font-mono text-rose-700 border-r border-slate-200 print:border-black print:text-black">
                    {overview.errorRate}%
                  </td>
                  <td className="py-1 px-3 print:text-black">
                    <textarea
                      rows={1}
                      value={customNotes[6]}
                      onChange={(e) => handleUpdateNote(6, e.target.value)}
                      className="print:hidden w-full bg-transparent hover:bg-blue-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs text-slate-700 border border-transparent hover:border-slate-300 focus:border-blue-500 transition resize-y"
                      placeholder="Để trống hoặc nhập ghi chú..."
                      title="Nhấp vào để chỉnh sửa nội dung ghi chú"
                    />
                    <div className="hidden print:block text-black text-[13pt] font-normal leading-snug">
                      {customNotes[6] || ''}
                    </div>
                  </td>
                </tr>
                <tr className="print:bg-transparent">
                  <td className="py-2.5 px-3 text-center border-r border-slate-200 print:border-black print:text-black">7</td>
                  <td className="py-2.5 px-4 font-medium border-r border-slate-200 print:border-black print:text-black">
                    Số cá nhân liên đới phát hiện sai sót
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold font-mono border-r border-slate-200 print:border-black print:text-black">
                    {overview.totalPeopleWithErrors}
                  </td>
                  <td className="py-1 px-3 print:text-black">
                    <textarea
                      rows={1}
                      value={customNotes[7]}
                      onChange={(e) => handleUpdateNote(7, e.target.value)}
                      className="print:hidden w-full bg-transparent hover:bg-blue-50/50 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 text-xs text-slate-700 border border-transparent hover:border-slate-300 focus:border-blue-500 transition resize-y"
                      placeholder="Để trống hoặc nhập ghi chú..."
                      title="Nhấp vào để chỉnh sửa nội dung ghi chú"
                    />
                    <div className="hidden print:block text-black text-[13pt] font-normal leading-snug">
                      {customNotes[7] || ''}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: 12 Months Breakdown (if Year mode) */}
        {reportType === 'year' && (
          <div className="mb-6">
            <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 mb-2">
              II. DIỄN BIẾN SỐ LIỆU QUA 12 THÁNG TRONG NĂM {reportYear}
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 text-center">
                  <tr>
                    <th className="py-1.5 px-2 border-r border-slate-300">Tháng</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Số PCT</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Số LCT</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Tổng Phiếu/Lệnh</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Số vi phạm</th>
                    <th className="py-1.5 px-2 border-r border-slate-300">Tổng số lỗi</th>
                    <th className="py-1.5 px-2">Tỷ lệ vi phạm (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-center">
                  {monthlyStats.map((m) => (
                    <tr key={m.month} className="hover:bg-slate-50">
                      <td className="py-1.5 px-2 font-bold border-r border-slate-200">
                        Tháng {m.month < 10 ? '0' + m.month : m.month}
                      </td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-200">{m.pctCount}</td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-200">{m.lctCount}</td>
                      <td className="py-1.5 px-2 font-mono font-bold border-r border-slate-200">
                        {m.totalDocuments}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-rose-600 font-bold border-r border-slate-200">
                        {m.errorDocuments}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-amber-600 font-black border-r border-slate-200">
                        {m.totalErrors}
                      </td>
                      <td className="py-1.5 px-2 font-mono">{m.errorRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section: Workshop Breakdown */}
        <div className="mb-6">
          <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 mb-2 flex flex-wrap items-center justify-between gap-1">
            <span>{reportType === 'month' ? 'II.' : 'III.'} TỔNG HỢP THEO PHÂN XƯỞNG (PXVH & PXSC)</span>
            <span className="text-[10px] sm:text-xs text-slate-500 font-normal italic lowercase">
              (CHTT, ĐCT thuộc PX Sửa chữa; Cấp phiếu, Cho phép thuộc PX Vận hành)
            </span>
          </h3>

          <div className="border border-slate-300 rounded-lg overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 text-center">
                <tr>
                  <th className="py-2 px-3 text-left border-r border-slate-300">Đơn vị / Phân xưởng</th>
                  <th className="py-2 px-3 text-left border-r border-slate-300">Chức danh quy định</th>
                  <th className="py-2 px-3 border-r border-slate-300">Số cá nhân</th>
                  <th className="py-2 px-3 border-r border-slate-300">Số Phiếu/Lệnh vi phạm</th>
                  <th className="py-2 px-3 border-r border-slate-300">Tổng số lỗi</th>
                  <th className="py-2 px-3">Tỷ trọng lỗi (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workshopStats.map((ws) => (
                  <tr key={ws.shortName} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                      {ws.workshopName} ({ws.shortName})
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px] border-r border-slate-200">
                      {ws.roles.join(', ')}
                    </td>
                    <td className="py-2 px-3 text-center font-mono border-r border-slate-200">
                      {ws.peopleCount}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-rose-600 font-bold border-r border-slate-200">
                      {ws.violationDocuments}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-black text-amber-600 border-r border-slate-200">
                      {ws.totalErrors}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold">
                      {ws.errorShare}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Evaluation & Additional Notes (Có thể sửa trực tiếp và xuất Word/PDF) */}
        <div className="mb-6">
          <h3 className="text-xs sm:text-sm font-bold uppercase text-slate-900 mb-2 flex items-center justify-between">
            <span>{reportType === 'month' ? 'III.' : 'IV.'} ĐÁNH GIÁ, KIẾN NGHỊ & GHI CHÚ BỔ SUNG</span>
            <span className="text-[11px] text-slate-400 font-normal italic print:hidden">
              (Nhấp vào khung dưới để chỉnh sửa nội dung đánh giá)
            </span>
          </h3>
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/30">
            <textarea
              rows={3}
              value={evaluationNote}
              onChange={(e) => handleUpdateEvaluation(e.target.value)}
              className="print:hidden w-full bg-transparent hover:bg-blue-50/40 focus:bg-white focus:ring-1 focus:ring-blue-500 rounded p-1.5 text-xs text-slate-800 border border-transparent hover:border-slate-300 focus:border-blue-500 transition resize-y leading-relaxed"
              placeholder="Nhập nội dung đánh giá, kiến nghị hoặc ghi chú thêm cho báo cáo..."
            />
            <div className="hidden print:block text-[13pt] text-slate-900 leading-normal whitespace-pre-wrap">
              {evaluationNote}
            </div>
          </div>
        </div>

        {/* Formal Corporate Signatures */}
        <div className="flex justify-end pt-10 text-center text-xs sm:text-sm">
          <div className="w-56">
            <p className="font-bold uppercase text-slate-800">NGƯỜI LẬP BÁO CÁO</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">(Ký, ghi rõ họ tên)</p>
            <div className="h-16"></div>
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
