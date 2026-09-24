import React from 'react';
import {
  Cloud,
  Download,
  Eye,
  FileDown,
  FileSpreadsheet,
  FolderOpen,
  LogOut,
  PenTool,
  Printer,
  Save,
  ShieldCheck,
} from 'lucide-react';

export type ViewMode = 'editor' | 'preview';

interface TopNavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExportWord: () => void;
  onExportPdf: () => void;
  onPrint: () => void;
  onOpenSavedModal: () => void;
  onSaveReport?: () => void;
  isSaving?: boolean;
  isExportingWord: boolean;
  isExportingPdf: boolean;
  isAdmin: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  viewMode,
  onViewModeChange,
  onExportWord,
  onExportPdf,
  onPrint,
  onOpenSavedModal,
  onSaveReport,
  isSaving = false,
  isExportingWord,
  isExportingPdf,
  isAdmin,
  onOpenLoginModal,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-slate-900 text-base md:text-lg">
                  Biên bản hậu kiểm PCT-LCT
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Giao diện Admin
                </span>
                
              </div>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium">
                VHIALY - Công ty thủy điện Ialy
              </p>
            </div>
          </div>

          {/* View mode switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            

            <button
              onClick={() => onViewModeChange('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'preview'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Xem trước A4</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Save Button for Admin */}
            {onSaveReport && (
              <button
                onClick={onSaveReport}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition disabled:opacity-50"
                title="Lưu văn bản và đồng bộ lên tất cả các thiết bị"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu văn bản'}</span>
              </button>
            )}

            {/* Saved Reports */}
            <button
              onClick={onOpenSavedModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
              title="Xem danh sách và quản lý các biên bản"
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Lịch sử</span>
            </button>

            {/* Print Button */}
            <button
              onClick={onPrint}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition"
              title="In trực tiếp hoặc Lưu PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>In</span>
            </button>

            {/* Export PDF */}
            <button
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition disabled:opacity-50"
              title="Tải file PDF trực tiếp"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Đang xuất...' : 'Tải PDF'}</span>
            </button>

            {/* Export Word Button */}
            <button
              onClick={onExportWord}
              disabled={isExportingWord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm hover:shadow transition disabled:opacity-50"
              title="Xuất file Word .docx"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingWord ? 'Đang tạo...' : 'Xuất Word'}</span>
            </button>

            {/* Admin Logout */}
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition"
              title="Thoát quyền Quản trị viên"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
