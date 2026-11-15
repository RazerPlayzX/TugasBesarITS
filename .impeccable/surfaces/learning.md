# Alur — ruang belajar

Target: frontend/index.html. Mode: Operate. Code-first sesuai keputusan pengguna.
Pengguna meminta keputusan implementasi rutin diambil mandiri; tidak membuka putaran persetujuan desain tambahan.

## Direction contract

THESIS: Mahasiswa mengubah kebutuhan belajar menjadi quest yang tetap. Form, kandidat, dan quest terpisah; bukan dashboard statistik.

OWN-WORLD: Penunjuk ruang kampus: hijau pinus pada navigasi, mint pucat untuk pilihan, bidang putih untuk bekerja, kuning pucat untuk refleksi progres. Sans humanis, garis pembatas, tombol solid, ruang antar kelompok yang lapang.

STORY: Pilih contoh atau isi kebutuhan; pahami sasaran; mulai quest secara eksplisit; catat hasil belajar. Signature interaction: nomor urutan berubah menjadi tanda selesai, dengan progres dan XP yang diperbarui bersamaan tanpa mengganti daftar quest.

FIRST VIEWPORT: Sebelum sesi, login dua bidang: konteks belajar pinus dan satu tindakan masuk demo pada bidang putih; ponsel hanya merek ringkas dan alur masuk. Setelah masuk, Beranda memprioritaskan aktivitas berikutnya pada bidang mint, dengan ringkasan XP/level aktivitas/badge yang lebih kecil di kanan. Quest kosong menawarkan Cari Materi, quest aktif menawarkan Lanjutkan Belajar ke materi berikutnya. Rail navigasi desktop 224px (200px pada tablet), menu disclosure pada ponsel sampai 700px; halaman Rekomendasi mempertahankan form utama dan ringkasan quest. Tidak ada kredensial atau autentikasi. Satu state belajar tetap saat navigasi/keluar; penanda sesi terpisah.

FORM: Kandidat grounded 5, sistem penunjuk ruang kampus; seed:9163d950194eb881. Daftar kandidat: indeks perpustakaan, kartu seminar, buku latihan, katalog pameran mahasiswa, penunjuk ruang kampus, jadwal studio, poster komunitas kampus. Tantangan katalog maskot ditolak (mengganggu usia dan fokus), consumer-card kompetitif pada kemudahan kontrol tetapi tidak pada kepadatan tugas, peta orienteering ditolak (risiko mengklaim prasyarat), katalog musik ditolak (label berkode), grid tipografi ditolak (mengalahkan tugas), split-flap ditolak (gerak berlebih). Prinsip yang dipertahankan: state eksplisit, target sentuh besar, urutan stabil, label terbaca, grid rapi, pembaruan tanpa menggeser konteks.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Extension 2026-11-15

Beranda, login demonstrasi, dan menu disclosure memperluas sistem yang sama. Signature interaction berlanjut ke Beranda: setelah materi selesai, kandidat berikutnya dan progres berubah bersama tanpa mengubah penyebut quest. Tidak ada statistik atau aktivitas buatan; riwayat tidak diberi tanggal karena sumber state tidak menyimpan waktu. User mengizinkan pembaruan dokumentasi keputusan desain; merge dengan sistem yang ada, pertahankan token dan sumber.
