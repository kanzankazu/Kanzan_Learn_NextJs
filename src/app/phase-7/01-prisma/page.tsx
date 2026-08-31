/**
 * Lesson 01 — Prisma ORM
 * Route: /phase-7/01-prisma
 *
 * WHAT IS PRISMA?
 * ────────────────
 * Prisma is an ORM (Object-Relational Mapper) for Node.js and TypeScript.
 * An ORM lets you interact with a database using your programming language
 * instead of writing raw SQL strings.
 *
 * But Prisma goes further than a typical ORM. Its superpower is TYPE SAFETY:
 * you define your database schema in a .prisma file, run ONE command
 * (`prisma generate`), and Prisma generates a TypeScript client with
 * FULL AUTOCOMPLETE for every table, column, and relation.
 *
 * ANALOGY:
 * ─────────
 * Imagine your database has a `users` table with columns `id`, `email`,
 * and `name`. With raw SQL you write:
 *   db.query("SELECT id, email, name FROM users WHERE id = $1", [userId])
 * → TypeScript has NO idea what shape this returns. It is `any`.
 *
 * With Prisma you write:
 *   prisma.user.findUnique({ where: { id: userId } })
 * → TypeScript KNOWS the return type is `User | null` with fields
 *   `id: number`, `email: string`, `name: string | null`.
 *   A typo in a column name is a compile-time error, not a runtime crash.
 *
 * THE PRISMA WORKFLOW:
 * ─────────────────────
 * 1. Install:      npm install prisma @prisma/client
 * 2. Init:         npx prisma init           (creates prisma/schema.prisma + .env)
 * 3. Define:       Edit prisma/schema.prisma  (models = database tables)
 * 4. Apply to DB:  npx prisma db push         (prototype) OR
 *                  npx prisma migrate dev      (production migrations)
 * 5. Generate:     npx prisma generate        (build the typed client)
 * 6. Use:          import { PrismaClient } from '@prisma/client'
 *
 * DB PUSH VS MIGRATE:
 * ────────────────────
 * db push   → instantly syncs your schema to the DB. No migration file created.
 *             GREAT for prototyping. DANGEROUS in production (no history).
 * migrate   → creates a versioned SQL migration file in prisma/migrations/.
 *             ESSENTIAL for production. Lets you track every schema change.
 *
 * RELATIONS:
 * ───────────
 * Prisma models can have one-to-many, many-to-many, and one-to-one relations.
 * You declare them in the schema and then use `include` or `select` to load them.
 * No manual JOIN queries needed — Prisma generates the SQL for you.
 *
 * $TRANSACTION:
 * ──────────────
 * Sometimes you need multiple DB operations to succeed or fail TOGETHER.
 * Example: transfer money — debit one account AND credit another.
 * If the credit fails after the debit, you have a data corruption bug.
 * prisma.$transaction([...]) wraps operations in a database transaction
 * so they either ALL succeed or ALL roll back.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "01 — Prisma ORM",
  description:
    "Learn Prisma ORM: schema.prisma, prisma generate, db push vs migrate, CRUD queries, relations, and transactions.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
// These are plain strings — Prisma is NOT installed in this repo.
// They show the PATTERNS you would use in a real Next.js + Prisma project.
const CODE_EXAMPLES = [
  {
    id: "schema",
    label: "1. schema.prisma — Define your database structure",
    description:
      "The schema.prisma file is the single source of truth for your database structure AND your TypeScript types. Every model here becomes a typed table.",
    code: `// prisma/schema.prisma

// The generator block tells Prisma what to generate.
// 'prisma-client-js' is the TypeScript/JavaScript client.
generator client {
  provider = "prisma-client-js"
}

// The datasource block tells Prisma HOW to connect to your DB.
// 'env("DATABASE_URL")' reads the connection string from .env
datasource db {
  provider = "postgresql"   // or "mysql", "sqlite", "sqlserver"
  url      = env("DATABASE_URL")
}

// --- MODELS (= database tables) ---

// Each model maps to ONE table in your database.
// Field names become column names.
// Field types determine the SQL column types.
model User {
  id        Int      @id @default(autoincrement()) // Primary key, auto-increment
  email     String   @unique                        // Unique constraint
  name      String?                                 // ? = nullable (NULL in SQL)
  createdAt DateTime @default(now())                // Auto-set to current timestamp
  updatedAt DateTime @updatedAt                     // Auto-updated on every change

  // RELATION: one User has many Posts
  // The "posts" field is virtual — it does not create a DB column.
  // It is a query helper: prisma.user.findUnique({ include: { posts: true } })
  posts     Post[]
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())

  // RELATION: each Post belongs to one User
  // "author" = the related User object (virtual, no DB column)
  // "authorId" = the actual FOREIGN KEY column in this table
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int

  // INDEX on authorId speeds up "posts by user" queries
  @@index([authorId])
}`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "setup",
    label: "2. Setup commands — Install, init, generate, migrate",
    description:
      "The Prisma CLI commands you run to go from zero to a working typed database client.",
    code: `# Step 1: Install Prisma CLI (devDependency) and the runtime client
npm install prisma --save-dev
npm install @prisma/client

# Step 2: Initialise Prisma in your project
# This creates:
#   prisma/schema.prisma  — your schema file
#   .env                  — with a placeholder DATABASE_URL
npx prisma init

# Step 3: Edit .env with your real database URL
# For local development with PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# Step 4a: DEVELOPMENT — push schema directly to DB (no migration file)
# Great for prototyping. Wipes data if destructive changes are made.
npx prisma db push

# Step 4b: PRODUCTION — create a versioned migration file AND apply it
# Creates prisma/migrations/20240101000000_init/migration.sql
npx prisma migrate dev --name init

# Step 5: Generate the TypeScript client from your schema
# Run this EVERY TIME you change schema.prisma
# Creates/updates node_modules/@prisma/client
npx prisma generate

# Bonus: Open Prisma Studio — a visual database browser in your browser
npx prisma studio`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "client",
    label: "3. PrismaClient singleton — How to instantiate in Next.js",
    description:
      "Never call `new PrismaClient()` directly in your components. In Next.js dev mode, hot-reloading creates NEW connections each time. A singleton prevents connection pool exhaustion.",
    code: `// lib/prisma.ts  (or lib/db.ts — create this file once, import everywhere)

import { PrismaClient } from '@prisma/client';

// Extend the Node.js global object to hold our PrismaClient instance.
// This is ONLY needed in development for hot-reload safety.
declare global {
  var prisma: PrismaClient | undefined;
}

// WHY THIS PATTERN?
// In production: 'globalThis.prisma' is always undefined at startup.
//   → We create ONE client that lives for the entire process lifetime.
// In development: Next.js hot-reload creates a new module scope each save.
//   → Without the global, you would create a new PrismaClient (= new DB
//     connection pool) on every file save → eventually you run out of
//     database connections.
export const prisma = globalThis.prisma ?? new PrismaClient({
  log: ['query'],   // Log every SQL query to the console in development
});

// Store the instance in the global so the next hot-reload reuses it
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Usage in a Server Component or Server Action:
// import { prisma } from '@/lib/prisma';
// const users = await prisma.user.findMany();`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "crud",
    label: "4. CRUD queries — Create, Read, Update, Delete",
    description:
      "The four fundamental database operations. All Prisma query methods are async and return typed results.",
    code: `// app/actions/posts.ts  (Server Actions in Next.js)
import { prisma } from '@/lib/prisma';

// ── CREATE ──────────────────────────────────────────────────────────────────
// prisma.post.create() inserts one row and returns the created record.
// The return type is inferred: Promise<Post>
async function createPost(title: string, authorId: number) {
  const post = await prisma.post.create({
    data: {
      title,
      authorId,
      published: false,
    },
  });
  return post; // TypeScript knows: post.id, post.title, post.published, etc.
}

// ── READ (multiple) ──────────────────────────────────────────────────────────
// prisma.post.findMany() returns Post[]
// 'where' = SQL WHERE clause, 'orderBy' = SQL ORDER BY
async function getPublishedPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    // 'include' performs a JOIN and attaches the related author
    include: { author: { select: { name: true, email: true } } },
    take: 10,   // LIMIT 10
    skip: 0,    // OFFSET 0  (use for pagination)
  });
}

// ── READ (single) ─────────────────────────────────────────────────────────────
// findUnique returns Post | null  (if not found, returns null — not an error)
async function getPost(id: number) {
  return prisma.post.findUnique({
    where: { id },
    include: { author: true },
  });
}

// ── UPDATE ────────────────────────────────────────────────────────────────────
// prisma.post.update() finds by the 'where' clause and applies 'data' changes.
// Returns the updated Post.
async function publishPost(id: number) {
  return prisma.post.update({
    where: { id },
    data: { published: true },
  });
}

// ── DELETE ────────────────────────────────────────────────────────────────────
// prisma.post.delete() removes the row. Returns the deleted Post.
async function deletePost(id: number) {
  return prisma.post.delete({
    where: { id },
  });
}`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
  },
  {
    id: "transaction",
    label: "5. $transaction — Atomic multi-step operations",
    description:
      "Use $transaction when multiple DB writes must succeed or fail together. Classic example: bank transfer (debit + credit must be atomic).",
    code: `// Example: Transfer credits between two user wallets atomically

import { prisma } from '@/lib/prisma';

async function transferCredits(
  fromUserId: number,
  toUserId: number,
  amount: number
) {
  // prisma.$transaction() wraps all operations in a single SQL transaction.
  // If ANY operation throws, the entire transaction is rolled back.
  // Either BOTH the debit and credit happen, or NEITHER does.
  const [debit, credit] = await prisma.$transaction([
    // Operation 1: Decrease sender's balance
    prisma.wallet.update({
      where: { userId: fromUserId },
      data: { balance: { decrement: amount } },
    }),
    // Operation 2: Increase receiver's balance
    prisma.wallet.update({
      where: { userId: toUserId },
      data: { balance: { increment: amount } },
    }),
  ]);

  return { debit, credit };
}

// --- Interactive transactions (for conditional logic inside the transaction) ---
async function safeTransfer(fromId: number, toId: number, amount: number) {
  return prisma.$transaction(async (tx) => {
    // 'tx' is a transaction-scoped PrismaClient — use it for all queries inside
    const sender = await tx.wallet.findUnique({ where: { userId: fromId } });

    if (!sender || sender.balance < amount) {
      throw new Error('Insufficient balance'); // Rolls back the transaction
    }

    await tx.wallet.update({ where: { userId: fromId }, data: { balance: { decrement: amount } } });
    await tx.wallet.update({ where: { userId: toId   }, data: { balance: { increment: amount } } });
  });
}`,
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
  },
  {
    id: "server-component",
    label: "6. Prisma in a Next.js Server Component",
    description:
      "Server Components run only on the server, so you can safely call prisma directly. No API route needed — the DB query happens at render time.",
    code: `// app/blog/page.tsx — Server Component
// No 'use client' — this runs on the server, safe to call prisma

import { prisma } from '@/lib/prisma';

// In Next.js 15, Server Components can be async.
// The component itself acts as an async data-fetching layer.
export default async function BlogPage() {
  // This Prisma query runs ON THE SERVER during rendering.
  // It is NOT exposed to the browser — no API endpoint needed.
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { name: true } } },
  });

  return (
    <main>
      <h1>Blog</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            {/* TypeScript knows post.author.name is string | null */}
            <p>By {post.author.name ?? 'Anonymous'}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}

