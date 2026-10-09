import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  FileCheck,
  Printer,
  Search,
  X,
  AlertTriangle,
  BarChart3,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Plus,
  Trash2,
  RotateCcw,
  UserPlus,
  Sparkles,
  Lock,
  Unlock,
  ShieldCheck,
  BookOpen,
  Check,
  Copy,
  Upload,
  Image as ImageIcon,
  Users,
  PenTool,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  AuditLogEntry,
  FilterState,
  MonthlyBreakdown,
  NormalizedRecord,
  PersonStat,
  RoleStat,
  StatisticsOverview,
  UserRole,
} from '../types';
import {
  calculateOverview,
  calculateWorkshopAnalysis,
  getDetailedViolationList,
  extractDocNumber,
  DEFAULT_RECOMMENDATIONS,
  SUGGESTED_RECOMMENDATIONS_LIST,
  SuggestionItem,
  generateSmartEvaluationAndRecommendations,
  getDefaultEvaluationNotes,
  AUDIT_TEAM_MEMBERS,
} from '../engine/statisticsEngine';
import { exportToWord, triggerPrintReport } from '../utils/exportService';
import {
  getMemberSignatureSvg,
  saveCustomMemberSignature,
  resetCustomMemberSignature,
  hasCustomSignature,
} from '../utils/signatureService';
import { SignatureModal } from './SignatureModal';

