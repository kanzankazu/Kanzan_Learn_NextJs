/**
 * Lesson 01 — fetch() in Server Components
 * Route: /phase-2/01-server-fetch
 *
 * THE KEY INSIGHT:
 * ────────────────
 * In classic React, you fetch data using useEffect + useState:
 *
 *   const [data, setData] = useState(null);
 *   useEffect(() => {
 *     fetch('/api/products').then(r => r.json()).then(setData);
 *   }, []);
 *
 * This causes the "waterfall" problem:
 *   1. Browser downloads JS bundle
 *   2. React renders (nothing yet)
 *   3. useEffect fires AFTER render
 *   4. Fetch starts
 *   5. Data arrives
 *   6. Re-render with data
 * That's 6 sequential steps before the user sees content!
 *
 * IN NEXT.JS SERVER COMPONENTS:
 * ───────────────────────────────
 * The component is async. fetch() runs ON THE SERVER before rendering.
 * The browser receives fully rendered HTML with data already included.
 * No useEffect, no loading state, no re-render needed.
 *
 * HOW FETCH DEDUPLICATION WORKS:
 * ───────────────────────────────
 * If two Server Components in the same render tree both call
 * fetch('https://api.example.com/user'), Next.js automatically
 * runs the fetch ONLY ONCE and reuses the result. This is called
 * "request deduplication" and it's built into the framework.
 * No need for global state or context to share fetch results.
 *
 * ANALOGY FOR ANDROID DEVS:
 * ───────────────────────────
 * It's like your ViewModel's init {} block calling a suspend function —
 * except here the "ViewModel" is your page component itself.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "01 — fetch() in Server Components",
};

// ─── Types ────────────────────────────────────────────────────────────────────
// Define the shape of the data we expect from our (simulated) API.
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

// ─── Simulated server-side data fetch ─────────────────────────────────────────
// In a real app, this could be:
//   - fetch('https://api.yourstore.com/products')
//   - await db.product.findMany()   (Prisma)
//   - await supabase.from('products').select()
//
// The setTimeout simulates network/DB latency (200ms).
// This code RUNS ON THE SERVER — it never appears in the browser's JS bundle.
// You could safely include database credentials, secrets, or internal URLs here.
async function getProducts(): Promise<Product[]> {
  // Simulate 200ms network/database latency
  await new Promise((resolve) => setTimeout(resolve, 200));

  // This is simulated data. In production, replace with a real fetch/DB call.
  return [
    { id: 1, name: "Wireless Headphones", price: 79_000, category: "Electronics", inStock: true },
    { id: 2, name: "Mechanical Keyboard", price: 149_000, category: "Electronics", inStock: true },
    { id: 3, name: "USB-C Hub", price: 45_000, category: "Accessories", inStock: false },
    { id: 4, name: "Desk Lamp", price: 32_000, category: "Home Office", inStock: true },
    { id: 5, name: "Monitor Stand", price: 55_000, category: "Home Office", inStock: true },
  ];
}

// ─── Sub-component: renders a single product row ──────────────────────────────
// This is a Server Component (no 'use client'). It just renders HTML.
// No state, no effects, no JS shipped to the browser.
function ProductRow({ product }: { product: Product }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/2 p-3 gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{product.name}</p>
        <p className="text-xs text-gray-500">{product.category}</p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm text-gray-300">
          Rp {product.price.toLocaleString("id-ID")}
        </span>
        {/* Badge: in-stock vs out-of-stock */}
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${
            product.inStock
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-red-500/20 text-red-400 border-red-500/30"
          }`}
        >
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>
    </div>
  );
}

// ─── Code examples ─────────────────────────────────────────────────────────────
// These are shown as formatted text blocks for learning purposes.
// They demonstrate the contrast between old React patterns and the new RSC pattern.
const CODE_EXAMPLES = [
  {
    id: "old-way",
    title: "❌ Old React way — useEffect + useState (don't do this in RSC)",
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
    code: `// ANTI-PATTERN in Next.js App Router
// This forces client-side rendering + waterfall loading
'use client'; // needed just for useEffect/useState

