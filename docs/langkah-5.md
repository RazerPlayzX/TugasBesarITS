# Implementasi Langkah 5 — Desain Antarmuka Web

## Sumber dan keputusan

Sumber yang dibaca sebelum implementasi:

| Sumber | Acuan |
|---|---|
| `referensi/PANDUAN DAN KETENTUAN TUBES ITS.pdf` | Halaman 3–4: gamifikasi, HTML/CSS/JS, form tanpa reload, disclaimer, pemisahan langkah 5 dan 6. Halaman 5: pengujian web/API dan screenshot. |
| `referensi/ITS_Langkah_1_4_Disesuaikan.ipynb` | Normalisasi dan TF-IDF; sel 36–40 (indeks nol) untuk adaptasi dan mekanik gamifikasi. Notebook dibaca, tidak dieksekusi ulang. |
| `hasil_langkah_1` | Ringkasan, struktur korpus dan audit: kursus bukan riwayat siswa; level belum terkalibrasi tidak dipetakan; prasyarat tidak tersedia. |
| `hasil_langkah_2_4/metadata.json` | 3.687 kursus; 20.955 fitur; nilai simulasi dan status belum divalidasi pengajar. |
| `normalisasi_teks.py` | Acuan normalisasi yang dipertahankan untuk langkah 6, bukan diimplementasikan sebagai mesin pencarian frontend. |
| `contoh_rekomendasi.csv` | Hasil kemiripan terhadap kursus indeks 0 (`rekomendasi_kursus(0)`), bukan pencarian Python. Tidak dicampur ke fixture Python. |
| `quest_aktif_simulasi.csv`, `profil_simulasi.json` | Quest Python Remedial dengan satu materi selesai; Alya memiliki 50 XP, nilai 85, Learning Explorer dan Smart Learner. |
| `evaluasi_relevansi_belum_dinilai.csv` | Hasil pencarian tiga kueri; label relevansi masih kosong, bukan hasil evaluasi akurasi. |
| `hasil_pengujian_logika.csv` | Hasil pengujian notebook; tidak dipakai sebagai bukti pengujian web. |
| `mooc_clean.csv` | Metadata asli untuk ID, judul, penyedia, tingkat kesulitan, deskripsi, URL dan rating numerik. |
| `model_rekomendasi_mooc.joblib` | Keberadaannya diverifikasi; tidak dimuat atau dijalankan. Struktur bundle diketahui dari sel ekspor notebook. |
| `PRODUCT.md`, `.impeccable/config.json` | Lingkup frontend dan proses code-first. |

Folder hasil berada di `referensi/Hasil_ITS_Langkah_1_4/`. Tidak ditemukan ZIP yang perlu diekstrak. Sumber tetap pada tempat dan isi semula.

Tidak ada konflik aturan numerik antara brief dan notebook. Panduan menetapkan lingkup dan elemen gamifikasi, bukan ambang nilai kelompok. Aturan angka berasal dari notebook. Keterbatasan penting: panduan menyebut modul/materi; artefak yang tersedia adalah katalog **kursus** MOOC, sehingga unit materi UI adalah satu kursus. Daftar kursus tidak diklaim sebagai prasyarat pedagogis tervalidasi.

## Data demonstrasi

`scripts/build-demo-data.py` menggunakan modul standar Python `csv` dan `json`, tanpa pandas, scikit-learn, atau joblib. Script menggabungkan data berdasarkan `course_id` dan menulis subset di `frontend/assets/data/demo-scenarios.json`.

