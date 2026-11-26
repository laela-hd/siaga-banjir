import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { FloodReport, VerificationStatus } from '../types';
import {
  subscribeAllReportsForAdmin,
  updateFloodReportStatus,
  deleteFloodReport,
} from '../services/reportService';
import { createBroadcastNotification } from '../services/notificationService';
import { Loading } from '../components/Loading';

export default function AdminVerificationScreen() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [filterStatus, setFilterStatus] = useState<'semua' | VerificationStatus>(
    'menunggu'
  );

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    const unsub = subscribeAllReportsForAdmin(setReports);
    return () => unsub();
  }, [profile]);

  if (loading) return <Loading message="Memeriksa hak akses admin..." />;

  if (profile?.role !== 'admin') {
    return (
      <View style={styles.deniedContainer}>
        <Ionicons name="shield-outline" size={64} color={COLORS.danger} />
        <Text style={styles.deniedTitle}>Akses Ditolak</Text>
        <Text style={styles.deniedSub}>
          Halaman ini khusus untuk petugas dengan peran Admin.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleVerifyAction = async (
    report: FloodReport,
    newStatus: 'diverifikasi' | 'ditolak'
  ) => {
    try {
      await updateFloodReportStatus(report.id, newStatus);

      if (newStatus === 'diverifikasi') {
        await createBroadcastNotification({
          judul: `Peringatan Banjir ${report.kategoriBahaya.toUpperCase()} - Kec. ${report.kecamatan}`,
          pesan: `Terpantau genangan air ${report.ketinggianCm} cm di ${report.alamatSingkat}, ${report.wilayah}. Harap berhati-hati dan pantau jalur evakuasi.`,
          tipe: report.kategoriBahaya === 'bahaya' ? 'peringatan' : 'verifikasi',
          laporanId: report.id,
        });
      }

      Alert.alert(
        'Status Diperbarui',
        newStatus === 'diverifikasi'
          ? 'Laporan telah diverifikasi dan peringatan otomatis dikirim ke warga.'
          : 'Laporan telah ditandai ditolak.'
      );
    } catch (error: any) {
      Alert.alert('Gagal Memperbarui', error.message || 'Periksa Firestore Rules.');
    }
  };

  const handleDelete = (report: FloodReport) => {
    Alert.alert('Hapus Permanen', `Hapus laporan di ${report.alamatSingkat}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFloodReport(report.id);
          } catch (err: any) {
            Alert.alert('Gagal Hapus', err.message);
          }
        },
      },
    ]);
  };

  const filteredList = reports.filter((r) =>
    filterStatus === 'semua' ? true : r.statusVerifikasi === filterStatus
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {(['menunggu', 'diverifikasi', 'ditolak', 'semua'] as const).map((st) => {
          const active = filterStatus === st;
          return (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilterStatus(st)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {st.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              Tidak ada laporan pada kategori status "{filterStatus.toUpperCase()}".
            </Text>
          </View>
        ) : (
          filteredList.map((item) => (
            <View key={item.id} style={styles.card}>
              {item.fotoUrl ? (
                <Image source={{ uri: item.fotoUrl }} style={styles.photo} />
              ) : null}

              <View style={styles.headerRow}>
                <Text style={styles.badgeCategory}>
                  {item.kategoriBahaya.toUpperCase()} • {item.ketinggianCm} cm
                </Text>
                <Text style={styles.badgeStatus}>
                  {item.statusVerifikasi.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.title}>{item.alamatSingkat}</Text>
              <Text style={styles.sub}>
                Kec. {item.kecamatan}, {item.wilayah} • Oleh: {item.pelaporNama}
              </Text>
              <Text style={styles.desc}>{item.deskripsi}</Text>

              <View style={styles.actionRow}>
                {item.statusVerifikasi !== 'diverifikasi' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
                    onPress={() => handleVerifyAction(item, 'diverifikasi')}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
                    <Text style={styles.actionText}>Verifikasi</Text>
                  </TouchableOpacity>
                )}

                {item.statusVerifikasi !== 'ditolak' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#D98200' }]}
                    onPress={() => handleVerifyAction(item, 'ditolak')}
                  >
                    <Ionicons name="close-circle" size={16} color={COLORS.white} />
                    <Text style={styles.actionText}>Tolak</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: COLORS.danger }]}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash" size={16} color={COLORS.white} />
                  <Text style={styles.actionText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  deniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  deniedTitle: { fontSize: 18, fontWeight: '800', color: COLORS.danger, marginTop: SPACING.sm },
  deniedSub: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginVertical: SPACING.sm },
  backBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.sm },
  backBtnText: { color: COLORS.white, fontWeight: '700' },
  filterBar: { flexDirection: 'row', padding: SPACING.sm, gap: 6, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterChip: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.background, alignItems: 'center' },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 10, fontWeight: '800', color: COLORS.textPrimary },
  filterTextActive: { color: COLORS.white },
  listContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  emptyBox: { backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADIUS.md, alignItems: 'center' },
  emptyText: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  photo: { width: '100%', height: 150, borderRadius: RADIUS.sm, marginBottom: SPACING.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  badgeCategory: { fontSize: 11, fontWeight: '800', color: COLORS.danger },
  badgeStatus: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  title: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  sub: { fontSize: 12, color: COLORS.secondary, fontWeight: '600', marginTop: 2 },
  desc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 6, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: SPACING.md },
  actionBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4, paddingVertical: 9, borderRadius: RADIUS.sm },
  actionText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
});