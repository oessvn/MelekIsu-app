import { createClient } from "@/lib/supabase/client";

export type ActionStatus = "Selesai Diterapkan" | "Dalam Progres" | "Tahap Kajian Teknis";
export type ActionStatusType = "success" | "progress" | "review";

export interface TransparencyAction {
    id: string;
    agency: string;
    newsTitle: string;
    newsSlug: string;
    citizenName: string;
    citizenFeedback: string;
    officialResponse: string;
    status: ActionStatus;
    statusType: ActionStatusType;
    date: string;
    createdAt?: string;
}

export interface TransparencyStats {
    totalAspirasi: number;
    selesaiCount: number;
    selesaiPercent: number;
    progresCount: number;
    progresPercent: number;
    kajianCount: number;
    kajianPercent: number;
    avgResponseDays: string;
}

export function mapStatusToType(status: ActionStatus): ActionStatusType {
    if (status === "Selesai Diterapkan") return "success";
    if (status === "Dalam Progres") return "progress";
    return "review";
}

const STORAGE_KEY = "melekisu_transparency_actions";

// Mengambil seluruh daftar aksi transparansi (Supabase Cloud + fallback localStorage)
export async function getTransparencyActions(): Promise<TransparencyAction[]> {
    const supabase = createClient();

    try {
        const { data, error } = await supabase
            .from("news")
            .select("*")
            .eq("category", "Transparansi Aksi")
            .order("created_at", { ascending: false });

        if (!error && Array.isArray(data)) {
            const parsedList: TransparencyAction[] = [];
            for (const row of data) {
                try {
                    const parsed = JSON.parse(row.content);
                    parsedList.push({
                        id: row.id,
                        agency: parsed.agency || row.source || "Instansi Pemerintah",
                        newsTitle: parsed.newsTitle || row.title || "-",
                        newsSlug: parsed.newsSlug || "",
                        citizenName: parsed.citizenName || "Warga",
                        citizenFeedback: parsed.citizenFeedback || row.excerpt || "",
                        officialResponse: parsed.officialResponse || "",
                        status: parsed.status || "Dalam Progres",
                        statusType: mapStatusToType(parsed.status || "Dalam Progres"),
                        date: parsed.date || row.date || "Terbaru",
                        createdAt: row.created_at,
                    });
                } catch {
                    // Jika content bukan JSON, parse manual
                    parsedList.push({
                        id: row.id,
                        agency: row.source || "Instansi Pemerintah",
                        newsTitle: row.title || "-",
                        newsSlug: row.slug || "",
                        citizenName: "Warga Terverifikasi",
                        citizenFeedback: row.excerpt || "",
                        officialResponse: row.content || "",
                        status: (row.duration as ActionStatus) || "Dalam Progres",
                        statusType: mapStatusToType((row.duration as ActionStatus) || "Dalam Progres"),
                        date: row.date || "Terbaru",
                        createdAt: row.created_at,
                    });
                }
            }

            if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedList));
            }
            return parsedList;
        }
    } catch (e) {
        console.error("Gagal ambil transparansi aksi dari Supabase:", e);
    }

    // Fallback localStorage jika offline
    if (typeof window !== "undefined") {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
            try {
                return JSON.parse(local);
            } catch {}
        }
    }

    return [];
}

// Menghitung statistik murni dari data nyata (0 jika belum ada data, tanpa data palsu)
export function computeTransparencyStats(actions: TransparencyAction[]): TransparencyStats {
    const totalAspirasi = actions.length;
    if (totalAspirasi === 0) {
        return {
            totalAspirasi: 0,
            selesaiCount: 0,
            selesaiPercent: 0,
            progresCount: 0,
            progresPercent: 0,
            kajianCount: 0,
            kajianPercent: 0,
            avgResponseDays: "0 Hari",
        };
    }

    const selesaiCount = actions.filter((a) => a.status === "Selesai Diterapkan").length;
    const progresCount = actions.filter((a) => a.status === "Dalam Progres").length;
    const kajianCount = actions.filter((a) => a.status === "Tahap Kajian Teknis").length;

    const selesaiPercent = Math.round((selesaiCount / totalAspirasi) * 100);
    const progresPercent = Math.round((progresCount / totalAspirasi) * 100);
    const kajianPercent = Math.max(0, 100 - selesaiPercent - progresPercent);

    return {
        totalAspirasi,
        selesaiCount,
        selesaiPercent,
        progresCount,
        progresPercent,
        kajianCount,
        kajianPercent,
        avgResponseDays: "2 Hari Kerja",
    };
}

