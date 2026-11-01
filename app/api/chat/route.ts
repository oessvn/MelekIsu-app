import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ reply: "Pesan tidak boleh kosong." }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                reply: "API Key Gemini belum terdeteksi di server."
            });
        }

        // Coba panggil model Gemini Pro
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Kamu adalah Asisten Kebijakan Publik untuk portal berita "MelekIsu". Jawablah pertanyaan warga berikut dengan ramah, profesional, dan dalam bahasa Indonesia yang baik: ${message}`
                                }
                            ]
                        }
                    ]
                }),
            }
        );

        const data = await response.json();

        // Jika terjadi error pada model, berikan respons tematik otomatis yang interaktif
        if (data.error) {
            console.warn("Gemini API Restricted, switching to Smart Local Assistant:", data.error.message);

            let fallbackReply = "Halo Warga! Mengenai pertanyaan tersebut, MelekIsu terus berkomitmen mengawal transparansi kebijakan publik, data anggaran, dan kajian lapangan agar dapat diakses secara transparan oleh seluruh masyarakat.";

            const lower = message.toLowerCase();
            if (lower.includes("halo") || lower.includes("hai")) {
                fallbackReply = "Halo, Warga! Ada yang ingin kamu tanyakan mengenai kebijakan publik, data anggaran, atau artikel terbaru di MelekIsu?";
            } else if (lower.includes("transportasi") || lower.includes("transit")) {
                fallbackReply = "Kebijakan mobilitas perkotaan berfokus pada integrasi transit nol emisi di koridor urban 2025 untuk menekan emisi dan mempermudah mobilitas warga.";
            } else if (lower.includes("anggaran") || lower.includes("dana")) {
                fallbackReply = "Portal Satu Data Anggaran Terbuka di MelekIsu memungkinkan warga memantau real-time alokasi anggaran dan progres fisik pekerjaan umum secara akuntabel.";
            }

            return NextResponse.json({ reply: fallbackReply });
        }

        const aiReply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Terima kasih atas masukannya untuk portal MelekIsu.";

        return NextResponse.json({ reply: aiReply.trim() });

    } catch (error) {
        console.error("Error AI Chat API:", error);
        return NextResponse.json({ reply: "Terjadi kesalahan jaringan saat menghubungi server AI." }, { status: 500 });
    }
}