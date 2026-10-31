"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserCheck, Mail, Calendar, Shield, LogOut, ArrowLeft, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
    id?: string;
    fullName: string;
    emailOrPhone: string;
    role: string;
    joinedDate: string;
}

export default function UserProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        const fetchUserProfile = async () => {
            try {
                // 1. Cek sesi aktif langsung dari Supabase Auth
                const { data: { user: authUser } } = await supabase.auth.getUser();

                if (authUser) {
                    const profileData: UserProfile = {
                        id: authUser.id,
                        fullName: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Warga Terdaftar",
                        emailOrPhone: authUser.email || "-",
                        role: authUser.user_metadata?.role || "Warga Terverifikasi Nusantara",
                        joinedDate: authUser.created_at
                            ? new Date(authUser.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
                            : "Terdaftar",
                    };
                    setUser(profileData);
                    localStorage.setItem("current_user", JSON.stringify(profileData));
                } else {
                    // 2. Fallback cek ke localStorage jika sesi offline ada
                    const activeUser = localStorage.getItem("current_user");
                    if (activeUser) {
                        setUser(JSON.parse(activeUser));
                    } else {
                        // Jika tidak ada user sama sekali, arahkan ke halaman masuk
                        router.push("/masuk");
                        return;
                    }
                }
            } catch (err) {
                console.error("Gagal memuat profil pengguna:", err);
                const activeUser = localStorage.getItem("current_user");
                if (activeUser) {
                    setUser(JSON.parse(activeUser));
                } else {
                    router.push("/masuk");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
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
                <p className="text-xs font-semibold text-[#8B7266]">Memuat profil warga...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] py-12 px-6 selection:bg-[#FDB659]/30">
            <div className="max-w-[800px] mx-auto flex flex-col gap-8">

                {/* Tombol Navigasi Kembali */}
                <div>
                    <Link href="/berita" className="inline-flex items-center gap-2 text-xs font-bold text-[#9B4000] hover:text-[#8C4A1E] bg-white px-4 py-2.5 rounded-xl border border-[#DEC0B3]/40 shadow-xs transition-all">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Portal Berita</span>
                    </Link>
                </div>

                {/* Kartu Profil Utama */}
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-md border border-[#DEC0B3]/40 flex flex-col gap-8">

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

                    {/* Statistik Partisipasi Warga */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-[#FFF8F5] p-5 rounded-2xl border border-[#DEC0B3]/30 flex flex-col gap-1 text-center sm:text-left">
                            <span className="text-[11px] font-bold text-[#8B7266] uppercase">Tanggapan Dikirim</span>
                            <span className="text-2xl font-extrabold text-[#9B4000]">0</span>
                            <span className="text-[10px] text-[#574238]">Esai & Diskusi Kebijakan</span>
                        </div>
                        <div className="bg-[#FFF8F5] p-5 rounded-2xl border border-[#DEC0B3]/30 flex flex-col gap-1 text-center sm:text-left">
                            <span className="text-[11px] font-bold text-[#8B7266] uppercase">Apresiasi Berita</span>
                            <span className="text-2xl font-extrabold text-[#9B4000]">0</span>
                            <span className="text-[10px] text-[#574238]">Total Like Artikel</span>
                        </div>
                        <div className="bg-[#FFF8F5] p-5 rounded-2xl border border-[#DEC0B3]/30 flex flex-col gap-1 text-center sm:text-left">
                            <span className="text-[11px] font-bold text-[#8B7266] uppercase">Status Akun</span>
                            <span className="text-sm font-extrabold text-emerald-700 mt-1 flex items-center justify-center sm:justify-start gap-1">
                                <Shield className="w-4 h-4" /> Aktif & Valid
                            </span>
                            <span className="text-[10px] text-[#574238]">Akses Penuh Portal</span>
                        </div>
                    </div>

                    {/* Aktivitas Terakhir / Informasi Partisipasi */}
                    <div className="flex flex-col gap-4 pt-2">
                        <h3 className="text-sm font-bold text-[#28180C] uppercase tracking-wider">Aktivitas & Riwayat Partisipasi Warga</h3>
                        <div className="bg-[#FFF8F5] p-6 rounded-2xl border border-[#DEC0B3]/30 text-center flex flex-col items-center gap-2">
                            <FileText className="w-8 h-8 text-[#8B7266]" />
                            <p className="text-xs font-semibold text-[#574238]">Belum ada aktivitas tanggapan atau esai kebijakan yang tercatat.</p>
                            <p className="text-[11px] text-[#8B7266]">Mulai berikan tanggapan berbobot di kolom diskusi artikel berita Nusantara Insight!</p>
                            <Link
                                href="/berita"
                                className="mt-2 px-4 py-2 bg-[#9B4000] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#8C4A1E] transition-all"
                            >
                                Jelajahi Berita & Beri Tanggapan
                            </Link>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
