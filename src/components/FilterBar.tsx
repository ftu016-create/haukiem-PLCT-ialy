import React from 'react';
import {
  Search,
  RotateCcw,
  Filter,
  Calendar,
  CalendarDays,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  X,
} from 'lucide-react';
import { DocumentType, ErrorSeverity, FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  availableYears: number[];
  unitsList: string[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  availableYears,
  unitsList,
}) => {
  const handleReset = () => {
    onChangeFilters({
      year: 2026,
      month: 'all',
      documentType: 'all',
      unit: 'all',
      severity: 'all',
      searchQuery: '',
      statusFilter: 'all',
    });
  };

  const isFiltered =
    filters.year !== 2026 ||
    filters.month !== 'all' ||
    filters.documentType !== 'all' ||
    filters.unit !== 'all' ||
    filters.statusFilter !== 'all' ||
    filters.searchQuery !== '';

  const activeFilterCount = [
    filters.year !== 2026,
    filters.month !== 'all',
    filters.documentType !== 'all',
    filters.unit !== 'all',
    filters.statusFilter !== 'all',
    Boolean(filters.searchQuery),
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs mb-6 print:hidden">
      {/* Top Header: Title, Active Filter Badge, Search Box, Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              
              {isFiltered && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                  {activeFilterCount} điều kiện áp dụng
                </span>
              )}
            </div>
           
          </div>
        </div>

        {/* Search input & Reset button aligned */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  searchQuery: e.target.value,
                })
              }
              placeholder="Tìm mã số, người, nội dung..."
              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onChangeFilters({ ...filters, searchQuery: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isFiltered && (
            <button
              onClick={handleReset}
              title="Đặt lại tất cả bộ lọc về mặc định"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer shrink-0 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Structured Columns - 5 Cột chuẩn đối xứng */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
        {/* 1. NĂM */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-blue-600" />
            <span>Năm</span>
          </label>
          <select
            value={filters.year}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                year: e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10),
              })
            }
            className="w-full py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
          >
            <option value="all">Tất cả các năm</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* 2. THÁNG */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3 text-blue-600" />
            <span>Tháng</span>
          </label>
          <select
            value={filters.month}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                month: e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10),
              })
            }
            className="w-full py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer"
          >
            <option value="all">Cả năm (12 tháng)</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m < 10 ? '0' + m : m}
              </option>
            ))}
          </select>
        </div>

        {/* 3. LOẠI */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-blue-600" />
            <span>Loại</span>
          </label>
          <select
            value={filters.documentType}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                documentType: e.target.value as 'all' | DocumentType,
              })
            }
            className="w-full py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer truncate"
          >
            <option value="all">Phiếu + Lệnh công tác</option>
            <option value="PCT">Phiếu công tác (PCT)</option>
            <option value="LCT">Lệnh công tác (LCT)</option>
          </select>
        </div>

        {/* 4. TRẠNG THÁI */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Trạng thái</span>
          </label>
          <select
            value={filters.statusFilter}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                statusFilter: e.target.value as any,
              })
            }
            className="w-full py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer truncate"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="error_only">Chỉ bản ghi có vi phạm</option>
            <option value="valid_only">Chỉ bản ghi hợp lệ</option>
          </select>
        </div>

        {/* 5. ĐƠN VỊ - Đúng 5 mục chuẩn */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3 h-3 text-blue-600" />
            <span>Đơn vị</span>
          </label>
          <select
            value={filters.unit}
            onChange={(e) =>
              onChangeFilters({
                ...filters,
                unit: e.target.value,
              })
            }
            className="w-full py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition cursor-pointer truncate"
          >
            <option value="all">Tất cả</option>
            {unitsList.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
