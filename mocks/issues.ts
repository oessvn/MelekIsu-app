import { Issue, ProgressUpdate } from "@/types/models";

export const mockIssues: Issue[] = [
  {
    id: "issue-1",
    title: "Banjir Tahunan di Jakarta Selatan",
    description:
      "Banjir rutin terjadi setiap musim hujan di beberapa kelurahan di Jakarta Selatan, terutama di sekitar Kemang dan Cipete. Warga menuntut perbaikan sistem drainase dan normalisasi sungai.",
    status: "Sedang diproses",
    categoryId: "cat-1",
    linkedNewsIds: ["news-6"],
    followerCount: 1243,
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2026-10-10T00:00:00Z",
  },
  {
    id: "issue-2",
    title: "Kekurangan Guru di Sekolah Pinggiran Jakarta",
    description:
      "Beberapa sekolah dasar di wilayah pinggiran Jakarta kekurangan tenaga pengajar, terutama guru matematika dan IPA. Rasio guru-murid jauh di bawah standar nasional.",
    status: "Belum ditindaklanjuti",
    categoryId: "cat-2",
    linkedNewsIds: ["news-2"],
    followerCount: 567,
    createdAt: "2025-09-15T00:00:00Z",
    updatedAt: "2026-10-12T00:00:00Z",
  },
  {
    id: "issue-3",
    title: "Antrian Panjang BPJS di Rumah Sakit Umum",
    description:
      "Pasien BPJS mengeluhkan antrian yang sangat panjang di beberapa rumah sakit umum daerah. Waktu tunggu bisa mencapai 4-6 jam untuk mendapat pelayanan.",
    status: "Sedang diproses",
    categoryId: "cat-3",
    linkedNewsIds: ["news-5"],
    followerCount: 2105,
    createdAt: "2025-03-20T00:00:00Z",
    updatedAt: "2026-10-08T00:00:00Z",
  },
  {
    id: "issue-4",
    title: "Kemacetan Parah di Koridor Bekasi-Jakarta",
    description:
      "Kemacetan kronis di jalur Bekasi-Jakarta terutama pada jam berangkat dan pulang kerja. Dibutuhkan solusi transportasi massal yang efektif.",
    status: "Selesai",
    categoryId: "cat-5",
    linkedNewsIds: ["news-1"],
    followerCount: 3890,
    createdAt: "2024-11-01T00:00:00Z",
    updatedAt: "2026-09-30T00:00:00Z",
  },
  {
    id: "issue-5",
    title: "Sampah Menumpuk di Bantaran Kali Ciliwung",
    description:
      "Tumpukan sampah di bantaran Kali Ciliwung menimbulkan bau tidak sedap dan menjadi sarang nyamuk. Warga meminta aksi pembersihan dan penegakan hukum bagi pembuang sampah sembarangan.",
    status: "Belum ditindaklanjuti",
    categoryId: "cat-4",
    linkedNewsIds: ["news-3"],
    followerCount: 876,
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
];

export const mockProgressUpdates: ProgressUpdate[] = [
  {
    id: "progress-1",
    issueId: "issue-1",
    status: "Belum ditindaklanjuti",
    summary: "Laporan warga diterima melalui portal pengaduan DKI Jakarta.",
    date: "2025-06-01",
    createdAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "progress-2",
    issueId: "issue-1",
    status: "Sedang diproses",
    summary:
      "Dinas PU memulai survei lapangan untuk normalisasi drainase di 3 kelurahan terdampak.",
    officialSourceUrl: "https://jakarta.go.id/berita/drainase-survei",
    linkedNewsId: "news-6",
    date: "2026-02-15",
    createdAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "progress-3",
    issueId: "issue-1",
    status: "Sedang diproses",
    summary:
      "Pengerjaan perbaikan saluran drainase sepanjang 2,5 km dimulai di Kemang.",
    officialSourceUrl: "https://jakarta.go.id/berita/drainase-kemang",
    date: "2026-08-20",
    createdAt: "2026-08-20T00:00:00Z",
  },
  {
    id: "progress-4",
    issueId: "issue-3",
    status: "Belum ditindaklanjuti",
    summary: "Pengaduan warga masuk melalui Ombudsman RI.",
    date: "2025-03-20",
    createdAt: "2025-03-20T00:00:00Z",
  },
  {
    id: "progress-5",
    issueId: "issue-3",
    status: "Sedang diproses",
    summary:
      "Kemenkes menambah kuota dokter spesialis di 5 RSUD dan menerapkan sistem antrian online.",
    officialSourceUrl: "https://kemenkes.go.id/antrian-online",
    linkedNewsId: "news-5",
    date: "2026-06-10",
    createdAt: "2026-06-10T00:00:00Z",
  },
  {
    id: "progress-6",
    issueId: "issue-4",
    status: "Belum ditindaklanjuti",
    summary: "Petisi warga Bekasi mengenai kemacetan disampaikan ke DPRD.",
    date: "2024-11-01",
    createdAt: "2024-11-01T00:00:00Z",
  },
  {
    id: "progress-7",
    issueId: "issue-4",
    status: "Sedang diproses",
    summary: "Rencana pembangunan jalur kereta ekspres Bekasi-Jakarta disetujui.",
    officialSourceUrl: "https://kemenhub.go.id/kereta-ekspres-bekasi",
    linkedNewsId: "news-1",
    date: "2025-06-01",
    createdAt: "2025-06-01T00:00:00Z",
  },
  {
    id: "progress-8",
    issueId: "issue-4",
    status: "Selesai",
    summary:
      "Jalur kereta ekspres Bekasi-Jakarta beroperasi penuh, waktu tempuh turun dari 2 jam menjadi 35 menit.",
    officialSourceUrl: "https://kemenhub.go.id/kereta-ekspres-operasi",
    date: "2026-09-30",
    createdAt: "2026-09-30T00:00:00Z",
  },
];
