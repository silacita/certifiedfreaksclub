"use client";

import type { ReactNode } from "react";

import { GlobalDistantPhoneRing } from "./GlobalDistantPhoneRing";
import { SiteNav } from "./SiteNav";

export function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <>
      <GlobalDistantPhoneRing />
      <SiteNav />
      {children}
    </>
  );
}
