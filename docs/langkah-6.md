# Langkah 6: REST API dan integrasi web

Implementasi lokal tanggal 16 November 2026. PDF panduan mengharuskan REST API Python, Fetch tanpa reload, validasi, disclaimer dan minimal 12 kasus uji. Notebook langkah 1–4 mengatur transform, adaptasi, filter serta gamifikasi. Tidak ditemukan konflik aturan. SQLite, registrasi dan sesi adalah pilihan implementasi proyek sesuai permintaan, bukan kewajiban PDF.

## Model dan kompatibilitas

Sumber tetap berada di `referensi/Hasil_ITS_Langkah_1_4/hasil_langkah_2_4`. Joblib hanya dimuat dari path lokal tetap, sekali per startup. Tidak ada endpoint upload model atau penyajian folder referensi. Loader memeriksa metadata sebelum load: sklearn 1.6.1 dan pandas 2.2.3 harus sama; warning saat deserialisasi menjadi kegagalan. Bundle harus memiliki vectorizer, matrix, courses, versi sklearn dan hash sumber sesuai metadata. Matriks sparse 3687 × 20955; jumlah fitur vectorizer, identitas unik dan urutan course_id dibandingkan dengan mooc_clean.csv.

Python ekspor 3.13.18; runtime uji lokal Python 3.12. NumPy/SciPy/joblib ekspor tidak tercatat, sehingga reproduksi lingkungan penuh tidak dapat diklaim. Versi runtime dipin di requirements.txt. Bukti kompatibilitas: load tanpa warning dan cosine rekomendasi kursus indeks 0 cocok dengan setiap baris contoh_rekomendasi.csv pada toleransi 1e-10. Tidak dilakukan fit ulang. Normalisasi diimpor langsung dari normalisasi_teks.py sumber. Hanya vektor skor satu query menjadi dense; matriks korpus tetap sparse. Pemilihan memakai skor positif, level sasaran, pengecualian materi selesai, urutan stabil menurun. Conversant/Not Calibrated tidak dipetakan. OOV menghasilkan hasil kosong; typo tidak dikoreksi otomatis.

Pedoman kompatibilitas: https://scikit-learn.org/stable/model_persistence.html. Password memakai pwdlib Argon2id mengikuti https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/ (mekanisme sesi proyek memakai cookie opaque, bukan JWT).

## Endpoint

API interaktif tersedia di `/docs`; OpenAPI di `/openapi.json`.

| Endpoint | Request | Respons |
|---|---|---|
| GET /health | tanpa sesi | status dan model_ready; 503 jika model gagal |
| POST /api/register | name, email, password | 201, cookie sesi dan csrf_token |
| POST /api/login | email, password | cookie sesi baru, csrf_token |
| GET /api/me | cookie | user, csrf_token, state (quest, history, profile, progress) |
| POST /api/logout | {} | 204, hapus sesi server dan cookie |
| POST /api/recommend | topic, ability, score, limit opsional 1–20 | mode=model, request, adaptation, courses, status, message, recommendation_id |
| POST /api/quest | recommendation_id, course_ids, replace opsional | state terbaru |
| POST /api/complete | quest_id, course_id, score | state, duplicate, status, xp_awarded, total_xp, level_before, level_after, new_badges, progress |

Contoh rekomendasi: `{"topic":"python programming","ability":"Intermediate","score":45,"limit":5}`. Course memakai course_id, title, difficulty, url, provider, description, rating, cosine_similarity. Nilai kosong tidak sama dengan 0. Boolean, nilai nonfinite dan field tambahan ditolak. Error: 401 sesi/login, 403 Origin/CSRF, 404 objek tidak dimiliki/kedaluwarsa, 409 konflik akun atau quest, 422 input, 503 model/penyimpanan. Pesan tidak memuat traceback/password.

## Akun dan transaksi

Password dihash Argon2id; tidak disimpan pada browser. Cookie HttpOnly, SameSite=Lax, TTL 12 jam. Token sesi acak hanya disimpan sebagai SHA-256 di DB. Setiap login memutar sesi dan CSRF. POST wajib memiliki Origin yang sama persis dengan ITS_ORIGIN. Semua POST terautentikasi juga membutuhkan X-CSRF-Token dari /api/me; token ini hanya di memori JS. Register/login dilindungi pemeriksaan Origin untuk mencegah login CSRF. Tidak ada CORS lintas origin.

Identitas selalu berasal dari sesi, bukan body. Query SQLite memakai parameter. Rekomendasi tersimpan terikat pengguna dan berlaku 24 jam; quest hanya boleh dibuat dari kandidat milik akun. Quest mempunyai ID baru setiap penggantian dan daftar tetap. BEGIN IMMEDIATE mengurutkan transaksi penyelesaian; primary key(user_id, course_id) mencegah reward ganda. XP dan badge tersimpan bersama completion dalam satu transaksi. Profil/progres dihitung server dari catatan tersebut. Frontend membaca profil dan respons transaksi untuk popup/header. Tidak ada impor Alya atau state demo.

Inisialisasi idempoten memakai PRAGMA user_version=1. Database runtime diabaikan Git. Simpan cadangan berkas database sebelum perubahan skema di masa depan. Untuk produksi kelak: HTTPS, ITS_COOKIE_SECURE=true, origin produksi, pembatasan percobaan login, pengelolaan cadangan, verifikasi email/reset password dan audit keamanan perlu dikerjakan. Proyek ini hanya dijalankan lokal.

## Kejujuran dan batas

Rekomendasi berasal dari model. Nilai kuis tetap input mandiri belum terverifikasi; penyelesaian materi eksternal dilaporkan pengguna. Urutan bukan bukti prasyarat pedagogis dan cosine bukan akurasi. Disclaimer ITS edukatif dipertahankan. UI hijau, navbar/bottom navigation, carousel dan reward dialog dipertahankan; form login kini akun lokal. Cache-Control no-store mencegah penggunaan ulang aset lama selama pengembangan.
