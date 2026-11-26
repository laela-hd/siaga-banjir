import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { AlertOctagon, CornerUpRight, Navigation } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

const ROUTES_DATA = [
  {
    id: 'r1',
    road: 'Jl. Raya Tirto – Depan Pasar',
    severity: 'Lumpuh / Tutup Total',
    isSevere: true,
    water: '±48 cm • Diperbarui 8 mnt lalu',
    vehicle: ['motor', 'mobil'],
    alt: 'Simpang Grogolan ➔ Jl. Dr. Sutomo ➔ Jl. Perintis Kemerdekaan (+7 mnt)',
    lat: -6.8872,
    lon: 109.6381,
  },
  {
    id: 'r2',
    road: 'Jl. Pantura Wiradesa (Arah Semarang)',
    severity: 'Macet / Rawan Mogok',
    isSevere: false,
    water: '±28 cm • Diperbarui 15 mnt lalu',
    vehicle: ['motor'],
    alt: 'Jalur Lingkar Utara ➔ Jl. Patiunus ➔ Keluar Ponolawen (+5 mnt)',
    lat: -6.8856,
    lon: 109.6139,
  },
];

export default function RouteAlertCard() {
  const [filter, setFilter] = useState<'all' | 'motor' | 'mobil'>('all');

  const filtered = ROUTES_DATA.filter((r) =>
    filter === 'all' ? true : r.vehicle.includes(filter)
  );

  const openMaps = (lat: number, lon: number) => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`);
  };

  return (
    <View style={styles.sectionCard}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <AlertOctagon size={18} color={COLORS.daruratBg} />
          <Text style={styles.sectionTitle}>Rute Dihindari & Alternatif</Text>
        </View>
        <View style={styles.filterGroup}>
          {(['all', 'motor', 'mobil'] as const).map((v) => (
            <TouchableOpacity
              key={v}
              onPress={() => setFilter(v)}
              style={[styles.filterChip, filter === v && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === v && styles.filterTextActive]}>
                {v === 'all' ? 'Semua' : v === 'motor' ? 'Motor' : 'Mobil'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {filtered.map((item) => (
        <View key={item.id} style={styles.routeItem}>
          <View style={styles.routeTop}>
            <Text style={styles.roadName}>{item.road}</Text>
            <View
              style={[
                styles.sevBadge,
                { backgroundColor: item.isSevere ? COLORS.daruratSoft : COLORS.waspadaSoft },
              ]}
            >
              <Text
                style={[
                  styles.sevText,
                  { color: item.isSevere ? COLORS.daruratBg : COLORS.waspadaBg },
                ]}
              >
                {item.severity}
              </Text>
            </View>
          </View>
          <Text style={styles.waterInfo}>{item.water}</Text>

          <View style={styles.altBox}>
            <CornerUpRight size={16} color={COLORS.amanBg} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.altLabel}>Jalur Alternatif:</Text>
              <Text style={styles.altDesc}>{item.alt}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => openMaps(item.lat, item.lon)}
          >
            <Navigation size={14} color="#FFFFFF" />
            <Text style={styles.navBtnText}>Buka Navigasi Alternatif</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  titleGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textMain },
  filterGroup: { flexDirection: 'row', gap: 4 },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  filterTextActive: { color: '#FFFFFF' },
  routeItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  roadName: { flex: 1, fontSize: 13.5, fontWeight: '700', color: COLORS.textMain },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  sevText: { fontSize: 10, fontWeight: '700' },
  waterInfo: { fontSize: 11.5, color: COLORS.textMuted, marginTop: 4, marginBottom: 8 },
  altBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  altLabel: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  altDesc: { fontSize: 12, color: '#047857', marginTop: 2, lineHeight: 17 },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 9,
    borderRadius: 10,
  },
  navBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});