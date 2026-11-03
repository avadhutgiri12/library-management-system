# 📚 LibraryHub – Library Management System

A demo Library Management System built with **Next.js (App Router)** and **Tailwind CSS**.
All data is stored in the browser's **localStorage**, so it runs with zero backend setup — perfect for presentations.

## 🔐 Demo login

| Email | Password |
|-------|----------|
| `admin@libraryhub.com` | `admin123` |

The credentials are also shown on the login page, with a one-click **Use demo credentials** button.

## ✨ Features

- **Login page** with demo credentials (admin role)
- **Dashboard** showing total books, total copies, available copies and out-of-stock titles
- **Add, view, edit and delete** books (with confirmation before delete)
- **Search** by title or author
- **Bulk import** from Excel (.xlsx/.xls) or CSV: upload a file and every book is added automatically. Columns are recognised on their own from the headings (even odd ones like "Name of Book", "Writer", "Qty", "Yr" or typos) and from the data itself (years, copies, genres, cover links, names vs titles), in any order and even without a heading row. Serial no., ISBN, price and similar columns are ignored. The dialog shows which column was used for each field.
- **Filter** by category and availability (available / out of stock)
- Form validation (copies, year) and live cover preview
- 8 sample books preloaded, plus a **Reset demo data** button
- Responsive **Minimal** design: modular tile grid, near-black `#0C0C09` / deep indigo `#312C85` on off-white `#F4F4F1`, Open Sans + Inconsolata, WCAG AA contrast and visible keyboard focus

### Book fields
Title · Author · Category · Total copies · Available copies · Published year · Cover image URL

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with the demo credentials.

## 🗂 Project structure

```
src/
  app/
    page.tsx                 # Login
    dashboard/page.tsx       # Stats, search, filters, books table
    books/new/page.tsx       # Add book
    books/[id]/page.tsx      # View book details
    books/[id]/edit/page.tsx # Edit book
  components/                # Navbar, AuthGuard, BookForm, BookCover, ...
  lib/
    store.ts                 # localStorage CRUD + demo auth
    seed.ts                  # Sample books
    types.ts                 # Book type & categories
```

## 🎨 Design system

The UI follows the **Minimal** design skill from [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills), installed at `.claude/skills/minimal/` (`SKILL.md` + `DESIGN.md`). Tokens live in `src/app/globals.css`.

## 🛠 Tech stack

- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4

> ℹ️ This is a demo: authentication and data live only in your browser. Clearing site data resets everything.
