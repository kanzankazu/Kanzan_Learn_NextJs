"use client";
/**
 * ChecklistClient — Interactive Optimization Checklist
 *
 * WHY 'use client'?
 * ─────────────────
 * This component uses useState to track which checkboxes are checked.
 * useState is a React hook that only works in Client Components.
 * Any component that uses useState, useEffect, or event handlers (onClick,
 * onChange) MUST have 'use client' at the very top of the file.
 *
 * HOW THE DATA FLOWS:
 * ────────────────────
 * 1. page.tsx (Server Component) defines the CHECKLIST_ITEMS array
 * 2. page.tsx renders <ChecklistClient items={CHECKLIST_ITEMS} />
 * 3. The items array crosses the Server → Client boundary as props
 * 4. ChecklistClient receives it as a prop and renders each item
 * 5. When a user checks a box, useState updates the UI — no server round-trip
 *
 * WHY IS items A PROP (not hardcoded here)?
 * ──────────────────────────────────────────
 * Because the data is static (not user-dependent, not fetched at runtime).
 * Keeping it in the Server Component and passing it down means the data
 * does NOT need to be part of the JavaScript bundle sent to the browser.
 * The server renders the items into HTML; only the "checked" state logic
 * is sent as client JavaScript.
 *
 * STATE DESIGN:
 * ─────────────
 * We use Set<string> for the checked state.
 * A Set is more efficient than an array for membership checks:
 *   - array: checkedIds.includes(id) → O(n) — scans every element
 *   - Set:   checkedIds.has(id)      → O(1) — direct hash lookup
 *
 * For 12 items the difference is imperceptible, but it's the right pattern.
 */

// useState is imported from React — the hook for managing local component state
import { useState } from "react";
// Import the ChecklistItem type from the parent page for type safety
import type { ChecklistItem } from "../page";

// ─── Props Type ────────────────────────────────────────────────────────────────
// We define the component's props interface explicitly.
// items is a readonly array of ChecklistItem (from the parent page).
interface ChecklistClientProps {
  items: readonly ChecklistItem[];
}

