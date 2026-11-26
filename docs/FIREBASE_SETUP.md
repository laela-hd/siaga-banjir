# Dokumentasi Konfigurasi Firebase Nyata (FIREBASE_SETUP.md)

* **Nama Project Firebase:** `siaga-banjir-pekalongan`
* **Region Firestore:** `asia-southeast2 (Jakarta)`
* **Layanan Aktif:** Firebase Authentication (Email/Password), Cloud Firestore, Firebase Storage.

## Struktur Koleksi Cloud Firestore
1. **`users`**
   * `uid` (string), `nama` (string), `email` (string), `role` (`"masyarakat"` | `"relawan"` | `"admin"`), `kecamatanPantauan` (string), `noHp` (string), `createdAt` (timestamp).
2. **`laporan_banjir`**
   * `userId` (string), `pelaporNama` (string), `wilayah` (string), `kecamatan` (string), `alamatSingkat` (string), `koordinat` (`{ latitude, longitude }`), `ketinggianCm` (`number | null`), `kategoriBahaya` (`"aman"` | `"waspada"` | `"bahaya"`), `deskripsi` (string), `fotoUrl` (string), `statusVerifikasi` (`"menunggu"` | `"diverifikasi"` | `"ditolak"`), `sumberLaporan` (string), `waktuLaporan` (timestamp).
3. **`notifikasi`**
   * `judul` (string), `pesan` (string), `tipe` (`"peringatan"` | `"verifikasi"` | `"info"`), `sumber` (string), `laporanId` (string), `createdAt` (timestamp).
4. **`titik_evakuasi`**
   * `namaPosko` (string), `alamat` (string), `kecamatan` (string), `koordinat` (`{ latitude, longitude }`), `status` (string), `sumberResmi` (string), `updatedAt` (timestamp).

## Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /users/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      allow create: if isSignedIn() && request.auth.uid == userId && request.resource.data.role == 'masyarakat';
      allow update: if isSignedIn() && request.auth.uid == userId && request.resource.data.role == resource.data.role;
      allow delete: if isAdmin();
    }
    match /laporan_banjir/{reportId} {
      allow read: if resource.data.statusVerifikasi == 'diverifikasi'
        || (isSignedIn() && resource.data.userId == request.auth.uid)
        || isAdmin();
      allow create: if isSignedIn()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.statusVerifikasi == 'menunggu';
      allow update, delete: if isAdmin();
    }
    match /titik_evakuasi/{docId} { allow read: if true; allow write: if isAdmin(); }
    match /notifikasi/{docId} { allow read: if true; allow write: if isAdmin(); }
  }
}

---

### File 4: Perbarui `docs/PROGRESS.md`
1. Buka file **`PROGRESS.md`** di dalam folder **`docs`** (atau buat baru jika belum ada).
2. Blok semua isinya (`Ctrl + A`), hapus, lalu tempel laporan akhir berikut dan simpan (`Ctrl + S`):

```markdown
# Laporan Progres Pengembangan — SIAGA BANJIR (Arsitektur 100% Data Nyata)

## Ringkasan Migrasi ke Data Nyata
Seluruh data simulasi (`src/constants/demoData.ts`) telah dihapus dari proyek. Aplikasi kini bergantung sepenuhnya pada:
1. **API Resmi BMKG** untuk prakiraan cuaca berbasis kode wilayah ADM4 Pekalongan.
2. **Open-Meteo API** sebagai sumber pembanding cuaca alternatif berlabel eksplisit.
3. **PetaBencana.id Open API** dengan filter koordinat geografis Kota & Kabupaten Pekalongan.
4. **Firebase Authentication, Cloud Firestore, & Firebase Storage** untuk manajemen akun, pelaporan berbasis GPS nyata, moderasi admin, notifikasi peringatan, serta titik evakuasi resmi.

## Daftar Status Pengujian Fungsional (1–10)
1. **Prakiraan Cuaca Pekalongan dari BMKG:** Teruji (`HTTP 200`, lokasi `Podosugih - Pekalongan Barat - Kota Pekalongan` tampil lengkap dengan suhu, kelembapan, angin, dan waktu rilis).
2. **Data Cuaca Alternatif dari Open-Meteo:** Teruji (`HTTP 200`, ditampilkan secara terpisah saat pengguna membuka panel sumber alternatif).
3. **Laporan Banjir dari PetaBencana.id:** Teruji (`HTTP 200`, mengembalikan `0` laporan untuk koordinat Pekalongan dan menampilkan status kosong secara jujur).
4. **Filter Wilayah Geografis Pekalongan:** Diterapkan melalui *bounding box* `lat: -7.25 s/d -6.82` dan `lon: 109.42 s/d 109.76`.
5. **Registrasi Pengguna Nyata:** Terhubung ke Firebase Auth + koleksi `users` di Firestore.
6. **Login Pengguna Nyata:** Terhubung ke Firebase Auth dengan persistensi sesi lintas platform.
7. **Pengiriman Laporan Banjir dengan GPS Nyata:** Mewajibkan kunci koordinat perangkat (`expo-location`) sebelum kirim dan mengunggah foto ke Firebase Storage.
8. **Penyimpanan Data ke Firestore:** Tersimpan di koleksi `laporan_banjir` dengan status awal `menunggu` dan sumber `Laporan Masyarakat (Aplikasi Siaga Banjir)`.
9. **Pembaruan Data Real-Time (`onSnapshot`):** Beranda, Peta, Profil, Notifikasi, dan Panel Admin menggunakan listener *real-time* Firestore.
10. **Penanganan Saat API Gagal / Offline:** Menampilkan label `DATA TERAKHIR` apabila ada *cache* tersimpan di `AsyncStorage`, atau pesan error eksplisit tanpa mengarang angka palsu jika *cache* kosong.