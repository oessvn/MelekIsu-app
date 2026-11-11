# MelekIsu

> Portal jurnalisme warga dan transparansi kebijakan publik interaktif untuk menyuarakan aspirasi masyarakat, mengupas warta terkini, serta memantau aksi nyata dari berbagai gagasan sipil secara berimbang, berbasis data, dan transparan.

---

## 🛠️ Tech Stack & Arsitektur

* **Framework:** Next.js 16 (App Router, Turbopack) & React 19
* **Language:** TypeScript 5
* **Styling:** Tailwind CSS (Warm Civic Journalism Palette)
* **AI Engine:** Google Gemini API (`@google/genai` & Gemini 2.5/1.5 Models)
* **Database & Cloud:** Supabase Cloud PostgreSQL (`@supabase/ssr`, `@supabase/supabase-js`)
* **Live News API:** RSS Feeds parser & feed aggregator dari kantor berita nasional terpercaya
* **Icons:** Lucide React

---

## ✨ Fitur Unggulan MelekIsu

### 1. 🏛️ Dashboard Redaksi & Editorial Admin Khusus (`/admin`)
* **Login Redaksi Terisolasi (`/admin/login`):** Halaman login terproteksi khusus tim redaksi dan kurator kebijakan publik.
* **Tampilan Khusus Editorial (`ClientShell`):** Elemen publik warga, footer umum, dan widget chat AI otomatis disembunyikan dalam mode admin.
* **Metrik Statistik Real-Time:** Memantau jumlah total berita aktif, total komentar warga, antrean verifikasi, dan komentar yang lolos kurasi.
* **Publikasi Berita 1-Klik Berbasis AI:** Tim redaksi dapat memilih berita dari media eksternal (Antara News, CNN Indonesia, CNBC Indonesia) atau dataset kebijakan, lalu AI Gemini secara otomatis menganalisis dan menerbitkan artikel komprehensif siap baca.
* **Modal Dialog Kustom Elegan:** 100% bebas dari pop-up alert bawaan browser, digantikan dengan modal dialog modern berdesain khas MelekIsu lengkap dengan konfirmasi aksi aman.

### 2. 📡 Integrasi Live Feed API Berita Eksternal & Klasifikasi AI Cerdas
* **Integrasi Kantor Berita Kredibel:** Menarik berita terkini secara real-time dari Antara News (Politik dan Ekonomi), CNN Indonesia (Nasional), dan CNBC Indonesia (News dan Energi).
* **Klasifikasi Kategori Otomatis 5 Pilar:** Algoritma pintar dan AI Gemini secara otomatis memetakan berita ke salah satu dari 5 pilar kebijakan:
  1. **Infrastruktur Publik:** Transportasi terpadu, jalan raya, kereta, pelabuhan, tata kelola fisik perkotaan.
  2. **Ketahanan Pangan:** Pertanian, sembako, stabilitas harga pangan, pupuk, nelayan, dan perikanan rakyat.
  3. **Pendidikan & Talenta:** Sekolah, kurikulum, guru, universitas, vokasi, beasiswa, dan pengembangan talenta muda.
  4. **Tata Kelola Publik:** Birokrasi, akuntabilitas anggaran APBN/APBD, reformasi hukum, dan transparansi lembaga negara.
  5. **Energi & Lingkungan:** Transisi energi baru terbarukan, PLTS, mitigasi abrasi pesisir, pengendalian polusi, dan pelestarian hutan.
* **Penyelarasan Foto Berita Asli:** Menggunakan foto dokumentasi asli dari liputan kantor berita sumber untuk menjaga integritas jurnalistik.

### 3. 🛡️ Ruang Diskusi, Moderasi AI, dan Upvote Apresiasi Warga
* **Kurasi Kesantunan Berbasis AI:** Setiap tanggapan warga yang dikirimkan diverifikasi secara instan oleh model AI MelekIsu untuk mendeteksi kesantunan, relevansi topik, dan pencegahan ujaran kebencian.
* **Privasi Antrean Verifikasi:** Komentar yang berstatus menunggu persetujuan hanya dapat dilihat oleh penulis aslinya, menjaga kenyamanan ruang publik warga.
* **Prinsip Partisipasi Berimbang:** Setiap akun warga memiliki kuota 1 masukan per artikel guna mencegah spam serta mendorong opini yang berbobot.
* **Fitur Apresiasi Komentar (Upvote):** Warga dapat memberikan apresiasi pada komentar solutif sesama warga, baik melalui halaman katalog berita maupun halaman detail artikel.

