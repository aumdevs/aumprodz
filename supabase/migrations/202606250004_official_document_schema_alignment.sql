create table if not exists public.login_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  outcome text not null default 'success' check (outcome in ('success', 'failure')),
  reason text,
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.service_packages (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  title text not null,
  description text,
  price_label text,
  duration text,
  features jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_faqs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  question text not null,
  answer text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_ctas (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  label text not null,
  placement text not null default 'default',
  whatsapp_message text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_media (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  media_type text not null default 'image' check (media_type in ('image', 'video', 'document', 'external_link')),
  title text,
  url text,
  storage_bucket text,
  storage_key text,
  alt_text text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.utm_sources (
  id uuid primary key default gen_random_uuid(),
  utm_source text not null,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (utm_source, utm_medium, utm_campaign, utm_content, utm_term)
);

create table if not exists public.conversion_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.visitor_sessions(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null default 'conversion',
  conversion_type text not null,
  service_slug text,
  source text,
  placement text,
  page_path text,
  amount_total integer,
  currency text,
  provider text,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sendpulse_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text,
  event_type text not null,
  payload_hash text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received', 'processed', 'failed', 'ignored')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider_event_id),
  unique (payload_hash)
);

create table if not exists public.release_comments (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  visibility text not null default 'internal' check (visibility in ('internal', 'artist')),
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  stripe_customer_id text not null unique,
  email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  stripe_product_id text unique,
  name text not null,
  description text,
  product_type text not null default 'service',
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  key text not null unique,
  stripe_price_id text unique,
  amount_total integer not null,
  currency text not null default 'usd',
  interval text check (interval in ('day', 'week', 'month', 'year')),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  product_key text,
  price_key text,
  status text not null default 'pending',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  release_id uuid references public.releases(id) on delete set null,
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  product_key text,
  amount_total integer,
  currency text,
  status text not null default 'pending',
  payment_status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  stripe_customer_id text,
  stripe_invoice_id text unique,
  stripe_subscription_id text,
  amount_due integer,
  amount_paid integer,
  currency text,
  status text,
  hosted_invoice_url text,
  invoice_pdf text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'login_events',
    'service_packages',
    'service_faqs',
    'service_ctas',
    'service_media',
    'utm_sources',
    'conversion_events',
    'sendpulse_events',
    'release_comments',
    'stripe_customers',
    'products',
    'prices',
    'subscriptions',
    'payments',
    'invoices'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

drop trigger if exists touch_service_packages_updated_at on public.service_packages;
create trigger touch_service_packages_updated_at
before update on public.service_packages
for each row execute function public.touch_updated_at();

drop trigger if exists touch_service_faqs_updated_at on public.service_faqs;
create trigger touch_service_faqs_updated_at
before update on public.service_faqs
for each row execute function public.touch_updated_at();

drop trigger if exists touch_service_ctas_updated_at on public.service_ctas;
create trigger touch_service_ctas_updated_at
before update on public.service_ctas
for each row execute function public.touch_updated_at();

drop trigger if exists touch_service_media_updated_at on public.service_media;
create trigger touch_service_media_updated_at
before update on public.service_media
for each row execute function public.touch_updated_at();

drop trigger if exists touch_utm_sources_updated_at on public.utm_sources;
create trigger touch_utm_sources_updated_at
before update on public.utm_sources
for each row execute function public.touch_updated_at();

drop trigger if exists touch_release_comments_updated_at on public.release_comments;
create trigger touch_release_comments_updated_at
before update on public.release_comments
for each row execute function public.touch_updated_at();

drop trigger if exists touch_stripe_customers_updated_at on public.stripe_customers;
create trigger touch_stripe_customers_updated_at
before update on public.stripe_customers
for each row execute function public.touch_updated_at();

drop trigger if exists touch_products_updated_at on public.products;
create trigger touch_products_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

drop trigger if exists touch_prices_updated_at on public.prices;
create trigger touch_prices_updated_at
before update on public.prices
for each row execute function public.touch_updated_at();

drop trigger if exists touch_subscriptions_updated_at on public.subscriptions;
create trigger touch_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.touch_updated_at();

drop trigger if exists touch_payments_updated_at on public.payments;
create trigger touch_payments_updated_at
before update on public.payments
for each row execute function public.touch_updated_at();

drop trigger if exists touch_invoices_updated_at on public.invoices;
create trigger touch_invoices_updated_at
before update on public.invoices
for each row execute function public.touch_updated_at();

drop policy if exists "login_events_select_admin" on public.login_events;
create policy "login_events_select_admin"
on public.login_events for select
to authenticated
using (public.has_permission('audit_logs.read'));

drop policy if exists "login_events_insert_service" on public.login_events;
create policy "login_events_insert_service"
on public.login_events for insert
to authenticated
with check (user_id = auth.uid() or public.has_permission('audit_logs.read'));

drop policy if exists "service_packages_public_read_active" on public.service_packages;
create policy "service_packages_public_read_active"
on public.service_packages for select
to anon, authenticated
using (
  is_active = true
  or public.has_permission('content.manage')
);

drop policy if exists "service_packages_admin_manage" on public.service_packages;
create policy "service_packages_admin_manage"
on public.service_packages for all
to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));

drop policy if exists "service_faqs_public_read_active" on public.service_faqs;
create policy "service_faqs_public_read_active"
on public.service_faqs for select
to anon, authenticated
using (
  is_active = true
  or public.has_permission('content.manage')
);

drop policy if exists "service_faqs_admin_manage" on public.service_faqs;
create policy "service_faqs_admin_manage"
on public.service_faqs for all
to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));

