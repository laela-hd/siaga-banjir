import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { RealWeatherData } from '../types';

interface WeatherCardProps {
  weather: RealWeatherData;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  const isCached = weather.provenance.status === 'cached';

  // Memisahkan nama wilayah utama dengan kode teknis ADM4 agar rapi
  const mainLocation = weather.detailLokasi.split('(')[0].trim();
  const subLocation = weather.detailLokasi.includes('(')
    ? weather.detailLokasi.slice(weather.detailLokasi.indexOf('('))
    : '';

  // Memformat waktu ISO menjadi lebih manusiawi
  const cleanTime = weather.waktuPrakiraan.includes('T')
    ? weather.waktuPrakiraan.replace('T', ' • ') + ' WIB'
    : weather.waktuPrakiraan;

  // Menentukan ikon berdasarkan teks kondisi cuaca
  const getWeatherIcon = (kondisi: string) => {
    const text = kondisi.toLowerCase();
    if (text.includes('petir') || text.includes('lebat')) {
      return { name: 'thunderstorm' as const, color: '#1D4ED8' };
    }
    if (text.includes('hujan') || text.includes('gerimis')) {
      return { name: 'rainy' as const, color: '#0284C7' };
    }
    if (text.includes('cerah')) {
      return { name: 'sunny' as const, color: '#D97706' };
    }
    return { name: 'partly-sunny' as const, color: '#0284C7' };
  };

  const heroIcon = getWeatherIcon(weather.kondisi);

  // Hitung rentang suhu min/max 7 hari untuk bilah visual suhu
  const allMins = weather.prakiraan7Hari?.map((d) => d.suhuMin) ?? [24];
  const allMaxs = weather.prakiraan7Hari?.map((d) => d.suhuMax) ?? [34];
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const tempSpan = Math.max(globalMax - globalMin, 1);

  return (
    <View style={styles.card}>
      {/* BARIS SUMBER DATA */}
      <View style={styles.sourceHeader}>
        <View style={styles.sourceBadge}>
          <Ionicons name="checkmark-circle" size={13} color="#0284C7" />
          <Text style={styles.sourceText}>{weather.provenance.sourceName}</Text>
        </View>
        {isCached ? (
          <View style={styles.cachedBadge}>
            <Text style={styles.cachedText}>DATA TERAKHIR</Text>
          </View>
        ) : (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AKTUAL</Text>
          </View>
        )}
      </View>

      {weather.provenance.errorMessage ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={14} color="#92400E" />
          <Text style={styles.errorNote}>{weather.provenance.errorMessage}</Text>
        </View>
      ) : null}

      {/* IDENTITAS WILAYAH & WAKTU */}
      <View style={styles.locationBlock}>
        <Text style={styles.location}>{mainLocation}</Text>
        {subLocation ? <Text style={styles.subLocation}>{subLocation}</Text> : null}
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={12} color="#64748B" />
          <Text style={styles.forecastTime}>Diperbarui: {cleanTime}</Text>
        </View>
      </View>

      {/* WEATHER HERO BOX */}
      <View style={styles.heroWeatherBox}>
        <View style={styles.tempGroup}>
          <View style={styles.weatherIconCircle}>
            <Ionicons name={heroIcon.name} size={32} color={heroIcon.color} />
          </View>
          <View>
            <Text style={styles.temp}>{weather.suhu}°C</Text>
            <Text style={styles.condition}>{weather.kondisi}</Text>
          </View>
        </View>

        {/* 3 METRIK CUACA DALAM KOTAK SEJAJAR */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricTile}>
            <Ionicons name="rainy-outline" size={15} color="#2563EB" />
            <Text style={styles.metricValue}>{weather.curahHujanMm} mm</Text>
            <Text style={styles.metricLabel}>Curah Hujan</Text>
          </View>

          <View style={styles.metricTile}>
            <Ionicons name="water-outline" size={15} color="#0D9488" />
            <Text style={styles.metricValue}>{weather.kelembapan}%</Text>
            <Text style={styles.metricLabel}>Kelembapan</Text>
          </View>

          <View style={styles.metricTile}>
            <Ionicons name="speedometer-outline" size={15} color="#475569" />
            <Text style={styles.metricValue}>{weather.kecepatanAnginKmh} km/j</Text>
            <Text style={styles.metricLabel}>Angin</Text>
          </View>
        </View>
      </View>

