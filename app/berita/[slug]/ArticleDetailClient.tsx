"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ThumbsUp, Send, AlertCircle, Building2, Calendar, Clock, CheckCircle2, HelpCircle, FileText, Bot, Sparkles } from "lucide-react";
import { getCombinedNews, getCommentsForSlug, sendComment, isTextViolating, toggleCommentUpvote, getCommentUpvoteCount, isCommentUpvotedByUser } from "@/lib/newsService";
import { NewsItem, NewsComment } from "@/data/news";
import { getCategoryCoverImage } from "@/lib/policyDatasets";
import { createClient } from "@/lib/supabase/client";

export default function ArticleDetailClient({ slug }: { slug: string }) {
    const [articleData, setArticleData] = useState<NewsItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState<NewsComment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userSubmissionCount, setUserSubmissionCount] = useState(0);
    const [isSending, setIsSending] = useState(false);

    // State untuk Modal Kustom & Moderasi AI
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [userAlert, setUserAlert] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "info" | "error" | "success";
    }>({
        isOpen: false,
        title: "",
        message: "",
        type: "info"
    });
    const [commentUpvoteMap, setCommentUpvoteMap] = useState<{
        [commentId: string]: { count: number; isUpvoted: boolean };
    }>({});
    const [moderationFeedback, setModerationFeedback] = useState<{
        approved: boolean;
        status: string;
        reason: string;
        sentiment?: string;
    } | null>(null);

    const handleToggleCommentUpvote = async (commentId: string) => {
        if (!currentUser) {
            setUserAlert({
                isOpen: true,
                title: "Akses Masuk Diperlukan",
                message: "Silakan Masuk terlebih dahulu untuk memberikan apresiasi pada tanggapan warga.",
                type: "info"
            });
            return;
        }
        const userKey = currentUser.emailOrPhone || currentUser.id || "user";
        const result = await toggleCommentUpvote(commentId, userKey);
        setCommentUpvoteMap((prev) => ({
            ...prev,
            [commentId]: result
        }));
    };

    const getUpvoteCount = (commentId: string) => {
        if (commentUpvoteMap[commentId]) return commentUpvoteMap[commentId].count;
        return getCommentUpvoteCount(commentId);
    };

    const isUpvoted = (commentId: string) => {
        if (commentUpvoteMap[commentId]) return commentUpvoteMap[commentId].isUpvoted;
        const userKey = currentUser ? (currentUser.emailOrPhone || currentUser.id) : "";
        return isCommentUpvotedByUser(commentId, userKey);
    };

    // 1. Ambil data artikel
    useEffect(() => {
        let isMounted = true;
        getCombinedNews().then((allNews) => {
            if (!isMounted) return;
            const found = allNews.find((item) => item.slug === slug);
            if (found) {
                setArticleData(found);
                setLikes(found.likes || 0);
            }
            setIsLoading(false);
        });

        return () => {
            isMounted = false;
        };
    }, [slug]);

    // 2. Sinkronkan komentar & kuota pengguna
    useEffect(() => {
        if (!articleData) return;

        const syncComments = async () => {
            const list = await getCommentsForSlug(articleData.slug);
            setComments(list);

            const activeUser = localStorage.getItem("current_user");
            if (activeUser) {
                try {
                    const parsedUser = JSON.parse(activeUser);
                    setCurrentUser(parsedUser);

                    const alreadyCommented = list.some(
                        (c: any) =>
                            c.status === "Terverifikasi" &&
                            !isTextViolating(c.text).violated &&
                            ((parsedUser.emailOrPhone && c.authorEmail === parsedUser.emailOrPhone) ||
                            (parsedUser.fullName && c.author === parsedUser.fullName))
                    );
                    setUserSubmissionCount(alreadyCommented ? 1 : 0);

                    // Cek status like artikel oleh pengguna ini
                    const userKey = parsedUser.emailOrPhone || parsedUser.id || "guest";
                    const storageKey = `melekisu_liked_articles_${userKey}`;
                    const rawLikes = localStorage.getItem(storageKey);
                    if (rawLikes) {
                        try {
                            const listLikes: string[] = JSON.parse(rawLikes);
                            setIsLiked(listLikes.includes(articleData.slug));
                        } catch {}
                    }
                } catch {
                    setCurrentUser(null);
                }
            }
        };

        syncComments();
        window.addEventListener("storage", syncComments);
        return () => window.removeEventListener("storage", syncComments);
    }, [articleData]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center text-[#9B4000]">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-3 border-[#9B4000] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold tracking-wider uppercase">Memuat Artikel...</span>
                </div>
            </div>
        );
    }

    if (!articleData) {
        return (
            <div className="min-h-screen bg-[#FFF8F5] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-bold text-[#28180C] mb-2">Artikel Tidak Ditemukan</h1>
                <p className="text-sm text-[#574238] mb-6">Maaf, artikel kebijakan atau laporan warga yang kamu cari tidak tersedia.</p>
                <Link href="/berita" className="px-5 py-2.5 bg-[#9B4000] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#8C4A1E] transition-all">
                    ← Kembali ke Daftar Berita
                </Link>
            </div>
        );
    }

    // Helper cek kepemilikan komentar
    const isAuthorOfComment = (c: NewsComment) => {
        if (!currentUser) return false;
        if (currentUser.emailOrPhone && c.authorEmail && c.authorEmail.toLowerCase() === currentUser.emailOrPhone.toLowerCase()) return true;
        if (currentUser.fullName && c.author && c.author.toLowerCase() === currentUser.fullName.toLowerCase()) return true;
        return false;
    };

    // Filter komentar untuk tampilan publik:
    // - Komentar "Terverifikasi": tampil untuk seluruh warga publik
    // - Komentar "Menunggu Verifikasi": HANYA tampil untuk pembuat komentar tersebut (agar tahu sedang diproses), user lain TIDAK BISA melihatnya
    // - Komentar "Ditolak" atau memuat kata kasar: TIDAK PERNAH tampil
    const visibleComments = comments.filter((c) => {
        if (c.status === "Ditolak" || isTextViolating(c.text).violated) return false;
        if (c.status === "Terverifikasi") return true;
        if (isAuthorOfComment(c)) return true;
        return false;
    });

    const handleToggleLike = async () => {
        const userKey = currentUser?.emailOrPhone || currentUser?.id || "guest";
        const storageKey = `melekisu_liked_articles_${userKey}`;
        let likedList: string[] = [];
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) likedList = JSON.parse(raw);
        } catch {}

        const nowLiked = !isLiked;
        setIsLiked(nowLiked);
        const newLikesCount = nowLiked ? likes + 1 : Math.max(0, likes - 1);
        setLikes(newLikesCount);

        if (nowLiked) {
            if (!likedList.includes(slug)) likedList.push(slug);
        } else {
            likedList = likedList.filter((s) => s !== slug);
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(likedList));
            localStorage.setItem("melekisu_liked_articles_all", JSON.stringify(likedList));
            window.dispatchEvent(new Event("storage"));
        } catch {}

        // Sinkronkan ke Supabase jika artikel ada di database
        try {
            const supabase = createClient();
            await supabase.from("news").update({ likes: newLikesCount }).eq("slug", slug);
        } catch {}
    };

    const handleInitialSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            alert("Silakan Masuk atau Daftar terlebih dahulu untuk mengirim tanggapan.");
            return;
        }

        if (!newComment.trim()) return;

        if (userSubmissionCount >= 1) {
            alert("Batas kuota tercapai: Anda sudah mengirimkan 1 tanggapan pada artikel ini.");
            return;
        }

        setShowConfirmModal(true);
    };

    const handleConfirmSend = async () => {
        if (!currentUser || !articleData) return;

        setShowConfirmModal(false);
        setIsSending(true);

        try {
            const newCommentItem = await sendComment(
                articleData.slug,
                currentUser.fullName,
                currentUser.emailOrPhone || "",
                newComment.trim(),
                articleData.title,
                articleData.excerpt,
                articleData.content
            );

            const mod = (newCommentItem as any).moderation;
            const isApproved = newCommentItem.status === "Terverifikasi";

            setModerationFeedback(mod || {
                approved: isApproved,
                status: newCommentItem.status || "Terverifikasi",
                reason: newCommentItem.aiReason || "Tanggapan telah diproses sistem."
            });

            if (isApproved) {
                setComments((prev) => [...prev, newCommentItem]);
                setUserSubmissionCount(1);
                setNewComment("");
            } else if (newCommentItem.status === "Ditolak") {
                // Jika ditolak oleh AI, kuota belum dikunci agar warga bisa merevisi tanggapannya
            } else {
                // Menunggu verifikasi redaksi
                setComments((prev) => [...prev, newCommentItem]);
                setUserSubmissionCount(1);
                setNewComment("");
            }

            setShowSuccessModal(true);
        } catch (err) {
            console.error("Gagal mengirim tanggapan:", err);
            alert("Terjadi kendala saat memproses tanggapan. Silakan coba kembali.");
        } finally {
            setIsSending(false);
        }
    };

    const handleAskAI = (prompt: string) => {
        window.dispatchEvent(
            new CustomEvent("open-ai-chat", {
                detail: { prompt, slug: articleData?.slug },
            })
        );
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] selection:bg-[#FDB659]/30 py-10 px-6 relative">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                {/* Back button */}
                <Link
                    href="/berita"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#8B7266] hover:text-[#9B4000] transition-colors self-start"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Indeks Berita</span>
                </Link>

                {/* Article Header */}
                <header className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-[#FFE3D1] text-[#9B4000] text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                            {articleData.category}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#8B7266]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{articleData.duration}</span>
                        </div>
                        <span className="text-xs text-[#DEC0B3]">•</span>
                        <div className="flex items-center gap-1.5 text-xs text-[#8B7266]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{articleData.date}</span>
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#28180C] leading-snug">
                        {articleData.title}
                    </h1>

                    <div className="flex items-center gap-2 text-xs text-[#8B7266] pt-1">
                        <Building2 className="w-4 h-4 text-[#9B4000]" />
                        <span>Sumber Rujukan Kebijakan: <strong className="text-[#28180C]">{articleData.source}</strong></span>
                    </div>
                </header>

                {/* Cover Image */}
                <div className="relative w-full h-[280px] sm:h-[420px] rounded-3xl overflow-hidden shadow-md border border-[#DEC0B3]/40 bg-gradient-to-tr from-[#F3D4C1] to-[#FFF8F5] flex items-center justify-center">
                    {articleData.image ? (
                        <img
                            src={articleData.image}
                            alt=""
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src = getCategoryCoverImage(articleData.category || "");
                            }}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <FileText className="w-16 h-16 text-[#9B4000] opacity-50" />
                    )}
                </div>

                {/* Article Body Content */}
                <article className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-[#DEC0B3]/40 leading-relaxed text-[#574238] text-sm sm:text-base space-y-6">
                    <p className="font-semibold text-[#28180C] leading-relaxed border-l-4 border-[#9B4000] pl-4 italic">
                        {articleData.excerpt}
                    </p>

                    <div className="space-y-4 pt-2 whitespace-pre-line">
                        {articleData.content}
                    </div>

                    <div className="pt-6 border-t border-[#DEC0B3]/30 flex flex-wrap items-center justify-between gap-4">
                        <span className="text-xs text-[#8B7266]">
                            Diterbitkan oleh <strong className="text-[#28180C]">{articleData.source}</strong> untuk transparansi publik.
                        </span>

                        {/* Tombol Suka / Like */}
                        <button
                            onClick={handleToggleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isLiked
                                    ? "bg-[#FFE3D1] text-[#9B4000] border border-[#9B4000]/40 shadow-xs"
                                    : "bg-[#FFF8F5] text-[#574238] border border-[#DEC0B3]/60 hover:bg-[#FFE3D1]"
                            }`}
                        >
                            <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-[#9B4000] text-[#9B4000]" : ""}`} />
                            <span>{likes} Apresiasi Warga</span>
                        </button>
                    </div>
                </article>

                {/* Kotak Tanya Asisten AI */}
                {articleData && (
                    <div className="bg-gradient-to-br from-[#FFF1E9] via-white to-[#FFEDE3] rounded-2xl p-6 sm:p-7 border border-[#DEC0B3]/70 shadow-sm flex flex-col gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9B4000] to-[#803500] text-white flex items-center justify-center shrink-0 shadow-md">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm sm:text-base font-extrabold text-[#28180C]">
                                        Tanya Asisten AI tentang Berita Ini
                                    </h3>
                                    <span className="text-[10px] bg-[#9B4000] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                        <Sparkles className="w-2.5 h-2.5 text-[#FDB659]" /> MelekIsu AI
                                    </span>
                                </div>
                                <p className="text-xs text-[#574238] leading-relaxed">
                                    Punya pertanyaan spesifik, butuh ringkasan kilat, atau ingin menganalisis dampak kebijakan dari artikel ini? Pilih pertanyaan cepat di bawah atau buka kotak chat:
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#DEC0B3]/40">
                            <span className="text-xs font-bold text-[#8B7266] mr-1">Pertanyaan Cepat:</span>
                            <button
                                onClick={() => handleAskAI(`Tolong berikan ringkasan poin-poin penting dari berita "${articleData.title}"`)}
                                className="text-xs font-semibold bg-white hover:bg-[#FFDDC9] text-[#9B4000] px-3.5 py-1.5 rounded-xl border border-[#DEC0B3]/70 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                                <span>⚡ Ringkas Berita</span>
                            </button>
                            <button
                                onClick={() => handleAskAI(`Apa dampak dan manfaat nyata kebijakan dalam berita "${articleData.title}" bagi masyarakat?`)}
                                className="text-xs font-semibold bg-white hover:bg-[#FFDDC9] text-[#9B4000] px-3.5 py-1.5 rounded-xl border border-[#DEC0B3]/70 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                                <span>👥 Dampak bagi Warga</span>
                            </button>
                            <button
                                onClick={() => handleAskAI(`Siapa pihak berwenang terkait dan bagaimana tindak lanjut dari artikel "${articleData.title}"?`)}
                                className="text-xs font-semibold bg-white hover:bg-[#FFDDC9] text-[#9B4000] px-3.5 py-1.5 rounded-xl border border-[#DEC0B3]/70 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                            >
                                <span>🔍 Pihak Terkait & Regulasi</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Bagian Komentar */}
                <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#DEC0B3]/40 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#DEC0B3]/30 pb-4 gap-2">
                        <div>
                            <h2 className="text-lg font-bold text-[#28180C] flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-[#9B4000]" />
                                <span>Ruang Diskusi & Tanggapan Warga ({visibleComments.length})</span>
                            </h2>
                            <p className="text-xs text-[#8B7266] mt-0.5">
                                Partisipasi publik yang berbobot untuk keterbukaan kebijakan.
                            </p>
                        </div>

                        {currentUser && (
                            <div className="bg-[#FFF8F5] px-3 py-1.5 rounded-xl border border-[#DEC0B3]/40 text-xs">
                                <span className="text-[#8B7266]">Sisa Kuota Anda: </span>
                                <strong className="text-[#9B4000]">{userSubmissionCount >= 1 ? "0 / 1" : "1 / 1"} Tanggapan</strong>
                            </div>
                        )}
                    </div>

                    {/* List Komentar */}
                    <div className="space-y-4">
                        {visibleComments.length === 0 ? (
                            <div className="text-center py-8 text-xs text-[#8B7266] italic">
                                Belum ada tanggapan untuk berita ini. Jadilah warga pertama yang menyampaikan masukan berbobot!
                            </div>
                        ) : (
                            visibleComments.map((c) => {
                                const isPending = c.status === "Menunggu Verifikasi";
                                return (
                                    <div
                                        key={c.id}
                                        className={`p-4 rounded-xl border transition-all ${
                                            isPending
                                                ? "bg-amber-50/40 border-amber-200"
                                                : "bg-[#FFF8F5]/60 border-[#DEC0B3]/30"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-[#28180C]">
                                                {c.author}
                                            </span>
                                            {isPending ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title="Komentar hanya terlihat oleh Anda sampai disetujui oleh admin">
                                                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                                    <span>Menunggu Verifikasi (Hanya Anda)</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                    <span>Terverifikasi</span>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs sm:text-sm text-[#574238] leading-relaxed">
                                            {c.text}
                                        </p>

                                        {/* Baris Bawah: Tanggal & Tombol Upvote / Apresiasi */}
                                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#DEC0B3]/25">
                                            <span className="text-[11px] text-[#8B7266]">
                                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Warga MelekIsu"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleToggleCommentUpvote(c.id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                                    isUpvoted(c.id)
                                                        ? "bg-[#FFE3D1] text-[#9B4000] border border-[#DEC0B3] shadow-xs"
                                                        : "bg-white text-[#8B7266] border border-[#DEC0B3]/50 hover:bg-[#FFE3D1]/40 hover:text-[#9B4000]"
                                                }`}
                                                title="Apresiasi tanggapan warga yang berbobot dan solutif"
                                            >
                                                <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted(c.id) ? "fill-[#9B4000] text-[#9B4000]" : ""}`} />
                                                <span>{getUpvoteCount(c.id)}</span>
                                                <span className="hidden sm:inline font-semibold text-[11px]">Apresiasi</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Form Input Komentar */}
                    <div className="pt-4 border-t border-[#DEC0B3]/30">
                        {!currentUser ? (
                            <div className="bg-[#FFF8F5] p-5 rounded-2xl border border-[#DEC0B3]/50 text-center space-y-2">
                                <p className="text-xs text-[#574238]">
                                    Silakan masuk dengan akun warga Anda untuk memberikan tanggapan kebijakan.
                                </p>
                                <Link
                                    href="/masuk"
                                    className="inline-block px-5 py-2 bg-[#9B4000] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#8C4A1E] transition-all"
                                >
                                    Masuk ke Akun Warga
                                </Link>
                            </div>
                        ) : userSubmissionCount >= 1 ? (
                            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block">Kuota Tanggapan Anda Telah Terpakai</span>
                                    <span className="text-[#574238] mt-0.5 block">
                                        Untuk menjaga ruang diskusi yang adil dan berimbang, setiap warga hanya dapat mengirimkan 1 tanggapan per artikel. Tanggapan Anda saat ini sedang dalam antrean verifikasi redaksi.
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleInitialSubmit} className="space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-[#28180C] block mb-1">
                                        Tuliskan Tanggapan Konstruktif Anda ({currentUser.fullName}):
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Sampaikan analisis, masukan, atau kritik kebijakan yang berbobot dan sopan..."
                                        className="w-full p-3.5 bg-[#FFF8F5] rounded-xl border border-[#DEC0B3]/60 text-xs focus:outline-none focus:border-[#9B4000] text-[#28180C]"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-[#8B7266] italic flex items-center gap-1.5">
                                        <Bot className="w-3.5 h-3.5 text-[#9B4000]" />
                                        <span>Tanggapan Anda akan diverifikasi otomatis oleh AI sebelum tayang.</span>
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        className="px-5 py-2 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        {isSending ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>AI Memverifikasi...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Kirim Tanggapan</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </section>
            </div>

            {/* Modal Konfirmasi */}
            {showConfirmModal && (
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
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Periksa Lagi
                            </button>
                            <button
                                onClick={handleConfirmSend}
                                className="flex-1 py-3 px-4 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Kirim & Verifikasi AI</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Hasil Verifikasi AI */}
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
                                        Terima kasih atas partisipasi aktif Anda. Tanggapan Anda dinilai memenuhi standar kesantunan dan relevansi publik oleh AI MelekIsu sehingga langsung dapat dibaca oleh seluruh warga.
                                    </p>
                                    {moderationFeedback.reason && (
                                        <div className="mt-3 p-3 bg-[#FFF8F5] rounded-xl border border-[#DEC0B3]/40 text-left text-xs text-[#574238]">
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
                                        <div className="mt-3 p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-left text-xs text-rose-900">
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

            {/* Modal Notifikasi / Peringatan Pengguna */}
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
