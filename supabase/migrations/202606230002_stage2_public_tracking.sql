create extension if not exists pgcrypto;

alter table public.cta_clicks
  add column if not exists page_path text,
  add column if not exists placement text,
  add column if not exists whatsapp_message text,
  add column if not exists redirect_url text,
  add column if not exists country text,
  add column if not exists user_agent text,
  add column if not exists referer text;

alter table public.visitor_events
  add column if not exists page_path text,
  add column if not exists service_slug text,
  add column if not exists service_category text,
  add column if not exists source text,
  add column if not exists placement text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists country text,
  add column if not exists user_agent text,
  add column if not exists referer text,
  add column if not exists metadata jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'visitor_events_event_name_stage2_check'
      and conrelid = 'public.visitor_events'::regclass
  ) then
    alter table public.visitor_events
      add constraint visitor_events_event_name_stage2_check
      check (
        event_name in (
          'page_view',
          'service_detail_view',
          'artist_pricing_view',
          'artist_checkout_click'
        )
      );
  end if;
end $$;

create index if not exists cta_clicks_created_at_idx
  on public.cta_clicks (created_at desc);

create index if not exists cta_clicks_service_slug_idx
  on public.cta_clicks (service_slug);

create index if not exists cta_clicks_source_idx
  on public.cta_clicks (source);

create index if not exists visitor_events_created_at_idx
  on public.visitor_events (created_at desc);

create index if not exists visitor_events_event_name_idx
  on public.visitor_events (event_name);

create index if not exists visitor_events_service_slug_idx
  on public.visitor_events (service_slug);

alter table public.cta_clicks enable row level security;
alter table public.visitor_events enable row level security;

drop policy if exists cta_clicks_insert_anyone on public.cta_clicks;
drop policy if exists visitor_events_insert_anyone on public.visitor_events;

revoke all on table public.cta_clicks from anon;
revoke all on table public.visitor_events from anon;
revoke insert, update, delete on table public.cta_clicks from authenticated;
revoke insert, update, delete on table public.visitor_events from authenticated;
grant select on table public.cta_clicks to authenticated;
grant select on table public.visitor_events to authenticated;

insert into public.service_categories (key, name, description, sort_order)
values
  ('youtube-adsense', 'YouTube & AdSense', 'Canales, monetización, AdSense y orientación.', 10),
  ('paginas-web', 'Páginas web', 'Landing, web profesional, ecommerce y páginas de servicio.', 20),
  ('imagen-video', 'Imagen & video', 'Miniaturas, flyers, branding, edición y contenido visual.', 30),
  ('artista', 'ARTISTA', 'Cuenta anual, contrato, identidad y operación de lanzamientos.', 40)
on conflict (key) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order;

insert into public.services (
  category_id,
  slug,
  title,
  summary,
  price_from,
  duration,
  whatsapp_message,
  sort_order
)
select c.id, s.slug, s.title, s.summary, s.price_from, s.duration, s.whatsapp_message, s.sort_order
from (
  values
    ('youtube-adsense', 'youtube-adsense', 'YouTube & AdSense', 'Orientación para canales, monetización, personalización y problemas con AdSense.', '$50', '1 a 3 sesiones o diagnóstico puntual', 'Hola AUM, vengo desde tu página de YouTube y AdSense. Necesito orientación sobre mi canal.', 10),
    ('paginas-web', 'paginas-web', 'Páginas web', 'Landing, web profesional, ecommerce y páginas de servicio para vender con claridad.', '$250', '7 a 21 días según alcance', 'Hola AUM, vengo desde tu página web. Quiero orientación para crear una página web, landing o ecommerce.', 20),
    ('imagen-video', 'imagen-video', 'Imagen & Video', 'Miniaturas, flyers, branding, edición de videos, reels y contenido visual.', '$25 / $50', '24 a 72 horas para piezas simples', 'Hola AUM, vi tu servicio de imagen y video. Quiero orientación sobre miniaturas, edición o contenido visual.', 30),
    ('artista', 'artista', 'ARTISTA', 'Cuenta anual para artistas con dashboard, verificación, contrato y operación de lanzamientos.', '$99.99/anual + extras', 'Acceso anual', 'Hola AUM, estoy interesado en el servicio para artistas y distribución musical.', 40)
) as s(category_key, slug, title, summary, price_from, duration, whatsapp_message, sort_order)
join public.service_categories c on c.key = s.category_key
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  summary = excluded.summary,
  price_from = excluded.price_from,
  duration = excluded.duration,
  whatsapp_message = excluded.whatsapp_message,
  sort_order = excluded.sort_order,
  updated_at = now();

comment on table public.cta_clicks is
  'Public WhatsApp CTA tracking. Written only from server-side route handlers.';

comment on table public.visitor_events is
  'Public anonymous funnel events. Written only from server-side route handlers.';
