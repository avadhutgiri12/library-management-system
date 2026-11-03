"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, type BookInput } from "@/lib/types";
import BookCover from "./BookCover";

const EMPTY: BookInput = {
  title: "",
  author: "",
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
        coverUrl: values.coverUrl.trim(),
      });
    }
  };

  const Field = ({
    label,
    name,
    hint,
    children,
  }: {
    label: string;
    name: keyof BookInput;
    hint?: string;
    children: (props: { id: string; className: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
  }) => {
    const id = `field-${name}`;
    const err = errors[name];
    return (
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {children({
          id,
          className: `field ${err ? "field-error" : ""}`,
          "aria-invalid": Boolean(err),
          "aria-describedby": err ? `${id}-error` : hint ? `${id}-hint` : undefined,
        })}
        {err ? (
          <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
            {err}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    );
  };

  const num = (n: number) => (Number.isNaN(n) ? "" : n);

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-4 lg:grid-cols-3">
      {/* Details tile */}
      <section aria-labelledby="details-h" className="tile lg:col-span-2">
        <h2 id="details-h" className="label-caps">Book details</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {Field({ label: "Title", name: "title", children: (p) => (
              <input {...p} value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. The Alchemist" />
            ) })}
          </div>
          {Field({ label: "Author", name: "author", children: (p) => (
            <input {...p} value={values.author} onChange={(e) => set("author", e.target.value)} placeholder="e.g. Paulo Coelho" />
          ) })}
          {Field({ label: "Category", name: "category", children: (p) => (
            <select {...p} value={values.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          ) })}
          {Field({ label: "Published year", name: "publishedYear", children: (p) => (
            <input {...p} type="number" value={num(values.publishedYear)} onChange={(e) => set("publishedYear", parseInt(e.target.value, 10))} />
          ) })}
        </div>
      </section>

      {/* Cover tile */}
      <section aria-labelledby="cover-h" className="tile flex flex-col bg-primary-soft">
        <h2 id="cover-h" className="label-caps">Cover</h2>
        <BookCover key={values.coverUrl} src={values.coverUrl} title={values.title || "New book"} className="mx-auto mt-4 aspect-[2/3] w-36 rounded-xl shadow-md" />
        <div className="mt-4">
          {Field({ label: "Image URL (optional)", name: "coverUrl", children: (p) => (
            <input {...p} type="url" value={values.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} placeholder="https://…" />
          ) })}
        </div>
      </section>

      {/* Copies tile */}
      <section aria-labelledby="copies-h" className="tile bg-secondary-soft/60 lg:col-span-2">
        <h2 id="copies-h" className="label-caps">Inventory</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {Field({ label: "Total copies", name: "totalCopies", children: (p) => (
            <input {...p} type="number" min={0} value={num(values.totalCopies)} onChange={(e) => set("totalCopies", parseInt(e.target.value, 10))} />
          ) })}
          {Field({ label: "Available copies", name: "availableCopies", hint: "Can't be more than total copies", children: (p) => (
            <input {...p} type="number" min={0} value={num(values.availableCopies)} onChange={(e) => set("availableCopies", parseInt(e.target.value, 10))} />
          ) })}
        </div>
      </section>

      {/* Actions tile */}
      <section className="tile flex flex-col justify-center gap-3">
        <button type="submit" className="btn-dark w-full !py-3">
          {submitLabel}
        </button>
        <Link href={cancelHref} className="btn-ghost w-full !py-3">
          Cancel
        </Link>
        {Object.keys(errors).length > 0 && (
          <p role="alert" className="text-center text-xs font-medium text-danger">
            Fix the highlighted fields to continue.
          </p>
        )}
      </section>
    </form>
  );
}
