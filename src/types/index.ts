export type UserRole = 'masyarakat' | 'relawan' | 'admin';
export type DangerLevel = 'aman' | 'waspada' | 'bahaya';
export type VerificationStatus = 'menunggu' | 'diverifikasi' | 'ditolak';
export type DataAvailabilityStatus = 'success' | 'cached' | 'empty' | 'error';

export interface DataProvenance {
  sourceName: string;
  publishedAt: string;
  fetchedAt: string;
  status: DataAvailabilityStatus;
  errorMessage?: string;
}

export interface UserProfile {
  uid: string;
  nama: string;
  email: string;
  role: UserRole;
  kecamatanPantauan: string;
  noHp?: string;
}

export interface ForecastItem {
  waktuLokal: string;
  suhu: number;
  kondisi: string;
  kelembapan: number;
  kecepatanAnginKmh: number;
  curahHujanMm: number;
}

export interface DailyForecastItem {
  tanggal: string;
  suhuMax: number;
  suhuMin: number;
  kondisi: string;
  curahHujanTotalMm: number;
}

export interface RealWeatherData {
  wilayahLabel: string;
  detailLokasi: string;
  suhu: number;
  kondisi: string;
  kelembapan: number;
  kecepatanAnginKmh: number;
  curahHujanMm: number;
  waktuPrakiraan: string;
  prakiraanBerikutnya: ForecastItem[];
  prakiraan7Hari: DailyForecastItem[];
  provenance: DataProvenance;
}

export interface FloodReport {
  id: string;
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
  fotoUrl?: string;
  statusVerifikasi: VerificationStatus;
  waktuLaporan: string;
  sumberLaporan: string;
}

export interface EvacuationPoint {
  id: string;
  namaPosko: string;
  alamat: string;
  kecamatan: string;
  koordinat: {
    latitude: number;
    longitude: number;
  };
  kapasitasMaks?: number;
  terisi?: number;
  status: 'siaga' | 'penuh' | 'tutup';
  sumberResmi: string;
  waktuVerifikasiData: string;
}

export interface AppNotification {
  id: string;
  judul: string;
  pesan: string;
  tipe: 'peringatan' | 'verifikasi' | 'info';
  waktu: string;
  sumber: string;
  laporanId?: string;
}