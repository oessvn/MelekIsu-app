import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { POLICY_DATASETS, getCategoryCoverImage, PolicyTopicDataset } from "@/lib/policyDatasets";
import { 
    EXTERNAL_NEWS_SOURCES, 
    fetchExternalLiveNews, 
    LiveExternalNewsItem 
} from "@/lib/externalNewsApi";

function getSupabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);
}

// Helper cerdas penentuan kategori kebijakan publik
function classifyPolicyCategory(title: string, desc: string = "", preferred?: string): string {
    if (preferred && preferred !== "Tata Kelola & Transparansi" && preferred !== "Kebijakan Publik") {
        return preferred;
    }
    const combined = `${title} ${desc}`.toLowerCase();
    
    // 1. Energi & Lingkungan
    if (combined.match(/energi|lingkungan|iklim|abrasi|pesisir|sampah|polusi|hutan|emisi|plts|surya|batu bara|tambang|bencana|banjir|konservasi|hijau|esdm|pln|bbm|pertamina/)) {
        return "Energi & Lingkungan";
    }
    // 2. Ketahanan Pangan & Pertanian
    if (combined.match(/pangan|beras|tani|pupuk|panen|pasar|ternak|sembako|konsumsi|harga|bulog|pertanian|perikanan|nelayan|devisa|inflasi|subsidi pangan|kebun|hortikultura/)) {
        return "Ketahanan Pangan";
    }
    // 3. Pendidikan & Talenta
    if (combined.match(/pendidikan|sekolah|guru|siswa|kuliah|mahasiswa|kampus|talenta|vokasi|kurikulum|akademik|pemuda|pahlawan|pelajar|beasiswa|riset|sdm/)) {
        return "Pendidikan & Talenta";
    }
    // 4. Infrastruktur Publik & Transportasi
    if (combined.match(/jalan|tol|jembatan|stasiun|kereta|bus|transit|pelabuhan|bandara|konstruksi|proyek|gedung|infrastruktur|kendaraan|mobil|motor|moda|transportasi|lrt|mrt|kcic|jalur/)) {
        return "Infrastruktur Publik";
    }
    // 5. Tata Kelola Publik (Pemerintahan, Regulasi, Anggaran)
    return "Tata Kelola Publik";
}

