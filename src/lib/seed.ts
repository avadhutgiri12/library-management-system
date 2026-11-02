import type { Book } from "./types";

const now = "2026-01-01T00:00:00.000Z";

const cover = (isbn: string) =>
  `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

const raw: Omit<Book, "id" | "createdAt" | "updatedAt" | "coverUrl">[] = [
  { title: "The Alchemist", author: "Paulo Coelho", isbn: "9780062315007", category: "Fiction", totalCopies: 5, availableCopies: 3, publishedYear: 1988 },
  { title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", category: "Self-Help", totalCopies: 4, availableCopies: 4, publishedYear: 2018 },
  { title: "Wings of Fire", author: "A. P. J. Abdul Kalam", isbn: "9788173711466", category: "Biography", totalCopies: 6, availableCopies: 2, publishedYear: 1999 },
  { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", category: "Technology", totalCopies: 3, availableCopies: 0, publishedYear: 2008 },
  { title: "A Brief History of Time", author: "Stephen Hawking", isbn: "9780553380163", category: "Science", totalCopies: 2, availableCopies: 1, publishedYear: 1988 },
  { title: "Sapiens", author: "Yuval Noah Harari", isbn: "9780062316097", category: "History", totalCopies: 4, availableCopies: 2, publishedYear: 2011 },
  { title: "The Discovery of India", author: "Jawaharlal Nehru", isbn: "9780143031031", category: "History", totalCopies: 3, availableCopies: 3, publishedYear: 1946 },
  { title: "Harry Potter and the Philosopher's Stone", author: "J. K. Rowling", isbn: "9780747532699", category: "Children", totalCopies: 5, availableCopies: 0, publishedYear: 1997 },
];

export const SEED_BOOKS: Book[] = raw.map((b, i) => ({
  ...b,
  id: `seed-${i + 1}`,
  coverUrl: cover(b.isbn),
  createdAt: now,
  updatedAt: now,
}));
