"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert("Akses Berhasil! Selamat datang di Nusantara Insight.");
        }, 1200);
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FFF8F5] text-[#28180C] selection:bg-[#FDB659]/30">

            {/* Container Card Full Single-Column */}
            <div className="w-full max-w-[540px] bg-white rounded-2xl shadow-xl overflow-hidden border border-[#DEC0B3]/40 p-8 sm:p-10 flex flex-col justify-between">

                {/* Header Brand & Title */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-[#9B4000] flex items-center justify-center text-white shadow-md">
                            <span className="material-symbols-outlined text-[26px]">account_balance</span>
                        </div>
                        <div>
                            <span className="text-xl font-bold text-[#28180C] tracking-tight block">Nusantara Insight</span>
                            <span className="text-[11px] text-[#9B4000] uppercase tracking-widest block font-bold">Integritas Demokrasi & Wacana Publik</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-extrabold text-[#28180C] tracking-tight">Masuk ke Akun Warga</h1>
                        <p className="text-sm text-[#574238] mt-1.5 leading-relaxed">
                            Masuk untuk berpartisipasi dalam aspirasi, jajak pendapat, dan diskursus kebijakan publik.
                        </p>
                    </div>

                    {/* SSO Google Button */}
                    <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#FFF1E9] hover:bg-[#FFE3D1] text-[#28180C] font-semibold text-sm transition-all duration-200 border border-[#DEC0B3]/50 shadow-xs"
                    >
                        <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                        </svg>
                        <span>Masuk Cepat dengan Akun Google</span>
                    </button>

                    {/* Divider */}
                    <div className="relative my-6 flex items-center justify-center">
                        <div className="w-full h-[1px] bg-[#DEC0B3]/60"></div>
                        <span className="absolute px-3 bg-white text-xs text-[#8B7266] font-medium">
                            atau gunakan kredensial resmi
                        </span>
                    </div>

                    {/* Form Login */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#28180C] mb-1.5" htmlFor="identity">
                                Alamat Email atau Nomor Ponsel Terdaftar
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7266]">@</span>
                                <input
                                    id="identity"
                                    type="text"
                                    required
                                    placeholder="nama@email.id atau 0812xxxxxxx"
                                    className="w-full bg-[#FFF1E9]/60 pl-10 pr-4 py-3 rounded-xl text-sm text-[#28180C] placeholder-[#8B7266]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] border border-[#DEC0B3]/50 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-bold text-[#28180C]" htmlFor="password">
                                    Kata Sandi
                                </label>
                                <Link href="#" className="text-xs font-semibold text-[#9B4000] hover:text-[#8C4A1E]">
                                    Lupa Kata Sandi?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Masukkan kata sandi akun"
                                    className="w-full bg-[#FFF1E9]/60 pl-4 pr-11 py-3 rounded-xl text-sm text-[#28180C] placeholder-[#8B7266]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] border border-[#DEC0B3]/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7266] hover:text-[#28180C] p-1 text-xs font-bold"
                                >
                                    {showPassword ? "Sembunyikan" : "Lihat"}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#9B4000] accent-[#9B4000] cursor-pointer" />
                                <span className="text-xs text-[#574238]">
                                    Ingat sesi saya di komputer ini selama 30 hari
                                </span>
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 px-4 rounded-xl bg-[#9B4000] hover:bg-[#8C4A1E] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                            >
                                {isLoading ? (
                                    <span>Memverifikasi Kredensial...</span>
                                ) : (
                                    <>
                                        <span>Masuk ke Portal Warga</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Links inside Card */}
                <div className="mt-8 pt-4 border-t border-[#DEC0B3]/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs">
                    <p className="text-[#574238]">
                        Belum memiliki akun?{" "}
                        <Link href="/daftar" className="font-bold text-[#9B4000] underline underline-offset-4">
                            Daftar Akun Baru
                        </Link>
                    </p>
                    <Link href="/" className="text-[#8B7266] hover:text-[#9B4000] font-medium">
                        ← Kembali ke Beranda
                    </Link>
                </div>

            </div>

            {/* Footer Disclaimer */}
            <div className="mt-6 text-center max-w-md text-[#574238] text-xs opacity-80">
                <p>© 2025 Nusantara Insight. Inisiatif keterbukaan data dan partisipasi publik.</p>
            </div>

        </div>
    );
}