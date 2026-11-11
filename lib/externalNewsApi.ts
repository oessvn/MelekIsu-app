export interface ExternalNewsSource {
    id: string;
    name: string;
    category: string;
    feedUrl: string;
    description: string;
    badgeColor: string;
}

export interface LiveExternalNewsItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    imageUrl?: string;
    sourceName: string;
    category?: string;
}

export const EXTERNAL_NEWS_SOURCES: ExternalNewsSource[] = [
    {
        id: "antara-politik",
        name: "Antara News (Politik & Kebijakan)",
        category: "Tata Kelola Publik",
        feedUrl: "https://www.antaranews.com/rss/politik.xml",
        description: "Kantor Berita Nasional resmi Indonesia, pembaruan kebijakan dan tata kelola pemerintah.",
        badgeColor: "bg-red-100 text-red-800 border-red-200"
    },
    {
        id: "antara-ekonomi",
        name: "Antara News (Ekonomi & Pangan)",
        category: "Ketahanan Pangan",
        feedUrl: "https://www.antaranews.com/rss/ekonomi.xml",
        description: "Data dan perkembangan perekonomian, perbankan, dan ketahanan pangan nasional.",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
    },
    {
        id: "cnn-nasional",
        name: "CNN Indonesia (Nasional)",
        category: "Infrastruktur Publik",
        feedUrl: "https://www.cnnindonesia.com/nasional/rss",
        description: "Perkembangan isu publik, hukum, dan regulasi nasional terkini.",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
    },
    {
        id: "cnbc-news",
        name: "CNBC Indonesia (News & Energi)",
        category: "Energi & Lingkungan",
        feedUrl: "https://www.cnbcindonesia.com/news/rss",
        description: "Transisi energi, investasi publik, dan perkembangan industri hijau.",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
    }
];

function cleanXmlText(text: string): string {
    return text
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

export async function fetchExternalLiveNews(sourceId?: string, limit: number = 6): Promise<LiveExternalNewsItem[]> {
    const source = EXTERNAL_NEWS_SOURCES.find((s) => s.id === sourceId) || EXTERNAL_NEWS_SOURCES[0];

    try {
        const response = await fetch(source.feedUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 MelekIsuBot/1.0",
                "Accept": "application/rss+xml, application/xml, text/xml, */*"
            },
            signal: AbortSignal.timeout(6000)
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const xml = await response.text();
        const rawItems = xml.split("<item>").slice(1, limit + 1);

        const items: LiveExternalNewsItem[] = [];

        for (const raw of rawItems) {
            const rawTitle = raw.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
            const rawLink = raw.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
            const rawDesc = raw.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
            const rawPubDate = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";

            // Deteksi enclosure gambar atau media:content
            const rawImg = raw.match(/<enclosure[^>]+url=["']([^"']+)["']/i)?.[1] 
                || raw.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1]
                || raw.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
                || "";

            const title = cleanXmlText(rawTitle);
            const link = cleanXmlText(rawLink);
            const description = cleanXmlText(rawDesc);

            if (title && title.length > 5) {
                items.push({
                    title,
                    link,
                    description,
                    pubDate: rawPubDate ? new Date(rawPubDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Terbaru",
                    imageUrl: rawImg ? cleanXmlText(rawImg) : undefined,
                    sourceName: source.name,
                    category: source.category
                });
            }
        }

        return items;
    } catch (err) {
        console.warn(`Gagal fetch live RSS dari ${source.name}:`, err);
        return [];
    }
}
