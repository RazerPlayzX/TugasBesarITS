# Alur — Sistem Rekomendasi Adaptif Materi & Jalur Belajar

Proyek tugas besar Praktikum **Intelligent Tutor System (ITS)**. Mahasiswa memilih materi sesuai topik, kemampuan awal, dan nilai kuis mandiri, lalu mengikuti quest dan memantau progres.

Aplikasi sudah terintegrasi sampai **langkah 6**: HTML5/CSS3/JavaScript + Fetch API, Python/FastAPI/Pydantic, dan SQLite. **Satu server menyajikan frontend dan API**. Tidak perlu Node.js atau build frontend untuk menjalankan website.

## Fitur dan status data

- Registrasi, login, logout, profil, dan penyimpanan progres merupakan akun lokal nyata. Password dihash Argon2id; sesi memakai cookie HttpOnly dan perlindungan CSRF.
- Rekomendasi dihitung oleh model **TF-IDF dan cosine similarity** tersimpan. Input baru ditransformasi tanpa melatih ulang model. Hasil difilter menurut level sasaran, skor positif, serta materi yang belum selesai.
- Dashboard, slider materi, quest, XP, level aktivitas, badge, dan popup reward terhubung ke backend. Penyelesaian course_id yang sama tidak memberi hadiah dua kali.
- **Nilai kuis adalah input mandiri, belum terverifikasi**. Penyelesaian kursus eksternal dilaporkan pengguna; dataset tidak menyediakan bank soal resmi.
- Cosine adalah kemiripan teks, bukan akurasi atau probabilitas keberhasilan. Urutan materi bukan bukti prasyarat pedagogis.
- Mock/fixture langkah 5 adalah arsip. Service aktif tidak beralih diam-diam ke mock ketika model gagal.

> Sistem ini merupakan prototipe ITS untuk keperluan edukasi. Rekomendasi tidak menggantikan penilaian pengajar. Nilai kuis dan penyelesaian materi dilaporkan pengguna dan belum diverifikasi.

## Prasyarat

- **Python 3.12 64-bit**, diuji dengan 3.12.5. Sertakan Python Launcher ketika memasang Python di Windows; cek `py -3.12 --version`.
- Git, cek `git --version`.
- Browser modern; VS Code opsional. Pilih interpreter `.venv\Scripts\python.exe` di VS Code.
- Internet untuk clone, memasang dependency, dan membuka tautan kursus. Model sudah ikut repository.

Artefak diekspor pada Python 3.13.18, scikit-learn 1.6.1, pandas 2.2.3. Runtime Python 3.12 dengan dependency yang dipin sudah diuji memuat model dan mencocokkan hasil ekspor. Jangan menaikkan scikit-learn/pandas sembarangan. Lingkungan ekspor tidak bisa direproduksi identik karena versi NumPy/SciPy asal tidak tercatat.

Node.js, Codex, Impeccable, skill desain, dan Playwright adalah **alat pengembangan opsional**, bukan dependency runtime aplikasi. Lihat [panduan alat pengembangan](docs/alat-pengembangan.md).

## Instalasi pertama di Windows / VS Code

Gunakan PowerShell. Semua perintah setelah `cd` dijalankan dari root repository, bukan dari folder frontend/backend.

### 1. Clone dan virtualenv

```powershell
git clone https://github.com/RazerPlayzX/TugasBesarITS.git
cd TugasBesarITS
py -3.12 -m venv .venv
```

Aktivasi dan instalasi:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Jika aktivasi PowerShell diblokir, **tidak perlu mengubah kebijakan keamanan**. Gunakan executable langsung sebagai alternatif:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 2. Konfigurasi lokal

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

Isi bawaan sudah cukup untuk laptop masing-masing:

```dotenv
ITS_DB=runtime/its.sqlite3
ITS_ORIGIN=http://127.0.0.1:8001
ITS_COOKIE_SECURE=false
```

Tidak ada API key/rahasia bersama yang harus diminta. ITS_DB adalah file SQLite; path relatif dihitung dari folder terminal. ITS_ORIGIN harus sama persis dengan URL browser (host dan port), tanpa slash penutup. Cookie secure=false digunakan untuk HTTP lokal; ini bukan konfigurasi deployment.

