import React, { useState } from 'react';
import {
  Database,
  Link,
  Upload,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { SyncState, UserRole } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: SyncState;
  onUpdateSheetUrl: (url: string) => void;
  onUploadCsvText: (text: string) => void;
  onResetToDefault: () => void;
  role: UserRole;
  onChangePin: (newPin: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onUpdateSheetUrl,
  onUploadCsvText,
  onResetToDefault,
  role,
  onChangePin,
}) => {
  const [urlInput, setUrlInput] = useState(syncState.sourceUrl || '');
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    onUpdateSheetUrl(urlInput.trim());
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onUploadCsvText(content);
        setUploadFeedback(`Đã tải lên tệp: ${file.name} thành công!`);
        setTimeout(() => setUploadFeedback(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handlePinUpdate = () => {
    if (newPin.length >= 4) {
      onChangePin(newPin);
      setPinSuccess(true);
      setTimeout(() => {
        setPinSuccess(false);
        setNewPin('');
      }, 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cấu hình Nguồn Dữ liệu Google Sheets & Bảo mật
              </h3>
              <p className="text-xs text-slate-500">
                Nguồn dữ liệu gốc (Source of Truth) cho toàn bộ hệ thống
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
          {/* Section 1: Live Google Sheets URL */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <Link className="w-4 h-4 text-blue-600" />
                Đường dẫn liên kết Google Sheets (CSV URL / Share URL)
              </span>
              <span className="text-[10px] text-slate-500">Tự động chuyển đổi định dạng</span>
            </div>

            <p className="text-slate-600">
              Dán URL của bảng tính Google Sheets (chia sẻ ở chế độ "Bất kỳ ai có đường liên kết đều có thể xem" hoặc link Xuất file CSV: <code>https://docs.google.com/spreadsheets/d/.../export?format=csv</code>):
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1.../edit#gid=0"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveUrl}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition cursor-pointer shrink-0"
              >
                Lưu & Đồng bộ
              </button>
            </div>

            <div className="text-[11px] text-slate-500 flex items-start gap-1.5 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Hệ thống tự động đồng bộ từ link này, giữ nguyên định dạng 14 cột nghiệp vụ của EVN Ialy và áp dụng thuật toán lọc trùng 100%.
              </span>
            </div>
          </div>

          {/* Section 2: Upload CSV / File directly */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-600" />
              Hoặc Tải lên tệp CSV từ máy tính (Ngoại tuyến)
            </span>
            <p className="text-slate-600">
              Bạn có thể tải về tệp CSV từ Google Sheets và tải trực tiếp lên Web App để kiểm tra tức thì:
            </p>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition cursor-pointer">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Chọn tệp .CSV từ máy</span>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadFeedback && (
                <span className="text-emerald-700 font-semibold flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  {uploadFeedback}
                </span>
              )}
            </div>
          </div>

          {/* Section 3: Reset to Ialy Hydropower Official Baseline Dataset */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-600" />
                Khôi phục Bộ dữ liệu Mẫu Thực tế Thủy điện Ialy
              </span>
              <p className="text-slate-500 mt-0.5">
                Thiết lập lại 45+ dòng dữ liệu thực tế ban đầu (gồm các case duplicate & case cùng mã khác nội dung)
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Khôi phục lại dữ liệu mẫu thực tế ban đầu của Thủy điện Ialy?')) {
                  onResetToDefault();
                  onClose();
                }
              }}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition cursor-pointer shrink-0"
            >
              Khôi phục gốc
            </button>
          </div>

          {/* Section 4: Admin PIN Security (Admin Only) */}
          {role === 'ADMIN' && (
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
              <span className="font-bold text-purple-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-600" />
                Đổi mã PIN Quản trị viên (ADMIN)
              </span>
              <p className="text-slate-600">
                Mã PIN dùng để chuyển quyền từ Viewer sang Admin để bảo vệ cấu hình hệ thống:
              </p>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Nhập mã PIN mới (ít nhất 4 ký tự)"
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handlePinUpdate}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition cursor-pointer"
                >
                  Cập nhật PIN
                </button>
              </div>
              {pinSuccess && (
                <p className="text-purple-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Đã cập nhật mã PIN Admin thành công!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
