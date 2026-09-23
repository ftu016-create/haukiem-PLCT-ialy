import { ReportData } from '../types/report';

export async function fetchReportsFromServer(): Promise<ReportData[] | null> {
  try {
    const res = await fetch('/api/reports');
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data.reports) && data.reports.length > 0) {
      return data.reports;
    }
  } catch (err) {
    console.warn('Cannot fetch reports from server, using local fallback:', err);
  }
  return null;
}

export async function saveReportToServer(report: ReportData): Promise<boolean> {
  try {
    const res = await fetch('/api/reports/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report }),
    });
    return res.ok;
  } catch (err) {
    console.error('Error saving report to server:', err);
    return false;
  }
}

export async function syncAllReportsToServer(reports: ReportData[]): Promise<boolean> {
  try {
    const res = await fetch('/api/reports/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reports }),
    });
    return res.ok;
  } catch (err) {
    console.error('Error syncing reports to server:', err);
    return false;
  }
}

export async function deleteReportFromServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/reports/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.error('Error deleting report from server:', err);
    return false;
  }
}
