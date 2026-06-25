alter table public.artist_profiles
  add column if not exists genre text;

create table if not exists public.releases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  artist_profile_id uuid references public.artist_profiles(id) on delete set null,
  release_type text not null check (release_type in ('single', 'ep', 'album', 'video')),
  title text not null,
  primary_artist text not null,
  featured_artists text,
  genre text,
  language text,
  explicit_content boolean not null default false,
  desired_release_date date,
  external_files_url text,
  notes text,
  status text not null default 'draft' check (
    status in (
      'draft',
      'submitted',
      'under_review',
      'needs_changes',
      'approved',
      'ready_for_tunecore',
      'uploaded_to_tunecore',
      'scheduled',
      'published',
      'rejected',
      'cancelled'
    )
  ),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.release_tracks (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  track_number integer not null default 1,
  title text not null,
  primary_artist text,
  featured_artists text,
  composer text,
  producer text,
  explicit_content boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.release_platforms (
  release_id uuid not null references public.releases(id) on delete cascade,
  platform text not null,
  created_at timestamptz not null default now(),
  primary key (release_id, platform)
);

create table if not exists public.release_files (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  file_type text not null default 'external_link' check (
    file_type in ('audio', 'artwork', 'video', 'lyrics', 'document', 'external_link')
  ),
  storage_provider text not null default 'external' check (
    storage_provider in ('external', 'r2', 'supabase')
  ),
  file_url text,
  storage_key text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.release_status_history (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  changed_by uuid references public.profiles(id),
  from_status text,
  to_status text not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.artist_payments
  add column if not exists release_id uuid references public.releases(id) on delete set null;

drop trigger if exists touch_releases_updated_at on public.releases;
create trigger touch_releases_updated_at
before update on public.releases
for each row execute function public.touch_updated_at();

alter table public.releases enable row level security;
alter table public.release_tracks enable row level security;
alter table public.release_platforms enable row level security;
alter table public.release_files enable row level security;
alter table public.release_status_history enable row level security;

drop policy if exists "releases_select_own_or_manager" on public.releases;
create policy "releases_select_own_or_manager"
on public.releases for select
to authenticated
using (user_id = auth.uid() or public.has_permission('releases.manage'));

drop policy if exists "releases_insert_own" on public.releases;
create policy "releases_insert_own"
on public.releases for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "releases_update_own_draft_or_manager" on public.releases;
create policy "releases_update_own_draft_or_manager"
on public.releases for update
to authenticated
using (
  (user_id = auth.uid() and status in ('draft', 'needs_changes'))
  or public.has_permission('releases.manage')
)
with check (user_id = auth.uid() or public.has_permission('releases.manage'));

drop policy if exists "release_tracks_select_own_or_manager" on public.release_tracks;
create policy "release_tracks_select_own_or_manager"
on public.release_tracks for select
to authenticated
using (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (r.user_id = auth.uid() or public.has_permission('releases.manage'))
  )
);

drop policy if exists "release_tracks_modify_own_draft_or_manager" on public.release_tracks;
create policy "release_tracks_modify_own_draft_or_manager"
on public.release_tracks for all
to authenticated
using (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (
        (r.user_id = auth.uid() and r.status in ('draft', 'needs_changes'))
        or public.has_permission('releases.manage')
      )
  )
)
with check (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (
        (r.user_id = auth.uid() and r.status in ('draft', 'needs_changes'))
        or public.has_permission('releases.manage')
      )
  )
);

drop policy if exists "release_platforms_select_own_or_manager" on public.release_platforms;
create policy "release_platforms_select_own_or_manager"
on public.release_platforms for select
to authenticated
using (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (r.user_id = auth.uid() or public.has_permission('releases.manage'))
  )
);

drop policy if exists "release_platforms_modify_own_draft_or_manager" on public.release_platforms;
create policy "release_platforms_modify_own_draft_or_manager"
on public.release_platforms for all
to authenticated
using (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (
        (r.user_id = auth.uid() and r.status in ('draft', 'needs_changes'))
        or public.has_permission('releases.manage')
      )
  )
)
with check (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (
        (r.user_id = auth.uid() and r.status in ('draft', 'needs_changes'))
        or public.has_permission('releases.manage')
      )
  )
);

drop policy if exists "release_files_select_own_or_manager" on public.release_files;
create policy "release_files_select_own_or_manager"
on public.release_files for select
to authenticated
using (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (r.user_id = auth.uid() or public.has_permission('releases.manage'))
  )
);

drop policy if exists "release_files_modify_own_draft_or_manager" on public.release_files;
create policy "release_files_modify_own_draft_or_manager"
on public.release_files for all
to authenticated
using (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (
        (r.user_id = auth.uid() and r.status in ('draft', 'needs_changes'))
        or public.has_permission('releases.manage')
      )
  )
)
with check (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (
        (r.user_id = auth.uid() and r.status in ('draft', 'needs_changes'))
        or public.has_permission('releases.manage')
      )
  )
);

drop policy if exists "release_status_history_select_own_or_manager" on public.release_status_history;
create policy "release_status_history_select_own_or_manager"
on public.release_status_history for select
to authenticated
using (
  exists (
    select 1 from public.releases r
    where r.id = release_id
      and (r.user_id = auth.uid() or public.has_permission('releases.manage'))
  )
);

create index if not exists releases_user_created_idx
  on public.releases (user_id, created_at desc);

create index if not exists releases_status_created_idx
  on public.releases (status, created_at desc);

create index if not exists releases_type_status_idx
  on public.releases (release_type, status);

create index if not exists release_tracks_release_order_idx
  on public.release_tracks (release_id, track_number);

create index if not exists release_status_history_release_created_idx
  on public.release_status_history (release_id, created_at desc);

create index if not exists artist_payments_release_idx
  on public.artist_payments (release_id)
  where release_id is not null;
