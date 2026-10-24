"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MessageSquare, CheckCircle2, Clock, Building2, ArrowRight, FileText } from "lucide-react";

// Data dummy tanggapan pemerintah & instansi atas saran warga
const actionTransparencyData = [
    {
        id: "act-1",
        agency: "Kementerian Perhubungan & KCIC",
        agencyLogo: "🚂",
        newsTitle: "Revolusi Mobilitas Berkelanjutan: Integrasi Transit Nol Emisi di Seluruh Koridor Urban 2025",
        newsSlug: "revolusi-mobilitas-berkelanjutan",
        citizenName: "Budi Santoso (Warga Terverifikasi)",
        citizenFeedback: "Saran agar jadwal feeder bus listrik di Stasiun Tegalluar disinkronkan langsung dengan kedatangan kereta cepat terakhir pukul 21:30 WIB untuk mencegah penumpukan.",
        officialResponse: "Terima kasih atas masukan konstruktifnya. Koordinasi lintas operator telah disepakati, mulai minggu depan armada bus listrik penjemput akan disiagakan 10 menit lebih awal dari jadwal kedatangan malam.",
        status: "Selesai Diterapkan",
        statusType: "success", // success, progress, review
        date: "19 Oktober 2025",
    },
    {
        id: "act-2",
        agency: "Kementerian Pertanian RI",
        agencyLogo: "🌾",
        newsTitle: "Digitalisasi Pertanian Rakyat: Meningkatkan Hasil Panen Mandiri di Sentra Produksi",
        newsSlug: "digitalisasi-pertanian-rakyat",
        citizenName: "Siti Rahmawati (Warga Terverifikasi)",
        citizenFeedback: "Mohon ada pelatihan offline bagi petani senior di Subang yang kesulitan mengoperasikan aplikasi sensor kelembaban berbasis smartphone.",
        officialResponse: "Menindaklanjuti masukan tersebut, Dinas Pertanian Kabupaten Subang bersama Tim Vokasi saat ini sedang menjadwalkan pendampingan langsung kelompok tani lapangan (Koryandal) mulai awal bulan depan.",
        status: "Sedang Berjalan (Progres 65%)",
        statusType: "progress",
        date: "18 Oktober 2025",
    },
    {
        id: "act-3",
        agency: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
        agencyLogo: "🎓",
        newsTitle: "Akselerasi Literasi AI & Coding untuk 50.000 Mahasiswa Vokasi Luar Jawa",
        slug: "akselerasi-literasi-ai",
        citizenName: "Ahmad Fauzi (Warga Terverifikasi)",
        citizenFeedback: "Apakah modul sertifikasi AI ini juga mencakup akses gratis ke infrastruktur komputasi cloud untuk mahasiswa politeknik di luar pulau Jawa?",
        officialResponse: "Kandungan kurikulum telah diperbarui mencakup fasilitas credit-voucher cloud computing bekerja sama dengan mitra industri teknologi global. Detail pendaftaran akan diumumkan melalui portal kampus masing-masing.",
        status: "Dalam Kajian Teknis",
        statusType: "review",
        date: "17 Oktober 2025",
    },
];

