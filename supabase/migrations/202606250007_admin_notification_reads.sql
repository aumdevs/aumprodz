create table if not exists public.admin_notification_reads (
  user_id uuid not null references public.profiles(id) on delete cascade,
  section_path text not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, section_path)
);

drop trigger if exists touch_admin_notification_reads_updated_at
on public.admin_notification_reads;
create trigger touch_admin_notification_reads_updated_at
before update on public.admin_notification_reads
for each row execute function public.touch_updated_at();

alter table public.admin_notification_reads enable row level security;

drop policy if exists "admin_notification_reads_select_own"
on public.admin_notification_reads;
create policy "admin_notification_reads_select_own"
on public.admin_notification_reads for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "admin_notification_reads_insert_own"
on public.admin_notification_reads;
create policy "admin_notification_reads_insert_own"
on public.admin_notification_reads for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "admin_notification_reads_update_own"
on public.admin_notification_reads;
create policy "admin_notification_reads_update_own"
on public.admin_notification_reads for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists admin_notification_reads_user_seen_idx
  on public.admin_notification_reads (user_id, section_path, last_seen_at desc);

notify pgrst, 'reload schema';