Variabel `$env:ITS_*` pada terminal mengalahkan `.env`. Jika sebelumnya mencoba HP/port lain, buka terminal baru atau hapus override terkait dengan `Remove-Item Env:ITS_ORIGIN -ErrorAction SilentlyContinue`.

### 3. Artefak model

Backend membaca path tetap berikut:

```text
referensi/Hasil_ITS_Langkah_1_4/hasil_langkah_2_4/
  model_rekomendasi_mooc.joblib
  metadata.json
  normalisasi_teks.py
  mooc_clean.csv
```

Keempat file **sudah dilacak Git dan ikut clone**. Joblib sekitar 7,6 MiB, CSV 14,0 MiB. CSV diperlukan untuk pemeriksaan urutan course_id saat startup. `contoh_rekomendasi.csv` disertakan untuk pengujian kesesuaian model. Tidak ada langkah unduhan model tambahan, Git LFS, atau pelatihan ulang. Model tidak disajikan sebagai aset browser.

Muat hanya joblib lokal proyek yang dipercaya: deserialisasi joblib dapat menjalankan kode. Catatan sumber dataset belum mencantumkan lisensi asal secara lengkap; kelompok perlu melengkapinya sebelum distribusi ulang di luar tugas. Repository tidak mengklaim hak atas katalog kursus pihak ketiga.

### 4. Database dan server

```powershell
.\.venv\Scripts\python.exe -m backend.store
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8001
```

Inisialisasi membuat tabel yang belum ada, tanpa menghapus akun/progres. Server juga menginisialisasi database saat startup. Tunggu `Application startup complete`, lalu buka:

- Website: **http://127.0.0.1:8001**
- Health: **http://127.0.0.1:8001/health**, harus memberikan `{"status":"ok","model_ready":true}`.
- Dokumentasi interaktif: **http://127.0.0.1:8001/docs**. POST berautentikasi memerlukan cookie, Origin, dan token CSRF; Try it out tidak otomatis mengatur semuanya.

Jangan memakai `python -m http.server`, server frontend terpisah, atau `file://` untuk aplikasi terintegrasi. Instruksi port 8000 pada dokumen langkah 5 adalah historis.

## Pemakaian pertama

1. Pilih **Buat akun**, isi nama, email dan password 10–128 karakter. Gunakan identitas pengujian sendiri; tidak ada kredensial bawaan. Registrasi langsung membuka Beranda. Untuk kunjungan berikutnya gunakan tab **Masuk**.
2. Klik **Cari Materi** di panel Beranda. Coba `python programming`, kemampuan `Intermediate`, nilai `45`. Korpus dominan berbahasa Inggris. Nilai 0 valid; kolom kosong tidak valid.
3. Mulai quest dari satu atau beberapa hasil. Pencarian baru tidak mengganti quest aktif; penggantian quest belum selesai memerlukan konfirmasi.
4. Buka tautan materi. Membuka tautan tidak otomatis menandainya selesai. Gunakan **Catat penyelesaian**, isi nilai mandiri, lalu simpan.
5. Popup menampilkan transaksi backend. Selesai materi mendapat 20 XP ditambah bonus nilai; nilai 90 memberi total 70 XP. Badge kumulatif; progres memakai jumlah selesai dibagi jumlah materi quest yang tetap.
6. **Logout** mengakhiri sesi tanpa menghapus progres. Hentikan server dengan `Ctrl+C` di terminal.

Level kemampuan, kesulitan kursus, dan level aktivitas berdasarkan XP adalah tiga hal berbeda. Akun dan progres berada pada SQLite **di laptop server masing-masing**. Database tidak disinkronkan melalui GitHub; teman yang menjalankan server sendiri membuat akun sendiri. Refresh mempertahankan halaman, quest, dan progres. Jika ada materi selesai pada quest aktif, rekomendasi berikutnya dimuat ulang dari topik, level sasaran, dan nilai penyelesaian terakhir yang tersimpan, lalu tampil di Quest dan Dashboard. Pencarian manual yang belum menjadi aktivitas quest tetap hanya berada di memori browser.

## Menjalankan kembali besok

