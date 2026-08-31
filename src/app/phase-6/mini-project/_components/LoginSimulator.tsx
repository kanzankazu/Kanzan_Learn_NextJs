"use client";
/**
 * LoginSimulator — Client Component
 * Used by: /phase-6/mini-project/page.tsx
 *
 * WHY 'use client'?
 * ─────────────────
 * This component needs:
 *   - useState: to track whether the user is "logged in" and their simulated data
 *   - Event handlers: onClick (login/logout buttons), onChange (input fields)
 *   - Form interaction: controlled inputs for email + password
 *
 * All three require 'use client'. This is a perfect example of where
 * the client boundary belongs — keeping it in a leaf component, NOT at the page level.
 *
 * IN A REAL APP WITH AUTH.JS:
 * ───────────────────────────
 * Replace this entire useState simulation with:
 *   - signIn('google')         → triggers Google OAuth
 *   - signIn('credentials', { email, password }) → submits to Credentials provider
 *   - signOut({ callbackUrl: '/' })              → clears session + redirects
 *   - useSession()             → reads the live session (from next-auth/react)
 *
 * The UI layout (login form, dashboard view) would look exactly the same.
 * Only the data source changes.
 */

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
// In a real app, this type would come from Auth.js session object.
// Matches the shape of session.user from our auth.ts callbacks.
interface SimulatedUser {
  name: string;
  email: string;
  role: "user" | "admin";
  avatar: string; // initials, since we have no real avatar URL
}

// ─── Mock user database ───────────────────────────────────────────────────────
// Simulates the "authorize()" function in the Credentials provider.
// In real app: this would be a bcrypt.compare() against your database.
const MOCK_USERS: Record<string, SimulatedUser & { password: string }> = {
  "user@example.com": {
    name: "Alice Johnson",
    email: "user@example.com",
    password: "password123",
    role: "user",
    avatar: "AJ",
  },
  "admin@example.com": {
    name: "Bob Admin",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    avatar: "BA",
  },
};

