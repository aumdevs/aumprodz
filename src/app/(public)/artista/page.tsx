import {
  ArrowRight,
  CheckCircle2,
  FileSignature,
  Headphones,
  Megaphone,
  Music2,
} from "lucide-react";

import {
  PublicEventTracker,
  TrackedLink,
} from "@/components/public/public-event-tracker";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dictionaries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

type ArtistPageCopy = {
  accessTitle: string;
  checklist: string[];
  infoBox: string;
  reviewItems: Array<{ icon: typeof Headphones; label: string }>;
  valueCards: Array<{
    description: string;
    icon: typeof Music2;
    title: string;
  }>;
};

const artistPageCopyByLocale: Record<AppLocale, ArtistPageCopy> = {
  ht: {
    accessTitle: "Aksè atis",
    checklist: [
      "Pwofil atis prive ak done ou ak kontak prensipal la.",
      "Lansman chante, videyo, EP ak album òganize pa eta.",
      "Chajman fichye, lyen ekstèn ak revizyon entèn AUM PRODZ.",
      "Kontra, sipò ak swivi operasyon an depi dashboard ou.",
    ],
    infoBox:
      "Platfòm nan pa sèlman yon fòm: se sant kote karyè atistik ou òganize ak done reyèl ak swivi.",
    reviewItems: [
      { icon: Headphones, label: "Mizik ak videyo an revizyon" },
      { icon: FileSignature, label: "Siyati ak otorizasyon legal" },
      { icon: Megaphone, label: "Pwomosyon konekte ak lansman an" },
    ],
    valueCards: [
      {
        icon: Music2,
        title: "Lansman òganize",
        description:
          "Voye chante, videyo, portada ak done lansman an san pèdi lòd. Chak pyès rete konekte ak kont ou.",
      },
      {
        icon: Megaphone,
        title: "Pwomosyon atistik",
        description:
          "Lè ou gen yon nouvo chante, ou ka prepare sipò pwomosyon pou deplase lansman an ak pi bon direksyon.",
      },
    ],
  },
  es: {
    accessTitle: "Acceso del artista",
    checklist: [
      "Perfil artístico privado con tus datos y contacto principal.",
      "Lanzamientos de canciones, videos, EP y álbumes organizados por estado.",
      "Carga de archivos, links externos y revisión interna por AUM PRODZ.",
      "Contratos, soporte y seguimiento de la operación desde tu dashboard.",
    ],
    infoBox:
      "La plataforma no es solo un formulario: es el centro donde tu carrera artística se organiza con datos reales y seguimiento.",
    reviewItems: [
      { icon: Headphones, label: "Música y videos en revisión" },
      { icon: FileSignature, label: "Firma y autorización legal" },
      { icon: Megaphone, label: "Promoción conectada al lanzamiento" },
    ],
    valueCards: [
      {
        icon: Music2,
        title: "Lanzamientos organizados",
        description:
          "Envía canciones, videos, portadas y datos del lanzamiento sin perder el orden. Cada pieza queda conectada a tu cuenta.",
      },
      {
        icon: Megaphone,
        title: "Promoción artística",
        description:
          "Cuando tengas una nueva canción, puedes preparar apoyo de promoción para mover el lanzamiento con mejor dirección.",
      },
    ],
  },
  en: {
    accessTitle: "Artist access",
    checklist: [
      "Private artist profile with your data and main contact.",
      "Songs, videos, EPs and albums organized by status.",
      "File uploads, external links and internal AUM PRODZ review.",
      "Contracts, support and operation tracking from your dashboard.",
    ],
    infoBox:
      "The platform is not only a form: it is the center where your artist career is organized with real data and follow-up.",
    reviewItems: [
      { icon: Headphones, label: "Music and videos in review" },
      { icon: FileSignature, label: "Signature and legal authorization" },
      { icon: Megaphone, label: "Promotion connected to the release" },
    ],
    valueCards: [
      {
        icon: Music2,
        title: "Organized releases",
        description:
          "Send songs, videos, covers and release data without losing order. Every piece stays connected to your account.",
      },
      {
        icon: Megaphone,
        title: "Artist promotion",
        description:
          "When you have a new song, you can prepare promotion support to move the release with better direction.",
      },
    ],
  },
  fr: {
    accessTitle: "Accès artiste",
    checklist: [
      "Profil artiste privé avec vos données et contact principal.",
      "Sorties de chansons, vidéos, EP et albums organisées par statut.",
      "Chargement de fichiers, liens externes et révision interne AUM PRODZ.",
      "Contrats, support et suivi de l'opération depuis votre dashboard.",
    ],
    infoBox:
      "La plateforme n'est pas seulement un formulaire: c'est le centre où votre carrière artistique s'organise avec données réelles et suivi.",
    reviewItems: [
      { icon: Headphones, label: "Musique et vidéos en révision" },
      { icon: FileSignature, label: "Signature et autorisation légale" },
      { icon: Megaphone, label: "Promotion connectée à la sortie" },
    ],
    valueCards: [
      {
        icon: Music2,
        title: "Sorties organisées",
        description:
          "Envoyez chansons, vidéos, pochettes et données de sortie sans perdre l'ordre. Chaque pièce reste connectée à votre compte.",
      },
      {
        icon: Megaphone,
        title: "Promotion artistique",
        description:
          "Quand vous avez une nouvelle chanson, vous pouvez préparer un support de promotion pour avancer avec plus de direction.",
      },
    ],
  },
  pt: {
    accessTitle: "Acesso do artista",
    checklist: [
      "Perfil artístico privado com seus dados e contato principal.",
      "Lançamentos de músicas, vídeos, EPs e álbuns organizados por status.",
      "Envio de arquivos, links externos e revisão interna da AUM PRODZ.",
      "Contratos, suporte e acompanhamento da operação pelo dashboard.",
    ],
    infoBox:
      "A plataforma não é apenas um formulário: é o centro onde sua carreira artística se organiza com dados reais e acompanhamento.",
    reviewItems: [
      { icon: Headphones, label: "Música e vídeos em revisão" },
      { icon: FileSignature, label: "Assinatura e autorização legal" },
      { icon: Megaphone, label: "Promoção conectada ao lançamento" },
    ],
    valueCards: [
      {
        icon: Music2,
        title: "Lançamentos organizados",
        description:
          "Envie músicas, vídeos, capas e dados do lançamento sem perder a ordem. Cada peça fica conectada à sua conta.",
      },
      {
        icon: Megaphone,
        title: "Promoção artística",
        description:
          "Quando tiver uma nova música, você pode preparar apoio de promoção para mover o lançamento com melhor direção.",
      },
    ],
  },
};

