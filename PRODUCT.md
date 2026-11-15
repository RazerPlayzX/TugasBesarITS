# Sistem Rekomendasi Adaptif Materi & Jalur Belajar

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

- Langkah 5: HTML5, CSS3, dan JavaScript biasa, tanpa React, Next.js, atau framework frontend tambahan.
- Langkah 6 (direncanakan): Python dengan FastAPI, validasi input menggunakan Pydantic, dan komunikasi melalui Fetch API tanpa reload halaman.
- Model pada langkah 6 menggunakan berkas joblib hasil notebook yang berisi TF-IDF vectorizer, matriks, dan data kursus. Normalisasi input harus mengikuti `normalisasi_teks.py`.
- Pengembangan lokal menggunakan VS Code. Target hosting belum ditentukan; jalankan secara lokal terlebih dahulu.

## Users

Mahasiswa yang membutuhkan bantuan memilih materi belajar berdasarkan topik, kemampuan awal, dan hasil kuis. Mereka perlu mengetahui materi yang harus dipelajari, kebutuhan remedial atau materi lanjutan, serta progres belajarnya.

## Product Purpose

Website untuk tugas besar Intelligent Tutor System yang membantu mahasiswa menentukan materi dan jalur belajar adaptif, menerima rekomendasi remedial atau lanjutan, serta memantau progres belajar.

Keberhasilan antarmuka berarti mahasiswa dapat memasukkan kondisi belajarnya, memahami rekomendasi yang ditampilkan, dan mengikuti penyelesaian materi dengan jelas. Pada langkah 5, seluruh demonstrasi rekomendasi menggunakan data simulasi yang diberi label.

## Operating Context

- Digunakan melalui browser pada desktop dan ponsel, bukan aplikasi native.
- Alur utama: memasukkan topik, level kemampuan, dan nilai kuis; melihat rekomendasi kursus; mengikuti quest belajar; lalu memantau penyelesaian materi, XP, level aktivitas, dan badge.
- Pekerjaan saat ini hanya mencakup langkah 5, yaitu antarmuka. Backend, REST API, dan integrasi model TF-IDF serta cosine similarity dikerjakan pada langkah 6.
- Notebook langkah 1–4 menjadi acuan aturan rekomendasi dan gamifikasi. Aturan tersebut harus dipertahankan.

## Capabilities and Constraints

### Fitur wajib

1. Input topik belajar, level kemampuan, dan nilai kuis.
2. Daftar rekomendasi kursus dari dataset MOOC, beserta tingkat kesulitan dan tautannya; demonstrasi langkah 5 memakai data simulasi berlabel.
3. Quest belajar dan progres penyelesaian materi.
4. XP, level aktivitas, dan badge. Level aktivitas berbeda dari level kemampuan dan harus dijelaskan sebagai konsep yang terpisah.
5. Tampilan responsif untuk desktop dan ponsel.
6. Kondisi loading, hasil kosong, error, serta disclaimer prototipe edukatif.

### Batasan implementasi

- Jangan mengubah atau menciptakan pengganti aturan rekomendasi dan gamifikasi dari notebook langkah 1–4.
- Data simulasi hanya untuk demonstrasi antarmuka; jangan menyajikannya sebagai hasil model yang telah terintegrasi.
- Jangan mengimplementasikan backend atau integrasi model dalam lingkup langkah 5.
- Gunakan bahasa Indonesia untuk antarmuka.

### Keputusan terbuka

- Target hosting belum ditentukan.
- Kontrak REST API merupakan usulan langkah 6, belum merupakan endpoint yang berjalan.
- Relevansi materi dan hubungan prasyarat masih memerlukan validasi pengajar.

## Brand Commitments

- Nama produk: Sistem Rekomendasi Adaptif Materi & Jalur Belajar.
- Antarmuka berbahasa Indonesia, modern, rapi, dan mudah dipahami.
- Tipografi dan hierarki informasi harus matang, dengan aktivitas belajar sebagai prioritas.
- Hindari dekorasi berlebihan dan tampilan dashboard generik.
- Komitmen ini berasal dari arahan pengguna; palet, font, dan komponen belum ditetapkan.

## Evidence on Hand

- Konteks dan persyaratan produk dikonfirmasi pengguna melalui wawancara init.
- Sumber kini tersedia di `referensi/`: PDF panduan, `ITS_Langkah_1_4_Disesuaikan.ipynb`, serta `Hasil_ITS_Langkah_1_4/hasil_langkah_1` dan `hasil_langkah_2_4`.
- Aturan adaptasi dan gamifikasi telah dicocokkan dengan sel 36–40 notebook (indeks sel berbasis nol); aturan sesuai arahan pengguna.
- Fixture antarmuka mengambil subset ekspor `quest_aktif_simulasi.csv` dan `evaluasi_relevansi_belum_dinilai.csv`, diperkaya metadata dari `mooc_clean.csv`. Model joblib tidak dijalankan.
- Profil demo dimulai kosong. Profil Alya dari sumber tidak diimpor, sehingga status selesai dan 50 XP Alya tidak bercampur dengan profil baru.
- Aplikasi langkah 5 menggunakan nama tampilan Alur. Tema tugas tetap Sistem Rekomendasi Adaptif Materi & Jalur Belajar.
- Jangan mengarang hasil evaluasi model, akurasi, data kursus nyata, atau bukti keberhasilan produk. Konten demonstrasi harus ditandai sebagai simulasi.

## Product Principles

1. Dahulukan kebutuhan mahasiswa untuk memilih materi dan melanjutkan aktivitas belajar.
2. Bedakan kemampuan akademik dari aktivitas dan penghargaan gamifikasi.
3. Pertahankan aturan rekomendasi dan gamifikasi yang ditetapkan notebook.
4. Sampaikan status, keterbatasan prototipe, dan sifat simulasi data secara jelas.
5. Pastikan alur belajar mudah dipahami dan dapat digunakan pada desktop maupun ponsel.


## Perluasan antarmuka langkah 5 ? 15 November 2026

Beranda menjadi pusat aktivitas, dengan keadaan kosong, quest aktif, atau quest selesai. Prioritas adalah materi berikutnya dan progres quest; XP, level aktivitas, serta badge menjadi ringkasan pendukung. Riwayat hanya tampil jika ada pencatatan penyelesaian. Navigasi: Beranda, Rekomendasi Materi, Quest Saya, Pencapaian; ponsel memakai menu disclosure.

Halaman masuk hanya menyediakan Masuk Mode Demo, tanpa formulir kredensial. Penanda sessionStorage bukan autentikasi; keluar mempertahankan progres lokal. Arah visual, aturan adaptasi/gamifikasi, data simulasi berlabel, dan service layer langkah 5 dipertahankan. Tidak ada backend atau pengamanan akun yang diklaim selesai.
