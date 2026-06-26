import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { buttonVariants } from "@/components/ui/button";
import { getWhatsAppNumber } from "@/lib/env";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type FooterCopy = {
  contactCta: string;
  description: string;
  language: string;
  legal: {
    cookies: string;
    notice: string;
    privacy: string;
    refunds: string;
    terms: string;
    title: string;
  };
  navTitle: string;
  platformLabel: string;
  rights: string;
  small: string;
  startCta: string;
  supportText: string;
  whatsappMessage: string;
};

const footerCopyByLocale: Record<AppLocale, FooterCopy> = {
  ht: {
    contactCta: "Pale ak AUM sou WhatsApp",
    description:
      "Sèvis dijital, kontni, mizik, web ak zouti pratik pou kominote ayisyèn nan.",
    language: "Lang",
    legal: {
      cookies: "Cookies",
      notice: "Avi legal",
      privacy: "Konfidansyalite",
      refunds: "Ranbousman",
      terms: "Tèm sèvis",
      title: "Legal",
    },
    navTitle: "Eksplore",
    platformLabel: "Platfòm",
    rights: "Tout dwa rezève.",
    small: "Travay klè, dosye pwòp ak kominikasyon dirèk.",
    startCta: "Kòmanse",
    supportText: "Pou sèvis, kesyon, peman oswa swivi pwojè, pale ak AUM sou WhatsApp.",
    whatsappMessage: "Bonjou AUM, mwen vle pale ak ou sou WhatsApp.",
  },
  es: {
    contactCta: "Hablar con AUM por WhatsApp",
    description:
      "Servicios digitales, contenido, música, web y herramientas prácticas para la comunidad haitiana.",
    language: "Idioma",
    legal: {
      cookies: "Cookies",
      notice: "Aviso legal",
      privacy: "Privacidad",
      refunds: "Reembolsos",
      terms: "Términos",
      title: "Legal",
    },
    navTitle: "Explorar",
    platformLabel: "Plataforma",
    rights: "Todos los derechos reservados.",
    small: "Trabajo claro, archivos ordenados y comunicación directa.",
    startCta: "Comenzar",
    supportText: "Para servicios, dudas, pagos o seguimiento, habla con AUM por WhatsApp.",
    whatsappMessage: "Hola AUM, quiero hablar contigo por WhatsApp.",
  },
  en: {
    contactCta: "Talk to AUM on WhatsApp",
    description:
      "Digital services, content, music, web and practical tools for the Haitian community.",
    language: "Language",
    legal: {
      cookies: "Cookies",
      notice: "Legal notice",
      privacy: "Privacy",
      refunds: "Refunds",
      terms: "Terms",
      title: "Legal",
    },
    navTitle: "Explore",
    platformLabel: "Platform",
    rights: "All rights reserved.",
    small: "Clear work, organized files and direct communication.",
    startCta: "Start",
    supportText: "For services, questions, payments or project follow-up, talk to AUM on WhatsApp.",
    whatsappMessage: "Hi AUM, I want to talk to you on WhatsApp.",
  },
  fr: {
    contactCta: "Parler avec AUM sur WhatsApp",
    description:
      "Services digitaux, contenu, musique, web et outils pratiques pour la communauté haïtienne.",
    language: "Langue",
    legal: {
      cookies: "Cookies",
      notice: "Mentions légales",
      privacy: "Confidentialité",
      refunds: "Remboursements",
      terms: "Conditions",
      title: "Legal",
    },
    navTitle: "Explorer",
    platformLabel: "Plateforme",
    rights: "Tous droits réservés.",
    small: "Travail clair, fichiers organisés et communication directe.",
    startCta: "Commencer",
    supportText: "Pour les services, questions, paiements ou suivis, parlez avec AUM sur WhatsApp.",
    whatsappMessage: "Bonjour AUM, je veux parler avec vous sur WhatsApp.",
  },
  pt: {
    contactCta: "Falar com AUM pelo WhatsApp",
    description:
      "Serviços digitais, conteúdo, música, web e ferramentas práticas para a comunidade haitiana.",
    language: "Idioma",
    legal: {
      cookies: "Cookies",
      notice: "Aviso legal",
      privacy: "Privacidade",
      refunds: "Reembolsos",
      terms: "Termos",
      title: "Legal",
    },
    navTitle: "Explorar",
    platformLabel: "Plataforma",
    rights: "Todos os direitos reservados.",
    small: "Trabalho claro, arquivos organizados e comunicação direta.",
    startCta: "Começar",
    supportText: "Para serviços, dúvidas, pagamentos ou acompanhamento, fale com AUM pelo WhatsApp.",
    whatsappMessage: "Olá AUM, quero falar com você pelo WhatsApp.",
  },
};

