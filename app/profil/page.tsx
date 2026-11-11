"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    UserCheck, 
    Mail, 
    Calendar, 
    Shield, 
    LogOut, 
    ArrowLeft, 
    FileText, 
    Loader2, 
    MessageSquare, 
    ThumbsUp, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    ExternalLink,
    ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCombinedNews } from "@/lib/newsService";
import { NewsItem } from "@/data/news";

interface UserProfile {
    id?: string;
    fullName: string;
    emailOrPhone: string;
    role: string;
    joinedDate: string;
}

interface UserCommentItem {
    id: string;
    newsTitle: string;
    slug: string;
    text: string;
    status: string;
    date: string;
}

export default function UserProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Data partisipasi dinamis pengguna
    const [userComments, setUserComments] = useState<UserCommentItem[]>([]);
    const [likedArticles, setLikedArticles] = useState<NewsItem[]>([]);
    const [activeTab, setActiveTab] = useState<"comments" | "likes">("comments");

    useEffect(() => {
        const supabase = createClient();

        const loadProfileAndActivity = async () => {
            try {
                let currentProfile: UserProfile | null = null;

                // 1. Cek sesi aktif langsung dari Supabase Auth
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (authUser) {
                    currentProfile = {
                        id: authUser.id,
                        fullName: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Warga Terdaftar",
                        emailOrPhone: authUser.email || "-",
                        role: authUser.user_metadata?.role || "Warga Terverifikasi MelekIsu",
                        joinedDate: authUser.created_at
                            ? new Date(authUser.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                            : "Terdaftar",
                    };
                    setUser(currentProfile);
                    localStorage.setItem("current_user", JSON.stringify(currentProfile));
                } else {
                    // 2. Fallback cek ke localStorage jika sesi ada
                    const activeUser = localStorage.getItem("current_user");
                    if (activeUser) {
                        currentProfile = JSON.parse(activeUser);
                        setUser(currentProfile);
                    } else {
                        router.push("/masuk");
                        return;
                    }
                }

                if (!currentProfile) return;

                // 3. Ambil data semua berita untuk mencocokkan judul & apresiasi
                const allNews = await getCombinedNews();

                // 4. Ambil tanggapan warga yang dikirim oleh pengguna ini
                const userEmail = currentProfile.emailOrPhone?.toLowerCase();
                const userName = currentProfile.fullName?.toLowerCase();

                let combinedComments: UserCommentItem[] = [];

                // 4a. Cari dari Supabase Cloud
                try {
                    const { data: dbComments, error: commentErr } = await supabase
                        .from("comments")
                        .select("*")
                        .order("created_at", { ascending: false });

                    if (!commentErr && Array.isArray(dbComments)) {
                        const matched = dbComments.filter((c: any) => {
                            const cEmail = c.author_email?.toLowerCase();
                            const cAuthor = c.author?.toLowerCase();
                            return (userEmail && cEmail && cEmail === userEmail) || (userName && cAuthor && cAuthor === userName);
                        });

                        matched.forEach((c: any) => {
                            const foundNews = allNews.find((n) => n.slug === c.news_slug);
                            combinedComments.push({
                                id: c.id,
                                newsTitle: foundNews ? foundNews.title : c.news_slug,
                                slug: c.news_slug,
                                text: c.text,
                                status: c.status || "Terverifikasi",
                                date: c.created_at
                                    ? new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                    : "Terbaru",
                            });
                        });
                    }
                } catch (e) {
                    console.warn("Gagal fetch komentar dari Supabase di profil:", e);
                }

                // 4b. Cek juga dari localStorage jika ada tanggapan lokal
                if (typeof window !== "undefined") {
                    allNews.forEach((art) => {
                        const saved = localStorage.getItem(`comments_${art.slug}`);
                        if (saved) {
                            try {
                                const list: any[] = JSON.parse(saved);
                                const myLocal = list.filter((c) => {
                                    const cEmail = c.authorEmail?.toLowerCase();
                                    const cAuthor = c.author?.toLowerCase();
                                    return (userEmail && cEmail && cEmail === userEmail) || (userName && cAuthor && cAuthor === userName);
                                });

                                myLocal.forEach((c) => {
                                    if (!combinedComments.some((exist) => exist.id === c.id || (exist.text === c.text && exist.slug === art.slug))) {
                                        combinedComments.push({
                                            id: c.id,
                                            newsTitle: art.title,
                                            slug: art.slug,
                                            text: c.text,
                                            status: c.status || "Terverifikasi",
                                            date: c.createdAt
                                                ? new Date(c.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                                                : "Terbaru",
                                        });
                                    }
                                });
                            } catch {}
                        }
                    });
                }

                setUserComments(combinedComments);

                // 5. Ambil data Apresiasi Berita (Like) dari pengguna ini
                const userKey = currentProfile.emailOrPhone || currentProfile.id || "guest";
                const storageKey = `melekisu_liked_articles_${userKey}`;
                let likedSlugs: string[] = [];

                try {
                    const rawLikes = localStorage.getItem(storageKey);
                    if (rawLikes) {
                        likedSlugs = JSON.parse(rawLikes);
                    } else {
                        const rawAll = localStorage.getItem("melekisu_liked_articles_all");
                        if (rawAll) likedSlugs = JSON.parse(rawAll);
                    }
                } catch {}

                const matchedLikedNews = allNews.filter((n) => 
                    likedSlugs.includes(n.slug) || likedSlugs.includes(n.id)
                );
                setLikedArticles(matchedLikedNews);

            } catch (err) {
                console.error("Gagal memuat profil dan aktivitas:", err);
            } finally {
                setLoading(false);
            }
        };

        loadProfileAndActivity();
        window.addEventListener("storage", loadProfileAndActivity);
        return () => window.removeEventListener("storage", loadProfileAndActivity);
    }, [router]);

    const handleLogout = async () => {
        const supabase = createClient();
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Error signing out:", err);
        } finally {
            localStorage.removeItem("current_user");
            window.dispatchEvent(new Event("storage"));
            router.replace("/");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] flex flex-col items-center justify-center py-12 px-6">
                <Loader2 className="w-8 h-8 text-[#9B4000] animate-spin mb-3" />
                <p className="text-xs font-semibold text-[#8B7266]">Memuat profil warga MelekIsu...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] py-12 px-6 selection:bg-[#FDB659]/30">
            <div className="max-w-[850px] mx-auto flex flex-col gap-8">

                {/* Tombol Navigasi Kembali */}
                <div>
                    <Link href="/berita" className="inline-flex items-center gap-2 text-xs font-bold text-[#9B4000] hover:text-[#8C4A1E] bg-white px-4 py-2.5 rounded-xl border border-[#DEC0B3]/40 shadow-xs transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Portal Berita</span>
                    </Link>
                </div>

                {/* Kartu Profil Utama */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border border-[#DEC0B3]/40 flex flex-col gap-8">

                    {/* Header Identitas Profil */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-[#DEC0B3]/30 pb-8 text-center sm:text-left">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#FFDDC9] to-[#9B4000] text-white flex items-center justify-center text-3xl font-extrabold shadow-inner shrink-0">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : "W"}
                        </div>
                        <div className="flex flex-col gap-1.5 flex-1">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-2xl font-extrabold text-[#28180C] tracking-tight">{user.fullName}</h1>
                                <span className="bg-[#FFDDC9] text-[#724700] px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                                    <UserCheck className="w-3 h-3" /> Warga Terverifikasi
                                </span>
                            </div>
                            <p className="text-xs text-[#8B7266] flex items-center justify-center sm:justify-start gap-1.5 font-medium">
                                <Mail className="w-3.5 h-3.5" /> {user.emailOrPhone}
                            </p>
                            <p className="text-[11px] text-[#8B7266] flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                                <Calendar className="w-3.5 h-3.5" /> Bergabung sejak: {user.joinedDate}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                            title="Keluar Akun"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Keluar</span>
                        </button>
                    </div>

                    {/* Statistik Partisipasi Warga (Terkoneksi Real Data) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div 
                            onClick={() => setActiveTab("comments")}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 text-center sm:text-left ${
                                activeTab === "comments" 
                                    ? "bg-[#FFF1E9] border-[#9B4000] shadow-xs" 
                                    : "bg-[#FFF8F5] border-[#DEC0B3]/30 hover:border-[#DEC0B3]"
                            }`}
                        >
                            <span className="text-[11px] font-bold text-[#8B7266] uppercase flex items-center justify-center sm:justify-start gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 text-[#9B4000]" />
                                <span>Tanggapan Dikirim</span>
                            </span>
                            <span className="text-3xl font-extrabold text-[#9B4000]">{userComments.length}</span>
                            <span className="text-[10px] text-[#574238]">Masukan & Diskusi Warga</span>
                        </div>

                        <div 
                            onClick={() => setActiveTab("likes")}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 text-center sm:text-left ${
                                activeTab === "likes" 
                                    ? "bg-[#FFF1E9] border-[#9B4000] shadow-xs" 
                                    : "bg-[#FFF8F5] border-[#DEC0B3]/30 hover:border-[#DEC0B3]"
                            }`}
                        >
                            <span className="text-[11px] font-bold text-[#8B7266] uppercase flex items-center justify-center sm:justify-start gap-1.5">
                                <ThumbsUp className="w-3.5 h-3.5 text-[#9B4000]" />
                                <span>Apresiasi Berita</span>
                            </span>
                            <span className="text-3xl font-extrabold text-[#9B4000]">{likedArticles.length}</span>
                            <span className="text-[10px] text-[#574238]">Total Artikel Disukai</span>
                        </div>

                        <div className="bg-[#FFF8F5] p-5 rounded-2xl border border-[#DEC0B3]/30 flex flex-col gap-1 text-center sm:text-left">
                            <span className="text-[11px] font-bold text-[#8B7266] uppercase">Status Akun</span>
                            <span className="text-sm font-extrabold text-emerald-700 mt-1 flex items-center justify-center sm:justify-start gap-1">
                                <Shield className="w-4 h-4" /> Warga Aktif
                            </span>
                            <span className="text-[10px] text-[#574238]">Akses Penuh Portal MelekIsu</span>
                        </div>
                    </div>

                    {/* Aktivitas & Riwayat Partisipasi Warga */}
                    <div className="flex flex-col gap-4 pt-2">
                        {/* Tab Switcher Aktivitas */}
                        <div className="flex items-center justify-between border-b border-[#DEC0B3]/30 pb-3">
                            <h3 className="text-sm font-bold text-[#28180C] uppercase tracking-wider">
                                Riwayat Partisipasi Warga
                            </h3>
                            <div className="flex items-center gap-1 bg-[#FFF1E9] p-1 rounded-xl text-xs font-bold">
                                <button
                                    onClick={() => setActiveTab("comments")}
                                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                        activeTab === "comments" 
                                            ? "bg-[#9B4000] text-white shadow-2xs" 
                                            : "text-[#73594B] hover:text-[#28180C]"
                                    }`}
                                >
                                    Tanggapan ({userComments.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab("likes")}
                                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                        activeTab === "likes" 
                                            ? "bg-[#9B4000] text-white shadow-2xs" 
                                            : "text-[#73594B] hover:text-[#28180C]"
                                    }`}
                                >
                                    Apresiasi ({likedArticles.length})
                                </button>
                            </div>
                        </div>

                        {/* KONTEN TAB 1: Daftar Tanggapan yang Dikirim Pengguna */}
                        {activeTab === "comments" && (
                            userComments.length === 0 ? (
                                <div className="bg-[#FFF8F5] p-8 rounded-2xl border border-[#DEC0B3]/30 text-center flex flex-col items-center gap-2">
                                    <FileText className="w-8 h-8 text-[#8B7266]" />
                                    <p className="text-xs font-semibold text-[#574238]">Belum ada tanggapan atau masukan kebijakan yang dikirim.</p>
                                    <p className="text-[11px] text-[#8B7266]">Mulai berikan tanggapan berbobot di kolom diskusi artikel berita MelekIsu!</p>
                                    <Link
                                        href="/berita"
                                        className="mt-2 px-4 py-2 bg-[#9B4000] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#8C4A1E] transition-all"
                                    >
                                        Jelajahi Berita & Beri Tanggapan
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {userComments.map((item) => {
                                        const isVerified = item.status === "Terverifikasi";
                                        const isRejected = item.status === "Ditolak";
                                        return (
                                            <div 
                                                key={item.id}
                                                className="bg-[#FFFDFB] p-4 sm:p-5 rounded-2xl border border-[#DEC0B3]/40 hover:border-[#9B4000]/40 transition-all flex flex-col gap-2.5"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <Link 
                                                        href={`/berita/${item.slug}`} 
                                                        className="text-xs font-bold text-[#9B4000] hover:underline flex items-center gap-1 group"
                                                    >
                                                        <span>{item.newsTitle}</span>
                                                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                                    </Link>
                                                    {isVerified ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                            <span>Terverifikasi</span>
                                                        </span>
                                                    ) : isRejected ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                                            <AlertCircle className="w-3 h-3 text-rose-600" />
                                                            <span>Ditolak Kurasi</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                                            <Clock className="w-3 h-3 text-amber-600" />
                                                            <span>Menunggu Verifikasi</span>
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-[#574238] leading-relaxed bg-[#FFF8F5] p-3 rounded-xl border border-[#DEC0B3]/20">
                                                    "{item.text}"
                                                </p>
                                                <div className="flex items-center justify-between text-[10px] text-[#8B7266] pt-1">
                                                    <span>Dikirim pada: {item.date}</span>
                                                    <Link href={`/berita/${item.slug}`} className="text-[#9B4000] font-bold hover:underline flex items-center gap-1">
                                                        <span>Lihat di Berita</span>
                                                        <ArrowRight className="w-2.5 h-2.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        )}

                        {/* KONTEN TAB 2: Daftar Berita yang Diapresiasi (Disukai) */}
                        {activeTab === "likes" && (
                            likedArticles.length === 0 ? (
                                <div className="bg-[#FFF8F5] p-8 rounded-2xl border border-[#DEC0B3]/30 text-center flex flex-col items-center gap-2">
                                    <ThumbsUp className="w-8 h-8 text-[#8B7266]" />
                                    <p className="text-xs font-semibold text-[#574238]">Belum ada artikel berita yang diapresiasi.</p>
                                    <p className="text-[11px] text-[#8B7266]">Berikan apresiasi pada artikel yang menurut Anda penting dan membuka transparansi publik!</p>
                                    <Link
                                        href="/berita"
                                        className="mt-2 px-4 py-2 bg-[#9B4000] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#8C4A1E] transition-all"
                                    >
                                        Jelajahi Berita
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {likedArticles.map((article) => (
                                        <div 
                                            key={article.id}
                                            className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#DEC0B3]/40 hover:border-[#9B4000]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                                                {article.image && (
                                                    <img 
                                                        src={article.image} 
                                                        alt="" 
                                                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#DEC0B3]/40"
                                                        onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                                    />
                                                )}
                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-[#9B4000] bg-[#FFF1E9] px-2 py-0.5 rounded-full">
                                                            {article.category}
                                                        </span>
                                                        <span className="text-[10px] text-[#8B7266]">
                                                            {article.source}
                                                        </span>
                                                    </div>
                                                    <h5 className="text-xs font-bold text-[#28180C] line-clamp-1">
                                                        {article.title}
                                                    </h5>
                                                    <p className="text-[11px] text-[#574238] line-clamp-1">
                                                        {article.excerpt}
                                                    </p>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/berita/${article.slug}`}
                                                className="shrink-0 px-3.5 py-2 bg-[#9B4000] hover:bg-[#803500] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                                            >
                                                <span>Buka</span>
                                                <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
