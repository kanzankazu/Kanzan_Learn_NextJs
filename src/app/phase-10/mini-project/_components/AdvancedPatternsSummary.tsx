/**
 * AdvancedPatternsSummary — Client Component
 * Used by: phase-10/mini-project/page.tsx
 *
 * WHAT THIS COMPONENT DOES:
 * ──────────────────────────
 * Renders an interactive list of advanced Next.js patterns.
 * Each pattern card can be expanded or collapsed to show:
 *   - What the pattern is best for
 *   - The folder structure it requires
 *   - Key files and their purposes
 *   - Practical notes to remember
 *
 * WHY 'use client'?
 * ──────────────────
 * This component uses React.useState to track which pattern cards
 * are expanded. useState requires a client-side React runtime,
 * so we must mark this file with 'use client'.
 *
 * Without 'use client', Next.js would try to render this as a
 * Server Component — and useState would throw an error at build time.
 *
 * WHY RECEIVE PATTERNS AS PROPS (not fetch them here)?
 * ──────────────────────────────────────────────────────
 * The parent page.tsx is a Server Component that defines the pattern data.
 * It passes the data down as props, keeping this component focused on UI only.
 * Benefits:
 * 1. This component is fully reusable (different parents, different patterns)
 * 2. No useEffect / loading states needed — data arrives synchronously as props
 * 3. The Server Component boundary is maintained — no fetch waterfalls
 *
 * EXPAND/COLLAPSE STATE:
 * ───────────────────────
 * We use a Set<string> to track which pattern IDs are currently expanded.
 * A Set is more efficient than a boolean array when IDs are strings,
 * and it makes the toggle logic clean: has/add/delete.
 *
 * Initial state: the first pattern (intercepting routes) is expanded by default
 * so the user immediately sees what kind of information is available.
 */

'use client';
// ↑ Required because we use useState

