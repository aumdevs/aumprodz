create index if not exists artist_subscriptions_user_created_idx
  on public.artist_subscriptions (user_id, created_at desc);

create index if not exists artist_subscriptions_stripe_customer_idx
  on public.artist_subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists artist_subscriptions_period_end_idx
  on public.artist_subscriptions (current_period_end)
  where current_period_end is not null;
