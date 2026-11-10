export interface PolicyTopicDataset {
    id: string;
    title: string;
    category: "Infrastruktur Publik" | "Ketahanan Pangan" | "Pendidikan & SDM" | "Transformasi Digital" | "Tata Kelola & Transparansi" | "Energi & Lingkungan";
    source: string;
    datasetOrigin: string;
    keyPoints: string[];
    defaultImage: string;
}

export const POLICY_DATASETS: PolicyTopicDataset[] = [
    {
        id: "dataset-mbg-eval",
        title: "Evaluasi Skema Distribusi dan Transparansi Anggaran Program Makan Bergizi Gratis (MBG)",
        category: "Ketahanan Pangan",
        source: "Badan Gizi Nasional & Bappenas",
        datasetOrigin: "Portal Satu Data Indonesia - Ketahanan Pangan",
        keyPoints: [
            "Penyaluran bertahap untuk jutaan siswa sekolah dasar dan menengah di 38 provinsi.",
            "Integrasi pengawasan digital dengan melibatkan UMKM lokal dan kelompok tani sekitar.",
            "Alokasi APBN untuk standar higienitas dan pengawasan kualitas gizi berkala."
        ],
        defaultImage: "/images/petani.jpg"
    },
    {
        id: "dataset-transit-urban",
        title: "Perluasan Rute Feeder LRT dan Integrasi Tiket Tunggal Kawasan Aglomerasi Urban",
        category: "Infrastruktur Publik",
        source: "Kementerian Perhubungan",
        datasetOrigin: "Open Data Transportasi Nasional",
        keyPoints: [
            "Penambahan 12 rute koridor baru ramah lingkungan yang menghubungkan kawasan penyangga.",
            "Tarif terintegrasi berbasis aplikasi digital dengan subsidi pemerintah daerah.",
            "Target penurunan emisi karbon sektor transportasi perkotaan hingga 22%."
        ],
        defaultImage: "/images/infrastruktur.jpg"
    },
    {
        id: "dataset-digital-id",
        title: "Akselerasi Identitas Kependudukan Digital (IKD) Menuju Layanan Publik Satu Pintu",
        category: "Transformasi Digital",
        source: "Kementerian Komunikasi dan Digital & Ditjen Dukcapil",
        datasetOrigin: "Portal Digitalisasi Layanan Publik Nasional",
        keyPoints: [
            "Penyederhanaan verifikasi administrasi kependudukan tanpa memerlukan fotokopi berkas fisik.",
            "Penguatan enkripsi keamanan data pribadi warga sesuai UU Perlindungan Data Pribadi.",
            "Integrasi dengan sistem perbankan dan jaminan sosial kesehatan nasional."
        ],
        defaultImage: "/images/guru.jpg"
    },
    {
        id: "dataset-anggaran-desa",
        title: "Transparansi Dana Desa Digital: Publikasi Real-Time Pemanfaatan Anggaran Infrastruktur Desa",
        category: "Tata Kelola & Transparansi",
        source: "Kementerian Keuangan & Kementerian Desa",
        datasetOrigin: "Satu Data Anggaran & Perbendaharaan Negara",
        keyPoints: [
            "Dashboard terbuka pemantauan alokasi dan realisasi fisik pembangunan fasilitas desa.",
            "Partisipasi warga dalam audit sosial proyek infrastruktur pertanian dan sanitasi.",
            "Insentif khusus bagi desa dengan tata kelola akuntabel dan bebas temuan penyelewengan."
        ],
        defaultImage: "/images/rupiah.jpg"
    },
    {
        id: "dataset-plts-rakyat",
        title: "Subsidi Insentif Pemasangan Panel Surya Atap (PLTS) untuk Kawasan Rumah Tangga dan Pesantren",
        category: "Energi & Lingkungan",
        source: "Kementerian ESDM & PLN",
        datasetOrigin: "Pusat Data Energi Baru Terbarukan (EBT)",
        keyPoints: [
            "Dukungan insentif tarif bagi masyarakat yang memproduksi energi bersih mandiri.",
            "Program percontohan di 500 titik fasilitas sosial dan komunitas pedesaan.",
            "Langkah strategis akselerasi bauran energi hijau nasional menuju target nol emisi."
        ],
        defaultImage: "/images/plts.webp"
    },
    {
        id: "dataset-vokasi-ai",
        title: "Program Nasional Pelatihan AI dan Keterampilan Digital untuk 100.000 Lulusan SMK dan Vokasi",
        category: "Pendidikan & SDM",
        source: "Kementerian Pendidikan Dasar dan Menengah & Ketenagakerjaan",
        datasetOrigin: "Sistem Informasi Ketenagakerjaan Terbuka",
        keyPoints: [
            "Kurikulum adaptif yang dikembangkan bersama industri teknologi terkemuka.",
            "Pemberian sertifikasi kompetensi gratis bagi generasi muda di daerah 3T.",
            "Penyaluran kerja langsung ke ekosistem industri digital dan manufaktur modern."
        ],
        defaultImage: "/images/guru.jpg"
    },
    {
        id: "dataset-pupuk-subsidi",
        title: "Modernisasi Sistem Penyaluran Pupuk Bersubsidi Berbasis Kartu Tani Terpadu",
        category: "Ketahanan Pangan",
        source: "Kementerian Pertanian & Pupuk Indonesia",
        datasetOrigin: "Satu Data Pangan Nasional",
        keyPoints: [
            "Penyederhanaan birokrasi tebus pupuk subsidi hanya menggunakan NIK terverifikasi.",
            "Pencegahan kebocoran distribusi melalui sistem geolokasi kios resmi pengecer.",
            "Peningkatan kuota pupuk organik untuk menjaga kesuburan tanah pertanian jangka panjang."
        ],
        defaultImage: "/images/pupuk.jpg"
    }
];

export function getCategoryCoverImage(category: string): string {
    const lower = category.toLowerCase();
    if (lower.includes("pangan") || lower.includes("tani")) return "/images/petani.jpg";
    if (lower.includes("infrastruktur") || lower.includes("transportasi")) return "/images/infrastruktur.jpg";
    if (lower.includes("pendidikan") || lower.includes("sdm") || lower.includes("vokasi")) return "/images/guru.jpg";
    if (lower.includes("anggaran") || lower.includes("kelola") || lower.includes("keuangan")) return "/images/rupiah.jpg";
    if (lower.includes("energi") || lower.includes("lingkungan") || lower.includes("surya")) return "/images/plts.webp";
    if (lower.includes("pupuk")) return "/images/pupuk.jpg";
    return "/images/infrastruktur.jpg";
}
