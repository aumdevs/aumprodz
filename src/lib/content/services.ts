import {
  Brush,
  Globe2,
  KeyRound,
  MonitorPlay,
  type LucideIcon,
} from "lucide-react";

import type { AppLocale } from "@/lib/i18n/config";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export type ServiceCategory =
  | "youtube-adsense"
  | "paginas-web"
  | "imagen-video"
  | "cuentas-digitales";

export type ServiceSlug = ServiceCategory;

export type Service = {
  slug: ServiceSlug;
  category: ServiceCategory;
  label: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  priceFrom: string;
  duration: string;
  icon: LucideIcon;
  outcomes: string[];
  deliverables: string[];
  modules: string[];
  requirements: string[];
  faqs: { question: string; answer: string }[];
  packages: ServicePackage[];
  ctas: ServiceCta[];
  media: ServiceMedia[];
  whatsappMessage: string;
};

export type ServicePackage = {
  id?: string;
  title: string;
  description: string;
  priceLabel: string;
  duration: string;
  features: string[];
};

export type ServiceCta = {
  id?: string;
  label: string;
  placement: string;
  whatsappMessage: string;
};

export type ServiceMedia = {
  id?: string;
  mediaType: string;
  title: string;
  url: string;
  altText: string;
};

export const serviceCategories = [
  { key: "youtube-adsense", label: "YouTube & AdSense" },
  { key: "paginas-web", label: "Páginas web" },
  { key: "imagen-video", label: "Imagen & video" },
  { key: "cuentas-digitales", label: "Tecnología & cuentas" },
] as const;

export const canonicalServiceSlugs = [
  "youtube-adsense",
  "paginas-web",
  "imagen-video",
  "cuentas-digitales",
] as const;

export const canonicalServiceCategories = canonicalServiceSlugs;

export type CanonicalServiceSlug = (typeof canonicalServiceSlugs)[number];

type SupabaseServiceRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  price_from: string;
  duration: string | null;
  whatsapp_message: string;
  is_active: boolean;
  sort_order: number;
  service_categories?: { key?: string | null } | null;
};

type ServicePackageRow = {
  id: string;
  service_id: string;
  title: string;
  description: string | null;
  price_label: string | null;
  duration: string | null;
  features: unknown;
  is_active: boolean;
  sort_order: number;
};

type ServiceFaqRow = {
  id: string;
  service_id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
};

type ServiceCtaRow = {
  id: string;
  service_id: string;
  label: string;
  placement: string;
  whatsapp_message: string | null;
  is_active: boolean;
  sort_order: number;
};

type ServiceMediaRow = {
  id: string;
  service_id: string;
  media_type: string;
  title: string | null;
  url: string | null;
  alt_text: string | null;
  is_active: boolean;
  sort_order: number;
};

type TranslationRow = {
  entity_type: string;
  entity_id: string;
  locale: AppLocale;
  field_name: string;
  value: string;
};

