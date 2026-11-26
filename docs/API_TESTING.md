# Laporan Pengujian API Eksternal Nyata (API_TESTING.md)

* **Waktu Pengujian Terakhir:** `2026-11-26T10:46:06.938Z`
* **Skrip Pengujian:** `scripts/testRealApis.mjs`
* **Arsip Respons Mentah:** `scripts/api_test_output.json`

## 1. Pengujian API Prakiraan Cuaca BMKG
* **URL Uji:** `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=33.75.01.1003`
* **HTTP Status:** `200 OK`
* **Lokasi Terverifikasi:** `Podosugih - Pekalongan Barat - Kota Pekalongan`
* **Contoh Respons Asli:**
  ```json
  {
    "datetime": "2026-11-26T11:00:00Z",
    "t": 28,
    "tp": 0.1,
    "weather_desc": "Berawan",
    "ws": 1.4,
    "hu": 85,
    "analysis_date": "2026-11-26T00:00:00",
    "local_datetime": "2026-11-26 18:00:00"
  }