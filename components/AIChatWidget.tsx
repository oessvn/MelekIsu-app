"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    MessageSquare,
    X,
    Send,
    Bot,
    User,
    RotateCcw,
    Sparkles,
    FileText,
    ArrowUpRight,
    ChevronDown,
} from "lucide-react";
import { newsDatabase } from "@/data/news";

interface Message {
    id: string;
    sender: "ai" | "user";
    text: string;
    timestamp?: string;
}

// Komponen perender teks markdown sederhana (bold, list, link rujukan berita)
function FormattedContent({ content }: { content: string }) {
    const lines = content.split("\n");

    return (
        <div className="space-y-1.5 leading-relaxed">
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    return <div key={idx} className="h-1.5" />;
                }

                const isBullet = trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("* ");
                const cleanLine = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : trimmed;

                // Tokenizer untuk link [Label](url) dan bold **teks**
                const tokens = cleanLine.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

                const parsedInline = tokens.map((part, pIdx) => {
                    // Match Link [Judul](/berita/slug)
                    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (linkMatch) {
                        const [, label, href] = linkMatch;
                        return (
                            <Link
                                key={pIdx}
                                href={href}
                                className="inline-flex items-center gap-0.5 font-bold text-[#9B4000] underline underline-offset-2 hover:text-[#724700] hover:bg-[#FFDDC9]/40 px-1 py-0.5 rounded transition-colors"
                            >
                                <span>{label}</span>
                                <ArrowUpRight className="w-3 h-3 inline shrink-0" />
                            </Link>
                        );
                    }

                    // Match Bold **teks**
                    const boldMatch = part.match(/^\*\*([^*]+)\*\*$/);
                    if (boldMatch) {
                        return <strong key={pIdx} className="font-bold text-[#28180C]">{boldMatch[1]}</strong>;
                    }

                    return <span key={pIdx}>{part}</span>;
                });

                if (isBullet) {
                    return (
                        <div key={idx} className="flex items-start gap-2 pl-1">
                            <span className="text-[#9B4000] font-bold text-xs select-none">•</span>
                            <div className="flex-1">{parsedInline}</div>
                        </div>
                    );
                }

                return <div key={idx}>{parsedInline}</div>;
            })}
        </div>
    );
}

