# MelekIsu

> Platform jurnalisme warga dan transparansi kebijakan publik interaktif untuk menyuarakan aspirasi masyarakat, mengupas warta terkini, serta memantau aksi nyata dari berbagai gagasan sipil secara berimbang dan transparan.

---

## 🛠️ Tech Stack & Arsitektur

* **Framework:** Next.js 16 (App Router) & React 19
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS v4 (Warm Civic Journalism Palette)
* **AI Engine:** Google Gemini API (`@google/genai`)
* **Database & Auth:** Supabase Cloud (`@supabase/ssr`, `@supabase/supabase-js`)
* **Icons:** Lucide React

---

## ✨ Fitur Utama yang Telah Diimplementasikan

### 1. 🏛️ Portal Redaksi & Dashboard Admin Khusus (`/admin`)
* **Login Redaksi Terisolasi (`/admin/login`):** Halaman login aman yang terpisah total dari navigasi warga biasa.
* **Tampilan Khusus Editorial (`ClientShell`):** Bilah navigasi publik, footer warga, dan widget AI disembunyikan secara otomatis saat berada di dalam portal admin.
* **Metrik Statistik Real-Time:** Memantau jumlah total berita aktif, total tanggapan warga, antrean verifikasi, dan komentar yang lolos kurasi.
* **Penerbitan Berita Baru:** Form rilis artikel lengkap dengan opsi unggah sampul gambar (upload file lokal atau tautan gambar eksternal, dengan fallback cerdas).

### 2. 🛡️ Sistem Moderasi & Privasi Komentar Warga
* **Antrean Kurasi Moderasi:** Seluruh tanggapan warga masuk dengan status `Menunggu Verifikasi`. Admin dapat meninjau, menyetujui (*publish* publik), atau menghapus komentar langsung dari dashboard.
* **Privasi dan Transparansi Warga:** Komentar yang belum diverifikasi redaksi **disembunyikan dari masyarakat umum/user lain** dan hanya dapat dilihat oleh penulis aslinya dengan indikator status khusus.
* **Prinsip Partisipasi Adil:** Setiap akun warga memiliki kuota 1 masukan per artikel guna mencegah spam serta mendorong opini yang berbobot dan konstruktif.
* **Modal Konfirmasi Kustom:** Menggantikan popup bawaan browser dengan dialog konfirmasi bertema MelekIsu yang elegan dan ramah pengguna.

### 3. 🤖 Asisten AI Interaktif Terintegrasi Berita (`AIChatWidget`)
* **Analisis Cerdas Isu:** Asisten cerdas berbasis Google Gemini yang memahami konteks artikel yang sedang dibaca oleh warga secara real-time.
* **Civic Grounding Prompt:** Dirancang untuk memberikan rangkuman netral, membedah dampak regulasi bagi masyarakat, dan merangsang diskursus kritis yang konstruktif.

### 4. ☁️ Integrasi Database Dinamis (Supabase Cloud)
* **Tabel `public.news`:** Manajemen dan sinkronisasi artikel berita yang dirilis oleh admin ke database cloud.
* **Tabel `public.comments`:** Pengelolaan tanggapan warga secara real-time dengan status moderasi (`Menunggu Verifikasi` dan `Terverifikasi`).
* **Resilient Service Layer (`lib/newsService.ts`):** Menggabungkan data cloud Supabase dengan fallback penyimpanan lokal untuk memastikan aplikasi tetap cepat dan dapat diakses dalam berbagai kondisi jaringan.

### 5. 📰 Modul Warga & Ruang Publik
* **Katalog Berita & Pencarian Cepat (`/berita`):** Eksplorasi isu kebijakan dengan filter kategori topik dan pencarian instan.
* **Halaman Baca Artikel Lengkap (`/berita/[slug]`):** Tampilan membaca nyaman dengan estimasi waktu baca, sumber kredibel, sistem apresiasi suka (*likes*), dan ruang partisipasi warga.
* **Transparansi Aksi Nyata (`/transparansi-aksi`):** Pelacakan tahapan realisasi program dari riset, verifikasi, hingga implementasi lapangan.
* **Autentikasi & Akun Warga:** Masuk (`/masuk`), Pendaftaran (`/daftar`), Pergantian Sandi (`/ubah-sandi`), dan Manajemen Profil (`/profil`).

---

## 🚀 Panduan Menjalankan Project

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
Salin template `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```

Isi konfigurasi pada file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://henxsxlsmmtpxfvyssqx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_QBw-hf8KNt3pV423CtPkAg_-RQeETe4
GEMINI_API_KEY=masukkan_api_key_gemini_anda_di_sini
```

> ⚠️ **Catatan Mengenai Google Gemini API Key:**
> Demi menjaga kepatuhan keamanan dan mencegah pencabutan otomatis kuota oleh Google (Secret Scanning), API Key tidak disertakan secara terbuka pada repositori publik.
> Untuk menguji kemampuan penuh Asisten AI MelekIsu:
> 1. Buat API Key gratis di [Google AI Studio](https://aistudio.google.com/).
> 2. Salin kunci ke variabel `GEMINI_API_KEY` pada file `.env.local`.

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akses Kredensial Pengujian

| Peran | URL Masuk | Kredensial Default | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin / Tim Redaksi** | `/admin/login` | Email: `admin@melekisu.id`<br>Sandi: `admin123` | Mengakses dashboard moderasi, publikasi artikel, dan persetujuan komentar warga. |
| **Warga Publik** | `/masuk` | Silakan daftar akun baru di `/daftar` atau gunakan akun warga yang sudah tersimpan. | Berpartisipasi memberikan komentar kebijakan, menyukai berita, dan berdialog dengan Asisten AI. |

---

## 📁 Struktur Proyek Utama

```text
WarTahu-app/
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx   # Dashboard editorial & moderasi komentar
│   │   ├── login/page.tsx       # Login khusus redaksi
│   │   └── layout.tsx           # Layout portal admin terisolasi
│   ├── api/
│   │   └── chat/route.ts        # Endpoint API Google Gemini
│   ├── berita/
│   │   ├── page.tsx             # Katalog warta & filter kategori
│   │   └── [slug]/              # Detail berita & ruang tanggapan
│   ├── transparansi-aksi/       # Pemantauan progres implementasi
│   ├── layout.tsx               # Root layout aplikasi
│   └── page.tsx                 # Beranda & sorotan isu utama
├── components/
│   ├── AIChatWidget.tsx         # Asisten AI interaktif mengambang
│   ├── ClientShell.tsx          # Pengatur tampilan publik vs admin
│   ├── Navbar.tsx               # Navigasi utama warga
│   └── Footer.tsx               # Kaki laman portal
├── data/
│   └── news.ts                  # Skema dan basis data awal berita
├── lib/
│   ├── newsService.ts           # Service sinkronisasi Supabase & lokal
│   └── supabase/                # Konfigurasi Supabase Client & Server
└── supabase-schema.sql          # Skrip DDL tabel & kebijakan RLS Supabase
```
