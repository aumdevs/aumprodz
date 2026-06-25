create table if not exists public.user_permission_overrides (
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  is_allowed boolean not null,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, permission_id)
);

drop trigger if exists touch_user_permission_overrides_updated_at
on public.user_permission_overrides;
create trigger touch_user_permission_overrides_updated_at
before update on public.user_permission_overrides
for each row execute function public.touch_updated_at();

alter table public.user_permission_overrides enable row level security;

drop policy if exists "user_permission_overrides_select_admin"
on public.user_permission_overrides;
create policy "user_permission_overrides_select_admin"
on public.user_permission_overrides for select
to authenticated
using (
  public.has_permission('roles.manage')
  or public.has_permission('admins.create')
);

drop policy if exists "user_permission_overrides_manage_admin"
on public.user_permission_overrides;
create policy "user_permission_overrides_manage_admin"
on public.user_permission_overrides for all
to authenticated
using (public.has_permission('roles.manage'))
with check (public.has_permission('roles.manage'));

create index if not exists user_permission_overrides_user_idx
  on public.user_permission_overrides (user_id);

create or replace function public.has_permission(
  permission_key text,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with direct_override as (
    select upo.is_allowed
    from public.user_permission_overrides upo
    join public.permissions p on p.id = upo.permission_id
    where upo.user_id = target_user_id
      and p.key = permission_key
    limit 1
  ),
  role_grant as (
    select exists (
      select 1
      from public.user_roles ur
      join public.role_permissions rp on rp.role_id = ur.role_id
      join public.permissions p on p.id = rp.permission_id
      where ur.user_id = target_user_id
        and p.key = permission_key
    ) as allowed
  )
  select coalesce(
    (select is_allowed from direct_override),
    (select allowed from role_grant),
    false
  );
$$;

notify pgrst, 'reload schema';