- Python: lima baris hasil pencarian ditambah tiga baris quest dengan dua ID tumpang tindih; menjadi enam kursus unik. Keduanya berasal dari kueri `python programming` yang sama. Flag selesai dari quest **tidak** diimpor.
- Machine learning: lima contoh dari tabel evaluasi.
- SQL: lima contoh dari tabel evaluasi.
- Kursus Conversant tetap tersimpan sebagai metadata asli, tetapi tidak dipilih untuk target Beginner/Intermediate/Advanced. Tidak ada pemetaan level otomatis.
- Deskripsi dan penyedia ditambahkan melalui join ke katalog bersih. Deskripsi ditampilkan sebagai kutipan pendek; tidak diterjemahkan atau dibuat ulang.
- Skor cosine berasal dari ekspor untuk kueri tersebut. Fixture tambahan dengan skor buatan tidak dibuat.
- Hasil berupa subset. Memfilter subset ini tidak setara dengan menjalankan pencarian pada seluruh katalog, dan keterbatasan tersebut tampil di UI.
- Profil baru mulai kosong: quest null dan history kosong; XP, badges, dan materi selesai diturunkan dari history. Profil Alya dipertahankan hanya sebagai sumber referensi.

Skenario cepat:

| Form | Target | Kandidat pada profil kosong |
|---|---|---:|
| python programming, Intermediate, 45 | Remedial / Beginner | 3 |
| machine learning, Intermediate, 70 | Improvement / Intermediate | 2 |
| sql database, Intermediate, 90 | Mastery / Advanced | 3 |

Label kueri lain menghasilkan status `unsupported`, bukan hasil tetap yang disamarkan sebagai pencarian. Kombinasi level yang tidak tersedia pada subset menghasilkan penjelasan kosong. Respons normal memiliki jeda 500 ms, mode loading 3.000 ms, mode empty dan error deterministik. Kontrol pengujian berada dalam disclosure tertutup di bagian bawah.

## Aturan yang dipertahankan

| Nilai | Quest | Level sasaran | Bonus nilai |
|---|---|---|---:|
| <60 | Remedial | Turun satu; minimal Beginner | 10 XP |
| 60–<80 | Improvement | Tetap | 20 XP |
| 80–<90 | Mastery | Naik satu; maksimal Advanced | 30 XP |
| ≥90 | Mastery | Naik satu; maksimal Advanced | 50 XP |

Penyelesaian materi memberi tambahan 20 XP. Level aktivitas: 0–99 XP = 1; 100–199 = 2; 200–299 = 3; ≥300 = 4. Level aktivitas tidak merepresentasikan kemampuan atau kesulitan materi.

Badge bersifat kumulatif: ≥90 Quiz Master, ≥80 Smart Learner, selesai Learning Explorer, <60 Keep Learning. Nilai 90 mendapat Quiz Master **dan** Smart Learner. Badge dideduplikasi dengan Set; `course_id` yang sudah tercatat tidak diberi XP lagi.

Progres = materi selesai di quest aktif / total materi quest aktif × 100, dibulatkan dua desimal. Quest kosong 0%. Pencarian dan penyelesaian tidak mengganti daftar aktif. Hanya tindakan memulai/mengganti quest yang mengubah daftar; penggantian quest belum selesai meminta konfirmasi inline. Riwayat/XP tetap dipertahankan.

Rekomendasi berikutnya setelah penyelesaian memakai level sasaran quest saat ini sebagai level awal, sesuai fungsi `selesaikan_materi` notebook. Contoh: quest Beginner, nilai baru 90 → target Intermediate. Jika subset tidak memiliki kandidat, UI menjelaskannya tanpa mengubah quest lama.

## Pemisahan kode

`app.js` menangani event dan orkestrasi. `ui.js` membuat DOM, menggunakan `textContent` untuk data, serta memvalidasi URL http/https sebelum membuat tautan. Semua tautan tab baru memakai `noopener noreferrer`.

`validation.js` membedakan nilai kosong dan 0. `gamification.js` menyimpan konstanta dan perhitungan terpusat. `state.js` mengelola quest dan riwayat; XP, level, badge dan progres dihitung dari data tersebut agar tidak ada salinan angka yang tidak sinkron. Storage memakai `alur.its.demo.v1` dan `schema_version: 1`; JSON rusak, skema tidak sesuai, riwayat duplikat, dan storage terblokir ditangani. Reset memakai `removeItem` khusus key tersebut, tidak pernah `localStorage.clear()`.

