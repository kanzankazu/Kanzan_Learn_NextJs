/**
 * Root Layout — app/layout.tsx
 *
 * This is THE most important file in an App Router project.
 * Every single page in your app is wrapped by this layout.
 *
 * KEY CONCEPTS:
 * ─────────────
 * 1. RootLayout is a SERVER COMPONENT by default (no 'use client').
 *    It runs on the server and sends HTML to the browser.
 *
 * 2. It must return an <html> and <body> tag.
 *    Only the root layout can do this — nested layouts cannot.
 *
 * 3. `children` receives the current page's content.
 *    Think of it as a "slot" that the router fills in.
 *
 * 4. `metadata` export tells Next.js what <title> and <meta> tags to generate.
 *    You can override this in any nested page or layout.
 *
 * ANALOGY:
 * ─────────
 * Think of RootLayout like the shell of an Android Activity —
 * it always stays mounted while only the inner content (Fragment/page) changes.
 *
 * Docs: https://nextjs.org/docs/app/api-reference/file-conventions/layout
 */

import type { Metadata } from "next";
import "./globals.css";

// ─── Metadata ────────────────────────────────────────────────────────────────
// This is the base metadata for the whole app.
// Any page can export its own `metadata` to override these values.
export const metadata: Metadata = {
  title: {
    // `template` adds a suffix to all nested page titles.
    // e.g., "Phase 0 — File-based Routing | Kanzan Learn Next.js"
    template: "%s | Kanzan Learn Next.js",
    default: "Kanzan Learn Next.js",
  },
  description:
    "A structured Next.js learning repository — from zero to production-ready. Phase 0–10.",
};

// ─── Root Layout Component ────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  // `children` is a special React prop that represents nested content.
  // In the App Router, Next.js automatically passes the matching page here.
  children: React.ReactNode;
}) {
  return (
    // `lang="en"` is important for accessibility (screen readers, SEO).
    <html lang="en">
      {/*
       * suppressHydrationWarning is needed when the server-rendered HTML might
       * slightly differ from the client-rendered HTML (e.g., browser extensions
       * adding attributes). Without it, React logs a hydration mismatch warning.
       */}
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
