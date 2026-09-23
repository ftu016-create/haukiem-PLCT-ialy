import React, { useState, useEffect, useCallback } from 'react';
import { ReportData } from './types/report';
import { INITIAL_SAMPLE_REPORT } from './data/sampleReport';
import { TopNavbar, ViewMode } from './components/TopNavbar';
import { GuestView } from './components/GuestView';
import { GeneralInfoForm } from './components/GeneralInfoForm';
import { PctSectionEditor } from './components/PctSectionEditor';
import { LctSectionEditor } from './components/LctSectionEditor';
import { RecommendationsEditor } from './components/RecommendationsEditor';
import { SignatoriesEditor } from './components/SignatoriesEditor';
import { ReportDocumentPreview } from './components/ReportDocumentPreview';
import { SavedReportsModal } from './components/SavedReportsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import {
  fetchReportsFromServer,
  saveReportToServer,
  syncAllReportsToServer,
  deleteReportFromServer,
} from './utils/apiSync';
import { exportReportToWord } from './utils/exportWord';
import { exportReportToPdf, printDocument } from './utils/exportPdf';
import { svgToPngArrayBuffer } from './utils/chartToImage';
import {
  Building2,
  CheckCircle,
  ClipboardList,
  FileCheck2,
  Lightbulb,
  Plus,
  Save,
  Users,
} from 'lucide-react';

const STORAGE_KEY = 'ialy_atvsld_reports_v2';
const CURRENT_ID_KEY = 'ialy_atvsld_current_id_v2';
const ADMIN_AUTH_KEY = 'ialy_is_admin_auth_v2';

