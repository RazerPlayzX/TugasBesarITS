---
name: Alur
description: Ruang belajar adaptif yang tenang dan berorientasi aktivitas.
colors:
  ink: "#192e28"
  muted: "#58675f"
  forest: "#123c31"
  forest-hover: "#205543"
  accent: "#286449"
  mint: "#eaf0e8"
  lime: "#d5e8ab"
  ground: "#f5f4ef"
  paper: "#fffefa"
  line: "#dce2d8"
  input-line: "#8b998e"
  yellow: "#f4edd7"
  error: "#a62d35"
  error-bg: "#fff0ef"
  focus: "#275ea1"
  on-dark: "#fafbf3"
  on-dark-muted: "#f0f6ec"
  dark-line: "#557366"
typography:
  body:
    fontFamily: '"Manrope", "Segoe UI", sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.65
  support:
    fontFamily: '"Manrope", "Segoe UI", sans-serif'
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  input:
    fontFamily: '"Manrope", "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  small: "6px"
  tag: "5px"
  panel: "16px"
  control: "8px"
spacing:
  small: "8px"
  medium: "16px"
  large: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.on-dark}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
---

# Design System: Alur

## Overview

Acuan implementasi terbaru, menggantikan keputusan desain sebelumnya. Alur adalah workspace pembelajaran, bukan halaman promosi. Aktivitas utama dan data akun asli memimpin; tidak ada statistik, sampul kursus atau fitur komersial tambahan. Backend FastAPI, sesi cookie HttpOnly, SQLite, TF-IDF dan semua aturan notebook tetap berlaku.

## Colors

Forest #123c31 untuk tindakan utama dan bidang kuat, accent #286449 untuk interaksi, sage #eaf0e8 untuk aktivitas. Ground #f5f4ef dan paper #fffefa merupakan latar netral hangat yang dipilih pengguna. Ink #192e28 dan muted #58675f untuk teks. Secondary on-dark #f0f6ec tetap terang. Fokus #275ea1 serta error #a62d35 tidak bergantung pada aksen hijau.

## Typography

Manrope lokal dengan fallback Segoe UI/sans-serif, satu keluarga font. Body15px, field16px, bantuan/validasi/deskripsi materi14px; label navigasi dan metadata ringkas12px. Judul halaman26–34px, materi berikutnya23–30px. Tidak ada text clamping pada judul materi. Nilai ini memakai --text-body, --text-input dan --text-support; ukuran lebih kecil dibatasi konteks ringkas.

## Layout

Desktop: navbar sticky dengan identitas kiri, menu tengah, akun dan Logout kanan. Dashboard memakai kolom aktivitas + ringkasan, lalu carousel lebar. Shortcut Materi/Quest/Pencapaian di dashboard dihapus; gunakan navbar utama. Konten maksimum1280px; gutter40px desktop dan20–24px mobile. Form rekomendasi300px di samping hasil desktop, bertumpuk di <=760px.

Mobile <=700px: header atas sticky menampilkan nama akun, level aktivitas dan total XP. Bottom navigation empat tujuan memiliki safe-area dan padding konten. Susunan dashboard <=760px: aktivitas utama dengan satu tombol Cari Materi di dalam box, slider kandidat, ringkasan, riwayat jika ada. Kolom pencarian cepat di dashboard dihapus. Tombol Cari Materi menuju halaman Rekomendasi Materi; form topik/kemampuan/nilai tetap ada di halaman tersebut. Pada quest aktif, Lanjutkan Belajar tetap tindakan utama dan Cari Materi merupakan tindakan pendamping.

Carousel Beranda menyajikan hasil API dari pencarian atau rekomendasi lanjutan dalam sesi UI yang sama. Sebelum pencarian, atau setelah refresh tanpa hasil pencarian dalam memori, tampil empty state yang jujur. Refresh tetap memulihkan akun/quest/XP dari backend. Memulai quest dari carousel memakai recommendation_id dan course_id asli. Tidak ada request rekomendasi tanpa kebutuhan belajar pengguna. Hasil baru tetap terpisah dari quest aktif.

