import type Stripe from "stripe";

import { createServiceSupabaseClient } from "@/lib/supabase/server";

export const ARTIST_ANNUAL_PRODUCT_KEY = "artist_annual_access";
export const ARTIST_EP_RELEASE_PRODUCT_KEY = "ep_release";
export const ARTIST_ALBUM_RELEASE_PRODUCT_KEY = "album_release";

export type ArtistPaymentProductKey =
  | typeof ARTIST_EP_RELEASE_PRODUCT_KEY
  | typeof ARTIST_ALBUM_RELEASE_PRODUCT_KEY;

export const artistPaymentProductKeys = [
  ARTIST_EP_RELEASE_PRODUCT_KEY,
  ARTIST_ALBUM_RELEASE_PRODUCT_KEY,
] as const;

export type ArtistAnnualSubscriptionState = {
  status?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at?: string | null;
};

type StripeObjectReference = string | { id?: string } | null | undefined;

type RoleJoin = {
  roles: { key?: string } | { key?: string }[] | null;
};

type EnsureArtistCheckoutInput = {
  userId: string;
  email?: string | null;
  fullName?: string | null;
};

type SyncArtistSubscriptionInput = {
  userId: string;
  email?: string | null;
  customerId?: string | null;
  subscriptionId?: string | null;
  status: string;
  currentPeriodStart?: number | null;
  currentPeriodEnd?: number | null;
};

type SyncArtistPaymentInput = {
  userId: string;
  productKey: ArtistPaymentProductKey;
  releaseId?: string | null;
  customerId?: string | null;
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  status: string;
  paymentStatus?: string | null;
};

export function getStripeObjectId(reference: StripeObjectReference) {
  if (!reference) {
    return null;
  }

  return typeof reference === "string" ? reference : reference.id ?? null;
}

export function getStripeSubscriptionPeriod(subscription?: Stripe.Subscription | null) {
  const firstItem = subscription?.items?.data?.[0];
  const legacySubscription = subscription as
    | ({ current_period_start?: number; current_period_end?: number } & Stripe.Subscription)
    | null
    | undefined;

  return {
    currentPeriodStart:
      firstItem?.current_period_start ??
      legacySubscription?.current_period_start ??
      null,
    currentPeriodEnd:
      firstItem?.current_period_end ??
      legacySubscription?.current_period_end ??
      null,
  };
}

export function isActiveStripeSubscriptionStatus(status?: string | null) {
  return status === "active" || status === "trialing";
}

export function isUsableArtistAnnualSubscription(
  subscription?: ArtistAnnualSubscriptionState | null,
) {
  if (!isActiveStripeSubscriptionStatus(subscription?.status)) {
    return false;
  }

  if (!subscription?.current_period_end) {
    return true;
  }

  return new Date(subscription.current_period_end).getTime() >= Date.now();
}

export function pickBestArtistAnnualSubscription<
  T extends ArtistAnnualSubscriptionState,
>(subscriptions?: T[] | null) {
  if (!subscriptions?.length) {
    return null;
  }

  const sorted = [...subscriptions].sort((left, right) => {
    const leftIsUsable = isUsableArtistAnnualSubscription(left);
    const rightIsUsable = isUsableArtistAnnualSubscription(right);

    if (leftIsUsable !== rightIsUsable) {
      return leftIsUsable ? -1 : 1;
    }

    return getSubscriptionSortTime(right) - getSubscriptionSortTime(left);
  });

  return sorted[0] ?? null;
}

export async function ensureArtistAccountForCheckout({
  userId,
  email,
  fullName,
}: EnsureArtistCheckoutInput) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return { ok: false, reason: "supabase_service_not_configured" as const };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,full_name,user_type,status")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    return { ok: false, reason: "profile_lookup_failed" as const, error: profileError };
  }

  if (!profile) {
    const { error } = await supabase.from("profiles").insert({
      id: userId,
      email: email ?? "",
      full_name: fullName ?? null,
      user_type: "artist",
      status: "active",
    });

    if (error) {
      return { ok: false, reason: "profile_insert_failed" as const, error };
    }
  }

  const roleKeys = await getRoleKeysForUser(userId);
  const isArtist =
    profile?.user_type === "artist" || roleKeys.includes("artist") || !profile;

  if (!isArtist) {
    return { ok: false, reason: "not_artist_account" as const };
  }

  await assignArtistRole(userId);

  const { error: artistProfileError } = await supabase
    .from("artist_profiles")
    .upsert(
      {
        user_id: userId,
        status: "pending_payment",
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      },
    );

  if (artistProfileError) {
    return {
      ok: false,
      reason: "artist_profile_upsert_failed" as const,
      error: artistProfileError,
    };
  }

  return { ok: true, reason: "ready" as const };
}

