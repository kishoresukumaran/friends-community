"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type AuthContextValue = {
  unlocked: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Lets any descendant (e.g. the nav's Logout button) read the unlock state
// and end the session. Returns null-safe defaults outside a provider.
export function useAuth(): AuthContextValue {
  return useContext(AuthContext) ?? { unlocked: false, logout: () => {} };
}

// Shared group password. This is a low-stakes, client-side gate for a public
// friend-group page (not real authentication) — the value ships to the client.
const GROUP_PASSWORD = "PR2031";
// Stores the unlock expiry timestamp (ms since epoch) rather than a boolean,
// so the session naturally lapses after SESSION_MS.
const STORAGE_KEY = "fc-unlock-expiry";
// How long an unlock lasts before the password is required again (7 days).
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export default function PasswordGate({ children }: { children: ReactNode }) {
  // The admin area has its own server-side login, so it must not sit behind the
  // casual group-password gate.
  const pathname = usePathname();
  const bypass = pathname?.startsWith("/admin") ?? false;

  // Start locked + not-yet-hydrated so server and first client render match.
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const expiry = raw ? Number(raw) : 0;
      if (expiry > Date.now()) {
        setUnlocked(true);
      } else if (raw) {
        // Expired — clean up the stale entry.
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage may be unavailable; just stay locked.
    }
    setReady(true);
  }, []);

  // While unlocked, re-lock automatically once the session expires, even if the
  // tab stays open the whole time. A single timer keeps this efficient.
  useEffect(() => {
    if (!unlocked) return;
    let remaining = SESSION_MS;
    try {
      const expiry = Number(localStorage.getItem(STORAGE_KEY));
      if (expiry) remaining = expiry - Date.now();
    } catch {
      // ignore read failures and fall back to the full session length
    }
    if (remaining <= 0) {
      setUnlocked(false);
      return;
    }
    const timer = setTimeout(() => setUnlocked(false), remaining);
    return () => clearTimeout(timer);
  }, [unlocked]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore removal failures
    }
    setValue("");
    setError(false);
    setUnlocked(false);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim() === GROUP_PASSWORD) {
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now() + SESSION_MS));
      } catch {
        // ignore persistence failures
      }
      setValue("");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  }

  const showOverlay = ready && !unlocked && !bypass;

  return (
    <AuthContext.Provider value={{ unlocked, logout }}>
      {/* Landing page sits behind; blur it while the gate is shown. */}
      <div
        className={
          showOverlay ? "pointer-events-none select-none blur-md" : ""
        }
        aria-hidden={showOverlay}
      >
        {children}
      </div>

      {showOverlay && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-ink/70 p-4 backdrop-blur-xl">
          <form
            onSubmit={handleSubmit}
            className={`w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center shadow-pop backdrop-blur-md sm:p-8 ${
              error ? "animate-[wiggle_0.4s_ease-in-out]" : ""
            }`}
          >
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-green to-grape text-2xl shadow-pop">
              🤝
            </span>
            <h1 className="mt-4 font-display text-2xl font-extrabold text-white">
              Friends<span className="text-brand-green">Community</span>
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Enter the group password to come on in 🔐
            </p>

            <input
              type="password"
              inputMode="text"
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(false);
              }}
              placeholder="Group password"
              aria-label="Group password"
              aria-invalid={error}
              className={`mt-6 w-full rounded-2xl border bg-white/5 px-4 py-3 text-center text-lg font-semibold tracking-widest text-white placeholder:tracking-normal placeholder:text-white/30 focus:outline-none focus:ring-2 ${
                error
                  ? "border-sunset/60 focus:ring-sunset/50"
                  : "border-white/15 focus:ring-brand-green/60"
              }`}
            />

            {error && (
              <p className="mt-2 text-sm font-semibold text-sunset">
                Nope, that&apos;s not it. Ask the group 😅
              </p>
            )}

            <button
              type="submit"
              className="mt-5 w-full rounded-full bg-brand-green px-5 py-3 font-semibold text-ink shadow-pop transition hover:brightness-110"
            >
              Let me in →
            </button>
          </form>
        </div>
      )}
    </AuthContext.Provider>
  );
}
