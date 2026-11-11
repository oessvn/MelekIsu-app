import { createClient } from "@/lib/supabase/client";
import { newsDatabase, NewsItem, NewsComment } from "@/data/news";

/**
 * Mengambil seluruh berita: menggabungkan Supabase (jika aktif),
 * berita kustom admin di localStorage, dan fallback newsDatabase default.
 */
export async function getCombinedNews(): Promise<NewsItem[]> {
    let list: NewsItem[] = [];

    // 1. Coba ambil dari Supabase Cloud
    try {
        const supabase = createClient();
        const { data: dbNews, error } = await supabase
            .from("news")
            .select("*")
            .neq("category", "Transparansi Aksi")
            .order("created_at", { ascending: false });

        if (!error && dbNews && dbNews.length > 0) {
            list = dbNews.map((item) => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                excerpt: item.excerpt,
                content: item.content,
                category: item.category,
                source: item.source,
                date: item.date || "Terbaru",
                duration: item.duration || "5 Menit Baca",
                likes: item.likes || 0,
                image: item.image || "/images/infrastruktur.jpg",
                createdAt: item.created_at,
                commentsList: [],
            }));
            return list;
        }
    } catch {
        // Fallback jika offline / tabel belum dibuat
    }

    // 2. Ambil dari localStorage (jika admin menambah berita saat offline/local)
    if (typeof window !== "undefined") {
        const localCustom = localStorage.getItem("melekisu_custom_news");
        if (localCustom) {
            try {
                const parsed = JSON.parse(localCustom);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    list = [...parsed];
                }
            } catch {}
        }
    }

    // 3. Gabungkan dengan data mock dasar agar berita default tidak pernah hilang
    const combined = [...list];
    newsDatabase.forEach((base) => {
        if (!combined.some((c) => c.slug === base.slug)) {
            combined.push(base);
        }
    });

    return combined;
}

/**
 * Mengambil total upvote sebuah komentar dari storage
 */
export function getCommentUpvoteCount(commentId: string): number {
    if (typeof window === "undefined") return 0;
    try {
        const stored = localStorage.getItem(`comment_upvotes_${commentId}`);
        if (!stored) return 0;
        const parsed = JSON.parse(stored);
        return typeof parsed.count === "number" ? parsed.count : (Array.isArray(parsed.users) ? parsed.users.length : 0);
    } catch {
        return 0;
    }
}

/**
 * Mengecek apakah user tertentu sudah upvote komentar ini
 */
export function isCommentUpvotedByUser(commentId: string, userKey: string): boolean {
    if (typeof window === "undefined" || !userKey) return false;
    try {
        const stored = localStorage.getItem(`comment_upvotes_${commentId}`);
        if (!stored) return false;
        const parsed = JSON.parse(stored);
        const users = Array.isArray(parsed.users) ? parsed.users : [];
        return users.includes(userKey);
    } catch {
        return false;
    }
}

/**
 * Toggle upvote pada komentar oleh user
 */
export async function toggleCommentUpvote(
    commentId: string, 
    userKey: string
): Promise<{ count: number; isUpvoted: boolean }> {
    if (typeof window === "undefined") return { count: 0, isUpvoted: false };
    try {
        const storageKey = `comment_upvotes_${commentId}`;
        const stored = localStorage.getItem(storageKey);
        const parsed = stored ? JSON.parse(stored) : { count: 0, users: [] };
        let users: string[] = Array.isArray(parsed.users) ? parsed.users : [];
        let count: number = typeof parsed.count === "number" ? parsed.count : users.length;

        let isUpvoted: boolean;
        if (users.includes(userKey)) {
            users = users.filter((u) => u !== userKey);
            count = Math.max(0, count - 1);
            isUpvoted = false;
        } else {
            users.push(userKey);
            count += 1;
            isUpvoted = true;
        }

        localStorage.setItem(storageKey, JSON.stringify({ count, users }));
        window.dispatchEvent(new Event("storage"));

        return { count, isUpvoted };
    } catch {
        return { count: 0, isUpvoted: false };
    }
}

/**
 * Mengambil komentar untuk sebuah artikel (baik dari Supabase maupun LocalStorage)
 */
export async function getCommentsForSlug(slug: string): Promise<NewsComment[]> {
    const supabase = createClient();

    // 1. Coba ambil dari Supabase Cloud (Single Source of Truth)
    try {
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("news_slug", slug)
            .order("created_at", { ascending: true });

        if (!error && Array.isArray(data)) {
            const mapped = data.map((c) => ({
                id: c.id,
                author: c.author,
                authorEmail: c.author_email,
                text: c.text,
                status: c.status || "Menunggu Verifikasi",
                createdAt: c.created_at,
                upvotes: getCommentUpvoteCount(c.id),
            }));

            // Selaraskan ke LocalStorage agar cache lokal selalu bersih mengikuti database Supabase
            if (typeof window !== "undefined") {
                localStorage.setItem(`comments_${slug}`, JSON.stringify(mapped));
            }

            return mapped;
        }
    } catch {}

    // 2. Fallback HANYA jika Supabase offline / gagal koneksi
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem(`comments_${slug}`);
        if (saved) {
            try {
                const list = JSON.parse(saved);
                if (Array.isArray(list)) {
                    return list.map((c) => ({
                        ...c,
                        upvotes: getCommentUpvoteCount(c.id)
                    }));
                }
            } catch {}
        }
    }

    // 3. Fallback ke newsDatabase mock
    const defaultNews = newsDatabase.find((n) => n.slug === slug);
    const list = defaultNews?.commentsList || [];
    return list.map((c) => ({
        ...c,
        upvotes: getCommentUpvoteCount(c.id)
    }));
}

