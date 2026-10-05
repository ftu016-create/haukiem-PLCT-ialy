import React, { useState } from 'react';
import {
  RefreshCw,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Database,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { SyncState, UserRole } from '../types';

interface HeaderProps {
  syncState: SyncState;
  onSync: () => void;
  onOpenSheetsModal: () => void;
  role: UserRole;
  onChangeRole: (newRole: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  syncState,
  onSync,
  onOpenSheetsModal,
  role,
  onChangeRole,
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleAdminAuth = () => {
    // Admin password
    if (pinInput === 'ialy2026') {
      onChangeRole('ADMIN');
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Mật khẩu không chính xác');
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand & Status */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 truncate tracking-tight">
                    HẬU KIỂM PHIẾU & LỆNH CÔNG TÁC
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    Quy trình 278/EVN
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                  <span>CÔNG TY THỦY ĐIỆN IALY</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-medium">Hệ thống Giám sát & Thống kê An toàn</span>
                </p>
              </div>
            </div>

            {/* Center: Sync Status & Google Sheets Indicator */}
            <div className="hidden xl:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      syncState.status === 'syncing'
                        ? 'bg-amber-400'
                        : syncState.status === 'error'
                        ? 'bg-rose-400'
                        : 'bg-emerald-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      syncState.status === 'syncing'
                        ? 'bg-amber-500'
                        : syncState.status === 'error'
                        ? 'bg-rose-500'
                        : 'bg-emerald-500'
                    }`}
                  ></span>
                </span>
                <span className="font-medium text-slate-700">
                  {syncState.status === 'syncing'
                    ? 'Đang đồng bộ Sheets...'
                    : syncState.status === 'error'
                    ? 'Lỗi kết nối'
                    : 'Google Sheets đã kết nối'}
                </span>
              </div>
              {syncState.lastSyncTime && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-500">Cập nhật: {syncState.lastSyncTime}</span>
                </>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Sync Button */}
              <button
                onClick={onSync}
                disabled={syncState.status === 'syncing'}
                title="Đồng bộ dữ liệu mới nhất từ Google Sheets"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncState.status === 'syncing' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Đồng bộ Sheets</span>
              </button>

              {/* Configure Sheets Modal */}
              <button
                onClick={onOpenSheetsModal}
                title="Thiết lập liên kết Google Sheets hoặc tải tệp"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden md:inline">Nguồn dữ liệu</span>
              </button>

              {/* Role Toggle */}
              {role === 'ADMIN' ? (
                <button
                  onClick={() => onChangeRole('VIEWER')}
                  title="Đang ở chế độ Quản trị viên (ADMIN). Bấm để chuyển sang Viewer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Admin</span>
                  <Unlock className="w-3 h-3 ml-0.5 text-purple-500" />
                </button>
              ) : (
                <button
                  onClick={() => setShowPinModal(true)}
                  title="Bấm để đăng nhập quyền Quản trị viên (Admin)"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin PIN Unlock Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác thực Quản trị viên</h3>
                <p className="text-xs text-slate-500">Quyền Admin cho phép chỉnh cấu hình và đồng bộ</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhập mật khẩu Admin
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdminAuth()}
                  placeholder="Nhập mật khẩu Admin"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-center font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  autoFocus
                />
              </div>

              {pinError && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {pinError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput('');
                  setPinError('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleAdminAuth}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer shadow-xs"
              >
                Xác nhận Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
