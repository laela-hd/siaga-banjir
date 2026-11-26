import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import {
  DangerLevel,
  DataProvenance,
  EvacuationPoint,
  FloodReport,
  VerificationStatus,
} from '../types';

const REPORTS_COLLECTION = 'laporan_banjir';
const EVACUATION_COLLECTION = 'titik_evakuasi';

const formatNowWib = (): string =>
  new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';

const formatFirestoreTime = (rawTime: any): string => {
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

const isInsidePekalonganBounds = (lat: number, lon: number): boolean => {
  return lat >= -7.25 && lat <= -6.82 && lon >= 109.42 && lon <= 109.76;
};

// 1. AMBIL LAPORAN NYATA DARI PETABENCANA OPEN API
export const fetchPetaBencanaPekalonganReports = async (): Promise<{
  reports: FloodReport[];
  provenance: DataProvenance;
}> => {
  const fetchedAt = formatNowWib();
  const endpoints = [
    'https://api.petabencana.id/reports?disaster=flood&timeperiod=259200',
    'https://data.petabencana.id/reports?disaster=flood&timeperiod=259200',
  ];

  let lastError = 'Server PetaBencana tidak dapat dijangkau jaringan perangkat.';

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SiagaBanjirPekalongan/1.0',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      const features: any[] = json?.result?.features || [];

      const filtered: FloodReport[] = features
        .filter((f) => {
          const coords = f?.geometry?.coordinates;
          if (!Array.isArray(coords) || coords.length < 2) return false;
          const [lon, lat] = coords;
          return isInsidePekalonganBounds(Number(lat), Number(lon));
        })
        .map((f, index) => {
          const [lon, lat] = f.geometry.coordinates;
          const props = f.properties || {};
          const reportData = props.report_data || {};
          const rawDepth =
            typeof reportData.flood_depth === 'number'
              ? reportData.flood_depth
              : null;

          let danger: DangerLevel = 'waspada';
          if (rawDepth !== null && rawDepth >= 70) danger = 'bahaya';
          else if (rawDepth !== null && rawDepth < 20) danger = 'aman';

          return {
            id: `pb_${props.pkey || index}`,
            userId: 'petabencana_external',
            pelaporNama: `Sumber Eksternal (${props.source || 'PetaBencana'})`,
            wilayah: Number(lat) > -6.92 ? 'Kota Pekalongan' : 'Kabupaten Pekalongan',
            kecamatan: props.tags?.district || 'Wilayah Pekalongan',
            alamatSingkat: props.title || props.text || 'Laporan Banjir PetaBencana',
            koordinat: {
              latitude: Number(lat),
              longitude: Number(lon),
            },
            ketinggianCm: rawDepth,
            kategoriBahaya: danger,
            deskripsi: props.text || 'Tidak ada deskripsi tambahan dari sumber PetaBencana.',
            fotoUrl: props.image_url || '',
            statusVerifikasi: 'diverifikasi',
            waktuLaporan: props.created_at || 'Waktu tidak tersedia',
            sumberLaporan: 'PetaBencana.id Open API',
          };
        });

      return {
        reports: filtered,
        provenance: {
          sourceName: 'PetaBencana.id Open API (disaster=flood)',
          publishedAt: filtered[0]?.waktuLaporan || 'Tidak ada kejadian baru',
          fetchedAt,
          status: filtered.length > 0 ? 'success' : 'empty',
        },
      };
    } catch (err: any) {
      lastError = err?.message?.includes('UnknownHost')
        ? 'Domain PetaBencana tidak teresolusi oleh DNS jaringan perangkat.'
        : `Koneksi PetaBencana gagal (${err?.message || 'Network Error'}).`;
    }
  }

  return {
    reports: [],
    provenance: {
      sourceName: 'PetaBencana.id Open API (disaster=flood)',
      publishedAt: '-',
      fetchedAt,
      status: 'error',
      errorMessage: lastError,
    },
  };
};

// 2. AMBIL KOORDINAT GPS NYATA PERANGKAT
export const getCurrentGpsCoordinates = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Izin akses lokasi GPS ditolak.');
  }
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude: Number(loc.coords.latitude.toFixed(6)),
    longitude: Number(loc.coords.longitude.toFixed(6)),
  };
};

// 3. AMBIL URI FOTO DARI KAMERA ATAU GALERI
export const pickFloodPhotoUri = async (
  source: 'camera' | 'gallery'
): Promise<string | null> => {
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Izin kamera ditolak.');
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6,
    });
    return !result.canceled && result.assets[0]?.uri ? result.assets[0].uri : null;
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Izin galeri ditolak.');
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.6,
    });
    return !result.canceled && result.assets[0]?.uri ? result.assets[0].uri : null;
  }
};

// 4. UNGGAH FOTO KE FIREBASE STORAGE
export const uploadFloodPhotoToStorage = async (
  userId: string,
  localUri: string
): Promise<string> => {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const filename = `laporan/${userId}_${Date.now()}.jpg`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
};

