"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PublicFooterSlot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideFooter =
    pathname === "/servicios" || pathname.startsWith("/servicios/");

  return hideFooter ? null : children;
}
