> Catatan historis revisi autentikasi/dashboard. Penyederhanaan tombol dan slide navigasi yang lebih baru ada di [navigasi-slide.md](navigasi-slide.md).

# Revisi autentikasi dan dashboard — 16 November 2026

Dokumen ini adalah bukti TERBARU. docs/redesign-frontend.md, docs/pengujian-api.md dan screenshot premium-* adalah bukti iterasi sebelumnya, bukan bukti untuk tab/ikon mata/dashboard terbaru. Hasil baru: auth-home-results.json, screenshot auth-* dan home-*.

## Audit kondisi awal dan sumber

Git status diperiksa sebelum edit, seluruh perubahan pengguna dipertahankan. Frontend sudah terhubung FastAPI/Fetch, sesi cookie dan model asli, tidak dikembalikan ke mock. PDF panduan, notebook dan hasil langkah1–4 tetap acuan: HTML/CSS/JS, API tanpa reload, tiga kelompok gamifikasi, validasi dan disclaimer. Metadata dan model tidak diubah. Tidak ada commit/push/deploy.

## Bug password yang terkonfirmasi

Edge157 pada Windows melalui playwright-cli.cmd --browser=msedge mereproduksi satu ikon native di dalam input ditambah tombol teks Tampilkan milik aplikasi. DOM sebelum perubahan hanya satu button; bukan dua custom toggle. Screenshot auth-password-before.png memperlihatkan duplikasi pada password yang masih masked, menggunakan data uji. Sesudah perubahan, auth-password-after-edge.png memperlihatkan satu ikon aplikasi. CSS ::-ms-reveal dan ::-ms-clear dibatasi pada #auth-password. Autocomplete dan password manager tidak dimatikan. Tidak ada klaim mengendalikan semua ikon extension; profil uji tidak mewakili seluruh extension pengguna.

Satu toggle type=button, aria-label dinamis, aria-pressed, ikon garis diagonal ketika terbuka,44px target. Pointer mempertahankan fokus/caret input; keyboard mempertahankan fokus tombol. Nilai password tidak dicatat/dikirim kecuali melalui kontrak autentikasi existing. Screenshot laporan tidak menampilkan password pengguna; form login/register difoto kosong dan contoh field password direkam masked.

## Alur dan data

Dropdown dihapus, diganti dua tab dengan tablist/tab/tabpanel, roving tabindex dan ArrowLeft/Right/Home/End. Pergantian tab tidak reload/tidak request auth, menghapus error tak relevan, memperbarui name required dan autocomplete. Batas password10–128 tidak diubah. Selama request auth, tab/submit dinonaktifkan. Password dibersihkan dan kembali concealed setelah sukses. Email/password asli tetap melewati API/cookie existing.

Dashboard mengikuti screenshot pengguna: header nama/level aktivitas/XP dan Logout sticky; pencarian cepat; aktivitas/quest; shortcut berikon; carousel hasil API; ringkasan; riwayat nyata. Struktur DOM ringkasan dipindahkan sesudah carousel agar urutan keyboard sesuai visual mobile. Desktop mempertahankan nav tengah/akun kanan. Pencarian cepat hanya meneruskan topik ke form lengkap. Tidak mengarang nilai/kemampuan. Kandidat Beranda baru ada setelah pencarian atau rekomendasi lanjutan; setelah refresh kandidat memori boleh kosong sementara quest/progres tetap dari server. Tombol Mulai dari materi ini memakai recommendation_id/course_id asli dari hasil yang ditampilkan. Tidak ada mock untuk menghias Beranda.

## Referensi benar-benar diamati

