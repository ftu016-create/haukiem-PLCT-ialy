import { PctStatistics, LctStatistics } from '../types/report';

export interface PctPercentages {
  notExecutedPct: string;
  paperFormPct: string;
  inProgressPct: string;
  nonCompliantPct: string;
}

export interface LctPercentages {
  notExecutedPct: string;
  paperFormPct: string;
  nonCompliantPct: string;
}

export function formatPercent(num: number, total: number): string {
  if (!total || total <= 0 || isNaN(num) || num <= 0) return '0%';
  const val = (num / total) * 100;
  if (Math.round(val) === val) {
    return `${val}%`;
  }
  // Up to 2 decimal places with comma separation like "2,04%"
  const formatted = val.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
  return `${formatted}%`;
}

export function calculatePctPercentages(stats: PctStatistics): PctPercentages {
  const total = stats.totalIssued || 0;
  return {
    notExecutedPct: formatPercent(stats.notExecuted, total),
    paperFormPct: formatPercent(stats.paperForm, total),
    inProgressPct: formatPercent(stats.inProgress, total),
    nonCompliantPct: formatPercent(stats.nonCompliant, total),
  };
}

export function calculateLctPercentages(stats: LctStatistics): LctPercentages {
  const total = stats.totalIssued || 0;
  return {
    notExecutedPct: formatPercent(stats.notExecuted, total),
    paperFormPct: formatPercent(stats.paperForm, total),
    nonCompliantPct: formatPercent(stats.nonCompliant, total),
  };
}

export function formatVietnameseDate(location: string, dateStr: string): string {
  if (!dateStr) return `${location}, ngày ... tháng ... năm ...`;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const y = parts[0];
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    return `${location}, ngày ${d < 10 ? '0' + d : d} tháng ${m < 10 ? '0' + m : m} năm ${y}`;
  }
  return `${location}, ngày ${dateStr}`;
}
