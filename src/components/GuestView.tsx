import React, { useState } from 'react';
import { ReportData } from '../types/report';
import { ReportDocumentPreview } from './ReportDocumentPreview';
import {
  ChevronDown,
  Download,
  FileDown,
  FileSpreadsheet,
  FolderOpen,
  Lock,
  Printer,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface GuestViewProps {
  currentReport: ReportData;
  allReports: ReportData[];
  onSelectReport: (report: ReportData) => void;
  onOpenHistoryModal: () => void;
  onExportWord: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  isExportingWord: boolean;
  isExportingPdf: boolean;
  onOpenLoginModal: () => void;
}

export const GuestView: React.FC<GuestViewProps> = ({
  currentReport,
  allReports,
  onSelectReport,
  onOpenHistoryModal,
  onExportWord,
  onExportPdf,
  onPrint,
  isExportingWord,
  isExportingPdf,
  onOpenLoginModal,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  return (
    <div className="min-h-screen bg-slate-200/70 flex flex-col font-sans">
      {/* 1. Guest Top Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight truncate">
                    ATVSLĐ IALY
                  </span>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Chỉ xem
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Đồng bộ trực tuyến ({allReports.length})
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-600 font-medium truncate">
                  Biên bản hậu kiểm PCT, LCT
                </p>
              </div>
            </div>

            {/* Quick Report Selector for Mobile & Desktop */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="relative">
                <select
                  value={currentReport.id}
                  onChange={(e) => {
                    const found = allReports.find((r) => r.id === e.target.value);
                    if (found) onSelectReport(found);
                  }}
                  className="appearance-none bg-slate-50 border border-slate-300 rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
                >
                  {allReports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.general.reportSubtitle || `Tháng ${r.general.month}/${r.general.year}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
              </div>

              {/* View History Button */}
              <button
                onClick={onOpenHistoryModal}
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                title="Xem danh sách các biên bản"
              >
                <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Lịch sử ({allReports.length})</span>
              </button>

              {/* Export Word */}
              <button
                onClick={onExportWord}
                disabled={isExportingWord}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition disabled:opacity-50"
                title="Xuất file văn bản Word .docx"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xuất Word</span>
                <span className="sm:hidden">Word</span>
              </button>

              {/* Export PDF */}
              <button
                onClick={onExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition disabled:opacity-50"
                title="Tải file PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tải PDF</span>
                <span className="sm:hidden">PDF</span>
              </button>

              {/* Print */}
              <button
                onClick={onPrint}
                className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                title="In văn bản"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>In</span>
              </button>

              {/* Admin Login Button */}
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition shadow-2xs"
                title="Đăng nhập Quản trị viên"
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Đăng nhập Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Top Banner info for Guest */}
      <div className="bg-white/80 border-b border-slate-200 py-2 px-3 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">
              Đồng bộ dữ liệu trực tuyến: Mở trên mọi máy tính và điện thoại
            </span>
          </div>

          {/* Zoom controls for comfortable reading */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Thu phóng:</span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-bold text-slate-700 px-1">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Document Display Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-6 flex flex-col items-center overflow-x-auto">
        <div
          style={{
            transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full flex justify-center"
        >
          <ReportDocumentPreview data={currentReport} />
        </div>
      </main>

      {/* 4. Footer info */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Công ty Thủy điện Ialy • Phân xưởng Vận hành Ialy</span>
          <button
            onClick={onOpenLoginModal}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Đăng nhập Quản trị viên
          </button>
        </div>
      </footer>
    </div>
  );
};
