"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ThumbsUp, Send, AlertCircle, Building2, Calendar, Clock, CheckCircle2, HelpCircle, FileText, Bot, Sparkles } from "lucide-react";
import { getCombinedNews, getCommentsForSlug, sendComment } from "@/lib/newsService";
import { NewsItem, NewsComment } from "@/data/news";

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

    // State untuk Modal Kustom
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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
                            (parsedUser.emailOrPhone && c.authorEmail === parsedUser.emailOrPhone) ||
                            (parsedUser.fullName && c.author === parsedUser.fullName)
                    );
                    setUserSubmissionCount(alreadyCommented ? 1 : 0);
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
    const visibleComments = comments.filter((c) => {
        if (c.status === "Terverifikasi") return true;
        if (isAuthorOfComment(c)) return true;
        return false;
    });

    const handleToggleLike = () => {
        if (isLiked) {
            setLikes(likes - 1);
            setIsLiked(false);
        } else {
            setLikes(likes + 1);
            setIsLiked(true);
        }
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

        const newCommentItem = await sendComment(
            articleData.slug,
            currentUser.fullName,
            currentUser.emailOrPhone || "",
            newComment.trim()
        );

        setComments((prev) => [...prev, newCommentItem]);
        setUserSubmissionCount(1);
        setNewComment("");
        setIsSending(false);
        setShowSuccessModal(true);
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
                            alt={articleData.title}
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
                                    <span className="text-[11px] text-[#8B7266] italic">
                                        *Tanggapan Anda akan ditinjau redaksi sebelum tampil publik.
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        className="px-5 py-2 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>{isSending ? "Mengirim..." : "Kirim Tanggapan"}</span>
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
                            <HelpCircle className="w-9 h-9 text-[#9B4000]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-extrabold text-[#28180C]">Konfirmasi Pengiriman Tanggapan</h3>
                            <p className="text-xs sm:text-sm text-[#574238] leading-relaxed">
                                Setiap warga hanya dapat mengirimkan <strong className="text-[#9B4000]">1 tanggapan</strong> per artikel. Tanggapan Anda akan berstatus <span className="text-amber-800 font-bold">Menunggu Verifikasi</span>. Lanjutkan kirim?
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full pt-2">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Batalkan
                            </button>
                            <button
                                onClick={handleConfirmSend}
                                className="flex-1 py-3 px-4 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                            >
                                Ya, Kirim Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Sukses */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#DEC0B3]/40 flex flex-col items-center text-center gap-5">
                        <div className="w-16 h-16 rounded-full bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center shadow-inner">
                            <CheckCircle2 className="w-9 h-9 text-[#9B4000]" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-extrabold text-[#28180C]">Tanggapan Terkirim!</h3>
                            <p className="text-xs sm:text-sm text-[#574238] leading-relaxed">
                                Terima kasih atas partisipasi aktif Anda. Tanggapan Anda telah tercatat dan masuk ke antrean verifikasi redaksi di dashboard admin.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full mt-2 py-3 px-5 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
