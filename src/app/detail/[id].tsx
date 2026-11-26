import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { FloodReport } from '../../types';
import { getFloodReportById, deleteFloodReport } from '../../services/reportService';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../../components/Loading';

export default function DetailLaporanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [report, setReport] = useState<FloodReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      try {
        const liveData = await getFloodReportById(id);
        setReport(liveData);
      } catch {
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (loading) return <Loading message="Memuat detail laporan dari database..." />;

  if (!report) {
    return (
      <View style={styles.notFoundBox}>
        <Text style={styles.notFoundText}>
          Data detail laporan tidak ditemukan di database.
        </Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Hapus Laporan', 'Yakin ingin menghapus laporan ini secara permanen?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFloodReport(report.id);
            router.back();
          } catch (err: any) {
            Alert.alert('Gagal', err.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {report.fotoUrl ? (
        <Image source={{ uri: report.fotoUrl }} style={styles.realPhoto} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="image-outline" size={40} color={COLORS.secondary} />
          <Text style={styles.photoText}>Tidak ada foto dilampirkan</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.statusText}>
          Status: {report.statusVerifikasi.toUpperCase()} • Sumber: {report.sumberLaporan}
        </Text>
        <Text style={styles.title}>{report.alamatSingkat}</Text>
        <Text style={styles.subtitle}>
          Kec. {report.kecamatan}, {report.wilayah}
        </Text>

        <View style={styles.metricBox}>
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>Ketinggian Air</Text>
            <Text style={styles.metricValue}>
              {report.ketinggianCm !== null ? `${report.ketinggianCm} cm` : 'Tidak diukur'}
            </Text>
          </View>
          <View style={styles.metricCol}>
            <Text style={styles.metricLabel}>Koordinat GPS Nyata</Text>
            <Text style={styles.metricCoord}>
              {report.koordinat.latitude}, {report.koordinat.longitude}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Deskripsi Kondisi Lapangan</Text>
        <Text style={styles.description}>{report.deskripsi}</Text>

        <View style={styles.metaFooter}>
          <Text style={styles.metaText}>Pelapor: {report.pelaporNama}</Text>
          <Text style={styles.metaText}>{report.waktuLaporan}</Text>
        </View>

        {profile?.role === 'admin' && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={COLORS.white} />
            <Text style={styles.deleteBtnText}>Hapus Laporan (Admin)</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md },
  notFoundBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  notFoundText: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
  realPhoto: { width: '100%', height: 220, borderRadius: RADIUS.md, marginBottom: SPACING.md },
  photoPlaceholder: { height: 140, backgroundColor: '#E1EEF9', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md },
  photoText: { marginTop: 6, fontSize: 12, color: COLORS.primary },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  statusText: { fontSize: 11, fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.secondary, fontWeight: '600', marginTop: 2, marginBottom: SPACING.md },
  metricBox: { flexDirection: 'row', backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: RADIUS.sm, marginBottom: SPACING.md },
  metricCol: { flex: 1 },
  metricLabel: { fontSize: 11, color: COLORS.textSecondary },
  metricValue: { fontSize: 16, fontWeight: '800', color: COLORS.danger, marginTop: 2 },
  metricCoord: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginTop: 4 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21 },
  metaFooter: { marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 4 },
  metaText: { fontSize: 12, color: COLORS.textSecondary },
  deleteBtn: { backgroundColor: COLORS.danger, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingVertical: 11, borderRadius: RADIUS.sm, marginTop: SPACING.md },
  deleteBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
});