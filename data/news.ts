export interface NewsComment {
    id: string;
    author: string;
    authorEmail?: string;
    text: string;
    status?: "Terverifikasi" | "Menunggu Verifikasi";
    createdAt?: string;
}

export interface NewsItem {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    source: string;
    date: string;
    duration: string;
    likes: number;
    image?: string;
    commentsList: NewsComment[];
}
export const newsDatabase: NewsItem[] = [
    {
        id: "1",
        title: "Revolusi Mobilitas Berkelanjutan: Integrasi Transit Nol Emisi di Seluruh Koridor Urban 2025",
        slug: "revolusi-mobilitas-berkelanjutan",
        excerpt: "Kementerian Perhubungan bersama konsorsium metropolitan meluncurkan sinkronisasi jadwal tunggal dan tarif gabungan untuk kereta cepat dan bus listrik.",
        content: `Kementerian Perhubungan bersama konsorsium metropolitan resmi meluncurkan sinkronisasi jadwal tunggal dan tarif gabungan untuk moda transportasi kereta cepat dan bus listrik lintas koridor urban. Kebijakan ini dirancang untuk memangkas waktu transit penumpang hingga 40% serta mendorong penggunaan transportasi publik ramah lingkungan di kawasan perkotaan utama.\n\nDalam laporan implementasi tahap awal, integrasi sistem tiket digital memungkinkan mobilitas harian warga menjadi lebih efisien tanpa hambatan administrasi antarmoda. Pemerintah daerah juga berkomitmen menambah armada penunjang di setiap stasiun transit utama guna mengantisipasi lonjakan komuter pada jam sibuk.`,
        category: "Infrastruktur Publik",
        source: "Humas KCIC",
        date: "18 Oktober 2025",
        duration: "5 Menit Baca",
        likes: 1280,
        image: "/images/infrastruktur.jpg",
        commentsList: [
            { id: "c1-1", author: "Budi Santoso", text: "Integrasi jadwal ini sangat membantu mobilitas harian saya." },
            { id: "c1-2", author: "Siti Rahma", text: "Semoga koridornya bisa segera diperluas ke kota penyangga." }
        ]
    },
    {
        id: "2",
        title: "Digitalisasi Pertanian Rakyat: Meningkatkan Hasil Panen Mandiri di Sentra Produksi",
        slug: "digitalisasi-pertanian-rakyat",
        excerpt: "Penerapan sensor kelembaban tanah berbiaya terjangkau meningkatkan margin keuntungan petani lokal hingga 34% secara berkelanjutan.",
        content: `Penerapan Teknologi Sensor: Penggunaan teknologi sensor kelembapan tanah berbasis Internet of Things (IoT) yang terjangkau kini mulai diterapkan oleh kelompok tani di berbagai daerah sentra produksi.   Peningkatan Keuntungan & Efisiensi: Inovasi ini terbukti mampu meningkatkan margin keuntungan petani lokal hingga 34% melalui efisiensi penggunaan air dan pupuk.   Perluasan Program Pemerintah: Kementerian Pertanian menyatakan bahwa program digitalisasi mandiri ini akan diperluas ke 1.000 desa sentra pangan pada akhir tahun anggaran mendatang, disertai dengan pendampingan teknis bagi para petani senior.`,
        category: "Ketahanan Pangan",
        source: "Wawasan Agraria",
        date: "18 Oktober 2025",
        duration: "4 Menit Baca",
        likes: 940,
        image: "/images/petani.jpg",
        commentsList: [
            { id: "c2-1", author: "Ahmad Fauzi", text: "Alat sensornya bisa didapatkan di mana ya untuk kelompok tani?" }
        ]
    },
    {
        id: "3",
        title: "Akselerasi Literasi AI & Coding untuk 50.000 Mahasiswa Vokasi Luar Jawa",
        slug: "akselerasi-literasi-ai",
        excerpt: "Kemitraan politeknik negeri membuka sertifikasi kompetensi rekayasa data gratis bagi mahasiswa untuk menghadapi transformasi digital.",
        content: `Kemitraan strategis antara politeknik negeri dan industri teknologi global resmi membuka program sertifikasi kompetensi rekayasa data dan kecerdasan buatan (AI) secara gratis. Program ini menargetkan 50.000 mahasiswa vokasi, khususnya di luar pulau Jawa, guna meratakan pemerataan talenta digital nasional.\n\nKurikulum dirancang berbasis studi kasus industri nyata, memberikan kesempatan bagi mahasiswa untuk langsung terlibat dalam proyek transformasi digital sektor publik dan swasta.`,
        category: "Pendidikan & Talenta",
        source: "Inovasi Vokasi",
        date: "17 Oktober 2025",
        duration: "6 Menit Baca",
        likes: 1120,
        image: "/images/guru.jpg",
        commentsList: []
    },
    {
        id: "4",
        title: "Portal Satu Data Anggaran Terbuka: Setiap Rupiah Terpantau Publik Secara Real-Time",
        slug: "portal-satu-data-anggaran",
        excerpt: "Dashboard analitik real-time memungkinkan warga memantau pengadaan tender, lelang, dan progres fisik pekerjaan umum di 38 provinsi.",
        content: `Pemerintah meluncurkan portal analitik real-time yang transparan, memungkinkan warga memantau proses pengadaan tender, lelang proyek, hingga progres fisik pekerjaan umum di 38 provinsi secara transparan.\n\nLangkah ini merupakan bagian dari komitmen keterbukaan informasi publik untuk memastikan akuntabilitas anggaran negara tepat sasaran dan bebas dari praktik penyelewengan.`,
        category: "Tata Kelola Publik",
        source: "Transparansi Keuangan",
        date: "16 Oktober 2025",
        duration: "5 Menit Baca",
        likes: 810,
        image: "/images/rupiah.jpg",
        commentsList: []
    },
    {
        id: "5",
        title: "Transformasi Energi Hijau: Pembangunan PLTS Atap Skala Komunitas Perdesaan",
        slug: "transformasi-energi-hijau",
        excerpt: "Desa-desa mandiri energi mulai memanfaatkan panel surya kolektif untuk memangkas biaya operasional listrik fasilitas umum.",
        content: `Desa-desa mandiri energi di berbagai wilayah mulai memanfaatkan instalasi Pembangkit Listrik Tenaga Surya (PLTS) atap secara kolektif. Inisiatif ini berhasil memangkas biaya operasional fasilitas umum desa hingga separuhnya, sekaligus mendukung target transisi energi bersih nasional.\n\nPemerintah pusat turut menyediakan insentif khusus bagi desa yang berhasil mengelola fasilitas energi terbarukan secara mandiri dan berkelanjutan.`,
        category: "Infrastruktur Publik",
        source: "Energi Nusantara",
        date: "15 Oktober 2025",
        duration: "4 Menit Baca",
        likes: 650,
        image: "/images/plts.webp",
        commentsList: []
    },
    {
        id: "6",
        title: "Kebijakan Baru Distribusi Pupuk Subsidi Berbasis Kartu Tani Digital",
        slug: "kebijakan-baru-distribusi-pupuk",
        excerpt: "Pemerintah memperketat pengawasan distribusi agar tepat sasaran langsung kepada kelompok tani terdaftar di database nasional.",
        content: `Kementerian Pertanian memperketat pengawasan rantai pasok pupuk bersubsidi melalui implementasi Kartu Tani Digital. Sistem verifikasi biometrik dan database terpadu ini memastikan penyaluran pupuk tepat sasaran langsung kepada kelompok tani yang terdaftar resmi.\n\nKebijakan ini diharapkan mampu mengatasi kelangkaan pupuk musiman serta meminimalisir potensi penyalahgunaan distribusi di tingkat lokal.`,
        category: "Ketahanan Pangan",
        source: "Kementan RI",
        date: "14 Oktober 2025",
        duration: "3 Menit Baca",
        likes: 530,
        image: "/images/pupuk.jpg",
        commentsList: []
    }
];