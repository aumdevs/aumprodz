import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AumProdzLogo } from "@/components/brand/aum-prodz-logo";
import { buttonVariants } from "@/components/ui/button";
import { getWhatsAppNumber } from "@/lib/env";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type FooterCopy = {
  contactCta: string;
  description: string;
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
  socialTitle: string;
  startCta: string;
  supportText: string;
  whatsappMessage: string;
};

const footerCopyByLocale: Record<AppLocale, FooterCopy> = {
  ht: {
    contactCta: "Pale ak AUM sou WhatsApp",
    description:
      "Sèvis dijital, kontni, mizik, web ak zouti pratik pou kominote ayisyèn nan.",
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
    socialTitle: "Rezo AUM PRODZ",
    startCta: "Kòmanse",
    supportText: "Pou sèvis, kesyon, peman oswa swivi pwojè, pale ak AUM sou WhatsApp.",
    whatsappMessage: "Bonjou AUM, mwen vle pale ak ou sou WhatsApp.",
  },
  es: {
    contactCta: "Hablar con AUM por WhatsApp",
    description:
      "Servicios digitales, contenido, música, web y herramientas prácticas para la comunidad haitiana.",
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
    socialTitle: "Redes de AUM PRODZ",
    startCta: "Comenzar",
    supportText: "Para servicios, dudas, pagos o seguimiento, habla con AUM por WhatsApp.",
    whatsappMessage: "Hola AUM, quiero hablar contigo por WhatsApp.",
  },
  en: {
    contactCta: "Talk to AUM on WhatsApp",
    description:
      "Digital services, content, music, web and practical tools for the Haitian community.",
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
    socialTitle: "AUM PRODZ socials",
    startCta: "Start",
    supportText: "For services, questions, payments or project follow-up, talk to AUM on WhatsApp.",
    whatsappMessage: "Hi AUM, I want to talk to you on WhatsApp.",
  },
  fr: {
    contactCta: "Parler avec AUM sur WhatsApp",
    description:
      "Services digitaux, contenu, musique, web et outils pratiques pour la communauté haïtienne.",
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
    socialTitle: "Réseaux AUM PRODZ",
    startCta: "Commencer",
    supportText: "Pour les services, questions, paiements ou suivis, parlez avec AUM sur WhatsApp.",
    whatsappMessage: "Bonjour AUM, je veux parler avec vous sur WhatsApp.",
  },
  pt: {
    contactCta: "Falar com AUM pelo WhatsApp",
    description:
      "Serviços digitais, conteúdo, música, web e ferramentas práticas para a comunidade haitiana.",
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
    socialTitle: "Redes da AUM PRODZ",
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
  const socialLinks = [
    {
      href: "https://www.youtube.com/@aumprodz7298/videos",
      icon: YouTubeLogo,
      label: "YouTube",
    },
    {
      href: "https://www.instagram.com/aumprodz/",
      icon: InstagramLogo,
      label: "Instagram",
    },
    {
      href: "https://www.tiktok.com/@aumprodz",
      icon: TikTokLogo,
      label: "TikTok",
    },
    {
      href: "https://www.facebook.com/aumprodz",
      icon: FacebookLogo,
      label: "Facebook",
    },
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

              <div className="space-y-3 pt-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                  {copy.socialTitle}
                </p>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;

                    return (
                      <Link
                        key={social.href}
                        aria-label={social.label}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-black text-foreground shadow-sm transition-colors hover:border-primary/35 hover:bg-background"
                        href={social.href}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Icon className="size-4" />
                        {social.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
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
                    "whatsapp-cta-button w-fit shrink-0",
                  )}
                >
                  {copy.contactCta}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-7 border-t border-border pt-5 text-sm text-muted-foreground">
            <p className="leading-6">
              Copyright {year} AUM PRODZ. {copy.rights}
            </p>
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

function YouTubeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#ff0033"
        d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1C2 9.1 2 12 2 12s0 2.9.4 4.8a3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1c.4-1.9.4-4.8.4-4.8s0-2.9-.4-4.8Z"
      />
      <path fill="#fff" d="m10 15.5 5.2-3.5L10 8.5v7Z" />
    </svg>
  );
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="footer-instagram-gradient" x1="2" x2="22" y1="22" y2="2">
          <stop stopColor="#feda75" />
          <stop offset=".35" stopColor="#fa7e1e" />
          <stop offset=".62" stopColor="#d62976" />
          <stop offset="1" stopColor="#4f5bd5" />
        </linearGradient>
      </defs>
      <rect
        width="17"
        height="17"
        x="3.5"
        y="3.5"
        rx="5"
        fill="none"
        stroke="url(#footer-instagram-gradient)"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="url(#footer-instagram-gradient)" strokeWidth="2" />
      <circle cx="16.9" cy="7.1" r="1.2" fill="#d62976" />
    </svg>
  );
}

function TikTokLogo({ className }: { className?: string }) {
  return (
    <svg className={cn("dark-visible-logo", className)} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#25f4ee"
        d="M14.7 3.5c.4 2.3 1.8 3.7 4.2 3.9v3a7 7 0 0 1-4.1-1.3v5.8c0 3-2 5.2-5.1 5.2a4.9 4.9 0 0 1-5-4.9c0-3 2.3-5 5.4-5 .4 0 .7 0 1 .1v3.3a2.4 2.4 0 0 0-1.1-.2 1.8 1.8 0 1 0 1.8 1.8V3.5h2.9Z"
        opacity=".7"
      />
      <path
        fill="#fe2c55"
        d="M15.6 3.5c.4 2.3 1.8 3.7 4.2 3.9v3a7 7 0 0 1-4.1-1.3v5.8c0 3-2 5.2-5.1 5.2a4.9 4.9 0 0 1-5-4.9c0-3 2.3-5 5.4-5 .4 0 .7 0 1 .1v3.3a2.4 2.4 0 0 0-1.1-.2 1.8 1.8 0 1 0 1.8 1.8V3.5h2.9Z"
        opacity=".85"
      />
      <path
        data-dark-visible-fill
        fill="#111"
        d="M15.1 3.5c.4 2.3 1.8 3.7 4.2 3.9v3a7 7 0 0 1-4.1-1.3v5.8c0 3-2 5.2-5.1 5.2a4.9 4.9 0 0 1-5-4.9c0-3 2.3-5 5.4-5 .4 0 .7 0 1 .1v3.3a2.4 2.4 0 0 0-1.1-.2 1.8 1.8 0 1 0 1.8 1.8V3.5h2.9Z"
      />
    </svg>
  );
}

function FacebookLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#1877f2" />
      <path
        fill="#fff"
        d="M14.5 13h-1.8v6h-2.5v-6H8.9v-2.2h1.3V9.4c0-1 .3-1.8.9-2.4.6-.6 1.5-.9 2.6-.9.8 0 1.4.1 1.7.2v2h-1.2c-.5 0-.9.1-1.1.3-.2.2-.3.6-.3 1v1.2h2.4L14.5 13Z"
      />
    </svg>
  );
}