// ─── Impact Badge ──────────────────────────────────────────────────────────────
// A small helper component to render the impact badge with consistent styling.
// It reads the impact string and returns the appropriate colour classes.
function ImpactBadge({ impact }: { impact: string }) {
  // Choose colours based on impact level
  // Note: We use a mapping object rather than if/else — cleaner and extensible
  const colorMap: Record<string, string> = {
    HIGH:   "bg-green-500/20 text-green-300 border-green-500/30",
    MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    LOW:    "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  // Fall back to grey if an unknown impact value is passed
  const colorClass = colorMap[impact] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";

  return (
    <span className={`text-xs border px-2 py-0.5 rounded-full ${colorClass}`}>
      {impact}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ChecklistClient({ items }: ChecklistClientProps) {
  /*
   * STATE: checkedIds — tracks which items the user has checked off.
   *
   * WHY Set<string>?
   * A Set stores unique values and has O(1) lookup via .has().
   * We store item IDs (strings) as the set members.
   *
   * Initial state: empty Set — nothing checked on first render.
   *
   * HOW IT UPDATES:
   * When the user checks a box:
   *   - We create a NEW Set (never mutate state directly in React)
   *   - Add or delete the item's id from the new set
   *   - Call setCheckedIds with the new set → React re-renders
   */
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // ── Handler: toggle one item's checked state ─────────────────────────────
  function handleToggle(id: string) {
    /*
     * WHY create a new Set instead of mutating the existing one?
     * React uses reference equality (===) to detect state changes.
     * If we mutated the existing set (checkedIds.add(id)), the reference
     * would be the same object → React would NOT detect a change → no re-render.
     * Creating a new Set gives us a new reference → React detects the change.
     */
    setCheckedIds((prev) => {
      const next = new Set(prev); // Copy existing set
      if (next.has(id)) {
        next.delete(id); // Uncheck: remove from set
      } else {
        next.add(id);    // Check: add to set
      }
      return next;
    });
  }

  // ── Handler: check all items at once ─────────────────────────────────────
  function handleCheckAll() {
    // Create a Set containing every item's id
    setCheckedIds(new Set(items.map((item) => item.id)));
  }

  // ── Handler: clear all checkboxes ─────────────────────────────────────────
  function handleClearAll() {
    setCheckedIds(new Set()); // Empty set — nothing checked
  }

  // ── Derived Values ─────────────────────────────────────────────────────────
  // Computed from state — no extra useState needed (avoid derived state!).
  const checkedCount = checkedIds.size;
  const totalCount = items.length;
  const allChecked = checkedCount === totalCount;
  // Percentage rounded to nearest integer — used for the progress bar width
  const scorePercent = totalCount > 0
    ? Math.round((checkedCount / totalCount) * 100)
    : 0;

  // ── Score Colour ───────────────────────────────────────────────────────────
  // Determine the progress bar and score colour based on completion percentage
  let scoreColor = "bg-red-500";
  let scoreTextColor = "text-red-400";
  if (scorePercent >= 80) {
    scoreColor = "bg-green-500";
    scoreTextColor = "text-green-400";
  } else if (scorePercent >= 50) {
    scoreColor = "bg-yellow-500";
    scoreTextColor = "text-yellow-400";
  } else if (scorePercent >= 25) {
    scoreColor = "bg-orange-500";
    scoreTextColor = "text-orange-400";
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section aria-label="Optimization checklist">

      {/* ── Score Card ──────────────────────────────────────────────────────── */}
      <div className="mb-6 rounded-xl border border-white/10 bg-white/2 p-5">
        {/* Score numbers */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Your optimization score</p>
            {/* Large score display — updates as checkboxes are toggled */}
            <p className={`text-4xl font-bold font-mono ${scoreTextColor}`}>
              {checkedCount}
              <span className="text-2xl text-gray-600">/{totalCount}</span>
            </p>
          </div>
          <p className={`text-2xl font-bold font-mono ${scoreTextColor}`}>
            {scorePercent}%
          </p>
        </div>

        {/* Progress bar */}
        {/*
         * WHY style={{ width: `${scorePercent}%` }} instead of a Tailwind class?
         * Tailwind generates classes at BUILD TIME. Dynamic values like
         * `w-[${scorePercent}%]` are NOT generated because the value is unknown
         * until runtime. We must use inline style for runtime dynamic widths.
         */}
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${scoreColor}`}
            style={{ width: `${scorePercent}%` }}
            role="progressbar"
            aria-valuenow={scorePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${scorePercent}% complete`}
          />
        </div>

        {/* Motivational message */}
        <p className="text-xs text-gray-500 mt-2">
          {scorePercent === 100 && "🎉 Perfect score! Your app is fully optimized."}
          {scorePercent >= 75 && scorePercent < 100 && "🚀 Almost there — finish the remaining items!"}
          {scorePercent >= 50 && scorePercent < 75 && "💪 Good progress — keep going!"}
          {scorePercent >= 25 && scorePercent < 50 && "⚡ Nice start — check off more items to boost your score."}
          {scorePercent > 0 && scorePercent < 25 && "👋 Great start! Each check makes your app faster."}
          {scorePercent === 0 && "Check off items as you apply them to your project."}
        </p>
      </div>

      {/* ── Bulk Actions ─────────────────────────────────────────────────────── */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleCheckAll}
          disabled={allChecked}
          className={`text-xs px-4 py-2 rounded-lg border transition-colors
            ${allChecked
              ? "border-white/5 text-gray-600 cursor-not-allowed"
              : "border-green-500/30 text-green-400 hover:bg-green-500/10"
            }`}
          aria-label="Check all items"
        >
          Check All
        </button>
        <button
          onClick={handleClearAll}
          disabled={checkedCount === 0}
          className={`text-xs px-4 py-2 rounded-lg border transition-colors
            ${checkedCount === 0
              ? "border-white/5 text-gray-600 cursor-not-allowed"
              : "border-red-500/30 text-red-400 hover:bg-red-500/10"
            }`}
          aria-label="Clear all checkboxes"
        >
          Clear All
        </button>
      </div>

      {/* ── Checklist Items ───────────────────────────────────────────────────── */}
      <ul className="space-y-3" role="list">
        {items.map((item) => {
          // Look up whether this item is checked — O(1) with Set
          const isChecked = checkedIds.has(item.id);

          return (
            <li key={item.id}>
              {/*
               * WHY <label> wrapping the <input>?
               * The HTML <label> element associates the label text with the input.
               * Clicking ANYWHERE on the label (text, badge, etc.) toggles the checkbox.
               * This makes the touch target much larger — important for mobile usability.
               * It also satisfies WCAG 1.3.1 (label programmatically associated with input).
               */}
              <label
                className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all duration-200
                  ${isChecked
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-white/10 bg-white/2 hover:border-white/20"
                  }`}
              >
                {/* ── Checkbox ──────────────────────────────────────────────── */}
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(item.id)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-600 accent-green-500 cursor-pointer flex-shrink-0"
                  aria-label={item.title}
                />

                {/* ── Item Content ──────────────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p
                      className={`text-sm font-medium transition-colors
                        ${isChecked ? "text-gray-500 line-through" : "text-white"}`}
                    >
                      {item.title}
                    </p>
                    {/* Impact badge */}
                    <ImpactBadge impact={item.impact} />
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed mb-2">
                    {item.description}
                  </p>

                  {/* Meta row: metric + lesson tag */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                      {item.metric}
                    </span>
                    <span className="text-xs bg-white/5 border border-white/10 text-gray-500 px-2 py-0.5 rounded-full">
                      {item.lesson}
                    </span>
                  </div>
                </div>

                {/* ── Check indicator ───────────────────────────────────────── */}
                {/*
                 * A visual checkmark icon that fades in when an item is checked.
                 * Uses CSS opacity + scale transition for a smooth animation.
                 * This is purely decorative (aria-hidden) — the checkbox input
                 * already communicates state to screen readers.
                 */}
                <span
                  aria-hidden="true"
                  className={`text-green-400 text-lg flex-shrink-0 transition-all duration-200
                    ${isChecked ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                >
                  ✓
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {/* ── Completion Banner ─────────────────────────────────────────────────── */}
      {/*
       * Conditionally rendered — only shows when ALL items are checked.
       * This is a simple conditional render: {condition && <JSX />}
       * When condition is false, React renders nothing.
       */}
      {allChecked && (
        <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
          <p className="text-2xl mb-2" aria-hidden="true">🏆</p>
          <p className="text-green-300 font-semibold text-sm mb-1">
            Optimization Champion!
          </p>
          <p className="text-xs text-green-300/60">
            You&apos;ve applied all Phase 8 optimization techniques.
            Run Lighthouse now and see your score.
          </p>
        </div>
      )}

      {/* ── How to Run Lighthouse ─────────────────────────────────────────────── */}
      <div className="mt-6 rounded-xl border border-white/10 bg-white/2 p-5">
        <h3 className="text-sm font-semibold text-white mb-3">
          How to measure your real Lighthouse score
        </h3>
        <ol className="space-y-2 text-xs text-gray-400">
          <li className="flex gap-3">
            <span className="text-blue-400 font-mono font-bold flex-shrink-0">1.</span>
            Open Chrome DevTools (F12 → Lighthouse tab)
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-mono font-bold flex-shrink-0">2.</span>
            Select &quot;Performance&quot; and set device to &quot;Mobile&quot;
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-mono font-bold flex-shrink-0">3.</span>
            Click &quot;Analyze page load&quot; on your production URL (not localhost)
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-mono font-bold flex-shrink-0">4.</span>
            Check LCP, CLS, and INP. Each has an &quot;Opportunities&quot; section with
            specific fixes.
          </li>
          <li className="flex gap-3">
            <span className="text-blue-400 font-mono font-bold flex-shrink-0">5.</span>
            Aim for: Performance &gt; 90, CLS &lt; 0.1, LCP &lt; 2.5s
          </li>
        </ol>
      </div>
    </section>
  );
}