import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ❌ useEffect fires AFTER initial render
  // User sees a blank/loading screen first, then data
  useEffect(() => {
    fetch('/api/products')          // extra API route needed
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;  // ❌ flash of loading UI
  return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}`,
  },
  {
    id: "new-way",
    title: "✅ New way — async Server Component (recommended)",
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
    code: `// CORRECT pattern for Next.js 13+ App Router
// No 'use client', no useEffect, no loading state needed

// ✅ The function is async — Next.js awaits it before rendering
export default async function ProductsPage() {
  // ✅ Direct fetch on the server
  // Could also be: await db.product.findMany()
  const res = await fetch('https://api.example.com/products');
  const products = await res.json();

  // ✅ Data is ready when we render — no loading flash
  return (
    <ul>
      {products.map((p: Product) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}`,
  },
  {
    id: "deduplication",
    title: "✅ Request deduplication — safe to call the same fetch in multiple components",
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
    code: `// Both components call the same URL
// Next.js deduplicates — the actual HTTP request fires ONCE

// Header.tsx (Server Component)
async function Header() {
  const user = await fetch('/api/user').then(r => r.json()); // ← fetch #1
  return <nav>Hello, {user.name}</nav>;
}

// Sidebar.tsx (Server Component)
async function Sidebar() {
  const user = await fetch('/api/user').then(r => r.json()); // ← same URL
  // ✅ Next.js reuses the result from fetch #1
  // Only 1 HTTP request is made despite 2 components needing the data
  return <aside>Profile: {user.avatar}</aside>;
}`,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
// This function is async — it fetches data before rendering.
// The browser receives fully-rendered HTML; no client-side hydration for the data.
export default async function ServerFetchPage() {
  // Fetch products on the server. The page waits for this before rendering.
  // If this were slow, you could wrap the product section in <Suspense> (Phase 3).
  const products = await getProducts();

  // Calculate a simple stat to show server-side computation is free
  const inStockCount = products.filter((p) => p.inStock).length;

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-2" className="hover:text-blue-400 transition-colors">Phase 2</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Server Fetch</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">fetch() in Server Components</h1>
        <p className="text-gray-400">
          Fetch data directly in async Server Components — no useEffect, no API routes, no loading state.
        </p>
      </header>

      {/* Key concepts */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Key Concepts</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* What changed */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-xs font-semibold text-blue-400 mb-2 uppercase tracking-wide">What changed in App Router</h3>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li>✓ Components can be <code className="text-blue-300">async</code></li>
              <li>✓ <code className="text-blue-300">await fetch()</code> runs on the server</li>
              <li>✓ Data is ready before HTML is sent</li>
              <li>✓ No <code className="text-blue-300">useEffect</code> needed for initial data</li>
              <li>✓ Secrets stay server-side</li>
            </ul>
          </div>
          {/* What stays the same */}
          <div className="rounded-xl border border-white/10 bg-white/2 p-4">
            <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">What stays the same</h3>
            <ul className="text-xs text-gray-400 space-y-1.5">
              <li>→ <code className="text-gray-300">fetch()</code> API is still standard Web API</li>
              <li>→ Returns a Response you call <code className="text-gray-300">.json()</code> on</li>
              <li>→ Error handling with try/catch</li>
              <li>→ TypeScript types for the response</li>
              <li>→ Client Components still use useEffect</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Live demo */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-2">Live Demo — Product List (Server-fetched)</h2>
        <p className="text-sm text-gray-400 mb-1">
          These {products.length} products were fetched on the server before this HTML was sent to you.
        </p>
        <p className="text-xs text-gray-600 mb-4">
          {inStockCount} in stock · {products.length - inStockCount} out of stock — computed server-side, zero JS
        </p>

        {/* Product rows — each is a Server Component, no JS shipped */}
        <div className="space-y-2">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>

        <p className="text-xs text-gray-600 mt-3 italic">
          * Data simulated with setTimeout(200ms). Replace getProducts() with a real fetch/DB call.
        </p>
      </section>

      {/* How it works flow diagram */}
      <section className="mb-10 rounded-xl border border-white/10 bg-black/20 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">How It Works (Request Flow)</h2>
        <div className="font-mono text-xs space-y-1 text-gray-400">
          <p><span className="text-blue-400">1.</span> Browser requests <span className="text-white">/phase-2/01-server-fetch</span></p>
          <p><span className="text-blue-400">2.</span> Next.js server runs <span className="text-green-400">ServerFetchPage()</span> — async!</p>
          <p><span className="text-blue-400">3.</span> <span className="text-green-400">await getProducts()</span> runs on the server (200ms)</p>
          <p><span className="text-blue-400">4.</span> Products array is ready. React renders the full HTML.</p>
          <p><span className="text-blue-400">5.</span> Browser receives <span className="text-white">complete HTML</span> with data already in it.</p>
          <p><span className="text-blue-400">6.</span> User sees content immediately — <span className="text-green-400">no loading flash</span>!</p>
        </div>
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-gray-500">
            Compare to the old way: 6 steps above vs. old: browser → bundle → render → useEffect → fetch → re-render (6 sequential steps)
          </p>
        </div>
      </section>

      {/* Code examples */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-white mb-4">Code Examples</h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((example) => (
            <div key={example.id} className={`rounded-xl border p-4 ${example.borderColor} ${example.bgColor}`}>
              <p className="text-xs font-semibold text-gray-400 mb-3">{example.title}</p>
              <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {example.code}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* Lesson navigation */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-2" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 2
        </Link>
        <Link href="/phase-2/02-caching-revalidation" className="text-blue-400 hover:text-blue-300 transition-colors">
          Next: Caching →
        </Link>
      </div>
    </main>
  );
}
