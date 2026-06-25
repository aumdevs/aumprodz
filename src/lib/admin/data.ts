import type { AdminMetricsChartPoint } from "@/components/admin/admin-metrics-chart";
import {
  adminNotificationSections,
  getAdminNotificationSectionPath,
  type AdminNotificationSectionPath,
} from "@/lib/admin/notification-sections";
import { canonicalServiceSlugs } from "@/lib/content/services";
import { getEnv } from "@/lib/env";
import {
  createServerSupabaseClient,
  createServiceSupabaseClient,
} from "@/lib/supabase/server";

type QueryError = {
  source: string;
  message: string;
};

type CountResult = {
  count: number;
  error?: QueryError;
};

type Supabase = NonNullable<
  Awaited<ReturnType<typeof createServerSupabaseClient>>
>;

type QueryErrorResult = {
  message: string;
};

type CountQueryResult = {
  count: number | null;
  error: QueryErrorResult | null;
};

type CountQuery = PromiseLike<CountQueryResult> & {
  eq(column: string, value: unknown): CountQuery;
  gt(column: string, value: unknown): CountQuery;
  gte(column: string, value: unknown): CountQuery;
  in(column: string, values: readonly unknown[]): CountQuery;
  is(column: string, value: boolean | null): CountQuery;
};

type RowsQueryResult = {
  data: unknown[] | null;
  error: QueryErrorResult | null;
};

export type AdminNavBadgeCounts = Record<string, number>;

export type AdminServiceRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  price_from: string;
  duration: string | null;
  whatsapp_message: string;
  is_active: boolean;
  sort_order: number;
  service_categories?: { key?: string; name?: string } | null;
};

export type AdminServicePackageRecord = {
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

export type AdminServiceFaqRecord = {
  id: string;
  service_id: string;
  question: string;
  answer: string;
  is_active: boolean;
  sort_order: number;
};

export type AdminServiceCtaRecord = {
  id: string;
  service_id: string;
  label: string;
  placement: string;
  whatsapp_message: string | null;
  is_active: boolean;
  sort_order: number;
};

export type AdminServiceMediaRecord = {
  id: string;
  service_id: string;
  media_type: string;
  title: string | null;
  url: string | null;
  alt_text: string | null;
  is_active: boolean;
  sort_order: number;
};

export type AdminContentTranslationRecord = {
  id: string;
  entity_type: string;
  entity_id: string;
  locale: "ht" | "es" | "en" | "fr" | "pt";
  field_name: string;
  value: string;
};

export type AdminCtaClickRecord = {
  id: string;
  service_slug: string | null;
  service_category: string | null;
  source: string | null;
  placement: string | null;
  page_path: string | null;
  country: string | null;
  redirect_url: string | null;
  created_at: string;
};

export type AdminVisitorEventRecord = {
  id: string;
  event_name: string;
  page_path: string | null;
  service_slug: string | null;
  source: string | null;
  placement: string | null;
  country: string | null;
  created_at: string;
};

export type AdminAuditLogRecord = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  outcome: "success" | "failure";
  created_at: string;
};

export type AdminWebhookLogRecord = {
  id: string;
  provider:
    | "stripe"
    | "sendpulse"
    | "identity"
    | "dropbox_sign"
    | "didit"
    | "signnow";
  provider_event_id: string | null;
  event_type: string;
  status: "received" | "processed" | "failed";
  error_message: string | null;
  created_at: string;
};

export type AdminSendPulseContactRecord = {
  id: string;
  provider_contact_id: string | null;
  channel: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  username: string | null;
  source: string | null;
  lead_status: string;
  last_seen_at: string;
  created_at: string;
};

export type AdminSendPulseConversationRecord = {
  id: string;
  provider_conversation_id: string | null;
  contact_id: string | null;
  channel: string;
  status: string;
  last_message_at: string | null;
  created_at: string;
  sendpulse_contacts?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    provider_contact_id?: string | null;
  } | null;
};

export type AdminSendPulseMessageRecord = {
  id: string;
  conversation_id: string | null;
  contact_id: string | null;
  direction: "inbound" | "outbound" | "system";
  message_type: string;
  body: string | null;
  occurred_at: string;
  created_at: string;
  sendpulse_contacts?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
};

export type AdminBotFailureRecord = {
  id: string;
  conversation_id: string | null;
  contact_id: string | null;
  message_id: string | null;
  provider_event_id: string | null;
  failure_type: string;
  reason: string | null;
  created_at: string;
  sendpulse_contacts?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
};

export type AdminSupportTicketRecord = {
  id: string;
  conversation_id: string | null;
  contact_id: string | null;
  status: string;
  priority: string;
  subject: string | null;
  latest_message_at: string | null;
  created_by_source: string;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  latest_message_body?: string | null;
  sendpulse_contacts?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    provider_contact_id?: string | null;
  } | null;
};

export type AdminLeadScoreRecord = {
  id: string;
  contact_id: string;
  score: number;
  status: string;
  signal_count: number;
  last_signal: string | null;
  last_activity_at: string | null;
  updated_at: string;
  sendpulse_contacts?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    provider_contact_id?: string | null;
    channel?: string | null;
  } | null;
};

export type AdminArtistRecord = {
  id: string;
  user_id: string;
  legal_name: string | null;
  artist_name: string | null;
  country: string | null;
  phone: string | null;
  status: string;
  identity_status: string;
  contract_status: string;
  created_at: string;
  profiles?: { email?: string; full_name?: string | null } | null;
};

