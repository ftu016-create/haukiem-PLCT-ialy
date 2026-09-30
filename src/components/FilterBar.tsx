import React from 'react';
import { Search, RotateCcw, Filter, Calendar } from 'lucide-react';
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
    filters.severity !== 'all' ||
    filters.statusFilter !== 'all' ||
    filters.searchQuery !== '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs mb-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Quick Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Bộ lọc:</span>
          </div>

          {/* Year Select */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500">Năm:</span>
            <select
              value={filters.year}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  year: e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10),
                })
              }
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả năm</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month Select */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <span className="text-slate-500">Tháng:</span>
            <select
              value={filters.month}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  month: e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10),
                })
              }
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Cả năm (12 tháng)</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m < 10 ? '0' + m : m}
                </option>
              ))}
            </select>
          </div>

          {/* Document Type (PCT vs LCT) */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <span className="text-slate-500">Loại:</span>
            <select
              value={filters.documentType}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  documentType: e.target.value as 'all' | DocumentType,
                })
              }
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Phiếu + Lệnh công tác</option>
              <option value="PCT">Phiếu công tác (PCT)</option>
              <option value="LCT">Lệnh công tác (LCT)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <span className="text-slate-500">Trạng thái:</span>
            <select
              value={filters.statusFilter}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  statusFilter: e.target.value as any,
                })
              }
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả hồ sơ</option>
              <option value="error_only">Chỉ hồ sơ có sai sót</option>
              <option value="valid_only">Chỉ hồ sơ hợp lệ</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
            <span className="text-slate-500">Mức lỗi:</span>
            <select
              value={filters.severity}
              onChange={(e) =>
                onChangeFilters({
                  ...filters,
                  severity: e.target.value as 'all' | ErrorSeverity,
                })
              }
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Tất cả mức độ</option>
              <option value="CRITICAL">🔴 CRITICAL (Nghiêm trọng)</option>
              <option value="WARNING">🟠 WARNING (Cảnh báo)</option>
              <option value="INFO">🔵 INFO (Thông tin)</option>
            </select>
          </div>

          {/* Unit Filter */}
          {unitsList.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
              <span className="text-slate-500">Đơn vị:</span>
              <select
                value={filters.unit}
                onChange={(e) =>
                  onChangeFilters({
                    ...filters,
                    unit: e.target.value,
                  })
                }
                className="bg-transparent font-semibold text-slate-800 focus:outline-hidden cursor-pointer max-w-[130px] truncate"
              >
                <option value="all">Tất cả đơn vị</option>
                {unitsList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Search & Reset */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
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
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>

          {isFiltered && (
            <button
              onClick={handleReset}
              title="Đặt lại bộ lọc về mặc định"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
