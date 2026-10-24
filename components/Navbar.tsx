"use client";

import { useState } from "react";
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

const navLinks = [
  { href: "/", label: "Beranda", icon: null },
  { href: "/berita", label: "Berita", icon: Newspaper },
  { href: "/transparansi-aksi", label: "Transparansi Aksi", icon: AlertCircle },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Fungsi untuk menangani pencarian saat user menekan Enter atau submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Mengarahkan pengguna ke halaman berita dengan parameter pencarian
      router.push(`/berita?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">

        {/* Left: Logo & Nav Links (Beranda, Berita, Isu Publik) didekatkan */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary-700 shrink-0"
          >
            <Newspaper className="h-6 w-6 text-primary-600" />
            <span className="font-editorial">
              Nusantara<span className="text-primary-500">Insight</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Middle: Functional Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center flex-1 max-w-xs justify-end">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita atau isu..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-white text-gray-800 placeholder-gray-400 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-inner"
            />
          </div>
        </form>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <Link
            href="/masuk"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            <LogIn className="h-4 w-4" />
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <User className="h-4 w-4" />
            Daftar
          </Link>
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
        <div className="border-t border-gray-200 bg-cream md:hidden">
          <div className="px-4 py-3">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berita..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white text-gray-800 placeholder-gray-400 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500"
              />
            </form>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                >
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-gray-200" />
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
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-primary-700 justify-center"
              >
                <User className="h-4 w-4" />
                Daftar
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}