import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Linking,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import {
  DataProvenance,
  FloodReport,
  RealWeatherData,
} from '../../types';
import {
  DEFAULT_PEKALONGAN_LOCATIONS,
  SearchableLocation,
  searchLocationsByName,
  fetchSevenDayWeatherForecast,
  fetchBmkgOfficialWeather,
} from '../../services/weatherService';
import {
  fetchPetaBencanaPekalonganReports,
  subscribeVerifiedFirestoreReports,
} from '../../services/reportService';
import { WeatherCard } from '../../components/WeatherCard';
import { ReportCard } from '../../components/ReportCard';
import { Loading } from '../../components/Loading';

const ROUTE_GUIDES = [
  {
    id: 'r1',
    road: 'Jl. Raya Tirto – Depan Pasar',
    badge: 'Tutup Total',
    isSevere: true,
    water: 'Genangan ±45 cm • Arus deras',
    vehicle: ['motor', 'mobil'],
    alt: 'Simpang Grogolan ➔ Jl. Dr. Sutomo ➔ Jl. Perintis Kemerdekaan (+7 mnt)',
    lat: -6.8872,
    lon: 109.6381,
  },
  {
    id: 'r2',
    road: 'Jl. Pantura Wiradesa (Arah Semarang)',
    badge: 'Rawan Mogok',
    isSevere: false,
    water: 'Genangan ±25 cm • Lajur kiri tergenang',
    vehicle: ['motor'],
    alt: 'Jalur Lingkar Utara ➔ Jl. Patiunus ➔ Keluar Ponolawen (+5 mnt)',
    lat: -6.8856,
    lon: 109.6139,
  },
  {
    id: 'r3',
    road: 'Jl. Kusuma Bangsa – Panjang Wetan',
    badge: 'Rob Pesisir',
    isSevere: true,
    water: 'Genangan ±50 cm • Pasang air laut',
    vehicle: ['motor', 'mobil'],
    alt: 'Jl. WR Supratman ➔ Jl. Tentara Pelajar (+6 mnt)',
    lat: -6.8686,
    lon: 109.6753,
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920; // Otomatis 2 kolom saat dibuka di layar lebar Web

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchableLocation[]>(
    DEFAULT_PEKALONGAN_LOCATIONS
  );
  const [selectedLoc, setSelectedLoc] = useState<SearchableLocation>(
    DEFAULT_PEKALONGAN_LOCATIONS[0]
  );

  const [bmkgWeather, setBmkgWeather] = useState<RealWeatherData | null>(null);
  const [sevenDayWeather, setSevenDayWeather] = useState<RealWeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const [weatherMode, setWeatherMode] = useState<'7days' | 'bmkg'>('7days');
  const [reportTab, setReportTab] = useState<'warga' | 'petabencana'>('warga');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'motor' | 'mobil'>('all');

  const [pbReports, setPbReports] = useState<FloodReport[]>([]);
  const [pbProvenance, setPbProvenance] = useState<DataProvenance | null>(null);
  const [firestoreReports, setFirestoreReports] = useState<FloodReport[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleSearchChange = async (text: string) => {
    setSearchQuery(text);
    const list = await searchLocationsByName(text);
    setSearchResults(list);
  };

  const loadAllData = useCallback(async (loc: SearchableLocation) => {
    setLoadingWeather(true);
    const [bmkgRes, sevenDayRes, pbRes] = await Promise.all([
      fetchBmkgOfficialWeather(loc),
      fetchSevenDayWeatherForecast(loc),
      fetchPetaBencanaPekalonganReports(),
    ]);

    setBmkgWeather(bmkgRes);
    setSevenDayWeather(sevenDayRes);
    setPbReports(pbRes.reports);
    setPbProvenance(pbRes.provenance);
    setLoadingWeather(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadAllData(selectedLoc);
  }, [selectedLoc, loadAllData]);

  useEffect(() => {
    const unsub = subscribeVerifiedFirestoreReports((reports) => {
      setFirestoreReports(reports);
    });
    return () => unsub();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData(selectedLoc);
  };

  const totalVerifiedActive = firestoreReports.length + pbReports.length;
  const hasDangerReport = [...firestoreReports, ...pbReports].some(
    (r) => r.kategoriBahaya === 'bahaya'
  );

  const statusTheme =
    totalVerifiedActive === 0
      ? {
          bg: '#0F766E',
          icon: 'shield-checkmark' as const,
          title: 'KONDISI TERKENDALI • BELUM ADA LAPORAN BANJIR',
          sub: 'Pantauan wilayah Kota & Kabupaten Pekalongan saat ini dalam status aman.',
        }
      : hasDangerReport
      ? {
          bg: '#B91C1C',
          icon: 'warning' as const,
          title: 'DARURAT • TERDAPAT LAPORAN BAHAYA TERVERIFIKASI',
          sub: `Terdeteksi ${totalVerifiedActive} titik banjir aktif. Segera hindari ruas jalan terdampak.`,
        }
      : {
          bg: '#B45309',
          icon: 'alert-circle' as const,
          title: 'WASPADA • GENANGAN TERVERIFIKASI DI BEBERAPA TITIK',
          sub: `Terdapat ${totalVerifiedActive} titik laporan genangan. Pantau tinggi muka air & rute alternatif.`,
        };

  const filteredRoutes = ROUTE_GUIDES.filter((r) =>
    vehicleFilter === 'all' ? true : r.vehicle.includes(vehicleFilter)
  );

  return (
    <View style={styles.root}>
      {/* TOP NAVBAR MODERN & RESPONSIF */}
      <View style={styles.navbar}>
        <View style={[styles.navInner, isDesktop && styles.maxContainer]}>
          <View style={styles.brandGroup}>
            <View style={styles.brandIcon}>
              <Ionicons name="water" size={22} color="#38BDF8" />
            </View>
            <View>
              <Text style={styles.brandTitle}>SIAGA BANJIR</Text>
              <Text style={styles.brandSub}>Sistem Pemantauan Kota & Kab. Pekalongan</Text>
            </View>
          </View>

          <View style={styles.navActions}>
            {isDesktop && (
              <TouchableOpacity
                style={styles.navMapBtn}
                onPress={() => router.push('/(tabs)/peta')}
              >
                <Ionicons name="map" size={16} color="#FFFFFF" />
                <Text style={styles.navMapText}>Buka Peta Interaktif</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => router.push('/(tabs)/profil')}
            >
              <Ionicons name="person" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* KONTEN UTAMA RESPONSIF (2 KOLOM DI DESKTOP, 1 KOLOM DI HP) */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.maxContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* HERO BANNER STATUS BANJIR */}
        <View style={[styles.heroCard, { backgroundColor: statusTheme.bg }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.livePillText}>PEMANTAUAN REAL-TIME PEKALONGAN</Text>
            </View>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshMiniBtn}>
              <Ionicons name="refresh" size={14} color="#FFFFFF" />
              <Text style={styles.refreshMiniText}>Segarkan</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.heroBody, isDesktop && styles.heroBodyDesktop]}>
            <View style={{ flex: 1 }}>
              <View style={styles.heroTitleRow}>
                <Ionicons name={statusTheme.icon} size={24} color="#FFFFFF" />
                <Text style={styles.heroTitle}>{statusTheme.title}</Text>
              </View>
              <Text style={styles.heroSub}>{statusTheme.sub}</Text>
            </View>

            {/* 3 KARTU METRIK RINGKAS */}
            <View style={[styles.heroMetrics, isDesktop && { width: 340 }]}>
              <View style={styles.metricTile}>
                <Text style={styles.metricNum}>{totalVerifiedActive}</Text>
                <Text style={styles.metricLbl}>Titik Banjir</Text>
              </View>
              <View style={styles.metricTile}>
                <Text style={styles.metricNum}>{firestoreReports.length}</Text>
                <Text style={styles.metricLbl}>Laporan Warga</Text>
              </View>
              <View style={styles.metricTile}>
                <Text style={styles.metricNum}>{pbReports.length}</Text>
                <Text style={styles.metricLbl}>PetaBencana</Text>
              </View>
            </View>
          </View>
        </View>

        {/* GRID UTAMA RESPONSIF */}
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {/* KOLOM KIRI: CARI WILAYAH & CUACA */}
          <View style={isDesktop ? styles.leftCol : undefined}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <View style={[styles.iconBadge, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="partly-sunny" size={18} color="#0284C7" />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Cari Wilayah & Prakiraan Cuaca</Text>
                    <Text style={styles.cardSub}>Pilih kecamatan untuk pantau curah hujan</Text>
                  </View>
                </View>
              </View>

              {/* Input Pencarian Modern */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Ketik nama kecamatan (misal: Tirto, Wiradesa, Kajen)..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearchChange('')}>
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Chip Kecamatan */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipList}
              >
                {searchResults.map((loc) => {
                  const active = loc.id === selectedLoc.id;
                  return (
                    <TouchableOpacity
                      key={loc.id}
                      style={[styles.locChip, active && styles.locChipActive]}
                      onPress={() => setSelectedLoc(loc)}
                    >
                      <View
                        style={[
                          styles.locDot,
                          { backgroundColor: active ? '#38BDF8' : '#10B981' },
                        ]}
                      />
                      <Text style={[styles.locChipText, active && styles.locChipTextActive]}>
                        {loc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Segmented Toggle: 7 Hari ke Depan vs Resmi BMKG */}
              <View style={styles.segmentBar}>
                <TouchableOpacity
                  onPress={() => setWeatherMode('7days')}
                  style={[
                    styles.segmentItem,
                    weatherMode === '7days' && styles.segmentItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentItemText,
                      weatherMode === '7days' && styles.segmentItemTextActive,
                    ]}
                  >
                    Prakiraan 7 Hari (Open-Meteo)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setWeatherMode('bmkg')}
                  style={[
                    styles.segmentItem,
                    weatherMode === 'bmkg' && styles.segmentItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentItemText,
                      weatherMode === 'bmkg' && styles.segmentItemTextActive,
                    ]}
                  >
                    Data Resmi BMKG
                  </Text>
                </TouchableOpacity>
              </View>

              {loadingWeather ? (
                <Loading message={`Memuat prakiraan cuaca ${selectedLoc.label}...`} />
              ) : weatherMode === '7days' ? (
                sevenDayWeather ? (
                  <WeatherCard weather={sevenDayWeather} />
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="cloud-offline-outline" size={26} color="#64748B" />
                    <Text style={styles.emptyStateText}>
                      Data prakiraan 7 hari untuk {selectedLoc.label} tidak tersedia saat ini.
                    </Text>
                  </View>
                )
              ) : bmkgWeather ? (
                <WeatherCard weather={bmkgWeather} />
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="information-circle-outline" size={26} color="#64748B" />
                  <Text style={styles.emptyStateText}>
                    Data resmi BMKG tingkat desa/kelurahan belum tersedia untuk {selectedLoc.label}. Silakan pilih tab Prakiraan 7 Hari.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* KOLOM KANAN: RUTE ALTERNATIF & LAPORAN MASYARAKAT */}
          <View style={isDesktop ? styles.rightCol : undefined}>
            {/* KARTU RUTE DIHINDARI & ALTERNATIF */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name="git-branch" size={18} color="#DC2626" />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Rute Dihindari & Jalur Alternatif</Text>
                    <Text style={styles.cardSub}>Panduan lalu lintas ruas rawan banjir</Text>
                  </View>
                </View>

                <View style={styles.filterPills}>
                  {(['all', 'motor', 'mobil'] as const).map((v) => (
                    <TouchableOpacity
                      key={v}
                      onPress={() => setVehicleFilter(v)}
                      style={[
                        styles.filterBtn,
                        vehicleFilter === v && styles.filterBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterBtnText,
                          vehicleFilter === v && styles.filterBtnTextActive,
                        ]}
                      >
                        {v === 'all' ? 'Semua' : v === 'motor' ? 'Motor' : 'Mobil'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={{ gap: 10 }}>
                {filteredRoutes.map((route) => (
                  <View key={route.id} style={styles.routeCard}>
                    <View style={styles.routeTop}>
                      <Text style={styles.routeTitle}>{route.road}</Text>
                      <View
                        style={[
                          styles.routeBadge,
                          { backgroundColor: route.isSevere ? '#FEE2E2' : '#FEF3C7' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.routeBadgeText,
                            { color: route.isSevere ? '#B91C1C' : '#B45309' },
                          ]}
                        >
                          {route.badge}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.routeWater}>{route.water}</Text>

                    <View style={styles.altBox}>
                      <Ionicons name="return-up-forward" size={16} color="#059669" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.altTitle}>Jalur Alternatif Disarankan:</Text>
                        <Text style={styles.altText}>{route.alt}</Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.gmapsBtn}
                      onPress={() =>
                        Linking.openURL(
                          `https://www.google.com/maps/dir/?api=1&destination=${route.lat},${route.lon}`
                        )
                      }
                    >
                      <Ionicons name="navigate" size={14} color="#FFFFFF" />
                      <Text style={styles.gmapsBtnText}>Buka Navigasi Google Maps</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* KARTU DATA BANJIR & LAPORAN MASYARAKAT */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrap}>
                  <View style={[styles.iconBadge, { backgroundColor: '#DCFCE7' }]}>
                    <Ionicons name="people" size={18} color="#15803D" />
                  </View>
                  <View>
                    <Text style={styles.cardTitle}>Data Banjir & Laporan Warga</Text>
                    <Text style={styles.cardSub}>Laporan lapangan terverifikasi</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.quickReportBtn}
                  onPress={() => router.push('/(tabs)/laporan')}
                >
                  <Ionicons name="add-circle" size={15} color="#FFFFFF" />
                  <Text style={styles.quickReportText}>Buat Laporan</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.segmentBar}>
                <TouchableOpacity
                  style={[
                    styles.segmentItem,
                    reportTab === 'warga' && styles.segmentItemActive,
                  ]}
                  onPress={() => setReportTab('warga')}
                >
                  <Text
                    style={[
                      styles.segmentItemText,
                      reportTab === 'warga' && styles.segmentItemTextActive,
                    ]}
                  >
                    Laporan Warga ({firestoreReports.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.segmentItem,
                    reportTab === 'petabencana' && styles.segmentItemActive,
                  ]}
                  onPress={() => setReportTab('petabencana')}
                >
                  <Text
                    style={[
                      styles.segmentItemText,
                      reportTab === 'petabencana' && styles.segmentItemTextActive,
                    ]}
                  >
                    Data PetaBencana.id ({pbReports.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {reportTab === 'warga' ? (
                firestoreReports.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="checkmark-done-circle-outline" size={28} color="#10B981" />
                    <Text style={styles.emptyStateTitle}>Belum Ada Laporan Banjir Warga</Text>
                    <Text style={styles.emptyStateText}>
                      Saat ini belum ada laporan genangan baru yang masuk ke database. Jika melihat genangan, klik tombol "Buat Laporan".
                    </Text>
                  </View>
                ) : (
                  firestoreReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onPress={() => router.push(`/detail/${report.id}`)}
                    />
                  ))
                )
              ) : (
                <>
                  {pbProvenance && (
                    <View style={styles.provBox}>
                      <Text style={styles.provLine}>
                        Sumber: {pbProvenance.sourceName} • Status:{' '}
                        {pbProvenance.status.toUpperCase()}
                      </Text>
                      <Text style={styles.provLine}>Pembaruan: {pbProvenance.fetchedAt}</Text>
                      {pbProvenance.errorMessage ? (
                        <Text style={styles.provErr}>{pbProvenance.errorMessage}</Text>
                      ) : null}
                    </View>
                  )}

                  {pbReports.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Ionicons name="cloud-done-outline" size={28} color="#0284C7" />
                      <Text style={styles.emptyStateTitle}>Data PetaBencana Nihil</Text>
                      <Text style={styles.emptyStateText}>
                        Tidak ada laporan banjir aktif pada feed PetaBencana.id untuk wilayah Pekalongan saat ini.
                      </Text>
                    </View>
                  ) : (
                    pbReports.map((item) => (
                      <ReportCard
                        key={item.id}
                        report={item}
                        onPress={() => router.push(`/detail/${item.id}`)}
                      />
                    ))
                  )}
                </>
              )}
            </View>
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

  // Navbar
  navbar: {
    backgroundColor: '#0F294A',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  navInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  brandTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.6 },
  brandSub: { color: '#CBD5E1', fontSize: 11.5, marginTop: 1 },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  navMapText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Scroll & Grid
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  desktopGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 18,
  },
  leftCol: { flex: 1.15 },
  rightCol: { flex: 1 },
  mobileStack: { flexDirection: 'column' },

  // Hero Status Card
  heroCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 5,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4ADE80' },
  livePillText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  refreshMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  refreshMiniText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  heroBody: { gap: 14 },
  heroBodyDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', flex: 1 },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12.5, marginTop: 6, lineHeight: 18 },
  heroMetrics: { flexDirection: 'row', gap: 8 },
  metricTile: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  metricNum: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  metricLbl: { color: 'rgba(255,255,255,0.85)', fontSize: 10.5, marginTop: 2 },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  cardTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardSub: { fontSize: 11.5, color: '#64748B', marginTop: 1 },

  // Search & Chips
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#0F172A' },
  chipList: { gap: 8, paddingBottom: 12 },
  locChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locChipActive: { backgroundColor: '#0F294A', borderColor: '#0F294A' },
  locDot: { width: 7, height: 7, borderRadius: 4 },
  locChipText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  locChipTextActive: { color: '#FFFFFF' },

  // Segmented Control
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentItemText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  segmentItemTextActive: { color: '#0F294A', fontWeight: '800' },

  // Rute Alternatif
  filterPills: { flexDirection: 'row', gap: 4 },
  filterBtn: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  filterBtnActive: { backgroundColor: '#0F294A' },
  filterBtnText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  filterBtnTextActive: { color: '#FFFFFF' },
  routeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  routeTitle: { flex: 1, fontSize: 13.5, fontWeight: '800', color: '#0F172A' },
  routeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  routeBadgeText: { fontSize: 10, fontWeight: '800' },
  routeWater: { fontSize: 11.5, color: '#64748B', marginTop: 4, marginBottom: 8 },
  altBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  altTitle: { fontSize: 11, fontWeight: '800', color: '#065F46' },
  altText: { fontSize: 12, color: '#047857', marginTop: 2, lineHeight: 17 },
  gmapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F294A',
    paddingVertical: 9,
    borderRadius: 10,
  },
  gmapsBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Laporan Warga & Empty States
  quickReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EA580C',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  quickReportText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' },
  emptyState: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  emptyStateTitle: { fontSize: 13.5, fontWeight: '800', color: '#0F172A', marginTop: 2 },
  emptyStateText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  provBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  provLine: { fontSize: 11, color: '#475569' },
  provErr: { fontSize: 11, color: '#DC2626', marginTop: 2 },
});