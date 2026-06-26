# AUM PRODZ Platform

Plataforma profesional de AUM PRODZ para vender servicios digitales, orientar clientes por WhatsApp, gestionar artistas pagos y operar datos internos con Supabase.

## Etapas activas

- Fase 1: fundación Next.js, Supabase helpers, layouts privados iniciales y estructura de roles.
- Fase 2: web pública pro, servicios, detalle tipo curso, landing ARTISTA y tracking de CTAs a WhatsApp.
- Fase 3: admin pro inicial con dashboard real, servicios CMS, leads, analytics, roles, audit logs y webhook logs.
- Fase 4: checkout anual ARTISTA y webhook Stripe conectado a Supabase.
- Fase 5.1: Artist Dashboard operativo con perfil, billing y borradores/envío de lanzamientos.
- Fase 6: Storage privado con R2, Supabase Storage, URLs firmadas y audit logs.
- Fase 7: SendPulse, contactos, conversaciones, tickets, bot failures y lead scoring reales.
- Fase 8: Legal con Didit para identidad y signNow para contratos PDF.
- Fase 9: Kanban, reportes, exportaciones CSV, alertas y conversión interna.

## Desarrollo local

```bash
pnpm install
pnpm dev
```

La app corre por defecto en `http://localhost:3000`.

## Deploy oficial

- Dominio: `https://aumprodz.com`
- Repo GitHub: `aumdevs/aumprodz`
- Hosting: Netlify conectado a la rama `main`
- Package manager: PNPM con Corepack (`pnpm@11.7.0`)
- Build command: `corepack enable && pnpm build`
- Publish directory: `.next`

## Variables principales

Usa `.env.example` como base. Para que el CTA real de WhatsApp funcione, se requieren:

```bash
AUM_WHATSAPP_NUMBER=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

El redirect de WhatsApp falla con `503` si no puede registrar el clic antes de redirigir.

Para activar Stripe Fase 4 también se requieren:

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ARTIST_ANNUAL=
STRIPE_PRICE_EP_RELEASE=
STRIPE_PRICE_ALBUM_RELEASE=
```

Para activar Fase 8 Legal local:

```bash
DIDIT_API_KEY=
DIDIT_WORKFLOW_ID=
DIDIT_WEBHOOK_SECRET=
DIDIT_API_BASE_URL=https://verification.didit.me
SIGNNOW_API_KEY=
SIGNNOW_BASIC_TOKEN=
SIGNNOW_WEBHOOK_SECRET=
SIGNNOW_API_BASE_URL=https://api.signnow.com
```

## Tracking público

Las migraciones activas viven en:

```bash
supabase/migrations/202606230001_initial_platform_foundation.sql
supabase/migrations/202606230002_stage2_public_tracking.sql
supabase/migrations/202606230003_stage3_admin_indexes.sql
supabase/migrations/202606230004_stage31_catalog_cleanup.sql
supabase/migrations/202606230005_stage4_stripe_billing_indexes.sql
supabase/migrations/202606230006_stage4_artist_payments.sql
supabase/migrations/202606230007_stage51_artist_releases.sql
supabase/migrations/202606240001_phase6_storage.sql
supabase/migrations/202606240003_phase7_sendpulse_operations.sql
supabase/migrations/202606240004_phase8_legal_operations.sql
supabase/migrations/202606240005_video_release_song_links.sql
supabase/migrations/202606250001_youtube_videos_cms.sql
supabase/migrations/202606250002_replace_artist_service_with_digital_accounts.sql
supabase/migrations/202606250003_phase8_9_legal_operations.sql
supabase/migrations/202606250004_official_document_schema_alignment.sql
supabase/migrations/202606250005_artist_security_login_events.sql
supabase/migrations/202606250006_user_permission_overrides.sql
supabase/migrations/202606250007_admin_notification_reads.sql
supabase/migrations/202606250008_i18n_service_cms_artist_reports.sql
```

Las tablas `cta_clicks` y `visitor_events` tienen RLS activo y no exponen lectura pública.

## Admin Fase 3

El admin inicial ya tiene rutas reales para dashboard, servicios, leads,
analytics, SendPulse, tickets, artistas, pagos, contratos, webhooks, roles,
configuración y audit logs. Las acciones sensibles de CMS y roles pasan por
server actions, permisos y `audit_logs`.

## Catálogo público

La web pública lee servicios activos desde Supabase y fusiona esos campos con
el contenido editorial local. El CMS controla título, resumen, precio visible,
duración, mensaje WhatsApp y estado activo. FAQs, módulos, requisitos e iconos
siguen en código hasta una fase CMS más completa.

## Stripe Fase 4

`/api/checkout/artist-annual` crea una sesión Stripe Checkout en modo
suscripción para cuentas de artista autenticadas. El webhook firmado en
`/api/webhooks/stripe` sincroniza `artist_subscriptions` y activa el perfil como
`active_pending_verification` cuando Stripe confirma una suscripción activa o en
trial. `/api/checkout/ep-release` y `/api/checkout/album-release` crean pagos
únicos en modo `payment` y el webhook los guarda en `artist_payments`. Portal de
billing, invoices y formulario completo de lanzamientos quedan fuera de este
tramo.

## Artist Dashboard Fase 5.1

El artista ya tiene rutas reales para perfil, verificación, contrato, billing,
lanzamientos, archivos y soporte. Los lanzamientos pueden guardarse como
borrador con metadata, plataformas, tracks y link externo. El envío a revisión
queda bloqueado hasta tener pago anual activo, identidad verificada, contrato
firmado y pago único EP/álbum cuando aplique.

## Storage Fase 6

Los lanzamientos pueden recibir archivos privados. Audio y video van a
Cloudflare R2; portada, letras y documentos pequeños van a Supabase Storage en
el bucket privado `artist-small-files`. La app genera URLs firmadas para subir,
escuchar/revisar y descargar, y registra audit logs para cada acción sensible.
El link externo se mantiene como fallback temporal.

## Legal Fase 8

Didit crea sesiones reales de verificación desde `/artist/verification` y
actualiza `identity_verifications` mediante `/api/webhooks/identity`. signNow
recibe contratos PDF subidos por admin en `/admin/contracts`, genera link de
firma y actualiza `artist_contracts` mediante `/api/webhooks/sign`.

## Operaciones Fase 9

El admin incluye `/admin/kanban`, `/admin/reports` y `/admin/alerts`. Estas
rutas leen datos reales de Supabase, permiten exportar CSV y muestran alertas
operativas sin insertar datos demo.
