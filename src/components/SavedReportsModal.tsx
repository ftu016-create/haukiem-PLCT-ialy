import React, { useRef, useState } from 'react';
import { ReportData } from '../types/report';
import {
  Calendar,
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  FolderOpen,
  Lock,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
  User,
  AlertTriangle,
} from 'lucide-react';

interface SavedReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: ReportData[];
  currentReportId: string;
  onSelectReport: (report: ReportData) => void;
  onDeleteReport: (id: string) => void;
  onNewReport: () => void;
  onDuplicateReport: (report: ReportData) => void;
  onImportReports: (reports: ReportData[]) => void;
  onResetToSample: () => void;
  isAdmin: boolean;
  onOpenLoginModal: () => void;
}

export const SavedReportsModal: React.FC<SavedReportsModalProps> = ({
  isOpen,
  onClose,
  savedReports,
  currentReportId,
  onSelectReport,
  onDeleteReport,
  onNewReport,
  onDuplicateReport,
  onImportReports,
  isAdmin,
  onOpenLoginModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  if (!isOpen) return null;

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const filteredReports = savedReports.filter((rep) => {
    if (!searchKeyword.trim()) return true;
    const q = searchKeyword.toLowerCase();
    const title = (rep.general.reportSubtitle || '').toLowerCase();
    const month = `${rep.general.month}/${rep.general.year}`;
    const lead = (rep.signatories.leadName || '').toLowerCase();
    return title.includes(q) || month.includes(q) || lead.includes(q);
  });

  const handleExportAllJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedReports, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Sao_luu_bien_ban_IALY_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportReports(parsed);
          alert(`Đã nhập thành công ${parsed.length} biên bản!`);
        } else if (parsed && parsed.id && parsed.general) {
          onImportReports([parsed]);
          alert('Đã nhập thành công 1 biên bản!');
        } else {
          alert('Định dạng file sao lưu JSON không đúng.');
        }
      } catch (err) {
        alert('Lỗi đọc file JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header with EVN Blue Style */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base tracking-wide flex items-center gap-2">
                Lịch sử các Biên bản Báo cáo
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                  {savedReports.length} biên bản
                </span>
              </h3>
              <p className="text-xs text-blue-100/90 mt-0.5">
                {isAdmin
                  ? 'Quản trị viên: Toàn quyền tạo mới, chỉnh sửa, xóa, nhân bản và đồng bộ máy chủ'
                  : 'Giao diện Khách: Xem lịch sử, mở báo cáo và xuất file Word / PDF'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-100 hover:text-white rounded-lg hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions bar */}
        <div className="px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm kiếm theo tháng, tiêu đề, người ký..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={() => {
                  onNewReport();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Lập báo cáo mới
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenLoginModal();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition border border-amber-300"
              >
                <Lock className="w-3.5 h-3.5" />
                Đăng nhập Admin
              </button>
            )}

            {isAdmin && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  id="import-backup-file"
                />
                <label
                  htmlFor="import-backup-file"
                  className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition"
                  title="Nạp dữ liệu từ file JSON sao lưu"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Nhập JSON</span>
                </label>
              </>
            )}

            <button
              onClick={handleExportAllJSON}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition"
              title="Tải toàn bộ danh sách biên bản dưới dạng file JSON sao lưu"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Sao lưu JSON</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-100/60">
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
              Không tìm thấy biên bản báo cáo nào phù hợp với từ khóa.
            </div>
          ) : (
            filteredReports.map((item) => {
              const isSelected = item.id === currentReportId;
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-500 bg-white shadow-md ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  <div
                    className="cursor-pointer flex-1"
                    onClick={() => {
                      onSelectReport(item);
                      onClose();
                    }}
                  >
                    {/* Title and badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
                        Tháng {item.general.month}/{item.general.year}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        {item.general.reportSubtitle || `Báo cáo hậu kiểm tháng ${item.general.month}/${item.general.year}`}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          <Check className="w-3 h-3" />
                          Đang mở
                        </span>
                      )}
                    </div>

                    {/* Meta Chips */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Ngày: {formatDateDisplay(item.general.reportDate)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                        PCT: <strong className="text-blue-900">{item.pct.stats.totalIssued}</strong>
                        {item.pct.stats.nonCompliant > 0 && (
                          <span className="text-amber-700 ml-1 font-bold">
                            (KPH: {item.pct.stats.nonCompliant})
                          </span>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-medium">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
                        LCT: <strong className="text-indigo-900">{item.lct.stats.totalIssued}</strong>
                        {item.lct.stats.nonCompliant > 0 && (
                          <span className="text-amber-700 ml-1 font-bold">
                            (KPH: {item.lct.stats.nonCompliant})
                          </span>
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        Người ký: {item.signatories.leadName}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onSelectReport(item);
                        onClose();
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isSelected ? 'Đang chọn' : 'Mở xem'}
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onDuplicateReport(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition border border-transparent hover:border-blue-200"
                          title="Nhân bản biên bản này"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {savedReports.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa biên bản "${item.general.reportSubtitle}"?`)) {
                                onDeleteReport(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                            title="Xóa biên bản này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