- Codecademy: desktop1440 dan mobile390 menampilkan403/verifikasi Cloudflare. Tidak dilewati, tidak login/form submit, tidak mengambil kesimpulan visual halaman di baliknya. Bukti codecademy-desktop.png dan codecademy-mobile.png.
- Brilliant: desktop1440/mobile390 menampilkan navigasi ringkas, judul serif besar, CTA hijau dan ruang putih. Diadaptasi ketenangan/kontras CTA/pembungkusan mobile, bukan identitas, hero besar, ilustrasi dan fitur tutor mereka. Bukti brilliant-desktop.png dan brilliant-mobile.png.
- Screenshot pengguna menjadi acuan urutan mobile. Tidak menambahkan shop, langganan, internship, banner iklan, AI interview atau sertifikat.

## Penggunaan skill aktual

Semua path di bawah tersedia dan SKILL.md dibaca. Pembagian peran satu keputusan dalam DESIGN.md, tanpa enam redesign terpisah atau subagent.

| Skill/path SKILL.md | Penggunaan nyata |
|---|---|
| ../.agents/skills/ui-ux-pro-max/SKILL.md | Search domain UX password visibility/accessible authentication/ARIA labels; dasar label toggle, autocomplete, fokus dan hierarki form. |
| ../.agents/skills/design-taste-frontend/SKILL.md | Review komposisi: tepi setara, satu tindakan utama, copy berbasis fitur nyata, tidak menambahkan aset palsu. Aturan landing komersial seperti hero satu layar, kit, efek, larangan carousel dan gate marketing tidak diterapkan karena bertentangan dengan brief aplikasi ITS. Tidak mengklaim lulus gate Taste. |
| ../.agents/skills/emil-design-eng/SKILL.md | Durasi press120ms/tab140ms, respons langsung, transisi properti spesifik, keyboard carousel instant dan reduced motion. |
| ../.agents/skills/impeccable/SKILL.md | Review render langsung, perbaikan ukuran teks/pengelompokan/fokus; detector akhir; sinkronisasi DESIGN.md dan sidecar dari tokens aktual. Review mandiri, bukan dua reviewer independen. |
| ../.agents/skills/web-design-guidelines/SKILL.md | Audit label, tombol ikon, nama field, tab/keyboard, fokus sticky, preload font dan overscroll modal menurut sumber terbaru. |
| ../.agents/skills/playwright-cli/SKILL.md | Browser Edge nyata, inspeksi referensi, reproduksi native reveal,93 pemeriksaan dan screenshot. |

## Review interaksi (Emil)

| Before | After | Why |
|---|---|---|
| Native eye + tombol teks | Satu ikon custom; native Edge dibatasi | Satu affordance, label screen reader tetap jelas |
| Dropdown mode | Tab terlihat, roving focus | Pilihan mudah ditemukan tanpa membuka menu |
| Carousel keyboard smooth | Keyboard instant, pointer smooth | Navigasi berulang langsung merespons |
| Body14px/help12px | Body15px/input16px/help dan deskripsi14px | Mengurangi kepadatan mobile; metadata ringkas12px |
| Ringkasan DOM mendahului shortcut | DOM mengikuti urutan mobile | Fokus tidak melompat ke bawah lalu kembali ke atas |

## Audit Web Design Guidelines akhir

Sumber diambil ulang dari https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md. Temuan terarah yang ditangani:

- frontend/index.html: tombol ikon mendapat aria-label/aria-controls; tab punya state semantik; nama field autentikasi ditambahkan; email spellcheck=false.
- frontend/assets/js/auth-controls.js: keyboard dan label toggle, caret serta pembersihan error ditangani.
- frontend/assets/css/styles.css: field16px, bantuan14px, reveal44px, scroll-margin existing dipertahankan.
- frontend/assets/css/interactions.css: modal overscroll contain.
- frontend/index.html: font lokal preload dan theme-color selaras palette.

Tidak ada klaim audit WCAG tersertifikasi. Kontras tidak diuji untuk seluruh kombinasi; tidak menambahkan social login mati untuk memenuhi saran generik akses autentikasi. Dark mode tidak tersedia. Konten tetap berbahasa Indonesia sesuai brief.

## Sinkronisasi design system

