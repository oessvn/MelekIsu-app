"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";

interface Message {
    id: string;
    sender: "ai" | "user";
    text: string;
}

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "ai",
            text: "Halo, Warga! Saya Asisten AI MelekIsu. Ada yang ingin kamu tanyakan mengenai kebijakan publik, data anggaran, atau artikel hari ini?",
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [isOpen, messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessageText = input.trim();
        const newUserMessage: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: userMessageText,
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Panggil API Route backend yang akan kita buat
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessageText }),
            });

            const data = await response.json();

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: data.reply || "Maaf, terjadi kendala saat memproses jawaban.",
            };

            setMessages((prev) => [...prev, aiResponse]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    sender: "ai",
                    text: "Maaf, koneksi ke server AI sedang bermasalah.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Tombol Gelembung Chat Mengambang */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 bg-[#9B4000] hover:bg-[#8C4A1E] text-white px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                    aria-label="Buka Asisten AI"
                >
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-xs font-bold">Tanya Asisten AI</span>
                </button>
            )}

            {/* Jendela Kotak Chat */}
            {isOpen && (
                <div className="w-[340px] sm:w-[380px] h-[500px] bg-white rounded-3xl shadow-2xl border border-[#DEC0B3]/50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header Chat */}
                    <div className="bg-[#9B4000] text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#FDB659] text-[#28180C] flex items-center justify-center font-bold text-sm shadow-sm">
                                🤖
                            </div>
                            <div>
                                <h3 className="text-xs font-bold leading-tight">Asisten Kebijakan MelekIsu</h3>
                                <span className="text-[10px] text-[#FFDDC9]">Online • Siap Membantu</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Area Riwayat Pesan */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FFF8F5]/50 text-xs">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.sender === "ai" && (
                                    <div className="w-6 h-6 rounded-full bg-[#9B4000] text-white flex items-center justify-center shrink-0 text-[10px]">
                                        <Bot className="h-3.5 w-3.5" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl leading-relaxed ${msg.sender === "user"
                                            ? "bg-[#9B4000] text-white rounded-br-xs"
                                            : "bg-white text-[#28180C] border border-[#DEC0B3]/40 rounded-bl-xs shadow-2xs"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.sender === "user" && (
                                    <div className="w-6 h-6 rounded-full bg-[#FDB659] text-[#28180C] flex items-center justify-center shrink-0 text-[10px]">
                                        <User className="h-3.5 w-3.5" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 items-center text-[#8B7266] italic text-[11px]">
                                <div className="w-2 h-2 rounded-full bg-[#9B4000] animate-bounce"></div>
                                <div className="w-2 h-2 rounded-full bg-[#9B4000] animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 rounded-full bg-[#9B4000] animate-bounce [animation-delay:0.4s]"></div>
                                <span>AI sedang merumuskan jawaban...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form Kirim Pesan */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-[#DEC0B3]/40 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tanyakan isu atau kebijakan..."
                            className="flex-1 bg-[#FFF8F5] px-3.5 py-2 text-xs rounded-xl border border-[#DEC0B3]/60 focus:outline-none focus:ring-1 focus:ring-[#9B4000] text-[#28180C]"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-[#9B4000] hover:bg-[#8C4A1E] disabled:opacity-50 text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>

                </div>
            )}
        </div>
    );
}