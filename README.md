# Alur — ITS Langkah 6

Aplikasi lokal HTML/CSS/JavaScript + FastAPI, rekomendasi TF-IDF asli dan SQLite.

## Setup Windows / VS Code

Buka terminal PowerShell pada `C:\Projects\its-kelompok`. Python 3.12 dipakai dan diuji pada proyek ini (tersedia melalui Python Launcher).

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\.venv\Scripts\python.exe -m backend.store
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8001
```

Jika `.env` sudah ada, pertahankan isinya. Buka **http://127.0.0.1:8001**. Pilih **Buat akun**, isi nama, email, dan password minimal 10 karakter. Setelah registrasi, akun langsung masuk. Untuk kunjungan berikutnya pilih Masuk. Logout mempertahankan progres. Tidak ada kredensial bawaan. Server statis port 8000 dari langkah 5 tidak menyediakan API dan tidak lagi menjadi cara menjalankan aplikasi.

Tidak perlu mengaktifkan virtualenv dengan Activate.ps1. Pilih `.venv/Scripts/python.exe` sebagai interpreter VS Code. Hentikan server menggunakan Ctrl+C. Port, origin pada `.env`, dan URL browser harus sama; gunakan 127.0.0.1 secara konsisten.

[Revisi UI autentikasi/dashboard terbaru](docs/autentikasi-dashboard.md) memakai tab Masuk/Buat akun dan satu ikon mata. Design system aktual: DESIGN.md.

## Implementasi

- `backend/main.py`: routes, sesi, CSRF, penyajian frontend satu origin.
- `backend/schemas.py`: kontrak Pydantic request/response.
- `backend/recommendation.py`: pemeriksaan artefak, normalisasi sumber, transform dan cosine.
- `backend/rules.py`: aturan adaptasi, XP, badge, level, dan progres.
- `backend/store.py`: inisialisasi SQLite versi 1, koneksi dan pembacaan state.
- `frontend/assets/js/services/api.js`: Fetch dan penanganan kegagalan/sesi.
- `frontend/assets/js/services/recommendation-service.js`: adapter API; tanpa fallback mock.

Mock dan fixture lama disimpan sebagai artefak langkah 5, tetapi tidak digunakan alur aplikasi langkah 6. Data localStorage lama tidak diimpor menjadi akun nyata. Reset demo tidak tersedia pada akun lokal; tidak ada tombol penghapusan progres akun.

[Kontrak API dan keputusan implementasi](docs/langkah-6.md) · [Hasil pengujian aktual](docs/pengujian-api.md).

## Pengujian

```powershell
.\.venv\Scripts\python.exe -m pytest tests/test_api.py -q
```

Database backend test menggunakan direktori sementara pytest. Pengujian browser memakai database khusus:

```powershell
$env:ITS_DB='runtime/e2e.sqlite3'
$env:ITS_ORIGIN='http://127.0.0.1:8002'
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8002
```

Terminal lain (Playwright CLI harus tersedia):

```powershell
playwright-cli.cmd -s=api-e2e open http://127.0.0.1:8002 --browser=msedge
playwright-cli.cmd -s=api-e2e run-code --filename=tests/api-browser.js
playwright-cli.cmd -s=api-e2e run-code --filename=tests/api-browser-failures.js
```

Suite frontend lama adalah arsip pengujian mode demo langkah 5; gunakan suite API di atas untuk aplikasi saat ini.

---

## Arsip dokumentasi langkah 5 (sebelum integrasi)

# Alur — Sistem Rekomendasi Adaptif Materi & Jalur Belajar

Implementasi **langkah 5** tugas besar Praktikum Intelligent Tutor System. Frontend HTML5, CSS3, dan JavaScript ES modules, tanpa framework atau build tool. Bahasa antarmuka Indonesia; judul dan deskripsi kursus mempertahankan bahasa sumber.

## Menjalankan lokal

Dari folder proyek `C:\Projects\its-kelompok`:

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory frontend
```

