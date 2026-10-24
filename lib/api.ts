// =============================================================================
// WartaGagasan — Centralized API Client Abstraction
// =============================================================================
//
// This module provides a single point of entry for all data fetching.
// Currently returns mock data for frontend development.
// When the backend partner delivers the API, replace the mock implementations
// with real fetch calls — the component interfaces remain unchanged.
//
// Usage:
//   import { api } from "@/lib/api";
//   const news = await api.news.getAll();
// =============================================================================

import type {
  NewsArticle,
  Category,
  Comment,
  Issue,
  ProgressUpdate,
  PaginatedResponse,
} from "@/types/models";

import {
  mockNews,
  mockCategories,
  mockComments,
  mockIssues,
  mockProgressUpdates,
} from "@/mocks";

// ---------------------------------------------------------------------------
// Base URL — reads from env when available, unused during mock phase
// ---------------------------------------------------------------------------
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api";

/** Simulate network latency for realistic UX testing */
function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic fetcher — will be used for real API calls.
 * Currently unused but provided for future integration.
 */
async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Keep the linter happy — fetcher will be used when backend is ready
void fetcher;

// ---------------------------------------------------------------------------
// News API
// ---------------------------------------------------------------------------
const newsApi = {
  async getAll(params?: {
    categorySlug?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<NewsArticle>> {
    let filtered = mockNews.filter((n) => n.status === "published");

    if (params?.categorySlug) {
      const cat = mockCategories.find((c) => c.slug === params.categorySlug);
      if (cat) {
        filtered = filtered.filter((n) => n.categoryId === cat.id);
      }
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt.toLowerCase().includes(q)
      );
    }

    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return {
      data: paged.map((n) => ({
        ...n,
        category: mockCategories.find((c) => c.id === n.categoryId),
      })),
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize),
    };
  },

  async getBySlug(slug: string): Promise<NewsArticle | null> {
    await delay();
    const article = mockNews.find(
      (n) => n.slug === slug && n.status === "published"
    );
    if (!article) return null;
    return {
      ...article,
      category: mockCategories.find((c) => c.id === article.categoryId),
    };
  },

  /** Admin: get all news including drafts and archived */
  async getAllAdmin(): Promise<NewsArticle[]> {
    await delay();
    return mockNews.map((n) => ({
      ...n,
      category: mockCategories.find((c) => c.id === n.categoryId),
    }));
  },
};

// ---------------------------------------------------------------------------
// Category API
// ---------------------------------------------------------------------------
const categoryApi = {
  async getAll(): Promise<Category[]> {
    return mockCategories;
  },
};

// ---------------------------------------------------------------------------
// Comment API
// ---------------------------------------------------------------------------
const commentApi = {
  /** Get approved comments for a news article (public) */
  async getByNewsId(newsId: string): Promise<Comment[]> {
    await delay();
    return mockComments
      .filter((c) => c.newsId === newsId && c.status === "approved")
      .map((c) => ({
        ...c,
        user: undefined, // Will be populated when backend is ready
      }));
  },

  /** Admin: get all comments */
  async getAllAdmin(): Promise<Comment[]> {
    await delay();
    return mockComments;
  },
};

// ---------------------------------------------------------------------------
// Issue API
// ---------------------------------------------------------------------------
const issueApi = {
  async getAll(): Promise<Issue[]> {
    return mockIssues.map((i) => ({
      ...i,
      category: mockCategories.find((c) => c.id === i.categoryId),
    }));
  },

  async getById(id: string): Promise<Issue | null> {
    await delay();
    const issue = mockIssues.find((i) => i.id === id);
    if (!issue) return null;
    return {
      ...issue,
      category: mockCategories.find((c) => c.id === issue.categoryId),
    };
  },
};

// ---------------------------------------------------------------------------
// Progress API
// ---------------------------------------------------------------------------
const progressApi = {
  async getByIssueId(issueId: string): Promise<ProgressUpdate[]> {
    await delay();
    return mockProgressUpdates
      .filter((p) => p.issueId === issueId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
};

// ---------------------------------------------------------------------------
// Unified API export
// ---------------------------------------------------------------------------
export const api = {
  news: newsApi,
  categories: categoryApi,
  comments: commentApi,
  issues: issueApi,
  progress: progressApi,
};