DESIGN.md berisi frontmatter normatif yang diambil dari CSS tokens aktual. Sidecar .impeccable/design.json schema2 diregenerasi: metadata warna, motion, breakpoint, shadow, snippets komponen, narasi; contoh reset demo dan menu disclosure lama dihapus. PRODUCT.md sekarang menggambarkan API asli dan alur terbaru. Config detector mempertahankan pengecualian warm-paper yang sebelumnya disetujui pengguna, dibatasi frontend/index.html, tanpa ignore global baru. Detector akhir tidak menemukan masalah utama; advisory radius6px diselesaikan dengan token small6/tag5 dan skala rounded di DESIGN.md. Dokumen historis ditandai arsip.

## Pengujian terbaru

93 pemeriksaan Playwright CLI di Microsoft Edge157 lulus:22 API/browser,6 kondisi gagal,38 layout/interaksi dan27 auth/home baru.21 pengujian backend lulus ulang pada database pytest terpisah, satu StarletteDeprecationWarning tentang httpx TestClient tetap dilaporkan; model tidak berubah. Browser memakai runtime/e2e.sqlite3 pada port8002. Respons401/403/422 yang sengaja diuji menimbulkan network error yang diharapkan; tidak ada pageerror pada alur utama. Selector carousel test diperjelas menjadi visible karena Beranda sekarang punya carousel sendiri; penutupan dialog menunggu event fokus sebelum assertion, seluruh suite diulang.

| No | Kasus browser | Hasil |
|---|---|---|
| 1 | Registrasi dan profil header | Lulus |
| 2 | Topik kosong | Lulus |
| 3 | Level invalid | Lulus |
| 4 | Nilai negatif | Lulus |
| 5 | Nilai lebih 100 | Lulus |
| 6 | Nilai 0 | Lulus |
| 7 | Nilai 100 | Lulus |
| 8 | OOV hasil kosong | Lulus |
| 9 | CSRF ditolak | Lulus |
| 10 | Rekomendasi model asli | Lulus |
| 11 | Quest dibuat | Lulus |
| 12 | Popup sesuai respons reward | Lulus |
| 13 | Header sesuai API | Lulus |
| 14 | Escape dialog | Lulus |
| 15 | Reward ganda dicegah | Lulus |
| 16 | Persistensi refresh | Lulus |
| 17 | Responsif 360 | Lulus |
| 18 | Responsif 768 | Lulus |
| 19 | Responsif 1440 | Lulus |
| 20 | Akses tanpa sesi | Lulus |
| 21 | Login kembali mempertahankan progres | Lulus |
| 22 | Tidak ada exception JavaScript | Lulus |
| 23 | Backend indisponibel menampilkan error | Lulus |
| 24 | Submit ganda dinonaktifkan | Lulus |
| 25 | Respons lambat tidak memindahkan halaman | Lulus |
| 26 | Kegagalan simpan tidak memberi hadiah | Lulus |
| 27 | Popup naik level dan badge baru | Lulus |
| 28 | Sesi kedaluwarsa kembali ke login | Lulus |
| 29 | Layout beranda 360 | Lulus |
| 30 | Layout rekomendasi 360 | Lulus |
| 31 | Layout quest 360 | Lulus |
| 32 | Layout progres 360 | Lulus |
| 33 | Sticky header 360 | Lulus |
| 34 | Bottom navigation 360 | Lulus |
| 35 | Layout beranda 390 | Lulus |
| 36 | Layout rekomendasi 390 | Lulus |
| 37 | Layout quest 390 | Lulus |
| 38 | Layout progres 390 | Lulus |
| 39 | Sticky header 390 | Lulus |
| 40 | Bottom navigation 390 | Lulus |
| 41 | Layout beranda 768 | Lulus |
| 42 | Layout rekomendasi 768 | Lulus |
| 43 | Layout quest 768 | Lulus |
| 44 | Layout progres 768 | Lulus |
| 45 | Sticky header 768 | Lulus |
| 46 | Layout beranda 1440 | Lulus |
| 47 | Layout rekomendasi 1440 | Lulus |
| 48 | Layout quest 1440 | Lulus |
| 49 | Layout progres 1440 | Lulus |
| 50 | Sticky header 1440 | Lulus |
| 51 | Carousel mulai posisi 1 | Lulus |
| 52 | Keyboard carousel | Lulus |
| 53 | Empty state hasil nyata | Lulus |
| 54 | Slider satu kartu | Lulus |
| 55 | Modal menahan fokus | Lulus |
| 56 | Fokus kembali ke materi | Lulus |
| 57 | Nama panjang dapat diakses | Lulus |
| 58 | Layout viewport efektif zoom 200% | Lulus |
| 59 | Reduced motion | Lulus |
| 60 | Show password | Lulus |
| 61 | Hide password via keyboard | Lulus |
| 62 | Focus indicator | Lulus |
| 63 | Login 360 | Lulus |
| 64 | Login 390 | Lulus |
| 65 | Login 768 | Lulus |
| 66 | Login 1440 | Lulus |
| 67 | Dropdown akun dihapus | Lulus |
| 68 | Tab keyboard register | Lulus |
| 69 | Pergantian mode membersihkan error | Lulus |
| 70 | Tab tidak mengirim autentikasi | Lulus |
| 71 | Autocomplete registrasi | Lulus |
| 72 | Satu reveal custom | Lulus |
| 73 | Reveal menjaga nilai dan fokus | Lulus |
| 74 | Label dan ikon reveal berubah | Lulus |
| 75 | Toggle keyboard tanpa submit | Lulus |
| 76 | login 360 tanpa overflow | Lulus |
| 77 | register 360 tanpa overflow | Lulus |
| 78 | login 390 tanpa overflow | Lulus |
| 79 | register 390 tanpa overflow | Lulus |
| 80 | login 768 tanpa overflow | Lulus |
| 81 | register 768 tanpa overflow | Lulus |
| 82 | login 1440 tanpa overflow | Lulus |
| 83 | register 1440 tanpa overflow | Lulus |
| 84 | Password dibersihkan setelah sukses | Lulus |
| 85 | Header dari akun asli | Lulus |
| 86 | Urutan mobile | Lulus |
| 87 | Pencarian cepat meneruskan topik | Lulus |
| 88 | Slider beranda memakai hasil API | Lulus |
| 89 | Beranda 360 | Lulus |
| 90 | Beranda 390 | Lulus |
| 91 | Beranda 768 | Lulus |
| 92 | Beranda 1440 | Lulus |
| 93 | Mulai quest dari slider beranda | Lulus |

