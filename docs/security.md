# Security Notes

## Auth and roles

- Supabase Auth owns sessions.
- `src/proxy.ts` refreshes sessions and blocks unauthenticated `/admin` and `/artist` traffic.
- Server components call `requireAdmin()` or `requireArtist()` before rendering protected content.
- RLS policies enforce artist-owned access at the database layer.

## Secrets

- Secrets belong in `.env.local`, Netlify environment variables or Supabase settings.
- `.env.example` is safe to commit; `.env.local` and other `.env*` files remain ignored.
- `SUPABASE_SERVICE_ROLE_KEY`, Stripe secret keys, R2 keys and webhook secrets are never read in client components.

## Sensitive actions

- `audit_logs` is the required table for downloads, listens, file changes, permission changes and critical state changes.
- `webhook_logs` stores external events idempotently by provider and provider event id.
- Artist original files must stay private; backend-generated signed URLs expire quickly.

## Bootstrap

After creating the first real Supabase user for Aum, assign `super_admin` manually with SQL or Supabase Studio:

```sql
insert into public.user_roles (user_id, role_id)
select p.id, r.id
from public.profiles p
cross join public.roles r
where p.email = 'AUM_EMAIL_HERE'
  and r.key = 'super_admin'
on conflict do nothing;
```
