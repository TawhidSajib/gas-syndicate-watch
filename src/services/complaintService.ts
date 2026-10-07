import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Complaint, UserProfile } from '../types';

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export const ADMIN_EMAILS = ['tawhidsajib9@gmail.com'];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export async function syncUserSession(userId: string, userName: string, userEmail: string): Promise<UserProfile> {
  const now = new Date();
  const sessionExpiresAt = new Date(now.getTime() + FIFTEEN_DAYS_MS).toISOString();

  // Strictly only store Gmail address and display name
  const userProfile: UserProfile = {
    userId,
    userName: userName || 'Citizen Reporter',
    userEmail: userEmail || '',
    lastLoginAt: now.toISOString(),
    sessionExpiresAt
  };

  const path = `users/${userId}`;
  try {
    await setDoc(doc(db, 'users', userId), userProfile, { merge: true });
    localStorage.setItem('gas_watch_session_expiry', sessionExpiresAt);
    return userProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function isSessionActive(): boolean {
  const expiry = localStorage.getItem('gas_watch_session_expiry');
  if (!expiry) return false;
  return new Date(expiry).getTime() > Date.now();
}

export async function createComplaint(
  data: Omit<Complaint, 'id' | 'createdAt' | 'expiresAt'>
): Promise<Complaint> {
  const now = new Date();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + FIFTEEN_DAYS_MS).toISOString();
  const complaintId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Construct clean payload without any undefined values to avoid Firestore setDoc errors
  const firestoreData: Record<string, unknown> = {
    id: complaintId,
    shopName: data.shopName,
    shopAddress: data.shopAddress,
    district: data.district,
    cylinderBrand: data.cylinderBrand,
    cylinderSize: data.cylinderSize,
    govtPrice: data.govtPrice,
    sellingPrice: data.sellingPrice,
    markupAmount: data.markupAmount,
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    status: data.status || 'active',
    createdAt,
    expiresAt
  };

  if (typeof data.syndicateTactic === 'string' && data.syndicateTactic.trim().length > 0) {
    firestoreData.syndicateTactic = data.syndicateTactic.trim();
  }
  if (typeof data.notes === 'string' && data.notes.trim().length > 0) {
    firestoreData.notes = data.notes.trim();
  }
  if (typeof data.evidencePhotoUrl === 'string' && data.evidencePhotoUrl.trim().length > 0) {
    firestoreData.evidencePhotoUrl = data.evidencePhotoUrl.trim();
  }

  const path = `complaints/${complaintId}`;
  try {
    // Only stores Gmail and name as requested
    await setDoc(doc(db, 'complaints', complaintId), firestoreData);
    return {
      ...data,
      id: complaintId,
      createdAt,
      expiresAt,
      status: data.status || 'active'
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchAllActiveComplaints(): Promise<Complaint[]> {
  const path = 'complaints';
  try {
    // Optimized query: limited to latest 100 complaints for fast performance
    const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'), limit(100));
    const snapshot = await getDocs(q);
    const now = Date.now();
    const activeComplaints: Complaint[] = [];
    const expiredIdsToDelete: string[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Complaint;
      const expireTime = new Date(data.expiresAt).getTime();
      if (expireTime <= now) {
        expiredIdsToDelete.push(docSnap.id);
      } else {
        activeComplaints.push({
          ...data,
          id: docSnap.id
        });
      }
    });

    // Asynchronously delete expired complaints past the 15-day limit
    if (expiredIdsToDelete.length > 0) {
      purgeExpiredComplaints(expiredIdsToDelete).catch((err) => {
        console.warn('Background cleanup of expired complaints notice:', err);
      });
    }

    return activeComplaints;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function fetchUserComplaints(userId: string): Promise<Complaint[]> {
  const path = 'complaints';
  try {
    const q = query(
      collection(db, 'complaints'),
      where('userId', '==', userId),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const now = Date.now();
    const userComplaints: Complaint[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as Complaint;
      const expireTime = new Date(data.expiresAt).getTime();
      if (expireTime > now) {
        userComplaints.push({
          ...data,
          id: docSnap.id
        });
      } else {
        // Auto-purge complaint past 15 days
        deleteDoc(doc(db, 'complaints', docSnap.id)).catch(() => {});
      }
    });

    // Sort by newest first
    userComplaints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return userComplaints;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteComplaintById(complaintId: string): Promise<void> {
  const path = `complaints/${complaintId}`;
  try {
    await deleteDoc(doc(db, 'complaints', complaintId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateComplaintStatus(
  complaintId: string,
  status: 'active' | 'under_review' | 'verified_syndicate'
): Promise<void> {
  const path = `complaints/${complaintId}`;
  try {
    await updateDoc(doc(db, 'complaints', complaintId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

async function purgeExpiredComplaints(ids: string[]): Promise<void> {
  for (const id of ids) {
    try {
      await deleteDoc(doc(db, 'complaints', id));
    } catch {
      // Ignore if already deleted or permission restricted
    }
  }
}

export function formatTimeRemaining(expiresAt: string): { text: string; daysLeft: number; isUrgent: boolean } {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) {
    return { text: 'Expired (purging...)', daysLeft: 0, isUrgent: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return {
      text: `${days}d ${hours}h left`,
      daysLeft: days,
      isUrgent: days <= 2
    };
  }

  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return {
    text: `${hours}h ${minutes}m left`,
    daysLeft: 0,
    isUrgent: true
  };
}