function AIChatWidgetInner() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Deteksi apakah user sedang berada di halaman detail berita
    const currentSlug = useMemo(() => {
        if (pathname && pathname.startsWith("/berita/")) {
            const slug = pathname.replace("/berita/", "").split("/")[0];
            return slug && slug !== "" ? slug : null;
        }
        return null;
    }, [pathname]);

    // Ambil data artikel yang sedang dibaca (jika ada)
    const currentArticle = useMemo(() => {
        if (!currentSlug) return null;
        return newsDatabase.find((n) => n.slug === currentSlug) || null;
    }, [currentSlug]);

    const initialGreeting = useMemo(() => {
        if (currentArticle) {
            return `Halo, Warga! Saya melihat Anda sedang membaca **"${currentArticle.title}"**.\n\nAda yang ingin Anda tanyakan seputar berita ini, atau ingin ringkasan dan analisis dampaknya bagi publik?`;
        }
        return "Halo, Warga! Saya Asisten AI MelekIsu. Saya siap membantu Anda menganalisis berita, memahami kebijakan publik, atau merangkum isu terkini di portal ini.";
    }, [currentArticle]);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: "init",
            sender: "ai",
            text: initialGreeting,
        },
    ]);

    // Update salam awal jika berpindah artikel
    useEffect(() => {
        if (messages.length === 1 && messages[0].id === "init") {
            setMessages([
                {
                    id: "init",
                    sender: "ai",
                    text: initialGreeting,
                },
            ]);
        }
    }, [initialGreeting, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, messages, isLoading]);

    // Listener custom event agar tombol mana saja di aplikasi bisa membuka dan bertanya ke AI
    useEffect(() => {
        const handleOpenChat = (e: any) => {
            const detail = e.detail;
            setIsOpen(true);
            if (detail && detail.prompt) {
                sendMessage(detail.prompt);
            }
        };

        window.addEventListener("open-ai-chat", handleOpenChat);
        return () => window.removeEventListener("open-ai-chat", handleOpenChat);
    }, [messages, currentSlug]);

    const sendMessage = async (textToSend: string) => {
        const text = textToSend.trim();
        if (!text || isLoading) return;

        const userMsg: Message = {
            id: `usr-${Date.now()}`,
            sender: "user",
            text,
        };

        const updatedHistory = [...messages, userMsg];
        setMessages(updatedHistory);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: text,
                    history: updatedHistory.slice(-6).map((m) => ({
                        sender: m.sender,
                        text: m.text,
                    })),
                    currentSlug: currentSlug,
                }),
            });

            const data = await res.json();

            const aiMsg: Message = {
                id: `ai-${Date.now()}`,
                sender: "ai",
                text: data.reply || "Maaf, terjadi kendala saat merumuskan jawaban.",
            };

            setMessages((prev) => [...prev, aiMsg]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `err-${Date.now()}`,
                    sender: "ai",
                    text: "Maaf, koneksi ke server AI terganggu. Silakan periksa jaringan dan coba lagi.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: `init-${Date.now()}`,
                sender: "ai",
                text: initialGreeting,
            },
        ]);
    };

    // Pertanyaan rekomendasi cepat (chips)
    const quickPrompts = useMemo(() => {
        if (currentArticle) {
            return [
                "Ringkas berita ini",
                "Apa manfaat bagi warga?",
                "Siapa pihak terkait di berita ini?",
            ];
        }
        return [
            "Berita terbaru apa saja?",
            "Kebijakan pupuk subsidi",
            "Transit nol emisi 2025",
            "Satu data anggaran terbuka",
        ];
    }, [currentArticle]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Tombol Gelembung Chat Mengambang */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center gap-2.5 bg-gradient-to-r from-[#9B4000] to-[#803500] hover:from-[#8C4A1E] hover:to-[#6E2A00] text-white px-4 py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
                    aria-label="Buka Asisten AI Kebijakan Publik"
                >
                    <div className="relative">
                        <MessageSquare className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4ADE80] rounded-full ring-2 ring-[#9B4000] animate-pulse" />
                    </div>
                    <div className="flex flex-col text-left">
                        <span className="text-xs font-bold leading-tight">Tanya Asisten AI</span>
                        <span className="text-[10px] text-[#FFDDC9] font-medium opacity-90 group-hover:opacity-100">
                            {currentArticle ? "Tanya artikel ini" : "Terintegrasi Berita"}
                        </span>
                    </div>
                </button>
            )}

            {/* Jendela Kotak Chat */}
            {isOpen && (
                <div className="w-[340px] sm:w-[410px] h-[560px] bg-white rounded-3xl shadow-2xl border border-[#DEC0B3]/60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header Chat */}
                    <div className="bg-gradient-to-r from-[#9B4000] via-[#8C4A1E] to-[#723B18] text-white p-3.5 sm:p-4 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FDB659] to-[#FFF1E9] text-[#28180C] flex items-center justify-center font-bold text-base shadow-sm ring-2 ring-white/20">
                                🤖
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="text-xs sm:text-sm font-extrabold leading-tight tracking-tight">
                                        Asisten AI MelekIsu
                                    </h3>
                                    <span className="text-[9px] bg-[#4ADE80]/20 text-[#86EFAC] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                                        Online
                                    </span>
                                </div>
                                <span className="text-[10.5px] text-[#FFDDC9] font-medium flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-[#FDB659]" />
                                    Terkoneksi Berita & Kebijakan Publik
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleClearChat}
                                title="Reset Percakapan"
                                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                                aria-label="Reset Percakapan"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title="Tutup Chat"
                                className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                                aria-label="Tutup Asisten AI"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Banner Konteks Artikel yang Sedang Dibaca (Jika ada) */}
                    {currentArticle && (
                        <div className="bg-[#FFF1E9] border-b border-[#DEC0B3]/60 px-3.5 py-2 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-3.5 h-3.5 text-[#9B4000] shrink-0" />
                                <p className="truncate text-[11px] font-semibold text-[#574238]">
                                    <span className="text-[#9B4000] font-bold">Sedang Dibaca:</span> {currentArticle.title}
                                </p>
                            </div>
                            <span className="text-[9.5px] bg-[#9B4000]/10 text-[#9B4000] font-bold px-1.5 py-0.5 rounded shrink-0">
                                Aktif
                            </span>
                        </div>
                    )}

                    {/* Area Riwayat Pesan */}
                    <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5 bg-[#FFF8F5]/60 text-xs">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.sender === "ai" && (
                                    <div className="w-7 h-7 rounded-xl bg-[#9B4000] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[85%] p-3.5 rounded-2xl text-[12px] sm:text-[12.5px] shadow-2xs ${msg.sender === "user"
                                        ? "bg-[#9B4000] text-white rounded-tr-xs"
                                        : "bg-white text-[#28180C] border border-[#DEC0B3]/50 rounded-tl-xs"
                                        }`}
                                >
                                    {msg.sender === "ai" ? (
                                        <FormattedContent content={msg.text} />
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    )}
                                </div>
                                {msg.sender === "user" && (
                                    <div className="w-7 h-7 rounded-xl bg-[#FDB659] text-[#28180C] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                                        <User className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-2.5 items-center justify-start">
                                <div className="w-7 h-7 rounded-xl bg-[#9B4000] text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-white p-3 rounded-2xl border border-[#DEC0B3]/50 shadow-2xs flex items-center gap-2">
                                    <div className="flex gap-1 items-center">
                                        <div className="w-2 h-2 rounded-full bg-[#9B4000] animate-bounce" />
                                        <div className="w-2 h-2 rounded-full bg-[#9B4000] animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-2 h-2 rounded-full bg-[#9B4000] animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                    <span className="text-[11px] text-[#8B7266] italic font-medium">
                                        AI sedang menganalisis berita...
                                    </span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Chips Rekomendasi Pertanyaan Cepat */}
                    <div className="bg-white/90 border-t border-[#DEC0B3]/30 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                        <span className="text-[10px] text-[#8B7266] font-bold shrink-0 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#9B4000]" /> Tanya:
                        </span>
                        {quickPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => sendMessage(prompt)}
                                disabled={isLoading}
                                className="shrink-0 text-[10.5px] font-semibold bg-[#FFF1E9] hover:bg-[#FFDDC9] text-[#9B4000] px-2.5 py-1 rounded-full border border-[#DEC0B3]/50 transition-all cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    {/* Form Input Kirim Pesan */}
                    <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-[#DEC0B3]/50 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                currentArticle
                                    ? "Tanya seputar berita ini..."
                                    : "Tanya seputar berita, kebijakan publik..."
                            }
                            disabled={isLoading}
                            className="flex-1 bg-[#FFF8F5] px-3.5 py-2.5 text-xs rounded-xl border border-[#DEC0B3]/70 focus:outline-none focus:ring-1.5 focus:ring-[#9B4000] text-[#28180C] placeholder:text-[#8B7266]/70 disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-[#9B4000] hover:bg-[#8C4A1E] disabled:opacity-40 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                            aria-label="Kirim Pesan"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>

                </div>
            )}
        </div>
    );
}

export default function AIChatWidget() {
    return (
        <Suspense fallback={null}>
            <AIChatWidgetInner />
        </Suspense>
    );
}
