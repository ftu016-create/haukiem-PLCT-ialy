import React from 'react';
import {
  FileText,
  FileCheck,
  AlertTriangle,
  AlertCircle,
  Users,
  Percent,
  Flame,
  Info,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { StatisticsOverview } from '../types';

interface KpiCardsProps {
  overview: StatisticsOverview;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ overview }) => {
  return (
    <div className="space-y-3 mb-5">
      {/* Primary KPI Row - 6 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Tổng Phiếu công tác (PCT) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-blue-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Phiếu công tác (PCT)</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {overview.totalPCT.toLocaleString('vi-VN')}
          </div>
        </div>

        {/* 2. Tổng Lệnh công tác (LCT) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Lệnh công tác (LCT)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {overview.totalLCT.toLocaleString('vi-VN')}
          </div>
        </div>

        {/* 3. Tổng Phiếu và Lệnh đã soát */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-indigo-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tổng Phiếu và Lệnh đã soát</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {overview.totalDocuments.toLocaleString('vi-VN')}
          </div>
        </div>

        {/* 4. Số Phiếu và Lệnh có vi phạm */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-rose-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Phiếu và Lệnh có vi phạm</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              {overview.documentsWithErrors.toLocaleString('vi-VN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hợp lệ: <strong className="text-emerald-700">{overview.validDocuments}</strong>
            </p>
          </div>
        </div>

        {/* 5. Tổng số lỗi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tổng số lỗi</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 tracking-tight">
              {overview.totalErrors.toLocaleString('vi-VN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Tổng vi phạm tích lũy</p>
          </div>
        </div>

        {/* 6. Số cá nhân mắc lỗi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden group hover:border-purple-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cá nhân liên đới</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-purple-700 tracking-tight">
              {overview.totalPeopleWithErrors.toLocaleString('vi-VN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Người cấp / CHTT / Cho phép</p>
          </div>
        </div>
      </div>

      {/* Secondary Row: Tỷ lệ vi phạm theo từng loại (PCT, LCT, Tổng) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Tỷ lệ Phiếu công tác (PCT) vi phạm (%) */}
        <div className="bg-gradient-to-br from-blue-50/70 to-white rounded-2xl border border-blue-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Tỷ lệ Phiếu công tác (PCT) vi phạm</span>
            <Percent className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 tracking-tight">
            {overview.pctErrorRate}%
          </div>
          <p className="text-[11px] text-blue-700/80 mt-1">
            {overview.pctWithErrors} trên tổng {overview.totalPCT} Phiếu công tác
          </p>
        </div>

        {/* 2. Tỷ lệ Lệnh công tác (LCT) vi phạm (%) */}
        <div className="bg-gradient-to-br from-emerald-50/70 to-white rounded-2xl border border-emerald-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Tỷ lệ Lệnh công tác (LCT) vi phạm</span>
            <Percent className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 tracking-tight">
            {overview.lctErrorRate}%
          </div>
          <p className="text-[11px] text-emerald-700/80 mt-1">
            {overview.lctWithErrors} trên tổng {overview.totalLCT} Lệnh công tác
          </p>
        </div>

        {/* 3. Tỷ lệ Tổng Phiếu và Lệnh vi phạm (%) */}
        <div className="bg-gradient-to-br from-rose-50/70 to-white rounded-2xl border border-rose-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng Phiếu & Lệnh vi phạm</span>
              <span title="Công thức: (Phiếu/Lệnh có lỗi / Tổng Phiếu/Lệnh) * 100" className="cursor-help">
                <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
              </span>
            </div>
            <Percent className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 tracking-tight">
            {overview.errorRate}%
          </div>
          <p className="text-[11px] text-rose-700/80 mt-1">
            {overview.documentsWithErrors} trên tổng {overview.totalDocuments} Phiếu và Lệnh
          </p>
        </div>
      </div>
    </div>
  );
};
