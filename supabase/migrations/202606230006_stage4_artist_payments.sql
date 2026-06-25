create table if not exists public.artist_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_key text not null check (product_key in ('ep_release', 'album_release')),
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  amount_total integer,
  currency text,
  status text not null default 'pending' check (
    status in ('pending', 'paid', 'failed', 'refunded', 'canceled')
  ),
  payment_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists touch_artist_payments_updated_at on public.artist_payments;
create trigger touch_artist_payments_updated_at
before update on public.artist_payments
for each row execute function public.touch_updated_at();

alter table public.artist_payments enable row level security;

drop policy if exists "artist_payments_select_own_or_finance"
on public.artist_payments;
create policy "artist_payments_select_own_or_finance"
on public.artist_payments for select
to authenticated
using (user_id = auth.uid() or public.has_permission('payments.read'));

create index if not exists artist_payments_user_created_idx
  on public.artist_payments (user_id, created_at desc);

create index if not exists artist_payments_product_status_idx
  on public.artist_payments (product_key, status);

create index if not exists artist_payments_stripe_customer_idx
  on public.artist_payments (stripe_customer_id)
  where stripe_customer_id is not null;
