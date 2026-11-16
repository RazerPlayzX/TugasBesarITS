# Alat pengembangan opsional

Website berjalan hanya dengan Python dan dependency requirements.txt. Tidak perlu memasang skill, Codex, Node.js, atau Playwright untuk belajar memakai aplikasi.

## Skill dan portabilitas

Folder `.agents/skills/` adalah salinan file biasa, bukan symlink (diperiksa pada persiapan repository 16 November 2026). Konfigurasi `.codex/hooks.json` menunjuk skrip Impeccable dengan path relatif proyek. `.impeccable/config.json`, design.json, dan surfaces adalah konfigurasi bersama; config.local.json/cache/review pribadi diabaikan Git.

Skill yang tersimpan: UI UX Pro Max, design-taste-frontend (Taste), emil-design-eng, Impeccable, Web Design Guidelines, Playwright CLI, serta paket desain pendamping. Aplikasi tidak mengimpor file-file ini. `skills-lock.json` adalah catatan sumber/hash sebagian skill, bukan lockfile runtime Python atau daftar lengkap pemasangannya.

Tidak ditemukan path absolut laptop pemilik yang diwajibkan oleh runtime/config proyek. Beberapa sumber skill berisi contoh path OS/browser dan dokumentasi upstream; itu bukan lokasi instalasi wajib. Tidak ada symlink yang perlu dibuat ulang.

Impeccable yang disertakan memuat binary Windows x64; ini bukan jaminan alat tersebut dapat berjalan pada OS/arsitektur lain. Untuk menggunakan di platform lain, ikuti SKILL.md dan pemasangan upstream yang disebut paket, jangan mengubah runtime aplikasi. Pertahankan atribusi/lisensi paket; repository tidak memberikan lisensi baru untuk aset pihak ketiga. Tool desain tidak perlu dijalankan saat setup kelompok.

Dua perubahan lokal pada contoh `design-taste-frontend/assets/components/fx-logos/component.css` dan component.html tidak terkait aplikasi ITS, sehingga sengaja tidak dimasukkan ke commit distribusi. Salinan lokal pemilik tetap dipertahankan.

## Browser test dengan Playwright CLI

Pemasangan opsional, setelah Node.js/npm dan Microsoft Edge tersedia:

```powershell
npm install -g @playwright/cli@0.1.24
playwright-cli.cmd --help
```

Versi CLI 0.1.24 tersedia dan digunakan pada verifikasi proyek. Gunakan `.cmd` jika skrip PowerShell npm diblokir. Contoh urutan tes dan server database terpisah ada di README. Tidak ada package.json/build frontend; pemasangan ini alat developer di luar runtime aplikasi. Bila Edge tidak terpasang, pasang browser yang didukung sesuai bantuan CLI, atau sesuaikan `--browser` dan catat perbedaannya dalam laporan.

`tests/api-browser.js` memakai port 8002. `api-browser-failures.js` dan `smooth-progress-browser.js` melanjutkan akun/sesi skenario sebelumnya. Keluaran mentah CLI, tracing dan storage state jangan di-commit karena dapat memuat cookie/token. Screenshot hanya boleh memuat akun pengujian dan password tersembunyi/kosong.
