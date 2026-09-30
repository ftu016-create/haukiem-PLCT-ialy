import React from 'react';
import { StatisticsOverview } from '../../types';
import { FileText, FileCheck, Layers } from 'lucide-react';

interface ErrorProportionChartsProps {
  overview: StatisticsOverview;
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
}) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // ~263.89
  const clampedRate = Math.min(Math.max(errorRate, 0), 100);
  const errorStrokeDash = (clampedRate / 100) * circumference;
  const validRate = totalCount > 0 ? Math.round((validCount / totalCount) * 1000) / 10 : 0;

  return (
    <div
      className={`bg-white rounded-2xl border ${theme.border} p-5 shadow-xs relative overflow-hidden flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300`}
    >
      {/* Top Header with Clean Number Indicator (1, 2, 3) */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-xl ${theme.badgeBg} ${theme.badgeText} flex items-center justify-center font-black text-sm shadow-xs shrink-0 ring-2 ring-white`}
          >
            {indexNumber}
          </div>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight truncate" title={title}>
            {title}
          </h3>
        </div>

        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60 shrink-0">
          {icon}
        </div>
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
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
        <span>Tổng số lượng:</span>
        <strong className="text-slate-900 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded-md">
          {totalCount} Phiếu / Lệnh
        </strong>
      </div>
    </div>
  );
};

export const ErrorProportionCharts: React.FC<ErrorProportionChartsProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 1: Tỉ lệ số Phiếu vi phạm / Tổng số Phiếu */}
      <DonutItem
        indexNumber={1}
        title="Tỉ lệ số Phiếu vi phạm / Tổng số Phiếu"
        errorCount={overview.pctWithErrors}
        validCount={overview.pctValid}
        totalCount={overview.totalPCT}
        errorRate={overview.pctErrorRate}
        errorLabel="Phiếu vi phạm"
        validLabel="Phiếu hợp lệ"
        icon={<FileText className="w-4 h-4 text-blue-600" />}
        theme={{
          badgeBg: 'bg-rose-600',
          badgeText: 'text-white',
          border: 'border-slate-200/90',
          errorColor: '#e11d48', // rose-600
          validColor: '#2563eb', // blue-600
        }}
      />

      {/* 2: Tỉ lệ số Lệnh vi phạm / Tổng số Lệnh */}
      <DonutItem
        indexNumber={2}
        title="Tỉ lệ số Lệnh vi phạm / Tổng số Lệnh"
        errorCount={overview.lctWithErrors}
        validCount={overview.lctValid}
        totalCount={overview.totalLCT}
        errorRate={overview.lctErrorRate}
        errorLabel="Lệnh vi phạm"
        validLabel="Lệnh hợp lệ"
        icon={<FileCheck className="w-4 h-4 text-emerald-600" />}
        theme={{
          badgeBg: 'bg-amber-600',
          badgeText: 'text-white',
          border: 'border-slate-200/90',
          errorColor: '#ea580c', // orange-600
          validColor: '#059669', // emerald-600
        }}
      />

      {/* 3: Tỉ lệ tổng số Phiếu + Lệnh vi phạm / Tổng số Phiếu lệnh */}
      <DonutItem
        indexNumber={3}
        title="Tỉ lệ tổng số Phiếu + Lệnh vi phạm / Tổng số Phiếu lệnh"
        errorCount={overview.documentsWithErrors}
        validCount={overview.validDocuments}
        totalCount={overview.totalDocuments}
        errorRate={overview.errorRate}
        errorLabel="Phiếu/Lệnh vi phạm"
        validLabel="Phiếu/Lệnh hợp lệ"
        icon={<Layers className="w-4 h-4 text-indigo-600" />}
        theme={{
          badgeBg: 'bg-indigo-600',
          badgeText: 'text-white',
          border: 'border-slate-200/90',
          errorColor: '#dc2626', // red-600
          validColor: '#10b981', // emerald-500
        }}
      />
    </div>
  );
};
