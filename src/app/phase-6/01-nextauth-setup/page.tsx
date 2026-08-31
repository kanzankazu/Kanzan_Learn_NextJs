/**
 * Phase 6 — Lesson 01: Auth.js (NextAuth.js) Setup
 * Route: /phase-6/01-nextauth-setup
 *
 * WHAT THIS LESSON COVERS:
 * ─────────────────────────
 * Auth.js (formerly NextAuth.js) v5 is the standard authentication library for Next.js.
 * It handles the entire OAuth flow, session management, and JWT tokens for you.
 *
 * WHY USE AUTH.JS?
 * - Handles the complex OAuth handshake automatically (callback URLs, CSRF tokens, etc.)
 * - Supports 50+ providers out of the box (Google, GitHub, Facebook, Discord, etc.)
 * - Works with both Edge Runtime and Node.js
 * - Built-in session management with database or JWT storage
 * - TypeScript-first
 *
 * NOTE: Code below is for READING ONLY — next-auth is not installed in this project.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "01 — Auth.js Setup | Phase 6",
  description: "Learn how to set up Auth.js (NextAuth.js v5) in a Next.js 15 application.",
};

export default function NextAuthSetupPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      {/* ── Breadcrumb ── */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-6" className="hover:text-blue-400 transition-colors">Phase 6</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Auth.js Setup</span>
      </nav>

      {/* ── Title ── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-blue-400 text-sm border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded">01</span>
          <h1 className="text-3xl font-bold text-white">Auth.js Setup</h1>
        </div>
        <p className="text-gray-400 max-w-2xl">
          Learn how Auth.js works, how to install and configure it, and how providers,
          sessions, and callbacks fit together.
        </p>
        {/* Pattern-only notice */}
        <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-300">
          📚 All code below is a reading reference — next-auth is not installed in this repo.
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — Installation & File Structure
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">1. Installation &amp; File Structure</h2>

        {/* Install command */}
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">
            Install Auth.js v5 (currently in beta — the official successor to NextAuth.js v4):
          </p>
          <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
            {`npm install next-auth@beta`}
          </pre>
        </div>

        {/* Required files */}
        <div>
          <p className="text-sm text-gray-400 mb-2">
            Auth.js v5 requires two files — a config file and a route handler:
          </p>
          <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
            {`src/
├── auth.ts                          ← main config (providers, callbacks, etc.)
└── app/
    └── api/
        └── auth/
            └── [...nextauth]/
                └── route.ts         ← catches all /api/auth/* requests`}
          </pre>
          <p className="text-xs text-gray-600 mt-2">
            {/* Why [...nextauth]? */}
            The <code className="text-blue-300">[...nextauth]</code> catch-all route handles many
            paths automatically: <code className="text-gray-400">/api/auth/signin</code>,
            {" "}<code className="text-gray-400">/api/auth/signout</code>,
            {" "}<code className="text-gray-400">/api/auth/callback/google</code>, etc.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — auth.ts config
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-1">2. The Main Config File (auth.ts)</h2>
        <p className="text-sm text-gray-400 mb-4">
          This is where you define providers, session strategy, and callbacks.
          Auth.js exports helpers (handlers, auth, signIn, signOut) that you use across the app.
        </p>

        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`// src/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // ── Providers ─────────────────────────────────────────────────────────
  // A "provider" is an authentication method.
  // OAuth providers (Google, GitHub) = users log in via a third-party site.
  // Credentials provider = users log in with email + password you manage yourself.
  providers: [

    // OAuth — Google
    // Users click "Sign in with Google", get redirected to accounts.google.com,
    // approve your app, then come back. Google sends a token — Auth.js handles the rest.
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // OAuth — GitHub
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // Credentials — custom username/password
    // Use when you manage your own user database.
    // You are responsible for hashing, salt, and validation — Auth.js only calls authorize().
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // authorize() runs on the server when the user submits the login form.
      // Return a user object to log them in, or null to reject.
      async authorize(credentials) {
        const user = await fetchUserFromDB(credentials.email);
        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!passwordMatch) return null;

        // Return this object — it becomes the "user" token payload
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],

  // ── Session strategy ─────────────────────────────────────────────────
  // "jwt"      → session stored in an encrypted cookie (stateless — default)
  // "database" → session stored in DB, only a session ID in the cookie
  //
  // JWT is simpler (no DB needed) but you cannot invalidate a token server-side
  // until it expires. Database sessions let you revoke access instantly.
  session: { strategy: "jwt" },

  // ── Pages ─────────────────────────────────────────────────────────────
  // Override the default Auth.js UI with your own pages.
  pages: {
    signIn: "/login",     // your custom login page
    error: "/auth/error", // called on auth errors
  },

  // ── Callbacks ─────────────────────────────────────────────────────────
  // Callbacks fire at specific points in the auth flow.
  // Use them to customize what ends up in the session or JWT token.
  callbacks: {

    // jwt() fires when a JWT is created (sign in) OR accessed (each request).
    // This is where you can add custom data (like user role) to the token.
    async jwt({ token, user }) {
      // "user" is only populated on the FIRST sign-in call
      if (user) {
        token.role = user.role;  // add role to JWT payload
        token.id = user.id;
      }
      return token; // this token is encrypted and stored in the cookie
    },

    // session() fires when a session is accessed via auth() or useSession().
    // The session object is what you read in your components.
    // IMPORTANT: session is derived from the JWT — you must copy data here.
    async session({ session, token }) {
      session.user.role = token.role as string;
      session.user.id = token.id as string;
      return session; // this is the object returned by auth() calls
    },
  },
});`}
        </pre>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3 — route.ts handler
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-1">3. The Route Handler</h2>
        <p className="text-sm text-gray-400 mb-4">
          This file is intentionally minimal. Its only job is to forward all{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">/api/auth/*</code> requests
          to Auth.js. You almost never need to touch it.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"; // import the handlers we exported in auth.ts

// Export GET and POST — Auth.js needs both
// GET  → /api/auth/signin, /api/auth/providers, /api/auth/csrf, etc.
// POST → /api/auth/signin (form submit), /api/auth/signout
export const { GET, POST } = handlers;`}
        </pre>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4 — Reading the session in a Server Component
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-1">4. Reading the Session — Server Component</h2>
        <p className="text-sm text-gray-400 mb-4">
          In a Server Component, call <code className="text-blue-300 bg-white/10 px-1 rounded">auth()</code> directly.
          It reads the cookie and decrypts the JWT — no API call needed. This is fast and runs at the edge.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`// Any Server Component / page.tsx
import { auth } from "@/auth"; // the auth() helper we exported
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // auth() returns the session object from our session callback
  // If no session exists, it returns null
  const session = await auth();

  // Redirect unauthenticated users to the login page
  if (!session) {
    redirect("/login");
  }

  // session.user has the data we put in the session callback
  return (
    <main>
      <h1>Welcome, {session.user.name}!</h1>
      <p>Email: {session.user.email}</p>
      <p>Role: {session.user.role}</p>
    </main>
  );
}`}
        </pre>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5 — signIn / signOut in a Client Component
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-1">5. signIn / signOut — Client Component</h2>
        <p className="text-sm text-gray-400 mb-4">
          From a Client Component, import <code className="text-blue-300 bg-white/10 px-1 rounded">signIn</code> and{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">signOut</code> from{" "}
          <code className="text-blue-300 bg-white/10 px-1 rounded">next-auth/react</code>.
          These are thin wrappers that POST to the route handler you configured.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`"use client";

