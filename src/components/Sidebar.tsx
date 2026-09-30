import React from 'react';
import {
  LayoutDashboard,
  Grid3X3,
  Users,
  Award,
  AlertOctagon,
  FileSpreadsheet,
  ShieldCheck,
  FileCheck2,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../types';

export type ActiveTab =
  | 'dashboard'
  | 'heatmap'
  | 'personal'
  | 'errors'
  | 'records'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  role: UserRole;
  duplicateCount: number;
  anomalyCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  role,
  duplicateCount,
  anomalyCount,
}) => {
  interface NavItem {
    id: ActiveTab;
    label: string;
    desc?: string;
    icon: any;
    badge?: string;
    badgeColor?: string;
    adminOnly?: boolean;
  }

  const navItems: NavItem[] = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Tổng quan',
      icon: LayoutDashboard,
    },
    {
      id: 'heatmap' as ActiveTab,
      label: 'Ma trận Người - Tháng',
      desc: 'Heatmap tần suất lỗi 12 tháng',
      icon: Grid3X3,
    },
    {
      id: 'personal' as ActiveTab,
      label: 'Thống kê Cá nhân liên quan',
      desc: 'Cảnh báo và các tháng vi phạm',
      icon: Users,
    },
    {
      id: 'errors' as ActiveTab,
      label: 'Nội dung lỗi',
      desc: 'CRITICAL, WARNING, INFO & Điều 278',
      icon: AlertOctagon,
    },
    {
      id: 'records' as ActiveTab,
      label: 'Danh sách & Tra cứu',
      desc: 'Tra cứu đa chiều PCT & LCT',
      icon: FileSpreadsheet,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Báo cáo & Xuất file',
      desc: 'Báo cáo Tháng, Năm, Xuất Word/PDF',
      icon: FileCheck2,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Cấu hình & Kết nối',
      desc: 'Google Sheets URL & Lịch sử audit',
      icon: Settings,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col min-h-[calc(100vh-4rem)] print:hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Nguồn dữ liệu gốc
          </p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Google Sheets Sync</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              Live
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 truncate">
            Tự động loại trùng 100% (A=B=C)
          </p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          if (item.adminOnly && role !== 'ADMIN') {
            return null; // hide admin only for viewers
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-medium truncate leading-tight">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border shrink-0 ${
                        isActive
                          ? 'bg-white text-blue-700 border-transparent'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.desc && (
                  <p
                    className={`text-[10px] truncate leading-tight mt-0.5 ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.desc}
                  </p>
                )}
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isActive ? 'text-white opacity-100' : 'text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 text-slate-500 text-[11px] space-y-1">
        <div className="flex items-center justify-between text-slate-600">
          <span>Quyền hiện tại:</span>
          <span className="font-semibold text-slate-800">{role}</span>
        </div>
        <div className="text-slate-400 text-[10px]">
          Phiên bản 2.6.4 • Quy chuẩn EVN
        </div>
      </div>
    </aside>
  );
};
