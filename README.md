# 🌊 SIAGA BANJIR — Kota & Kabupaten Pekalongan

Aplikasi pemantauan kondisi banjir real-time, prakiraan cuaca kecamatan, panduan rute alternatif, dan pelaporan kejadian lapangan untuk wilayah **Kota dan Kabupaten Pekalongan**.

Dibangun menggunakan **React Native (Expo)** dengan dukungan tampilan responsif **Mobile (Android & iOS)** dan **Web Desktop**.

---

## ✨ Fitur Utama

1. **Pemantauan Status Banjir Real-Time**
   - Menampilkan ringkasan status kewaspadaan wilayah Pekalongan berdasarkan laporan masyarakat terverifikasi (Cloud Firestore) dan data pemantauan eksternal dari **PetaBencana.id**.
2. **Prakiraan Cuaca Kecamatan (Open-Meteo & BMKG)**
   - Pencarian cuaca per kecamatan di Kota & Kabupaten Pekalongan (Pekalongan Barat, Utara, Timur, Selatan, Tirto, Wiradesa, Buaran, Kedungwuni, Kajen).
   - Dilengkapi prakiraan cuaca harian, 7 hari ke depan, serta integrasi prakiraan resmi BMKG.
3. **Panduan Rute Dihindari & Jalur Alternatif**
   - Informasi ruas jalan terdampak genangan beserta filter jenis kendaraan (Motor/Mobil) dan navigasi langsung ke Google Maps.
4. **Peta Sebaran Banjir & Titik Evakuasi**
   - Visualisasi spasial titik banjir aktif dan lokasi posko pengungsian resmi lengkap dengan koordinat GPS.
5. **Pelaporan Banjir Warga & Verifikasi Admin**
   - Formulir laporan cepat disertai pilihan kecamatan, perkiraan ketinggian air, keterangan kondisi arus, dan lampiran foto lapangan.
   - Panel admin khusus untuk memverifikasi laporan masuk sebelum dipublikasikan ke warga.
6. **Pusat Peringatan Dini & Layanan Darurat 112**
   - Notifikasi kejadian banjir aktif serta akses cepat panggilan darurat terpadu 24 jam.

---

## 🛠️ Teknologi yang Digunakan

- **Framework:** React Native & Expo SDK (`expo-router`)
- **Bahasa:** TypeScript
- **Backend & Database:** Firebase (Cloud Firestore, Authentication, Storage)
- **Sumber Data Eksternal:** Open-Meteo API, BMKG API, dan PetaBencana.id API
- **Build & Deployment:** Expo Application Services (EAS Build)

---

## 🚀 Cara Menjalankan Proyek di Lokal

1. **Clone repository ini:**
   ```bash
   git clone [https://github.com/laela-hd/siaga-banjir.git](https://github.com/laela-hd/siaga-banjir.git)
   cd siaga-banjir
