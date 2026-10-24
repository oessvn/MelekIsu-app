"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            alert("Pendaftaran Berhasil! Silakan masuk ke akun Anda.");
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
                        <h1 className="text-2xl font-extrabold text-[#28180C] tracking-tight">Daftar Akun Warga Baru</h1>
                        <p className="text-sm text-[#574238] mt-1.5 leading-relaxed">
                            Bergabunglah untuk berpartisipasi dalam aspirasi, jajak pendapat, dan diskursus kebijakan publik terverifikasi.
                        </p>
                    </div>

                    {/* Form Register */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[#28180C] mb-1.5" htmlFor="fullname">
                                Nama Lengkap (Sesuai KTP)
                            </label>
                            <input
                                id="fullname"
                                type="text"
                                required
                                placeholder="Masukkan nama lengkap Anda"
                                className="w-full bg-[#FFF1E9]/60 px-4 py-3 rounded-xl text-sm text-[#28180C] placeholder-[#8B7266]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] border border-[#DEC0B3]/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#28180C] mb-1.5" htmlFor="nik">
                                Nomor Induk Kependudukan (NIK)
                            </label>
                            <input
                                id="nik"
                                type="text"
                                required
                                placeholder="327xxxxxxxxx0001"
                                className="w-full bg-[#FFF1E9]/60 px-4 py-3 rounded-xl text-sm text-[#28180C] placeholder-[#8B7266]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] border border-[#DEC0B3]/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#28180C] mb-1.5" htmlFor="identity">
                                Alamat Email atau Nomor Ponsel
                            </label>
                            <input
                                id="identity"
                                type="text"
                                required
                                placeholder="nama@email.id atau 0812xxxxxxx"
                                className="w-full bg-[#FFF1E9]/60 px-4 py-3 rounded-xl text-sm text-[#28180C] placeholder-[#8B7266]/70 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] border border-[#DEC0B3]/50 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-[#28180C] mb-1.5" htmlFor="password">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="Buat kata sandi yang kuat"
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
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                                <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded text-[#9B4000] accent-[#9B4000] cursor-pointer" />
                                <span className="text-xs text-[#574238]">
                                    Saya menyetujui <Link href="#" className="text-[#9B4000] underline">Pedoman Komunitas</Link> dan <Link href="#" className="text-[#9B4000] underline">Kebijakan Privasi</Link> Nusantara Insight.
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
                                    <span>Mendaftarkan Akun...</span>
                                ) : (
                                    <>
                                        <span>Daftar Akun Warga Baru</span>
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
                        Sudah memiliki akun?{" "}
                        <Link href="/masuk" className="font-bold text-[#9B4000] underline underline-offset-4">
                            Masuk di sini
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