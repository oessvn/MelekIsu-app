import Link from "next/link";
import { Newspaper, Mail, MapPin } from "lucide-react";

/** Static copyright year — update annually or compute on the client */
const COPYRIGHT_YEAR = 2026;

const footerLinks = [
  {
    title: "Navigasi",
    links: [
      { href: "/", label: "Beranda" },
      { href: "/berita", label: "Berita" },
      { href: "/isu", label: "Isu Publik" },
    ],
  },
  {
    title: "Akun",
    links: [
      { href: "/masuk", label: "Masuk" },
      { href: "/daftar", label: "Daftar" },
      { href: "/dasbor", label: "Dasbor" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { href: "#", label: "Tentang Kami" },
      { href: "#", label: "Kebijakan Privasi" },
      { href: "#", label: "Syarat & Ketentuan" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-cream-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold text-primary-700"
            >
              <Newspaper className="h-5 w-5 text-primary-600" />
              <span className="font-editorial">
                Nusantara<span className="text-primary-500">Insight</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">
              Platform berita publik dan aspirasi warga untuk memantau isu-isu
              penting dan perkembangan kebijakan pemerintah.
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                info@wartagagasan.id
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Jakarta, Indonesia
              </span>
            </div>
          </div>

          {/* Link Groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-primary-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
          © {COPYRIGHT_YEAR} WartaGagasan. Semua hak dilindungi.
          <br />
          <span className="mt-1 inline-block">
            Data demo untuk pengembangan — bukan sumber berita resmi.
          </span>
        </div>
      </div>
    </footer>
  );
}
