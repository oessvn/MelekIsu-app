"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Pastikan modal dan form selalu dalam keadaan bersih saat halaman dimuat
    useEffect(() => {
        setShowSuccessModal(false);
        setErrorMessage("");
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!email || !password) {
            setErrorMessage("Mohon masukkan email dan kata sandi Anda.");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    setErrorMessage("Email atau kata sandi yang Anda masukkan salah.");
                } else if (error.message.includes("Email not confirmed")) {
                    setErrorMessage("Email belum dikonfirmasi. Silakan cek kotak masuk email Anda atau hubungi admin.");
                } else {
                    setErrorMessage(error.message);
                }
                return;
            }

            if (data.user) {
                // Simpan cache profil user untuk sinkronisasi instan
                const userProfile = {
                    id: data.user.id,
                    fullName: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Warga",
                    emailOrPhone: data.user.email,
                    role: data.user.user_metadata?.role || "Warga Terverifikasi Nusantara",
                    joinedDate: new Date(data.user.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
                };
                localStorage.setItem("current_user", JSON.stringify(userProfile));
                window.dispatchEvent(new Event("storage"));
            }

            setShowSuccessModal(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Terjadi kesalahan saat masuk. Silakan coba lagi.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] flex flex-col justify-center items-center py-12 px-6 selection:bg-[#FDB659]/30 relative">

            {/* Modal Sukses Masuk Kustom */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#DEC0B3]/40 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center text-3xl shadow-inner">
                            <CheckCircle2 className="w-9 h-9 text-[#9B4000]" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-xl font-extrabold text-[#28180C]">Berhasil Masuk!</h3>
                            <p className="text-xs sm:text-sm text-[#574238] leading-relaxed">
                                Selamat datang kembali di portal Wacana Publik. Anda terhubung sebagai warga terverifikasi.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push("/profil")}
                            className="w-full mt-2 py-3 px-5 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <span>Menuju Halaman Profil Warga</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Kartu Masuk Utama */}
            <div className="bg-white rounded-3xl max-w-[500px] w-full p-8 sm:p-10 shadow-lg border border-[#DEC0B3]/40 flex flex-col gap-8">

                {/* Header Identitas Brand dengan Logo */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/images/logo.png"
                            alt="Logo Nusantara Insight"
                            className="w-10 h-10 object-contain rounded-xl shadow-xs"
                        />
                        <div>
                            <span className="text-sm font-extrabold tracking-tight text-[#28180C]">NusantaraInsight</span>
                            <p className="text-[10px] font-bold text-[#9B4000] tracking-wider uppercase">Integritas Demokrasi & Wacana Publik</p>
                        </div>
                    </div>
                    <div className="pt-4">
                        <h1 className="text-2xl font-extrabold text-[#28180C] tracking-tight">Masuk ke Akun Warga</h1>
                        <p className="text-xs sm:text-sm text-[#574238] mt-1.5 leading-relaxed">
                            Masuk untuk berpartisipasi dalam aspirasi, jajak pendapat, dan diskursus kebijakan publik.
                        </p>
                    </div>
                </div>

                {/* Notifikasi Error jika gagal masuk */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Form Input */}
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#28180C]">Alamat Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nama@gmail.com"
                            required
                            className="px-4 py-3 bg-[#FFF1E9]/50 text-xs sm:text-sm rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 relative">
                        <label className="text-xs font-bold text-[#28180C]">Kata Sandi</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Masukkan kata sandi akun"
                                required
                                className="w-full px-4 py-3 bg-[#FFF1E9]/50 text-xs sm:text-sm rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B7266] hover:text-[#28180C] p-1 cursor-pointer transition-colors"
                                title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Tautan Lupa Kata Sandi di bawah kolom input kata sandi sebelah kanan */}
                        <div className="flex justify-end pt-1">
                            <Link
                                href="/lupa-sandi"
                                className="text-[11px] text-[#9B4000] font-bold hover:underline"
                            >
                                Lupa Kata Sandi?
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                        <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded accent-[#9B4000] w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="remember" className="text-[11px] text-[#574238] select-none cursor-pointer">
                            Ingat sesi saya di komputer ini selama 30 hari
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full py-3.5 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Memverifikasi Akun...</span>
                            </>
                        ) : (
                            <>
                                <span>Masuk ke Portal Warga</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Register Link */}
                <div className="text-center pt-4 border-t border-[#DEC0B3]/30">
                    <p className="text-xs text-[#574238]">
                        Belum memiliki akun warga?{" "}
                        <Link href="/daftar" className="text-[#9B4000] font-bold hover:underline">
                            Daftar di sini
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