export type AdminIdentityVerificationRecord = {
  id: string;
  user_id: string;
  artist_profile_id: string | null;
  provider: string;
  provider_verification_id: string | null;
  status: string;
  verification_url: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminArtistContractRecord = {
  id: string;
  user_id: string;
  artist_profile_id: string | null;
  provider: string;
  provider_signature_request_id: string | null;
  provider_document_id?: string | null;
  provider_invite_id?: string | null;
  title: string;
  status: string;
  signing_url: string | null;
  signed_document_url: string | null;
  document_reference?: string | null;
  original_filename?: string | null;
  content_type?: string | null;
  size_bytes?: number | null;
  signer_email?: string | null;
  signer_name?: string | null;
  metadata?: Record<string, unknown> | null;
  signed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminLegalHistoryRecord = {
  id: string;
  user_id: string;
  artist_profile_id: string | null;
  entity_type: string;
  entity_id: string | null;
  changed_by: string | null;
  from_status: string | null;
  to_status: string;
  notes: string | null;
  created_at: string;
};

export type AdminSubscriptionRecord = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  profiles?: { email?: string; full_name?: string | null } | null;
};

export type AdminArtistPaymentRecord = {
  id: string;
  user_id: string;
  release_id?: string | null;
  product_key: string;
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_total: number | null;
  currency: string | null;
  status: string;
  payment_status: string | null;
  created_at: string;
  profiles?: { email?: string; full_name?: string | null } | null;
  releases?: {
    title?: string | null;
    primary_artist?: string | null;
    release_type?: string | null;
    status?: string | null;
    desired_release_date?: string | null;
  } | null;
};

export type AdminReleaseRecord = {
  id: string;
  user_id: string;
  release_type: string;
  title: string;
  primary_artist: string;
  status: string;
  desired_release_date: string | null;
  external_files_url: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { email?: string; full_name?: string | null } | null;
  artist_profiles?: { artist_name?: string | null; legal_name?: string | null } | null;
};

export type AdminReleaseFileRecord = {
  id: string;
  release_id: string;
  file_type: string;
  storage_provider: string;
  original_filename: string | null;
  content_type: string | null;
  size_bytes: number | null;
  status: string;
  uploaded_at: string | null;
  created_at: string;
  releases?: {
    title?: string | null;
    primary_artist?: string | null;
    release_type?: string | null;
    user_id?: string | null;
    profiles?: { email?: string; full_name?: string | null } | null;
  } | null;
};

export type AdminArtistReportPeriodRecord = {
  id: string;
  title: string;
  period_start: string;
  period_end: string;
  source: string;
  uploaded_by: string | null;
  notes: string | null;
  created_at: string;
};

export type AdminArtistReportEntryRecord = {
  id: string;
  period_id: string;
  user_id: string;
  artist_profile_id: string | null;
  release_id: string | null;
  song_title: string | null;
  platform: string;
  country: string | null;
  streams: number;
  views: number;
  revenue_amount: number;
  currency: string;
  notes: string | null;
  created_at: string;
  artist_report_periods?: {
    title?: string | null;
    period_start?: string | null;
    period_end?: string | null;
    source?: string | null;
  } | null;
  artist_profiles?: {
    artist_name?: string | null;
    legal_name?: string | null;
  } | null;
  releases?: {
    title?: string | null;
    primary_artist?: string | null;
    release_type?: string | null;
  } | null;
  profiles?: { email?: string; full_name?: string | null } | null;
};

export type AdminRoleRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

export type AdminPermissionRecord = {
  id: string;
  key: string;
  name: string;
  description: string | null;
};

export type AdminRolePermissionRecord = {
  role_id: string;
  permission_id: string;
  permissions?: {
    id?: string;
    key?: string;
    name?: string;
    description?: string | null;
  } | null;
};

export type AdminUserRoleRecord = {
  user_id: string;
  role_id: string;
  roles?: { key?: string; name?: string } | { key?: string; name?: string }[] | null;
  profiles?: {
    email?: string;
    full_name?: string | null;
    user_type?: string;
    status?: string;
  } | null;
};

export type AdminUserPermissionOverrideRecord = {
  user_id: string;
  permission_id: string;
  is_allowed: boolean;
  permissions?: {
    id?: string;
    key?: string;
    name?: string;
    description?: string | null;
  } | null;
};

export type AdminSetupItem = {
  label: string;
  env: string;
  configured: boolean;
  area: "Supabase" | "Stripe" | "SendPulse" | "R2" | "Legal" | "App";
};

export async function getAdminDashboardData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      metrics: emptyDashboardMetrics(),
      dailyFunnel: buildEmptyDailyFunnel(),
      latestCtaClicks: [],
      latestEvents: [],
      serviceBreakdown: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const weekStart = daysAgo(6).toISOString();

  const [
    pageViewsToday,
    ctaClicksToday,
    ctaClicksMonth,
    activeArtists,
    pendingWebhooks,
    activeServices,
  ] = await Promise.all([
    countRows(supabase, "visitor_events", (query) =>
      query.eq("event_name", "page_view").gte("created_at", todayStart),
    ),
    countRows(supabase, "cta_clicks", (query) =>
      query.gte("created_at", todayStart),
    ),
    countRows(supabase, "cta_clicks", (query) =>
      query.gte("created_at", monthStart),
    ),
    countRows(supabase, "artist_profiles", (query) =>
      query.in("status", [
        "active_pending_verification",
        "identity_pending",
        "identity_verified",
        "contract_pending",
        "verified_artist",
      ]),
    ),
    countRows(supabase, "webhook_logs", (query) =>
      query.in("status", ["received", "failed"]),
    ),
    countRows(supabase, "services", (query) =>
      query.eq("is_active", true).in("slug", canonicalServiceSlugs),
    ),
  ]);

  const [
    latestCtaClicksResult,
    latestEventsResult,
    weeklyCtaResult,
    weeklyEventsResult,
  ] = await Promise.all([
    fetchRows<AdminCtaClickRecord>(
      supabase
        .from("cta_clicks")
        .select(
          "id,service_slug,service_category,source,placement,page_path,country,redirect_url,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(8),
      "cta_clicks recientes",
    ),
    fetchRows<AdminVisitorEventRecord>(
      supabase
        .from("visitor_events")
        .select(
          "id,event_name,page_path,service_slug,source,placement,country,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(8),
      "visitor_events recientes",
    ),
    fetchRows<AdminCtaClickRecord>(
      supabase
        .from("cta_clicks")
        .select(
          "id,service_slug,service_category,source,placement,page_path,country,redirect_url,created_at",
        )
        .gte("created_at", weekStart)
        .order("created_at", { ascending: true })
        .limit(500),
      "cta_clicks semana",
    ),
    fetchRows<AdminVisitorEventRecord>(
      supabase
        .from("visitor_events")
        .select(
          "id,event_name,page_path,service_slug,source,placement,country,created_at",
        )
        .gte("created_at", weekStart)
        .order("created_at", { ascending: true })
        .limit(500),
      "visitor_events semana",
    ),
  ]);

  const errors = collectErrors(
    pageViewsToday,
    ctaClicksToday,
    ctaClicksMonth,
    activeArtists,
    pendingWebhooks,
    activeServices,
    latestCtaClicksResult,
    latestEventsResult,
    weeklyCtaResult,
    weeklyEventsResult,
  );

  return {
    metrics: [
      {
        label: "Visitas hoy",
        value: pageViewsToday.count,
        detail: "Visitas registradas hoy.",
      },
      {
        label: "Clics WhatsApp hoy",
        value: ctaClicksToday.count,
        detail: `${ctaClicksMonth.count} clics registrados este mes.`,
      },
      {
        label: "Servicios activos",
        value: activeServices.count,
        detail: "Servicios publicados en el catálogo.",
      },
      {
        label: "Artistas activos",
        value: activeArtists.count,
        detail: "Cuentas en estados operativos.",
      },
      {
        label: "Avisos pendientes",
        value: pendingWebhooks.count,
        detail: "Avisos recibidos o fallidos por revisar.",
      },
    ],
    dailyFunnel: buildDailyFunnel(
      weeklyCtaResult.data,
      weeklyEventsResult.data,
    ),
    latestCtaClicks: latestCtaClicksResult.data,
    latestEvents: latestEventsResult.data,
    serviceBreakdown: buildServiceBreakdown(weeklyCtaResult.data),
    errors,
  };
}

export async function markAdminNavSectionSeen(pathname: string) {
  const sectionPath = getAdminNotificationSectionPath(pathname);

  if (!sectionPath) {
    return;
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const writeClient = createServiceSupabaseClient() ?? supabase;

  await writeClient.from("admin_notification_reads").upsert(
    {
      user_id: user.id,
      section_path: sectionPath,
      last_seen_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,section_path",
    },
  );
}

export async function getAdminNavBadgeCounts(): Promise<AdminNavBadgeCounts> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {};
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {};
  }

  const lastSeenByPath = await getAdminNotificationLastSeenMap(user.id);
  const releaseWorkStatuses = [
    "submitted",
    "under_review",
    "needs_changes",
    "approved",
    "ready_for_tunecore",
    "uploaded_to_tunecore",
  ];
  const openTicketStatuses = ["new", "open", "pending"];
  const activeArtistStatuses = [
    "active_pending_verification",
    "identity_pending",
    "identity_verified",
    "contract_pending",
    "verified_artist",
  ];
  const pendingArtistContractStatuses = [
    "not_started",
    "requested",
    "pending",
    "draft",
    "sent",
    "viewed",
    "declined",
    "expired",
  ];
  const openConversationStatuses = ["open", "pending"];

  const [
    newLeads,
    openConversations,
    openTickets,
    pendingReleases,
    activeArtists,
    paidPayments,
    activeSubscriptions,
    pendingArtistContracts,
    pendingContractRows,
    pendingIdentityVerifications,
    uploadedReleaseFiles,
    newArtistReports,
    pendingWebhooks,
    alertReleases,
    alertTickets,
    alertArtistContracts,
    alertContractRows,
    alertWebhooks,
    reportPayments,
    reportReleases,
    reportTickets,
    reportContracts,
    auditFailures,
  ] = await Promise.all([
    countRows(supabase, "lead_scores", (query) =>
      applyUnreadSince(
        query.in("status", ["new", "contacted", "qualified"]),
        lastSeenByPath,
        "/admin/leads",
        "updated_at",
      ),
    ),
    countRows(supabase, "sendpulse_conversations", (query) =>
      applyUnreadSince(
        query.in("status", openConversationStatuses),
        lastSeenByPath,
        "/admin/sendpulse",
        "updated_at",
      ),
    ),
    countRows(supabase, "support_tickets", (query) =>
      applyUnreadSince(
        query.in("status", openTicketStatuses),
        lastSeenByPath,
        "/admin/tickets",
        "updated_at",
      ),
    ),
    countRows(supabase, "releases", (query) =>
      applyUnreadSince(
        query.in("status", releaseWorkStatuses),
        lastSeenByPath,
        "/admin/releases",
        "updated_at",
      ),
    ),
    countRows(supabase, "artist_profiles", (query) =>
      applyUnreadSince(
        query.in("status", activeArtistStatuses),
        lastSeenByPath,
        "/admin/artists",
        "updated_at",
      ),
    ),
    countRows(supabase, "artist_payments", (query) =>
      applyUnreadSince(
        query.eq("status", "paid"),
        lastSeenByPath,
        "/admin/payments",
      ),
    ),
    countRows(supabase, "artist_subscriptions", (query) =>
      applyUnreadSince(
        query.in("status", ["active", "trialing"]),
        lastSeenByPath,
        "/admin/payments",
        "updated_at",
      ),
    ),
    countRows(supabase, "artist_profiles", (query) =>
      applyUnreadSince(
        query.in("contract_status", pendingArtistContractStatuses),
        lastSeenByPath,
        "/admin/contracts",
        "updated_at",
      ),
    ),
    countRows(supabase, "artist_contracts", (query) =>
      applyUnreadSince(
        query.in("status", ["requested", "draft", "sent", "viewed", "declined", "expired"]),
        lastSeenByPath,
        "/admin/contracts",
        "updated_at",
      ),
    ),
    countRows(supabase, "identity_verifications", (query) =>
      applyUnreadSince(
        query.in("status", ["created", "pending", "submitted", "in_review"]),
        lastSeenByPath,
        "/admin/verifications",
        "updated_at",
      ),
    ),
    countRows(supabase, "release_files", (query) =>
      applyUnreadSince(
        query.eq("status", "uploaded"),
        lastSeenByPath,
        "/admin/files",
      ),
    ),
    countRows(supabase, "artist_report_entries", (query) =>
      applyUnreadSince(query, lastSeenByPath, "/admin/artist-reports"),
    ),
    countRows(supabase, "webhook_logs", (query) =>
      applyUnreadSince(
        query.in("status", ["received", "failed"]),
        lastSeenByPath,
        "/admin/webhooks",
      ),
    ),
    countRows(supabase, "releases", (query) =>
      applyUnreadSince(
        query.in("status", releaseWorkStatuses),
        lastSeenByPath,
        "/admin/alerts",
        "updated_at",
      ),
    ),
    countRows(supabase, "support_tickets", (query) =>
      applyUnreadSince(
        query.in("status", openTicketStatuses),
        lastSeenByPath,
        "/admin/alerts",
        "updated_at",
      ),
    ),
    countRows(supabase, "artist_profiles", (query) =>
      applyUnreadSince(
        query.in("contract_status", pendingArtistContractStatuses),
        lastSeenByPath,
        "/admin/alerts",
        "updated_at",
      ),
    ),
    countRows(supabase, "artist_contracts", (query) =>
      applyUnreadSince(
        query.in("status", ["requested", "draft", "sent", "viewed", "declined", "expired"]),
        lastSeenByPath,
        "/admin/alerts",
        "updated_at",
      ),
    ),
    countRows(supabase, "webhook_logs", (query) =>
      applyUnreadSince(
        query.in("status", ["received", "failed"]),
        lastSeenByPath,
        "/admin/alerts",
      ),
    ),
    countRows(supabase, "artist_payments", (query) =>
      applyUnreadSince(query, lastSeenByPath, "/admin/reports"),
    ),
    countRows(supabase, "releases", (query) =>
      applyUnreadSince(query, lastSeenByPath, "/admin/reports"),
    ),
    countRows(supabase, "support_tickets", (query) =>
      applyUnreadSince(query, lastSeenByPath, "/admin/reports"),
    ),
    countRows(supabase, "artist_contracts", (query) =>
      applyUnreadSince(query, lastSeenByPath, "/admin/reports"),
    ),
    countRows(supabase, "audit_logs", (query) =>
      applyUnreadSince(
        query.eq("outcome", "failure"),
        lastSeenByPath,
        "/admin/audit",
      ),
    ),
  ]);

  const contractsNeedingWork =
    pendingArtistContracts.count + pendingContractRows.count;
  const reportRows =
    reportPayments.count +
    reportReleases.count +
    reportTickets.count +
    reportContracts.count;
  const alertTotal =
    alertReleases.count +
    alertTickets.count +
    alertArtistContracts.count +
    alertContractRows.count +
    alertWebhooks.count;

  return removeEmptyCounts({
    "/admin/leads": newLeads.count,
    "/admin/sendpulse": openConversations.count,
    "/admin/tickets": openTickets.count,
    "/admin/reports": reportRows,
    "/admin/alerts": alertTotal,
    "/admin/artists": activeArtists.count,
    "/admin/verifications": pendingIdentityVerifications.count,
    "/admin/releases": pendingReleases.count,
    "/admin/files": uploadedReleaseFiles.count,
    "/admin/payments": paidPayments.count + activeSubscriptions.count,
    "/admin/contracts": contractsNeedingWork,
    "/admin/artist-reports": newArtistReports.count,
    "/admin/webhooks": pendingWebhooks.count,
    "/admin/audit": auditFailures.count,
  });
}

export async function getAdminServicesData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      services: [],
      packages: [],
      faqs: [],
      ctas: [],
      media: [],
      translations: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const servicesResult = await fetchRows<AdminServiceRecord>(
      supabase
        .from("services")
        .select(
          "id,slug,title,summary,price_from,duration,whatsapp_message,is_active,sort_order,service_categories(key,name)",
        )
      .in("slug", [...canonicalServiceSlugs])
      .order("sort_order", { ascending: true }),
    "services",
  );
  const serviceIds = servicesResult.data.map((service) => service.id);
  const [packagesResult, faqsResult, ctasResult, mediaResult, translationsResult] =
    serviceIds.length > 0
      ? await Promise.all([
          fetchRows<AdminServicePackageRecord>(
            supabase
              .from("service_packages")
              .select("id,service_id,title,description,price_label,duration,features,is_active,sort_order")
              .in("service_id", serviceIds)
              .order("sort_order", { ascending: true }),
            "service_packages",
          ),
          fetchRows<AdminServiceFaqRecord>(
            supabase
              .from("service_faqs")
              .select("id,service_id,question,answer,is_active,sort_order")
              .in("service_id", serviceIds)
              .order("sort_order", { ascending: true }),
            "service_faqs",
          ),
          fetchRows<AdminServiceCtaRecord>(
            supabase
              .from("service_ctas")
              .select("id,service_id,label,placement,whatsapp_message,is_active,sort_order")
              .in("service_id", serviceIds)
              .order("sort_order", { ascending: true }),
            "service_ctas",
          ),
          fetchRows<AdminServiceMediaRecord>(
            supabase
              .from("service_media")
              .select("id,service_id,media_type,title,url,alt_text,is_active,sort_order")
              .in("service_id", serviceIds)
              .order("sort_order", { ascending: true }),
            "service_media",
          ),
          fetchRows<AdminContentTranslationRecord>(
            supabase
              .from("content_translations")
              .select("id,entity_type,entity_id,locale,field_name,value")
              .in("entity_id", serviceIds),
            "content_translations",
          ),
        ])
      : [
          emptyRows<AdminServicePackageRecord>(),
          emptyRows<AdminServiceFaqRecord>(),
          emptyRows<AdminServiceCtaRecord>(),
          emptyRows<AdminServiceMediaRecord>(),
          emptyRows<AdminContentTranslationRecord>(),
        ];

  return {
    services: servicesResult.data,
    packages: packagesResult.data,
    faqs: faqsResult.data,
    ctas: ctasResult.data,
    media: mediaResult.data,
    translations: translationsResult.data,
    errors: collectErrors(
      servicesResult,
      packagesResult,
      faqsResult,
      ctasResult,
      mediaResult,
      translationsResult,
    ),
  };
}

