---
name: Alur
description: Penunjuk ruang kampus yang tenang, terbaca, dan terarah.
colors:
  ink: "#20352b"
  muted: "#52675b"
  forest: "#153f2e"
  forest-hover: "#20563d"
  mint: "#edf6ee"
  lime: "#d6edbf"
  ground: "#f7f9f6"
  paper: "#ffffff"
  line: "#dce6dd"
  input-line: "#758b7c"
  yellow: "#f3edcf"
  error: "#a32b32"
  error-bg: "#fff1ef"
  focus: "#285dba"
  accent: "#237445"
  on-dark: "#f3fcfd"
  on-dark-muted: "#cce3d4"
  dark-line: "#527760"
typography:
  display:
    fontFamily: '"Manrope", "Segoe UI", sans-serif'
    fontSize: "clamp(28px, 2.8vw, 38px)"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Manrope", "Segoe UI", sans-serif'
    fontSize: "19px"
    fontWeight: 650
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  title:
    fontFamily: '"Manrope", "Segoe UI", sans-serif'
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  body:
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif'
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.6
rounded:
  radius: "14px"
  control-radius: "10px"
  preset: "6px"
  tag: "5px"
spacing:
  space-1: "4px"
  space-2: "10px"
  space-3: "12px"
  space-4: "16px"
  space-5: "24px"
  space-6: "32px"
  space-7: "48px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control-radius}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.forest-hover}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.forest}"
    rounded: "{rounded.control-radius}"
    padding: "10px 18px"
  button-secondary-hover:
    backgroundColor: "{colors.mint}"
  button-danger:
    backgroundColor: "{colors.error}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control-radius}"
    padding: "10px 18px"
  button-preset:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.forest}"
    rounded: "{rounded.preset}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control-radius}"
    padding: "10px 13px"
    height: "48px"
  nav-current:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.forest}"
    rounded: "{rounded.control-radius}"
    padding: "12px"
  tag:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.forest}"
    rounded: "{rounded.tag}"
    padding: "3px 9px"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius}"
    padding: "28px"
  dashboard-activity:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.radius}"
    padding: "36px"
  menu-toggle:
    textColor: "#f4f8f1"
    rounded: "{rounded.control-radius}"
    padding: "10px 12px"
  badge-earned:
    backgroundColor: "{colors.yellow}"
    rounded: "{rounded.radius}"
    padding: "22px 16px"
---

# Design System: Alur

## Overview

**Creative North Star: "Penunjuk ruang kampus"**

Bidang terang, navigasi hijau pinus, dan tipografi yang mudah dipindai memberi suasana tenang dan terarah. Garis tipis memisahkan kelompok; warna lembut memberi konteks tanpa mendominasi isi.

Dokumen ini merekam implementasi HTML/CSS/JavaScript, dengan arah Operate dan code-first. Sumber nilai: [tokens.css](frontend/assets/css/tokens.css), [styles.css](frontend/assets/css/styles.css), [index.html](frontend/index.html), [ui.js](frontend/assets/js/ui.js), [dashboard.js](frontend/assets/js/dashboard.js), [navigation.js](frontend/assets/js/navigation.js), dan [session.js](frontend/assets/js/session.js). Perluasan Beranda dan masuk demo memakai sistem yang sama tanpa token global baru. Konteks permukaan tetap berada di [.impeccable/surfaces/learning.md](.impeccable/surfaces/learning.md).

Bukti visual lokal permukaan belajar sebelum perluasan Beranda/login: [desktop awal](docs/screenshots/desktop-awal.png), [desktop rekomendasi](docs/screenshots/desktop-rekomendasi.png), [desktop quest](docs/screenshots/desktop-quest.png), [desktop progres](docs/screenshots/desktop-progres.png), [ponsel awal](docs/screenshots/mobile-awal.png), [ponsel rekomendasi](docs/screenshots/mobile-rekomendasi.png), [ponsel quest](docs/screenshots/mobile-quest.png), dan [ponsel progres](docs/screenshots/mobile-progres.png). Semuanya tangkapan implementasi lokal, bukan komposisi persetujuan atau kartu QUALITY BAR. Dokumentasi ini tidak menyatakan pengujian browser baru.

