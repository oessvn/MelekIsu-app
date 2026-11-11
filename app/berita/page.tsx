"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageSquare, ThumbsUp, ArrowRight, Send, AlertCircle, Search, FileText, CheckCircle2, Bot, Sparkles, ArrowUpDown } from "lucide-react";
import { getCombinedNews, sendComment, getCommentsForSlug, isTextViolating } from "@/lib/newsService";
import { NewsItem } from "@/data/news";
import { createClient } from "@/lib/supabase/client";

function matchCategory(itemCategory: string, selected: string): boolean {
    if (selected === "Semua") return true;
    if (!itemCategory) return false;
    const cat = itemCategory.toLowerCase().trim();
    const sel = selected.toLowerCase().trim();
    if (cat === sel) return true;
    if (sel.includes("infrastruktur") && cat.includes("infrastruktur")) return true;
    if (sel.includes("pangan") && cat.includes("pangan")) return true;
    if ((sel.includes("pendidikan") || sel.includes("talenta") || sel.includes("sdm")) && 
        (cat.includes("pendidikan") || cat.includes("talenta") || cat.includes("sdm"))) return true;
    if ((sel.includes("tata kelola") || sel.includes("transparansi")) && 
        (cat.includes("tata kelola") || cat.includes("transparansi"))) return true;
    if ((sel.includes("energi") || sel.includes("lingkungan")) && 
        (cat.includes("energi") || cat.includes("lingkungan"))) return true;
    if ((sel.includes("digital") || sel.includes("teknologi")) && 
        (cat.includes("digital") || cat.includes("teknologi"))) return true;
    return cat.includes(sel) || sel.includes(cat);
}

function parseNewsTimestamp(item: NewsItem): number {
    if ((item as any).createdAt) {
        const time = new Date((item as any).createdAt).getTime();
        if (!isNaN(time)) return time;
    }
    if (item.date) {
        const str = item.date.trim();
        const parts = str.split(/\s+/);
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const monthStr = parts[1].toLowerCase();
            const year = parseInt(parts[2], 10);
            const months: Record<string, number> = {
                januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
                juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
            };
            if (!isNaN(day) && !isNaN(year) && months[monthStr] !== undefined) {
                return new Date(year, months[monthStr], day).getTime();
            }
        }
        const time = new Date(str).getTime();
        if (!isNaN(time)) return time;
    }
    const numId = parseInt(item.id, 10);
    return !isNaN(numId) ? numId : 0;
}

