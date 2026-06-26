import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Brush,
  CheckCircle2,
  Clock3,
  FileSignature,
  Headphones,
  KeyRound,
  Megaphone,
  MessageCircle,
  MonitorPlay,
  Music2,
  PlayCircle,
  Rocket,
  Settings,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type React from "react";

import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { ServiceCard } from "@/components/public/service-card";
import { WhatsappCtaLink } from "@/components/public/whatsapp-cta-link";
import { YoutubeVideosSection } from "@/components/public/youtube-videos-section";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicServices, type ServiceSlug } from "@/lib/content/services";
import { getPublicYoutubeVideos } from "@/lib/content/youtube";
import type { AppLocale } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dictionaries";
import { getCurrentLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type MetricItem = {
  detail: string;
  label: string;
  value: string;
};

type HomeCopy = {
  artistChecklist: string[];
  artistCta: string;
  artistEyebrow: string;
  artistLogin: string;
  artistWorkspaceTitle: string;
  artistSteps: Array<{ detail: string; label: string }>;
  artistText: string;
  artistTitle: string;
  capabilityCards: Array<{
    badge: string;
    description: string;
    href: string;
    service: ServiceSlug;
    title: string;
  }>;
  dashboardSignal: string;
  dashboardModules: string[];
  dashboardSubtitle: string;
  dashboardTitle: string;
  finalButtons: {
    artist: string;
    services: string;
    whatsapp: string;
  };
  finalText: string;
  finalTitle: string;
  heroSecondary: string;
  metricItems: MetricItem[];
  missionModules: Array<{ description: string; title: string }>;
  missionText: string;
  missionTitle: string;
  nextActionsTitle: string;
  processText: string;
  processTitle: string;
  releaseStatusLabel: string;
  serviceEyebrow: string;
  serviceText: string;
  serviceTitle: string;
  trustPoints: string[];
  trustText: string;
  trustTitle: string;
  viewAll: string;
  workspaceItems: string[];
};

const homeCopyByLocale: Record<AppLocale, HomeCopy> = {
  ht: {
    artistChecklist: [
      "Pwofil atis mete ajou",
      "Fichye lansman yo chaje",
      "Kontra ak verifikasyon klè",
      "Sipò konekte ak pwochen etap yo",
    ],
    artistCta: "Kreye kont atis",
    artistEyebrow: "Artist OS",
    artistLogin: "Mwen deja atis",
    artistWorkspaceTitle: "Espas atis",
    artistSteps: [
      { label: "Pwofil", detail: "Done, kontak ak idantite atis la." },
      { label: "Lansman", detail: "Single, videyo, EP oswa album pa etap." },
      { label: "Fichye", detail: "Audio, portada, lyrics ak dokiman yo òganize." },
      { label: "Kontra", detail: "Otorizasyon ak siyen dokiman klè." },
      { label: "Pwomosyon", detail: "Sipò pou deplase lansman an ak direksyon." },
    ],
    artistText:
      "Pwofil, lansman, fichye, kontra, revizyon, pwomosyon ak sipò nan yon sèl espas pwofesyonèl.",
    artistTitle: "Karyè mizikal ou, òganize nan yon sèl kote.",
    capabilityCards: [
      {
        badge: "Automation",
        description: "Pwosesis, mesaj, kontni ak zouti IA pou travay pi klè.",
        href: "/contacto",
        service: "cuentas-digitales",
        title: "IA ak automatisation",
      },
      {
        badge: "Artist",
        description: "Lansman mizik, fichye, kontra, rapò ak sipò pou atis.",
        href: "/artista",
        service: "youtube-adsense",
        title: "Mizik / Artist Services",
      },
      {
        badge: "Brand",
        description: "Miniati, flyers, reels, branding ak kontni vizyèl.",
        href: "/servicios/imagen-video",
        service: "imagen-video",
        title: "Branding ak kontni vizyèl",
      },
    ],
    dashboardSignal: "Sant kontwòl aktif",
    dashboardModules: [
      "YouTube",
      "Web",
      "Imaj",
      "Atis",
      "AdSense",
      "Lansman",
      "WhatsApp",
      "IA",
      "Automation",
      "Music Release",
    ],
    dashboardSubtitle: "YouTube, web, imaj, atis, AdSense, WhatsApp, IA ak lansman mizik sou menm tablo a.",
    dashboardTitle: "Mission Control",
    finalButtons: {
      artist: "Mwen se atis",
      services: "Gade sèvis yo",
      whatsapp: "Pale sou WhatsApp",
    },
    finalText:
      "Mete chanèl ou, sit ou, imaj ou, kont ou oswa karyè atistik ou nan yon pwosesis ki klè.",
    finalTitle: "Pare pou mete pwojè dijital ou anba kontwòl?",
    heroSecondary: "Digital power for creators, artists and real businesses.",
    metricItems: [
      { value: "24/7", label: "Sèvis dijital", detail: "Sipò ak aksyon lè pwojè a bezwen avanse." },
      { value: "5", label: "Lang ofisyèl", detail: "HT, ES, EN, FR ak PT pou kominote entènasyonal." },
      { value: "Pro", label: "Mòd atis", detail: "Dashboard, fichye, kontra ak lansman òganize." },
      { value: "MC", label: "Mission Control", detail: "Yon sant pou wè travay la, etap la ak pwochen aksyon an." },
    ],
    missionModules: [
      { title: "Strategy", description: "Nou gade objektif la anvan nou kouri." },
      { title: "Execution", description: "Travay la antre nan etap klè ak livrezon reyèl." },
      { title: "Review", description: "Nou verifye sa ki bloke, sa ki mache, sa ki dwe tann." },
      { title: "Delivery", description: "Rezilta yo soti ak dosye, lyen oswa aksyon ki pare." },
      { title: "Support", description: "WhatsApp ak dashboard kenbe kominikasyon an senp." },
      { title: "Growth", description: "Chak pwojè kite baz pou pwochen nivo a." },
    ],
    missionText:
      "AUM PRODZ se pa sèlman yon sèvis. Se yon sant kontwòl dijital pou mete chanèl ou, sit ou, imaj ou, kont ou ak karyè atistik ou anba kontwòl.",
    missionTitle: "Mwens konfizyon. Plis pwosesis. Pi bon ekzekisyon.",
    processText:
      "Nou pa vann pwomès enposib. Nou òganize travay la, nou revize reyalite a epi nou egzekite ak transparans.",
    processTitle: "Nou pale. Nou verifye. Nou egzekite.",
    nextActionsTitle: "Pwochen aksyon",
    releaseStatusLabel: "Eta lansman",
    serviceEyebrow: "Sèvis disponib",
    serviceText:
      "Sèvis ki fèt pou kreye, vann epi grandi ak plis kontwòl, san pèdi klète sou sa ki reyèlman posib.",
    serviceTitle: "Sèvis, mizik ak kontni reyèl.",
    trustPoints: [
      "Pa gen promès monetizasyon enposib.",
      "Chak ka revize selon reyalite platfòm nan.",
      "Kominikasyon an rete klè sou WhatsApp, dashboard oswa livrezon.",
    ],
    trustText:
      "AUM PRODZ akonpaye, oryante epi egzekite ak transparans. Nou pa vann pwomès enposib; nou bati pwosesis ki ka verifye.",
    trustTitle: "Konfyans lan soti nan klète travay la.",
    viewAll: "Gade tout",
    workspaceItems: ["Pwofil", "Fichye", "Kontra", "Sipò"],
  },
  es: {
    artistChecklist: [
      "Perfil artístico actualizado",
      "Archivos de lanzamiento subidos",
      "Contrato y verificación en regla",
      "Soporte conectado al próximo paso",
    ],
    artistCta: "Crear cuenta de artista",
    artistEyebrow: "Artist OS",
    artistLogin: "Ya soy artista",
    artistWorkspaceTitle: "Espacio artista",
    artistSteps: [
      { label: "Perfil", detail: "Datos, contacto e identidad del artista." },
      { label: "Lanzamiento", detail: "Single, video, EP o album por estado." },
      { label: "Archivos", detail: "Audio, portada, letras y documentos ordenados." },
      { label: "Contrato", detail: "Autorizaciones y firma con claridad." },
      { label: "Promoción", detail: "Apoyo para mover el lanzamiento con dirección." },
    ],
    artistText:
      "Perfil, lanzamientos, archivos, contratos, revisión, promoción y soporte en un espacio profesional.",
    artistTitle: "Tu carrera musical organizada en un solo lugar.",
    capabilityCards: [
      {
        badge: "Automation",
        description: "Procesos, mensajes, contenido y herramientas de IA para trabajar con más claridad.",
        href: "/contacto",
        service: "cuentas-digitales",
        title: "IA y automatización",
      },
      {
        badge: "Artist",
        description: "Lanzamientos, archivos, contratos, reportes y soporte para artistas.",
        href: "/artista",
        service: "youtube-adsense",
        title: "Música / Artist Services",
      },
      {
        badge: "Brand",
        description: "Miniaturas, flyers, reels, branding y contenido visual.",
        href: "/servicios/imagen-video",
        service: "imagen-video",
        title: "Branding y contenido visual",
      },
    ],
    dashboardSignal: "Centro de control activo",
    dashboardModules: [
      "YouTube",
      "Web",
      "Imagen",
      "Artistas",
      "AdSense",
      "Lanzamientos",
      "WhatsApp",
      "IA",
      "Automatización",
      "Publicación musical",
    ],
    dashboardSubtitle: "YouTube, web, imagen, artistas, AdSense, WhatsApp, IA y lanzamientos en el mismo tablero.",
    dashboardTitle: "Mission Control",
    finalButtons: {
      artist: "Soy artista",
      services: "Ver servicios",
      whatsapp: "Hablar por WhatsApp",
    },
    finalText:
      "Pon tu canal, web, imagen, cuentas o carrera artística dentro de un proceso claro.",
    finalTitle: "¿Listo para poner tu proyecto digital bajo control?",
    heroSecondary: "Digital power for creators, artists and real businesses.",
    metricItems: [
      { value: "24/7", label: "Servicios digitales", detail: "Soporte y acción cuando el proyecto necesita avanzar." },
      { value: "5", label: "Idiomas oficiales", detail: "HT, ES, EN, FR y PT para una comunidad internacional." },
      { value: "Pro", label: "Modo artista", detail: "Dashboard, archivos, contratos y lanzamientos organizados." },
      { value: "MC", label: "Mission Control", detail: "Un centro para ver trabajo, estado y próximo paso." },
    ],
    missionModules: [
      { title: "Strategy", description: "Miramos el objetivo antes de correr." },
      { title: "Execution", description: "El trabajo entra en etapas claras y entregas reales." },
      { title: "Review", description: "Revisamos qué bloquea, qué sirve y qué debe esperar." },
      { title: "Delivery", description: "Los resultados salen con archivos, enlaces o acciones listas." },
      { title: "Support", description: "WhatsApp y dashboard mantienen la comunicación simple." },
      { title: "Growth", description: "Cada proyecto deja base para el siguiente nivel." },
    ],
    missionText:
      "AUM PRODZ no es solo un servicio. Es un centro de control digital para poner tu canal, web, imagen, cuentas y carrera artística bajo control.",
    missionTitle: "Menos confusión. Más proceso. Mejor ejecución.",
    processText:
      "No vendemos promesas imposibles. Organizamos el trabajo, revisamos la realidad y ejecutamos con transparencia.",
    processTitle: "Hablamos. Revisamos. Ejecutamos.",
    nextActionsTitle: "Próximas acciones",
    releaseStatusLabel: "Estado del lanzamiento",
    serviceEyebrow: "Servicios disponibles",
    serviceText:
      "Servicios diseñados para crear, vender y crecer con más control, sin perder claridad sobre lo realmente posible.",
    serviceTitle: "Servicios, música y contenido real.",
    trustPoints: [
      "Sin promesas imposibles de monetización.",
      "Cada caso se revisa según la realidad de la plataforma.",
      "La comunicación se mantiene clara por WhatsApp, dashboard o entrega.",
    ],
    trustText:
      "AUM PRODZ orienta, acompaña y ejecuta con transparencia. No vende promesas imposibles; construye procesos verificables.",
    trustTitle: "La confianza sale de la claridad del trabajo.",
    viewAll: "Ver todo",
    workspaceItems: ["Perfil", "Archivos", "Contrato", "Soporte"],
  },
  en: {
    artistChecklist: [
      "Updated artist profile",
      "Release files uploaded",
      "Contract and verification clear",
      "Support connected to the next step",
    ],
    artistCta: "Create artist account",
    artistEyebrow: "Artist OS",
    artistLogin: "I am already an artist",
    artistWorkspaceTitle: "Artist workspace",
    artistSteps: [
      { label: "Profile", detail: "Artist data, contact and identity." },
      { label: "Release", detail: "Single, video, EP or album by status." },
      { label: "Files", detail: "Audio, cover, lyrics and documents organized." },
      { label: "Contract", detail: "Authorization and signing with clarity." },
      { label: "Promotion", detail: "Support to move the release with direction." },
    ],
    artistText:
      "Profiles, releases, files, contracts, review, promotion and support in one professional workspace.",
    artistTitle: "Your music career organized in one place.",
    capabilityCards: [
      {
        badge: "Automation",
        description: "Processes, messages, content and AI tools for clearer work.",
        href: "/contacto",
        service: "cuentas-digitales",
        title: "AI and automation",
      },
      {
        badge: "Artist",
        description: "Music releases, files, contracts, reports and support for artists.",
        href: "/artista",
        service: "youtube-adsense",
        title: "Music / Artist Services",
      },
      {
        badge: "Brand",
        description: "Thumbnails, flyers, reels, branding and visual content.",
        href: "/servicios/imagen-video",
        service: "imagen-video",
        title: "Branding and visual content",
      },
    ],
    dashboardSignal: "Active control center",
    dashboardModules: [
      "YouTube",
      "Web",
      "Image",
      "Artists",
      "AdSense",
      "Releases",
      "WhatsApp",
      "AI",
      "Automation",
      "Music Release",
    ],
    dashboardSubtitle: "YouTube, web, image, artists, AdSense, WhatsApp, AI and music releases in one board.",
    dashboardTitle: "Mission Control",
    finalButtons: {
      artist: "I am an artist",
      services: "View services",
      whatsapp: "Talk on WhatsApp",
    },
    finalText:
      "Bring your channel, website, image, accounts or artist career into a clear process.",
    finalTitle: "Ready to put your digital project under control?",
    heroSecondary: "Digital power for creators, artists and real businesses.",
    metricItems: [
      { value: "24/7", label: "Digital services", detail: "Support and action when the project needs to move." },
      { value: "5", label: "Official languages", detail: "HT, ES, EN, FR and PT for an international community." },
      { value: "Pro", label: "Artist mode", detail: "Dashboard, files, contracts and organized releases." },
      { value: "MC", label: "Mission Control", detail: "A center to see work, status and next action." },
    ],
    missionModules: [
      { title: "Strategy", description: "We look at the goal before rushing." },
      { title: "Execution", description: "Work moves through clear steps and real delivery." },
      { title: "Review", description: "We check what blocks, what works and what should wait." },
      { title: "Delivery", description: "Results leave with files, links or ready actions." },
      { title: "Support", description: "WhatsApp and dashboard keep communication simple." },
      { title: "Growth", description: "Each project leaves a base for the next level." },
    ],
    missionText:
      "AUM PRODZ is not just a service. It is a digital control center for your channel, website, image, accounts and artist career.",
    missionTitle: "Less confusion. More process. Better execution.",
    processText:
      "We do not sell impossible promises. We organize the work, review reality and execute transparently.",
    processTitle: "We talk. We review. We execute.",
    nextActionsTitle: "Next actions",
    releaseStatusLabel: "Release status",
    serviceEyebrow: "Available services",
    serviceText:
      "Services designed to create, sell and grow with more control, without losing clarity about what is actually possible.",
    serviceTitle: "Services, music and real content.",
    trustPoints: [
      "No impossible monetization promises.",
      "Each case is reviewed against platform reality.",
      "Communication stays clear through WhatsApp, dashboard or delivery.",
    ],
    trustText:
      "AUM PRODZ guides, supports and executes with transparency. We do not sell impossible promises; we build verifiable processes.",
    trustTitle: "Trust comes from clarity of work.",
    viewAll: "View all",
    workspaceItems: ["Profile", "Files", "Contract", "Support"],
  },
  fr: {
    artistChecklist: [
      "Profil artiste mis à jour",
      "Fichiers de sortie chargés",
      "Contrat et vérification clairs",
      "Support connecté à la prochaine étape",
    ],
    artistCta: "Créer un compte artiste",
    artistEyebrow: "Artist OS",
    artistLogin: "Je suis déjà artiste",
    artistWorkspaceTitle: "Espace artiste",
    artistSteps: [
      { label: "Profil", detail: "Données, contact et identité de l'artiste." },
      { label: "Sortie", detail: "Single, vidéo, EP ou album par statut." },
      { label: "Fichiers", detail: "Audio, pochette, paroles et documents organisés." },
      { label: "Contrat", detail: "Autorisations et signature avec clarté." },
      { label: "Promotion", detail: "Support pour avancer la sortie avec direction." },
    ],
    artistText:
      "Profil, sorties, fichiers, contrats, révision, promotion et support dans un espace professionnel.",
    artistTitle: "Votre carrière musicale organisée au même endroit.",
    capabilityCards: [
      {
        badge: "Automation",
        description: "Processus, messages, contenu et outils IA pour travailler plus clairement.",
        href: "/contacto",
        service: "cuentas-digitales",
        title: "IA et automatisation",
      },
      {
        badge: "Artist",
        description: "Sorties musicales, fichiers, contrats, rapports et support pour artistes.",
        href: "/artista",
        service: "youtube-adsense",
        title: "Musique / Artist Services",
      },
      {
        badge: "Brand",
        description: "Miniatures, flyers, reels, branding et contenu visuel.",
        href: "/servicios/imagen-video",
        service: "imagen-video",
        title: "Branding et contenu visuel",
      },
    ],
    dashboardSignal: "Centre de contrôle actif",
    dashboardModules: [
      "YouTube",
      "Web",
      "Image",
      "Artistes",
      "AdSense",
      "Sorties",
      "WhatsApp",
      "IA",
      "Automatisation",
      "Sortie musicale",
    ],
    dashboardSubtitle: "YouTube, web, image, artistes, AdSense, WhatsApp, IA et sorties musicales sur un seul tableau.",
    dashboardTitle: "Mission Control",
    finalButtons: {
      artist: "Je suis artiste",
      services: "Voir les services",
      whatsapp: "Parler sur WhatsApp",
    },
    finalText:
      "Mettez votre chaîne, site, image, comptes ou carrière artistique dans un processus clair.",
    finalTitle: "Prêt à mettre votre projet digital sous contrôle?",
    heroSecondary: "Digital power for creators, artists and real businesses.",
    metricItems: [
      { value: "24/7", label: "Services digitaux", detail: "Support et action quand le projet doit avancer." },
      { value: "5", label: "Langues officielles", detail: "HT, ES, EN, FR et PT pour une communauté internationale." },
      { value: "Pro", label: "Mode artiste", detail: "Dashboard, fichiers, contrats et sorties organisées." },
      { value: "MC", label: "Mission Control", detail: "Un centre pour voir travail, statut et prochaine action." },
    ],
    missionModules: [
      { title: "Strategy", description: "Nous regardons l'objectif avant de courir." },
      { title: "Execution", description: "Le travail avance par étapes claires et livraisons réelles." },
      { title: "Review", description: "Nous vérifions ce qui bloque, ce qui marche et ce qui doit attendre." },
      { title: "Delivery", description: "Les résultats sortent avec fichiers, liens ou actions prêtes." },
      { title: "Support", description: "WhatsApp et dashboard gardent la communication simple." },
      { title: "Growth", description: "Chaque projet laisse une base pour le niveau suivant." },
    ],
    missionText:
      "AUM PRODZ n'est pas seulement un service. C'est un centre de contrôle digital pour votre chaîne, site, image, comptes et carrière artistique.",
    missionTitle: "Moins de confusion. Plus de processus. Meilleure exécution.",
    processText:
      "Nous ne vendons pas de promesses impossibles. Nous organisons le travail, vérifions la réalité et exécutons avec transparence.",
    processTitle: "On parle. On vérifie. On exécute.",
    nextActionsTitle: "Prochaines actions",
    releaseStatusLabel: "Statut de sortie",
    serviceEyebrow: "Services disponibles",
    serviceText:
      "Des services conçus pour créer, vendre et grandir avec plus de contrôle, sans perdre la clarté sur ce qui est possible.",
    serviceTitle: "Services, musique et contenu réel.",
    trustPoints: [
      "Pas de promesses impossibles de monétisation.",
      "Chaque cas est révisé selon la réalité de la plateforme.",
      "La communication reste claire par WhatsApp, dashboard ou livraison.",
    ],
    trustText:
      "AUM PRODZ oriente, accompagne et exécute avec transparence. Nous ne vendons pas de promesses impossibles; nous bâtissons des processus vérifiables.",
    trustTitle: "La confiance vient de la clarté du travail.",
    viewAll: "Voir tout",
    workspaceItems: ["Profil", "Fichiers", "Contrat", "Support"],
  },
  pt: {
    artistChecklist: [
      "Perfil artístico atualizado",
      "Arquivos de lançamento enviados",
      "Contrato e verificação claros",
      "Suporte conectado ao próximo passo",
    ],
    artistCta: "Criar conta de artista",
    artistEyebrow: "Artist OS",
    artistLogin: "Já sou artista",
    artistWorkspaceTitle: "Espaço artista",
    artistSteps: [
      { label: "Perfil", detail: "Dados, contato e identidade do artista." },
      { label: "Lançamento", detail: "Single, vídeo, EP ou álbum por status." },
      { label: "Arquivos", detail: "Áudio, capa, letras e documentos organizados." },
      { label: "Contrato", detail: "Autorizações e assinatura com clareza." },
      { label: "Promoção", detail: "Suporte para mover o lançamento com direção." },
    ],
    artistText:
      "Perfil, lançamentos, arquivos, contratos, revisão, promoção e suporte em um espaço profissional.",
    artistTitle: "Sua carreira musical organizada em um só lugar.",
    capabilityCards: [
      {
        badge: "Automation",
        description: "Processos, mensagens, conteúdo e ferramentas de IA para trabalhar melhor.",
        href: "/contacto",
        service: "cuentas-digitales",
        title: "IA e automação",
      },
      {
        badge: "Artist",
        description: "Lançamentos musicais, arquivos, contratos, relatórios e suporte para artistas.",
        href: "/artista",
        service: "youtube-adsense",
        title: "Música / Artist Services",
      },
      {
        badge: "Brand",
        description: "Miniaturas, flyers, reels, branding e conteúdo visual.",
        href: "/servicios/imagen-video",
        service: "imagen-video",
        title: "Branding e conteúdo visual",
      },
    ],
    dashboardSignal: "Centro de controle ativo",
    dashboardModules: [
      "YouTube",
      "Web",
      "Imagem",
      "Artistas",
      "AdSense",
      "Lançamentos",
      "WhatsApp",
      "IA",
      "Automação",
      "Lançamento musical",
    ],
    dashboardSubtitle: "YouTube, web, imagem, artistas, AdSense, WhatsApp, IA e lançamentos em um só painel.",
    dashboardTitle: "Mission Control",
    finalButtons: {
      artist: "Sou artista",
      services: "Ver serviços",
      whatsapp: "Falar no WhatsApp",
    },
    finalText:
      "Coloque seu canal, site, imagem, contas ou carreira artística em um processo claro.",
    finalTitle: "Pronto para colocar seu projeto digital sob controle?",
    heroSecondary: "Digital power for creators, artists and real businesses.",
    metricItems: [
      { value: "24/7", label: "Serviços digitais", detail: "Suporte e ação quando o projeto precisa avançar." },
      { value: "5", label: "Idiomas oficiais", detail: "HT, ES, EN, FR e PT para uma comunidade internacional." },
      { value: "Pro", label: "Modo artista", detail: "Dashboard, arquivos, contratos e lançamentos organizados." },
      { value: "MC", label: "Mission Control", detail: "Um centro para ver trabalho, status e próxima ação." },
    ],
    missionModules: [
      { title: "Strategy", description: "Olhamos o objetivo antes de correr." },
      { title: "Execution", description: "O trabalho entra em etapas claras e entregas reais." },
      { title: "Review", description: "Verificamos o que bloqueia, funciona e deve esperar." },
      { title: "Delivery", description: "Resultados saem com arquivos, links ou ações prontas." },
      { title: "Support", description: "WhatsApp e dashboard mantêm a comunicação simples." },
      { title: "Growth", description: "Cada projeto deixa base para o próximo nível." },
    ],
    missionText:
      "AUM PRODZ não é apenas um serviço. É um centro de controle digital para seu canal, site, imagem, contas e carreira artística.",
    missionTitle: "Menos confusão. Mais processo. Melhor execução.",
    processText:
      "Não vendemos promessas impossíveis. Organizamos o trabalho, revisamos a realidade e executamos com transparência.",
    processTitle: "Falamos. Revisamos. Executamos.",
    nextActionsTitle: "Próximas ações",
    releaseStatusLabel: "Status do lançamento",
    serviceEyebrow: "Serviços disponíveis",
    serviceText:
      "Serviços pensados para criar, vender e crescer com mais controle, sem perder clareza sobre o que é possível.",
    serviceTitle: "Serviços, música e conteúdo real.",
    trustPoints: [
      "Sem promessas impossíveis de monetização.",
      "Cada caso é revisado conforme a realidade da plataforma.",
      "A comunicação fica clara por WhatsApp, dashboard ou entrega.",
    ],
    trustText:
      "AUM PRODZ orienta, acompanha e executa com transparência. Não vendemos promessas impossíveis; construímos processos verificáveis.",
    trustTitle: "A confiança vem da clareza do trabalho.",
    viewAll: "Ver tudo",
    workspaceItems: ["Perfil", "Arquivos", "Contrato", "Suporte"],
  },
};

const processIcons = [MessageCircle, ShieldCheck, Rocket] as const;
const artistIcons = [CheckCircle2, UploadCloud, FileSignature, Rocket, Megaphone] as const;
const missionIcons = [Settings, Rocket, CheckCircle2, UploadCloud, Headphones, Sparkles] as const;
const capabilityIcons: Record<string, LucideIcon> = {
  Automation: Bot,
  Artist: Music2,
  Brand: Brush,
};

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const copy = homeCopyByLocale[locale] ?? homeCopyByLocale.ht;
  const [services, youtubeVideos] = await Promise.all([
    getPublicServices({ locale }),
    getPublicYoutubeVideos(3),
  ]);
  const workSteps = [
    { title: t(locale, "home.step1Title"), text: t(locale, "home.step1Text") },
    { title: t(locale, "home.step2Title"), text: t(locale, "home.step2Text") },
    { title: t(locale, "home.step3Title"), text: t(locale, "home.step3Text") },
  ];

  return (
    <>
      <PublicEventTracker eventName="page_view" page="/" source="home" />

      <section className="premium-grid relative isolate overflow-hidden border-b border-border text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_18%,rgba(48,213,244,0.24),transparent_30%),radial-gradient(circle_at_72%_16%,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_84%_62%,rgba(243,201,106,0.16),transparent_26%),linear-gradient(135deg,rgba(5,9,20,0.54),rgba(5,9,20,1)_70%)]" />
        <div className="absolute right-4 top-24 -z-10 hidden h-72 w-72 rounded-full border border-primary/20 lg:block" />
        <div className="relative mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/12 px-3 py-2 text-sm font-bold text-primary shadow-glow">
              <PlayCircle className="size-4" />
              {t(locale, "home.badge")}
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-normal sm:text-6xl">
                {t(locale, "home.title")}
              </h1>
              <p className="max-w-2xl text-xl font-semibold leading-8 text-primary">
                {copy.heroSecondary}
              </p>
              <p className="max-w-2xl text-lg leading-8 text-white/76">
                {t(locale, "home.description")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/servicios"
                className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
              >
                {t(locale, "home.services")}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/login?next=%2Fartist"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "border-white/16 bg-white/10 text-white hover:bg-white/16",
                )}
              >
                {copy.artistLogin}
                <ArrowRight className="size-5" />
              </Link>
              <WhatsappCtaLink
                service="youtube-adsense"
                source="home"
                placement="hero_whatsapp"
                page="/"
                label={t(locale, "home.whatsapp")}
                variant="ghost"
                size="lg"
                className="border border-white/24 text-white hover:bg-white/10"
              />
            </div>
          </div>

          <FloatingDashboardMockup copy={copy} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeader
          eyebrow={copy.serviceEyebrow}
          icon={Sparkles}
          title={copy.serviceTitle}
          text={copy.serviceText}
          action={
            <Link
              href="/servicios"
              className={cn(buttonVariants({ variant: "secondary" }))}
            >
              {copy.viewAll}
              <ArrowRight className="size-4" />
            </Link>
          }
        />
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.slug} locale={locale} service={service} />
          ))}
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {copy.capabilityCards.map((item) => (
            <CapabilityCard key={item.title} item={item} locale={locale} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-20">
          <div className="space-y-6">
            <Badge className="w-fit" tone="info">
              {copy.artistEyebrow}
            </Badge>
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-normal sm:text-5xl">
                {copy.artistTitle}
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                {copy.artistText}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/artista/registro"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                {copy.artistCta}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/login?next=%2Fartist"
                className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
              >
                {copy.artistLogin}
              </Link>
            </div>
          </div>
          <ArtistOSVisual copy={copy} />
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.12),transparent_30%),radial-gradient(circle_at_82%_34%,rgba(225,29,72,0.1),transparent_28%)]" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8 lg:py-20">
          <SectionHeader
            eyebrow="Mission Control"
            icon={MonitorPlay}
            title={copy.missionTitle}
            text={copy.missionText}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.missionModules.map((module, index) => {
              const Icon = missionIcons[index] ?? Settings;

              return (
                <Card
                  key={module.title}
                  className="glow-card transition-all hover:-translate-y-1 hover:border-primary/40"
                >
                  <CardHeader>
                    <span className="flex size-11 items-center justify-center rounded-md bg-primary/12 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {module.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeader
            eyebrow={t(locale, "home.workBadge")}
            icon={MessageCircle}
            title={copy.processTitle}
            text={copy.processText}
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {workSteps.map((item, index) => {
              const Icon = processIcons[index] ?? MessageCircle;

              return (
                <Card
                  key={item.title}
                  className="glow-card transition-all hover:-translate-y-1 hover:border-primary/40"
                >
                  <CardHeader>
                    <span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-black">
                      <Icon className="size-5" />
                    </span>
                    <CardTitle>{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.text}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <YoutubeVideosSection videos={youtubeVideos} compact />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
        <SectionHeader
          eyebrow="Trust"
          icon={ShieldCheck}
          title={copy.trustTitle}
          text={copy.trustText}
        />
        <div className="grid gap-4">
          {copy.trustPoints.map((point) => (
            <div
              key={point}
              className="flex gap-3 rounded-lg border border-border bg-card/80 p-4"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
              <p className="text-sm leading-6 text-muted-foreground">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mission-surface overflow-hidden rounded-xl p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-accent">
                AUM PRODZ
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-5xl">
                {copy.finalTitle}
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                {copy.finalText}
              </p>
            </div>
            <div className="grid gap-3 sm:min-w-72">
              <WhatsappCtaLink
                service="youtube-adsense"
                source="home"
                placement="final_whatsapp"
                page="/"
                label={copy.finalButtons.whatsapp}
                size="lg"
                variant="accent"
              />
              <Link
                href="/artista"
                className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}
              >
                {copy.finalButtons.artist}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/servicios"
                className={cn(buttonVariants({ size: "lg", variant: "ghost" }))}
              >
                {copy.finalButtons.services}
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FloatingDashboardMockup({ copy }: { copy: HomeCopy }) {
  return (
    <div className="relative">
      <div className="mission-surface overflow-hidden rounded-xl p-3 shadow-2xl">
        <div className="overflow-hidden rounded-lg bg-[#070b14]">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="size-3 rounded-full bg-[var(--haiti-red)]" />
            <span className="size-3 rounded-full bg-accent" />
            <span className="size-3 rounded-full bg-primary" />
            <span className="ml-auto text-xs font-semibold text-white/54">
              aumprodz.com
            </span>
          </div>
          <div className="relative">
            <Image
              src="/aum-prodz-podcast-hero.png"
              alt="AUM PRODZ podcast recording studio with microphone and laptop"
              width={1672}
              height={941}
              priority
              className="h-64 w-full object-cover object-center opacity-[0.92] sm:h-80 lg:h-96"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070b14]/18 via-transparent to-transparent" />
          </div>
          <div className="border-t border-white/10 p-4">
            <div className="rounded-lg border border-white/10 bg-[#07101d]/82 p-4 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                {copy.dashboardSignal}
              </p>
              <h2 className="mt-2 text-2xl font-black">{copy.dashboardTitle}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                {copy.dashboardSubtitle}
              </p>
            </div>
          </div>
          <div className="grid gap-2 border-t border-white/10 p-4 sm:grid-cols-2 lg:grid-cols-5">
            {copy.dashboardModules.map((module, index) => (
              <div
                key={module}
                className="rounded-md border border-white/10 bg-white/[0.06] px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold">{module}</span>
                  <span
                    className={cn(
                      "h-1.5 w-8 rounded-full",
                      index % 3 === 0
                        ? "bg-accent"
                        : index % 3 === 1
                          ? "bg-primary"
                          : "bg-[var(--haiti-red)]",
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  action,
  eyebrow,
  icon: Icon,
  text,
  title,
}: {
  action?: React.ReactNode;
  eyebrow: string;
  icon: LucideIcon;
  text: string;
  title: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm font-bold text-primary">
          <Icon className="size-4" />
          {eyebrow}
        </div>
        <h2 className="mt-3 text-3xl font-black tracking-normal sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{text}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function CapabilityCard({
  item,
  locale,
}: {
  item: HomeCopy["capabilityCards"][number];
  locale: AppLocale;
}) {
  const Icon = capabilityIcons[item.badge] ?? Sparkles;

  return (
    <Card className="glow-card h-full transition-all hover:-translate-y-1 hover:border-primary/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-11 items-center justify-center rounded-md bg-accent/20 text-accent">
            <Icon className="size-5" />
          </span>
          <Badge tone="accent">{item.badge}</Badge>
        </div>
        <CardTitle>{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-6 text-muted-foreground">
          {item.description}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={item.href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            {t(locale, "common.viewDetail")}
            <ArrowRight className="size-4" />
          </Link>
          <WhatsappCtaLink
            service={item.service}
            source="home_capability"
            placement="capability_card"
            page="/"
            label={t(locale, "common.whatsapp")}
            variant="secondary"
            size="sm"
            className="sm:ml-auto"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ArtistOSVisual({ copy }: { copy: HomeCopy }) {
  return (
    <div className="grid gap-5">
      <Card className="mission-surface overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                {copy.releaseStatusLabel}
              </p>
              <CardTitle>{copy.artistTitle}</CardTitle>
            </div>
            <Badge tone="success">Pro</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {copy.artistSteps.map((step, index) => {
              const Icon = artistIcons[index] ?? CheckCircle2;

              return (
                <div
                  key={step.label}
                  className="grid gap-3 rounded-md border border-border bg-background/70 p-3 sm:grid-cols-[44px_1fr_auto] sm:items-center"
                >
                  <span className="flex size-11 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-bold">{step.label}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                  <span className="flex items-center gap-2 text-xs font-bold text-primary">
                    <span className="h-1.5 w-16 rounded-full bg-primary/70" />
                    0{index + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Clock3 className="size-5 text-primary" />
            <CardTitle>{copy.nextActionsTitle}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {copy.artistChecklist.map((item) => (
              <p key={item} className="flex gap-3 text-sm leading-6">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                {item}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <KeyRound className="size-5 text-primary" />
            <CardTitle>{copy.artistWorkspaceTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {copy.workspaceItems.map((item, index) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-md border border-border bg-background p-3 text-sm font-semibold"
              >
                <span>{item}</span>
                <span
                  className={cn(
                    "h-2 rounded-full",
                    index % 2 === 0 ? "w-20 bg-primary" : "w-14 bg-accent",
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