**Key Characteristics:**

- Navigasi pinus dan bidang kerja terang.
- Judul Manrope, teks operasional sans yang familier.
- Pembatas tipis, sudut lembut, tanpa bayangan.
- Status terbaca melalui teks, bentuk, dan warna.

## Colors

Palet hijau alami dipadukan dengan putih hangat dan kuning pucat; nilai normatif berada pada frontmatter.

### Primary

- **Pinus** (`forest`, `forest-hover`): navigasi, aksi utama, dan indikator selesai.
- **Mint pucat** (`mint`): ringkasan, tag, notifikasi berhasil, dan form kontekstual.
- **Hijau tunas** (`lime`): navigasi aktif, seleksi teks, dan isi progres pada bidang pinus.

### Secondary

- **Kuning refleksi** (`yellow`): catatan, peringatan, dan badge yang sudah diperoleh.

### Neutral

- **Tinta hijau** (`ink`) dan **hijau redup** (`muted`): isi utama dan penjelasan sekunder.
- **Lantai terang** (`ground`) dan **kertas** (`paper`): latar halaman dan bidang form.
- **Garis lembut** (`line`) membagi konten; **garis isian** (`input-line`) membatasi kontrol.
- **Merah koreksi** (`error`, `error-bg`) menyampaikan validasi dan aksi berisiko. **Biru fokus** (`focus`) menandai posisi keyboard.

**The Status Terbaca Rule.** Pasangkan warna status dengan label atau simbol; warna saja tidak menyampaikan selesai, error, atau navigasi aktif.

## Typography

Manrope variabel lokal menjadi wajah judul dan merek; berkas serta lisensi OFL tersedia di `frontend/assets/fonts/`. Teks isi memakai Segoe UI, Helvetica Neue, Arial, lalu sans-serif. Hierarki bersifat peran, bukan skala rasio tunggal.

- **Display:** judul halaman; gunakan ukuran cair pada frontmatter, menjadi 29px dan maksimum 20ch pada ponsel.
- **Headline:** judul bagian; menjadi 18px pada ponsel. Ringkasan memakai variasi 17px dan judul quest 24px.
- **Title:** judul materi memakai bobot 600; menjadi 17px pada ponsel.
- **Body:** teks dasar memakai line-height 1.6; deskripsi ringkas dan metadata memakai 13px. Teks pendamping halaman dibatasi 65ch, deskripsi materi 70ch, dan catatan sumber 75ch.
- **Variasi Beranda dan masuk demo:** judul panel awal 27px (24px pada ponsel); judul materi berikutnya 25px (22px pada ponsel). Angka ringkasan 20px, bobot 650, tabular-nums. Judul masuk memakai clamp(30px, 3vw, 42px), maksimum 16ch, dan 32px pada ponsel. Judul konteks pinus memakai clamp(32px, 3.5vw, 50px), bobot 550, line-height 1.18, letter-spacing -0.035em. Variasi ini milik komponen, bukan pengganti hierarki global.
- **Label:** label isian dan status memakai 13px; tombol memakai bobot 600 dan line-height 1.5. Angka indeks memakai tabular-nums.

## Layout

Ritme dasar menggunakan langkah spacing pada frontmatter, dengan penyesuaian komponen yang terlihat di kode. Kontainer utama maksimum 1440px dan padding dasar 40px. Rail desktop tetap selebar 224px; workspace mengimbangi lebarnya. Rail dapat bergulir vertikal agar menu dan aksi keluar tetap terjangkau pada tinggi layar pendek. Bilah atas memiliki tinggi minimum 76px. Form dan ringkasan pada permukaan belajar menggunakan kolom fleksibel + 268px dengan gap 28px; susunan ini milik permukaan tersebut, bukan kewajiban semua layar.