// 5. CREATE LAPORAN NYATA KE FIRESTORE
export interface CreateRealReportInput {
  userId: string;
  pelaporNama: string;
  wilayah: 'Kota Pekalongan' | 'Kabupaten Pekalongan';
  kecamatan: string;
  alamatSingkat: string;
  koordinat: {
    latitude: number;
    longitude: number;
  };
  ketinggianCm: number | null;
  kategoriBahaya: DangerLevel;
  deskripsi: string;
  localPhotoUri?: string | null;
}

export const createFloodReport = async (
  input: CreateRealReportInput
): Promise<string> => {
  let uploadedPhotoUrl = '';
  if (input.localPhotoUri) {
    uploadedPhotoUrl = await uploadFloodPhotoToStorage(
      input.userId,
      input.localPhotoUri
    );
  }

  const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
    userId: input.userId,
    pelaporNama: input.pelaporNama,
    wilayah: input.wilayah,
    kecamatan: input.kecamatan,
    alamatSingkat: input.alamatSingkat,
    koordinat: input.koordinat,
    ketinggianCm: input.ketinggianCm,
    kategoriBahaya: input.kategoriBahaya,
    deskripsi: input.deskripsi,
    fotoUrl: uploadedPhotoUrl,
    statusVerifikasi: 'menunggu' as VerificationStatus,
    sumberLaporan: 'Laporan Masyarakat (Aplikasi Siaga Banjir)',
    waktuLaporan: serverTimestamp(),
  });

  return docRef.id;
};

const mapDocToReport = (id: string, data: any): FloodReport => ({
  id,
  userId: data.userId || '',
  pelaporNama: data.pelaporNama || 'Warga Pekalongan',
  wilayah: data.wilayah || 'Kota Pekalongan',
  kecamatan: data.kecamatan || '-',
  alamatSingkat: data.alamatSingkat || '-',
  koordinat: data.koordinat,
  ketinggianCm:
    typeof data.ketinggianCm === 'number' ? data.ketinggianCm : null,
  kategoriBahaya: data.kategoriBahaya || 'waspada',
  deskripsi: data.deskripsi || '',
  fotoUrl: data.fotoUrl || '',
  statusVerifikasi: data.statusVerifikasi || 'menunggu',
  waktuLaporan: formatFirestoreTime(data.waktuLaporan),
  sumberLaporan: data.sumberLaporan || 'Laporan Masyarakat (Firestore)',
});

// 6. REALTIME LISTENER: LAPORAN TERVERIFIKASI DI FIRESTORE
export const subscribeVerifiedFirestoreReports = (
  callback: (reports: FloodReport[], error?: string) => void
) => {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where('statusVerifikasi', '==', 'diverifikasi'),
    orderBy('waktuLaporan', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => mapDocToReport(d.id, d.data()));
      callback(list);
    },
    (error) => {
      callback([], error.message);
    }
  );
};

// 7. REALTIME LISTENER: RIWAYAT LAPORAN USER
export const subscribeUserReports = (
  userId: string,
  callback: (reports: FloodReport[], error?: string) => void
) => {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('waktuLaporan', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => mapDocToReport(d.id, d.data()));
      callback(list);
    },
    (error) => {
      callback([], error.message);
    }
  );
};

// 8. REALTIME LISTENER: SEMUA LAPORAN UNTUK ADMIN
export const subscribeAllReportsForAdmin = (
  callback: (reports: FloodReport[], error?: string) => void
) => {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    orderBy('waktuLaporan', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => mapDocToReport(d.id, d.data()));
      callback(list);
    },
    (error) => {
      callback([], error.message);
    }
  );
};

// 9. READ DETAIL 1 LAPORAN
export const getFloodReportById = async (
  reportId: string
): Promise<FloodReport | null> => {
  const snap = await getDoc(doc(db, REPORTS_COLLECTION, reportId));
  if (!snap.exists()) return null;
  return mapDocToReport(snap.id, snap.data());
};

// 10. UPDATE & DELETE ADMIN
export const updateFloodReportStatus = async (
  reportId: string,
  statusVerifikasi: VerificationStatus
): Promise<void> => {
  await updateDoc(doc(db, REPORTS_COLLECTION, reportId), { statusVerifikasi });
};

export const deleteFloodReport = async (reportId: string): Promise<void> => {
  await deleteDoc(doc(db, REPORTS_COLLECTION, reportId));
};

// 11. TITIK EVAKUASI RESMI DARI FIRESTORE (TANPA DATA FIKTIF)
export const subscribeOfficialEvacuationPoints = (
  callback: (points: EvacuationPoint[], error?: string) => void
) => {
  const q = query(collection(db, EVACUATION_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: EvacuationPoint[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          namaPosko: data.namaPosko || 'Posko Resmi',
          alamat: data.alamat || '-',
          kecamatan: data.kecamatan || '-',
          koordinat: data.koordinat,
          kapasitasMaks: data.kapasitasMaks,
          terisi: data.terisi,
          status: data.status || 'siaga',
          sumberResmi: data.sumberResmi || 'BPBD Pekalongan',
          waktuVerifikasiData: formatFirestoreTime(data.updatedAt),
        };
      });
      callback(list);
    },
    (error) => {
      callback([], error.message);
    }
  );
};