import fs from 'node:fs';

const nowIso = new Date().toISOString();
console.log('=== PENGUJIAN KONEKSI API NYATA SIAGA BANJIR ===');
console.log('Waktu Pengujian:', nowIso, '\n');

async function testBMKG() {
  const adm4 = '33.75.01.1003';
  const url = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`;
  console.log('1. Menguji BMKG:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SiagaBanjirPekalongan/1.0 (Student Research Project)',
        Accept: 'application/json',
      },
    });
    console.log('   HTTP Status:', res.status);
    const json = await res.json();
    const lokasi = json?.lokasi;
    const firstForecast = json?.data?.[0]?.cuaca?.[0]?.[0];

    console.log('   Lokasi Terbaca:', lokasi?.desa, '-', lokasi?.kecamatan, '-', lokasi?.kotkab);
    console.log('   Contoh Prakiraan Pertama:', JSON.stringify(firstForecast, null, 2));
    return { ok: res.ok, status: res.status, url, lokasi, sample: firstForecast };
  } catch (err) {
    console.error('   GAGAL BMKG:', err.message);
    return { ok: false, url, error: err.message };
  }
}

async function testOpenMeteo() {
  const url =
    'https://api.open-meteo.com/v1/forecast?latitude=-6.8886&longitude=109.6753&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FJakarta';
  console.log('\n2. Menguji Open-Meteo:', url);
  try {
    const res = await fetch(url);
    console.log('   HTTP Status:', res.status);
    const json = await res.json();
    console.log('   Current Weather:', JSON.stringify(json?.current, null, 2));
    return { ok: res.ok, status: res.status, url, current: json?.current };
  } catch (err) {
    console.error('   GAGAL Open-Meteo:', err.message);
    return { ok: false, url, error: err.message };
  }
}

async function testPetaBencana() {
  const url = 'https://api.petabencana.id/reports?disaster=flood';
  console.log('\n3. Menguji PetaBencana:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SiagaBanjirPekalongan/1.0',
        Accept: 'application/json',
      },
    });
    console.log('   HTTP Status:', res.status);
    const json = await res.json();
    const features = json?.result?.features || [];
    console.log('   Total Laporan Nasional Saat Ini:', features.length);

    const pekalonganReports = features.filter((f) => {
      const coords = f?.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return false;
      const [lon, lat] = coords;
      return lat >= -7.25 && lat <= -6.82 && lon >= 109.42 && lon <= 109.76;
    });

    console.log('   Laporan Masuk Wilayah Pekalongan:', pekalonganReports.length);
    if (pekalonganReports.length > 0) {
      console.log('   Contoh Laporan Pekalongan:', JSON.stringify(pekalonganReports[0], null, 2));
    } else {
      console.log('   Hasil Filter: Belum ditemukan laporan banjir dari sumber data saat ini.');
      if (features.length > 0) {
        console.log('   Contoh Struktur 1 Laporan Nasional:');
        console.log(JSON.stringify(features[0], null, 2));
      }
    }

    return {
      ok: res.ok,
      status: res.status,
      url,
      totalNational: features.length,
      totalPekalongan: pekalonganReports.length,
      samplePekalongan: pekalonganReports[0] || null,
      sampleSchema: features[0] || null,
    };
  } catch (err) {
    console.error('   GAGAL PetaBencana:', err.message);
    return { ok: false, url, error: err.message };
  }
}

const bmkgResult = await testBMKG();
const meteoResult = await testOpenMeteo();
const petaBencanaResult = await testPetaBencana();

fs.writeFileSync(
  'scripts/api_test_output.json',
  JSON.stringify({ testedAt: nowIso, bmkg: bmkgResult, openMeteo: meteoResult, petaBencana: petaBencanaResult }, null, 2)
);
console.log('\nHasil mentah tersimpan di scripts/api_test_output.json');
