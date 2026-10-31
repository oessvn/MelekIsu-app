"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UbahSandiPage() {
    const router = useRouter();
    const supabase = createClient();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (!password || !confirmPassword) {
            setErrorMessage("Mohon lengkapi semua kolom kata sandi.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage("Kata sandi baru minimal harus 6 karakter.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                setErrorMessage(error.message || "Gagal memperbarui kata sandi.");
                return;
            }

            // Keluarkan sesi pemulihan sementara
            await supabase.auth.signOut();
            setIsSuccess(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Terjadi kesalahan saat memperbarui kata sandi.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] flex flex-col justify-center items-center py-12 px-6 selection:bg-[#FDB659]/30 relative">
            <div className="bg-white rounded-3xl max-w-[500px] w-full p-8 sm:p-10 shadow-lg border border-[#DEC0B3]/40 flex flex-col gap-6">

                {/* Header Identitas Brand */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                        <img
                            src="/images/logo.png"
                            alt="Logo Nusantara Insight"
                            className="w-10 h-10 object-contain rounded-xl shadow-xs"
                        />
                        <div>
                            <span className="text-sm font-extrabold tracking-tight text-[#28180C]">WarTahu</span>
                            <p className="text-[10px] font-bold text-[#9B4000] tracking-wider uppercase">Integritas Demokrasi & Wacana Publik</p>
                        </div>
                    </div>
                    <div className="pt-3">
                        <h1 className="text-2xl font-extrabold text-[#28180C] tracking-tight">Buat Kata Sandi Baru</h1>
                        <p className="text-xs sm:text-sm text-[#574238] mt-1.5 leading-relaxed">
                            Silakan masukkan kata sandi baru yang kuat untuk mengamankan kembali akun warga Anda.
                        </p>
                    </div>
                </div>

                {/* Notifikasi Error */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Tampilan Sukses */}
                {isSuccess ? (
                    <div className="bg-[#FFF1E9]/60 border border-[#DEC0B3]/60 rounded-2xl p-6 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-14 h-14 rounded-full bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center text-2xl shadow-inner">
                            <CheckCircle2 className="w-8 h-8 text-[#9B4000]" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-[#28180C]">Kata Sandi Berhasil Diperbarui!</h3>
                            <p className="text-xs text-[#574238] leading-relaxed">
                                Akun Anda sekarang telah diamankan dengan kata sandi baru. Silakan masuk kembali menggunakan kredensial tersebut.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => router.push("/masuk")}
                            className="w-full mt-2 py-3 px-5 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                            <span>Masuk Sekarang</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    /* Formulir Kata Sandi Baru */
                    <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5 relative">
                            <label className="text-xs font-bold text-[#28180C]">Kata Sandi Baru</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    required
                                    className="w-full pl-4 pr-10 py-3 bg-[#FFF1E9]/50 text-xs sm:text-sm rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] transition-all"
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
                        </div>

                        <div className="flex flex-col gap-1.5 relative">
                            <label className="text-xs font-bold text-[#28180C]">Konfirmasi Kata Sandi Baru</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Masukkan ulang kata sandi baru"
                                    required
                                    className="w-full pl-4 pr-10 py-3 bg-[#FFF1E9]/50 text-xs sm:text-sm rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B7266] hover:text-[#28180C] p-1 cursor-pointer transition-colors"
                                    title={showConfirmPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <span className="text-[10px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                                    <AlertCircle className="w-3 h-3" /> Kata sandi tidak cocok.
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 w-full py-3.5 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Menyimpan Sandi Baru...</span>
                                </>
                            ) : (
                                <>
                                    <span>Simpan Kata Sandi Baru</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/masuk" className="text-xs text-[#574238] hover:text-[#9B4000] font-semibold transition-colors">
                                Batalkan dan kembali ke Halaman Masuk
                            </Link>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}
