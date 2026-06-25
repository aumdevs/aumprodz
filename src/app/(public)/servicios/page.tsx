import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { getPublicServices, type Service } from "@/lib/content/services";
import { getCurrentLocale } from "@/lib/i18n/server";
import {
  ServicesBrowser,
  type ServiceBrowserItem,
} from "./services-browser";

export const metadata = {
  title: "Servicios",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const locale = await getCurrentLocale();
  const services = await getPublicServices({ locale });

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PublicEventTracker
        eventName="page_view"
        page="/servicios"
        source="services"
      />
      <ServicesBrowser services={services.map(serializeService)} />
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
    faqs: service.faqs,
    packages: service.packages,
    ctas: service.ctas,
    media: service.media,
    whatsappMessage: service.whatsappMessage,
  };
}
