/**
 * Lesson 03 — Supabase + Next.js
 * Route: /phase-7/03-supabase
 *
 * WHAT IS SUPABASE?
 * ──────────────────
 * Supabase is an open-source Firebase alternative that gives you a full
 * backend out of the box. One Supabase project includes:
 *
 *   🗄️  Postgres         — A real PostgreSQL database (not a proprietary DB)
 *   🔑  Auth             — Email/password, OAuth (Google, GitHub, etc.), magic links
 *   📁  Storage          — File uploads (images, PDFs, videos) with access policies
 *   📡  Realtime         — WebSocket channels — subscribe to DB changes live
 *   🔧  Edge Functions   — Deno-based serverless functions
 *   📊  Dashboard        — A web UI to manage everything
 *
 * SUPABASE VS PRISMA/DRIZZLE — KEY DIFFERENCE:
 * ──────────────────────────────────────────────
 * Prisma and Drizzle are ORMS — they help you talk to a database you already have.
 * They do not provide Auth, Storage, or Realtime.
 *
 * Supabase is a PLATFORM — it provides the database AND all the surrounding
 * backend services. You can use Supabase WITH Prisma or Drizzle, or use
 * Supabase's own JS client (@supabase/supabase-js) which handles Auth, Storage,
 * Realtime, and basic database queries all through one interface.
 *
 * @SUPABASE/SSR — THE NEXT.JS PACKAGE:
 * ──────────────────────────────────────
 * When using Supabase with Next.js App Router, you install @supabase/ssr.
 * This package provides two factory functions:
 *
 *   createBrowserClient()  — for Client Components (uses the browser cookie store)
 *   createServerClient()   — for Server Components, Route Handlers, Server Actions
 *                            (reads/writes cookies via Next.js cookies() API)
 *
 * WHY TWO DIFFERENT CLIENTS?
 * ───────────────────────────
 * Supabase Auth works by storing session tokens in cookies. The browser client
 * reads cookies directly from document.cookie. The server client reads cookies
 * from the Next.js request/response cycle. They both talk to the same Supabase
 * project — the difference is WHERE they read the session from.
 *
 * ROW LEVEL SECURITY (RLS):
 * ──────────────────────────
 * RLS is a Postgres feature that Supabase heavily promotes. With RLS you write
 * SQL policies that define WHO can SELECT, INSERT, UPDATE, or DELETE specific rows.
 *
 * Example policy: "Users can only read their own posts"
 *   CREATE POLICY "users_own_posts" ON posts
 *   FOR SELECT USING (auth.uid() = author_id);
 *
 * Supabase injects the authenticated user's ID (auth.uid()) into every query.
 * Even if a client sends a SELECT * query, Postgres silently adds the WHERE clause.
 * This means security lives in the DATABASE — not just in your API layer.
 * Even a buggy server action cannot accidentally leak another user's data.
 *
 * REALTIME:
 * ──────────
 * Supabase Realtime lets you subscribe to database changes via WebSockets.
 * When a row is inserted/updated/deleted, all subscribed clients receive the event.
 * Classic use cases: live chat, collaborative editing, real-time dashboards.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "03 — Supabase + Next.js",
  description:
    "Learn Supabase with Next.js 15: @supabase/ssr, server vs client instances, Row Level Security, Auth, and Realtime subscriptions.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "setup",
    label: "1. Install and configure Supabase",
    description:
      "Setup steps for a Next.js + Supabase project. The @supabase/ssr package is the recommended way to use Supabase in App Router.",
    code: `# Install the Supabase packages
npm install @supabase/supabase-js @supabase/ssr

# Add your Supabase project credentials to .env.local
# These values come from your Supabase dashboard → Settings → API`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "env",
    label: "2. Environment variables",
    description:
      "The NEXT_PUBLIC_ prefix makes these variables available in the browser. The URL and anon key are safe to expose — RLS policies protect your data.",
    code: `# .env.local
# Both of these are safe to be NEXT_PUBLIC_ (exposed to browser)
# because RLS policies in Postgres control actual data access.
# The anon key only allows what your RLS policies permit.
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# The service role key has FULL database access, bypassing RLS.
# NEVER expose this to the browser. Only use in server-side code.
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   ← server only, never NEXT_PUBLIC_`,
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
  },
  {
    id: "client-factory",
    label: "3. Client factory functions — server vs browser",
    description:
      "Create two helper functions: one for Server Components/Actions (reads cookies via Next.js), one for Client Components (reads cookies from the browser).",
    code: `// utils/supabase/server.ts
// Use this in: Server Components, Route Handlers, Server Actions, Middleware

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// WHY is this a function and not a constant?
// cookies() from 'next/headers' must be called INSIDE a request context.
// If you called createServerClient() at module level, it would fail
// because there is no request context at import time.
export function createSupabaseServerClient() {
  const cookieStore = cookies();  // reads the current request's cookies

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Supabase needs to read AND write the session cookie.
      // We provide getAll/setAll to hook into Next.js cookie APIs.
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}


// utils/supabase/client.ts
// Use this in: Client Components (browser-only code)

import { createBrowserClient } from '@supabase/ssr';

// This is a simple constant — browser cookies are always available.
// Safe to call at module level or inside components.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "server-queries",
    label: "4. Querying data in Server Components",
    description:
      "Server Components can call the Supabase server client directly. No API route needed — the query runs on the server during rendering.",
    code: `// app/posts/page.tsx — Server Component (no 'use client')

import { createSupabaseServerClient } from '@/utils/supabase/server';

export default async function PostsPage() {
  const supabase = createSupabaseServerClient();

  // .from('posts') selects from the 'posts' table
  // .select('*, author:users(name, email)') → SELECT posts.*, user name+email
  // This is a JOIN expressed in Supabase's PostgREST syntax
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, author:users(name, email)')
    .eq('published', true)            // WHERE published = true
    .order('created_at', { ascending: false })  // ORDER BY created_at DESC
    .limit(10);

  // Supabase always returns { data, error }
  // NEVER assume data is non-null — always handle the error case
  if (error) {
    console.error('Failed to fetch posts:', error.message);
    return <p>Failed to load posts.</p>;
  }

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>
          <h2>{post.title}</h2>
          <p>By {post.author?.name}</p>
        </li>
      ))}
    </ul>
  );
}


// --- Reading the authenticated user in a Server Component ---
export async function getAuthenticatedUser() {
  const supabase = createSupabaseServerClient();

  // getUser() reads the session from the cookie and validates it.
  // getSession() is NOT recommended — it only reads the cookie without
  // verifying the JWT against the Supabase auth server.
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "auth",
    label: "5. Authentication — sign up, sign in, sign out",
    description:
      "Supabase Auth supports email/password, magic links, and OAuth. These actions happen on the CLIENT side — signIn/signOut require the browser Supabase client.",
    code: `// components/AuthForm.tsx — Client Component
'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function AuthForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- Sign Up ---
  async function handleSignUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // options.emailRedirectTo is the URL users land on after clicking the confirm email link
      options: { emailRedirectTo: \`\${window.location.origin}/auth/callback\` },
    });

    if (error) console.error(error.message);
    else console.log('Check your email to confirm your account!', data);
  }

  // --- Sign In with email + password ---
  async function handleSignIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) console.error(error.message);
    else router.refresh();  // Refresh the page to pick up the new session cookie
  }

  // --- Sign In with OAuth (Google, GitHub, etc.) ---
  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: \`\${window.location.origin}/auth/callback\` },
    });
    // The user is redirected to Google, then back to your /auth/callback route
  }

  // --- Sign Out ---
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');  // Redirect to home after logout
    router.refresh();  // Clear the session from Next.js cache
  }

  return (
    <div>
      <input type="email"    value={email}    onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleGoogleSignIn}>Sign in with Google</button>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    id: "rls",
    label: "6. Row Level Security (RLS) — security in the database",
    description:
      "RLS policies are SQL rules that run inside Postgres. Even if your server code has a bug and sends the wrong query, Postgres enforces the policy — users can only see their own data.",
    code: `-- SQL run in Supabase dashboard → SQL Editor, or in a migration file

-- Step 1: Enable RLS on a table (disabled by default)
-- Once enabled, ALL queries are blocked UNLESS a policy allows them.
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;


-- Step 2: Write policies

-- Policy: Anyone can read published posts (public blog)
CREATE POLICY "Anyone can read published posts"
ON posts FOR SELECT
USING (published = true);

-- Policy: Users can only read their own draft posts
CREATE POLICY "Authors can read own drafts"
ON posts FOR SELECT
USING (auth.uid() = author_id AND published = false);

-- Policy: Users can only INSERT posts with their own author_id
-- WITH CHECK runs on the NEW row being inserted/updated
CREATE POLICY "Authors can insert own posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Policy: Authors can update their own posts
CREATE POLICY "Authors can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = author_id);

-- Policy: Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = author_id);

-- auth.uid() is a Supabase helper that returns the ID of the currently
-- authenticated user from the JWT in the request.
-- If the user is not authenticated, auth.uid() returns NULL.`,
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
  },
  {
    id: "realtime",
    label: "7. Realtime subscriptions — live database updates",
    description:
      "Subscribe to database changes in a Client Component. When any row in the table changes, your component receives an event and can update the UI without polling.",
    code: `// components/LivePosts.tsx — Client Component
'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/utils/supabase/client';

type Post = { id: number; title: string; published: boolean };

export function LivePosts({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // .channel() creates a named WebSocket channel
    // .on('postgres_changes') subscribes to Postgres change events
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',             // 'INSERT' | 'UPDATE' | 'DELETE' | '*' (all)
          schema: 'public',
          table: 'posts',
          filter: 'published=eq.true',  // Optional: only published posts
        },
        (payload) => {
          // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
          // payload.new: the new row (INSERT or UPDATE)
          // payload.old: the old row (UPDATE or DELETE)
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [payload.new as Post, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) =>
              prev.map((p) => (p.id === (payload.new as Post).id ? (payload.new as Post) : p))
            );
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter((p) => p.id !== (payload.old as Post).id));
          }
        }
      )
      .subscribe();  // Start listening

    // Cleanup: unsubscribe when the component unmounts
    // This prevents memory leaks and dangling WebSocket connections
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <ul>
      {posts.map((post) => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
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
export default function SupabasePage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-7" className="hover:text-blue-400 transition-colors">Phase 7</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Supabase</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🟢</span>
          <h1 className="text-3xl font-bold text-white">Supabase + Next.js</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Postgres + Auth + Storage + Realtime in one managed platform.
          Supabase gives you a full backend without managing infrastructure.
          Use it with or without Prisma/Drizzle.
        </p>
        {/* Notice */}
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <p className="text-xs text-yellow-200/70">
            ⚠️ @supabase/ssr is NOT installed in this project — all snippets below are
            educational patterns, not runnable code.
          </p>
        </div>
      </header>

      {/* ── What Supabase Includes ────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="includes-heading">
        <h2 id="includes-heading" className="text-lg font-semibold text-white mb-4">
          What Supabase Includes
        </h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {[
            {
              icon: "🗄️",
              title: "Postgres Database",
              body: "A real PostgreSQL database. Full SQL support. You can use Prisma or Drizzle on top, or use Supabase's own PostgREST API client.",
              color: "border-green-500/20 bg-green-500/5",
            },
            {
              icon: "🔑",
              title: "Auth",
              body: "Email/password, magic links, OAuth (Google, GitHub, Apple, etc.), phone OTP. Session managed via cookies — works seamlessly with SSR.",
              color: "border-blue-500/20 bg-blue-500/5",
            },
            {
              icon: "📁",
              title: "Storage",
              body: "S3-compatible file storage. Store user avatars, PDFs, images. Apply access policies to control who can read/write each bucket.",
              color: "border-orange-500/20 bg-orange-500/5",
            },
            {
              icon: "📡",
              title: "Realtime",
              body: "WebSocket subscriptions to database changes. Build live chat, collaborative tools, and real-time dashboards without extra infrastructure.",
              color: "border-purple-500/20 bg-purple-500/5",
            },
            {
              icon: "🔧",
              title: "Edge Functions",
              body: "Deno-based serverless functions that run close to users worldwide. Good for webhooks, background jobs, and custom API endpoints.",
              color: "border-cyan-500/20 bg-cyan-500/5",
            },
            {
              icon: "📊",
              title: "Dashboard",
              body: "A full web UI for managing your database, users, storage, logs, and more. Like pgAdmin + AWS Cognito + S3 console all in one.",
              color: "border-yellow-500/20 bg-yellow-500/5",
            },
          ].map((card) => (
            <div key={card.title} className={`rounded-xl border p-4 ${card.color}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl" aria-hidden="true">{card.icon}</span>
                <h3 className="text-sm font-semibold text-white">{card.title}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Supabase vs Prisma+DB ─────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="vs-heading">
        <h2 id="vs-heading" className="text-lg font-semibold text-white mb-4">
          Supabase vs Prisma + Raw Database
        </h2>
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-2 text-gray-400 font-medium">Aspect</th>
                  <th className="text-left p-2 text-green-400 font-medium">Supabase</th>
                  <th className="text-left p-2 text-blue-400 font-medium">Prisma + your own DB</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Database hosting", "Managed for you (free tier available)", "You provision (Railway, PlanetScale, Neon, etc.)"],
                  ["Auth", "✅ Built-in", "❌ Need NextAuth or similar"],
                  ["File storage", "✅ Built-in buckets", "❌ Need S3 or Cloudinary"],
                  ["Realtime", "✅ Built-in WebSockets", "❌ Need additional service"],
                  ["Type safety", "Generated via Supabase CLI", "Generated by Prisma / inferred by Drizzle"],
                  ["Query power", "PostgREST REST API (limited) + raw SQL", "Full ORM API + raw SQL"],
                  ["Control", "Less control over Postgres config", "Full control of DB config"],
                  ["Cost", "Generous free tier, then usage-based", "Pay per DB host plan"],
                ].map(([aspect, supa, prisma]) => (
                  <tr key={aspect} className="border-b border-white/5">
                    <td className="p-2 text-gray-300 text-xs font-medium">{aspect}</td>
                    <td className="p-2 text-gray-400 text-xs">{supa}</td>
                    <td className="p-2 text-gray-400 text-xs">{prisma}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Server vs Client Instance ─────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="server-vs-client">
        <h2 id="server-vs-client" className="text-lg font-semibold text-white mb-4">
          Server vs Client Supabase Instance
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">
              createServerClient()
            </h3>
            <p className="text-xs text-gray-400 mb-2">
              Use in Server Components, Route Handlers, Server Actions, Middleware
            </p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Reads cookies via Next.js <code>cookies()</code></li>
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Can read session on the server</li>
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Protects against SSRF</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Cannot use <code>window</code> or browser APIs</li>
            </ul>
          </div>
          <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <h3 className="text-sm font-semibold text-green-400 mb-2">
              createBrowserClient()
            </h3>
            <p className="text-xs text-gray-400 mb-2">
              Use in Client Components (<code>&apos;use client&apos;</code> files only)
            </p>
            <ul className="space-y-1 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-green-400">✓</span> Reads cookies from <code>document.cookie</code></li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> Can subscribe to Realtime</li>
              <li className="flex gap-2"><span className="text-green-400">✓</span> Handles signIn / signOut UI flows</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Cannot use Next.js server APIs</li>
            </ul>
          </div>
        </div>
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

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-7/02-drizzle" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Drizzle
        </Link>
        <Link href="/phase-7/mini-project" className="text-blue-400 hover:text-blue-300 transition-colors">
          Mini Project →
        </Link>
      </div>
    </main>
  );
}