export async function getAdminLeadsData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      clicks: [],
      leadScores: [],
      serviceBreakdown: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const [clicksResult, leadScoresResult] = await Promise.all([
    fetchRows<AdminCtaClickRecord>(
      supabase
        .from("cta_clicks")
        .select(
          "id,service_slug,service_category,source,placement,page_path,country,redirect_url,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(100),
      "cta_clicks",
    ),
    fetchRows<AdminLeadScoreRecord>(
      supabase
        .from("lead_scores")
        .select(
          "id,contact_id,score,status,signal_count,last_signal,last_activity_at,updated_at,sendpulse_contacts(name,phone,email,provider_contact_id,channel)",
        )
        .order("score", { ascending: false })
        .order("last_activity_at", { ascending: false })
        .limit(100),
      "lead_scores",
    ),
  ]);

  return {
    clicks: clicksResult.data,
    leadScores: leadScoresResult.data,
    serviceBreakdown: buildServiceBreakdown(clicksResult.data),
    errors: collectErrors(clicksResult, leadScoresResult),
  };
}

export async function getAdminAnalyticsData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      events: [],
      eventBreakdown: [],
      serviceBreakdown: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const result = await fetchRows<AdminVisitorEventRecord>(
    supabase
      .from("visitor_events")
      .select(
        "id,event_name,page_path,service_slug,source,placement,country,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    "visitor_events",
  );

  return {
    events: result.data,
    eventBreakdown: countBy(result.data, (event) => event.event_name),
    serviceBreakdown: countBy(
      result.data,
      (event) => event.service_slug ?? "sin-servicio",
    ),
    errors: collectErrors(result),
  };
}