interface ReportViewProps {
  overview: StatisticsOverview;
  records: NormalizedRecord[];
  allParsedRecords: NormalizedRecord[];
  personalStats: PersonStat[];
  roleStats: RoleStat[];
  monthlyStats: MonthlyBreakdown[];
  filters: FilterState;
  onChangeFilters?: React.Dispatch<React.SetStateAction<FilterState>>;
  auditLogs?: AuditLogEntry[];
  role?: UserRole;
  onChangeRole?: (newRole: UserRole) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  overview,
  records,
  allParsedRecords,
  personalStats,
  roleStats,
  monthlyStats,
  filters,
  onChangeFilters,
  role = 'VIEWER',
  onChangeRole,
}) => {
  const [reportType, setReportType] = useState<'month' | 'year'>(
    filters.month === 'all' ? 'year' : 'month'
  );
  const [reportMonth, setReportMonth] = useState<number>(
    filters.month === 'all' ? 8 : filters.month
  );
  const [reportYear, setReportYear] = useState<number>(
    filters.year === 'all' ? 2026 : filters.year
  );

  // Quyền truy cập: Admin mới được chỉnh sửa, Khách chỉ xem
  const isAdmin = role === 'ADMIN';
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');

  const handleVerifyAdmin = () => {
    const currentPin = localStorage.getItem('ialy_admin_pin') || 'ialy2026';
    if (adminPinInput === currentPin) {
      onChangeRole?.('ADMIN');
      setShowAdminModal(false);
      setAdminPinInput('');
      setAdminPinError('');
    } else {
      setAdminPinError('Mật khẩu không chính xác');
    }
  };

  // Khóa định danh kỳ báo cáo (để lưu và đồng bộ đánh giá riêng cho từng tháng)
  const periodKey = `${reportType}_${reportType === 'month' ? reportMonth : 'all'}_${reportYear}`;

  // Ngày lập báo cáo (Gia Lai, ngày ... tháng ... năm ...)
  const [docDay, setDocDay] = useState<string>(() => {
    return localStorage.getItem('ialy_report_doc_day') || '';
  });
  const [docMonth, setDocMonth] = useState<string>(() => {
    return localStorage.getItem('ialy_report_doc_month') || '';
  });
  const [docYear, setDocYear] = useState<string>(() => {
    return localStorage.getItem('ialy_report_doc_year') || '2026';
  });

  const handleUpdateDocDate = (type: 'day' | 'month' | 'year', val: string) => {
    if (type === 'day') {
      setDocDay(val);
      try {
        localStorage.setItem('ialy_report_doc_day', val);
      } catch (e) {}
    } else if (type === 'month') {
      setDocMonth(val);
      try {
        localStorage.setItem('ialy_report_doc_month', val);
      } catch (e) {}
    } else if (type === 'year') {
      setDocYear(val);
      try {
        localStorage.setItem('ialy_report_doc_year', val);
      } catch (e) {}
    }
  };

  const handleSetToday = () => {
    const today = new Date();
    const d = today.getDate().toString();
    const m = (today.getMonth() + 1).toString();
    const y = today.getFullYear().toString();
    setDocDay(d);
    setDocMonth(m);
    setDocYear(y);
    try {
      localStorage.setItem('ialy_report_doc_day', d);
      localStorage.setItem('ialy_report_doc_month', m);
      localStorage.setItem('ialy_report_doc_year', y);
    } catch (e) {}
  };

  const formattedDocDate = useMemo(() => {
    const dTrim = docDay.trim();
    const mTrim = docMonth.trim();
    const yTrim = docYear.trim();
    const dText = dTrim ? (dTrim.length === 1 ? '0' + dTrim : dTrim) : '.....';
    const mText = mTrim ? (mTrim.length === 1 ? '0' + mTrim : mTrim) : '.....';
    const yText = yTrim || '202...';
    return `Gia Lai, ngày ${dText} tháng ${mText} năm ${yText}`;
  }, [docDay, docMonth, docYear]);

  // Modal danh sách gợi ý nội dung kiến nghị
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [suggestionInsertedId, setSuggestionInsertedId] = useState<string | null>(null);

  const handleInsertSuggestion = (content: string, id: string) => {
    setRecommendations((prev) => {
      if (prev.includes(content)) return prev;
      const updated = [...prev, content];
      try {
        localStorage.setItem(`ialy_report_recs_${periodKey}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setSuggestionInsertedId(id);
    setTimeout(() => setSuggestionInsertedId(null), 2500);
  };

  const handleApplyAllDefaultSuggestions = () => {
    setRecommendations(DEFAULT_RECOMMENDATIONS);
    try {
      localStorage.setItem(`ialy_report_recs_${periodKey}`, JSON.stringify(DEFAULT_RECOMMENDATIONS));
    } catch (e) {}
    setShowSuggestionsModal(false);
  };

  // Lọc chính xác danh sách hồ sơ thuộc kỳ báo cáo Tháng / Năm đang chọn
  const activePeriodRecords = useMemo(() => {
    return allParsedRecords.filter((r) => {
      const yearMatch = r.year === reportYear;
      const monthMatch = reportType === 'year' || r.month === reportMonth;
      return yearMatch && monthMatch;
    });
  }, [allParsedRecords, reportType, reportMonth, reportYear]);

  // Tổng hợp số liệu KPI riêng cho kỳ/tháng đang chọn
  const activePeriodOverview = useMemo(() => {
    return calculateOverview(activePeriodRecords);
  }, [activePeriodRecords]);

  // Trích xuất chi tiết các nội dung không phù hợp của kỳ/tháng đang chọn
  const { pctViolations, lctViolations } = useMemo(
    () => getDetailedViolationList(activePeriodRecords),
    [activePeriodRecords]
  );

  // Danh sách kiến nghị Mục III: Khởi tạo riêng cho từng tháng theo số liệu hậu kiểm thực tế
  const [recommendations, setRecommendations] = useState<string[]>(() => {
    const key = `${reportType}_${reportType === 'month' ? reportMonth : 'all'}_${reportYear}`;
    try {
      const saved = localStorage.getItem(`ialy_report_recs_${key}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return generateSmartEvaluationAndRecommendations(
      activePeriodOverview,
      reportType === 'month' ? reportMonth : 'all',
      reportYear,
      pctViolations,
      lctViolations
    );
  });

  // Tự động chuyển đổi hoặc sinh nội dung đánh giá phù hợp tương ứng với từng tháng được chọn
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ialy_report_recs_${periodKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecommendations(parsed);
          return;
        }
      }
    } catch (e) {}

    const autoRecs = generateSmartEvaluationAndRecommendations(
      activePeriodOverview,
      reportType === 'month' ? reportMonth : 'all',
      reportYear,
      pctViolations,
      lctViolations
    );
    setRecommendations(autoRecs);
  }, [periodKey, activePeriodOverview, pctViolations, lctViolations, reportType, reportMonth, reportYear]);

  const handleUpdateRecommendation = (idx: number, val: string) => {
    setRecommendations((prev) => {
      const updated = [...prev];
      updated[idx] = val;
      try {
        localStorage.setItem(`ialy_report_recs_${periodKey}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleAddRecommendation = () => {
    setRecommendations((prev) => {
      const updated = [...prev, ''];
      try {
        localStorage.setItem(`ialy_report_recs_${periodKey}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleDeleteRecommendation = (idx: number) => {
    setRecommendations((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      try {
        localStorage.setItem(`ialy_report_recs_${periodKey}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleResetRecommendations = () => {
    setRecommendations(DEFAULT_RECOMMENDATIONS);
    try {
      localStorage.setItem(`ialy_report_recs_${periodKey}`, JSON.stringify(DEFAULT_RECOMMENDATIONS));
    } catch (e) {}
  };

  const handleSmartGenerateRecommendations = () => {
    const smart = generateSmartEvaluationAndRecommendations(
      activePeriodOverview,
      reportType === 'month' ? reportMonth : 'all',
      reportYear,
      pctViolations,
      lctViolations
    );
    setRecommendations(smart);
    try {
      localStorage.setItem(`ialy_report_recs_${periodKey}`, JSON.stringify(smart));
    } catch (e) {}
  };

  // Danh sách thành viên tham gia hậu kiểm (Có thể thêm, xóa thành viên linh hoạt)
  const DEFAULT_MEMBERS = [
    'Nguyễn Văn Toàn',
    'A Ran',
    'Võ Quang Minh',
    'Thái Trần Hoàng Vũ',
    'Nguyễn Hồng Quang',
    'Phùng Ngọc Tú',
  ];

  const [auditMembers, setAuditMembers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ialy_audit_members_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_MEMBERS;
  });

  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = () => {
    const trimmed = newMemberName.trim();
    if (!trimmed) return;
    setAuditMembers((prev) => {
      const updated = [...prev, trimmed];
      try {
        localStorage.setItem('ialy_audit_members_v4', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setNewMemberName('');
  };

  const handleDeleteMember = (idx: number) => {
    setAuditMembers((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      try {
        localStorage.setItem('ialy_audit_members_v4', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleResetMembers = () => {
    setAuditMembers(DEFAULT_MEMBERS);
    try {
      localStorage.setItem('ialy_audit_members_v4', JSON.stringify(DEFAULT_MEMBERS));
    } catch (e) {}
  };

  // Quản lý trạng thái chèn chữ ký cho từng thành viên và Trưởng nhóm
  const [signedMembers, setSignedMembers] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('ialy_signed_members_map');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    const initial: Record<string, boolean> = {};
    DEFAULT_MEMBERS.forEach((m) => {
      initial[m] = true;
    });
    return initial;
  });

  const [isLeaderSigned, setIsLeaderSigned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ialy_leader_signed');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return true;
  });

  const handleToggleMemberSign = (name: string) => {
    if (!isAdmin) return;
    setSignedMembers((prev) => {
      const updated = { ...prev, [name]: prev[name] === false ? true : false };
      try {
        localStorage.setItem('ialy_signed_members_map', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleToggleLeaderSign = () => {
    if (!isAdmin) return;
    setIsLeaderSigned((prev) => {
      const updated = !prev;
      try {
        localStorage.setItem('ialy_leader_signed', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Modal Quản lý & Tải / Vẽ chữ ký
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [sigModalTarget, setSigModalTarget] = useState<string | null>(null);
  const [, setSigVersion] = useState(0);

  const handleOpenSignatureModal = (targetName?: string) => {
    if (!isAdmin) return;
    setSigModalTarget(targetName || null);
    setShowSignatureModal(true);
  };

  const handleSignatureUpdated = (personName: string) => {
    setSigVersion((v) => v + 1);
    if (personName.toLowerCase().includes('chương')) {
      setIsLeaderSigned(true);
      try {
        localStorage.setItem('ialy_leader_signed', JSON.stringify(true));
      } catch (e) {}
    } else {
      setSignedMembers((prev) => {
        const updated = { ...prev, [personName]: true };
        try {
          localStorage.setItem('ialy_signed_members_map', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  };

  const handleSelectAllMembers = (selected: boolean) => {
    if (!isAdmin) return;
    setSignedMembers((prev) => {
      const updated = { ...prev };
      auditMembers.forEach((m) => {
        updated[m] = selected;
      });
      try {
        localStorage.setItem('ialy_signed_members_map', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Xử lý tải ảnh chữ ký cá nhân lên
  const handleUploadMemberSignature = (name: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        await saveCustomMemberSignature(name, dataUrl);
        setSigVersion((v) => v + 1);
        setSignedMembers((prev) => ({ ...prev, [name]: true }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Xử lý tải ảnh chữ ký Trưởng nhóm
  const handleUploadLeaderSignature = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        await saveCustomMemberSignature('Trần Thanh Chương', dataUrl);
        setSigVersion((v) => v + 1);
        setIsLeaderSigned(true);
        try {
          localStorage.setItem('ialy_leader_signed', JSON.stringify(true));
        } catch (err) {}
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetLeaderSignature = () => {
    resetCustomMemberSignature('Trần Thanh Chương');
    setSigVersion((v) => v + 1);
  };

  const handleResetMemberSignature = (memberName: string) => {
    resetCustomMemberSignature(memberName);
    setSigVersion((v) => v + 1);
  };

  // Modal xem chi tiết danh sách phiếu/lệnh lỗi khi nhấp vào cột biểu đồ hoặc thẻ phân xưởng
  const [drilldownType, setDrilldownType] = useState<
    'PCT' | 'LCT' | 'ALL' | 'PXVH_PERSONNEL' | 'PXSC_PERSONNEL' | 'PXVH_DOCS' | 'PXSC_DOCS' | null
  >(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

  const workshopStats = calculateWorkshopAnalysis(activePeriodRecords, personalStats);

  // 1. Phân loại danh sách Phiếu công tác (PCT)
  const pctList = useMemo(() => activePeriodRecords.filter((r) => r.documentType === 'PCT'), [activePeriodRecords]);
  const pctErrorList = useMemo(
    () =>
      pctList.filter(
        (r) => r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0
      ),
    [pctList]
  );
  // Phần trăm không lấy số sau dấu phẩy (ví dụ 49% không hiện 00)
  const pctErrorRate = pctList.length > 0 ? Math.round((pctErrorList.length / pctList.length) * 100) : 0;

  // 2. Phân loại danh sách Lệnh công tác (LCT)
  const lctList = useMemo(() => activePeriodRecords.filter((r) => r.documentType === 'LCT'), [activePeriodRecords]);
  const lctErrorList = useMemo(
    () =>
      lctList.filter(
        (r) => r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0
      ),
    [lctList]
  );
  const lctErrorRate = lctList.length > 0 ? Math.round((lctErrorList.length / lctList.length) * 100) : 0;

  // 3. Tổng hợp Phiếu + Lệnh công tác
  const totalDocsList = activePeriodRecords;
  const totalErrorList = useMemo(
    () =>
      totalDocsList.filter(
        (r) => r.result === 'Có sai sót' || r.errorCount > 0 || r.parsedErrors.length > 0
      ),
    [totalDocsList]
  );
  const totalErrorRate = totalDocsList.length > 0 ? Math.round((totalErrorList.length / totalDocsList.length) * 100) : 0;

  // 4. Thống kê số người và tỷ lệ vi phạm của Phân xưởng Vận hành (PXVH) và Phân xưởng Sửa chữa (PXSC)
  const { vhPersonsSet, scPersonsSet, vhViolationCount, scViolationCount, vhDocsCount, scDocsCount, vhPercentage, scPercentage } = useMemo(() => {
    const allViols = [...pctViolations, ...lctViolations];
    const vhSet = new Set<string>();
    const scSet = new Set<string>();
    const vhDocs = new Set<string>();
    const scDocs = new Set<string>();
    let vhCount = 0;
    let scCount = 0;

    allViols.forEach((v) => {
      if (v.vhialyPerson && v.vhialyPerson !== '/' && !v.vhialyPerson.toLowerCase().includes('chưa rõ')) {
        vhSet.add(v.vhialyPerson);
        vhCount++;
        vhDocs.add(v.docNumber);
      }
      if (v.pxscPerson && v.pxscPerson !== '/' && !v.pxscPerson.toLowerCase().includes('chưa rõ')) {
        scSet.add(v.pxscPerson);
        scCount++;
        scDocs.add(v.docNumber);
      }
    });

    const totalWorkshopViols = Math.max(vhCount + scCount, 1);
    const vhPct = Math.round((vhCount / totalWorkshopViols) * 100);
    const scPct = 100 - vhPct;

    return {
      vhPersonsSet: vhSet,
      scPersonsSet: scSet,
      vhViolationCount: vhCount,
      scViolationCount: scCount,
      vhDocsCount: vhDocs.size,
      scDocsCount: scDocs.size,
      vhPercentage: vhPct,
      scPercentage: scPct,
    };
  }, [pctViolations, lctViolations]);

  // Dữ liệu chi tiết phục vụ Drilldown xem danh sách Nhân sự & Phiếu vi phạm của từng Phân xưởng
  const { vhPersonnelList, scPersonnelList, vhDocList, scDocList } = useMemo(() => {
    const allViols = [...pctViolations, ...lctViolations];

    const vhPersonMap = new Map<string, {
      name: string;
      role: string;
      unit: string;
      violationCount: number;
      docs: Array<{
        docNumber: string;
        docType: 'PCT' | 'LCT';
        code: string;
        jobName: string;
        date: string;
        content: string;
        reason: string;
      }>;
    }>();

    const vhDocMap = new Map<string, {
      docNumber: string;
      docType: 'PCT' | 'LCT';
      code: string;
      jobName: string;
      unit: string;
      date: string;
      issuer: string;
      approver: string;
      leader: string;
      violations: Array<{
        person: string;
        content: string;
        reason: string;
      }>;
    }>();

    const scPersonMap = new Map<string, {
      name: string;
      role: string;
      unit: string;
      violationCount: number;
      docs: Array<{
        docNumber: string;
        docType: 'PCT' | 'LCT';
        code: string;
        jobName: string;
        date: string;
        content: string;
        reason: string;
      }>;
    }>();

    const scDocMap = new Map<string, {
      docNumber: string;
      docType: 'PCT' | 'LCT';
      code: string;
      jobName: string;
      unit: string;
      date: string;
      leader: string;
      workers: string;
      issuer: string;
      violations: Array<{
        person: string;
        content: string;
        reason: string;
      }>;
    }>();

    allViols.forEach((v) => {
      const rec = activePeriodRecords.find(
        (r) => extractDocNumber(r.code) === v.docNumber && r.documentType === v.docType
      ) || activePeriodRecords.find((r) => r.code.includes(v.docNumber));

      const code = rec?.code || `${v.docType} #${v.docNumber}`;
      const jobName = rec?.jobName || 'Công tác tại nhà máy Thủy điện Ialy';
      const date = rec?.auditDate || `Tháng ${reportMonth}/${reportYear}`;
      const unit = rec?.unit || 'Công ty Thủy điện Ialy';

      // Xử lý PXVH
      if (v.vhialyPerson && v.vhialyPerson !== '/' && !v.vhialyPerson.toLowerCase().includes('chưa rõ')) {
        const pName = v.vhialyPerson.trim();
        let role = 'Cán bộ Vận hành';
        if (rec) {
          if (rec.issuer === pName) role = 'Người cấp phiếu';
          else if (rec.approver === pName) role = 'Người cho phép';
          else if (rec.orderGiver === pName) role = 'Người ra lệnh';
        }

        if (!vhPersonMap.has(pName)) {
          vhPersonMap.set(pName, {
            name: pName,
            role,
            unit: 'Phân xưởng Vận hành (PXVH)',
            violationCount: 0,
            docs: [],
          });
        }
        const pObj = vhPersonMap.get(pName)!;
        pObj.violationCount += 1;
        pObj.docs.push({
          docNumber: v.docNumber,
          docType: v.docType,
          code,
          jobName,
          date,
          content: v.content,
          reason: v.reason,
        });

        // Document map
        if (!vhDocMap.has(v.docNumber)) {
          vhDocMap.set(v.docNumber, {
            docNumber: v.docNumber,
            docType: v.docType,
            code,
            jobName,
            unit,
            date,
            issuer: rec?.issuer || '',
            approver: rec?.approver || '',
            leader: rec?.leader || '',
            violations: [],
          });
        }
        vhDocMap.get(v.docNumber)!.violations.push({
          person: pName,
          content: v.content,
          reason: v.reason,
        });
      }

      // Xử lý PXSC
      if (v.pxscPerson && v.pxscPerson !== '/' && !v.pxscPerson.toLowerCase().includes('chưa rõ')) {
        const pName = v.pxscPerson.trim();
        let role = 'Cán bộ Sửa chữa';
        if (rec) {
          if (rec.leader === pName) role = 'Người chỉ huy trực tiếp (CHTT)';
          else if (rec.workers?.includes(pName)) role = 'Nhân viên Đơn vị công tác';
        }

        if (!scPersonMap.has(pName)) {
          scPersonMap.set(pName, {
            name: pName,
            role,
            unit: 'Phân xưởng Sửa chữa (PXSC)',
            violationCount: 0,
            docs: [],
          });
        }
        const pObj = scPersonMap.get(pName)!;
        pObj.violationCount += 1;
        pObj.docs.push({
          docNumber: v.docNumber,
          docType: v.docType,
          code,
          jobName,
          date,
          content: v.content,
          reason: v.reason,
        });

        // Document map
        if (!scDocMap.has(v.docNumber)) {
          scDocMap.set(v.docNumber, {
            docNumber: v.docNumber,
            docType: v.docType,
            code,
            jobName,
            unit,
            date,
            leader: rec?.leader || '',
            workers: rec?.workers || '',
            issuer: rec?.issuer || '',
            violations: [],
          });
        }
        scDocMap.get(v.docNumber)!.violations.push({
          person: pName,
          content: v.content,
          reason: v.reason,
        });
      }
    });

    return {
      vhPersonnelList: Array.from(vhPersonMap.values()),
      scPersonnelList: Array.from(scPersonMap.values()),
      vhDocList: Array.from(vhDocMap.values()),
      scDocList: Array.from(scDocMap.values()),
    };
  }, [pctViolations, lctViolations, activePeriodRecords, reportMonth, reportYear]);

  const filteredVhPersonnel = useMemo(() => {
    if (!modalSearchTerm.trim()) return vhPersonnelList;
    const q = modalSearchTerm.toLowerCase().trim();
    return vhPersonnelList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.docs.some((d) => d.code.toLowerCase().includes(q) || d.content.toLowerCase().includes(q))
    );
  }, [vhPersonnelList, modalSearchTerm]);

  const filteredScPersonnel = useMemo(() => {
    if (!modalSearchTerm.trim()) return scPersonnelList;
    const q = modalSearchTerm.toLowerCase().trim();
    return scPersonnelList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.docs.some((d) => d.code.toLowerCase().includes(q) || d.content.toLowerCase().includes(q))
    );
  }, [scPersonnelList, modalSearchTerm]);

  const filteredVhDocs = useMemo(() => {
    if (!modalSearchTerm.trim()) return vhDocList;
    const q = modalSearchTerm.toLowerCase().trim();
    return vhDocList.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.jobName.toLowerCase().includes(q) ||
        d.issuer.toLowerCase().includes(q) ||
        d.approver.toLowerCase().includes(q) ||
        d.violations.some((v) => v.content.toLowerCase().includes(q) || v.person.toLowerCase().includes(q))
    );
  }, [vhDocList, modalSearchTerm]);

  const filteredScDocs = useMemo(() => {
    if (!modalSearchTerm.trim()) return scDocList;
    const q = modalSearchTerm.toLowerCase().trim();
    return scDocList.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.jobName.toLowerCase().includes(q) ||
        d.leader.toLowerCase().includes(q) ||
        d.workers.toLowerCase().includes(q) ||
        d.violations.some((v) => v.content.toLowerCase().includes(q) || v.person.toLowerCase().includes(q))
    );
  }, [scDocList, modalSearchTerm]);

  // Danh sách hiển thị trong Modal Drilldown cho PCT, LCT, ALL
  const activeModalRecords = useMemo(() => {
    let baseList: NormalizedRecord[] = [];
    if (drilldownType === 'PCT') baseList = pctErrorList;
    else if (drilldownType === 'LCT') baseList = lctErrorList;
    else if (drilldownType === 'ALL') baseList = totalErrorList;

    if (!modalSearchTerm.trim()) return baseList;
    const q = modalSearchTerm.toLowerCase().trim();
    return baseList.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.jobName.toLowerCase().includes(q) ||
        r.leader.toLowerCase().includes(q) ||
        r.issuer.toLowerCase().includes(q) ||
        r.unit.toLowerCase().includes(q) ||
        r.parsedErrors.some((e) => e.message.toLowerCase().includes(q))
    );
  }, [drilldownType, pctErrorList, lctErrorList, totalErrorList, modalSearchTerm]);

  const handleExportWord = () => {
    exportToWord({
      overview: activePeriodOverview,
      records: activePeriodRecords,
      personalStats,
      monthlyStats,
      reportType,
      reportMonth,
      reportYear,
      recommendationsText: recommendations.filter((r) => r.trim()).join('\n'),
      auditMembers,
      documentDate: formattedDocDate,
      signedMembers,
      isLeaderSigned,
    });
  };

  const handlePrint = () => {
    triggerPrintReport();
  };

  return (
    <div className="space-y-6">
      {/* Định dạng trang in PDF chuẩn hành chính Nghị định 30:
          Khổ A4, Times New Roman, cỡ chữ 13pt, lề trái 3cm, trên/dưới/phải 2cm */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 20mm 20mm 20mm 30mm !important; /* trên: 2cm, phải: 2cm, dưới: 2cm, trái: 3cm */
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body, html {
            background-color: #ffffff !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
            line-height: 1.35 !important;
            color: #000000 !important;
          }
          .print-paper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
          }
          table.data-table {
            border-collapse: collapse !important;
            width: 100% !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
            page-break-inside: auto;
            margin-top: 6pt !important;
            margin-bottom: 12pt !important;
          }
          table.data-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          table.data-table th, table.data-table td {
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
            border: 1px solid #000000 !important;
            color: #000000 !important;
            padding: 5pt 7pt !important;
            line-height: 1.35 !important;
          }
          table.data-table th {
            font-weight: bold !important;
            text-align: center !important;
            background-color: #f1f5f9 !important;
          }
          input, textarea {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            font-family: 'Times New Roman', Times, serif !important;
            font-size: 13pt !important;
            color: #000000 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Thanh điều khiển Báo cáo Tháng / Năm (Đã loại bỏ khối banner trùng lặp theo yêu cầu) */}
      <div className="bg-white rounded-xl border border-slate-200/80 px-4 py-3 shadow-xs print:hidden flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setReportType('month');
                onChangeFilters?.((prev) => ({ ...prev, month: reportMonth, year: reportYear }));
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                reportType === 'month'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Báo cáo Tháng
            </button>
            <button
              onClick={() => {
                setReportType('year');
                onChangeFilters?.((prev) => ({ ...prev, month: 'all', year: reportYear }));
              }}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                reportType === 'year'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Báo cáo Năm
            </button>
          </div>

          {reportType === 'month' && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-500">Kỳ tháng:</span>
              <select
                value={reportMonth}
                onChange={(e) => {
                  const m = parseInt(e.target.value, 10);
                  setReportMonth(m);
                  onChangeFilters?.((prev) => ({ ...prev, month: m, year: reportYear }));
                }}
                className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m < 10 ? '0' + m : m}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-slate-500">Năm:</span>
            <select
              value={reportYear}
              onChange={(e) => {
                const y = parseInt(e.target.value, 10);
                setReportYear(y);
                onChangeFilters?.((prev) => ({
                  ...prev,
                  year: y,
                  month: reportType === 'month' ? reportMonth : 'all',
                }));
              }}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportWord}
            title="Xuất văn bản Word (.doc)"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Xuất file Word (.doc)</span>
          </button>
          <button
            onClick={handlePrint}
            title="In trực tiếp hoặc Lưu file PDF"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo cáo / Lưu PDF</span>
          </button>
        </div>
      </div>

      {/* Official Corporate Report Layout (Chuẩn Khổ A4 Ngang - Landscape 297mm x 210mm) */}
      <div className="print-paper bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 lg:pl-[30mm] lg:pr-[20mm] lg:pt-[20mm] lg:pb-[20mm] shadow-xs max-w-[1150px] w-full mx-auto print:max-w-none print:w-full print:border-none print:shadow-none print:p-0">
        {/* Formal Corporate Header (Cỡ chữ 12pt theo quy định) */}
        <div className="flex justify-between items-start pb-4 mb-6">
          <div className="text-center w-[44%]">
            <p className="font-bold uppercase text-slate-800 print:text-black whitespace-nowrap text-xs sm:text-[12pt] print:text-[12pt] leading-tight">
              CÔNG TY THỦY ĐIỆN IALY
            </p>
            <p className="font-bold uppercase text-slate-900 print:text-black whitespace-nowrap text-xs sm:text-[12pt] print:text-[12pt] leading-tight">
              PX VẬN HÀNH IALY
            </p>
            <div className="w-24 sm:w-28 border-b border-slate-900 mx-auto mt-1 print:border-black"></div>
          </div>

          <div className="text-center w-[56%]">
            <p className="font-bold uppercase text-slate-800 print:text-black whitespace-nowrap text-xs sm:text-[12pt] print:text-[12pt] leading-tight">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="font-bold text-slate-800 print:text-black whitespace-nowrap text-xs sm:text-[12pt] print:text-[12pt] leading-tight">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <div className="w-28 sm:w-36 border-b border-slate-900 mx-auto mt-1 print:border-black"></div>
            {/* Dòng ngày tháng: Cỡ chữ 13pt theo quy định - Chỉ Admin mới điền được */}
            <div className="mt-1.5 flex items-center justify-center gap-1 text-xs sm:text-[13pt] print:text-[13pt] text-slate-700 print:text-black italic">
              <span>Gia Lai, ngày</span>
              {isAdmin ? (
                <>
                  <input
                    type="text"
                    value={docDay}
                    onChange={(e) => handleUpdateDocDate('day', e.target.value)}
                    placeholder="..."
                    maxLength={2}
                    title="Nhập ngày lập báo cáo (ví dụ: 15)"
                    className="w-8 text-center font-semibold bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-300 focus:border-blue-500 rounded px-1 py-0.5 text-xs sm:text-[13pt] text-slate-800 not-italic focus:outline-hidden transition print:border-none print:bg-transparent print:p-0 print:w-auto print:font-normal print:italic"
                  />
                  <span>tháng</span>
                  <input
                    type="text"
                    value={docMonth}
                    onChange={(e) => handleUpdateDocDate('month', e.target.value)}
                    placeholder="..."
                    maxLength={2}
                    title="Nhập tháng lập báo cáo (ví dụ: 09)"
                    className="w-8 text-center font-semibold bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-300 focus:border-blue-500 rounded px-1 py-0.5 text-xs sm:text-[13pt] text-slate-800 not-italic focus:outline-hidden transition print:border-none print:bg-transparent print:p-0 print:w-auto print:font-normal print:italic"
                  />
                  <span>năm</span>
                  <input
                    type="text"
                    value={docYear}
                    onChange={(e) => handleUpdateDocDate('year', e.target.value)}
                    placeholder="2026"
                    maxLength={4}
                    title="Nhập năm lập báo cáo (ví dụ: 2026)"
                    className="w-14 text-center font-semibold bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-300 focus:border-blue-500 rounded px-1 py-0.5 text-xs sm:text-[13pt] text-slate-800 not-italic focus:outline-hidden transition print:border-none print:bg-transparent print:p-0 print:w-auto print:font-normal print:italic"
                  />
                  <button
                    type="button"
                    onClick={handleSetToday}
                    title="Điền nhanh ngày hôm nay"
                    className="ml-1 px-1.5 py-0.5 text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition cursor-pointer not-italic print:hidden font-medium"
                  >
                    Hôm nay
                  </button>
                </>
              ) : (
                <span>
                  {docDay ? (docDay.length === 1 ? '0' + docDay : docDay) : '.....'} tháng{' '}
                  {docMonth ? (docMonth.length === 1 ? '0' + docMonth : docMonth) : '.....'} năm{' '}
                  {docYear || '2026'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-black uppercase text-slate-900 print:text-black tracking-tight">
            BÁO CÁO
          </h1>
          <p className="text-sm sm:text-[13pt] font-bold text-slate-800 print:text-black mt-1">
            Về việc kết quả hậu kiểm PCT, LCT {reportType === 'month' ? `tháng ${reportMonth < 10 ? '0' + reportMonth : reportMonth}/${reportYear}` : `năm ${reportYear}`}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* MỤC I: VIỆC THỰC HIỆN PCT */}
        {/* ========================================================================= */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-[13pt] print:text-[13pt] font-bold text-slate-900 flex items-center gap-1.5 print:text-black">
              <span><b>I. Việc thực hiện PCT:</b></span>
            </h3>
          </div>

          {/* Bảng danh sách chi tiết các phiếu công tác có nội dung không phù hợp (Có STT và Ghi chú - Cỡ chữ 13pt) */}
          <div className="border border-slate-300 rounded-lg overflow-x-auto print:border-black mb-4">
            <table className="w-full text-xs sm:text-[13pt] print:text-[13pt] leading-snug">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 print:bg-transparent print:border-black print:text-black">
                <tr>
                  <th rowSpan={2} className="py-2.5 px-2 text-center border-r border-slate-300 print:border-black w-10">
                    STT
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-slate-300 print:border-black w-16">
                    Số phiếu
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-slate-300 print:border-black w-16">
                    Loại
                  </th>
                  <th rowSpan={2} className="py-2.5 px-4 text-left border-r border-slate-300 print:border-black">
                    Nội dung không phù hợp
                  </th>
                  <th colSpan={2} className="py-1 px-3 text-center border-b border-slate-300 print:border-black w-48">
                    Người liên quan
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-slate-300 print:border-black w-24">
                    Ghi chú
                  </th>
                </tr>
                <tr>
                  <th className="py-1.5 px-2 text-center border-r border-slate-300 print:border-black w-24">
                    VHIALY
                  </th>
                  <th className="py-1.5 px-2 text-center border-r border-slate-300 print:border-black w-24">
                    PXSC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-black">
                {pctViolations.length > 0 ? (
                  pctViolations.map((v, idx) => (
                    <tr key={v.id || idx} className="hover:bg-slate-50 print:bg-transparent">
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 text-center font-bold border-r border-slate-200 print:border-black print:text-black">
                        {v.docNumber}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.workType}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200 print:border-black print:text-black leading-relaxed">
                        {v.content}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.vhialyPerson}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.pxscPerson}
                      </td>
                      <td className="py-2 px-2 text-center print:border-black print:text-black text-slate-600">
                        {v.note || ''}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center italic text-slate-500 print:text-black">
                      Không phát hiện nội dung không phù hợp trong kỳ kiểm tra.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MỤC II: VIỆC THỰC HIỆN LCT */}
        {/* ========================================================================= */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-[13pt] print:text-[13pt] font-bold text-slate-900 flex items-center gap-1.5 print:text-black">
              <span><b>II. Việc thực hiện LCT:</b></span>
            </h3>
          </div>

          {/* Bảng danh sách chi tiết các lệnh công tác có nội dung không phù hợp (Có STT và Ghi chú - Cỡ chữ 13pt) */}
          <div className="border border-slate-300 rounded-lg overflow-x-auto print:border-black mb-4">
            <table className="w-full text-xs sm:text-[13pt] print:text-[13pt] leading-snug">
              <thead className="bg-slate-100 font-bold border-b border-slate-300 text-slate-800 print:bg-transparent print:border-black print:text-black">
                <tr>
                  <th rowSpan={2} className="py-2.5 px-2 text-center border-r border-slate-300 print:border-black w-10">
                    STT
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-slate-300 print:border-black w-16">
                    Số lệnh
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-r border-slate-300 print:border-black w-16">
                    Loại
                  </th>
                  <th rowSpan={2} className="py-2.5 px-4 text-left border-r border-slate-300 print:border-black">
                    Nội dung không phù hợp
                  </th>
                  <th colSpan={2} className="py-1 px-3 text-center border-b border-slate-300 print:border-black w-48">
                    Người liên quan
                  </th>
                  <th rowSpan={2} className="py-2.5 px-3 text-center border-slate-300 print:border-black w-24">
                    Ghi chú
                  </th>
                </tr>
                <tr>
                  <th className="py-1.5 px-2 text-center border-r border-slate-300 print:border-black w-24">
                    VHIALY
                  </th>
                  <th className="py-1.5 px-2 text-center border-r border-slate-300 print:border-black w-24">
                    PXSC
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 print:divide-black">
                {lctViolations.length > 0 ? (
                  lctViolations.map((v, idx) => (
                    <tr key={v.id || idx} className="hover:bg-slate-50 print:bg-transparent">
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 text-center font-bold border-r border-slate-200 print:border-black print:text-black">
                        {v.docNumber}
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.workType}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-200 print:border-black print:text-black leading-relaxed">
                        {v.content}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.vhialyPerson}
                      </td>
                      <td className="py-2 px-2 text-center border-r border-slate-200 print:border-black print:text-black">
                        {v.pxscPerson}
                      </td>
                      <td className="py-2 px-2 text-center print:border-black print:text-black text-slate-600">
                        {v.note || ''}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-4 text-center italic text-slate-500 print:text-black">
                      Không phát hiện nội dung không phù hợp trong kỳ kiểm tra.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BIỂU ĐỒ CỘT SO SÁNH SỐ LIỆU THỰC HIỆN PCT VÀ LCT (Thay thế 2 bảng tổng hợp cũ) */}
        {/* ========================================================================= */}
        <div className="mb-8 pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 print:text-black flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-600 print:hidden" />
              <span>* Tổng hợp Phiếu công tác (PCT) và Lệnh công tác (LCT):</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Thẻ biểu đồ cột PCT */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 print:bg-blue-50/40 print:border-blue-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                  Phiếu công tác (PCT)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  Tỷ lệ lỗi: {pctErrorRate}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="bg-white p-2 rounded-lg border border-blue-100 print:border-blue-200">
                  <div className="text-[10px] text-slate-500">Tổng cấp</div>
                  <div className="text-base font-black text-slate-900 font-mono">{activePeriodOverview.totalPCT}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100 print:border-blue-200">
                  <div className="text-[10px] text-emerald-600">Hợp lệ</div>
                  <div className="text-base font-black text-emerald-600 font-mono">{activePeriodOverview.pctValid}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-blue-100 print:border-blue-200">
                  <div className="text-[10px] text-rose-600">Có lỗi</div>
                  <div className="text-base font-black text-rose-600 font-mono">{activePeriodOverview.pctWithErrors}</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-emerald-700">Hợp lệ: {100 - Number(pctErrorRate)}% ({activePeriodOverview.pctValid} phiếu)</span>
                  <span className="text-rose-600 font-semibold">Có lỗi: {pctErrorRate}% ({activePeriodOverview.pctWithErrors} phiếu)</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                  <div
                    style={{ width: `${activePeriodOverview.totalPCT > 0 ? (activePeriodOverview.pctValid / activePeriodOverview.totalPCT) * 100 : 100}%` }}
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    title="Hợp lệ"
                  ></div>
                  {Number(pctErrorRate) > 0 && (
                    <div
                      style={{ width: `${Number(pctErrorRate)}%` }}
                      className="bg-rose-500 h-full rounded-full transition-all"
                      title="Có lỗi"
                    ></div>
                  )}
                </div>
              </div>
            </div>

            {/* Thẻ biểu đồ cột LCT */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 print:bg-emerald-50/40 print:border-emerald-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Lệnh công tác (LCT)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Tỷ lệ lỗi: {lctErrorRate}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                <div className="bg-white p-2 rounded-lg border border-emerald-100 print:border-emerald-200">
                  <div className="text-[10px] text-slate-500">Tổng cấp</div>
                  <div className="text-base font-black text-slate-900 font-mono">{activePeriodOverview.totalLCT}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100 print:border-emerald-200">
                  <div className="text-[10px] text-emerald-600">Hợp lệ</div>
                  <div className="text-base font-black text-emerald-600 font-mono">{activePeriodOverview.lctValid}</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-emerald-100 print:border-emerald-200">
                  <div className="text-[10px] text-rose-600">Có lỗi</div>
                  <div className="text-base font-black text-rose-600 font-mono">{activePeriodOverview.lctWithErrors}</div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-emerald-700">Hợp lệ: {100 - Number(lctErrorRate)}% ({activePeriodOverview.lctValid} lệnh)</span>
                  <span className="text-rose-600 font-semibold">Có lỗi: {lctErrorRate}% ({activePeriodOverview.lctWithErrors} lệnh)</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                  <div
                    style={{ width: `${activePeriodOverview.totalLCT > 0 ? (activePeriodOverview.lctValid / activePeriodOverview.totalLCT) * 100 : 100}%` }}
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    title="Hợp lệ"
                  ></div>
                  {Number(lctErrorRate) > 0 && (
                    <div
                      style={{ width: `${Number(lctErrorRate)}%` }}
                      className="bg-rose-500 h-full rounded-full transition-all"
                      title="Có lỗi"
                    ></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TỶ LỆ VI PHẠM: 3 CỘT BIỂU ĐỒ PHẦN TRĂM DẠNG TRÒN TRỰC QUAN (Ngay dưới PCT vs LCT) */}
        {/* ========================================================================= */}
        <div className="mb-8 pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 print:text-black">
              <BarChart3 className="w-4 h-4 text-blue-600 print:hidden" />
              <span>* <b>Tỷ lệ vi phạm:</b></span>
            </h4>
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Cột 1: TỶ LỆ PHIẾU CÔNG TÁC (PCT) LỖI */}
            <div
              onClick={() => {
                setDrilldownType('PCT');
                setModalSearchTerm('');
              }}
              className="bg-white rounded-xl border-2 border-blue-600 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group print:border-2 print:border-blue-600 print:shadow-none print:p-3 print:bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-blue-100 text-blue-700 print:hidden">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-900 print:text-blue-900 whitespace-nowrap">
                      Phiếu công tác (PCT)
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500 opacity-60 group-hover:opacity-100 transition print:hidden" />
                </div>

                <div className="my-2 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#dbeafe" strokeWidth="11" />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#2563eb"
                        strokeWidth="11"
                        strokeDasharray={238.76}
                        strokeDashoffset={238.76 * (1 - Math.min(Math.max(Number(pctErrorRate), 0), 100) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xl font-black font-mono tracking-tight text-blue-700">
                        {pctErrorRate}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-slate-700 print:text-black font-medium">
                    <strong className="text-rose-600 print:text-black font-bold">{pctErrorList.length}</strong> / {pctList.length} phiếu có lỗi
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-blue-100 text-center print:hidden">
                <span className="text-xs font-bold text-blue-600 group-hover:text-blue-800 inline-flex items-center gap-1">
                  <span>Xem danh sách {pctErrorList.length} phiếu lỗi</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>

            {/* Cột 2: TỶ LỆ LỆNH CÔNG TÁC (LCT) LỖI */}
            <div
              onClick={() => {
                setDrilldownType('LCT');
                setModalSearchTerm('');
              }}
              className="bg-white rounded-xl border-2 border-emerald-600 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group print:border-2 print:border-emerald-600 print:shadow-none print:p-3 print:bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 print:hidden">
                      <FileCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 print:text-emerald-900 whitespace-nowrap">
                      Lệnh công tác (LCT)
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500 opacity-60 group-hover:opacity-100 transition print:hidden" />
                </div>

                <div className="my-2 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#d1fae5" strokeWidth="11" />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#059669"
                        strokeWidth="11"
                        strokeDasharray={238.76}
                        strokeDashoffset={238.76 * (1 - Math.min(Math.max(Number(lctErrorRate), 0), 100) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xl font-black font-mono tracking-tight text-emerald-700">
                        {lctErrorRate}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-slate-700 print:text-black font-medium">
                    <strong className="text-rose-600 print:text-black font-bold">{lctErrorList.length}</strong> / {lctList.length} lệnh có lỗi
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-emerald-100 text-center print:hidden">
                <span className="text-xs font-bold text-emerald-600 group-hover:text-emerald-800 inline-flex items-center gap-1">
                  <span>Xem danh sách {lctErrorList.length} lệnh lỗi</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>

            {/* Cột 3: TỔNG PHIẾU + LỆNH LỖI */}
            <div
              onClick={() => {
                setDrilldownType('ALL');
                setModalSearchTerm('');
              }}
              className="bg-white rounded-xl border-2 border-rose-600 hover:shadow-md transition-all p-4 flex flex-col justify-between cursor-pointer group print:border-2 print:border-rose-600 print:shadow-none print:p-3 print:bg-white"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-rose-100 text-rose-700 print:hidden">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-900 print:text-rose-900 whitespace-nowrap">
                      Tổng Phiếu + Lệnh lỗi
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-rose-500 opacity-60 group-hover:opacity-100 transition print:hidden" />
                </div>

                <div className="my-2 flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ffe4e6" strokeWidth="11" />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#e11d48"
                        strokeWidth="11"
                        strokeDasharray={238.76}
                        strokeDashoffset={238.76 * (1 - Math.min(Math.max(Number(totalErrorRate), 0), 100) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-xl font-black font-mono tracking-tight text-rose-700">
                        {totalErrorRate}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-center text-xs text-slate-700 print:text-black font-medium">
                    <strong className="text-rose-600 print:text-black font-bold">{totalErrorList.length}</strong> / {totalDocsList.length} phiếu/lệnh có lỗi
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-rose-100 text-center print:hidden">
                <span className="text-xs font-bold text-rose-600 group-hover:text-rose-800 inline-flex items-center gap-1">
                  <span>Xem danh sách {totalErrorList.length} phiếu + lệnh lỗi</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BIỂU ĐỒ SO SÁNH SỐ NGƯỜI VÀ VI PHẠM THEO PHÂN XƯỞNG (PXVH vs PXSC) */}
        {/* ========================================================================= */}
        <div className="mb-8 pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 print:text-black flex items-center gap-1.5 print:text-[13pt]">
              <Users className="w-4 h-4 text-blue-600 print:hidden" />
              <span>* Biểu đồ vi phạm theo phân xưởng:</span>
            </h4>
            
          </div>

          {/* Hai thẻ đối sánh trực quan 2 phân xưởng PXVH và PXSC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
            {/* Phân xưởng Vận hành (PXVH) */}
            <div className="p-4 sm:p-5 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 to-blue-100/30 print:bg-blue-50/80 print:border-blue-300 shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs sm:text-sm font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  Phân xưởng Vận hành (PXVH)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black shadow-xs">
                  Tỷ trọng: {vhPercentage}% tổng lỗi
                </span>
              </div>

              {/* Thanh tỷ trọng vi phạm PXVH */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[11px] text-blue-900/80 font-medium">
                  <span>Phần lỗi thuộc PXVH ({vhViolationCount}/{Math.max(vhViolationCount + scViolationCount, 1)} lỗi)</span>
                  <span className="font-bold">{vhPercentage}%</span>
                </div>
                <div className="w-full bg-blue-200/80 h-3 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${vhPercentage}%` }}
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>

              {/* 3 chỉ số then chốt PXVH (Có thể nhấp để xem danh sách chi tiết) */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {/* 1. Người vi phạm */}
                <div
                  onClick={() => {
                    setDrilldownType('PXVH_PERSONNEL');
                    setModalSearchTerm('');
                  }}
                  className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs print:border-blue-200 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xs transition cursor-pointer group"
                  title="Nhấp để xem danh sách chi tiết người vi phạm của PXVH"
                >
                  <div className="text-[10px] text-slate-500 mb-0.5 flex items-center justify-center gap-1">
                    <span>Người vi phạm</span>
                    <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-base font-black text-blue-950 font-mono">
                    {vhPersonsSet.size} <span className="text-[10px] font-normal text-slate-500">người</span>
                  </div>
                  <div className="text-[9px] font-semibold text-blue-600 mt-1 opacity-80 group-hover:opacity-100 group-hover:underline">
                    Xem danh sách
                  </div>
                </div>

                {/* 2. Phiếu/lệnh vi phạm */}
                <div
                  onClick={() => {
                    setDrilldownType('PXVH_DOCS');
                    setModalSearchTerm('');
                  }}
                  className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs print:border-blue-200 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xs transition cursor-pointer group"
                  title="Nhấp để xem danh sách chi tiết các phiếu/lệnh vi phạm của PXVH"
                >
                  <div className="text-[10px] text-slate-500 mb-0.5 flex items-center justify-center gap-1">
                    <span>Phiếu/lệnh vi phạm</span>
                    <ExternalLink className="w-2.5 h-2.5 text-blue-500 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-base font-black text-blue-950 font-mono">
                    {vhDocsCount} <span className="text-[10px] font-normal text-slate-500">phiếu</span>
                  </div>
                  <div className="text-[9px] font-semibold text-blue-600 mt-1 opacity-80 group-hover:opacity-100 group-hover:underline">
                    Xem danh sách
                  </div>
                </div>

                {/* 3. Tổng số lỗi */}
                <div
                  onClick={() => {
                    setDrilldownType('PXVH_DOCS');
                    setModalSearchTerm('');
                  }}
                  className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs print:border-blue-200 hover:border-rose-400 hover:bg-rose-50/40 hover:shadow-xs transition cursor-pointer group"
                  title="Nhấp để xem chi tiết các lỗi sai sót của PXVH"
                >
                  <div className="text-[10px] text-rose-600 font-medium mb-0.5 flex items-center justify-center gap-1">
                    <span>Tổng số lỗi</span>
                    <ExternalLink className="w-2.5 h-2.5 text-rose-500 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-base font-black text-rose-600 font-mono">
                    {vhViolationCount} <span className="text-[10px] font-normal text-rose-600">lỗi</span>
                  </div>
                  <div className="text-[9px] font-semibold text-rose-600 mt-1 opacity-80 group-hover:opacity-100 group-hover:underline">
                    Xem chi tiết
                  </div>
                </div>
              </div>
            </div>

            {/* Phân xưởng Sửa chữa (PXSC) */}
            <div className="p-4 sm:p-5 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-amber-100/30 print:bg-amber-50/80 print:border-amber-300 shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs sm:text-sm font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                  Phân xưởng Sửa chữa (PXSC)
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-[11px] font-black shadow-xs">
                  Tỷ trọng: {scPercentage}% tổng lỗi
                </span>
              </div>

              {/* Thanh tỷ trọng vi phạm PXSC */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-[11px] text-amber-900/80 font-medium">
                  <span>Phần lỗi thuộc PXSC ({scViolationCount}/{Math.max(vhViolationCount + scViolationCount, 1)} lỗi)</span>
                  <span className="font-bold">{scPercentage}%</span>
                </div>
                <div className="w-full bg-amber-200/80 h-3 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${scPercentage}%` }}
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>

              {/* 3 chỉ số then chốt PXSC (Có thể nhấp để xem danh sách chi tiết) */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {/* 1. Người vi phạm */}
                <div
                  onClick={() => {
                    setDrilldownType('PXSC_PERSONNEL');
                    setModalSearchTerm('');
                  }}
                  className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs print:border-amber-200 hover:border-amber-500 hover:bg-amber-50/50 hover:shadow-xs transition cursor-pointer group"
                  title="Nhấp để xem danh sách chi tiết người vi phạm của PXSC"
                >
                  <div className="text-[10px] text-slate-500 mb-0.5 flex items-center justify-center gap-1">
                    <span>Người vi phạm</span>
                    <ExternalLink className="w-2.5 h-2.5 text-amber-600 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-base font-black text-amber-950 font-mono">
                    {scPersonsSet.size} <span className="text-[10px] font-normal text-slate-500">người</span>
                  </div>
                  <div className="text-[9px] font-semibold text-amber-700 mt-1 opacity-80 group-hover:opacity-100 group-hover:underline">
                    Xem danh sách
                  </div>
                </div>

                {/* 2. Phiếu/lệnh vi phạm */}
                <div
                  onClick={() => {
                    setDrilldownType('PXSC_DOCS');
                    setModalSearchTerm('');
                  }}
                  className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs print:border-amber-200 hover:border-amber-500 hover:bg-amber-50/50 hover:shadow-xs transition cursor-pointer group"
                  title="Nhấp để xem danh sách chi tiết các phiếu/lệnh vi phạm của PXSC"
                >
                  <div className="text-[10px] text-slate-500 mb-0.5 flex items-center justify-center gap-1">
                    <span>Phiếu/lệnh vi phạm</span>
                    <ExternalLink className="w-2.5 h-2.5 text-amber-600 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-base font-black text-amber-950 font-mono">
                    {scDocsCount} <span className="text-[10px] font-normal text-slate-500">phiếu</span>
                  </div>
                  <div className="text-[9px] font-semibold text-amber-700 mt-1 opacity-80 group-hover:opacity-100 group-hover:underline">
                    Xem danh sách
                  </div>
                </div>

                {/* 3. Tổng số lỗi */}
                <div
                  onClick={() => {
                    setDrilldownType('PXSC_DOCS');
                    setModalSearchTerm('');
                  }}
                  className="bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs print:border-amber-200 hover:border-rose-400 hover:bg-rose-50/40 hover:shadow-xs transition cursor-pointer group"
                  title="Nhấp để xem chi tiết các lỗi sai sót của PXSC"
                >
                  <div className="text-[10px] text-rose-600 font-medium mb-0.5 flex items-center justify-center gap-1">
                    <span>Tổng số lỗi</span>
                    <ExternalLink className="w-2.5 h-2.5 text-rose-500 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="text-base font-black text-rose-600 font-mono">
                    {scViolationCount} <span className="text-[10px] font-normal text-rose-600">lỗi</span>
                  </div>
                  <div className="text-[9px] font-semibold text-rose-600 mt-1 opacity-80 group-hover:opacity-100 group-hover:underline">
                    Xem chi tiết
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thanh tương quan tỷ lệ vi phạm toàn phân xưởng */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 print:border-slate-300 print:bg-slate-50">
            <div className="flex items-center justify-between text-xs font-bold mb-2.5 text-slate-700">
              <span className="flex items-center gap-1.5 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                PXVH: {vhPercentage}% ({vhViolationCount} lỗi)
              </span>
              
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                PXSC: {scPercentage}% ({scViolationCount} lỗi)
              </span>
            </div>
            <div className="h-6 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${vhPercentage}%` }}
                className="bg-blue-600 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold tracking-wider"
              >
                {vhPercentage > 10 && `PXVH ${vhPercentage}%`}
              </div>
              <div
                style={{ width: `${scPercentage}%` }}
                className="bg-amber-600 h-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold tracking-wider"
              >
                {scPercentage > 10 && `PXSC ${scPercentage}%`}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MỤC III: ĐÁNH GIÁ & KIẾN NGHỊ (Chỉ Admin mới có quyền chỉnh sửa, Khách chỉ xem) */}
        {/* ========================================================================= */}
        <div className="my-8 pt-6 border-t border-slate-200 print:border-none print:pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-[13pt] print:text-[13pt] font-bold text-slate-900 print:text-black">
                <b>III. Đánh giá & Kiến nghị:</b>
              </h3>
              {isAdmin ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 print:hidden">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  
                </span>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 print:hidden">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>Chế độ khách (Chỉ xem)</span>
                </span>
              )}
            </div>

            {isAdmin ? (
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setShowSuggestionsModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer font-bold shadow-2xs"
                  title="Mở danh sách gợi ý nội dung kiến nghị chuẩn từ Phân xưởng"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Danh sách gợi ý ({SUGGESTED_RECOMMENDATIONS_LIST.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleSmartGenerateRecommendations}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer font-bold shadow-2xs"
                  title="Tự động tính toán số liệu và sinh ra các ý đánh giá & kiến nghị thực tế"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Đánh giá theo số liệu thực tế</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetRecommendations}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer font-medium"
                  title="Khôi phục 4 ý kiến nghị gốc ban đầu"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Mẫu kiến nghị gốc</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddRecommendation}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thêm ý</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 print:hidden">
                <button
                  type="button"
                  onClick={() => setShowSuggestionsModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition cursor-pointer"
                  title="Xem danh sách các gợi ý nội dung kiến nghị từ Phân xưởng"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Xem gợi ý mẫu ({SUGGESTED_RECOMMENDATIONS_LIST.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
                  title="Đăng nhập tài khoản Quản trị viên để chỉnh sửa báo cáo"
                >
                  <Lock className="w-3 h-3 text-blue-600" />
                  <span>Đăng nhập Admin để sửa</span>
                </button>
              </div>
            )}
          </div>

          {/* Hiển thị trên Web */}
          {isAdmin ? (
            /* Trình chỉnh sửa tương tác (Dành cho Quản trị viên - Ẩn khi in ấn) */
            <div className="space-y-3 print:hidden">
              {recommendations.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 focus-within:border-blue-500 focus-within:bg-white transition"
                >
                  <span className="text-xs font-bold text-slate-400 mt-2 select-none shrink-0 w-5">
                    {rIdx + 1}.
                  </span>
                  <textarea
                    rows={2}
                    value={rec}
                    onChange={(e) => handleUpdateRecommendation(rIdx, e.target.value)}
                    placeholder={`Nhập nội dung ý kiến nghị thứ ${rIdx + 1}...`}
                    className="flex-1 bg-transparent border-none text-xs text-slate-800 leading-relaxed focus:outline-hidden resize-y p-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteRecommendation(rIdx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer mt-1"
                    title="Xóa ý kiến nghị này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {recommendations.length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs">
                  Chưa có ý kiến nghị nào. Nhấp &ldquo;Thêm ý kiến nghị&rdquo; hoặc &ldquo;Khôi phục mẫu chuẩn&rdquo;.
                </div>
              )}
            </div>
          ) : (
            /* Chế độ xem tĩnh đẹp mắt dành cho Khách (Chỉ xem - Không có textarea hay nút xóa - Ẩn khi in) */
            <div className="space-y-2.5 print:hidden">
              {recommendations.map((rec, rIdx) => (
                <div
                  key={rIdx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-800 leading-relaxed"
                >
                  <span className="font-bold text-slate-500 select-none shrink-0 w-5 mt-0.5">
                    {rIdx + 1}.
                  </span>
                  <div className="flex-1 text-justify whitespace-pre-wrap font-normal">
                    {rec}
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl text-slate-400 text-xs">
                  Chưa có ý kiến nghị nào trong kỳ này.
                </div>
              )}
            </div>
          )}

          {/* Bản in PDF / xem văn bản chuẩn hành chính Nghị định 30 */}
          <div className="hidden print:block space-y-2 text-[13pt] text-black leading-relaxed">
            {recommendations
              .filter((r) => r.trim())
              .map((rec, rIdx) => (
                <p key={rIdx} className="text-justify mb-2 leading-relaxed" style={{ textIndent: '1.27cm' }}>
                  {rec.trim().startsWith('-') ? rec.trim() : `- ${rec.trim()}`}
                </p>
              ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CÁC THÀNH VIÊN THAM GIA HẬU KIỂM (Có thể thêm hoặc xóa linh hoạt) */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* CÁC THÀNH VIÊN THAM GIA HẬU KIỂM (Có thể thêm hoặc xóa linh hoạt & chèn chữ ký) */}
        {/* ========================================================================= */}
        <div className="my-8 pt-6 border-t border-slate-200 print:border-none print:pt-2 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
            <div>
              <h4 className="font-bold text-sm sm:text-[13pt] print:text-[13pt] text-slate-900 print:text-black">
                <b>Các thành viên tham gia hậu kiểm:</b>
                
              </h4>
              
            </div>

            {/* Các nút công cụ chữ ký trên Web */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleOpenSignatureModal()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
                  title="Tải ảnh chữ ký chung của tổ để cắt hoặc tải ảnh riêng cho từng người"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Quản lý & Tải ảnh chữ ký</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSelectAllMembers(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                title="Tích chọn chèn chữ ký cho tất cả các thành viên"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>Chọn tất cả</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAllMembers(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                title="Bỏ chọn toàn bộ chữ ký thành viên"
              >
                <Square className="w-3.5 h-3.5 text-slate-400" />
                <span>Bỏ chọn</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleResetMembers}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer font-medium"
                  title="Khôi phục danh sách thành viên mặc định"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Danh sách chuẩn</span>
                </button>
              )}
            </div>
          </div>

          {/* Thanh thêm thành viên mới (Chỉ dành cho Admin trên giao diện Web) */}
          {isAdmin && (
            <div className="flex items-center gap-2 mb-4 print:hidden">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                  placeholder="Nhập họ và tên thành viên tham gia mới..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={!newMemberName.trim()}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm thành viên</span>
              </button>
            </div>
          )}

          {/* Danh sách thành viên hiển thị trên Web (Có checkbox tích chọn tự động chèn chữ ký & nút tải ảnh) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-800 print:hidden mb-4">
            {auditMembers.map((name, idx) => {
              const isSigned = signedMembers[name] !== false;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isSigned
                      ? 'bg-blue-50/50 border-blue-200 shadow-2xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSigned}
                        onChange={() => handleToggleMemberSign(name)}
                        disabled={!isAdmin}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                      />
                      <span className="font-bold text-slate-800 text-xs sm:text-[13pt]">
                        <span className="text-slate-400 mr-1">{idx + 1}.</span>
                        {name}
                      </span>
                    </label>

                    {/* Chỉ quyền admin mới được tải ảnh hoặc xóa thành viên */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5">
                        {/* Nút tải ảnh chữ ký thật từ máy */}
                        <label
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs transition cursor-pointer"
                          title={`Tải file ảnh chữ ký thực tế cho ${name}`}
                        >
                          <Upload className="w-3 h-3 text-blue-600" />
                          <span>Tải ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadMemberSignature(name, file);
                            }}
                          />
                        </label>

                        {/* Nút khôi phục chữ ký gốc nếu đã tải ảnh */}
                        {hasCustomSignature(name) && (
                          <button
                            type="button"
                            onClick={() => handleResetMemberSignature(name)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title={`Khôi phục chữ ký gốc của ${name}`}
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}

                        {/* Xóa thành viên khỏi danh sách kiểm tra (Admin) */}
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                          title={`Xóa ${name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Vùng hiển thị chữ ký khi được tích chọn (Bỏ Đã chèn chữ ký, Ảnh riêng, thay bằng icon nhỏ) */}
                  {isSigned ? (
                    <div className="mt-1 pt-1.5 border-t border-blue-100/80 flex items-center justify-between">
                      <div
                        className="h-11 flex items-center max-w-[155px]"
                        dangerouslySetInnerHTML={{ __html: getMemberSignatureSvg(name) }}
                      />
                      <div className="flex items-center gap-1 text-emerald-600 print:hidden" title="Chữ ký đã sẵn sàng">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 pt-1 border-t border-slate-200/60 text-[11px] text-slate-400 italic flex items-center justify-between">
                      <span>Chưa chèn chữ ký</span>
                      <span className="text-slate-300 text-xs">—</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bản in chuẩn 2 cột dạng văn bản hành chính (Tự động hiển thị chữ ký các thành viên được tích) */}
          <div className="hidden print:grid grid-cols-2 gap-x-8 gap-y-3 text-[13pt] text-black">
            <div>
              {auditMembers.slice(0, Math.ceil(auditMembers.length / 2)).map((name, idx) => {
                const isSigned = signedMembers[name] !== false;
                return (
                  <div key={idx} className="mb-2">
                    <p className="font-medium">
                      {idx + 1}. {name}
                    </p>
                    {isSigned && (
                      <div
                        className="h-10 my-0.5 ml-4"
                        dangerouslySetInnerHTML={{ __html: getMemberSignatureSvg(name) }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div>
              {auditMembers.slice(Math.ceil(auditMembers.length / 2)).map((name, idx) => {
                const actualIndex = Math.ceil(auditMembers.length / 2) + idx + 1;
                const isSigned = signedMembers[name] !== false;
                return (
                  <div key={idx} className="mb-2">
                    <p className="font-medium">
                      {actualIndex}. {name}
                    </p>
                    {isSigned && (
                      <div
                        className="h-10 my-0.5 ml-4"
                        dangerouslySetInnerHTML={{ __html: getMemberSignatureSvg(name) }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NƠI NHẬN (CỠ CHỮ 12 CHO 'Nơi nhận:', CỠ CHỮ 11 CHO DANH SÁCH) & TRƯỞNG NHÓM */}
        {/* ========================================================================= */}
        <div className="flex justify-between items-start pt-6 text-xs sm:text-sm">
          {/* Nơi nhận chuẩn quy cách */}
          <div className="w-52 text-left">
            <p className="font-bold italic text-slate-800 print:text-black text-[12pt] mb-1">
              Nơi nhận:
            </p>
            <p className="text-slate-600 print:text-black text-[11pt] leading-snug">
              - LĐPX (để b/c);
            </p>
            <p className="text-slate-600 print:text-black text-[11pt] leading-snug">
              - PXSC (để biết);
            </p>
            <p className="text-slate-600 print:text-black text-[11pt] leading-snug">
              - Lưu ATV.
            </p>
          </div>

          {/* Chữ ký TRƯỞNG NHÓM (Cỡ chữ 13pt) */}
          <div className="w-64 text-center">
            <p className="font-bold uppercase text-slate-900 print:text-black text-[13pt]">
              TRƯỞNG NHÓM
            </p>
            <p className="text-[11pt] text-slate-500 print:text-black italic mt-0.5">
              (Ký, ghi rõ họ tên)
            </p>

            {/* Bảng điều khiển chức năng chữ ký Trưởng nhóm trên Web - Tối giản, gọn gàng */}
            <div className="print:hidden my-2 py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 max-w-[220px] mx-auto">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isLeaderSigned}
                  onChange={handleToggleLeaderSign}
                  disabled={!isAdmin}
                  className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                />
                <span>Chèn chữ ký</span>
              </label>

              {/* Chỉ quyền Admin mới được tải ảnh hoặc khôi phục */}
              {isAdmin && (
                <div className="flex items-center gap-1">
                  {/* Nút tải ảnh chữ ký thật từ máy */}
                  <label
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 transition cursor-pointer"
                    title="Tải ảnh chụp chữ ký thực tế cho Trưởng nhóm"
                  >
                    <Upload className="w-2.5 h-2.5 text-blue-600" />
                    <span>Tải ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLeaderSignature(file);
                      }}
                    />
                  </label>

                  {/* Nút xóa ảnh tải lên quay về mẫu gốc */}
                  {hasCustomSignature('Trần Thanh Chương') && (
                    <button
                      type="button"
                      onClick={handleResetLeaderSignature}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Khôi phục chữ ký gốc mặc định của Trưởng nhóm"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Vùng hiển thị chữ ký Trưởng nhóm (Gọn gàng, sạch sẽ) */}
            {isLeaderSigned ? (
              <div className="h-16 flex flex-col items-center justify-center my-1">
                <div
                  className="h-12 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: getMemberSignatureSvg('Trần Thanh Chương') }}
                />
              </div>
            ) : (
              <div className="h-16 flex items-center justify-center print:h-14">
                <span className="text-[11pt] text-slate-400 italic print:hidden">
                  (Chưa chèn chữ ký)
                </span>
              </div>
            )}

            <p className="font-bold text-slate-900 print:text-black text-[13pt]">
              Trần Thanh Chương
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CHI TIẾT DANH SÁCH PHIẾU/LỆNH HOẶC NGƯỜI VI PHẠM KHI NHẤP */}
      {/* ========================================================================= */}
      {drilldownType && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl text-white ${
                    drilldownType === 'PCT' || drilldownType === 'PXVH_DOCS'
                      ? 'bg-blue-600'
                      : drilldownType === 'LCT'
                      ? 'bg-emerald-600'
                      : drilldownType === 'PXVH_PERSONNEL'
                      ? 'bg-blue-600'
                      : drilldownType === 'PXSC_PERSONNEL' || drilldownType === 'PXSC_DOCS'
                      ? 'bg-amber-600'
                      : 'bg-rose-600'
                  }`}
                >
                  {drilldownType === 'PCT' ? (
                    <FileText className="w-5 h-5" />
                  ) : drilldownType === 'LCT' ? (
                    <FileCheck className="w-5 h-5" />
                  ) : drilldownType === 'PXVH_PERSONNEL' || drilldownType === 'PXSC_PERSONNEL' ? (
                    <Users className="w-5 h-5" />
                  ) : drilldownType === 'PXVH_DOCS' || drilldownType === 'PXSC_DOCS' ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {drilldownType === 'PCT' && 'Danh sách Chi tiết Phiếu công tác (PCT) có vi phạm'}
                    {drilldownType === 'LCT' && 'Danh sách Chi tiết Lệnh công tác (LCT) có vi phạm'}
                    {drilldownType === 'ALL' && 'Danh sách Chi tiết Tất cả Phiếu & Lệnh công tác có vi phạm'}
                    {drilldownType === 'PXVH_PERSONNEL' && 'Danh sách Người vi phạm — Phân xưởng Vận hành (PXVH)'}
                    {drilldownType === 'PXSC_PERSONNEL' && 'Danh sách Người vi phạm — Phân xưởng Sửa chữa (PXSC)'}
                    {drilldownType === 'PXVH_DOCS' && 'Danh sách Phiếu/Lệnh vi phạm — Phân xưởng Vận hành (PXVH)'}
                    {drilldownType === 'PXSC_DOCS' && 'Danh sách Phiếu/Lệnh vi phạm — Phân xưởng Sửa chữa (PXSC)'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {drilldownType === 'PCT' && (
                      <>Tổng cộng: <strong className="text-rose-600 font-bold">{activeModalRecords.length}</strong> phiếu công tác vi phạm</>
                    )}
                    {drilldownType === 'LCT' && (
                      <>Tổng cộng: <strong className="text-rose-600 font-bold">{activeModalRecords.length}</strong> lệnh công tác vi phạm</>
                    )}
                    {drilldownType === 'ALL' && (
                      <>Tổng cộng: <strong className="text-rose-600 font-bold">{activeModalRecords.length}</strong> phiếu/lệnh vi phạm</>
                    )}
                    {drilldownType === 'PXVH_PERSONNEL' && (
                      <>Tổng cộng: <strong className="text-blue-700 font-bold">{filteredVhPersonnel.length}</strong> người vi phạm ({vhViolationCount} lỗi thuộc PXVH)</>
                    )}
                    {drilldownType === 'PXSC_PERSONNEL' && (
                      <>Tổng cộng: <strong className="text-amber-700 font-bold">{filteredScPersonnel.length}</strong> người vi phạm ({scViolationCount} lỗi thuộc PXSC)</>
                    )}
                    {drilldownType === 'PXVH_DOCS' && (
                      <>Tổng cộng: <strong className="text-blue-700 font-bold">{filteredVhDocs.length}</strong> phiếu/lệnh có lỗi thuộc trách nhiệm PXVH</>
                    )}
                    {drilldownType === 'PXSC_DOCS' && (
                      <>Tổng cộng: <strong className="text-amber-700 font-bold">{filteredScDocs.length}</strong> phiếu/lệnh có lỗi thuộc trách nhiệm PXSC</>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDrilldownType(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter inside modal */}
            <div className="px-6 py-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearchTerm}
                  onChange={(e) => setModalSearchTerm(e.target.value)}
                  placeholder={
                    drilldownType === 'PXVH_PERSONNEL' || drilldownType === 'PXSC_PERSONNEL'
                      ? 'Tìm kiếm nhanh theo họ tên nhân sự, chức danh, mã phiếu hoặc lỗi vi phạm...'
                      : 'Tìm kiếm nhanh mã phiếu, người CHTT, đơn vị hoặc nội dung vi phạm...'
                  }
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* TRƯỜNG HỢP 1: NGƯỜI VI PHẠM (PXVH hoặc PXSC) */}
              {(drilldownType === 'PXVH_PERSONNEL' || drilldownType === 'PXSC_PERSONNEL') && (
                (() => {
                  const pList = drilldownType === 'PXVH_PERSONNEL' ? filteredVhPersonnel : filteredScPersonnel;
                  const isVh = drilldownType === 'PXVH_PERSONNEL';

                  if (pList.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs">Không tìm thấy người vi phạm nào phù hợp với từ khóa.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {pList.map((person, idx) => (
                        <div
                          key={person.name || idx}
                          className={`p-4 rounded-xl border ${
                            isVh ? 'border-blue-200 bg-blue-50/20' : 'border-amber-200 bg-amber-50/20'
                          } hover:bg-white hover:shadow-xs transition`}
                        >
                          {/* Person Header */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full ${
                                  isVh ? 'bg-blue-600' : 'bg-amber-600'
                                } text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                              >
                                {person.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                  <span>{person.name}</span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      isVh ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'
                                    }`}
                                  >
                                    {person.role}
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500 font-medium">{person.unit}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold font-mono">
                                {person.violationCount} lỗi vi phạm
                              </span>
                              <span
                                className={`px-2.5 py-1 rounded-full ${
                                  isVh ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-900'
                                } text-xs font-bold font-mono`}
                              >
                                {person.docs.length} phiếu/lệnh liên quan
                              </span>
                            </div>
                          </div>

                          {/* Chi tiết từng phiếu và lỗi vi phạm của người này */}
                          <div className="mt-3 space-y-2">
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                              Chi tiết các phiếu/lệnh & sai sót cụ thể của nhân sự:
                            </span>
                            {person.docs.map((d, dIdx) => (
                              <div
                                key={dIdx}
                                className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-2xs"
                              >
                                <div className="flex items-center justify-between gap-2 text-[11px] pb-1.5 border-b border-slate-100 font-mono mb-1.5">
                                  <span
                                    className={`font-bold ${
                                      isVh ? 'text-blue-700' : 'text-amber-800'
                                    } flex items-center gap-1.5`}
                                  >
                                    <span
                                      className={`px-1.5 py-0.5 rounded ${
                                        isVh ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                      } font-bold`}
                                    >
                                      {d.docType}
                                    </span>
                                    <span>{d.code}</span>
                                  </span>
                                  <span className="text-slate-500">{d.date}</span>
                                </div>
                                <div className="text-slate-700 mb-1.5">
                                  <strong className="text-slate-900">Công việc:</strong> {d.jobName}
                                </div>
                                <div className="bg-rose-50/80 p-2.5 rounded-lg border border-rose-100 text-rose-900 text-xs">
                                  <p className="font-medium flex items-start gap-1.5">
                                    <span className="text-rose-600 font-black">•</span>
                                    <span>{d.content}</span>
                                  </p>
                                  {d.reason && (
                                    <p className="text-[10px] text-rose-700/80 font-mono mt-1 pl-3">
                                      Căn cứ: {d.reason}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}

              {/* TRƯỜNG HỢP 2: PHIẾU/LỆNH VI PHẠM THEO PHÂN XƯỞNG (PXVH_DOCS hoặc PXSC_DOCS) */}
              {(drilldownType === 'PXVH_DOCS' || drilldownType === 'PXSC_DOCS') && (
                (() => {
                  const docList = drilldownType === 'PXVH_DOCS' ? filteredVhDocs : filteredScDocs;
                  const isVh = drilldownType === 'PXVH_DOCS';

                  if (docList.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-400">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs">Không tìm thấy phiếu/lệnh vi phạm nào phù hợp với từ khóa.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {docList.map((doc, idx) => (
                        <div
                          key={doc.docNumber || idx}
                          className={`p-4 rounded-xl border ${
                            isVh ? 'border-blue-200 bg-blue-50/20' : 'border-amber-200 bg-amber-50/20'
                          } hover:bg-white hover:shadow-xs transition`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  doc.docType === 'PCT'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {doc.docType}
                              </span>
                              <span className="font-mono text-sm font-black text-slate-900">
                                {doc.code}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              Ngày thực hiện: {doc.date}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2.5 text-xs">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                                Công việc & Đơn vị:
                              </span>
                              <p className="font-semibold text-slate-800">{doc.jobName}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5">{doc.unit}</p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                                Nhân sự liên đới:
                              </span>
                              {doc.leader && (
                                <p className="text-slate-700">
                                  Người CHTT: <strong className="text-slate-900">{doc.leader}</strong>
                                </p>
                              )}
                              {doc.issuer && (
                                <p className="text-slate-600 text-[11px]">
                                  Người cấp phiếu: {doc.issuer}
                                </p>
                              )}
                              {'approver' in doc && (doc as any).approver && !(doc as any).approver.includes('Không áp dụng') && (
                                <p className="text-slate-500 text-[11px]">
                                  Người cho phép: {(doc as any).approver}
                                </p>
                              )}
                              {'workers' in doc && (doc as any).workers && (
                                <p className="text-slate-500 text-[11px]">
                                  Nhân viên: {(doc as any).workers}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Errors list for this document */}
                          <div className="mt-2 pt-2 border-t border-slate-200">
                            <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider flex items-center gap-1 mb-1.5">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Lỗi thuộc trách nhiệm {isVh ? 'PXVH' : 'PXSC'} ({doc.violations.length} lỗi):</span>
                            </span>
                            <div className="space-y-1.5">
                              {doc.violations.map((v, vIdx) => (
                                <div
                                  key={vIdx}
                                  className="bg-white p-2.5 rounded-lg border border-rose-200 text-xs flex items-start gap-2 shadow-2xs"
                                >
                                  <span className="text-rose-600 font-black text-sm leading-tight">•</span>
                                  <div className="flex-1">
                                    <p className="text-slate-800 font-medium">{v.content}</p>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      <span
                                        className={`text-[10px] font-bold ${
                                          isVh ? 'text-blue-700 bg-blue-50' : 'text-amber-800 bg-amber-50'
                                        } px-1.5 py-0.5 rounded`}
                                      >
                                        Nhân sự: {v.person}
                                      </span>
                                      {v.reason && (
                                        <span className="text-[10px] text-slate-500 font-mono">
                                          Căn cứ: {v.reason}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
              )}

              {/* TRƯỜNG HỢP 3: XEM CHI TIẾT DANH SÁCH PHIẾU/LỆNH CHUNG (PCT, LCT, ALL) */}
              {(drilldownType === 'PCT' || drilldownType === 'LCT' || drilldownType === 'ALL') && (
                activeModalRecords.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs">Không tìm thấy phiếu/lệnh vi phạm nào phù hợp với từ khóa.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeModalRecords.map((rec, idx) => (
                      <div
                        key={rec.id || idx}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-xs transition"
                      >
                        {/* Top Bar: Code, Type, Date, Personnel */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                rec.documentType === 'PCT'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {rec.documentType}
                            </span>
                            <span className="font-mono text-sm font-black text-slate-900">
                              {rec.code}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            Ngày kiểm: {rec.auditDate || `Tháng ${rec.month}/${rec.year}`}
                          </div>
                        </div>

                        {/* Content: Job & Personnel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2.5 text-xs">
                          <div>
                            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                              Công việc & Đơn vị:
                            </span>
                            <p className="font-semibold text-slate-800">{rec.jobName}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{rec.unit}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-0.5">
                              Chức danh liên quan:
                            </span>
                            <p className="text-slate-700">
                              Người CHTT: <strong className="text-slate-900">{rec.leader}</strong>
                            </p>
                            <p className="text-slate-600 text-[11px]">
                              Người cấp phiếu: {rec.issuer}
                            </p>
                            {rec.approver && !rec.approver.includes('Không áp dụng') && (
                              <p className="text-slate-500 text-[11px]">
                                Người cho phép: {rec.approver}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Errors list for this document */}
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <span className="text-[10px] font-bold uppercase text-rose-700 tracking-wider flex items-center gap-1 mb-1.5">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Nội dung vi phạm phát hiện ({rec.parsedErrors.length} lỗi):</span>
                          </span>
                          <div className="space-y-1.5">
                            {rec.parsedErrors.map((err, eIdx) => (
                              <div
                                key={err.id || eIdx}
                                className="bg-white p-2.5 rounded-lg border border-rose-200 text-xs flex items-start gap-2"
                              >
                                <span className="text-rose-600 font-black text-sm leading-tight">•</span>
                                <div className="flex-1">
                                  <p className="text-slate-800 font-medium">{err.message}</p>
                                  {err.ruleReference && (
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                      Căn cứ: {err.ruleReference}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setDrilldownType(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
              >
                Đóng danh sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Đăng nhập Quản trị viên để mở quyền chỉnh sửa báo cáo */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác thực Quản trị viên</h3>
                <p className="text-xs text-slate-500">Nhập mật khẩu Admin để chỉnh sửa nội dung báo cáo</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu Admin
                </label>
                <input
                  type="password"
                  value={adminPinInput}
                  onChange={(e) => {
                    setAdminPinInput(e.target.value);
                    setAdminPinError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyAdmin();
                  }}
                  placeholder="Nhập mật khẩu Admin..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                  autoFocus
                />
                {adminPinError && <p className="text-xs text-rose-600 mt-1">{adminPinError}</p>}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminPinInput('');
                    setAdminPinError('');
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleVerifyAdmin}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Mở quyền sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Danh sách gợi ý nội dung Đánh giá & Kiến nghị */}
      {showSuggestionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Danh sách gợi ý nội dung Kiến nghị ({SUGGESTED_RECOMMENDATIONS_LIST.length} nội dung)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Các ý kiến nghị mẫu chuẩn theo kết luận và chỉ đạo của Phân xưởng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSuggestionsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            {isAdmin && (
              <div className="px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-indigo-900 font-medium">
                  Chế độ Quản trị viên: Có thể bấm &ldquo;Chèn vào báo cáo&rdquo; từng ý hoặc áp dụng cả bộ 4 ý gốc.
                </span>
                <button
                  type="button"
                  onClick={handleApplyAllDefaultSuggestions}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition cursor-pointer shrink-0"
                >
                  Áp dụng bộ 4 ý chuẩn gốc
                </button>
              </div>
            )}

            {/* Suggestions List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {SUGGESTED_RECOMMENDATIONS_LIST.map((item, idx) => {
                const isAlreadyAdded = recommendations.includes(item.content);
                const isJustInserted = suggestionInsertedId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white transition space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800">
                          {idx + 1}. {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Nút sao chép văn bản */}
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.content);
                            setSuggestionInsertedId(item.id);
                            setTimeout(() => setSuggestionInsertedId(null), 2000);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition cursor-pointer"
                          title="Sao chép nội dung vào bộ nhớ tạm"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Sao chép</span>
                        </button>

                        {/* Nút chèn vào báo cáo (dành cho Admin) */}
                        {isAdmin && (
                          <>
                            {isJustInserted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-lg animate-in fade-in">
                                <Check className="w-3 h-3" />
                                <span>Đã chèn!</span>
                              </span>
                            ) : isAlreadyAdded ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <Check className="w-3 h-3" />
                                <span>Đã có trong báo cáo</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleInsertSuggestion(item.content, item.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>+ Chèn vào báo cáo</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed text-justify whitespace-pre-wrap pl-1 border-l-2 border-indigo-200">
                      {item.content}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 italic">
                Nguồn: Tổng hợp chỉ đạo chuyên môn Phân xưởng Vận hành Ialy
              </span>
              <button
                type="button"
                onClick={() => setShowSuggestionsModal(false)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Quản lý, tải ảnh và cắt chữ ký điện tử */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        members={auditMembers}
        leaderName="Trần Thanh Chương"
        initialTargetName={sigModalTarget}
        onSignatureUpdated={handleSignatureUpdated}
      />
    </div>
  );
};
