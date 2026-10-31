import { Suspense } from "react";
import ArticleDetailClient from "./ArticleDetailClient";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function ArticleContent({ params }: PageProps) {
    const { slug } = await params;
    return <ArticleDetailClient slug={slug} />;
}

export default function Page({ params }: PageProps) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FFF8F5]" />}>
            <ArticleContent params={params} />
        </Suspense>
    );
}
