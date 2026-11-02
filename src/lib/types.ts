export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  publishedYear: number;
  coverUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type BookInput = Omit<Book, "id" | "createdAt" | "updatedAt">;

export const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Self-Help",
  "Children",
  "Other",
] as const;
