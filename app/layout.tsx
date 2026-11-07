import { Suspense } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MelekIsu",
    template: "%s | MelekIsu",
  },
  description:
    "Platform berita publik dan aspirasi warga Indonesia. Baca berita, sampaikan komentar konstruktif, dan pantau perkembangan isu-isu penting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#FFF8F5] text-[#28180C]">
        {/* Navbar dinamis yang otomatis mendeteksi sesi akun warga */}
        <Navbar />

        {/* Konten halaman utama */}
        <main className="flex-1">{children}</main>

        {/* Footer situs */}
        <Footer />

        {/* Widget Chatbot AI Asisten Kebijakan Publik */}
        <Suspense fallback={null}>
          <AIChatWidget />
        </Suspense>
      </body>
    </html>
  );
}