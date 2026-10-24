"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageSquare, ThumbsUp, Send, AlertCircle, Building2, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { newsDatabase } from "@/data/news";

export default function ArticleDetailClient({ slug }: { slug: string }) {
    const articleData = newsDatabase.find((item) => item.slug === slug);

    const [likes, setLikes] = useState(articleData ? articleData.likes : 0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState(articleData ? articleData.commentsList : []);
    const [newComment, setNewComment] = useState("");
    const [userSubmissionCount, setUserSubmissionCount] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    const handleToggleLike = () => {
        if (isLiked) {
            setLikes(likes - 1);
            setIsLiked(false);
        } else {
            setLikes(likes + 1);
            setIsLiked(true);
        }
    };

    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (userSubmissionCount >= 3) {
            alert("Batas kuota tercapai: Anda sudah mengirimkan 3 tanggapan pada artikel ini.");
            return;
        }

        setUserSubmissionCount(userSubmissionCount + 1);
        setNewComment("");
        setShowSuccessModal(true);
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] selection:bg-[#FDB659]/30 py-10 px-6 relative">

            {/* Modal Popup Sukses Verifikasi */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#DEC0B3]/40 flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-14 h-14 rounded-full bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center text-2xl shadow-inner">
                            <CheckCircle2 className="w-8 h-8 text-[#9B4000]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#28180C]">Tanggapan Berhasil Dikirim</h3>
                            <p className="text-xs sm:text-sm text-[#574238] mt-2 leading-relaxed">
                                Terimakasih atas tanggapan/saran yang telah diberikan, sistem akan memverifikasi terlebih dahulu komentar anda.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full mt-2 py-2.5 px-4 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                            Mengerti & Tutup
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-[900px] mx-auto flex flex-col gap-8">

                <div>
                    <Link href="/berita" className="inline-flex items-center gap-2 text-xs font-bold text-[#9B4000] hover:text-[#8C4A1E] bg-white px-4 py-2 rounded-xl border border-[#DEC0B3]/40 shadow-xs transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Berita</span>
                    </Link>
                </div>

                <article className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-[#DEC0B3]/40 flex flex-col gap-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-[#FFDDC9] text-[#724700] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            {articleData.category}
                        </span>
                        <span className="text-xs text-[#8B7266] flex items-center gap-1 font-medium">
                            <Building2 className="w-3.5 h-3.5" /> {articleData.source}
                        </span>
                        <span className="text-xs text-[#8B7266] flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" /> {articleData.date}
                        </span>
                        <span className="text-xs text-[#8B7266] flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5" /> {articleData.duration}
                        </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#28180C] leading-tight tracking-tight">
                        {articleData.title}
                    </h1>

                    <div className="w-full h-64 sm:h-80 relative rounded-xl overflow-hidden shadow-inner bg-[#F3D4c1]">
                        {articleData.image ? (
                            <img
                                src={articleData.image}
                                alt={articleData.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#9B4000]">
                                <span className="text-7xl">📰</span>
                            </div>
                        )}
                    </div>

                    <div className="text-[#574238] text-sm sm:text-base leading-relaxed space-y-4 pt-2">
                        {articleData.content.split("\n\n").map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#DEC0B3]/30 flex items-center justify-between">
                        <button
                            onClick={handleToggleLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isLiked
                                ? "bg-[#FFDDC9] text-[#9B4000] shadow-xs"
                                : "bg-[#FFF1E9] hover:bg-[#FFE3D1] text-[#574238]"
                                }`}
                        >
                            <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-[#9B4000] text-[#9B4000]" : ""}`} />
                            <span>{isLiked ? "Apresiasi Diberikan" : "Beri Apresiasi"} ({likes})</span>
                        </button>
                        <span className="text-xs text-[#8B7266]">Bagikan wawasan ini untuk transparansi publik</span>
                    </div>
                </article>

                <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#DEC0B3]/40 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#DEC0B3]/30 pb-4 gap-2">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[#9B4000]" />
                            <h3 className="text-base font-bold text-[#28180C]">Ruang Diskusi & Tanggapan Warga</h3>
                        </div>
                        <span className="text-xs bg-[#FFDDC9] text-[#724700] px-3 py-1 rounded-full font-bold">
                            Sisa Kuota Anda di Berita Ini: {3 - userSubmissionCount}/3
                        </span>
                    </div>

                    <div className="flex flex-col gap-3">
                        {comments.length === 0 ? (
                            <p className="text-xs text-[#8B7266] italic py-4 text-center">Belum ada tanggapan yang disetujui pada artikel ini. Jadilah yang pertama!</p>
                        ) : (
                            comments.map((c) => (
                                <div key={c.id} className="bg-[#FFF8F5] p-4 rounded-xl border border-[#DEC0B3]/30 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#9B4000]">{c.author}</span>
                                        <span className="text-[10px] text-[#8B7266]">Terverifikasi</span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#28180C] leading-normal">{c.text}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {userSubmissionCount < 3 ? (
                        <form onSubmit={handleAddComment} className="flex flex-col gap-3 pt-2">
                            <label className="text-xs font-bold text-[#28180C]" htmlFor="commentInput">
                                Kirim Tanggapan / Esai Singkat Kebijakan ({3 - userSubmissionCount} kesempatan tersisa):
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="commentInput"
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Tuliskan pandangan konstruktif Anda..."
                                    className="flex-1 bg-[#FFF1E9]/60 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000]"
                                />
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Kirim</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>Anda telah menggunakan seluruh batas 3 kesempatan mengirim tanggapan pada artikel berita ini. Komentar Anda sedang diproses oleh sistem.</span>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}