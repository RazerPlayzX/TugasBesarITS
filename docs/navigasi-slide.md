> Revisi terbaru: kolom pencarian dashboard dihapus dan satu tombol Cari Materi dipindahkan ke dalam box aktivitas. Form pencarian lengkap tetap di halaman Rekomendasi Materi. Bukti di bawah catatan awal ini merupakan riwayat penempatan sebelumnya.

# Penyederhanaan dashboard dan slide navigasi — 16 November 2026

Perubahan terarah setelah revisi autentikasi/dashboard. Seluruh perubahan pengguna sebelum pekerjaan ini dipertahankan. Backend, service API, model, dataset, dan rumus tidak diubah. Tidak ada commit/push/deployment.

## Hasil

- Tiga shortcut Materi/Quest Saya/Pencapaian di dashboard dihapus beserta render dan CSS yang tidak terpakai. Menu utama di navbar/bottom navigation tetap ada.
- Satu tombol Cari Materi pada form pencarian atas, berlaku untuk profil baru, quest aktif dan quest selesai. CTA pencarian duplikat pada aktivitas dan header carousel dihapus; blok discovery dengan Jelajahi materi juga dihapus.
- Klik/tap menu utama membuat halaman baru masuk dari kanan untuk maju, kiri untuk mundur,32px/220ms; indikator latar menu aktif meluncur ke posisi baru pada desktop dan mobile. Tidak ada reload, duplikasi halaman, atau perubahan state belajar.
- Navigasi langsung mengubah rute/fokus/aria-current. Klik cepat membatalkan animasi lama. Klik tujuan yang sama tidak memutar slide atau menambah history duplikat. Keyboard dan reduced motion tanpa animasi. Header dan bottom navigation tetap di luar area yang bergerak. ResizeObserver menyelaraskan indikator pada breakpoint dan perubahan jumlah quest. Animasi dibatasi transform/opacity; penetapan ukuran indikator dilakukan sekali per target.

## Review interaksi

| Before | After | Why |
|---|---|---|
| Shortcut mengulang navbar | Shortcut dihapus dari markup/render/CSS | Mengurangi pengulangan navigasi |
| Beberapa CTA pencarian | Satu tombol di pencarian atas | Akses pencarian tetap jelas |
| Halaman berganti seketika saat tap | Slide terarah220ms dan indikator meluncur | Memberi petunjuk perpindahan |
| Potensi antrean animasi | Animasi sebelumnya dibatalkan | Klik cepat selalu menuju rute terakhir |

## Implementasi

frontend/index.html, assets/js/dashboard.js, navigation.js, navigation-motion.js, assets/css/styles.css, navigation.css dan tokens.css. DESIGN.md, PRODUCT.md serta .impeccable/design.json diselaraskan. tests/auth-home-browser.js diperbarui agar tidak lagi mengharapkan shortcut. Test baru tests/navigation-slide-browser.js.

## Pengujian aktual terbaru

77 pemeriksaan browser Edge lulus:22 API/regresi,26 navigasi baru,29 auth/home. Hasil mesin di navigation-slide-results.json. Database runtime/e2e.sqlite3 dan port8002 terpisah dari akun lokal utama. Pengujian awal tidak dapat berjalan karena server uji berhenti; server dinyalakan kembali lalu suite dijalankan hingga berhasil. Tidak ada klaim memakai hasil percobaan gagal.

