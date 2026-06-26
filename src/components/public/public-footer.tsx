import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    contactCta: string;
    cta: string;
    description: string;
    language: string;
    navTitle: string;
    platformLabel: string;
    servicesText: string;
    small: string;
  }
> = {
  ht: {
    contactCta: "Kontakte Om",
    cta: "Kòmanse",
    description:
      "Digital Mission Control pou kreyatè, atis, YouTuber ak biznis reyèl ki vle plis kontwòl.",
    language: "Lang",
    navTitle: "Eksplore",
    platformLabel: "Platfòm",
    servicesText: "Sèvis, mizik, kontni, web, imaj ak operasyon dijital.",
    small: "Bati ak klète, respè ak vizyon entènasyonal.",
  },
  es: {
    contactCta: "Contactar a Om",
    cta: "Comenzar",
    description:
      "Digital Mission Control para creadores, artistas, YouTubers y negocios reales que quieren más control.",
    language: "Idioma",
    navTitle: "Explorar",
    platformLabel: "Plataforma",
    servicesText: "Servicios, música, contenido, web, imagen y operación digital.",
    small: "Construido con claridad, respeto y visión internacional.",
  },
  en: {
    contactCta: "Contact Om",
    cta: "Start",
    description:
      "Digital Mission Control for creators, artists, YouTubers and real businesses that want more control.",
    language: "Language",
    navTitle: "Explore",
    platformLabel: "Platform",
    servicesText: "Services, music, content, web, image and digital operations.",
    small: "Built with clarity, respect and international vision.",
  },
  fr: {
    contactCta: "Contacter Om",
    cta: "Commencer",
    description:
      "Digital Mission Control pour créateurs, artistes, YouTubers et vrais business qui veulent plus de contrôle.",
    language: "Langue",
    navTitle: "Explorer",
    platformLabel: "Plateforme",
    servicesText: "Services, musique, contenu, web, image et opérations digitales.",
    small: "Construit avec clarté, respect et vision internationale.",
  },
  pt: {
    contactCta: "Contactar Om",
    cta: "Começar",
    description:
      "Digital Mission Control para criadores, artistas, YouTubers e negócios reais que querem mais controle.",
    language: "Idioma",
    navTitle: "Explorar",
    platformLabel: "Plataforma",
    servicesText: "Serviços, música, conteúdo, web, imagem e operação digital.",
    small: "Construído com clareza, respeito e visão internacional.",
  },
};

export async function PublicFooter() {
  const locale = await getCurrentLocale();
  const copy = footerCopyByLocale[locale] ?? footerCopyByLocale.ht;

  return (
    <footer className="bg-background">
      <div className="public-shell border-t border-border py-12 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.9fr_1fr] lg:items-start">
          <div className="space-y-5">
            <AumProdzLogo platformLabel={copy.platformLabel} />
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
            <p className="text-base font-black">{copy.navTitle}</p>
            <p className="max-w-xs leading-6 text-muted-foreground">
              {copy.servicesText}
            </p>
            <div className="grid gap-2 pt-1">
              <Link
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="/servicios"
              >
                {t(locale, "nav.services")}
              </Link>
              <Link
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="/artista"
              >
                {t(locale, "nav.artists")}
              </Link>
              <Link
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="/youtube"
              >
                {t(locale, "nav.youtube")}
              </Link>
              <Link
                className="text-muted-foreground transition-colors hover:text-foreground"
                href="/contacto"
              >
                {t(locale, "nav.contact")}
              </Link>
            </div>
          </div>

          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className={cn(buttonVariants({ variant: "default", size: "sm" }))}
              >
                {copy.contactCta}
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="space-y-3">
              <p className="font-semibold">{copy.language}</p>
              <LanguageSwitcher compact currentLocale={locale} />
              <p className="max-w-xs leading-6 text-muted-foreground">
                {copy.small}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="public-shell pb-6">
        <div className="border-t border-border pt-5 text-center text-xs leading-6 text-muted-foreground sm:flex sm:items-center sm:justify-between sm:gap-6 sm:text-left">
          <span>Copyright {new Date().getFullYear()} AUM PRODZ.</span>
          <span>{t(locale, "footer.tagline")}</span>
        </div>
      </div>
    </footer>
  );
}