| Kondisi viewport | Perubahan implementasi |
| --- | --- |
| ≥1500px | Padding utama 48px 56px. |
| ≤1180px | Rail 200px, padding utama 32px 24px; kolom ringkasan 230px, gap 20px. |
| ≤960px | Area belajar dan Beranda satu kolom; ringkasan belajar dua kolom; badge dua kolom. Pada 701-960px, tiga metrik Beranda berdampingan. |
| ≤700px | Rail menjadi header aliran dokumen dengan tombol Menu; empat tujuan navigasi berada dalam disclosure satu kolom; margin workspace nol; padding utama 28px 20px; isian, ringkasan, dan ringkasan progres satu kolom. |

Beranda memakai kolom fleksibel + 280px dengan gap 36px; pada ≤1180px ringkasan menjadi 240px dengan gap 24px. Panel aktivitas mint memiliki padding 36px, menjadi 28px pada ≤1180px dan 24px 20px pada ≤700px. Riwayat memakai baris pembatas; judul dan metadata bertumpuk pada ≤1180px.

Halaman masuk memakai dua bidang: konteks pinus minmax(340px, 42%) dan area masuk putih yang fleksibel. Isi masuk maksimum 470px. Pada ≤700px konteks hanya menampilkan merek; narasi dan langkah pendamping disembunyikan, area masuk memakai padding 32px 24px 24px. Untuk rail pada lebar ≥701px dan tinggi ≤820px, catatan dipadatkan tanpa menyembunyikan navigasi.

Panel quest dibatasi 900px. Baris materi dan riwayat memakai garis horizontal, bukan kartu berulang. Aksi dapat membungkus; tombol minimum 44px dan input 48px menjaga target interaksi tetap lapang.

## Elevation & Depth

Tidak ada box-shadow pada implementasi. Kedalaman berasal dari kontras bidang pinus, kertas, mint, dan latar terang, disertai border satu piksel. Ring fokus berada di luar kontrol (3px, offset 4px), bukan bayangan dekoratif.

**The Bidang Tenang Rule.** Gunakan warna bidang dan pembatas untuk pengelompokan; pertahankan permukaan tanpa bayangan.

## Shapes

Panel memakai `radius`, kontrol memakai `control-radius`; preset dan tag memiliki sudut lebih rapat sebagaimana frontmatter. Lingkaran digunakan pada indeks, avatar, dan penanda kecil. Ikon berupa SVG garis dengan stroke membulat; ukuran umum 20px dan stroke 1.7, dengan variasi kontekstual yang ada di kode.

## Components

- **Tombol:** primary pinus solid, secondary putih dengan border isian, danger merah. Hover primary menggunakan `forest-hover`; secondary memakai mint. Preset memiliki border lembut yang menjadi pinus saat hover. Disabled memakai opacity 0.6 dan cursor not-allowed. Saat ditekan, tombol dan preset memakai brightness(0.92).
- **Isian:** label selalu terlihat; border satu piksel dan radius kontrol. Fokus menggunakan ring global. `aria-invalid` mengganti border menjadi merah, disertai pesan dan ringkasan error. Hover tidak mengubah tampilannya.
- **Navigasi:** empat tujuan tetap (Beranda, Rekomendasi Materi, Quest Saya, Pencapaian) dengan teks redup di atas pinus dan hover hijau lebih terang. Halaman aktif memakai tunas, bobot 650, dan aria-current. Label desktop 13px; pada ≤700px, tombol Menu membuka disclosure satu kolom dengan label 15px, ikon 16px, dan baris minimum 46px. Penghitung disembunyikan. Tombol memakai aria-expanded dan aria-controls; Escape menutup menu dan mengembalikan fokus ke tombol. Perubahan rute menutup menu dan memindahkan fokus ke konten utama. Saat viewport menjadi ponsel dan fokus ada di menu, fokus kembali ke tombol sebelum menu disembunyikan.
- **Tag:** bidang mint dengan teks pinus, radius tag, padding ringkas. Tag bersifat informasi, bukan tombol.
- **Panel:** form memakai kertas dengan border, ringkasan memakai mint, catatan memakai kuning. Padding mengikuti konteks: form 28px, ringkasan 24px, catatan 20px; responsif sesuai kode.
- **Baris berurutan:** indeks lingkaran memandu pemindaian. Setelah selesai, indeks menjadi pinus dengan centang SVG; label status tetap hadir. Posisi dan urutan materi tetap stabil.
- **Progres dan badge:** elemen progress setinggi 7px; label jumlah dan persentase menyertainya. Badge awal berborder, badge diperoleh memakai kuning dan label eksplisit.