export const localServices: Service[] = [
  {
    slug: "youtube-adsense",
    category: "youtube-adsense",
    label: "YouTube & AdSense",
    title: "YouTube & AdSense",
    eyebrow: "Diagnóstico y orientación",
    summary:
      "Orientación para canales, monetización, personalización y problemas con AdSense.",
    description:
      "Un servicio para ordenar el estado del canal, detectar bloqueos reales y salir con un plan de acción claro antes de seguir perdiendo tiempo.",
    priceFrom: "$50",
    duration: "1 a 3 sesiones o diagnóstico puntual",
    icon: MonitorPlay,
    outcomes: [
      "Entender qué está frenando el canal o AdSense.",
      "Priorizar acciones que sí mueven el caso.",
      "Tener un checklist limpio para próximos pasos.",
    ],
    deliverables: [
      "Revisión del estado del canal",
      "Plan de acción para monetización o recuperación",
      "Checklist de contenido, marca y configuración",
    ],
    modules: [
      "Diagnóstico del canal",
      "Revisión de monetización y AdSense",
      "Plan de mejoras y siguientes pasos",
    ],
    requirements: [
      "Link del canal",
      "Capturas o mensajes del problema",
      "Acceso del dueño para revisar configuración cuando aplique",
    ],
    faqs: [
      {
        question: "¿Esto garantiza monetización?",
        answer:
          "No. La orientación ayuda a corregir y ordenar el proceso, pero YouTube toma la decisión final.",
      },
      {
        question: "¿Puedo pedir ayuda si mi AdSense tiene problema?",
        answer:
          "Sí. El servicio empieza con una revisión del caso y los documentos disponibles.",
      },
    ],
    packages: [],
    ctas: [],
    media: [],
    whatsappMessage:
      "Hola AUM, vengo desde tu página de YouTube y AdSense. Necesito orientación sobre mi canal.",
  },
  {
    slug: "paginas-web",
    category: "paginas-web",
    label: "Páginas web",
    title: "Páginas web",
    eyebrow: "Web profesional y conversión",
    summary:
      "Landing, web profesional, ecommerce y páginas de servicio para vender con claridad.",
    description:
      "Una web pensada para explicar la oferta, dar confianza y convertir visitas en conversaciones o ventas, sin quedarse en una plantilla bonita.",
    priceFrom: "$250",
    duration: "7 a 21 días según alcance",
    icon: Globe2,
    outcomes: [
      "Presentar servicios con estructura profesional.",
      "Guiar al visitante hacia WhatsApp o formulario.",
      "Quedar listo para escalar a ecommerce o panel privado.",
    ],
    deliverables: [
      "Arquitectura de página y copy inicial",
      "Diseño responsive",
      "Formulario o CTA de conversión",
    ],
    modules: [
      "Estrategia y estructura",
      "Diseño y desarrollo",
      "Revisión final y publicación",
    ],
    requirements: [
      "Objetivo principal de la página",
      "Logo, colores o referencias de marca",
      "Textos, fotos o servicios que deben aparecer",
    ],
    faqs: [
      {
        question: "¿Incluye dominio y hosting?",
        answer:
          "Se puede orientar o configurar según el caso, pero el costo depende del proveedor.",
      },
      {
        question: "¿Puedo pedir ecommerce?",
        answer:
          "Sí. Ecommerce se cotiza como alcance separado por productos, pagos y operación.",
      },
    ],
    packages: [],
    ctas: [],
    media: [],
    whatsappMessage:
      "Hola AUM, vengo desde tu página web. Quiero orientación para crear una página web, landing o ecommerce.",
  },
  {
    slug: "imagen-video",
    category: "imagen-video",
    label: "Imagen & video",
    title: "Imagen & Video",
    eyebrow: "Contenido visual",
    summary:
      "Miniaturas, flyers, branding, edición de videos, reels y contenido visual.",
    description:
      "Piezas visuales para lanzar, anunciar o mejorar presencia digital con entregables claros y formato correcto para cada canal.",
    priceFrom: "$25 / $50",
    duration: "24 a 72 horas para piezas simples",
    icon: Brush,
    outcomes: [
      "Mejorar presentación visual en redes y YouTube.",
      "Recibir archivos listos para publicar.",
      "Mantener estilo consistente entre piezas.",
    ],
    deliverables: [
      "Pieza visual lista para publicar",
      "Versiones según canal",
      "Ajustes según paquete contratado",
    ],
    modules: ["Brief visual", "Producción", "Entrega y ajustes"],
    requirements: [
      "Objetivo de la pieza",
      "Medidas o plataforma donde se publicará",
      "Fotos, logo, texto o referencias visuales",
    ],
    faqs: [
      {
        question: "¿Necesito enviar materiales?",
        answer:
          "Sí. Mientras más claro sea el material inicial, más rápido queda la entrega.",
      },
      {
        question: "¿Hacen contenido para redes?",
        answer:
          "Sí. Se puede preparar contenido vertical, piezas promocionales y miniaturas.",
      },
    ],
    packages: [],
    ctas: [],
    media: [],
    whatsappMessage:
      "Hola AUM, vi tu servicio de imagen y video. Quiero orientación sobre miniaturas, edición o contenido visual.",
  },
  {
    slug: "cuentas-digitales",
    category: "cuentas-digitales",
    label: "Tecnología & cuentas",
    title: "Tecnología & cuentas",
    eyebrow: "Cuentas, acceso y recuperación",
    summary:
      "Creación, administración y recuperación de cuentas bloqueadas o perdidas.",
    description:
      "Un servicio para ayudarte a crear, ordenar, proteger o recuperar cuentas digitales como Instagram, Facebook, Google, YouTube y otras plataformas. Revisamos el caso, vemos qué opciones reales existen y armamos el próximo paso sin prometer resultados imposibles.",
    priceFrom: "$50",
    duration: "Diagnóstico inicial y acompañamiento según el caso",
    icon: KeyRound,
    outcomes: [
      "Entender qué pasó con la cuenta y qué opciones hay.",
      "Ordenar accesos, correos, seguridad y verificación.",
      "Reducir el riesgo de perder otra cuenta por falta de control.",
    ],
    deliverables: [
      "Diagnóstico del problema o necesidad",
      "Guía de pasos para creación, administración o recuperación",
      "Recomendaciones de seguridad para proteger la cuenta",
    ],
    modules: [
      "Revisión del caso y datos disponibles",
      "Plan de acción según plataforma",
      "Acompañamiento y cierre con próximos pasos",
    ],
    requirements: [
      "Correo o teléfono asociado a la cuenta",
      "Capturas del error, bloqueo o aviso recibido",
      "Datos que prueben que la cuenta te pertenece cuando aplique",
    ],
    faqs: [
      {
        question: "¿Garantiza recuperar una cuenta?",
        answer:
          "No. Algunas plataformas toman la decisión final. El servicio ayuda a revisar, ordenar y presentar el caso de la mejor forma posible.",
      },
      {
        question: "¿También crean o administran cuentas nuevas?",
        answer:
          "Sí. Se puede ayudar a crear cuentas, configurar seguridad, ordenar accesos y preparar la cuenta para uso profesional.",
      },
    ],
    packages: [],
    ctas: [],
    media: [],
    whatsappMessage:
      "Hola AUM, necesito ayuda con creación, administración o recuperación de una cuenta digital.",
  },
];

export const services = localServices;

type LocalServiceCopy = Pick<
  Service,
  | "label"
  | "title"
  | "eyebrow"
  | "summary"
  | "description"
  | "duration"
  | "outcomes"
  | "deliverables"
  | "modules"
  | "requirements"
  | "faqs"
  | "whatsappMessage"
>;

const localServiceTranslations: Partial<
  Record<AppLocale, Partial<Record<ServiceSlug, Partial<LocalServiceCopy>>>>
