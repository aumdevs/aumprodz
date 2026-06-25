create table if not exists public.youtube_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  thumbnail_url text not null,
  video_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_youtube_videos_updated_at on public.youtube_videos;
create trigger touch_youtube_videos_updated_at
before update on public.youtube_videos
for each row execute function public.touch_updated_at();

alter table public.youtube_videos enable row level security;

drop policy if exists "youtube_videos_public_read_active" on public.youtube_videos;
create policy "youtube_videos_public_read_active"
on public.youtube_videos for select
to anon, authenticated
using (is_active = true or public.has_permission('content.manage'));

drop policy if exists "youtube_videos_admin_manage" on public.youtube_videos;
create policy "youtube_videos_admin_manage"
on public.youtube_videos for all
to authenticated
using (public.has_permission('content.manage'))
with check (public.has_permission('content.manage'));

create index if not exists youtube_videos_public_order_idx
  on public.youtube_videos (is_active, sort_order, published_at desc, created_at desc);

comment on table public.youtube_videos is
  'Public YouTube video CMS controlled from admin. No demo data is seeded.';

notify pgrst, 'reload schema';
