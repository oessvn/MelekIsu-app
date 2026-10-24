"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MessageSquare, ThumbsUp, ArrowRight, Send, AlertCircle } from "lucide-react";
import { newsDatabase } from "@/data/news"; // <-- Diletakkan di sini (baris atas)

export default function BeritaPage() {
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [newsData, setNewsData] = useState(newsDatabase); // <-- Menggunakan data dari file pusat
    const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

    // Filter berita berdasarkan kategori yang dipilih
    const filteredNews = useMemo(() => {
        return newsData.filter((item) => {
            const matchesCategory =
                selectedCategory === "Semua" || item.category === selectedCategory;
            return matchesCategory;
        });
    }, [newsData, selectedCategory]);

    // Handler untuk Like interaktif (hanya 1 kali, bisa toggle batalkan)
    const handleToggleLike = (id: string) => {
        setNewsData((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const currentIsLiked = (item as any).isLiked || false;
                    const newIsLiked = !currentIsLiked;
                    return {
                        ...item,
                        isLiked: newIsLiked,
                        likes: newIsLiked ? item.likes + 1 : item.likes - 1,
                    };
                }
                return item;
            })
        );
    };

    // Handler untuk submit komentar baru (maksimal 3 komentar)
    const handleAddComment = (id: string, e: React.FormEvent) => {
        e.preventDefault();
        const text = commentInputs[id]?.trim();
        if (!text) return;

        setNewsData((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    if (item.commentsList.length >= 3) {
                        alert("Batas kuota tercapai: Setiap warga maksimal memberikan 3 komentar berbobot per artikel.");
                        return item;
                    }
                    const newComment = {
                        id: `c-${Date.now()}`,
                        author: "Warga Terverifikasi",
                        text: text,
                    };
                    return {
                        ...item,
                        commentsList: [...item.commentsList, newComment],
                    };
                }
                return item;
            })
        );

        // Kosongkan input setelah dikirim
        setCommentInputs((prev) => ({ ...prev, [id]: "" }));
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] selection:bg-[#FDB659]/30">

            {/* Top Navigation Category Pills Section */}
            <section className="sticky top-20 z-40 bg-[#FFF8F5]/90 backdrop-blur-md border-b border-[#DEC0B3]/30 shadow-sm">
                <div className="max-w-[1360px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
                        {["Semua", "Infrastruktur Publik", "Ketahanan Pangan", "Pendidikan & Talenta", "Tata Kelola Publik"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${selectedCategory === cat
                                    ? "bg-[#9B4000] text-white shadow-md"
                                    : "bg-white text-[#574238] hover:bg-[#FFE3D1]"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Container */}
            <main className="max-w-[1360px] mx-auto px-6 py-8 flex flex-col gap-12">

                {/* Section Heading */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-6 bg-[#9B4000] rounded-full"></div>
                        <h1 className="text-xl font-extrabold text-[#28180C] tracking-tight">Semua Berita & Laporan Warga</h1>
                    </div>
                    <span className="text-xs text-[#574238] font-medium hidden sm:inline-block">Menampilkan arsip terkini</span>
                </div>

                {/* News Grid */}
                {filteredNews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {filteredNews.map((article) => {
                            const isCommentOpen = activeCommentBox === article.id;
                            const commentCount = article.commentsList.length;
                            const isLiked = (article as any).isLiked || false;

                            return (
                                <article
                                    key={article.id}
                                    className="flex flex-col justify-between bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#DEC0B3]/40 transition-all duration-300 group"
                                >
                                    <div>
                                        {/* Thumbnail */}
                                        {/* Thumbnail */}
                                        <div className="relative h-48 bg-gradient-to-tr from-[#F3D4c1] to-[#FFF8F5] flex items-center justify-center text-[#9B4000] overflow-hidden">
                                            {article.image ? (
                                                <img
                                                    src={article.image}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📄</span>
                                            )}
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className="bg-[#FDB659] text-[#724700] px-3 py-1 rounded-full text-[11px] font-bold uppercase shadow-xs">
                                                    {article.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex flex-col gap-2.5">
                                            <span className="text-[11px] font-bold text-[#8B7266] uppercase tracking-wider">{article.source}</span>
                                            <h2 className="text-base font-bold text-[#28180C] group-hover:text-[#9B4000] transition-colors line-clamp-2 leading-snug">
                                                {article.title}
                                            </h2>
                                            <p className="text-xs text-[#574238] line-clamp-2 leading-relaxed">
                                                {article.excerpt}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Interaksi Komentar */}
                                    <div className="px-5 pb-3">
                                        {isCommentOpen && (
                                            <div className="bg-[#FFF8F5] p-3 rounded-xl border border-[#DEC0B3]/40 mb-3 flex flex-col gap-2.5">
                                                <div className="flex items-center justify-between text-[11px] font-bold text-[#8B7266]">
                                                    <span>Diskusi Warga ({commentCount}/3 Kuota)</span>
                                                    {commentCount >= 3 && <span className="text-amber-700">Kuota Penuh</span>}
                                                </div>

                                                {/* List Komentar */}
                                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                    {article.commentsList.length === 0 ? (
                                                        <p className="text-[11px] text-[#8B7266] italic">Belum ada tanggapan. Jadilah yang pertama!</p>
                                                    ) : (
                                                        article.commentsList.map((c) => (
                                                            <div key={c.id} className="bg-white p-2 rounded-lg border border-[#DEC0B3]/30 text-[11px]">
                                                                <strong className="text-[#9B4000]">{c.author}: </strong>
                                                                <span className="text-[#28180C]">{c.text}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Form Input Komentar (jika belum 3) */}
                                                {commentCount < 3 ? (
                                                    <form onSubmit={(e) => handleAddComment(article.id, e)} className="flex items-center gap-1.5 mt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Tulis tanggapan berbobot..."
                                                            value={commentInputs[article.id] || ""}
                                                            onChange={(e) => setCommentInputs({ ...commentInputs, [article.id]: e.target.value })}
                                                            className="flex-1 bg-white px-3 py-1.5 text-xs rounded-lg border border-[#DEC0B3]/60 focus:outline-none focus:border-[#9B4000]"
                                                        />
                                                        <button type="submit" className="bg-[#9B4000] text-white p-1.5 rounded-lg hover:bg-[#8C4A1E]">
                                                            <Send className="w-3.5 h-3.5" />
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <div className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3 shrink-0" />
                                                        <span>Batas 3 komentar per artikel telah tercapai.</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Card */}
                                    <div className="p-5 pt-0 mt-auto flex items-center justify-between border-t border-[#DEC0B3]/20 pt-4 text-xs text-[#574238]">
                                        <div className="flex items-center gap-3">
                                            {/* Tombol Toggle Komentar */}
                                            <button
                                                onClick={() => setActiveCommentBox(isCommentOpen ? null : article.id)}
                                                className="flex items-center gap-1 hover:text-[#9B4000] transition-colors cursor-pointer"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 text-[#8B7266]" />
                                                <span>{commentCount}/3</span>
                                            </button>

                                            {/* Tombol Like Interaktif (Berubah warna & batas 1x klik) */}
                                            <button
                                                onClick={() => handleToggleLike(article.id)}
                                                className={`flex items-center gap-1.5 transition-all cursor-pointer px-2.5 py-1 rounded-full ${isLiked
                                                    ? "bg-[#FFDDC9] text-[#9B4000] font-bold shadow-xs"
                                                    : "hover:text-[#9B4000] text-[#574238]"
                                                    }`}
                                                title={isLiked ? "Batalkan Apresiasi" : "Beri Apresiasi"}
                                            >
                                                <ThumbsUp
                                                    className={`w-3.5 h-3.5 transition-colors ${isLiked ? "fill-[#9B4000] text-[#9B4000]" : "text-[#8B7266]"
                                                        }`}
                                                />
                                                <span>{article.likes}</span>
                                            </button>
                                        </div>

                                        <Link
                                            href={`/berita/${article.slug}`}
                                            className="text-xs text-[#9B4000] font-bold hover:text-[#8C4A1E] flex items-center gap-1"
                                        >
                                            <span>Baca</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-[#DEC0B3]/40">
                        <p className="text-base font-semibold text-[#574238]">Berita dalam kategori ini tidak ditemukan.</p>
                        <button
                            onClick={() => setSelectedCategory("Semua")}
                            className="mt-3 px-4 py-2 bg-[#9B4000] text-white text-xs font-bold rounded-xl"
                        >
                            Reset Kategori
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}