export default function App() {
  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Initialize reports from local storage first
  const [savedReports, setSavedReports] = useState<ReportData[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading reports from localStorage', e);
    }
    return [INITIAL_SAMPLE_REPORT];
  });

  const [currentReportId, setCurrentReportId] = useState<string>(() => {
    try {
      const storedId = localStorage.getItem(CURRENT_ID_KEY);
      if (storedId) return storedId;
    } catch (e) {}
    return INITIAL_SAMPLE_REPORT.id;
  });

  const [report, setReport] = useState<ReportData>(() => {
    const found = savedReports.find((r) => r.id === currentReportId);
    return found || savedReports[0] || INITIAL_SAMPLE_REPORT;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'pct' | 'lct' | 'recommendations' | 'signatories'>('all');
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // 1. Initial multi-device server data fetch
  useEffect(() => {
    let isMounted = true;
    fetchReportsFromServer().then((serverReports) => {
      if (!isMounted) return;
      if (serverReports && serverReports.length > 0) {
        setSavedReports(serverReports);
        // If current report id not in server reports, select first
        const exists = serverReports.some((r) => r.id === currentReportId);
        if (!exists) {
          setCurrentReportId(serverReports[0].id);
          setReport(serverReports[0]);
        } else {
          const current = serverReports.find((r) => r.id === currentReportId);
          if (current) setReport(current);
        }
      } else {
        // Server empty, seed with initial report
        syncAllReportsToServer(savedReports);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Sync to localStorage for local caching
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedReports));
      localStorage.setItem(CURRENT_ID_KEY, currentReportId);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [savedReports, currentReportId]);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } catch (e) {}
    setViewMode('editor');
    showToast('Đăng nhập Quản trị viên thành công!');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    } catch (e) {}
    showToast('Đã chuyển về Giao diện xem của Khách');
  };

  // Update current report in list when report changes (Admin only)
  const updateCurrentReport = (updater: (prev: ReportData) => ReportData) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setReport((prev) => {
      const updated = updater(prev);
      updated.updatedAt = new Date().toISOString();
      setSavedReports((reports) =>
        reports.map((r) => (r.id === updated.id ? updated : r))
      );
      return updated;
    });
  };

  // Manual explicit SAVE BUTTON handler (Unified across all devices)
  const handleSaveReport = async () => {
    setIsSaving(true);
    try {
      const updated = {
        ...report,
        updatedAt: new Date().toISOString(),
      };
      // 1. Save to server database
      await saveReportToServer(updated);
      await syncAllReportsToServer(savedReports.map((r) => (r.id === updated.id ? updated : r)));

      // 2. Save local
      setReport(updated);
      setSavedReports((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedReports));

      showToast('Đã lưu văn bản & đồng bộ thành công lên mọi thiết bị!');
    } catch (err) {
      console.error('Save error:', err);
      showToast('Đã lưu vào bộ nhớ cục bộ');
    } finally {
      setIsSaving(false);
    }
  };

  // Switch report
  const handleSelectReport = (rep: ReportData) => {
    setCurrentReportId(rep.id);
    setReport(rep);
  };

  // Create new report
  const handleNewReport = async () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const newDate = new Date();
    const currentMonth = newDate.getMonth() + 1;
    const currentYear = newDate.getFullYear();
    const newId = `report-ialy-${Date.now()}`;
    const newReport: ReportData = {
      ...INITIAL_SAMPLE_REPORT,
      id: newId,
      updatedAt: newDate.toISOString(),
      general: {
        ...INITIAL_SAMPLE_REPORT.general,
        month: currentMonth,
        year: currentYear,
        reportDate: newDate.toISOString().slice(0, 10),
        reportSubtitle: `Về việc kết quả hậu kiểm PCT, LCT tháng ${currentMonth}/${currentYear}`,
      },
      pct: {
        stats: { totalIssued: 0, notExecuted: 0, paperForm: 0, inProgress: 0, nonCompliant: 0 },
        violations: [],
      },
      lct: {
        stats: { totalIssued: 0, notExecuted: 0, paperForm: 0, nonCompliant: 0, notes: '/' },
        violations: [],
      },
      signatories: {
        ...INITIAL_SAMPLE_REPORT.signatories,
        leadSignatureUrl: undefined,
      },
    };

    const nextList = [newReport, ...savedReports];
    setSavedReports(nextList);
    setCurrentReportId(newId);
    setReport(newReport);
    setViewMode('editor');

    // Save to server
    await saveReportToServer(newReport);
    await syncAllReportsToServer(nextList);
    showToast('Đã tạo văn bản mới thành công!');
  };

  const handleDuplicateReport = async (rep: ReportData) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const duplicated: ReportData = {
      ...JSON.parse(JSON.stringify(rep)),
      id: `report-copy-${Date.now()}`,
      updatedAt: new Date().toISOString(),
      general: {
        ...rep.general,
        reportSubtitle: `${rep.general.reportSubtitle} (Bản sao)`,
      },
    };
    const nextList = [duplicated, ...savedReports];
    setSavedReports(nextList);
    setCurrentReportId(duplicated.id);
    setReport(duplicated);

    await saveReportToServer(duplicated);
    await syncAllReportsToServer(nextList);
    showToast('Đã nhân bản báo cáo thành công!');
  };

  const handleDeleteReport = async (id: string) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const filtered = savedReports.filter((r) => r.id !== id);
    setSavedReports(filtered);
    if (filtered.length > 0 && currentReportId === id) {
      setCurrentReportId(filtered[0].id);
      setReport(filtered[0]);
    }
    await deleteReportFromServer(id);
    await syncAllReportsToServer(filtered);
    showToast('Đã xóa biên bản');
  };

  const handleImportReports = async (newReports: ReportData[]) => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const nextList = [...newReports, ...savedReports];
    setSavedReports(nextList);
    if (newReports.length > 0) {
      setCurrentReportId(newReports[0].id);
      setReport(newReports[0]);
    }
    await syncAllReportsToServer(nextList);
    showToast(`Đã nhập ${newReports.length} biên bản lên máy chủ`);
  };

  const handleResetToSample = async () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    const sample = JSON.parse(JSON.stringify(INITIAL_SAMPLE_REPORT));
    sample.id = `report-sample-${Date.now()}`;
    const nextList = [sample, ...savedReports];
    setSavedReports(nextList);
    setCurrentReportId(sample.id);
    setReport(sample);
    await saveReportToServer(sample);
    await syncAllReportsToServer(nextList);
    showToast('Đã nạp văn bản mặc định');
  };

  // Export to Word (Available to both Guest and Admin)
  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      let pctBytes: Uint8Array | null = null;
      let lctBytes: Uint8Array | null = null;

      const pctSvg = document.getElementById('svg-pct-chart') as unknown as SVGSVGElement | null;
      if (pctSvg) {
        pctBytes = await svgToPngArrayBuffer(pctSvg);
      }

      const lctSvg = document.getElementById('svg-lct-chart') as unknown as SVGSVGElement | null;
      if (lctSvg) {
        lctBytes = await svgToPngArrayBuffer(lctSvg);
      }

      await exportReportToWord(report, pctBytes, lctBytes);
    } catch (err) {
      console.error('Export word error:', err);
      alert('Có lỗi khi xuất file Word. Vui lòng thử lại!');
    } finally {
      setIsExportingWord(false);
    }
  };

  // Export to PDF (Available to both Guest and Admin)
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const filename = `Bao_cao_hau_kiem_PCT_LCT_${report.general.month}_${report.general.year}.pdf`;
      const success = await exportReportToPdf('report-document-root', filename);
      if (!success) {
        printDocument();
      }
    } catch (err) {
      printDocument();
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ==========================================
  // GIAO DIỆN 1: GIAO DIỆN NGƯỜI CHƯA ĐĂNG NHẬP (KHÁCH)
  // ==========================================
  if (!isAdmin) {
    return (
      <>
        {/* Hidden preview container for SVG chart export if needed */}
        <div className="hidden">
          <ReportDocumentPreview data={report} />
        </div>

        <GuestView
          currentReport={report}
          allReports={savedReports}
          onSelectReport={handleSelectReport}
          onOpenHistoryModal={() => setIsSavedModalOpen(true)}
          onExportWord={handleExportWord}
          onExportPdf={handleExportPdf}
          onPrint={printDocument}
          isExportingWord={isExportingWord}
          isExportingPdf={isExportingPdf}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Saved Reports Modal in Read-only view for Guest */}
        <SavedReportsModal
          isOpen={isSavedModalOpen}
          onClose={() => setIsSavedModalOpen(false)}
          savedReports={savedReports}
          currentReportId={currentReportId}
          onSelectReport={handleSelectReport}
          onDeleteReport={handleDeleteReport}
          onNewReport={handleNewReport}
          onDuplicateReport={handleDuplicateReport}
          onImportReports={handleImportReports}
          onResetToSample={handleResetToSample}
          isAdmin={false}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Admin Login Modal */}
        <AdminLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  // ==========================================
  // GIAO DIỆN 2: GIAO DIỆN QUẢN TRỊ VIÊN (ADMIN)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar for Admin */}
      <TopNavbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExportWord={handleExportWord}
        onExportPdf={handleExportPdf}
        onPrint={printDocument}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onSaveReport={handleSaveReport}
        isSaving={isSaving}
        isExportingWord={isExportingWord}
        isExportingPdf={isExportingPdf}
        isAdmin={true}
        onOpenLoginModal={() => {}}
        onLogout={handleLogout}
      />

      {/* Persistent Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2 no-print">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
        {/* Hidden preview container for SVG chart export when in Editor view */}
        <div className="hidden">
          <ReportDocumentPreview data={report} />
        </div>

        {/* View Mode: Editor Only (Admin) */}
        {viewMode === 'editor' && (
          <div className="max-w-5xl mx-auto">
            {/* Quick section navigation pills & Save bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  Tất cả các phần
                </button>
                <button
                  onClick={() => setActiveTab('general')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    activeTab === 'general'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Thông tin chung
                </button>
                <button
                  onClick={() => setActiveTab('pct')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    activeTab === 'pct'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  I. Phiếu công tác (PCT)
                </button>
                <button
                  onClick={() => setActiveTab('lct')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    activeTab === 'lct'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <ClipboardList className="w-3.5 h-3.5" />
                  II. Lệnh công tác (LCT)
                </button>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    activeTab === 'recommendations'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  III. Kiến nghị
                </button>
                <button
                  onClick={() => setActiveTab('signatories')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                    activeTab === 'signatories'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Thành viên & Ký duyệt
                </button>
              </div>

              {/* Action buttons on top of editor */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNewReport}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tạo văn bản mới</span>
                </button>
              </div>
            </div>

            {/* General Info */}
            {(activeTab === 'all' || activeTab === 'general') && (
              <GeneralInfoForm
                general={report.general}
                onChange={(updated) =>
                  updateCurrentReport((prev) => ({
                    ...prev,
                    general: { ...prev.general, ...updated },
                  }))
                }
              />
            )}

            {/* PCT Section */}
            {(activeTab === 'all' || activeTab === 'pct') && (
              <PctSectionEditor
                stats={report.pct.stats}
                violations={report.pct.violations}
                onStatsChange={(stats) =>
                  updateCurrentReport((prev) => ({
                    ...prev,
                    pct: { ...prev.pct, stats },
                  }))
                }
                onViolationsChange={(violations) =>
                  updateCurrentReport((prev) => ({
                    ...prev,
                    pct: { ...prev.pct, violations },
                  }))
                }
              />
            )}

            {/* LCT Section */}
            {(activeTab === 'all' || activeTab === 'lct') && (
              <LctSectionEditor
                stats={report.lct.stats}
                violations={report.lct.violations}
                onStatsChange={(stats) =>
                  updateCurrentReport((prev) => ({
                    ...prev,
                    lct: { ...prev.lct, stats },
                  }))
                }
                onViolationsChange={(violations) =>
                  updateCurrentReport((prev) => ({
                    ...prev,
                    lct: { ...prev.lct, violations },
                  }))
                }
              />
            )}

            {/* Recommendations Section */}
            {(activeTab === 'all' || activeTab === 'recommendations') && (
              <RecommendationsEditor
                recommendations={report.recommendations}
                onChange={(recommendations) =>
                  updateCurrentReport((prev) => ({
                    ...prev,
                    recommendations,
                  }))
                }
              />
            )}

            {/* Signatories Section */}
            {(activeTab === 'all' || activeTab === 'signatories') && (
              <SignatoriesEditor
                signatories={report.signatories}
                onChange={(updated) =>
                  updateCurrentReport((prev) => ({
                    ...prev,
                    signatories: { ...prev.signatories, ...updated },
                  }))
                }
              />
            )}

            {/* Sticky/Prominent Save Bar at Bottom */}
            <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Hoàn thành chỉnh sửa báo cáo?
                </p>
                <p className="text-[11px] text-slate-500">
                  Nhấn "Lưu văn bản" để cập nhật nội dung đồng bộ lên tất cả máy tính và điện thoại.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  Xem trước A4
                </button>
                <button
                  type="button"
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu vào máy chủ...' : 'Lưu văn bản'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Mode: Preview Only (Admin) */}
        {viewMode === 'preview' && (
          <div className="w-full flex justify-center">
            <ReportDocumentPreview data={report} />
          </div>
        )}
      </main>

      {/* Saved Reports Modal */}
      <SavedReportsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedReports={savedReports}
        currentReportId={currentReportId}
        onSelectReport={handleSelectReport}
        onDeleteReport={handleDeleteReport}
        onNewReport={handleNewReport}
        onDuplicateReport={handleDuplicateReport}
        onImportReports={handleImportReports}
        onResetToSample={handleResetToSample}
        isAdmin={true}
        onOpenLoginModal={() => {}}
      />
    </div>
  );
}
