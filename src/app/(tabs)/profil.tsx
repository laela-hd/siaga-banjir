import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Linking,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { DEFAULT_PEKALONGAN_LOCATIONS } from '../../services/weatherService';

export default function ProfilScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 920;

  // Mengambil data user aktif dari hook autentikasi proyek Anda
  const auth = useAuth() as any;
  const user = auth?.user;

  const [pushAlert, setPushAlert] = useState(true);
  const [robAlert, setRobAlert] = useState(true);
  const [priorityDistrict, setPriorityDistrict] = useState(
    DEFAULT_PEKALONGAN_LOCATIONS[0].id
  );

  const displayName =
    user?.displayName || user?.email?.split('@')[0] || 'Pengguna Tamu';
  const displayEmail = user?.email || 'Belum masuk ke akun Firebase';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <View style={styles.root}>
      {/* HEADER PROFIL */}
      <View style={styles.header}>
        <View style={[styles.headerInner, isDesktop && styles.maxContainer]}>
          <View style={styles.profileIdentity}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userEmail}>{displayEmail}</Text>
              <View style={styles.rolePill}>
                <Ionicons name="shield-checkmark" size={12} color="#38BDF8" />
                <Text style={styles.roleText}>
                  {user ? 'Akun Terdaftar • Siaga Banjir' : 'Mode Pantau Publik'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerBtns}>
            <TouchableOpacity
              style={styles.adminBtn}
              onPress={() => router.push('/admin')}
            >
              <Ionicons name="settings-outline" size={15} color="#FFFFFF" />
              <Text style={styles.adminBtnText}>Panel Admin</Text>
            </TouchableOpacity>

            {!user && (
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/(auth)/login')}
              >
                <Ionicons name="log-in-outline" size={15} color="#0F294A" />
                <Text style={styles.loginBtnText}>Masuk Akun</Text>
              </TouchableOpacity>
            )}
          </View>
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
        <View style={isDesktop ? styles.desktopGrid : styles.mobileStack}>
          {/* KOLOM KIRI: PREFERENSI & WILAYAH PRIORITAS */}
          <View style={[styles.leftCol, isDesktop && { flex: 1.25 }]}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="location" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Wilayah Pantauan Prioritas</Text>
              </View>
              <Text style={styles.cardSub}>
                Pilih kecamatan utama yang ingin Anda pantau setiap kali membuka aplikasi:
              </Text>

              <View style={styles.chipWrap}>
                {DEFAULT_PEKALONGAN_LOCATIONS.map((loc) => {
                  const active = loc.id === priorityDistrict;
                  return (
                    <TouchableOpacity
                      key={loc.id}
                      onPress={() => setPriorityDistrict(loc.id)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text
                        style={[styles.chipText, active && styles.chipTextActive]}
                      >
                        {loc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Pengaturan Peringatan Dini</Text>
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.switchLabel}>Peringatan Banjir Terverifikasi</Text>
                  <Text style={styles.switchSub}>
                    Tampilkan notifikasi segera saat ada laporan bahaya baru
                  </Text>
                </View>
                <Switch
                  value={pushAlert}
                  onValueChange={setPushAlert}
                  trackColor={{ false: '#CBD5E1', true: '#0F294A' }}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.switchLabel}>Pantauan Rob & Curah Hujan Tinggi</Text>
                  <Text style={styles.switchSub}>
                    Sorotan khusus untuk wilayah pesisir Pekalongan Utara & Tirto
                  </Text>
                </View>
                <Switch
                  value={robAlert}
                  onValueChange={setRobAlert}
                  trackColor={{ false: '#CBD5E1', true: '#0F294A' }}
                />
              </View>
            </View>
          </View>

          {/* KOLOM KANAN: LAYANAN DARURAT TERPADU */}
          <View style={[styles.rightCol, isDesktop && { flex: 0.85 }]}>
            <View style={styles.sosCard}>
              <View style={styles.sosHeader}>
                <View style={styles.sosIconBox}>
                  <Ionicons name="warning" size={22} color="#DC2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sosTitle}>Layanan Darurat Terpadu</Text>
                  <Text style={styles.sosBadge}>SIAGA 24 JAM PEKALONGAN</Text>
                </View>
              </View>

              <Text style={styles.sosDesc}>
                Apabila terjadi kenaikan air mendadak, terjebak banjir, atau membutuhkan evakuasi kelompok rentan (lansia, balita, ibu hamil), segera hubungi layanan darurat resmi.
              </Text>

              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL('tel:112')}
              >
                <Ionicons name="call" size={18} color="#FFFFFF" />
                <Text style={styles.callText}>Panggil Layanan Darurat 112</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="information-circle-outline" size={18} color="#0284C7" />
                <Text style={styles.cardTitle}>Tentang Aplikasi</Text>
              </View>
              <Text style={styles.aboutText}>
                SIAGA BANJIR merupakan prototipe sistem informasi pemantauan banjir dan prakiraan cuaca real-time untuk wilayah Kota dan Kabupaten Pekalongan yang terintegrasi dengan Open-Meteo, BMKG, PetaBencana.id, dan Firebase.
              </Text>
            </View>
          </View>
        </View>
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
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  profileIdentity: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 2,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  userName: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  userEmail: { color: '#CBD5E1', fontSize: 12, marginTop: 2 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  roleText: { color: '#E0F2FE', fontSize: 10.5, fontWeight: '700' },

  headerBtns: { flexDirection: 'row', gap: 8 },
  adminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  adminBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  loginBtnText: { color: '#0F294A', fontSize: 12, fontWeight: '800' },

  // Layout
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  desktopGrid: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  mobileStack: { flexDirection: 'column', gap: 16 },
  leftCol: { gap: 16 },
  rightCol: { gap: 16 },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardSub: { fontSize: 12, color: '#64748B', marginBottom: 12 },

  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#0F294A', borderColor: '#0F294A' },
  chipText: { fontSize: 11.5, fontWeight: '700', color: '#334155' },
  chipTextActive: { color: '#FFFFFF' },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchLabel: { fontSize: 13.5, fontWeight: '700', color: '#0F172A' },
  switchSub: { fontSize: 11.5, color: '#64748B', marginTop: 2 },

  // SOS Card
  sosCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  sosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  sosIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosTitle: { fontSize: 15.5, fontWeight: '800', color: '#991B1B' },
  sosBadge: { fontSize: 10, fontWeight: '800', color: '#DC2626', marginTop: 2 },
  sosDesc: { fontSize: 12.5, color: '#7F1D1D', lineHeight: 19, marginBottom: 14 },
  callBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 13,
    borderRadius: 12,
  },
  callText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13.5 },
  aboutText: { fontSize: 12.5, color: '#475569', lineHeight: 19 },
});