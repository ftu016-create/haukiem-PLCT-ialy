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
      {/* Primary KPI Row - 5 Cards (Đã bỏ thẻ Tổng số lỗi theo yêu cầu Hình 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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

        {/* 5. Số cá nhân liên đới vi phạm */}
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
    </div>
  );
};
