-- ========================================================
-- SKRIP SETUP DATABASE SUPABASE MELEKISU
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Buat Tabel Berita (news)
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    source TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    date TEXT NOT NULL,
    duration TEXT DEFAULT '5 Menit Baca',
    image TEXT DEFAULT '/images/infrastruktur.jpg',
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Tabel Komentar Warga (comments)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    news_slug TEXT REFERENCES public.news(slug) ON DELETE CASCADE,
    author TEXT NOT NULL,
    author_email TEXT,
    text TEXT NOT NULL,
    status TEXT DEFAULT 'Menunggu Verifikasi', -- 'Menunggu Verifikasi' | 'Terverifikasi'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 4. Buat Kebijakan Akses (Policies)
-- Siapa pun (publik/tamu) dapat membaca berita
DROP POLICY IF EXISTS "Public can read news" ON public.news;
CREATE POLICY "Public can read news" ON public.news
    FOR SELECT USING (true);

-- Siapa pun dapat menambah/mengedit berita (atau khusus admin)
DROP POLICY IF EXISTS "Enable news management" ON public.news;
CREATE POLICY "Enable news management" ON public.news
    FOR ALL USING (true);

-- Siapa pun dapat membaca komentar
DROP POLICY IF EXISTS "Public can read comments" ON public.comments;
CREATE POLICY "Public can read comments" ON public.comments
    FOR SELECT USING (true);

-- Siapa pun yang login dapat menyisipkan komentar
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
CREATE POLICY "Anyone can insert comments" ON public.comments
    FOR INSERT WITH CHECK (true);

-- Admin dapat mengupdate status komentar (verifikasi) dan menghapusnya
DROP POLICY IF EXISTS "Enable comment moderation" ON public.comments;
CREATE POLICY "Enable comment moderation" ON public.comments
    FOR ALL USING (true);

-- 5. Masukkan Data Awal (Seeding Berita)
INSERT INTO public.news (id, title, slug, category, source, excerpt, content, date, duration, image, likes)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'Revolusi Mobilitas Berkelanjutan: Integrasi Transit Nol Emisi di Seluruh Koridor Urban 2025',
    'revolusi-mobilitas-berkelanjutan',
    'Infrastruktur Publik',
    'Humas KCIC',
    'Kementerian Perhubungan bersama konsorsium metropolitan meluncurkan sinkronisasi jadwal tunggal dan tarif gabungan untuk kereta cepat dan bus listrik.',
    'Kementerian Perhubungan bersama konsorsium metropolitan resmi meluncurkan sinkronisasi jadwal tunggal dan tarif gabungan untuk moda transportasi kereta cepat dan bus listrik lintas koridor urban. Kebijakan ini dirancang untuk memangkas waktu transit penumpang hingga 40% serta mendorong penggunaan transportasi publik ramah lingkungan di kawasan perkotaan utama.\n\nDalam laporan implementasi tahap awal, integrasi sistem tiket digital memungkinkan mobilitas harian warga menjadi lebih efisien tanpa hambatan administrasi antarmoda. Pemerintah daerah juga berkomitmen menambah armada penunjang di setiap stasiun transit utama guna mengantisipasi lonjakan komuter pada jam sibuk.',
    '18 Oktober 2025',
    '5 Menit Baca',
    '/images/infrastruktur.jpg',
    1280
),
(
    '00000000-0000-0000-0000-000000000002',
    'Digitalisasi Pertanian Rakyat: Meningkatkan Hasil Panen Mandiri di Sentra Produksi',
    'digitalisasi-pertanian-rakyat',
    'Ketahanan Pangan',
    'Wawasan Agraria',
    'Penerapan sensor kelembaban tanah berbiaya terjangkau meningkatkan margin keuntungan petani lokal hingga 34% secara berkelanjutan.',
    'Penerapan Teknologi Sensor: Penggunaan teknologi sensor kelembapan tanah berbasis Internet of Things (IoT) yang terjangkau kini mulai diterapkan oleh kelompok tani di berbagai daerah sentra produksi.\n\nPeningkatan Keuntungan & Efisiensi: Inovasi ini terbukti mampu meningkatkan margin keuntungan petani lokal hingga 34% melalui efisiensi penggunaan air dan pupuk.\n\nPerluasan Program Pemerintah: Kementerian Pertanian menyatakan bahwa program digitalisasi mandiri ini akan diperluas ke 1.000 desa sentra pangan pada akhir tahun anggaran mendatang, disertai dengan pendampingan teknis bagi para petani senior.',
    '18 Oktober 2025',
    '4 Menit Baca',
    '/images/petani.jpg',
    940
),
(
    '00000000-0000-0000-0000-000000000003',
    'Akselerasi Literasi AI & Coding untuk 50.000 Mahasiswa Vokasi Luar Jawa',
    'akselerasi-literasi-ai',
    'Pendidikan & Talenta',
    'Inovasi Vokasi',
    'Kemitraan politeknik negeri membuka sertifikasi kompetensi rekayasa data gratis bagi mahasiswa untuk menghadapi transformasi digital.',
    'Kemitraan strategis antara politeknik negeri dan industri teknologi global resmi membuka program sertifikasi kompetensi rekayasa data dan kecerdasan buatan (AI) secara gratis. Program ini menargetkan 50.000 mahasiswa vokasi, khususnya di luar pulau Jawa, guna meratakan pemerataan talenta digital nasional.\n\nKurikulum dirancang berbasis studi kasus industri nyata, memberikan kesempatan bagi mahasiswa untuk langsung terlibat dalam proyek transformasi digital sektor publik dan swasta.',
    '17 Oktober 2025',
    '6 Menit Baca',
    '/images/guru.jpg',
    1120
),
(
    '00000000-0000-0000-0000-000000000004',
    'Portal Satu Data Anggaran Terbuka: Setiap Rupiah Terpantau Publik',
    'portal-satu-data-anggaran',
    'Tata Kelola Publik',
    'Transparansi Keuangan',
    'Dashboard analitik real-time memungkinkan warga memantau pengadaan tender dan progres fisik pekerjaan umum.',
    'Kementerian Keuangan bersama Badan Perencanaan Pembangunan Nasional meluncurkan portal analitik terpadu Satu Data Anggaran untuk memberikan transparansi penuh kepada publik.\n\nMelalui platform ini, masyarakat sipil dapat menelusuri alokasi APBN mulai dari pagu kementerian, proses lelang e-katalog, hingga dokumentasi serah terima hasil pekerjaan fisik secara real-time.',
    '16 Oktober 2025',
    '5 Menit Baca',
    '/images/rupiah.jpg',
    1560
)
ON CONFLICT (slug) DO NOTHING;

-- 6. Masukkan Komentar Awal
INSERT INTO public.comments (news_slug, author, text, status)
VALUES
('revolusi-mobilitas-berkelanjutan', 'Budi Santoso', 'Integrasi jadwal ini sangat membantu mobilitas harian saya.', 'Terverifikasi'),
('revolusi-mobilitas-berkelanjutan', 'Siti Rahma', 'Semoga koridornya bisa segera diperluas ke kota penyangga.', 'Terverifikasi'),
('digitalisasi-pertanian-rakyat', 'Ahmad Fauzi', 'Alat sensornya bisa didapatkan di mana ya untuk kelompok tani?', 'Terverifikasi')
ON CONFLICT DO NOTHING;
