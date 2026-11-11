"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
    MessageSquare,
    CheckCircle2,
    Clock,
    Building2,
    ArrowRight,
    FileText,
    Train,
    Sprout,
    GraduationCap,
    TrendingUp,
    BarChart3,
    ShieldCheck,
    Sparkles,
    Layers,
    Inbox
} from "lucide-react";
import {
    TransparencyAction,
    getTransparencyActions,
    computeTransparencyStats,
} from "@/lib/transparencyService";

function getAgencyIcon(agency: string) {
    const lower = (agency || "").toLowerCase();
    if (lower.includes("hubung") || lower.includes("kai") || lower.includes("kcic") || lower.includes("kereta") || lower.includes("bus") || lower.includes("transit")) return Train;
    if (lower.includes("tani") || lower.includes("pangan") || lower.includes("agr") || lower.includes("subang")) return Sprout;
    if (lower.includes("didik") || lower.includes("guru") || lower.includes("riset") || lower.includes("vokasi") || lower.includes("kampus")) return GraduationCap;
    if (lower.includes("keuangan") || lower.includes("pajak") || lower.includes("anggaran") || lower.includes("bpk")) return ShieldCheck;
    return Building2;
}

export default function TransparansiAksiPage() {
    const [actions, setActions] = useState<TransparencyAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("Semua");

    // Muat data transparansi aksi murni dari database Supabase
    useEffect(() => {
        let isMounted = true;
        async function load() {
            try {
                const list = await getTransparencyActions();
                if (isMounted) {
                    setActions(list);
                    setIsLoading(false);
                }
            } catch {
                if (isMounted) setIsLoading(false);
            }
        }
        load();

        const handleStorage = () => {
            load();
        };
        window.addEventListener("storage", handleStorage);
        return () => {
            isMounted = false;
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    // Statistik Murni dari Data Nyata (0 jika belum ada data, tanpa data palsu)
    const stats = useMemo(() => computeTransparencyStats(actions), [actions]);

    const filteredActions = useMemo(() => {
        return actions.filter((item) => {
            if (filterStatus === "Semua") return true;
            if (filterStatus === "Selesai" && item.statusType === "success") return true;
            if (filterStatus === "Progres" && item.statusType === "progress") return true;
            if (filterStatus === "Kajian" && item.statusType === "review") return true;
            return true;
        });
    }, [actions, filterStatus]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FFF8F5] via-[#FFF3EC] to-[#FFF8F5] text-[#28180C] selection:bg-[#FDB659]/30 pb-20">

            {/* Sticky Navigation Filter Bar */}
            <section className="sticky top-20 z-40 bg-[#FFF8F5]/80 backdrop-blur-xl border-b border-[#DEC0B3]/30 shadow-xs">
                <div className="max-w-[1360px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
                        {["Semua", "Selesai", "Progres", "Kajian"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                    filterStatus === status
                                        ? "bg-gradient-to-r from-[#9B4000] to-[#B34B00] text-white shadow-md scale-105"
                                        : "bg-white/80 text-[#574238] hover:bg-[#FFE3D1] border border-[#DEC0B3]/40"
                                }`}
                            >
                                {status === "Semua" && <Layers className="w-3.5 h-3.5" />}
                                {status === "Semua" ? "Semua Status Aksi" : status}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Container */}
            <main className="max-w-[1360px] mx-auto px-6 py-10 flex flex-col gap-10">

                {/* Header Section dengan Gaya Modern Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-[#FFF1E9] via-[#FFDDC9]/30 to-[#FFF8F5] border border-[#DEC0B3]/40 rounded-3xl p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#FDB659]/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-start gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-[#9B4000] text-white flex items-center justify-center shadow-md shrink-0">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#9B4000]/10 text-[#9B4000] mb-2">
                                <ShieldCheck className="w-3.5 h-3.5" /> Akuntabilitas Publik Terverifikasi
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#28180C] tracking-tight">
                                Transparansi Aksi & Tanggapan Instansi
                            </h1>
                            <p className="text-xs sm:text-sm text-[#574238] mt-1 max-w-2xl leading-relaxed">
                                Rekam jejak transparan atas tindak lanjut, solusi nyata, dan komitmen resmi lembaga pemerintahan terhadap aspirasi konstruktif warga.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 shrink-0 bg-white/80 backdrop-blur-md border border-[#DEC0B3]/40 px-5 py-3 rounded-2xl shadow-xs text-right hidden lg:block">
                        <span className="text-[11px] font-bold text-[#8B7266] uppercase tracking-wider block">Status Sinkronisasi</span>
                        <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5 mt-0.5 justify-end">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Terkoneksi Supabase
                        </span>
                    </div>
                </div>

                {/* Statistik & Grafik Visual Progress Penyelesaian Isu Murni Data Nyata */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Kartu Statistik Ringkas */}
                    <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-sm border border-[#DEC0B3]/50 flex flex-col justify-between relative overflow-hidden group hover:border-[#9B4000]/40 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFF1E9] rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-extrabold tracking-wider text-[#8B7266] uppercase">Total Tindak Lanjut Aksi</span>
                                <div className="p-2 rounded-xl bg-[#FFF1E9] text-[#9B4000]">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <h3 className="text-4xl font-extrabold text-[#28180C] tracking-tight mt-1">{stats.totalAspirasi}</h3>
                            <p className="text-xs text-[#8B7266] font-semibold mt-2 flex items-center gap-1">
                                {stats.totalAspirasi > 0 ? (
                                    <span className="text-emerald-700 font-bold">Data aksi terverifikasi aktif</span>
                                ) : (
                                    <span>Menunggu pencatatan aksi instansi</span>
                                )}
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-[#DEC0B3]/30 flex items-center justify-between text-xs font-medium text-[#574238]">
                            <span>Rata-rata Respon Instansi</span>
                            <span className="text-[#9B4000] font-bold">{stats.avgResponseDays}</span>
                        </div>
                    </div>

                    {/* Grafik Batang Visual Progres Penyelesaian Murni */}
                    <div className="lg:col-span-2 bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-sm border border-[#DEC0B3]/50 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="text-xs font-bold text-[#28180C] uppercase tracking-wider flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-[#FFF1E9] text-[#9B4000]">
                                    <BarChart3 className="w-4 h-4" />
                                </div>
                                Statistik Status Penyelesaian Isu Nasional
                            </h4>
                            <span className="text-[11px] font-semibold bg-[#FFF1E9] text-[#9B4000] px-3 py-1 rounded-full">
                                {stats.totalAspirasi > 0 ? "Akumulasi Data Nyata" : "0 Aksi Terdaftar"}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Bar 1: Selesai */}
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                    <span className="text-emerald-700 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Selesai Diterapkan ({stats.selesaiPercent}%)
                                    </span>
                                    <span className="text-[#574238]">{stats.selesaiCount} Isu</span>
                                </div>
                                <div className="w-full bg-[#FFF8F5] h-3 rounded-full overflow-hidden border border-[#DEC0B3]/30 p-0.5">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-xs"
                                        style={{ width: `${stats.selesaiPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Bar 2: Progres */}
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                    <span className="text-amber-700 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Dalam Progres ({stats.progresPercent}%)
                                    </span>
                                    <span className="text-[#574238]">{stats.progresCount} Isu</span>
                                </div>
                                <div className="w-full bg-[#FFF8F5] h-3 rounded-full overflow-hidden border border-[#DEC0B3]/30 p-0.5">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-700 shadow-xs"
                                        style={{ width: `${stats.progresPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Bar 3: Kajian */}
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                    <span className="text-blue-700 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Tahap Kajian Teknis ({stats.kajianPercent}%)
                                    </span>
                                    <span className="text-[#574238]">{stats.kajianCount} Isu</span>
                                </div>
                                <div className="w-full bg-[#FFF8F5] h-3 rounded-full overflow-hidden border border-[#DEC0B3]/30 p-0.5">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-700 shadow-xs"
                                        style={{ width: `${stats.kajianPercent}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* List of Actions / Responses */}
                {isLoading ? (
                    <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                        <div className="w-8 h-8 border-3 border-[#9B4000] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-[#8B7266] font-medium">Memuat data transparansi aksi publik...</span>
                    </div>
                ) : filteredActions.length === 0 ? (
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-10 sm:p-14 text-center border border-[#DEC0B3]/50 shadow-sm flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center shadow-xs">
                            <Inbox className="w-7 h-7" />
                        </div>
                        <h3 className="text-base font-extrabold text-[#28180C] mt-1">Belum Ada Rekam Jejak Aksi</h3>
                        <p className="text-xs sm:text-sm text-[#73594B] max-w-md leading-relaxed">
                            {filterStatus === "Semua"
                                ? "Data tindak lanjut resmi dari kementerian dan lembaga negara akan dikurasi dan dipublikasikan melalui panel admin tanpa angka atau data tiruan."
                                : `Belum ada aksi dengan status "${filterStatus}". Silakan periksa kategori status lainnya.`}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {filteredActions.map((item) => {
                            const AgencyIcon = getAgencyIcon(item.agency);
                            return (
                                <div
                                    key={item.id}
                                    className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-sm border border-[#DEC0B3]/50 flex flex-col gap-6 transition-all duration-300 hover:shadow-lg hover:border-[#9B4000]/40 group"
                                >
                                    {/* Header Card: Instansi & Status */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#DEC0B3]/30">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF1E9] to-[#FFDDC9]/50 flex items-center justify-center text-xl shrink-0 border border-[#DEC0B3]/40 shadow-xs group-hover:scale-105 transition-transform">
                                                <AgencyIcon className="w-6 h-6 text-[#9B4000]" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm sm:text-base font-extrabold text-[#28180C] flex items-center gap-2">
                                                    {item.agency}
                                                </h3>
                                                <span className="text-xs text-[#8B7266] mt-0.5 block">Dipublikasikan pada {item.date}</span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xs ${
                                            item.statusType === "success"
                                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                : item.statusType === "progress"
                                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                        }`}>
                                            {item.statusType === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                            {item.statusType === "progress" && <Clock className="w-4 h-4 text-amber-600 animate-spin" />}
                                            {item.statusType === "review" && <FileText className="w-4 h-4 text-blue-600" />}
                                            <span>{item.status}</span>
                                        </div>
                                    </div>

                                    {/* Referensi Berita Terkait */}
                                    {item.newsTitle && (
                                        <div className="bg-gradient-to-r from-[#FFF8F5] to-[#FFF3EC] p-4 rounded-2xl border border-[#DEC0B3]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:border-[#9B4000]/30">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="bg-[#9B4000] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0">
                                                    Berita Terkait
                                                </span>
                                                {item.newsSlug ? (
                                                    <Link href={`/berita/${item.newsSlug}`} className="text-xs sm:text-sm font-bold text-[#28180C] hover:text-[#9B4000] truncate transition-colors">
                                                        {item.newsTitle}
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs sm:text-sm font-bold text-[#28180C] truncate">
                                                        {item.newsTitle}
                                                    </span>
                                                )}
                                            </div>
                                            {item.newsSlug && (
                                                <Link href={`/berita/${item.newsSlug}`} className="shrink-0 text-xs text-[#9B4000] font-bold hover:underline flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#DEC0B3]/50 shadow-xs">
                                                    Baca Artikel <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            )}
                                        </div>
                                    )}

                                    {/* Grid Komparasi: Saran Warga vs Tanggapan Instansi */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">

                                        {/* Kolom Saran Warga */}
                                        <div className="bg-[#FFF1E9]/60 backdrop-blur-sm p-6 rounded-2xl border border-[#DEC0B3]/40 flex flex-col justify-between gap-4 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#9B4000]/60"></div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-xl bg-white text-[#9B4000] shadow-xs shrink-0 mt-0.5">
                                                    <MessageSquare className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[11px] font-extrabold text-[#8B7266] uppercase tracking-wider block mb-1.5">
                                                        Saran / Masukan dari {item.citizenName}
                                                    </span>
                                                    <p className="text-xs sm:text-sm text-[#28180C] leading-relaxed italic font-medium">
                                                        &ldquo;{item.citizenFeedback}&rdquo;
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Kolom Tanggapan Resmi Pemerintah */}
                                        <div className="bg-gradient-to-br from-white to-[#FFF8F5] p-6 rounded-2xl border-2 border-[#9B4000]/30 flex flex-col justify-between gap-4 shadow-xs relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#9B4000]"></div>
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-xl bg-[#9B4000] text-white shadow-sm shrink-0 mt-0.5">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="text-[11px] font-extrabold text-[#9B4000] uppercase tracking-wider block mb-1.5">
                                                        Tanggapan & Progres Resmi Instansi
                                                    </span>
                                                    <p className="text-xs sm:text-sm text-[#28180C] leading-relaxed font-semibold">
                                                        {item.officialResponse}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}

            </main>
        </div>
    );
}