drop policy if exists "service_ctas_public_read_active" on public.service_ctas;
create policy "service_ctas_public_read_active"
on public.service_ctas for select
to anon, authenticated
using (
  is_active = true
  or public.has_permission('content.manage')
);

drop policy if exists "service_ctas_admin_manage" on public.service_ctas;
create policy "service_ctas_admin_manage"
on public.service_ctas for all
to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));

drop policy if exists "service_media_public_read_active" on public.service_media;
create policy "service_media_public_read_active"
on public.service_media for select
to anon, authenticated
using (
  is_active = true
  or public.has_permission('content.manage')
);

drop policy if exists "service_media_admin_manage" on public.service_media;
create policy "service_media_admin_manage"
on public.service_media for all
to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));

drop policy if exists "utm_sources_select_admin" on public.utm_sources;
create policy "utm_sources_select_admin"
on public.utm_sources for select
to authenticated
using (public.has_permission('analytics.read'));

drop policy if exists "utm_sources_insert_anyone" on public.utm_sources;
create policy "utm_sources_insert_anyone"
on public.utm_sources for insert
to anon, authenticated
with check (true);

drop policy if exists "conversion_events_insert_anyone" on public.conversion_events;
create policy "conversion_events_insert_anyone"
on public.conversion_events for insert
to anon, authenticated
with check (true);

drop policy if exists "conversion_events_select_admin" on public.conversion_events;
create policy "conversion_events_select_admin"
on public.conversion_events for select
to authenticated
using (public.has_permission('analytics.read'));

drop policy if exists "sendpulse_events_select_ops" on public.sendpulse_events;
create policy "sendpulse_events_select_ops"
on public.sendpulse_events for select
to authenticated
using (
  public.has_permission('sendpulse.read')
  or public.has_permission('webhooks.read')
);

drop policy if exists "release_comments_select_own_or_manager" on public.release_comments;
create policy "release_comments_select_own_or_manager"
on public.release_comments for select
to authenticated
using (
  public.has_permission('releases.manage')
  or exists (
    select 1
    from public.releases r
    where r.id = release_id
      and r.user_id = auth.uid()
      and visibility = 'artist'
  )
);

drop policy if exists "release_comments_insert_manager" on public.release_comments;
create policy "release_comments_insert_manager"
on public.release_comments for insert
to authenticated
with check (public.has_permission('releases.manage'));

drop policy if exists "billing_tables_select_finance" on public.stripe_customers;
create policy "billing_tables_select_finance"
on public.stripe_customers for select
to authenticated
using (user_id = auth.uid() or public.has_permission('payments.read'));

drop policy if exists "stripe_customers_manage_billing" on public.stripe_customers;
create policy "stripe_customers_manage_billing"
on public.stripe_customers for all
to authenticated
using (public.has_permission('billing.manage'))
with check (public.has_permission('billing.manage'));

drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active"
on public.products for select
to anon, authenticated
using (is_active = true or public.has_permission('payments.read'));

drop policy if exists "products_manage_billing" on public.products;
create policy "products_manage_billing"
on public.products for all
to authenticated
using (public.has_permission('billing.manage'))
with check (public.has_permission('billing.manage'));

drop policy if exists "prices_public_read_active" on public.prices;
create policy "prices_public_read_active"
on public.prices for select
to anon, authenticated
using (is_active = true or public.has_permission('payments.read'));

drop policy if exists "prices_manage_billing" on public.prices;
create policy "prices_manage_billing"
on public.prices for all
to authenticated
using (public.has_permission('billing.manage'))
with check (public.has_permission('billing.manage'));

drop policy if exists "subscriptions_select_own_or_finance" on public.subscriptions;
create policy "subscriptions_select_own_or_finance"
on public.subscriptions for select
to authenticated
using (user_id = auth.uid() or public.has_permission('payments.read'));

drop policy if exists "subscriptions_manage_billing" on public.subscriptions;
create policy "subscriptions_manage_billing"
on public.subscriptions for all
to authenticated
using (public.has_permission('billing.manage'))
with check (public.has_permission('billing.manage'));

drop policy if exists "payments_select_own_or_finance" on public.payments;
create policy "payments_select_own_or_finance"
on public.payments for select
to authenticated
using (user_id = auth.uid() or public.has_permission('payments.read'));

drop policy if exists "payments_manage_billing" on public.payments;
create policy "payments_manage_billing"
on public.payments for all
to authenticated
using (public.has_permission('billing.manage'))
with check (public.has_permission('billing.manage'));

