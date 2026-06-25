import { CreditCard, History, Music, Users } from "lucide-react";

import { AdminDataAlert } from "@/components/admin/admin-data-alert";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type AdminArtistPaymentRecord,
  type AdminSubscriptionRecord,
  getAdminPaymentsData,
} from "@/lib/admin/data";
import { requirePermission } from "@/lib/permissions";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const activeSubscriptionStatuses = new Set(["active", "trialing"]);
const epProductKeys = new Set(["ep_release", "ep_release_fee"]);
const albumProductKeys = new Set(["album_release", "album_release_fee"]);

export default async function AdminPaymentsPage() {
  await requirePermission("payments.read", "/admin/payments");
  const { subscriptions, payments, errors } = await getAdminPaymentsData();
  const activeSubscriptions = subscriptions.filter(isActiveSubscription);
  const activeEpPayments = payments.filter(
    (payment) => isPaidPayment(payment) && epProductKeys.has(payment.product_key),
  );
  const activeAlbumPayments = payments.filter(
    (payment) =>
      isPaidPayment(payment) && albumProductKeys.has(payment.product_key),
  );
  const recentPaymentHistory = buildRecentPaymentHistory(
    subscriptions,
    payments,
  ).slice(0, 10);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Pagos"
        title="Pagos y suscripciones"
        description="Suscripciones activas, pagos de EP, pagos de álbum e historial reciente."
      />

      <AdminDataAlert errors={errors} />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={<Users className="size-5 text-primary" />}
          label="Suscripciones activas"
          value={activeSubscriptions.length}
          detail="Artistas con cuenta activa o en trial."
        />
        <SummaryCard
          icon={<Music className="size-5 text-primary" />}
          label="EP activos"
          value={activeEpPayments.length}
          detail="Pagos EP confirmados."
        />
        <SummaryCard
          icon={<CreditCard className="size-5 text-primary" />}
          label="Álbumes activos"
          value={activeAlbumPayments.length}
          detail="Pagos álbum confirmados."
        />
      </div>

      <Card>
        <CardHeader>
          <Users className="size-5 text-primary" />
          <CardTitle>Artistas con suscripción activa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Artista</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Desde</th>
                  <th className="py-3 pr-4">Hasta</th>
                  <th className="py-3 pr-4">Código</th>
                  <th className="py-3">Referencia de pago</th>
                </tr>
              </thead>
              <tbody>
                {activeSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{getProfileLabel(subscription)}</p>
                      <p className="text-xs text-muted-foreground">
                        {subscription.profiles?.email ?? subscription.user_id}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone="default">{subscription.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatNullableDate(subscription.current_period_start)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatNullableDate(subscription.current_period_end)}
                    </td>
                    <td className="py-3 pr-4">
                      <CodeCell value={subscription.user_id} />
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {subscription.stripe_customer_id ?? "-"}
                    </td>
                  </tr>
                ))}
                {activeSubscriptions.length === 0 ? (
                  <EmptyRow colSpan={6}>
                    No hay artistas con suscripción activa.
                  </EmptyRow>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ActiveProductTable
        title="EP activos"
        icon={<Music className="size-5 text-primary" />}
        payments={activeEpPayments}
        emptyText="No hay pagos EP activos."
      />

      <ActiveProductTable
        title="Álbumes activos"
        icon={<CreditCard className="size-5 text-primary" />}
        payments={activeAlbumPayments}
        emptyText="No hay pagos de álbum activos."
      />

      <Card>
        <CardHeader>
          <History className="size-5 text-primary" />
          <CardTitle>Últimos 10 pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Persona</th>
                  <th className="py-3 pr-4">Pago</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Monto</th>
                  <th className="py-3 pr-4">Fecha</th>
                  <th className="py-3">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {recentPaymentHistory.map((item) => (
                  <tr key={item.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{item.person}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.emailOrCode}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {item.product}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={item.statusTone}>{item.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {item.amount}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td className="py-3">
                      <CodeCell value={item.reference} />
                    </td>
                  </tr>
                ))}
                {recentPaymentHistory.length === 0 ? (
                  <EmptyRow colSpan={6}>
                    Todavía no hay historial de pagos.
                  </EmptyRow>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-black">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="rounded-md border border-border bg-muted p-3">{icon}</div>
      </CardContent>
    </Card>
  );
}

function ActiveProductTable({
  title,
  icon,
  payments,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  payments: AdminArtistPaymentRecord[];
  emptyText: string;
}) {
  return (
    <Card>
      <CardHeader>
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-3 pr-4">Producto</th>
                <th className="py-3 pr-4">Artista</th>
                <th className="py-3 pr-4">Estado</th>
                <th className="py-3 pr-4">Desde</th>
                <th className="py-3 pr-4">Hasta</th>
                <th className="py-3 pr-4">Monto</th>
                <th className="py-3">Código</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const release = getPaymentRelease(payment);

                return (
                  <tr key={payment.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      <p className="font-medium">
                        {release?.title ?? getProductLabel(payment.product_key)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {release
                          ? `${release.release_type ?? "release"} / ${release.status ?? "sin estado"}`
                          : "Crédito disponible"}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">
                        {release?.primary_artist ?? getProfileLabel(payment)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.profiles?.email ?? payment.user_id}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone="default">activo</Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {release?.desired_release_date
                        ? formatDateTime(release.desired_release_date)
                        : "Sin vencimiento"}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatPaymentAmount(payment.amount_total, payment.currency)}
                    </td>
                    <td className="py-3">
                      <CodeCell value={payment.release_id ?? payment.id} />
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 ? (
                <EmptyRow colSpan={7}>{emptyText}</EmptyRow>
              ) : null}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyRow({
  children,
  colSpan,
}: {
  children: React.ReactNode;
  colSpan: number;
}) {
  return (
    <tr>
      <td className="py-6 text-muted-foreground" colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}

function CodeCell({ value }: { value?: string | null }) {
  return (
    <code className="block max-w-[220px] break-all rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
      {value ? formatCode(value) : "-"}
    </code>
  );
}

function buildRecentPaymentHistory(
  subscriptions: AdminSubscriptionRecord[],
  payments: AdminArtistPaymentRecord[],
) {
  const subscriptionItems = subscriptions.map((subscription) => ({
    id: `subscription-${subscription.id}`,
    person: getProfileLabel(subscription),
    emailOrCode: subscription.profiles?.email ?? subscription.user_id,
    product: "Suscripción artista",
    status: subscription.status,
    statusTone: activeSubscriptionStatuses.has(subscription.status)
      ? ("default" as const)
      : ("muted" as const),
    amount: "-",
    createdAt: subscription.created_at,
    reference: subscription.stripe_subscription_id ?? subscription.id,
  }));
  const paymentItems = payments.map((payment) => ({
    id: `payment-${payment.id}`,
    person: getProfileLabel(payment),
    emailOrCode: payment.profiles?.email ?? payment.user_id,
    product: getProductLabel(payment.product_key),
    status: payment.status,
    statusTone: payment.status === "paid" ? ("default" as const) : ("muted" as const),
    amount: formatPaymentAmount(payment.amount_total, payment.currency),
    createdAt: payment.created_at,
    reference:
      payment.stripe_payment_intent_id ??
      payment.stripe_checkout_session_id ??
      payment.id,
  }));

  return [...subscriptionItems, ...paymentItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function isActiveSubscription(subscription: AdminSubscriptionRecord) {
  if (!activeSubscriptionStatuses.has(subscription.status)) {
    return false;
  }

  if (!subscription.current_period_end) {
    return true;
  }

  return new Date(subscription.current_period_end).getTime() >= Date.now();
}

function isPaidPayment(payment: AdminArtistPaymentRecord) {
  return (
    payment.status === "paid" ||
    payment.payment_status === "paid" ||
    payment.payment_status === "succeeded"
  );
}

function getProfileLabel(record: {
  user_id: string;
  profiles?: { email?: string; full_name?: string | null } | null;
}) {
  return record.profiles?.full_name ?? record.profiles?.email ?? record.user_id;
}

function getProductLabel(productKey: string) {
  if (epProductKeys.has(productKey)) {
    return "EP";
  }

  if (albumProductKeys.has(productKey)) {
    return "Álbum";
  }

  return productKey;
}

function getPaymentRelease(payment: AdminArtistPaymentRecord) {
  const release = payment.releases;

  if (Array.isArray(release)) {
    return release[0] ?? null;
  }

  return release ?? null;
}

function formatNullableDate(value?: string | null) {
  return value ? formatDateTime(value) : "-";
}

function formatPaymentAmount(amountTotal?: number | null, currency?: string | null) {
  if (typeof amountTotal !== "number" || !currency) {
    return "-";
  }

  return formatCurrency(amountTotal / 100, currency.toUpperCase());
}

function formatCode(value: string) {
  return value.length > 18 ? `${value.slice(0, 8)}...${value.slice(-6)}` : value;
}
