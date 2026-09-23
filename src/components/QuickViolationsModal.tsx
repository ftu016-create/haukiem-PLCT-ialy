import React from 'react';
import { COMMON_VIOLATIONS_PRESETS, ViolationPreset } from '../data/commonViolations';
import { Plus, X } from 'lucide-react';

interface QuickViolationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'PCT' | 'LCT';
  onSelectPreset: (preset: ViolationPreset) => void;
}

export const QuickViolationsModal: React.FC<QuickViolationsModalProps> = ({
  isOpen,
  onClose,
  category,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const filteredPresets = COMMON_VIOLATIONS_PRESETS.filter(
    (p) => p.category === category || p.category === 'BOTH'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Chọn mẫu vi phạm thường gặp ({category})
            </h3>
            <p className="text-xs text-slate-500">
              Nhấp vào một mẫu để thêm nhanh vào danh sách vi phạm
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of presets */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              onClick={() => {
                onSelectPreset(preset);
                onClose();
              }}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800">
                  {preset.type}
                </span>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-900">
                  {preset.content}
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  Lý do: {preset.reason}
                </p>
              </div>

              <button
                type="button"
                className="shrink-0 p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
