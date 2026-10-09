import React, { useState, useMemo } from 'react';
import { NormalizedRecord, StatisticsOverview } from '../../types';
import {
  FileText,
  FileCheck,
  Layers,
  ExternalLink,
  ChevronRight,
  Search,
  X,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

interface ErrorProportionChartsProps {
  overview: StatisticsOverview;
  records?: NormalizedRecord[];
}

interface DonutChartProps {
  indexNumber: number;
  title: string;
  errorCount: number;
  validCount: number;
  totalCount: number;
  errorRate: number;
  icon: React.ReactNode;
  theme: {
    badgeBg: string;
    badgeText: string;
    border: string;
    errorColor: string;
    validColor: string;
  };
  errorLabel: string;
  validLabel: string;
  sampleErrors: NormalizedRecord[];
  onOpenList: () => void;
}

const DonutItem: React.FC<DonutChartProps> = ({
  indexNumber,
  title,
  errorCount,
  validCount,
  totalCount,
  errorRate,
  icon,
  theme,
  errorLabel,
  validLabel,
  sampleErrors,
  onOpenList,
}) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89
  const clampedRate = Math.min(Math.max(errorRate, 0), 100);
  const errorStrokeDash = (clampedRate / 100) * circumference;
  const validRate = totalCount > 0 ? Math.round((validCount / totalCount) * 1000) / 10 : 0;

  return (
    <div
      onClick={onOpenList}
      className={`bg-white rounded-2xl border ${theme.border} p-5 shadow-xs relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md hover:border-blue-400 cursor-pointer group`}
    >
      <div>
        {/* Top Header with Clean Number Indicator (1, 2, 3) */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className={`w-7 h-7 rounded-xl ${theme.badgeBg} ${theme.badgeText} flex items-center justify-center font-black text-sm shadow-xs shrink-0 ring-2 ring-white`}
          >
            {indexNumber}
          </div>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight flex-1" title={title}>
            {title}
          </h3>
        </div>

        {/* Donut Chart Visualization */}
        <div className="my-1 flex items-center justify-center gap-5">
          {/* SVG Circular Donut */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Track (Valid Stroke) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={theme.validColor}
                strokeWidth="11"
                className="opacity-90 transition-all duration-500"
              />

              {/* Error Arc */}
              {errorCount > 0 && (
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={theme.errorColor}
                  strokeWidth="11"
                  strokeDasharray={`${errorStrokeDash} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              )}
            </svg>

            {/* Center Text in Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-xl font-black tracking-tight text-slate-900">
                {errorRate}%
              </span>
              <span className="text-[10px] font-semibold text-rose-600 uppercase">
                Vi phạm
              </span>
            </div>
          </div>

          {/* Legend & Exact Numbers */}
          <div className="flex-1 space-y-2 text-xs">
            {/* Error Row */}
            <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
              <div className="flex items-center justify-between text-rose-900">
                <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                    style={{ backgroundColor: theme.errorColor }}
                  />
                  <span className="truncate">{errorLabel}:</span>
                </span>
                <strong className="text-rose-700 font-mono text-xs">
                  {errorCount}
                </strong>
              </div>
              <div className="text-[10px] text-rose-700/80 text-right mt-0.5 font-medium">
                Tỷ lệ {errorRate}%
              </div>
            </div>

            {/* Valid Row */}
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center justify-between text-emerald-900">
                <span className="flex items-center gap-1.5 font-semibold text-[11px]">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
                    style={{ backgroundColor: theme.validColor }}
                  />
                  <span className="truncate">{validLabel}:</span>
                </span>
                <strong className="text-emerald-700 font-mono text-xs">
                  {validCount}
                </strong>
              </div>
              <div className="text-[10px] text-emerald-700/80 text-right mt-0.5 font-medium">
                Tỷ lệ {validRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Footer Total Summary */}
        <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <span>Tổng số lượng cấp:</span>
          <strong className="text-slate-900 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded-md">
            {totalCount} Phiếu / Lệnh
          </strong>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
        <span className="text-xs font-bold text-blue-600 group-hover:text-blue-800 inline-flex items-center gap-1">
          <span>Xem danh sách chi tiết </span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
        </span>
      </div>
    </div>
  );
};

export const ErrorProportionCharts: React.FC<ErrorProportionChartsProps> = ({
  overview,
  records = [],
}) => {
  const [drilldownType, setDrilldownType] = useState<'PCT' | 'LCT' | 'ALL' | null>(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  // 1. Phân loại danh sách Phiếu công tác (PCT)
  const pctList = useMemo(() => records.filter((r) => r.documentType === 'PCT'), [records]);
  const pctErrorList = useMemo(
    () =>
      pctList.filter(
        (r) => r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0
      ),
    [pctList]
  );

  // 2. Phân loại danh sách Lệnh công tác (LCT)
  const lctList = useMemo(() => records.filter((r) => r.documentType === 'LCT'), [records]);
  const lctErrorList = useMemo(
    () =>
      lctList.filter(
        (r) => r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0
      ),
    [lctList]
  );

  // 3. Tổng hợp Phiếu + Lệnh công tác
  const totalDocsList = records;
  const totalErrorList = useMemo(
    () =>
      totalDocsList.filter(
        (r) => r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0
      ),
    [totalDocsList]
  );

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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 1: Phiếu công tác (PCT) */}
        <DonutItem
          indexNumber={1}
          title="Phiếu công tác (PCT)"
          errorCount={overview.pctWithErrors}
          validCount={overview.pctValid}
          totalCount={overview.totalPCT}
          errorRate={overview.pctErrorRate}
          errorLabel="Phiếu vi phạm"
          validLabel="Phiếu hợp lệ"
          icon={<FileText className="w-4 h-4 text-blue-600" />}
          theme={{
            badgeBg: 'bg-blue-600',
            badgeText: 'text-white',
            border: 'border-blue-200/90',
            errorColor: '#2563eb', // blue-600
            validColor: '#dbeafe', // light blue
          }}
          sampleErrors={pctErrorList}
          onOpenList={() => {
            setDrilldownType('PCT');
            setModalSearchTerm('');
          }}
        />

        {/* 2: Lệnh công tác (LCT) */}
        <DonutItem
          indexNumber={2}
          title="Lệnh công tác (LCT)"
          errorCount={overview.lctWithErrors}
          validCount={overview.lctValid}
          totalCount={overview.totalLCT}
          errorRate={overview.lctErrorRate}
          errorLabel="Lệnh vi phạm"
          validLabel="Lệnh hợp lệ"
          icon={<FileCheck className="w-4 h-4 text-emerald-600" />}
          theme={{
            badgeBg: 'bg-emerald-600',
            badgeText: 'text-white',
            border: 'border-emerald-200/90',
            errorColor: '#059669', // emerald-600
            validColor: '#d1fae5', // light emerald
          }}
          sampleErrors={lctErrorList}
          onOpenList={() => {
            setDrilldownType('LCT');
            setModalSearchTerm('');
          }}
        />

        {/* 3: Tổng Phiếu & Lệnh lỗi */}
        <DonutItem
          indexNumber={3}
          title="Tổng Phiếu & Lệnh lỗi"
          errorCount={overview.documentsWithErrors}
          validCount={overview.validDocuments}
          totalCount={overview.totalDocuments}
          errorRate={overview.errorRate}
          errorLabel="Phiếu/Lệnh vi phạm"
          validLabel="Phiếu/Lệnh hợp lệ"
          icon={<Layers className="w-4 h-4 text-rose-600" />}
          theme={{
            badgeBg: 'bg-rose-600',
            badgeText: 'text-white',
            border: 'border-rose-200/90',
            errorColor: '#e11d48', // rose-600
            validColor: '#ffe4e6', // light rose
          }}
          sampleErrors={totalErrorList}
          onOpenList={() => {
            setDrilldownType('ALL');
            setModalSearchTerm('');
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* MODAL CHI TIẾT DANH SÁCH PHIẾU/LỆNH LỖI (KHI NHẤP VÀO BIỂU ĐỒ TỔNG QUAN) */}
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
                    Tổng cộng: <strong className="text-rose-600 font-bold">{activeModalRecords.length}</strong> phiếu/lệnh vi phạm
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
                  <p className="text-xs">Không tìm thấy phiếu/lệnh vi phạm nào phù hợp với từ khóa.</p>
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
                            Chức danh liên quan:
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
    </>
  );
};
