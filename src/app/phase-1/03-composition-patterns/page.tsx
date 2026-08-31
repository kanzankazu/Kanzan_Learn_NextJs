/**
 * Lesson 03 — Composition Patterns
 * Route: /phase-1/03-composition-patterns
 *
 * THE GOLDEN RULE:
 * ─────────────────
 * Server Components CAN contain (wrap) Client Components.
 * Client Components CANNOT import Server Components.
 *
 * WHY DOES THIS MATTER?
 * ──────────────────────
 * The goal is to keep the "client boundary" as SMALL as possible.
 * Only the parts that need interactivity should become Client Components.
 * The rest should stay as Server Components.
 *
 * PATTERN: PUSH CLIENT COMPONENTS TO THE LEAVES
 * ───────────────────────────────────────────────
 * Bad:  Make the whole page 'use client' because one button needs onClick
 * Good: Keep the page as Server Component, extract just the button into a
 *       separate Client Component file.
 *
 * PATTERN: CHILDREN AS SLOT
 * ──────────────────────────
 * A Client Component CAN receive a Server Component as `children`.
 * The children prop is evaluated by the Server first, then passed as
 * pre-rendered content to the Client Component.
 * This is how you "thread" Server Components through Client wrappers.
 */

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "03 — Composition Patterns" };

// ─── Code examples ────────────────────────────────────────────────────────────
const PATTERNS = [
  {
    title: "❌ Anti-pattern: 'use client' on the whole page",
    description: "Making the entire page a Client Component just because one small part needs interactivity. This sends ALL the page code to the browser.",
    code: `// ❌ BAD — entire page is client-side
'use client'
import { useState } from 'react'
import { expensiveComponent } from './heavy-library' // now ships to browser!

export default function Page() {
  const [open, setOpen] = useState(false)
  // ... hundreds of lines of display code that didn't need to be client-side
  return <button onClick={() => setOpen(true)}>Open</button>
}`,
    color: "border-red-500/20 bg-red-500/5",
  },
  {
    title: "✅ Pattern: Extract the interactive part",
    description: "Keep the page as a Server Component. Extract only the interactive piece into its own 'use client' file.",
    code: `// ✅ GOOD — page stays as Server Component
// app/page.tsx (Server Component, no 'use client')
import { OpenButton } from './OpenButton' // Client Component
import { HeavyDisplay } from './HeavyDisplay' // can stay Server

export default async function Page() {
  const data = await db.getData() // ✅ server-side fetch
  return (
    <div>
      <HeavyDisplay data={data} />
      <OpenButton /> {/* Only this tiny piece is Client */}
    </div>
  )
}

// OpenButton.tsx
'use client'
import { useState } from 'react'
export function OpenButton() {
  const [open, setOpen] = useState(false)
  return <button onClick={() => setOpen(!open)}>Open</button>
}`,
    color: "border-green-500/20 bg-green-500/5",
  },
  {
    title: "✅ Pattern: Children as slot (threading RSC through Client)",
    description: "A Client Component can receive Server Components via children. The Server Component is pre-rendered on the server and passed as a prop.",
    code: `// ClientWrapper.tsx — the interactive shell
'use client'
import { useState } from 'react'

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div>
      <button onClick={() => setExpanded(!expanded)}>Toggle</button>
      {/* 'children' is a Server Component — pre-rendered on server */}
      {expanded && children}
    </div>
  )
}

// app/page.tsx — Server Component
import { ClientWrapper } from './ClientWrapper'

async function ServerContent() {
  const data = await db.getSecretData() // ✅ runs on server
  return <p>Secret: {data}</p>
}

export default function Page() {
  return (
    <ClientWrapper>
      {/* ServerContent is evaluated SERVER-SIDE, passed as pre-rendered HTML */}
      <ServerContent />
    </ClientWrapper>
  )
}`,
    color: "border-blue-500/20 bg-blue-500/5",
  },
  {
    title: "❌ Forbidden: Importing Server Component into Client Component",
    description: "You cannot import a Server Component directly inside a Client Component. The import would force it to become a Client Component too.",
    code: `// ❌ FORBIDDEN — this silently converts ServerOnly into a Client Component
'use client'
// This import will cause ServerOnly to lose its server-only benefits.
// If ServerOnly uses DB queries or env secrets, they'll be exposed.
import { ServerOnly } from './ServerOnly' // ❌ breaks server isolation

export function ClientComponent() {
  return <ServerOnly /> // ❌ won't work as expected
}

// ✅ Fix: Use the children prop pattern instead (see pattern above).`,
    color: "border-red-500/20 bg-red-500/5",
  },
];

function CodeBlock({ title, description, code, color }: (typeof PATTERNS)[number]) {
  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-3">{description}</p>
      <pre className="text-xs text-gray-300 font-mono leading-relaxed overflow-x-auto bg-black/30 p-3 rounded-lg">{code}</pre>
    </div>
  );
}

export default function CompositionPatternsPage() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-400">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/phase-1" className="hover:text-blue-400">Phase 1</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-300">Composition Patterns</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Composition Patterns</h1>
        <p className="text-gray-400">
          How to combine Server and Client Components correctly.
          The goal: keep <code className="text-blue-300">&apos;use client&apos;</code> boundaries as small as possible.
        </p>
      </header>

      {/* The golden rule */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 mb-8">
        <p className="text-sm font-semibold text-yellow-400 mb-1">The Golden Rule</p>
        <p className="text-sm text-gray-300">
          Server Components <span className="text-green-400">CAN</span> wrap Client Components.{" "}
          Client Components <span className="text-red-400">CANNOT</span> import Server Components.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Workaround for the second rule: use the <code className="text-blue-300">children</code> prop as a slot.
        </p>
      </div>

      <div className="space-y-6">
        {PATTERNS.map((p) => (
          <CodeBlock key={p.title} {...p} />
        ))}
      </div>

      <div className="flex justify-between text-sm mt-8">
        <Link href="/phase-1/02-client-components" className="text-gray-500 hover:text-blue-400">← Client Components</Link>
        <Link href="/phase-1/mini-project" className="text-blue-400 hover:text-blue-300">Mini Project →</Link>
      </div>
    </main>
  );
}