export async function POST(req: Request) {
    try {
        let body: any = {};
        try {
            body = await req.json();
        } catch {
            body = {};
        }

        const {
            topic,
            category: customCategory,
            source: customSource,
            datasetId,
            liveSourceId,
            liveArticle,
            autoPublish = true,
        } = body;

        let selectedDataset: PolicyTopicDataset | null = null;
        let selectedLiveItem: LiveExternalNewsItem | null = liveArticle || null;
        let liveSourceName = "";

        // 1. Jika pengguna meminta dari API Website Berita Luar (Live News Feed)
        if (liveSourceId && !selectedLiveItem) {
            const liveItems = await fetchExternalLiveNews(liveSourceId, 5);
            if (liveItems.length > 0) {
                selectedLiveItem = liveItems[0];
                liveSourceName = selectedLiveItem.sourceName;
            }
        } else if (selectedLiveItem) {
            liveSourceName = selectedLiveItem.sourceName;
        }

        // 2. Jika bukan dari Live Feed, gunakan Dataset Kebijakan atau Topik Kustom
        if (!selectedLiveItem) {
            if (datasetId) {
                selectedDataset = POLICY_DATASETS.find((d) => d.id === datasetId) || null;
            }

            if (!selectedDataset && !topic) {
                // Ambil acak dari kumpulan dataset kebijakan
                const randomIndex = Math.floor(Math.random() * POLICY_DATASETS.length);
                selectedDataset = POLICY_DATASETS[randomIndex];
            }
        }

        // Tentukan metadata artikel
        const topicTitle = selectedLiveItem?.title || topic || selectedDataset?.title || "Evaluasi Transparansi Kebijakan Publik Nasional";
        const initialSourceCategory = selectedLiveItem?.category || (selectedDataset ? selectedDataset.category : undefined);
        const topicCategory = customCategory || classifyPolicyCategory(topicTitle, selectedLiveItem?.description, initialSourceCategory);
        const topicSource = selectedLiveItem ? selectedLiveItem.sourceName : (customSource || selectedDataset?.source || "Redaksi Riset MelekIsu");
        const datasetOrigin = selectedLiveItem ? `Live API Feed (${selectedLiveItem.sourceName})` : (selectedDataset?.datasetOrigin || "Portal Data Terbuka");
        
        const keyPointsText = selectedLiveItem
            ? `- Berita Terkini dari ${selectedLiveItem.sourceName}: ${selectedLiveItem.description}\n- Tautan Asli: ${selectedLiveItem.link}`
            : (selectedDataset?.keyPoints?.map((p) => `- ${p}`).join("\n") || "- Fokus pada transparansi, efisiensi anggaran, dan dampak langsung bagi masyarakat.");

        const initialCoverImage = selectedLiveItem?.imageUrl || selectedDataset?.defaultImage || getCategoryCoverImage(topicCategory);

        const apiKey = process.env.GEMINI_API_KEY || "";
        const hasApiKey = Boolean(apiKey && apiKey.length > 20 && apiKey !== "masukkan_api_key_gemini_anda_di_sini");

        const currentDateStr = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        let generatedArticle: {
            title: string;
            slug: string;
            category: string;
            source: string;
            excerpt: string;
            content: string;
            duration: string;
            image: string;
            date: string;
            likes: number;
        } | null = null;

        if (hasApiKey) {
            const systemPrompt = `Anda adalah Jurnalis Kebijakan Publik & Asisten Redaksi Senior untuk platform jurnalisme warga "MelekIsu".
Tugas Anda adalah memproduksi atau mentransformasikan rilis berita/dataset kebijakan menjadi artikel analisis kebijakan publik yang mendalam, berimbang, berbasis data, dan mudah dipahami oleh masyarakat umum.

Kaidah Penulisan MelekIsu:
1. JUDUL: Tajam, informatif, menarik, dan berbobot (gaya jurnalisme kebijakan terpercaya, tidak sensasional atau clickbait).
2. RINGKASAN (EXCERPT): 1-2 kalimat padat yang merangkum esensi utama kebijakan dan dampaknya bagi masyarakat.
3. ISI ARTIKEL (CONTENT):
   - Terdiri dari 3 sampai 4 paragraf komprehensif.
   - Paragraf 1: Latar belakang dan fakta peristiwa/kebijakan terbaru yang dilaporkan.
   - Paragraf 2: Rincian data, mekanisme implementasi, alokasi anggaran, atau konteks regulasi di lapangan.
   - Paragraf 3: Dampak nyata bagi kesejahteraan masyarakat, pelayanan publik, atau perekonomian rakyat.
   - Paragraf 4: Poin refleksi pentingnya pengawasan partisipatif warga untuk memastikan keterbukaan informasi.
   - Gunakan gaya bahasa Indonesia yang lugas, baku, dan inspiratif.
4. KATEGORI: Wajib tentukan SATU kategori yang PALING TEPAT dan RELEVAN dari 5 kategori resmi MelekIsu berikut:
   - "Infrastruktur Publik" (transportasi, jalan, jembatan, tol, stasiun, fasilitas fisik, mobilitas publik)
   - "Ketahanan Pangan" (pertanian, sembako, beras, pupuk, perikanan, ekonomi pasar, subsidi pangan)
   - "Pendidikan & Talenta" (sekolah, kurikulum, guru, beasiswa, kampus, universitas, talenta, riset)
   - "Tata Kelola Publik" (regulasi, tata kelola, transparansi, hukum, birokrasi, pemda, anggaran daerah/nasional)
   - "Energi & Lingkungan" (transisi energi, iklim, abrasi, polusi, emisi, plts, hutan, konservasi)
5. FORMAT OUTPUT: Wajib HANYA berupa JSON murni tanpa pembungkus markdown (tanpa \`\`\`json).

Format JSON yang wajib dihasilkan:
{
  "title": "Judul berita lengkap dan profesional",
  "category": "Pilih salah satu dari 5 kategori resmi di atas",
  "source": "${topicSource}",
  "excerpt": "Ringkasan tajam 1-2 kalimat.",
  "content": "Isi lengkap artikel kebijakan dalam 3-4 paragraf yang terhubung rapi.",
  "duration": "4 Menit Baca"
}`;

            const userPrompt = `Tolong kembangkan dan susun artikel kebijakan publik berkualitas tinggi berdasarkan rujukan data berikut:

Sumber / Kantor Berita: ${topicSource}
Basis Masukan: ${datasetOrigin}
Judul Berita Awal: ${topicTitle}
Konteks & Ringkasan Peristiwa:
${keyPointsText}

Buatkan artikel lengkap siap terbit ke portal publik MelekIsu.`;

            const candidateModels = [
                "gemini-3.5-flash-lite",
                "gemini-3.5-flash",
                "gemini-3.8-flash"
            ];

            for (const model of candidateModels) {
                try {
                    const response = await fetch(
                        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            signal: AbortSignal.timeout(7000),
                            body: JSON.stringify({
                                systemInstruction: { parts: [{ text: systemPrompt }] },
                                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                                generationConfig: {
                                    temperature: 0.3,
                                    maxOutputTokens: 1500
                                }
                            })
                        }
                    );

                    if (!response.ok) continue;

                    const data = await response.json();
                    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!rawText) continue;

                    const cleanedJson = rawText
                        .replace(/```json/gi, "")
                        .replace(/```/g, "")
                        .trim();

                    const parsed = JSON.parse(cleanedJson);
                    if (parsed.title && parsed.content) {
                        const finalTitle = parsed.title.trim();
                        const baseSlug = generateSlug(finalTitle);

                        const standardCategories = [
                            "Infrastruktur Publik",
                            "Ketahanan Pangan",
                            "Pendidikan & Talenta",
                            "Tata Kelola Publik",
                            "Energi & Lingkungan"
                        ];
                        const rawCat = (parsed.category || topicCategory || "").trim();
                        const matchedCat = standardCategories.find(c => c.toLowerCase() === rawCat.toLowerCase());
                        const resolvedCategory = matchedCat || classifyPolicyCategory(finalTitle, parsed.excerpt || parsed.content, topicCategory);
                        const resolvedImage = selectedLiveItem?.imageUrl || getCategoryCoverImage(resolvedCategory);

                        generatedArticle = {
                            title: finalTitle,
                            slug: baseSlug,
                            category: resolvedCategory,
                            source: parsed.source || topicSource,
                            excerpt: parsed.excerpt || parsed.content.slice(0, 160) + "...",
                            content: parsed.content,
                            duration: parsed.duration || "4 Menit Baca",
                            image: resolvedImage,
                            date: currentDateStr,
                            likes: 0
                        };
                        break;
                    }
                } catch (err) {
                    console.warn(`Model ${model} error or timeout saat generate berita:`, err);
                }
            }
        }

        // Fallback jika API key tidak tersedia atau model gagal
        if (!generatedArticle) {
            const fallbackTitle = topicTitle;
            const fallbackSlug = generateSlug(fallbackTitle);
            const fallbackCategory = classifyPolicyCategory(fallbackTitle, selectedLiveItem?.description || "", topicCategory);
            const fallbackImage = selectedLiveItem?.imageUrl || getCategoryCoverImage(fallbackCategory);
            const fallbackContent = `Pemerintah bersama ${topicSource} terus memperkuat keterbukaan dan efektivitas implementasi kebijakan ${topicTitle}. Langkah ini menjadi bagian penting dalam memastikan pelayanan publik dapat diakses secara merata oleh masyarakat.\n\nBerdasarkan data dan rilis pemantauan berkala, sinergi antarsektor serta transparansi pengawasan digital terus ditingkatkan. Keterlibatan masyarakat melalui pemberian aspirasi, masukan solutif, serta pemantauan independen dinilai menjadi fondasi utama dalam menjaga akuntabilitas setiap kebijakan publik.\n\nMelalui publikasi berkala pada platform MelekIsu, warga diimbau untuk terus mengawal pelaksanaan program ini secara kritis dan konstruktif.`;

            generatedArticle = {
                title: fallbackTitle,
                slug: fallbackSlug,
                category: fallbackCategory,
                source: topicSource,
                excerpt: selectedLiveItem?.description || `Laporan perkembangan terbaru kebijakan ${topicTitle} bersama ${topicSource} untuk meningkatkan transparansi publik.`,
                content: fallbackContent,
                duration: "3 Menit Baca",
                image: fallbackImage,
                date: currentDateStr,
                likes: 0
            };
        }

        // 3. Simpan Otomatis ke Database Supabase jika autoPublish disetel true
        let supabaseSaved = false;
        let finalSavedSlug = generatedArticle.slug;
        const supabase = getSupabaseClient();

        if (autoPublish && supabase) {
            try {
                // Pastikan slug unik
                const { data: existingNews } = await supabase
                    .from("news")
                    .select("slug")
                    .eq("slug", generatedArticle.slug)
                    .maybeSingle();

                if (existingNews) {
                    finalSavedSlug = `${generatedArticle.slug}-${Date.now().toString().slice(-4)}`;
                    generatedArticle.slug = finalSavedSlug;
                }

                const insertPayload = {
                    title: generatedArticle.title,
                    slug: generatedArticle.slug,
                    category: generatedArticle.category,
                    source: generatedArticle.source,
                    excerpt: generatedArticle.excerpt,
                    content: generatedArticle.content,
                    date: generatedArticle.date,
                    duration: generatedArticle.duration,
                    image: generatedArticle.image,
                    likes: 0
                };

                const { data: inserted, error: insertError } = await supabase
                    .from("news")
                    .insert([insertPayload])
                    .select();

                if (!insertError && inserted && inserted.length > 0) {
                    supabaseSaved = true;
                } else if (insertError) {
                    console.error("Gagal menyimpan berita otomatis ke Supabase:", insertError);
                }
            } catch (dbErr) {
                console.error("Supabase exception saat auto-publish berita:", dbErr);
            }
        }

        return NextResponse.json({
            success: true,
            published: supabaseSaved,
            sourceType: selectedLiveItem ? "live_news_api" : (selectedDataset ? "dataset" : "custom"),
            sourceName: topicSource,
            news: generatedArticle,
            message: supabaseSaved
                ? `Berita dari ${topicSource} berhasil dianalisis AI dan langsung diterbitkan ke Supabase Cloud!`
                : `Draf berita dari ${topicSource} berhasil diproduksi AI dan siap ditinjau.`
        });

    } catch (error: any) {
        console.error("Gagal menjalankan AI Auto-News:", error);
        return NextResponse.json({
            success: false,
            message: "Terjadi kendala saat memproduksi berita otomatis AI: " + (error?.message || error)
        }, { status: 500 });
    }
}

// Handler GET: Mendukung fetching live RSS feeds dan webhook cron
export async function GET(req: Request) {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Jika dipanggil dengan action=feed, kembalikan daftar headline live dari website berita luar
    if (action === "feed") {
        const sourceId = url.searchParams.get("sourceId") || "antara-politik";
        const items = await fetchExternalLiveNews(sourceId, 8);
        return NextResponse.json({
            success: true,
            sources: EXTERNAL_NEWS_SOURCES,
            activeSourceId: sourceId,
            items: items
        });
    }

    // Default: Webhook trigger
    const datasetId = url.searchParams.get("datasetId") || undefined;
    const topic = url.searchParams.get("topic") || undefined;
    const liveSourceId = url.searchParams.get("liveSourceId") || undefined;

    const fakeReq = new Request(req.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, topic, liveSourceId, autoPublish: true })
    });

    return POST(fakeReq);
}