Buka folder TugasBesarITS di VS Code dan terminal pada root proyek:

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8001
```

Buka http://127.0.0.1:8001. Tidak perlu mengulang clone, membuat virtualenv, atau instalasi.

## Membuka dari HP pada Wi-Fi yang sama

Ini akses jaringan lokal, bukan deployment. Hentikan server dahulu. Lihat IPv4 Wi-Fi laptop melalui `ipconfig`, lalu ganti `ALAMAT_IP_LAPTOP` dengan angka tersebut:

```powershell
$env:ITS_ORIGIN="http://ALAMAT_IP_LAPTOP:8001"
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
```

Buka alamat tersebut di HP. `127.0.0.1` di HP menunjuk HP itu sendiri. Gunakan Wi-Fi tepercaya. Jika Windows meminta izin, izinkan Python hanya pada jaringan privat yang diperlukan; jangan mematikan firewall global. Saat konfigurasi ini aktif, gunakan alamat IP yang sama di laptop untuk login. IP dapat berubah dan hanya satu origin diizinkan. Untuk kembali ke konfigurasi laptop, hentikan server dan buka terminal baru.

## Mengambil update kelompok

Hentikan server sebelum memperbarui source/model. Periksa pekerjaan sendiri:

```powershell
git status
git branch --show-current
```

Simpan perubahan terkait proyek sebagai commit, atau gunakan `git stash push -u -m "pekerjaan lokal sebelum update"`. Stash tidak mencadangkan `.env`/database yang diabaikan Git. Cadangkan database secara lokal saat server berhenti sebelum perubahan skema; jangan commit cadangannya.

Pada branch **main** yang bersih:

```powershell
git pull --ff-only origin main
```

Jika ditolak karena branch divergen, koordinasikan merge dengan kelompok; jangan force/reset. Bila menggunakan stash, kembalikan dengan `git stash pop` dan selesaikan konflik bila muncul.

- Jika requirements berubah: jalankan kembali `.\.venv\Scripts\python.exe -m pip install -r requirements.txt`.
- Jika `.env.example` berubah: bandingkan dengan `.env` sendiri; jangan menimpa konfigurasi otomatis.
- Skema sekarang versi 1, diinisialisasi oleh `python -m backend.store`. Belum ada migrasi versi berikutnya. Jangan menghapus database untuk update rutin.
- Update source/model lewat Git tidak menyinkronkan akun. Perubahan artefak harus menjaga metadata, normalizer, katalog dan course_id; ikuti catatan rilis kelompok.
- Jalankan server kembali dan periksa `/health`.

## Struktur folder

```text
backend/                     # FastAPI, skema, model, aturan, SQLite
  main.py                    # Routes, sesi, CSRF, penyajian frontend
  schemas.py                 # Validasi dan kontrak API
  recommendation.py          # Load sekali, transform, cosine, filter
  rules.py                   # Adaptasi, XP, level, badge, progres
  store.py                   # Inisialisasi DB versi 1 dan state
frontend/                    # Satu-satunya direktori aset publik server
  index.html
  assets/css/                # Tokens dan komponen visual
  assets/js/                 # UI, navigasi, state, service Fetch
  assets/fonts/              # Font lokal
