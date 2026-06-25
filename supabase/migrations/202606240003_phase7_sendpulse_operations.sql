create table if not exists public.sendpulse_contacts (
  id uuid primary key default gen_random_uuid(),
  provider_contact_id text unique,
  channel text not null default 'whatsapp',
  name text,
  phone text,
  email text,
  username text,
  source text,
  lead_status text not null default 'new' check (
    lead_status in ('new', 'contacted', 'qualified', 'won', 'lost')
  ),
  metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sendpulse_conversations (
  id uuid primary key default gen_random_uuid(),
  provider_conversation_id text unique,
  contact_id uuid references public.sendpulse_contacts(id) on delete set null,
  channel text not null default 'whatsapp',
  status text not null default 'open' check (
    status in ('open', 'pending', 'resolved', 'archived')
  ),
  last_message_at timestamptz,
  last_provider_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sendpulse_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.sendpulse_conversations(id) on delete cascade,
  contact_id uuid references public.sendpulse_contacts(id) on delete set null,
  provider_message_id text unique,
  provider_event_id text,
  payload_hash text not null unique,
  direction text not null default 'inbound' check (
    direction in ('inbound', 'outbound', 'system')
  ),
  message_type text not null default 'text',
  body text,
  raw_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid unique references public.sendpulse_conversations(id) on delete cascade,
  contact_id uuid references public.sendpulse_contacts(id) on delete set null,
  status text not null default 'new' check (
    status in ('new', 'open', 'pending', 'resolved', 'closed')
  ),
  priority text not null default 'normal' check (
    priority in ('low', 'normal', 'high', 'urgent')
  ),
  subject text,
  latest_message_at timestamptz,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by_source text not null default 'sendpulse',
  metadata jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bot_failures (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.sendpulse_conversations(id) on delete set null,
  contact_id uuid references public.sendpulse_contacts(id) on delete set null,
  message_id uuid references public.sendpulse_messages(id) on delete set null,
  provider_event_id text,
  payload_hash text not null unique,
  failure_type text not null default 'bot_fallback',
  reason text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_scores (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null unique references public.sendpulse_contacts(id) on delete cascade,
  score integer not null default 0 check (score >= 0),
  status text not null default 'new' check (
    status in ('new', 'contacted', 'qualified', 'won', 'lost')
  ),
  signal_count integer not null default 0 check (signal_count >= 0),
  last_signal text,
  last_activity_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_sendpulse_contacts_updated_at on public.sendpulse_contacts;
create trigger touch_sendpulse_contacts_updated_at
before update on public.sendpulse_contacts
for each row execute function public.touch_updated_at();

drop trigger if exists touch_sendpulse_conversations_updated_at on public.sendpulse_conversations;
create trigger touch_sendpulse_conversations_updated_at
before update on public.sendpulse_conversations
for each row execute function public.touch_updated_at();

drop trigger if exists touch_support_tickets_updated_at on public.support_tickets;
create trigger touch_support_tickets_updated_at
before update on public.support_tickets
for each row execute function public.touch_updated_at();

drop trigger if exists touch_lead_scores_updated_at on public.lead_scores;
create trigger touch_lead_scores_updated_at
before update on public.lead_scores
for each row execute function public.touch_updated_at();

alter table public.sendpulse_contacts enable row level security;
alter table public.sendpulse_conversations enable row level security;
alter table public.sendpulse_messages enable row level security;
alter table public.support_tickets enable row level security;
alter table public.bot_failures enable row level security;
alter table public.lead_scores enable row level security;

drop policy if exists "sendpulse_contacts_select_ops" on public.sendpulse_contacts;
create policy "sendpulse_contacts_select_ops"
on public.sendpulse_contacts for select
to authenticated
using (
  public.has_permission('sendpulse.read')
  or public.has_permission('tickets.manage')
  or public.has_permission('leads.manage')
);

drop policy if exists "sendpulse_conversations_select_ops" on public.sendpulse_conversations;
create policy "sendpulse_conversations_select_ops"
on public.sendpulse_conversations for select
to authenticated
using (
  public.has_permission('sendpulse.read')
  or public.has_permission('tickets.manage')
);

drop policy if exists "sendpulse_messages_select_ops" on public.sendpulse_messages;
create policy "sendpulse_messages_select_ops"
on public.sendpulse_messages for select
to authenticated
using (
  public.has_permission('sendpulse.read')
  or public.has_permission('tickets.manage')
);

drop policy if exists "support_tickets_select_ops" on public.support_tickets;
create policy "support_tickets_select_ops"
on public.support_tickets for select
to authenticated
using (public.has_permission('tickets.manage'));

drop policy if exists "support_tickets_update_ops" on public.support_tickets;
create policy "support_tickets_update_ops"
on public.support_tickets for update
to authenticated
using (public.has_permission('tickets.manage'))
with check (public.has_permission('tickets.manage'));

drop policy if exists "bot_failures_select_ops" on public.bot_failures;
create policy "bot_failures_select_ops"
on public.bot_failures for select
to authenticated
using (
  public.has_permission('sendpulse.read')
  or public.has_permission('tickets.manage')
);

drop policy if exists "lead_scores_select_ops" on public.lead_scores;
create policy "lead_scores_select_ops"
on public.lead_scores for select
to authenticated
using (public.has_permission('leads.manage'));

drop policy if exists "lead_scores_update_ops" on public.lead_scores;
create policy "lead_scores_update_ops"
on public.lead_scores for update
to authenticated
using (public.has_permission('leads.manage'))
with check (public.has_permission('leads.manage'));

create index if not exists sendpulse_contacts_last_seen_idx
  on public.sendpulse_contacts (last_seen_at desc);

create index if not exists sendpulse_contacts_phone_idx
  on public.sendpulse_contacts (phone)
  where phone is not null;

create index if not exists sendpulse_contacts_email_idx
  on public.sendpulse_contacts (lower(email))
  where email is not null;

create index if not exists sendpulse_conversations_contact_idx
  on public.sendpulse_conversations (contact_id, updated_at desc);

create index if not exists sendpulse_conversations_status_idx
  on public.sendpulse_conversations (status, updated_at desc);

create index if not exists sendpulse_messages_conversation_idx
  on public.sendpulse_messages (conversation_id, occurred_at desc);

create index if not exists sendpulse_messages_contact_idx
  on public.sendpulse_messages (contact_id, occurred_at desc);

create index if not exists sendpulse_messages_direction_idx
  on public.sendpulse_messages (direction, occurred_at desc);

create index if not exists support_tickets_status_priority_idx
  on public.support_tickets (status, priority, updated_at desc);

create index if not exists support_tickets_contact_idx
  on public.support_tickets (contact_id, updated_at desc);

create index if not exists bot_failures_created_idx
  on public.bot_failures (created_at desc);

create index if not exists lead_scores_score_idx
  on public.lead_scores (score desc, last_activity_at desc);

insert into public.permissions (key, name, description)
values
  ('sendpulse.read', 'Ver SendPulse', 'Permite ver contactos, conversaciones, mensajes y calidad del bot.'),
  ('tickets.manage', 'Gestionar tickets', 'Permite ver y cambiar estado/prioridad de tickets.'),
  ('leads.manage', 'Gestionar leads', 'Permite ver lead scoring y señales comerciales.')
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.key = 'super_admin'
  and p.key in ('sendpulse.read', 'tickets.manage', 'leads.manage')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'sendpulse.read',
  'tickets.manage',
  'leads.manage',
  'analytics.read'
)
where r.key = 'support'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'sendpulse.read',
  'tickets.manage',
  'leads.manage',
  'analytics.read',
  'artists.read',
  'releases.manage'
)
where r.key = 'artist_manager'
on conflict do nothing;

comment on table public.sendpulse_contacts is
  'Real contacts received from SendPulse webhooks. No seed/demo rows.';

comment on table public.sendpulse_conversations is
  'Real SendPulse conversation registry normalized from webhook payloads.';

comment on table public.sendpulse_messages is
  'Real inbound/outbound/system SendPulse messages with payload hash idempotency.';

comment on table public.support_tickets is
  'Operational support queue opened from real SendPulse conversations.';

comment on table public.bot_failures is
  'Bot fallback, failure or human handoff signals received from real SendPulse events.';

comment on table public.lead_scores is
  'Lead scoring derived from real contact, conversation and message signals.';

notify pgrst, 'reload schema';
