# Ringkasan Langkah 1 — Eksplorasi Korpus MOOC

Dataset MOOC.csv berisi 3,785 baris dan 7 atribut.
Unit observasi adalah baris katalog kursus, bukan siswa. Terdapat 3,687 URL unik
serta 98 baris duplikat penuh setelah kemunculan pertama.
Seluruh frekuensi eksplorasi dihitung dari data mentah, sehingga duplikasi masih memengaruhi distribusi.

Ketidaktersediaan data per atribut: {'Course Name': 0, 'University / Industry Partner Name': 0, 'Difficulty Level': 4, 'Course Rating': 208, 'Course URL': 0, 'Course Description': 8, 'all_skill': 15}.
Terdapat 82 rating nonnumerik nonmissing.
Sebanyak 3767 dokumen memiliki nama, deskripsi, dan keterampilan yang tersedia.

Dataset dapat digunakan sebagai korpus awal rekomendasi berbasis konten.
Belum tersedia profil siswa, hasil kuis, isi modul rinci, maupun relasi prasyarat.
Karena itu, personalisasi adaptif dan jalur belajar pedagogis belum dapat ditentukan hanya dari CSV ini.
Kategori Conversant dan Not Calibrated memerlukan validasi, bukan pemetaan level otomatis.

Korpus mentah mempertahankan seluruh baris dan atribut asli, dengan ID lokal dan indikator ketersediaan.
Tidak dilakukan pembersihan, imputasi, normalisasi teks, TF-IDF, cosine similarity, atau pemodelan.
Sumber dan lisensi CSV perlu dilengkapi oleh kelompok. Hash sumber: 3ccf430e27917fb969acd06fd2616cbc7e8d1dc9fa02653f65d67e5e7d1128ae.