export const BLOCKED_KEYWORDS_LIST = [
    "judi", "slot", "gacor", "zeus", "pragmatic", "togel", "scatter", "maxwin",
    "pinjol", "bokep", "porno", "lonte", "kontol", "memek", "anjing", "babi", 
    "bangsat", "bajingan", "tolol", "goblok", "bego", "kampret", "pantek", 
    "bodoh", "idiot", "cacat", "tai", "perek", "asu", "kontil", "ngentot", "kocak lu"
];

export function isTextViolating(text: string): { violated: boolean; reason: string } {
    const lower = text.toLowerCase();
    for (const word of BLOCKED_KEYWORDS_LIST) {
        if (lower.includes(word)) {
            return {
                violated: true,
                reason: `Tanggapan terdeteksi memuat kata tidak pantas atau makian ("${word}"). Mohon gunakan bahasa yang santun.`
            };
        }
    }
    return { violated: false, reason: "" };
}

/**
 * Mengirim komentar baru: diverifikasi otomatis oleh AI dan disimpan ke Supabase Cloud
 */
export async function sendComment(
    slug: string,
    author: string,
    authorEmail: string,
    text: string,
    newsTitle?: string,
    newsExcerpt?: string,
    newsContent?: string
): Promise<NewsComment & { moderation?: { approved: boolean; status: "Terverifikasi" | "Menunggu Verifikasi" | "Ditolak"; reason: string; sentiment?: string } }> {
    const supabase = createClient();
    let commentId = `c-${Date.now()}`;

    // 0. Cek Lapis Pertama (Mutlak & Cepat): Deteksi Kata Kasar / Makian / Spam
    const quickCheck = isTextViolating(text);
    if (quickCheck.violated) {
        return {
            id: commentId,
            author,
            authorEmail,
            text: text.trim(),
            status: "Ditolak",
            aiReason: quickCheck.reason,
            createdAt: new Date().toISOString(),
            moderation: {
                approved: false,
                status: "Ditolak",
                reason: quickCheck.reason,
                sentiment: "Pelanggaran Etika / Ujaran Kasar"
            }
        };
    }

    // 1. Verifikasi Otomatis melalui Endpoint AI MelekIsu
    // Default KEAMANAN: jika ada kendala jaringan, DEFAULT adalah Ditolak / Menunggu, BUKAN Terverifikasi!
    let moderation = {
        approved: false,
        status: "Ditolak" as "Terverifikasi" | "Menunggu Verifikasi" | "Ditolak",
        reason: "Tanggapan belum memenuhi verifikasi kurasi.",
        sentiment: "Ditolak"
    };

    try {
        const modRes = await fetch("/api/moderate-comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: AbortSignal.timeout(6000), // Max 6 detik
            body: JSON.stringify({
                text: text.trim(),
                author,
                newsSlug: slug,
                newsTitle: newsTitle || slug,
                newsExcerpt: newsExcerpt || "",
                newsContent: newsContent || "",
            }),
        });

        if (modRes.ok) {
            const modData = await modRes.json();
            moderation = {
                approved: Boolean(modData.approved),
                status: modData.status || (modData.approved ? "Terverifikasi" : "Ditolak"),
                reason: modData.reason || "",
                sentiment: modData.sentiment || "Konstruktif"
            };
        }
    } catch (err) {
        console.warn("Gagal terhubung ke endpoint moderasi AI:", err);
    }

    // 2. Simpan ke Supabase Cloud (baik Terverifikasi maupun Menunggu Verifikasi)
    if (moderation.status === "Terverifikasi" || moderation.status === "Menunggu Verifikasi") {
        try {
            const insertPayload = {
                news_slug: slug,
                author: author,
                author_email: authorEmail || null,
                text: text.trim(),
                status: moderation.status,
            };

            const { data, error } = await supabase
                .from("comments")
                .insert([insertPayload])
                .select();

            if (error) {
                console.error("Gagal insert komentar ke Supabase:", error);
            } else if (data && data.length > 0) {
                commentId = data[0].id;
            }
        } catch (e: any) {
            console.error("Exception saat kirim ke Supabase:", e);
        }
    }

    const newCommentItem: NewsComment & { moderation?: any } = {
        id: commentId,
        author: author,
        authorEmail: authorEmail,
        text: text.trim(),
        status: moderation.status,
        aiReason: moderation.reason,
        createdAt: new Date().toISOString(),
        moderation: moderation,
    };

    // 3. Simpan juga ke LocalStorage jika bukan ditolak
    if (moderation.status !== "Ditolak" && typeof window !== "undefined") {
        const storageKey = `comments_${slug}`;
        const saved = localStorage.getItem(storageKey);
        let list: NewsComment[] = [];
        if (saved) {
            try {
                list = JSON.parse(saved);
            } catch {}
        }
        list.push(newCommentItem);
        localStorage.setItem(storageKey, JSON.stringify(list));
        window.dispatchEvent(new Event("storage"));
    }

    return newCommentItem;
}
