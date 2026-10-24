"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// Data dummy / fallback interaktif jika API dipanggil
const mockNews = [
  {
    id: "1",
    title: "Revolusi Mobilitas Berkelanjutan: Integrasi Transit Nol Emisi di Seluruh Koridor Urban 2025",
    slug: "revolusi-mobilitas-berkelanjutan",
    excerpt: "Kementerian Perhubungan bersama konsorsium metropolitan meluncurkan sinkronisasi jadwal tunggal dan tarif gabungan untuk kereta cepat dan bus listrik.",
    category: { name: "Infrastruktur Publik" },
    source: "Humas KCIC",
    publishedAt: "2025-10-18",
  },
  {
    id: "2",
    title: "Digitalisasi Pertanian Rakyat: Meningkatkan Hasil Panen Mandiri",
    slug: "digitalisasi-pertanian-rakyat",
    excerpt: "Penerapan sensor kelembaban tanah berbiaya terjangkau meningkatkan margin keuntungan petani lokal hingga 34%.",
    category: { name: "Ketahanan Pangan" },
    source: "Wawasan Agraria",
    publishedAt: "2025-10-18",
  },
  {
    id: "3",
    title: "Akselerasi Literasi AI & Coding untuk 50.000 Mahasiswa Vokasi",
    slug: "akselerasi-literasi-ai",
    excerpt: "Kemitraan politeknik negeri membuka sertifikasi kompetensi rekayasa data gratis bagi mahasiswa luar pulau Jawa.",
    category: { name: "Pendidikan & Talenta" },
    source: "Inovasi Vokasi",
    publishedAt: "2025-10-17",
  },
  {
    id: "4",
    title: "Portal Satu Data Anggaran Terbuka: Setiap Rupiah Terpantau Publik",
    slug: "portal-satu-data-anggaran",
    excerpt: "Dashboard analitik real-time memungkinkan warga memantau pengadaan tender dan progres fisik pekerjaan umum.",
    category: { name: "Tata Kelola Publik" },
    source: "Transparansi Keuangan",
    publishedAt: "2025-10-16",
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // Filter berita berdasarkan kategori
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

      {/* Top Navigation Category Pills Section */}
      <section className="sticky top-20 z-40 bg-[#FFF8F5]/90 backdrop-blur-md border-b border-[#DEC0B3]/30 shadow-sm">
        <div className="max-w-[1360px] mx-auto px-6 py-3 flex items-center justify-between">

          {/* Category Pills */}
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

        {/* Hero Spotlight Section */}
        {featuredNews ? (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Left Visual Banner */}
            <div className="lg:col-span-7 relative group rounded-2xl overflow-hidden bg-gradient-to-br from-[#9B4000] to-[#C05407] shadow-lg flex min-h-[420px] p-8 text-white flex-col justify-between">
              <div className="absolute inset-0 bg-black/10"></div>

              {/* Badge */}
              <div className="relative z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit shadow-sm text-[#9B4000]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span className="text-xs font-bold uppercase tracking-wider">Sorotan Utama Redaksi</span>
              </div>

              {/* Title & Info */}
              <div className="relative z-10 mt-12 flex flex-col gap-3">
                <span className="text-xs uppercase tracking-widest text-[#FFDBCB] font-semibold">{featuredNews.category.name}</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
                  {featuredNews.title}
                </h1>
                <p className="text-sm text-white/90 line-clamp-2 max-w-xl leading-relaxed">
                  {featuredNews.excerpt}
                </p>
              </div>

              {/* Footer info inside banner */}
              <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-white/80 border-t border-white/20">
                <span className="font-medium">Sumber: {featuredNews.source}</span>
                <span className="bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">Analisis Kebijakan</span>
              </div>
            </div>

            {/* Right Editorial Summary Card */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#DEC0B3]/40">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="bg-[#FFDDC9] text-[#724700] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {featuredNews.category.name}
                  </span>
                  <span className="text-xs text-[#574238] flex items-center gap-1 font-medium">
                    ⏱️ 5 Menit Baca
                  </span>
                </div>

                <h2 className="text-xl font-bold text-[#28180C] leading-snug">
                  {featuredNews.title}
                </h2>

                <p className="text-sm text-[#574238] leading-relaxed">
                  {featuredNews.excerpt}
                </p>

                {/* Key Insights Box */}
                <div className="bg-[#FFF1E9] p-4 rounded-xl border border-[#DEC0B3]/30 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#9B4000] font-bold text-xs">
                    <span>💡</span>
                    <span>Ringkasan Fakta & Dampak Langsung:</span>
                  </div>
                  <ul className="flex flex-col gap-1.5 text-xs text-[#28180C]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#9B4000] font-bold">•</span>
                      <span>Transparansi data real-time & akuntabilitas anggaran terverifikasi.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#9B4000] font-bold">•</span>
                      <span>Partisipasi aktif warga melalui kanal kuota esai berbobot.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#DEC0B3]/30 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-[#574238]">
                  <span className="flex items-center gap-1">💬 <strong className="text-[#28180C]">142</strong></span>
                  <span className="flex items-center gap-1">👍 <strong className="text-[#28180C]">1,280</strong></span>
                </div>
                <Link
                  href={`/berita/${featuredNews.slug}`}
                  className="inline-flex items-center gap-2 bg-[#9B4000] hover:bg-[#8C4A1E] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <span>Baca Artikel</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

          </section>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#DEC0B3]/40">
            <p className="text-base font-semibold text-[#574238]">Berita dalam kategori ini tidak ditemukan.</p>
            <button onClick={() => setSelectedCategory("Semua")} className="mt-3 px-4 py-2 bg-[#9B4000] text-white text-xs font-bold rounded-xl">
              Reset Kategori
            </button>
          </div>
        )}

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
                  className="text-xs text-[#9B4000] font-bold hover:text-[#8C4A1E] flex items-center gap-1"
                >
                  Baca Selengkapnya <span>→</span>
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* Civic Discourse Etiquette Banner */}
        <section className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#DEC0B3]/40 overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#9B4000]"></div>
          <div className="flex items-start gap-4 pl-2">
            <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-full bg-[#FDB659]/20 text-[#9B4000] items-center justify-center text-xl font-bold">
              💬
            </div>
            <div className="flex flex-col gap-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-[#FDB659] text-[#724700] font-bold px-2 py-0.5 rounded-full">Etika Partisipasi Warga</span>
                <span className="text-[11px] text-[#574238]">Kebijakan Anti-Disinformasi UU No. 1/2024</span>
              </div>
              <h3 className="text-base font-bold text-[#28180C]">Ruang Dialog Konstruktif: Kuota 3 Komentar Berbobot Per Artikel</h3>
              <p className="text-xs text-[#574238] leading-relaxed">
                Demi menjaga kedalaman argumen dan mencegah spam, setiap warga terverifikasi memiliki kuota 3 tanggapan berbobot per esai kebijakan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto justify-end">
            <button className="w-full lg:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#9B4000] hover:bg-[#8C4A1E] transition-all shadow-sm">
              Kirim Esai Opini Warga
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}