"use client";

import { useState, useEffect } from "react";
import { 
    Newspaper, 
    MessageSquare, 
    CheckCircle2, 
    Clock, 
    Plus, 
    Trash2, 
    RefreshCw,
    Image as ImageIcon,
    Upload,
    Link as LinkIcon,
    X,
    FileText
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { newsDatabase, NewsItem, NewsComment } from "@/data/news";

export default function AdminDashboardPage() {
    const supabase = createClient();

    // State Berita & Komentar
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [allComments, setAllComments] = useState<{ id: string; newsTitle: string; slug: string; author: string; authorEmail?: string; text: string; status: string }[]>([]);
    const [isDbConnected, setIsDbConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form Tambah Berita Baru
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newCategory, setNewCategory] = useState("Infrastruktur Publik");
    const [newSource, setNewSource] = useState("");
    const [newExcerpt, setNewExcerpt] = useState("");
    const [newContent, setNewContent] = useState("");
    const [newImageUrl, setNewImageUrl] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUploadType, setImageUploadType] = useState<"url" | "file">("file");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);

        try {
            // 1. Coba ambil dari Supabase
            const { data: dbNews, error: newsErr } = await supabase
                .from("news")
                .select("*")
                .order("created_at", { ascending: false });

            const { data: dbComments, error: commentErr } = await supabase
                .from("comments")
                .select("*")
                .order("created_at", { ascending: false });

            const hasDbNews = !newsErr && dbNews && dbNews.length > 0;
            const hasDbComments = !commentErr && dbComments && dbComments.length > 0;

            if (hasDbNews || hasDbComments) {
                setIsDbConnected(true);
                const combinedNewsList = hasDbNews ? dbNews : newsDatabase;
                setNewsList(combinedNewsList);

                const allAvailableNews = [...(dbNews || []), ...newsDatabase];
                const mappedComments = (dbComments || []).map((c) => {
                    const matchedNews = allAvailableNews.find((n) => n.slug === c.news_slug);
                    return {
                        id: c.id,
                        newsTitle: matchedNews ? matchedNews.title : c.news_slug,
                        slug: c.news_slug,
                        author: c.author,
                        authorEmail: c.author_email,
                        text: c.text,
                        status: c.status || "Menunggu Verifikasi",
                    };
                });
                setAllComments(mappedComments);
            } else {
                fallbackToLocal();
            }
        } catch (e) {
            fallbackToLocal();
        } finally {
            setIsLoading(false);
        }
    };

    const fallbackToLocal = () => {
        setIsDbConnected(false);
        const savedNews = localStorage.getItem("melekisu_custom_news");
        let currentNews: NewsItem[] = [...newsDatabase];
        if (savedNews) {
            try {
                const parsed = JSON.parse(savedNews);
                currentNews = [...parsed, ...newsDatabase];
            } catch {
                // ignore
            }
        }
        setNewsList(currentNews);

        const aggregated: any[] = [];
        currentNews.forEach((art) => {
            const storageKey = `comments_${art.slug}`;
            const savedComments = localStorage.getItem(storageKey);
            let comments: NewsComment[] = art.commentsList || [];
            if (savedComments) {
                try {
                    comments = JSON.parse(savedComments);
                } catch {}
            }
            comments.forEach((c) => {
                aggregated.push({
                    id: c.id,
                    newsTitle: art.title,
                    slug: art.slug,
                    author: c.author,
                    authorEmail: c.authorEmail,
                    text: c.text,
                    status: c.status || "Terverifikasi",
                });
            });
        });
        setAllComments(aggregated);
    };

    // Handler Setujui Komentar (Update status ke Terverifikasi)
    const handleVerifyComment = async (commentId: string, slug: string) => {
        if (isDbConnected) {
            const { error } = await supabase
                .from("comments")
                .update({ status: "Terverifikasi" })
                .eq("id", commentId);

            if (error) {
                alert("Gagal memverifikasi komentar di Supabase: " + error.message);
                return;
            }
        }

        // Sinkronkan juga cache localStorage jika ada
        const storageKey = `comments_${slug}`;
        const savedComments = localStorage.getItem(storageKey);
        if (savedComments) {
            try {
                const list: any[] = JSON.parse(savedComments);
                const updated = list.map((c) => c.id === commentId ? { ...c, status: "Terverifikasi" } : c);
                localStorage.setItem(storageKey, JSON.stringify(updated));
                window.dispatchEvent(new Event("storage"));
            } catch (e) {
                console.error(e);
            }
        }

        loadData();
    };

    // Handler Hapus Komentar
    const handleDeleteComment = async (commentId: string, slug: string) => {
        if (!confirm("Hapus masukan warga ini secara permanen?")) return;

        if (isDbConnected) {
            const { error } = await supabase
                .from("comments")
                .delete()
                .eq("id", commentId);

            if (error) {
                alert("Gagal menghapus komentar dari Supabase: " + error.message);
                return;
            }
        }

        // Hapus juga dari cache localStorage jika ada
        const storageKey = `comments_${slug}`;
        const savedComments = localStorage.getItem(storageKey);
        if (savedComments) {
            try {
                const list: any[] = JSON.parse(savedComments);
                const updated = list.filter((c) => c.id !== commentId);
                localStorage.setItem(storageKey, JSON.stringify(updated));
                window.dispatchEvent(new Event("storage"));
            } catch (e) {
                console.error(e);
            }
        }

        loadData();
    };

    // Handler pilih file gambar lokal
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validasi ukuran maks 3MB
            if (file.size > 3 * 1024 * 1024) {
                alert("Ukuran gambar maksimal 3MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                setNewImageUrl(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handler ganti input URL gambar
    const handleUrlChange = (val: string) => {
        setNewImageUrl(val);
        setImagePreview(val.trim() ? val : null);
    };

    const handleClearImage = () => {
        setNewImageUrl("");
        setImagePreview(null);
    };

    // Handler Tambah Berita Baru
    const handleCreateNews = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;
        setIsSubmitting(true);

        const slug = newTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        // Gambar bersifat opsional: jika kosong, gunakan gambar default elegan atau string kosong
        const finalImage = newImageUrl.trim() ? newImageUrl.trim() : "/images/infrastruktur.jpg";

        const newItem = {
            title: newTitle.trim(),
            slug: slug,
            category: newCategory,
            source: newSource.trim() || "Redaksi MelekIsu",
            excerpt: newExcerpt.trim() || newContent.slice(0, 140) + "...",
            content: newContent.trim(),
            date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            duration: "4 Menit Baca",
            likes: 0,
            image: finalImage,
        };

        if (isDbConnected) {
            const { error } = await supabase
                .from("news")
                .insert([newItem]);

            if (error) {
                alert("Gagal menambahkan berita ke database Supabase: " + error.message);
                setIsSubmitting(false);
                return;
            }
        } else {
            const existingCustom = localStorage.getItem("melekisu_custom_news");
            const customList = existingCustom ? JSON.parse(existingCustom) : [];
            localStorage.setItem("melekisu_custom_news", JSON.stringify([{ ...newItem, id: `n-${Date.now()}` }, ...customList]));
        }

        // Reset form
        setNewTitle("");
        setNewSource("");
        setNewExcerpt("");
        setNewContent("");
        setNewImageUrl("");
        setImagePreview(null);
        setShowAddModal(false);
        setIsSubmitting(false);
        loadData();
        alert("Berita baru berhasil diterbitkan!");
    };

    const pendingCommentsCount = allComments.filter((c) => c.status === "Menunggu Verifikasi").length;
    const verifiedCommentsCount = allComments.filter((c) => c.status === "Terverifikasi").length;

    return (
        <div className="space-y-10">
            {/* Header Dashboard & Status DB Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#28180C] tracking-tight">
                            Ringkasan Redaksi & Moderasi
                        </h1>
                        {isDbConnected ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Supabase Live DB
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200" title="Tabel SQL belum dibuat di Supabase, fallback ke local storage">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Penyimpanan Lokal (Fallback)
                            </span>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#73594B]">
                        Kelola publikasi berita, moderasi tanggapan warga, dan pantau statistik diskursus publik secara real-time.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                        onClick={loadData}
                        disabled={isLoading}
                        className="p-2.5 rounded-xl border border-[#DEC0B3]/70 hover:bg-white text-[#574238] transition-colors cursor-pointer"
                        title="Segarkan Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9B4000] to-[#B34B00] text-white text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Terbitkan Berita Baru</span>
                    </button>
                </div>
            </div>

            {/* Metrik Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-[#DEC0B3]/50 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-[#8B7266] uppercase tracking-wider block">Total Berita Aktif</span>
                        <h3 className="text-2xl font-extrabold text-[#28180C] mt-1">{newsList.length}</h3>
                        <span className="text-[11px] text-emerald-700 font-bold mt-1 inline-block">Tampil di Portal Warga</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center">
                        <Newspaper className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#DEC0B3]/50 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-[#8B7266] uppercase tracking-wider block">Total Masukan Warga</span>
                        <h3 className="text-2xl font-extrabold text-[#28180C] mt-1">{allComments.length}</h3>
                        <span className="text-[11px] text-emerald-700 font-bold mt-1 inline-block">Partisipasi Konstruktif</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#DEC0B3]/50 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Menunggu Verifikasi</span>
                        <h3 className="text-2xl font-extrabold text-amber-900 mt-1">{pendingCommentsCount}</h3>
                        <span className="text-[11px] text-amber-700 font-bold mt-1 inline-block">Butuh Persetujuan Admin</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#DEC0B3]/50 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Terverifikasi Publik</span>
                        <h3 className="text-2xl font-extrabold text-emerald-900 mt-1">{verifiedCommentsCount}</h3>
                        <span className="text-[11px] text-emerald-700 font-bold mt-1 inline-block">Telah Lolos Kurasi</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Section 1: Moderasi Masukan Warga */}
            <div id="moderasi-komentar" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DEC0B3]/50 shadow-xs space-y-6">
                <div className="border-b border-[#DEC0B3]/30 pb-4">
                    <h2 className="text-lg font-extrabold text-[#28180C] flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-700" />
                        <span>Antrean Moderasi Tanggapan Warga</span>
                    </h2>
                    <p className="text-xs text-[#73594B] mt-0.5">
                        Setujui tanggapan warga yang berkualitas dan bebas ujaran kebencian agar tampil di halaman baca artikel.
                    </p>
                </div>

                {allComments.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#8B7266]">
                        Belum ada tanggapan warga yang masuk.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {allComments.map((item) => {
                            const isPending = item.status === "Menunggu Verifikasi";
                            return (
                                <div 
                                    key={item.id} 
                                    className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                                        isPending ? "bg-amber-50/50 border-amber-200" : "bg-[#FFFDFB] border-[#DEC0B3]/40"
                                    }`}
                                >
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold text-[#28180C]">{item.author}</span>
                                            {item.authorEmail && (
                                                <span className="text-[10px] text-[#8B7266]">({item.authorEmail})</span>
                                            )}
                                            {isPending ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                                    <Clock className="w-3 h-3" /> Menunggu Verifikasi
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                    <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-[#574238] leading-relaxed">
                                            "{item.text}"
                                        </p>
                                        <span className="text-[10px] text-[#8B7266] block">
                                            Artikel: <strong className="text-[#9B4000]">{item.newsTitle}</strong>
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                                        {isPending && (
                                            <button
                                                onClick={() => handleVerifyComment(item.id, item.slug)}
                                                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Setujui</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteComment(item.id, item.slug)}
                                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Hapus</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Section 2: Kelola Berita Redaksi */}
            <div id="kelola-berita" className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DEC0B3]/50 shadow-xs space-y-6">
                <div className="border-b border-[#DEC0B3]/30 pb-4">
                    <h2 className="text-lg font-extrabold text-[#28180C] flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-[#9B4000]" />
                        <span>Daftar Publikasi Berita</span>
                    </h2>
                    <p className="text-xs text-[#73594B] mt-0.5">
                        Koleksi artikel berita aktif yang tersimpan dan dapat diakses publik.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#DEC0B3]/40 text-[#8B7266] uppercase text-[10px] tracking-wider">
                                <th className="pb-3 font-extrabold">Gambar</th>
                                <th className="pb-3 font-extrabold">Judul Berita</th>
                                <th className="pb-3 font-extrabold">Kategori</th>
                                <th className="pb-3 font-extrabold">Sumber</th>
                                <th className="pb-3 font-extrabold">Tanggal</th>
                                <th className="pb-3 font-extrabold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DEC0B3]/20">
                            {newsList.map((art) => (
                                <tr key={art.id} className="hover:bg-[#FFF8F5]/60 transition-colors">
                                    <td className="py-3 pr-3 w-16">
                                        <div className="w-12 h-10 rounded-lg bg-[#FFE3D1] overflow-hidden flex items-center justify-center text-[#9B4000] border border-[#DEC0B3]/50 shrink-0">
                                            {art.image ? (
                                                <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <FileText className="w-5 h-5 opacity-60" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3.5 pr-4">
                                        <span className="font-bold text-[#28180C] line-clamp-1">{art.title}</span>
                                        <span className="text-[10px] text-[#8B7266] block line-clamp-1">{art.excerpt}</span>
                                    </td>
                                    <td className="py-3.5 pr-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFE3D1] text-[#9B4000]">
                                            {art.category}
                                        </span>
                                    </td>
                                    <td className="py-3.5 pr-4 whitespace-nowrap text-[#574238] font-medium">
                                        {art.source}
                                    </td>
                                    <td className="py-3.5 pr-4 whitespace-nowrap text-[#8B7266]">
                                        {art.date}
                                    </td>
                                    <td className="py-3.5 text-right whitespace-nowrap">
                                        <a
                                            href={`/berita/${art.slug}`}
                                            target="_blank"
                                            className="text-[#9B4000] font-bold hover:underline"
                                        >
                                            Buka ↗
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah Berita Baru (Dengan Fitur Unggah Gambar Fleksibel) */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#DEC0B3]/40 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#DEC0B3]/30 pb-3">
                            <div>
                                <h3 className="text-lg font-extrabold text-[#28180C]">Terbitkan Berita Baru</h3>
                                <p className="text-[11px] text-[#8B7266]">Isi informasi artikel berita dan tambahkan gambar ilustrasi (opsional).</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600 font-bold p-1 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateNews} className="space-y-4 text-xs">
                            {/* Judul */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-[#28180C]">Judul Berita <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Contoh: Percepatan Transformasi Transportasi Publik Listrik 2026"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEC0B3]/70 focus:border-[#9B4000] focus:outline-none"
                                />
                            </div>

                            {/* Kategori & Sumber */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="font-bold text-[#28180C]">Kategori Berita</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEC0B3]/70 focus:border-[#9B4000] focus:outline-none bg-white"
                                    >
                                        <option value="Infrastruktur Publik">Infrastruktur Publik</option>
                                        <option value="Ketahanan Pangan">Ketahanan Pangan</option>
                                        <option value="Pendidikan & Talenta">Pendidikan & Talenta</option>
                                        <option value="Tata Kelola Publik">Tata Kelola Publik</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-bold text-[#28180C]">Sumber Rujukan / Instansi</label>
                                    <input
                                        type="text"
                                        value={newSource}
                                        onChange={(e) => setNewSource(e.target.value)}
                                        placeholder="Contoh: Humas Kementerian Perhubungan"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEC0B3]/70 focus:border-[#9B4000] focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Bagian Input Gambar Berita (Opsional) */}
                            <div className="space-y-2 p-4 rounded-2xl bg-[#FFF8F5] border border-[#DEC0B3]/60">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-[#28180C] flex items-center gap-1.5">
                                        <ImageIcon className="w-4 h-4 text-[#9B4000]" />
                                        <span>Gambar Sampul Berita</span>
                                        <span className="text-[10px] font-normal text-[#8B7266] italic">(Opsional - Boleh Dikosongkan)</span>
                                    </label>

                                    {/* Toggle Jenis Input */}
                                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#DEC0B3]/60 text-[10px] font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setImageUploadType("file")}
                                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                                imageUploadType === "file" ? "bg-[#9B4000] text-white" : "text-[#73594B]"
                                            }`}
                                        >
                                            Upload File
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageUploadType("url")}
                                            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                                                imageUploadType === "url" ? "bg-[#9B4000] text-white" : "text-[#73594B]"
                                            }`}
                                        >
                                            Link URL
                                        </button>
                                    </div>
                                </div>

                                {imageUploadType === "file" ? (
                                    <div className="flex items-center gap-3">
                                        <label className="flex-1 border-2 border-dashed border-[#DEC0B3] hover:border-[#9B4000] rounded-xl p-3 text-center cursor-pointer bg-white transition-colors">
                                            <Upload className="w-5 h-5 text-[#9B4000] mx-auto mb-1" />
                                            <span className="text-[11px] font-semibold text-[#574238] block">Klik untuk memilih gambar dari perangkat</span>
                                            <span className="text-[10px] text-[#8B7266] block">JPG, PNG, WEBP (Maksimal 3MB)</span>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFileChange} 
                                                className="hidden" 
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <LinkIcon className="w-3.5 h-3.5 text-[#8B7266] absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="url"
                                            value={newImageUrl}
                                            onChange={(e) => handleUrlChange(e.target.value)}
                                            placeholder="https://contoh.com/foto-berita.jpg"
                                            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#DEC0B3]/70 focus:border-[#9B4000] focus:outline-none bg-white text-xs"
                                        />
                                    </div>
                                )}

                                {/* Preview Gambar Jika Ada */}
                                {imagePreview && (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#DEC0B3] mt-2 group bg-black/5">
                                        <img src={imagePreview} alt="Preview Sampul" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={handleClearImage}
                                            className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full text-[10px] transition-colors cursor-pointer"
                                            title="Hapus gambar"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Ringkasan */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-[#28180C]">Ringkasan / Excerpt Singkat</label>
                                <input
                                    type="text"
                                    value={newExcerpt}
                                    onChange={(e) => setNewExcerpt(e.target.value)}
                                    placeholder="Deskripsi 1-2 kalimat untuk kartu berita..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEC0B3]/70 focus:border-[#9B4000] focus:outline-none"
                                />
                            </div>

                            {/* Isi Lengkap */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-[#28180C]">Isi Lengkap Berita <span className="text-red-500">*</span></label>
                                <textarea
                                    required
                                    rows={5}
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Tuliskan isi berita, konteks kebijakan, dan poin dampaknya bagi publik..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DEC0B3]/70 focus:border-[#9B4000] focus:outline-none"
                                />
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DEC0B3]/30">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 cursor-pointer"
                                >
                                    Batalkan
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-xl bg-[#9B4000] hover:bg-[#803500] text-white font-bold shadow-md cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? "Menerbitkan..." : "Terbitkan Sekarang"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
