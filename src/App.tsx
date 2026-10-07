/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AuditLogEntry,
  FilterState,
  NormalizedRecord,
  SyncState,
  UserRole,
} from './types';
import {
  DEFAULT_RAW_CSV,
  formatGoogleSheetsCsvUrl,
  parseCSVToRawRecords,
} from './utils/csvParser';
import { processRawRecords } from './engine/normalization';
import {
  applyFilters,
  calculateOverview,
  calculatePersonalAnalysis,
  calculateRoleAnalysis,
  calculateYearlyStatistics,
} from './engine/statisticsEngine';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { FilterBar } from './components/FilterBar';
import { KpiCards } from './components/KpiCards';
import { ErrorProportionCharts } from './components/Charts/ErrorProportionCharts';
import { MonthlyCharts } from './components/Charts/MonthlyCharts';
import { HeatmapMatrix } from './components/HeatmapMatrix';
import { PersonalAnalysis } from './components/PersonalAnalysis';
import { ErrorAnalysis } from './components/ErrorAnalysis';
import { DataTable } from './components/DataTable';
import { AuditView } from './components/AuditView';
import { ReportView } from './components/ReportView';
import { SettingsModal } from './components/SettingsModal';
import { exportToWord, triggerPrintReport } from './utils/exportService';
import {
  Menu,
  X,
  FileCheck2,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function App() {
  // Persistent settings in localStorage
  const [rawCsv, setRawCsv] = useState<string>(() => {
    return localStorage.getItem('ialy_raw_csv') || DEFAULT_RAW_CSV;
  });

  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem('ialy_sheet_url') || '';
  });

  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('ialy_admin_pin') || 'ialy2026';
  });

  // Khởi tạo vai trò người dùng mặc định là Khách (VIEWER) theo yêu cầu
  const [userRole, setUserRole] = useState<UserRole>('VIEWER');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    year: 2026,
    month: 'all',
    documentType: 'all',
    unit: 'all',
    severity: 'all',
    searchQuery: '',
    statusFilter: 'all',
  });

  // Sync state
  const [syncState, setSyncState] = useState<SyncState>({
    lastSyncTime: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    status: 'success',
    sourceUrl: sheetUrl,
    totalRawRows: 0,
    totalUniqueRows: 0,
    totalDuplicatesRemoved: 0,
  });

  // System Audit Logs stored across sessions
  const [persistentLogs, setPersistentLogs] = useState<AuditLogEntry[]>([]);

  // 1. Data Normalization & Duplicate Detection Pipeline
  const { normalizedRecords, allParsedRecords, duplicatesRemovedCount, auditLogs } =
    useMemo(() => {
      const rawRecords = parseCSVToRawRecords(rawCsv);
      return processRawRecords(rawRecords);
    }, [rawCsv]);

  // Update sync counts
  useEffect(() => {
    setSyncState((prev) => ({
      ...prev,
      totalRawRows: allParsedRecords.length,
      totalUniqueRows: normalizedRecords.length,
      totalDuplicatesRemoved: duplicatesRemovedCount,
    }));
  }, [allParsedRecords.length, normalizedRecords.length, duplicatesRemovedCount]);

  // Merge audit logs
  const combinedAuditLogs = useMemo(() => {
    return [...auditLogs, ...persistentLogs];
  }, [auditLogs, persistentLogs]);

  // 2. Filter Application
  const filteredRecords = useMemo(() => {
    return applyFilters(normalizedRecords, filters);
  }, [normalizedRecords, filters]);

  // 3. Central Statistics Engine Calculations
  const overview = useMemo(() => {
    return calculateOverview(filteredRecords);
  }, [filteredRecords]);

  const personalStats = useMemo(() => {
    return calculatePersonalAnalysis(filteredRecords, filters.month, filters.unit);
  }, [filteredRecords, filters.month, filters.unit]);

  const roleStats = useMemo(() => {
    return calculateRoleAnalysis(filteredRecords);
  }, [filteredRecords]);

  const monthlyStats = useMemo(() => {
    const targetYear = filters.year === 'all' ? 2026 : filters.year;
    return calculateYearlyStatistics(normalizedRecords, targetYear);
  }, [normalizedRecords, filters.year]);

  // Available metadata for filters
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(normalizedRecords.map((r) => r.year))).sort((a, b) => b - a);
    return years.length > 0 ? years : [2026];
  }, [normalizedRecords]);

  // Danh sách đúng 5 mục chuẩn theo yêu cầu:
  // Tất cả, Công ty Thủy điện Ialy, Phân xưởng Vận hành, Phân xưởng Sửa chữa, Đơn vị ngoài
  const unitsList = useMemo(() => {
    return [
      'Công ty Thủy điện Ialy',
      'Phân xưởng Vận hành',
      'Phân xưởng Sửa chữa',
      'Đơn vị ngoài',
    ];
  }, []);

  // Google Sheets Live Sync Handler
  const handleSync = useCallback(async () => {
    setSyncState((prev) => ({ ...prev, status: 'syncing' }));

    if (sheetUrl && sheetUrl.trim()) {
      try {
        const directCsvUrl = formatGoogleSheetsCsvUrl(sheetUrl);
        // Fetch through standard proxy / direct CORS
        const response = await fetch(directCsvUrl, { cache: 'no-cache' });
        if (!response.ok) {
          throw new Error(`Mã lỗi HTTP: ${response.status} (${response.statusText})`);
        }
        const csvText = await response.text();

        if (csvText && csvText.includes(',')) {
          setRawCsv(csvText);
          localStorage.setItem('ialy_raw_csv', csvText);

          const timeStr = new Date().toLocaleTimeString('vi-VN');
          setSyncState({
            lastSyncTime: timeStr,
            status: 'success',
            sourceUrl: sheetUrl,
            totalRawRows: 0,
            totalUniqueRows: 0,
            totalDuplicatesRemoved: 0,
          });

          setPersistentLogs((prev) => [
            {
              id: `sync-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: 'SYNC_SHEET',
              title: 'Đồng bộ thành công từ Google Sheets',
              details: `Đã kết nối và nạp dữ liệu mới nhất từ ${directCsvUrl}`,
            },
            ...prev,
          ]);
          return;
        } else {
          throw new Error('Định dạng phản hồi không phải là CSV hợp lệ');
        }
      } catch (err: any) {
        console.warn('Google Sheets live sync error:', err);
        setSyncState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: err.message || 'Không thể kết nối đến Google Sheets',
        }));
        // Maintain existing local cache without losing data
      }
    } else {
      // Re-trigger parse from current dataset with a fresh timestamp
      setTimeout(() => {
        setSyncState((prev) => ({
          ...prev,
          status: 'success',
          lastSyncTime: new Date().toLocaleTimeString('vi-VN'),
        }));
      }, 500);
    }
  }, [sheetUrl]);

  // Update Sheet URL Handler
  const handleUpdateSheetUrl = (newUrl: string) => {
    setSheetUrl(newUrl);
    localStorage.setItem('ialy_sheet_url', newUrl);
    setSyncState((prev) => ({ ...prev, sourceUrl: newUrl }));
    setTimeout(handleSync, 100);
  };

  // Upload CSV File Handler
  const handleUploadCsvText = (csvContent: string) => {
    setRawCsv(csvContent);
    localStorage.setItem('ialy_raw_csv', csvContent);
    setSyncState((prev) => ({
      ...prev,
      lastSyncTime: new Date().toLocaleTimeString('vi-VN'),
      status: 'success',
    }));
    setPersistentLogs((prev) => [
      {
        id: `upload-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'SYNC_SHEET',
        title: 'Tải tệp CSV ngoại tuyến thành công',
        details: 'Đã nạp bộ dữ liệu mới từ tệp CSV tải lên từ máy tính cá nhân',
      },
      ...prev,
    ]);
  };

  // Reset to Baseline Real Dataset
  const handleResetToDefault = () => {
    setRawCsv(DEFAULT_RAW_CSV);
    localStorage.setItem('ialy_raw_csv', DEFAULT_RAW_CSV);
    setSheetUrl('');
    localStorage.removeItem('ialy_sheet_url');
    setSyncState((prev) => ({
      ...prev,
      lastSyncTime: new Date().toLocaleTimeString('vi-VN'),
      status: 'success',
      sourceUrl: '',
    }));
  };

  // Export handlers
  const handleExportWord = () => {
    let savedRecs: string[] | undefined = undefined;
    let savedMembers: string[] | undefined = undefined;
    try {
      const recRaw = localStorage.getItem('ialy_report_recommendations_v4');
      if (recRaw) savedRecs = JSON.parse(recRaw);
      const memRaw = localStorage.getItem('ialy_audit_members_v4');
      if (memRaw) savedMembers = JSON.parse(memRaw);
    } catch (e) {}

    exportToWord({
      overview,
      records: filteredRecords,
      personalStats,
      monthlyStats,
      reportType: filters.month === 'all' ? 'year' : 'month',
      reportMonth: filters.month === 'all' ? 8 : filters.month,
      reportYear: filters.year === 'all' ? 2026 : filters.year,
      recommendationsText: savedRecs ? savedRecs.filter((r) => r.trim()).join('\n') : undefined,
      auditMembers: savedMembers,
    });
  };

  const handleExportPDF = () => {
    if (activeTab !== 'reports') {
      setActiveTab('reports');
      setTimeout(() => {
        triggerPrintReport();
      }, 300);
    } else {
      triggerPrintReport();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans print:bg-white print:min-h-0">
      {/* Top Header */}
      <div className="print:hidden">
        <Header
          syncState={syncState}
          onSync={handleSync}
          role={userRole}
          onChangeRole={setUserRole}
        />
      </div>

      {/* Mobile Navigation Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-xs font-bold text-slate-800">
            {activeTab === 'dashboard' && 'Tổng quan'}
            {activeTab === 'personal' && 'Thống kê Cá nhân liên quan'}
            {activeTab === 'records' && 'Danh sách & Tra cứu'}
            {activeTab === 'reports' && 'Báo cáo & Xuất file'}
            {activeTab === 'settings' && 'Cấu hình'}
          </span>
        </div>

        <button
          onClick={handleSync}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
        >
          Đồng bộ
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto print:max-w-none print:w-full print:m-0 print:p-0 print:block">
        {/* Desktop Sidebar (Ẩn hoàn toàn khi in/lưu PDF) */}
        <div className="print:hidden">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            role={userRole}
            duplicateCount={duplicatesRemovedCount}
            anomalyCount={0}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex print:hidden">
            <div className="w-64 bg-white h-full shadow-2xl flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">Danh mục chức năng</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg bg-slate-100"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  activeTab={activeTab}
                  onSelectTab={(tab) => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  role={userRole}
                  duplicateCount={duplicatesRemovedCount}
                  anomalyCount={0}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto print:p-0 print:m-0 print:overflow-visible print:block">
          {/* Universal Filter Bar: Chỉ hiển thị ở các tab tra cứu & thống kê, ẩn ở tab Cấu hình và tab Báo cáo (vì tab Báo cáo có thanh điều khiển Tháng/Năm riêng biệt) */}
          {activeTab !== 'settings' && activeTab !== 'reports' && (
            <div className="print:hidden">
              <FilterBar
                filters={filters}
                onChangeFilters={setFilters}
                availableYears={availableYears}
                unitsList={unitsList}
              />
            </div>
          )}

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <KpiCards overview={overview} />
              {/* 3 Biểu đồ tròn theo yêu cầu vị trí 1, 2, 3 (kèm danh sách lỗi và xem chi tiết khi nhấp) */}
              <ErrorProportionCharts overview={overview} records={filteredRecords} />
              <MonthlyCharts
                monthlyData={monthlyStats}
                targetYear={filters.year === 'all' ? 2026 : filters.year}
              />
              <HeatmapMatrix
                personalStats={personalStats}
                targetYear={filters.year === 'all' ? 2026 : filters.year}
                onSelectPerson={(name) => {
                  setFilters((prev) => ({ ...prev, searchQuery: name }));
                  setActiveTab('records');
                }}
              />
              <DataTable records={filteredRecords} />
            </div>
          )}

          {/* TAB: PERSONAL ANALYSIS */}
          {activeTab === 'personal' && (
            <PersonalAnalysis
              personalStats={personalStats}
              records={normalizedRecords}
              selectedMonth={filters.month}
            />
          )}

          {/* TAB: RECORDS & SEARCH */}
          {activeTab === 'records' && <DataTable records={filteredRecords} />}



          {/* TAB: REPORTS & EXPORT */}
          {activeTab === 'reports' && (
            <ReportView
              overview={overview}
              records={filteredRecords}
              allParsedRecords={allParsedRecords}
              personalStats={personalStats}
              roleStats={roleStats}
              monthlyStats={monthlyStats}
              filters={filters}
              onChangeFilters={setFilters}
              auditLogs={combinedAuditLogs}
              role={userRole}
              onChangeRole={setUserRole}
            />
          )}

          {/* TAB: SETTINGS (ADMIN) */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
              >
                Mở Bảng Điều Khiển Cấu hình Nguồn Dữ liệu & Quản trị
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        syncState={syncState}
        onUpdateSheetUrl={handleUpdateSheetUrl}
        onUploadCsvText={handleUploadCsvText}
        onResetToDefault={handleResetToDefault}
        role={userRole}
        onChangePin={(newP) => {
          setAdminPin(newP);
          localStorage.setItem('ialy_admin_pin', newP);
        }}
      />
    </div>
  );
}
