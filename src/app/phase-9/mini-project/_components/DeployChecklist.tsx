/**
 * DeployChecklist — Interactive pre-deployment checklist
 * Used by: /phase-9/mini-project
 *
 * WHY 'use client'?
 * ──────────────────
 * This component uses useState to track which checklist items are checked.
 * useState is a React hook that only works in the browser (client-side).
 * That is why we need 'use client' at the top of this file.
 *
 * If this were a purely presentational component with no interactivity,
 * we would NOT need 'use client' — it would be a Server Component by default.
 *
 * STATE DESIGN:
 * ─────────────
 * We use a Set<string> to track checked item IDs:
 *   Set is perfect for "which items are in a collection" — O(1) lookup,
 *   automatically de-duplicates, clean has/add/delete API.
 *
 * Alternative: boolean[] or Record<string, boolean>.
 * Set is the cleanest choice here because we care about MEMBERSHIP, not order.
 *
 * DERIVED STATE PATTERN:
 * ───────────────────────
 * The progress percentage is NOT stored in state — it is DERIVED from state.
 * This is a React best practice: never store in state what you can calculate
 * from existing state. Derived values are always in sync and can never
 * get out of step with the source of truth.
 *
 * IMMUTABILITY:
 * ─────────────
 * React state updates must be IMMUTABLE — you never mutate state directly.
 * For a Set, this means creating a NEW Set instead of calling .add() or
 * .delete() on the existing one:
 *   ✅ setChecked(new Set(prev).add(id))   → creates a new Set
 *   ❌ prev.add(id); setChecked(prev)      → mutates — React won't re-render
 */

"use client";

// useState is the fundamental React hook for local component state.
// When state changes, React re-renders ONLY this component and its children.
import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────
// TypeScript interfaces define the shape of our data.
// Define these ONCE and reuse them to keep the code consistent.

interface ChecklistItem {
  id: string;       // Unique identifier used as the Set key
  text: string;     // The checklist item text shown to the user
  detail?: string;  // Optional tooltip/explanation for the item
}

interface ChecklistCategory {
  id: string;
  title: string;
  icon: string;     // Emoji icon for the category header
  color: {
    border: string; // Tailwind border color class
    bg: string;     // Tailwind background color class
    heading: string; // Tailwind text color class for the category title
    badge: string;  // Tailwind text color for the progress badge
  };
  items: ChecklistItem[];
}

