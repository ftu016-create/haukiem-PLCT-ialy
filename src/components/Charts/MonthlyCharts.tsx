import React, { useState } from 'react';
import { MonthlyBreakdown } from '../../types';
import { BarChart3, TrendingUp, ShieldAlert, Award } from 'lucide-react';

interface MonthlyChartsProps {
  monthlyData: MonthlyBreakdown[];
  targetYear: number;
}

export const MonthlyCharts: React.FC<MonthlyChartsProps> = ({ monthlyData, targetYear }) => {
  const [activeChart, setActiveChart] = useState<'docs' | 'errors' | 'rates' | 'severity'>('docs');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // Maximum scales for charts
  const maxDocs = Math.max(...monthlyData.map((d) => d.totalDocuments), 5);
  const maxErrors = Math.max(...monthlyData.map((d) => d.totalErrors), 5);
  const maxRate = Math.max(...monthlyData.map((d) => Math.max(d.errorRate, d.errorDensity)), 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      {/* Chart Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>Xu hướng 12 Tháng Năm {targetYear}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Biểu đồ phân tích dữ liệu đối soát Phiếu & Lệnh công tác
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveChart('docs')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeChart === 'docs'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Phiếu & Lệnh
          </button>
          <button
            onClick={() => setActiveChart('errors')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeChart === 'errors'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Tổng lỗi phát hiện
          </button>
          <button
            onClick={() => setActiveChart('rates')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeChart === 'rates'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Tỷ lệ & Mật độ
          </button>
          <button
            onClick={() => setActiveChart('severity')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeChart === 'severity'
                ? 'bg-white text-blue-600 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Phân mức độ lỗi
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="pt-6 pb-2">
        {/* CHART 1: PCT & LCT Count per Month */}
        {activeChart === 'docs' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-600"></span>
                  <span className="font-semibold text-slate-700">Phiếu công tác (PCT)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span>
                  <span className="font-semibold text-slate-700">Lệnh công tác (LCT)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500"></span>
                  <span className="font-semibold text-slate-700">Phiếu/Lệnh có vi phạm</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Đơn vị: Phiếu, Lệnh</span>
            </div>

            <div className="h-64 flex items-end gap-2 sm:gap-4 px-2 pt-6 pb-2 border-b border-slate-200">
              {monthlyData.map((d) => {
                const pctHeight = (d.pctCount / maxDocs) * 100;
                const lctHeight = (d.lctCount / maxDocs) * 100;
                const errHeight = (d.errorDocuments / maxDocs) * 100;
                const isHovered = hoveredMonth === d.month;

                return (
                  <div
                    key={d.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredMonth(d.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-20 z-20 bg-slate-900 text-white rounded-lg p-2 text-[11px] shadow-xl whitespace-nowrap pointer-events-none">
                        <div className="font-bold text-amber-300">Tháng {d.month < 10 ? '0' + d.month : d.month}/{targetYear}</div>
                        <div>Tổng hồ sơ: <span className="font-semibold">{d.totalDocuments}</span></div>
                        <div className="text-blue-300">PCT: {d.pctCount} | LCT: {d.lctCount}</div>
                        <div className="text-rose-300">Có lỗi: {d.errorDocuments} | Hợp lệ: {d.validDocuments}</div>
                      </div>
                    )}

                    {/* Bars */}
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* PCT Bar */}
                      <div
                        style={{ height: `${Math.max(pctHeight, d.pctCount > 0 ? 8 : 0)}%` }}
                        className="w-1/3 bg-blue-600 rounded-t-sm group-hover:bg-blue-700 transition-all relative"
                      >
                        {d.pctCount > 0 && (
                          <span className="text-[9px] font-bold text-white absolute -top-4 left-1/2 -translate-x-1/2 text-slate-700">
                            {d.pctCount}
                          </span>
                        )}
                      </div>

                      {/* LCT Bar */}
                      <div
                        style={{ height: `${Math.max(lctHeight, d.lctCount > 0 ? 8 : 0)}%` }}
                        className="w-1/3 bg-emerald-500 rounded-t-sm group-hover:bg-emerald-600 transition-all relative"
                      >
                        {d.lctCount > 0 && (
                          <span className="text-[9px] font-bold absolute -top-4 left-1/2 -translate-x-1/2 text-emerald-800">
                            {d.lctCount}
                          </span>
                        )}
                      </div>

                      {/* Error Docs Bar */}
                      <div
                        style={{ height: `${Math.max(errHeight, d.errorDocuments > 0 ? 8 : 0)}%` }}
                        className="w-1/3 bg-rose-500 rounded-t-sm group-hover:bg-rose-600 transition-all relative"
                      >
                        {d.errorDocuments > 0 && (
                          <span className="text-[9px] font-bold absolute -top-4 left-1/2 -translate-x-1/2 text-rose-700">
                            {d.errorDocuments}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] font-medium text-slate-500 group-hover:text-slate-900 group-hover:font-bold">
                      T{d.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 2: Total Errors per Month */}
        {activeChart === 'errors' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-2">
              <span className="font-semibold text-amber-700">
                Tổng số lỗi vi phạm phát hiện theo từng tháng
              </span>
              <span className="text-[11px] text-slate-400">Đơn vị: Lỗi</span>
            </div>

            <div className="h-64 flex items-end gap-2 sm:gap-4 px-2 pt-6 pb-2 border-b border-slate-200">
              {monthlyData.map((d) => {
                const height = (d.totalErrors / maxErrors) * 100;
                const isHovered = hoveredMonth === d.month;

                return (
                  <div
                    key={d.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredMonth(d.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {isHovered && (
                      <div className="absolute -top-16 z-20 bg-slate-900 text-white rounded-lg p-2 text-[11px] shadow-xl whitespace-nowrap pointer-events-none">
                        <div className="font-bold text-amber-300">Tháng {d.month < 10 ? '0' + d.month : d.month}</div>
                        <div>Tổng lỗi: <strong className="text-rose-400">{d.totalErrors}</strong></div>
                        <div className="text-slate-300">C/W/I: {d.criticalCount}/{d.warningCount}/{d.infoCount}</div>
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center h-full">
                      <div
                        style={{ height: `${Math.max(height, d.totalErrors > 0 ? 8 : 0)}%` }}
                        className={`w-3/4 rounded-t-lg transition-all relative ${
                          d.totalErrors > 10
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : d.totalErrors > 0
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-slate-200'
                        }`}
                      >
                        {d.totalErrors > 0 && (
                          <span className="text-[10px] font-black absolute -top-5 left-1/2 -translate-x-1/2 text-slate-800">
                            {d.totalErrors}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] font-medium text-slate-500 group-hover:text-slate-900">
                      T{d.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 3: Error Rate & Density */}
        {activeChart === 'rates' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-600"></span>
                  <span className="font-semibold text-rose-800">Tỷ lệ Phiếu/Lệnh vi phạm (%)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500"></span>
                  <span className="font-semibold text-amber-800">Mật độ lỗi (%)</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Đơn vị: %</span>
            </div>

            <div className="h-64 flex items-end gap-2 sm:gap-4 px-2 pt-6 pb-2 border-b border-slate-200">
              {monthlyData.map((d) => {
                const rateHeight = (d.errorRate / maxRate) * 100;
                const densityHeight = (d.errorDensity / maxRate) * 100;
                const isHovered = hoveredMonth === d.month;

                return (
                  <div
                    key={d.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredMonth(d.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {isHovered && (
                      <div className="absolute -top-16 z-20 bg-slate-900 text-white rounded-lg p-2 text-[11px] shadow-xl whitespace-nowrap pointer-events-none">
                        <div className="font-bold text-amber-300">Tháng {d.month < 10 ? '0' + d.month : d.month}</div>
                        <div className="text-rose-300">Tỷ lệ lỗi: {d.errorRate}%</div>
                        <div className="text-amber-300">Mật độ lỗi: {d.errorDensity}%</div>
                      </div>
                    )}

                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        style={{ height: `${Math.max(rateHeight, d.errorRate > 0 ? 8 : 0)}%` }}
                        className="w-1/2 bg-rose-600 rounded-t-sm group-hover:bg-rose-700 transition-all relative"
                      >
                        {d.errorRate > 0 && (
                          <span className="text-[9px] font-bold absolute -top-4 left-1/2 -translate-x-1/2 text-rose-800">
                            {d.errorRate}%
                          </span>
                        )}
                      </div>
                      <div
                        style={{ height: `${Math.max(densityHeight, d.errorDensity > 0 ? 8 : 0)}%` }}
                        className="w-1/2 bg-amber-500 rounded-t-sm group-hover:bg-amber-600 transition-all relative"
                      >
                        {d.errorDensity > 0 && (
                          <span className="text-[9px] font-bold absolute -top-4 left-1/2 -translate-x-1/2 text-amber-800">
                            {d.errorDensity}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] font-medium text-slate-500 group-hover:text-slate-900">
                      T{d.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CHART 4: Severity Stacked */}
        {activeChart === 'severity' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-600"></span>
                  <span className="font-semibold text-rose-800">CRITICAL (Nghiêm trọng)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500"></span>
                  <span className="font-semibold text-amber-800">WARNING (Cảnh báo)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-500"></span>
                  <span className="font-semibold text-blue-800">INFO (Thông tin)</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Đơn vị: Số lỗi theo cấp độ</span>
            </div>

            <div className="h-64 flex items-end gap-2 sm:gap-4 px-2 pt-6 pb-2 border-b border-slate-200">
              {monthlyData.map((d) => {
                const totalMonthSeverity = d.criticalCount + d.warningCount + d.infoCount;
                const isHovered = hoveredMonth === d.month;
                const totalHeight = (totalMonthSeverity / (maxErrors || 1)) * 100;

                return (
                  <div
                    key={d.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    onMouseEnter={() => setHoveredMonth(d.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {isHovered && (
                      <div className="absolute -top-20 z-20 bg-slate-900 text-white rounded-lg p-2 text-[11px] shadow-xl whitespace-nowrap pointer-events-none">
                        <div className="font-bold text-amber-300">Tháng {d.month < 10 ? '0' + d.month : d.month}</div>
                        <div className="text-rose-300">CRITICAL: {d.criticalCount}</div>
                        <div className="text-amber-300">WARNING: {d.warningCount}</div>
                        <div className="text-blue-300">INFO: {d.infoCount}</div>
                      </div>
                    )}

                    <div className="w-full flex flex-col items-center justify-end h-full">
                      {totalMonthSeverity > 0 && (
                        <div
                          style={{ height: `${Math.max(totalHeight, 10)}%` }}
                          className="w-3/4 flex flex-col-reverse rounded-t-md overflow-hidden"
                        >
                          <div
                            style={{ height: `${(d.criticalCount / totalMonthSeverity) * 100}%` }}
                            className="bg-rose-600 w-full"
                          />
                          <div
                            style={{ height: `${(d.warningCount / totalMonthSeverity) * 100}%` }}
                            className="bg-amber-500 w-full"
                          />
                          <div
                            style={{ height: `${(d.infoCount / totalMonthSeverity) * 100}%` }}
                            className="bg-blue-500 w-full"
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-[10px] font-medium text-slate-500 group-hover:text-slate-900">
                      T{d.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
