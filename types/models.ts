// =============================================================================
// WartaGagasan — Shared TypeScript Interfaces
// =============================================================================

// --- User ---
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "user" | "admin";
  createdAt: string;
}

// --- Category ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  newsCount: number;
}

// --- News ---
export type NewsStatus = "draft" | "published" | "archived";

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  source: string;
  sourceUrl?: string;
  categoryId: string;
  category?: Category;
  authorId?: string;
  author?: User;
  status: NewsStatus;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

// --- Comment ---
export type CommentStatus = "pending" | "approved" | "rejected" | "hidden";

export interface Comment {
  id: string;
  newsId: string;
  userId: string;
  user?: User;
  content: string;
  status: CommentStatus;
  upvoteCount: number;
  upvotedBy: string[]; // user IDs who upvoted
  createdAt: string;
  updatedAt: string;
}

// --- Issue ---
export type IssueStatus =
  | "Belum ditindaklanjuti"
  | "Sedang diproses"
  | "Selesai";

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  categoryId: string;
  category?: Category;
  linkedNewsIds: string[];
  followerCount: number;
  createdAt: string;
  updatedAt: string;
}

// --- Progress Update ---
export interface ProgressUpdate {
  id: string;
  issueId: string;
  status: IssueStatus;
  summary: string;
  officialSourceUrl?: string;
  linkedNewsId?: string;
  linkedCommentId?: string;
  date: string;
  createdAt: string;
}

// --- API Response Wrappers ---
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// --- Notification Preferences ---
export interface NotificationPreferences {
  emailNewComment: boolean;
  emailIssueUpdate: boolean;
  emailNewsletter: boolean;
}

// --- Import Job (Admin) ---
export type ImportJobStatus = "idle" | "running" | "completed" | "failed";

export interface ImportJob {
  id: string;
  status: ImportJobStatus;
  totalItems: number;
  processedItems: number;
  errors: string[];
  startedAt?: string;
  completedAt?: string;
}