export async function findUserIdByStripeSubscription({
  customerId,
  subscriptionId,
}: {
  customerId?: string | null;
  subscriptionId?: string | null;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return null;
  }

  if (subscriptionId) {
    const { data } = await supabase
      .from("artist_subscriptions")
      .select("user_id")
      .eq("stripe_subscription_id", subscriptionId)
      .maybeSingle();

    if (data?.user_id) {
      return data.user_id as string;
    }
  }

  if (customerId) {
    const { data } = await supabase
      .from("artist_subscriptions")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data?.user_id) {
      return data.user_id as string;
    }
  }

  return null;
}

export async function findUserIdByStripePayment({
  checkoutSessionId,
  paymentIntentId,
}: {
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return null;
  }

  if (checkoutSessionId) {
    const { data } = await supabase
      .from("artist_payments")
      .select("user_id")
      .eq("stripe_checkout_session_id", checkoutSessionId)
      .maybeSingle();

    if (data?.user_id) {
      return data.user_id as string;
    }
  }

  if (paymentIntentId) {
    const { data } = await supabase
      .from("artist_payments")
      .select("user_id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (data?.user_id) {
      return data.user_id as string;
    }
  }

  return null;
}

export async function findArtistPaymentByStripePayment({
  checkoutSessionId,
  paymentIntentId,
}: {
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return null;
  }

  const selectColumns = "user_id,product_key,release_id";

  if (checkoutSessionId) {
    const { data } = await supabase
      .from("artist_payments")
      .select(selectColumns)
      .eq("stripe_checkout_session_id", checkoutSessionId)
      .maybeSingle();

    if (data?.user_id && isArtistPaymentProductKey(data.product_key)) {
      return {
        userId: data.user_id as string,
        productKey: data.product_key,
        releaseId: data.release_id as string | null,
      };
    }
  }

  if (paymentIntentId) {
    const { data } = await supabase
      .from("artist_payments")
      .select(selectColumns)
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();

    if (data?.user_id && isArtistPaymentProductKey(data.product_key)) {
      return {
        userId: data.user_id as string,
        productKey: data.product_key,
        releaseId: data.release_id as string | null,
      };
    }
  }

  return null;
}

export async function syncArtistSubscriptionFromStripe({
  userId,
  email,
  customerId,
  subscriptionId,
  status,
  currentPeriodStart,
  currentPeriodEnd,
}: SyncArtistSubscriptionInput) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return { synced: false, reason: "supabase_service_not_configured" as const };
  }

  await supabase.from("profiles").upsert(
    {
      id: userId,
      email: email ?? "",
      user_type: "artist",
      status: "active",
    },
    {
      onConflict: "id",
      ignoreDuplicates: true,
    },
  );

  await assignArtistRole(userId);

  const { data: currentProfile } = await supabase
    .from("artist_profiles")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();

  const { error: artistProfileError } = await supabase
    .from("artist_profiles")
    .upsert(
      {
        user_id: userId,
        status: mapStripeStatusToArtistProfileStatus(
          status,
          currentProfile?.status ?? null,
        ),
      },
      {
        onConflict: "user_id",
      },
    );

  if (artistProfileError) {
    return {
      synced: false,
      reason: "artist_profile_sync_failed" as const,
      error: artistProfileError,
    };
  }

  if (!subscriptionId) {
    return { synced: true, reason: "profile_synced_without_subscription" as const };
  }

  const { error: subscriptionError } = await supabase
    .from("artist_subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: customerId ?? null,
        stripe_subscription_id: subscriptionId,
        status,
        current_period_start: stripeTimestampToIso(currentPeriodStart),
        current_period_end: stripeTimestampToIso(currentPeriodEnd),
      },
      {
        onConflict: "stripe_subscription_id",
      },
    );

  if (subscriptionError) {
    return {
      synced: false,
      reason: "artist_subscription_sync_failed" as const,
      error: subscriptionError,
    };
  }

  return { synced: true, reason: "subscription_synced" as const };
}

