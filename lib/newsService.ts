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
 * Mengambil komentar untuk sebuah artikel (baik dari Supabase maupun LocalStorage)
 */
export async function getCommentsForSlug(slug: string): Promise<NewsComment[]> {
    const supabase = createClient();

    // 1. Coba ambil dari Supabase
    try {
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("news_slug", slug)
            .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
            return data.map((c) => ({
                id: c.id,
                author: c.author,
                authorEmail: c.author_email,
                text: c.text,
                status: c.status || "Menunggu Verifikasi",
                createdAt: c.created_at,
            }));
        }
    } catch {}

    // 2. Fallback ke LocalStorage
    if (typeof window !== "undefined") {
        const saved = localStorage.getItem(`comments_${slug}`);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {}
        }
    }

    // 3. Fallback ke newsDatabase mock
    const defaultNews = newsDatabase.find((n) => n.slug === slug);
    return defaultNews?.commentsList || [];
}

/**
 * Mengirim komentar baru: otomatis masuk ke Supabase Cloud
 */
export async function sendComment(slug: string, author: string, authorEmail: string, text: string): Promise<NewsComment> {
    const supabase = createClient();
    let commentId = `c-${Date.now()}`;

    // 1. Simpan ke Supabase Cloud
    try {
        const insertPayload = {
            news_slug: slug,
            author: author,
            author_email: authorEmail || null,
            text: text.trim(),
            status: "Menunggu Verifikasi",
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

    const newCommentItem: NewsComment = {
        id: commentId,
        author: author,
        authorEmail: authorEmail,
        text: text.trim(),
        status: "Menunggu Verifikasi",
        createdAt: new Date().toISOString(),
    };

    // 2. Simpan juga ke LocalStorage agar UI instan dan reaktif
    if (typeof window !== "undefined") {
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