> = {
  ht: {
    "youtube-adsense": {
      label: "YouTube ak AdSense",
      title: "YouTube ak AdSense",
      eyebrow: "Dyagnostik ak oryantasyon",
      summary:
        "Oryantasyon pou chanèl, monetizasyon, pèsonalizasyon ak pwoblèm AdSense.",
      description:
        "Yon sèvis pou mete chanèl ou an lòd, wè blokaj reyèl yo epi soti ak yon plan aksyon klè.",
      duration: "1 a 3 sesyon oswa yon dyagnostik presi",
      outcomes: [
        "Konprann sa ki bloke chanèl la oswa AdSense.",
        "Mete aksyon ki pi enpòtan yo an premye.",
        "Gen yon lis etap pwòp pou kontinye.",
      ],
      deliverables: [
        "Revizyon eta chanèl la",
        "Plan aksyon pou monetizasyon oswa rekiperasyon",
        "Lis verifikasyon pou kontni, mak ak konfigirasyon",
      ],
      modules: [
        "Dyagnostik chanèl la",
        "Revizyon monetizasyon ak AdSense",
        "Plan amelyorasyon ak pwochen etap",
      ],
      requirements: [
        "Lyen chanèl la",
        "Kaptir oswa mesaj pwoblèm nan",
        "Aksè pwopriyetè a pou verifye konfigirasyon lè sa nesesè",
      ],
      faqs: [
        {
          question: "Èske sa garanti monetizasyon?",
          answer:
            "Non. Oryantasyon an ede korije ak mete pwosesis la an lòd, men YouTube pran desizyon final la.",
        },
        {
          question: "Èske mwen ka mande èd si AdSense mwen gen pwoblèm?",
          answer:
            "Wi. Sèvis la kòmanse ak yon revizyon ka a ak dokiman ki disponib yo.",
        },
      ],
      whatsappMessage:
        "Bonjou AUM, mwen soti sou paj YouTube ak AdSense ou a. Mwen bezwen oryantasyon pou chanèl mwen.",
    },
    "paginas-web": {
      label: "Sit entènèt",
      title: "Sit entènèt",
      eyebrow: "Sit pwofesyonèl ak konvèsyon",
      summary:
        "Landing page, sit pwofesyonèl, ecommerce ak paj sèvis pou vann ak klète.",
      description:
        "Yon sit ki fèt pou esplike òf ou, bay konfyans epi fè vizitè yo vin kliyan oswa kontakte w.",
      duration: "7 a 21 jou selon travay la",
      outcomes: [
        "Prezante sèvis ou yo ak estrikti pwofesyonèl.",
        "Gide vizitè a sou WhatsApp oswa fòm kontak.",
        "Prepare baz la pou ecommerce oswa panèl prive.",
      ],
      deliverables: [
        "Estrikti paj la ak premye tèks yo",
        "Dizayn ki mache sou telefòn ak òdinatè",
        "Fòm oswa bouton pou konvèsyon",
      ],
      modules: ["Estrateji ak estrikti", "Dizayn ak devlopman", "Revizyon final ak piblikasyon"],
      requirements: [
        "Objektif prensipal paj la",
        "Logo, koulè oswa referans mak",
        "Tèks, foto oswa sèvis ki dwe parèt",
      ],
      faqs: [
        {
          question: "Èske domèn ak hosting ladan?",
          answer:
            "Mwen ka oryante oswa konfigire sa selon ka a, men pri a depann de founisè a.",
        },
        {
          question: "Èske mwen ka mande ecommerce?",
          answer:
            "Wi. Ecommerce evalye apa selon pwodwi, peman ak operasyon.",
        },
      ],
      whatsappMessage:
        "Bonjou AUM, mwen vle oryantasyon pou kreye yon sit entènèt, landing page oswa ecommerce.",
    },
    "imagen-video": {
      label: "Imaj ak videyo",
      title: "Imaj ak videyo",
      eyebrow: "Kontni vizyèl",
      summary:
        "Miniati, flyers, branding, edit videyo, reels ak kontni vizyèl.",
      description:
        "Pyes vizyèl pou lanse, anonse oswa amelyore prezans dijital ou ak fichye ki pare pou chak kanal.",
      duration: "24 a 72 èdtan pou pyes senp",
      outcomes: [
        "Amelyore prezantasyon vizyèl sou rezo ak YouTube.",
        "Resevwa fichye ki pare pou pibliye.",
        "Kenbe menm stil ant diferan pyes yo.",
      ],
      deliverables: [
        "Pyes vizyèl pare pou pibliye",
        "Vèsyon selon chak kanal",
        "Ajisteman selon pakè a",
      ],
      modules: ["Brief vizyèl", "Pwodiksyon", "Livrezon ak ajisteman"],
      requirements: [
        "Objektif pyes la",
        "Dimansyon oswa platfòm kote l ap pibliye",
        "Foto, logo, tèks oswa referans vizyèl",
      ],
      faqs: [
        {
          question: "Èske mwen dwe voye materyèl?",
          answer:
            "Wi. Plis materyèl la klè depi nan kòmansman, se plis livrezon an rapid.",
        },
        {
          question: "Èske nou fè kontni pou rezo sosyal?",
          answer:
            "Wi. Nou ka prepare kontni vètikal, pyes pwomosyonèl ak miniati.",
        },
      ],
      whatsappMessage:
        "Bonjou AUM, mwen wè sèvis imaj ak videyo ou a. Mwen bezwen oryantasyon sou miniati, edit oswa kontni vizyèl.",
    },
    "cuentas-digitales": {
      label: "Kont dijital",
      title: "Kont dijital",
      eyebrow: "Kont, aksè ak rekiperasyon",
      summary:
        "Kreyasyon, administrasyon ak rekiperasyon kont ki bloke oswa pèdi.",
      description:
        "Yon sèvis pou ede w kreye, mete an lòd, pwoteje oswa rekipere kont dijital tankou Instagram, Facebook, Google, YouTube ak lòt platfòm.",
      duration: "Dyagnostik inisyal ak akonpayman selon ka a",
      outcomes: [
        "Konprann sa ki pase ak kont lan ak opsyon ki genyen.",
        "Mete aksè, imèl, sekirite ak verifikasyon an lòd.",
        "Diminye risk pou pèdi lòt kont ankò.",
      ],
      deliverables: [
        "Dyagnostik pwoblèm nan oswa bezwen an",
        "Gid etap pou kreyasyon, administrasyon oswa rekiperasyon",
        "Rekòmandasyon sekirite pou pwoteje kont lan",
      ],
      modules: [
        "Revizyon ka a ak done ki disponib",
        "Plan aksyon selon platfòm nan",
        "Akonpayman ak pwochen etap",
      ],
      requirements: [
        "Imèl oswa telefòn ki asosye ak kont lan",
        "Kaptir erè, blokaj oswa avi ou resevwa",
        "Done ki pwouve kont lan se pa w lè sa nesesè",
      ],
      faqs: [
        {
          question: "Èske rekiperasyon kont lan garanti?",
          answer:
            "Non. Gen platfòm ki pran desizyon final la. Sèvis la ede mete dosye a pi byen.",
        },
        {
          question: "Èske nou ka kreye oswa administre kont nouvo?",
          answer:
            "Wi. Nou ka ede kreye kont, konfigire sekirite, òganize aksè epi prepare kont lan pou itilizasyon pwofesyonèl.",
        },
      ],
      whatsappMessage:
        "Bonjou AUM, mwen bezwen èd ak kreyasyon, administrasyon oswa rekiperasyon yon kont dijital.",
    },
  },
  en: {
    "youtube-adsense": {
      label: "YouTube & AdSense",
      title: "YouTube & AdSense",
      eyebrow: "Diagnosis and guidance",
      summary: "Guidance for channels, monetization, customization and AdSense issues.",
      description:
        "A service to organize your channel status, identify real blockers and leave with a clear action plan.",
      duration: "1 to 3 sessions or a focused diagnosis",
      outcomes: ["Understand what is blocking the channel or AdSense.", "Prioritize the actions that matter.", "Leave with a clean checklist for next steps."],
      deliverables: ["Channel status review", "Monetization or recovery action plan", "Content, brand and setup checklist"],
      modules: ["Channel diagnosis", "Monetization and AdSense review", "Improvement plan and next steps"],
      requirements: ["Channel link", "Screenshots or messages about the issue", "Owner access to review settings when needed"],
      faqs: [
        { question: "Does this guarantee monetization?", answer: "No. The guidance helps correct and organize the process, but YouTube makes the final decision." },
        { question: "Can I ask for help if my AdSense has an issue?", answer: "Yes. The service starts with a review of the case and available documents." },
      ],
      whatsappMessage: "Hi AUM, I came from your YouTube and AdSense page. I need guidance for my channel.",
    },
    "paginas-web": {
      label: "Websites",
      title: "Websites",
      eyebrow: "Professional web and conversion",
      summary: "Landing pages, professional websites, ecommerce and service pages built to sell clearly.",
      description:
        "A website designed to explain your offer, build trust and turn visitors into conversations or sales.",
      duration: "7 to 21 days depending on scope",
      outcomes: ["Present services with a professional structure.", "Guide visitors to WhatsApp or a form.", "Prepare the base for ecommerce or a private panel."],
      deliverables: ["Page architecture and initial copy", "Responsive design", "Conversion form or CTA"],
      modules: ["Strategy and structure", "Design and development", "Final review and publishing"],
      requirements: ["Main goal of the page", "Logo, colors or brand references", "Text, photos or services that must appear"],
      faqs: [
        { question: "Does it include domain and hosting?", answer: "I can guide or configure it depending on the case, but the cost depends on the provider." },
        { question: "Can I request ecommerce?", answer: "Yes. Ecommerce is quoted separately depending on products, payments and operations." },
      ],
      whatsappMessage: "Hi AUM, I want guidance to create a website, landing page or ecommerce.",
    },
    "imagen-video": {
      label: "Image & Video",
      title: "Image & Video",
      eyebrow: "Visual content",
      summary: "Thumbnails, flyers, branding, video editing, reels and visual content.",
      description:
        "Visual pieces to launch, announce or improve your digital presence with files ready for each channel.",
      duration: "24 to 72 hours for simple pieces",
      outcomes: ["Improve visual presentation on social media and YouTube.", "Receive files ready to publish.", "Keep a consistent style across pieces."],
      deliverables: ["Visual piece ready to publish", "Versions by channel", "Adjustments according to the package"],
      modules: ["Visual brief", "Production", "Delivery and adjustments"],
      requirements: ["Goal of the piece", "Size or platform where it will be published", "Photos, logo, text or visual references"],
      faqs: [
        { question: "Do I need to send materials?", answer: "Yes. The clearer the initial material, the faster the delivery." },
        { question: "Do you create content for social media?", answer: "Yes. We can prepare vertical content, promotional pieces and thumbnails." },
      ],
      whatsappMessage: "Hi AUM, I saw your image and video service. I need guidance on thumbnails, editing or visual content.",
    },
    "cuentas-digitales": {
      label: "Digital accounts",
      title: "Digital accounts",
      eyebrow: "Accounts, access and recovery",
      summary: "Creation, management and recovery of blocked or lost accounts.",
      description:
        "A service to help create, organize, protect or recover digital accounts like Instagram, Facebook, Google, YouTube and other platforms.",
      duration: "Initial diagnosis and support depending on the case",
      outcomes: ["Understand what happened to the account and the available options.", "Organize access, emails, security and verification.", "Reduce the risk of losing another account."],
      deliverables: ["Diagnosis of the problem or need", "Step-by-step guide for creation, management or recovery", "Security recommendations to protect the account"],
      modules: ["Case and available data review", "Action plan by platform", "Support and next steps"],
      requirements: ["Email or phone linked to the account", "Screenshots of the error, block or notice", "Proof that the account belongs to you when needed"],
      faqs: [
        { question: "Is account recovery guaranteed?", answer: "No. Some platforms make the final decision. The service helps organize and present the case in the best way." },
        { question: "Can you also create or manage new accounts?", answer: "Yes. We can help create accounts, configure security, organize access and prepare the account for professional use." },
      ],
      whatsappMessage: "Hi AUM, I need help with creating, managing or recovering a digital account.",
    },
  },
  fr: {
    "youtube-adsense": {
      label: "YouTube et AdSense",
      title: "YouTube et AdSense",
      eyebrow: "Diagnostic et orientation",
      summary: "Orientation pour chaînes, monétisation, personnalisation et problèmes AdSense.",
      description: "Un service pour organiser l'état de votre chaîne, détecter les vrais blocages et repartir avec un plan clair.",
      duration: "1 à 3 sessions ou diagnostic ponctuel",
      outcomes: ["Comprendre ce qui bloque la chaîne ou AdSense.", "Prioriser les actions utiles.", "Avoir une liste d'étapes claire."],
      deliverables: ["Révision de l'état de la chaîne", "Plan d'action pour monétisation ou récupération", "Checklist contenu, marque et configuration"],
      modules: ["Diagnostic de la chaîne", "Révision monétisation et AdSense", "Plan d'amélioration et prochaines étapes"],
      requirements: ["Lien de la chaîne", "Captures ou messages du problème", "Accès propriétaire si nécessaire"],
      faqs: [
        { question: "Est-ce que cela garantit la monétisation?", answer: "Non. L'orientation aide à corriger et organiser, mais YouTube prend la décision finale." },
        { question: "Puis-je demander de l'aide pour AdSense?", answer: "Oui. Le service commence par une révision du cas et des documents disponibles." },
      ],
      whatsappMessage: "Bonjour AUM, je viens de votre page YouTube et AdSense. J'ai besoin d'orientation pour ma chaîne.",
    },
    "paginas-web": {
      label: "Sites web",
      title: "Sites web",
      eyebrow: "Web professionnel et conversion",
      summary: "Landing pages, sites professionnels, ecommerce et pages de service pour vendre clairement.",
      description: "Un site pensé pour expliquer votre offre, donner confiance et transformer les visites en conversations ou ventes.",
      duration: "7 à 21 jours selon le périmètre",
      outcomes: ["Présenter les services avec une structure professionnelle.", "Guider le visiteur vers WhatsApp ou un formulaire.", "Préparer la base pour ecommerce ou espace privé."],
      deliverables: ["Architecture de page et premiers textes", "Design responsive", "Formulaire ou CTA de conversion"],
      modules: ["Stratégie et structure", "Design et développement", "Révision finale et publication"],
      requirements: ["Objectif principal de la page", "Logo, couleurs ou références de marque", "Textes, photos ou services à afficher"],
      faqs: [
        { question: "Le domaine et l'hébergement sont-ils inclus?", answer: "Je peux orienter ou configurer selon le cas, mais le coût dépend du fournisseur." },
        { question: "Puis-je demander un ecommerce?", answer: "Oui. L'ecommerce est chiffré séparément selon produits, paiements et opérations." },
      ],
      whatsappMessage: "Bonjour AUM, je veux une orientation pour créer un site web, une landing page ou un ecommerce.",
    },
    "imagen-video": {
      label: "Image et vidéo",
      title: "Image et vidéo",
      eyebrow: "Contenu visuel",
      summary: "Miniatures, flyers, branding, montage vidéo, reels et contenu visuel.",
      description: "Des pièces visuelles pour lancer, annoncer ou améliorer votre présence digitale avec des fichiers prêts pour chaque canal.",
      duration: "24 à 72 heures pour les pièces simples",
      outcomes: ["Améliorer la présentation visuelle sur réseaux et YouTube.", "Recevoir des fichiers prêts à publier.", "Garder un style cohérent."],
      deliverables: ["Pièce visuelle prête à publier", "Versions selon le canal", "Ajustements selon le forfait"],
      modules: ["Brief visuel", "Production", "Livraison et ajustements"],
      requirements: ["Objectif de la pièce", "Format ou plateforme de publication", "Photos, logo, texte ou références visuelles"],
      faqs: [
        { question: "Dois-je envoyer des éléments?", answer: "Oui. Plus le matériel initial est clair, plus la livraison est rapide." },
        { question: "Créez-vous du contenu pour les réseaux?", answer: "Oui. Nous pouvons préparer contenu vertical, pièces promotionnelles et miniatures." },
      ],
      whatsappMessage: "Bonjour AUM, j'ai vu votre service image et vidéo. J'ai besoin d'orientation sur miniatures, montage ou contenu visuel.",
    },
    "cuentas-digitales": {
      label: "Comptes digitaux",
      title: "Comptes digitaux",
      eyebrow: "Comptes, accès et récupération",
      summary: "Création, gestion et récupération de comptes bloqués ou perdus.",
      description: "Un service pour créer, organiser, protéger ou récupérer des comptes comme Instagram, Facebook, Google, YouTube et autres plateformes.",
      duration: "Diagnostic initial et accompagnement selon le cas",
      outcomes: ["Comprendre ce qui est arrivé au compte et les options.", "Organiser accès, emails, sécurité et vérification.", "Réduire le risque de perdre un autre compte."],
      deliverables: ["Diagnostic du problème ou besoin", "Guide d'étapes pour création, gestion ou récupération", "Recommandations de sécurité"],
      modules: ["Révision du cas et des données", "Plan d'action selon la plateforme", "Accompagnement et prochaines étapes"],
      requirements: ["Email ou téléphone lié au compte", "Captures de l'erreur, blocage ou avis", "Preuves de propriété si nécessaire"],
      faqs: [
        { question: "La récupération est-elle garantie?", answer: "Non. Certaines plateformes prennent la décision finale. Le service aide à organiser le dossier." },
        { question: "Pouvez-vous créer ou gérer de nouveaux comptes?", answer: "Oui. Nous pouvons aider à créer, sécuriser et organiser les accès." },
      ],
      whatsappMessage: "Bonjour AUM, j'ai besoin d'aide pour créer, gérer ou récupérer un compte digital.",
    },
  },
  pt: {
    "youtube-adsense": {
      label: "YouTube e AdSense",
      title: "YouTube e AdSense",
      eyebrow: "Diagnóstico e orientação",
      summary: "Orientação para canais, monetização, personalização e problemas com AdSense.",
      description: "Um serviço para organizar o estado do canal, detectar bloqueios reais e sair com um plano claro.",
      duration: "1 a 3 sessões ou diagnóstico pontual",
      outcomes: ["Entender o que trava o canal ou o AdSense.", "Priorizar ações que importam.", "Ter uma lista limpa de próximos passos."],
      deliverables: ["Revisão do estado do canal", "Plano de ação para monetização ou recuperação", "Checklist de conteúdo, marca e configuração"],
      modules: ["Diagnóstico do canal", "Revisão de monetização e AdSense", "Plano de melhorias e próximos passos"],
      requirements: ["Link do canal", "Capturas ou mensagens do problema", "Acesso do dono quando necessário"],
      faqs: [
        { question: "Isso garante monetização?", answer: "Não. A orientação ajuda a corrigir e organizar, mas o YouTube toma a decisão final." },
        { question: "Posso pedir ajuda se meu AdSense tem problema?", answer: "Sim. O serviço começa com revisão do caso e documentos disponíveis." },
      ],
      whatsappMessage: "Olá AUM, vim da sua página de YouTube e AdSense. Preciso de orientação para meu canal.",
    },
    "paginas-web": {
      label: "Sites",
      title: "Sites",
      eyebrow: "Web profissional e conversão",
      summary: "Landing pages, sites profissionais, ecommerce e páginas de serviço para vender com clareza.",
      description: "Um site pensado para explicar sua oferta, gerar confiança e transformar visitas em conversas ou vendas.",
      duration: "7 a 21 dias conforme o escopo",
      outcomes: ["Apresentar serviços com estrutura profissional.", "Guiar o visitante ao WhatsApp ou formulário.", "Preparar a base para ecommerce ou painel privado."],
      deliverables: ["Arquitetura da página e textos iniciais", "Design responsivo", "Formulário ou CTA de conversão"],
      modules: ["Estratégia e estrutura", "Design e desenvolvimento", "Revisão final e publicação"],
      requirements: ["Objetivo principal da página", "Logo, cores ou referências de marca", "Textos, fotos ou serviços que devem aparecer"],
      faqs: [
        { question: "Inclui domínio e hospedagem?", answer: "Posso orientar ou configurar conforme o caso, mas o custo depende do provedor." },
        { question: "Posso pedir ecommerce?", answer: "Sim. Ecommerce é orçado separadamente conforme produtos, pagamentos e operação." },
      ],
      whatsappMessage: "Olá AUM, quero orientação para criar um site, landing page ou ecommerce.",
    },
    "imagen-video": {
      label: "Imagem e vídeo",
      title: "Imagem e vídeo",
      eyebrow: "Conteúdo visual",
      summary: "Miniaturas, flyers, branding, edição de vídeos, reels e conteúdo visual.",
      description: "Peças visuais para lançar, anunciar ou melhorar sua presença digital com arquivos prontos para cada canal.",
      duration: "24 a 72 horas para peças simples",
      outcomes: ["Melhorar a apresentação visual em redes e YouTube.", "Receber arquivos prontos para publicar.", "Manter estilo consistente entre peças."],
      deliverables: ["Peça visual pronta para publicar", "Versões por canal", "Ajustes conforme o pacote"],
      modules: ["Brief visual", "Produção", "Entrega e ajustes"],
      requirements: ["Objetivo da peça", "Medida ou plataforma onde será publicada", "Fotos, logo, texto ou referências visuais"],
      faqs: [
        { question: "Preciso enviar materiais?", answer: "Sim. Quanto mais claro o material inicial, mais rápida a entrega." },
        { question: "Vocês fazem conteúdo para redes?", answer: "Sim. Podemos preparar conteúdo vertical, peças promocionais e miniaturas." },
      ],
      whatsappMessage: "Olá AUM, vi seu serviço de imagem e vídeo. Preciso de orientação sobre miniaturas, edição ou conteúdo visual.",
    },
    "cuentas-digitales": {
      label: "Contas digitais",
      title: "Contas digitais",
      eyebrow: "Contas, acesso e recuperação",
      summary: "Criação, administração e recuperação de contas bloqueadas ou perdidas.",
      description: "Um serviço para criar, organizar, proteger ou recuperar contas digitais como Instagram, Facebook, Google, YouTube e outras plataformas.",
      duration: "Diagnóstico inicial e acompanhamento conforme o caso",
      outcomes: ["Entender o que aconteceu com a conta e as opções.", "Organizar acessos, emails, segurança e verificação.", "Reduzir o risco de perder outra conta."],
      deliverables: ["Diagnóstico do problema ou necessidade", "Guia de passos para criação, administração ou recuperação", "Recomendações de segurança"],
      modules: ["Revisão do caso e dados disponíveis", "Plano de ação por plataforma", "Acompanhamento e próximos passos"],
      requirements: ["Email ou telefone associado à conta", "Capturas do erro, bloqueio ou aviso", "Provas de propriedade quando necessário"],
      faqs: [
        { question: "A recuperação é garantida?", answer: "Não. Algumas plataformas tomam a decisão final. O serviço ajuda a organizar e apresentar melhor o caso." },
        { question: "Também criam ou administram contas novas?", answer: "Sim. Podemos ajudar a criar contas, configurar segurança, organizar acessos e preparar para uso profissional." },
      ],
      whatsappMessage: "Olá AUM, preciso de ajuda com criação, administração ou recuperação de uma conta digital.",
    },
  },
};

