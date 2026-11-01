"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

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
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "2",
    title: "Digitalisasi Pertanian Rakyat: Meningkatkan Hasil Panen Mandiri",
    slug: "digitalisasi-pertanian-rakyat",
    excerpt: "Penerapan sensor kelembaban tanah berbiaya terjangkau meningkatkan margin keuntungan petani lokal hingga 34%.",
    category: { name: "Ketahanan Pangan" },
    source: "Wawasan Agraria",
    publishedAt: "2025-10-18",
    image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "3",
    title: "Akselerasi Literasi AI & Coding untuk 50.000 Mahasiswa Vokasi",
    slug: "akselerasi-literasi-ai",
    excerpt: "Kemitraan politeknik negeri membuka sertifikasi kompetensi rekayasa data gratis bagi mahasiswa luar pulau Jawa.",
    category: { name: "Pendidikan & Talenta" },
    source: "Inovasi Vokasi",
    publishedAt: "2025-10-17",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "4",
    title: "Portal Satu Data Anggaran Terbuka: Setiap Rupiah Terpantau Publik",
    slug: "portal-satu-data-anggaran",
    excerpt: "Dashboard analitik real-time memungkinkan warga memantau pengadaan tender dan progres fisik pekerjaan umum.",
    category: { name: "Tata Kelola Publik" },
    source: "Transparansi Keuangan",
    publishedAt: "2025-10-16",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // State Interaktif untuk Like & Komentar Fungsional
  const [likesCount, setLikesCount] = useState(1280);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentsList, setCommentsList] = useState([
    { id: 1, user: "Budi Santoso", text: "Kebijakan integrasi transit ini sangat membantu mobilitas harian warga urban." },
    { id: 2, user: "Siti Rahma", text: "Transparansi anggaran yang luar biasa, patut didukung penuh." },
  ]);
  const [newComment, setNewComment] = useState("");
  const [showCommentBox, setShowCommentBox] = useState(false);

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

  // Handler Tambah Komentar
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentObj = {
      id: Date.now(),
      user: "Indah (Warga Terverifikasi)",
      text: newComment.trim(),
    };

    setCommentsList([commentObj, ...commentsList]);
    setNewComment("");
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

            {/* Kolom Kiri: Kotak Banner Utama dengan Gambar Latar Belakang Asli */}
            <div className="lg:col-span-7 bg-[#9B4000] text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-lg relative overflow-hidden group">

              {/* GAMBAR LATAR BELAKANG */}
              {featuredNews.image && (
                <>
                  <img
                    src={featuredNews.image}
                    alt={featuredNews.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Efek Gradasi Gelap agar Teks Sangat Jelas Dibaca */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30"></div>
                </>
              )}

              <div className="flex flex-col gap-6 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-[#FDB659] text-[#28180C] px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                    ✓ Sorotan Utama Redaksi
                  </span>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold tracking-widest text-[#FFDDC9] uppercase drop-shadow-sm">
                    {featuredNews.category.name}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug group-hover:text-[#FFDDC9] transition-colors drop-shadow-md">
                    {featuredNews.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#FFF8F5]/90 leading-relaxed line-clamp-3 drop-shadow-sm">
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
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Kolom Kanan: Editorial Summary Card dengan Like & Komentar Fungsional */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm border border-[#DEC0B3]/40 hover:shadow-md transition-all duration-300">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="bg-[#FFDDC9] text-[#724700] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {featuredNews.category.name}
                  </span>
                  <span className="text-xs text-[#574238] flex items-center gap-1 font-medium">
                    ⏱️ 5 Menit Baca
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
                  <span className="text-[11px] font-bold text-[#9B4000] flex items-center gap-1">
                    💡 Ringkasan Fakta & Dampak Langsung:
                  </span>
                  <ul className="text-[11px] text-[#574238] space-y-1 pl-4 list-disc">
                    <li>Transparansi data real-time & akuntabilitas anggaran terverifikasi.</li>
                    <li>Partisipasi aktif warga melalui kanal kuota esai berbobot.</li>
                  </ul>
                </div>

                {/* Kotak Komentar Interaktif */}
                {showCommentBox && (
                  <div className="bg-[#FFF1E9] p-3 rounded-2xl border border-[#DEC0B3]/50 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#9B4000]">
                      <span>Tanggapan Warga ({commentsList.length})</span>
                      <button onClick={() => setShowCommentBox(false)} className="text-[10px] text-[#8B7266] hover:text-[#28180C]">Tutup</button>
                    </div>

                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Tulis tanggapan berbobot..."
                        className="flex-1 bg-white px-3 py-1.5 text-xs rounded-xl border border-[#DEC0B3] focus:outline-none focus:ring-1 focus:ring-[#9B4000]"
                      />
                      <button type="submit" className="px-3 py-1.5 bg-[#9B4000] text-white text-xs font-bold rounded-xl hover:bg-[#8C4A1E] cursor-pointer">
                        Kirim
                      </button>
                    </form>

                    <div className="max-h-28 overflow-y-auto space-y-2 pr-1">
                      {commentsList.map((c) => (
                        <div key={c.id} className="bg-white p-2 rounded-xl text-[11px] border border-[#DEC0B3]/30 shadow-xs">
                          <strong className="text-[#9B4000] block">{c.user}</strong>
                          <span className="text-[#574238]">{c.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tombol Aksi Fungsional: Like & Komentar */}
              <div className="pt-5 mt-5 border-t border-[#DEC0B3]/20 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCommentBox(!showCommentBox)}
                    className="flex items-center gap-1 font-semibold text-[#574238] hover:text-[#9B4000] cursor-pointer bg-[#FFF1E9] px-3 py-1.5 rounded-xl transition-all"
                  >
                    💬 <strong className="text-[#28180C]">{commentsList.length}</strong>
                  </button>

                  <button
                    onClick={handleLikeClick}
                    className={`flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${hasLiked
                        ? "bg-[#9B4000] text-white shadow-sm"
                        : "bg-[#FFF1E9] text-[#574238] hover:text-[#9B4000]"
                      }`}
                  >
                    <span>👍</span>
                    <strong className={hasLiked ? "text-white" : "text-[#28180C]"}>{likesCount}</strong>
                  </button>
                </div>

                <Link
                  href={`/berita/${featuredNews.slug}`}
                  className="px-4 py-2 bg-[#9B4000] hover:bg-[#8C4A1E] text-white font-bold rounded-xl shadow-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Baca Artikel</span>
                  <span>→</span>
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
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-300">📄</span>
                  <div className="absolute top-3 left-3">
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
                  Baca Selengkapnya <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </section>

      </main>
    </div>
  );
}