export default function TransparansiAksiPage() {
    const [filterStatus, setFilterStatus] = useState("Semua");

    // Filter berdasarkan status
    const filteredActions = useMemo(() => {
        return actionTransparencyData.filter((item) => {
            if (filterStatus === "Semua") return true;
            if (filterStatus === "Selesai" && item.statusType === "success") return true;
            if (filterStatus === "Progres" && item.statusType === "progress") return true;
            if (filterStatus === "Kajian" && item.statusType === "review") return true;
            return true;
        });
    }, [filterStatus]);

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] selection:bg-[#FDB659]/30">

            {/* Top Filter Bar (Disamakan persis dengan Beranda) */}
            <section className="sticky top-20 z-40 bg-[#FFF8F5]/90 backdrop-blur-md border-b border-[#DEC0B3]/30 shadow-sm">
                <div className="max-w-[1360px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
                        {["Semua", "Selesai", "Progres", "Kajian"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${filterStatus === status
                                    ? "bg-[#9B4000] text-white shadow-md"
                                    : "bg-white text-[#574238] hover:bg-[#FFE3D1]"
                                    }`}
                            >
                                {status === "Semua" ? "Semua Status Aksi" : status}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Container */}
            <main className="max-w-[1360px] mx-auto px-6 py-8 flex flex-col gap-10">

                {/* Section Heading */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-6 bg-[#9B4000] rounded-full"></div>
                        <div>
                            <h1 className="text-xl font-extrabold text-[#28180C] tracking-tight">Transparansi Aksi & Tanggapan Instansi</h1>
                            <p className="text-xs text-[#574238] mt-0.5">Rekam jejak tindak lanjut dan solusi resmi pemerintah atas saran warga pada berita kebijakan.</p>
                        </div>
                    </div>
                    <span className="text-xs bg-[#FFDDC9] text-[#724700] px-3 py-1 rounded-full font-bold hidden sm:inline-block">
                        Akuntabilitas Publik Terverifikasi
                    </span>
                </div>

                {/* List of Actions / Responses */}
                <div className="flex flex-col gap-6">
                    {filteredActions.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#DEC0B3]/40 flex flex-col gap-6 transition-all hover:shadow-md"
                        >
                            {/* Header Card: Instansi & Status */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#DEC0B3]/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#FFF1E9] flex items-center justify-center text-xl shrink-0 border border-[#DEC0B3]/40">
                                        {item.agencyLogo}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#28180C] flex items-center gap-1.5">
                                            <Building2 className="w-4 h-4 text-[#9B4000]" />
                                            {item.agency}
                                        </h3>
                                        <span className="text-[11px] text-[#8B7266]">Dipublikasikan pada {item.date}</span>
                                    </div>
                                </div>

                                {/* Status Badge */}
                                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${item.statusType === "success"
                                    ? "bg-green-100 text-green-800"
                                    : item.statusType === "progress"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}>
                                    {item.statusType === "success" && <CheckCircle2 className="w-3.5 h-3.5" />}
                                    {item.statusType === "progress" && <Clock className="w-3.5 h-3.5 animate-spin" />}
                                    {item.statusType === "review" && <FileText className="w-3.5 h-3.5" />}
                                    <span>{item.status}</span>
                                </div>
                            </div>

                            {/* Referensi Berita Terkait */}
                            <div className="bg-[#FFF8F5] p-3.5 rounded-xl border border-[#DEC0B3]/30 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-[#9B4000] shrink-0 font-bold text-xs uppercase tracking-wider">Berita Terkait:</span>
                                    <Link href={`/berita/${item.newsSlug}`} className="text-xs font-bold text-[#28180C] hover:text-[#9B4000] truncate transition-colors">
                                        {item.newsTitle}
                                    </Link>
                                </div>
                                <Link href={`/berita/${item.newsSlug}`} className="shrink-0 text-xs text-[#9B4000] font-bold hover:underline flex items-center gap-1">
                                    Lihat <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* Grid Saran Warga vs Tanggapan Pemerintah */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">

                                {/* Kolom Saran Warga */}
                                <div className="bg-[#FFF1E9]/50 p-5 rounded-xl border border-[#DEC0B3]/30 flex flex-col justify-between gap-3">
                                    <div className="flex items-start gap-2.5">
                                        <MessageSquare className="w-4 h-4 text-[#9B4000] shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-[11px] font-bold text-[#8B7266] uppercase tracking-wider block mb-1">
                                                Saran / Masukan dari {item.citizenName}
                                            </span>
                                            <p className="text-xs text-[#28180C] leading-relaxed italic">
                                                &quot;{item.citizenFeedback}&quot;
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Kolom Tanggapan Resmi Pemerintah */}
                                <div className="bg-white p-5 rounded-xl border-2 border-[#9B4000]/30 flex flex-col justify-between gap-3 shadow-xs">
                                    <div className="flex items-start gap-2.5">
                                        <CheckCircle2 className="w-4 h-4 text-[#9B4000] shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-[11px] font-bold text-[#9B4000] uppercase tracking-wider block mb-1">
                                                Tanggapan & Progres Resmi Instansi
                                            </span>
                                            <p className="text-xs text-[#28180C] leading-relaxed font-medium">
                                                {item.officialResponse}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}