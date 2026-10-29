"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [emailOrPhone, setEmailOrPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // State konfirmasi sandi

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State toggle konfirmasi sandi

    const [agreed, setAgreed] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName || !emailOrPhone || !password || !confirmPassword) {
            alert("Mohon lengkapi seluruh kolom formulir terlebih dahulu.");
            return;
        }

        // Validasi apakah kata sandi dan konfirmasi sandi cocok
        if (password !== confirmPassword) {
            alert("Kata sandi dan konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
            return;
        }

        if (!agreed) {
            alert("Anda harus menyetujui Pedoman Komunitas dan Kebijakan Privasi.");
            return;
        }

        // Buat objek profil pengguna baru
        const newUser = {
            fullName,
            emailOrPhone,
            password,
            role: "Warga Terverifikasi Nusantara",
            joinedDate: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }),
        };

        // Simpan ke localStorage sebagai database lokal & sesi aktif
        const existingUsers = JSON.parse(localStorage.getItem("nusantara_users") || "[]");

        const isRegistered = existingUsers.some((u: any) => u.emailOrPhone === emailOrPhone);
        if (isRegistered) {
            alert("Email atau nomor ponsel ini sudah terdaftar. Silakan gunakan akun lain atau masuk.");
            return;
        }

        existingUsers.push(newUser);
        localStorage.setItem("nusantara_users", JSON.stringify(existingUsers));

        // Set sesi user yang sedang aktif saat ini
        localStorage.setItem("current_user", JSON.stringify(newUser));

        setShowSuccessModal(true);
    };

    return (
        <div className="min-h-screen bg-[#FFF8F5] text-[#28180C] flex flex-col justify-center items-center py-12 px-6 selection:bg-[#FDB659]/30 relative">

            {/* Modal Sukses Kustom */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-[#DEC0B3]/40 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-[#FFF1E9] text-[#9B4000] flex items-center justify-center text-3xl shadow-inner">
                            <CheckCircle2 className="w-9 h-9 text-[#9B4000]" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="text-xl font-extrabold text-[#28180C]">Akun Berhasil Dibuat!</h3>
                            <p className="text-xs sm:text-sm text-[#574238] leading-relaxed">
                                Selamat datang, <span className="font-bold text-[#9B4000]">{fullName}</span>. Akun warga berdaulat Anda telah aktif dan terverifikasi.
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

            {/* Kartu Pendaftaran Utama */}
            <div className="bg-white rounded-3xl max-w-[500px] w-full p-8 sm:p-10 shadow-lg border border-[#DEC0B3]/40 flex flex-col gap-8">

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
                    <div className="pt-4">
                        <h1 className="text-2xl font-extrabold text-[#28180C] tracking-tight">Daftar Akun Warga Baru</h1>
                        <p className="text-xs sm:text-sm text-[#574238] mt-1.5 leading-relaxed">
                            Bergabunglah untuk berpartisipasi dalam aspirasi, jajak pendapat, dan diskursus kebijakan publik terverifikasi.
                        </p>
                    </div>
                </div>

                {/* Form Input */}
                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#28180C]">Nama Lengkap</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Masukkan nama lengkap Anda"
                            className="px-4 py-3 bg-[#FFF1E9]/50 text-xs sm:text-sm rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] transition-all"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#28180C]">Alamat Email atau Nomor Ponsel</label>
                        <input
                            type="text"
                            value={emailOrPhone}
                            onChange={(e) => setEmailOrPhone(e.target.value)}
                            placeholder="nama@gmail.com atau 0812xxxxxxxx"
                            className="px-4 py-3 bg-[#FFF1E9]/50 text-xs sm:text-sm rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] transition-all"
                        />
                    </div>

                    {/* Kata Sandi */}
                    <div className="flex flex-col gap-1.5 relative">
                        <label className="text-xs font-bold text-[#28180C]">Kata Sandi</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Buat kata sandi yang kuat"
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
                    </div>

                    {/* Konfirmasi Kata Sandi (Verifikasi 2 kali) */}
                    <div className="flex flex-col gap-1.5 relative">
                        <label className="text-xs font-bold text-[#28180C]">Konfirmasi Kata Sandi</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Masukkan ulang kata sandi Anda"
                                className="w-full px-4 py-3 bg-[#FFF1E9]/50 text-xs sm:text-sm rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#9B4000] transition-all"
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

                    <div className="flex items-start gap-2.5 pt-1">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-0.5 rounded accent-[#9B4000] w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-[11px] text-[#574238] leading-normal">
                            Saya menyetujui <span className="font-bold underline text-[#9B4000]">Pedoman Komunitas</span> dan <span className="font-bold underline text-[#9B4000]">Kebijakan Privasi</span> Nusantara Insight.
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="mt-2 w-full py-3.5 bg-[#9B4000] hover:bg-[#8C4A1E] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                        <span>Daftar Akun Warga Baru</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {/* Footer Login Link */}
                <div className="text-center pt-4 border-t border-[#DEC0B3]/30">
                    <p className="text-xs text-[#574238]">
                        Sudah memiliki akun terverifikasi?{" "}
                        <Link href="/masuk" className="text-[#9B4000] font-bold hover:underline">
                            Masuk di sini
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}