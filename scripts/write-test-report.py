"""Buat tabel hasil aktual dari output browser; tidak menjalankan pengujian."""
import json
from pathlib import Path
from datetime import datetime, timezone, timedelta

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'docs/browser-results.json').read_text(encoding='utf-8'))
dashboard = json.loads((ROOT / 'docs/dashboard-browser-results.json').read_text(encoding='utf-8'))
dashboard_rows = '\n'.join(f"| {i} | {item['name']} | {item['status']} | {item.get('detail', '').replace(chr(10), ' ').replace('|', '/')} |" for i, item in enumerate(dashboard['results'], 1))
dashboard_passed = sum(item['status'] == 'LULUS' for item in dashboard['results'])
date = datetime.fromisoformat(data['run_at'].replace('Z', '+00:00')).astimezone(timezone(timedelta(hours=7)))
rows = '\n'.join(f"| {i} | {item['name']} | {item['status']} | {item['detail'].replace(chr(10), ' ').replace('|', '/')} |" for i, item in enumerate(data['results'], 1))
passed = sum(item['status'] == 'LULUS' for item in data['results'])
report = f'''# Pengujian UI Langkah 5

## Lingkungan dan hasil aktual

- Waktu run browser: {date:%d %B %Y, %H:%M:%S} WIB.
- Browser: Chrome/Chromium {data['browser']}, headless melalui Playwright pada Windows.
- Server: `http://127.0.0.1:8000`, Python static HTTP server dengan document root `frontend`.
- **{passed}/{len(data['results'])} uji regresi browser dan {dashboard_passed}/{len(dashboard['results'])} uji login/Beranda lulus**. Jumlah console/page error terekam: {len(data['errors']) + len(dashboard['errors'])}.
- **51/51 pengujian domain dan sesi lulus**, dijalankan dengan `node --test tests/domain.test.mjs tests/session.test.mjs`: validasi, batas adaptasi, XP, badge kumulatif, level aktivitas, progres, URL aman, storage rusak/terblokir, dan deduplikasi.
- Pengujian responsif otomatis: lebar 320, 360, 390, 540, 700, 701, 768, 1024, dan 1440 px sesuai masing-masing suite. Empat halaman aplikasi diperiksa pada 360/540/700/701/768/1024/1440; login pada 360/540/768/1024/1440. Tidak ditemukan horizontal overflow pada pemeriksaan tersebut.
- Render login dan Beranda diperiksa secara visual pada lebar 1440, 768, dan 360px. Screenshot regresi tiga halaman lama direkam pada 1440?1000 dan 390?844. Ini emulasi viewport browser, bukan perangkat fisik.
- Pemeriksaan provenans terpisah memvalidasi 16 entri fixture: course_id, judul, URL, dan skor cosine sama dengan CSV sumber; query sumber sesuai skenario. Tidak ada model yang dijalankan.

## Login, Beranda, dan sesi

Run tambahan: {dashboard['run_at']} (UTC), Chrome {dashboard['browser']}. Data mesin: [dashboard-browser-results.json](dashboard-browser-results.json).

| No. | Pengujian | Hasil | Catatan run |
|---|---|---|---|
{dashboard_rows}

Perbaikan dari uji aktual: sidebar desktop pendek kini dapat digulir dan bagian pendukung dipadatkan agar logout terjangkau; tautan skip menjaga rute; keluar mengabaikan respons pencarian/penyelesaian tertunda; tautan pada quest selesai dipisahkan agar target sentuh tidak berdempetan. Assertion resize menunggu layout dan event media-query sebelum menilai menu, sehingga tidak membaca frame sebelum perubahan viewport selesai.

Sesi demo hanya penanda. Refresh dan keluar/masuk mempertahankan progres, reset dikonfirmasi, dan state rusak/blocked ditangani. Tidak ada kredensial yang diminta atau disimpan. Uji penyelesaian tiga materi 90/60/60 menghasilkan 150 XP, level aktivitas 2, tiga badge, dan 100% progres. Kontrak rekomendasi/gamifikasi tidak diubah.

Review visual extension terpisah disimpan di [review-dashboard.md](review-dashboard.md); batas putusan mengikuti isi laporan tersebut, bukan sertifikasi aksesibilitas.

## Tabel pengujian regresi browser

| No. | Pengujian | Hasil | Catatan run |
|---|---|---|---|
{rows}

Output mesin tersimpan di [browser-results.json](browser-results.json). Script `tests/browser.cjs` dapat dijalankan ulang menggunakan petunjuk README.

## Bukti khusus perilaku

- Python, Intermediate, 45 menghasilkan tiga kandidat Beginner/Remedial dari sumber. Nilai 0 juga valid.
- Batas 59/60/79/80 menghasilkan Remedial/Improvement/Improvement/Mastery dengan target Beginner/Intermediate/Intermediate/Advanced dari level awal Intermediate. Pada Intermediate, subset Python memang kosong; ini dijelaskan oleh UI.
- Nilai penyelesaian 90 memberi 70 XP, tiga badge kumulatif, dan progres 33,33% pada quest tiga materi.
- Pemanggilan ulang penyelesaian course_id sama melalui service menghasilkan 0 XP tambahan; total tetap 70 XP.
- Pencarian SQL tidak mengganti quest Python. Pembatalan penggantian menjaga quest; konfirmasi mengganti daftar dan mempertahankan riwayat serta XP.
- Reset menyisakan key pengujian milik data lain. JSON rusak dan storage ditolak tidak membuat aplikasi crash.
- Navigasi tab form menunjukkan outline solid 3px, dan ringkasan error menerima fokus saat submit tidak valid.
- Teks fixture berisi markup ditampilkan sebagai teks; URL javascript ditolak; rating null ditampilkan “Belum tersedia”.

## Pemeriksaan render dan perbaikan

1. Hook Impeccable menemukan teks kecil pada implementasi awal. Ukuran 10/11px diubah menjadi minimal 13px pada teks pendukung; body utama 15px. Tidak ada suppression/ignore yang dibuat. Hook berikutnya melaporkan tidak ada masalah deterministik pada HTML yang dipindai.
2. Screenshot menunjukkan ukuran persentase XP ikut mewarisi ukuran angka total XP. Selector diperketat menjadi `.xp-panel > strong`, sehingga persentase kembali menjadi label kecil yang proporsional.
3. Tautan skip yang diposisikan di luar viewport tampak pada screenshot full-page saat halaman tergulir. Penyembunyian menggunakan clip-path yang dilepas saat fokus; capture juga selalu dimulai dari atas. Fokus keyboard tetap tersedia.
4. Satu rerun sempat gagal pada assertion navigasi yang membaca visibilitas sebelum event hashchange selesai. Test diperbaiki untuk menunggu route terlihat; run terakhir kembali lulus. Tidak ada perubahan aturan aplikasi untuk meloloskan test.
5. Reviewer menemukan respons pencarian lambat yang dapat mengembalikan kandidat yang baru selesai. Respons kini disaring lagi terhadap riwayat terbaru; pembentukan quest juga menangani kandidat tidak tersedia dengan feedback. Kasus regresi browser memverifikasi kandidat tinggal dua sementara quest aktif tetap tiga.
6. Font judul diganti dengan Manrope variable yang disimpan lokal, bersama lisensi SIL OFL 1.1 dan asal unduhannya. Delapan screenshot direkam ulang setelah `document.fonts.ready` untuk memeriksa pemenggalan teks.

Review Impeccable implementasi awal (sebelum extension Beranda/login) mencatat disposition **ship** pada verdict pass: kedua temuan yang diminta diperbaiki dinilai resolved. Putusan ini mencakup dua perbaikan tersebut, bukan klaim audit baru menyeluruh. Reviewer memeriksa kode dan screenshot; tidak menjalankan browser sendiri. Rincian tersimpan di [review-desain.md](review-desain.md).

Kontras pasangan warna dihitung dari luminansi sRGB: teks utama/ground 10,80:1; teks pendukung/putih 6,00:1; teks pendukung/mint 5,21:1; putih/hijau gelap 11,69:1; teks sekunder sidebar 7,85:1; catatan kuning 6,43:1. Ini pemeriksaan pasangan yang disebut, bukan sertifikasi aksesibilitas menyeluruh.

## Screenshot login dan Beranda

| Keadaan | Desktop | Tablet / ponsel |
|---|---|---|
| Login demo | [1440px](screenshots/login-desktop.png) | [768px](screenshots/login-768.png), [360px](screenshots/login-360.png) |
| Beranda kosong | [1440px](screenshots/beranda-kosong-desktop.png) | Responsivitas diperiksa dalam suite |
| Quest aktif | [1440px](screenshots/beranda-aktif-desktop.png) | ? |
| Progres 1/3 | [1440px](screenshots/beranda-progres-desktop.png) | [768px](screenshots/beranda-progres-768.png), [360px](screenshots/beranda-progres-360.png) |
| Quest selesai | [1440px](screenshots/beranda-selesai-desktop.png) | ? |
| Menu terbuka | ? | [360px](screenshots/menu-360.png) |

Sepuluh capture tambahan full-page, font selesai dimuat, scroll dari atas, reduced-motion aktif. Semua dibuka untuk inspeksi visual. Banner sukses tetap terlihat pada capture segera sesudah tindakan; hilang setelah refresh sesuai UI.

## Screenshot regresi

| Halaman | Desktop | Ponsel |
|---|---|---|
| Awal | [Desktop awal](screenshots/desktop-awal.png) | [Ponsel awal](screenshots/mobile-awal.png) |
| Rekomendasi | [Desktop rekomendasi](screenshots/desktop-rekomendasi.png) | [Ponsel rekomendasi](screenshots/mobile-rekomendasi.png) |
| Quest | [Desktop quest](screenshots/desktop-quest.png) | [Ponsel quest](screenshots/mobile-quest.png) |
| Progres | [Desktop progres](screenshots/desktop-progres.png) | [Ponsel progres](screenshots/mobile-progres.png) |

Desktop quest/progres menunjukkan satu materi selesai dengan 70 XP. Screenshot ponsel menunjukkan sesi demo baru dengan quest aktif belum selesai; perbedaan state disengaja oleh urutan test. Semua capture full-page.

## Batas pengujian

- Tautan internal, aset lokal, skema URL, dan atribut keamanan diperiksa. Navigasi eksternal Coursera dalam test menggunakan stub agar membuktikan membuka materi tidak mengubah state; **keaktifan atau isi situs Coursera tidak diuji**.
- Belum diuji pada Safari, Firefox, perangkat ponsel fisik, atau pembaca layar. Pemeriksaan ARIA/keyboard tidak menggantikan pengujian pengguna dengan teknologi bantu.
- Tidak ada uji backend, API nyata, model joblib, akurasi/relevansi, atau validasi pedagogis. Pengujian ini tidak menggantikan end-to-end web/API sesuai panduan setelah langkah 6.
- localStorage bersifat demonstrasi per browser. Sinkronisasi lintas tab, server persistence, dan otorisasi bukan lingkup langkah 5.

## Verifikasi manual tambahan

1. Jalankan server sesuai README, masuk melalui Masuk Mode Demo, lalu reset progres lewat Pengaturan demonstrasi.
2. Navigasikan seluruh form dengan Tab/Shift+Tab; coba submit kosong, lalu perbaiki lewat tautan ringkasan error.
3. Jalankan tiga contoh, mulai quest, buka materi, dan pastikan progres belum berubah sebelum mencatat penyelesaian.
4. Selesaikan materi dengan nilai 59, 60, 80, dan 90 pada profil/quest yang sesuai; periksa aturan di dokumentasi langkah 5.
5. Ubah ukuran jendela dan zoom 200%; periksa label, navigasi, form inline, dan semua tombol.
6. Coba pembaca layar untuk label input, pengumuman hasil, status selesai, dan progress. Catat hasilnya sebagai uji tambahan, bukan klaim dari run ini.
'''
(ROOT / 'docs/pengujian-ui.md').write_text(report, encoding='utf-8')
print(f'Laporan aktual: {passed}/{len(data["results"])} browser tests.')
