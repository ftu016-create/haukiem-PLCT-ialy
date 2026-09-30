import {
  AuditLogEntry,
  DocumentType,
  ErrorCategory,
  ErrorSeverity,
  NormalizedRecord,
  ParsedErrorItem,
  RawSheetRecord,
} from '../types';

/**
 * Normalizes text for comparison by trimming and reducing whitespace
 */
function cleanString(str: string | undefined | null): string {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Categorize safety errors based on EVN Quy trình 278 regulations & safety semantics
 */
export function categorizeError(errorText: string): ErrorCategory {
  const lower = errorText.toLowerCase();

  if (
    lower.includes('thời gian') ||
    lower.includes('nghịch lý') ||
    lower.includes('trước khi') ||
    lower.includes('trình tự') ||
    lower.includes('quá thời hạn')
  ) {
    return 'Thời gian & Trình tự';
  }

  if (
    lower.includes('tiếp đất') ||
    lower.includes('tiếp địa') ||
    lower.includes('bpat') ||
    lower.includes('biện pháp an toàn')
  ) {
    return 'Biện pháp an toàn & Tiếp địa';
  }

  if (
    lower.includes('chữ ký') ||
    lower.includes('thủ tục') ||
    lower.includes('khóa phiếu') ||
    lower.includes('hoàn thành công việc') ||
    lower.includes('điều 30') ||
    lower.includes('điều 31')
  ) {
    return 'Chữ ký & Thủ tục';
  }

  if (
    lower.includes('nhân viên') ||
    lower.includes('vị trí làm việc') ||
    lower.includes('bậc an toàn') ||
    lower.includes('điều 14') ||
    lower.includes('điều 6') ||
    lower.includes('điều 7') ||
    lower.includes('điều 12')
  ) {
    return 'Nhân viên & Vị trí làm việc';
  }

  if (
    lower.includes('phạm vi') ||
    lower.includes('chung chung') ||
    lower.includes('nội dung') ||
    lower.includes('điều 20') ||
    lower.includes('chính tả') ||
    lower.includes('đồng nhất')
  ) {
    return 'Nội dung & Phạm vi công việc';
  }

  return 'Khác';
}

/**
 * Parses raw error strings like "[CRITICAL] Thiếu chữ ký... ; [WARNING] ..."
 */
export function parseRawErrors(rawErrorsText: string): ParsedErrorItem[] {
  if (!rawErrorsText || !rawErrorsText.trim()) return [];

  const text = rawErrorsText.trim();
  // If it's a generic success message or automatic audit note
  if (
    text.toLowerCase().includes('không phát hiện lỗi') ||
    (text.toLowerCase().includes('soát hàng loạt tự động') && !text.includes('['))
  ) {
    return [];
  }

  // Split by semicolon delimiter while preserving tags
  const parts = text.split(/\s*;\s*/).filter((p) => p.trim().length > 0);
  const result: ParsedErrorItem[] = [];

  parts.forEach((part, index) => {
    let severity: ErrorSeverity = 'WARNING';
    let cleanPart = part.trim();

    if (cleanPart.toUpperCase().includes('[CRITICAL]')) {
      severity = 'CRITICAL';
      cleanPart = cleanPart.replace(/\[CRITICAL\]/gi, '').trim();
    } else if (cleanPart.toUpperCase().includes('[WARNING]')) {
      severity = 'WARNING';
      cleanPart = cleanPart.replace(/\[WARNING\]/gi, '').trim();
    } else if (cleanPart.toUpperCase().includes('[INFO]')) {
      severity = 'INFO';
      cleanPart = cleanPart.replace(/\[INFO\]/gi, '').trim();
    }

    // Extract rule reference if any: e.g. (Điều 30 Quy trình 278)
    const ruleMatch = cleanPart.match(/\((Điều[^)]+)\)/i);
    const ruleReference = ruleMatch ? ruleMatch[1].trim() : '';

    result.push({
      id: `err-${index}-${Math.random().toString(36).substring(2, 7)}`,
      severity,
      message: cleanPart,
      ruleReference,
      category: categorizeError(cleanPart),
    });
  });

  return result;
}

