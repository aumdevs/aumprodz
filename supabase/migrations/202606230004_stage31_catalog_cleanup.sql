create extension if not exists pgcrypto;

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

update public.cta_clicks
set service_slug = 'artista'
where service_slug = 'artistas';

update public.visitor_events
set service_slug = 'artista'
where service_slug = 'artistas';

update public.cta_clicks
set service_category = case service_category
  when 'youtube' then 'youtube-adsense'
  when 'web' then 'paginas-web'
  when 'visual' then 'imagen-video'
  when 'artist' then 'artista'
  else service_category
end
where service_category in ('youtube', 'web', 'visual', 'artist');

update public.visitor_events
set service_category = case service_category
  when 'youtube' then 'youtube-adsense'
  when 'web' then 'paginas-web'
  when 'visual' then 'imagen-video'
  when 'artist' then 'artista'
  else service_category
end
where service_category in ('youtube', 'web', 'visual', 'artist');

insert into public.services (
  category_id,
  slug,
  title,
  summary,
  price_from,
  duration,
  whatsapp_message,
  is_active,
  sort_order
)
select
  canonical_category.id,
  'artista',
  legacy.title,
  legacy.summary,
  legacy.price_from,
  legacy.duration,
  legacy.whatsapp_message,
  true,
  legacy.sort_order
from public.services legacy
join public.service_categories canonical_category on canonical_category.key = 'artista'
where legacy.slug = 'artistas'
  and not exists (
    select 1
    from public.services canonical_service
    where canonical_service.slug = 'artista'
  );

update public.services service
set
  category_id = category.id,
  is_active = true,
  sort_order = case service.slug
    when 'youtube-adsense' then 10
    when 'paginas-web' then 20
    when 'imagen-video' then 30
    when 'artista' then 40
    else service.sort_order
  end,
  updated_at = now()
from public.service_categories category
where service.slug = category.key
  and service.slug in ('youtube-adsense', 'paginas-web', 'imagen-video', 'artista');

delete from public.services
where slug = 'artistas';

delete from public.service_categories category
where category.key in ('youtube', 'web', 'visual', 'artist')
  and not exists (
    select 1
    from public.services service
    where service.category_id = category.id
  );

comment on table public.services is
  'Canonical public services controlled by Admin CMS. Legacy artist slug is normalized to artista.';

