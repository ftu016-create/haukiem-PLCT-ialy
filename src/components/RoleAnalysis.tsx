import React, { useState } from 'react';
import { RoleStat } from '../types';
import { Award, Users, AlertTriangle, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';

interface RoleAnalysisProps {
  roleStats: RoleStat[];
}

export const RoleAnalysis: React.FC<RoleAnalysisProps> = ({ roleStats }) => {
  const [selectedRole, setSelectedRole] = useState<RoleStat>(roleStats[0] || null);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>Phân tích Chức danh & Trách nhiệm Quy trình</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đánh giá theo 3 chức danh mấu chốt: Người cấp phiếu, Người chỉ huy trực tiếp (CHTT), Người cho phép
          </p>
        </div>

        {/* 3 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {roleStats.map((role) => {
            const isSelected = selectedRole?.roleName === role.roleName;

            return (
              <div
                key={role.roleName}
                onClick={() => setSelectedRole(role)}
                className={`rounded-2xl border p-5 transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {role.roleName}
                  </span>
                  <div
                    className={`p-1.5 rounded-lg ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 py-3 px-3 bg-white/80 rounded-xl mb-3 border border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-500">Số nhân sự</div>
                    <div className="text-xl font-black text-slate-900">{role.personCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Tổng phiếu/lệnh soát</div>
                    <div className="text-xl font-bold text-slate-800">{role.documentCount}</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Phiếu/lệnh có sai sót:</span>
                    <strong className="text-rose-600 font-bold">{role.errorDocumentCount}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tổng số lỗi vi phạm:</span>
                    <strong className="text-amber-600 font-bold">{role.totalErrors}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tỷ lệ lỗi:</span>
                    <strong className="text-slate-800 font-bold">{role.errorRate}%</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Mật độ lỗi:</span>
                    <strong className="text-slate-800 font-bold">{role.errorDensity}%</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-blue-600 font-semibold">
                  <span>{isSelected ? 'Đang chọn xem danh sách' : 'Bấm để xem danh sách nhân sự'}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Drilldown Table of Personnel for Selected Role */}
      {selectedRole && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Danh sách Nhân sự đảm nhiệm chức danh: </span>
                <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {selectedRole.roleName}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tổng cộng {selectedRole.persons.length} cá nhân được phân công vai trò này
              </p>
            </div>
          </div>

          <div className="overflow-x-auto mt-4 border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-4 min-w-[200px]">Họ và tên cán bộ / nhân viên</th>
                  <th className="py-3 px-3 text-center min-w-[120px]">Số phiếu/lệnh tham gia</th>
                  <th className="py-3 px-3 text-center min-w-[120px]">Tổng số lỗi phát hiện</th>
                  <th className="py-3 px-3 text-center min-w-[120px]">Mật độ lỗi / phiếu</th>
                  <th className="py-3 px-3 text-center min-w-[140px]">Đánh giá rủi ro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedRole.persons.map((p, idx) => {
                  const density = p.docCount > 0 ? (p.errorCount / p.docCount).toFixed(2) : '0';

                  return (
                    <tr key={p.name} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700">
                        {p.docCount}
                      </td>
                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={
                            p.errorCount > 0 ? 'text-rose-600 font-black' : 'text-slate-400'
                          }
                        >
                          {p.errorCount}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">{density}</td>
                      <td className="py-3 px-3 text-center">
                        {p.errorCount >= 4 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Cần rà soát kỹ
                          </span>
                        ) : p.errorCount > 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            Có sai sót
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">
                            Hợp lệ
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
