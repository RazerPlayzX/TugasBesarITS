# Verifikasi distribusi kelompok — 16 November 2026

Laporan ini adalah verifikasi baru untuk persiapan commit/push kelompok, terpisah dari laporan UI sebelumnya. Tidak ada redesign, perubahan rumus, model, atau fitur backend pada tugas ini. Perubahan UI yang sudah ada di working tree sebelumnya ikut dipertahankan dan diuji.

## Cara verifikasi setup

1. Fetch origin dan periksa HEAD remote: branch utama `main`, commit dasar `d73b0d6`; sama dengan HEAD lokal ketika audit dimulai. Tidak perlu menggabungkan commit divergen.
2. Ekspor **staged tree** dengan `git archive` ke direktori sementara baru, bukan menyalin workspace beserta environment. Salinan awal tidak mempunyai `.env`, `.venv`, atau runtime/database. Source tree kandidat: `afbbdf93e2dc8ed965ad241ad991e77c2cdb5b16` (sebelum penambahan hasil laporan ini).
3. Buat venv baru dengan Python 3.12.5 dan install requirements.txt. Instalasi berhasil; pip memakai cache wheel yang tersedia, jadi ini bukan pembuktian unduhan seluruh dependency di mesin baru. Tidak menggunakan site-packages venv lama.
4. Salin .env.example, jalankan `python -m backend.store`: database kosong berhasil dibuat. `pip check`: No broken requirements found.
5. Jalankan server dari salinan bersih menggunakan port **8012** dan database `runtime/share-browser.sqlite3`. Port 8001/8002 sedang dipakai server lama dan tidak dihentikan. ITS_ORIGIN disamakan dengan port uji. Tidak menyentuh database pengguna.
6. Jalankan Playwright CLI 0.1.24 dengan Microsoft Edge 157. Script api-browser.js pada salinan sementara hanya diganti URL 8002 menjadi 8012; source tes yang di-commit tetap port 8002 sesuai README. Dua suite berikutnya dipakai tanpa perubahan.
7. Jalankan inisialisasi lagi pada DB yang sudah berisi data uji, hentikan proses server uji, lalu jalankan kembali. Digest isi tabel users/sessions/quests/completions sebelum dan sesudah tetap sama; akun browser dipulihkan setelah refresh.

Perubahan setelah ekspor kandidat terbatas pada dokumentasi, normalisasi encoding teks dokumentasi/.gitignore, dan penambahan hasil pengujian. Source runtime, model, dependency, dan test fixture akhir sama dengan yang diuji.

## Hasil aktual

| Pemeriksaan | Hasil |
|---|---|
| Instalasi requirements di virtualenv baru | Berhasil, 38 dependency dipin terpasang |
| pip check | Lulus, tidak ada dependency rusak |
| Inisialisasi database kosong | Berhasil; tabel versi 1 dibuat |
| tests/test_api.py | **21 passed** dalam 30,64 detik |
| Pengaruh konfigurasi lokal pada test | Lulus dengan ITS_ORIGIN sengaja berbeda dan ITS_COOKIE_SECURE=true; fixture mengisolasi keduanya |
| Health server salinan bersih | HTTP 200, status ok, model_ready=true |
| api-browser.js | **22 pemeriksaan lulus** |
| api-browser-failures.js | **6 pemeriksaan lulus** |
| smooth-progress-browser.js | **45 pemeriksaan lulus** |
| Akses aset privat melalui web | URL referensi/model, .env, runtime/database menghasilkan HTTP 404 |
| Inisialisasi ulang + restart proses | Data uji tidak berubah; sesi browser kembali aktif setelah refresh |
| Tautan lokal README dan panduan alat | Tidak ditemukan target file yang hilang |
| Path khusus laptop pemilik | Tidak ada path absolut pemilik yang dibutuhkan runtime/config/setup README |
| Git ignore dan tracked paths | Tidak ada .env nyata, DB, virtualenv, node_modules, cache/log browser yang tracked |

