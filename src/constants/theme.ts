export const COLORS = {
  // Properti lama agar WeatherCard, ReportCard, FloodStatusCard tidak error
  white: '#FFFFFF',
  black: '#000000',
  gray: '#64748B',
  lightGray: '#F1F5F9',
  danger: '#DC2626',
  warning: '#D97706',
  success: '#0D9488',
  info: '#0284C7',
  secondary: '#1E4E8C',
  text: '#0F172A',
  textSecondary: '#64748B',
  surface: '#FFFFFF',


  // Properti tema UI/UX baru
  primary: '#0F3460',
  primaryLight: '#1E4E8C',
  background: '#F4F7FA',
  desktopBg: '#E2E8F0',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textMain: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  amanBg: '#0D9488',
  amanSoft: '#CCFBF1',
  waspadaBg: '#D97706',
  waspadaSoft: '#FEF3C7',
  daruratBg: '#DC2626',
  daruratSoft: '#FEE2E2',
  fabOrange: '#EA580C',
};

// Wajib ada karena diimpor oleh WeatherCard.tsx, ReportCard.tsx, dll.
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export interface DistrictItem {
  id: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
  risk: 'aman' | 'waspada' | 'darurat';
}

export const PEKALONGAN_DISTRICTS: DistrictItem[] = [
  { id: 'pkl-barat', name: 'Pekalongan Barat', area: 'Kota Pekalongan', lat: -6.8898, lon: 109.6647, risk: 'waspada' },
  { id: 'pkl-utara', name: 'Pekalongan Utara', area: 'Kota Pekalongan', lat: -6.8686, lon: 109.6753, risk: 'darurat' },
  { id: 'pkl-timur', name: 'Pekalongan Timur', area: 'Kota Pekalongan', lat: -6.8925, lon: 109.6836, risk: 'aman' },
  { id: 'pkl-selatan', name: 'Pekalongan Selatan', area: 'Kota Pekalongan', lat: -6.9189, lon: 109.6728, risk: 'aman' },
  { id: 'tirto', name: 'Kec. Tirto', area: 'Kab. Pekalongan', lat: -6.8872, lon: 109.6381, risk: 'darurat' },
  { id: 'wiradesa', name: 'Kec. Wiradesa', area: 'Kab. Pekalongan', lat: -6.8856, lon: 109.6139, risk: 'waspada' },
  { id: 'buaran', name: 'Kec. Buaran', area: 'Kab. Pekalongan', lat: -6.9242, lon: 109.6542, risk: 'aman' },
  { id: 'kedungwuni', name: 'Kec. Kedungwuni', area: 'Kab. Pekalongan', lat: -6.9631, lon: 109.6464, risk: 'aman' },
  { id: 'kajen', name: 'Kec. Kajen', area: 'Kab. Pekalongan', lat: -7.0286, lon: 109.5919, risk: 'aman' },
];