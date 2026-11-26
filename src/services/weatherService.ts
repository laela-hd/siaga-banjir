import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealWeatherData, ForecastItem, DailyForecastItem } from '../types';

export interface SearchableLocation {
  id: string;
  label: string;
  subLabel: string;
  latitude: number;
  longitude: number;
  adm4?: string;
}

// Daftar wilayah Pekalongan siap pilih (termasuk kode ADM4 BMKG yang sudah terverifikasi)
export const DEFAULT_PEKALONGAN_LOCATIONS: SearchableLocation[] = [
  {
    id: 'pekalongan-barat',
    label: 'Pekalongan Barat',
    subLabel: 'Kota Pekalongan (ADM4: 33.75.01.1003)',
    latitude: -6.8886,
    longitude: 109.6753,
    adm4: '33.75.01.1003',
  },
  {
    id: 'pekalongan-utara',
    label: 'Pekalongan Utara',
    subLabel: 'Kota Pekalongan (ADM4: 33.75.03.1001)',
    latitude: -6.8665,
    longitude: 109.6834,
    adm4: '33.75.03.1001',
  },
  {
    id: 'pekalongan-timur',
    label: 'Pekalongan Timur',
    subLabel: 'Kota Pekalongan',
    latitude: -6.8932,
    longitude: 109.6875,
  },
  {
    id: 'pekalongan-selatan',
    label: 'Pekalongan Selatan',
    subLabel: 'Kota Pekalongan',
    latitude: -6.9235,
    longitude: 109.6721,
  },
  {
    id: 'tirto',
    label: 'Kec. Tirto',
    subLabel: 'Kabupaten Pekalongan (ADM4: 33.26.16.2007)',
    latitude: -6.8981,
    longitude: 109.6365,
    adm4: '33.26.16.2007',
  },
  {
    id: 'wiradesa',
    label: 'Kec. Wiradesa',
    subLabel: 'Kabupaten Pekalongan',
    latitude: -6.8924,
    longitude: 109.6132,
  },
  {
    id: 'buaran',
    label: 'Kec. Buaran',
    subLabel: 'Kabupaten Pekalongan',
    latitude: -6.9295,
    longitude: 109.6518,
  },
  {
    id: 'kedungwuni',
    label: 'Kec. Kedungwuni',
    subLabel: 'Kabupaten Pekalongan',
    latitude: -6.9667,
    longitude: 109.6481,
  },
  {
    id: 'kajen',
    label: 'Kec. Kajen',
    subLabel: 'Kabupaten Pekalongan (ADM4: 33.26.08.1009)',
    latitude: -7.0268,
    longitude: 109.5811,
    adm4: '33.26.08.1009',
  },
];

const CACHE_BMKG_PREFIX = '@real_bmkg_v2_';
const CACHE_7DAY_PREFIX = '@real_7day_v2_';

const formatNowWib = (): string =>
  new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' WIB';

const formatIndoDate = (isoDate: string): string => {
  try {
    const d = new Date(`${isoDate}T00:00:00`);
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return isoDate;
  }
};

const mapWmoCodeToIndonesian = (code: number): string => {
  if (code === 0) return 'Cerah';
  if (code >= 1 && code <= 3) return 'Berawan';
  if (code === 45 || code === 48) return 'Berkabut';
  if (code >= 51 && code <= 57) return 'Gerimis';
  if (code >= 61 && code <= 65) return 'Hujan Ringan - Sedang';
  if (code >= 80 && code <= 82) return 'Hujan Lebat';
  if (code >= 95 && code <= 99) return 'Hujan Petir';
  return `Kode WMO ${code}`;
};

