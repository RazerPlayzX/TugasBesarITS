# Transisi global dan kilau progress — 16 November 2026

Implementasi frontend, mempertahankan backend, API, model, identitas dan aturan XP/badge/progres. Semua perubahan pengguna sebelumnya dipertahankan. Tidak ada commit/push/deploy.

## Perubahan aktual

Semua tautan rute internal, bukan hanya navbar, sekarang memakai motion controller yang sama. navigation.go juga mengikuti input pointer untuk aksi setelah API, sehingga Mulai quest dan Lanjutkan Belajar tidak berganti mendadak. Login memulihkan state dan berpindah sekali ke Beranda tanpa membatalkan animasinya; Logout bertransisi pada form login. Keyboard dan reduced motion tetap langsung; sesi kedaluwarsa tidak menunda pesan. Rute/fokus/state diubah segera, animasi tidak memblokir input. Klik cepat tetap membatalkan animasi lama.

Scroll anchor native smooth dan transisi border/background pada input, tanpa mengambil alih event wheel. Selector pseudo-class yang terpisah oleh spasi pada stylesheet lama dinormalisasi agar focus/disabled/placeholder dan gaya native progress benar-benar diterapkan.

Seluruh progress memakai helper ui.js yang sama: native progress tetap semantik dan bernilai backend. Wrapper8px dan overlay aria-hidden mengikuti nilai native yang sudah dibatasi0–100; lapisan ini tidak mengubah data. Kilau putih transparan di-clip hanya pada bagian terisi. Animasi transform/opacity1800ms ×2 (3,6detik), lalu berhenti agar tidak menjadi distraksi tanpa akhir. Pada0% tidak ada kilau palsu;100% tetap penuh. Reduced motion mematikan seluruh kilau. Panel XP memakai lime dengan track kontras pada latar gelap.

## Review interaksi

| Before | After | Why |
|---|---|---|
| Slide hanya dari menu | Semua tautan/tombol rute memakai controller yang sama | Konsistensi perpindahan |
| Restore login lalu go berulang | Restore sekaligus navigasi satu kali | Animasi tidak langsung dibatalkan |
| Progress dengan selector pseudo invalid | Native progress styled dan overlay dekoratif | Tampilan konsisten, semantik tetap |
| Bar statis | Dua sapuan kilau singkat | Feedback hidup tanpa mengubah persentase |

File utama: frontend/assets/js/navigation.js, navigation-motion.js, app.js, ui.js; css/styles.css dan tokens.css. DESIGN.md, PRODUCT.md dan sidecar diselaraskan.

## Hasil pengujian terbaru

73 pemeriksaan browser Edge lulus:22 regresi API,6 kondisi gagal,45 smooth/progress. Server/database uji terpisah pada8002/runtime/e2e.sqlite3. Tidak ada unit backend tambahan karena backend tidak berubah. Tidak ada pageerror pada alur utama; status401/403/422 yang sengaja diuji tetap merupakan network error yang diharapkan.

Uji pertama kondisi gagal sempat salah urutan fixture: suite motion membuat akun baru kosong sehingga suite gagal tidak menemukan materi untuk dicatat. Urutan diperbaiki menjadi API → kondisi gagal → motion, kemudian seluruhnya diulang berhasil. Tidak ada perubahan aturan produksi untuk meloloskan test.

Uji mencakup tombol Cari Materi, Lanjutkan Belajar, tautan ringkasan/quest, navigasi setelah API, autentikasi/logout, native progress/label/value, kilau terklip, batas0/100, reduced motion dan overflow pada semua halaman di360/390/768/1440. Batas0/100 tambahan menggunakan komponen presentasi berlabel pengujian di DOM sementara, tanpa mengubah akun/server. Data nyata diuji pada progress20/40 danXP melalui profil uji.

Screenshot [desktop](screenshots/smooth-progress-desktop.png), [mobile](screenshots/smooth-progress-mobile.png). Hanya dekorasi kilau dijeda pada800ms di lingkungan uji agar efek terlihat pada screenshot; nilai tetap dari API. Animasi navigasi ditunggu selesai untuk screenshot final. Perangkat fisik/keyboard virtual, Firefox/Safari dan pembaca layar belum diuji.

| No | Pemeriksaan | Hasil |
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
| 29 | Cari Materi di box memakai slide | Lulus |
| 30 | Tautan ringkasan memakai slide | Lulus |
| 31 | Tombol Lanjutkan Belajar memakai slide | Lulus |
| 32 | Tautan quest memakai slide | Lulus |
| 33 | Motion tidak mengubah data | Lulus |
| 34 | Progress semantik dan kilau beranda 360 | Lulus |
| 35 | Tanpa overflow beranda 360 | Lulus |
| 36 | Progress semantik dan kilau rekomendasi 360 | Lulus |
| 37 | Tanpa overflow rekomendasi 360 | Lulus |
| 38 | Progress semantik dan kilau quest 360 | Lulus |
| 39 | Tanpa overflow quest 360 | Lulus |
| 40 | Progress semantik dan kilau progres 360 | Lulus |
| 41 | Tanpa overflow progres 360 | Lulus |
| 42 | Progress semantik dan kilau beranda 390 | Lulus |
| 43 | Tanpa overflow beranda 390 | Lulus |
| 44 | Progress semantik dan kilau rekomendasi 390 | Lulus |
| 45 | Tanpa overflow rekomendasi 390 | Lulus |
| 46 | Progress semantik dan kilau quest 390 | Lulus |
| 47 | Tanpa overflow quest 390 | Lulus |
| 48 | Progress semantik dan kilau progres 390 | Lulus |
| 49 | Tanpa overflow progres 390 | Lulus |
| 50 | Progress semantik dan kilau beranda 768 | Lulus |
| 51 | Tanpa overflow beranda 768 | Lulus |
| 52 | Progress semantik dan kilau rekomendasi 768 | Lulus |
| 53 | Tanpa overflow rekomendasi 768 | Lulus |
| 54 | Progress semantik dan kilau quest 768 | Lulus |
| 55 | Tanpa overflow quest 768 | Lulus |
| 56 | Progress semantik dan kilau progres 768 | Lulus |
| 57 | Tanpa overflow progres 768 | Lulus |
| 58 | Progress semantik dan kilau beranda 1440 | Lulus |
| 59 | Tanpa overflow beranda 1440 | Lulus |
| 60 | Progress semantik dan kilau rekomendasi 1440 | Lulus |
| 61 | Tanpa overflow rekomendasi 1440 | Lulus |
| 62 | Progress semantik dan kilau quest 1440 | Lulus |
| 63 | Tanpa overflow quest 1440 | Lulus |
| 64 | Progress semantik dan kilau progres 1440 | Lulus |
| 65 | Tanpa overflow progres 1440 | Lulus |
| 66 | Reduced motion pada semua tautan | Lulus |
| 67 | Reduced motion mematikan kilau | Lulus |
| 68 | Progress 0 tidak memiliki kilau palsu | Lulus |
| 69 | Progress 100 tetap penuh | Lulus |
| 70 | Mulai quest setelah API memakai slide | Lulus |
| 71 | Logout memakai transisi login | Lulus |
| 72 | Autentikasi menuju Beranda memakai slide | Lulus |
| 73 | Tidak ada exception JavaScript | Lulus |

Jalankan seperti README: `.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8001`, buka http://127.0.0.1:8001. Setelah menyalakan server uji8002, jalankan melalui Playwright CLI: tests/api-browser.js, tests/api-browser-failures.js, lalu tests/smooth-progress-browser.js dalam urutan tersebut.
