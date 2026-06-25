import Link from "next/link";
import {
  BadgeCheck,
  CreditCard,
  FileSignature,
  Home,
  LifeBuoy,
  Music2,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";

const artistNav = [
  { href: "/artist", labelKey: "artistShell.home", icon: Home },
  { href: "/artist/profile", labelKey: "artistShell.profile", icon: UserRound },
  { href: "/artist/verification", labelKey: "artistShell.verification", icon: BadgeCheck },
  { href: "/artist/contract", labelKey: "artistShell.contracts", icon: FileSignature },
  { href: "/artist/releases", labelKey: "artistShell.releases", icon: Music2 },
  { href: "/artist/billing", labelKey: "artistShell.payments", icon: CreditCard },
  { href: "/artist/security", labelKey: "artistShell.security", icon: ShieldCheck },
  { href: "/artist/support", labelKey: "artistShell.support", icon: LifeBuoy },
] as const;

export async function ArtistShell({ children }: { children: React.ReactNode }) {
  const locale = await getCurrentLocale();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-border bg-card p-5 lg:flex">
        <AumProdzLogo />
        <nav className="mt-6 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pb-8 pr-1">
          {artistNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" />
                {t(locale, item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <div className="border-b border-border bg-card/70 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
            <p className="text-sm font-semibold">{t(locale, "artistShell.dashboard")}</p>
            <p className="text-xs text-muted-foreground">
              {t(locale, "artistShell.welcome")}
            </p>
            </div>
            <LanguageSwitcher compact currentLocale={locale} />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