// 1. PENCARIAN NAMA DAERAH NYATA (Open-Meteo Geocoding API)
export const searchLocationsByName = async (
  keyword: string
): Promise<SearchableLocation[]> => {
  const trimmed = keyword.trim();
  if (!trimmed) return DEFAULT_PEKALONGAN_LOCATIONS;

  // Filter cepat dari daftar lokal Pekalongan dulu
  const localMatches = DEFAULT_PEKALONGAN_LOCATIONS.filter(
    (loc) =>
      loc.label.toLowerCase().includes(trimmed.toLowerCase()) ||
      loc.subLabel.toLowerCase().includes(trimmed.toLowerCase())
  );

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=8&language=id&format=json`;
    const res = await fetch(url);
    if (!res.ok) return localMatches;

    const json = await res.json();
    const results: any[] = json?.results || [];

    const remoteLocations: SearchableLocation[] = results
      .filter((r) => r.country_code === 'ID')
      .map((r) => ({
        id: `geo_${r.id}`,
        label: r.name,
        subLabel: [r.admin2, r.admin1, 'Indonesia'].filter(Boolean).join(', '),
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
      }));

    // Gabungkan hasil lokal (yang punya ADM4 BMKG) dengan hasil geocoding
    const merged = [...localMatches];
    for (const remote of remoteLocations) {
      if (!merged.some((m) => m.label.toLowerCase() === remote.label.toLowerCase())) {
        merged.push(remote);
      }
    }
    return merged;
  } catch {
    return localMatches;
  }
};

// 2. PRAKIRAAN CUACA 7 HARI KE DEPAN (Open-Meteo Daily & Current Forecast)
export const fetchSevenDayWeatherForecast = async (
  location: SearchableLocation
): Promise<RealWeatherData | null> => {
  const cacheKey = `${CACHE_7DAY_PREFIX}${location.id}`;
  const fetchedAt = formatNowWib();
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${location.latitude}&longitude=${location.longitude}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
    `&forecast_days=7` +
    `&timezone=Asia%2FJakarta`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} dari Open-Meteo`);
    }

    const json = await response.json();
    const cur = json?.current;
    const daily = json?.daily;

    if (!cur || !daily?.time) {
      throw new Error('Data prakiraan 7 hari tidak tersedia.');
    }

    const dailyList: DailyForecastItem[] = daily.time.map(
      (dateStr: string, idx: number) => ({
        tanggal: formatIndoDate(dateStr),
        suhuMax: Math.round(Number(daily.temperature_2m_max?.[idx] ?? 0)),
        suhuMin: Math.round(Number(daily.temperature_2m_min?.[idx] ?? 0)),
        kondisi: mapWmoCodeToIndonesian(Number(daily.weather_code?.[idx] ?? 0)),
        curahHujanTotalMm: Number(
          Number(daily.precipitation_sum?.[idx] ?? 0).toFixed(1)
        ),
      })
    );

    const result: RealWeatherData = {
      wilayahLabel: location.label,
      detailLokasi: `${location.label} (${location.subLabel})`,
      suhu: Number(cur.temperature_2m),
      kondisi: mapWmoCodeToIndonesian(Number(cur.weather_code)),
      kelembapan: Number(cur.relative_humidity_2m),
      kecepatanAnginKmh: Number(cur.wind_speed_10m),
      curahHujanMm: Number(cur.precipitation ?? 0),
      waktuPrakiraan: cur.time || '-',
      prakiraanBerikutnya: [],
      prakiraan7Hari: dailyList,
      provenance: {
        sourceName: 'Open-Meteo 7-Day Forecast API',
        publishedAt: cur.time || '-',
        fetchedAt,
        status: 'success',
      },
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (error: any) {
    const cachedRaw = await AsyncStorage.getItem(cacheKey);
    if (cachedRaw) {
      const parsed: RealWeatherData = JSON.parse(cachedRaw);
      return {
        ...parsed,
        provenance: {
          ...parsed.provenance,
          status: 'cached',
          errorMessage: `Gagal memuat data baru (${error.message}). Menampilkan DATA TERAKHIR.`,
        },
      };
    }
    return null;
  }
};

// 3. PRAKIRAAN CUACA RESMI BMKG (Jika Wilayah Memiliki Kode ADM4)
export const fetchBmkgOfficialWeather = async (
  location: SearchableLocation
): Promise<RealWeatherData | null> => {
  if (!location.adm4) return null;

  const cacheKey = `${CACHE_BMKG_PREFIX}${location.adm4}`;
  const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${location.adm4}`;
  const fetchedAt = formatNowWib();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SiagaBanjirPekalongan/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} dari server BMKG`);
    }

    const json = await response.json();
    const lokasiObj = json?.lokasi;
    const cuacaGroups: any[][] = json?.data?.[0]?.cuaca || [];
    const flatForecasts = cuacaGroups.flat();

    if (flatForecasts.length === 0) {
      throw new Error('Data prakiraan BMKG kosong.');
    }

    const currentItem = flatForecasts[0];
    const windKmh = Number((Number(currentItem.ws || 0) * 3.6).toFixed(1));

    const nextItems: ForecastItem[] = flatForecasts.slice(0, 4).map((item) => ({
      waktuLokal: item.local_datetime || item.utc_datetime || '-',
      suhu: Number(item.t),
      kondisi: item.weather_desc || '-',
      kelembapan: Number(item.hu),
      kecepatanAnginKmh: Number((Number(item.ws || 0) * 3.6).toFixed(1)),
      curahHujanMm: Number(item.tp ?? 0),
    }));

    const detailLokasi = lokasiObj
      ? `Kel/Desa ${lokasiObj.desa}, Kec. ${lokasiObj.kecamatan}, ${lokasiObj.kotkab}`
      : location.label;

    const result: RealWeatherData = {
      wilayahLabel: location.label,
      detailLokasi,
      suhu: Number(currentItem.t),
      kondisi: currentItem.weather_desc || '-',
      kelembapan: Number(currentItem.hu),
      kecepatanAnginKmh: windKmh,
      curahHujanMm: Number(currentItem.tp ?? 0),
      waktuPrakiraan: currentItem.local_datetime || '-',
      prakiraanBerikutnya: nextItems,
      prakiraan7Hari: [],
      provenance: {
        sourceName: `BMKG Resmi (ADM4: ${location.adm4})`,
        publishedAt: currentItem.analysis_date || currentItem.local_datetime || '-',
        fetchedAt,
        status: 'success',
      },
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
    return result;
  } catch (error: any) {
    const cachedRaw = await AsyncStorage.getItem(cacheKey);
    if (cachedRaw) {
      const parsed: RealWeatherData = JSON.parse(cachedRaw);
      return {
        ...parsed,
        provenance: {
          ...parsed.provenance,
          status: 'cached',
          errorMessage: `API BMKG gagal diakses (${error.message}). Menampilkan DATA TERAKHIR.`,
        },
      };
    }
    return null;
  }
};