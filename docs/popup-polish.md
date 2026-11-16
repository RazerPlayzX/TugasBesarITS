# Popup notifikasi, deskripsi, dan progress — 16 November 2026

Permintaan terbaru diterapkan pada frontend terintegrasi langkah 6. Backend/service contract/model/aturan hadiah tidak diubah. Tidak melakukan commit/push pada revisi ini.

| Before | After | Alasan |
| --- | --- | --- |
| Notifikasi inline menambah tinggi halaman | Toast fixed di tengah atas, di bawah header desktop/mobile, tombol tutup SVG44px | Feedback tetap terlihat saat berpindah halaman tanpa menggeser layout |
| Deskripsi membuka teks panjang di kartu | Native dialog dengan konten scrollable, Escape/Tutup, fokus kembali ke pemicu | Menjaga ukuran kartu dan memberi ruang membaca |
| Kilau dua putaran pada track8px | Loop2400ms pada track10px, highlight dan shadow inset | Memenuhi permintaan animasi berulang dan kedalaman ringan; tidak mengubah nilai |
| Logout mengikuti tombol secondary hijau | Merah lembut, hover merah gelap dan press state | Tindakan akun mudah dikenali |

Emil Design Engineering dipakai untuk transisi masuk220ms/keluar140ms serta feedback tombol. Impeccable dipakai untuk review render dan deteksi akhir. Temuan marquee merupakan pengecualian yang disetujui brief: hanya dekorasi progress yang bergerak, bukan konten berjalan. Ignore marquee dibatasi frontend/index.html; alasan tersimpan pada .impeccable/config.json. Reduced motion menonaktifkan kilau/dialog/toast. Deteksi akhir menghasilkan [].

## Pengujian baru

Server uji memakai runtime/popup-test.sqlite3 dan origin 127.0.0.1:8012, terpisah dari database sehari-hari. Playwright CLI dengan Microsoft Edge headless157:

- api-browser.js: **22 lulus**; salinan sementara hanya mengganti port8002 menjadi8012.
- api-browser-failures.js: **6 lulus**.
- smooth-progress-browser.js: **45 lulus**, ekspektasi animasi diperbarui menjadi loop2,4detik sesuai brief terbaru.
- popup-polish-browser.js: **22 lulus**; jalankan sesudah api-browser.js pada akun uji baru (mengharapkan70XP, lalu menyelesaikan materi berikutnya dengan50XP).

Total **95 pemeriksaan lulus**; rincian [popup-polish-results.json](popup-polish-results.json). Hasil mencakup API nyata, popup hadiah50XP/total120XP, anti hadiah ganda, error simpan/jaringan, posisi toast dan dialog pada360/390/768/1440, Tab/Escape/fokus kembali, Logout hover merah, reduced motion dan tanpa exception JavaScript. Console HTTP error dari skenario negatif memang diharapkan. Tes backend tidak diulang karena aturan/backend tidak berubah.

Saat iterasi, tes baru menemukan deklarasi CSS yang menonaktifkan loop secara tidak sengaja; diperbaiki dan diuji ulang. Timeout selector tes diperbaiki dengan membatasi pencarian tombol ke quest yang terlihat. Review screenshot juga menemukan ikon tutup yang berubah menjadi karakter pengganti; diganti SVG dan diuji ulang. Screenshot dialog diambil setelah transisi masuk selesai agar tidak merekam frame transparan.

Screenshot akhir:

- [Toast dan progress desktop](screenshots/popup-progress-1440.png)
- [Toast dan progress mobile](screenshots/popup-progress-360.png)
- [Deskripsi desktop](screenshots/description-dialog-1440.png)
- [Deskripsi mobile](screenshots/description-dialog-360.png)

Tidak diuji pada HP fisik, Safari/Firefox atau screen reader. Toast tidak menghilang otomatis; pengguna dapat membaca dan menutupnya. Angka/teks penuh memakai data API dan textContent; course_id serta penyebut progres tetap.