Buka **http://127.0.0.1:8000**. Hentikan server dengan `Ctrl+C`. Jika Python dikenali sebagai `py`, ganti `python` dengan `py`. Jika port sudah dipakai, gunakan `8001` dan buka port yang sama di browser.

Alternatif dari folder `frontend`:

```powershell
cd frontend
python -m http.server 8000 --bind 127.0.0.1
```

Gunakan HTTP, bukan membuka `index.html` melalui `file://`, karena ES modules dan Fetch memerlukan origin yang sesuai. Server ini hanya menyajikan berkas statis, bukan backend REST API. Sajikan **folder frontend saja** agar referensi, dataset lengkap, dan model tidak ikut terbuka ke browser.

## Mencoba aplikasi

1. Klik **Masuk Mode Demo**. Beranda menampilkan quest kosong dan tombol **Cari Materi**. Buka Rekomendasi Materi, lalu klik contoh **Python**, lalu **Cari rekomendasi**. Form terisi `python programming`, Intermediate, nilai 45.
2. Tiga kandidat Beginner tampil sebagai quest Remedial. Tautan kursus dan skor cosine berasal dari ekspor Colab.
3. Pilih **Mulai quest · 3 materi**, atau **Mulai dari materi ini** untuk quest satu materi.
4. Buka materi. Aksi ini tidak menandainya selesai.
5. Pilih **Catat penyelesaian**, masukkan nilai simulasi, lalu simpan. Nilai 90 memberi 70 XP dan tiga badge: Learning Explorer, Smart Learner, serta Quiz Master.
6. Periksa **Beranda** atau **Pencapaian**. **Lanjutkan Belajar** membuka materi berikutnya di Quest Saya. Quest tiga materi tetap memiliki penyebut tiga setelah satu materi selesai.
7. Coba contoh Machine learning atau SQL. Pencarian baru tidak mengganti quest. Penggantian quest yang belum selesai memerlukan tindakan konfirmasi inline.

**Pengaturan demonstrasi** di bagian bawah menyediakan respons normal, loading 3 detik, hasil kosong, kesalahan pemuatan, serta reset demo. Reset hanya menghapus key `alur.its.demo.v1`.

Tombol **Keluar mode demo** kembali ke halaman masuk tanpa menghapus progres. Sesi hanya penanda `alur.its.session.v1` di sessionStorage, bukan autentikasi atau pengamanan. Tidak ada email/password yang diminta, dikirim, atau disimpan. Jika storage diblokir, UI tetap bekerja sementara di memori dan menampilkan penjelasan. Di ponsel, tombol **Menu** membuka navigasi; Escape atau memilih halaman menutupnya.

## Struktur

```text
frontend/
  index.html
  assets/
    css/tokens.css, styles.css
    js/app.js                  # event dan orkestrasi
    js/ui.js                   # render rekomendasi, quest, pencapaian
    js/dashboard.js            # Beranda dari state belajar yang sama
    js/navigation.js           # rute hash, menu mobile, pengelolaan fokus
    js/session.js              # penanda sesi demonstrasi, tanpa kredensial
    js/state.js                # state, persistensi, deduplikasi
    js/validation.js           # validasi field dan URL
    js/gamification.js         # aturan adaptasi, XP, badge, progres
    js/services/
      recommendation-service.js # kontrak yang dipakai UI
      mock-service.js           # adapter demo asynchronous
    data/demo-scenarios.json    # subset sumber berlabel
    icons/mark.svg
scripts/build-demo-data.py      # ekstraksi fixture dari CSV, tanpa model
tests/domain.test.mjs           # pengujian aturan dan state
tests/browser.cjs               # regresi frontend yang sudah ada
tests/session.test.mjs          # sesi rusak/diblokir dan logout
tests/dashboard-browser.cjs     # login, Beranda, menu, persistensi, viewport
docs/
  langkah-5.md
  pengujian-ui.md
  browser-results.json
  screenshots/
PRODUCT.md
DESIGN.md
referensi/                     # sumber asli, tidak disajikan server
```

## Batas demonstrasi

