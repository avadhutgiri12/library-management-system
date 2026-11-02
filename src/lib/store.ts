"use client";

import { useSyncExternalStore } from "react";
import { SEED_BOOKS } from "./seed";
import type { Book, BookInput } from "./types";

const BOOKS_KEY = "libraryhub.books";
const SESSION_KEY = "libraryhub.session";

export const DEMO_CREDENTIALS = {
  email: "admin@libraryhub.com",
  password: "admin123",
  name: "Admin",
};

/* ---------- tiny pub/sub so every component re-renders on change ---------- */
const listeners = new Set<() => void>();
function emit() {
  cachedBooks = null;
  cachedSession = undefined;
  listeners.forEach((l) => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => emit();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/* ---------------------------------- books --------------------------------- */
let cachedBooks: Book[] | null = null;
const EMPTY: Book[] = [];

function readBooks(): Book[] {
  if (cachedBooks) return cachedBooks;
  const raw = localStorage.getItem(BOOKS_KEY);
  if (raw === null) {
    localStorage.setItem(BOOKS_KEY, JSON.stringify(SEED_BOOKS));
    cachedBooks = SEED_BOOKS;
    return cachedBooks;
  }
  try {
    cachedBooks = JSON.parse(raw) as Book[];
  } catch {
    cachedBooks = [];
  }
  return cachedBooks;
}

function writeBooks(books: Book[]) {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  emit();
}

export function useBooks(): { books: Book[]; ready: boolean } {
  const books = useSyncExternalStore(subscribe, readBooks, () => EMPTY);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  return { books, ready };
}

export function getBook(id: string): Book | undefined {
  return readBooks().find((b) => b.id === id);
}

export function addBook(input: BookInput): Book {
  const now = new Date().toISOString();
  const book: Book = {
    ...input,
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now()),
    createdAt: now,
    updatedAt: now,
  };
  writeBooks([book, ...readBooks()]);
  return book;
}

export function updateBook(id: string, input: BookInput) {
  writeBooks(
    readBooks().map((b) =>
      b.id === id ? { ...b, ...input, updatedAt: new Date().toISOString() } : b,
    ),
  );
}

export function deleteBook(id: string) {
  writeBooks(readBooks().filter((b) => b.id !== id));
}

export function resetDemoData() {
  writeBooks(SEED_BOOKS);
}

/* --------------------------------- session -------------------------------- */
export interface Session {
  email: string;
  name: string;
  role: "admin";
}
let cachedSession: Session | null | undefined;

function readSession(): Session | null {
  if (cachedSession !== undefined) return cachedSession;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    cachedSession = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

export function useSession() {
  const session = useSyncExternalStore(subscribe, readSession, () => null);
  const ready = useSyncExternalStore(subscribe, () => true, () => false);
  return { session, ready };
}

export function login(email: string, password: string): boolean {
  if (
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  ) {
    const session: Session = {
      email: DEMO_CREDENTIALS.email,
      name: DEMO_CREDENTIALS.name,
      role: "admin",
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    emit();
    return true;
  }
  return false;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  emit();
}
