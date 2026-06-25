import Link from "next/link";
import { ArrowRight, CreditCard } from "lucide-react";
import type Stripe from "stripe";

import {
  isUsableArtistAnnualSubscription,
  pickBestArtistAnnualSubscription,
} from "@/lib/artist-billing";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireArtist } from "@/lib/permissions";
import { getStripeClient } from "@/lib/stripe";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const checkoutMessages: Record<string, string> = {
  ep_release_credit_available:
    "Ya tienes un crédito EP pagado y disponible. Úsalo al enviar un lanzamiento EP.",
  album_release_credit_available:
    "Ya tienes un crédito álbum pagado y disponible. Úsalo al enviar un lanzamiento álbum.",
};

export default async function ArtistBillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const checkoutParam = Array.isArray(params.checkout)
    ? params.checkout[0]
    : params.checkout;
  const checkoutMessage =
    typeof checkoutParam === "string" ? checkoutMessages[checkoutParam] : null;
  const { supabase, user } = await requireArtist();
  const [{ data: subscriptions }, { data: payments }] = await Promise.all([
    supabase
      .from("artist_subscriptions")
      .select("status,current_period_start,current_period_end,stripe_customer_id,stripe_subscription_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("artist_payments")
      .select("id,product_key,status,amount_total,currency,release_id,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  const subscription = pickBestArtistAnnualSubscription(subscriptions);
  const annualActive = isUsableArtistAnnualSubscription(subscription);
  const stripeDetails = await getStripeSubscriptionDetails(subscription);
  const epCredits = (payments ?? []).filter(
    (payment) =>
      payment.product_key === "ep_release" &&
      payment.status === "paid" &&
      !payment.release_id,
  ).length;
  const albumCredits = (payments ?? []).filter(
    (payment) =>
      payment.product_key === "album_release" &&
      payment.status === "paid" &&
      !payment.release_id,
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mt-3 text-3xl font-black tracking-normal">
          {annualActive ? "Suscripción activa" : "Suscripción anual"}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pagos, cupos y estado real de tu cuenta artista.
        </p>
      </div>

      {checkoutMessage ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          {checkoutMessage}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CreditCard className="size-5 text-primary" />
          <CardTitle>
            {annualActive ? "Suscripción anual activa" : "Suscripción anual"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge tone={annualActive ? "accent" : "muted"}>
            {annualActive ? "activa" : subscription?.status ?? "sin suscripción"}
          </Badge>
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <BillingFact
              label="Precio"
              value={stripeDetails?.priceLabel ?? "No disponible"}
            />
            <BillingFact
              label="Pagó con"
              value={stripeDetails?.cardLabel ?? "No disponible"}
            />
            <BillingFact
              label="Fecha de activación"
              value={
                subscription?.current_period_start
                  ? formatDateTime(subscription.current_period_start)
                  : subscription?.created_at
                    ? formatDateTime(subscription.created_at)
                    : "No disponible"
              }
            />
            <BillingFact
              label="Disponible hasta"
              value={
                subscription?.current_period_end
                  ? formatDateTime(subscription.current_period_end)
                  : "No disponible"
              }
            />
            <BillingFact
              label="Renovación automática"
              value={
                stripeDetails?.automaticRenewal == null
                  ? "No disponible"
                  : stripeDetails.automaticRenewal
                    ? "Activada"
                    : "Desactivada"
              }
            />
            <BillingFact
              label="Stripe"
              value={subscription?.stripe_subscription_id ?? "No disponible"}
            />
          </div>
          {!annualActive ? (
            <Link
              href="/api/checkout/artist-annual"
              className={cn(buttonVariants(), "w-full sm:w-auto")}
            >
              Activar / renovar suscripción anual
              <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CreditCard className="size-5 text-primary" />
          <CardTitle>Cupos de lanzamiento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-3 rounded-md border border-border bg-muted p-4">
            <div>
              <p className="text-sm font-semibold">Cupos EP disponibles</p>
              <p className="mt-1 text-3xl font-black">{epCredits}</p>
            </div>
            <Link
              href="/api/checkout/ep-release?next=/artist/billing&force=1"
              className={cn(buttonVariants(), "w-full")}
            >
              Comprar cupo EP
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-3 rounded-md border border-border bg-muted p-4">
            <div>
              <p className="text-sm font-semibold">Cupos álbum disponibles</p>
              <p className="mt-1 text-3xl font-black">{albumCredits}</p>
            </div>
            <Link
              href="/api/checkout/album-release?next=/artist/billing&force=1"
              className={cn(buttonVariants(), "w-full")}
            >
              Comprar cupo álbum
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CreditCard className="size-5 text-primary" />
          <CardTitle>Historial de pagos de lanzamientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 pr-4">Producto</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 pr-4">Monto</th>
                  <th className="py-3 pr-4">Lanzamiento</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {(payments ?? []).map((payment) => (
                  <tr key={payment.id} className="border-b border-border/70">
                    <td className="py-3 pr-4">
                      {getPaymentProductLabel(payment.product_key)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={payment.status === "paid" ? "accent" : "muted"}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatPaymentAmount(payment.amount_total, payment.currency)}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {payment.release_id ? "asociado" : "disponible"}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {formatDateTime(payment.created_at)}
                    </td>
                  </tr>
                ))}
                {(payments ?? []).length === 0 ? (
                  <tr>
                    <td className="py-6 text-muted-foreground" colSpan={5}>
                      Todavía no hay pagos únicos.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BillingFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function formatPaymentAmount(amountTotal?: number | null, currency?: string | null) {
  if (typeof amountTotal !== "number" || !currency) {
    return "-";
  }

  return formatCurrency(amountTotal / 100, currency.toUpperCase());
}

function getPaymentProductLabel(productKey?: string | null) {
  if (productKey === "ep_release") {
    return "Cupo EP";
  }

  if (productKey === "album_release") {
    return "Cupo álbum";
  }

  return productKey ?? "-";
}

async function getStripeSubscriptionDetails(
  subscription?: {
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
  } | null,
) {
  const stripe = getStripeClient();

  if (!stripe || !subscription) {
    return null;
  }

  let stripeSubscription: Stripe.Subscription | null = null;

  if (subscription.stripe_subscription_id) {
    stripeSubscription = await stripe.subscriptions
      .retrieve(subscription.stripe_subscription_id, {
        expand: ["default_payment_method"],
      })
      .catch(() => null);
  }

  let paymentMethod = getExpandedPaymentMethod(
    stripeSubscription?.default_payment_method,
  );

  if (!paymentMethod && subscription.stripe_customer_id) {
    const paymentMethods = await stripe.paymentMethods
      .list({
        customer: subscription.stripe_customer_id,
        type: "card",
        limit: 1,
      })
      .catch(() => null);

    paymentMethod = paymentMethods?.data[0] ?? null;
  }

  const price = stripeSubscription?.items.data[0]?.price;
  const priceLabel =
    typeof price?.unit_amount === "number" && price.currency
      ? `${formatCurrency(price.unit_amount / 100, price.currency.toUpperCase())}${
          price.recurring?.interval === "year" ? " / año" : ""
        }`
      : null;

  return {
    automaticRenewal:
      stripeSubscription?.cancel_at_period_end === undefined
        ? null
        : !stripeSubscription.cancel_at_period_end,
    cardLabel: formatStripeCard(paymentMethod),
    priceLabel,
  };
}

function getExpandedPaymentMethod(
  value?: string | Stripe.PaymentMethod | null,
): Stripe.PaymentMethod | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

function formatStripeCard(paymentMethod?: Stripe.PaymentMethod | null) {
  const card = paymentMethod?.card;

  if (!card?.last4) {
    return null;
  }

  const brand = card.brand
    ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
    : "Tarjeta";

  return `${brand} terminada en ${card.last4}`;
}
