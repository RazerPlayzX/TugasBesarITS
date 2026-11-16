> Arsip pengujian iterasi sebelumnya. Bukti terbaru untuk tab autentikasi, ikon mata dan susunan Beranda ada di [autentikasi-dashboard.md](autentikasi-dashboard.md).

# Redesign frontend — 16 November 2026

Aplikasi sebelum dan sesudah tetap menggunakan API asli, model TF-IDF, cookie HttpOnly dan SQLite. Tidak ada perubahan backend, endpoint, model, aturan XP/adaptasi/badge/progres atau dataset. Alur yang dipertahankan: registrasi/login, pencarian, memulai/mengganti quest, membuka materi, mencatat nilai mandiri, reward, refresh dan logout tanpa menghapus progres. Perubahan pengguna yang sudah ada dipertahankan; tidak ada commit/push/deployment.

## Perubahan

Stylesheet utama diganti utuh agar tidak menumpuk override. Design tokens, layout dashboard, rekomendasi dua kolom, materi carousel, quest, pencapaian, login dan detail interaksi disatukan. Manrope disajikan lokal. Ditambah password toggle, status loading autentikasi, akses deskripsi lengkap, dan posisi carousel berdasarkan koordinat viewport. Rating sumber yang berupa string kini ditampilkan apa adanya. Hadiah popup tetap memakai respons API. Tidak ada dependensi runtime frontend baru.

## Screenshot

- Sebelum: [desktop](screenshots/redesign-before-desktop.png), [mobile](screenshots/redesign-before-mobile.png), [login](screenshots/redesign-before-login.png).
- Sesudah: [dashboard desktop](screenshots/premium-beranda-1440.png), [mobile](screenshots/premium-beranda-390.png), [login desktop](screenshots/premium-login-1440.png), [login mobile](screenshots/premium-login-390.png).
- [Materi desktop](screenshots/redesign-materials-desktop.png), [materi mobile](screenshots/premium-materials-mobile.png), [quest](screenshots/premium-quest-1440.png), [pencapaian](screenshots/premium-progres-1440.png).
- [Reward desktop](screenshots/api-reward.png), [reward mobile](screenshots/premium-reward-mobile.png).

Referensi dibuka secara nyata pada desktop1440 dan mobile390 sebagai tamu. Komposisi diadaptasi untuk ITS; akun privat tidak diinspeksi. Review visual mandiri menggunakan prinsip Impeccable; tidak ada klaim review independen.

## Hasil aktual

21 pengujian backend pytest lulus, satu warning deprecation Starlette TestClient/httpx. 22 pemeriksaan browser API, 6 kondisi gagal, dan 38 pemeriksaan tambahan redesign lulus (66 total). Browser Edge melalui Playwright CLI, database terpisah runtime/e2e.sqlite3 pada port8002. Respons401/403/422 sengaja diuji menimbulkan network error yang diharapkan; tidak ada exception JS pada alur utama. Kasus satu kartu memakai interception respons khusus pengujian; hasil kosong menggunakan OOV asli. Pengujian carousel pertama sempat memeriksa indikator sebelum requestAnimationFrame; wait diperbaiki dan seluruh suite dijalankan ulang.

Viewport360,390,768,1440 diperiksa pada semua halaman. Viewport720×500 mewakili ruang efektif browser1440 pada zoom200%; ini bukan pembuktian zoom browser native atau text-only zoom. Keyboard carousel, fokus toggle, Escape/focus return modal, sticky header, bottom nav, reduced motion, nama panjang, dan loading/gagal diuji. Tidak menguji perangkat sentuh fisik, keyboard virtual, pembaca layar, Safari/Firefox atau seluruh pasangan kontras secara otomatis.

| No | Pemeriksaan browser | Hasil |
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
| 29 | Layout beranda 360 | Lulus |
| 30 | Layout rekomendasi 360 | Lulus |
| 31 | Layout quest 360 | Lulus |
| 32 | Layout progres 360 | Lulus |
| 33 | Sticky header 360 | Lulus |
| 34 | Bottom navigation 360 | Lulus |
| 35 | Layout beranda 390 | Lulus |
| 36 | Layout rekomendasi 390 | Lulus |
| 37 | Layout quest 390 | Lulus |
| 38 | Layout progres 390 | Lulus |
| 39 | Sticky header 390 | Lulus |
| 40 | Bottom navigation 390 | Lulus |
| 41 | Layout beranda 768 | Lulus |
| 42 | Layout rekomendasi 768 | Lulus |
| 43 | Layout quest 768 | Lulus |
| 44 | Layout progres 768 | Lulus |
| 45 | Sticky header 768 | Lulus |
| 46 | Layout beranda 1440 | Lulus |
| 47 | Layout rekomendasi 1440 | Lulus |
| 48 | Layout quest 1440 | Lulus |
| 49 | Layout progres 1440 | Lulus |
| 50 | Sticky header 1440 | Lulus |
| 51 | Carousel mulai posisi 1 | Lulus |
| 52 | Keyboard carousel | Lulus |
| 53 | Empty state hasil nyata | Lulus |
| 54 | Slider satu kartu | Lulus |
| 55 | Modal menahan fokus | Lulus |
| 56 | Fokus kembali ke materi | Lulus |
| 57 | Nama panjang dapat diakses | Lulus |
| 58 | Layout viewport efektif zoom 200% | Lulus |
| 59 | Reduced motion | Lulus |
| 60 | Show password | Lulus |
| 61 | Hide password via keyboard | Lulus |
| 62 | Focus indicator | Lulus |
| 63 | Login 360 | Lulus |
| 64 | Login 390 | Lulus |
| 65 | Login 768 | Lulus |
| 66 | Login 1440 | Lulus |

## Menjalankan

Ikuti README.md; server aplikasi: `.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8001`, buka http://127.0.0.1:8001. Buat akun sendiri, tanpa kredensial bawaan. Perintah suite API sama dengan README; setelah dua suite API jalankan `playwright-cli.cmd -s=api-e2e run-code --filename=tests/redesign-browser.js`.

## Triage hook setelah redesign

Teks 11px dinaikkan ke minimal12px, termasuk label navigasi, metadata dan disclaimer. Teks sekunder pada panel gelap diperterang dari #d0dfd2 menjadi #f0f6ec. Temuan tiny-text dan gray-on-color tidak lagi muncul pada detector. Palet warm paper adalah permintaan eksplisit pengguna; pengecualian cream-palette disimpan melalui hooks ignore-value dan dibatasi frontend/index.html. Tidak ada ignore menyeluruh untuk file/rule lain. Advisory design-system-color ditinggalkan karena sidecar lama belum disinkronkan; tokens aktual dan DESIGN.md tetap acuan. Ketiga suite browser (66 pemeriksaan) dijalankan ulang setelah perbaikan.
