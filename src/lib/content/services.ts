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
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return includeInactive ? localServices : localServices;
  }

  const { data, error } = await supabase
    .from("services")
    .select(
      "id,slug,title,summary,price_from,duration,whatsapp_message,is_active,sort_order,service_categories(key)",
    )
    .in("slug", [...canonicalServiceSlugs])
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return localServices;
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

  return localServices
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
        title: itemT("title", item.title),
        description: itemT("description", item.description ?? ""),
        priceLabel: itemT("price_label", item.price_label ?? ""),
        duration: itemT("duration", item.duration ?? ""),
        features: normalizeStringArray(item.features),
      };
    });
  const faqs = related.faqs
    .filter((item) => item.service_id === row.id && item.is_active)
    .sort(sortByOrder)
    .map((item) => {
      const itemT = createEntityTranslator(translations, "service_faqs", item.id, locale);

      return {
        question: itemT("question", item.question),
        answer: itemT("answer", item.answer),
      };
    });
  const ctas = related.ctas
    .filter((item) => item.service_id === row.id && item.is_active)
    .sort(sortByOrder)
    .map((item) => {
      const itemT = createEntityTranslator(translations, "service_ctas", item.id, locale);

      return {
        id: item.id,
        label: itemT("label", item.label),
        placement: item.placement,
        whatsappMessage: itemT("whatsapp_message", item.whatsapp_message ?? ""),
      };
    });
  const media = related.media
    .filter((item) => item.service_id === row.id && item.is_active)
    .sort(sortByOrder)
    .map((item) => {
      const itemT = createEntityTranslator(translations, "service_media", item.id, locale);

      return {
        id: item.id,
        mediaType: item.media_type,
        title: itemT("title", item.title ?? ""),
        url: item.url ?? "",
        altText: itemT("alt_text", item.alt_text ?? ""),
      };
    })
    .filter((item) => item.url);

  return {
    ...service,
    title: translated("title", row.title || service.title),
    label: translated("title", row.title || service.label),
    summary: translated("summary", row.summary || service.summary),
    description: translated("description", service.description),
    eyebrow: translated("eyebrow", service.eyebrow),
    priceFrom: translated("price_from", row.price_from || service.priceFrom),
    duration: translated("duration", row.duration || service.duration),
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
