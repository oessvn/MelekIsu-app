import { User } from "@/types/models";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Budi Santoso",
    email: "budi@example.com",
    avatarUrl: undefined,
    role: "user",
    createdAt: "2025-01-15T08:00:00Z",
  },
  {
    id: "user-2",
    name: "Siti Rahmawati",
    email: "siti@example.com",
    avatarUrl: undefined,
    role: "user",
    createdAt: "2025-02-20T10:30:00Z",
  },
  {
    id: "user-3",
    name: "Ahmad Fauzi",
    email: "ahmad@example.com",
    avatarUrl: undefined,
    role: "user",
    createdAt: "2025-03-10T14:00:00Z",
  },
  {
    id: "admin-1",
    name: "Admin WartaGagasan",
    email: "admin@wartagagasan.id",
    avatarUrl: undefined,
    role: "admin",
    createdAt: "2024-12-01T00:00:00Z",
  },
];

/** Demo user for client-side interactions. Not a real authentication. */
export const DEMO_USER = mockUsers[0];
