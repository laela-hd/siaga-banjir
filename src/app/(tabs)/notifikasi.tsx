import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BellRing, CheckCheck } from 'lucide-react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { COLORS } from '../../constants/theme';

const NOTIFS = [
  {
    id: 'n1',
    title: 'Kenaikan TMA Sungai Kupang (165 cm)',
    body: 'Status berubah menjadi WASPADA. Warga bantaran sungai harap mengamankan barang berharga.',
    time: '10 menit lalu',
    unread: true,
  },
  {
    id: 'n2',
    title: 'Pengalihan Arus Jl. Raya Tirto',
    body: 'Genangan mencapai 48 cm. Gunakan jalur alternatif via Jl. Dr. Sutomo.',
    time: '28 menit lalu',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Peringatan Hujan Lebat Open-Meteo',
    body: 'Potensi curah hujan >6 mm terdeteksi di wilayah Pekalongan Barat & Wiradesa.',
    time: '1 jam lalu',
    unread: false,
  },
];

export default function NotifikasiScreen() {
  const [list, setList] = useState(NOTIFS);

  const markAllRead = () => {
    setList((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Peringatan Dini</Text>
          <Text style={styles.headerSub}>Notifikasi otomatis cuaca & tinggi muka air</Text>
        </View>
        <TouchableOpacity onPress={markAllRead} style={styles.readBtn}>
          <CheckCheck size={14} color="#FFFFFF" />
          <Text style={styles.readText}>Tandai Dibaca</Text>
        </TouchableOpacity>
      </View>

      <View style={{ padding: 16, gap: 10 }}>
        {list.map((item) => (
          <View
            key={item.id}
            style={[styles.notifCard, item.unread && styles.notifUnread]}
          >
            <View style={styles.iconWrap}>
              <BellRing size={18} color={item.unread ? COLORS.daruratBg : COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 48,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  readText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  notifCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notifUnread: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifTitle: { fontSize: 13.5, fontWeight: '700', color: COLORS.textMain },
  notifBody: { fontSize: 12, color: COLORS.textMuted, lineHeight: 17, marginTop: 3 },
  notifTime: { fontSize: 10.5, color: COLORS.primaryLight, fontWeight: '600', marginTop: 6 },
});