import { notFound, redirect } from "next/navigation";

import {
  isCanonicalServiceSlug,
  localServices,
} from "@/lib/content/services";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return localServices.map((service) => ({ slug: service.slug }));
}

export default async function ServiceDetailRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isCanonicalServiceSlug(slug)) {
    notFound();
  }

  redirect(`/servicios?servicio=${slug}`);
}
