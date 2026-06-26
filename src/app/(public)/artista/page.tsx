import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSignature,
  Headphones,
  LayoutDashboard,
  LockKeyhole,
  Music2,
  UploadCloud,
  UserPlus,
} from "lucide-react";

import {
  PublicEventTracker,
  TrackedLink,
} from "@/components/public/public-event-tracker";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppLocale } from "@/lib/i18n/config";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

type IconComponent = typeof Music2;

type ArtistPageCopy = {
  badge: string;
  checklist: string[];
  create: string;
  dashboardText: string;
  dashboardTitle: string;
  description: string;
  finalText: string;
  finalTitle: string;
  introCards: Array<{ icon: IconComponent; label: string; text: string }>;
  login: string;
  note: string;
  process: Array<{ icon: IconComponent; title: string; text: string }>;
  processTitle: string;
  title: string;
};

const artistPageCopyByLocale: Record<AppLocale, ArtistPageCopy> = {
  ht: {
    badge: "Aum Artist",
    checklist: [
      "Pwofil atis ou, kontak, done prensipal ak eta kont lan.",
      "Lansman chante, videyo, EP ak album ak tout fichye ki mache ak yo.",
      "Kontra, verifikasyon, peman, sipò ak swivi pwojè yo.",
      "Kominikasyon pi klè pou konnen sa ki fini ak sa ki rete pou fèt.",
    ],
    create: "Kreye kont atis",
    dashboardText:
      "Dashboard la se kote atis la antre apre li gen kont. Se la pwofil, fichye, kontra, peman, lansman ak sipò rete òganize.",
    dashboardTitle: "Ki sa ki anndan dashboard atis la?",
    description:
      "Aum Artist se espas AUM PRODZ prepare pou atis ki bezwen òganize karyè yo ak plis lòd: pwofil, fichye, mizik, videyo, kontra, peman ak lansman.",
    finalText:
      "Si ou poko gen kont, kreye kont atis la. Si ou deja atis sou platfòm nan, antre nan dashboard la ak aksè ou.",
    finalTitle: "Pare pou antre nan espas atis la?",
    introCards: [
      {
        icon: Music2,
        label: "Karyè mizikal",
        text: "Yon espas pou mete chante, videyo ak lansman yo an lòd.",
      },
      {
        icon: UploadCloud,
        label: "Fichye pwòp",
        text: "Portada, audio, videyo, dokiman ak lyen yo rete konekte.",
      },
      {
        icon: FileSignature,
        label: "Kontra ak swivi",
        text: "Otorizasyon, estati ak mesaj yo pa pèdi nan diskisyon.",
      },
    ],
    login: "Mwen deja atis: antre nan dashboard la",
    note: "Bouton Aum Artist anlè a mennen isit la; koneksyon an fèt sèlman ak bouton dashboard la.",
    processTitle: "Kijan Aum Artist fonksyone",
    process: [
      {
        icon: UserPlus,
        title: "1. Ou kreye kont la",
        text: "Ou antre enfòmasyon atis la epi ou aktive aksè a pou dashboard prive a.",
      },
      {
        icon: ClipboardCheck,
        title: "2. Nou mete done yo an lòd",
        text: "Pwofil, kontak, dokiman ak fichye yo òganize pou travay la klè.",
      },
      {
        icon: Headphones,
        title: "3. Ou prepare lansman yo",
        text: "Chante, videyo, portada, EP oswa album ka suiv etap pa etap.",
      },
      {
        icon: LayoutDashboard,
        title: "4. Ou swiv tout bagay",
        text: "Dashboard la montre sa ki an pwogrè, sa ki fini ak pwochen aksyon an.",
      },
    ],
    title: "Yon espas klè pou atis ki vle travay ak plis lòd.",
  },
  es: {
    badge: "Aum Artist",
    checklist: [
      "Tu perfil artístico, contacto, datos principales y estado de cuenta.",
      "Lanzamientos de canciones, videos, EP y álbumes con sus archivos.",
      "Contratos, verificación, pagos, soporte y seguimiento de proyectos.",
      "Comunicación más clara para saber qué está listo y qué falta.",
    ],
    create: "Crear cuenta artista",
    dashboardText:
      "El dashboard es donde entra el artista después de tener cuenta. Ahí quedan ordenados el perfil, archivos, contratos, pagos, lanzamientos y soporte.",
    dashboardTitle: "¿Qué hay dentro del dashboard artista?",
    description:
      "Aum Artist es el espacio que AUM PRODZ prepara para artistas que necesitan organizar su carrera con más orden: perfil, archivos, música, videos, contratos, pagos y lanzamientos.",
    finalText:
      "Si todavía no tienes cuenta, crea tu cuenta artista. Si ya eres artista en la plataforma, entra al dashboard con tu acceso.",
    finalTitle: "¿Listo para entrar al espacio artista?",
    introCards: [
      {
        icon: Music2,
        label: "Carrera musical",
        text: "Un espacio para ordenar canciones, videos y lanzamientos.",
      },
      {
        icon: UploadCloud,
        label: "Archivos claros",
        text: "Portadas, audio, videos, documentos y links quedan conectados.",
      },
      {
        icon: FileSignature,
        label: "Contrato y seguimiento",
        text: "Autorizaciones, estados y mensajes no se pierden en conversaciones.",
      },
    ],
    login: "Ya soy artista: entrar al dashboard",
    note: "El botón Aum Artist de arriba trae a esta sección; la conexión real se hace solo desde el botón del dashboard.",
    processTitle: "Cómo funciona Aum Artist",
    process: [
      {
        icon: UserPlus,
        title: "1. Creas tu cuenta",
        text: "Ingresas la información del artista y activas el acceso al dashboard privado.",
      },
      {
        icon: ClipboardCheck,
        title: "2. Ordenamos los datos",
        text: "Perfil, contacto, documentos y archivos quedan organizados para trabajar claro.",
      },
      {
        icon: Headphones,
        title: "3. Preparas lanzamientos",
        text: "Canciones, videos, portadas, EP o álbumes pueden seguirse paso a paso.",
      },
      {
        icon: LayoutDashboard,
        title: "4. Das seguimiento",
        text: "El dashboard muestra lo que está en proceso, lo terminado y la próxima acción.",
      },
    ],
    title: "Un espacio claro para artistas que quieren trabajar con más orden.",
  },
  en: {
    badge: "Aum Artist",
    checklist: [
      "Your artist profile, contact, main data and account status.",
      "Song, video, EP and album releases with their files.",
      "Contracts, verification, payments, support and project tracking.",
      "Clearer communication to know what is done and what is pending.",
    ],
    create: "Create artist account",
    dashboardText:
      "The dashboard is where the artist enters after having an account. Profile, files, contracts, payments, releases and support stay organized there.",
    dashboardTitle: "What is inside the artist dashboard?",
    description:
      "Aum Artist is the space AUM PRODZ prepares for artists who need to organize their career with more structure: profile, files, music, videos, contracts, payments and releases.",
    finalText:
      "If you do not have an account yet, create your artist account. If you are already an artist on the platform, enter the dashboard with your access.",
    finalTitle: "Ready to enter the artist space?",
    introCards: [
      {
        icon: Music2,
        label: "Music career",
        text: "A space to organize songs, videos and releases.",
      },
      {
        icon: UploadCloud,
        label: "Clear files",
        text: "Covers, audio, videos, documents and links stay connected.",
      },
      {
        icon: FileSignature,
        label: "Contract and tracking",
        text: "Authorizations, statuses and messages do not get lost in conversations.",
      },
    ],
    login: "I am already an artist: enter dashboard",
    note: "The top Aum Artist button brings people here; the real sign-in happens only from the dashboard button.",
    processTitle: "How Aum Artist works",
    process: [
      {
        icon: UserPlus,
        title: "1. You create your account",
        text: "You enter the artist information and activate access to the private dashboard.",
      },
      {
        icon: ClipboardCheck,
        title: "2. We organize the data",
        text: "Profile, contact, documents and files are structured for clear work.",
      },
      {
        icon: Headphones,
        title: "3. You prepare releases",
        text: "Songs, videos, covers, EPs or albums can be tracked step by step.",
      },
      {
        icon: LayoutDashboard,
        title: "4. You follow everything",
        text: "The dashboard shows what is in progress, what is done and the next action.",
      },
    ],
    title: "A clear space for artists who want to work with more order.",
  },
  fr: {
    badge: "Aum Artist",
    checklist: [
      "Votre profil artiste, contact, donnees principales et etat du compte.",
      "Sorties de chansons, videos, EP et albums avec leurs fichiers.",
      "Contrats, verification, paiements, support et suivi des projets.",
      "Communication plus claire pour savoir ce qui est fini et ce qui manque.",
    ],
    create: "Creer un compte artiste",
    dashboardText:
      "Le dashboard est l'espace ou l'artiste entre apres avoir un compte. Profil, fichiers, contrats, paiements, sorties et support y restent organises.",
    dashboardTitle: "Qu'y a-t-il dans le dashboard artiste?",
    description:
      "Aum Artist est l'espace que AUM PRODZ prepare pour les artistes qui veulent organiser leur carriere avec plus d'ordre: profil, fichiers, musique, videos, contrats, paiements et sorties.",
    finalText:
      "Si vous n'avez pas encore de compte, creez votre compte artiste. Si vous etes deja artiste sur la plateforme, entrez dans le dashboard avec votre acces.",
    finalTitle: "Pret a entrer dans l'espace artiste?",
    introCards: [
      {
        icon: Music2,
        label: "Carriere musicale",
        text: "Un espace pour organiser chansons, videos et sorties.",
      },
      {
        icon: UploadCloud,
        label: "Fichiers clairs",
        text: "Pochettes, audio, videos, documents et liens restent connectes.",
      },
      {
        icon: FileSignature,
        label: "Contrat et suivi",
        text: "Autorisations, statuts et messages ne se perdent pas dans les conversations.",
      },
    ],
    login: "Je suis deja artiste: entrer au dashboard",
    note: "Le bouton Aum Artist en haut mene ici; la connexion reelle se fait seulement avec le bouton du dashboard.",
    processTitle: "Comment fonctionne Aum Artist",
    process: [
      {
        icon: UserPlus,
        title: "1. Vous creez le compte",
        text: "Vous entrez les informations artiste et activez l'acces au dashboard prive.",
      },
      {
        icon: ClipboardCheck,
        title: "2. Nous organisons les donnees",
        text: "Profil, contact, documents et fichiers sont organises pour travailler clairement.",
      },
      {
        icon: Headphones,
        title: "3. Vous preparez les sorties",
        text: "Chansons, videos, pochettes, EP ou albums peuvent etre suivis etape par etape.",
      },
      {
        icon: LayoutDashboard,
        title: "4. Vous suivez tout",
        text: "Le dashboard montre ce qui est en cours, ce qui est fini et la prochaine action.",
      },
    ],
    title: "Un espace clair pour les artistes qui veulent travailler avec plus d'ordre.",
  },
  pt: {
    badge: "Aum Artist",
    checklist: [
      "Seu perfil artistico, contato, dados principais e status da conta.",
      "Lancamentos de musicas, videos, EPs e albuns com seus arquivos.",
      "Contratos, verificacao, pagamentos, suporte e acompanhamento de projetos.",
      "Comunicacao mais clara para saber o que esta pronto e o que falta.",
    ],
    create: "Criar conta de artista",
    dashboardText:
      "O dashboard e onde o artista entra depois de ter conta. Perfil, arquivos, contratos, pagamentos, lancamentos e suporte ficam organizados ali.",
    dashboardTitle: "O que existe no dashboard do artista?",
    description:
      "Aum Artist e o espaco que a AUM PRODZ prepara para artistas que precisam organizar a carreira com mais ordem: perfil, arquivos, musica, videos, contratos, pagamentos e lancamentos.",
    finalText:
      "Se ainda nao tem conta, crie sua conta de artista. Se ja e artista na plataforma, entre no dashboard com seu acesso.",
    finalTitle: "Pronto para entrar no espaco artista?",
    introCards: [
      {
        icon: Music2,
        label: "Carreira musical",
        text: "Um espaco para organizar musicas, videos e lancamentos.",
      },
      {
        icon: UploadCloud,
        label: "Arquivos claros",
        text: "Capas, audio, videos, documentos e links ficam conectados.",
      },
      {
        icon: FileSignature,
        label: "Contrato e acompanhamento",
        text: "Autorizacoes, status e mensagens nao se perdem nas conversas.",
      },
    ],
    login: "Ja sou artista: entrar no dashboard",
    note: "O botao Aum Artist no topo traz para esta secao; a conexao real acontece apenas pelo botao do dashboard.",
    processTitle: "Como funciona Aum Artist",
    process: [
      {
        icon: UserPlus,
        title: "1. Voce cria a conta",
        text: "Voce informa os dados do artista e ativa o acesso ao dashboard privado.",
      },
      {
        icon: ClipboardCheck,
        title: "2. Organizamos os dados",
        text: "Perfil, contato, documentos e arquivos ficam organizados para trabalhar com clareza.",
      },
      {
        icon: Headphones,
        title: "3. Voce prepara lancamentos",
        text: "Musicas, videos, capas, EPs ou albuns podem ser acompanhados etapa por etapa.",
      },
      {
        icon: LayoutDashboard,
        title: "4. Voce acompanha tudo",
        text: "O dashboard mostra o que esta em andamento, o que foi concluido e a proxima acao.",
      },
    ],
    title: "Um espaco claro para artistas que querem trabalhar com mais ordem.",
  },
};