export async function getAdminLogsData(provider?: AdminWebhookLogRecord["provider"]) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      auditLogs: [],
      webhookLogs: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const webhookQuery = supabase
    .from("webhook_logs")
    .select(
      "id,provider,provider_event_id,event_type,status,error_message,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const [auditResult, webhookResult] = await Promise.all([
    fetchRows<AdminAuditLogRecord>(
      supabase
        .from("audit_logs")
        .select("id,actor_id,action,entity_type,entity_id,outcome,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      "audit_logs",
    ),
    fetchRows<AdminWebhookLogRecord>(
      provider ? webhookQuery.eq("provider", provider) : webhookQuery,
      provider ? `webhook_logs ${provider}` : "webhook_logs",
    ),
  ]);

  return {
    auditLogs: auditResult.data,
    webhookLogs: webhookResult.data,
    errors: collectErrors(auditResult, webhookResult),
  };
}

export async function getAdminSendPulseData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      contacts: [],
      conversations: [],
      messages: [],
      botFailures: [],
      webhookLogs: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const [
    contactsResult,
    conversationsResult,
    messagesResult,
    botFailuresResult,
    webhookLogsResult,
  ] = await Promise.all([
    fetchRows<AdminSendPulseContactRecord>(
      supabase
        .from("sendpulse_contacts")
        .select(
          "id,provider_contact_id,channel,name,phone,email,username,source,lead_status,last_seen_at,created_at",
        )
        .order("last_seen_at", { ascending: false })
        .limit(100),
      "sendpulse_contacts",
    ),
    fetchRows<AdminSendPulseConversationRecord>(
      supabase
        .from("sendpulse_conversations")
        .select(
          "id,provider_conversation_id,contact_id,channel,status,last_message_at,created_at,sendpulse_contacts(name,phone,email,provider_contact_id)",
        )
        .order("last_message_at", { ascending: false })
        .limit(100),
      "sendpulse_conversations",
    ),
    fetchRows<AdminSendPulseMessageRecord>(
      supabase
        .from("sendpulse_messages")
        .select(
          "id,conversation_id,contact_id,direction,message_type,body,occurred_at,created_at,sendpulse_contacts(name,phone,email)",
        )
        .order("occurred_at", { ascending: false })
        .limit(100),
      "sendpulse_messages",
    ),
    fetchRows<AdminBotFailureRecord>(
      supabase
        .from("bot_failures")
        .select(
          "id,conversation_id,contact_id,message_id,provider_event_id,failure_type,reason,created_at,sendpulse_contacts(name,phone,email)",
        )
        .order("created_at", { ascending: false })
        .limit(50),
      "bot_failures",
    ),
    fetchRows<AdminWebhookLogRecord>(
      supabase
        .from("webhook_logs")
        .select(
          "id,provider,provider_event_id,event_type,status,error_message,created_at",
        )
        .eq("provider", "sendpulse")
        .order("created_at", { ascending: false })
        .limit(50),
      "webhook_logs sendpulse",
    ),
  ]);

  return {
    contacts: contactsResult.data,
    conversations: conversationsResult.data,
    messages: messagesResult.data,
    botFailures: botFailuresResult.data,
    webhookLogs: webhookLogsResult.data,
    errors: collectErrors(
      contactsResult,
      conversationsResult,
      messagesResult,
      botFailuresResult,
      webhookLogsResult,
    ),
  };
}

export async function getAdminTicketsData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      tickets: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const ticketsResult = await fetchRows<AdminSupportTicketRecord>(
    supabase
      .from("support_tickets")
      .select(
        "id,conversation_id,contact_id,status,priority,subject,latest_message_at,created_by_source,resolved_at,closed_at,created_at,updated_at,sendpulse_contacts(name,phone,email,provider_contact_id)",
      )
      .order("latest_message_at", { ascending: false })
      .limit(100),
    "support_tickets",
  );
  const conversationIds = ticketsResult.data
    .map((ticket) => ticket.conversation_id)
    .filter((id): id is string => Boolean(id));
  const messagesResult =
    conversationIds.length > 0
      ? await fetchRows<{
          conversation_id: string;
          body: string | null;
          occurred_at: string;
        }>(
          supabase
            .from("sendpulse_messages")
            .select("conversation_id,body,occurred_at")
            .in("conversation_id", conversationIds)
            .order("occurred_at", { ascending: false }),
          "sendpulse_messages ticket previews",
        )
      : { data: [], error: undefined };
  const latestMessageByConversation = new Map<string, string | null>();

  for (const message of messagesResult.data) {
    if (!latestMessageByConversation.has(message.conversation_id)) {
      latestMessageByConversation.set(message.conversation_id, message.body);
    }
  }

  return {
    tickets: ticketsResult.data.map((ticket) => ({
      ...ticket,
      latest_message_body: ticket.conversation_id
        ? latestMessageByConversation.get(ticket.conversation_id) ?? null
        : null,
    })),
    errors: collectErrors(ticketsResult, messagesResult),
  };
}

