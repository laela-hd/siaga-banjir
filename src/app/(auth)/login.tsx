import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { loginUser } from '../../services/authService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validasi', 'Email dan kata sandi wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      await loginUser(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      let msg = 'Gagal masuk. Periksa koneksi internet Anda.';
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        msg = 'Email atau kata sandi salah.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Format email tidak valid.';
      }
      Alert.alert('Login Gagal', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <Ionicons name="shield-checkmark" size={44} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>SIAGA BANJIR</Text>
        <Text style={styles.subtitle}>Kota & Kabupaten Pekalongan</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="contoh: warga@pekalongan.id"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!submitting}
        />

        <Text style={styles.label}>Kata Sandi</Text>
        <TextInput
          style={styles.input}
          placeholder="Masukkan kata sandi"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!submitting}
        />

        <TouchableOpacity
          style={[styles.primaryButton, submitting && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>MASUK</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/register')}
          disabled={submitting}
        >
          <Text style={styles.linkText}>
            Belum punya akun? <Text style={styles.linkBold}>Daftar di sini</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: SPACING.md },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  iconWrapper: { alignSelf: 'center', backgroundColor: '#EBF5FF', padding: SPACING.md, borderRadius: RADIUS.full, marginBottom: SPACING.sm },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.primary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: COLORS.background, marginBottom: SPACING.md },
  primaryButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: RADIUS.sm, alignItems: 'center', marginTop: SPACING.xs },
  primaryButtonText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  linkButton: { marginTop: SPACING.md, alignItems: 'center' },
  linkText: { fontSize: 13, color: COLORS.textSecondary },
  linkBold: { color: COLORS.secondary, fontWeight: '700' },
});