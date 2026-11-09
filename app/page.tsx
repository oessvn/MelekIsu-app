"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { sendComment, isTextViolating } from "@/lib/newsService";
import { Lightbulb, MessageSquare, ThumbsUp, ArrowRight, FileText, CheckCircle2, Clock, Send, AlertCircle, HelpCircle, Bot, Sparkles } from "lucide-react";

// Data berita dengan link gambar langsung yang dijamin langsung tampil
const mockNews = [
  {
    id: "1",
    title: "Revolusi Mobilitas Berkelanjutan: Integrasi Transit Nol Emisi di Seluruh Koridor Urban 2025",
    slug: "revolusi-mobilitas-berkelanjutan",
    excerpt: "Kementerian Perhubungan bersama konsorsium metropolitan meluncurkan sinkronisasi jadwal tunggal dan tarif gabungan untuk kereta cepat dan bus listrik.",
    category: { name: "Infrastruktur Publik" },
    source: "Humas KCIC",
    publishedAt: "2025-10-18",
    image: "/images/infrastruktur.jpg",
  },
  {
    id: "2",
    title: "Digitalisasi Pertanian Rakyat: Meningkatkan Hasil Panen Mandiri",
    slug: "digitalisasi-pertanian-rakyat",
    excerpt: "Penerapan sensor kelembaban tanah berbiaya terjangkau meningkatkan margin keuntungan petani lokal hingga 34%.",
    category: { name: "Ketahanan Pangan" },
    source: "Wawasan Agraria",
    publishedAt: "2025-10-18",
    image: "/images/petani.jpg",
  },
  {
    id: "3",
    title: "Akselerasi Literasi AI & Coding untuk 50.000 Mahasiswa Vokasi",
    slug: "akselerasi-literasi-ai",
    excerpt: "Kemitraan politeknik negeri membuka sertifikasi kompetensi rekayasa data gratis bagi mahasiswa luar pulau Jawa.",
    category: { name: "Pendidikan & Talenta" },
    source: "Inovasi Vokasi",
    publishedAt: "2025-10-17",
    image: "/images/guru.jpg",
  },
  {
    id: "4",
    title: "Portal Satu Data Anggaran Terbuka: Setiap Rupiah Terpantau Publik",
    slug: "portal-satu-data-anggaran",
    excerpt: "Dashboard analitik real-time memungkinkan warga memantau pengadaan tender dan progres fisik pekerjaan umum.",
    category: { name: "Tata Kelola Publik" },
    source: "Transparansi Keuangan",
    publishedAt: "2025-10-16",
    image: "/images/rupiah.jpg",
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // State Interaktif untuk Like & Komentar Fungsional
  const [likesCount, setLikesCount] = useState(1280);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userSubmissionCount, setUserSubmissionCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [moderationFeedback, setModerationFeedback] = useState<{
    approved: boolean;
    status: string;
    reason: string;
    sentiment?: string;
  } | null>(null);

  // Sinkronisasi komentar & user dari localStorage
  useEffect(() => {
    const syncData = () => {
      // 1. Ambil user login aktif
      const activeUser = localStorage.getItem("current_user");
      let parsedUser = null;
      if (activeUser) {
        try {
          parsedUser = JSON.parse(activeUser);
          setCurrentUser(parsedUser);
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }

      // 2. Ambil komentar berita featured (revolusi-mobilitas-berkelanjutan)
      const storageKey = "comments_revolusi-mobilitas-berkelanjutan";
      const savedComments = localStorage.getItem(storageKey);
      let list: any[] = [];
      if (savedComments) {
        try {
          list = JSON.parse(savedComments);
        } catch {
          list = [];
        }
      } else {
        list = [
          { id: "c1-1", author: "Budi Santoso", text: "Integrasi jadwal ini sangat membantu mobilitas harian saya.", status: "Terverifikasi" },
          { id: "c1-2", author: "Siti Rahma", text: "Semoga koridornya bisa segera diperluas ke kota penyangga.", status: "Terverifikasi" },
        ];
        localStorage.setItem(storageKey, JSON.stringify(list));
      }

      setCommentsList(list);

      // Cek apakah user saat ini sudah pernah komentar di artikel ini
      if (parsedUser) {
        const hasCommented = list.some(
          (c: any) =>
            c.status === "Terverifikasi" &&
            !isTextViolating(c.text || "").violated &&
            ((parsedUser.emailOrPhone && c.authorEmail === parsedUser.emailOrPhone) ||
            (parsedUser.fullName && c.author === parsedUser.fullName))
        );
        setUserSubmissionCount(hasCommented ? 1 : 0);
      } else {
        setUserSubmissionCount(0);
      }
    };

    syncData();
    window.addEventListener("storage", syncData);
    return () => window.removeEventListener("storage", syncData);
  }, []);

  // Filter komentar publik di Hero: Hanya Terverifikasi atau milik pengguna aktif
  const isAuthorOfComment = (c: any) => {
    if (!currentUser) return false;
    const authorName = c.author || c.user;
    if (currentUser.emailOrPhone && c.authorEmail && c.authorEmail.toLowerCase() === currentUser.emailOrPhone.toLowerCase()) return true;
    if (currentUser.fullName && authorName && authorName.toLowerCase() === currentUser.fullName.toLowerCase()) return true;
    return false;
  };

  const visibleHeroComments = commentsList.filter((c) => {
    if (c.status === "Ditolak" || isTextViolating(c.text || "").violated) return false;
    if (c.status === "Terverifikasi") return true;
    if (isAuthorOfComment(c)) return true;
    return false;
  });

  // Handler Like
  const handleLikeClick = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  // Handler Awal Submit (Validasi login & kuota)
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Silakan Masuk atau Daftar terlebih dahulu untuk mengirim tanggapan.");
      return;
    }

    if (!newComment.trim()) return;

    if (userSubmissionCount >= 1) {
      alert("Batas kuota tercapai: Anda sudah mengirimkan 1 tanggapan pada artikel berita ini.");
      return;
    }

    setShowConfirmModal(true);
  };

  // Handler Eksekusi Kirim dengan Verifikasi Otomatis AI
  const handleConfirmSend = async () => {
    if (!currentUser) return;

    setShowConfirmModal(false);
    setIsSending(true);

    try {
      const newCommentItem = await sendComment(
        "revolusi-mobilitas-berkelanjutan",
        currentUser.fullName,
        currentUser.emailOrPhone || "",
        newComment.trim(),
        featuredNews.title,
        featuredNews.excerpt
      );

      const mod = (newCommentItem as any).moderation;
      const isApproved = newCommentItem.status === "Terverifikasi";

      setModerationFeedback(mod || {
        approved: isApproved,
        status: newCommentItem.status || "Terverifikasi",
        reason: newCommentItem.aiReason || "Tanggapan telah diproses sistem."
      });

      if (isApproved || newCommentItem.status === "Menunggu Verifikasi") {
        setCommentsList((prev) => [...prev, newCommentItem]);
        setUserSubmissionCount(1);
        setNewComment("");
      }

      setShowSuccessModal(true);
    } catch (err) {
      console.error("Gagal mengirim tanggapan:", err);
      alert("Terjadi kendala saat mengirim tanggapan. Silakan coba kembali.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredNews = useMemo(() => {
    return mockNews.filter((item) => {
      const matchesCategory =
        selectedCategory === "Semua" || item.category.name === selectedCategory;
      return matchesCategory;
    });
  }, [selectedCategory]);

  const featuredNews = filteredNews[0] || mockNews[0];
  const latestNews = filteredNews.slice(1);

  return (
    <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] selection:bg-[#FDB659]/30">

      {/* Top Navigation Category Pills */}
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

        {/* Hero Spotlight Section (Sorotan Utama Redaksi) */}
        {featuredNews ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left Visual Banner */}
            <div className="lg:col-span-7 relative group rounded-3xl overflow-hidden shadow-md flex flex-col justify-between p-6 sm:p-8 min-h-[360px] sm:min-h-[420px] transition-all duration-500 border border-[#DEC0B3]/40 bg-[#28180C]">
              {featuredNews.image && (
                <>
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Efek Gradasi Gelap agar Teks Sangat Jelas Dibaca */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/45"></div>
                </>
              )}

              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-[#FDB659] text-[#28180C] px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                    Sorotan Utama Redaksi
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold tracking-widest text-[#FFDDC9] uppercase drop-shadow-sm">
                    {featuredNews.category.name}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug text-white group-hover:text-[#FFDDC9] transition-colors drop-shadow-md">
                    {featuredNews.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#FFF1E9] leading-relaxed line-clamp-3 drop-shadow-sm font-normal">
                    {featuredNews.excerpt}
                  </p>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-white/20 flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#FFDDC9] uppercase tracking-wider font-semibold">Sumber Rujukan</span>
                  <span className="text-xs font-bold text-white">{featuredNews.source}</span>
                </div>
                <Link
                  href={`/berita/${featuredNews.slug}`}
                  className="px-5 py-2.5 bg-white text-[#9B4000] hover:bg-[#FFF8F5] text-xs font-bold rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 group-hover:scale-105 cursor-pointer"
                >
                  <span>Analisis Kebijakan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Interactive Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#DEC0B3]/40 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-[#FFE3D1] text-[#9B4000] text-[11px] font-extrabold px-3 py-1 rounded-full tracking-wide uppercase">
                    {featuredNews.category.name}
                  </span>
                  <span className="text-[11px] font-medium text-[#8B7266]">
                    5 Menit Baca
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#28180C] hover:text-[#9B4000] transition-colors leading-snug line-clamp-2">
                  {featuredNews.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#574238] leading-relaxed line-clamp-2">
                  {featuredNews.excerpt}
                </p>

                {/* Key Insights Box */}
                <div className="bg-[#FFF8F5] p-3.5 rounded-2xl border border-[#DEC0B3]/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#9B4000] flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#9B4000]" />
                    <span>Ringkasan Fakta & Dampak Langsung:</span>
                  </span>
                  <ul className="text-[11px] text-[#574238] space-y-1 pl-4 list-disc">
                    <li>Transparansi data real-time & akuntabilitas anggaran terverifikasi.</li>
                    <li>Partisipasi aktif warga melalui kanal kuota esai berbobot.</li>
                  </ul>
                </div>

                {/* Kotak Komentar Interaktif */}
                {showCommentBox && (
                  <div className="bg-[#FFF1E9] p-4 rounded-2xl border border-[#DEC0B3]/50 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#9B4000]">
                      <span>Tanggapan Warga ({commentsList.length})</span>
                      <button onClick={() => setShowCommentBox(false)} className="text-[10px] text-[#8B7266] hover:text-[#28180C] cursor-pointer font-bold">Tutup</button>
                    </div>

                    {!currentUser ? (
                      <div className="text-xs text-[#9B4000] bg-white p-3 rounded-xl border border-[#DEC0B3]/60 text-center font-bold">
                        Silakan <Link href="/masuk" className="underline hover:text-[#8C4A1E]">Masuk</Link> terlebih dahulu untuk mengirimkan tanggapan warga.
                      </div>
                    ) : userSubmissionCount >= 1 ? (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center gap-2 text-[11px] text-amber-800 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                        <span>Anda telah menggunakan 1 kuota tanggapan pada berita ini. Komentar Anda sedang dalam peninjauan sistem.</span>
                      </div>
                    ) : (
                      <form onSubmit={handleInitialSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Tuliskan pandangan konstruktif Anda..."
                          className="flex-1 bg-white px-3 py-2 text-xs rounded-xl border border-[#DEC0B3] focus:outline-none focus:ring-1 focus:ring-[#9B4000]"
                        />
                        <button type="submit" className="px-4 py-2 bg-[#9B4000] text-white text-xs font-bold rounded-xl hover:bg-[#8C4A1E] cursor-pointer flex items-center gap-1">
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim</span>
                        </button>
                      </form>
                    )}

                    {/* List Komentar Interaktif */}
                    {(() => {
                      const isAuthorOfComment = (c: any) => {
                        if (!currentUser) return false;
                        const authorName = c.author || c.user;
                        if (currentUser.emailOrPhone && c.authorEmail && c.authorEmail.toLowerCase() === currentUser.emailOrPhone.toLowerCase()) return true;
                        if (currentUser.fullName && authorName && authorName.toLowerCase() === currentUser.fullName.toLowerCase()) return true;
                        return false;
                      };

                      const visibleComments = commentsList.filter((c) => {
                        if (c.status === "Terverifikasi") return true;
                        if (isAuthorOfComment(c)) return true;
                        return false;
                      });

                      return (
                        <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                          {visibleComments.length === 0 ? (
                            <p className="text-[11px] text-[#8B7266] italic text-center py-2">Belum ada tanggapan warga yang terverifikasi.</p>
                          ) : (
                            visibleComments.map((c) => {
                              const authorName = c.author || c.user;
                              const isPending = c.status === "Menunggu Verifikasi";
                              return (
                                <div key={c.id} className="bg-white p-3 rounded-xl text-xs border border-[#DEC0B3]/30 shadow-2xs space-y-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <strong className="text-[#9B4000] text-xs truncate">{authorName}</strong>
                                    {isPending ? (
                                      <span className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0" title="Komentar hanya terlihat oleh Anda sampai disetujui admin">
                                        <Clock className="w-2.5 h-2.5 text-amber-700 animate-pulse" />
                                        <span>Menunggu Verifikasi (Hanya Anda)</span>
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shrink-0">
                                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                                        <span>Terverifikasi</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[#574238] text-[11px] leading-relaxed">{c.text}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Tombol Aksi Fungsional: Like & Komentar */}
              <div className="pt-5 mt-5 border-t border-[#DEC0B3]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCommentBox(!showCommentBox)}
                    className="flex items-center gap-1.5 font-semibold text-[#574238] hover:text-[#9B4000] cursor-pointer bg-[#FFF1E9] px-3 py-1.5 rounded-xl transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#9B4000]" />
                    <strong className="text-[#28180C]">{visibleHeroComments.length}</strong>
                  </button>

                  <button
                    onClick={handleLikeClick}
                    className={`flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${hasLiked
                        ? "bg-[#9B4000] text-white shadow-sm"
                        : "bg-[#FFF1E9] text-[#574238] hover:text-[#9B4000]"
                      }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? "text-white" : "text-[#9B4000]"}`} />
                    <strong className={hasLiked ? "text-white" : "text-[#28180C]"}>{likesCount}</strong>
                  </button>
                </div>

                <Link
                  href={`/berita/${featuredNews.slug}`}
                  className="px-4 py-2 bg-[#9B4000] hover:bg-[#8C4A1E] text-white font-bold rounded-xl shadow-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Baca Artikel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </section>
        ) : null}

        {/* Section Heading */}
        <div className="flex items-center justify-between pt-4 border-t border-[#DEC0B3]/40">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-6 bg-[#9B4000] rounded-full"></div>
            <h2 className="text-xl font-extrabold text-[#28180C] tracking-tight">Kajian & Laporan Lapangan Terkini</h2>
          </div>
          <span className="text-xs text-[#574238] font-medium hidden sm:inline-block">Diperbarui secara berkala</span>
        </div>

        {/* Latest News Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {latestNews.map((article) => (
            <article
              key={article.id}
              className="flex flex-col justify-between bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#DEC0B3]/40 transition-all duration-300 group"
            >
              <div>
                <div className="relative h-48 bg-gradient-to-tr from-[#F3D4c1] to-[#FFF8F5] flex items-center justify-center text-[#9B4000] overflow-hidden">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-[#9B4000] opacity-60 group-hover:scale-110 transition-transform duration-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-[#FDB659] text-[#724700] px-3 py-1 rounded-full text-[11px] font-bold uppercase shadow-xs">
                      {article.category.name}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-2.5">
                  <span className="text-[11px] font-bold text-[#8B7266] uppercase tracking-wider">{article.source}</span>
                  <h3 className="text-base font-bold text-[#28180C] group-hover:text-[#9B4000] transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-[#574238] line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>
              <div className="p-5 pt-0 mt-2 flex items-center justify-between border-t border-[#DEC0B3]/20 pt-4">
                <span className="text-[11px] text-[#8B7266]">Wawasan Warga</span>
                <Link
                  href={`/berita/${article.slug}`}
                  className="text-xs text-[#9B4000] font-bold hover:text-[#8C4A1E] flex items-center gap-1 cursor-pointer"
                >
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </section>

      </main>
      {/* Modal Konfirmasi Pengiriman Komentar dengan AI */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#DEC0B3]/40 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center shadow-inner">
              <Bot className="w-9 h-9 text-[#9B4000]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#28180C]">Verifikasi Otomatis AI</h3>
              <p className="text-xs sm:text-sm text-[#574238] leading-relaxed">
                Tanggapan Anda akan <strong className="text-[#9B4000]">diverifikasi secara otomatis oleh AI MelekIsu</strong>. Jika memenuhi etika diskursus publik, tanggapan Anda langsung diterbitkan ke warga. Lanjutkan kirim?
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
                disabled={isSending}
                className="flex-1 py-3 px-4 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSending ? (
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
    </div>
  );
}
