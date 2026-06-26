"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PublicFooterSlot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideFooter =
    pathname === "/contacto" ||
    pathname === "/servicios" ||
    pathname.startsWith("/servicios/");

  if (hideFooter) {
    return null;
  }

  if (pathname !== "/") {
    return <div className="hidden sm:block">{children}</div>;
  }

  return children;
}
