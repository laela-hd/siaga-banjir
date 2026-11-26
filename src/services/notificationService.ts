import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { AppNotification } from '../types';

const NOTIFICATIONS_COLLECTION = 'notifikasi';

const formatTime = (rawTime: any): string => {
  if (!rawTime) return 'Waktu belum tercatat';
  if (rawTime instanceof Timestamp) {
    return (
      rawTime.toDate().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    );
  }
  return String(rawTime);
};

export interface CreateNotificationInput {
  judul: string;
  pesan: string;
  tipe: 'peringatan' | 'verifikasi' | 'info';
  laporanId?: string;
}

export const createBroadcastNotification = async (
  input: CreateNotificationInput
): Promise<void> => {
  await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
    ...input,
    sumber: 'Admin Siaga Banjir (Firestore)',
    createdAt: serverTimestamp(),
  });
};

export const subscribeNotifications = (
  callback: (items: AppNotification[]) => void
) => {
  const q = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: AppNotification[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          judul: d.judul || 'Peringatan Siaga Banjir',
          pesan: d.pesan || '',
          tipe: d.tipe || 'info',
          laporanId: d.laporanId || undefined,
          waktu: formatTime(d.createdAt),
          sumber: d.sumber || 'Admin Siaga Banjir (Firestore)',
        };
      });
      callback(list);
    },
    (error) => {
      console.warn('Info query notifikasi:', error.message);
      callback([]);
    }
  );
};