`recommendation-service.js` adalah batas UI terhadap layanan. Hanya `mock-service.js` mengetahui URL fixture. Kedua operasi layanan mengembalikan Promise; nomor versi request mencegah respons lama menghidupkan state yang telah direset atau diganti.

## Kontrak data dan rencana langkah 6

Endpoint di bawah **usulan**, belum dibuat. Pilihan `/api/recommend` merupakan varian yang diperbolehkan panduan untuk endpoint pemrosesan.

### GET /health

Respons usulan: `{"status":"ok","model_loaded":true}`. Pemeriksaan server/model dilakukan oleh backend pada langkah 6, bukan label status frontend saat ini.

### POST /api/recommend

Request usulan sesuai interface layanan frontend:

```json
{
  "topic": "python programming",
  "ability": "Intermediate",
  "score": 45
}
```

Pada mock, `completedIds` dan `mode` adalah opsi terpisah; di backend nanti identitas siswa/riwayat harus ditentukan oleh desain penyimpanan server. Opsi simulasi tidak menjadi input model produksi.

Response shape yang dipakai UI:

```json
{
  "mode": "demo",
  "status": "success",
  "request": {"topic":"python programming","ability":"Intermediate","score":45},
  "adaptation": {"quest_type":"Remedial","target_level":"Beginner"},
  "message": "Keterangan asal dan batas hasil",
  "courses": [{
    "course_id":"MOOC-4b7b76de09323af9",
    "title":"Python Programming Essentials",
    "difficulty":"Beginner",
    "provider":"Rice University",
    "description":"Deskripsi dari katalog sumber",
    "url":"https://www.coursera.org/learn/python-programming",
    "rating":4.8,
    "cosine_similarity":0.673115521036587,
    "source":"quest_aktif_simulasi.csv"
  }]
}
```

`status`: `success`, `empty`, atau `unsupported` pada demo. Kegagalan layanan menjadi rejected Promise dan ditampilkan dengan aksi coba lagi. `rating`, `provider`, `description`, atau cosine dapat tidak tersedia; UI tidak membuat nilainya. Backend nanti dapat memakai `mode: "live"`; label demo baru diubah setelah integrasi nyata.

### Pencatatan penyelesaian

Nama endpoint belum ditetapkan pada langkah 5. Contoh calon endpoint: `POST /api/quests/{quest_id}/completions`, untuk dibahas pada langkah 6.

Payload inti: `{"course_id":"MOOC-4b7b76de09323af9","score":90}`. Mock saat ini menerima `(state, payload)` dan mengembalikan `{state, xp_awarded, duplicate, source:"simulasi"}`. Pada API nyata jangan mengirim state browser sebagai sumber kebenaran. Server perlu memverifikasi anggota quest, menduplikasi penyelesaian secara idempoten, menghitung reward, dan mengembalikan state/summary otoritatif. `course_id` tetap menjadi identitas materi; ID quest ditambahkan saat kontrak server ditetapkan.

Validasi browser tidak menggantikan Pydantic/JSON Schema. Backend harus menolak input kosong/nonangka/nonfinite, nilai di luar 0–100, level tidak valid, materi di luar quest, dan duplikasi reward. Aturan simulasi frontend harus diselaraskan dengan backend sebagai sumber kebenaran. Simpan/muat joblib mengikuti versi metadata dan keselarasan courses/matrix; gunakan `normalisasi_teks.py` sebelum vectorizer.transform, tanpa melatih ulang.

## UX, aksesibilitas, dan desain

Fondasi UX memakai pencarian lokal UI UX Pro Max untuk ringkasan error, error inline, dan fokus keyboard. Rekomendasi awal gaya claymorphism/anak-anak tidak sesuai pengguna mahasiswa dan brief, sehingga tidak diterapkan. Pencarian gaya terfokus juga tidak menemukan kecocokan terverifikasi; arah visual ditentukan dari brief dan Impeccable, tanpa mengklaim hasil database sebagai pilihan final.

