import React from 'react';
import { Lightbulb, Plus, Trash2 } from 'lucide-react';

interface RecommendationsEditorProps {
  recommendations: string[];
  onChange: (updated: string[]) => void;
  disabled?: boolean;
}

export const RecommendationsEditor: React.FC<RecommendationsEditorProps> = ({
  recommendations,
  onChange,
  disabled = false,
}) => {
  const handleAdd = () => {
    if (disabled) return;
    onChange([...recommendations, '']);
  };

  const handleUpdate = (index: number, val: string) => {
    if (disabled) return;
    const next = [...recommendations];
    next[index] = val;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    if (disabled) return;
    onChange(recommendations.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-800">
            III. Kiến Nghị & Giải Pháp
          </h2>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {recommendations.map((rec, index) => (
          <div key={index} className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 mt-2">
              {index + 1}
            </span>
            <div className="flex-1">
              <textarea
                rows={2}
                disabled={disabled}
                value={rec}
                onChange={(e) => handleUpdate(index, e.target.value)}
                placeholder="Nhập nội dung kiến nghị..."
                className="w-full px-3 py-2 text-xs bg-slate-50 rounded-lg border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed transition disabled:opacity-60"
              />
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition mt-1.5"
                title="Xóa kiến nghị này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!disabled && (
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm kiến nghị</span>
        </button>
      )}
    </div>
  );
};