## Screenshot terbaru

[Password sebelum](screenshots/auth-password-before.png) · [sesudah Edge](screenshots/auth-password-after-edge.png)

[Masuk desktop](screenshots/auth-login-1440.png) · [Buat akun mobile](screenshots/auth-register-390.png) · [Dashboard desktop](screenshots/auth-dashboard-desktop.png) · [Dashboard mobile](screenshots/auth-dashboard-mobile.png) · [Slider Beranda](screenshots/home-results-mobile.png) · [Reward desktop](screenshots/auth-reward-desktop.png) · [Reward mobile](screenshots/auth-reward-mobile.png).

## Batas dan cara menjalankan

Uji360/390/768/1440, keyboard, reduced motion dan viewport efektif zoom200% (720×500). Belum perangkat sentuh fisik/keyboard virtual, reader, seluruh extension, Safari/Firefox atau browser-native zoom. Tidak ada jaminan ikon extension hilang. Codecademy diblokir. Tidak menambahkan bank soal atau penilaian resmi; nilai mandiri tetap belum terverifikasi.

Jalankan dari proyek: `.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8001`, buka http://127.0.0.1:8001. Setup penuh di README.md. Uji baru setelah suite API: `playwright-cli.cmd -s=api-e2e run-code --filename=tests/redesign-browser.js` lalu `playwright-cli.cmd -s=api-e2e run-code --filename=tests/auth-home-browser.js`.