      {/* PRAKIRAAN PER JAM (BMKG) */}
      {weather.prakiraanBerikutnya.length > 0 && (
        <View style={styles.hourlySection}>
          <Text style={styles.sectionHeading}>Prakiraan Per Jam Berikutnya</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hourlyScroll}
          >
            {weather.prakiraanBerikutnya.map((item, idx) => {
              const iconCfg = getWeatherIcon(item.kondisi);
              return (
                <View key={idx} style={styles.hourlyItem}>
                  <Text style={styles.hourText}>
                    {item.waktuLokal.slice(11, 16) || item.waktuLokal}
                  </Text>
                  <Ionicons
                    name={iconCfg.name}
                    size={20}
                    color={iconCfg.color}
                    style={{ marginVertical: 6 }}
                  />
                  <Text style={styles.hourTemp}>{item.suhu}°C</Text>
                  <Text style={styles.hourCond} numberOfLines={1}>
                    {item.kondisi}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* PRAKIRAAN 7 HARI KE DEPAN DENGAN BAR SUHU */}
      {weather.prakiraan7Hari && weather.prakiraan7Hari.length > 0 && (
        <View style={styles.dailySection}>
          <View style={styles.dailyHeaderRow}>
            <Text style={styles.sectionHeading}>Prakiraan 7 Hari ke Depan</Text>
            <Text style={styles.dailyHint}>Sorotan biru = potensi hujan lebat</Text>
          </View>

          <View style={{ gap: 6 }}>
            {weather.prakiraan7Hari.map((day, idx) => {
              const isHeavyRain = day.curahHujanTotalMm >= 5;
              const iconCfg = getWeatherIcon(day.kondisi);
              const leftPct = ((day.suhuMin - globalMin) / tempSpan) * 100;
              const widthPct = Math.max(((day.suhuMax - day.suhuMin) / tempSpan) * 100, 18);

              return (
                <View
                  key={idx}
                  style={[styles.dailyRow, isHeavyRain && styles.dailyRowHeavy]}
                >
                  <View style={styles.dailyDateCol}>
                    <Text style={styles.dailyDate}>{day.tanggal}</Text>
                    <Text style={styles.dailyCond} numberOfLines={1}>
                      {day.kondisi}
                    </Text>
                  </View>

                  <Ionicons name={iconCfg.name} size={18} color={iconCfg.color} />

                  <View
                    style={[
                      styles.rainBadge,
                      isHeavyRain && { backgroundColor: '#DBEAFE' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dailyRain,
                        isHeavyRain && { color: '#1D4ED8', fontWeight: '800' },
                      ]}
                    >
                      {day.curahHujanTotalMm} mm
                    </Text>
                  </View>

                  {/* Bilah Rentang Suhu */}
                  <View style={styles.tempRangeCol}>
                    <Text style={styles.tempMinText}>{day.suhuMin}°</Text>
                    <View style={styles.tempBarTrack}>
                      <View
                        style={[
                          styles.tempBarFill,
                          {
                            left: `${Math.min(leftPct, 75)}%`,
                            width: `${Math.min(widthPct, 100)}%`,
                            backgroundColor: isHeavyRain ? '#2563EB' : '#F59E0B',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.tempMaxText}>{day.suhuMax}°</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* FOOTER PROVENANCE RINGKAS */}
      <View style={styles.provenanceFooter}>
        <Text style={styles.provText}>
          Terbit: {weather.provenance.publishedAt} • Diambil: {weather.provenance.fetchedAt}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sourceText: { fontSize: 11, fontWeight: '800', color: '#0369A1' },
  cachedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cachedText: { fontSize: 10, fontWeight: '800', color: '#92400E' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#15803D' },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorNote: { flex: 1, fontSize: 11, color: '#92400E' },

  locationBlock: { marginBottom: 12 },
  location: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  subLocation: { fontSize: 11.5, color: '#64748B', marginTop: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  forecastTime: { fontSize: 11, color: '#64748B', fontWeight: '600' },

  heroWeatherBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tempGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  weatherIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  temp: { fontSize: 30, fontWeight: '800', color: '#0F294A', lineHeight: 34 },
  condition: { fontSize: 13.5, fontWeight: '700', color: '#334155', marginTop: 2 },

  metricsGrid: { flexDirection: 'row', gap: 8 },
  metricTile: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricValue: { fontSize: 12, fontWeight: '800', color: '#0F172A', marginTop: 3 },
  metricLabel: { fontSize: 10, color: '#64748B', marginTop: 1 },

  hourlySection: { marginTop: 14 },
  sectionHeading: { fontSize: 12.5, fontWeight: '800', color: '#0F294A' },
  hourlyScroll: { gap: 8, paddingTop: 8 },
  hourlyItem: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 76,
  },
  hourText: { fontSize: 11, color: '#64748B', fontWeight: '700' },
  hourTemp: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  hourCond: { fontSize: 10, color: '#0284C7', fontWeight: '600', marginTop: 2, maxWidth: 64 },

  dailySection: { marginTop: 14 },
  dailyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyHint: { fontSize: 10, color: '#64748B' },
  dailyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  dailyRowHeavy: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  dailyDateCol: { width: 88 },
  dailyDate: { fontSize: 11.5, fontWeight: '800', color: '#0F172A' },
  dailyCond: { fontSize: 10, color: '#64748B', marginTop: 1 },
  rainBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    minWidth: 52,
    alignItems: 'center',
  },
  dailyRain: { fontSize: 10.5, color: '#475569', fontWeight: '600' },
  tempRangeCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
  },
  tempMinText: { fontSize: 11, color: '#64748B', fontWeight: '600', width: 24, textAlign: 'right' },
  tempBarTrack: {
    flex: 1,
    maxWidth: 56,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
  tempBarFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  tempMaxText: { fontSize: 11, fontWeight: '800', color: '#0F294A', width: 26 },

  provenanceFooter: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  provText: { fontSize: 10, color: '#64748B', textAlign: 'center' },
});