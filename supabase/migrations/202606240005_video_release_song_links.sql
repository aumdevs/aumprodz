alter table public.releases
  add column if not exists related_track_id uuid references public.release_tracks(id) on delete set null,
  add column if not exists related_track_note text;

create index if not exists releases_related_track_idx
  on public.releases (related_track_id)
  where related_track_id is not null;

comment on column public.releases.related_track_id is
  'Optional source song track linked to a video release.';

comment on column public.releases.related_track_note is
  'Optional note used when a video is not linked to a song in the artist account.';

notify pgrst, 'reload schema';