export async function getAdminArtistsData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { artists: [], errors: ["Supabase no está configurado."] };
  }

  const result = await fetchRows<AdminArtistRecord>(
    supabase
      .from("artist_profiles")
      .select(
        "id,user_id,legal_name,artist_name,country,phone,status,identity_status,contract_status,created_at,profiles(email,full_name)",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    "artist_profiles",
  );

  return {
    artists: result.data,
    errors: collectErrors(result),
  };
}

export async function getAdminLegalData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      artists: [],
      identityVerifications: [],
      contracts: [],
      history: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const [artistsResult, contractsResult] =
    await Promise.all([
      fetchRows<AdminArtistRecord>(
        supabase
          .from("artist_profiles")
          .select(
            "id,user_id,legal_name,artist_name,country,phone,status,identity_status,contract_status,created_at,profiles(email,full_name)",
          )
          .order("created_at", { ascending: false })
          .limit(100),
        "artist_profiles legal",
      ),
      fetchRows<AdminArtistContractRecord>(
        supabase
          .from("artist_contracts")
          .select(
            "id,user_id,artist_profile_id,provider,provider_signature_request_id,title,status,signing_url,signed_document_url,document_reference,metadata,signed_at,completed_at,created_at,updated_at",
          )
          .order("created_at", { ascending: false })
          .limit(100),
        "artist_contracts",
      ),
    ]);

  return {
    artists: artistsResult.data,
    identityVerifications: [],
    contracts: contractsResult.data,
    history: [],
    errors: collectErrors(artistsResult, contractsResult),
  };
}

export async function getAdminVerificationsData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      artists: [],
      identityVerifications: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const [artistsResult, identityResult] = await Promise.all([
    fetchRows<AdminArtistRecord>(
      supabase
        .from("artist_profiles")
        .select("id,user_id,legal_name,artist_name,country,phone,status,identity_status,contract_status,created_at,profiles(email,full_name)")
        .order("created_at", { ascending: false })
        .limit(200),
      "artist_profiles verifications",
    ),
    fetchRows<AdminIdentityVerificationRecord>(
      supabase
        .from("identity_verifications")
        .select("id,user_id,artist_profile_id,provider,provider_verification_id,status,verification_url,submitted_at,verified_at,rejected_at,created_at,updated_at")
        .order("created_at", { ascending: false })
        .limit(200),
      "identity_verifications",
    ),
  ]);

  return {
    artists: artistsResult.data,
    identityVerifications: identityResult.data,
    errors: collectErrors(artistsResult, identityResult),
  };
}

export async function getAdminPaymentsData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      subscriptions: [],
      payments: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const [subscriptionsResult, paymentsResult] = await Promise.all([
    fetchRows<AdminSubscriptionRecord>(
      supabase
        .from("artist_subscriptions")
        .select(
          "id,user_id,stripe_customer_id,stripe_subscription_id,status,current_period_start,current_period_end,created_at,profiles(email,full_name)",
        )
        .order("created_at", { ascending: false })
        .limit(100),
      "artist_subscriptions",
    ),
    fetchRows<AdminArtistPaymentRecord>(
      supabase
        .from("artist_payments")
        .select(
          "id,user_id,release_id,product_key,stripe_customer_id,stripe_checkout_session_id,stripe_payment_intent_id,amount_total,currency,status,payment_status,created_at,profiles(email,full_name),releases(title,primary_artist,release_type,status,desired_release_date)",
        )
        .order("created_at", { ascending: false })
        .limit(100),
      "artist_payments",
    ),
  ]);

  return {
    subscriptions: subscriptionsResult.data,
    payments: paymentsResult.data,
    errors: collectErrors(subscriptionsResult, paymentsResult),
  };
}

export async function getAdminReleasesData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      releases: [],
      payments: [],
      files: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const releasesResult = await fetchRows<AdminReleaseRecord>(
    supabase
      .from("releases")
      .select(
        "id,user_id,release_type,title,primary_artist,status,desired_release_date,external_files_url,created_at,updated_at,profiles(email,full_name),artist_profiles(artist_name,legal_name)",
      )
      .order("created_at", { ascending: false })
      .limit(100),
    "releases",
  );

  const candidateReleases = releasesResult.data.filter(
    (release) =>
      release.status !== "rejected" && release.status !== "cancelled",
  );
  const candidateReleaseIds = candidateReleases.map((release) => release.id);
  const filesResult =
    candidateReleaseIds.length > 0
      ? await fetchRows<AdminReleaseFileRecord>(
          supabase
            .from("release_files")
            .select(
              "id,release_id,file_type,storage_provider,original_filename,content_type,size_bytes,status,uploaded_at,created_at",
            )
            .in("release_id", candidateReleaseIds)
            .order("created_at", { ascending: false }),
          "release_files releases",
        )
      : { data: [], error: undefined };
  const files = filesResult.data.filter(
    (file) =>
      file.status !== "deleted" &&
      file.status !== "failed" &&
      file.status !== "pending_upload" &&
      file.storage_provider !== "external",
  );
  const releaseIdsWithUploadedFiles = new Set(
    files
      .filter((file) => file.status === "uploaded")
      .map((file) => file.release_id),
  );
  const visibleReleases = candidateReleases.filter(
    (release) =>
      release.status !== "draft" ||
      Boolean(release.external_files_url) ||
      releaseIdsWithUploadedFiles.has(release.id),
  );
  const visibleReleaseIds = visibleReleases.map((release) => release.id);
  const paymentsResult =
    visibleReleaseIds.length > 0
      ? await fetchRows<AdminArtistPaymentRecord>(
          supabase
            .from("artist_payments")
            .select(
              "id,user_id,release_id,product_key,stripe_customer_id,stripe_checkout_session_id,stripe_payment_intent_id,amount_total,currency,status,payment_status,created_at,profiles(email,full_name)",
            )
            .in("release_id", visibleReleaseIds),
          "artist_payments releases",
        )
      : { data: [], error: undefined };
  const visibleReleaseIdSet = new Set(visibleReleaseIds);

  return {
    releases: visibleReleases,
    payments: paymentsResult.data,
    files: files.filter((file) => visibleReleaseIdSet.has(file.release_id)),
    errors: collectErrors(releasesResult, paymentsResult, filesResult),
  };
}

export async function getAdminKanbanData() {
  const [releases, tickets, legal] = await Promise.all([
    getAdminReleasesData(),
    getAdminTicketsData(),
    getAdminLegalData(),
  ]);

  return {
    releases: releases.releases,
    tickets: tickets.tickets,
    contracts: legal.contracts,
    artists: legal.artists,
    errors: [...releases.errors, ...tickets.errors, ...legal.errors],
  };
}

