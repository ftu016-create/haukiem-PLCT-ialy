import React, { useState, useMemo } from 'react';
import { NormalizedRecord, ErrorSeverity } from '../types';
import {
  FileSpreadsheet,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileCheck,
  ShieldCheck,
  Info
} from 'lucide-react';

interface DataTableProps {
  records: NormalizedRecord[];
  onSelectRecord?: (record: NormalizedRecord) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ records, onSelectRecord }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'date' | 'errors' | 'code' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedModalRecord, setSelectedModalRecord] = useState<NormalizedRecord | null>(null);

  // Search & Sorting
  const filteredRecords = useMemo(() => {
    let result = records.filter((rec) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        rec.code.toLowerCase().includes(q) ||
        rec.jobName.toLowerCase().includes(q) ||
        rec.issuer.toLowerCase().includes(q) ||
        rec.leader.toLowerCase().includes(q) ||
        rec.approver.toLowerCase().includes(q) ||
        rec.inspectorName.toLowerCase().includes(q) ||
        rec.unit.toLowerCase().includes(q) ||
        rec.rawErrors.toLowerCase().includes(q) ||
        rec.auditDate.includes(q)
      );
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.auditDate.localeCompare(b.auditDate);
      } else if (sortField === 'errors') {
        comparison = a.errorCount - b.errorCount;
      } else if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code);
      } else if (sortField === 'score') {
        comparison = a.safetyScore - b.safetyScore;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [records, searchTerm, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const toggleSort = (field: 'date' | 'errors' | 'code' | 'score') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Danh sách Phiếu & Lệnh Công tác Đã Soát</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng {records.length} Phiếu và Lệnh công tác đã được chuẩn hóa dữ liệu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Tra cứu mã, người, ngày, lỗi..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Dòng/trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-4 border border-slate-200 rounded-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 w-10 text-center">STT</th>
              <th
                onClick={() => toggleSort('date')}
                className="py-3 px-3 min-w-[100px] cursor-pointer hover:bg-slate-200/70 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Ngày kiểm</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('code')}
                className="py-3 px-3 min-w-[170px] cursor-pointer hover:bg-slate-200/70 transition"
              >
                <div className="flex items-center gap-1">
                  <span>Mã PCT / LCT</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 min-w-[200px]">Tên công việc & Đơn vị</th>
              <th className="py-3 px-3 min-w-[160px]">Nhân sự phụ trách</th>
              <th className="py-3 px-3 text-center w-24">Kết quả</th>
              <th
                onClick={() => toggleSort('errors')}
                className="py-3 px-3 text-center w-20 cursor-pointer hover:bg-slate-200/70 transition"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Số lỗi</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 min-w-[220px]">Tóm tắt nội dung lỗi</th>
              <th className="py-3 px-3 text-center w-16">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  Không tìm thấy phiếu/lệnh nào khớp với điều kiện tìm kiếm.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                const hasErrors = rec.result === 'Có sai sót' || rec.errorCount > 0;

                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-blue-50/30 transition-colors ${
                      hasErrors ? 'bg-white' : 'bg-slate-50/20'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                      {globalIndex}
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3 font-mono text-slate-600 font-medium">
                      {rec.auditDate}
                    </td>

                    {/* Code & Type */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rec.documentType === 'PCT'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {rec.documentType}
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {rec.code}
                          </span>
                        </div>

                        {/* CASE A Proof: SAME CODE BUT DIFFERENT DATA */}
                        {rec.hasSameCodeDiffData && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 w-fit">
                            <Info className="w-2.5 h-2.5 text-amber-600" />
                            Cùng mã khác dữ liệu (Bảo lưu)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Job Name & Unit */}
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-slate-800 line-clamp-2" title={rec.jobName}>
                        {rec.jobName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{rec.unit}</p>
                    </td>

                    {/* Personnel */}
                    <td className="py-2.5 px-3 text-[11px] text-slate-600 space-y-0.5">
                      <div>
                        CHTT: <strong className="text-slate-800">{rec.leader}</strong>
                      </div>
                      <div>
                        Cấp phiếu: <span className="text-slate-700">{rec.issuer}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Cho phép: {rec.approver}
                      </div>
                    </td>

                    {/* Result */}
                    <td className="py-2.5 px-3 text-center">
                      {hasErrors ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Có sai sót
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Hợp lệ
                        </span>
                      )}
                    </td>

                    {/* Error Count */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`font-black text-sm ${
                          rec.errorCount > 0 ? 'text-rose-600 font-mono' : 'text-slate-300'
                        }`}
                      >
                        {rec.errorCount > 0 ? rec.errorCount : '0'}
                      </span>
                    </td>

                    {/* Error Snippet */}
                    <td className="py-2.5 px-3">
                      {rec.parsedErrors.length > 0 ? (
                        <div className="space-y-1 max-w-sm">
                          {rec.parsedErrors.slice(0, 2).map((err, eIdx) => (
                            <div
                              key={eIdx}
                              className="text-[11px] truncate flex items-center gap-1 text-slate-700"
                            >
                              <span className="text-rose-500 font-bold text-xs shrink-0">•</span>
                              <span className="truncate">{err.message}</span>
                            </div>
                          ))}
                          {rec.parsedErrors.length > 2 && (
                            <div className="text-[10px] text-slate-400 font-medium italic">
                              + thêm {rec.parsedErrors.length - 2} lỗi khác...
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">
                          Đạt 100% yêu cầu an toàn
                        </span>
                      )}
                    </td>

                    {/* Detail Button */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedModalRecord(rec)}
                        title="Xem đầy đủ chi tiết"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-600 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-slate-500">
        <div>
          Hiển thị{' '}
          <strong className="text-slate-800">
            {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </strong>{' '}
          đến{' '}
          <strong className="text-slate-800">
            {Math.min(currentPage * pageSize, filteredRecords.length)}
          </strong>{' '}
          trên tổng số <strong className="text-slate-800">{filteredRecords.length}</strong> phiếu/lệnh
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-semibold text-slate-700">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detailed Modal for Selected Record */}
      {selectedModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-blue-600 text-white">
                    {selectedModalRecord.code}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-200 text-slate-800">
                    {selectedModalRecord.documentType === 'PCT' ? 'Phiếu công tác' : 'Lệnh công tác'}
                  </span>
                  {selectedModalRecord.hasSameCodeDiffData && (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Cùng mã khác dữ liệu (Bảo lưu)
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {selectedModalRecord.jobName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedModalRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Người chỉ huy trực tiếp:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedModalRecord.leader}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Người cấp phiếu:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedModalRecord.issuer}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Người cho phép:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedModalRecord.approver}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block mb-0.5">Người & Ngày hậu kiểm:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {selectedModalRecord.inspectorName} ({selectedModalRecord.auditDate})
                  </span>
                </div>
              </div>

              {/* Status summary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Đơn vị: </span>
                  <strong className="text-slate-800">{selectedModalRecord.unit}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Điểm an toàn: </span>
                  <strong className="text-slate-800">{selectedModalRecord.safetyScore}%</strong>
                </div>
                <div>
                  <span className="text-slate-500">Tổng số lỗi: </span>
                  <strong className="text-rose-600 font-black">{selectedModalRecord.errorCount}</strong>
                </div>
              </div>

              {/* Error list */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Danh sách sai sót đã phát hiện ({selectedModalRecord.parsedErrors.length})
                </h4>

                {selectedModalRecord.parsedErrors.length === 0 ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium">
                    Hồ sơ hợp lệ, hoàn thành đầy đủ các thủ tục theo Quy trình 278/EVN.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedModalRecord.parsedErrors.map((err, eIdx) => (
                      <div
                        key={eIdx}
                        className="p-3 bg-rose-50/40 border border-rose-200 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              err.severity === 'CRITICAL'
                                ? 'bg-rose-600 text-white'
                                : err.severity === 'WARNING'
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {err.severity}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {err.ruleReference || 'Quy trình 278'}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-800">{err.message}</p>
                        <div className="text-[10px] text-slate-500">
                          Nhóm vi phạm: <strong className="text-slate-700">{err.category}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedModalRecord(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
