import React, { useRef } from 'react';
import { ReportData } from '../types/report';
import { MEMBER_OPTIONS } from '../data/commonViolations';
import {
  CheckSquare,
  FileSignature,
  Image as ImageIcon,
  Square,
  Trash2,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';

interface SignatoriesEditorProps {
  signatories: ReportData['signatories'];
  onChange: (updated: Partial<ReportData['signatories']>) => void;
  disabled?: boolean;
}

export const SignatoriesEditor: React.FC<SignatoriesEditorProps> = ({
  signatories,
  onChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle member from the fixed 6 members list
  const handleToggleMember = (name: string) => {
    if (disabled) return;
    if (signatories.members.includes(name)) {
      onChange({ members: signatories.members.filter((m) => m !== name) });
    } else {
      onChange({ members: [...signatories.members, name] });
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onChange({ members: [...MEMBER_OPTIONS] });
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onChange({ members: [] });
  };

  // Handle signature file upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh chữ ký không được vượt quá 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onChange({ leadSignatureUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    if (disabled) return;
    onChange({ leadSignatureUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">
            Thành viên Hậu kiểm & Chức vụ Người ký
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Audit Members - Clean Checklist (Wider columns to prevent wrapping) */}
        <div className="lg:col-span-7 bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex flex-col justify-start">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Thành viên tham gia hậu kiểm ({signatories.members.length}/6)
              </label>
              <span className="text-[11px] text-slate-500">
                Tích chọn các thành viên tham gia đợt này
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={disabled}
                onClick={handleSelectAll}
                className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition disabled:opacity-50"
                title="Chọn tất cả 6 người"
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={handleDeselectAll}
                className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-lg transition disabled:opacity-50"
                title="Bỏ chọn tất cả"
              >
                Bỏ chọn
              </button>
            </div>
          </div>

          {/* Checkbox Grid for the 6 official members with ample width */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MEMBER_OPTIONS.map((name, idx) => {
              const isChecked = signatories.members.includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleToggleMember(name)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition ${
                    isChecked
                      ? 'bg-blue-50/80 border-blue-400 text-blue-900 font-semibold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  } ${disabled ? 'cursor-not-allowed opacity-75' : ''}`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm whitespace-nowrap tracking-tight">
                    {idx + 1}. {name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Team Leader & Signature Insertion */}
        <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex flex-col justify-start">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chức vụ & Người ký duyệt
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Chức vụ / Danh xưng
              </label>
              <input
                type="text"
                disabled={disabled}
                value={signatories.leadTitle}
                onChange={(e) => onChange({ leadTitle: e.target.value })}
                placeholder="TRƯỞNG NHÓM"
                className="w-full px-2.5 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold text-slate-800 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Họ và tên người ký
              </label>
              <input
                type="text"
                disabled={disabled}
                value={signatories.leadName}
                onChange={(e) => onChange({ leadName: e.target.value })}
                placeholder="Trần Thanh Chương"
                className="w-full px-2.5 py-1.5 text-sm bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Signature upload and preview area */}
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <FileSignature className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">
                  Chèn ảnh chữ ký (Hiển thị trên Word & PDF)
                </span>
              </div>
              {signatories.leadSignatureUrl && !disabled && (
                <button
                  type="button"
                  onClick={handleRemoveSignature}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Xóa chữ ký
                </button>
              )}
            </div>

            {/* Signature display container */}
            <div className="min-h-24 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center p-3 relative">
              {signatories.leadSignatureUrl ? (
                <div className="relative group flex flex-col items-center">
                  <img
                    src={signatories.leadSignatureUrl}
                    alt="Chữ ký người duyệt"
                    className="max-h-20 max-w-[180px] object-contain"
                  />
                  <span className="text-[10px] text-emerald-600 font-semibold mt-1">
                    ✓ Đã chèn ảnh chữ ký
                  </span>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-2">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                  <p className="text-xs text-slate-500">Chưa có ảnh chữ ký</p>
                </div>
              )}
            </div>

            {/* Action buttons for signature */}
            {!disabled && (
              <div className="flex items-center gap-2 mt-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                  id="signature-file-input"
                />
                <label
                  htmlFor="signature-file-input"
                  className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh chữ ký từ máy</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
