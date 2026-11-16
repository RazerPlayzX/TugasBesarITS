> Arsip pengujian iterasi sebelumnya. Bukti terbaru untuk tab autentikasi, ikon mata dan susunan Beranda ada di [autentikasi-dashboard.md](autentikasi-dashboard.md).

# Pengujian langkah 6 — 16 November 2026

Backend: 21 kasus pytest lulus. Database tmp_path terpisah. Meliputi batas 59/60/79/80/90/100, level XP, validasi, CSRF/Origin, auth, isolasi akun, field reward palsu, materi asing, dua request penyelesaian bersamaan, expired session, naik level, badge tidak berulang, persistensi restart lifespan, kegagalan model dan pembandingan CSV. Ada satu StarletteDeprecationWarning tentang httpx pada TestClient; tidak ada warning load model. Warning alat uji ini tidak disembunyikan.

Browser: Playwright CLI + Edge; server port 8002 dan runtime/e2e.sqlite3. 28 pemeriksaan lulus. Kasus input invalid juga dikirim langsung melalui Fetch di konteks browser supaya validasi server teruji tanpa tertahan validasi HTML. Kasus gagal jaringan/503/401 tambahan memakai interception Playwright secara eksplisit, bukan fallback aplikasi. Respons HTTP 401/403/422 yang sengaja diuji muncul di console sebagai network error yang diharapkan; tidak ada exception JavaScript pada alur utama. Pengujian ulang awal sempat berhenti karena akun uji masih login; suite diperbaiki mengosongkan cookie konteks uji sebelum registrasi dan dijalankan ulang berhasil.

| No | Kasus browser | Hasil |
|---|---|---|
| 1 | Registrasi dan profil header | Lulus |
| 2 | Topik kosong | Lulus |
| 3 | Level invalid | Lulus |
| 4 | Nilai negatif | Lulus |
| 5 | Nilai lebih 100 | Lulus |
| 6 | Nilai 0 | Lulus |
| 7 | Nilai 100 | Lulus |
| 8 | OOV hasil kosong | Lulus |
| 9 | CSRF ditolak | Lulus |
| 10 | Rekomendasi model asli | Lulus |
| 11 | Quest dibuat | Lulus |
| 12 | Popup sesuai respons reward | Lulus |
| 13 | Header sesuai API | Lulus |
| 14 | Escape dialog | Lulus |
| 15 | Reward ganda dicegah | Lulus |
| 16 | Persistensi refresh | Lulus |
| 17 | Responsif 360 | Lulus |
| 18 | Responsif 768 | Lulus |
| 19 | Responsif 1440 | Lulus |
| 20 | Akses tanpa sesi | Lulus |
| 21 | Login kembali mempertahankan progres | Lulus |
| 22 | Tidak ada exception JavaScript | Lulus |
| 23 | Backend indisponibel menampilkan error | Lulus |
| 24 | Submit ganda dinonaktifkan | Lulus |
| 25 | Respons lambat tidak memindahkan halaman | Lulus |
| 26 | Kegagalan simpan tidak memberi hadiah | Lulus |
| 27 | Popup naik level dan badge baru | Lulus |
| 28 | Sesi kedaluwarsa kembali ke login | Lulus |

Bukti: [desktop](screenshots/api-1440.png), [tablet](screenshots/api-768.png), [mobile](screenshots/api-360.png), [popup reward](screenshots/api-reward.png). Hasil render desktop/mobile dan popup diperiksa secara visual. Tidak ada overflow horizontal pada ukuran uji. Navigasi, akun, progress dan popup memakai data API.

Batas verifikasi: tidak menguji perangkat sentuh fisik, Safari/Firefox, pembaca layar, penetrasi keamanan atau beban produksi. Persistensi restart diuji dengan restart lifespan aplikasi pada database yang sama; proses server pengujian juga direstart selama integrasi. Penilaian relevansi pedagogis belum dilakukan.