Impeccable dipakai untuk arah desain code-first, craft floor, hook pemeriksaan kualitas, kritik render dan dokumentasi desain. Navigasi hijau gelap memberi konteks tetap; form putih dan baris materi memisahkan pekerjaan. State menggunakan teks dan warna, bukan warna saja. Tidak ada modal; penyelesaian dan konfirmasi berlangsung inline. Semua interaksi form mencegah reload.

Label dan pesan error terhubung ke input; ringkasan error menerima fokus dan memiliki tautan ke field. Progress memakai elemen native dengan label. Status loading dan hasil diumumkan melalui aria-live. Tombol utama minimal 44px, fokus terlihat, SVG lokal konsisten, dan reduced-motion dihormati. Judul dan identitas memakai Manrope variable yang disimpan lokal beserta lisensi SIL OFL 1.1; body memakai stack sistem. Aplikasi tidak bergantung pada layanan font eksternal.

## Batas dan pekerjaan lanjutan

Belum mencakup backend, bank soal, autentikasi sungguhan, database, sinkronisasi lintas tab, hosting, validasi pedagogis, uji API, atau pengukuran relevansi. Tautan eksternal mempertahankan sumber; keaktifan, biaya, isi, dan ketersediaan kursus tidak dijamin oleh prototipe. Sumber unduhan CSV, lisensi, dan tanggal pengumpulan masih perlu dilengkapi kelompok sesuai notebook.

Laporan lengkap panduan dan minimal 12 kasus end-to-end web/API tetap perlu dilengkapi setelah langkah 6. Catatan pengujian saat ini khusus frontend.

## Perluasan Beranda dan login demonstrasi

Beranda (`#beranda`) menjadi halaman utama setelah masuk demo. `dashboard.js` membaca state quest/history yang sama dengan halaman lain; tidak membuat profil baru atau menyimpan ringkasan terpisah. Profil dan progres diturunkan memakai fungsi yang sudah ada. Quest kosong menawarkan Cari Materi, quest aktif menampilkan materi pertama yang belum selesai, dan quest selesai menawarkan pencarian baru. Aktivitas terakhir hanya tiga entri riwayat nyata dari simulasi, tanpa tanggal buatan.

`navigation.js` menangani empat rute, penanda halaman aktif, fokus konten, tautan skip, dan menu disclosure sampai lebar 700px. Menu bukan modal: Tab mengikuti urutan DOM, Escape menutup dan mengembalikan fokus ke tombol, memilih rute menutup menu. Desktop pendek memakai sidebar yang dapat digulir. Hash tidak dikenal diarahkan ke Beranda atau login sesuai sesi.

`session.js` menyimpan hanya `{schema_version:1, mode:"demo"}` pada sessionStorage dengan key `alur.its.session.v1`. Login tidak meminta kredensial. Logout menghapus key sesi itu saja; state belajar di `alur.its.demo.v1` tetap tersedia. Penanda ini hanya mengatur tampilan, bukan autentikasi, otorisasi, atau kontrol akses. Sesi rusak kembali ke login; storage diblokir memakai state memori dengan penjelasan. Reset progres tetap memerlukan konfirmasi inline dan tidak menghapus sesi atau data situs lain.

Pencarian memiliki penjaga proses untuk mencegah submit ganda. Logout membatalkan penerapan respons pencarian/penyelesaian yang tertunda melalui versi permintaan. Refresh memuat progres dari penyimpanan dan tidak mengganti quest. Batas sinkronisasi lintas tab tetap berlaku. Tidak ada perubahan aturan gamifikasi, skema state belajar, data sumber, atau service interface.

Langkah 6: tetap mengganti adapter mock dengan Fetch API/JSON sesuai kontrak di atas; backend menjadi sumber kebenaran reward dan state. Login nyata belum dirancang sebagai bagian integrasi ini dan tidak boleh dianggap tersedia hanya karena ada halaman login demonstrasi.
