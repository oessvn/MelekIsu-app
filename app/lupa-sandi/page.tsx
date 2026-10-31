"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LupaSandiPage() {
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSent, setIsSent] = useState(false);

    const handleSendResetLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/ubah-sandi`,
            });

            if (error) {
                setErrorMessage(error.message || "Gagal mengirim link pemulihan.");
                return;
            }

            setIsSent(true);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage("Terjadi kesalahan tak terduga. Silakan coba lagi.");
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
                        <h1 className="text-2xl font-extrabold text-[#28180C] tracking-tight">Atur Ulang Kata Sandi</h1>
                        <p className="text-xs sm:text-sm text-[#574238] mt-1.5 leading-relaxed">
                            Masukkan email yang terdaftar pada akun warga Anda. Kami akan mengirimkan tautan aman untuk mengatur kata sandi baru.
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

                {/* Tampilan Jika Link Berhasil Dikirim */}
                {isSent ? (
                    <div className="bg-[#FFF1E9]/60 border border-[#DEC0B3]/60 rounded-2xl p-6 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-14 h-14 rounded-full bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center text-2xl shadow-inner">
                            <CheckCircle2 className="w-8 h-8 text-[#9B4000]" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-base font-bold text-[#28180C]">Tautan Telah Dikirim!</h3>
                            <p className="text-xs text-[#574238] leading-relaxed">
                                Silakan periksa kotak masuk atau folder spam di email <span className="font-bold text-[#9B4000]">{email}</span>. Klik link di dalamnya untuk mereset kata sandi.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 w-full pt-2">
                            <button
                                type="button"
                                onClick={() => setIsSent(false)}
                                className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-[#DEC0B3]/70 text-[#9B4000] text-xs font-bold rounded-xl transition-all"
                            >
                                Kirim Ulang Tautan
                            </button>
                            <Link
                                href="/masuk"
                                className="w-full py-2.5 px-4 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Kembali ke Halaman Masuk</span>
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Formulir Input Email */
                    <form onSubmit={handleSendResetLink} className="flex flex-col gap-5">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-[#28180C]">Alamat Email Terdaftar</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@gmail.com"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-[#FFF1E9]/50 text-xs sm:text-sm rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] transition-all"
                                />
                                <Mail className="w-4 h-4 text-[#8B7266] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-1 w-full py-3.5 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Mengirimkan Tautan...</span>
                                </>
                            ) : (
                                <>
                                    <span>Kirim Tautan Atur Ulang</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/masuk" className="inline-flex items-center gap-1.5 text-xs text-[#574238] hover:text-[#9B4000] font-semibold transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Kembali ke Halaman Masuk</span>
                            </Link>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}
