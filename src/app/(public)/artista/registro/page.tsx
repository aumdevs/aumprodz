import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { ArtistRegisterForm } from "./register-form";

export const metadata = {
  title: "Crear Cuenta Artista",
  description:
    "Registro público de artista AUM PRODZ con pago anual por Stripe.",
};

const pageCopyByLocale: Record<
  AppLocale,
  {
    back: string;
    badge: string;
    title: string;
    description: string;
    checklist: string[];
    existingPrefix: string;
    existingLink: string;
    existingSuffix: string;
    cardTitle: string;
  }
> = {
  ht: {
    back: "Retounen sou Atis",
    badge: "Kont atis",
    title: "Kreye kont ou epi aktive aksè anyèl ou.",
    description:
      "Ranpli enfòmasyon ou, kreye aksè prive ou epi kontinye sou peman sekirize Stripe. Lè peman an fini, ou antre nan dashboard la pou voye lansman ou yo.",
    checklist: [
      "Manm anyèl atis: $99 USD.",
      "Yon single enkli pandan kont lan aktif.",
      "EP ak albòm peye kòm plas adisyonèl nan dashboard la.",
      "Chak lansman ale nan revizyon anvan piblikasyon.",
    ],
    existingPrefix: "Si ou deja gen kont, ",
    existingLink: "antre nan dashboard la isit la",
    existingSuffix: ".",
    cardTitle: "Kreye kont",
  },
  es: {
    back: "Volver a Artistas",
    badge: "Cuenta artista",
    title: "Crea tu cuenta y activa tu acceso anual.",
    description:
      "Completa tus datos, crea tu acceso privado y sigue al pago seguro de Stripe. Al terminar el pago entrarás al dashboard para subir tus lanzamientos.",
    checklist: [
      "Membresía anual artista: $99 USD.",
      "Single incluido mientras la cuenta esté activa.",
      "EP y álbum se pagan como cupos adicionales desde el dashboard.",
      "Cada lanzamiento queda en revisión antes de publicación.",
    ],
    existingPrefix: "Si ya tienes cuenta, ",
    existingLink: "entra al dashboard aquí",
    existingSuffix: ".",
    cardTitle: "Crear cuenta",
  },
  en: {
    back: "Back to Artists",
    badge: "Artist account",
    title: "Create your account and activate annual access.",
    description:
      "Complete your details, create private access and continue to secure Stripe payment. After payment, you will enter the dashboard to submit releases.",
    checklist: [
      "Annual artist membership: $99 USD.",
      "One single included while the account is active.",
      "EP and album slots are paid separately from the dashboard.",
      "Every release is reviewed before publication.",
    ],
    existingPrefix: "Already have an account? ",
    existingLink: "Enter the dashboard here",
    existingSuffix: ".",
    cardTitle: "Create account",
  },
  fr: {
    back: "Retour aux artistes",
    badge: "Compte artiste",
    title: "Créez votre compte et activez votre accès annuel.",
    description:
      "Complétez vos informations, créez votre accès privé et continuez vers le paiement sécurisé Stripe. Après le paiement, vous entrerez dans le dashboard pour envoyer vos sorties.",
    checklist: [
      "Abonnement artiste annuel: $99 USD.",
      "Un single inclus pendant que le compte est actif.",
      "EP et album sont payés comme places additionnelles depuis le dashboard.",
      "Chaque sortie passe en révision avant publication.",
    ],
    existingPrefix: "Si vous avez déjà un compte, ",
    existingLink: "entrez dans le dashboard ici",
    existingSuffix: ".",
    cardTitle: "Créer un compte",
  },
  pt: {
    back: "Voltar para Artistas",
    badge: "Conta de artista",
    title: "Crie sua conta e ative seu acesso anual.",
    description:
      "Preencha seus dados, crie seu acesso privado e siga para o pagamento seguro da Stripe. Ao terminar o pagamento, você entra no dashboard para enviar lançamentos.",
    checklist: [
      "Assinatura anual de artista: $99 USD.",
      "Um single incluído enquanto a conta estiver ativa.",
      "EP e álbum são pagos como vagas adicionais no dashboard.",
      "Cada lançamento fica em revisão antes da publicação.",
    ],
    existingPrefix: "Se você já tem conta, ",
    existingLink: "entre no dashboard aqui",
    existingSuffix: ".",
    cardTitle: "Criar conta",
  },
};

export default async function ArtistRegisterPage() {
  const locale = await getCurrentLocale();
  const copy = pageCopyByLocale[locale] ?? pageCopyByLocale.ht;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <PublicEventTracker
        eventName="artist_pricing_view"
        page="/artista/registro"
        service="artista"
        source="artist_signup"
      />
      <Link
        href="/artista"
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <ArrowLeft className="size-4" />
        {copy.back}
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-6">
          <Badge tone="accent">{copy.badge}</Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-normal sm:text-5xl">
              {copy.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              {copy.description}
            </p>
          </div>

          <div className="grid gap-3">
            {copy.checklist.map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-md border border-border bg-card p-4 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </div>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {copy.existingPrefix}
            <Link href="/login?next=%2Fartist" className="font-semibold text-primary">
              {copy.existingLink}
            </Link>
            {copy.existingSuffix}
          </p>
        </div>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>{copy.cardTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ArtistRegisterForm locale={locale} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