### 4. 📰 Katalog Berita Dinamis & Sistem Pengurutan (Sorting)
* **Beranda Dinamis (`/`):** Sorotan Utama Redaksi dan Kajian Lapangan Terkini selalu menampilkan berita terbaru yang diunggah secara kronologis.
* **Katalog Berita Lengkap (`/berita`):** Eksplorasi indeks berita dengan filter kategori interaktif dan pencarian kata kunci.
* **Sistem Pengurutan Fleksibel:**
  * **Terbaru:** Urutan kronologis artikel dari yang paling baru diterbitkan.
  * **Paling Banyak Diapresiasi:** Diurutkan berdasarkan jumlah suka (*likes*) terbanyak dari warga.
  * **Paling Banyak Tanggapan:** Diurutkan berdasarkan jumlah diskusi komentar warga terbanyak.

### 5. 🤖 Asisten AI Interaktif Terintegrasi Berita (`AIChatWidget`)
* **Analisis Cerdas Kontekstual:** Asisten cerdas berbasis Google Gemini yang memahami konteks isu dan kebijakan yang sedang dibaca oleh warga.
* **Tanya Isu Kebijakan:** Warga dapat bertanya seputar poin krusial undang-undang, ringkasan fakta, atau dampak regulasi langsung dari widget mengambang di pojok layar.

### 6. 📊 Transparansi Aksi Nyata (`/transparansi-aksi`)
* **Pelacakan Kebijakan:** Memantau tahapan aksi nyata dari setiap isu publik mulai dari tahap riset awal, verifikasi aspirasi warga, hingga realisasi lapangan oleh instansi berwenang.

---

## 🚀 Panduan Menjalankan Project

### 1. Clone Repository
```bash
git clone https://github.com/oessvn/MelekIsu-app.git
cd MelekIsu-app
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

> [!NOTE]
> Untuk mengaktifkan fitur AI penuh (Auto-News Generator, Moderasi Komentar, dan Asisten Diskusi), gunakan API Key gratis dari [Google AI Studio](https://aistudio.google.com/) dan masukkan ke variabel `GEMINI_API_KEY`.

### 4. Jalankan Development Server
```bash
npm run dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 🔑 Akses Kredensial Pengujian

| Peran | URL Masuk | Kredensial Default | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin / Tim Redaksi** | `/admin/login` | Email: `admin@melekisu.id`<br>Sandi: `admin123` | Mengakses dashboard editorial, publikasi berita otomatis AI, dan kurasi komentar. |
| **Warga Publik** | `/masuk` | Silakan daftar akun baru di `/daftar` atau gunakan akun warga terdaftar. | Menyampaikan tanggapan kebijakan, memberikan upvote apresiasi, dan bertanya ke Asisten AI. |

---

## 📁 Struktur Proyek Utama

```text
MelekIsu-app/
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx       # Dashboard editorial, live news feed, dan kurasi komentar
│   │   ├── login/page.tsx           # Login khusus tim redaksi
│   │   └── layout.tsx               # Layout portal redaksi terisolasi
│   ├── api/
│   │   ├── auto-news/route.ts       # Endpoint AI generator & RSS live feed aggregator
│   │   ├── moderate-comment/route.ts# Endpoint AI evaluasi kesantunan komentar warga
│   │   └── chat/route.ts            # Endpoint interaktif AI Chat Widget
│   ├── berita/
│   │   ├── page.tsx                 # Katalog berita, pengurutan, dan filter kategori
│   │   └── [slug]/                  # Halaman baca artikel lengkap & ruang diskusi
│   ├── transparansi-aksi/           # Pemantauan progres implementasi program nyata
│   ├── profil/                      # Profil warga terintegrasi riwayat komentar & suka
│   ├── layout.tsx                   # Root layout aplikasi
│   └── page.tsx                     # Beranda dinamis & sorotan utama redaksi terkini
├── components/
│   ├── AIChatWidget.tsx             # Asisten AI interaktif mengambang
│   ├── ClientShell.tsx              # Pengatur tampilan antarmuka publik vs admin
│   ├── Navbar.tsx                   # Navigasi utama portal warga
│   └── Footer.tsx                   # Kaki laman portal informasi publik
├── data/
│   └── news.ts                      # Skema tipe data TypeScript dan basis data awal berita
├── lib/
│   ├── externalNewsApi.ts           # Service pemanggil RSS kantor berita nasional
│   ├── policyDatasets.ts            # Dataset topik kebijakan publik & pilar isu nasional
│   ├── newsService.ts               # Service sinkronisasi Supabase Cloud, upvote, & moderasi
│   └── supabase/                    # Konfigurasi Supabase Client & Server
└── supabase-schema.sql              # Skrip skema database dan kebijakan RLS Supabase
```

---

## 📄 Lisensi

Platform MelekIsu dikembangkan untuk mendukung keterbukaan informasi publik, pemberdayaan masyarakat sipil, serta literasi kebijakan nasional di Indonesia.
