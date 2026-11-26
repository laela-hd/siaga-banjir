import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { DEFAULT_PEKALONGAN_LOCATIONS } from '../../services/weatherService';

const HEIGHT_OPTIONS = [
  {
    id: 'rendah',
    label: '±15 cm (Semata Kaki)',
    desc: 'Genangan ringan di permukaan jalan, masih bisa dilalui motor & mobil.',
    color: '#0D9488',
    bg: '#CCFBF1',
  },
  {
    id: 'sedang',
    label: '±40 cm (Selutut)',
    desc: 'Rawan mogok untuk sepeda motor & sedan rendah. Disarankan cari jalur alternatif.',
    color: '#B45309',
    bg: '#FEF3C7',
  },
  {
    id: 'tinggi',
    label: '±75 cm (Sepinggang)',
    desc: 'Akses jalan lumpuh total & berpotensi masuk ke permukiman warga.',
    color: '#B91C1C',
    bg: '#FEE2E2',
  },
];

export default function LaporanScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  const [selectedLoc, setSelectedLoc] = useState(DEFAULT_PEKALONGAN_LOCATIONS[0]);
  const [street, setStreet] = useState('');
  const [waterHeight, setWaterHeight] = useState(HEIGHT_OPTIONS[1]);
  const [desc, setDesc] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);

  const notifyUser = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubmit = () => {
    if (!street.trim()) {
      notifyUser(
        'Data Belum Lengkap',
        'Mohon isi nama jalan atau patokan lokasi genangan terlebih dahulu.'
      );
      return;
    }

    notifyUser(
      'Laporan Berhasil Dikirim',
      `Lokasi: ${street} (${selectedLoc.label})\nKetinggian Air: ${waterHeight.label}\n\nLaporan Anda telah diteruskan ke sistem verifikasi admin SIAGA BANJIR.`
    );
    setStreet('');
    setDesc('');
    setPhotoName(null);
  };

  return (
    <View style={styles.root}>
      {/* HEADER ATAS */}
      <View style={styles.header}>
        <View style={[styles.headerInner, isDesktop && styles.maxContainer]}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="megaphone" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Kirim Laporan Kejadian Banjir</Text>
              <Text style={styles.headerSub}>
                Partisipasi warga untuk pemetaan genangan aktual Kota & Kab. Pekalongan
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* KONTEN UTAMA RESPONSIF */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.maxContainer,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {/* KOLOM KIRI: FORMULIR PELAPORAN */}
          <View style={[styles.formCard, isDesktop && { flex: 1.35 }]}>
            <View style={styles.cardHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>FORMULIR LAPORAN CEPAT</Text>
              </View>
              <Text style={styles.formHeading}>Detail Lokasi & Ketinggian Air</Text>
            </View>

            {/* 1. Pilih Kecamatan */}
            <Text style={styles.label}>1. Pilih Wilayah Kecamatan</Text>
            <View style={styles.chipWrap}>
              {DEFAULT_PEKALONGAN_LOCATIONS.map((loc) => {
                const active = loc.id === selectedLoc.id;
                return (
                  <TouchableOpacity
                    key={loc.id}
                    onPress={() => setSelectedLoc(loc)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {loc.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 2. Nama Jalan / Patokan */}
            <Text style={styles.label}>2. Nama Jalan / Patokan Spesifik *</Text>
            <View style={styles.inputBox}>
              <Ionicons name="location-outline" size={18} color="#64748B" />
              <TextInput
                value={street}
                onChangeText={setStreet}
                placeholder="Contoh: Depan Pasar Banjarsari / Jl. Raya Tirto Gg. 4"
                placeholderTextColor="#94A3B8"
                style={styles.textInput}
              />
            </View>

            {/* 3. Perkiraan Ketinggian Air */}
            <Text style={styles.label}>3. Perkiraan Ketinggian Genangan Air</Text>
            <View style={{ gap: 8, marginBottom: 14 }}>
              {HEIGHT_OPTIONS.map((opt) => {
                const active = waterHeight.id === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setWaterHeight(opt)}
                    style={[
                      styles.radioCard,
                      active && {
                        backgroundColor: opt.bg,
                        borderColor: opt.color,
                      },
                    ]}
                  >
                    <View style={styles.radioTop}>
                      <Ionicons
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={active ? opt.color : '#94A3B8'}
                      />
                      <Text
                        style={[
                          styles.radioTitle,
                          active && { color: opt.color, fontWeight: '800' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    <Text style={styles.radioDesc}>{opt.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 4. Keterangan Tambahan */}
            <Text style={styles.label}>4. Keterangan Kondisi Lapangan</Text>
            <TextInput
              value={desc}
              onChangeText={setDesc}
              placeholder="Ceritakan kondisi arus air, apakah jalan masih bisa dilewati motor/mobil, atau ada warga yang butuh evakuasi..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />

            {/* 5. Unggah Bukti Foto */}
            <Text style={styles.label}>5. Bukti Foto Kondisi Lapangan</Text>
            <TouchableOpacity
              style={[styles.photoBtn, photoName && styles.photoBtnUploaded]}
              onPress={() => {
                setPhotoName('foto_genangan_lapangan.jpg');
                notifyUser(
                  'Lampiran Foto',
                  'Simulasi pemilihan foto bukti lapangan berhasil dilampirkan.'
                );
              }}
            >
              <Ionicons
                name={photoName ? 'checkmark-circle' : 'camera-outline'}
                size={20}
                color={photoName ? '#0D9488' : COLORS.primary}
              />
              <Text
                style={[
                  styles.photoText,
                  photoName && { color: '#0F766E' },
                ]}
              >
                {photoName
                  ? `Foto Terlampir: ${photoName}`
                  : 'Pilih atau Ambil Foto Kondisi Air'}
              </Text>
            </TouchableOpacity>

            {/* Tombol Kirim */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <Text style={styles.submitText}>Kirim Laporan untuk Verifikasi</Text>
            </TouchableOpacity>
          </View>

          {/* KOLOM KANAN: PRATINJAU RINGKASAN & PANDUAN PELAPORAN */}
          <View style={[styles.sideColumn, isDesktop && { flex: 0.85 }]}>
            {/* Kartu Pratinjau Laporan */}
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
                <Text style={styles.previewTitle}>Pratinjau Laporan Anda</Text>
              </View>

              <View style={styles.previewBox}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewKey}>Wilayah:</Text>
                  <Text style={styles.previewVal}>{selectedLoc.label}</Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewKey}>Koordinat Pusat:</Text>
                  <Text style={styles.previewVal}>
                    {selectedLoc.latitude.toFixed(4)}, {selectedLoc.longitude.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewKey}>Patokan Jalan:</Text>
                  <Text style={styles.previewVal}>
                    {street.trim() ? street : '(Belum diisi)'}
                  </Text>
                </View>
                <View style={styles.previewRow}>
                  <Text style={styles.previewKey}>Tinggi Air:</Text>
                  <View
                    style={[
                      styles.heightPill,
                      { backgroundColor: waterHeight.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.heightPillText,
                        { color: waterHeight.color },
                      ]}
                    >
                      {waterHeight.label}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Kartu Panduan & Etika Pelaporan */}
            <View style={styles.guideCard}>
              <View style={styles.previewHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#0D9488" />
                <Text style={styles.previewTitle}>Panduan Pelaporan Valid</Text>
              </View>

              <View style={{ gap: 10 }}>
                <View style={styles.guideItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#0D9488" />
                  <Text style={styles.guideText}>
                    Pastikan Anda berada di lokasi aman saat mengambil foto kondisi genangan.
                  </Text>
                </View>
                <View style={styles.guideItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#0D9488" />
                  <Text style={styles.guideText}>
                    Gunakan objek pembanding (ban kendaraan, trotoar, atau pagar) agar tinggi air mudah diverifikasi admin.
                  </Text>
                </View>
                <View style={styles.guideItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#0D9488" />
                  <Text style={styles.guideText}>
                    Laporan yang telah diverifikasi admin akan otomatis muncul di halaman Beranda dan Peta Banjir.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF2F6' },
  maxContainer: { width: '100%', maxWidth: 1200, alignSelf: 'center' },

  // Header
  header: {
    backgroundColor: '#0F294A',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerInner: { flexDirection: 'row', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  headerSub: { color: '#CBD5E1', fontSize: 11.5, marginTop: 1 },

  // Content & Grid
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  desktopGrid: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  mobileStack: { flexDirection: 'column', gap: 16 },
  sideColumn: { gap: 16 },

  // Form Card
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  stepBadgeText: { fontSize: 10, fontWeight: '800', color: '#EA580C' },
  formHeading: { fontSize: 16, fontWeight: '800', color: '#0F172A' },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 8,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0F294A', borderColor: '#0F294A' },
  chipText: { fontSize: 11.5, fontWeight: '700', color: '#334155' },
  chipTextActive: { color: '#FFFFFF' },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 10,
    gap: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    height: 88,
    textAlignVertical: 'top',
    marginBottom: 10,
  },

  radioCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  radioTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  radioDesc: { fontSize: 11.5, color: '#64748B', marginTop: 4, marginLeft: 26 },

  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  photoBtnUploaded: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
    borderStyle: 'solid',
  },
  photoText: { fontSize: 12.5, fontWeight: '700', color: COLORS.primary },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  submitText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },

  // Side Cards
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  previewTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  previewKey: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  previewVal: { fontSize: 12.5, color: '#0F172A', fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  heightPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  heightPillText: { fontSize: 11, fontWeight: '800' },
  guideItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  guideText: { flex: 1, fontSize: 12, color: '#475569', lineHeight: 18 },
});