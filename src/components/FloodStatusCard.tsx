import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { DangerLevel } from '../types';

interface FloodStatusCardProps {
  status: DangerLevel;
  activeCount: number;
  lastUpdated: string;
}

const STATUS_CONFIG: Record<
  DangerLevel,
  {
    label: string;
    bg: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  bahaya: {
    label: 'STATUS SIAGA: BAHAYA',
    bg: COLORS.danger,
    description: 'Terdapat genangan tinggi (>70 cm). Segera hindari jalur terdampak.',
    icon: 'warning',
  },
  waspada: {
    label: 'STATUS SIAGA: WASPADA',
    bg: '#D98200',
    description: 'Debit air meningkat di beberapa kecamatan Pekalongan.',
    icon: 'alert-circle',
  },
  aman: {
    label: 'STATUS SIAGA: AMAN',
    bg: COLORS.success,
    description: 'Kondisi wilayah Kota & Kabupaten Pekalongan terkendali.',
    icon: 'shield-checkmark',
  },
};

export const FloodStatusCard: React.FC<FloodStatusCardProps> = ({
  status,
  activeCount,
  lastUpdated,
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.card, { backgroundColor: config.bg }]}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Ionicons name={config.icon} size={18} color={COLORS.white} />
          <Text style={styles.badgeText}>{config.label}</Text>
        </View>
        <Text style={styles.countText}>{activeCount} Titik Aktif</Text>
      </View>

      <Text style={styles.description}>{config.description}</Text>

      <View style={styles.footerRow}>
        <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.85)" />
        <Text style={styles.timeText}>Pembaruan: {lastUpdated}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  countText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  description: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
  },
});