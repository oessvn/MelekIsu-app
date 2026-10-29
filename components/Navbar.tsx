"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Newspaper,
  AlertCircle,
  LogIn,
  User,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { href: "/", label: "Beranda", icon: null },
  { href: "/berita", label: "Berita", icon: Newspaper },
  { href: "/transparansi-aksi", label: "Transparansi Aksi", icon: AlertCircle },
];

interface NavUserProfile {
  id?: string;
  fullName: string;
  emailOrPhone?: string;
  role?: string;
  joinedDate?: string;
}

interface AuthUserLike {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
  created_at?: string;
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<NavUserProfile | null>(null);
  const router = useRouter();

  // Sinkronisasi sesi user Supabase & localStorage secara real-time
  useEffect(() => {
    const supabase = createClient();

    const formatUserProfile = (authUser: AuthUserLike): NavUserProfile => {
      return {
        id: authUser.id,
        fullName: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Warga",
        emailOrPhone: authUser.email,
        role: authUser.user_metadata?.role || "Warga Terverifikasi",
        joinedDate: authUser.created_at
          ? new Date(authUser.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
          : "Terdaftar",
      };
    };

    // 1. Cek sesi user Supabase awal
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const profile = formatUserProfile(user);
        setCurrentUser(profile);
        localStorage.setItem("current_user", JSON.stringify(profile));
      } else {
        const activeUser = localStorage.getItem("current_user");
        if (activeUser) {
          try {
            setCurrentUser(JSON.parse(activeUser));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    });

    // 2. Dengarkan perubahan status auth dari Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile = formatUserProfile(session.user);
        setCurrentUser(profile);
        localStorage.setItem("current_user", JSON.stringify(profile));
      } else {
        setCurrentUser(null);
        localStorage.removeItem("current_user");
      }
    });

    // 3. Dengarkan event storage untuk sinkronisasi antar tab
    const handleStorage = () => {
      const activeUser = localStorage.getItem("current_user");
      if (activeUser) {
        try {
          setCurrentUser(JSON.parse(activeUser));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Fungsi untuk menangani pencarian saat user menekan Enter atau submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/berita?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Fungsi untuk menghapus seluruh teks pada kolom pencarian
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#DEC0B3]/40 bg-[#FFF8F5]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

        {/* Left: Logo & Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#9B4000] shrink-0"
          >
            <Newspaper className="h-6 w-6 text-[#9B4000]" />
            <span className="font-editorial">
              Nusantara<span className="text-[#FDB659]">Insight</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-[#FFF1E9] hover:text-[#9B4000]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Middle: Functional Search Bar with Clear (X) Button */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xs justify-end">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita atau isu..."
              className="w-full pl-9 pr-8 py-1.5 text-sm bg-white text-gray-800 placeholder-gray-400 rounded-lg border border-[#DEC0B3]/60 focus:outline-none focus:border-[#9B4000] focus:ring-1 focus:ring-[#9B4000] transition-all shadow-inner"
            />

            {/* Tombol X untuk menghapus teks pencarian (hanya muncul saat ada teks diketik) */}
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#9B4000] p-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Desktop Auth / User Profile */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {currentUser ? (
            /* Jika sudah login, tampilkan profil mini */
            <Link
              href="/profil"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF1E9] hover:bg-[#FFE5D4] text-[#9B4000] rounded-xl border border-[#DEC0B3]/60 transition-all shadow-2xs group"
            >
              <div className="w-7 h-7 rounded-full bg-[#9B4000] text-white flex items-center justify-center text-xs font-extrabold shadow-inner">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "W"}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-extrabold text-[#28180C] group-hover:text-[#9B4000] transition-colors">
                  {currentUser.fullName ? currentUser.fullName.split(" ")[0] : "Warga"}
                </span>
                <span className="text-[9px] text-[#8B7266] uppercase font-bold tracking-tight">Warga</span>
              </div>
            </Link>
          ) : (
            /* Jika belum login */
            <>
              <Link
                href="/masuk"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="flex items-center gap-1.5 rounded-lg bg-[#9B4000] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#8C4A1E]"
              >
                <User className="h-4 w-4" />
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-[#DEC0B3]/40 bg-[#FFF8F5] md:hidden">
          <div className="px-4 py-3">
            {/* Mobile Search Bar with Clear Button */}
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berita..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 rounded-lg border border-[#DEC0B3]/60 focus:outline-none focus:border-[#9B4000]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#9B4000] p-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-[#FFF1E9] hover:text-[#9B4000]"
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-[#DEC0B3]/40" />

              {currentUser ? (
                <Link
                  href="/profil"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-[#FFF1E9] px-3 py-2.5 text-sm font-bold text-[#9B4000] transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profil Saya ({currentUser.fullName})
                </Link>
              ) : (
                <>
                  <Link
                    href="/masuk"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </Link>
                  <Link
                    href="/daftar"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-[#9B4000] px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#8C4A1E] justify-center"
                  >
                    <User className="h-4 w-4" />
                    Daftar
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