function getLocalizedLocalServices(locale: AppLocale = "ht") {
  const translations = localServiceTranslations[locale];

  if (!translations) {
    return localServices;
  }

  return localServices.map((service) => ({
    ...service,
    ...(translations[service.slug] ?? {}),
  }));
}

export function normalizeServiceSlug(slug: string | null | undefined) {
  if (!slug) {
    return null;
  }

  if (slug === "artistas" || slug === "artista") {
    return null;
  }

  return slug;
}

export function isCanonicalServiceSlug(
  value: string | null | undefined,
): value is CanonicalServiceSlug {
  return canonicalServiceSlugs.includes(value as CanonicalServiceSlug);
}

export function getServiceBySlug(slug: string | null | undefined) {
  const normalizedSlug = normalizeServiceSlug(slug);

  return localServices.find((service) => service.slug === normalizedSlug);
}

export async function getPublicServices({
  includeInactive = false,
  locale = "ht",
}: {
  includeInactive?: boolean;
  locale?: AppLocale;
} = {}) {
  const baseServices = getLocalizedLocalServices(locale);
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return baseServices;
  }

  const { data, error } = await supabase
    .from("services")
    .select(
      "id,slug,title,summary,price_from,duration,whatsapp_message,is_active,sort_order,service_categories(key)",
    )
    .in("slug", [...canonicalServiceSlugs])
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return baseServices;
  }

  const serviceRows = (data as SupabaseServiceRow[]).filter((row) =>
    isCanonicalServiceSlug(normalizeServiceSlug(row.slug)),
  );
  const rowsBySlug = new Map(
    serviceRows.map((row) => [normalizeServiceSlug(row.slug), row]),
  );
  const serviceIds = serviceRows.map((row) => row.id);
  const related = await getServiceCmsRelatedRows(serviceIds);
  const translations = await getTranslationsForEntities({
    entityIds: [
      ...serviceIds,
      ...related.packages.map((item) => item.id),
      ...related.faqs.map((item) => item.id),
      ...related.ctas.map((item) => item.id),
      ...related.media.map((item) => item.id),
    ],
    locale,
  });

  return baseServices
    .map((service) => {
      const row = rowsBySlug.get(service.slug);

      if (!row) {
        return service;
      }

      return mergeServiceWithSupabaseRow({
        service,
        row,
        related,
        translations,
        locale,
      });
    })
    .filter((service) => {
      if (includeInactive) {
        return true;
      }

      const row = rowsBySlug.get(service.slug);
      return row ? row.is_active : true;
    });
}

