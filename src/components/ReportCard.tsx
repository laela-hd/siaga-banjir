import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { FloodReport } from '../types';

interface ReportCardProps {
  report: FloodReport;
  onPress: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onPress }) => {
  const badgeColor =
    report.kategoriBahaya === 'bahaya'
      ? COLORS.danger
      : report.kategoriBahaya === 'waspada'
      ? '#D98200'
      : COLORS.success;

  const statusLabel =
    report.statusVerifikasi === 'diverifikasi'
      ? 'TERVERIFIKASI'
      : report.statusVerifikasi === 'ditolak'
      ? 'DITOLAK'
      : 'MENUNGGU VERIFIKASI';

  const statusColor =
    report.statusVerifikasi === 'diverifikasi'
      ? COLORS.success
      : report.statusVerifikasi === 'ditolak'
      ? COLORS.danger
      : '#D98200';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      {report.fotoUrl ? (
        <Image source={{ uri: report.fotoUrl }} style={styles.thumbnail} />
      ) : null}

      <View style={styles.topRow}>
        <View style={[styles.dangerPill, { backgroundColor: badgeColor }]}>
          <Text style={styles.dangerText}>
            {report.kategoriBahaya.toUpperCase()}
            {report.ketinggianCm !== null ? ` • ${report.ketinggianCm} cm` : ''}
          </Text>
        </View>

        <Text style={[styles.verifyText, { color: statusColor }]}>
          ● {statusLabel}
        </Text>
      </View>

      <Text style={styles.locationTitle}>{report.alamatSingkat}</Text>
      <Text style={styles.subLocation}>
        Kec. {report.kecamatan}, {report.wilayah}
      </Text>

      <Text style={styles.desc} numberOfLines={2}>
        {report.deskripsi}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.sourceText}>Sumber: {report.sumberLaporan}</Text>
        <Text style={styles.footerText}>{report.waktuLaporan}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbnail: {
    width: '100%',
    height: 145,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  dangerPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: RADIUS.full },
  dangerText: { color: COLORS.white, fontSize: 11, fontWeight: '800' },
  verifyText: { fontSize: 10, fontWeight: '800' },
  locationTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  subLocation: { fontSize: 12, color: COLORS.secondary, fontWeight: '600', marginTop: 2 },
  desc: { fontSize: 13, color: COLORS.textSecondary, marginTop: SPACING.xs + 2, lineHeight: 18 },
  footer: {
    marginTop: SPACING.sm + 2,
    paddingTop: SPACING.xs + 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    gap: 2,
  },
  sourceText: { fontSize: 11, fontWeight: '600', color: COLORS.primary },
  footerText: { fontSize: 11, color: COLORS.textSecondary },
});