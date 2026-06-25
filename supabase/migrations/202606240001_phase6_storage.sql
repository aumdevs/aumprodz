alter table public.release_files
  add column if not exists uploaded_by uuid references public.profiles(id),
  add column if not exists original_filename text,
  add column if not exists content_type text,
  add column if not exists size_bytes bigint,
  add column if not exists status text not null default 'uploaded' check (
    status in ('pending_upload', 'uploaded', 'replaced', 'deleted', 'failed')
  ),
  add column if not exists uploaded_at timestamptz,
  add column if not exists replaced_at timestamptz,
  add column if not exists replaced_by uuid references public.profiles(id);

update public.release_files
set
  status = coalesce(status, 'uploaded'),
  uploaded_at = coalesce(uploaded_at, created_at)
where status is null
   or uploaded_at is null;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'artist-small-files',
  'artist-small-files',
  false,
  26214400,
  array[
    'image/jpeg',
    'image/png',
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create index if not exists release_files_release_created_idx
  on public.release_files (release_id, created_at desc);

create index if not exists release_files_storage_key_idx
  on public.release_files (storage_key)
  where storage_key is not null;

create index if not exists release_files_type_status_idx
  on public.release_files (file_type, status);

create index if not exists release_files_uploaded_by_idx
  on public.release_files (uploaded_by)
  where uploaded_by is not null;

comment on table public.release_files is
  'Private release file registry for R2 and Supabase Storage. Access is mediated by signed URLs and audit logs.';
