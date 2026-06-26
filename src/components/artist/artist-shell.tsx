import type React from "react";

import {
  ArtistShellClient,
  type ArtistNavItem,
} from "@/components/artist/artist-shell-client";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";

const artistNav = [
  { href: "/artist", labelKey: "artistShell.home", icon: "home" },
  { href: "/artist/profile", labelKey: "artistShell.profile", icon: "profile" },
  { href: "/artist/verification", labelKey: "artistShell.verification", icon: "badge" },
  { href: "/artist/releases", labelKey: "artistShell.releases", icon: "releases" },
  { href: "/artist/files", labelKey: "artistShell.files", icon: "files" },
  { href: "/artist/contract", labelKey: "artistShell.contracts", icon: "contract" },
  { href: "/artist/billing", labelKey: "artistShell.payments", icon: "billing" },
  { href: "/artist/security", labelKey: "artistShell.security", icon: "security" },
  { href: "/artist/support", labelKey: "artistShell.support", icon: "support" },
] as const;

export async function ArtistShell({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale();
  const items = artistNav.map(
    (item) =>
      ({
        href: item.href,
        icon: item.icon,
        label: t(locale, item.labelKey),
      }) satisfies ArtistNavItem,
  );

  return (
    <ArtistShellClient
      currentLocale={locale}
      items={items}
      subtitle={t(locale, "artistShell.welcome")}
      title={t(locale, "artistShell.dashboard")}
    >
      {children}
    </ArtistShellClient>
  );
}