- **Aktivitas Beranda:** panel teal gelap menggunakan keadaan kosong, aktif, dan selesai dari state belajar. Keadaan kosong menyediakan Cari Materi dan tiga langkah; keadaan aktif menampilkan progres serta materi berikutnya; keadaan selesai menyediakan Cari Materi dan tautan quest. XP, level aktivitas, dan badge berada dalam ringkasan pendukung berbentuk daftar definisi. Aktivitas terakhir hanya muncul saat ada riwayat, maksimum tiga penyelesaian terbaru, tanpa tanggal buatan.
- **Masuk demo:** satu aksi primary selebar area masuk; tanpa isian kredensial. Urutan isi adalah judul, penjelasan, label Mode demonstrasi, aksi, dan keterangan keterbatasan autentikasi. Label mode bukan eyebrow judul. Penanda sessionStorage hanya mengatur tampilan sesi; keluar tidak menghapus progres lokal.

Transisi latar tombol dan isi progres memakai `duration` (160ms) dan `ease` pada kode. Spinner berputar linear 800ms. Preferensi reduced-motion mematikan animasi dan transisi. Sidecar menyediakan sebelas contoh HTML/CSS yang tetap terikat ke CSS custom properties proyek.

## Do's and Don'ts

### Do:

- **Do** gunakan token proyek untuk warna, font, radius, dan ruang yang sudah tersedia.
- **Do** pertahankan label terlihat, ring fokus, dan pesan status yang dapat dibaca.
- **Do** gunakan Manrope lokal untuk judul dan SVG garis untuk ikon.
- **Do** hormati reduced-motion dan pembungkusan aksi pada layar sempit.

### Don't:

- **Don't** gunakan warna sebagai satu-satunya pembeda status.
- **Don't** menambahkan bayangan dekoratif pada sistem bidang datar ini.
- **Don't** mengganti font judul dengan font sistem selama Manrope tersedia.
- **Don't** menjadikan komposisi satu permukaan sebagai aturan wajib semua halaman.


## Bukti render perluasan Beranda dan login

Capture 15 November 2026, browser Chrome, font lokal selesai dimuat, reduced-motion aktif, full-page dari atas. Ini bukti implementasi code-first, bukan comp rancangan.

- Login: [desktop 1440px](docs/screenshots/login-desktop.png), [tablet 768px](docs/screenshots/login-768.png), [ponsel 360px](docs/screenshots/login-360.png).
- Beranda: [kosong](docs/screenshots/beranda-kosong-desktop.png), [quest aktif](docs/screenshots/beranda-aktif-desktop.png), [progres 1/3](docs/screenshots/beranda-progres-desktop.png), [quest selesai](docs/screenshots/beranda-selesai-desktop.png).
- Adaptasi: [Beranda 768px](docs/screenshots/beranda-progres-768.png), [Beranda 360px](docs/screenshots/beranda-progres-360.png), [menu disclosure dengan fokus keyboard](docs/screenshots/menu-360.png).

Salinan paket reviewer berada di `.impeccable/review/dashboard/` dengan nama file yang sama. [Review extension](docs/review-dashboard.md) memisahkan temuan awal dan verdict perbaikannya; [hasil pengujian aktual](docs/pengujian-ui.md) mencatat lingkup runtime dan keterbatasannya.


## Adaptasi referensi November 2026
Palet presentasi kini teal gelap #153f2e, cyan aksi #237445 dan latar #f7f9f6. Referensi Dibimbing diperiksa melalui Playwright; rincian serta batas pengamatan di docs/adaptasi-referensi.md. Manrope lokal dan struktur aplikasi dipertahankan. Radius kontrol10px.


## Adaptasi referensi visual ? 15 November 2026

