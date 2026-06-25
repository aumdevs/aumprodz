# Fase 5.1 - Flujo Real Local

Este documento cierra la parte técnica que te tocaba para continuar con pruebas reales.

## Parámetros usados
- Email artista: `bxndjys@gmail.com`
- Email super admin: `admin@aumprodz.com`

## Preparación ejecutada (ya hecha)
- Usuario artista creado en Supabase Auth.
- Perfil `public.profiles` en estado activo.
- `public.artist_profiles` creado para el artista con:
  - `identity_status = 'verified'`
  - `contract_status = 'signed'`
  - `status = 'verified_artist'`
- Rol `artist` asignado al artista.
- Rol `super_admin` asignado al admin.
- Webhook logs, subscriptions y payments del artista en cero (estado inicial limpio).

## SQL útil (para repetir en Supabase SQL Editor si prefieres)

### Obtener `user_id` del artista
```sql
select id as user_id
from auth.users
where email = 'bxndjys@gmail.com';
```

### Asegurar que `artist_profiles` tenga estados operativos
```sql
update public.artist_profiles
set
  status = 'verified_artist',
  identity_status = 'verified',
  contract_status = 'signed'
where user_id = (select id from auth.users where email = 'bxndjys@gmail.com');
```

### Asegurar rol `artist` para el artista
```sql
insert into public.user_roles (user_id, role_id)
select u.id, r.id
from auth.users u
join public.roles r on r.key = 'artist'
where u.email = 'bxndjys@gmail.com'
on conflict do nothing;
```

### Asegurar rol `super_admin` al admin
```sql
insert into public.user_roles (user_id, role_id)
select u.id, r.id
from auth.users u
join public.roles r on r.key = 'super_admin'
where u.email = 'admin@aumprodz.com'
on conflict do nothing;
```

## Verificaciones recomendadas desde Supabase

```sql
select
  email,
  u.id,
  p.user_type,
  p.status,
  ap.status as artist_status,
  ap.identity_status,
  ap.contract_status
from auth.users u
join public.profiles p on p.id = u.id
left join public.artist_profiles ap on ap.user_id = u.id
where u.email = 'bxndjys@gmail.com';
```

```sql
select count(*) as total, string_agg(distinct r.key, ', ') as roles
from public.user_roles ur
join public.roles r on r.id = ur.role_id
where ur.user_id = (select id from auth.users where email = 'admin@aumprodz.com');
```

```sql
select id, status, stripe_subscription_id, current_period_start, current_period_end
from public.artist_subscriptions
where user_id = (select id from auth.users where email = 'bxndjys@gmail.com')
order by created_at desc;
```

```sql
select id, product_key, status, release_id, amount_total, currency
from public.artist_payments
where user_id = (select id from auth.users where email = 'bxndjys@gmail.com')
order by created_at desc;
```

```sql
select id, provider_event_id, event_type, status, created_at
from public.webhook_logs
where provider = 'stripe'
order by created_at desc
limit 20;
```

## Checklist de ejecución local
1. Correr Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
2. Iniciar app: `npm run dev`
3. Login artista con `bxndjys@gmail.com` y password `TempArtist123!`
4. Pagar anual en `/artist/billing`.
5. Confirmar `webhook_logs` -> evento procesado + `artist_subscriptions` creado.
6. Crear draft + submit de single en `/artist/releases/new`.
7. Pagar EP o álbum desde `/artist/billing`.
8. Crear/editar release EP o álbum y enviar; validar que `artist_payments.release_id` se asocie.
9. Login admin y validar `/admin/releases` y cambio de estados.
