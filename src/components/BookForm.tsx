"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, type BookInput } from "@/lib/types";
import BookCover from "./BookCover";

const EMPTY: BookInput = {
  title: "",
  author: "",
  isbn: "",
  category: "Fiction",
  totalCopies: 1,
  availableCopies: 1,
  publishedYear: 2024,
  coverUrl: "",
};

type Errors = Partial<Record<keyof BookInput, string>>;

function validate(v: BookInput): Errors {
  const e: Errors = {};
  const year = new Date().getFullYear();
  if (!v.title.trim()) e.title = "Title is required";
  if (!v.author.trim()) e.author = "Author is required";
  if (!/^(\d{9}[\dXx]|\d{13})$/.test(v.isbn.replace(/[-\s]/g, "")))
    e.isbn = "Enter a valid 10 or 13 digit ISBN";
  if (!Number.isInteger(v.totalCopies) || v.totalCopies < 0)
    e.totalCopies = "Must be 0 or more";
  if (!Number.isInteger(v.availableCopies) || v.availableCopies < 0)
    e.availableCopies = "Must be 0 or more";
  else if (v.availableCopies > v.totalCopies)
    e.availableCopies = "Can't exceed total copies";
  if (!Number.isInteger(v.publishedYear) || v.publishedYear < 1000 || v.publishedYear > year)
    e.publishedYear = `Enter a year between 1000 and ${year}`;
  if (v.coverUrl && !/^https?:\/\//.test(v.coverUrl))
    e.coverUrl = "Must start with http:// or https://";
  return e;
}

export default function BookForm({
  initial,
  submitLabel,
  onSubmit,
  cancelHref,
}: {
  initial?: BookInput;
  submitLabel: string;
  onSubmit: (values: BookInput) => void;
  cancelHref: string;
}) {
  const [values, setValues] = useState<BookInput>(initial ?? EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof BookInput>(key: K, value: BookInput[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit({
        ...values,
        title: values.title.trim(),
        author: values.author.trim(),
        isbn: values.isbn.replace(/[-\s]/g, ""),
        coverUrl: values.coverUrl.trim(),
      });
    }
  };

  const input =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none";

  const Field = ({
    label,
    name,
    children,
  }: {
    label: string;
    name: keyof BookInput;
    children: React.ReactNode;
  }) => (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {errors[name] && (
        <span className="mt-1 block text-xs text-red-600">{errors[name]}</span>
      )}
    </label>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_180px]"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          {Field({
            label: "Title *",
            name: "title",
            children: (
              <input className={input} value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. The Alchemist" />
            ),
          })}
        </div>
        {Field({
          label: "Author *",
          name: "author",
          children: (
            <input className={input} value={values.author} onChange={(e) => set("author", e.target.value)} placeholder="e.g. Paulo Coelho" />
          ),
        })}
        {Field({
          label: "ISBN *",
          name: "isbn",
          children: (
            <input className={input} value={values.isbn} onChange={(e) => set("isbn", e.target.value)} placeholder="10 or 13 digits" />
          ),
        })}
        {Field({
          label: "Category",
          name: "category",
          children: (
            <select className={input} value={values.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          ),
        })}
        {Field({
          label: "Published year",
          name: "publishedYear",
          children: (
            <input type="number" className={input} value={Number.isNaN(values.publishedYear) ? "" : values.publishedYear} onChange={(e) => set("publishedYear", parseInt(e.target.value, 10))} />
          ),
        })}
        {Field({
          label: "Total copies",
          name: "totalCopies",
          children: (
            <input type="number" min={0} className={input} value={Number.isNaN(values.totalCopies) ? "" : values.totalCopies} onChange={(e) => set("totalCopies", parseInt(e.target.value, 10))} />
          ),
        })}
        {Field({
          label: "Available copies",
          name: "availableCopies",
          children: (
            <input type="number" min={0} className={input} value={Number.isNaN(values.availableCopies) ? "" : values.availableCopies} onChange={(e) => set("availableCopies", parseInt(e.target.value, 10))} />
          ),
        })}
        <div className="sm:col-span-2">
          {Field({
            label: "Cover image URL (optional)",
            name: "coverUrl",
            children: (
              <input className={input} value={values.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} placeholder="https://…" />
            ),
          })}
        </div>
        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-indigo-700">
            {submitLabel}
          </button>
          <Link href={cancelHref} className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
            Cancel
          </Link>
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Cover preview</p>
        <BookCover key={values.coverUrl} src={values.coverUrl} title={values.title || "New book"} className="aspect-[2/3] w-full rounded-lg shadow" />
      </div>
    </form>
  );
}