export async function PublicFooter() {
  const locale = await getCurrentLocale();
  const copy = footerCopyByLocale[locale] ?? footerCopyByLocale.ht;
  const year = new Date().getFullYear();
  const whatsappHref = buildWhatsappHref(copy.whatsappMessage);
  const navLinks = [
    { href: "/", label: t(locale, "nav.home") },
    { href: "/servicios", label: t(locale, "nav.services") },
    { href: "/youtube", label: t(locale, "nav.youtube") },
    { href: "/artista", label: t(locale, "nav.artists") },
    { href: "/contacto", label: t(locale, "nav.contact") },
  ];
  const legalLinks = [
    { href: "/legal/terminos", label: copy.legal.terms },
    { href: "/legal/privacidad", label: copy.legal.privacy },
    { href: "/legal/reembolsos", label: copy.legal.refunds },
    { href: "/legal/aviso", label: copy.legal.notice },
    { href: "/legal/cookies", label: copy.legal.cookies },
  ];

  return (
    <footer className="bg-background">
      <div className="public-shell py-10 sm:py-14">
        <div className="rounded-[2rem] border border-border bg-surface/70 p-5 shadow-soft sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.65fr] lg:items-start">
            <div className="space-y-5">
              <AumProdzLogo platformLabel={copy.platformLabel} />
              <p className="max-w-sm text-base font-medium leading-7 text-muted-foreground">
                {copy.description}
              </p>
              <Link
                href="/servicios"
                className={cn(buttonVariants({ variant: "default", size: "sm" }))}
              >
                {copy.startCta}
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="space-y-7">
              <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:gap-x-10">
                <FooterLinkGroup links={navLinks} title={copy.navTitle} />
                <FooterLinkGroup links={legalLinks} title={copy.legal.title} />
              </div>

              <div className="flex flex-col gap-4 rounded-[1.25rem] border border-border bg-background/45 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                    {t(locale, "nav.contact")}
                  </p>
                  <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                    {copy.supportText}
                  </p>
                </div>

                <Link
                  href={whatsappHref}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    "w-fit shrink-0 bg-[#25d366] text-white shadow-[0_18px_42px_rgba(37,211,102,0.24)] hover:bg-[#1fbd5a]",
                  )}
                >
                  {copy.contactCta}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 border-t border-border pt-5 text-sm text-muted-foreground sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6">
            <p className="leading-6">
              Copyright {year} AUM PRODZ. {copy.rights}
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:justify-end">
              <p className="max-w-md leading-6 sm:text-right">{copy.small}</p>
              <div className="flex items-center gap-2">
                <span className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-foreground">
                  {copy.language}
                </span>
                <LanguageSwitcher compact currentLocale={locale} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function buildWhatsappHref(message: string) {
  const number = getWhatsAppNumber()?.replace(/\D/g, "");

  if (!number || number.length < 8) {
    return "/contacto";
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function FooterLinkGroup({
  links,
  title,
}: {
  links: Array<{ href: string; label: string }>;
  title: string;
}) {
  return (
    <nav className="space-y-3" aria-label={title}>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
        {title}
      </p>
      <div className="grid gap-2.5">
        {links.map((link) => (
          <Link
            key={link.href}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
