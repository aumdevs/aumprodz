import Link from "next/link";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { getCurrentLocale, getRequestPathname } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";

export async function PublicFooter() {
  const [pathname, locale] = await Promise.all([
    getRequestPathname(),
    getCurrentLocale(),
  ]);

  if (pathname.startsWith("/servicios")) {
    return null;
  }

  return (
    <footer className="premium-grid border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <AumProdzLogo />
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            {t(locale, "footer.tagline")}
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">{t(locale, "footer.platform")}</p>
          <Link className="block text-muted-foreground hover:text-foreground" href="/servicios">
            {t(locale, "nav.services")}
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/artista">
            {t(locale, "nav.artists")}
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/youtube">
            {t(locale, "nav.youtube")}
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/contacto">
            {t(locale, "nav.contact")}
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">{t(locale, "footer.private")}</p>
          <Link className="block text-muted-foreground hover:text-foreground" href="/login?next=%2Fadmin">
            Admin Panel
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/login?next=%2Fsuper-admin">
            Super Admin
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/login?next=%2Fartist">
            Artist Dashboard
          </Link>
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground">
        {t(locale, "footer.tagline")}
      </div>
    </footer>
  );
}