/**
 * Generate a rigorous canonical fingerprint for duplicate detection.
 * All 13 meaningful fields are included.
 */
export function generateCanonicalFingerprint(record: RawSheetRecord): string {
  const parts = [
    cleanString(record.code).toUpperCase(),
    cleanString(record.jobName),
    cleanString(record.inspectorName).toLowerCase(),
    cleanString(record.inspectorEmail).toLowerCase(),
    cleanString(record.unit).toLowerCase(),
    cleanString(record.issuer).toLowerCase(),
    cleanString(record.leader).toLowerCase(),
    cleanString(record.approver).toLowerCase(),
    cleanString(record.result).toLowerCase(),
    cleanString(record.safetyScore).replace('%', ''),
    cleanString(record.errorCount),
    cleanString(record.rawErrors).replace(/\s+/g, ' '),
    cleanString(record.auditDate),
  ];
  return parts.join('|||');
}

/**
 * Determines document type (PCT vs LCT)
 */
export function detectDocumentType(code: string, jobName: string, approver: string): DocumentType {
  const codeUpper = (code || '').toUpperCase();
  const approverUpper = (approver || '').toUpperCase();
  const jobUpper = (jobName || '').toUpperCase();

  if (
    approverUpper.includes('LCT') ||
    approverUpper.includes('KHÔNG ÁP DỤNG (LCT)') ||
    codeUpper.startsWith('LCT') ||
    codeUpper.includes('/LCT') ||
    jobUpper.startsWith('LỆNH CÔNG TÁC')
  ) {
    return 'LCT';
  }
  return 'PCT';
}

/**
 * Normalization Pipeline & Strict Duplicate Filtering
 */