export async function getAdminReportsData(input?: {
  from?: string | null;
  to?: string | null;
}) {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      metrics: [],
      funnel: [],
      rows: emptyReportRows(),
      errors: ["Supabase no está configurado."],
    };
  }

  const from = input?.from || daysAgo(30).toISOString();
  const to = input?.to || new Date().toISOString();
  const [
    eventsResult,
    clicksResult,
    contactsResult,
    artistsResult,
    subscriptionsResult,
    paymentsResult,
    releasesResult,
    ticketsResult,
    contractsResult,
    identityResult,
    artistReportsResult,
  ] = await Promise.all([
    fetchRows<AdminVisitorEventRecord>(
      applyDateRange(
        supabase
          .from("visitor_events")
          .select("id,event_name,page_path,service_slug,source,placement,country,created_at"),
        from,
        to,
      ).limit(1000),
      "visitor_events report",
    ),
    fetchRows<AdminCtaClickRecord>(
      applyDateRange(
        supabase
          .from("cta_clicks")
          .select("id,service_slug,service_category,source,placement,page_path,country,redirect_url,created_at"),
        from,
        to,
      ).limit(1000),
      "cta_clicks report",
    ),
    fetchRows<AdminSendPulseContactRecord>(
      applyDateRange(
        supabase
          .from("sendpulse_contacts")
          .select("id,provider_contact_id,channel,name,phone,email,username,source,lead_status,last_seen_at,created_at"),
        from,
        to,
      ).limit(1000),
      "sendpulse_contacts report",
    ),
    fetchRows<AdminArtistRecord>(
      applyDateRange(
        supabase
          .from("artist_profiles")
          .select("id,user_id,legal_name,artist_name,country,phone,status,identity_status,contract_status,created_at,profiles(email,full_name)"),
        from,
        to,
      ).limit(1000),
      "artist_profiles report",
    ),
    fetchRows<AdminSubscriptionRecord>(
      applyDateRange(
        supabase
          .from("artist_subscriptions")
          .select("id,user_id,stripe_customer_id,stripe_subscription_id,status,current_period_start,current_period_end,created_at,profiles(email,full_name)"),
        from,
        to,
      ).limit(1000),
      "artist_subscriptions report",
    ),
    fetchRows<AdminArtistPaymentRecord>(
      applyDateRange(
        supabase
          .from("artist_payments")
          .select("id,user_id,release_id,product_key,stripe_customer_id,stripe_checkout_session_id,stripe_payment_intent_id,amount_total,currency,status,payment_status,created_at,profiles(email,full_name)"),
        from,
        to,
      ).limit(1000),
      "artist_payments report",
    ),
    fetchRows<AdminReleaseRecord>(
      applyDateRange(
        supabase
          .from("releases")
          .select("id,user_id,release_type,title,primary_artist,status,desired_release_date,external_files_url,created_at,updated_at,profiles(email,full_name),artist_profiles(artist_name,legal_name)"),
        from,
        to,
      ).limit(1000),
      "releases report",
    ),
    fetchRows<AdminSupportTicketRecord>(
      applyDateRange(
        supabase
          .from("support_tickets")
          .select("id,conversation_id,contact_id,status,priority,subject,latest_message_at,created_by_source,resolved_at,closed_at,created_at,updated_at,sendpulse_contacts(name,phone,email,provider_contact_id)"),
        from,
        to,
      ).limit(1000),
      "support_tickets report",
    ),
    fetchRows<AdminArtistContractRecord>(
      applyDateRange(
        supabase
          .from("artist_contracts")
          .select("id,user_id,artist_profile_id,provider,provider_signature_request_id,title,status,signing_url,signed_document_url,document_reference,metadata,signed_at,completed_at,created_at,updated_at"),
        from,
        to,
      ).limit(1000),
      "artist_contracts report",
    ),
    fetchRows<AdminIdentityVerificationRecord>(
      applyDateRange(
        supabase
          .from("identity_verifications")
          .select("id,user_id,artist_profile_id,provider,provider_verification_id,status,verification_url,submitted_at,verified_at,rejected_at,created_at,updated_at"),
        from,
        to,
      ).limit(1000),
      "identity_verifications report",
    ),
    fetchRows<AdminArtistReportEntryRecord>(
      applyDateRange(
        supabase
          .from("artist_report_entries")
          .select(
            "id,period_id,user_id,artist_profile_id,release_id,song_title,platform,country,streams,views,revenue_amount,currency,notes,created_at,artist_report_periods(title,period_start,period_end,source),artist_profiles(artist_name,legal_name),releases(title,primary_artist,release_type),profiles(email,full_name)",
          ),
        from,
        to,
      ).limit(1000),
      "artist_report_entries report",
    ),
  ]);

  const pageViews = eventsResult.data.filter(
    (event) => event.event_name === "page_view",
  );
  const activeSubscriptions = subscriptionsResult.data.filter((item) =>
    ["active", "trialing"].includes(item.status),
  );
  const paidPayments = paymentsResult.data.filter((item) => item.status === "paid");
  const submittedReleases = releasesResult.data.filter((item) =>
    ["submitted", "under_review", "approved", "scheduled", "published"].includes(
      item.status,
    ),
  );

  return {
    metrics: [
      { label: "Visitas", value: pageViews.length },
      { label: "Clics WhatsApp", value: clicksResult.data.length },
      { label: "Contactos", value: contactsResult.data.length },
      { label: "Artistas registrados", value: artistsResult.data.length },
      { label: "Suscripciones activas", value: activeSubscriptions.length },
      { label: "Pagos lanzamientos", value: paidPayments.length },
      { label: "Lanzamientos enviados", value: submittedReleases.length },
      { label: "Casos de soporte", value: ticketsResult.data.length },
      { label: "Contratos firmados", value: contractsResult.data.filter((item) => ["signed", "completed"].includes(item.status)).length },
      { label: "Identidades verificadas", value: identityResult.data.filter((item) => item.status === "verified").length },
      { label: "Reportes artísticos", value: artistReportsResult.data.length },
    ],
    funnel: [
      { label: "Visitas", value: pageViews.length },
      { label: "Clics WhatsApp", value: clicksResult.data.length },
      { label: "Contacto", value: contactsResult.data.length },
      { label: "Registro artista", value: artistsResult.data.length },
      { label: "Pago", value: activeSubscriptions.length + paidPayments.length },
      { label: "Lanzamiento enviado", value: submittedReleases.length },
    ],
    rows: {
      events: eventsResult.data,
      clicks: clicksResult.data,
      contacts: contactsResult.data,
      artists: artistsResult.data,
      subscriptions: subscriptionsResult.data,
      payments: paymentsResult.data,
      releases: releasesResult.data,
      tickets: ticketsResult.data,
      contracts: contractsResult.data,
      identityVerifications: identityResult.data,
      artistReports: artistReportsResult.data,
    },
    errors: collectErrors(
      eventsResult,
      clicksResult,
      contactsResult,
      artistsResult,
      subscriptionsResult,
      paymentsResult,
      releasesResult,
      ticketsResult,
      contractsResult,
      identityResult,
      artistReportsResult,
    ),
  };
}

export async function getAdminArtistReportsData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      artists: [],
      releases: [],
      periods: [],
      entries: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const [artistsResult, releasesResult, periodsResult, entriesResult] =
    await Promise.all([
      fetchRows<AdminArtistRecord>(
        supabase
          .from("artist_profiles")
          .select("id,user_id,legal_name,artist_name,country,phone,status,identity_status,contract_status,created_at,profiles(email,full_name)")
          .order("created_at", { ascending: false })
          .limit(300),
        "artist_profiles artist reports",
      ),
      fetchRows<AdminReleaseRecord>(
        supabase
          .from("releases")
          .select("id,user_id,release_type,title,primary_artist,status,desired_release_date,external_files_url,created_at,updated_at,profiles(email,full_name),artist_profiles(artist_name,legal_name)")
          .order("created_at", { ascending: false })
          .limit(300),
        "releases artist reports",
      ),
      fetchRows<AdminArtistReportPeriodRecord>(
        supabase
          .from("artist_report_periods")
          .select("id,title,period_start,period_end,source,uploaded_by,notes,created_at")
          .order("created_at", { ascending: false })
          .limit(50),
        "artist_report_periods",
      ),
      fetchRows<AdminArtistReportEntryRecord>(
        supabase
          .from("artist_report_entries")
          .select("id,period_id,user_id,artist_profile_id,release_id,song_title,platform,country,streams,views,revenue_amount,currency,notes,created_at,artist_report_periods(title,period_start,period_end,source),artist_profiles(artist_name,legal_name),releases(title,primary_artist,release_type),profiles(email,full_name)")
          .order("created_at", { ascending: false })
          .limit(500),
        "artist_report_entries",
      ),
    ]);

  return {
    artists: artistsResult.data,
    releases: releasesResult.data,
    periods: periodsResult.data,
    entries: entriesResult.data,
    errors: collectErrors(
      artistsResult,
      releasesResult,
      periodsResult,
      entriesResult,
    ),
  };
}

