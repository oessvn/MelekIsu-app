import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { POLICY_DATASETS, getCategoryCoverImage, PolicyTopicDataset } from "@/lib/policyDatasets";

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
            autoPublish = true,
        } = body;

        // 1. Tentukan dataset acuan atau topik yang diminta
        let selectedDataset: PolicyTopicDataset | null = null;
        if (datasetId) {
            selectedDataset = POLICY_DATASETS.find((d) => d.id === datasetId) || null;
        }

        if (!selectedDataset && !topic) {
            // Ambil acak dari kumpulan dataset kebijakan
            const randomIndex = Math.floor(Math.random() * POLICY_DATASETS.length);
            selectedDataset = POLICY_DATASETS[randomIndex];
        }

        const topicTitle = topic || selectedDataset?.title || "Evaluasi Transparansi Kebijakan Publik Nasional";
        const topicCategory = customCategory || selectedDataset?.category || "Tata Kelola & Transparansi";
        const topicSource = customSource || selectedDataset?.source || "Redaksi Riset Kebijakan MelekIsu";
        const datasetOrigin = selectedDataset?.datasetOrigin || "Portal Data Kebijakan Terbuka";
        const keyPointsText = selectedDataset?.keyPoints?.map((p) => `- ${p}`).join("\n") || "- Fokus pada keterbukaan, efisiensi anggaran, dan dampak langsung bagi masyarakat.";

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
Tugas Anda adalah memproduksi artikel berita analisis kebijakan publik yang mendalam, berimbang, berbasis data, dan mudah dipahami oleh masyarakat umum.

Kaidah Penulisan MelekIsu:
1. JUDUL: Tajam, informatif, menarik, dan objektif (gaya jurnalisme kebijakan terpercaya, hindari clickbait murahan).
2. RINGKASAN (EXCERPT): 1-2 kalimat padat yang merangkum esensi utama kebijakan dan dampaknya bagi masyarakat.
3. ISI ARTIKEL (CONTENT):
   - Terdiri dari 3 sampai 4 paragraf komprehensif.
   - Paragraf 1: Latar belakang dan pengumuman resmi kebijakan terbaru.
   - Paragraf 2: Rincian data, mekanisme implementasi, alokasi anggaran, atau integrasi sistem di lapangan.
   - Paragraf 3: Dampak langsung bagi kesejahteraan warga dan keterbukaan akses layanan publik.
   - Paragraf 4: Harapan pengawasan partisipatif masyarakat untuk menjamin akuntabilitas.
   - Gunakan gaya bahasa Indonesia yang lugas, baku, dan inspiratif.
4. KATEGORI & SUMBER: Tetap konsisten dengan konteks isu yang diberikan.
5. FORMAT OUTPUT: Wajib HANYA berupa JSON murni tanpa pembungkus markdown (tanpa \`\`\`json).

Format JSON yang wajib dihasilkan:
{
  "title": "Judul berita lengkap dan profesional",
  "category": "${topicCategory}",
  "source": "${topicSource}",
  "excerpt": "Ringkasan tajam 1-2 kalimat.",
  "content": "Isi lengkap artikel kebijakan dalam 3-4 paragraf yang terhubung rapi.",
  "duration": "4 Menit Baca"
}`;

            const userPrompt = `Buatkan artikel berita kebijakan publik komprehensif berdasarkan rujukan dataset berikut:

Topik Isu / Rilis Kebijakan: ${topicTitle}
Kategori Isu: ${topicCategory}
Sumber Resmi: ${topicSource}
Basis Dataset: ${datasetOrigin}
Poin Data & Substansi Kunci:
${keyPointsText}

Tuliskan artikel berkualitas tinggi yang siap dipublikasikan ke portal publik MelekIsu.`;

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
                        const finalImage = selectedDataset?.defaultImage || getCategoryCoverImage(parsed.category || topicCategory);

                        generatedArticle = {
                            title: finalTitle,
                            slug: baseSlug,
                            category: parsed.category || topicCategory,
                            source: parsed.source || topicSource,
                            excerpt: parsed.excerpt || parsed.content.slice(0, 160) + "...",
                            content: parsed.content,
                            duration: parsed.duration || "4 Menit Baca",
                            image: finalImage,
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
            const fallbackContent = `Pemerintah melalui ${topicSource} terus memperkuat keterbukaan dan efektivitas implementasi kebijakan ${topicTitle}. Langkah ini diambil untuk memastikan setiap program pelayanan publik dapat dirasakan manfaatnya secara merata oleh masyarakat luas.\n\nBerdasarkan data pemantauan berkala, koordinasi antarlembaga dan penguatan sistem pengawasan digital terus ditingkatkan. Keterlibatan masyarakat melalui pemberian aspirasi, tanggapan konstruktif, serta pemantauan independen dinilai menjadi pilar krusial dalam menjamin akuntabilitas setiap rupiah anggaran negara yang dialokasikan.\n\nMelalui publikasi berkala pada platform MelekIsu, warga diimbau untuk terus menyimak perkembangan implementasi program ini dan aktif berpartisipasi dalam ruang diskusi publik yang konstruktif.`;

            generatedArticle = {
                title: fallbackTitle,
                slug: fallbackSlug,
                category: topicCategory,
                source: topicSource,
                excerpt: `Laporan perkembangan terbaru kebijakan ${topicTitle} bersama ${topicSource} untuk meningkatkan transparansi dan keterlibatan publik.`,
                content: fallbackContent,
                duration: "3 Menit Baca",
                image: selectedDataset?.defaultImage || getCategoryCoverImage(topicCategory),
                date: currentDateStr,
                likes: 0
            };
        }

        // 2. Simpan Otomatis ke Database Supabase jika autoPublish disetel true
        let supabaseSaved = false;
        let finalSavedSlug = generatedArticle.slug;
        const supabase = getSupabaseClient();

        if (autoPublish && supabase) {
            try {
                // Pastikan slug unik (jika slug sudah ada, beri akhiran angka acak)
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
            datasetUsed: selectedDataset?.title || null,
            news: generatedArticle,
            message: supabaseSaved
                ? `Berita kebijakan berhasil diproduksi AI dan langsung diterbitkan ke Supabase Cloud!`
                : `Draf berita kebijakan berhasil diproduksi AI dan siap ditinjau.`
        });

    } catch (error: any) {
        console.error("Gagal menjalankan AI Auto-News:", error);
        return NextResponse.json({
            success: false,
            message: "Terjadi kendala saat memproduksi berita otomatis AI: " + (error?.message || error)
        }, { status: 500 });
    }
}

// Handler GET untuk kemudahan webhook cron / pengujian via browser
export async function GET(req: Request) {
    const url = new URL(req.url);
    const datasetId = url.searchParams.get("datasetId") || undefined;
    const topic = url.searchParams.get("topic") || undefined;

    const fakeReq = new Request(req.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, topic, autoPublish: true })
    });

    return POST(fakeReq);
}