// ─── Checklist Data ────────────────────────────────────────────────────────────
// Define all categories and items as a constant array outside the component.
// This prevents the data from being re-created on every render.
// Think of it as a "database" of checklist items.
const CATEGORIES: ChecklistCategory[] = [
  {
    id: "build-test",
    title: "Build & Test",
    icon: "🏗️",
    color: {
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
      heading: "text-blue-400",
      badge: "text-blue-300",
    },
    items: [
      {
        id: "build-passes",
        text: "npm run build completes without errors",
        detail: "Run locally before deploying. TypeScript errors and import issues appear here.",
      },
      {
        id: "ts-no-errors",
        text: "No TypeScript errors (npx tsc --noEmit)",
        detail: "TypeScript errors that slip past next build --strict should be caught by running tsc directly.",
      },
      {
        id: "lint-passes",
        text: "Linting passes (npm run lint)",
        detail: "ESLint catches unescaped JSX characters, unused imports, and other issues that cause build failures.",
      },
      {
        id: "tests-pass",
        text: "All tests pass (npm test)",
        detail: "Run your full test suite. Green tests = confidence the code behaves as expected.",
      },
      {
        id: "no-console-logs",
        text: "No leftover console.log debugging statements",
        detail: "console.log leaks in production output and can expose sensitive data in server logs.",
      },
      {
        id: "404-checked",
        text: "404 and error pages are styled",
        detail: "Check that app/not-found.tsx and app/error.tsx exist and look intentional — not blank white screens.",
      },
    ],
  },
  {
    id: "security",
    title: "Security",
    icon: "🔒",
    color: {
      border: "border-red-500/20",
      bg: "bg-red-500/5",
      heading: "text-red-400",
      badge: "text-red-300",
    },
    items: [
      {
        id: "env-local-gitignored",
        text: ".env.local is in .gitignore (no secrets in git)",
        detail: "Check git status. If .env.local appears as untracked, that is fine. If it appears in a commit, rotate ALL secrets immediately.",
      },
      {
        id: "env-vars-set",
        text: "All production env vars set in the deployment platform",
        detail: "Vercel dashboard → Env Vars. Docker → --env-file or docker-compose environment section. Compare with .env.example.",
      },
      {
        id: "secrets-rotated",
        text: "Auth secrets are strong and unique for production",
        detail: "JWT_SECRET, NEXTAUTH_SECRET etc. must be long, random strings — NOT the same as your dev values. Generate with: openssl rand -hex 32",
      },
      {
        id: "no-hardcoded-secrets",
        text: "No hardcoded API keys, passwords, or tokens in source code",
        detail: 'Search your repo: grep -r "sk_live\\|password.*=.*\\"" --include="*.ts" . — fix anything found.',
      },
      {
        id: "https-enabled",
        text: "HTTPS / SSL is enabled on the production domain",
        detail: "Vercel enables this automatically. VPS: run certbot --nginx -d yourdomain.com. Never serve auth over HTTP.",
      },
      {
        id: "cors-headers",
        text: "CORS and security headers are configured",
        detail: "Add X-Frame-Options, X-Content-Type-Options, and CSP headers. Use the headers() option in next.config.ts or vercel.json.",
      },
    ],
  },
  {
    id: "performance",
    title: "Performance",
    icon: "⚡",
    color: {
      border: "border-yellow-500/20",
      bg: "bg-yellow-500/5",
      heading: "text-yellow-400",
      badge: "text-yellow-300",
    },
    items: [
      {
        id: "images-optimised",
        text: "Images use next/image (not plain <img> tags)",
        detail: "next/image automatically applies WebP conversion, lazy loading, and serves the optimal size for each device.",
      },
      {
        id: "fonts-optimised",
        text: "Fonts use next/font (not @import in CSS)",
        detail: "next/font downloads fonts at build time, self-hosts them, and eliminates layout shift from third-party font CDNs.",
      },
      {
        id: "bundle-analysed",
        text: "Bundle size checked with @next/bundle-analyzer",
        detail: "Large bundles cause slow page loads. Look for unexpectedly large packages and split routes that don't need everything upfront.",
      },
      {
        id: "cache-headers",
        text: "Static assets have correct cache headers",
        detail: "/_next/static/ files have content-hash names — they can be cached for 1 year. Verify with curl -I https://yourapp.com/_next/static/...",
      },
      {
        id: "isr-revalidate",
        text: "Fetch calls have appropriate revalidate values",
        detail: "Data that changes hourly: revalidate: 3600. Static content: revalidate: false. Real-time: no-store. Match revalidation to data freshness requirements.",
      },
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring",
    icon: "📊",
    color: {
      border: "border-green-500/20",
      bg: "bg-green-500/5",
      heading: "text-green-400",
      badge: "text-green-300",
    },
    items: [
      {
        id: "error-monitoring",
        text: "Error monitoring is set up (Sentry or equivalent)",
        detail: "Sentry captures unhandled exceptions with full stack traces and user context. You want to know about errors BEFORE your users email you.",
      },
      {
        id: "uptime-monitoring",
        text: "Uptime monitoring is configured",
        detail: "BetterStack, UptimeRobot, or similar. Pings your app every 60 seconds and alerts you via email/Slack if it goes down.",
      },
      {
        id: "logs-accessible",
        text: "Server logs are accessible and searchable",
        detail: "Vercel: built-in log viewer. VPS: pm2 logs or docker compose logs -f app. Consider a log aggregation service for production.",
      },
      {
        id: "analytics-configured",
        text: "Analytics are configured (Vercel Analytics or GA)",
        detail: "Vercel Analytics tracks Core Web Vitals per real user session — not synthetic. Essential for measuring performance improvements.",
      },
      {
        id: "alerts-configured",
        text: "Alerts are configured for critical errors",
        detail: "Set up Slack/email alerts for error rate spikes. Know about P0 issues within minutes, not hours.",
      },
    ],
  },
];

// ─── Helper: total item count across all categories ────────────────────────────
// Flatten all categories into a single array of items and count them.
// Array.flatMap is like map() followed by flat() — ideal for this pattern.
const TOTAL_ITEMS = CATEGORIES.flatMap((cat) => cat.items).length;

// ─── Helper: get colour class based on progress percentage ────────────────────
// This function maps a number to a Tailwind class string.
// Called on every render — fine because it is O(1) and has no side effects.
function getProgressColor(percentage: number): {
  bar: string;   // Background colour for the progress bar fill
  text: string;  // Text colour for the percentage label
  label: string; // Human-readable label (Not ready / Almost / Ready)
} {
  if (percentage >= 80) {
    // 80%+ → green → ready to deploy
    return { bar: "bg-green-500", text: "text-green-400", label: "Ready to deploy!" };
  }
  if (percentage >= 50) {
    // 50–79% → yellow → almost ready
    return { bar: "bg-yellow-500", text: "text-yellow-400", label: "Almost ready" };
  }
  // Below 50% → red → not ready yet
  return { bar: "bg-red-500", text: "text-red-400", label: "Not ready yet" };
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function DeployChecklist() {
  // ── State ────────────────────────────────────────────────────────────────────
  // checkedIds is a Set of item ID strings. A Set is ideal here:
  //   - O(1) has() check → fast rendering
  //   - naturally de-duplicates → no risk of double-counting
  //   - clean mental model: "which IDs are in the set?"
  //
  // Initial state: empty Set → no items checked yet.
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  // ── Toggle handler ────────────────────────────────────────────────────────────
  // Called when the user clicks a checkbox.
  // We MUST create a new Set (not mutate the existing one) for React to detect
  // the change and trigger a re-render.
  function toggleItem(id: string) {
    setCheckedIds((prev) => {
      // Copy the previous Set into a new Set — immutability rule
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id); // Already checked → uncheck it
      } else {
        next.add(id);    // Not checked → check it
      }
      return next;
    });
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  // These are calculated fresh on every render from the current state.
  // No need to store them separately — derived state is always in sync.
  const checkedCount = checkedIds.size;
  // Math.round avoids floating-point weirdness like 66.666...%
  const percentage = TOTAL_ITEMS > 0
    ? Math.round((checkedCount / TOTAL_ITEMS) * 100)
    : 0;
  const progressColor = getProgressColor(percentage);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── Overall Progress Bar ─────────────────────────────────────────────── */}
      {/*
       * The progress section shows total completion at a glance.
       * It sticks to the top of the checklist section so users always
       * see their progress without scrolling.
       */}
      <div className="mb-8 rounded-xl border border-white/10 bg-white/2 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white">Overall Progress</h2>
          {/* Percentage badge — colour changes with progress level */}
          <span className={`text-2xl font-bold font-mono ${progressColor.text}`}>
            {percentage}%
          </span>
        </div>

        {/* Progress bar track */}
        <div
          className="w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Deployment readiness: ${percentage}%`}
        >
          {/* Progress bar fill — width is a CSS variable so Tailwind can animate it */}
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor.bar}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Status label + item count */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${progressColor.text}`}>
            {progressColor.label}
          </span>
          <span className="text-xs text-gray-500">
            {checkedCount} / {TOTAL_ITEMS} items
          </span>
        </div>

        {/* Legend — explain colour thresholds */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" aria-hidden="true" />
            Below 50% — not ready
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" aria-hidden="true" />
            50–79% — almost ready
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" aria-hidden="true" />
            80%+ — ready to deploy
          </span>
        </div>
      </div>

      {/* ── Category Sections ────────────────────────────────────────────────── */}
      {/*
       * Map over each category and render its items.
       * The key prop must be unique — use the category ID.
       * React uses key to efficiently update only the changed DOM nodes.
       */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          // ── Per-category derived values ─────────────────────────────────────
          // Count how many items in THIS category are checked.
          // Array.filter + .length is readable and fast for small arrays.
          const catChecked = category.items.filter((item) =>
            checkedIds.has(item.id)
          ).length;
          const catTotal = category.items.length;
          // Has the user completed all items in this category?
          const catComplete = catChecked === catTotal;

          return (
            <div
              key={category.id}
              className={`rounded-xl border p-5 ${category.color.border} ${category.color.bg}`}
            >
              {/* Category header row: icon + title + progress badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden="true">{category.icon}</span>
                  <h3 className={`text-base font-semibold ${category.color.heading}`}>
                    {category.title}
                  </h3>
                  {/* Checkmark appears when category is complete */}
                  {catComplete && (
                    <span
                      className="text-green-400 text-sm"
                      aria-label="Category complete"
                    >
                      ✓
                    </span>
                  )}
                </div>
                {/* Per-category progress badge */}
                <span className={`text-xs font-mono ${category.color.badge}`}>
                  {catChecked}/{catTotal}
                </span>
              </div>

              {/* Checklist items */}
              <ul className="space-y-2" role="list">
                {category.items.map((item) => {
                  // Is THIS specific item checked?
                  const isChecked = checkedIds.has(item.id);

                  return (
                    <li key={item.id}>
                      {/*
                       * Use a <label> wrapping the <input> so clicking anywhere
                       * on the text also toggles the checkbox.
                       * htmlFor is not needed when input is INSIDE the label.
                       */}
                      <label
                        className={`flex items-start gap-3 cursor-pointer group rounded-lg p-2 transition-colors
                          ${isChecked ? "bg-white/5" : "hover:bg-white/5"}`}
                      >
                        {/*
                         * The actual checkbox input.
                         * We control it via the checkedIds Set (controlled component pattern).
                         * onChange is required for controlled inputs — it fires on every change.
                         */}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleItem(item.id)}
                          className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border-gray-600
                            accent-blue-500 cursor-pointer"
                          aria-label={item.text}
                        />
                        <div className="min-w-0">
                          {/* Item text — strikethrough and grey when checked */}
                          <p
                            className={`text-sm leading-relaxed transition-colors
                              ${isChecked
                                ? "line-through text-gray-600"
                                : "text-gray-300 group-hover:text-white"
                              }`}
                          >
                            {item.text}
                          </p>
                          {/* Optional detail / explanation */}
                          {item.detail && (
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                              {item.detail}
                            </p>
                          )}
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>

      {/* ── Reset Button ─────────────────────────────────────────────────────── */}
      {/*
       * Only show the reset button when at least one item is checked.
       * Conditional rendering: {condition && <JSX>}
       * When checkedCount is 0 (falsy), React renders nothing.
       */}
      {checkedCount > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setCheckedIds(new Set())}
            className="px-4 py-2 text-sm text-gray-500 border border-white/10 rounded-lg
              hover:border-red-500/40 hover:text-red-400 transition-colors"
            aria-label="Reset all checklist items"
          >
            Reset all ({checkedCount} checked)
          </button>
        </div>
      )}

      {/* ── Completion Banner ─────────────────────────────────────────────────── */}
      {/*
       * Show a congratulations banner when ALL items are checked.
       * percentage === 100 is the cleanest check — avoids floating-point issues.
       */}
      {percentage === 100 && (
        <div
          className="mt-6 rounded-xl border border-green-500/40 bg-green-500/10 p-5 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-2xl mb-2" aria-hidden="true">🚀</p>
          <p className="text-green-400 font-semibold text-base mb-1">
            All checks complete — you are ready to deploy!
          </p>
          <p className="text-xs text-green-300/60 leading-relaxed">
            Your app has passed all build, security, performance, and monitoring checks.
            Go ship it.
          </p>
        </div>
      )}
    </div>
  );
}
