update public.services
set price_from = '$99/anual + extras'
where slug = 'artista'
  and price_from is distinct from '$99/anual + extras';
