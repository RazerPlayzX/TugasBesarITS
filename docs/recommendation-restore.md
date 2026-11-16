# Perbaikan rekomendasi setelah refresh — 16 November 2026

Penyebab: currentResult/nextResult dan hasil Dashboard hanya berada di memori JavaScript. restoreSession sebelumnya hanya mengambil akun/quest/progres. Navigasi awal juga mengganti hash Quest menjadi login sebelum /api/me selesai, sehingga setelah refresh halaman kembali ke Beranda.

Perbaikan pada app.js dan navigation.js:

- Setelah sesi dipulihkan, cari penyelesaian terbaru yang course_id-nya berada pada quest aktif, lalu panggil service rekomendasi dengan topic quest, target_level sebagai ability, dan nilai penyelesaian tersebut (termasuk0). Input sama dengan alur rekomendasi setelah penyelesaian. Tidak menulis completion atau menghitung reward ulang.
- Hasil baru menggunakan model API dan recommendation_id baru, jadi tombol memulai quest tetap valid walaupun ID hasil lama sudah kedaluwarsa24jam. Tidak memakai cache mock/localStorage atau menyalin data antar akun.
- Satu hasil mengisi rekomendasi berikutnya di Quest dan Dashboard. Pembatalan berbasis versi menjaga respons lama ketika logout/mengganti quest; pencarian manual baru tidak ditimpa oleh hasil pemulihan yang terlambat.
- Saat logout, DOM kandidat berikutnya ikut dibersihkan. Quest baru tanpa penyelesaian tidak mengambil nilai dari quest terdahulu.
- Navigasi awal mempertahankan hash selama pemeriksaan sesi. Sesi tidak valid tetap menuju login; sesi valid tetap pada halaman yang di-refresh.

Lingkup: rekomendasi lanjutan sesudah penyelesaian. Pencarian manual sebelum ada aktivitas pada quest tidak dipersistenkan. API harus tersedia untuk menghitung ulang; kegagalan menampilkan pesan di bagian rekomendasi berikutnya dan tidak menghapus progres. Tidak ada perubahan backend, model, rumus hadiah, course_id, atau penyebut progres.

## Pengujian aktual

Playwright CLI, Microsoft Edge, server uji port8012 dengan runtime/popup-test.sqlite3. Akun sintetis baru per run; database sehari-hari tidak dipakai. tests/recommendation-restore-browser.js berjalan mandiri setelah membuka URL server tersebut.

- 18 pemeriksaan baru pada desktop.
- 18 pemeriksaan sama pada viewport360×900.
- 22 pemeriksaan regresi api-browser.js, memakai salinan runner dengan port8012.

**58 pemeriksaan lulus**. Rincian: [recommendation-restore-results.json](recommendation-restore-results.json). Meliputi refresh pada Quest/Beranda, urutan dan ID kandidat yang sama, XP/progres/quest tetap, tanpa popup hadiah ulang, nilai0, pengecualian materi selesai, login ulang, kegagalan API, memulai quest dari hasil restore, dan isolasi akun. Tidak ada exception JavaScript. HTTP error pada tes sesi/validasi/kegagalan memang diharapkan. Tes backend tidak diulang karena backend tidak berubah; HP fisik/Safari/Firefox tidak diuji.

Saat menulis tes, dua asumsi runner dikoreksi: mengganti hash saja tidak memuat ulang aplikasi setelah seed akun, dan urutan properti JSON bukan perbedaan state. Setelah itu pengujian menemukan hilangnya rute Quest saat refresh; kode navigasi diperbaiki dan seluruh pemeriksaan di atas dijalankan ulang.
