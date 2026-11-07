import { NextResponse } from "next/server";
import { newsDatabase, NewsItem } from "@/data/news";

interface ChatHistoryItem {
    sender: "user" | "ai";
    text: string;
}

function generateSmartFallbackReply(message: string, currentArticle?: NewsItem | null): string {
    const lower = message.toLowerCase().trim();

    // 1. Jika pengguna bertanya tentang artikel yang sedang dibuka
    if (currentArticle && (
        lower.includes("ringkas") ||
        lower.includes("isi") ||
        lower.includes("berita ini") ||
        lower.includes("artikel ini") ||
        lower.includes("jelaskan") ||
        lower.includes("poin") ||
        lower.includes("manfaat") ||
        lower.includes("tentang")
    )) {
        return `Berikut rangkuman berita **"${currentArticle.title}"**:\n\n` +
            `• **Kategori:** ${currentArticle.category}\n` +
            `• **Sumber Resmi:** ${currentArticle.source} (${currentArticle.date})\n` +
            `• **Inti Isu:** ${currentArticle.excerpt}\n\n` +
            `**Poin Penting:**\n${currentArticle.content.split('\n\n').map((p) => `• ${p}`).join('\n')}\n\n` +
            `Kamu juga bisa membaca berita lengkap di [${currentArticle.title}](/berita/${currentArticle.slug}) atau sampaikan apresiasi dan saran konstruktifmu di kolom tanggapan warga!`;
    }

    // 2. Salam / Sapaan
    if (lower === "halo" || lower === "hai" || lower.includes("selamat") || lower.includes("halo ai") || lower.includes("siapa kamu")) {
        return `Halo, Warga! Saya Asisten AI MelekIsu. Saya siap membantu menjawab pertanyaan seputar berita publik terkini:\n\n` +
            `• **Transportasi & Emisi:** Integrasi transit nol emisi 2025\n` +
            `• **Pertanian & Pangan:** Digitalisasi sensor IoT & kebijakan pupuk subsidi\n` +
            `• **Pendidikan & AI:** Sertifikasi coding vokasi 50.000 mahasiswa luar Jawa\n` +
            `• **Tata Kelola:** Portal Satu Data Anggaran Terbuka real-time 38 provinsi\n` +
            `• **Energi Bersih:** Transformasi PLTS Atap skala desa mandiri\n\n` +
            `Ada topik atau berita tertentu yang ingin kamu tanyakan lebih dalam?`;
    }

    // 3. Pencarian Berita Berdasarkan Kata Kunci
    const matched = newsDatabase.filter((n) => {
        const titleMatch = n.title.toLowerCase().includes(lower);
        const excerptMatch = n.excerpt.toLowerCase().includes(lower);
        const contentMatch = n.content.toLowerCase().includes(lower);
        const catMatch = n.category.toLowerCase().includes(lower);
        const sourceMatch = n.source.toLowerCase().includes(lower);
        return titleMatch || excerptMatch || contentMatch || catMatch || sourceMatch;
    });

    if (matched.length > 0) {
        const top = matched[0];
        return `Terkait pertanyaanmu, berikut berita resmi di MelekIsu yang paling relevan:\n\n` +
            `📰 **[${top.title}](/berita/${top.slug})**\n` +
            `*Kategori: ${top.category} | Sumber: ${top.source} | ${top.date}*\n\n` +
            `**Ringkasan:** ${top.excerpt}\n\n` +
            `**Isi Berita:**\n${top.content}\n\n` +
            `Ingin tahu lebih banyak? Silakan buka artikel lengkapnya di [${top.title}](/berita/${top.slug})!`;
    }

    // 4. Bantuan umum
    return `Mengenai topik tersebut, kamu dapat menelusuri artikel resmi yang ada di portal MelekIsu. Berikut beberapa topik utama yang bisa kamu tanyakan:\n\n` +
        `1. [Integrasi Transit Nol Emisi 2025](/berita/revolusi-mobilitas-berkelanjutan) — sinkronisasi jadwal & tarif gabungan kereta cepat & bus listrik.\n` +
        `2. [Digitalisasi Pertanian Rakyat](/berita/digitalisasi-pertanian-rakyat) — sensor kelembaban tanah IoT untuk efisiensi pupuk & panen.\n` +
        `3. [Kebijakan Pupuk Subsidi Berbasis Kartu Tani](/berita/kebijakan-baru-distribusi-pupuk) — verifikasi biometrik tepat sasaran.\n` +
        `4. [Portal Satu Data Anggaran Terbuka](/berita/portal-satu-data-anggaran) — pantau tender, lelang, dan progres fisik pekerjaan umum.\n` +
        `5. [Transformasi Energi Hijau PLTS Atap](/berita/transformasi-energi-hijau) — panel surya mandiri di fasilitas umum perdesaan.\n` +
        `6. [Akselerasi AI & Coding Vokasi](/berita/akselerasi-literasi-ai) — sertifikasi gratis untuk 50.000 mahasiswa vokasi luar Jawa.\n\n` +
        `Ketik nama topik atau pertanyaan spesifik untuk mendapatkan penjelasan lengkap dari AI!`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history = [], currentSlug } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ reply: "Pesan tidak boleh kosong." }, { status: 400 });
        }

        // Cari artikel aktif jika pengguna sedang membuka suatu berita
        const currentArticle: NewsItem | null = currentSlug
            ? newsDatabase.find((n) => n.slug === currentSlug) || null
            : null;

        // Siapkan katalog semua berita untuk RAG / konteks AI
        const newsCatalogText = newsDatabase
            .map(
                (item, idx) => `[BERITA #${idx + 1}]
- ID: ${item.id}
- Judul: ${item.title}
- Slug: ${item.slug} (Tautan rujukan: /berita/${item.slug})
- Kategori: ${item.category}
- Tanggal Publikasi: ${item.date}
- Sumber Resmi: ${item.source}
- Estimasi Baca: ${item.duration}
- Ringkasan Singkat: ${item.excerpt}
- Isi Lengkap Berita:
${item.content}
`
            )
            .join("\n---\n");

        // Format instruksi sistem
        let systemPrompt = `Kamu adalah Asisten AI Cerdas dari "MelekIsu" (platform portal berita publik dan transparansi kebijakan di Indonesia).
Tugas utamamu adalah membantu warga memahami berita terkini, menganalisis kebijakan publik, merangkum artikel, dan menjawab berbagai pertanyaan warga seputar berita yang ada secara ramah, informatif, dan akurat.

PEDOMAN MENJAWAB:
1. Bersikap ramah, edukatif, profesional, dan gunakan Bahasa Indonesia yang baik dan terstruktur.
2. Gunakan informasi dari DATABASE BERITA MELEKISU di bawah ini sebagai sumber kebenaran utama.
3. Jawablah secara spesifik, faktual, dan kontekstual sesuai pertanyaan pengguna.
4. Jika menjelaskan ringkasan atau rincian kebijakan, sajikan dalam poin-poin rapi (bullet points) agar nyaman dibaca warga.
5. Ketika merujuk atau merekomendasikan artikel, selalu sertakan tautan markdown dengan format: [Judul Berita](/berita/{slug-berita}).
6. Jika pengguna bertanya tentang kebijakan publik secara umum yang relevan, jawab secara bijak dengan perspektif transparansi publik dan hubungkan dengan berita di MelekIsu jika memungkinkan.
7. Jangan membuat berita bohong atau berhalusinasi di luar data yang ada.
8. Pastikan setiap jawabanmu tuntas dan selesai secara utuh hingga akhir, tidak terpotong di tengah kalimat.

---
DATABASE RESMI BERITA MELEKISU:
${newsCatalogText}
---`;

        if (currentArticle) {
            systemPrompt += `\n\n[KONTEKS KHUSUS - ARTIKEL YANG SEDANG DIBACA WARGA]:
Warga saat ini sedang membuka halaman artikel berikut:
- Judul: "${currentArticle.title}"
- Kategori: ${currentArticle.category}
- Tanggal: ${currentArticle.date}
- Sumber: ${currentArticle.source}
- Ringkasan: ${currentArticle.excerpt}
- Isi Lengkap:
${currentArticle.content}

PENTING: Jika pertanyaan warga merujuk pada "berita ini", "artikel ini", "kebijakan ini", "ringkasannya", "apa poin pentingnya", atau topik dari artikel ini, prioritaskan menjawab secara detail dan akurat berdasarkan artikel di atas!`;
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // Jika API Key tidak ada atau masih template default, gunakan Smart Fallback
        if (!apiKey || apiKey === "masukkan_api_key_gemini_anda_di_sini") {
            const fallbackReply = generateSmartFallbackReply(message, currentArticle);
            return NextResponse.json({ reply: fallbackReply });
        }

        // Siapkan conversation history (maksimal 6 interaksi terakhir)
        const formattedContents = [
            ...(Array.isArray(history) ? history.slice(-6) : [])
                .filter((h: ChatHistoryItem) => h && h.text && (h.sender === "user" || h.sender === "ai"))
                .map((h: ChatHistoryItem) => ({
                    role: h.sender === "ai" ? "model" : "user",
                    parts: [{ text: h.text }],
                })),
            {
                role: "user",
                parts: [{ text: message }],
            },
        ];

        // Model Gemini yang dicoba berurutan untuk menjamin reliabilitas tinggi
        const candidateModels = [
            "gemini-3.5-flash",
            "gemini-3.5-flash-lite",
            "gemini-3.8-flash",
            "gemini-flash-latest",
        ];

        let aiReply: string | null = null;
        let lastErrorMsg = "";

        for (const model of candidateModels) {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            systemInstruction: {
                                parts: [{ text: systemPrompt }],
                            },
                            contents: formattedContents,
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 8192,
                                thinkingConfig: {
                                    thinkingBudget: 0,
                                },
                            },
                        }),
                    }
                );

                const data = await response.json();

                if (response.ok && data?.candidates?.[0]?.content?.parts?.length) {
                    const combinedText = data.candidates[0].content.parts
                        .map((p: any) => p.text || "")
                        .join("");
                    if (combinedText.trim()) {
                        aiReply = combinedText.trim();
                        break;
                    }
                } else if (data.error) {
                    lastErrorMsg = data.error.message || "";
                    console.warn(`Model ${model} returned error:`, lastErrorMsg);
                }
            } catch (err: any) {
                lastErrorMsg = err?.message || "";
                console.warn(`Fetch error for model ${model}:`, lastErrorMsg);
            }
        }

        if (aiReply) {
            return NextResponse.json({ reply: aiReply.trim() });
        }

        // Fallback cerdas jika API Gemini mengalami gangguan sesaat
        console.warn("Falling back to smart local responder. Last error:", lastErrorMsg);
        const fallbackReply = generateSmartFallbackReply(message, currentArticle);
        return NextResponse.json({ reply: fallbackReply });

    } catch (error) {
        console.error("Error AI Chat API:", error);
        return NextResponse.json(
            { reply: "Terjadi gangguan koneksi. Silakan kirim ulang pertanyaan Anda." },
            { status: 500 }
        );
    }
}
