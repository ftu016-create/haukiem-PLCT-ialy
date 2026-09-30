import React, { useState } from 'react';
import {
  FileText,
  Printer,
  ChevronDown,
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

  const workshopStats = calculateWorkshopAnalysis(records, personalStats);

  const handleExportWord = () => {
    exportToWord({
      overview,
      records,
      personalStats,
      monthlyStats,
      reportType,
      reportMonth,
      reportYear,
    });
  };

  const handlePrint = () => {
    triggerPrintReport();
  };

  return (
    <div className="space-y-6">
      {/* Configuration & Action Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Báo cáo & Xuất văn bản</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xuất văn bản Word và PDF theo thể thức hành chính chuẩn của Công ty Thủy điện Ialy
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

      {/* Official Corporate Report Layout (Printed or Screen Viewed) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs max-w-5xl mx-auto print:border-none print:shadow-none print:p-0">
        {/* Formal Corporate Header */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-5 mb-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
              CÔNG TY THỦY ĐIỆN IALY
            </p>
            <p className="text-xs font-black uppercase text-blue-900 tracking-tight">
              PX VẬN HÀNH IALY
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-800">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-xs font-bold text-slate-800">Độc lập - Tự do - Hạnh phúc</p>
            <p className="text-[11px] text-slate-600 italic mt-1">
              Gia Lai, ngày ..... tháng ..... năm 202...
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-black uppercase text-slate-900 tracking-tight">
            BÁO CÁO
          </h1>
          <p className="text-sm font-bold text-slate-800 mt-1">
            Về việc kết quả hậu kiểm PCT, LCT {reportType === 'month' ? `tháng ${reportMonth < 10 ? '0' + reportMonth : reportMonth}/${reportYear}` : `năm ${reportYear}`}
          </p>
        </div>

        {/* Section 1: Summary Table */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase text-slate-900 mb-2 flex items-center gap-1.5">
            <span>I. KẾT QUẢ SOÁT PHIẾU CÔNG TÁC, LỆNH CÔNG TÁC</span>
          </h3>

          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800">
                <tr>
                  <th className="py-2 px-3 text-center w-12 border-r border-slate-300">STT</th>
                  <th className="py-2 px-4 border-r border-slate-300">Chỉ số giám sát / Thống kê</th>
                  <th className="py-2 px-4 text-center border-r border-slate-300 w-32">Kết quả</th>
                  <th className="py-2 px-4">Diễn giải phương pháp tính</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">1</td>
                  <td className="py-2 px-4 font-medium border-r border-slate-200">
                    Tổng số Phiếu công tác (PCT) đã kiểm tra
                  </td>
                  <td className="py-2 px-4 text-center font-bold font-mono border-r border-slate-200">
                    {overview.totalPCT}
                  </td>
                  <td className="py-2 px-4 text-slate-500">
                    Phiếu công tác thực tế tại các tổ máy & trạm
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">2</td>
                  <td className="py-2 px-4 font-medium border-r border-slate-200">
                    Tổng số Lệnh công tác (LCT) đã kiểm tra
                  </td>
                  <td className="py-2 px-4 text-center font-bold font-mono border-r border-slate-200">
                    {overview.totalLCT}
                  </td>
                  <td className="py-2 px-4 text-slate-500">
                    Lệnh công tác không áp dụng người cho phép
                  </td>
                </tr>
                <tr className="bg-slate-50/60 font-semibold">
                  <td className="py-2 px-3 text-center border-r border-slate-200">3</td>
                  <td className="py-2 px-4 border-r border-slate-200">
                    Tổng Phiếu và Lệnh công tác đã kiểm tra (Sau loại trùng)
                  </td>
                  <td className="py-2 px-4 text-center font-black font-mono border-r border-slate-200 text-blue-900">
                    {overview.totalDocuments}
                  </td>
                  <td className="py-2 px-4 text-slate-600">
                    Đã chuẩn hóa và loại bỏ bản ghi trùng tuyệt đối
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">4</td>
                  <td className="py-2 px-4 font-medium border-r border-slate-200">
                    Số Phiếu và Lệnh công tác có vi phạm
                  </td>
                  <td className="py-2 px-4 text-center font-bold font-mono text-rose-600 border-r border-slate-200">
                    {overview.documentsWithErrors}
                  </td>
                  <td className="py-2 px-4 text-slate-500">
                    Hợp lệ: {overview.validDocuments} ({overview.totalDocuments > 0 ? ((overview.validDocuments / overview.totalDocuments) * 100).toFixed(1) : 0}%)
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">5</td>
                  <td className="py-2 px-4 font-medium border-r border-slate-200">
                    Tổng số lỗi phát hiện
                  </td>
                  <td className="py-2 px-4 text-center font-black font-mono text-amber-600 border-r border-slate-200">
                    {overview.totalErrors}
                  </td>
                  <td className="py-2 px-4 text-slate-500">
                    CRITICAL: {overview.criticalCount} | WARNING: {overview.warningCount} | INFO: {overview.infoCount}
                  </td>
                </tr>
                <tr className="bg-rose-50/40">
                  <td className="py-2 px-3 text-center border-r border-slate-200">6</td>
                  <td className="py-2 px-4 font-bold text-rose-900 border-r border-slate-200">
                    Tỷ lệ Phiếu và Lệnh công tác vi phạm (%)
                  </td>
                  <td className="py-2 px-4 text-center font-black font-mono text-rose-700 border-r border-slate-200">
                    {overview.errorRate}%
                  </td>
                  <td className="py-2 px-4 text-slate-600 text-[11px]">
                    (Số Phiếu/Lệnh vi phạm / Tổng số Phiếu/Lệnh đã soát) × 100
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 text-center border-r border-slate-200">7</td>
                  <td className="py-2 px-4 font-medium border-r border-slate-200">
                    Số cá nhân liên đới phát hiện sai sót
                  </td>
                  <td className="py-2 px-4 text-center font-bold font-mono border-r border-slate-200">
                    {overview.totalPeopleWithErrors}
                  </td>
                  <td className="py-2 px-4 text-slate-500">
                    Bao gồm các chức danh Cấp phiếu, CHTT, Cho phép
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: 12-Month Table if Yearly */}
        {reportType === 'year' && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase text-slate-900 mb-2">
              II. DIỄN BIẾN SỐ LIỆU QUA 12 THÁNG TRONG NĂM {reportYear}
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 text-center">
                  <tr>
                    <th className="py-2 px-2 border-r border-slate-300">Tháng</th>
                    <th className="py-2 px-2 border-r border-slate-300">Tổng Phiếu/Lệnh</th>
                    <th className="py-2 px-2 border-r border-slate-300">PCT</th>
                    <th className="py-2 px-2 border-r border-slate-300">LCT</th>
                    <th className="py-2 px-2 border-r border-slate-300">Vi phạm</th>
                    <th className="py-2 px-2 border-r border-slate-300">Hợp lệ</th>
                    <th className="py-2 px-2 border-r border-slate-300">Tổng lỗi</th>
                    <th className="py-2 px-2">Tỷ lệ vi phạm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-center">
                  {monthlyStats.map((m) => (
                    <tr key={m.month}>
                      <td className="py-1.5 px-2 font-bold border-r border-slate-200">{m.monthLabel}</td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-200">{m.totalDocuments}</td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-200">{m.pctCount}</td>
                      <td className="py-1.5 px-2 font-mono border-r border-slate-200">{m.lctCount}</td>
                      <td className="py-1.5 px-2 font-mono text-rose-600 font-bold border-r border-slate-200">
                        {m.errorDocuments}
                      </td>
                      <td className="py-1.5 px-2 font-mono text-emerald-600 border-r border-slate-200">
                        {m.validDocuments}
                      </td>
                      <td className="py-1.5 px-2 font-mono font-black text-amber-600 border-r border-slate-200">
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
          <h3 className="text-xs font-bold uppercase text-slate-900 mb-2 flex flex-wrap items-center justify-between gap-1">
            <span>{reportType === 'month' ? 'II.' : 'III.'} TỔNG HỢP THEO PHÂN XƯỞNG (PXVH & PXSC)</span>
            <span className="text-[10px] text-slate-500 font-normal italic lowercase">
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

        {/* Section: Personal Table */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase text-slate-900 mb-2">
            {reportType === 'month' ? 'III.' : 'IV.'} TỔNG HỢP TRÁCH NHIỆM & CẢNH BÁO CÁ NHÂN
          </h3>
          <div className="border border-slate-300 rounded-lg overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 text-left">
                <tr>
                  <th className="py-2 px-3 text-center w-10 border-r border-slate-300">STT</th>
                  <th className="py-2 px-3 border-r border-slate-300">Họ và tên cán bộ</th>
                  <th className="py-2 px-3 border-r border-slate-300">Chức danh đảm nhiệm</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300">Phiếu/Lệnh tham gia</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300">Tổng số lỗi</th>
                  <th className="py-2 px-3 text-center border-r border-slate-300">Số tháng có lỗi</th>
                  <th className="py-2 px-3 text-center">Ghi chú cảnh báo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {personalStats.slice(0, 10).map((p, idx) => (
                  <tr key={p.name}>
                    <td className="py-2 px-3 text-center font-mono border-r border-slate-200">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold border-r border-slate-200">{p.name}</td>
                    <td className="py-2 px-3 text-[11px] border-r border-slate-200">{p.roles.join(', ')}</td>
                    <td className="py-2 px-3 text-center font-mono border-r border-slate-200">{p.documentsCount}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-rose-600 border-r border-slate-200">
                      {p.totalErrors}
                    </td>
                    <td className="py-2 px-3 text-center font-mono border-r border-slate-200">
                      {p.monthsWithErrorsCount}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {p.hasMonthlyAlert || p.hasYearlyAlert ? (
                        <span className="text-[10px] font-bold text-rose-600">
                          [!] Cảnh báo tần suất vi phạm
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Bình thường</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formal Corporate Signatures */}
        <div className="flex justify-end pt-10 text-center text-xs">
          <div className="w-56">
            <p className="font-bold uppercase text-slate-800">NGƯỜI LẬP BÁO CÁO</p>
            <p className="text-[10px] text-slate-400 mt-0.5">(Ký, ghi rõ họ tên)</p>
            <div className="h-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
