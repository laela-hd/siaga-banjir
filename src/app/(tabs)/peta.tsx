import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EvacuationPoint, FloodReport } from '../../types';
import {
  subscribeVerifiedFirestoreReports,
  fetchPetaBencanaPekalonganReports,
  subscribeOfficialEvacuationPoints,
} from '../../services/reportService';
import { Loading } from '../../components/Loading';

export default function PetaScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  const [firestoreReports, setFirestoreReports] = useState<FloodReport[]>([]);
  const [pbReports, setPbReports] = useState<FloodReport[]>([]);
  const [evacuationPoints, setEvacuationPoints] = useState<EvacuationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeTab, setActiveTab] = useState<'banjir' | 'evakuasi'>('banjir');
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);

  const loadExternalReports = async () => {
    const res = await fetchPetaBencanaPekalonganReports();
    setPbReports(res.reports);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const unsub1 = subscribeVerifiedFirestoreReports((data) => {
      setFirestoreReports(data);
      setLoading(false);
    });
    const unsub2 = subscribeOfficialEvacuationPoints((data) => {
      setEvacuationPoints(data);
    });
    loadExternalReports();

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const validReports = [...firestoreReports, ...pbReports];

  useEffect(() => {
    if (validReports.length > 0 && !selectedReport) {
      setSelectedReport(validReports[0]);
    }
  }, [validReports.length]);

  const onRefresh = () => {
    setRefreshing(true);
    loadExternalReports();
  };

  const openGoogleMaps = (lat: number, lon: number) => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`);
  };

  return (
    <View style={styles.root}>
      {/* HEADER ATAS */}
      <View style={styles.header}>
        <View style={[styles.headerInner, isDesktop && styles.maxContainer]}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Ionicons name="map" size={20} color="#38BDF8" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Peta Sebaran Banjir & Evakuasi</Text>
              <Text style={styles.headerSub}>
                Data Koordinat Nyata Firestore, PetaBencana.id & Posko Resmi
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh" size={15} color="#FFFFFF" />
            <Text style={styles.refreshText}>Segarkan</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F294A']}
          />
        }
      >
        {/* RINGKASAN STATISTIK DATA NYATA */}
        <View style={styles.metricsRow}>
          <View style={[styles.metricCard, { borderLeftColor: '#DC2626' }]}>
            <View style={[styles.metricIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="warning" size={18} color="#DC2626" />
            </View>
            <View>
              <Text style={styles.metricVal}>{validReports.length} Titik</Text>
              <Text style={styles.metricLbl}>Banjir Terverifikasi</Text>
            </View>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#0D9488' }]}>
            <View style={[styles.metricIcon, { backgroundColor: '#CCFBF1' }]}>
              <Ionicons name="medkit" size={18} color="#0D9488" />
            </View>
            <View>
              <Text style={styles.metricVal}>{evacuationPoints.length} Posko</Text>
              <Text style={styles.metricLbl}>Titik Evakuasi Resmi</Text>
            </View>
          </View>

          <View style={[styles.metricCard, { borderLeftColor: '#0284C7' }]}>
            <View style={[styles.metricIcon, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="layers" size={18} color="#0284C7" />
            </View>
            <View>
              <Text style={styles.metricVal}>
                {firestoreReports.length} Warga / {pbReports.length} PB
              </Text>
              <Text style={styles.metricLbl}>Sumber Terhubung</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <Loading message="Memuat koordinat titik banjir & posko evakuasi..." />
        ) : (
          <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
            {/* PANEL KIRI: DETAIL KOORDINAT & NAVIGASI TITIK TERPILIH */}
            <View style={[styles.focusPanel, isDesktop && { flex: 1.1 }]}>
              <View style={styles.panelHeader}>
                <Ionicons name="locate" size={18} color="#0F294A" />
                <Text style={styles.panelTitle}>Inspector Koordinat Titik Terpilih</Text>
              </View>

              {selectedReport ? (
                <View style={styles.selectedBox}>
                  <View style={styles.selectedBadgeRow}>
                    <View style={styles.dangerPill}>
                      <Text style={styles.dangerPillText}>
                        {selectedReport.kategoriBahaya?.toUpperCase() || 'TERVERIFIKASI'}
                      </Text>
                    </View>
                    <Text style={styles.sourceLabel}>{selectedReport.sumberLaporan}</Text>
                  </View>

                  <Text style={styles.selectedTitle}>{selectedReport.alamatSingkat}</Text>
                  <Text style={styles.selectedSub}>
                    Kecamatan {selectedReport.kecamatan}
                  </Text>

                  <View style={styles.coordGrid}>
                    <View style={styles.coordTile}>
                      <Text style={styles.coordLbl}>Latitude</Text>
                      <Text style={styles.coordNum}>
                        {selectedReport.koordinat.latitude.toFixed(6)}
                      </Text>
                    </View>
                    <View style={styles.coordTile}>
                      <Text style={styles.coordLbl}>Longitude</Text>
                      <Text style={styles.coordNum}>
                        {selectedReport.koordinat.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.gmapsBtn}
                      onPress={() =>
                        openGoogleMaps(
                          selectedReport.koordinat.latitude,
                          selectedReport.koordinat.longitude
                        )
                      }
                    >
                      <Ionicons name="navigate" size={15} color="#FFFFFF" />
                      <Text style={styles.gmapsBtnText}>Buka di Google Maps</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.detailOutlineBtn}
                      onPress={() => router.push(`/detail/${selectedReport.id}`)}
                    >
                      <Text style={styles.detailOutlineText}>Detail Laporan</Text>
                      <Ionicons name="arrow-forward" size={15} color="#0F294A" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyInspector}>
                  <Ionicons name="map-outline" size={34} color="#94A3B8" />
                  <Text style={styles.emptyInspectorTitle}>
                    Belum Ada Titik Banjir Dipilih
                  </Text>
                  <Text style={styles.emptyInspectorSub}>
                    Saat ini belum ditemukan laporan banjir terverifikasi dengan koordinat aktif dari Firestore maupun PetaBencana.id.
                  </Text>
                </View>
              )}
            </View>

            {/* PANEL KANAN: DAFTAR TITIK BANJIR & POSKO EVAKUASI */}
            <View style={[styles.listPanel, isDesktop && { flex: 1 }]}>
              <View style={styles.segmentWrap}>
                <TouchableOpacity
                  onPress={() => setActiveTab('banjir')}
                  style={[
                    styles.segmentBtn,
                    activeTab === 'banjir' && styles.segmentBtnActive,
                  ]}
                >
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
                  <Text
                    style={[
                      styles.segmentText,
                      activeTab === 'evakuasi' && styles.segmentTextActive,
                    ]}
                  >
                    Titik Evakuasi ({evacuationPoints.length})
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'banjir' ? (
                validReports.length === 0 ? (
                  <View style={styles.emptyListBox}>
                    <Ionicons name="shield-checkmark-outline" size={28} color="#0D9488" />
                    <Text style={styles.emptyListTitle}>Wilayah Terpantau Aman</Text>
                    <Text style={styles.emptyListText}>
                      Belum ditemukan laporan banjir terverifikasi dengan koordinat aktif saat ini.
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    {validReports.map((report) => {
                      const isSelected = selectedReport?.id === report.id;
                      return (
                        <TouchableOpacity
                          key={report.id}
                          style={[
                            styles.itemCard,
                            isSelected && styles.itemCardSelected,
                          ]}
                          onPress={() => setSelectedReport(report)}
                        >
                          <View style={styles.itemTop}>
                            <Text style={styles.itemTitle}>{report.alamatSingkat}</Text>
                            <Text style={styles.itemSource}>{report.sumberLaporan}</Text>
                          </View>
                          <Text style={styles.itemSub}>Kec. {report.kecamatan}</Text>
                          <Text style={styles.itemCoord}>
                            Koordinat: {report.koordinat.latitude},{' '}
                            {report.koordinat.longitude}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )
              ) : evacuationPoints.length === 0 ? (
                <View style={styles.emptyListBox}>
                  <Ionicons name="business-outline" size={28} color="#0284C7" />
                  <Text style={styles.emptyListTitle}>Data Evakuasi Belum Tersedia</Text>
                  <Text style={styles.emptyListText}>
                    Data titik evakuasi resmi dari instansi terkait (Firestore: titik_evakuasi) belum tersedia.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {evacuationPoints.map((posko) => (
                    <View key={posko.id} style={styles.itemCard}>
                      <View style={styles.itemTop}>
                        <Text style={styles.itemTitle}>{posko.namaPosko}</Text>
                        <View style={styles.poskoTag}>
                          <Text style={styles.poskoTagText}>POSKO RESMI</Text>
                        </View>
                      </View>
                      <Text style={styles.itemSub}>{posko.alamat}</Text>
                      <Text style={styles.itemCoord}>Sumber: {posko.sumberResmi}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
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
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  refreshText: { color: '#FFFFFF', fontSize: 11.5, fontWeight: '700' },

  // Content & Metrics
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  metricsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
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
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricVal: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  metricLbl: { fontSize: 11, color: '#64748B', marginTop: 1 },

  // Grid
  desktopGrid: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  mobileStack: { flexDirection: 'column', gap: 16 },

  // Panels
  focusPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  panelTitle: { fontSize: 14.5, fontWeight: '800', color: '#0F172A' },
  selectedBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dangerPillText: { fontSize: 10, fontWeight: '800', color: '#B91C1C' },
  sourceLabel: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  selectedTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  selectedSub: { fontSize: 12.5, color: '#475569', marginTop: 2 },
  coordGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  coordTile: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coordLbl: { fontSize: 10.5, color: '#64748B' },
  coordNum: { fontSize: 13, fontWeight: '800', color: '#0F294A', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  gmapsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0F294A',
    paddingVertical: 10,
    borderRadius: 10,
  },
  gmapsBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  detailOutlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0F294A',
  },
  detailOutlineText: { color: '#0F294A', fontSize: 12, fontWeight: '700' },

  emptyInspector: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  emptyInspectorTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 4 },
  emptyInspectorSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

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
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
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

  itemCard: {
    backgroundColor: '#F8FAFC',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  itemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: '#0F172A' },
  itemSource: { fontSize: 11, fontWeight: '600', color: '#64748B' },
  itemSub: { fontSize: 12, color: '#475569', marginTop: 3 },
  itemCoord: { fontSize: 11, color: '#0284C7', fontWeight: '600', marginTop: 5 },
  poskoTag: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  poskoTagText: { fontSize: 10, fontWeight: '800', color: '#0F766E' },

  emptyListBox: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 6,
  },
  emptyListTitle: { fontSize: 13.5, fontWeight: '800', color: '#0F172A' },
  emptyListText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});