Rincian 73 hasil browser baru: [distribution-browser-results.json](distribution-browser-results.json). Meliputi autentikasi, validasi 0/100 dan input salah, rekomendasi model, quest, reward sesuai API, deduplikasi, refresh/login ulang, kegagalan jaringan/penyimpanan/sesi, motion/reduced motion, serta viewport 360/390/768/1440 sesuai suite. Tidak ditemukan exception JavaScript. Console memuat HTTP 401/403/422 dan kegagalan 503/jaringan yang sengaja dipicu oleh skenario negatif; ini tidak dilaporkan sebagai console kosong.

Pytest memunculkan **1 StarletteDeprecationWarning** tentang penggunaan httpx pada TestClient. Tes tetap lulus; tidak mengganti dependency di luar kebutuhan setup dan kompatibilitas artefak. Tidak dilakukan uji pada komputer anggota lain, Safari/Firefox, atau perangkat HP fisik pada sesi ini.

## File distribusi dan pemeriksaan keamanan

- Source frontend/backend, font/aset, requirements, .env.example, inisialisasi `backend.store`, tes, API docs, PRODUCT.md/DESIGN.md, serta konfigurasi coding opsional tetap tersedia.
- `.gitignore` dirapikan tanpa membuang perlindungan lama; keluaran `.playwright/`, laporan browser, serta test-results ditambahkan. Database/sesi lokal tidak masuk index. Tidak ada file sensitif tracked yang perlu dilepas dari index pada audit ini.
- Riwayat lokal/remote yang tersedia diperiksa: **2.106 blob** dari commit terjangkau. Pencarian pola private key, token GitHub/OpenAI/Google/AWS dan path rahasia tidak menemukan kredensial nyata. Tiga kecocokan pola di binary Impeccable diperiksa konteksnya: rangkaian data binary/base64/nama atribut, bukan kredensial. Pemeriksaan tambahan pada source proyek tidak menemukan URL berkredensial atau assignment rahasia nyata. Ini pemindaian terarah, bukan jaminan audit keamanan menyeluruh.
- Password literal di suite merupakan kredensial sintetis untuk akun `example.test` dalam database uji, bukan akun pribadi. File output CLI mentah dan database uji tidak dimasukkan ke repository.
- Keenam screenshot baru/berubah yang ikut commit ditinjau: hanya profil pengujian, tanpa password/token/data akun pribadi. Screenshot autentikasi terdahulu yang diperiksa menampilkan password tersembunyi.
- Skill berupa file biasa, bukan symlink. Dua perubahan contoh fx-logos yang tidak terkait aplikasi sengaja tidak staged; tetap ada di workspace lokal. Detail alat opsional: [alat-pengembangan.md](alat-pengembangan.md).

## Model yang ikut clone

Loader aktual di backend/recommendation.py membutuhkan empat file pada `referensi/Hasil_ITS_Langkah_1_4/hasil_langkah_2_4`: joblib **7.953.188 byte**, mooc_clean.csv **14.725.349 byte**, metadata.json dan normalisasi_teks.py. Seluruhnya sudah tracked pada commit dasar dan tetap disertakan. Tidak ada ZIP, LFS, lokasi unduhan fiktif, atau artefak baru yang dilatih ulang.

SHA-256 file joblib (berbeda dari hash CSV sumber di metadata):

```text
4ca7da676f83c7e90de14cdd93a96166b4e16de541290abaf126ac6115dc9fa0
```

Model memuat 3.687 kursus dan matriks sparse 20.955 fitur; load/metadata dan hasil cosine ekspor terverifikasi oleh tes. Katalog memuat metadata kursus, bukan tabel akun/sesi aplikasi. Sumber/lisensi dataset asal masih perlu dilengkapi kelompok seperti catatan langkah 1; tidak ada klaim lisensi baru atas data pihak ketiga. Artefak yang sudah tersedia di repository dipertahankan untuk reproduksi tugas kelompok.
