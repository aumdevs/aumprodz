import { PublicEventTracker } from "@/components/public/public-event-tracker";
import {
  getPublicServices,
  isCanonicalServiceSlug,
  type Service,
} from "@/lib/content/services";
import { getCurrentLocale } from "@/lib/i18n/server";
import {
  ServicesBrowser,
  type ServiceBrowserItem,
} from "./services-browser";

export const metadata = {
  title: "Servicios",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string }>;
}) {
  const locale = await getCurrentLocale();
  const { servicio } = await searchParams;
  const services = await getPublicServices({ locale });
  const initialServiceSlug = isCanonicalServiceSlug(servicio) ? servicio : undefined;

  return (
    <section className="flex min-h-[calc(100svh-5.5rem)] overflow-hidden py-2 sm:py-5">
      <PublicEventTracker
        eventName="page_view"
        page="/servicios"
        source="services"
      />
      <div className="public-shell flex min-h-0 flex-1">
        <ServicesBrowser
          initialServiceSlug={initialServiceSlug}
          locale={locale}
          services={services.map(serializeService)}
        />
      </div>
    </section>
  );
}

function serializeService(service: Service): ServiceBrowserItem {
  return {
    slug: service.slug,
    category: service.category,
    label: service.label,
    title: service.title,
    eyebrow: service.eyebrow,
    summary: service.summary,
    description: service.description,
    priceFrom: service.priceFrom,
    duration: service.duration,
    outcomes: service.outcomes,
    deliverables: service.deliverables,
    modules: service.modules,
    requirements: service.requirements,
    packages: service.packages,
    ctas: service.ctas,
    media: service.media,
    whatsappMessage: service.whatsappMessage,
  };
}
