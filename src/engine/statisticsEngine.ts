import {
  ErrorCategory,
  FilterState,
  MonthlyBreakdown,
  NormalizedRecord,
  PersonStat,
  RoleStat,
  StatisticsOverview,
} from '../types';

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

    // Unit filter
    if (filters.unit && filters.unit !== 'all') {
      if (!rec.unit.toLowerCase().includes(filters.unit.toLowerCase())) {
        return false;
      }
    }

    // Status filter
    if (filters.statusFilter === 'error_only' && rec.result !== 'Có sai sót') {
      return false;
    }
    if (filters.statusFilter === 'valid_only' && rec.result !== 'Hợp lệ') {
      return false;
    }

    // Severity filter
    if (filters.severity !== 'all') {
      const hasSev = rec.parsedErrors.some((e) => e.severity === filters.severity);
      if (!hasSev) return false;
    }

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

      // Track responsible personnel for documents with errors
      [rec.issuer, rec.leader, rec.approver].forEach((p) => {
        if (p && !p.includes('Chưa rõ') && !p.includes('Không áp dụng')) {
          peopleWithErrorsSet.add(p.trim());
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

/**
 * Phân tích danh sách lỗi để xác định chính xác chức danh nào vi phạm quy trình.
 * Roles: 'issuer' (Người cấp phiếu), 'leader' (Người CHTT), 'approver' (Người cho phép).
 */
export function getResponsibleRolesFromErrors(
  parsedErrors: NormalizedRecord['parsedErrors'],
  rawErrors: string
): Set<'issuer' | 'leader' | 'approver'> {
  const result = new Set<'issuer' | 'leader' | 'approver'>();

  if (
    parsedErrors.length === 0 &&
    (!rawErrors ||
      rawErrors.toLowerCase().includes('không phát hiện lỗi') ||
      rawErrors.toLowerCase().includes('hợp lệ'))
  ) {
    return result;
  }

  parsedErrors.forEach((err) => {
    const text = (err.message + ' ' + (err.ruleReference || '')).toLowerCase();
    let matched = false;

    // 1. Kiểm tra Người CHTT / Chỉ huy trực tiếp
    if (
      text.includes('chtt') ||
      text.includes('chỉ huy trực tiếp') ||
      text.includes('chi huy truc tiep') ||
      text.includes('đơn vị công tác') ||
      text.includes('nhân viên') ||
      text.includes('vị trí làm việc') ||
      text.includes('tiếp đất di động') ||
      text.includes('điều 30 quy trình 278') || // Hoàn thành công việc của CHTT
      text.includes('bpat bổ sung') ||
      text.includes('biện pháp an toàn bổ sung của đơn vị công tác')
    ) {
      result.add('leader');
      matched = true;
    }

    // 2. Kiểm tra Người Cho Phép
    if (
      text.includes('người cho phép') ||
      text.includes('nguoi cho phep') ||
      text.includes('khóa phiếu') ||
      text.includes('điều 31 quy trình 278') || // Khóa phiếu của Người cho phép
      text.includes('tiếp đất của đơn vị vận hành') ||
      text.includes('thắt tiếp đất') ||
      text.includes('trực ban') ||
      text.includes('trưởng ca')
    ) {
      result.add('approver');
      matched = true;
    }

    // 3. Kiểm tra Người Cấp Phiếu
    if (
      text.includes('người cấp phiếu') ||
      text.includes('nguoi cap phieu') ||
      text.includes('cấp phiếu') ||
      text.includes('kiểm tra hoàn thành phiếu')
    ) {
      result.add('issuer');
      matched = true;
    }

    // 4. Các lỗi nghịch lý thời gian hoặc quy trình liên đới 2 bên
    if (
      text.includes('nghịch lý thời gian') ||
      (text.includes('cho phép ký trước') && text.includes('cấp phiếu'))
    ) {
      result.add('approver');
      result.add('issuer');
      matched = true;
    }

    if (
      text.includes('cho bắt đầu làm việc trước khi') ||
      (text.includes('chỉ huy trực tiếp') && text.includes('bàn giao'))
    ) {
      result.add('leader');
      result.add('approver');
      matched = true;
    }

    // 5. Nếu lỗi chung về chức danh / bậc an toàn hoặc undefined
    if (!matched) {
      if (text.includes('bậc an toàn điện của các chức danh')) {
        result.add('issuer');
        result.add('leader');
        result.add('approver');
      } else {
        result.add('leader');
        result.add('approver');
        result.add('issuer');
      }
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
  selectedMonth: number | 'all' = 'all'
): PersonStat[] {
  const map = new Map<
    string,
    {
      roles: Set<string>;
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
    const rolesInDoc: { roleKey: 'issuer' | 'leader' | 'approver'; person: string; roleLabel: string }[] = [];

    if (rec.issuer && !rec.issuer.includes('Chưa rõ')) {
      rolesInDoc.push({ roleKey: 'issuer', person: rec.issuer.trim(), roleLabel: 'Người cấp phiếu' });
    }
    if (rec.leader && !rec.leader.includes('Chưa rõ')) {
      rolesInDoc.push({ roleKey: 'leader', person: rec.leader.trim(), roleLabel: 'Người CHTT' });
    }
    if (rec.approver && !rec.approver.includes('Chưa rõ') && !rec.approver.includes('Không áp dụng')) {
      rolesInDoc.push({ roleKey: 'approver', person: rec.approver.trim(), roleLabel: 'Người cho phép' });
    }

    // Đăng ký nhân sự tham gia hồ sơ
    rolesInDoc.forEach(({ person, roleLabel }) => {
      if (!map.has(person)) {
        map.set(person, {
          roles: new Set<string>(),
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

    result.push({
      name,
      roles: Array.from(data.roles),
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

  // Sắp xếp theo số phiếu/lệnh vi phạm giảm dần, sau đó đến số hồ sơ tham gia
  return result.sort(
    (a, b) => b.errorDocumentsCount - a.errorDocumentsCount || b.documentsCount - a.documentsCount
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
  ];

  return roles.map(({ key, label }) => {
    const personMap = new Map<string, { errorCount: number; docCount: number }>();
    let docCount = 0;
    let errorDocCount = 0;
    let totalErrors = 0;

    records.forEach((rec) => {
      let personName = '';
      if (key === 'issuer') personName = rec.issuer;
      else if (key === 'leader') personName = rec.leader;
      else if (key === 'approver') personName = rec.approver;

      if (!personName || personName.includes('Chưa rõ') || personName.includes('Không áp dụng')) {
        return;
      }

      personName = personName.trim();
      docCount++;
      const hasErrors = rec.result === 'Có sai sót' || rec.errorCount > 0;
      if (hasErrors) {
        errorDocCount++;
        totalErrors += rec.errorCount;
      }

      if (!personMap.has(personName)) {
        personMap.set(personName, { errorCount: 0, docCount: 0 });
      }
      const entry = personMap.get(personName)!;
      entry.docCount++;
      if (hasErrors) {
        entry.errorCount += rec.errorCount;
      }
    });

    const errorRate = docCount > 0 ? (errorDocCount / docCount) * 100 : 0;
    const errorDensity = docCount > 0 ? (totalErrors / docCount) * 100 : 0;

    const persons = Array.from(personMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.errorCount - a.errorCount);

    return {
      roleName: label,
      personCount: personMap.size,
      documentCount: docCount,
      errorDocumentCount: errorDocCount,
      totalErrors,
      errorRate: Math.round(errorRate * 10) / 10,
      errorDensity: Math.round(errorDensity * 10) / 10,
      persons,
    };
  });
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
