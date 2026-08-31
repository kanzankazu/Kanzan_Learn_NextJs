/**
 * Lesson 03 — Environment Variables
 * Route: /phase-9/03-env-variables
 *
 * WHAT ARE ENVIRONMENT VARIABLES?
 * ─────────────────────────────────
 * Environment variables are key-value pairs that live OUTSIDE your source code.
 * They are "injected" into your app by the operating system or deployment
 * platform when the process starts.
 *
 * WHY NOT JUST HARDCODE SECRETS IN CODE?
 * ────────────────────────────────────────
 * Imagine hardcoding your database password directly in a file:
 *   const dbUrl = 'postgresql://admin:SuperSecret123@prod-db.myapp.com/mydb';
 *
 * Problems:
 * 1. It goes into your git history PERMANENTLY (even if you delete it later).
 * 2. Anyone with read access to your repo can see it.
 * 3. You can't use different values for dev, staging, and production.
 * 4. Rotating the secret requires a code change + redeploy.
 *
 * Environment variables solve ALL of these problems.
 *
 * NEXT.JS ENV FILE PRIORITY ORDER:
 * ──────────────────────────────────
 * Next.js loads env files in this order (later files override earlier):
 *
 *   .env                 → shared defaults, safe to commit to git
 *   .env.local           → local overrides, NEVER commit (add to .gitignore)
 *   .env.development     → only loaded in 'next dev'
 *   .env.production      → only loaded in 'next build' / 'next start'
 *   .env.test            → only loaded during tests
 *   .env.development.local → local dev overrides, NEVER commit
 *   .env.production.local  → local prod overrides, NEVER commit
 *
 * In practice, most projects only need .env.local for development.
 *
 * THE NEXT_PUBLIC_ PREFIX:
 * ─────────────────────────
 * Next.js treats env vars differently based on their name:
 *
 * Without prefix → SERVER ONLY
 *   process.env.DATABASE_URL   → Only accessible in Server Components,
 *                                 API Routes, and Server Actions.
 *                                 NEVER sent to the browser.
 *
 * With NEXT_PUBLIC_ prefix → PUBLIC (embedded in browser bundle)
 *   process.env.NEXT_PUBLIC_STRIPE_KEY → Baked into the JavaScript bundle
 *                                         at BUILD TIME. Anyone can read it
 *                                         in the browser's DevTools.
 *
 * Rule: Only use NEXT_PUBLIC_ for values that are truly safe to expose
 * (public API keys like Stripe publishable key, Mapbox token, analytics ID).
 *
 * RUNTIME vs BUILD-TIME:
 * ───────────────────────
 * Build-time vars → Evaluated when `next build` runs.
 *   NEXT_PUBLIC_* variables are baked in at this point.
 *   Changing them requires a new build.
 *
 * Runtime vars → Read by the server process when it handles a request.
 *   Non-public server-side vars (DATABASE_URL, JWT_SECRET) are read at
 *   runtime. You can change them without rebuilding — just restart the server.
 *
 *   Exception: with 'output: standalone' and some edge runtimes, ALL vars
 *   must be present at build time. Use Docker --env-file or platform secrets.
 *
 * SERVER-ONLY PACKAGE:
 * ─────────────────────
 * The 'server-only' package is a safety guardrail. Import it at the top of
 * any file that contains secrets. If a Client Component accidentally imports
 * that file, the build fails with a clear error — preventing a secret leak.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "03 — Environment Variables",
  description:
    "Learn how environment variables work in Next.js 15. Covers .env.local, NEXT_PUBLIC_ prefix, server-only secrets, runtime vs build-time, and Zod validation patterns.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// All code is plain strings — educational patterns, not executed in this repo.
const CODE_EXAMPLES = [
  {
    id: "env-local",
    label: "1. .env.local — Your local secret store",
    description:
      "Create .env.local at the project root. This file is your local secret store — it is NEVER committed to git. Every developer on the team has their own.",
    code: `# .env.local — ADD THIS FILE TO .gitignore!
# Never commit real secrets. Share variable NAMES (not values) via .env.example.

# ── Server-side secrets (NO NEXT_PUBLIC_ prefix) ───────────────────────────
# These are ONLY accessible in Server Components, API Routes, Server Actions.
# They are never sent to the browser.
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
JWT_SECRET="a-very-long-random-string-at-least-32-chars"
STRIPE_SECRET_KEY="sk_test_abc123..."
SENDGRID_API_KEY="SG.abc..."
NEXTAUTH_SECRET="another-long-random-string"
NEXTAUTH_URL="http://localhost:3000"

# ── Public client-side values (NEXT_PUBLIC_ prefix) ────────────────────────
# These are BAKED INTO the browser JavaScript bundle at build time.
# Anyone with DevTools can read them. Only put truly public keys here.
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_abc123..."
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1Ijoi..."
NEXT_PUBLIC_ANALYTICS_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "env-example",
    label: "2. .env.example — Template for your team",
    description:
      ".env.example lists all variable NAMES with placeholder or safe example values. Commit this file. New team members copy it to .env.local and fill in real values.",
    code: `# .env.example — SAFE TO COMMIT (no real secrets!)
# Copy this file to .env.local and fill in the actual values.

# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Authentication
JWT_SECRET="your-secret-here-minimum-32-characters"
NEXTAUTH_SECRET="another-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Payment
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Analytics
NEXT_PUBLIC_ANALYTICS_ID="G-XXXXXXXXXX"`,
    borderColor: "border-gray-500/20",
    bgColor: "bg-gray-500/5",
  },
  {
    id: "accessing",
    label: "3. Accessing env vars in Next.js code",
    description:
      "process.env is how you read environment variables in Node.js. TypeScript treats these as string | undefined — always handle the undefined case.",
    code: `// ── SERVER-SIDE (Server Component, API Route, Server Action) ──────────────

// app/dashboard/page.tsx (Server Component — no 'use client')
export default async function DashboardPage() {
  // process.env.DATABASE_URL is available on the server
  // It is NEVER included in the browser JavaScript bundle
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // Use dbUrl to connect to the database...
  return <div>Dashboard</div>;
}


// ── CLIENT-SIDE (Client Component with 'use client') ───────────────────────

'use client';

export default function PaymentButton() {
  // NEXT_PUBLIC_ vars are baked in at build time → accessible in the browser
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  // Non-public vars are UNDEFINED in the browser — even if they are set
  const secret = process.env.JWT_SECRET; // ❌ undefined in browser!

  return (
    <button onClick={() => initStripe(stripeKey)}>
      Pay now
    </button>
  );
}


// ── DYNAMIC env vars (read at runtime, not build time) ──────────────────────

// In a Server Component, env vars are always read at request time.
// This means you can update DATABASE_URL and restart the server
// WITHOUT rebuilding the Next.js app.

// NEXT_PUBLIC_ vars are different — they are replaced at build time by
// the Next.js compiler. If you change them, you MUST rebuild.`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "server-only",
    label: "4. server-only package — Prevent accidental client leaks",
    description:
      "The 'server-only' package makes the build fail if a file containing secrets is imported by a Client Component. It is the strongest guard against accidental secret leaks.",
    code: `// lib/db.ts — contains database connection details (secrets)

// This import is the safety guard.
// If any Client Component tries to import THIS file, the build fails with:
//   "You're importing a component that needs server-only..."
// No secrets leak. The build stops immediately with a clear error.
import 'server-only'; // npm install server-only

import { createPool } from '@vercel/postgres'; // example

// This value is safe here — it only runs on the server
const pool = createPool({
  connectionString: process.env.DATABASE_URL!, // ! = "I know this is set"
});

export { pool };


// ── Usage pattern ──────────────────────────────────────────────────────────

// app/users/page.tsx (Server Component — OK to import lib/db)
import { pool } from '@/lib/db';   // ✅ Server Component can import this

export default async function UsersPage() {
  const { rows } = await pool.query('SELECT id, name FROM users');
  return <ul>{rows.map(r => <li key={r.id}>{r.name}</li>)}</ul>;
}

// app/components/UserBadge.tsx (Client Component — BLOCKED)
'use client';
import { pool } from '@/lib/db';  // ❌ Build error! 'server-only' blocks this.`,
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
  },
  {
    id: "zod-validation",
    label: "5. Zod validation pattern — Validate env vars at startup",
    description:
      "Parse and validate all your env vars once at startup using Zod. This gives you runtime type safety and clear error messages when a required variable is missing or malformed.",
    code: `// lib/env.ts — Environment variable validation with Zod
// Pattern only — 'zod' must be installed: npm install zod

import { z } from 'zod'; // npm install zod

// ── Define the schema ────────────────────────────────────────────────────────
// z.object() validates that process.env contains the right shape.
// This runs ONCE when the server starts — not on every request.
const envSchema = z.object({
  // Required fields — app crashes immediately if missing
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  // Optional with defaults
  PORT: z.coerce.number().default(3000), // coerce converts "3000" string to number

  // Public client-side vars
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),

  // Optional field with a fallback
  SENTRY_DSN: z.string().url().optional(),
});

// ── Parse (throws on invalid/missing vars) ───────────────────────────────────
// If DATABASE_URL is missing, you get a clear error like:
//   "DATABASE_URL must be a valid URL"
// ...instead of a cryptic "TypeError: Cannot read properties of undefined"
//    deep inside your DB connection code.
export const env = envSchema.parse(process.env);

// TypeScript now knows the exact shape of env:
// env.DATABASE_URL  → string (not string | undefined)
// env.PORT          → number (not string — Zod coerced it)
// env.SENTRY_DSN    → string | undefined

// ── Usage ────────────────────────────────────────────────────────────────────
// import { env } from '@/lib/env';
// const db = createConnection(env.DATABASE_URL); // fully typed, validated`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
] as const;

// ─── Reusable CodeBlock ────────────────────────────────────────────────────────
function CodeBlock({
  code,
  label,
  description,
  borderColor,
  bgColor,
}: {
  code: string;
  label: string;
  description: string;
  borderColor: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${borderColor} ${bgColor}`}>
      <p className="text-xs font-semibold text-gray-300 mb-2">{label}</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{description}</p>
      <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

// ─── Page Component ────────────────────────────────────────────────────────────
export default function EnvVariablesPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-9" className="hover:text-blue-400 transition-colors">Phase 9</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Environment Variables</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🔐</span>
          <h1 className="text-3xl font-bold text-white">Environment Variables</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Store secrets and configuration outside your code. Understanding environment
          variables is essential for every deployment — whether you use Vercel, Docker,
          or any other platform.
        </p>
      </header>

      {/* ── Public vs Private Explainer ──────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="public-vs-private">
        <h2 id="public-vs-private" className="text-lg font-semibold text-white mb-4">
          Server-Only vs Public Variables
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Server-only */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-red-400 text-lg" aria-hidden="true">🔒</span>
              <h3 className="text-sm font-semibold text-red-400">Server-Only</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              No prefix. Only accessible in Server Components, API Routes, and Server
              Actions. NEVER sent to the browser bundle.
            </p>
            <div className="space-y-1">
              {[
                "DATABASE_URL",
                "JWT_SECRET",
                "STRIPE_SECRET_KEY",
                "SENDGRID_API_KEY",
                "NEXTAUTH_SECRET",
              ].map((v) => (
                <code key={v} className="block text-xs text-red-300 font-mono bg-black/20 rounded px-2 py-0.5">
                  {v}
                </code>
              ))}
            </div>
          </div>

          {/* Public */}
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-400 text-lg" aria-hidden="true">🌍</span>
              <h3 className="text-sm font-semibold text-green-400">NEXT_PUBLIC_</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              NEXT_PUBLIC_ prefix. Baked into the browser JavaScript bundle at
              build time. Visible to anyone who opens DevTools.
            </p>
            <div className="space-y-1">
              {[
                "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
                "NEXT_PUBLIC_MAPBOX_TOKEN",
                "NEXT_PUBLIC_ANALYTICS_ID",
                "NEXT_PUBLIC_API_BASE_URL",
              ].map((v) => (
                <code key={v} className="block text-xs text-green-300 font-mono bg-black/20 rounded px-2 py-0.5 break-all">
                  {v}
                </code>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── .env File Priority ───────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="priority-heading">
        <h2 id="priority-heading" className="text-lg font-semibold text-white mb-4">
          .env File Priority Order
        </h2>
        <div className="rounded-xl border border-white/10 bg-white/2 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-300 font-medium">File</th>
                <th className="text-left p-3 text-gray-300 font-medium">When loaded</th>
                <th className="text-left p-3 text-gray-300 font-medium">Commit to git?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { file: ".env", when: "Always", commit: "✅ Yes (safe defaults only)" },
                { file: ".env.local", when: "Always (except tests)", commit: "❌ Never" },
                { file: ".env.development", when: "next dev only", commit: "✅ Yes (no secrets)" },
                { file: ".env.production", when: "next build/start only", commit: "✅ Yes (no secrets)" },
                { file: ".env.test", when: "Test runner only", commit: "✅ Yes" },
                { file: ".env.development.local", when: "next dev (local override)", commit: "❌ Never" },
                { file: ".env.production.local", when: "Production (local override)", commit: "❌ Never" },
              ].map((row, i) => (
                <tr key={row.file} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"}`}>
                  <td className="p-3 font-mono text-blue-300">{row.file}</td>
                  <td className="p-3 text-gray-400">{row.when}</td>
                  <td className="p-3 text-gray-400">{row.commit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Later entries override earlier ones. .env.local always wins over .env.
        </p>
      </section>

      {/* ── Code Examples ────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="code-heading">
        <h2 id="code-heading" className="text-lg font-semibold text-white mb-4">
          Code Examples
        </h2>
        <div className="space-y-4">
          {CODE_EXAMPLES.map((ex) => (
            <CodeBlock key={ex.id} {...ex} />
          ))}
        </div>
      </section>

      {/* ── Key Concepts ─────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="concepts-heading">
        <h2 id="concepts-heading" className="text-lg font-semibold text-white mb-4">
          Key Concepts &amp; Common Mistakes
        </h2>
        <div className="space-y-3">
          {[
            {
              term: "NEXT_PUBLIC_ is baked in at build time",
              def: "If you change a NEXT_PUBLIC_ variable, you MUST rebuild the app. The old value is frozen in the bundle. This is different from server-side vars which are read fresh on every request.",
            },
            {
              term: "process.env is undefined in Client Components (without NEXT_PUBLIC_)",
              def: "A common beginner mistake: trying to read DATABASE_URL inside a 'use client' component. It returns undefined because it was intentionally stripped from the browser bundle.",
            },
            {
              term: ".env.local takes priority over .env",
              def: "If DATABASE_URL is defined in both .env and .env.local, the .env.local value wins. Use this to override shared defaults for your specific machine.",
            },
            {
              term: "Never commit .env.local or .env.production.local",
              def: "Add these to .gitignore from day one. Even a single commit with a real secret is a security incident — secrets live in git history forever.",
            },
            {
              term: "Type safety: use Zod or t3-env",
              def: "process.env values are always string | undefined in TypeScript. Validate them with Zod at startup to get typed, validated values and catch missing config immediately on deploy.",
            },
          ].map((item) => (
            <div key={item.term} className="rounded-xl border border-white/10 bg-blue-500/5 p-4">
              <code className="text-blue-300 text-sm font-mono">{item.term}</code>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.def}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-9/02-docker-vps" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Docker / VPS
        </Link>
        <Link href="/phase-9/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Mini Project →
        </Link>
      </div>
    </main>
  );
}
