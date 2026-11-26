# Dokumentasi Sumber Data Resmi (DATA_SOURCES.md)

Aplikasi **SIAGA BANJIR Pekalongan** menerapkan prinsip **100% Data Nyata** tanpa menggunakan data simulasi, *hardcoded*, maupun status fiktif.

## 1. Prakiraan Cuaca Resmi (Sumber Utama)
* **Instansi / Sumber:** Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)
* **Endpoint:** `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_wilayah}`
* **Metode:** `GET` (JSON)
* **Kode Wilayah Administrasi (ADM4) Pekalongan yang Digunakan:**
  * `33.75.01.1003` — Kel. Podosugih, Kec. Pekalongan Barat, Kota Pekalongan
  * `33.75.03.1001` — Kel. Panjang Wetan, Kec. Pekalongan Utara, Kota Pekalongan
  * `33.26.16.2007` — Desa Pacar, Kec. Tirto, Kabupaten Pekalongan
  * `33.26.08.1009` — Kel. Kajen, Kec. Kajen, Kabupaten Pekalongan
* **Parameter yang Diambil:** Suhu (`t`), kelembapan (`hu`), kondisi cuaca (`weather_desc`), kecepatan angin (`ws`), curah hujan (`tp`), waktu prakiraan (`local_datetime`), dan waktu rilis analisis (`analysis_date`).

## 2. Cuaca Aktual (Sumber Alternatif)
* **Sumber:** Open-Meteo Weather Forecast API
* **Endpoint:** `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FJakarta`
* **Keterangan:** Ditampilkan secara terpisah dengan label jelas sebagai sumber cuaca alternatif, bukan pengganti otomatis tanpa keterangan apabila BMKG gagal diakses.

## 3. Laporan Kejadian Banjir Eksternal
* **Sumber:** PetaBencana.id Open API
* **Dokumentasi:** `https://docs.petabencana.id/routes`
* **Endpoint:** `https://api.petabencana.id/reports?disaster=flood&timeperiod=259200`
* **Header Wajib:** `User-Agent: SiagaBanjirPekalongan/1.0`
* **Filter Geografis Pekalongan:**
  * Latitude: `-7.2500` s/d `-6.8200`
  * Longitude: `109.4200` s/d `109.7600`
* **Kebijakan Data Kosong:** Jika hasil filter wilayah Pekalongan berjumlah `0`, aplikasi menampilkan pesan `"Belum ditemukan laporan banjir dari sumber data saat ini."` dan **tidak** mengasumsikan status `AMAN`.

## 4. Database Partisipatif & Titik Evakuasi Resmi
* **Sumber:** Firebase Cloud Firestore (`siaga-banjir-pekalongan`)
* **Koleksi Aktif:** `users`, `laporan_banjir`, `notifikasi`, `titik_evakuasi`. 