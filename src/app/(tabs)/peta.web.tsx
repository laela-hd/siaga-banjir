import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { EvacuationPoint, FloodReport } from '../../types';
import {
  subscribeVerifiedFirestoreReports,
  fetchPetaBencanaPekalonganReports,
  subscribeOfficialEvacuationPoints,
} from '../../services/reportService';

// Koordinat default pusat Kota & Kab. Pekalongan
const DEFAULT_CENTER = {
  lat: -6.8898,
  lon: 109.6647,
  label: 'Pusat Pantauan Pekalongan',
};

export default function PetaWebScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  const [firestoreReports, setFirestoreReports] = useState<FloodReport[]>([]);
  const [pbReports, setPbReports] = useState<FloodReport[]>([]);
  const [evacuationPoints, setEvacuationPoints] = useState<EvacuationPoint[]>([]);

  // State UI/UX Interaktif
  const [activeTab, setActiveTab] = useState<'banjir' | 'evakuasi'>('banjir');
  const [focusedPin, setFocusedPin] = useState<{
    lat: number;
    lon: number;
    label: string;
    sub?: string;
  }>(DEFAULT_CENTER);

  useEffect(() => {
    const unsub1 = subscribeVerifiedFirestoreReports(setFirestoreReports);
    const unsub2 = subscribeOfficialEvacuationPoints(setEvacuationPoints);
    fetchPetaBencanaPekalonganReports().then((res) => setPbReports(res.reports));
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const validReports = [...firestoreReports, ...pbReports];

  // Otomatis arahkan peta ke laporan pertama jika tersedia
  useEffect(() => {
    if (validReports.length > 0 && focusedPin.label === DEFAULT_CENTER.label) {
      const first = validReports[0];
      setFocusedPin({
        lat: first.koordinat.latitude,
        lon: first.koordinat.longitude,
        label: first.alamatSingkat,
        sub: `Kec. ${first.kecamatan} • ${first.sumberLaporan}`,
      });
    }
  }, [validReports.length]);

  const openGoogleMaps = (lat: number, lon: number) => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
  };

  // URL Embed OpenStreetMap dinamis sesuai koordinat terpilih
  const delta = 0.015;
  const bbox = `${focusedPin.lon - delta},${focusedPin.lat - delta},${
    focusedPin.lon + delta
  },${focusedPin.lat + delta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${focusedPin.lat},${focusedPin.lon}`;

  return (
    <View style={styles.root}>
      {/* HEADER ATAS PETA */}
      <View style={styles.header}>
        <View style={[styles.headerInner, isDesktop && styles.maxContainer]}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="map" size={20} color="#38BDF8" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Peta Sebaran Banjir & Evakuasi</Text>
              <Text style={styles.headerSub}>
                Visualisasi Spasial Titik Genangan & Posko Pengungsian Pekalongan
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.resetMapBtn}
            onPress={() => setFocusedPin(DEFAULT_CENTER)}
          >
            <Ionicons name="locate" size={15} color="#FFFFFF" />
            <Text style={styles.resetMapText}>Pusat Pekalongan</Text>
          </TouchableOpacity>
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
        {/* 3 RINGKASAN METRIK SPASIAL */}
        <View style={styles.metricsBar}>
          <View style={[styles.metricCard, { borderLeftColor: '#DC2626' }]}>
            <View style={[styles.metricIconBox, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning" size={18} color="#DC2626" />
            </View>
            <View>
              <Text style={styles.metricValue}>{validReports.length} Titik</Text>
              <Text style={styles.metricLabel}>Banjir Terverifikasi</Text>
            </View>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#0D9488' }]}>
            <View style={[styles.metricIconBox, { backgroundColor: '#CCFBF1' }]}>
              <Ionicons name="medkit" size={18} color="#0D9488" />
            </View>
            <View>
              <Text style={styles.metricValue}>{evacuationPoints.length} Posko</Text>
              <Text style={styles.metricLabel}>Titik Evakuasi Resmi</Text>
            </View>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#0284C7' }]}>
            <View style={[styles.metricIconBox, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="compass" size={18} color="#0284C7" />
            </View>
            <View>
              <Text style={styles.metricValue} numberOfLines={1}>
                {focusedPin.lat.toFixed(4)}, {focusedPin.lon.toFixed(4)}
              </Text>
              <Text style={styles.metricLabel}>Fokus Koordinat Peta</Text>
            </View>
          </View>
        </View>

        {/* GRID 2 KOLOM DI DESKTOP / 1 KOLOM DI HP */}
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {/* KOLOM KIRI: KANVAS PETA INTERAKTIF */}
          <View style={[styles.mapPanel, isDesktop && { flex: 1.25 }]}>
            <View style={styles.mapPanelHeader}>
              <View style={styles.pinBadge}>
                <Ionicons name="pin" size={14} color="#DC2626" />
                <Text style={styles.pinBadgeText} numberOfLines={1}>
                  {focusedPin.label}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.openGmapsPill}
                onPress={() => openGoogleMaps(focusedPin.lat, focusedPin.lon)}
              >
                <Ionicons name="open-outline" size={13} color="#FFFFFF" />
                <Text style={styles.openGmapsText}>Google Maps</Text>
              </TouchableOpacity>
            </View>

            {/* Embed Peta Interaktif untuk Web */}
            <View style={styles.iframeWrapper}>
              {Platform.OS === 'web' ? (
                <iframe
                  title="Peta Siaga Banjir Pekalongan"
                  src={osmEmbedUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              ) : (
                <View style={styles.fallbackMap}>
                  <Ionicons name="map-outline" size={36} color={COLORS.primary} />
                  <Text style={styles.fallbackTitle}>{focusedPin.label}</Text>
                </View>
              )}
            </View>

            <View style={styles.mapFooterBar}>
              <Text style={styles.mapFooterInfo}>
                {focusedPin.sub ||
                  'Klik salah satu kartu lokasi di samping untuk memfokuskan titik koordinat pada peta.'}
              </Text>
            </View>
          </View>

          {/* KOLOM KANAN: DAFTAR TITIK BANJIR & POSKO EVAKUASI */}
          <View style={[styles.listPanel, isDesktop && { flex: 1 }]}>
            {/* Segmented Control */}
            <View style={styles.segmentWrap}>
              <TouchableOpacity
                onPress={() => setActiveTab('banjir')}
                style={[
                  styles.segmentBtn,
                  activeTab === 'banjir' && styles.segmentBtnActive,
                ]}
              >
                <Ionicons
                  name="water"
                  size={14}
                  color={activeTab === 'banjir' ? COLORS.primary : '#64748B'}
                />
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'banjir' && styles.segmentTextActive,
                  ]}
                >
                  Titik Banjir ({validReports.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('evakuasi')}
                style={[
                  styles.segmentBtn,
                  activeTab === 'evakuasi' && styles.segmentBtnActive,
                ]}
              >
                <Ionicons
                  name="home"
                  size={14}
                  color={activeTab === 'evakuasi' ? COLORS.primary : '#64748B'}
                />
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'evakuasi' && styles.segmentTextActive,
                  ]}
                >
                  Posko Evakuasi ({evacuationPoints.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* ISI TAB 1: TITIK BANJIR TERVERIFIKASI */}
            {activeTab === 'banjir' ? (
              validReports.length === 0 ? (
                <View style={styles.emptyBox}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="shield-checkmark" size={28} color="#0D9488" />
                  </View>
                  <Text style={styles.emptyTitle}>Tidak Ada Titik Banjir Aktif</Text>
                  <Text style={styles.emptyText}>
                    Belum ditemukan laporan banjir terverifikasi dengan koordinat aktif di wilayah Pekalongan saat ini.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {validReports.map((report) => {
                    const isFocused =
                      focusedPin.lat === report.koordinat.latitude &&
                      focusedPin.lon === report.koordinat.longitude;
                    return (
                      <View
                        key={report.id}
                        style={[styles.locationCard, isFocused && styles.locationCardActive]}
                      >
                        <View style={styles.cardTopRow}>
                          <View style={styles.dangerTag}>
                            <Text style={styles.dangerTagText}>
                              {report.kategoriBahaya?.toUpperCase() || 'TERVERIFIKASI'}
                            </Text>
                          </View>
                          <Text style={styles.sourceTag}>{report.sumberLaporan}</Text>
                        </View>

                        <Text style={styles.cardTitle}>{report.alamatSingkat}</Text>
                        <Text style={styles.cardSub}>Kecamatan {report.kecamatan}</Text>

                        <View style={styles.coordChip}>
                          <Ionicons name="navigate-circle-outline" size={14} color="#475569" />
                          <Text style={styles.coordText}>
                            {report.koordinat.latitude.toFixed(5)},{' '}
                            {report.koordinat.longitude.toFixed(5)}
                          </Text>
                        </View>

                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.focusBtn}
                            onPress={() =>
                              setFocusedPin({
                                lat: report.koordinat.latitude,
                                lon: report.koordinat.longitude,
                                label: report.alamatSingkat,
                                sub: `Kec. ${report.kecamatan} • Sumber: ${report.sumberLaporan}`,
                              })
                            }
                          >
                            <Ionicons name="locate-outline" size={14} color={COLORS.primary} />
                            <Text style={styles.focusBtnText}>Fokus di Peta</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.detailBtn}
                            onPress={() => router.push(`/detail/${report.id}`)}
                          >
                            <Text style={styles.detailBtnText}>Lihat Detail</Text>
                            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )
            ) : /* ISI TAB 2: TITIK EVAKUASI RESMI */
            evacuationPoints.length === 0 ? (
              <View style={styles.emptyBox}>
                <View style={[styles.emptyIconCircle, { backgroundColor: '#E0F2FE' }]}>
                  <Ionicons name="business" size={26} color="#0284C7" />
                </View>
                <Text style={styles.emptyTitle}>Data Posko Evakuasi Kosong</Text>
                <Text style={styles.emptyText}>
                  Data titik evakuasi resmi dari instansi terkait (Firestore: titik_evakuasi) belum tersedia saat ini.
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {evacuationPoints.map((posko) => {
                  const hasCoord =
                    typeof (posko as any).koordinat?.latitude === 'number' &&
                    typeof (posko as any).koordinat?.longitude === 'number';
                  return (
                    <View key={posko.id} style={styles.locationCard}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.evacTag}>
                          <Text style={styles.evacTagText}>POSKO EVAKUASI</Text>
                        </View>
                        <Text style={styles.sourceTag}>{posko.sumberResmi}</Text>
                      </View>

                      <Text style={styles.cardTitle}>{posko.namaPosko}</Text>
                      <Text style={styles.cardSub}>{posko.alamat}</Text>

                      {hasCoord && (
                        <TouchableOpacity
                          style={[styles.focusBtn, { marginTop: 10 }]}
                          onPress={() =>
                            setFocusedPin({
                              lat: (posko as any).koordinat.latitude,
                              lon: (posko as any).koordinat.longitude,
                              label: posko.namaPosko,
                              sub: `${posko.alamat} • ${posko.sumberResmi}`,
                            })
                          }
                        >
                          <Ionicons name="locate-outline" size={14} color={COLORS.primary} />
                          <Text style={styles.focusBtnText}>Tampilkan Lokasi Posko di Peta</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EEF2F6',
  },
  maxContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },

  // Header
  header: {
    backgroundColor: '#0F294A',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  headerSub: { color: '#CBD5E1', fontSize: 11.5, marginTop: 1 },
  resetMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  resetMapText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '700' },

  // Scroll & Metrics
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  metricsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  metricLabel: { fontSize: 11, color: '#64748B', marginTop: 1 },

  // Responsive Grid
  desktopGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
  },
  mobileStack: {
    flexDirection: 'column',
    gap: 16,
  },

  // Map Panel
  mapPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mapPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  pinBadgeText: { fontSize: 13, fontWeight: '800', color: '#0F172A', flex: 1 },
  openGmapsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0F294A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  openGmapsText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '700' },
  iframeWrapper: {
    width: '100%',
    height: 380,
    backgroundColor: '#E2E8F0',
  },
  fallbackMap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  fallbackTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  mapFooterBar: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  mapFooterInfo: { fontSize: 11.5, color: '#475569' },

  // List Panel
  listPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  segmentTextActive: { color: '#0F294A', fontWeight: '800' },

  // Location Cards
  locationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dangerTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dangerTagText: { fontSize: 10, fontWeight: '800', color: '#B91C1C' },
  evacTag: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  evacTagText: { fontSize: 10, fontWeight: '800', color: '#0F766E' },
  sourceTag: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  cardTitle: { fontSize: 14.5, fontWeight: '800', color: '#0F172A' },
  cardSub: { fontSize: 12, color: '#475569', marginTop: 2 },
  coordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coordText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  focusBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  focusBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  detailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#0F294A',
    paddingVertical: 8,
    borderRadius: 10,
  },
  detailBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },

  // Empty State
  emptyBox: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 8,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});