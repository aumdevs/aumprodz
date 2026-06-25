create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  user_type text not null default 'artist' check (user_type in ('artist', 'admin')),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id text,
  outcome text not null default 'success' check (outcome in ('success', 'failure')),
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe', 'sendpulse', 'identity', 'dropbox_sign')),
  provider_event_id text,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received', 'processed', 'failed')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.service_categories(id),
  slug text not null unique,
  title text not null,
  summary text not null,
  price_from text not null,
  duration text,
  whatsapp_message text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visitor_sessions (
  id uuid primary key default gen_random_uuid(),
  anonymous_id text,
  country text,
  source text,
  device text,
  browser text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.visitor_sessions(id) on delete set null,
  path text not null,
  referrer text,
  country text,
  device text,
  browser text,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

create table if not exists public.cta_clicks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.visitor_sessions(id) on delete set null,
  service_slug text,
  service_category text,
  source text,
  placement text,
  page_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  user_agent text,
  referer text,
  ip_address text,
  whatsapp_message text,
  redirect_url text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.visitor_sessions(id) on delete set null,
  event_name text not null,
  page_path text,
  service_slug text,
  service_category text,
  source text,
  placement text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  user_agent text,
  referer text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  legal_name text,
  artist_name text,
  country text,
  phone text,
  bio text,
  status text not null default 'pending_payment' check (
    status in (
      'pending_payment',
      'active_pending_verification',
      'identity_pending',
      'identity_verified',
      'contract_pending',
      'verified_artist',
      'suspended',
      'expired'
    )
  ),
  identity_status text not null default 'not_started',
  contract_status text not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'pending_payment',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists touch_services_updated_at on public.services;
create trigger touch_services_updated_at
before update on public.services
for each row execute function public.touch_updated_at();

drop trigger if exists touch_artist_profiles_updated_at on public.artist_profiles;
create trigger touch_artist_profiles_updated_at
before update on public.artist_profiles
for each row execute function public.touch_updated_at();

drop trigger if exists touch_artist_subscriptions_updated_at on public.artist_subscriptions;
create trigger touch_artist_subscriptions_updated_at
before update on public.artist_subscriptions
for each row execute function public.touch_updated_at();

create or replace function public.has_role(role_key text, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = target_user_id
      and r.key = role_key
  );
$$;

create or replace function public.has_permission(permission_key text, target_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = target_user_id
      and p.key = permission_key
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  artist_role_id uuid;
begin
  insert into public.profiles (id, email, full_name, user_type)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    coalesce(nullif(new.raw_user_meta_data ->> 'user_type', ''), 'artist')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name);

  select id into artist_role_id from public.roles where key = 'artist';

  if artist_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, artist_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.webhook_logs enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.visitor_sessions enable row level security;
alter table public.page_views enable row level security;
alter table public.cta_clicks enable row level security;
alter table public.visitor_events enable row level security;
alter table public.artist_profiles enable row level security;
alter table public.artist_subscriptions enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.has_permission('profiles.read'));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "roles_select_authenticated" on public.roles;
create policy "roles_select_authenticated"
on public.roles for select
to authenticated
using (true);

drop policy if exists "permissions_select_authenticated" on public.permissions;
create policy "permissions_select_authenticated"
on public.permissions for select
to authenticated
using (true);

drop policy if exists "user_roles_select_own_or_admin" on public.user_roles;
create policy "user_roles_select_own_or_admin"
on public.user_roles for select
to authenticated
using (user_id = auth.uid() or public.has_permission('admins.create'));

drop policy if exists "role_permissions_select_authenticated" on public.role_permissions;
create policy "role_permissions_select_authenticated"
on public.role_permissions for select
to authenticated
using (true);

drop policy if exists "audit_logs_select_admin" on public.audit_logs;
create policy "audit_logs_select_admin"
on public.audit_logs for select
to authenticated
using (public.has_permission('audit_logs.read'));

