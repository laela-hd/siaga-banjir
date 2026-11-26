import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle2, Clock, ThumbsUp, MapPin } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

const INITIAL_REPORTS = [
  {
    id: 'rep1',
    user: 'Ahmad Fauzi',
    time: '12 menit lalu',
    location: 'Kel. Pasirkratonkramat, Pekalongan Barat',
    height: '±40 cm (Selutut)',
    desc: 'Air mulai masuk ke jalan perkampungan akibat luapan sungai dan hujan deras sejak sore.',
    verified: true,
    confirms: 14,
  },
  {
    id: 'rep2',
    user: 'Siti Rahmawati',
    time: '34 menit lalu',
    location: 'Jl. Raya Tirto, Kab. Pekalongan',
    height: '±30 cm (Sebetis)',
    desc: 'Arus lalu lintas motor melambat, beberapa kendaraan mogok di sisi barat.',
    verified: false,
    confirms: 6,
  },
];

export default function CommunityFeedCard() {
  const [tab, setTab] = useState<'warga' | 'bpbd'>('warga');
  const [reports, setReports] = useState(INITIAL_REPORTS);

  const handleConfirm = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, confirms: r.confirms + 1 } : r))
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('warga')}
          style={[styles.tabBtn, tab === 'warga' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'warga' && styles.tabTextActive]}>
            Laporan Warga (Live)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('bpbd')}
          style={[styles.tabBtn, tab === 'bpbd' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'bpbd' && styles.tabTextActive]}>
            Data Resmi BPBD
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'warga' ? (
        <View style={{ gap: 10 }}>
          {reports.map((item) => (
            <View key={item.id} style={styles.reportBox}>
              <View style={styles.repHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.user[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{item.user}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View
                  style={[
                    styles.verBadge,
                    { backgroundColor: item.verified ? COLORS.amanSoft : '#F1F5F9' },
                  ]}
                >
                  {item.verified ? (
                    <CheckCircle2 size={12} color={COLORS.amanBg} />
                  ) : (
                    <Clock size={12} color={COLORS.textMuted} />
                  )}
                  <Text
                    style={[
                      styles.verText,
                      { color: item.verified ? COLORS.amanBg : COLORS.textMuted },
                    ]}
                  >
                    {item.verified ? 'Terverifikasi' : 'Menunggu'}
                  </Text>
                </View>
              </View>

              <View style={styles.heightBadge}>
                <Text style={styles.heightText}>Tinggi Air: {item.height}</Text>
              </View>

              <Text style={styles.descText}>{item.desc}</Text>

              <View style={styles.locRow}>
                <MapPin size={13} color={COLORS.primaryLight} />
                <Text style={styles.locText}>{item.location}</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleConfirm(item.id)}
                style={styles.confirmBtn}
              >
                <ThumbsUp size={13} color={COLORS.primary} />
                <Text style={styles.confirmText}>
                  Konfirmasi Kondisi ({item.confirms} Warga)
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.bpbdBox}>
          <Text style={styles.bpbdTitle}>Buletin Posko BPBD Kota & Kab. Pekalongan</Text>
          <Text style={styles.bpbdText}>
            • Pompa air stasiun Klego dan Slamaran beroperasi penuh (4 unit aktif).{'\n'}
            • Posko pengungsian sementara disiagakan di Aula Kecamatan Pekalongan Utara & Tirto.{'\n'}
            • Hubungi Call Center Darurat 112 apabila membutuhkan evakuasi lansia/balita.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: { flex: 1, paddingVertical: 8, borderRadius: 9, alignItems: 'center' },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  tabTextActive: { color: '#FFFFFF' },
  reportBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  repHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  userName: { fontSize: 13, fontWeight: '700', color: COLORS.textMain },
  timeText: { fontSize: 11, color: COLORS.textMuted },
  verBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verText: { fontSize: 10.5, fontWeight: '700' },
  heightBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.waspadaSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 10,
  },
  heightText: { fontSize: 11.5, fontWeight: '700', color: COLORS.waspadaBg },
  descText: { fontSize: 12.5, color: COLORS.textMain, lineHeight: 18, marginTop: 8 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  locText: { fontSize: 11.5, color: COLORS.primaryLight, fontWeight: '600' },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: 'rgba(15, 52, 96, 0.08)',
  },
  confirmText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  bpbdBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  bpbdTitle: { fontSize: 13.5, fontWeight: '800', color: COLORS.primary, marginBottom: 6 },
  bpbdText: { fontSize: 12.5, color: COLORS.textMain, lineHeight: 20 },
});