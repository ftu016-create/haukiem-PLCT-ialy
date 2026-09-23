import React, { useState } from 'react';
import { PctStatistics, ViolationItem } from '../types/report';
import { calculatePctPercentages } from '../utils/calculations';
import { WORK_TYPES, STANDARD_REASONS, PCT_VIOLATION_OPTIONS, ViolationPreset } from '../data/commonViolations';
import { QuickViolationsModal } from './QuickViolationsModal';
import { StatNumberInput } from './StatNumberInput';
import {
  AlertTriangle,
  BookmarkPlus,
  CheckCircle2,
  FileCheck2,
  Plus,
  Trash2,
} from 'lucide-react';

interface PctSectionEditorProps {
  stats: PctStatistics;
  violations: ViolationItem[];
  onStatsChange: (stats: PctStatistics) => void;
  onViolationsChange: (violations: ViolationItem[]) => void;
  disabled?: boolean;
}

export const PctSectionEditor: React.FC<PctSectionEditorProps> = ({
  stats,
  violations,
  onStatsChange,
  onViolationsChange,
  disabled = false,
}) => {
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const percentages = calculatePctPercentages(stats);

  const handleStatChange = (field: keyof PctStatistics, value: number) => {
    if (disabled) return;
    const sanitized = Math.max(0, isNaN(value) ? 0 : value);
    if (field === 'nonCompliant') {
      handleNonCompliantCountChange(sanitized);
      return;
    }
    const newStats = { ...stats, [field]: sanitized };
    onStatsChange(newStats);
  };

  // Sync rows when user changes the nonCompliant count directly
  const handleNonCompliantCountChange = (count: number) => {
    const newStats = { ...stats, nonCompliant: count };
    onStatsChange(newStats);

    let next = [...violations];
    if (count > violations.length) {
      const diff = count - violations.length;
      for (let i = 0; i < diff; i++) {
        next.push({
          id: `pct-v-${Date.now()}-${i}`,
          number: '',
          type: 'Điện',
          content: '',
          relatedVh: '',
          relatedPxsc: '',
          reason: STANDARD_REASONS[0],
        });
      }
      onViolationsChange(next);
    } else if (count < violations.length) {
      next = next.slice(0, count);
      onViolationsChange(next);
    }
  };

  const handleAddViolation = () => {
    if (disabled) return;
    const newViolation: ViolationItem = {
      id: `pct-v-${Date.now()}`,
      number: '',
      type: 'Điện',
      content: '',
      relatedVh: '',
      relatedPxsc: '',
      reason: STANDARD_REASONS[0],
    };
    const next = [...violations, newViolation];
    onViolationsChange(next);
    onStatsChange({ ...stats, nonCompliant: next.length });
  };

  const handleAddFromPreset = (preset: ViolationPreset) => {
    if (disabled) return;
    const newViolation: ViolationItem = {
      id: `pct-v-${Date.now()}`,
      number: '',
      type: preset.type || 'Điện',
      content: preset.content,
      relatedVh: preset.relatedVhDefault || '',
      relatedPxsc: preset.relatedPxscDefault || '',
      reason: preset.reason,
    };
    const next = [...violations, newViolation];
    onViolationsChange(next);
    onStatsChange({ ...stats, nonCompliant: next.length });
  };

  const handleUpdateViolation = (index: number, updated: Partial<ViolationItem>) => {
    if (disabled) return;
    const next = [...violations];
    next[index] = { ...next[index], ...updated };
    onViolationsChange(next);
  };

  const handleRemoveViolation = (index: number) => {
    if (disabled) return;
    const next = violations.filter((_, i) => i !== index);
    onViolationsChange(next);
    onStatsChange({ ...stats, nonCompliant: next.length });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">
            I. Việc Thực Hiện Phiếu Công Tác (PCT)
          </h2>
        </div>
      </div>

      {/* 1. Summary Statistics Inputs */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
          1. Số liệu tổng hợp PCT (Tự động tính phần trăm)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
            <label className="block text-xs font-semibold text-blue-900 mb-1">
              Tổng PCT đã cấp số
            </label>
            <StatNumberInput
              disabled={disabled}
              value={stats.totalIssued}
              onChange={(val) => handleStatChange('totalIssued', val)}
              className="w-full text-lg font-bold text-blue-900 bg-white px-2.5 py-1.5 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
            <div className="mt-1 text-xs text-blue-700 font-semibold">100% cơ số tính</div>
          </div>

          {/* Not Executed */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PCT không thực hiện
            </label>
            <StatNumberInput
              disabled={disabled}
              value={stats.notExecuted}
              onChange={(val) => handleStatChange('notExecuted', val)}
              className="w-full text-lg font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
            <div className="mt-1 text-xs text-slate-600 font-semibold flex justify-between">
              <span>Tỷ lệ:</span>
              <span className="font-mono text-blue-700">{percentages.notExecutedPct}</span>
            </div>
          </div>

          {/* Paper Form */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PCT giấy
            </label>
            <StatNumberInput
              disabled={disabled}
              value={stats.paperForm}
              onChange={(val) => handleStatChange('paperForm', val)}
              className="w-full text-lg font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
            <div className="mt-1 text-xs text-slate-600 font-semibold flex justify-between">
              <span>Tỷ lệ:</span>
              <span className="font-mono text-blue-700">{percentages.paperFormPct}</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              PCT đang thực hiện
            </label>
            <StatNumberInput
              disabled={disabled}
              value={stats.inProgress}
              onChange={(val) => handleStatChange('inProgress', val)}
              className="w-full text-lg font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            />
            <div className="mt-1 text-xs text-slate-600 font-semibold flex justify-between">
              <span>Tỷ lệ:</span>
              <span className="font-mono text-blue-700">{percentages.inProgressPct}</span>
            </div>
          </div>

          {/* Non Compliant */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <label className="block text-xs font-semibold text-amber-900 mb-1">
              PCT không phù hợp
            </label>
            <StatNumberInput
              disabled={disabled}
              value={stats.nonCompliant}
              onChange={(val) => handleNonCompliantCountChange(val)}
              className="w-full text-lg font-bold text-amber-900 bg-white px-2.5 py-1.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
            />
            <div className="mt-1 text-xs text-amber-800 font-semibold flex justify-between">
              <span>Tỷ lệ:</span>
              <span className="font-mono">{percentages.nonCompliantPct}</span>
            </div>
            <div className="mt-1 text-[10px] text-amber-700 italic">
              Tự động khớp số dòng chi tiết bên dưới ({violations.length} dòng)
            </div>
          </div>
        </div>
      </div>

      {/* 2. Violation Details Table */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            2. Danh sách chi tiết PCT có nội dung không phù hợp ({violations.length} mục)
          </h3>
        </div>

        {violations.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-sm font-semibold text-slate-700">
              Không có PCT nào có nội dung không phù hợp
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Nhấn "Thêm dòng mới" hoặc "Chọn từ danh mục mẫu" nếu có phát hiện mới
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {violations.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200 relative group transition hover:border-slate-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                  {/* STT & Number */}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="w-full">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                        Số PCT
                      </label>
                      <input
                        type="text"
                        disabled={disabled}
                        value={item.number}
                        onChange={(e) => handleUpdateViolation(index, { number: e.target.value })}
                        placeholder="387"
                        className="w-full px-2 py-1 text-sm bg-white font-bold rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Type Dropdown */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                      Loại
                    </label>
                    <select
                      disabled={disabled}
                      value={item.type}
                      onChange={(e) => handleUpdateViolation(index, { type: e.target.value })}
                      className="w-full px-2 py-1 text-xs bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium disabled:opacity-60"
                    >
                      {WORK_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Content (Dropdown or manual text) */}
                  <div className="md:col-span-4">
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="block text-[11px] font-semibold text-slate-500">
                        Nội dung không phù hợp
                      </label>
                      <select
                        disabled={disabled}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleUpdateViolation(index, { content: e.target.value });
                          }
                        }}
                        className="text-[10px] text-blue-600 bg-transparent border-0 underline cursor-pointer focus:outline-none max-w-[130px] truncate"
                      >
                        <option value="">Chọn mẫu nhanh...</option>
                        {PCT_VIOLATION_OPTIONS.map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      rows={2}
                      disabled={disabled}
                      value={item.content}
                      onChange={(e) => handleUpdateViolation(index, { content: e.target.value })}
                      placeholder="Mô tả cụ thể nội dung không phù hợp..."
                      className="w-full px-2 py-1 text-xs bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-normal disabled:opacity-60"
                    />
                  </div>

                  {/* Related People */}
                  <div className="md:col-span-2 space-y-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500">
                        VHIALY
                      </label>
                      <input
                        type="text"
                        disabled={disabled}
                        value={item.relatedVh}
                        onChange={(e) => handleUpdateViolation(index, { relatedVh: e.target.value })}
                        placeholder="Lê Văn Hiền"
                        className="w-full px-2 py-1 text-xs bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500">
                        PXSC
                      </label>
                      <input
                        type="text"
                        disabled={disabled}
                        value={item.relatedPxsc}
                        onChange={(e) => handleUpdateViolation(index, { relatedPxsc: e.target.value })}
                        placeholder="Lương Minh Cảnh"
                        className="w-full px-2 py-1 text-xs bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Reason (Dropdown or manual text) & Delete Button */}
                  <div className="md:col-span-2 flex items-start gap-1">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[10px] font-semibold text-slate-500">
                          Lý do
                        </label>
                        <select
                          disabled={disabled}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateViolation(index, { reason: e.target.value });
                            }
                          }}
                          className="text-[10px] text-blue-600 bg-transparent border-0 underline cursor-pointer focus:outline-none max-w-[80px] truncate"
                        >
                          <option value="">Mẫu lý do...</option>
                          {STANDARD_REASONS.map((r, i) => (
                            <option key={i} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        disabled={disabled}
                        value={item.reason}
                        onChange={(e) => handleUpdateViolation(index, { reason: e.target.value })}
                        placeholder="Lý do theo quy trình..."
                        className="w-full px-2 py-1 text-xs bg-white rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                      />
                    </div>

                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemoveViolation(index)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 transition mt-4"
                        title="Xóa dòng này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {!disabled && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              type="button"
              onClick={handleAddViolation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm dòng mới</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPresetModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Chọn từ danh mục mẫu nhanh</span>
            </button>
          </div>
        )}
      </div>

      {/* Preset Modal */}
      <QuickViolationsModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        category="PCT"
        onSelectPreset={handleAddFromPreset}
      />
    </div>
  );
};
