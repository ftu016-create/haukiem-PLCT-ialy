import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { ReportData } from './types/report';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with configured database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);

// Error handling specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on app start
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Real-time synchronization of all shared reports across computers
export function subscribeToSharedReports(
  onReports: (reports: ReportData[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const reportsCollection = collection(db, 'reports');
  return onSnapshot(
    reportsCollection,
    (snapshot) => {
      const reports: ReportData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ReportData;
        reports.push(data);
      });
      // Sort by updatedAt or createdAt descending
      reports.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      onReports(reports);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'reports');
      if (onError) onError(error);
    }
  );
}

// Save or update a single report to cloud
export async function saveReportToCloud(report: ReportData): Promise<void> {
  const path = `reports/${report.id}`;
  try {
    const docRef = doc(db, 'reports', report.id);
    const cleanData: ReportData = {
      ...report,
      updatedAt: report.updatedAt || new Date().toISOString(),
      createdAt: report.createdAt || new Date().toISOString(),
    };
    await setDoc(docRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete a report from cloud
export async function deleteReportFromCloud(reportId: string): Promise<void> {
  const path = `reports/${reportId}`;
  try {
    const docRef = doc(db, 'reports', reportId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Auto-migrate local reports from localStorage to cloud if not already present
export async function syncLocalReportsToCloud(localReports: ReportData[]): Promise<number> {
  if (!localReports || localReports.length === 0) return 0;
  try {
    const reportsCollection = collection(db, 'reports');
    const existingSnap = await getDocs(reportsCollection);
    const existingIds = new Set<string>();
    existingSnap.forEach((d) => existingIds.add(d.id));

    let uploadedCount = 0;
    const batch = writeBatch(db);

    for (const report of localReports) {
      if (!report.id) continue;
      if (!existingIds.has(report.id)) {
        const docRef = doc(db, 'reports', report.id);
        batch.set(docRef, report);
        uploadedCount++;
      }
    }

    if (uploadedCount > 0) {
      await batch.commit();
      console.log(`Đã đồng bộ ${uploadedCount} báo cáo từ máy cục bộ lên đám mây Firestore thành công.`);
    }
    return uploadedCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'reports');
    return 0;
  }
}

// Trigger initial connection test
testConnection();