export async function getAdminAlertsData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { alerts: [], errors: ["Supabase no está configurado."] };
  }

  const [paymentsResult, releasesResult, filesResult, artistsResult, ticketsResult, webhooksResult] =
    await Promise.all([
      fetchRows<AdminArtistPaymentRecord>(
        supabase
          .from("artist_payments")
          .select("id,user_id,release_id,product_key,stripe_customer_id,stripe_checkout_session_id,stripe_payment_intent_id,amount_total,currency,status,payment_status,created_at,profiles(email,full_name)")
          .eq("status", "paid")
          .limit(200),
        "artist_payments alerts",
      ),
      fetchRows<AdminReleaseRecord>(
        supabase
          .from("releases")
          .select("id,user_id,release_type,title,primary_artist,status,desired_release_date,external_files_url,created_at,updated_at,profiles(email,full_name),artist_profiles(artist_name,legal_name)")
          .in("status", ["submitted", "under_review", "needs_changes"])
          .limit(200),
        "releases alerts",
      ),
      fetchRows<AdminReleaseFileRecord>(
        supabase
          .from("release_files")
          .select("id,release_id,file_type,storage_provider,original_filename,content_type,size_bytes,status,uploaded_at,created_at")
          .eq("status", "uploaded")
          .limit(500),
        "release_files alerts",
      ),
      fetchRows<AdminArtistRecord>(
        supabase
          .from("artist_profiles")
          .select("id,user_id,legal_name,artist_name,country,phone,status,identity_status,contract_status,created_at,profiles(email,full_name)")
          .limit(200),
        "artist_profiles alerts",
      ),
      fetchRows<AdminSupportTicketRecord>(
        supabase
          .from("support_tickets")
          .select("id,conversation_id,contact_id,status,priority,subject,latest_message_at,created_by_source,resolved_at,closed_at,created_at,updated_at,sendpulse_contacts(name,phone,email,provider_contact_id)")
          .in("status", ["new", "open", "pending"])
          .limit(200),
        "support_tickets alerts",
      ),
      fetchRows<AdminWebhookLogRecord>(
        supabase
          .from("webhook_logs")
          .select("id,provider,provider_event_id,event_type,status,error_message,created_at")
          .in("status", ["received", "failed"])
          .limit(200),
        "webhook_logs alerts",
      ),
    ]);

  const uploadedReleaseIds = new Set(filesResult.data.map((file) => file.release_id));
  const releasePaymentProductKeys = new Set([
    "ep_release",
    "ep_release_fee",
    "album_release",
    "album_release_fee",
  ]);
  const alerts = [
    ...paymentsResult.data
      .filter((payment) =>
        releasePaymentProductKeys.has(payment.product_key) &&
        !payment.release_id,
      )
      .map((payment) => ({
        id: `payment-${payment.id}`,
        tone: "warning" as const,
        title: "Pago sin lanzamiento asociado",
        detail: `${payment.profiles?.email ?? payment.user_id} tiene ${payment.product_key} pagado sin release_id.`,
        href: "/admin/payments",
      })),
    ...releasesResult.data
      .filter(
        (release) =>
          !release.external_files_url && !uploadedReleaseIds.has(release.id),
      )
      .map((release) => ({
        id: `release-file-${release.id}`,
        tone: "danger" as const,
        title: "Lanzamiento sin archivo",
        detail: `${release.title} está ${release.status} sin archivo ni link externo.`,
        href: "/admin/releases",
      })),
    ...artistsResult.data
      .filter((artist) => artist.identity_status !== "verified")
      .map((artist) => ({
        id: `identity-${artist.id}`,
        tone: "warning" as const,
        title: "Identidad pendiente",
        detail: `${artist.artist_name ?? artist.profiles?.email ?? "Artista"} no tiene identidad verificada.`,
        href: "/admin/contracts",
      })),
    ...artistsResult.data
      .filter(
        (artist) =>
          artist.contract_status !== "signed" &&
          artist.contract_status !== "completed",
      )
      .map((artist) => ({
        id: `contract-${artist.id}`,
        tone: "warning" as const,
        title: "Contrato pendiente",
        detail: `${artist.artist_name ?? artist.profiles?.email ?? "Artista"} no tiene contrato firmado.`,
        href: "/admin/contracts",
      })),
    ...ticketsResult.data
      .filter((ticket) => ticket.priority === "urgent")
      .map((ticket) => ({
        id: `ticket-${ticket.id}`,
        tone: "danger" as const,
        title: "Caso urgente abierto",
        detail: ticket.subject ?? ticket.latest_message_body ?? "Caso urgente sin asunto.",
        href: "/admin/tickets",
      })),
    ...webhooksResult.data.map((webhook) => ({
      id: `webhook-${webhook.id}`,
      tone: webhook.status === "failed" ? ("danger" as const) : ("warning" as const),
      title: "Aviso automático pendiente o fallido",
      detail: `${webhook.provider} / ${webhook.event_type} / ${webhook.status}`,
      href: "/admin/webhooks",
    })),
  ];

  return {
    alerts,
    errors: collectErrors(
      paymentsResult,
      releasesResult,
      filesResult,
      artistsResult,
      ticketsResult,
      webhooksResult,
    ),
  };
}

export async function getAdminRolesData() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      roles: [],
      permissions: [],
      rolePermissions: [],
      userRoles: [],
      userPermissionOverrides: [],
      errors: ["Supabase no está configurado."],
    };
  }

  const [
    rolesResult,
    permissionsResult,
    rolePermissionsResult,
    userRolesResult,
    userPermissionOverridesResult,
  ] =
    await Promise.all([
      fetchRows<AdminRoleRecord>(
        supabase
          .from("roles")
          .select("id,key,name,description")
          .order("created_at", { ascending: true }),
        "roles",
      ),
      fetchRows<AdminPermissionRecord>(
        supabase
          .from("permissions")
          .select("id,key,name,description")
          .order("key", { ascending: true }),
        "permissions",
      ),
      fetchRows<AdminRolePermissionRecord>(
        supabase
          .from("role_permissions")
          .select("role_id,permission_id,permissions(id,key,name,description)"),
        "role_permissions",
      ),
      fetchRows<AdminUserRoleRecord>(
        supabase
          .from("user_roles")
          .select(
            "user_id,role_id,roles:roles!user_roles_role_id_fkey(key,name),profiles:profiles!user_roles_user_id_fkey(email,full_name,user_type,status)",
          )
          .order("created_at", { ascending: false })
          .limit(100),
        "user_roles",
      ),
      fetchRows<AdminUserPermissionOverrideRecord>(
        supabase
          .from("user_permission_overrides")
          .select("user_id,permission_id,is_allowed,permissions(id,key,name,description)"),
        "permisos individuales",
      ),
    ]);

  return {
    roles: rolesResult.data,
    permissions: permissionsResult.data,
    rolePermissions: rolePermissionsResult.data,
    userRoles: userRolesResult.data,
    userPermissionOverrides: userPermissionOverridesResult.data,
    errors: collectErrors(
      rolesResult,
      permissionsResult,
      rolePermissionsResult,
      userRolesResult,
      userPermissionOverridesResult,
    ),
  };
}

