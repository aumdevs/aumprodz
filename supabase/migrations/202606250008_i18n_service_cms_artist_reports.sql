create table if not exists public.content_translations (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  locale text not null check (locale in ('ht', 'es', 'en', 'fr', 'pt')),
  field_name text not null,
  value text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id, locale, field_name)
);

create table if not exists public.artist_report_periods (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  period_start date not null,
  period_end date not null,
  source text not null default 'manual',
  uploaded_by uuid references public.profiles(id) on delete set null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table if not exists public.artist_report_entries (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references public.artist_report_periods(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  artist_profile_id uuid references public.artist_profiles(id) on delete set null,
  release_id uuid references public.releases(id) on delete set null,
  track_id uuid references public.release_tracks(id) on delete set null,
  song_title text,
  platform text not null,
  country text,
  streams bigint not null default 0 check (streams >= 0),
  views bigint not null default 0 check (views >= 0),
  revenue_amount numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_content_translations_updated_at
on public.content_translations;
create trigger touch_content_translations_updated_at
before update on public.content_translations
for each row execute function public.touch_updated_at();

drop trigger if exists touch_artist_report_periods_updated_at
on public.artist_report_periods;
create trigger touch_artist_report_periods_updated_at
before update on public.artist_report_periods
for each row execute function public.touch_updated_at();

drop trigger if exists touch_artist_report_entries_updated_at
on public.artist_report_entries;
create trigger touch_artist_report_entries_updated_at
before update on public.artist_report_entries
for each row execute function public.touch_updated_at();

alter table public.content_translations enable row level security;
alter table public.artist_report_periods enable row level security;
alter table public.artist_report_entries enable row level security;

drop policy if exists "content_translations_public_read" on public.content_translations;
create policy "content_translations_public_read"
on public.content_translations for select
using (
  entity_type in ('services', 'service_packages', 'service_faqs', 'service_ctas', 'service_media')
  or public.has_permission('content.manage')
  or public.has_permission('service_catalog.manage')
);

drop policy if exists "content_translations_admin_manage" on public.content_translations;
create policy "content_translations_admin_manage"
on public.content_translations for all
using (
  public.has_permission('content.manage')
  or public.has_permission('service_catalog.manage')
)
with check (
  public.has_permission('content.manage')
  or public.has_permission('service_catalog.manage')
);

drop policy if exists "artist_report_periods_select_admin" on public.artist_report_periods;
create policy "artist_report_periods_select_admin"
on public.artist_report_periods for select
using (
  public.has_permission('artist_reports.manage')
  or public.has_permission('analytics.read')
  or public.has_permission('payments.read')
);

drop policy if exists "artist_report_periods_manage_admin" on public.artist_report_periods;
create policy "artist_report_periods_manage_admin"
on public.artist_report_periods for all
using (public.has_permission('artist_reports.manage'))
with check (public.has_permission('artist_reports.manage'));

drop policy if exists "artist_report_entries_select_own_or_admin" on public.artist_report_entries;
create policy "artist_report_entries_select_own_or_admin"
on public.artist_report_entries for select
using (
  user_id = auth.uid()
  or public.has_permission('artist_reports.manage')
  or public.has_permission('analytics.read')
  or public.has_permission('payments.read')
);

drop policy if exists "artist_report_entries_manage_admin" on public.artist_report_entries;
create policy "artist_report_entries_manage_admin"
on public.artist_report_entries for all
using (public.has_permission('artist_reports.manage'))
with check (public.has_permission('artist_reports.manage'));

create index if not exists content_translations_lookup_idx
  on public.content_translations (entity_type, entity_id, locale, field_name);

create index if not exists artist_report_periods_date_idx
  on public.artist_report_periods (period_start desc, period_end desc);

create index if not exists artist_report_entries_user_period_idx
  on public.artist_report_entries (user_id, period_id);

create index if not exists artist_report_entries_release_idx
  on public.artist_report_entries (release_id)
  where release_id is not null;

insert into public.permissions (key, name, description)
values
  ('artist_reports.manage', 'Gestionar reportes artísticos', 'Permite cargar, revisar y exportar reportes reales de artistas.')
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'super_admin'
  and p.key = 'artist_reports.manage'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'finance'
  and p.key in ('reports.export')
on conflict do nothing;

grant select on public.content_translations to anon, authenticated;
grant select, insert, update, delete on public.content_translations to authenticated;
grant select on public.artist_report_periods to authenticated;
grant select on public.artist_report_entries to authenticated;

comment on table public.content_translations is
  'Translations for CMS-controlled public content in ht, es, en, fr and pt.';

comment on table public.artist_report_periods is
  'Manual artist report batches uploaded by admins.';

comment on table public.artist_report_entries is
  'Real artist metrics by artist, release, platform and period.';

notify pgrst, 'reload schema';