export const metadata = {
  title: "ARTISTA",
  description:
    "Cuenta anual para artistas de AUM PRODZ con verificación, contrato, dashboard privado y operación de lanzamientos.",
};

export default async function ArtistLandingPage() {
  const locale = await getCurrentLocale();
  const copy = artistPageCopyByLocale[locale] ?? artistPageCopyByLocale.ht;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <PublicEventTracker
        eventName="artist_pricing_view"
        page="/artista"
        service="artista"
        source="artist_page"
      />
      <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          <Badge tone="accent">{t(locale, "artistLanding.badge")}</Badge>
          <div className="space-y-5">
            <h1 className="text-4xl font-black tracking-normal sm:text-6xl">
              {t(locale, "artistLanding.title")}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {t(locale, "artistLanding.description")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <TrackedLink
              href="/artista/registro"
              eventName="artist_checkout_click"
              page="/artista"
              service="artista"
              source="artist_page"
              placement="primary_create_account"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              {t(locale, "artistLanding.create")}
              <ArrowRight className="size-5" />
            </TrackedLink>
            <TrackedLink
              href="/login?next=%2Fartist"
              eventName="artist_checkout_click"
              page="/artista"
              service="artista"
              source="artist_page"
              placement="existing_artist_login"
              className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
            >
              {t(locale, "artistLanding.login")}
              <ArrowRight className="size-5" />
            </TrackedLink>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {copy.valueCards.map(({ description, icon: Icon, title }) => (
              <Card key={title}>
              <CardHeader>
                  <Icon className="size-6 text-primary" />
                  <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
        <Card className="self-start">
          <CardHeader>
            <CardTitle>{copy.accessTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {copy.checklist.map((item) => (
              <p key={item} className="flex gap-3 text-sm leading-6">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </p>
            ))}
            <div className="grid gap-3 pt-2">
              {copy.reviewItems.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-md border border-border bg-background p-3 text-sm font-semibold"
                >
                  <Icon className="size-4 text-primary" />
                  {label}
                </div>
              ))}
            </div>
            <div className="rounded-md border border-border bg-muted p-4 text-sm leading-6 text-muted-foreground">
              {copy.infoBox}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