import { useState } from "react";
import Link from "next/link";
import type { Pattern } from "../page";
// ↑ Import the Pattern type from the parent Server Component.
//   TypeScript can import TYPES across the server/client boundary safely.
//   (Only values/logic would be a problem — types are erased at build time.)

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  patterns: Pattern[];
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdvancedPatternsSummary({ patterns }: Props) {
  // Track which pattern cards are currently expanded.
  // Using a Set<string> of pattern IDs:
  //   - Has pattern → card is expanded
  //   - Does not have pattern → card is collapsed
  //
  // Initial state: expand the first pattern so the user sees content immediately.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([patterns[0]?.id ?? ""])
    // ↑ The function form of initial state: called ONCE on mount, not on every render.
    //   This is a micro-optimization for computed initial state.
  );

  // Toggle a pattern: expand if collapsed, collapse if expanded.
  function togglePattern(id: string) {
    setExpandedIds((prev) => {
      // We MUST create a NEW Set — never mutate state directly.
      // Mutating prev would not trigger a re-render.
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id); // collapse
      } else {
        next.add(id);    // expand
      }
      return next;
    });
  }

  // Expand all / collapse all helpers
  function expandAll() {
    setExpandedIds(new Set(patterns.map((p) => p.id)));
  }
  function collapseAll() {
    setExpandedIds(new Set()); // empty Set = nothing expanded
  }

  // How many cards are currently expanded (for the summary line)
  const expandedCount = expandedIds.size;

  return (
    <section aria-label="Advanced patterns explorer">

      {/* ── Controls ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-500">
          {expandedCount} of {patterns.length} expanded
        </p>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-gray-400 hover:text-blue-400 transition-colors px-2 py-1 rounded border border-white/10 hover:border-blue-500/40"
          >
            Expand all
          </button>
          <button
            onClick={collapseAll}
            className="text-xs text-gray-400 hover:text-blue-400 transition-colors px-2 py-1 rounded border border-white/10 hover:border-blue-500/40"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* ── Pattern Cards ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {patterns.map((pattern) => {
          // Derive whether this card is expanded from the Set
          const isExpanded = expandedIds.has(pattern.id);

          return (
            <div
              key={pattern.id}
              className={`rounded-xl border transition-all duration-200 ${pattern.accentColor.border} ${isExpanded ? pattern.accentColor.bg : "bg-white/[0.02]"}`}
            >
              {/* ── Card Header (always visible — click to toggle) ─────────── */}
              {/*
               * This is a <button> not a <div> for accessibility:
               * - Screen readers announce it as a button
               * - Keyboard users can Tab to it and press Enter/Space
               * - aria-expanded tells screen readers the current state
               */}
              <button
                onClick={() => togglePattern(pattern.id)}
                className="w-full text-left p-5 flex items-center justify-between gap-4"
                aria-expanded={isExpanded}
                aria-controls={`pattern-content-${pattern.id}`}
              >
                <div className="flex items-center gap-3">
                  {/* Pattern number badge */}
                  <span className={`font-mono font-bold text-sm w-6 shrink-0 ${pattern.accentColor.text}`}>
                    {pattern.number}
                  </span>

                  {/* Emoji icon */}
                  <span className="text-xl leading-none shrink-0" aria-hidden="true">
                    {pattern.emoji}
                  </span>

                  {/* Title + tagline */}
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {pattern.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{pattern.tagline}</p>
                  </div>
                </div>

                {/* Expand/collapse chevron indicator */}
                {/*
                 * The chevron rotates 180° when the card is expanded.
                 * This is a CSS transform on the character — no SVG needed.
                 */}
                <span
                  className={`text-gray-500 text-sm shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                  aria-hidden="true"
                >
                  ▼
                </span>
              </button>

              {/* ── Expanded Content ─────────────────────────────────────────── */}
              {/*
               * Only rendered when isExpanded is true.
               * The id matches aria-controls on the button above —
               * this links the button to the content it controls for
               * screen readers.
               */}
              {isExpanded && (
                <div
                  id={`pattern-content-${pattern.id}`}
                  className="px-5 pb-5 space-y-5"
                >
                  {/* ── Best For ─────────────────────────────────────────────── */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Best for
                    </h4>
                    <ul className="space-y-1">
                      {pattern.bestFor.map((item) => (
                        <li key={item} className="flex gap-2 text-xs text-gray-400">
                          <span className={`${pattern.accentColor.text} shrink-0`} aria-hidden="true">
                            ✓
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ── Folder Structure ─────────────────────────────────────── */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Folder structure
                    </h4>
                    <pre className="bg-black/40 border border-white/10 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-x-auto leading-relaxed">
                      {pattern.folderStructure}
                    </pre>
                  </div>

                  {/* ── Key Files ────────────────────────────────────────────── */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Key files
                    </h4>
                    <div className="space-y-2">
                      {pattern.keyFiles.map(({ file, purpose }) => (
                        <div
                          key={file}
                          className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3"
                        >
                          <code className={`text-xs font-mono shrink-0 ${pattern.accentColor.text} break-all`}>
                            {file}
                          </code>
                          <p className="text-xs text-gray-500 leading-relaxed">{purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Notes ────────────────────────────────────────────────── */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Notes to remember
                    </h4>
                    <ul className="space-y-2">
                      {pattern.notes.map((note) => (
                        <li key={note} className="flex gap-2 text-xs text-gray-400">
                          <span className="text-gray-600 shrink-0" aria-hidden="true">→</span>
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ── Learn More Link ───────────────────────────────────────── */}
                  <div className="pt-1">
                    <Link
                      href={pattern.learnMoreHref}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 ${pattern.accentColor.badge} hover:opacity-80 transition-opacity`}
                    >
                      View full lesson →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Quick Reference Comparison Table ─────────────────────────────────── */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-white mb-3">
          Quick Reference — When to Use Which Pattern
        </h3>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left p-3 text-gray-400 font-medium">If you need…</th>
                <th className="text-left p-3 text-gray-300 font-medium">Use</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["A modal that has a real shareable URL", "🪟 Intercepting Routes"],
                ["Multiple independent sections with own loading/error states", "🔀 Parallel Routes"],
                ["Show different content based on user's country", "⚡ Edge Runtime"],
                ["Ultra-fast auth guard / JWT check before origin", "⚡ Edge Runtime"],
                ["An app in multiple languages with /en/... URLs", "🌍 i18n"],
                ["A dashboard with sidebar + main + analytics panels", "🔀 Parallel Routes"],
                ["A photo gallery where clicking opens a modal overlay", "🪟 Intercepting Routes"],
                ["Serve different content per locale without separate deployments", "🌍 i18n"],
              ].map(([need, use], i) => (
                <tr key={need} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                  <td className="p-3 text-gray-400">{need}</td>
                  <td className="p-3 text-gray-300 font-medium">{use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