// ─── Simulated recent activity data ──────────────────────────────────────────
// In a real app, this would come from a database query in the Server Component,
// passed down as a prop to this Client Component.
const ACTIVITY = [
  { id: 1, action: "Logged in", time: "Just now", icon: "🔑" },
  { id: 2, action: "Viewed dashboard", time: "1 min ago", icon: "📊" },
  { id: 3, action: "Updated profile", time: "2 days ago", icon: "✏️" },
  { id: 4, action: "Changed password", time: "1 week ago", icon: "🔒" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function LoginSimulator() {
  // ── State ──
  // isLoggedIn: tracks whether the user has "authenticated"
  // In real app: this would be derived from useSession() or session prop from server
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // currentUser: the authenticated user object
  // In real app: this would be session.user from useSession() or auth()
  const [currentUser, setCurrentUser] = useState<SimulatedUser | null>(null);

  // Form field states
  const [email, setEmail] = useState("user@example.com"); // pre-filled for demo UX
  const [password, setPassword] = useState("");

  // Error state for invalid credentials
  const [error, setError] = useState<string | null>(null);

  // Loading state — simulates the network round-trip that Auth.js would make
  const [isLoading, setIsLoading] = useState(false);

  // ── Login handler ──
  // In real app, this would be:
  //   await signIn("credentials", { email, password, redirect: false })
  //   OR for OAuth: signIn("google")
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); // prevent default form submit (page reload)
    setError(null);
    setIsLoading(true);

    // Simulate network latency (Auth.js would hit your server for credentials check)
    await new Promise((r) => setTimeout(r, 800));

    const found = MOCK_USERS[email.toLowerCase()];

    if (!found || found.password !== password) {
      // In real app: Auth.js Credentials authorize() returns null → signIn returns error
      setError("Invalid email or password. Try user@example.com / password123");
      setIsLoading(false);
      return;
    }

    // Auth successful — set session
    // In real app: Auth.js would set an encrypted cookie here
    const { password: _omit, ...user } = found; // strip password before storing
    setCurrentUser(user);
    setIsLoggedIn(true);
    setIsLoading(false);
    setPassword(""); // clear password field after login
  }

  // ── Logout handler ──
  // In real app: signOut({ callbackUrl: "/" })
  // Auth.js would clear the session cookie and redirect
  function handleLogout() {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setError(null);
    setEmail("user@example.com");
    setPassword("");
  }

  // ── Quick login shortcuts (for demo UX) ──
  function quickLogin(role: "user" | "admin") {
    const accounts = {
      user: { email: "user@example.com", pass: "password123" },
      admin: { email: "admin@example.com", pass: "admin123" },
    };
    setEmail(accounts[role].email);
    setPassword(accounts[role].pass);
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Not logged in → Show login form
  // ════════════════════════════════════════════════════════════════════════
  if (!isLoggedIn) {
    return (
      <div className="space-y-6">
        {/* Demo account hints */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-xs font-semibold text-blue-400 mb-3">
            Demo Accounts (click to pre-fill):
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => quickLogin("user")}
              className="text-xs bg-white/10 hover:bg-white/15 border border-white/20 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              👤 Regular User — user@example.com / password123
            </button>
            <button
              onClick={() => quickLogin("admin")}
              className="text-xs bg-white/10 hover:bg-white/15 border border-white/20 text-gray-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              👑 Admin User — admin@example.com / admin123
            </button>
          </div>
        </div>

        {/* Login form */}
        <div className="rounded-xl border border-white/10 bg-white/2 p-6 max-w-md">
          <h2 className="text-lg font-semibold text-white mb-1">Sign In</h2>
          <p className="text-xs text-gray-500 mb-6">
            {/* In real app: this would also have "Sign in with Google" / "Sign in with GitHub" buttons */}
            Simulating the Credentials provider login form.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-xs text-gray-400 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-xs text-gray-400 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-2 rounded-lg transition-colors"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* OAuth buttons — for illustration */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-xs text-gray-600 mb-3 text-center">
              In a real app, these would call{" "}
              <code className="text-gray-400">{"signIn('google')"}</code>:
            </p>
            <div className="space-y-2">
              {/* These buttons are decorative — no real OAuth installed */}
              {["Google", "GitHub"].map((provider) => (
                <button
                  key={provider}
                  disabled
                  title={`Would call signIn('${provider.toLowerCase()}') in a real app`}
                  className="w-full border border-white/10 text-gray-600 text-xs py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="text-gray-700">
                    {provider === "Google" ? "G" : "⌥"}
                  </span>
                  Sign in with {provider}
                  <span className="text-gray-700">(demo — disabled)</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER: Logged in → Show protected dashboard
  // ════════════════════════════════════════════════════════════════════════
  // In a real app, this content would only be reachable because:
  //   1. middleware.ts checked the JWT cookie and allowed the request
  //   2. auth() on the Server Component returned a valid session
  return (
    <div className="space-y-4">
      {/* Session info banner */}
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar circle (initials) */}
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {currentUser!.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{currentUser!.name}</p>
            <p className="text-xs text-gray-500">{currentUser!.email}</p>
          </div>
        </div>

        {/* Role badge + logout */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              currentUser!.role === "admin"
                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                : "bg-blue-500/20 text-blue-400 border-blue-500/30"
            }`}
          >
            {currentUser!.role === "admin" ? "👑 admin" : "👤 user"}
          </span>

          {/* Logout button */}
          {/* In real app: onClick={() => signOut({ callbackUrl: '/' })} */}
          <button
            onClick={handleLogout}
            className="text-xs bg-white/10 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Dashboard grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Account Status", value: "Active", icon: "✅" },
          { label: "Role", value: currentUser!.role, icon: currentUser!.role === "admin" ? "👑" : "👤" },
          { label: "Session Type", value: "JWT (simulated)", icon: "🪙" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/2 p-4 text-center">
            <p className="text-xl mb-1">{icon}</p>
            <p className="text-sm font-semibold text-white capitalize">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Admin-only section */}
      {/*
       * Role-based UI: only admins see this section.
       * In a real app, the SERVER would control this with middleware (redirect non-admins),
       * not just hide/show in the client. Never rely solely on client-side role checks for security.
       * Always validate the role on the server too.
       */}
      {currentUser!.role === "admin" && (
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span>👑</span>
            <h3 className="text-sm font-semibold text-yellow-400">Admin Panel</h3>
            <span className="text-xs text-gray-600">(only visible to role: admin)</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            In a real app, the <code className="text-yellow-300">/admin</code> route would be
            guarded by middleware — non-admins would be redirected before this component renders.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Manage Users",
              "View Analytics",
              "System Settings",
              "Audit Logs",
            ].map((action) => (
              <div
                key={action}
                className="text-xs text-gray-500 border border-white/5 bg-black/20 px-3 py-2 rounded-lg"
              >
                {action}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="rounded-xl border border-white/10 bg-white/2 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
        {/*
         * In a real app, this data would come from the server:
         *   const session = await auth();
         *   const activity = await db.activity.findMany({ where: { userId: session.user.id } });
         * Then pass "activity" as a prop to this Client Component.
         */}
        <ul className="space-y-2">
          {ACTIVITY.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-xs">
              <span className="text-gray-400">
                {item.icon} {item.action}
              </span>
              <span className="text-gray-600">{item.time}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Simulated session object — what session.user looks like */}
      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">
          Simulated session object (what auth() would return):
        </p>
        <pre className="font-mono text-xs text-green-300 overflow-x-auto">
          {JSON.stringify(
            {
              user: {
                name: currentUser!.name,
                email: currentUser!.email,
                role: currentUser!.role,
                // id: "real_db_id_here"  ← added by jwt() callback in auth.ts
              },
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
