"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { SiteNav } from "./SiteNav";

const IMMERSIVE_PATHS = ["/", "/hotel"];

export function ClientRoot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isImmersive = IMMERSIVE_PATHS.includes(pathname);

  return (
    <>
      {!isImmersive ? <SiteNav /> : null}
      {children}
    </>
  );
}
