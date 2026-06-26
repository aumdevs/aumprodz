import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const footerCopyByLocale: Record<
  AppLocale,
  {
    admin: string;
    artistCta: string;
    cta: string;
    description: string;
    language: string;
    privateText: string;
    servicesText: string;
    small: string;
    superAdmin: string;
  }
> = {
  ht: {
    admin: "Admin Panel",
    artistCta: "AUM Artist",
    cta: "Kòmanse",
    description:
      "Digital Mission Control pou kreyatè, atis, YouTuber ak biznis reyèl ki vle plis kontwòl.",
    language: "Lang",
    privateText: "Aksè pwoteje pou operasyon, admin ak atis.",
    servicesText: "Sèvis, mizik, kontni, web, imaj ak operasyon dijital.",
    small: "Bati ak klète, respè ak vizyon entènasyonal.",
    superAdmin: "Super Admin",
  },
  es: {
    admin: "Panel Admin",
    artistCta: "AUM Artist",
    cta: "Comenzar",
    description:
      "Digital Mission Control para creadores, artistas, YouTubers y negocios reales que quieren más control.",
    language: "Idioma",
    privateText: "Accesos protegidos para operación, admin y artistas.",
    servicesText: "Servicios, música, contenido, web, imagen y operación digital.",
    small: "Construido con claridad, respeto y visión internacional.",
    superAdmin: "Super Admin",
  },
  en: {
    admin: "Admin Panel",
    artistCta: "AUM Artist",
    cta: "Start",
    description:
      "Digital Mission Control for creators, artists, YouTubers and real businesses that want more control.",
    language: "Language",
    privateText: "Protected access for operations, admin and artists.",
    servicesText: "Services, music, content, web, image and digital operations.",
    small: "Built with clarity, respect and international vision.",
    superAdmin: "Super Admin",
  },
  fr: {
    admin: "Panel Admin",
    artistCta: "AUM Artist",
    cta: "Commencer",
    description:
      "Digital Mission Control pour créateurs, artistes, YouTubers et vrais business qui veulent plus de contrôle.",
    language: "Langue",
    privateText: "Accès protégés pour opération, admin et artistes.",
    servicesText: "Services, musique, contenu, web, image et opérations digitales.",
    small: "Construit avec clarté, respect et vision internationale.",
    superAdmin: "Super Admin",
  },
  pt: {
    admin: "Painel Admin",
    artistCta: "AUM Artist",
    cta: "Começar",
    description:
      "Digital Mission Control para criadores, artistas, YouTubers e negócios reais que querem mais controle.",
    language: "Idioma",
    privateText: "Acessos protegidos para operação, admin e artistas.",
    servicesText: "Serviços, música, conteúdo, web, imagem e operação digital.",
    small: "Construído com clareza, respeito e visão internacional.",
    superAdmin: "Super Admin",
  },
};

export async function PublicFooter() {
  const locale = await getCurrentLocale();
  const copy = footerCopyByLocale[locale] ?? footerCopyByLocale.ht;

  return (
    <footer className="bg-background">
      <div className="public-shell grid gap-8 border-t border-border py-14 lg:grid-cols-[1.25fr_0.9fr_0.9fr_0.9fr]">
        <div className="space-y-5">
          <AumProdzLogo />
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
          <Link
            href="/servicios"
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          >
            {copy.cta}
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">{t(locale, "footer.platform")}</p>
          <p className="max-w-xs text-muted-foreground">{copy.servicesText}</p>
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
          <p className="max-w-xs text-muted-foreground">{copy.privateText}</p>
          <Link className="block text-muted-foreground hover:text-foreground" href="/login?next=%2Fadmin">
            <LockKeyhole className="mr-2 inline size-3.5" />
            {copy.admin}
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/login?next=%2Fsuper-admin">
            <LockKeyhole className="mr-2 inline size-3.5" />
            {copy.superAdmin}
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/login?next=%2Fartist">
            <LockKeyhole className="mr-2 inline size-3.5" />
            {copy.artistCta}
          </Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="font-semibold">{copy.language}</p>
          <LanguageSwitcher compact currentLocale={locale} />
          <p className="max-w-xs text-muted-foreground">{copy.small}</p>
        </div>
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-xs text-muted-foreground">
        Copyright {new Date().getFullYear()} AUM PRODZ.{" "}
        {t(locale, "footer.tagline")}
      </div>
    </footer>
  );
}
