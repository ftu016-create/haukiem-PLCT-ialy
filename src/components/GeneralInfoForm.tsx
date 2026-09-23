import React from 'react';
import { ReportData } from '../types/report';
import { Building2, Calendar, FileText, MapPin } from 'lucide-react';

interface GeneralInfoFormProps {
  general: ReportData['general'];
  onChange: (updated: Partial<ReportData['general']>) => void;
  disabled?: boolean;
}

export const GeneralInfoForm: React.FC<GeneralInfoFormProps> = ({
  general,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
        <Building2 className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">
          Thông tin Đơn vị & Tiêu đề Báo cáo
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Company Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Tên Công ty
          </label>
          <input
            type="text"
            disabled={disabled}
            value={general.companyName}
            onChange={(e) => onChange({ companyName: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-60"
            placeholder="CÔNG TY THỦY ĐIỆN IALY"
          />
        </div>

        {/* Department Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Phân xưởng / Phòng ban
          </label>
          <input
            type="text"
            disabled={disabled}
            value={general.departmentName}
            onChange={(e) => onChange({ departmentName: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-60"
            placeholder="PX VẬN HÀNH IALY"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Địa danh
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={disabled}
              value={general.location}
              onChange={(e) => onChange({ location: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-60"
              placeholder="Gia Lai"
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Month */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Tháng báo cáo
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="12"
              disabled={disabled}
              value={general.month}
              onChange={(e) => {
                const m = parseInt(e.target.value) || 1;
                onChange({
                  month: m,
                  reportSubtitle: `Về việc kết quả hậu kiểm PCT, LCT tháng ${m}/${general.year}`,
                });
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-60"
            />
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Year */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Năm báo cáo
          </label>
          <input
            type="number"
            min="2020"
            max="2035"
            disabled={disabled}
            value={general.year}
            onChange={(e) => {
              const y = parseInt(e.target.value) || 2026;
              onChange({
                year: y,
                reportSubtitle: `Về việc kết quả hậu kiểm PCT, LCT tháng ${general.month}/${y}`,
              });
            }}
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-60"
          />
        </div>

        {/* Report Date (ISO yyyy-mm-dd) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Ngày lập văn bản
          </label>
          <input
            type="date"
            disabled={disabled}
            value={general.reportDate}
            onChange={(e) => onChange({ reportDate: e.target.value })}
            className="w-full px-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-60"
          />
          <div className="mt-1 text-[11px] text-blue-700 italic font-medium">
            Hiển thị trên văn bản: {general.location || 'Gia Lai'}, ngày {general.reportDate ? general.reportDate.split('-')[2] : '...'} tháng {general.reportDate ? general.reportDate.split('-')[1] : '...'} năm {general.reportDate ? general.reportDate.split('-')[0] : '...'}
          </div>
        </div>

        {/* Report Subtitle */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Trích yếu nội dung báo cáo
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={disabled}
              value={general.reportSubtitle}
              onChange={(e) => onChange({ reportSubtitle: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 rounded-lg border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-semibold text-slate-800 disabled:opacity-60"
              placeholder="Về việc kết quả hậu kiểm PCT, LCT tháng 8/2026"
            />
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
