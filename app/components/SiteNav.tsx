"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const UNHEARD_PATH = "/unheard-message";
const STORAGE_KEY = "cfc-visited-unheard-message";

export function SiteNav() {
  const pathname = usePathname();
  const [showUnread, setShowUnread] = useState(false);

  useEffect(() => {
    const visited = typeof window !== "undefined" && window.sessionStorage.getItem(STORAGE_KEY) === "1";
    setShowUnread(pathname !== UNHEARD_PATH && !visited);
  }, [pathname]);

  useEffect(() => {
    if (pathname === UNHEARD_PATH && typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
      setShowUnread(false);
    }
  }, [pathname]);

  return (
    <nav
      className="pointer-events-auto fixed left-0 right-0 top-0 z-[60] flex items-center justify-end gap-6 px-5 py-4 sm:px-8"
      aria-label="Site"
    >
      <Link
        href="/"
        className="font-[family-name:var(--font-playfair)] text-[0.6rem] uppercase tracking-[0.28em] text-cfc-off-white/45 transition-colors hover:text-cfc-off-white/78"
      >
        Home
      </Link>
      <Link
        href={UNHEARD_PATH}
        className="group relative inline-flex items-center gap-2 font-[family-name:var(--font-playfair)] text-[0.6rem] uppercase tracking-[0.22em] text-cfc-off-white/55 transition-colors hover:text-cfc-cream/88"
      >
        <span className="max-w-[11rem] leading-tight sm:max-w-none">1 UNHEARD MESSAGE</span>
        {showUnread ? (
          <span
            className="cfc-unread-dot size-1.5 shrink-0 rounded-full bg-red-600/90 shadow-[0_0_10px_rgba(220,38,38,0.55)]"
            aria-hidden
          />
        ) : null}
      </Link>
    </nav>
  );
}