export function getAdminSetupStatus(): AdminSetupItem[] {
  return [
    {
      label: "Base URL pública",
      env: "APP_BASE_URL",
      configured: Boolean(getEnv("APP_BASE_URL") ?? getEnv("NEXT_PUBLIC_APP_BASE_URL")),
      area: "App",
    },
    {
      label: "Conexión principal de Supabase",
      env: "NEXT_PUBLIC_SUPABASE_URL",
      configured: Boolean(getEnv("NEXT_PUBLIC_SUPABASE_URL")),
      area: "Supabase",
    },
    {
      label: "Llave pública de Supabase",
      env: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      configured: Boolean(getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
      area: "Supabase",
    },
    {
      label: "Llave privada de Supabase",
      env: "SUPABASE_SERVICE_ROLE_KEY",
      configured: Boolean(getEnv("SUPABASE_SERVICE_ROLE_KEY")),
      area: "Supabase",
    },
    {
      label: "Llave privada de pagos",
      env: "STRIPE_SECRET_KEY",
      configured: Boolean(getEnv("STRIPE_SECRET_KEY")),
      area: "Stripe",
    },
    {
      label: "Firma de avisos de pagos",
      env: "STRIPE_WEBHOOK_SECRET",
      configured: Boolean(getEnv("STRIPE_WEBHOOK_SECRET")),
      area: "Stripe",
    },
    {
      label: "Firma de avisos de WhatsApp",
      env: "SENDPULSE_WEBHOOK_SECRET",
      configured: Boolean(getEnv("SENDPULSE_WEBHOOK_SECRET")),
      area: "SendPulse",
    },
    {
      label: "Carpeta de archivos de artistas",
      env: "R2_BUCKET_ARTIST_FILES",
      configured: Boolean(getEnv("R2_BUCKET_ARTIST_FILES")),
      area: "R2",
    },
    {
      label: "Firma de avisos de identidad",
      env: "DIDIT_WEBHOOK_SECRET",
      configured: Boolean(getEnv("DIDIT_WEBHOOK_SECRET")),
      area: "Legal",
    },
    {
      label: "Firma de avisos de contratos",
      env: "SIGNNOW_WEBHOOK_SECRET",
      configured: Boolean(getEnv("SIGNNOW_WEBHOOK_SECRET")),
      area: "Legal",
    },
    {
      label: "Didit API key",
      env: "DIDIT_API_KEY",
      configured: Boolean(getEnv("DIDIT_API_KEY")),
      area: "Legal",
    },
    {
      label: "signNow API key",
      env: "SIGNNOW_API_KEY",
      configured: Boolean(getEnv("SIGNNOW_API_KEY")),
      area: "Legal",
    },
  ];
}

function applyDateRange<T extends { gte: (column: string, value: string) => T; lte: (column: string, value: string) => T }>(
  query: T,
  from: string,
  to: string,
) {
  return query.gte("created_at", from).lte("created_at", to);
}

function emptyReportRows() {
  return {
    events: [] as AdminVisitorEventRecord[],
    clicks: [] as AdminCtaClickRecord[],
    contacts: [] as AdminSendPulseContactRecord[],
    artists: [] as AdminArtistRecord[],
    subscriptions: [] as AdminSubscriptionRecord[],
    payments: [] as AdminArtistPaymentRecord[],
    releases: [] as AdminReleaseRecord[],
    tickets: [] as AdminSupportTicketRecord[],
    contracts: [] as AdminArtistContractRecord[],
    identityVerifications: [] as AdminIdentityVerificationRecord[],
    artistReports: [] as AdminArtistReportEntryRecord[],
  };
}

async function countRows(
  supabase: Supabase,
  table: string,
  apply?: (query: CountQuery) => CountQuery,
): Promise<CountResult> {
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true }) as unknown as CountQuery;

  if (apply) {
    query = apply(query);
  }

  const { count, error } = await query;

  return {
    count: count ?? 0,
    error: error ? { source: table, message: error.message } : undefined,
  };
}

async function fetchRows<T>(
  query: PromiseLike<RowsQueryResult>,
  source: string,
) {
  const { data, error } = await query;

  return {
    data: (data ?? []) as T[],
    error: error ? { source, message: error.message } : undefined,
  };
}

function collectErrors(...items: Array<{ error?: QueryError } | CountResult>) {
  return items
    .map((item) => item.error)
    .filter((error): error is QueryError => Boolean(error))
    .map((error) => `${error.source}: ${error.message}`);
}

function emptyRows<T>() {
  return { data: [] as T[], error: undefined };
}

async function getAdminNotificationLastSeenMap(userId: string) {
  const readClient = createServiceSupabaseClient() ?? await createServerSupabaseClient();
  const lastSeenByPath = new Map<AdminNotificationSectionPath, string>();

  if (!readClient) {
    return lastSeenByPath;
  }

  const { data, error } = await readClient
    .from("admin_notification_reads")
    .select("section_path,last_seen_at")
    .eq("user_id", userId)
    .in("section_path", [...adminNotificationSections]);

  if (error || !data) {
    return lastSeenByPath;
  }

  for (const row of data as Array<{
    section_path: AdminNotificationSectionPath;
    last_seen_at: string;
  }>) {
    lastSeenByPath.set(row.section_path, row.last_seen_at);
  }

  return lastSeenByPath;
}

function applyUnreadSince(
  query: CountQuery,
  lastSeenByPath: Map<AdminNotificationSectionPath, string>,
  sectionPath: AdminNotificationSectionPath,
  column = "created_at",
) {
  const lastSeenAt = lastSeenByPath.get(sectionPath);

  return lastSeenAt ? query.gt(column, lastSeenAt) : query;
}

function removeEmptyCounts(counts: AdminNavBadgeCounts) {
  return Object.fromEntries(
    Object.entries(counts).filter(([, count]) => count > 0),
  ) as AdminNavBadgeCounts;
}

function emptyDashboardMetrics() {
  return [
    { label: "Visitas hoy", value: 0, detail: "Sin Supabase configurado." },
    { label: "Clics WhatsApp hoy", value: 0, detail: "Sin Supabase configurado." },
    { label: "Servicios activos", value: 0, detail: "Sin Supabase configurado." },
    { label: "Artistas activos", value: 0, detail: "Sin Supabase configurado." },
    { label: "Avisos pendientes", value: 0, detail: "Sin Supabase configurado." },
  ];
}

function buildDailyFunnel(
  ctaClicks: AdminCtaClickRecord[],
  events: AdminVisitorEventRecord[],
): AdminMetricsChartPoint[] {
  const points = buildEmptyDailyFunnel();

  for (const click of ctaClicks) {
    const point = points.find((item) => item.day === dayKey(click.created_at));

    if (point) {
      point.clicks += 1;
    }
  }

  for (const event of events) {
    if (event.event_name !== "page_view") {
      continue;
    }

    const point = points.find((item) => item.day === dayKey(event.created_at));

    if (point) {
      point.leads += 1;
    }
  }

  return points;
}

function buildEmptyDailyFunnel(): AdminMetricsChartPoint[] {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = daysAgo(6 - index);

    return {
      day: dayKey(date.toISOString()),
      leads: 0,
      clicks: 0,
    };
  });
}

function buildServiceBreakdown(clicks: AdminCtaClickRecord[]) {
  return countBy(clicks, (click) => click.service_slug ?? "sin-servicio");
}

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();

  for (const item of items) {
    const key = getKey(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysAgo(days: number) {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() - days);
  return date;
}

function dayKey(value: string) {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