// --- Server Action: mutate from a form without an API route ---
// app/blog/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPostAction(formData: FormData) {
  const title = formData.get('title') as string;
  await prisma.post.create({ data: { title, authorId: 1 } });
  revalidatePath('/blog'); // Invalidate the cached blog page
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
export default function PrismaPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-7" className="hover:text-blue-400 transition-colors">Phase 7</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Prisma ORM</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">🔷</span>
          <h1 className="text-3xl font-bold text-white">Prisma ORM</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          Define your database schema once in a .prisma file, run one command,
          and get a fully type-safe client that autocompletes every table and column.
          The gold standard for type-safe database access in Node.js.
        </p>
        {/* Notice */}
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <p className="text-xs text-yellow-200/70">
            ⚠️ Prisma is NOT installed in this project — all snippets below are
            educational patterns, not runnable code.
          </p>
        </div>
      </header>

      {/* ── How Prisma Type Safety Works ─────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="type-safety-heading">
        <h2 id="type-safety-heading" className="text-lg font-semibold text-white mb-4">
          Why Prisma is Type-Safe
        </h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {[
            {
              step: "Step 1",
              title: "You write schema.prisma",
              body: "You define models (tables) and their fields (columns) in a declarative schema file. This is the single source of truth for your DB structure.",
            },
            {
              step: "Step 2",
              title: "prisma generate runs",
              body: "The Prisma CLI reads your schema and generates a TypeScript client inside node_modules/@prisma/client. Every model gets its own TypeScript interface.",
            },
            {
              step: "Step 3",
              title: "You import PrismaClient",
              body: "You import the generated client and call methods like prisma.user.findMany(). TypeScript autocompletes field names and validates query shapes at compile time.",
            },
            {
              step: "Step 4",
              title: "Schema change → regenerate",
              body: "Add a new column to your schema? Run prisma generate again. The client updates immediately. TypeScript will flag every place in your code that needs updating.",
            },
          ].map((card) => (
            <div key={card.step} className="rounded-xl border border-white/10 bg-white/2 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-400 font-mono font-bold text-sm">{card.step}</span>
                <h3 className="text-sm font-semibold text-white">{card.title}</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Key Concepts ─────────────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="concepts-heading">
        <h2 id="concepts-heading" className="text-lg font-semibold text-white mb-4">
          Key Concepts
        </h2>
        <div className="space-y-3">
          {[
            {
              term: "@id @default(autoincrement())",
              def: "Marks a field as the primary key. autoincrement() means the DB assigns an integer that increases with each row.",
            },
            {
              term: "@unique",
              def: "Adds a UNIQUE constraint. prisma.user.findUnique() only works on @unique or @id fields.",
            },
            {
              term: "String?",
              def: "The ? makes a field optional in TypeScript AND nullable in the database (NULL is allowed). Without ?, the field is required in both.",
            },
            {
              term: "@default(now())",
              def: "Sets the column default to the current timestamp. The DB fills this in automatically — you don't need to pass it in prisma.create().",
            },
            {
              term: "@updatedAt",
              def: "Prisma automatically updates this column to the current time whenever the row is updated. Zero effort audit trail.",
            },
            {
              term: "include vs select",
              def: "include: { author: true } loads ALL author fields (like JOIN *). select: { author: { select: { name: true } } } loads only specific fields. Prefer select to keep payloads small.",
            },
          ].map((item) => (
            <div key={item.term} className="rounded-xl border border-white/10 bg-blue-500/5 p-4">
              <code className="text-blue-300 text-sm font-mono">{item.term}</code>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.def}</p>
            </div>
          ))}
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

      {/* ── db push vs migrate ───────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="push-vs-migrate">
        <h2 id="push-vs-migrate" className="text-lg font-semibold text-white mb-4">
          db push vs migrate dev
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <h3 className="text-sm font-semibold text-orange-400 mb-3">
              prisma db push — Prototype
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-orange-400">✓</span> Instant sync to DB</li>
              <li className="flex gap-2"><span className="text-orange-400">✓</span> No migration files created</li>
              <li className="flex gap-2"><span className="text-orange-400">✓</span> Great for rapid prototyping</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> No change history</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Destructive changes wipe data</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> NOT for production</li>
            </ul>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-3">
              prisma migrate dev — Production
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Creates versioned SQL files</li>
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Full change history in git</li>
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Safe for production deployments</li>
              <li className="flex gap-2"><span className="text-blue-400">✓</span> Rollback support</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Slower iteration cycle</li>
              <li className="flex gap-2"><span className="text-red-400">✗</span> Requires migration discipline</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Rule of thumb: use <code className="text-gray-400">db push</code> while
          building, switch to <code className="text-gray-400">migrate dev</code> before
          your first production deployment.
        </p>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-7" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Phase 7
        </Link>
        <Link href="/phase-7/02-drizzle" className="text-blue-400 hover:text-blue-300 transition-colors">
          Drizzle →
        </Link>
      </div>
    </main>
  );
}
