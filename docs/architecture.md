# AUM PRODZ Platform Architecture

## Stack

- Next.js App Router with TypeScript.
- Tailwind CSS and shadcn-style local UI primitives.
- Supabase Auth, Postgres and RLS for users, roles and artist data.
- Stripe, SendPulse, Didit, signNow and Cloudflare R2 prepared server-side.

## Areas

- Public website: `/`, `/servicios`, `/servicios/[slug]`, `/artista`, `/contacto`.
- Admin: `/admin`, protected by Supabase session and admin roles.
- Artist Dashboard: `/artist`, protected by Supabase session and artist role/profile.
- APIs: `/api/cta/whatsapp`, `/api/webhooks/*`, `/api/uploads/create-presigned-url`, `/api/legal/*`.
- Admin: `/admin/services`, `/admin/leads`, `/admin/analytics`, `/admin/sendpulse`, `/admin/tickets`, `/admin/kanban`, `/admin/reports`, `/admin/alerts`, `/admin/artists`, `/admin/payments`, `/admin/contracts`, `/admin/webhooks`, `/admin/roles`, `/admin/settings`, `/admin/audit`.

## Runtime boundaries

- Public routes can render without secrets.
- Protected routes redirect to `/login` when Supabase is not configured or the session is missing.
- Service role usage is limited to server helpers for audit/webhook/analytics writes.
- R2 presigned URLs are generated only from backend routes.
- Admin mutations run through server actions with explicit permission checks and audit logging.