Referensi Dibimbing diperiksa langsung melalui Playwright CLI, tanpa mengirim formulir. Bidang pengantar teal gelap, area navigasi putih, aksen cyan, dan ritme katalog menjadi acuan. Alur mempertahankan rail navigasi serta font lokal Manrope agar struktur aplikasi dan keterbacaan tetap konsisten. Tidak memakai aset bermerek atau fitur webinar.

Token tambahan: accent #237445 (cyan gelap untuk teks putih), on-dark #f3fcfd, on-dark-muted #cce3d4, dark-line #527760, content-width 1360px. Radius kontrol 10px. Dashboard activity memakai forest dengan teks terang dan tombol lime; kandidat materi memakai paper, border line, radius14px, padding24px dan gap16px. Pada ponsel padding kandidat20px16px. Selector diperbarui di tempat, tanpa stylesheet override baru. Login tetap dua bidang teal/putih; topbar putih memberi kontras navigasi.

Bukti: [referensi desktop](docs/screenshots/acuan-desktop-aktual.png), [referensi ponsel](docs/screenshots/acuan-mobile-aktual.png), [katalog referensi](docs/screenshots/acuan-katalog-desktop.png). Hasil lokal terbaru: [Beranda desktop](docs/screenshots/beranda-progres-desktop.png), [ponsel](docs/screenshots/beranda-progres-360.png), [login](docs/screenshots/login-desktop.png), [materi](docs/screenshots/desktop-rekomendasi.png). Capture terbaru menggantikan bukti tampilan sebelumnya, bukan mengubah aturan bisnis.


## Revisi hijau, navigasi, carousel, reward

Keputusan terbaru menggantikan keterangan rail/disclosure sebelumnya: desktop memakai satu navbar horizontal putih sticky. Identitas di kiri, menu utama di tengah, akun dan Logout di kanan pada baris yang sama. Pada layar lebar, kolom samping seimbang membuat menu tepat di tengah viewport; tablet memadatkan ikon dan teks pendamping agar akun tidak bertabrakan dengan menu. Konteks halaman dan label demo berada di awal konten. Pada <=700px, nav yang sama menjadi bottom navigation empat tujuan (Beranda, Materi, Quest Saya, Pencapaian); header akun tetap di atas. Tidak ada dua nav duplikat. Nama berasal dari user sesi demo; truncation ellipsis dan title menjaga nama panjang. Logout langsung, tidak memakai dropdown. Header menampilkan level aktivitas dan total XP yang diturunkan dari history. Padding bawah100px ditambah safe-area; elemen form menggunakan scroll-margin.

Palet utama forest #153f2e, accent #237445, mint #edf6ee, lime #d6edbf, ground #f7f9f6; fokus biru #285dba membedakan fokus keyboard. Warna status error tetap merah. Font lokal Manrope dipertahankan.

Kandidat hasil saja memakai carousel scroll-snap: dua kartu desktop, 88% lebar pada ponsel, gap16px, tanpa auto-slide/infinite/duplikasi. Quest tetap daftar vertikal. Kontrol batas disabled; track fokus mendukung ArrowLeft/Right, tautan dan aksi tetap Tab. Informasi kartu mengalir tanpa tinggi tetap.

Reward memakai dialog native showModal, backdrop inert, penahan Tab eksplisit, Escape/tombol tutup, dan fokus kembali ke judul materi yang sama karena render mengganti form pemicu. Animasi220ms dimatikan pada reduced-motion. Data dialog dihitung dari transaksi state sebelum/sesudah menggunakan profileFromState/activityLevel; tidak menyimpan atau menghitung reward baru. Duplikat tidak membuka dialog, refresh tidak replay. TotalXP dan badge baru berbeda jelas. Dialog maksimal520px, batas tinggi100dvh minus32px.

Referensi learning center berhasil dibuka tetapi redirect guest=false ke guest=true. Hanya tampilan publik diamati; layout akun privat tidak diklaim terlihat. Bukti: docs/screenshots/learning-ref-desktop.png dan learning-ref-mobile.png. Adaptasi menggunakan pemisahan area kerja, header terang, dan susunan materi horizontal tanpa aset promosi.
