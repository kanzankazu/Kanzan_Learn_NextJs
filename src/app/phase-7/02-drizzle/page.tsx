/**
 * Lesson 02 — Drizzle ORM
 * Route: /phase-7/02-drizzle
 *
 * WHAT IS DRIZZLE ORM?
 * ─────────────────────
 * Drizzle is a TypeScript-first ORM (Object-Relational Mapper) that takes
 * a fundamentally different approach from Prisma:
 *
 * - PRISMA: you write a .prisma file (a custom DSL), run `prisma generate`,
 *   and the CLI creates TypeScript types for you.
 *
 * - DRIZZLE: you write your schema IN TypeScript using plain functions.
 *   There is NO code generation step — TypeScript infers the types
 *   directly from the schema definitions you wrote. It just works.
 *
 * DRIZZLE KEY BENEFITS:
 * ──────────────────────
 * 1. Zero code generation — no `drizzle generate` step needed for types.
 *    Change your schema → types update immediately on next TypeScript check.
 *
 * 2. Tiny bundle — ~7KB gzipped. Great for Edge Runtime and serverless.
 *    Prisma bundles a Rust query engine (~30MB). Not suitable for Edge.
 *
 * 3. SQL-first mindset — Drizzle is close to SQL. You can write raw SQL
 *    queries or use the query builder. It feels like writing SQL with types.
 *
 * 4. Drizzle Studio — a visual DB browser (like Prisma Studio) via drizzle-kit.
 *
 * DRIZZLE VS PRISMA — QUICK MENTAL MODEL:
 * ─────────────────────────────────────────
 * Prisma  → "I want an ORM that feels like an API"
 * Drizzle → "I want an ORM that feels like typed SQL"
 *
 * Both are excellent. Your choice depends on:
 * - Team preference for DSL (Prisma) vs TypeScript (Drizzle)
 * - Bundle size constraints (Edge? → Drizzle)
 * - How close you want to stay to raw SQL (closer → Drizzle)
 *
 * DRIZZLE WORKFLOW:
 * ──────────────────
 * 1. Install:          npm install drizzle-orm  + a driver (e.g. pg, better-sqlite3)
 *                      npm install drizzle-kit --save-dev   (for migrations/studio)
 * 2. Define schema:    db/schema.ts  (TypeScript functions, not a .prisma file)
 * 3. Apply to DB:      npx drizzle-kit push      (prototype)  OR
 *                      npx drizzle-kit generate  (create SQL migration file)
 *                      npx drizzle-kit migrate   (apply migration)
 * 4. Query:            import { db } from '@/lib/db'  (no generate needed for types)
 *
 * TYPE INFERENCE (the magic):
 * ────────────────────────────
 * When you define:  export const users = pgTable('users', { id: integer('id') })
 * Drizzle infers:   type NewUser = typeof users.$inferInsert  → { id?: number }
 *                   type User    = typeof users.$inferSelect  → { id: number }
 *
 * QUERY BUILDER VS SQL:
 * ──────────────────────
 * Drizzle gives you TWO ways to query:
 *
 * 1. Query builder API (similar to Prisma):
 *    db.query.users.findMany({ where: eq(users.role, 'admin') })
 *
 * 2. Select/insert builder (closer to SQL):
 *    db.select().from(users).where(eq(users.role, 'admin'))
 *
 * The second form reads almost like SQL, which makes complex joins
 * and aggregations much easier to reason about.
 */

import Link from "next/link";
import type { Metadata } from "next";

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "02 — Drizzle ORM",
  description:
    "Learn Drizzle ORM: TypeScript-first schema, zero code generation, type inference, query builder, and how it compares to Prisma.",
};