// Menambahkan aksi transparansi baru (Disimpan ke Supabase)
export async function saveTransparencyAction(
    actionData: Omit<TransparencyAction, "id" | "statusType" | "createdAt">
): Promise<{ success: boolean; data?: TransparencyAction; error?: string }> {
    const supabase = createClient();
    const statusType = mapStatusToType(actionData.status);
    const generatedSlug = `transparansi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const payloadContent = JSON.stringify({
        agency: actionData.agency,
        newsTitle: actionData.newsTitle,
        newsSlug: actionData.newsSlug,
        citizenName: actionData.citizenName,
        citizenFeedback: actionData.citizenFeedback,
        officialResponse: actionData.officialResponse,
        status: actionData.status,
        statusType: statusType,
        date: actionData.date,
    });

    try {
        const { data, error } = await supabase
            .from("news")
            .insert([
                {
                    title: `Tanggapan ${actionData.agency}: ${actionData.newsTitle}`,
                    slug: generatedSlug,
                    category: "Transparansi Aksi",
                    source: actionData.agency,
                    excerpt: actionData.citizenFeedback.slice(0, 200),
                    content: payloadContent,
                    date: actionData.date,
                    duration: actionData.status,
                    image: "",
                    likes: 0,
                },
            ])
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        const newId = data && data.length > 0 ? data[0].id : generatedSlug;
        const completeAction: TransparencyAction = {
            id: newId,
            ...actionData,
            statusType,
            createdAt: new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
            const current = await getTransparencyActions();
            const updated = [completeAction, ...current.filter((a) => a.id !== newId)];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }

        return { success: true, data: completeAction };
    } catch (e: any) {
        return { success: false, error: e.message || "Gagal menyimpan ke database" };
    }
}

// Memperbarui aksi transparansi yang sudah ada
export async function updateTransparencyAction(
    id: string,
    actionData: Partial<TransparencyAction>
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    try {
        // Ambil data lama
        const currentList = await getTransparencyActions();
        const existing = currentList.find((a) => a.id === id);
        if (!existing) {
            return { success: false, error: "Data aksi tidak ditemukan" };
        }

        const merged: TransparencyAction = {
            ...existing,
            ...actionData,
            statusType: actionData.status ? mapStatusToType(actionData.status) : existing.statusType,
        };

        const payloadContent = JSON.stringify({
            agency: merged.agency,
            newsTitle: merged.newsTitle,
            newsSlug: merged.newsSlug,
            citizenName: merged.citizenName,
            citizenFeedback: merged.citizenFeedback,
            officialResponse: merged.officialResponse,
            status: merged.status,
            statusType: merged.statusType,
            date: merged.date,
        });

        const { error } = await supabase
            .from("news")
            .update({
                source: merged.agency,
                excerpt: merged.citizenFeedback.slice(0, 200),
                content: payloadContent,
                duration: merged.status,
                date: merged.date,
            })
            .eq("id", id);

        if (error) {
            return { success: false, error: error.message };
        }

        if (typeof window !== "undefined") {
            const updated = currentList.map((a) => (a.id === id ? merged : a));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Gagal memperbarui data" };
    }
}

// Menghapus aksi transparansi
export async function deleteTransparencyAction(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    try {
        const { error } = await supabase.from("news").delete().eq("id", id);
        if (error) {
            return { success: false, error: error.message };
        }

        if (typeof window !== "undefined") {
            const current = await getTransparencyActions();
            const updated = current.filter((a) => a.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Gagal menghapus dari database" };
    }
}
