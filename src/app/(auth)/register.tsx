import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { registerUser } from '../../services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [kecamatan, setKecamatan] = useState('Pekalongan Barat');
  const [noHp, setNoHp] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!nama.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Validasi', 'Nama, email wajib diisi, dan sandi minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({
        nama,
        email,
        password,
        kecamatanPantauan: kecamatan,
        noHp,
      });
      Alert.alert('Berhasil', 'Akun warga berhasil dibuat!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: any) {
      let msg = 'Gagal mendaftar. Periksa koneksi internet Anda.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Email sudah terdaftar. Silakan langsung masuk.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Format email tidak valid.';
      }
      Alert.alert('Registrasi Gagal', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <Text style={styles.title}>Daftar Akun Warga</Text>
        <Text style={styles.subtitle}>Bergabung untuk memantau & melaporkan banjir Pekalongan</Text>

        <Text style={styles.label}>Nama Lengkap *</Text>
        <TextInput style={styles.input} placeholder="Masukkan nama lengkap" value={nama} onChangeText={setNama} editable={!submitting} />

        <Text style={styles.label}>Email *</Text>
        <TextInput style={styles.input} placeholder="contoh: nama@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} editable={!submitting} />

        <Text style={styles.label}>Kecamatan Pantauan *</Text>
        <TextInput style={styles.input} placeholder="Contoh: Tirto / Pekalongan Utara" value={kecamatan} onChangeText={setKecamatan} editable={!submitting} />

        <Text style={styles.label}>Nomor HP / WhatsApp (Opsional)</Text>
        <TextInput style={styles.input} placeholder="08123456789" keyboardType="phone-pad" value={noHp} onChangeText={setNoHp} editable={!submitting} />

        <Text style={styles.label}>Kata Sandi (Min. 6 Karakter) *</Text>
        <TextInput style={styles.input} placeholder="Buat kata sandi" secureTextEntry value={password} onChangeText={setPassword} editable={!submitting} />

        <TouchableOpacity
          style={[styles.primaryButton, submitting && { opacity: 0.7 }]}
          onPress={handleRegister}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>DAFTAR SEKARANG</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { padding: SPACING.md, justifyContent: 'center' },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.lg },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: COLORS.background, marginBottom: SPACING.md },
  primaryButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: RADIUS.sm, alignItems: 'center', marginTop: SPACING.xs },
  primaryButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});