export const metadata = {
  title: "Aum Artist",
  description:
    "Espacio publico para explicar Aum Artist, crear cuenta artista o entrar al dashboard de AUM PRODZ.",
};

export default async function ArtistLandingPage() {
  const locale = await getCurrentLocale();
  const copy = artistPageCopyByLocale[locale] ?? artistPageCopyByLocale.ht;

  return (
    <section className="public-section-tight">
      <PublicEventTracker
        eventName="artist_pricing_view"
        page="/artista"
        service="artista"
        source="artist_page"
      />
      <div className="public-shell space-y-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <div className="space-y-6">
            <Badge tone="muted" className="rounded-full">
              {copy.badge}
            </Badge>
            <div className="space-y-5">
              <h1 className="mammouth-title text-4xl sm:text-6xl">
                {copy.title}
              </h1>
              <p className="mammouth-subtitle max-w-3xl text-xl">
                {copy.description}
              </p>
            </div>
          </div>

          <div className="mammouth-card grid gap-3 rounded-[2rem] p-4 sm:p-5">
            {copy.introCards.map(({ icon: Icon, label, text }) => (
              <div
                key={label}
                className="rounded-[1.25rem] border border-border bg-background/55 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-base font-black">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="mammouth-card">
          <CardHeader>
            <CardTitle className="text-3xl">{copy.processTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {copy.process.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[1.35rem] border border-border bg-background/45 p-4"
                >
                  <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
                    <Icon className="size-5" />
                  </span>
                  <h2 className="text-lg font-black">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="mammouth-card">
            <CardHeader>
              <span className="flex size-14 items-center justify-center rounded-full bg-[#2f2f31] text-white">
                <LayoutDashboard className="size-6" />
              </span>
              <CardTitle>{copy.dashboardTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-7 text-muted-foreground">
                {copy.dashboardText}
              </p>
            </CardContent>
          </Card>

          <Card className="mammouth-card">
            <CardContent className="grid gap-4 p-5 sm:p-6">
              {copy.checklist.map((item) => (
                <p key={item} className="flex gap-3 text-sm leading-6 sm:text-base">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  {item}
                </p>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="mammouth-card rounded-[2rem] p-5 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-primary">
                <LockKeyhole className="size-5" />
                <p className="text-sm font-black uppercase tracking-[0.18em]">
                  Aum Artist
                </p>
              </div>
              <h2 className="mammouth-title text-3xl sm:text-5xl">
                {copy.finalTitle}
              </h2>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                {copy.finalText}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {copy.note}
              </p>
            </div>

            <div className="grid gap-3 sm:min-w-72">
              <TrackedLink
                href="/artista/registro"
                eventName="artist_checkout_click"
                page="/artista"
                service="artista"
                source="artist_page"
                placement="final_create_account"
                className={cn(buttonVariants({ size: "lg" }), "w-full")}
              >
                {copy.create}
                <ArrowRight className="size-5" />
              </TrackedLink>
              <TrackedLink
                href="/login?next=%2Fartist"
                eventName="artist_checkout_click"
                page="/artista"
                service="artista"
                source="artist_page"
                placement="final_existing_artist_login"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "w-full",
                )}
              >
                {copy.login}
                <ArrowRight className="size-5" />
              </TrackedLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