referensi/                   # Panduan, notebook, hasil langkah 1–4/model
tests/                       # Backend/browser; sebagian arsip demo
scripts/                     # Fixture/laporan historis langkah 5
docs/                        # Kontrak API, laporan uji, screenshot
.agents/skills/               # Alat coding opsional
.codex/ .impeccable/          # Konfigurasi pendamping opsional
PRODUCT.md DESIGN.md          # Perilaku dan desain terkini
requirements.txt             # Dependency Python dipin, termasuk pytest
.env.example                 # Konfigurasi contoh tanpa rahasia
runtime/                     # Dibuat lokal, tidak ikut Git
```

## Troubleshooting

| Gejala | Pemeriksaan / solusi |
|---|---|
| Python tidak ditemukan | Pasang Python 3.12 64-bit beserta Launcher, buka terminal baru, cek `py -3.12 --version`. Jika hanya `python` tersedia, pastikan versinya 3.12 sebelum membuat venv. |
| Aktivasi PowerShell diblokir | Gunakan `.\.venv\Scripts\python.exe` langsung; aktivasi tidak wajib. |
| ModuleNotFoundError | Jalankan dari root proyek, gunakan Python venv dan pasang `-r requirements.txt`. Pilih interpreter yang sama di VS Code. |
| Model/file wajib tidak ditemukan | Periksa empat file artefak di atas dan `git status`. Clone lengkap memuat semuanya. Jika terhapus lokal, ambil salinan dari clone terpisah repository tepercaya tanpa menimpa pekerjaan lain; jangan mengunduh joblib acak. |
| Health 503 / versi tidak cocok | Lihat terminal; gunakan Python 3.12 dan requirements yang dipin. Jangan mengabaikan warning atau melatih ulang. Coba venv baru bila lingkungan sudah berubah. |
| Port sedang dipakai | Hentikan server lama dengan Ctrl+C. Atau ubah port, misalnya `--port 8010`, ITS_ORIGIN menjadi `http://127.0.0.1:8010`, dan buka URL itu. |
| Backend tidak dapat diakses | Pastikan terminal hidup, URL/port benar, dan `/health` bisa dibuka. Untuk HP periksa Wi-Fi, IP, dan izin jaringan privat. |
| Login gagal / Origin 403 / cookie gagal | Jangan mencampur localhost, 127.0.0.1, dan IP LAN. Samakan URL dengan ITS_ORIGIN; restart setelah mengubah `.env`. HTTP lokal perlu ITS_COOKIE_SECURE=false. Periksa override `$env:ITS_*`; refresh untuk mengambil CSRF baru. |
| Email sudah dipakai | Login dengan akun tersebut. Belum ada reset password; jangan menghapus database berisi akun kelompok. |
| Rekomendasi kosong | Coba topik Inggris lebih spesifik. OOV, level tanpa kandidat, atau semua kandidat sudah selesai dapat menghasilkan kosong secara sah. |

## Pengujian

Backend memakai database sementara, terpisah dari akun lokal:

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_api.py -q
```

Tes meliputi validasi, batas adaptasi/reward, isolasi akun, CSRF, sesi, dua penyelesaian bersamaan, persistensi, kegagalan model, serta kesesuaian ekspor cosine. Fixture mengatur origin/cookie uji sendiri.

Browser opsional memerlukan Node.js, Playwright CLI, dan Edge; lihat [alat pengembangan](docs/alat-pengembangan.md). Jalankan server uji di terminal tersendiri:

```powershell
$env:ITS_DB='runtime/e2e.sqlite3'
$env:ITS_ORIGIN='http://127.0.0.1:8002'
$env:ITS_COOKIE_SECURE='false'
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8002
```

Terminal kedua pada root proyek; urutan wajib karena skenario berikut melanjutkan state akun uji sebelumnya:

```powershell
playwright-cli.cmd -s=api-e2e open http://127.0.0.1:8002 --browser=msedge
playwright-cli.cmd -s=api-e2e run-code --filename=tests/api-browser.js
playwright-cli.cmd -s=api-e2e run-code --filename=tests/api-browser-failures.js
playwright-cli.cmd -s=api-e2e run-code --filename=tests/smooth-progress-browser.js
playwright-cli.cmd -s=api-e2e close
```

Tes membuat akun pengujian sendiri dan dapat memperbarui screenshot. Jangan arahkan ke database sehari-hari. Periksa Result/Error, bukan exit code CLI saja. Suite `.cjs` dan domain/session.test.mjs lama adalah arsip langkah 5, bukan bukti integrasi terbaru.

Bukti verifikasi **persiapan repository**: [docs/verifikasi-distribusi.md](docs/verifikasi-distribusi.md). Laporan [API](docs/pengujian-api.md), [autentikasi/dashboard](docs/autentikasi-dashboard.md), dan [smooth/progress](docs/smooth-progress.md) mencatat sesi sebelumnya; tanggal/lingkupnya berbeda dari verifikasi terbaru.

## Dokumentasi dan keterbatasan

- [Kontrak API](docs/langkah-6.md), [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md). Panduan tugas dan notebook tetap berada di referensi; dokumen langkah 5 merupakan riwayat, bukan instruksi menjalankan aplikasi sekarang.
- Relevansi pedagogis belum divalidasi pengajar. Tidak ada klaim akurasi, keberhasilan belajar, atau bebas bug.
- Belum ada verifikasi email, pemulihan password, atau pembatasan login untuk layanan publik. Proyek belum disiapkan untuk deployment internet.
- `.env`, virtualenv, cache, log, database, sesi, dan keluaran browser mentah diabaikan Git. Jangan memasukkan kredensial pribadi ke source, screenshot, atau commit.
