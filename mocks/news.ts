import { NewsArticle } from "@/types/models";

export const mockNews: NewsArticle[] = [
  {
    id: "news-1",
    title: "Pembangunan MRT Fase 3 Ditargetkan Selesai 2028",
    slug: "pembangunan-mrt-fase-3-ditargetkan-selesai-2028",
    excerpt:
      "Pemprov DKI Jakarta mengumumkan bahwa proyek MRT Fase 3 yang menghubungkan Kampung Bandan hingga Ancol Barat ditargetkan rampung pada akhir tahun 2028.",
    content: `
<p>Pemprov DKI Jakarta mengumumkan bahwa proyek MRT Fase 3 yang menghubungkan Kampung Bandan hingga Ancol Barat ditargetkan rampung pada akhir tahun 2028. Proyek ini merupakan kelanjutan dari MRT Fase 1 dan Fase 2 yang telah beroperasi melayani warga Jakarta.</p>

<p>Direktur Utama PT MRT Jakarta, dalam konferensi pers di Balai Kota, menyatakan bahwa progres konstruksi saat ini telah mencapai 35 persen. "Kami optimis target penyelesaian dapat tercapai sesuai jadwal," ujarnya.</p>

<p>Fase 3 ini akan menambah 7 stasiun baru dan diperkirakan mampu mengangkut hingga 200.000 penumpang per hari. Pembangunan ini juga mencakup integrasi dengan moda transportasi lain seperti TransJakarta dan KRL Commuter Line.</p>

<p>Warga Jakarta menyambut positif rencana ini. "Saya berharap MRT bisa menjangkau lebih banyak wilayah sehingga kemacetan bisa berkurang," kata Rina, warga Kelapa Gading yang diwawancarai di stasiun Bundaran HI.</p>

<p>Pemprov juga memastikan bahwa proyek ini dilaksanakan dengan memperhatikan aspek lingkungan dan sosial, termasuk relokasi warga terdampak yang dilakukan secara manusiawi dan sesuai regulasi.</p>
    `.trim(),
    coverImageUrl: "/images/mrt-jakarta.jpg",
    source: "Kompas.com",
    sourceUrl: "https://kompas.com",
    categoryId: "cat-5",
    status: "published",
    likeCount: 245,
    commentCount: 18,
    publishedAt: "2026-10-18T09:00:00Z",
    createdAt: "2026-10-18T08:00:00Z",
    updatedAt: "2026-10-18T09:00:00Z",
  },
  {
    id: "news-2",
    title: "Program Makan Bergizi Gratis Diperluas ke 15 Provinsi",
    slug: "program-makan-bergizi-gratis-diperluas-ke-15-provinsi",
    excerpt:
      "Kementerian Pendidikan mengumumkan perluasan program makan bergizi gratis yang kini mencakup 15 provinsi di seluruh Indonesia.",
    content: `
<p>Kementerian Pendidikan mengumumkan perluasan program makan bergizi gratis yang kini mencakup 15 provinsi di seluruh Indonesia. Program ini sebelumnya hanya berjalan di 5 provinsi pada fase uji coba.</p>

<p>Menteri Pendidikan menjelaskan bahwa program ini bertujuan meningkatkan gizi anak sekolah, terutama di daerah dengan tingkat stunting tinggi. "Nutrisi yang baik adalah fondasi bagi generasi cerdas Indonesia," ujarnya.</p>

<p>Anggaran yang dialokasikan untuk tahap perluasan ini mencapai Rp 15 triliun. Dana tersebut berasal dari APBN dan sebagian dari kerjasama dengan sektor swasta melalui program CSR.</p>

<p>Di Jawa Timur, salah satu provinsi penerima program, Gubernur menyatakan kesiapannya. "Kami telah menyiapkan dapur dan tenaga penyedia makanan di 2.500 sekolah dasar," ungkapnya.</p>

<p>Organisasi masyarakat sipil mengapresiasi langkah ini namun meminta agar pengawasan kualitas makanan diperketat untuk memastikan standar gizi terpenuhi.</p>
    `.trim(),
    coverImageUrl: "/images/makan-bergizi.jpg",
    source: "Detik.com",
    sourceUrl: "https://detik.com",
    categoryId: "cat-2",
    status: "published",
    likeCount: 189,
    commentCount: 24,
    publishedAt: "2026-10-17T14:30:00Z",
    createdAt: "2026-10-17T13:00:00Z",
    updatedAt: "2026-10-17T14:30:00Z",
  },
  {
    id: "news-3",
    title: "Jakarta Tambah 50 Taman Kota Baru untuk Ruang Terbuka Hijau",
    slug: "jakarta-tambah-50-taman-kota-baru",
    excerpt:
      "Pemprov DKI Jakarta berencana menambah 50 taman kota baru dalam upaya meningkatkan ruang terbuka hijau dari 9,9% menjadi 15% pada tahun 2030.",
    content: `
<p>Pemprov DKI Jakarta berencana menambah 50 taman kota baru dalam upaya meningkatkan ruang terbuka hijau (RTH) dari 9,9% menjadi 15% pada tahun 2030. Rencana ini disampaikan oleh Kepala Dinas Pertamanan dan Hutan Kota DKI Jakarta.</p>

<p>"Taman-taman baru ini akan tersebar di lima wilayah kota administrasi. Kami prioritaskan di wilayah yang masih minim RTH seperti Jakarta Utara dan Jakarta Barat," jelasnya.</p>

<p>Setiap taman dirancang dengan konsep taman inklusif yang ramah bagi penyandang disabilitas, lansia, dan anak-anak. Fasilitas yang akan disediakan meliputi jogging track, area bermain anak, dan ruang komunitas.</p>

<p>Pembiayaan proyek ini menggunakan skema campuran antara APBD dan kerjasama dengan pengembang properti yang diwajibkan menyediakan RTH sebagai bagian dari izin pembangunan.</p>

<p>Aktivis lingkungan menyambut baik rencana ini tetapi mengingatkan pentingnya pemeliharaan jangka panjang. "Membangun taman mudah, memeliharanya yang sulit," ujar Koordinator Jakarta Hijau.</p>
    `.trim(),
    coverImageUrl: "/images/taman-kota.jpg",
    source: "Tempo.co",
    sourceUrl: "https://tempo.co",
    categoryId: "cat-4",
    status: "published",
    likeCount: 156,
    commentCount: 12,
    publishedAt: "2026-10-16T11:00:00Z",
    createdAt: "2026-10-16T10:00:00Z",
    updatedAt: "2026-10-16T11:00:00Z",
  },
  {
    id: "news-4",
    title: "Revitalisasi Pasar Tradisional di 10 Kecamatan Dimulai",
    slug: "revitalisasi-pasar-tradisional-di-10-kecamatan",
    excerpt:
      "Program revitalisasi pasar tradisional resmi dimulai di 10 kecamatan. Modernisasi ini bertujuan meningkatkan kenyamanan pedagang dan pembeli.",
    content: `
<p>Program revitalisasi pasar tradisional resmi dimulai di 10 kecamatan di Jakarta. Proyek bernilai Rp 800 miliar ini bertujuan memodernisasi fasilitas pasar tanpa menghilangkan karakter tradisionalnya.</p>

<p>Dinas Perdagangan DKI Jakarta menjelaskan bahwa revitalisasi mencakup perbaikan struktur bangunan, sistem drainase, area parkir, dan pengelolaan limbah. "Pasar tradisional harus bisa bersaing dengan pasar modern dalam hal kebersihan dan kenyamanan," ujar Kepala Dinas.</p>

<p>Para pedagang di Pasar Mayestik, salah satu pasar yang masuk program, menyambut positif rencana ini. "Asal tidak mengganggu aktivitas jual beli terlalu lama dan kami tetap bisa berjualan selama renovasi," harap Pak Hasan, pedagang kain.</p>

<p>Revitalisasi direncanakan secara bertahap agar pedagang tidak kehilangan pendapatan selama proses pembangunan berlangsung.</p>
    `.trim(),
    coverImageUrl: "/images/pasar-tradisional.jpg",
    source: "CNN Indonesia",
    sourceUrl: "https://cnnindonesia.com",
    categoryId: "cat-6",
    status: "published",
    likeCount: 98,
    commentCount: 7,
    publishedAt: "2026-10-15T08:00:00Z",
    createdAt: "2026-10-15T07:00:00Z",
    updatedAt: "2026-10-15T08:00:00Z",
  },
  {
    id: "news-5",
    title: "Puskesmas di Jakarta Kini Buka Layanan 24 Jam",
    slug: "puskesmas-di-jakarta-kini-buka-layanan-24-jam",
    excerpt:
      "Sebanyak 30 puskesmas di Jakarta mulai membuka layanan 24 jam untuk meningkatkan akses kesehatan masyarakat, terutama di malam hari.",
    content: `
<p>Dinas Kesehatan DKI Jakarta mengumumkan bahwa 30 puskesmas kini beroperasi 24 jam. Kebijakan ini diambil untuk mengurangi beban IGD rumah sakit dan meningkatkan akses kesehatan dasar bagi warga.</p>

<p>"Banyak kasus darurat yang sebenarnya bisa ditangani di puskesmas. Dengan layanan 24 jam, warga tidak perlu langsung ke rumah sakit untuk kasus-kasus ringan hingga sedang," jelas Kepala Dinas Kesehatan.</p>

<p>Puskesmas 24 jam dilengkapi dengan dokter jaga, perawat, dan obat-obatan esensial. Layanan yang tersedia meliputi pemeriksaan umum, penanganan luka, dan stabilisasi pasien sebelum dirujuk.</p>

<p>Warga Cempaka Putih mengapresiasi kebijakan ini. "Dulu kalau anak sakit malam-malam harus ke rumah sakit yang antrinya panjang. Sekarang bisa ke puskesmas terdekat," kata Ibu Dewi.</p>
    `.trim(),
    coverImageUrl: "/images/puskesmas.jpg",
    source: "Republika.co.id",
    sourceUrl: "https://republika.co.id",
    categoryId: "cat-3",
    status: "published",
    likeCount: 312,
    commentCount: 31,
    publishedAt: "2026-10-14T16:00:00Z",
    createdAt: "2026-10-14T15:00:00Z",
    updatedAt: "2026-10-14T16:00:00Z",
  },
  {
    id: "news-6",
    title: "Jembatan Penyeberangan Modern Dibangun di 8 Titik Rawan",
    slug: "jembatan-penyeberangan-modern-dibangun-di-8-titik-rawan",
    excerpt:
      "Pembangunan jembatan penyeberangan orang (JPO) modern dengan eskalator dan atap dimulai di 8 titik rawan kecelakaan pejalan kaki.",
    content: `
<p>Dinas Bina Marga DKI Jakarta memulai pembangunan 8 jembatan penyeberangan orang (JPO) modern di titik-titik rawan kecelakaan pejalan kaki. JPO baru ini dilengkapi eskalator, atap pelindung, dan pencahayaan LED.</p>

<p>"Desain JPO lama yang hanya berupa tangga sering dihindari pejalan kaki karena tidak nyaman. JPO baru ini dirancang agar lebih aksesibel dan menarik untuk digunakan," kata Kepala Dinas Bina Marga.</p>

<p>Lokasi pembangunan meliputi koridor Sudirman-Thamrin, Jalan Gatot Subroto, dan beberapa titik di Jakarta Timur yang memiliki volume pejalan kaki tinggi.</p>

<p>Anggaran pembangunan sebesar Rp 240 miliar bersumber dari APBD DKI Jakarta. Konstruksi diperkirakan selesai dalam 8 bulan.</p>
    `.trim(),
    coverImageUrl: "/images/jpo-modern.jpg",
    source: "Bisnis.com",
    sourceUrl: "https://bisnis.com",
    categoryId: "cat-1",
    status: "published",
    likeCount: 87,
    commentCount: 5,
    publishedAt: "2026-10-13T10:00:00Z",
    createdAt: "2026-10-13T09:00:00Z",
    updatedAt: "2026-10-13T10:00:00Z",
  },
];
