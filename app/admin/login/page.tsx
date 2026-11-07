"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Jika sudah ada sesi admin aktif, langsung arahkan ke dashboard
    useEffect(() => {
        const adminSession = localStorage.getItem("melekisu_admin_session");
        if (adminSession) {
            router.replace("/admin/dashboard");
        }
    }, [router]);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        const cleanEmail = email.trim().toLowerCase();

        // 1. Kredensial Redaksi Standar (Untuk kemudahan pengujian demo juri & redaksi lokal)
        const isDefaultEditorial = (cleanEmail === "admin@melekisu.id" || cleanEmail === "redaksi@melekisu.id") && password === "admin123";

        if (isDefaultEditorial) {
            const sessionPayload = {
                id: "admin-master",
                email: cleanEmail,
                name: "Redaksi Pelaksana MelekIsu",
                role: "Super Admin",
                loginAt: new Date().toISOString(),
            };
            localStorage.setItem("melekisu_admin_session", JSON.stringify(sessionPayload));
            router.replace("/admin/dashboard");
            return;
        }

        // 2. Cek juga via Supabase Auth jika ada akun admin terdaftar di database
        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: password,
            });

            if (error) {
                setErrorMsg("Kredensial tidak valid atau akun Anda belum memiliki izin Administrator.");
                setIsLoading(false);
                return;
            }

            // Cek role pengguna pada user metadata
            const userRole = data.user?.user_metadata?.role;
            if (userRole === "admin" || cleanEmail.includes("admin")) {
                const sessionPayload = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata?.full_name || "Administrator MelekIsu",
                    role: "Admin Redaksi",
                    loginAt: new Date().toISOString(),
                };
                localStorage.setItem("melekisu_admin_session", JSON.stringify(sessionPayload));
                router.replace("/admin/dashboard");
            } else {
                setErrorMsg("Akses ditolak: Akun Anda terdaftar sebagai Warga, bukan Administrator.");
                await supabase.auth.signOut();
            }
        } catch (err: any) {
            setErrorMsg("Gagal menghubungi server otentikasi. Silakan periksa koneksi Anda.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#1E120A] text-[#FFF8F5] flex flex-col justify-between selection:bg-[#FDB659]/30">
            {/* Top Bar Minimalis */}
            <header className="py-6 px-8 flex items-center justify-between border-b border-[#3D2516]">
                <Link href="/" className="flex items-center gap-2.5">
                    <img
                        src="/images/logo.png"
                        alt="Logo MelekIsu"
                        className="w-8 h-8 object-contain rounded-xl"
                    />
                    <div className="flex flex-col">
                        <span className="font-extrabold text-base tracking-tight text-[#FFF8F5]">
                            Melek<span className="text-[#FDB659]">Isu</span>
                        </span>
                        <span className="text-[10px] text-[#A68877] font-semibold tracking-wider uppercase">Portal Redaksi & Administrator</span>
                    </div>
                </Link>

                <Link
                    href="/"
                    className="text-xs text-[#DEC0B3] hover:text-[#FFF8F5] font-semibold transition-colors"
                >
                    ← Kembali ke Web Warga
                </Link>
            </header>

            {/* Main Form Container */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-[#28180C] border border-[#4D2E1B] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-[#9B4000]/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col items-center text-center gap-3 mb-8">
                        <div className="w-14 h-14 rounded-2xl bg-[#9B4000] text-white flex items-center justify-center shadow-lg shadow-[#9B4000]/30">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#FDB659]/10 text-[#FDB659] mb-1.5 border border-[#FDB659]/20">
                                <Sparkles className="w-3 h-3" /> Panel Terproteksi
                            </div>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">Masuk Sebagai Admin</h1>
                            <p className="text-xs text-[#DEC0B3] mt-1 leading-relaxed">
                                Kelola kurasi berita, verifikasi masukan warga, dan pantau transparansi kebijakan.
                            </p>
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="mb-6 p-3.5 bg-red-950/60 border border-red-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-red-200">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#DEC0B3] block">Email Administrator</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-[#8B7266] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@melekisu.id"
                                    className="w-full bg-[#1E120A] border border-[#4D2E1B] focus:border-[#FDB659] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#664E3F] focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#DEC0B3] block">Kata Sandi Redaksi</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-[#8B7266] absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#1E120A] border border-[#4D2E1B] focus:border-[#FDB659] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-[#664E3F] focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B7266] hover:text-[#DEC0B3] cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#9B4000] to-[#B84D00] hover:from-[#B84D00] hover:to-[#9B4000] text-white text-xs font-extrabold rounded-xl shadow-lg shadow-[#9B4000]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Buka Dashboard Redaksi</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Akun Demo Praktis untuk Juri / Evaluasi */}
                    <div className="mt-6 pt-5 border-t border-[#3D2516] text-center">
                        <p className="text-[11px] text-[#A68877]">
                            Kredensial Demo Redaksi:
                        </p>
                        <div className="mt-1.5 p-2 bg-[#1E120A]/70 rounded-xl border border-[#3D2516] text-[11px] text-[#FDB659] font-mono flex items-center justify-center gap-2">
                            <span>admin@melekisu.id</span>
                            <span className="text-[#664E3F]">|</span>
                            <span>admin123</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Minimalis */}
            <footer className="py-4 text-center text-[11px] text-[#73594B] border-t border-[#3D2516]">
                © 2026 MelekIsu Internal Management System. Akses Terbatas.
            </footer>
        </div>
    );
}