- Hanya tiga label skenario didukung: `python programming`, `machine learning`, dan `sql database`. Pencocokan mengabaikan kapitalisasi dan merapikan spasi saja; tidak menerjemahkan atau menjalankan NLP.
- Hasil disaring dari **subset contoh ekspor**, bukan hasil model untuk kueri baru. Level tanpa kandidat pada subset diberi penjelasan, tanpa berpindah level secara paksa.
- Nilai kuis, penyelesaian, XP, dan badge adalah simulasi. Profil dimulai dari 0 XP, bukan profil Alya.
- Cosine mengukur kemiripan teks; bukan akurasi, peluang berhasil, atau kemampuan mahasiswa.
- Katalog tidak menyediakan soal kuis maupun prasyarat pedagogis. Tombol penyelesaian adalah pencatatan mandiri.
- localStorage bukan database tepercaya. Data demo bisa diubah dari browser dan tidak disinkronkan lintas tab/perangkat. Kegagalan storage ditangani sebagai sesi sementara.
- Tidak ada API Python, pelatihan, eksekusi joblib, database, autentikasi, atau deployment.

Rincian sumber, aturan, dan rencana API terdapat di [docs/langkah-5.md](docs/langkah-5.md). Hasil uji aktual dan screenshot ada di [docs/pengujian-ui.md](docs/pengujian-ui.md).

## Pengujian

Node.js hanya diperlukan untuk pengujian, bukan menjalankan aplikasi:

```powershell
node --test tests/domain.test.mjs tests/session.test.mjs
```

Untuk uji browser, jalankan server lokal terlebih dahulu. Playwright dipasang di folder alat terpisah, agar tidak menjadi dependensi frontend:

```powershell
npm install --prefix "$env:TEMP\alur-ui-tools" playwright
$env:PLAYWRIGHT_MODULE = "$env:TEMP\alur-ui-tools\node_modules\playwright"
node tests/browser.cjs
node tests/dashboard-browser.cjs
```

Pengujian menggunakan Chrome yang terpasang. Pada Windows ini, set `$env:BROWSER_PATH = "C:/Program Files/Google/Chrome/Application/chrome.exe"` jika deteksi channel tidak menemukan instalasi. Sesuaikan path pada komputer lain. Set `$env:BASE_URL` bila port berbeda. Script memperbarui `docs/browser-results.json`, `docs/dashboard-browser-results.json`, dan screenshot. Setelah keduanya dijalankan, buat ulang laporan dengan `python scripts/write-test-report.py`. Ini pengujian frontend, bukan end-to-end dengan API.

## Melanjutkan langkah 6

Ganti adapter pada `recommendation-service.js` dengan Fetch API/JSON. Validasi ulang di server memakai Pydantic/JSON Schema. Server menjadi sumber kebenaran aturan dan state; jangan mempercayai XP dari browser. Pertahankan `course_id`, urutan matriks/model, dan normalisasi `normalisasi_teks.py`. Kontrak usulan dijelaskan di dokumentasi langkah 5.

Nama tampilan dapat diubah di `frontend/index.html` dan judul halaman pada `navigation.js`. Token desain berada di `tokens.css`; tidak ada aset font eksternal atau dependensi UI yang harus diunduh saat aplikasi dibuka.


## Revisi navigasi hijau dan reward

Navigasi desktop kini horizontal/sticky; ponsel menggunakan header akun sticky dan navigasi bawah. Materi kandidat disajikan dalam slider yang bisa digeser, dengan tombol batas dan keyboard ArrowLeft/Right pada track. Quest tetap daftar tetap. Selesai materi menampilkan dialog reward dari transaksi nyata simulasi; Escape/Tutup/Kembali ke Quest menutupnya tanpa mengubah progres. Logout tetap menjaga progres lokal.

Pengujian tambahan: `node tests/green-interactions.cjs` dengan PLAYWRIGHT_MODULE seperti di atas. [Catatan revisi dan batas pengujian](docs/revisi-hijau.md). Nama demo dikonfigurasi pada model user sesi di session.js, lalu dirender dari sesi yang sama. Tidak ada autentikasi nyata.
