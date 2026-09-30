import React, { useState } from 'react';
import { PersonStat } from '../types';
import { Search, ShieldAlert } from 'lucide-react';

interface HeatmapMatrixProps {
  personalStats: PersonStat[];
  targetYear: number;
  onSelectPerson?: (personName: string) => void;
}

export const HeatmapMatrix: React.FC<HeatmapMatrixProps> = ({
  personalStats,
  targetYear,
  onSelectPerson,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Filter persons
  const filtered = personalStats.filter((p) => {
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterAlertOnly && !p.hasMonthlyAlert && !p.hasYearlyAlert) {
      return false;
    }
    return true;
  });

  // Calculate cell color based on number of VIOLATING DOCUMENTS (phiếu, lệnh)
  const getCellColor = (violations: number | undefined) => {
    if (!violations || violations === 0) {
      return 'bg-slate-50 text-slate-400 hover:bg-slate-100';
    }
    if (violations === 1) {
      return 'bg-amber-100 text-amber-900 font-bold border border-amber-300';
    }
    if (violations >= 2 && violations < 5) {
      // Highlight monthly alert >= 2 violating documents
      return 'bg-rose-500 text-white font-black shadow-xs ring-2 ring-rose-400 ring-offset-1';
    }
    // Very high violations (>= 5 documents)
    return 'bg-rose-700 text-white font-black shadow-md ring-2 ring-rose-600 ring-offset-1';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Thống kê năm</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi số lượng Phiếu và Lệnh công tác vi phạm và cảnh báo cá nhân tự động (Năm {targetYear})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo họ tên..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Toggle Alert only */}
          <button
            onClick={() => setFilterAlertOnly(!filterAlertOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
              filterAlertOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Chỉ người có cảnh báo</span>
          </button>
        </div>
      </div>

      {/* Legend & Alert Criteria Rules (Thống kê theo số phiếu, lệnh vi phạm) */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-3 bg-slate-50/80 rounded-xl my-4 text-xs text-slate-600 border border-slate-200/60">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
            Quy ước mức độ vi phạm:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200 inline-block"></span>
            <span className="text-[11px]">0 Phiếu/Lệnh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-amber-100 border border-amber-300 inline-block"></span>
            <span className="text-[11px]">1 Phiếu/Lệnh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-rose-500 inline-block"></span>
            <span className="text-[11px] font-bold text-rose-700">≥ 2 Phiếu/Lệnh (Cảnh báo tháng)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-rose-700 inline-block"></span>
            <span className="text-[11px] font-bold text-rose-800">≥ 5 Phiếu/Lệnh (Nghiêm trọng)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
            [!] Cảnh báo
          </span>
          <span>= Có ≥2 phiếu/lệnh vi phạm trong 1 tháng HOẶC vi phạm tại ≥2 tháng trong năm</span>
        </div>
      </div>

      {/* Table Matrix with Horizontal & Vertical Scroll */}
      <div className="overflow-x-auto overflow-y-auto max-h-[560px] border border-slate-200 rounded-xl relative shadow-2xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 sticky top-0 z-20 shadow-xs">
            <tr>
              <th className="py-3 px-3 w-10 text-center">STT</th>
              <th className="py-3 px-3 min-w-[180px]">Họ và tên</th>
              <th className="py-3 px-3 min-w-[140px]">Chức danh / Vai trò</th>
              {months.map((m) => (
                <th key={m} className="py-3 px-2 text-center w-12">
                  T{m}
                </th>
              ))}
              <th className="py-3 px-3 text-center min-w-[120px] bg-slate-200/60">
                Tổng Phiếu/Lệnh vi phạm
              </th>
              <th className="py-3 px-3 text-center min-w-[110px] bg-slate-200/60">
                Số tháng có vi phạm
              </th>
              <th className="py-3 px-3 text-center min-w-[130px]">
                Trạng thái cảnh báo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={18} className="py-8 text-center text-slate-400">
                  Không tìm thấy cá nhân phù hợp với điều kiện tìm kiếm.
                </td>
              </tr>
            ) : (
              filtered.map((person, idx) => {
                const isAlert = person.hasMonthlyAlert || person.hasYearlyAlert;

                return (
                  <tr
                    key={person.name}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isAlert ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onSelectPerson && onSelectPerson(person.name)}
                        className="font-bold text-slate-900 hover:text-blue-600 transition text-left cursor-pointer"
                      >
                        {person.name}
                      </button>
                      <div className="text-[10px] text-slate-400">
                        {person.documentsCount} Phiếu/Lệnh liên đới • {person.totalErrors} lỗi
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {person.roles.map((r) => (
                          <span
                            key={r}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* 12 Months Columns: Thống kê số phiếu, lệnh (hồ sơ) vi phạm */}
                    {months.map((m) => {
                      const violationCount = person.monthlyViolations[m] || 0;
                      return (
                        <td key={m} className="p-1 text-center">
                          <div
                            className={`w-9 h-7 rounded-md mx-auto flex items-center justify-center text-xs transition-all ${getCellColor(
                              violationCount
                            )}`}
                            title={`Tháng ${m}/${targetYear}: ${violationCount} phiếu/lệnh vi phạm`}
                          >
                            {violationCount > 0 ? violationCount : '–'}
                          </div>
                        </td>
                      );
                    })}

                    {/* Tổng số hồ sơ vi phạm (phiếu/lệnh) */}
                    <td className="py-2.5 px-3 text-center font-black text-sm bg-slate-50/50">
                      <span
                        className={
                          person.errorDocumentsCount > 3
                            ? 'text-rose-600'
                            : person.errorDocumentsCount > 0
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }
                      >
                        {person.errorDocumentsCount}
                      </span>
                    </td>

                    {/* Số tháng có vi phạm */}
                    <td className="py-2.5 px-3 text-center font-bold text-xs bg-slate-50/50">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full ${
                          person.monthsWithErrorsCount >= 2
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 font-black'
                            : person.monthsWithErrorsCount === 1
                            ? 'bg-amber-100 text-amber-800'
                            : 'text-slate-400'
                        }`}
                      >
                        {person.monthsWithErrorsCount} tháng
                      </span>
                    </td>

                    {/* Trạng thái cảnh báo */}
                    <td className="py-2.5 px-3 text-center">
                      {isAlert ? (
                        <div className="inline-flex flex-col gap-0.5">
                          {person.hasMonthlyAlert && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                              ≥ 2 hồ sơ / tháng
                            </span>
                          )}
                          {person.hasYearlyAlert && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                              Vi phạm tại ≥ 2 tháng
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Bình thường
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