export async function getPublicServiceBySlug(
  slug: string | null | undefined,
  locale: AppLocale = "ht",
) {
  const normalizedSlug = normalizeServiceSlug(slug);

  if (!isCanonicalServiceSlug(normalizedSlug)) {
    return null;
  }

  const services = await getPublicServices({ locale });
  return services.find((service) => service.slug === normalizedSlug) ?? null;
}

function mergeServiceWithSupabaseRow({
  locale,
  service,
  row,
  related,
  translations,
}: {
  service: Service;
  row: SupabaseServiceRow;
  related: ServiceCmsRelatedRows;
  translations: TranslationMap;
  locale: AppLocale;
}) {
  const translated = createEntityTranslator(translations, "services", row.id, locale);
  const useCmsFallback = locale === "es";
  const packages = related.packages
    .filter((item) => item.service_id === row.id && item.is_active)
    .sort(sortByOrder)
    .map((item) => {
      const itemT = createEntityTranslator(
        translations,
        "service_packages",
        item.id,
        locale,
      );

      return {
        id: item.id,
        title: itemT("title", useCmsFallback ? item.title : ""),
        description: itemT(
          "description",
          useCmsFallback ? item.description ?? "" : "",
        ),
        priceLabel: itemT(
          "price_label",
          useCmsFallback ? item.price_label ?? "" : "",
        ),
        duration: itemT("duration", useCmsFallback ? item.duration ?? "" : ""),
        features: translateList(
          itemT("features", ""),
          useCmsFallback ? normalizeStringArray(item.features) : [],
        ),
      };
    })
    .filter((item) => item.title || item.description);
  const faqs = related.faqs
    .filter((item) => item.service_id === row.id && item.is_active)
    .sort(sortByOrder)
    .map((item) => {
      const itemT = createEntityTranslator(translations, "service_faqs", item.id, locale);

      return {
        question: itemT("question", useCmsFallback ? item.question : ""),
        answer: itemT("answer", useCmsFallback ? item.answer : ""),
      };
    })
    .filter((item) => item.question && item.answer);
  const ctas = related.ctas
    .filter((item) => item.service_id === row.id && item.is_active)
    .sort(sortByOrder)
    .map((item) => {
      const itemT = createEntityTranslator(translations, "service_ctas", item.id, locale);

      return {
        id: item.id,
        label: itemT("label", useCmsFallback ? item.label : ""),
        placement: item.placement,
        whatsappMessage: itemT(
          "whatsapp_message",
          useCmsFallback ? item.whatsapp_message ?? "" : "",
        ),
      };
    })
    .filter((item) => item.label);
  const media = related.media
    .filter((item) => item.service_id === row.id && item.is_active)
    .sort(sortByOrder)
    .map((item) => {
      const itemT = createEntityTranslator(translations, "service_media", item.id, locale);

      return {
        id: item.id,
        mediaType: item.media_type,
        title: itemT("title", useCmsFallback ? item.title ?? "" : ""),
        url: item.url ?? "",
        altText: itemT("alt_text", useCmsFallback ? item.alt_text ?? "" : ""),
      };
    })
    .filter((item) => item.url);

  return {
    ...service,
    title: translated("title", useCmsFallback ? row.title || service.title : service.title),
    label: translated("title", useCmsFallback ? row.title || service.label : service.label),
    summary: translated("summary", useCmsFallback ? row.summary || service.summary : service.summary),
    description: translated("description", service.description),
    eyebrow: translated("eyebrow", service.eyebrow),
    priceFrom: translated("price_from", useCmsFallback ? row.price_from || service.priceFrom : service.priceFrom),
    duration: translated("duration", useCmsFallback ? row.duration || service.duration : service.duration),
    deliverables: translateList(translated("deliverables", ""), service.deliverables),
    modules: translateList(translated("modules", ""), service.modules),
    outcomes: translateList(translated("outcomes", ""), service.outcomes),
    requirements: translateList(translated("requirements", ""), service.requirements),
    faqs: faqs.length > 0 ? faqs : service.faqs,
    packages,
    ctas,
    media,
    whatsappMessage: translated(
      "whatsapp_message",
      row.whatsapp_message || service.whatsappMessage,
    ),
  };
}

