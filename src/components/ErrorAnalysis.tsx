import React, { useState } from 'react';
import { NormalizedRecord, ErrorCategory } from '../types';
import { calculateCategoryBreakdown } from '../engine/statisticsEngine';
import { AlertOctagon, BookOpen, Search, ShieldCheck } from 'lucide-react';

interface ErrorAnalysisProps {
  records: NormalizedRecord[];
}

export const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ErrorCategory>('all');

  const categories = calculateCategoryBreakdown(records);

  // Extract all individual parsed errors with context
  const allErrors: {
    id: string;
    code: string;
    jobName: string;
    unit: string;
    date: string;
    message: string;
    ruleReference: string;
    category: ErrorCategory;
    issuer: string;
    leader: string;
    approver: string;
  }[] = [];

  records.forEach((rec) => {
    rec.parsedErrors.forEach((err) => {
      allErrors.push({
        id: err.id,
        code: rec.code,
        jobName: rec.jobName,
        unit: rec.unit,
        date: rec.auditDate,
        message: err.message,
        ruleReference: err.ruleReference || 'Quy trình 278/QĐ-EVN',
        category: err.category,
        issuer: rec.issuer,
        leader: rec.leader,
        approver: rec.approver,
      });
    });
  });

  // Filter errors
  const filteredErrors = allErrors.filter((err) => {
    if (categoryFilter !== 'all' && err.category !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        err.message.toLowerCase().includes(q) ||
        err.code.toLowerCase().includes(q) ||
        err.ruleReference.toLowerCase().includes(q) ||
        err.leader.toLowerCase().includes(q) ||
        err.jobName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Group by Rules (e.g. Điều 30, Điều 31, Điều 25...)
  const ruleCounts = new Map<string, number>();
  allErrors.forEach((err) => {
    const rule = err.ruleReference || 'Quy định chung';
    ruleCounts.set(rule, (ruleCounts.get(rule) || 0) + 1);
  });
  const topRules = Array.from(ruleCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Categories & Quy trình 278 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Bar List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <AlertOctagon className="w-4 h-4 text-blue-600" />
            <span>Phân nhóm Vi phạm theo Quy trình An toàn EVN</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Bấm vào từng nhóm vi phạm để lọc danh sách chi tiết bên dưới
          </p>

          <div className="space-y-3">
            {categories.map((cat) => {
              const isSelected = categoryFilter === cat.category;
              return (
                <div
                  key={cat.category}
                  onClick={() =>
                    setCategoryFilter(isSelected ? 'all' : cat.category)
                  }
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800">{cat.category}</span>
                    <span className="font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {cat.count} vi phạm ({cat.percentage}%)
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 278 Rule Violations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Vi phạm theo Điều khoản</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Các điều thuộc Quy trình 278 có tần suất sai sót cao nhất
          </p>

          <div className="space-y-2">
            {topRules.map(([rule, count], rIdx) => (
              <div
                key={rule}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {rIdx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 truncate">{rule}</span>
                </div>
                <span className="font-bold text-rose-600 shrink-0">{count} lỗi</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Errors Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Danh mục Chi tiết Sai sót ({filteredErrors.length} mục)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toàn bộ các vi phạm được trích xuất từ dữ liệu hậu kiểm thực tế
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm nội dung, mã phiếu, điều khoản..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {categoryFilter !== 'all' && (
              <button
                onClick={() => setCategoryFilter('all')}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto mt-4 border border-slate-200 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">STT</th>
                <th className="py-3 px-3 min-w-[280px]">Nội dung vi phạm phát hiện</th>
                <th className="py-3 px-3 min-w-[160px]">Nhóm vi phạm & Căn cứ</th>
                <th className="py-3 px-3 min-w-[150px]">Số PCT / LCT</th>
                <th className="py-3 px-3 min-w-[140px]">Người CHTT</th>
                <th className="py-3 px-3 w-24 text-center">Ngày kiểm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredErrors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không có sai sót nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredErrors.map((err, idx) => (
                  <tr key={err.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-slate-800 flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold text-sm shrink-0 leading-tight">•</span>
                      <span>{err.message}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-700">{err.category}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{err.ruleReference}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {err.code}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-700">{err.leader}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{err.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
