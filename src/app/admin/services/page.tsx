import { CheckCircle2, Save, XCircle } from "lucide-react";

import {
  updateServiceAction,
  updateServiceTranslationAction,
  upsertServiceCtaAction,
  upsertServiceFaqAction,
  upsertServiceMediaAction,
  upsertServicePackageAction,
} from "@/app/admin/services/actions";
import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type AdminContentTranslationRecord,
  type AdminServiceCtaRecord,
  type AdminServiceFaqRecord,
  type AdminServiceMediaRecord,
  type AdminServicePackageRecord,
  getAdminServicesData,
} from "@/lib/admin/data";
import { localeLabels, supportedLocales } from "@/lib/i18n/config";
import { requirePermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { permissions } = await requirePermission("content.manage", "/admin/services");
  const canManageCatalog = permissions.includes("service_catalog.manage");
  const params = await searchParams;
  const status = Array.isArray(params.status) ? params.status[0] : params.status;
  const { services, packages, faqs, ctas, media, translations, errors } =
    await getAdminServicesData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Catálogo"
        title="Servicios publicados"
        description="Administra servicios, traducciones, paquetes, preguntas, botones y media pública."
      />

      <StatusMessage status={status} />
      <AdminDataAlert errors={errors} />

      <div className="grid gap-5">
        {services.map((service) => (
          <Card key={service.id}>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>{service.title}</CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  /servicios/{service.slug}
                </p>
              </div>
              <Badge tone={service.is_active ? "default" : "muted"}>
                {service.is_active ? "Activo" : "Oculto"}
              </Badge>
            </CardHeader>
            <CardContent>
              <form action={updateServiceAction} className="grid gap-4">
                <input name="id" type="hidden" value={service.id} />
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium">
                    Título
                    <Input name="title" defaultValue={service.title} />
                  </label>
                  <label className="space-y-2 text-sm font-medium">
                    Precio visible
                    <Input name="price_from" defaultValue={service.price_from} />
                  </label>
                </div>
                <label className="space-y-2 text-sm font-medium">
                  Duración
                  <Input name="duration" defaultValue={service.duration ?? ""} />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Resumen
                  <textarea
                    className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    name="summary"
                    defaultValue={service.summary}
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Mensaje WhatsApp
                  <textarea
                    className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    name="whatsapp_message"
                    defaultValue={service.whatsapp_message}
                  />
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      className="size-4 accent-primary"
                      defaultChecked={service.is_active}
                      name="is_active"
                      type="checkbox"
                    />
                    Servicio visible en catálogo público
                  </label>
                  <Button type="submit">
                    <Save className="size-4" />
                    Guardar servicio
                  </Button>
                </div>
              </form>
              {canManageCatalog ? (
                <ServiceCmsPanel
                  ctas={ctas.filter((item) => item.service_id === service.id)}
                  faqs={faqs.filter((item) => item.service_id === service.id)}
                  media={media.filter((item) => item.service_id === service.id)}
                  packages={packages.filter((item) => item.service_id === service.id)}
                  serviceId={service.id}
                  translations={translations.filter(
                    (item) =>
                      item.entity_type === "services" &&
                      item.entity_id === service.id,
                  )}
                />
              ) : (
                <div className="mt-5 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
                  Para editar paquetes, FAQs, CTAs, media y traducciones hace
                  falta el permiso de catálogo completo.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No hay servicios cargados. Aplica las migraciones de Supabase para
            sembrar el catálogo base.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function StatusMessage({ status }: { status?: string }) {
  if (!status) {
    return null;
  }

  const isSuccess = ["saved", "cms-saved", "translation-saved"].includes(status);

  return (
    <Card className={isSuccess ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}>
      <CardContent className="flex items-center gap-3 p-4 text-sm">
        {isSuccess ? (
          <CheckCircle2 className="size-4 text-primary" />
        ) : (
          <XCircle className="size-4 text-destructive" />
        )}
        <span className={isSuccess ? "text-primary" : "text-destructive"}>
          {isSuccess
            ? "Catálogo actualizado y rutas revalidadas."
            : "No se pudo actualizar. Revisa permisos, campos requeridos o Supabase."}
        </span>
      </CardContent>
    </Card>
  );
}

function ServiceCmsPanel({
  ctas,
  faqs,
  media,
  packages,
  serviceId,
  translations,
}: {
  ctas: AdminServiceCtaRecord[];
  faqs: AdminServiceFaqRecord[];
  media: AdminServiceMediaRecord[];
  packages: AdminServicePackageRecord[];
  serviceId: string;
  translations: AdminContentTranslationRecord[];
}) {
  return (
    <div className="mt-6 grid gap-5 border-t border-border pt-5">
      <Card className="bg-background">
        <CardHeader>
          <CardTitle className="text-lg">Traducciones del servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {supportedLocales.map((locale) => (
              <TranslationForm
                entityId={serviceId}
                entityType="services"
                key={locale}
                locale={locale}
                translations={translations}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <CmsCollectionCard
          title="Paquetes"
          empty="No hay paquetes cargados."
          addForm={<PackageForm serviceId={serviceId} />}
        >
          {packages.map((item) => (
            <PackageForm item={item} key={item.id} serviceId={serviceId} />
          ))}
        </CmsCollectionCard>
        <CmsCollectionCard
          title="Preguntas frecuentes"
          empty="No hay preguntas cargadas."
          addForm={<FaqForm serviceId={serviceId} />}
        >
          {faqs.map((item) => (
            <FaqForm item={item} key={item.id} serviceId={serviceId} />
          ))}
        </CmsCollectionCard>
        <CmsCollectionCard
          title="Botones y mensajes"
          empty="No hay CTAs cargados."
          addForm={<CtaForm serviceId={serviceId} />}
        >
          {ctas.map((item) => (
            <CtaForm item={item} key={item.id} serviceId={serviceId} />
          ))}
        </CmsCollectionCard>
        <CmsCollectionCard
          title="Media"
          empty="No hay media cargada."
          addForm={<MediaForm serviceId={serviceId} />}
        >
          {media.map((item) => (
            <MediaForm item={item} key={item.id} serviceId={serviceId} />
          ))}
        </CmsCollectionCard>
      </div>
    </div>
  );
}

function TranslationForm({
  entityId,
  entityType,
  locale,
  translations,
}: {
  entityId: string;
  entityType: string;
  locale: (typeof supportedLocales)[number];
  translations: AdminContentTranslationRecord[];
}) {
  const title = findTranslation(translations, locale, "title");
  const summary = findTranslation(translations, locale, "summary");

  return (
    <form action={updateServiceTranslationAction} className="grid gap-2 rounded-md border border-border p-3">
      <input name="entity_id" type="hidden" value={entityId} />
      <input name="entity_type" type="hidden" value={entityType} />
      <input name="locale" type="hidden" value={locale} />
      <p className="text-sm font-bold">{localeLabels[locale]}</p>
      <label className="grid gap-1 text-xs font-medium">
        Campo
        <select name="field_name" className="h-9 rounded-md border border-border bg-background px-2">
          <option value="title">Título</option>
          <option value="summary">Resumen</option>
          <option value="description">Descripción</option>
          <option value="eyebrow">Etiqueta</option>
          <option value="price_from">Precio visible</option>
          <option value="duration">Duración</option>
          <option value="whatsapp_message">Mensaje WhatsApp</option>
          <option value="outcomes">Resultados, una línea por ítem</option>
          <option value="deliverables">Entregables, una línea por ítem</option>
          <option value="modules">Proceso, una línea por ítem</option>
          <option value="requirements">Requisitos, una línea por ítem</option>
        </select>
      </label>
      <textarea
        className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm"
        name="value"
        placeholder={[title, summary].filter(Boolean).join("\n") || "Texto traducido"}
      />
      <Button size="sm" type="submit">Guardar traducción</Button>
    </form>
  );
}

function CmsCollectionCard({
  addForm,
  children,
  empty,
  title,
}: {
  addForm: React.ReactNode;
  children: React.ReactNode;
  empty: string;
  title: string;
}) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <Card className="bg-background">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {hasChildren ? children : <p className="text-sm text-muted-foreground">{empty}</p>}
        <div className="rounded-md border border-dashed border-border p-3">
          {addForm}
        </div>
      </CardContent>
    </Card>
  );
}

function PackageForm({
  item,
  serviceId,
}: {
  item?: AdminServicePackageRecord;
  serviceId: string;
}) {
  return (
    <form action={upsertServicePackageAction} className="grid gap-2 rounded-md border border-border p-3">
      <input name="service_id" type="hidden" value={serviceId} />
      {item ? <input name="id" type="hidden" value={item.id} /> : null}
      <Input name="title" placeholder="Nombre del paquete" defaultValue={item?.title ?? ""} />
      <Input name="price_label" placeholder="Precio visible" defaultValue={item?.price_label ?? ""} />
      <Input name="duration" placeholder="Duración" defaultValue={item?.duration ?? ""} />
      <textarea className="min-h-16 rounded-md border border-border bg-background px-3 py-2 text-sm" name="description" placeholder="Descripción" defaultValue={item?.description ?? ""} />
      <textarea className="min-h-16 rounded-md border border-border bg-background px-3 py-2 text-sm" name="features" placeholder="Características, una por línea" defaultValue={arrayToLines(item?.features)} />
      <CmsFormFooter active={item?.is_active ?? true} sortOrder={item?.sort_order ?? 0} />
    </form>
  );
}

function FaqForm({ item, serviceId }: { item?: AdminServiceFaqRecord; serviceId: string }) {
  return (
    <form action={upsertServiceFaqAction} className="grid gap-2 rounded-md border border-border p-3">
      <input name="service_id" type="hidden" value={serviceId} />
      {item ? <input name="id" type="hidden" value={item.id} /> : null}
      <Input name="question" placeholder="Pregunta" defaultValue={item?.question ?? ""} />
      <textarea className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm" name="answer" placeholder="Respuesta" defaultValue={item?.answer ?? ""} />
      <CmsFormFooter active={item?.is_active ?? true} sortOrder={item?.sort_order ?? 0} />
    </form>
  );
}

function CtaForm({ item, serviceId }: { item?: AdminServiceCtaRecord; serviceId: string }) {
  return (
    <form action={upsertServiceCtaAction} className="grid gap-2 rounded-md border border-border p-3">
      <input name="service_id" type="hidden" value={serviceId} />
      {item ? <input name="id" type="hidden" value={item.id} /> : null}
      <Input name="label" placeholder="Texto del botón" defaultValue={item?.label ?? ""} />
      <Input name="placement" placeholder="Ubicación, ej. hero" defaultValue={item?.placement ?? "default"} />
      <textarea className="min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm" name="whatsapp_message" placeholder="Mensaje de WhatsApp" defaultValue={item?.whatsapp_message ?? ""} />
      <CmsFormFooter active={item?.is_active ?? true} sortOrder={item?.sort_order ?? 0} />
    </form>
  );
}

function MediaForm({ item, serviceId }: { item?: AdminServiceMediaRecord; serviceId: string }) {
  return (
    <form action={upsertServiceMediaAction} className="grid gap-2 rounded-md border border-border p-3">
      <input name="service_id" type="hidden" value={serviceId} />
      {item ? <input name="id" type="hidden" value={item.id} /> : null}
      <Input name="title" placeholder="Título" defaultValue={item?.title ?? ""} />
      <Input name="url" placeholder="URL de imagen/video" defaultValue={item?.url ?? ""} />
      <Input name="alt_text" placeholder="Texto alternativo" defaultValue={item?.alt_text ?? ""} />
      <select name="media_type" defaultValue={item?.media_type ?? "image"} className="h-10 rounded-md border border-border bg-background px-3 text-sm">
        <option value="image">Imagen</option>
        <option value="video">Video</option>
        <option value="document">Documento</option>
        <option value="external_link">Link externo</option>
      </select>
      <CmsFormFooter active={item?.is_active ?? true} sortOrder={item?.sort_order ?? 0} />
    </form>
  );
}

function CmsFormFooter({ active, sortOrder }: { active: boolean; sortOrder: number }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input className="size-4 accent-primary" defaultChecked={active} name="is_active" type="checkbox" />
        Visible
      </label>
      <Input className="w-24" name="sort_order" type="number" defaultValue={String(sortOrder)} />
      <Button size="sm" type="submit">
        <Save className="size-4" />
        Guardar
      </Button>
    </div>
  );
}

function findTranslation(
  translations: AdminContentTranslationRecord[],
  locale: AdminContentTranslationRecord["locale"],
  fieldName: string,
) {
  return translations.find(
    (item) => item.locale === locale && item.field_name === fieldName,
  )?.value;
}

function arrayToLines(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).join("\n") : "";
}