## Elevation & Depth

Permukaan datar dibedakan dengan warna dan garis1px. Dialog memakai --shadow-dialog; tidak ada glassmorphism atau dekorasi gradient. Kontras dan ruang, bukan bayangan bertumpuk, membentuk hierarki.

## Shapes

Radius panel16px, kontrol8px. Target tombol minimal44px. Ikon SVG garis konsisten. Tidak ada foto/covers buatan untuk metadata yang tidak tersedia.

## Components

Autentikasi: tab Masuk/Buat akun terlihat langsung, role tablist/tab/tabpanel, aria-selected, roving tabindex dan ArrowLeft/Right/Home/End. Mode tidak mengirim request; error dibersihkan, autocomplete sesuai mode, batas password10–128 sesuai backend. Tab dinonaktifkan selama transaksi auth. Nama hanya diwajibkan registrasi.

Reveal: satu tombol ikon mata44px milik aplikasi, aria-label Tampilkan/Sembunyikan password, aria-pressed dan garis diagonal sesuai state. type=button, nilai/caret tidak berubah; pointer menjaga fokus input sementara keyboard mempertahankan fokus toggle. Edge native ::-ms-reveal/clear disembunyikan hanya pada #auth-password. Autocomplete/password manager tetap aktif; ikon extension tidak dapat dijamin hilang.

Motion: feedback press120ms, tab140ms, transisi umum180ms, reward220ms. Klik/tap seluruh tautan internal dan tombol yang berpindah rute memunculkan halaman dengan slide horizontal32px selama220ms sesuai urutan menu; indikator aktif juga meluncur. Tidak menunggu animasi untuk memperbarui rute/fokus/state. Aksi programatis setelah respons API (misalnya Mulai quest) mengikuti input pointer pemicunya. Login menuju Beranda memakai slide, Logout memakai fade/geser vertikal8px pada form login. Keyboard, refresh dan sesi kedaluwarsa tetap langsung; reduced motion mematikan slide. Klik cepat membatalkan animasi lama dan mempertahankan tujuan terakhir. Tokens --duration-nav dan --nav-slide-distance mengendalikan gerakan. Fokus dan keyboard tanpa penundaan. Reduced motion mematikan animasi; dialog reward memakai respons transaksi API dan mengembalikan fokus setelah ditutup. Modal memakai overscroll-behavior contain. Tidak ada carousel autoplay. Scroll anchor native dan fokus input menggunakan transisi ringan; tidak ada scroll-jacking.

Progress: native <progress> mempertahankan value/max dan aria-label. Track8px memakai aksen hijau, panel XP memakai lime. Lapisan dekoratif aria-hidden mengikuti lebar nilai nyata dan di-clip di dalam bagian terisi. Satu band kilau menyapu selama1800ms, dua kali (total3,6detik), lalu berhenti. Efek muncul lagi saat bar baru dirender/ditampilkan; pada0% tidak ada kilau palsu. Reduced motion mematikan shimmer. Tidak ada animasi yang mengubah persentase atau hadiah.

## Do's and Don'ts

Gunakan tokens dan kontrak API existing; tampilkan status melalui label dan warna. Pertahankan academic disclaimer dan sifat nilai mandiri belum terverifikasi. Urutan bukan prasyarat pedagogis. Jangan menyajikan mock sebagai hasil model, mengarang metadata, atau menyalin fitur komersial referensi.

Brilliant diamati desktop/mobile melalui Playwright: navbar ringkas, hierarki teks tegas, CTA hijau, ruang antar kelompok. Yang diadaptasi adalah ketenangan, fokus tindakan dan pembungkusan mobile; bukan hero besar/ilustrasi/fitur tutor mereka. Codecademy mengembalikan403/verifikasi Cloudflare pada kedua viewport; desain di baliknya tidak diklaim terlihat. Screenshot mobile pengguna menentukan susunan konten ITS. Bukti pengujian terbaru dan pembagian enam skill ada di docs/autentikasi-dashboard.md.