drop policy if exists "webhook_logs_select_admin" on public.webhook_logs;
create policy "webhook_logs_select_admin"
on public.webhook_logs for select
to authenticated
using (public.has_permission('webhooks.read'));

drop policy if exists "service_categories_public_read" on public.service_categories;
create policy "service_categories_public_read"
on public.service_categories for select
to anon, authenticated
using (true);

drop policy if exists "services_public_read_active" on public.services;
create policy "services_public_read_active"
on public.services for select
to anon, authenticated
using (is_active = true or public.has_permission('content.manage'));

drop policy if exists "services_admin_manage" on public.services;
create policy "services_admin_manage"
on public.services for all
to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));

drop policy if exists "visitor_sessions_insert_anyone" on public.visitor_sessions;
create policy "visitor_sessions_insert_anyone"
on public.visitor_sessions for insert
to anon, authenticated
with check (true);

drop policy if exists "visitor_sessions_select_admin" on public.visitor_sessions;
create policy "visitor_sessions_select_admin"
on public.visitor_sessions for select
to authenticated
using (public.has_permission('analytics.read'));

drop policy if exists "page_views_insert_anyone" on public.page_views;
create policy "page_views_insert_anyone"
on public.page_views for insert
to anon, authenticated
with check (true);

drop policy if exists "page_views_select_admin" on public.page_views;
create policy "page_views_select_admin"
on public.page_views for select
to authenticated
using (public.has_permission('analytics.read'));

drop policy if exists "cta_clicks_insert_anyone" on public.cta_clicks;
create policy "cta_clicks_insert_anyone"
on public.cta_clicks for insert
to anon, authenticated
with check (true);

drop policy if exists "cta_clicks_select_admin" on public.cta_clicks;
create policy "cta_clicks_select_admin"
on public.cta_clicks for select
to authenticated
using (public.has_permission('analytics.read'));

drop policy if exists "visitor_events_insert_anyone" on public.visitor_events;
create policy "visitor_events_insert_anyone"
on public.visitor_events for insert
to anon, authenticated
with check (true);

drop policy if exists "visitor_events_select_admin" on public.visitor_events;
create policy "visitor_events_select_admin"
on public.visitor_events for select
to authenticated
using (public.has_permission('analytics.read'));

drop policy if exists "artist_profiles_select_own_or_admin" on public.artist_profiles;
create policy "artist_profiles_select_own_or_admin"
on public.artist_profiles for select
to authenticated
using (user_id = auth.uid() or public.has_permission('artists.read'));

drop policy if exists "artist_profiles_update_own" on public.artist_profiles;
create policy "artist_profiles_update_own"
on public.artist_profiles for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "artist_subscriptions_select_own_or_finance" on public.artist_subscriptions;
create policy "artist_subscriptions_select_own_or_finance"
on public.artist_subscriptions for select
to authenticated
using (user_id = auth.uid() or public.has_permission('payments.read'));

