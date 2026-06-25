insert into public.service_categories (key, name, description, sort_order)
values (
  'cuentas-digitales',
  'Tecnología & cuentas',
  'Creación, administración y recuperación de cuentas digitales.',
  40
)
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
  is_active,
  sort_order
)
select
  category.id,
  'cuentas-digitales',
  'Tecnología & cuentas',
  'Creación, administración y recuperación de cuentas bloqueadas o perdidas.',
  '$50',
  'Diagnóstico inicial y acompañamiento según el caso',
  'Hola AUM, necesito ayuda con creación, administración o recuperación de una cuenta digital.',
  true,
  40
from public.service_categories category
where category.key = 'cuentas-digitales'
on conflict (slug) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  summary = excluded.summary,
  price_from = excluded.price_from,
  duration = excluded.duration,
  whatsapp_message = excluded.whatsapp_message,
  is_active = true,
  sort_order = excluded.sort_order,
  updated_at = now();

update public.services
set
  is_active = false,
  updated_at = now()
where slug in ('artista', 'artistas');

update public.services service
set
  sort_order = case service.slug
    when 'youtube-adsense' then 10
    when 'paginas-web' then 20
    when 'imagen-video' then 30
    when 'cuentas-digitales' then 40
    else service.sort_order
  end,
  updated_at = now()
where service.slug in (
  'youtube-adsense',
  'paginas-web',
  'imagen-video',
  'cuentas-digitales'
);

comment on table public.services is
  'Canonical public services controlled by Admin CMS. Artist access lives outside the services catalog at /artista.';

notify pgrst, 'reload schema';
