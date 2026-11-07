# MelekIsu

> Platform digital interaktif untuk menyuarakan aspirasi masyarakat, menyajikan warta terkini, dan memantau transparansi aksi nyata dari berbagai gagasan publik.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router) & React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Database & Auth:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
* **Icons:** Lucide React

---

## 🚀 Cara Menjalankan Project

Ikuti panduan berikut untuk menjalankan project di komputer lokal:

### 1. Clone Repository
```bash
git clone https://github.com/oessvn/WarTahu-app.git
cd WarTahu-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Duplikat file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
*(Atau buat file `.env.local` secara manual dan salin konfigurasi berikut)*:
```env
NEXT_PUBLIC_SUPABASE_URL=https://henxsxlsmmtpxfvyssqx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_QBw-hf8KNt3pV423CtPkAg_-RQeETe4
GEMINI_API_KEY=masukkan_api_key_gemini_anda_di_sini
```

> ⚠️ **Catatan untuk Dewan Juri / Penguji (Fitur AI Chatbot):**
> Demi alasan keamanan dan pencegahan pencabutan kuota otomatis oleh Google (*secret scanning*), API Key tidak kami sertakan secara terbuka di repositori ini.
> Untuk menguji respons cerdas real-time dari fitur **AI Chatbot**, silakan gunakan API Key Google Gemini pribadi Anda (gratis):
> 1. Kunjungi [Google AI Studio](https://aistudio.google.com/) dan masuk menggunakan akun Google Anda.
> 2. Klik menu **"Get API key"** $\rightarrow$ **"Create API key"** (gratis).
> 3. Masukkan kunci tersebut pada variabel `GEMINI_API_KEY` di dalam file `.env.local`.

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka browser dan akses [http://localhost:3000](http://localhost:3000).

---

## 📌 Progress Saat Ini

Hingga tahap **First Draft Submission (01 November 2026)**, progres pengembangan aplikasi mencakup:

* [x] **Landing Page Utama (`/`):** Hero section, navigasi responsif, tinjauan isu terkini, dan statistik partisipasi warga.
* [x] **Modul Berita & Warta (`/berita`):** Tampilan katalog berita/artikel beserta filter kategori dan pencarian (masih menggunakan mock data).
* [x] **Detail Berita Interaktif (`/berita/[slug]`):** Halaman baca berita lengkap dengan sistem reaksi dan antarmuka komentar (masih menggunakan mock data).
* [x] **Transparansi Aksi (`/transparansi-aksi`):** Pelacakan progres status aksi nyata (tahap verifikasi, riset, implementasi, hingga selesai) beserta dokumentasi kegiatan.
* [x] **Modul Autentikasi Pengguna:**
  * Halaman Masuk / Login (`/masuk`)
  * Halaman Pendaftaran Akun (`/daftar`)
  * Pemulihan & Pergantian Kata Sandi (`/lupa-sandi` & `/ubah-sandi`)
* [x] **Manajemen Profil Pengguna (`/profil`):** Informasi akun dan riwayat aktivitas.
* [ ] *Tahap Berikutnya:*
  * **Integrasi Database Penuh (Supabase):** Menghubungkan modul berita (publikasi/manajemen artikel) dan penyimpanan komentar pengguna ke database Supabase secara dinamis (menggantikan mock data).
  * **Integrasi AI Chatbot:** Asisten AI interaktif untuk memfasilitasi tanya-jawab seputar isu/berita serta mensimulasikan dan menganalisis pendapat maupun masukan pembaca.
  * **Dashboard Admin & Moderasi Komentar (AI-Assisted):** Panel khusus admin untuk memverifikasi dan menyetujui komentar yang masuk, didukung AI untuk kurasi otomatis (deteksi spam, sentimen negatif, dan ujaran kebencian).
  * Formulir pengajuan aspirasi warga baru beserta sistem tracking statusnya.
  * Finalisasi responsivitas UI dan pengujian menyeluruh (cross-browser testing).