drop policy if exists "invoices_select_own_or_finance" on public.invoices;
create policy "invoices_select_own_or_finance"
on public.invoices for select
to authenticated
using (user_id = auth.uid() or public.has_permission('payments.read'));

drop policy if exists "invoices_manage_billing" on public.invoices;
create policy "invoices_manage_billing"
on public.invoices for all
to authenticated
using (public.has_permission('billing.manage'))
with check (public.has_permission('billing.manage'));

create index if not exists login_events_user_created_idx
  on public.login_events (user_id, created_at desc)
  where user_id is not null;

create index if not exists login_events_outcome_created_idx
  on public.login_events (outcome, created_at desc);

create index if not exists service_packages_service_order_idx
  on public.service_packages (service_id, sort_order);

create index if not exists service_faqs_service_order_idx
  on public.service_faqs (service_id, sort_order);

create index if not exists service_ctas_service_placement_idx
  on public.service_ctas (service_id, placement, sort_order);

create index if not exists service_media_service_order_idx
  on public.service_media (service_id, sort_order);

create index if not exists conversion_events_created_idx
  on public.conversion_events (created_at desc);

create index if not exists conversion_events_service_idx
  on public.conversion_events (service_slug, created_at desc)
  where service_slug is not null;

create index if not exists sendpulse_events_created_idx
  on public.sendpulse_events (created_at desc);

create index if not exists release_comments_release_created_idx
  on public.release_comments (release_id, created_at desc);

create index if not exists subscriptions_user_created_idx
  on public.subscriptions (user_id, created_at desc)
  where user_id is not null;

create index if not exists payments_user_created_idx
  on public.payments (user_id, created_at desc)
  where user_id is not null;

create index if not exists invoices_user_created_idx
  on public.invoices (user_id, created_at desc)
  where user_id is not null;

create or replace view public.contacts
with (security_invoker = true)
as
select
  id,
  provider_contact_id,
  channel,
  name,
  phone,
  email,
  username,
  source,
  lead_status,
  metadata,
  first_seen_at,
  last_seen_at,
  created_at,
  updated_at
from public.sendpulse_contacts;

create or replace view public.conversations
with (security_invoker = true)
as
select
  id,
  provider_conversation_id,
  contact_id,
  channel,
  status,
  last_message_at,
  metadata,
  created_at,
  updated_at
from public.sendpulse_conversations;

create or replace view public.messages
with (security_invoker = true)
as
select
  id,
  conversation_id,
  contact_id,
  provider_message_id,
  provider_event_id,
  direction,
  message_type,
  body,
  raw_payload,
  occurred_at,
  created_at
from public.sendpulse_messages;

create or replace view public.tickets
with (security_invoker = true)
as
select
  id,
  conversation_id,
  contact_id,
  status,
  priority,
  subject,
  latest_message_at,
  assigned_to,
  created_by_source,
  metadata,
  resolved_at,
  closed_at,
  created_at,
  updated_at
from public.support_tickets;

create or replace view public.artist_verifications
with (security_invoker = true)
as
select
  id,
  user_id,
  artist_profile_id,
  provider,
  provider_verification_id,
  provider_event_id,
  status,
  verification_url,
  submitted_at,
  verified_at,
  rejected_at,
  expires_at,
  metadata,
  created_at,
  updated_at
from public.identity_verifications;

insert into public.products (key, name, description, product_type, is_active)
values
  ('artist_annual_access', 'Cuenta anual artista', 'Acceso anual al Artist Dashboard.', 'subscription', true),
  ('ep_release_fee', 'Pago EP', 'Pago unico adicional para lanzamiento EP.', 'one_time', true),
  ('album_release_fee', 'Pago album', 'Pago unico adicional para lanzamiento de album.', 'one_time', true)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  product_type = excluded.product_type,
  is_active = excluded.is_active;

insert into public.permissions (key, name, description)
values
  ('billing.manage', 'Gestionar billing', 'Permite administrar productos, precios y ledger financiero.'),
  ('service_catalog.manage', 'Gestionar catalogo completo', 'Permite administrar paquetes, FAQs, CTAs y media de servicios.')
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'super_admin'
  and p.key in ('billing.manage', 'service_catalog.manage')
on conflict do nothing;

grant select on public.contacts to authenticated;
grant select on public.conversations to authenticated;
grant select on public.messages to authenticated;
grant select on public.tickets to authenticated;
grant select on public.artist_verifications to authenticated;

comment on table public.service_packages is
  'Official document alignment: packages or levels for public services.';

comment on table public.service_faqs is
  'Official document alignment: FAQs attached to public services.';

comment on table public.service_ctas is
  'Official document alignment: CTA labels and WhatsApp messages per service.';

comment on table public.service_media is
  'Official document alignment: images and visual assets for services.';

comment on table public.conversion_events is
  'Official document alignment: conversion events from WhatsApp, checkout or other funnel actions.';

comment on table public.release_comments is
  'Official document alignment: internal and artist-visible release notes.';

notify pgrst, 'reload schema';