Animasi diperiksa dari keyframes/getAnimations tepat setelah klik, bukan disimpulkan dari screenshot diam. Indikator diperiksa terhadap posisi/ukuran link aktif. Uji360/390/768/1440, maju/mundur, reduced motion, keyboard, klik cepat, Back, konsistensi quest/XP, dan satu CTA pada ketiga keadaan dashboard. Penyelesaian remaining courses hanya pada akun database uji untuk memeriksa keadaan quest selesai. Tidak ada pageerror pada suite navigasi; HTTP401/403/422 yang sengaja diuji tetap merupakan network error yang diharapkan. Backend unit test tidak diulang karena backend/aturan tidak diubah pada revisi ini.

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
| 23 | Shortcut dashboard tidak ada | Lulus |
| 24 | Satu Cari Materi pada quest aktif | Lulus |
| 25 | Slide maju 360 | Lulus |
| 26 | Slide mundur 360 | Lulus |
| 27 | Indikator sejajar 360 | Lulus |
| 28 | Layout 360 | Lulus |
| 29 | Slide maju 390 | Lulus |
| 30 | Slide mundur 390 | Lulus |
| 31 | Indikator sejajar 390 | Lulus |
| 32 | Layout 390 | Lulus |
| 33 | Slide maju 768 | Lulus |
| 34 | Slide mundur 768 | Lulus |
| 35 | Indikator sejajar 768 | Lulus |
| 36 | Layout 768 | Lulus |
| 37 | Slide maju 1440 | Lulus |
| 38 | Slide mundur 1440 | Lulus |
| 39 | Indikator sejajar 1440 | Lulus |
| 40 | Layout 1440 | Lulus |
| 41 | Klik halaman sama tidak memutar slide | Lulus |
| 42 | Keyboard segera berpindah tanpa motion | Lulus |
| 43 | Reduced motion menonaktifkan kedua slide | Lulus |
| 44 | Navigasi cepat memakai tujuan terakhir | Lulus |
| 45 | Browser Back mengikuti rute | Lulus |
| 46 | Navigasi tidak mengubah quest dan reward | Lulus |
| 47 | Satu Cari Materi setelah quest selesai | Lulus |
| 48 | Tidak ada exception browser | Lulus |
| 49 | Dropdown akun dihapus | Lulus |
| 50 | Tab keyboard register | Lulus |
| 51 | Pergantian mode membersihkan error | Lulus |
| 52 | Tab tidak mengirim autentikasi | Lulus |
| 53 | Autocomplete registrasi | Lulus |
| 54 | Satu reveal custom | Lulus |
| 55 | Reveal menjaga nilai dan fokus | Lulus |
| 56 | Label dan ikon reveal berubah | Lulus |
| 57 | Toggle keyboard tanpa submit | Lulus |
| 58 | login 360 tanpa overflow | Lulus |
| 59 | register 360 tanpa overflow | Lulus |
| 60 | login 390 tanpa overflow | Lulus |
| 61 | register 390 tanpa overflow | Lulus |
| 62 | login 768 tanpa overflow | Lulus |
| 63 | register 768 tanpa overflow | Lulus |
| 64 | login 1440 tanpa overflow | Lulus |
| 65 | register 1440 tanpa overflow | Lulus |
| 66 | Password dibersihkan setelah sukses | Lulus |
| 67 | Header dari akun asli | Lulus |
| 68 | Satu Cari Materi untuk pengguna baru | Lulus |
| 69 | Urutan mobile | Lulus |
| 70 | Shortcut dashboard dihapus | Lulus |
| 71 | Pencarian cepat meneruskan topik | Lulus |
| 72 | Slider beranda memakai hasil API | Lulus |
| 73 | Beranda 360 | Lulus |
| 74 | Beranda 390 | Lulus |
| 75 | Beranda 768 | Lulus |
| 76 | Beranda 1440 | Lulus |
| 77 | Mulai quest dari slider beranda | Lulus |

Screenshot: [desktop](screenshots/navigation-dashboard-1440.png), [mobile390](screenshots/navigation-dashboard-390.png), [mobile360](screenshots/navigation-dashboard-360.png), [tablet](screenshots/navigation-dashboard-768.png). Screenshot ini bukti layout statis; bukti animasi berasal dari pengujian keyframes. Perangkat sentuh fisik dan pembaca layar tidak diuji.

Jalankan seperti README, buka http://127.0.0.1:8001. Setelah menyalakan server uji8002, jalankan tests/api-browser.js lalu tests/navigation-slide-browser.js dan tests/auth-home-browser.js melalui playwright-cli.cmd run-code --filename.

## Revisi tombol di dalam box — 16 November 2026

Satu tombol Cari Materi sekarang berada di box aktivitas untuk pengguna baru, quest aktif, dan quest selesai. Pada quest aktif, tombol berdampingan dengan Lanjutkan Belajar sebagai tindakan pendamping. Search dashboard, CSS dan listener yang tidak terpakai dihapus; form kebutuhan belajar di halaman Rekomendasi Materi tetap tersedia. Navigasi slide dan semua aturan tetap.

77 pemeriksaan browser dijalankan ulang dan lulus (22 API +26 slide navigasi +29 auth/home). Tes khusus memeriksa tombol di dalam #dashboard-activity dan tidak adanya #home-search/#home-topic. Hasil aktual: [dashboard-box-results.json](dashboard-box-results.json). Screenshot terbaru: [desktop](screenshots/dashboard-box-1440.png), [ponsel](screenshots/dashboard-box-390.png). DESIGN.md, PRODUCT.md dan sidecar diselaraskan. Tidak ada pengujian backend tambahan karena perubahan hanya presentasi/frontend.