function BeritaContent() {
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [sortBy, setSortBy] = useState<"terbaru" | "populer" | "diskusi">("terbaru");
    const [newsData, setNewsData] = useState<NewsItem[]>([]);
    const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
    const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
    const [keyword, setKeyword] = useState(searchQuery);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // State untuk Modal Kustom Elegan
    const [pendingSubmit, setPendingSubmit] = useState<{ articleId: string; text: string; articleSlug: string } | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userAlert, setUserAlert] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "info" | "error" | "success";
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
    });
    const [moderationFeedback, setModerationFeedback] = useState<{
        approved: boolean;
        status: string;
        reason: string;
        sentiment?: string;
    } | null>(null);

    // Sinkronisasi data berita dinamis & user
    useEffect(() => {
        const syncData = async () => {
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

            const allNews = await getCombinedNews();
            const userKey = activeUser ? (JSON.parse(activeUser).emailOrPhone || JSON.parse(activeUser).id || "guest") : "guest";
            let likedList: string[] = [];
            try {
                const raw = localStorage.getItem(`melekisu_liked_articles_${userKey}`);
                if (raw) likedList = JSON.parse(raw);
            } catch {}

            const mapped = await Promise.all(
                allNews.map(async (item) => {
                    const comments = await getCommentsForSlug(item.slug);
                    return { 
                        ...item, 
                        commentsList: comments,
                        isLiked: likedList.includes(item.slug) || likedList.includes(item.id)
                    };
                })
            );

            setNewsData(mapped);
            setIsLoading(false);
        };

        syncData();
        setKeyword(searchQuery);
        window.addEventListener("storage", syncData);
        return () => window.removeEventListener("storage", syncData);
    }, [searchQuery]);

    const availableCategories = useMemo(() => {
        const base = [
            "Semua",
            "Infrastruktur Publik",
            "Ketahanan Pangan",
            "Pendidikan & Talenta",
            "Tata Kelola Publik",
            "Energi & Lingkungan"
        ];
        newsData.forEach((item) => {
            if (item.category && !base.some((b) => matchCategory(item.category, b))) {
                base.push(item.category);
            }
        });
        return base;
    }, [newsData]);

    const filteredNews = useMemo(() => {
        const filtered = newsData.filter((item) => {
            const matchesCategory = matchCategory(item.category, selectedCategory);

            const matchesSearch =
                item.title.toLowerCase().includes(keyword.toLowerCase()) ||
                item.excerpt.toLowerCase().includes(keyword.toLowerCase()) ||
                item.content.toLowerCase().includes(keyword.toLowerCase()) ||
                item.source.toLowerCase().includes(keyword.toLowerCase());

            return matchesCategory && matchesSearch;
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === "populer") {
                const diff = (b.likes || 0) - (a.likes || 0);
                if (diff !== 0) return diff;
            }
            if (sortBy === "diskusi") {
                const diff = (b.commentsList?.length || 0) - (a.commentsList?.length || 0);
                if (diff !== 0) return diff;
            }
            // Default "terbaru" atau tie-breaker untuk populer & diskusi
            const timeDiff = parseNewsTimestamp(b) - parseNewsTimestamp(a);
            if (timeDiff !== 0) return timeDiff;
            return String(b.id || "").localeCompare(String(a.id || ""));
        });
    }, [newsData, selectedCategory, keyword, sortBy]);

    const handleToggleLike = async (id: string) => {
        const userKey = currentUser?.emailOrPhone || currentUser?.id || "guest";
        const storageKey = `melekisu_liked_articles_${userKey}`;
        let likedList: string[] = [];
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) likedList = JSON.parse(raw);
        } catch {}

        const targetItem = newsData.find((item) => item.id === id);
        if (!targetItem) return;

        const currentIsLiked = (targetItem as any).isLiked || false;
        const newIsLiked = !currentIsLiked;
        const newLikesCount = newIsLiked ? targetItem.likes + 1 : Math.max(0, targetItem.likes - 1);

        if (newIsLiked) {
            if (!likedList.includes(targetItem.slug)) likedList.push(targetItem.slug);
        } else {
            likedList = likedList.filter((s) => s !== targetItem.slug && s !== targetItem.id);
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(likedList));
            localStorage.setItem("melekisu_liked_articles_all", JSON.stringify(likedList));
            window.dispatchEvent(new Event("storage"));
        } catch {}

        setNewsData((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    return {
                        ...item,
                        isLiked: newIsLiked,
                        likes: newLikesCount,
                    };
                }
                return item;
            })
        );

        try {
            const supabase = createClient();
            await supabase.from("news").update({ likes: newLikesCount }).eq("slug", targetItem.slug);
        } catch {}
    };

    // Handler validasi sebelum memicu modal kustom
    const handleInitialCommentSubmit = (id: string, e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            setUserAlert({
                isOpen: true,
                title: "Akses Terbatas",
                message: "Silakan Masuk atau Daftar terlebih dahulu untuk berpartisipasi dalam diskusi warga.",
                type: "info",
            });
            return;
        }

        const text = commentInputs[id]?.trim();
        if (!text) return;

        const targetArticle = newsData.find((item) => item.id === id);
        if (!targetArticle) return;

        const hasCommented = (targetArticle.commentsList || []).some(
            (c: any) => c.authorEmail === currentUser.emailOrPhone || c.author === currentUser.fullName
        );

        if (hasCommented) {
            setUserAlert({
                isOpen: true,
                title: "Batas Kuota Tercapai",
                message: "Anda sudah mengirimkan 1 komentar pada artikel ini. Tiap warga dibatasi 1 masukan per artikel agar ruang diskusi publik berimbang.",
                type: "info",
            });
            return;
        }

        // Buka modal kustom bergaya MelekIsu
        setPendingSubmit({
            articleId: id,
            articleSlug: targetArticle.slug,
            text: text,
        });
    };

    // Handler eksekusi konfirmasi kirim dari modal kustom
    const handleConfirmCommentSend = async () => {
        if (!pendingSubmit || !currentUser) return;

        setIsSubmitting(true);
        const { articleId, articleSlug, text } = pendingSubmit;
        const targetArticle = newsData.find((item) => item.id === articleId);

        try {
            const newComment = await sendComment(
                articleSlug,
                currentUser.fullName,
                currentUser.emailOrPhone || "",
                text,
                targetArticle?.title,
                targetArticle?.excerpt,
                targetArticle?.content
            );

            const mod = (newComment as any).moderation;
            const isApproved = newComment.status === "Terverifikasi";

            setModerationFeedback(mod || {
                approved: isApproved,
                status: newComment.status || "Terverifikasi",
                reason: newComment.aiReason || "Tanggapan telah diproses sistem."
            });

            if (isApproved || newComment.status === "Menunggu Verifikasi") {
                setNewsData((prev) =>
                    prev.map((item) => {
                        if (item.id === articleId) {
                            const updatedList = [...(item.commentsList || []), newComment];
                            return {
                                ...item,
                                commentsList: updatedList,
                            };
                        }
                        return item;
                    })
                );
                setCommentInputs((prev) => ({ ...prev, [articleId]: "" }));
            }

            setPendingSubmit(null);
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Gagal mengirim tanggapan:", err);
            setUserAlert({
                isOpen: true,
                title: "Kendala Pengiriman",
                message: "Terjadi kendala saat mengirim tanggapan. Silakan coba kembali dalam beberapa saat.",
                type: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] selection:bg-[#FDB659]/30">
            {/* Top Navigation Category Pills Section */}
            <section className="sticky top-20 z-40 bg-[#FFF8F5]/90 backdrop-blur-md border-b border-[#DEC0B3]/30 shadow-sm">
                <div className="max-w-[1360px] mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
                        {availableCategories.map((cat) => (
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

            {/* Main Content */}
            <main className="max-w-[1360px] mx-auto px-6 py-8 flex flex-col gap-8">
                {/* Header Title & Live Counter */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#DEC0B3]/30 pb-6 gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-[#FFE3D1] text-[#9B4000] mb-2 uppercase tracking-wider">
                            Katalog Informasi Publik
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#28180C] tracking-tight">
                            Indeks Berita & Wacana Warga
                        </h1>
                        <p className="text-xs sm:text-sm text-[#574238] mt-1">
                            Akses berita terpercaya, pantau transparansi data, dan suarakan masukan konstruktif Anda.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Selector Pengurutan (Sorting) */}
                        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-[#DEC0B3]/60 text-xs shadow-xs">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#9B4000]" />
                            <span className="text-[11px] font-bold text-[#8B7266]">Urutkan:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="bg-transparent font-extrabold text-[#28180C] focus:outline-none cursor-pointer"
                            >
                                <option value="terbaru">Terbaru</option>
                                <option value="populer">Paling Banyak Diapresiasi</option>
                                <option value="diskusi">Paling Banyak Tanggapan</option>
                            </select>
                        </div>

                        <span className="text-xs font-bold text-[#8B7266]">
                            Menampilkan <strong className="text-[#9B4000]">{filteredNews.length}</strong> artikel
                        </span>
                    </div>
                </div>

                {/* News Grid */}
                {isLoading ? (
                    <div className="text-center py-20 text-[#9B4000] flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-3 border-[#9B4000] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-bold uppercase tracking-wider">Memuat Katalog Berita...</span>
                    </div>
                ) : filteredNews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                        {filteredNews.map((article) => {
                            const isCommentOpen = activeCommentBox === article.id;
                            const isLiked = (article as any).isLiked || false;

                            const isAuthorOfComment = (c: any) => {
                                if (!currentUser) return false;
                                if (currentUser.emailOrPhone && c.authorEmail && c.authorEmail.toLowerCase() === currentUser.emailOrPhone.toLowerCase()) return true;
                                if (currentUser.fullName && c.author && c.author.toLowerCase() === currentUser.fullName.toLowerCase()) return true;
                                return false;
                            };

                            const visibleComments = (article.commentsList || []).filter((c: any) => {
                                if (c.status === "Ditolak" || isTextViolating(c.text || "").violated) return false;
                                if (c.status === "Terverifikasi") return true;
                                if (isAuthorOfComment(c)) return true;
                                return false;
                            });
                            const commentCount = visibleComments.length;

                            const userAlreadyCommented = currentUser
                                ? (article.commentsList || []).some(
                                    (c: any) =>
                                        c.status === "Terverifikasi" &&
                                        !isTextViolating(c.text || "").violated &&
                                        (c.authorEmail === currentUser.emailOrPhone || c.author === currentUser.fullName)
                                )
                                : false;

                            return (
                                <article
                                    key={article.id}
                                    className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#DEC0B3]/40 transition-all duration-300 group"
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
                                                    <span>Diskusi Warga ({commentCount} Masukan)</span>
                                                </div>

                                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                    {visibleComments.length === 0 ? (
                                                        <p className="text-[11px] text-[#8B7266] italic">Belum ada tanggapan warga.</p>
                                                    ) : (
                                                        visibleComments.map((c: any) => {
                                                            const isPending = c.status === "Menunggu Verifikasi";
                                                            return (
                                                                <div
                                                                    key={c.id}
                                                                    className={`p-2 rounded-lg border text-[11px] ${isPending
                                                                            ? "bg-amber-50/50 border-amber-200"
                                                                            : "bg-white border-[#DEC0B3]/30"
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between gap-1 mb-0.5">
                                                                        <strong className="text-[#9B4000]">{c.author}</strong>
                                                                        {isPending && (
                                                                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                                                                                Menunggu Verifikasi (Hanya Anda)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[#28180C]">{c.text}</span>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>

                                                {!currentUser ? (
                                                    <div className="text-[11px] text-[#9B4000] bg-white p-2 rounded-lg border border-[#DEC0B3]/50 text-center font-bold">
                                                        <Link href="/masuk" className="underline">Masuk</Link> untuk mengirim tanggapan.
                                                    </div>
                                                ) : userAlreadyCommented ? (
                                                    <div className="text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg flex items-center gap-1.5 border border-amber-200">
                                                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                                                        <span>Anda sudah menggunakan kuota 1 komentar pada artikel ini.</span>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={(e) => handleInitialCommentSubmit(article.id, e)} className="flex items-center gap-1.5 mt-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Tulis 1 masukan berbobot Anda..."
                                                            value={commentInputs[article.id] || ""}
                                                            onChange={(e) => setCommentInputs({ ...commentInputs, [article.id]: e.target.value })}
                                                            className="flex-1 bg-white px-3 py-1.5 text-xs rounded-lg border border-[#DEC0B3]/60 focus:outline-none focus:border-[#9B4000]"
                                                        />
                                                        <button type="submit" className="bg-[#9B4000] text-white p-1.5 rounded-lg hover:bg-[#8C4A1E] cursor-pointer" title="Kirim">
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
                                            <button
                                                onClick={() => setActiveCommentBox(isCommentOpen ? null : article.id)}
                                                className="flex items-center gap-1 hover:text-[#9B4000] transition-colors cursor-pointer"
                                                title="Lihat Komentar"
                                            >
                                                <MessageSquare className="w-3.5 h-3.5 text-[#8B7266]" />
                                                <span className="font-bold text-[#28180C]">{commentCount}</span>
                                            </button>

                                            <button
                                                onClick={() => handleToggleLike(article.id)}
                                                className={`flex items-center gap-1.5 transition-all cursor-pointer px-2.5 py-1 rounded-full ${isLiked
                                                        ? "bg-[#FFDDC9] text-[#9B4000] font-bold shadow-xs"
                                                        : "hover:text-[#9B4000] text-[#574238]"
                                                    }`}
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

            {/* Modal Kustom Konfirmasi Pengiriman dengan AI Moderation */}
            {pendingSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#DEC0B3]/40 flex flex-col items-center text-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center shadow-inner">
                            <Bot className="w-9 h-9 text-[#9B4000]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-extrabold text-[#28180C]">Verifikasi Otomatis AI</h3>
                            <p className="text-xs sm:text-sm text-[#574238] leading-relaxed">
                                Tanggapan Anda akan <strong className="text-[#9B4000]">diverifikasi secara otomatis oleh AI MelekIsu</strong>. Jika memenuhi etika dan kesantunan diskursus publik, tanggapan Anda akan langsung terbit ke publik. Lanjutkan kirim?
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full pt-2">
                            <button
                                onClick={() => setPendingSubmit(null)}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Periksa Lagi
                            </button>
                            <button
                                onClick={handleConfirmCommentSend}
                                disabled={isSubmitting}
                                className="flex-1 py-3 px-4 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>AI Memverifikasi...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-3.5 h-3.5" />
                                        <span>Kirim & Verifikasi AI</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Kustom Hasil Verifikasi AI */}
            {showSuccessModal && moderationFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#DEC0B3]/40 flex flex-col items-center text-center gap-5">
                        {moderationFeedback.approved ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-100">
                                    <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                                </div>
                                <div className="space-y-2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <Bot className="w-3.5 h-3.5" />
                                        <span>Lolos Kurasi Otomatis AI</span>
                                    </span>
                                    <h3 className="text-xl font-extrabold text-[#28180C]">Tanggapan Terverifikasi & Terbit!</h3>
                                    <p className="text-xs sm:text-sm text-[#574238] leading-relaxed">
                                        Terima kasih atas partisipasi Anda. Tanggapan Anda dinilai memenuhi standar kesantunan publik oleh AI MelekIsu sehingga langsung dapat dibaca oleh seluruh warga.
                                    </p>
                                    {moderationFeedback.reason && (
                                        <div className="mt-2 p-3 bg-[#FFF8F5] rounded-xl border border-[#DEC0B3]/40 text-left text-xs text-[#574238]">
                                            <strong className="text-[#9B4000] block mb-0.5">Analisis Kurasi AI:</strong>
                                            <span>{moderationFeedback.reason}</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full mt-2 py-3 px-5 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    Selesai & Lihat Diskusi
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner border border-rose-100">
                                    <AlertCircle className="w-9 h-9 text-rose-600" />
                                </div>
                                <div className="space-y-2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                        <Bot className="w-3.5 h-3.5" />
                                        <span>Kurasi AI: Belum Memenuhi Syarat</span>
                                    </span>
                                    <h3 className="text-xl font-extrabold text-[#28180C]">Tanggapan Ditolak Sistem</h3>
                                    <p className="text-xs sm:text-sm text-[#574238] leading-relaxed">
                                        Sistem kurasi otomatis mendeteksi bahwa masukan Anda belum memenuhi panduan komunitas MelekIsu.
                                    </p>
                                    {moderationFeedback.reason && (
                                        <div className="mt-2 p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-left text-xs text-rose-900">
                                            <strong className="text-rose-700 block mb-0.5">Alasan Kurasi:</strong>
                                            <span>{moderationFeedback.reason}</span>
                                        </div>
                                    )}
                                    <p className="text-[11px] text-[#8B7266] italic mt-2">
                                        *Kuota Anda belum terpotong. Silakan perbaiki kalimat Anda agar lebih konstruktif dan sopan.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full mt-2 py-3 px-5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                                >
                                    Perbaiki Kalimat
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Dialog Kustom Notifikasi Pengguna */}
            {userAlert.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#DEC0B3]/40 flex flex-col items-center text-center gap-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner ${
                            userAlert.type === "error"
                                ? "bg-rose-50 text-rose-600 border border-rose-200"
                                : userAlert.type === "success"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                            {userAlert.type === "error" ? (
                                <AlertCircle className="w-8 h-8" />
                            ) : userAlert.type === "success" ? (
                                <CheckCircle2 className="w-8 h-8" />
                            ) : (
                                <AlertCircle className="w-8 h-8" />
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-lg font-extrabold text-[#28180C]">{userAlert.title}</h3>
                            <p className="text-xs text-[#574238] leading-relaxed">{userAlert.message}</p>
                        </div>
                        <button
                            onClick={() => setUserAlert((prev) => ({ ...prev, isOpen: false }))}
                            className="w-full mt-1 py-2.5 px-4 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function BeritaPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FFF8F5]" />}>
            <BeritaContent />
        </Suspense>
    );
}