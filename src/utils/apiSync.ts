import { ReportData } from '../types/report';
import {
  saveReportToCloud,
  deleteReportFromCloud,
  syncLocalReportsToCloud,
  subscribeToSharedReports,
  db,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

export async function fetchReportsFromServer(): Promise<ReportData[] | null> {
  try {
    const colRef = collection(db, 'reports');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const reports: ReportData[] = [];
      snapshot.forEach((docSnap) => {
        reports.push(docSnap.data() as ReportData);
      });
      reports.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      return reports;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'reports');
  }
  return null;
}

export async function saveReportToServer(report: ReportData): Promise<boolean> {
  try {
    await saveReportToCloud(report);
    return true;
  } catch (err) {
    console.error('Error saving report to Firestore:', err);
    return false;
  }
}

export async function syncAllReportsToServer(reports: ReportData[]): Promise<boolean> {
  if (!reports || reports.length === 0) return true;
  try {
    const batch = writeBatch(db);
    for (const rep of reports) {
      if (rep.id) {
        batch.set(doc(db, 'reports', rep.id), {
          ...rep,
          updatedAt: rep.updatedAt || new Date().toISOString(),
        });
      }
    }
    await batch.commit();
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'reports');
    return false;
  }
}

export async function deleteReportFromServer(id: string): Promise<boolean> {
  try {
    await deleteReportFromCloud(id);
    return true;
  } catch (err) {
    console.error('Error deleting report from Firestore:', err);
    return false;
  }
}

export { subscribeToSharedReports, syncLocalReportsToCloud };
