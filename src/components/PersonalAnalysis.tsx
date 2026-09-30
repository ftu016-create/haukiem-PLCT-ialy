import React, { useState } from 'react';
import { PersonStat, NormalizedRecord } from '../types';
import { Users, AlertTriangle, Calendar, ShieldAlert, ExternalLink, Search } from 'lucide-react';

interface PersonalAnalysisProps {
  personalStats: PersonStat[];
  records: NormalizedRecord[];
  selectedMonth: number | 'all';
  onSelectRecord?: (record: NormalizedRecord) => void;
}

export const PersonalAnalysis: React.FC<PersonalAnalysisProps> = ({
  personalStats,
  records,
  selectedMonth,
  onSelectRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<PersonStat | null>(null);

  const filteredStats = personalStats.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get records for selected person
  const personRecords = selectedPerson
    ? records.filter(
        (r) =>
          r.issuer.trim() === selectedPerson.name.trim() ||
          r.leader.trim() === selectedPerson.name.trim() ||
          r.approver.trim() === selectedPerson.name.trim()
      )
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Thống kê Cá nhân liên quan</span>
            </h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo họ tên..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {filteredStats.map((person) => {
            const hasAlert = person.hasMonthlyAlert || person.hasYearlyAlert;

            return (
              <div
                key={person.name}
                onClick={() => setSelectedPerson(person)}
                className={`rounded-2xl border p-4.5 transition-all cursor-pointer hover:shadow-md relative overflow-hidden group ${
                  hasAlert
                    ? 'bg-rose-50/20 border-rose-300 hover:border-rose-400'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition flex items-center gap-1.5">
                      {person.name}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {person.roles.map((r) => (
                        <span
                          key={r}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-medium border border-slate-200"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Warning Badge */}
                  {hasAlert && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs shrink-0">
                      <ShieldAlert className="w-3 h-3" />
                      Cảnh báo
                    </span>
                  )}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50/80 rounded-xl mb-3 text-center border border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-500">Phiếu/Lệnh vi phạm</div>
                    <div
                      className={`text-base font-black ${
                        person.errorDocumentsCount > 0 ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {person.errorDocumentsCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Số lỗi</div>
                    <div className="text-base font-black text-rose-600">
                      {person.totalErrors}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Số tháng vi phạm</div>
                    <div
                      className={`text-base font-bold ${
                        person.monthsWithErrorsCount >= 2 ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {person.monthsWithErrorsCount}
                    </div>
                  </div>
                </div>

                {/* Details list */}
                <div className="text-[11px] space-y-1 text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Tổng lỗi phát hiện:</span>
                    <strong className="text-slate-700 font-mono">
                      {person.totalErrors} lỗi
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Lần vi phạm gần nhất:</span>
                    <span className="font-semibold text-slate-700 font-mono">
                      {person.lastErrorDate || 'Không có'}
                    </span>
                  </div>

                  {person.monthsWithErrors.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Các tháng có vi phạm:</span>
                      <span className="font-medium text-slate-700">
                        {person.monthsWithErrors.map((m) => `T${m}`).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Specific Alert notes */}
                  {person.hasMonthlyAlert && (
                    <div className="text-[10px] text-rose-600 font-semibold flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3 h-3" />
                      Có từ 2 phiếu/lệnh vi phạm trong 1 tháng
                    </div>
                  )}
                  {person.hasYearlyAlert && (
                    <div className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Vi phạm phiếu/lệnh tại từ 2 tháng trở lên trong năm
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Xem {person.documentsCount} Phiếu/Lệnh liên quan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drilldown Modal for Selected Person */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">{selectedPerson.name}</h3>
                  {selectedPerson.hasMonthlyAlert || selectedPerson.hasYearlyAlert ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                      Cảnh báo sai sót
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                      Bình thường
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vai trò: {selectedPerson.roles.join(' • ')} | Tổng số lỗi: {selectedPerson.totalErrors} | {personRecords.length} Phiếu/Lệnh liên đới
                </p>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Documents list */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Danh sách Phiếu & Lệnh công tác liên quan ({personRecords.length})
              </h4>

              {personRecords.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-3.5 rounded-xl border transition ${
                    rec.errorCount > 0
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-blue-100 text-blue-800 border border-blue-200">
                        {rec.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        {rec.documentType === 'PCT' ? 'Phiếu công tác' : 'Lệnh công tác'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{rec.auditDate}</span>
                    </div>

                    <div>
                      {rec.result === 'Có sai sót' ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          {rec.errorCount} Lỗi phát hiện
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Hợp lệ (100%)
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-800 mb-2">{rec.jobName}</p>

                  <div className="text-[11px] text-slate-500 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2 rounded-lg">
                    <div>Người cấp: <strong className="text-slate-700">{rec.issuer}</strong></div>
                    <div>Người CHTT: <strong className="text-slate-700">{rec.leader}</strong></div>
                    <div>Người cho phép: <strong className="text-slate-700">{rec.approver}</strong></div>
                  </div>

                  {/* Parsed errors */}
                  {rec.parsedErrors.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <div className="text-[11px] font-bold text-rose-700">Chi tiết vi phạm:</div>
                      {rec.parsedErrors.map((err, eIdx) => (
                        <div
                          key={eIdx}
                          className="flex items-start gap-1.5 text-xs text-slate-700 pl-2 border-l-2 border-rose-400 py-0.5"
                        >
                          <span
                            className={`px-1 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                              err.severity === 'CRITICAL'
                                ? 'bg-rose-600 text-white'
                                : err.severity === 'WARNING'
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-600 text-white'
                            }`}
                          >
                            {err.severity}
                          </span>
                          <span>{err.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setSelectedPerson(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 transition cursor-pointer"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
