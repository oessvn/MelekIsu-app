"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
    const router = useRouter();

    useEffect(() => {
        // Cek sesi login admin
        const adminSession = localStorage.getItem("melekisu_admin_session");
        if (adminSession) {
            router.replace("/admin/dashboard");
        } else {
            router.replace("/admin/login");
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-[#1E120A] flex items-center justify-center text-[#FDB659]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-[#FDB659] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold tracking-widest uppercase">Mengarahkan ke Portal Admin...</span>
            </div>
        </div>
    );
}
