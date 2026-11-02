import type { Metadata } from "next";
import { Open_Sans, Inconsolata } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
});

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LibraryHub – Library Management System",
  description: "A demo library management system built with Next.js and Tailwind CSS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${inconsolata.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface font-sans text-ink">{children}</body>
    </html>
  );
}