type ServiceCmsRelatedRows = {
  packages: ServicePackageRow[];
  faqs: ServiceFaqRow[];
  ctas: ServiceCtaRow[];
  media: ServiceMediaRow[];
};

type TranslationMap = Map<string, string>;

async function getServiceCmsRelatedRows(serviceIds: string[]): Promise<ServiceCmsRelatedRows> {
  const supabase = createServiceSupabaseClient();

  if (!supabase || serviceIds.length === 0) {
    return { packages: [], faqs: [], ctas: [], media: [] };
  }

  const [packages, faqs, ctas, media] = await Promise.all([
    supabase
      .from("service_packages")
      .select("id,service_id,title,description,price_label,duration,features,is_active,sort_order")
      .in("service_id", serviceIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("service_faqs")
      .select("id,service_id,question,answer,is_active,sort_order")
      .in("service_id", serviceIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("service_ctas")
      .select("id,service_id,label,placement,whatsapp_message,is_active,sort_order")
      .in("service_id", serviceIds)
      .order("sort_order", { ascending: true }),
    supabase
      .from("service_media")
      .select("id,service_id,media_type,title,url,alt_text,is_active,sort_order")
      .in("service_id", serviceIds)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    packages: (packages.data ?? []) as ServicePackageRow[],
    faqs: (faqs.data ?? []) as ServiceFaqRow[],
    ctas: (ctas.data ?? []) as ServiceCtaRow[],
    media: (media.data ?? []) as ServiceMediaRow[],
  };
}

async function getTranslationsForEntities({
  entityIds,
  locale,
}: {
  entityIds: string[];
  locale: AppLocale;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase || entityIds.length === 0) {
    return new Map<string, string>();
  }

  const { data } = await supabase
    .from("content_translations")
    .select("entity_type,entity_id,locale,field_name,value")
    .in("entity_id", entityIds)
    .in("locale", [locale, "ht"]);

  const map = new Map<string, string>();

  for (const item of (data ?? []) as TranslationRow[]) {
    const key = translationKey(item.entity_type, item.entity_id, item.locale, item.field_name);
    map.set(key, item.value);
  }

  return map;
}

function createEntityTranslator(
  translations: TranslationMap,
  entityType: string,
  entityId: string,
  locale: AppLocale,
) {
  return (fieldName: string, fallback: string) => {
    for (const candidateLocale of [locale, "ht"] as AppLocale[]) {
      const value = translations.get(
        translationKey(entityType, entityId, candidateLocale, fieldName),
      );

      if (value?.trim()) {
        return value.trim();
      }
    }

    return fallback;
  };
}

function translationKey(
  entityType: string,
  entityId: string,
  locale: AppLocale,
  fieldName: string,
) {
  return `${entityType}:${entityId}:${locale}:${fieldName}`;
}

function normalizeStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return [];
}

function translateList(value: string, fallback: string[]) {
  const items = value
    .split(/\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : fallback;
}

function sortByOrder(a: { sort_order: number }, b: { sort_order: number }) {
  return a.sort_order - b.sort_order;
}
