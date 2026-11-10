import { NextResponse } from "next/server";
import { newsDatabase } from "@/data/news";

// Daftar kata terlarang untuk filter etika & spam
const BLOCKED_KEYWORDS = [
    "judi", "slot", "gacor", "zeus", "pragmatic", "togel", "scatter", "maxwin",
    "pinjol", "bokep", "porno", "lonte", "kontol", "memek", "anjing", "babi", 
    "bangsat", "bajingan", "tolol", "goblok", "bego", "kampret", "pantek", 
    "bodoh", "idiot", "cacat", "tai", "perek", "asu", "kontil", "ngentot", "kocak lu"
];

function localRuleModeration(
    text: string, 
    articleTitle?: string
): { approved: boolean; status: "Terverifikasi" | "Ditolak" | "Menunggu Verifikasi"; isRelevant: boolean; sentiment: string; reason: string } {
    const lower = text.toLowerCase();
    
    // 1. Cek kata terlarang (ujaran kasar / makian / spam / judi)
    for (const word of BLOCKED_KEYWORDS) {
        if (lower.includes(word)) {
            return {
                approved: false,
                status: "Ditolak",
                isRelevant: false,
                sentiment: "Pelanggaran Etika / Ujaran Kasar",
                reason: `Tanggapan terdeteksi memuat kata tidak pantas atau makian ("${word}"). Mohon gunakan bahasa yang santun.`
            };
        }
    }

    // 2. Cek panjang karakter minimal
    if (text.trim().length < 5) {
        return {
            approved: false,
            status: "Ditolak",
            isRelevant: false,
            sentiment: "Terlalu Singkat",
            reason: "Komentar terlalu pendek untuk dijadikan masukan kebijakan yang bermakna."
        };
    }

    // 3. Fallback jika bersih: Menunggu verifikasi redaksi (jangan otomatis loloskan ke publik tanpa kurasi)
    return {
        approved: false,
        status: "Menunggu Verifikasi",
        isRelevant: false,
        sentiment: "Menunggu Verifikasi",
        reason: "Tanggapan memerlukan peninjauan kurasi redaksi sebelum ditayangkan ke publik."
    };
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, author, newsSlug, newsTitle, newsExcerpt, newsContent } = body;

        if (!text || typeof text !== "string" || text.trim().length === 0) {
            return NextResponse.json({
                approved: false,
                status: "Ditolak",
                isRelevant: false,
                sentiment: "Kosong",
                reason: "Teks komentar tidak boleh kosong."
            }, { status: 400 });
        }

        // Ambil konteks artikel berita
        const targetNews = newsDatabase.find((n) => n.slug === newsSlug);
        const articleTitle = newsTitle || targetNews?.title || "Kebijakan Publik";
        const articleCategory = targetNews?.category || "Isu Kebijakan Publik";
        const articleExcerpt = newsExcerpt || targetNews?.excerpt || "";
        const articleContent = newsContent || targetNews?.content || "";
        const articleContentPreview = articleContent 
            ? articleContent.slice(0, 1000) 
            : articleExcerpt || articleTitle;

        // 1. Cek filter kata terlarang terlebih dahulu (cepat & instan)
        const lower = text.toLowerCase();
        for (const word of BLOCKED_KEYWORDS) {
            if (lower.includes(word)) {
                return NextResponse.json({
                    approved: false,
                    status: "Ditolak",
                    isRelevant: false,
                    sentiment: "Pelanggaran Etika / Ujaran Kasar",
                    reason: `Tanggapan terdeteksi memuat kata tidak pantas atau makian ("${word}"). Mohon gunakan bahasa yang santun.`
                });
            }
        }

        const apiKey = process.env.GEMINI_API_KEY || "";
        const hasApiKey = Boolean(apiKey && apiKey.length > 20 && apiKey !== "masukkan_api_key_gemini_anda_di_sini");

        // Jika API Key tidak ada, gunakan filter lokal aman (Menunggu Verifikasi)
        if (!hasApiKey) {
            const fallbackResult = localRuleModeration(text, articleTitle);
            return NextResponse.json(fallbackResult);
        }

        const systemPrompt = `Anda adalah Asisten Redaksi & AI Content Moderator untuk platform jurnalisme warga "MelekIsu".
Tugas utama Anda adalah memverifikasi tanggapan/komentar warga secara cerdas, adil, dan objektif sebelum ditayangkan ke publik.

Kriteria Kurasi:
1. KESESUAIAN & RELEVANSI DENGAN TOPIK BERITA (PRIORITAS UTAMA):
   - LOLOSKAN ("approved": true, "status": "Terverifikasi", "isRelevant": true): Tanggapan yang menanggapi, membahas, mengkritisi, memberi masukan, bertanya, atau mengemukakan opini terkait substansi, kebijakan, data, atau dampak dari topik berita yang bersangkutan.
   - TOLAK ("approved": false, "status": "Ditolak", "isRelevant": false): HANYA jika tanggapan benar-benar melenceng total / teks acak tanpa kaitan sama sekali dengan isi berita (misal: "aku siapa kamu siapa", resep masakan, lirik lagu, teks spam).
2. BEBAS UJARAN KEBENCIAN & MAKIAN KASAR:
   - Tidak memuat makian kasar/kotor, pelecehan personal, ancaman kekerasan, fitnah keji, atau diskriminasi SARA.
3. BEBAS SPAM & PROMOSI ILEGAL:
   - Tidak mempromosikan judi online, slot gacor, pinjaman ilegal, produk komersial acak, atau tautan penipuan.
4. KONSTRUKTIF & BERADAB:
   - Kritik tajam terhadap pemerintah atau kebijakan publik dalam berita SANGAT DIPERBOLEHKAN dan DIHARGAI, asalkan tetap relevan dengan topik berita dan disampaikan secara beradab.

Format Jawaban Wajib HANYA JSON murni tanpa markdown:
{
  "approved": true atau false,
  "status": "Terverifikasi" atau "Ditolak",
  "isRelevant": true atau false,
  "sentiment": "Konstruktif" | "Kritik Solutif" | "Apresiasi" | "Tidak Relevan" | "Spam" | "Ujaran Kebencian",
  "reason": "1 kalimat penjelasan objektif dalam bahasa Indonesia mengapa komentar ini disetujui atau ditolak (sebutkan kaitannya dengan topik berita)"
}`;

        const userPrompt = `Tinjau relevansi dan kelayakan tanggapan warga terhadap berita berikut:

=== ARTIKEL BERITA TERKAIT ===
Judul Berita: ${articleTitle}
Kategori Isu: ${articleCategory}
Ringkasan Berita: ${articleExcerpt}
Kutipan Isi Berita:
${articleContentPreview}

=== TANGGAPAN DARI WARGA ===
Pengirim: ${author || "Warga Publik"}
Isi Tanggapan: "${text.trim()}"

Evaluasi secara seksama:
1. Apakah tanggapan ini membahas atau berkaitan dengan topik berita di atas? (Loloskan jika relevan; tolak jika benar-benar melenceng).
2. Apakah bebas ujaran kebencian, makian kotor, dan spam?

Berikan penilaian kurasi Anda dalam format JSON sesuai kriteria di atas.`;

        const candidateModels = [
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-3.8-flash"
        ];

        let aiParsedResult: any = null;

        for (const model of candidateModels) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        signal: AbortSignal.timeout(4000),
                        body: JSON.stringify({
                            systemInstruction: { parts: [{ text: systemPrompt }] },
                            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                            generationConfig: {
                                temperature: 0.1,
                                maxOutputTokens: 1024
                            }
                        })
                    }
                );

                if (!response.ok) continue;

                const data = await response.json();
                const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!rawText) continue;

                // Bersihkan markdown jika model mengembalikan ```json ... ```
                const cleanedJson = rawText
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .trim();

                const parsed = JSON.parse(cleanedJson);
                if (typeof parsed.approved === "boolean") {
                    const isRelevant = parsed.isRelevant !== undefined ? parsed.isRelevant : parsed.approved;
                    aiParsedResult = {
                        approved: parsed.approved && isRelevant,
                        status: (parsed.approved && isRelevant) ? "Terverifikasi" : "Ditolak",
                        isRelevant: isRelevant,
                        sentiment: parsed.sentiment || ((parsed.approved && isRelevant) ? "Konstruktif" : "Tidak Relevan / Melanggar"),
                        reason: parsed.reason || ((parsed.approved && isRelevant) ? "Tanggapan relevan dan lolos verifikasi AI." : "Tanggapan ditolak oleh kurasi AI.")
                    };
                    break;
                }
            } catch (err) {
                console.warn(`Moderation model ${model} timeout or error:`, err);
            }
        }

        if (aiParsedResult) {
            return NextResponse.json(aiParsedResult);
        }

        // Fallback jika API Gemini timeout / error
        const localFallback = localRuleModeration(text, articleTitle);
        return NextResponse.json(localFallback);

    } catch (error) {
        console.error("Gagal memproses moderasi AI:", error);
        return NextResponse.json(localRuleModeration(""), { status: 500 });
    }
}
