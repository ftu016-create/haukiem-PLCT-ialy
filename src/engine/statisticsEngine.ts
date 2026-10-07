import {
  ErrorCategory,
  FilterState,
  MonthlyBreakdown,
  NormalizedRecord,
  PersonStat,
  RoleStat,
  StatisticsOverview,
  Workshop,
  WorkshopStat,
} from '../types';
import { isPXVHMember, isExternalUnit } from '../data/personnelData';

/**
 * Filter dataset based on current user selections
 */
export function applyFilters(records: NormalizedRecord[], filters: FilterState): NormalizedRecord[] {
  return records.filter((rec) => {
    // Year filter
    if (filters.year !== 'all' && rec.year !== filters.year) {
      return false;
    }

    // Month filter
    if (filters.month !== 'all' && rec.month !== filters.month) {
      return false;
    }

    // Document Type filter (PCT or LCT)
    if (filters.documentType !== 'all' && rec.documentType !== filters.documentType) {
      return false;
    }

    // Unit / Workshop filter (Rút gọn đúng 5 mục chuẩn: Tất cả, Công ty Thủy điện Ialy, Phân xưởng Vận hành, Phân xưởng Sửa chữa, Đơn vị ngoài)
    if (filters.unit && filters.unit !== 'all') {
      const u = filters.unit.trim();
      const isExt = isExternalUnit(rec.unit) || isExternalUnit(rec.jobName);

      if (u === 'Đơn vị ngoài') {
        if (!isExt) return false;
      } else if (u === 'Công ty Thủy điện Ialy') {
        if (isExt) return false;
      } else if (u === 'Phân xưởng Vận hành') {
        if (isExt) return false;
        const matchesUnit = rec.unit.toLowerCase().includes('vận hành');
        const hasVHMember = isPXVHMember(rec.issuer) || isPXVHMember(rec.approver);
        if (!matchesUnit && !hasVHMember) return false;
      } else if (u === 'Phân xưởng Sửa chữa') {
        if (isExt) return false;
        const matchesUnit = rec.unit.toLowerCase().includes('sửa chữa');
        const hasSCLeader = rec.leader && !rec.leader.includes('Chưa rõ') && !isPXVHMember(rec.leader);
        if (!matchesUnit && !hasSCLeader) return false;
      } else {
        if (!rec.unit.toLowerCase().includes(u.toLowerCase())) {
          return false;
        }
      }
    }

    // Status filter
    if (filters.statusFilter === 'error_only' && rec.result !== 'Có sai sót') {
      return false;
    }
    if (filters.statusFilter === 'valid_only' && rec.result !== 'Hợp lệ') {
      return false;
    }

    // Severity filter đã được gỡ bỏ theo yêu cầu của người dùng

    // Search query (Mã, Người, Đơn vị, Nội dung lỗi, Tên công việc)
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const match =
        rec.code.toLowerCase().includes(q) ||
        rec.jobName.toLowerCase().includes(q) ||
        rec.issuer.toLowerCase().includes(q) ||
        rec.leader.toLowerCase().includes(q) ||
        rec.approver.toLowerCase().includes(q) ||
        rec.inspectorName.toLowerCase().includes(q) ||
        rec.unit.toLowerCase().includes(q) ||
        rec.rawErrors.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Pure Statistics Engine: KPI Overview
 */
export function calculateOverview(records: NormalizedRecord[]): StatisticsOverview {
  let totalPCT = 0;
  let totalLCT = 0;
  let pctWithErrors = 0;
  let lctWithErrors = 0;
  let documentsWithErrors = 0;
  let totalErrors = 0;
  let criticalCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  const peopleWithErrorsSet = new Set<string>();

  records.forEach((rec) => {
    const isPCT = rec.documentType === 'PCT';
    const isLCT = rec.documentType === 'LCT';

    if (isPCT) totalPCT++;
    if (isLCT) totalLCT++;

    const hasError = rec.result === 'Có sai sót' || rec.errorCount > 0 || rec.parsedErrors.length > 0;
    if (hasError) {
      documentsWithErrors++;
      totalErrors += rec.errorCount;

      if (isPCT) pctWithErrors++;
      if (isLCT) lctWithErrors++;

      // Thống kê cá nhân vi phạm chuẩn theo chức danh vi phạm được nêu trong Danh Sách Lỗi
      const respRoles = getResponsibleRolesFromErrors(rec.parsedErrors, rec.rawErrors);
      const rolesMap: { role: TrackedRoleKey; val: string | undefined }[] = [
        { role: 'issuer', val: rec.issuer },
        { role: 'leader', val: rec.leader },
        { role: 'approver', val: rec.approver },
        { role: 'workers', val: rec.workers },
        { role: 'orderGiver', val: rec.orderGiver },
        { role: 'supervisor', val: rec.supervisor },
      ];

      rolesMap.forEach(({ role, val }) => {
        if (respRoles.has(role) && val && typeof val === 'string') {
          const names = val.split(/[,;\n\r]| và /);
          names.forEach((n) => {
            const trimmed = n.trim();
            if (
              trimmed &&
              trimmed.length >= 2 &&
              !trimmed.toLowerCase().includes('chưa rõ') &&
              !trimmed.toLowerCase().includes('không áp dụng')
            ) {
              peopleWithErrorsSet.add(trimmed);
            }
          });
        }
      });
    }

    rec.parsedErrors.forEach((e) => {
      if (e.severity === 'CRITICAL') criticalCount++;
      else if (e.severity === 'WARNING') warningCount++;
      else if (e.severity === 'INFO') infoCount++;
    });
  });

  const totalDocuments = records.length;
  const validDocuments = totalDocuments - documentsWithErrors;
  const pctValid = totalPCT - pctWithErrors;
  const lctValid = totalLCT - lctWithErrors;

  // Formula as required:
  // Tỷ lệ số phiếu sai / tổng số phiếu = (pctWithErrors / totalPCT) * 100
  // Tỷ lệ số lệnh lỗi / tổng số lệnh = (lctWithErrors / totalLCT) * 100
  // Tỷ lệ hồ sơ có lỗi = (Hồ sơ có lỗi / Tổng hồ sơ) * 100
  // Mật độ lỗi = (Tổng số lỗi / Tổng hồ sơ) * 100
  const pctErrorRate = totalPCT > 0 ? (pctWithErrors / totalPCT) * 100 : 0;
  const lctErrorRate = totalLCT > 0 ? (lctWithErrors / totalLCT) * 100 : 0;
  const errorRate = totalDocuments > 0 ? (documentsWithErrors / totalDocuments) * 100 : 0;
  const errorDensity = totalDocuments > 0 ? (totalErrors / totalDocuments) * 100 : 0;

  return {
    totalPCT,
    totalLCT,
    pctWithErrors,
    pctValid,
    pctErrorRate: Math.round(pctErrorRate * 10) / 10,
    lctWithErrors,
    lctValid,
    lctErrorRate: Math.round(lctErrorRate * 10) / 10,
    totalDocuments,
    documentsWithErrors,
    validDocuments,
    totalErrors,
    totalPeopleWithErrors: peopleWithErrorsSet.size,
    errorRate: Math.round(errorRate * 10) / 10,
    errorDensity: Math.round(errorDensity * 10) / 10,
    criticalCount,
    warningCount,
    infoCount,
  };
}

export type TrackedRoleKey = 'issuer' | 'leader' | 'approver' | 'workers' | 'orderGiver' | 'supervisor';

/**
 * Phân tích danh sách lỗi để xác định chính xác chức danh nào vi phạm quy trình.
 * Hỗ trợ mọi chức danh: Cấp phiếu, CHTT, Cho phép, NVĐVCT, Người ra lệnh, Giám sát...
 */
export function getResponsibleRolesFromErrors(
  parsedErrors: NormalizedRecord['parsedErrors'],
  rawErrors: string
): Set<TrackedRoleKey> {
  const result = new Set<TrackedRoleKey>();

  const lowerRaw = (rawErrors || '').toLowerCase();
  if (
    (!parsedErrors || parsedErrors.length === 0) &&
    (!lowerRaw ||
      lowerRaw.includes('không phát hiện lỗi') ||
      lowerRaw.includes('hợp lệ'))
  ) {
    return result;
  }

  // Thu thập chuỗi lỗi từ parsedErrors và rawErrors
  const errorStrings: string[] = [];
  if (parsedErrors && parsedErrors.length > 0) {
    parsedErrors.forEach((e) => errorStrings.push(`${e.message} ${e.ruleReference || ''}`));
  }
  if (rawErrors && errorStrings.length === 0) {
    errorStrings.push(rawErrors);
  }

  errorStrings.forEach((str) => {
    const text = str.toLowerCase();

    // 1. Kiểm tra Người CHTT / Chỉ huy trực tiếp
    // (Bao gồm: CHTT, chỉ huy trực tiếp, tiếp đất di động của CHTT, hoàn thành công việc của CHTT, Điều 30...)
    if (
      text.includes('chtt') ||
      text.includes('chỉ huy trực tiếp') ||
      text.includes('chi huy truc tiep') ||
      text.includes('chỉ huy') ||
      text.includes('tiếp đất di động') ||
      text.includes('điều 30') ||
      text.includes('bpat bổ sung của đơn vị công tác') ||
      text.includes('biện pháp an toàn bổ sung của đơn vị công tác') ||
      text.includes('biện pháp an toàn làm thêm của đơn vị công tác')
    ) {
      result.add('leader');
    }

    // 2. Kiểm tra Người Cho Phép
    // (Bao gồm: Người cho phép, thủ tục cho phép, ký cho phép, khóa phiếu, khoá phiếu, thắt tiếp đất, tiếp đất của đơn vị vận hành, trực ban, trưởng ca, Điều 31...)
    if (
      text.includes('người cho phép') ||
      text.includes('nguoi cho phep') ||
      text.includes('cho phép công tác') ||
      text.includes('thủ tục cho phép') ||
      text.includes('ký cho phép') ||
      text.includes('khóa phiếu') ||
      text.includes('khoá phiếu') ||
      text.includes('thắt tiếp đất') ||
      text.includes('tiếp đất của đơn vị vận hành') ||
      text.includes('trực ban') ||
      text.includes('trưởng ca') ||
      text.includes('điều 31')
    ) {
      result.add('approver');
    }

    // 3. Kiểm tra Người Cấp Phiếu / Người Cấp Lệnh
    // (Bao gồm: Người cấp phiếu, người cấp lệnh, cấp lệnh, cấp phiếu, kiểm tra hoàn thành phiếu...)
    if (
      text.includes('người cấp phiếu') ||
      text.includes('nguoi cap phieu') ||
      text.includes('người cấp lệnh') ||
      text.includes('nguoi cap lenh') ||
      text.includes('cấp lệnh') ||
      text.includes('cấp phiếu') ||
      text.includes('kiểm tra hoàn thành phiếu')
    ) {
      result.add('issuer');
      result.add('orderGiver');
    }

    // 4. Kiểm tra Nhân viên Đơn vị công tác (NVĐVCT / NVĐCT / Nhân viên)
    if (
      text.includes('nhân viên đct') ||
      text.includes('nhân viên đơn vị công tác') ||
      text.includes('nhân viên công tác') ||
      text.includes('nhân viên') ||
      text.includes('nvdvct') ||
      text.includes('nvđvct') ||
      text.includes('nvđct') ||
      text.includes('đơn vị công tác')
    ) {
      result.add('workers');
    }

    // 5. Kiểm tra Người Ra Lệnh trong LCT
    if (
      text.includes('người ra lệnh') ||
      text.includes('nguoi ra lenh') ||
      text.includes('ra lệnh') ||
      text.includes('nrl')
    ) {
      result.add('orderGiver');
    }

    // 6. Kiểm tra Người Giám Sát an toàn
    if (
      text.includes('giám sát an toàn') ||
      text.includes('người giám sát') ||
      text.includes('giám sát') ||
      text.includes('gsat')
    ) {
      result.add('supervisor');
    }
  });

  return result;
}

/**
 * Personal Analysis Engine:
 * Phân tích trách nhiệm dựa trên cột 'Danh sách lỗi' kết hợp với từng chức danh.
 * Thống kê theo SỐ PHIẾU, LỆNH (HỒ SƠ) VI PHẠM, không thống kê theo tổng lỗi.
 */
export function calculatePersonalAnalysis(
  records: NormalizedRecord[],
  selectedMonth: number | 'all' = 'all',
  unitFilter: string = 'all'
): PersonStat[] {
  const map = new Map<
    string,
    {
      roles: Set<string>;
      units: Set<string>;
      totalErrors: number;
      docsCount: number;
      errorDocsCount: number; // Số phiếu/lệnh vi phạm
      monthsSet: Set<number>;
      monthlyViolations: { [month: number]: number }; // Số phiếu/lệnh vi phạm theo tháng
      monthlyErrors: { [month: number]: number };
      lastErrorDate: string | null;
    }
  >();

  // Khởi tạo và ghi nhận hồ sơ cho từng nhân sự
  records.forEach((rec) => {
    const rolesInDoc: { roleKey: TrackedRoleKey; person: string; roleLabel: string }[] = [];

    const addPersonRole = (rawName: string | undefined, roleKey: TrackedRoleKey, roleLabel: string) => {
      if (!rawName || typeof rawName !== 'string') return;
      const names = rawName.split(/[,;\n\r]| và /);
      names.forEach((n) => {
        const trimmed = n.trim();
        if (
          trimmed &&
          trimmed.length >= 2 &&
          !trimmed.toLowerCase().includes('chưa rõ') &&
          !trimmed.toLowerCase().includes('không áp dụng')
        ) {
          rolesInDoc.push({ roleKey, person: trimmed, roleLabel });
        }
      });
    };

    addPersonRole(rec.issuer, 'issuer', 'Người cấp phiếu');
    addPersonRole(rec.leader, 'leader', 'Người CHTT');
    addPersonRole(rec.approver, 'approver', 'Người cho phép');
    addPersonRole(rec.workers, 'workers', 'Nhân viên ĐVCT');
    addPersonRole(rec.orderGiver, 'orderGiver', 'Người ra lệnh');
    addPersonRole(rec.supervisor, 'supervisor', 'Người giám sát AT');

    // Đăng ký nhân sự tham gia hồ sơ
    rolesInDoc.forEach(({ person, roleLabel }) => {
      if (!map.has(person)) {
        map.set(person, {
          roles: new Set<string>(),
          units: new Set<string>(),
          totalErrors: 0,
          docsCount: 0,
          errorDocsCount: 0,
          monthsSet: new Set<number>(),
          monthlyViolations: {},
          monthlyErrors: {},
          lastErrorDate: null,
        });
      }
      const pData = map.get(person)!;
      pData.roles.add(roleLabel);
      if (rec.unit) pData.units.add(rec.unit);
      pData.docsCount++;
    });

    // Nếu hồ sơ có lỗi, xác định chức danh nào thực sự chịu trách nhiệm dựa trên Danh Sách Lỗi
    const hasDocErrors = rec.result === 'Có sai sót' || rec.errorCount > 0 || rec.parsedErrors.length > 0;
    if (hasDocErrors) {
      const responsibleRoles = getResponsibleRolesFromErrors(rec.parsedErrors, rec.rawErrors);

      rolesInDoc.forEach(({ roleKey, person }) => {
        // Chỉ tính hồ sơ vi phạm cho người có chức danh liên quan đến lỗi trong Danh Sách Lỗi
        if (responsibleRoles.has(roleKey)) {
          const pData = map.get(person)!;
          pData.errorDocsCount += 1; // Tăng 1 hồ sơ (phiếu/lệnh) vi phạm
          pData.totalErrors += rec.errorCount;
          pData.monthsSet.add(rec.month);
          pData.monthlyViolations[rec.month] = (pData.monthlyViolations[rec.month] || 0) + 1;
          pData.monthlyErrors[rec.month] = (pData.monthlyErrors[rec.month] || 0) + rec.errorCount;

          if (!pData.lastErrorDate || rec.auditDate > pData.lastErrorDate) {
            pData.lastErrorDate = rec.auditDate;
          }
        }
      });
    }
  });

  const result: PersonStat[] = [];

  map.forEach((data, name) => {
    const monthsWithErrors = Array.from(data.monthsSet).sort((a, b) => a - b);
    const monthsWithErrorsCount = monthsWithErrors.length;

    // CẢNH BÁO TÍNH THEO SỐ HỒ SƠ (PHIẾU / LỆNH) VI PHẠM:
    // 1. Trong tháng: Có >= 2 phiếu/lệnh vi phạm trong 1 tháng
    let hasMonthlyAlert = false;
    if (selectedMonth !== 'all') {
      hasMonthlyAlert = (data.monthlyViolations[selectedMonth] || 0) >= 2;
    } else {
      hasMonthlyAlert = Object.values(data.monthlyViolations).some((v) => v >= 2);
    }

    // 2. Trong năm: Có phiếu/lệnh vi phạm ở >= 2 tháng khác nhau trong năm
    const hasYearlyAlert = monthsWithErrorsCount >= 2;

    // Phân loại Phân xưởng theo căn cứ chuẩn:
    // 1. Nếu có tên trong danh sách 69 nhân sự PXVH -> Phân xưởng Vận hành
    // 2. Nếu đơn vị là nhà thầu/đơn vị ngoài -> Đơn vị ngoài
    // 3. Còn lại (Người CHTT, NVĐCT...) -> Phân xưởng Sửa chữa
    const rolesArr = Array.from(data.roles);
    let workshop: Workshop = 'Phân xưởng Sửa chữa';
    const isExt = isExternalUnit(name) || Array.from(data.units).some((u) => isExternalUnit(u));

    if (isPXVHMember(name)) {
      workshop = 'Phân xưởng Vận hành';
    } else if (isExt) {
      workshop = 'Đơn vị ngoài';
    } else {
      workshop = 'Phân xưởng Sửa chữa';
    }

    result.push({
      name,
      roles: rolesArr,
      workshop,
      totalErrors: data.totalErrors,
      documentsCount: data.docsCount,
      errorDocumentsCount: data.errorDocsCount,
      monthsWithErrorsCount,
      monthsWithErrors,
      monthlyViolations: data.monthlyViolations,
      monthlyErrors: data.monthlyErrors,
      lastErrorDate: data.lastErrorDate,
      hasMonthlyAlert,
      hasYearlyAlert,
    });
  });

  // Áp dụng bộ lọc đơn vị nếu có
  let filtered = result;
  if (unitFilter && unitFilter !== 'all') {
    if (unitFilter === 'Phân xưởng Vận hành') {
      filtered = result.filter((p) => p.workshop === 'Phân xưởng Vận hành');
    } else if (unitFilter === 'Phân xưởng Sửa chữa') {
      filtered = result.filter((p) => p.workshop === 'Phân xưởng Sửa chữa');
    } else if (unitFilter === 'Đơn vị ngoài') {
      filtered = result.filter((p) => p.workshop === 'Đơn vị ngoài');
    } else if (unitFilter === 'Công ty Thủy điện Ialy') {
      filtered = result.filter((p) => p.workshop !== 'Đơn vị ngoài');
    }
  }

  // Theo quy tắc của người dùng: "ai không vi phạm thì không thống kê"
  // Chỉ lọc lấy những nhân sự có số phiếu/lệnh vi phạm (errorDocumentsCount > 0)
  const violatorsOnly = filtered.filter((p) => p.errorDocumentsCount > 0);

  // Sắp xếp theo số phiếu/lệnh vi phạm giảm dần, sau đó đến tổng số lỗi
  return violatorsOnly.sort(
    (a, b) => b.errorDocumentsCount - a.errorDocumentsCount || b.totalErrors - a.totalErrors
  );
}

/**
 * Role / Title Analysis Engine
 */
export function calculateRoleAnalysis(records: NormalizedRecord[]): RoleStat[] {
  const roles = [
    { key: 'issuer', label: 'Người cấp phiếu' },
    { key: 'leader', label: 'Người CHTT' },
    { key: 'approver', label: 'Người cho phép' },
    { key: 'workers', label: 'Nhân viên ĐVCT' },
    { key: 'orderGiver', label: 'Người ra lệnh' },
    { key: 'supervisor', label: 'Người giám sát AT' },
  ];

  const results: RoleStat[] = [];

  roles.forEach(({ key, label }) => {
    const personMap = new Map<string, { errorCount: number; docCount: number }>();
    let docCount = 0;
    let errorDocCount = 0;
    let totalErrors = 0;

    records.forEach((rec) => {
      let rawNames: string[] = [];
      if (key === 'issuer') rawNames = rec.issuer ? [rec.issuer] : [];
      else if (key === 'leader') rawNames = rec.leader ? [rec.leader] : [];
      else if (key === 'approver') rawNames = rec.approver ? [rec.approver] : [];
      else if (key === 'workers') rawNames = rec.workers ? rec.workers.split(/[,;\n\r]| và /) : [];
      else if (key === 'orderGiver') rawNames = rec.orderGiver ? [rec.orderGiver] : [];
      else if (key === 'supervisor') rawNames = rec.supervisor ? [rec.supervisor] : [];

      const validNames = rawNames
        .map((n) => n.trim())
        .filter(
          (n) =>
            n &&
            n.length >= 2 &&
            !n.toLowerCase().includes('chưa rõ') &&
            !n.toLowerCase().includes('không áp dụng')
        );

      if (validNames.length === 0) return;

      docCount++;
      const hasErrors = rec.result === 'Có sai sót' || rec.errorCount > 0;
      if (hasErrors) {
        errorDocCount++;
        totalErrors += rec.errorCount;
      }

      validNames.forEach((personName) => {
        if (!personMap.has(personName)) {
          personMap.set(personName, { errorCount: 0, docCount: 0 });
        }
        const entry = personMap.get(personName)!;
        entry.docCount++;
        if (hasErrors) {
          entry.errorCount += rec.errorCount;
        }
      });
    });

    if (docCount > 0) {
      const errorRate = docCount > 0 ? (errorDocCount / docCount) * 100 : 0;
      const errorDensity = docCount > 0 ? (totalErrors / docCount) * 100 : 0;
      const persons = Array.from(personMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.errorCount - a.errorCount);

      results.push({
        roleName: label,
        personCount: personMap.size,
        documentCount: docCount,
        errorDocumentCount: errorDocCount,
        totalErrors,
        errorRate: Math.round(errorRate * 10) / 10,
        errorDensity: Math.round(errorDensity * 10) / 10,
        persons,
      });
    }
  });

  return results;
}

/**
 * 12-Month Yearly Breakdown Engine
 */
export function calculateYearlyStatistics(records: NormalizedRecord[], targetYear: number = 2026): MonthlyBreakdown[] {
  const months: MonthlyBreakdown[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthRecords = records.filter((r) => r.year === targetYear && r.month === m);
    let pctCount = 0;
    let lctCount = 0;
    let errorDocs = 0;
    let totalErrors = 0;
    let criticalCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    monthRecords.forEach((rec) => {
      if (rec.documentType === 'PCT') pctCount++;
      if (rec.documentType === 'LCT') lctCount++;

      const hasError = rec.result === 'Có sai sót' || rec.errorCount > 0;
      if (hasError) {
        errorDocs++;
        totalErrors += rec.errorCount;
      }

      rec.parsedErrors.forEach((e) => {
        if (e.severity === 'CRITICAL') criticalCount++;
        else if (e.severity === 'WARNING') warningCount++;
        else if (e.severity === 'INFO') infoCount++;
      });
    });

    const totalDocs = monthRecords.length;
    const validDocs = totalDocs - errorDocs;
    const errorRate = totalDocs > 0 ? (errorDocs / totalDocs) * 100 : 0;
    const errorDensity = totalDocs > 0 ? (totalErrors / totalDocs) * 100 : 0;

    months.push({
      month: m,
      monthLabel: `Tháng ${m < 10 ? '0' + m : m}`,
      totalDocuments: totalDocs,
      pctCount,
      lctCount,
      errorDocuments: errorDocs,
      validDocuments: validDocs,
      totalErrors,
      errorRate: Math.round(errorRate * 10) / 10,
      errorDensity: Math.round(errorDensity * 10) / 10,
      criticalCount,
      warningCount,
      infoCount,
    });
  }

  return months;
}

/**
 * Category Breakdown Engine
 */
export function calculateCategoryBreakdown(records: NormalizedRecord[]): {
  category: ErrorCategory;
  count: number;
  percentage: number;
}[] {
  const map: Record<ErrorCategory, number> = {
    'Chữ ký & Thủ tục': 0,
    'Thời gian & Trình tự': 0,
    'Biện pháp an toàn & Tiếp địa': 0,
    'Nhân viên & Vị trí làm việc': 0,
    'Nội dung & Phạm vi công việc': 0,
    Khác: 0,
  };

  let totalParsed = 0;
  records.forEach((rec) => {
    rec.parsedErrors.forEach((err) => {
      map[err.category] = (map[err.category] || 0) + 1;
      totalParsed++;
    });
  });

  return (Object.keys(map) as ErrorCategory[]).map((cat) => ({
    category: cat,
    count: map[cat],
    percentage: totalParsed > 0 ? Math.round((map[cat] / totalParsed) * 1000) / 10 : 0,
  }));
}

/**
 * Workshop Breakdown Engine:
 * Phân xưởng Sửa chữa (PXSC): Người CHTT, Nhân viên Đội công tác (ĐCT), Người chỉ huy trực tiếp.
 * Phân xưởng Vận hành (PXVH): Người cấp phiếu, Người cho phép, Trực ban, Trưởng ca.
 */
export function calculateWorkshopAnalysis(
  records: NormalizedRecord[],
  personalStats: PersonStat[]
): WorkshopStat[] {
  let vhErrors = 0;
  let scErrors = 0;
  let vhCritical = 0;
  let scCritical = 0;
  let vhWarning = 0;
  let scWarning = 0;
  let vhInfo = 0;
  let scInfo = 0;

  const vhViolationDocs = new Set<string>();
  const scViolationDocs = new Set<string>();

  records.forEach((rec) => {
    if (rec.result === 'Có sai sót' || rec.errorCount > 0 || rec.parsedErrors.length > 0) {
      const respRoles = getResponsibleRolesFromErrors(rec.parsedErrors, rec.rawErrors);

      const hasSC = respRoles.has('leader');
      const hasVH = respRoles.has('issuer') || respRoles.has('approver');

      if (hasSC) scViolationDocs.add(rec.id);
      if (hasVH) vhViolationDocs.add(rec.id);

      rec.parsedErrors.forEach((err) => {
        const text = (err.message + ' ' + (err.ruleReference || '')).toLowerCase();
        const isSC =
          text.includes('chtt') ||
          text.includes('chỉ huy') ||
          text.includes('chi huy') ||
          text.includes('nhân viên') ||
          text.includes('đội công tác') ||
          text.includes('đct') ||
          text.includes('điều 30');

        if (isSC) {
          scErrors++;
          if (err.severity === 'CRITICAL') scCritical++;
          else if (err.severity === 'WARNING') scWarning++;
          else if (err.severity === 'INFO') scInfo++;
        } else {
          vhErrors++;
          if (err.severity === 'CRITICAL') vhCritical++;
          else if (err.severity === 'WARNING') vhWarning++;
          else if (err.severity === 'INFO') vhInfo++;
        }
      });
    }
  });

  const vhPeople = personalStats.filter(
    (p) => p.workshop === 'Phân xưởng Vận hành' || p.workshop === 'Liên phân xưởng'
  ).length;

  const scPeople = personalStats.filter(
    (p) => p.workshop === 'Phân xưởng Sửa chữa' || p.workshop === 'Liên phân xưởng'
  ).length;

  const totalErrors = Math.max(vhErrors + scErrors, 1);

  return [
    {
      workshopName: 'Phân xưởng Vận hành',
      shortName: 'PXVH',
      roles: ['Người cấp phiếu', 'Người cho phép', 'Trực ban', 'Trưởng ca'],
      totalErrors: vhErrors,
      violationDocuments: vhViolationDocs.size,
      peopleCount: vhPeople,
      criticalCount: vhCritical,
      warningCount: vhWarning,
      infoCount: vhInfo,
      errorShare: Math.round((vhErrors / totalErrors) * 100),
    },
    {
      workshopName: 'Phân xưởng Sửa chữa',
      shortName: 'PXSC',
      roles: ['Người CHTT', 'Người chỉ huy trực tiếp', 'Nhân viên ĐCT', 'Nhân viên đội công tác'],
      totalErrors: scErrors,
      violationDocuments: scViolationDocs.size,
      peopleCount: scPeople,
      criticalCount: scCritical,
      warningCount: scWarning,
      infoCount: scInfo,
      errorShare: Math.round((scErrors / totalErrors) * 100),
    },
  ];
}

export interface DetailedViolationItem {
  id: string;
  docNumber: string; // Số phiếu/lệnh (e.g. 290, 322, 295...)
  docType: 'PCT' | 'LCT';
  workType: string; // Điện, Cơ, TCNH, Thủy lực...
  content: string; // Nội dung không phù hợp
  vhialyPerson: string; // VHIALY (e.g. "Nguyễn Trung Chính" hoặc "/")
  pxscPerson: string; // PXSC (e.g. "Nguyễn Quốc Tuấn" hoặc "/")
  reason: string; // Lý do không phù hợp
}

export function extractDocNumber(code: string): string {
  if (!code) return '';
  const matchSo = code.match(/số\s*(\d+)/i);
  if (matchSo) return matchSo[1];
  const matchSlash = code.match(/^(\d+)\//);
  if (matchSlash) return matchSlash[1];
  const matchUnderscore = code.match(/^(\d+)_/);
  if (matchUnderscore) return matchUnderscore[1];
  const matchTrailingNum = code.match(/(\d+)$/);
  if (matchTrailingNum) return matchTrailingNum[1];
  const matchDigits = code.match(/(\d+)/);
  if (matchDigits) return matchDigits[1];
  return code;
}

export function detectWorkType(record: NormalizedRecord): string {
  const text = `${record.jobName} ${record.unit} ${record.code}`.toLowerCase();
  if (text.includes('tcnh') || text.includes('tự động') || text.includes('rơ le')) return 'TCNH';
  if (text.includes('thủy lực') || text.includes('van đĩa') || text.includes('dầu áp lực')) return 'Thủy lực';
  if (text.includes('máy nén khí') || text.includes('cơ nhiệt') || text.includes('cơ khí') || text.includes('thông gió')) return 'Cơ';
  return 'Điện';
}

export function getDetailedViolationList(records: NormalizedRecord[]): {
  pctViolations: DetailedViolationItem[];
  lctViolations: DetailedViolationItem[];
} {
  const pctViolations: DetailedViolationItem[] = [];
  const lctViolations: DetailedViolationItem[] = [];

  records.forEach((rec) => {
    const hasError = rec.result === 'Có sai sót' || rec.errorCount > 0 || rec.parsedErrors.length > 0;
    if (!hasError) return;

    const docNum = extractDocNumber(rec.code);
    const workType = detectWorkType(rec);

    const errorsToProcess =
      rec.parsedErrors.length > 0
        ? rec.parsedErrors
        : [
            {
              id: `raw-${rec.id}`,
              severity: 'WARNING' as const,
              message: rec.rawErrors || 'Nội dung không phù hợp',
              ruleReference: '',
              category: 'Khác' as const,
            },
          ];

    errorsToProcess.forEach((err, errIdx) => {
      const errText = `${err.message} ${err.ruleReference || ''}`.toLowerCase();

      let vhialyPerson = '/';
      let pxscPerson = '/';

      const isVH =
        errText.includes('cho phép') ||
        errText.includes('cấp phiếu') ||
        errText.includes('cấp lệnh') ||
        errText.includes('ra lệnh') ||
        errText.includes('trực ban') ||
        errText.includes('trưởng ca') ||
        errText.includes('điều 31');

      if (isVH) {
        if (errText.includes('cấp phiếu') && rec.issuer && !rec.issuer.toLowerCase().includes('chưa rõ')) {
          vhialyPerson = rec.issuer;
        } else if (
          (errText.includes('cấp lệnh') || errText.includes('ra lệnh')) &&
          rec.orderGiver &&
          !rec.orderGiver.toLowerCase().includes('chưa rõ')
        ) {
          vhialyPerson = rec.orderGiver;
        } else if (rec.approver && !rec.approver.toLowerCase().includes('chưa rõ')) {
          vhialyPerson = rec.approver;
        } else if (rec.issuer && !rec.issuer.toLowerCase().includes('chưa rõ')) {
          vhialyPerson = rec.issuer;
        }
      }

      const isSC =
        errText.includes('chtt') ||
        errText.includes('chỉ huy') ||
        errText.includes('nhân viên') ||
        errText.includes('đct') ||
        errText.includes('đội công tác') ||
        errText.includes('đơn vị công tác') ||
        errText.includes('điều 30') ||
        errText.includes('điều 14') ||
        errText.includes('tiếp đất di động');

      if (isSC) {
        if (errText.includes('nhân viên') && rec.workers && !rec.workers.toLowerCase().includes('chưa rõ')) {
          pxscPerson = rec.workers;
        } else if (rec.leader && !rec.leader.toLowerCase().includes('chưa rõ')) {
          pxscPerson = rec.leader;
        } else if (rec.workers && !rec.workers.toLowerCase().includes('chưa rõ')) {
          pxscPerson = rec.workers;
        }
      }

      // Nếu lỗi hệ thống SMIS hoặc không xác định chức danh nào
      if (!isVH && !isSC) {
        vhialyPerson = '/';
        pxscPerson = '/';
      }

      let reason = 'Theo Điều 21 tại Mẫu 4, Phụ lục 7 của Quy trình an toàn của EVN theo QĐ số 278 ngày 25/02/2026';
      if (err.ruleReference && err.ruleReference.trim().length > 3) {
        reason = err.ruleReference.startsWith('Theo')
          ? err.ruleReference
          : `Theo ${err.ruleReference} Quy trình an toàn EVN`;
      } else if (errText.includes('smis') || errText.includes('không lưu') || errText.includes('chữ ký')) {
        reason = 'Trên phần mềm SMIS bị lỗi không hiển thị chữ ký';
      }

      const item: DetailedViolationItem = {
        id: `${rec.id}-${errIdx}`,
        docNumber: docNum,
        docType: rec.documentType,
        workType,
        content: err.message,
        vhialyPerson,
        pxscPerson,
        reason,
      };

      if (rec.documentType === 'PCT') {
        pctViolations.push(item);
      } else {
        lctViolations.push(item);
      }
    });
  });

  return { pctViolations, lctViolations };
}

export const DEFAULT_RECOMMENDATIONS = [
  'Đối với các tồn tại, hư hỏng, điểm không phù hợp được phản ánh trên App dùng chung của Phân xưởng (các chức năng: An toàn vệ sinh lao động, Tồn tại - hư hỏng - điểm không phù hợp, TPM, Kaizen và các nội dung liên quan khác), đề nghị các chức danh được phân giao quản lý TPM tại khu vực, thiết bị liên quan chủ động kiểm tra, khắc phục hoặc phối hợp với các đơn vị có liên quan để xử lý kịp thời, bảo đảm không để tồn tại kéo dài.',
  'Trong quá trình thực hiện PCT/LCT, trường hợp phát sinh lỗi kỹ thuật khách quan (như lỗi phần mềm, lỗi mạng...), người thực hiện phải chủ động lưu lại bằng chứng (chụp màn hình hoặc hình ảnh liên quan), kịp thời báo cáo cấp có thẩm quyền và lưu vào mục "Hồ sơ" hoặc "File đính kèm" đối với PCT; "Ảnh tài liệu" hoặc "File tài liệu" đối với LCT; đồng thời ghi nhận trong NKVH để làm căn cứ xác định nguyên nhân khách quan khi kiểm tra, đối chiếu.',
  'Các Trưởng ca và nhân viên vận hành nghiêm túc rút kinh nghiệm; thực hiện cập nhật đầy đủ các Phiếu thao tác chép lại phục vụ thao tác phần điện/cơ lên PMIS cùng với Phiếu thao tác chính theo đúng quy định, bảo đảm hồ sơ thao tác đầy đủ và thống nhất.',
  'Trưởng ca và ATV các kíp tăng cường công tác kiểm tra, giám sát việc thực hiện PCT/LCT và các biện pháp an toàn đối với ĐCT vào làm việc; kịp thời nhắc nhở, chấn chỉnh và xử lý các sai sót nhằm nâng cao chất lượng thực hiện và hạn chế tái diễn các lỗi đã được hậu kiểm phát hiện.',
];

export function generateSmartEvaluationAndRecommendations(
  overview: StatisticsOverview,
  month?: number | 'all',
  year?: number,
  pctViolations: DetailedViolationItem[] = [],
  lctViolations: DetailedViolationItem[] = []
): string[] {
  const periodText =
    month && month !== 'all'
      ? `tháng ${month < 10 ? '0' + month : month}/${year || 2026}`
      : `năm ${year || 2026}`;

  const validRate =
    overview.totalDocuments > 0
      ? (100 - Number(overview.errorRate)).toFixed(1)
      : '100.0';

  const validDocs = Math.max(0, overview.totalDocuments - overview.documentsWithErrors);
  const totalViolations = pctViolations.length + lctViolations.length;

  // 1. Phân tích chi tiết các nhóm lỗi thực tế xuất hiện trong kỳ
  let smisCount = 0;
  let timingPermitCount = 0;
  let groundingBpatCount = 0;
  let personnelControlCount = 0;
  let generalDescriptionCount = 0;
  let vhialyResponsibleCount = 0;
  let pxscResponsibleCount = 0;

  const allViolations = [...pctViolations, ...lctViolations];
  allViolations.forEach((v) => {
    const text = `${v.content} ${v.reason || ''}`.toLowerCase();
    if (text.includes('smis') || text.includes('không hiển thị chữ ký') || text.includes('không lưu')) {
      smisCount++;
    }
    if (
      text.includes('thời gian') ||
      text.includes('trình tự') ||
      text.includes('nghịch lý') ||
      text.includes('ký trước') ||
      text.includes('khóa phiếu') ||
      text.includes('cho phép') ||
      text.includes('điều 14') ||
      text.includes('điều 28') ||
      text.includes('điều 30') ||
      text.includes('điều 31')
    ) {
      timingPermitCount++;
    }
    if (
      text.includes('tiếp đất') ||
      text.includes('tiếp địa') ||
      text.includes('biện pháp an toàn') ||
      text.includes('bpat') ||
      text.includes('điều 25')
    ) {
      groundingBpatCount++;
    }
    if (text.includes('nhân viên') || text.includes('vào/ra') || text.includes('ra vào')) {
      personnelControlCount++;
    }
    if (text.includes('chung chung') || text.includes('điều 20') || text.includes('phạm vi')) {
      generalDescriptionCount++;
    }

    if (v.vhialyPerson && v.vhialyPerson !== '/') vhialyResponsibleCount++;
    if (v.pxscPerson && v.pxscPerson !== '/') pxscResponsibleCount++;
  });

  // Đoạn 1: Đánh giá tổng quan số liệu thực hiện trong kỳ
  let para1 = '';
  if (overview.totalDocuments === 0) {
    para1 = `Trong ${periodText}, phân xưởng không phát sinh hồ sơ PCT/LCT cần hậu kiểm. Công tác quản lý hồ sơ an toàn tiếp tục được theo dõi và duy trì theo quy định.`;
  } else if (overview.documentsWithErrors === 0) {
    para1 = `Về kết quả thực hiện ${periodText}: Toàn bộ ${overview.totalDocuments} hồ sơ (${overview.totalPCT} PCT và ${overview.totalLCT} LCT) được kiểm tra đều hợp lệ 100%, không phát hiện bất kỳ sai sót nào. Các kíp trực, Trưởng ca, Người cấp phiếu, Người cho phép và các đơn vị công tác đã chấp hành nghiêm ngặt mọi quy định của Quy trình an toàn EVN.`;
  } else {
    let complianceAssessment = 'các kíp trực và nhân viên vận hành cơ bản đã tuân thủ tốt các quy định về an toàn điện.';
    if (Number(validRate) >= 95) {
      complianceAssessment = 'công tác thực hiện và kiểm soát an toàn đạt kết quả rất cao, hầu hết các hồ sơ đều hoàn thiện đầy đủ thủ tục.';
    } else if (Number(validRate) < 80) {
      complianceAssessment = 'tuy nhiên tỷ lệ sai sót còn ở mức đáng lưu ý, đòi hỏi các kíp trực và đơn vị liên quan cần nghiêm túc chấn chỉnh.';
    }
    para1 = `Về kết quả thực hiện ${periodText}: Tổng số hồ sơ được kiểm tra là ${overview.totalDocuments} hồ sơ (gồm ${overview.totalPCT} PCT và ${overview.totalLCT} LCT), trong đó có ${validDocs} hồ sơ hợp lệ (đạt tỷ lệ ${validRate}%) và ${overview.documentsWithErrors} hồ sơ phát hiện nội dung chưa phù hợp (chiếm tỷ lệ ${overview.errorRate}%). Cụ thể: Phiếu công tác có ${overview.pctWithErrors}/${overview.totalPCT} phiếu có lỗi (${overview.pctErrorRate}%); Lệnh công tác có ${overview.lctWithErrors}/${overview.totalLCT} lệnh có lỗi (${overview.lctErrorRate}%). Nhìn chung, ${complianceAssessment}`;
  }

  // Đoạn 2: Phân tích cụ thể các sai sót đặc trưng và trách nhiệm trong tháng này
  let para2 = '';
  if (totalViolations === 0) {
    para2 = `Trong kỳ kiểm tra ${periodText}, các chức danh Người cấp phiếu, Người cho phép, Người CHTT và Nhân viên các đơn vị công tác đều thực hiện đầy đủ các bước bàn giao hiện trường, các biện pháp an toàn bổ sung được tích chọn chính xác, thời gian thực hiện công tác được ghi nhận thống nhất và đồng bộ giữa các bên.`;
  } else {
    const errorHighlights: string[] = [];
    if (smisCount > 0) {
      errorHighlights.push(`lỗi hiển thị hoặc không lưu chữ ký điện tử trên phần mềm SMIS (${smisCount} lỗi)`);
    }
    if (timingPermitCount > 0) {
      errorHighlights.push(`thủ tục cho phép, nghịch lý thời gian ký trước bàn giao hoặc thiếu chữ ký kết thúc/khóa phiếu theo Điều 14, Điều 28, Điều 30, Điều 31 (${timingPermitCount} lỗi)`);
    }
    if (groundingBpatCount > 0) {
      errorHighlights.push(`bỏ trống hoặc chưa xác nhận làm thêm tiếp đất di động, biện pháp an toàn bổ sung theo Điều 25 (${groundingBpatCount} lỗi)`);
    }
    if (personnelControlCount > 0) {
      errorHighlights.push(`chưa ghi nhận đầy đủ chữ ký ra/vào vị trí làm việc của nhân viên công tác (${personnelControlCount} lỗi)`);
    }
    if (generalDescriptionCount > 0) {
      errorHighlights.push(`nội dung hoặc vị trí công việc ghi còn chung chung (${generalDescriptionCount} lỗi)`);
    }

    const detailText = errorHighlights.length > 0
      ? `Các sai sót chính tập trung ở các khâu: ${errorHighlights.join('; ')}.`
      : `Các sai sót phát hiện chủ yếu liên quan đến việc đối soát thủ tục an toàn hiện trường và ghi nhận nhật ký thao tác.`;

    const respText = (vhialyResponsibleCount > 0 || pxscResponsibleCount > 0)
      ? ` Qua đối chiếu trách nhiệm, có ${vhialyResponsibleCount} nội dung liên quan đến các chức danh thuộc Phân xưởng Vận hành (Người cấp phiếu, Người cho phép, Trực ban) và ${pxscResponsibleCount} nội dung liên quan đến Đơn vị công tác / Phân xưởng Sửa chữa (Người CHTT, Nhân viên công tác). Đề nghị các cá nhân liên quan trực tiếp rút kinh nghiệm nghiêm túc.`
      : ` Đề nghị các chức danh phụ trách hồ sơ nghiêm túc rút kinh nghiệm đối với từng điểm chưa phù hợp nêu trên.`;

    para2 = `Qua công tác rà soát ${periodText}: Phát hiện tổng cộng ${totalViolations} lỗi chưa phù hợp. ${detailText}${respText}`;
  }

  // Đoạn 3: Hướng xử lý lỗi kỹ thuật khách quan & App dùng chung (theo chỉ đạo phân xưởng)
  const para3 =
    'Đối với các tồn tại, hư hỏng, điểm không phù hợp được phản ánh trên App dùng chung của Phân xưởng (các chức năng: An toàn vệ sinh lao động, Tồn tại - hư hỏng - điểm không phù hợp, TPM, Kaizen và các nội dung liên quan khác), đề nghị các chức danh được phân giao quản lý TPM tại khu vực, thiết bị liên quan chủ động kiểm tra, khắc phục hoặc phối hợp với các đơn vị có liên quan để xử lý kịp thời, bảo đảm không để tồn tại kéo dài. Trong quá trình thực hiện PCT/LCT, trường hợp phát sinh lỗi kỹ thuật khách quan (như lỗi phần mềm SMIS, lỗi mạng...), người thực hiện phải chủ động lưu lại bằng chứng (chụp màn hình hoặc hình ảnh liên quan), kịp thời báo cáo cấp có thẩm quyền và lưu vào mục "Hồ sơ" hoặc "File đính kèm" đối với PCT; "Ảnh tài liệu" hoặc "File tài liệu" đối với LCT; đồng thời ghi nhận trong NKVH để làm căn cứ xác định nguyên nhân khách quan khi kiểm tra, đối chiếu.';

  // Đoạn 4: Trách nhiệm chấn chỉnh của Trưởng ca, nhân viên vận hành và ATV
  const para4 =
    `Các Trưởng ca và nhân viên vận hành nghiêm túc rút kinh nghiệm; thực hiện cập nhật đầy đủ các Phiếu thao tác chép lại phục vụ thao tác phần điện/cơ lên PMIS cùng với Phiếu thao tác chính theo đúng quy định, bảo đảm hồ sơ thao tác đầy đủ và thống nhất. Trưởng ca và ATV các kíp tăng cường công tác kiểm tra, giám sát việc thực hiện PCT/LCT và các biện pháp an toàn đối với ĐCT vào làm việc; kịp thời nhắc nhở, chấn chỉnh và xử lý các sai sót nhằm nâng cao chất lượng thực hiện và ngăn ngừa tái diễn các lỗi đã được hậu kiểm chỉ ra trong ${periodText}.`;

  return [para1, para2, para3, para4];
}

export function getDefaultEvaluationNotes(
  overview: StatisticsOverview,
  month?: number | 'all',
  year?: number
): string {
  const periodText =
    month && month !== 'all'
      ? `tháng ${month < 10 ? '0' + month : month}/${year || 2026}`
      : `năm ${year || 2026}`;

  const validRate =
    overview.totalDocuments > 0
      ? Math.round(((overview.totalDocuments - overview.documentsWithErrors) / overview.totalDocuments) * 1000) / 10
      : 100;

  return [
    `Qua công tác hậu kiểm ${periodText}, các đơn vị và cá nhân cơ bản đã chấp hành tốt quy trình an toàn điện. Đề nghị các cá nhân và đơn vị tiếp tục chấn chỉnh các thiếu sót nêu trên, đặc biệt là việc ghi chép đầy đủ nội dung, thời gian và biện pháp an toàn trước khi cho phép vào làm việc.`,
    `Tỷ lệ hồ sơ thực hiện đúng quy định đạt ${validRate}%. Các thiếu sót còn tồn tại chủ yếu phát sinh ở khâu kiểm tra thủ tục cho phép, ghi nhận thời gian bắt đầu/kết thúc công tác và ký ra vào vị trí làm việc của nhân viên đơn vị công tác.`,
    `Tại App dùng chung của Phân xưởng, trong các chức năng An toàn vệ sinh lao động / Tồn tại, hư hỏng, điểm không phù hợp / TPM, Kaizen, NVVH đã phản ánh và đề nghị các chức danh được phân giao TPM tại vị trí liên quan chủ động khắc phục hoặc phối hợp với các đơn vị liên quan để xử lý dứt điểm.`,
    `Trưởng ca, ATV các kíp thường xuyên kiểm tra, chấn chỉnh kịp thời các sai phạm trong việc thực hiện PCT, LCT, biện pháp an toàn cho ĐCT vào làm việc nhằm nâng cao chất lượng hồ sơ và ngăn ngừa tái diễn sai lỗi.`,
  ].join('\n\n');
}

export const AUDIT_TEAM_MEMBERS = [
  '1. Nguyễn Văn Toàn',
  '2. A Ran',
  '3. Võ Quang Minh',
  '4. Thái Trần Hoàng Vũ',
  '5. Nguyễn Hồng Quang',
  '6. Phùng Ngọc Tú',
];