insert into public.roles (key, name, description)
values
  ('super_admin', 'Super Admin', 'Acceso total a pagos, contratos, archivos, staff y configuracion.'),
  ('support', 'Soporte', 'Tickets, conversaciones y leads sin datos financieros sensibles.'),
  ('artist_manager', 'Artist Manager', 'Gestion de artistas y lanzamientos sin descargas por defecto.'),
  ('content_editor', 'Editor de contenido', 'Servicios, FAQs, paginas y textos publicos.'),
  ('finance', 'Finanzas', 'Pagos, suscripciones e invoices sin archivos privados.'),
  ('analyst', 'Analista', 'Metricas y reportes.'),
  ('artist', 'Artista', 'Cuenta privada de artista pago.')
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.permissions (key, name, description)
values
  ('profiles.read', 'Ver perfiles', 'Permite ver perfiles generales.'),
  ('admins.create', 'Crear admins', 'Permite crear staff y asignar roles.'),
  ('roles.manage', 'Gestionar roles', 'Permite administrar roles y permisos.'),
  ('analytics.read', 'Ver analytics', 'Permite ver visitas, clics y conversiones.'),
  ('content.manage', 'Gestionar contenido', 'Permite editar servicios y copy publico.'),
  ('artists.read', 'Ver artistas', 'Permite ver artistas y metadata operacional.'),
  ('releases.manage', 'Gestionar lanzamientos', 'Permite revisar y cambiar estados de lanzamientos.'),
  ('payments.read', 'Ver pagos', 'Permite ver pagos y suscripciones.'),
  ('contracts.read', 'Ver contratos', 'Permite ver contratos firmados o referencias.'),
  ('identity.read_status', 'Ver estado de identidad', 'Permite ver estado de verificacion.'),
  ('artist_files.download', 'Descargar archivos de artista', 'Permiso sensible para descargar masters o musica.'),
  ('artist_files.listen', 'Escuchar previews', 'Permiso sensible para escuchar archivos de artista.'),
  ('artist_files.modify', 'Modificar archivos de artista', 'Permiso sensible para reemplazar archivos.'),
  ('webhooks.read', 'Ver webhooks', 'Permite revisar eventos externos.'),
  ('audit_logs.read', 'Ver audit logs', 'Permite revisar acciones sensibles.'),
  ('settings.manage', 'Gestionar configuracion', 'Permite cambiar integraciones y ajustes.')
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'super_admin'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('analytics.read', 'artists.read', 'releases.manage', 'identity.read_status')
where r.key = 'artist_manager'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('analytics.read', 'content.manage')
where r.key = 'content_editor'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('payments.read', 'analytics.read')
where r.key = 'finance'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('analytics.read')
where r.key = 'analyst'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('analytics.read')
where r.key = 'support'
on conflict do nothing;

insert into public.service_categories (key, name, description, sort_order)
values
  ('youtube', 'YouTube & AdSense', 'Canales, monetizacion, AdSense y orientacion.', 10),
  ('web', 'Paginas web', 'Landing, web profesional, ecommerce y paginas de servicio.', 20),
  ('visual', 'Imagen & Video', 'Miniaturas, flyers, branding, edicion y contenido visual.', 30),
  ('artist', 'ARTISTA', 'Distribucion, letras, videos y dashboard privado de artistas.', 40)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.services (
  category_id,
  slug,
  title,
  summary,
  price_from,
  duration,
  whatsapp_message,
  sort_order
)
select c.id, s.slug, s.title, s.summary, s.price_from, s.duration, s.whatsapp_message, s.sort_order
from (
  values
    ('youtube', 'youtube-adsense', 'YouTube & AdSense', 'Canales, personalizacion, monetizacion, problemas con AdSense, revision y orientacion.', '$50', '1 a 3 sesiones', 'Hola AUM, vengo desde tu pagina de YouTube y AdSense. Necesito orientacion sobre mi canal.', 10),
    ('web', 'paginas-web', 'Paginas web', 'Landing, web profesional, ecommerce, paginas de servicio y paginas para artistas.', '$250', '7 a 21 dias', 'Hola AUM, vengo desde tu pagina web. Quiero orientacion para crear una pagina web, landing o ecommerce.', 20),
    ('visual', 'imagen-video', 'Imagen & Video', 'Miniaturas, flyers, branding, edicion de videos, reels y shorts.', '$25 / $50', '24 a 72 horas', 'Hola AUM, vi tu servicio de imagen y video. Quiero orientacion sobre miniaturas, edicion o contenido visual.', 30),
    ('artist', 'artistas', 'ARTISTA', 'Distribucion, letras, videos, Spotify, Apple Music, TikTok, Instagram y YouTube Music.', '$99.99 anual + extras', 'Acceso anual', 'Hola AUM, estoy interesado en el servicio para artistas y distribucion musical.', 40)
) as s(category_key, slug, title, summary, price_from, duration, whatsapp_message, sort_order)
join public.service_categories c on c.key = s.category_key
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  summary = excluded.summary,
  price_from = excluded.price_from,
  duration = excluded.duration,
  whatsapp_message = excluded.whatsapp_message,
  sort_order = excluded.sort_order,
  updated_at = now();
