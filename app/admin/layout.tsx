"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
    LayoutDashboard, 
    Newspaper, 
    MessageSquareCheck, 
    ShieldCheck, 
    LogOut, 
    ExternalLink,
    ChevronRight,
    Menu,
    X
} from "lucide-react";

interface AdminSession {
    id: string;
    email: string;
    name: string;
    role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [admin, setAdmin] = useState<AdminSession | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const isLoginPage = pathname === "/admin/login";

    useEffect(() => {
        if (isLoginPage) {
            setIsChecking(false);
            return;
        }

        const rawSession = localStorage.getItem("melekisu_admin_session");
        if (!rawSession) {
            router.replace("/admin/login");
        } else {
            try {
                setAdmin(JSON.parse(rawSession));
            } catch {
                localStorage.removeItem("melekisu_admin_session");
                router.replace("/admin/login");
            }
            setIsChecking(false);
        }
    }, [router, isLoginPage]);

    // Jika di halaman login admin, langsung render halaman login tanpa sidebar atau loading screen
    if (isLoginPage) {
        return <>{children}</>;
    }

    if (isChecking) {
        return (
            <div className="min-h-screen bg-[#1E120A] flex items-center justify-center text-[#FDB659]">
                <div className="w-8 h-8 border-3 border-[#FDB659] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem("melekisu_admin_session");
        router.replace("/admin/login");
    };

    return (
        <div className="min-h-screen bg-[#FDF8F5] text-[#28180C] flex flex-col lg:flex-row">
            {/* Mobile Topbar */}
            <div className="lg:hidden bg-[#1E120A] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#3D2516]">
                <div className="flex items-center gap-2">
                    <img src="/images/logo.png" alt="Logo" className="w-7 h-7 rounded-lg" />
                    <span className="font-extrabold text-sm tracking-tight text-white">
                        Melek<span className="text-[#FDB659]">Isu</span> Admin
                    </span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-1.5 rounded-lg bg-[#28180C] text-[#FDB659] cursor-pointer"
                >
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Sidebar Desktop */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#1E120A] text-[#FFF8F5] p-6 flex flex-col justify-between border-r border-[#3D2516]
                transition-transform duration-300 lg:static lg:translate-x-0
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="space-y-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo.png"
                            alt="Logo MelekIsu"
                            className="w-9 h-9 object-contain rounded-xl shadow-xs"
                        />
                        <div className="flex flex-col">
                            <span className="font-extrabold text-base tracking-tight text-white">
                                Melek<span className="text-[#FDB659]">Isu</span>
                            </span>
                            <span className="text-[10px] text-[#A68877] font-bold uppercase tracking-wider">
                                Dashboard Redaksi
                            </span>
                        </div>
                    </div>

                    {/* Navigasi Panel */}
                    <nav className="space-y-1.5 text-xs font-bold">
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#9B4000] to-[#B34B00] text-white shadow-md"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Ikhtisar & Statistik</span>
                        </Link>

                        <a
                            href="#kelola-berita"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#DEC0B3] hover:text-white hover:bg-[#28180C] transition-colors"
                        >
                            <Newspaper className="w-4 h-4" />
                            <span>Kelola Berita</span>
                        </a>

                        <a
                            href="#moderasi-komentar"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#DEC0B3] hover:text-white hover:bg-[#28180C] transition-colors"
                        >
                            <MessageSquareCheck className="w-4 h-4" />
                            <span>Moderasi Masukan</span>
                        </a>

                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center justify-between px-4 py-3 rounded-xl text-[#DEC0B3] hover:text-white hover:bg-[#28180C] transition-colors pt-4 border-t border-[#3D2516]/60 mt-4"
                        >
                            <div className="flex items-center gap-2.5">
                                <ExternalLink className="w-4 h-4 text-[#FDB659]" />
                                <span>Lihat Web Warga</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-[#8B7266]" />
                        </Link>
                    </nav>
                </div>

                {/* Profil Admin & Logout */}
                <div className="pt-6 border-t border-[#3D2516] flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#9B4000] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            <ShieldCheck className="w-5 h-5 text-[#FDB659]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">{admin?.name || "Administrator"}</span>
                            <span className="text-[10px] text-[#A68877] truncate">{admin?.email || "admin@melekisu.id"}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full mt-1 py-2 px-3 bg-[#28180C] hover:bg-red-950/50 hover:text-red-300 text-[#DEC0B3] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Sesi</span>
                    </button>
                </div>
            </aside>

            {/* Konten Halaman */}
            <main className="flex-1 p-6 sm:p-10 max-w-7xl">
                {children}
            </main>
        </div>
    );
}
