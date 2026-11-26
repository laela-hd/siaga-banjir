import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Search, CloudRain, Droplets, Wind, Sun } from 'lucide-react-native';
import { COLORS, PEKALONGAN_DISTRICTS, DistrictItem } from '../constants/theme';

export default function WeatherForecastCard() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DistrictItem>(PEKALONGAN_DISTRICTS[0]);
  const [mode, setMode] = useState<'today' | '7days'>('today');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=temperature_2m,precipitation,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FJakarta`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selected]);

  const filteredDistricts = PEKALONGAN_DISTRICTS.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const getDotColor = (risk: string) => {
    if (risk === 'darurat') return COLORS.daruratBg;
    if (risk === 'waspada') return COLORS.waspadaBg;
    return COLORS.amanBg;
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Pantau Wilayah & Prakiraan Cuaca</Text>

      {/* Kolom Pencarian */}
      <View style={styles.searchBox}>
        <Search size={16} color={COLORS.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari kecamatan (Tirto, Wiradesa, Kajen)..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.searchInput}
        />
      </View>

      {/* Chip Kecamatan Horizontal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        {filteredDistricts.map((item) => {
          const isSelected = item.id === selected.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelected(item)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <View style={[styles.riskDot, { backgroundColor: getDotColor(item.risk) }]} />
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Panel Cuaca */}
      {loading || !weather?.current ? (
        <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 24 }} />
      ) : (
        <View style={styles.weatherBox}>
          <View style={styles.weatherHeader}>
            <View>
              <Text style={styles.districtTitle}>{selected.name}</Text>
              <Text style={styles.districtSub}>{selected.area} • Open-Meteo Live</Text>
            </View>
            <View style={styles.tempGroup}>
              <CloudRain size={28} color={COLORS.primaryLight} />
              <Text style={styles.tempBig}>{Math.round(weather.current.temperature_2m)}°C</Text>
            </View>
          </View>

          {/* 3 Metrik Cuaca Sejajar */}
          <View style={styles.miniMetrics}>
            <View style={styles.miniBox}>
              <CloudRain size={14} color={COLORS.primaryLight} />
              <Text style={styles.miniVal}>{weather.current.precipitation} mm</Text>
              <Text style={styles.miniLbl}>Curah Hujan</Text>
            </View>
            <View style={styles.miniBox}>
              <Droplets size={14} color="#0284C7" />
              <Text style={styles.miniVal}>{weather.current.relative_humidity_2m}%</Text>
              <Text style={styles.miniLbl}>Kelembapan</Text>
            </View>
            <View style={styles.miniBox}>
              <Wind size={14} color="#475569" />
              <Text style={styles.miniVal}>{weather.current.wind_speed_10m} km/j</Text>
              <Text style={styles.miniLbl}>Angin</Text>
            </View>
          </View>

          {/* Segmented Control: Hari Ini vs 7 Hari */}
          <View style={styles.segmentWrap}>
            <TouchableOpacity
              onPress={() => setMode('today')}
              style={[styles.segmentBtn, mode === 'today' && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentText, mode === 'today' && styles.segmentTextActive]}>
                Hari Ini (Per Jam)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('7days')}
              style={[styles.segmentBtn, mode === '7days' && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentText, mode === '7days' && styles.segmentTextActive]}>
                7 Hari ke Depan
              </Text>
            </TouchableOpacity>
          </View>

          {/* Konten Prakiraan */}
          {mode === 'today' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {weather.hourly.time.slice(0, 8).map((t: string, idx: number) => {
                const hourStr = t.split('T')[1];
                const rain = weather.hourly.precipitation[idx];
                const isHeavy = rain >= 2.0;
                return (
                  <View
                    key={t}
                    style={[styles.hourCard, isHeavy && styles.hourCardRain]}
                  >
                    <Text style={styles.hourTime}>{hourStr}</Text>
                    {isHeavy ? (
                      <CloudRain size={18} color="#1D4ED8" style={{ marginVertical: 6 }} />
                    ) : (
                      <Sun size={18} color="#D97706" style={{ marginVertical: 6 }} />
                    )}
                    <Text style={styles.hourTemp}>
                      {Math.round(weather.hourly.temperature_2m[idx])}°
                    </Text>
                    <Text style={styles.hourRain}>{rain} mm</Text>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={{ marginTop: 10, gap: 6 }}>
              {weather.daily.time.map((day: string, idx: number) => {
                const rainSum = weather.daily.precipitation_sum[idx];
                const isHeavy = rainSum >= 5.0;
                const dateObj = new Date(day);
                const label = dateObj.toLocaleDateString('id-ID', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });
                return (
                  <View
                    key={day}
                    style={[styles.dayRow, isHeavy && styles.dayRowHeavy]}
                  >
                    <Text style={styles.dayLabel}>{label}</Text>
                    <Text style={[styles.dayRain, isHeavy && { color: '#1D4ED8', fontWeight: '700' }]}>
                      {rainSum} mm
                    </Text>
                    <Text style={styles.dayTemp}>
                      {Math.round(weather.daily.temperature_2m_min[idx])}° /{' '}
                      {Math.round(weather.daily.temperature_2m_max[idx])}°
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
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
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textMain, marginBottom: 10 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: COLORS.textMain },
  chipScroll: { marginTop: 10, marginBottom: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  riskDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMain },
  chipTextActive: { color: '#FFFFFF' },
  weatherBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  districtTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textMain },
  districtSub: { fontSize: 11.5, color: COLORS.textMuted, marginTop: 2 },
  tempGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tempBig: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  miniMetrics: { flexDirection: 'row', gap: 8, marginTop: 12 },
  miniBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniVal: { fontSize: 12.5, fontWeight: '700', color: COLORS.textMain, marginTop: 3 },
  miniLbl: { fontSize: 10, color: COLORS.textMuted },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
    marginTop: 14,
  },
  segmentBtn: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#FFFFFF' },
  segmentText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },
  segmentTextActive: { color: COLORS.primary, fontWeight: '700' },
  hourCard: {
    width: 68,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hourCardRain: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  hourTime: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  hourTemp: { fontSize: 13.5, fontWeight: '800', color: COLORS.textMain },
  hourRain: { fontSize: 10, color: '#2563EB', marginTop: 2 },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayRowHeavy: { backgroundColor: '#EFF6FF', borderColor: '#93C5FD' },
  dayLabel: { flex: 1, fontSize: 12.5, fontWeight: '600', color: COLORS.textMain },
  dayRain: { width: 70, textAlign: 'center', fontSize: 12, color: COLORS.textMuted },
  dayTemp: { width: 75, textAlign: 'right', fontSize: 12.5, fontWeight: '700', color: COLORS.textMain },
});