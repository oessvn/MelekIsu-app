import { NextResponse } from "next/server";
import { newsDatabase, NewsItem } from "@/data/news";
import { createClient } from "@/lib/supabase/server";

interface ChatHistoryItem {
    sender: "user" | "ai";
    text: string;
}

function generateSmartFallbackReply(
    message: string,
    currentArticle?: NewsItem | null,
    allNews: NewsItem[] = newsDatabase
): string {
    const lower = message.toLowerCase().trim();

    // 1. Jika pengguna bertanya tentang artikel yang sedang dibuka / dirujuk
    if (currentArticle && (
        lower.includes("ringkas") ||
        lower.includes("isi") ||
        lower.includes("berita ini") ||
        lower.includes("artikel ini") ||
        lower.includes("jelaskan") ||
        lower.includes("poin") ||
        lower.includes("manfaat") ||
        lower.includes("dampak") ||
        lower.includes("tentang") ||
        lower.includes("siapa") ||
        lower.includes("mengapa") ||
        lower.includes("bagaimana")
    )) {
        const paragraphs = currentArticle.content
            ? currentArticle.content.split("\n\n").filter(Boolean)
            : [currentArticle.excerpt];

        const bullets = paragraphs.slice(0, 4).map((p) => `• ${p.trim()}`).join("\n");

        return `Berikut rangkuman dan analisis isu dari berita **"${currentArticle.title}"**:\n\n` +
            `• **Kategori Isu:** ${currentArticle.category}\n` +
            `• **Sumber Resmi:** ${currentArticle.source} (${currentArticle.date || "Terbaru"})\n` +
            `• **Inti Masalah:** ${currentArticle.excerpt}\n\n` +
            `**Poin-Poin Utama Kebijakan:**\n${bullets}\n\n` +
            `**Dampak Bagi Warga:**\n` +
            `Kebijakan ini bertujuan meningkatkan transparansi, efisiensi pelayanan publik, dan kepastian hak masyarakat.\n\n` +
            `Kamu dapat membaca artikel selengkapnya di [${currentArticle.title}](/berita/${currentArticle.slug}) atau sampaikan tanggapan berbobotmu di kolom diskusi warga!`;
    }

    // 2. Salam / Sapaan
    if (
        lower === "halo" ||
        lower === "hai" ||
        lower.startsWith("halo") ||
        lower.startsWith("hai") ||
        lower.includes("selamat pagi") ||
        lower.includes("selamat siang") ||
        lower.includes("selamat malam") ||
        lower.includes("siapa kamu")
    ) {
        const sampleNews = allNews.slice(0, 4);
        const newsListText = sampleNews
            .map((n, i) => `${i + 1}. [${n.title}](/berita/${n.slug}) — *${n.category}*`)
            .join("\n");

        return `Halo, Warga! Saya Asisten AI MelekIsu. Saya siap membantu menjawab pertanyaan seputar berita publik terkini dan transparansi kebijakan:\n\n` +
            `${newsListText}\n\n` +
            `Ada topik atau berita tertentu yang ingin kamu tanyakan lebih dalam? Kamu juga bisa klik tombol **Tanya AI** pada kartu berita yang tersedia.`;
    }

    // 3. Pertanyaan seputar "berita terbaru", "apa saja berita", "rekomendasi"
    if (
        lower.includes("berita terbaru") ||
        lower.includes("berita apa") ||
        lower.includes("daftar berita") ||
        lower.includes("kabar terbaru") ||
        lower.includes("isu terbaru") ||
        lower.includes("rekomendasi")
    ) {
        const topNews = allNews.slice(0, 5);
        const listText = topNews
            .map(
                (n, idx) =>
                    `**${idx + 1}. [${n.title}](/berita/${n.slug})**\n` +
                    `*Kategori: ${n.category} | Sumber: ${n.source}*\n` +
                    `${n.excerpt}\n`
            )
            .join("\n");

        return `Berikut adalah daftar berita dan kebijakan publik terkini di MelekIsu:\n\n` +
            `${listText}\n` +
            `Silakan klik judul di atas untuk membaca berita lengkap, atau sebutkan judul artikel yang ingin Anda bahas bersama AI!`;
    }

    // 4. Pencarian Berita Berdasarkan Kata Kunci
    const matched = allNews.filter((n) => {
        const titleMatch = n.title.toLowerCase().includes(lower);
        const excerptMatch = n.excerpt?.toLowerCase().includes(lower);
        const contentMatch = n.content?.toLowerCase().includes(lower);
        const catMatch = n.category?.toLowerCase().includes(lower);
        const sourceMatch = n.source?.toLowerCase().includes(lower);
        return titleMatch || excerptMatch || contentMatch || catMatch || sourceMatch;
    });

    if (matched.length > 0) {
        const top = matched[0];
        const otherMatches = matched.slice(1, 3);

        let reply = `Terkait pertanyaanmu, berikut berita resmi di MelekIsu yang paling relevan:\n\n` +
            `📰 **[${top.title}](/berita/${top.slug})**\n` +
            `*Kategori: ${top.category} | Sumber: ${top.source} | ${top.date || "Terbaru"}*\n\n` +
            `**Ringkasan Isu:** ${top.excerpt}\n\n` +
            `**Penjelasan:**\n${top.content ? top.content.slice(0, 450) + "..." : top.excerpt}\n\n` +
            `Ingin tahu lebih banyak? Silakan buka artikel lengkapnya di [${top.title}](/berita/${top.slug})!`;

        if (otherMatches.length > 0) {
            reply += `\n\n**Berita Terkait Lainnya:**\n` +
                otherMatches.map((m) => `• [${m.title}](/berita/${m.slug}) (${m.category})`).join("\n");
        }

        return reply;
    }

    // 5. Bantuan umum dengan tautan berita riil
    const defaultSuggestions = allNews.slice(0, 5).map((n, idx) => {
        return `${idx + 1}. [${n.title}](/berita/${n.slug}) — *${n.category}* (${n.source})`;
    }).join("\n");

    return `Mengenai topik tersebut, Anda dapat menelusuri artikel resmi yang telah terverifikasi di portal MelekIsu:\n\n` +
        `${defaultSuggestions}\n\n` +
        `Ketik nama topik, isu kebijakan, atau tanyakan ringkasan berita yang ingin Anda ketahui!`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history = [], currentSlug, currentArticle: passedArticle } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ reply: "Pesan tidak boleh kosong." }, { status: 400 });
        }

        // Siapkan seluruh berita dari Supabase + newsDatabase
        let allNewsList: NewsItem[] = [...newsDatabase];
        try {
            const supabase = await createClient();
            const { data: dbNews } = await supabase
                .from("news")
                .select("*")
                .neq("category", "Transparansi Aksi")
                .order("created_at", { ascending: false });

            if (dbNews && dbNews.length > 0) {
                const mapped: NewsItem[] = dbNews.map((item) => ({
                    id: String(item.id),
                    title: item.title,
                    slug: item.slug,
                    excerpt: item.excerpt || "",
                    content: item.content || "",
                    category: item.category || "Kebijakan Publik",
                    source: item.source || "Pemerintah RI",
                    date: item.date || "Terbaru",
                    duration: item.duration || "5 Menit Baca",
                    likes: item.likes || 0,
                    image: item.image || "/images/infrastruktur.jpg",
                    createdAt: item.created_at,
                    commentsList: [],
                }));

                const merged = [...mapped];
                newsDatabase.forEach((base) => {
                    if (!merged.some((m) => m.slug === base.slug)) {
                        merged.push(base);
                    }
                });
                allNewsList = merged;
            }
        } catch {
            // Gunakan newsDatabase fallback
        }

        // Tentukan artikel yang sedang aktif
        let currentArticle: NewsItem | null = null;
        if (passedArticle && typeof passedArticle === "object" && passedArticle.title) {
            currentArticle = passedArticle as NewsItem;
        } else if (currentSlug) {
            currentArticle = allNewsList.find((n) => n.slug === currentSlug) || null;
        }

        // Siapkan katalog semua berita untuk RAG / konteks AI
        const newsCatalogText = allNewsList
            .slice(0, 15) // Batasi ke 15 berita terpenting agar hemat token
            .map(
                (item, idx) => `[BERITA #${idx + 1}]
- Judul: ${item.title}
- Slug: ${item.slug} (Tautan markdown wajib: [${item.title}](/berita/${item.slug}))
- Kategori: ${item.category}
- Tanggal Publikasi: ${item.date || "Terbaru"}
- Sumber Resmi: ${item.source}
- Ringkasan Singkat: ${item.excerpt}
- Isi Berita:
${item.content ? item.content.slice(0, 1200) : item.excerpt}
`
            )
            .join("\n---\n");

        // Format instruksi sistem
        let systemPrompt = `Kamu adalah Asisten AI Cerdas dari "MelekIsu" (platform portal berita publik dan transparansi kebijakan di Indonesia).
Tugas utamamu adalah membantu warga memahami berita terkini, menganalisis dampak kebijakan publik, merangkum artikel, dan menjawab berbagai pertanyaan warga seputar berita yang ada secara ramah, edukatif, informatif, dan akurat.

PEDOMAN MENJAWAB:
1. Bersikap ramah, edukatif, objektif, dan gunakan Bahasa Indonesia yang baik dan terstruktur.
2. Gunakan informasi dari DATABASE RESMI BERITA MELEKISU di bawah ini sebagai sumber kebenaran utama.
3. Jawablah secara spesifik, faktual, dan kontekstual sesuai pertanyaan pengguna.
4. Jika menjelaskan ringkasan atau rincian kebijakan, sajikan dalam poin-poin rapi (bullet points) agar nyaman dibaca warga.
5. PENTING: Ketika merujuk atau merekomendasikan artikel berita, SELALU gunakan tautan markdown yang valid dengan format: [Judul Berita](/berita/{slug-berita}).
6. Jika pengguna bertanya tentang kebijakan publik secara umum yang relevan, jawab secara bijak dengan perspektif transparansi publik dan hubungkan dengan berita di MelekIsu jika memungkinkan.
7. Jangan membuat berita bohong atau berhalusinasi di luar data yang ada.
8. Pastikan jawaban tuntas dan tidak terpotong di tengah kalimat.

---
DATABASE RESMI BERITA MELEKISU:
${newsCatalogText}
---`;

        if (currentArticle) {
            systemPrompt += `\n\n[KONTEKS KHUSUS - ARTIKEL YANG SEDANG DIBACA WARGA]:
Warga saat ini sedang membuka halaman artikel berikut:
- Judul: "${currentArticle.title}"
- Kategori: ${currentArticle.category}
- Tanggal: ${currentArticle.date || "Terbaru"}
- Sumber: ${currentArticle.source}
- Tautan: /berita/${currentArticle.slug}
- Ringkasan: ${currentArticle.excerpt}
- Isi Lengkap:
${currentArticle.content || currentArticle.excerpt}

PENTING: Jika pertanyaan warga merujuk pada "berita ini", "artikel ini", "kebijakan ini", "ringkasannya", "apa poin pentingnya", atau dampak dari artikel ini, prioritaskan menjawab secara detail dan mendalam berdasarkan artikel di atas! Sertakan tautan [${currentArticle.title}](/berita/${currentArticle.slug}).`;
        }

        const apiKey = process.env.GEMINI_API_KEY;

        // Jika API Key tidak ada atau template, gunakan smart fallback
        if (!apiKey || apiKey === "masukkan_api_key_gemini_anda_di_sini") {
            const fallbackReply = generateSmartFallbackReply(message, currentArticle, allNewsList);
            return NextResponse.json({ reply: fallbackReply });
        }

        // Conversation history (maksimal 6 interaksi terakhir)
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

        // Model Gemini terverifikasi aktif
        const candidateModels = [
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
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
                        signal: AbortSignal.timeout(6000), // Timeout 6 detik per model
                        body: JSON.stringify({
                            systemInstruction: {
                                parts: [{ text: systemPrompt }],
                            },
                            contents: formattedContents,
                            generationConfig: {
                                temperature: 0.7,
                                maxOutputTokens: 4096,
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
                }
            } catch (err: any) {
                lastErrorMsg = err?.message || "";
            }
        }

        if (aiReply) {
            return NextResponse.json({ reply: aiReply.trim() });
        }

        // Smart fallback jika API timeout atau kuota habis
        const fallbackReply = generateSmartFallbackReply(message, currentArticle, allNewsList);
        return NextResponse.json({ reply: fallbackReply });

    } catch (error) {
        console.error("Error AI Chat API:", error);
        return NextResponse.json(
            { reply: "Terjadi gangguan koneksi. Silakan kirim ulang pertanyaan Anda." },
            { status: 500 }
        );
    }
}
