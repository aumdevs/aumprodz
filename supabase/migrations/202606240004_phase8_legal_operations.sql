create table if not exists public.identity_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  artist_profile_id uuid references public.artist_profiles(id) on delete set null,
  provider text not null default 'manual',
  provider_verification_id text unique,
  provider_event_id text unique,
  status text not null default 'requested' check (
    status in (
      'not_started',
      'requested',
      'pending',
      'in_review',
      'verified',
      'rejected',
      'expired',
      'cancelled'
    )
  ),
  verification_url text,
  submitted_at timestamptz,
  verified_at timestamptz,
  rejected_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artist_contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  artist_profile_id uuid references public.artist_profiles(id) on delete set null,
  provider text not null default 'manual',
  provider_signature_request_id text unique,
  provider_event_id text unique,
  title text not null default 'AUM PRODZ Artist Agreement',
  status text not null default 'requested' check (
    status in (
      'not_started',
      'requested',
      'draft',
      'sent',
      'viewed',
      'signed',
      'completed',
      'declined',
      'expired',
      'cancelled'
    )
  ),
  signing_url text,
  signed_document_url text,
  document_reference text,
  sent_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  completed_at timestamptz,
  declined_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_status_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  artist_profile_id uuid references public.artist_profiles(id) on delete set null,
  entity_type text not null check (
    entity_type in ('artist_profile', 'identity_verification', 'artist_contract')
  ),
  entity_id uuid,
  changed_by uuid references public.profiles(id) on delete set null,
  from_status text,
  to_status text not null,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

drop trigger if exists touch_identity_verifications_updated_at on public.identity_verifications;
create trigger touch_identity_verifications_updated_at
before update on public.identity_verifications
for each row execute function public.touch_updated_at();

drop trigger if exists touch_artist_contracts_updated_at on public.artist_contracts;
create trigger touch_artist_contracts_updated_at
before update on public.artist_contracts
for each row execute function public.touch_updated_at();

alter table public.identity_verifications enable row level security;
alter table public.artist_contracts enable row level security;
alter table public.legal_status_history enable row level security;

drop policy if exists "identity_verifications_select_own_or_admin" on public.identity_verifications;
create policy "identity_verifications_select_own_or_admin"
on public.identity_verifications for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_permission('identity.read_status')
  or public.has_permission('identity.manage')
);

drop policy if exists "identity_verifications_insert_own" on public.identity_verifications;
create policy "identity_verifications_insert_own"
on public.identity_verifications for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "identity_verifications_update_admin" on public.identity_verifications;
create policy "identity_verifications_update_admin"
on public.identity_verifications for update
to authenticated
using (public.has_permission('identity.manage'))
with check (public.has_permission('identity.manage'));

drop policy if exists "artist_contracts_select_own_or_admin" on public.artist_contracts;
create policy "artist_contracts_select_own_or_admin"
on public.artist_contracts for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_permission('contracts.read')
  or public.has_permission('contracts.manage')
);

drop policy if exists "artist_contracts_insert_own" on public.artist_contracts;
create policy "artist_contracts_insert_own"
on public.artist_contracts for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "artist_contracts_update_admin" on public.artist_contracts;
create policy "artist_contracts_update_admin"
on public.artist_contracts for update
to authenticated
using (public.has_permission('contracts.manage'))
with check (public.has_permission('contracts.manage'));

drop policy if exists "legal_status_history_select_own_or_admin" on public.legal_status_history;
create policy "legal_status_history_select_own_or_admin"
on public.legal_status_history for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_permission('contracts.read')
  or public.has_permission('contracts.manage')
  or public.has_permission('identity.read_status')
  or public.has_permission('identity.manage')
);

create index if not exists identity_verifications_user_created_idx
  on public.identity_verifications (user_id, created_at desc);

create index if not exists identity_verifications_status_idx
  on public.identity_verifications (status, updated_at desc);

create index if not exists artist_contracts_user_created_idx
  on public.artist_contracts (user_id, created_at desc);

create index if not exists artist_contracts_status_idx
  on public.artist_contracts (status, updated_at desc);

create index if not exists legal_status_history_user_created_idx
  on public.legal_status_history (user_id, created_at desc);

create index if not exists legal_status_history_profile_created_idx
  on public.legal_status_history (artist_profile_id, created_at desc)
  where artist_profile_id is not null;

insert into public.permissions (key, name, description)
values
  ('identity.manage', 'Gestionar identidad', 'Permite aprobar, rechazar y sincronizar verificaciones de identidad.'),
  ('contracts.manage', 'Gestionar contratos', 'Permite enviar, aprobar y sincronizar contratos de artistas.')
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'super_admin'
  and p.key in ('identity.manage', 'contracts.manage')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'identity.read_status',
  'identity.manage',
  'contracts.read',
  'contracts.manage',
  'artists.read',
  'releases.manage'
)
where r.key = 'artist_manager'
on conflict do nothing;

comment on table public.identity_verifications is
  'Identity verification requests and provider webhook results for artists.';

comment on table public.artist_contracts is
  'Artist contract/signature requests and provider webhook results.';

comment on table public.legal_status_history is
  'Identity and contract status changes from artists, admins and external webhooks.';

notify pgrst, 'reload schema';
