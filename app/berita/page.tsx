"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ThumbsUp, ArrowRight, Send, AlertCircle, X, Search, FileText } from "lucide-react";
import { newsDatabase } from "@/data/news";

function BeritaContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [newsData, setNewsData] = useState(newsDatabase);
    const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
    const [keyword, setKeyword] = useState(searchQuery);
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Sinkronisasi data user dan komentar dari localStorage
    useEffect(() => {
        const syncData = () => {
            const activeUser = localStorage.getItem("current_user");
            if (activeUser) {
                try {
                    setCurrentUser(JSON.parse(activeUser));
                } catch {
                    setCurrentUser(null);
                }
            } else {
                setCurrentUser(null);
            }

            // Sinkronkan daftar komentar untuk setiap berita
            setNewsData((prev) =>
                prev.map((item) => {
                    const storageKey = `comments_${item.slug}`;
                    const saved = localStorage.getItem(storageKey);
                    if (saved) {
                        try {
                            return { ...item, commentsList: JSON.parse(saved) };
                        } catch {
                            return item;
                        }
                    }
                    return item;
                })
            );
        };

        syncData();
        setKeyword(searchQuery);
        window.addEventListener("storage", syncData);
        return () => window.removeEventListener("storage", syncData);
    }, [searchQuery]);

    const filteredNews = useMemo(() => {
        return newsData.filter((item) => {
            const matchesCategory =
                selectedCategory === "Semua" || item.category === selectedCategory;

            const matchesSearch =
                item.title.toLowerCase().includes(keyword.toLowerCase()) ||
                item.excerpt.toLowerCase().includes(keyword.toLowerCase()) ||
                item.content.toLowerCase().includes(keyword.toLowerCase()) ||
                item.source.toLowerCase().includes(keyword.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [newsData, selectedCategory, keyword]);

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

    // Handler untuk mengirim komentar (1 user hanya boleh 1 komentar per artikel)
    const handleAddComment = (id: string, e: React.FormEvent) => {
        e.preventDefault();

        // Cek apakah user sudah login
        if (!currentUser) {
            alert("Silakan Masuk atau Daftar terlebih dahulu untuk berpartisipasi dalam diskusi warga.");
            return;
        }

        const text = commentInputs[id]?.trim();
        if (!text) return;

        const targetArticle = newsData.find((item) => item.id === id);
        if (!targetArticle) return;

        // Cek apakah user ini sudah pernah berkomentar di artikel ini
        const hasCommented = targetArticle.commentsList.some(
            (c: any) => c.authorEmail === currentUser.emailOrPhone || c.author === currentUser.fullName
        );

        if (hasCommented) {
            alert("Batas kuota tercapai: Anda sudah mengirimkan 1 komentar pada artikel ini. Berikan kesempatan kepada warga lainnya!");
            return;
        }

        // Alert konfirmasi perhatian sebelum mengirim
        const confirmSend = window.confirm(
            "Perhatian: Setiap warga hanya dapat mengirimkan 1 komentar per artikel dan tidak dapat diubah kembali. Pastikan tanggapan Anda sudah berbobot. Lanjutkan kirim?"
        );

        if (!confirmSend) return;

        setNewsData((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newComment = {
                        id: `c-${Date.now()}`,
                        author: currentUser.fullName,
                        authorEmail: currentUser.emailOrPhone,
                        text: text,
                        status: "Menunggu Verifikasi" as const,
                    };
                    const updatedList = [...item.commentsList, newComment];
                    const storageKey = `comments_${item.slug}`;
                    localStorage.setItem(storageKey, JSON.stringify(updatedList));
                    window.dispatchEvent(new Event("storage"));
                    return {
                        ...item,
                        commentsList: updatedList,
                    };
                }
                return item;
            })
        );

        // Kosongkan input setelah terkirim
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
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm cursor-pointer ${selectedCategory === cat
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

                {/* Section Heading & Search Keyword Indicator */}
                <div className="flex flex-col gap-3 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-6 bg-[#9B4000] rounded-full"></div>
                            <h1 className="text-xl font-extrabold text-[#28180C] tracking-tight">Semua Berita & Laporan Warga</h1>
                        </div>
                        <span className="text-xs text-[#574238] font-medium hidden sm:inline-block">Menampilkan arsip terkini</span>
                    </div>

                    {keyword && (
                        <div className="flex items-center gap-2 bg-[#FFF1E9] border border-[#DEC0B3]/60 px-4 py-2 rounded-xl w-fit">
                            <span className="text-xs text-[#574238]">
                                Hasil pencarian untuk: <strong className="text-[#9B4000]">"{keyword}"</strong>
                            </span>
                            <button
                                onClick={() => setKeyword("")}
                                className="text-[#9B4000] hover:text-[#28180C] cursor-pointer"
                                title="Reset Pencarian"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* News Grid */}
                {filteredNews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                        {filteredNews.map((article) => {
                            const isCommentOpen = activeCommentBox === article.id;
                            const commentCount = article.commentsList.length; // Angka real-time jumlah komentar
                            const isLiked = (article as any).isLiked || false;

                            // Cek apakah user yang sedang login sudah pernah berkomentar di artikel ini
                            const userAlreadyCommented = currentUser
                                ? article.commentsList.some(
                                    (c: any) => c.authorEmail === currentUser.emailOrPhone || c.author === currentUser.fullName
                                )
                                : false;

                            return (
                                <article
                                    key={article.id}
                                    className="flex flex-col justify-between bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#DEC0B3]/40 transition-all duration-300 group"
                                >
                                    <div>
                                        {/* Thumbnail */}
                                        <div className="relative h-48 bg-gradient-to-tr from-[#F3D4c1] to-[#FFF8F5] flex items-center justify-center text-[#9B4000] overflow-hidden">
                                            {article.image ? (
                                                <img
                                                    src={article.image}
                                                    alt={article.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <FileText className="w-10 h-10 text-[#9B4000] opacity-60 group-hover:scale-110 transition-transform duration-300" />
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
                                                    <span>Diskusi Warga ({commentCount} Komentar Masuk)</span>
                                                </div>

                                                {/* List Komentar */}
                                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                    {article.commentsList.length === 0 ? (
                                                        <p className="text-[11px] text-[#8B7266] italic">Belum ada tanggapan. Jadilah warga pertama yang berkomentar!</p>
                                                    ) : (
                                                        article.commentsList.map((c: any) => (
                                                            <div key={c.id} className="bg-white p-2 rounded-lg border border-[#DEC0B3]/30 text-[11px]">
                                                                <strong className="text-[#9B4000]">{c.author}: </strong>
                                                                <span className="text-[#28180C]">{c.text}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Form Input Komentar Berdasarkan Status User */}
                                                {!currentUser ? (
                                                    <div className="text-[11px] text-[#9B4000] bg-white p-2 rounded-lg border border-[#DEC0B3]/50 text-center font-bold">
                                                        <Link href="/masuk" className="underline">Masuk</Link> untuk mengirim 1 komentar berbobot Anda.
                                                    </div>
                                                ) : userAlreadyCommented ? (
                                                    <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg flex items-center gap-1.5 border border-amber-200">
                                                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                                                        <span>Anda sudah mengirimkan 1 komentar pada artikel ini. Terima kasih atas partisipasinya!</span>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={(e) => handleAddComment(article.id, e)} className="flex items-center gap-1.5 mt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Tulis 1 tanggapan berbobot Anda..."
                                                            value={commentInputs[article.id] || ""}
                                                            onChange={(e) => setCommentInputs({ ...commentInputs, [article.id]: e.target.value })}
                                                            className="flex-1 bg-white px-3 py-1.5 text-xs rounded-lg border border-[#DEC0B3]/60 focus:outline-none focus:border-[#9B4000]"
                                                        />
                                                        <button type="submit" className="bg-[#9B4000] text-white p-1.5 rounded-lg hover:bg-[#8C4A1E] cursor-pointer" title="Kirim Komentar">
                                                            <Send className="w-3.5 h-3.5" />
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Card */}
                                    <div className="p-5 pt-0 mt-auto flex items-center justify-between border-t border-[#DEC0B3]/20 pt-4 text-xs text-[#574238]">
                                        <div className="flex items-center gap-3">
                                            {/* Tombol Toggle Komentar dengan Angka Real-Time */}
                                            <button
                                                onClick={() => setActiveCommentBox(isCommentOpen ? null : article.id)}
                                                className="flex items-center gap-1 hover:text-[#9B4000] transition-colors cursor-pointer"
                                                title="Lihat Diskusi Komentar"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 text-[#8B7266]" />
                                                <span className="font-bold text-[#28180C]">{commentCount}</span>
                                            </button>

                                            {/* Tombol Like Interaktif */}
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
                    <div className="text-center py-16 bg-white rounded-3xl border border-[#DEC0B3]/40 flex flex-col items-center gap-3">
                        <Search className="w-10 h-10 text-[#8B7266]" />
                        <h3 className="text-base font-bold text-[#28180C]">Berita Tidak Ditemukan</h3>
                        <p className="text-xs text-[#574238]">
                            Tidak ada artikel yang cocok dengan kata kunci <strong className="text-[#9B4000]">"{keyword}"</strong>.
                        </p>
                        <button
                            onClick={() => {
                                setKeyword("");
                                setSelectedCategory("Semua");
                            }}
                            className="mt-2 px-4 py-2 bg-[#9B4000] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#8C4A1E]"
                        >
                            Reset Filter & Pencarian
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}

export default function BeritaPage() { return (<Suspense fallback={<div className="min-h-screen bg-[#FFF8F5]" />}><BeritaContent /></Suspense>); }