// ─── Code Examples ────────────────────────────────────────────────────────────
const CODE_EXAMPLES = [
  {
    id: "schema",
    label: "1. Schema definition — TypeScript, not a custom DSL",
    description:
      "Unlike Prisma's schema.prisma file, Drizzle schemas are written in regular TypeScript. No separate language to learn — just functions that describe your tables.",
    code: `// db/schema.ts  — Drizzle schema definition

import { pgTable, serial, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
// Use 'mysqlTable' for MySQL, 'sqliteTable' for SQLite

// pgTable() takes two args:
//   1. The actual table name in the database (string)
//   2. An object of column definitions
export const users = pgTable('users', {
  id:        serial('id').primaryKey(),           // Auto-increment integer PK
  email:     text('email').notNull().unique(),     // Required, unique
  name:      text('name'),                         // Optional (nullable by default)
  createdAt: timestamp('created_at').defaultNow(), // Auto-set to current time
});

export const posts = pgTable('posts', {
  id:        serial('id').primaryKey(),
  title:     text('title').notNull(),
  content:   text('content'),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),

  // Foreign key: each post belongs to one user
  // references() creates the FOREIGN KEY constraint
  authorId:  integer('author_id').notNull().references(() => users.id),
});

// --- Type inference (THE killer feature) ---
// You never manually write these types — Drizzle infers them from the schema above.

// $inferSelect = the shape of a row when you SELECT from this table
type User    = typeof users.$inferSelect;
// → { id: number; email: string; name: string | null; createdAt: Date; }

// $inferInsert = the shape of data needed to INSERT a new row
// (auto-increment fields like 'id' become optional)
type NewUser = typeof users.$inferInsert;
// → { id?: number; email: string; name?: string | null; createdAt?: Date; }`,
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
  },
  {
    id: "setup",
    label: "2. Setup — Install, connect, drizzle.config.ts",
    description:
      "How to install Drizzle, create a database connection, and configure drizzle-kit for migrations.",
    code: `# Install drizzle-orm + a database driver
# For PostgreSQL (Node.js):
npm install drizzle-orm pg
npm install @types/pg --save-dev

# For PostgreSQL (serverless/edge with neon):
npm install drizzle-orm @neondatabase/serverless

# For SQLite (great for local dev, Cloudflare D1):
npm install drizzle-orm better-sqlite3
npm install @types/better-sqlite3 --save-dev

# Install drizzle-kit (migrations + studio CLI)
npm install drizzle-kit --save-dev


// --- db/index.ts — Create the Drizzle database instance ---

import { drizzle } from 'drizzle-orm/node-postgres';   // or /neon-serverless
import { Pool } from 'pg';
import * as schema from './schema';   // Import all your table definitions

// Create a connection pool.
// In production, read DATABASE_URL from environment variables.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// drizzle() wraps the pool and wires up your schema for the query API.
// The schema parameter enables db.query.users.findMany() syntax.
export const db = drizzle(pool, { schema });

// Usage: import { db } from '@/db'


// --- drizzle.config.ts — Configure drizzle-kit ---

import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',            // Where your schema is defined
  out: './drizzle/migrations',         // Where to write migration files
  dialect: 'postgresql',               // 'postgresql', 'mysql', or 'sqlite'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;`,
    borderColor: "border-blue-500/20",
    bgColor: "bg-blue-500/5",
  },
  {
    id: "query-builder",
    label: "3. Query builder API — Prisma-like syntax",
    description:
      "The query builder API (db.query.*) is the higher-level Drizzle API. It feels similar to Prisma and handles relations via 'with'.",
    code: `// The query builder API requires passing your schema to drizzle().
// (You already did this in db/index.ts above)

import { db } from '@/db';

// ── READ ─────────────────────────────────────────────────────────────────────
// findMany — returns an array of rows
const allPosts = await db.query.posts.findMany({
  where: (posts, { eq }) => eq(posts.published, true),
  orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  limit: 10,
  // 'with' is Drizzle's equivalent of Prisma's 'include'
  // It performs a JOIN and attaches the related author
  with: {
    author: {
      columns: { name: true, email: true },  // Select only these columns
    },
  },
});
// TypeScript infers: Post & { author: { name: string | null; email: string } }

// findFirst — returns one row or undefined (never throws for missing rows)
const post = await db.query.posts.findFirst({
  where: (posts, { eq }) => eq(posts.id, 1),
  with: { author: true },
});

// ── CREATE ────────────────────────────────────────────────────────────────────
// Use db.insert() — there is no db.query.posts.create()
// (The query API is read-only; mutations use the builder API below)
const [newPost] = await db.insert(posts).values({
  title: 'Hello Drizzle',
  authorId: 1,
}).returning();  // .returning() fetches the inserted row back from the DB
// newPost is fully typed: Post

// ── UPDATE ────────────────────────────────────────────────────────────────────
import { eq } from 'drizzle-orm';

const [updated] = await db
  .update(posts)
  .set({ published: true })
  .where(eq(posts.id, 1))
  .returning();

// ── DELETE ────────────────────────────────────────────────────────────────────
await db.delete(posts).where(eq(posts.id, 1));`,
    borderColor: "border-purple-500/20",
    bgColor: "bg-purple-500/5",
  },
  {
    id: "select-builder",
    label: "4. Select builder API — SQL-like syntax",
    description:
      "The select/insert builder is Drizzle's lower-level API. It reads almost like SQL and is excellent for complex joins and aggregations.",
    code: `import { db } from '@/db';
import { users, posts } from '@/db/schema';
import { eq, and, desc, count, sql } from 'drizzle-orm';

// ── SELECT (basic) ────────────────────────────────────────────────────────────
// This reads almost like: SELECT * FROM posts WHERE published = true ORDER BY created_at DESC
const publishedPosts = await db
  .select()
  .from(posts)
  .where(eq(posts.published, true))
  .orderBy(desc(posts.createdAt))
  .limit(10);

// ── SELECT (specific columns) ─────────────────────────────────────────────────
// Pick only the columns you need — keeps the payload small
const postTitles = await db
  .select({ id: posts.id, title: posts.title })
  .from(posts);
// Returns: { id: number; title: string }[]  — exact shape, fully typed

// ── JOIN ──────────────────────────────────────────────────────────────────────
// db.select().from().leftJoin() mirrors SQL's LEFT JOIN syntax
const postsWithAuthors = await db
  .select({
    postId:     posts.id,
    postTitle:  posts.title,
    authorName: users.name,
    authorEmail: users.email,
  })
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true));

// ── AGGREGATION ───────────────────────────────────────────────────────────────
// Count posts per author — SQL GROUP BY pattern
const postCounts = await db
  .select({
    authorId: posts.authorId,
    total: count(posts.id),
  })
  .from(posts)
  .groupBy(posts.authorId);

// ── RAW SQL ESCAPE HATCH ──────────────────────────────────────────────────────
// When the query builder can't express what you need, drop to raw SQL.
// sql\`...\` is a tagged template that prevents SQL injection.
const result = await db.execute(
  sql\`SELECT id, title FROM posts WHERE title ILIKE ${'%drizzle%'}\`
);`,
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
  },
  {
    id: "migrations",
    label: "5. Migrations with drizzle-kit",
    description:
      "drizzle-kit compares your TypeScript schema to the actual database and generates SQL migration files automatically.",
    code: `# --- Prototype mode (like prisma db push) ---
# Directly sync schema to DB without creating migration files.
# Good for development; risky in production (no rollback history).
npx drizzle-kit push

# --- Production migration workflow ---

# Step 1: Generate a SQL migration file from schema changes
# Compares current schema.ts to the last known DB state
# Creates a file like: drizzle/migrations/0001_add_published_column.sql
npx drizzle-kit generate --name add_published_column

# Step 2: Review the generated SQL (important before applying!)
# cat drizzle/migrations/0001_add_published_column.sql
# Output: ALTER TABLE "posts" ADD COLUMN "published" boolean DEFAULT false NOT NULL;

# Step 3: Apply the migration to your database
npx drizzle-kit migrate

# Explore your database visually (like Prisma Studio)
npx drizzle-kit studio
# Opens http://localhost:4983

# --- Applying migrations programmatically (in your app startup) ---

// db/migrate.ts — run this once when your app boots in production
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './index';

await migrate(db, { migrationsFolder: './drizzle/migrations' });
console.log('Migrations applied successfully');`,
    borderColor: "border-orange-500/20",
    bgColor: "bg-orange-500/5",
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
export default function DrizzlePage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <Link href="/phase-7" className="hover:text-blue-400 transition-colors">Phase 7</Link>
        <span className="mx-2" aria-hidden="true">›</span>
        <span className="text-gray-300">Drizzle ORM</span>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">💧</span>
          <h1 className="text-3xl font-bold text-white">Drizzle ORM</h1>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-2xl">
          TypeScript-first ORM with zero code generation. Write your schema in TypeScript,
          get inferred types automatically, and query with a builder that reads like SQL.
          Tiny bundle — great for Edge and serverless environments.
        </p>
        {/* Notice */}
        <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 px-4 py-3">
          <p className="text-xs text-yellow-200/70">
            ⚠️ Drizzle is NOT installed in this project — all snippets below are
            educational patterns, not runnable code.
          </p>
        </div>
      </header>

      {/* ── Drizzle vs Prisma Comparison ─────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="vs-heading">
        <h2 id="vs-heading" className="text-lg font-semibold text-white mb-4">
          Drizzle vs Prisma
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {/* Prisma column */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-3">
              🔷 Prisma
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-blue-400">→</span> Schema in .prisma DSL file</li>
              <li className="flex gap-2"><span className="text-blue-400">→</span> Requires <code>prisma generate</code></li>
              <li className="flex gap-2"><span className="text-blue-400">→</span> Larger bundle (Rust engine)</li>
              <li className="flex gap-2"><span className="text-blue-400">→</span> Not suitable for Edge Runtime</li>
              <li className="flex gap-2"><span className="text-blue-400">→</span> Excellent DX, autocomplete</li>
              <li className="flex gap-2"><span className="text-blue-400">→</span> <code>include</code> for relations</li>
              <li className="flex gap-2"><span className="text-blue-400">→</span> <code>$transaction()</code></li>
            </ul>
          </div>
          {/* Drizzle column */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">
              💧 Drizzle
            </h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex gap-2"><span className="text-cyan-400">→</span> Schema in TypeScript code</li>
              <li className="flex gap-2"><span className="text-cyan-400">→</span> Zero code generation for types</li>
              <li className="flex gap-2"><span className="text-cyan-400">→</span> ~7KB bundle — Edge-compatible</li>
              <li className="flex gap-2"><span className="text-cyan-400">→</span> Works on Cloudflare Workers, Vercel Edge</li>
              <li className="flex gap-2"><span className="text-cyan-400">→</span> SQL-first query builder</li>
              <li className="flex gap-2"><span className="text-cyan-400">→</span> <code>with</code> for relations (query API)</li>
              <li className="flex gap-2"><span className="text-cyan-400">→</span> <code>db.transaction()</code></li>
            </ul>
          </div>
        </div>

        {/* When to choose which */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/2 p-4">
          <h3 className="text-sm font-semibold text-white mb-2">When to choose which?</h3>
          <div className="space-y-1 text-xs text-gray-400">
            <p><span className="text-blue-300">Choose Prisma</span> when: team prefers a dedicated schema language, want max autocomplete DX, Node.js only deployment.</p>
            <p><span className="text-cyan-300">Choose Drizzle</span> when: deploying to Edge/serverless, want to stay close to SQL, smaller bundle is important, schema-as-TypeScript fits your workflow.</p>
          </div>
        </div>
      </section>

      {/* ── Type Inference Highlight ─────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="inference-heading">
        <h2 id="inference-heading" className="text-lg font-semibold text-white mb-4">
          Type Inference — The Zero-Generation Magic
        </h2>
        <div className="rounded-xl border border-white/10 bg-white/2 p-5">
          <p className="text-sm text-gray-400 mb-3 leading-relaxed">
            The moment you define a table in TypeScript, Drizzle can infer both the
            SELECT shape and the INSERT shape from it — no <code className="text-cyan-300">drizzle generate</code> needed:
          </p>
          <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-x-auto">
{`// Define the table once
const users = pgTable('users', {
  id:    serial('id').primaryKey(),
  email: text('email').notNull(),
  name:  text('name'),
});

// TypeScript infers these automatically — you never write them manually:
type User    = typeof users.$inferSelect;
// → { id: number; email: string; name: string | null }

type NewUser = typeof users.$inferInsert;
// → { id?: number; email: string; name?: string | null }
// Note: 'id' is optional because it has a default (serial/autoincrement)`}
          </pre>
          <p className="text-xs text-gray-500 mt-3">
            Change the schema (add a column, change a type) → TypeScript immediately
            updates the inferred types everywhere in your codebase. No extra step.
          </p>
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

      {/* ── Key Helper Functions ─────────────────────────────────────────────── */}
      <section className="mb-10" aria-labelledby="helpers-heading">
        <h2 id="helpers-heading" className="text-lg font-semibold text-white mb-4">
          Key Helper Functions from drizzle-orm
        </h2>
        <div className="space-y-3">
          {[
            { name: "eq(col, value)", desc: "SQL =. Example: eq(users.id, 1) → WHERE id = 1" },
            { name: "ne(col, value)", desc: "SQL !=. Not equal." },
            { name: "and(...conditions)", desc: "SQL AND. Combine multiple conditions: and(eq(posts.published, true), eq(posts.authorId, 1))" },
            { name: "or(...conditions)", desc: "SQL OR. Either condition must be true." },
            { name: "like(col, pattern)", desc: "SQL LIKE. Case-sensitive pattern match: like(users.email, '%@gmail.com')" },
            { name: "ilike(col, pattern)", desc: "SQL ILIKE. Case-insensitive version (PostgreSQL only)." },
            { name: "desc(col)", desc: "SQL DESC in ORDER BY. Newest first: orderBy(desc(posts.createdAt))" },
            { name: "asc(col)", desc: "SQL ASC in ORDER BY. Oldest first (default)." },
            { name: "count(col)", desc: "SQL COUNT(). Use in .select() for aggregations." },
            { name: "sql`...`", desc: "Escape hatch for raw SQL. Safe from injection via template literals." },
          ].map((item) => (
            <div key={item.name} className="rounded-xl border border-white/10 bg-cyan-500/5 p-3 flex gap-3 items-start">
              <code className="text-cyan-300 text-xs font-mono whitespace-nowrap mt-0.5">{item.name}</code>
              <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Lesson Navigation ────────────────────────────────────────────────── */}
      <div className="flex justify-between text-sm">
        <Link href="/phase-7/01-prisma" className="text-gray-500 hover:text-blue-400 transition-colors">
          ← Prisma
        </Link>
        <Link href="/phase-7/03-supabase" className="text-blue-400 hover:text-blue-300 transition-colors">
          Supabase →
        </Link>
      </div>
    </main>
  );
}
