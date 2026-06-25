alter table public.webhook_logs
  drop constraint if exists webhook_logs_provider_check;

alter table public.webhook_logs
  add constraint webhook_logs_provider_check check (
    provider in ('stripe', 'sendpulse', 'identity', 'dropbox_sign', 'didit', 'signnow')
  );

alter table public.artist_contracts
  add column if not exists uploaded_by uuid references public.profiles(id) on delete set null,
  add column if not exists original_filename text,
  add column if not exists content_type text,
  add column if not exists size_bytes bigint,
  add column if not exists provider_document_id text,
  add column if not exists provider_invite_id text,
  add column if not exists signer_email text,
  add column if not exists signer_name text;

create index if not exists artist_contracts_provider_document_idx
  on public.artist_contracts (provider_document_id)
  where provider_document_id is not null;

create index if not exists artist_contracts_provider_invite_idx
  on public.artist_contracts (provider_invite_id)
  where provider_invite_id is not null;

create index if not exists artist_contracts_uploaded_by_idx
  on public.artist_contracts (uploaded_by)
  where uploaded_by is not null;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'legal-contracts',
  'legal-contracts',
  false,
  26214400,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into public.permissions (key, name, description)
values
  ('contracts.send', 'Enviar contratos', 'Permite enviar contratos a firma con signNow.'),
  ('contracts.upload', 'Subir contratos', 'Permite subir PDFs legales para firma.'),
  ('operations.kanban', 'Ver kanban operativo', 'Permite operar releases, tickets y contratos desde kanban.'),
  ('reports.export', 'Exportar reportes', 'Permite descargar reportes operativos en CSV.'),
  ('alerts.read', 'Ver alertas', 'Permite revisar alertas internas operativas.')
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'super_admin'
  and p.key in (
    'contracts.send',
    'contracts.upload',
    'operations.kanban',
    'reports.export',
    'alerts.read'
  )
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'contracts.send',
  'contracts.upload',
  'operations.kanban',
  'alerts.read'
)
where r.key = 'artist_manager'
on conflict do nothing;

comment on table public.artist_contracts is
  'Artist contract/signature requests and provider webhook results. Fase 8 uses signNow with manually uploaded PDF contracts.';

notify pgrst, 'reload schema';
