# Sistem Rekomendasi Adaptif Materi & Jalur Belajar — Alur

## Status implementasi

Langkah6 sudah terintegrasi: HTML5/CSS3/JavaScript ES modules dan Fetch, backend FastAPI/Pydantic, SQLite, sesi cookie HttpOnly, model TF-IDF/cosine lokal. Bukan mode demo; mock langkah5 hanya arsip, tidak dipakai service aktif. Acuan visual tunggal DESIGN.md, tokens CSS dan sidecar yang disinkronkan. Dokumen langkah5 dan redesign terdahulu adalah catatan historis.

## Pengguna dan tujuan

Mahasiswa menentukan materi berdasarkan topik, kemampuan awal dan nilai kuis mandiri. Alur: buat akun/masuk, isi kebutuhan, lihat kandidat, mulai quest, buka materi, laporkan penyelesaian/nilai, lihat XP/badge/progres. Level aktivitas berdasarkan XP berbeda dari kemampuan dan kesulitan kursus. Login/logout tidak menghapus progres.

## Perilaku wajib

Input nilai0–100, termasuk0 valid. Adaptasi <60 turun1level minimumBeginner;60–<80 tetap;>=80 naik1level maksimumAdvanced. Conversant/Not Calibrated tidak dipetakan. Model memfilter target, mengecualikan materi selesai dan skor0, mengurutkan cosine; tidak fit ulang.

Materi selesai20XP + bonus50 jika>=90,30 jika>=80,20 jika>=60,10 jika<60. Level aktivitas pada0/100/200/300XP. Badge Quiz Master>=90, Smart Learner>=80, Learning Explorer untuk selesai, Keep Learning<60; badge kumulatif dan unik. Progres selesai/total quest tetap, quest kosong0. Backend menentukan identitas, transaksi dan deduplikasi course_id; UI tidak menghitung hadiah sendiri.

## Frontend terbaru

Tab Masuk/Buat akun dan satu ikon reveal password, backend auth tetap. Dashboard mobile: header akun/level/XP, aktivitas dengan satu tombol Cari Materi di dalam box (tanpa kolom search dashboard), carousel hasil API, ringkasan, riwayat nyata. Shortcut tiga tombol dan CTA pencarian duplikat di dashboard dihapus; menu utama tetap pada navbar. Klik/tap seluruh navigasi internal (tautan dan tombol, termasuk aksi setelah API) memiliki slide halaman/indikator singkat tanpa mengubah state; progress bar memiliki kilau dekoratif berulang dan kedalaman ringan yang mengikuti nilai asli; keyboard dan reduced motion tetap langsung. Hasil rekomendasi ditampilkan setelah input kebutuhan, tidak dibuat otomatis dari kueri palsu. Refresh memulihkan halaman, akun/quest/progres dan memuat ulang rekomendasi berikutnya dari penyelesaian terakhir pada quest aktif. Kandidat lanjutan tampil di Quest dan Dashboard; pencarian manual tanpa aktivitas quest tetap hanya di memori. Desktop mempertahankan navbar sticky/menu tengah/akun kanan; ponsel bottom navigation.

## Batas dan etika

Nilai kuis input mandiri belum diverifikasi. Penyelesaian eksternal dilaporkan pengguna. Cosine bukan akurasi; urutan bukan bukti prasyarat pedagogis. Academic disclaimer wajib. Tidak ada bank soal resmi, verifikasi email, reset password atau deployment. Tidak menambah fitur komersial dari referensi.

Setup di README.md, kontrak API docs/langkah-6.md, bukti terbaru docs/autentikasi-dashboard.md. PDF panduan dan notebook tetap acuan tugas/aturan bisnis.

Feedback tindakan berupa popup atas yang dapat ditutup. Deskripsi penuh dibaca dalam dialog aksesibel; Logout merah. Reduced motion mematikan animasi dekoratif.
