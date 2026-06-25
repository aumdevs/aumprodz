create index if not exists services_sort_order_idx
  on public.services (sort_order, is_active);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

create index if not exists audit_logs_action_idx
  on public.audit_logs (action);

create index if not exists webhook_logs_created_at_idx
  on public.webhook_logs (created_at desc);

create index if not exists webhook_logs_provider_status_idx
  on public.webhook_logs (provider, status);

create index if not exists artist_profiles_status_idx
  on public.artist_profiles (status);

create index if not exists artist_profiles_identity_contract_idx
  on public.artist_profiles (identity_status, contract_status);

create index if not exists artist_subscriptions_status_idx
  on public.artist_subscriptions (status);

comment on table public.audit_logs is
  'Sensitive admin and artist actions. Visible only to users with audit_logs.read.';

comment on table public.webhook_logs is
  'External webhook payload tracking for Stripe, SendPulse, identity and Dropbox Sign.';