export function processRawRecords(rawRecords: RawSheetRecord[]): {
  normalizedRecords: NormalizedRecord[];
  allParsedRecords: NormalizedRecord[]; // includes duplicate marked records for audit
  duplicatesRemovedCount: number;
  auditLogs: AuditLogEntry[];
} {
  const auditLogs: AuditLogEntry[] = [];
  const fingerprintMap = new Map<string, NormalizedRecord>();
  const codeGroups = new Map<string, NormalizedRecord[]>();
  const allParsed: NormalizedRecord[] = [];
  const uniqueRecords: NormalizedRecord[] = [];
  let duplicatesCount = 0;

  rawRecords.forEach((raw, idx) => {
    const fingerprint = generateCanonicalFingerprint(raw);
    const parsedErrors = parseRawErrors(raw.rawErrors);
    const docType = detectDocumentType(raw.code, raw.jobName, raw.approver);

    // Parse score and error count
    const scoreNum = parseFloat(raw.safetyScore.replace('%', '')) || 0;
    let countNum = parseInt(raw.errorCount, 10);
    if (isNaN(countNum)) {
      countNum = parsedErrors.length;
    }

    // Determine result
    let result: 'Có sai sót' | 'Hợp lệ' | 'Chưa xác định' = 'Chưa xác định';
    if (raw.result.includes('sai sót') || countNum > 0 || parsedErrors.length > 0) {
      result = 'Có sai sót';
    } else if (raw.result.includes('Hợp lệ') || (countNum === 0 && scoreNum >= 80)) {
      result = 'Hợp lệ';
    }

    // Parse date
    const dateStr = cleanString(raw.auditDate);
    let year = 2026;
    let month = 9;
    if (dateStr) {
      const match = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
      if (match) {
        year = parseInt(match[1], 10);
        month = parseInt(match[2], 10);
      }
    }

    // Detect anomalies
    const anomalyFlags: string[] = [];
    if (!dateStr) anomalyFlags.push('Thiếu ngày hậu kiểm');
    if (!raw.code || raw.code.includes('CHƯA XÁC ĐỊNH')) anomalyFlags.push('Mã Phiếu/Lệnh chưa xác định');
    if (raw.issuer.includes('Chưa rõ') && raw.leader.includes('Chưa rõ')) {
      anomalyFlags.push('Thiếu thông tin người cấp/chỉ huy');
    }
    if (raw.rawErrors.includes('Nghịch lý thời gian')) {
      anomalyFlags.push('Nghịch lý thời gian quy trình');
    }

    const normalized: NormalizedRecord = {
      id: `rec-${idx}-${Math.random().toString(36).substring(2, 8)}`,
      rawIndex: idx + 1,
      stt: raw.stt || String(idx + 1),
      code: raw.code || 'CHƯA XÁC ĐỊNH',
      documentType: docType,
      jobName: raw.jobName || 'Công tác theo phiếu',
      inspectorName: raw.inspectorName || 'Chưa rõ',
      inspectorEmail: raw.inspectorEmail || '',
      unit: raw.unit || 'Phân xưởng Vận hành Ialy',
      issuer: raw.issuer || 'Chưa rõ',
      leader: raw.leader || 'Chưa rõ',
      approver: raw.approver || 'Chưa rõ',
      result,
      safetyScore: scoreNum,
      errorCount: countNum,
      rawErrors: raw.rawErrors || '',
      parsedErrors,
      auditDate: dateStr || '2026-09-30',
      year,
      month,
      canonicalFingerprint: fingerprint,
      isDuplicate: false,
      anomalyFlags,
    };

    allParsed.push(normalized);

    // DUPLICATE DETECTION LOGIC:
    // Only remove if CANONICAL FINGERPRINT is completely identical!
    if (fingerprintMap.has(fingerprint)) {
      // Exactly identical record found -> mark as duplicate & drop from active dataset
      const original = fingerprintMap.get(fingerprint)!;
      normalized.isDuplicate = true;
      normalized.duplicateOfIndex = original.rawIndex;
      duplicatesCount++;

      auditLogs.push({
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        action: 'DUPLICATE_REMOVED',
        title: `Loại bỏ bản ghi trùng hoàn toàn (Dòng ${normalized.rawIndex})`,
        details: `Phát hiện bản ghi trùng 100% với Dòng ${original.rawIndex}. Mã: [${normalized.code}]. Đã giữ lại 1 bản ghi duy nhất.`,
        code: normalized.code,
        fingerprint,
      });
    } else {
      // First appearance of this fingerprint -> keep
      fingerprintMap.set(fingerprint, normalized);
      uniqueRecords.push(normalized);

      // Track code groups to identify "Same code but different data"
      const cleanCode = normalized.code.toUpperCase();
      if (!codeGroups.has(cleanCode)) {
        codeGroups.set(cleanCode, []);
      }
      codeGroups.get(cleanCode)!.push(normalized);
    }
  });

  // Verify and mark records that share the same code but have different data
  codeGroups.forEach((records, codeKey) => {
    if (records.length > 1 && codeKey !== 'CHƯA XÁC ĐỊNH SỐ PCT') {
      records.forEach((r) => {
        r.hasSameCodeDiffData = true;
      });

      auditLogs.push({
        id: `aud-diff-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        action: 'SAME_CODE_KEPT',
        title: `Bảo lưu dữ liệu cùng mã: ${codeKey}`,
        details: `Có ${records.length} bản ghi cùng mã [${codeKey}] nhưng khác dữ liệu (nội dung, lỗi hoặc ngày). Hệ thống GIỮ NGUYÊN toàn bộ để bảo toàn dữ liệu nghiệp vụ.`,
        code: codeKey,
        count: records.length,
      });
    }
  });

  return {
    normalizedRecords: uniqueRecords,
    allParsedRecords: allParsed,
    duplicatesRemovedCount: duplicatesCount,
    auditLogs,
  };
}
