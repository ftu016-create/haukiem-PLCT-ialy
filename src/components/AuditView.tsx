import React, { useState } from 'react';
import { AuditLogEntry, NormalizedRecord } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Info,
  Clock,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';

interface AuditViewProps {
  allParsedRecords: NormalizedRecord[];
  uniqueRecords: NormalizedRecord[];
  duplicatesRemovedCount: number;
  auditLogs: AuditLogEntry[];
}

export const AuditView: React.FC<AuditViewProps> = ({
  allParsedRecords,
  uniqueRecords,
  duplicatesRemovedCount,
  auditLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'duplicates' | 'same_code' | 'anomalies' | 'logs'>(
    'duplicates'
  );

  // Filter lists
  const duplicateRecords = allParsedRecords.filter((r) => r.isDuplicate);
  const sameCodeDiffDataRecords = uniqueRecords.filter((r) => r.hasSameCodeDiffData);
  const anomalyRecords = uniqueRecords.filter((r) => r.anomalyFlags.length > 0);

  return (
    <div className="space-y-6">
      {/* Top Overview of Integrity Engine */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Kiểm định Dữ liệu & Quản lý Trùng lặp Tuyệt đối (Data Integrity)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đảm bảo tính chính xác khoa học, loại bỏ bản ghi thừa mà không làm mất dữ liệu hợp lệ
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
              ✓ Toàn vẹn dữ liệu: 100%
            </span>
          </div>
        </div>

        {/* 3 Integrity Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="font-semibold uppercase text-[11px]">Tổng dòng đọc từ Sheets:</span>
              <Database className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900">{allParsedRecords.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Dữ liệu nguồn gốc chưa qua lọc</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
              <span className="font-semibold uppercase text-[11px]">Bản ghi trùng 100% đã loại:</span>
              <Copy className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-700">{duplicatesRemovedCount}</div>
            <p className="text-[11px] text-amber-700/80 mt-1">Áp dụng quy tắc A = B = C → Giữ 1</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <div className="flex items-center justify-between text-xs text-blue-800 mb-1">
              <span className="font-semibold uppercase text-[11px]">Hồ sơ chính thức đưa vào tính:</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-700">{uniqueRecords.length}</div>
            <p className="text-[11px] text-blue-700/80 mt-1">Tập dữ liệu chuẩn hóa đưa vào Dashboard</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'duplicates'
                ? 'bg-amber-100 text-amber-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Bản ghi Trùng Hoàn Toàn Đã Loại Bỏ</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
              {duplicateRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('same_code')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'same_code'
                ? 'bg-blue-100 text-blue-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Cùng Mã Nhưng Khác Dữ Liệu (Bảo Lưu)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200 text-blue-900 font-bold">
              {sameCodeDiffDataRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('anomalies')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'anomalies'
                ? 'bg-rose-100 text-rose-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Cảnh báo Dữ liệu Bất thường</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 text-rose-900 font-bold">
              {anomalyRecords.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-slate-200 text-slate-900 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>Nhật ký Kiểm định (Audit Logs)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 text-slate-800 font-bold">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: DUPLICATES REMOVED */}
        {activeTab === 'duplicates' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <strong>Nguyên tắc:</strong> Hai bản ghi chỉ bị loại bỏ khi toàn bộ 13 trường dữ liệu
              nghiệp vụ (Mã, Tên công việc, Người kiểm, Email, Đơn vị, Người cấp, CHTT, Người cho phép, Kết quả, Điểm %, Số lỗi, Nội dung lỗi, Ngày) trùng khớp 100%. Hệ thống giữ lại duy nhất 1 bản ghi đại diện.
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">Dòng Sheets</th>
                    <th className="py-3 px-3 min-w-[150px]">Mã Phiếu / Lệnh</th>
                    <th className="py-3 px-3 min-w-[200px]">Tên công việc</th>
                    <th className="py-3 px-3 w-28 text-center">Ngày kiểm</th>
                    <th className="py-3 px-3 w-32 text-center">Trùng 100% với</th>
                    <th className="py-3 px-3 min-w-[180px]">Hành động xử lý</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {duplicateRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Không phát hiện bản ghi trùng lặp 100% nào.
                      </td>
                    </tr>
                  ) : (
                    duplicateRecords.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-500">
                          #{d.rawIndex}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{d.code}</td>
                        <td className="py-2.5 px-3 text-slate-700 line-clamp-1">{d.jobName}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">{d.auditDate}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                            Dòng #{d.duplicateOfIndex}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-amber-600" />
                            Đã loại trừ khỏi Dataset
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SAME CODE BUT DIFFERENT DATA */}
        {activeTab === 'same_code' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900">
              <strong>Quy tắc bắt buộc:</strong> Tuyệt đối không xóa trùng chỉ vì có cùng Mã Phiếu hoặc Lệnh công tác. Dưới đây là các bản ghi có chung số hiệu nhưng khác biệt về người tham gia, ngày kiểm, số lỗi hoặc nội dung lỗi. Toàn bộ các dòng này đều được bảo lưu nguyên vẹn.
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3 min-w-[170px]">Mã Phiếu / Lệnh</th>
                    <th className="py-3 px-3 min-w-[200px]">Tên công việc</th>
                    <th className="py-3 px-3 min-w-[140px]">Người CHTT</th>
                    <th className="py-3 px-3 w-20 text-center">Số lỗi</th>
                    <th className="py-3 px-3 w-28 text-center">Ngày kiểm</th>
                    <th className="py-3 px-3 min-w-[180px]">Minh chứng an toàn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sameCodeDiffDataRecords.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.code}</td>
                      <td className="py-2.5 px-3 text-slate-700 line-clamp-1">{r.jobName}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{r.leader}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-black ${
                            r.errorCount > 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          {r.errorCount}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{r.auditDate}</td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                          ✓ Bảo lưu hợp lệ (Khác nội dung)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ANOMALIES */}
        {activeTab === 'anomalies' && (
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900">
              <strong>Cảnh báo bất thường:</strong> Phát hiện các trường dữ liệu thiếu sót (như thiếu ngày kiểm, mã chưa xác định, thiếu thông tin người cấp/chỉ huy, hoặc nghịch lý thời gian theo Quy trình 278).
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center">STT</th>
                    <th className="py-3 px-3 min-w-[160px]">Mã Phiếu / Lệnh</th>
                    <th className="py-3 px-3 min-w-[200px]">Tên công việc</th>
                    <th className="py-3 px-3 min-w-[220px]">Các vấn đề bất thường phát hiện</th>
                    <th className="py-3 px-3 w-28 text-center">Ngày kiểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anomalyRecords.map((r, idx) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{r.code}</td>
                      <td className="py-2.5 px-3 text-slate-700">{r.jobName}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {r.anomalyFlags.map((flag, fIdx) => (
                            <span
                              key={fIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              {flag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{r.auditDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-3">
            {auditLogs.slice(0, 30).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3 text-xs"
              >
                <div className="mt-0.5 p-1 rounded-lg bg-blue-100 text-blue-800 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900">{log.title}</span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.details}</p>
                  {log.fingerprint && (
                    <div className="text-[10px] text-slate-400 font-mono truncate mt-1 bg-white p-1 rounded border border-slate-200">
                      Fingerprint: {log.fingerprint}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