export async function syncArtistPaymentFromStripe({
  userId,
  productKey,
  releaseId,
  customerId,
  checkoutSessionId,
  paymentIntentId,
  amountTotal,
  currency,
  status,
  paymentStatus,
}: SyncArtistPaymentInput) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return { synced: false, reason: "supabase_service_not_configured" as const };
  }

  const payload = {
    user_id: userId,
    product_key: productKey,
    ...(releaseId ? { release_id: releaseId } : {}),
    stripe_customer_id: customerId ?? null,
    stripe_checkout_session_id: checkoutSessionId ?? null,
    stripe_payment_intent_id: paymentIntentId ?? null,
    amount_total: amountTotal ?? null,
    currency: currency ?? null,
    status,
    payment_status: paymentStatus ?? null,
  };

  const conflictColumn = checkoutSessionId
    ? "stripe_checkout_session_id"
    : paymentIntentId
      ? "stripe_payment_intent_id"
      : null;

  if (conflictColumn) {
    const { error } = await supabase.from("artist_payments").upsert(payload, {
      onConflict: conflictColumn,
    });

    if (error) {
      return {
        synced: false,
        reason: "artist_payment_sync_failed" as const,
        error,
      };
    }
  } else {
    const { error } = await supabase.from("artist_payments").insert(payload);

    if (error) {
      return {
        synced: false,
        reason: "artist_payment_insert_failed" as const,
        error,
      };
    }
  }

  return { synced: true, reason: "payment_synced" as const };
}

export function isArtistPaymentProductKey(
  value?: string | null,
): value is ArtistPaymentProductKey {
  return artistPaymentProductKeys.includes(value as ArtistPaymentProductKey);
}

export function mapCheckoutPaymentStatus(status?: string | null) {
  if (status === "paid") {
    return "paid";
  }

  if (status === "unpaid" || status === "no_payment_required") {
    return "pending";
  }

  return "pending";
}

async function getRoleKeysForUser(userId: string) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("user_roles")
    .select("roles(key)")
    .eq("user_id", userId);

  return ((data ?? []) as RoleJoin[])
    .map((row) => {
      if (Array.isArray(row.roles)) {
        return row.roles[0]?.key;
      }

      return row.roles?.key;
    })
    .filter((role): role is string => Boolean(role));
}

async function assignArtistRole(userId: string) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return;
  }

  const { data: artistRole } = await supabase
    .from("roles")
    .select("id")
    .eq("key", "artist")
    .maybeSingle();

  if (!artistRole?.id) {
    return;
  }

  await supabase.from("user_roles").upsert(
    {
      user_id: userId,
      role_id: artistRole.id,
    },
    {
      onConflict: "user_id,role_id",
      ignoreDuplicates: true,
    },
  );
}

function stripeTimestampToIso(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function mapStripeStatusToArtistProfileStatus(
  stripeStatus: string,
  currentStatus?: string | null,
) {
  if (currentStatus === "suspended") {
    return currentStatus;
  }

  if (isActiveStripeSubscriptionStatus(stripeStatus)) {
    if (
      currentStatus === "identity_pending" ||
      currentStatus === "identity_verified" ||
      currentStatus === "contract_pending" ||
      currentStatus === "verified_artist"
    ) {
      return currentStatus;
    }

    return "active_pending_verification";
  }

  if (
    stripeStatus === "canceled" ||
    stripeStatus === "unpaid" ||
    stripeStatus === "incomplete_expired"
  ) {
    return "expired";
  }

  return "pending_payment";
}

function getSubscriptionSortTime(subscription: ArtistAnnualSubscriptionState) {
  const timestamp =
    subscription.current_period_end ??
    subscription.current_period_start ??
    subscription.created_at;

  return timestamp ? new Date(timestamp).getTime() : 0;
}
