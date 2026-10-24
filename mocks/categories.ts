import { Category } from "@/types/models";

export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Infrastruktur",
    slug: "infrastruktur",
    description: "Berita seputar pembangunan jalan, jembatan, dan fasilitas publik.",
    icon: "building-2",
    newsCount: 12,
  },
  {
    id: "cat-2",
    name: "Pendidikan",
    slug: "pendidikan",
    description: "Perkembangan kebijakan dan program pendidikan.",
    icon: "graduation-cap",
    newsCount: 8,
  },
  {
    id: "cat-3",
    name: "Kesehatan",
    slug: "kesehatan",
    description: "Informasi kesehatan masyarakat dan layanan rumah sakit.",
    icon: "heart-pulse",
    newsCount: 10,
  },
  {
    id: "cat-4",
    name: "Lingkungan",
    slug: "lingkungan",
    description: "Isu lingkungan, pengelolaan sampah, dan ruang terbuka hijau.",
    icon: "trees",
    newsCount: 6,
  },
  {
    id: "cat-5",
    name: "Transportasi",
    slug: "transportasi",
    description: "Berita transportasi umum dan kebijakan lalu lintas.",
    icon: "bus",
    newsCount: 9,
  },
  {
    id: "cat-6",
    name: "Ekonomi",
    slug: "ekonomi",
    description: "Perkembangan ekonomi lokal dan kebijakan fiskal.",
    icon: "trending-up",
    newsCount: 7,
  },
];