// From next-auth/react (client-side helpers):
// signIn()  → triggers the OAuth flow or submits credentials form
// signOut() → clears the session cookie and redirects
// useSession() → reactive hook to read the current session
import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButtons() {
  const { data: session, status } = useSession();
  // status can be: "loading" | "authenticated" | "unauthenticated"

  if (status === "loading") return <p>Loading...</p>;

  if (session) {
    return (
      <div>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* "google" must match the provider id in your auth.ts */}
      <button onClick={() => signIn("google")}>Sign in with Google</button>
      <button onClick={() => signIn("github")}>Sign in with GitHub</button>

      {/* For Credentials, redirect to your custom login page */}
      <button onClick={() => signIn()}>Sign in with Email</button>
    </div>
  );
}`}
        </pre>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6 — Session vs JWT comparison
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">6. Session vs JWT Strategy</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase">
                <th className="py-2 pr-6">Aspect</th>
                <th className="py-2 pr-6">JWT (default)</th>
                <th className="py-2">Database</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 text-xs">
              {[
                ["Storage", "Encrypted cookie on browser", "Session table in your DB"],
                ["Server read", "Decrypt cookie locally (fast)", "Query DB on each request"],
                ["Revoke session", "Must wait for token to expire", "Delete row — instant revoke"],
                ["Extra data", "Add to JWT payload in jwt() callback", "Stored in session record"],
                ["Recommended for", "Most apps — simpler, stateless", "Apps needing instant logout"],
              ].map(([aspect, jwt, db]) => (
                <tr key={aspect} className="border-b border-white/5">
                  <td className="py-2 pr-6 text-gray-400 font-semibold">{aspect}</td>
                  <td className="py-2 pr-6">{jwt}</td>
                  <td className="py-2">{db}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 7 — .env.local keys
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-1">7. Required Environment Variables</h2>
        <p className="text-sm text-gray-400 mb-3">
          Auth.js reads these from <code className="text-blue-300 bg-white/10 px-1 rounded">.env.local</code>.
          Never commit these to source control.
        </p>
        <pre className="bg-black/40 border border-white/10 rounded-lg p-4 overflow-x-auto font-mono text-sm text-gray-300">
          {`# .env.local

# REQUIRED: random string used to sign/encrypt the JWT cookie
# Generate with: openssl rand -base64 32
AUTH_SECRET=your_super_secret_random_string

# Google OAuth — get from https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth — get from https://github.com/settings/developers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret`}
        </pre>
      </section>

      {/* ── Lesson navigation ── */}
      <div className="mt-10 flex justify-between text-sm">
        <Link href="/phase-6" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 6
        </Link>
        <Link href="/phase-6/02-middleware-protection" className="text-blue-400 hover:text-blue-300 transition-colors">
          Middleware Protection →
        </Link>
      </div>
    </main>
  );
}
