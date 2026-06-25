# Product Requirements

## Phase 1 acceptance

- Public site presents AUM PRODZ as a platform, not a simple landing page.
- Service pages include price from, duration, deliverables and tracked WhatsApp CTA.
- ARTISTA page explains annual access, EP/album extras and publication blockers.
- Login exists for artists and admins only.
- `/admin` and `/artist` are protected.
- Supabase migration includes profiles, roles, permissions, analytics, CTA clicks, artist profile/subscription, audit logs and webhook logs.
- RLS is enabled on every exposed table.
- External integrations are prepared safely without committing secrets.

## Out of scope for Phase 1

- Real Stripe products and live checkout activation.
- Complete release submission workflow.
- Identity verification provider selection.
- Final artist contract and legal policy wording.
- TuneCore automation.

## Phase 3 acceptance

- Admin dashboard reads real Supabase metrics for public events, CTA clicks, services, artists and webhooks.
- Services CMS can update public catalog copy, prices, duration, WhatsApp message and active state.
- Leads page lists tracked WhatsApp CTA clicks and intent by service.
- Analytics page lists public events and event/service breakdowns.
- Admins & Roles page lists roles, permissions and current assignments, and Super Admin can assign roles to existing users.
- Audit logs and webhook logs are visible in admin.
- Menú admin routes render real pages instead of 404 placeholders.
- Public catalog reads CMS fields from Supabase with local fallback.
- Legacy duplicated service seeds are normalized to canonical slugs.

## Out of scope for Phase 3

- Stripe Checkout and billing activation.
- Complete artist release workflow.
- SendPulse conversations, tickets and bot quality tables.
- Identity verification and embedded contract signing.

## Phase 4 acceptance

- ARTISTA public CTA routes authenticated artists into Stripe Checkout for the annual account.
- Checkout Sessions use `subscription` mode and store the Supabase `user_id` in Stripe metadata.
- Stripe webhook verifies the raw body signature before processing.
- `checkout.session.completed` and subscription lifecycle events sync `artist_subscriptions`.
- Active/trialing subscription status moves the artist profile to `active_pending_verification`.
- `/artist` displays payment, identity and contract state from Supabase.
- EP and album one-time Checkout Sessions use payment mode and sync into `artist_payments`.

## Out of scope for Phase 4 initial pass

- Billing portal and invoice history.
- Complete launch submission form.
- Identity provider and contract signing automation.

## Phase 5.1 acceptance

- Artist Dashboard has real routes for profile, billing, verification, contract and releases.
- Artists can update legal/artistic profile data.
- Artists can save release drafts before identity or contract is complete.
- Release submission is blocked unless annual payment is active, identity is verified and contract is signed/completed.
- EP and album submissions require an unused paid Stripe payment linked to the release.
- Admin can list releases and change status with audit log and status history.

## Out of scope for Phase 5.1

- Real R2/Supabase Storage upload workflow.
- Embedded identity verification provider.
- Embedded Dropbox Sign contract signing.
- TuneCore automation.
- Billing portal and invoice history.

## Phase 6 acceptance

- Artists can upload private release files from editable releases.
- Audio and video uploads use Cloudflare R2 signed URLs.
- Artwork, lyrics and small documents use private Supabase Storage signed URLs.
- Uploaded files are registered in `release_files` with metadata and status.
- Artist and admin file access uses short-lived signed URLs only.
- File upload, replace, listen and download actions create audit logs.
- Admin release review shows associated files and signed access actions.
- Release submission accepts uploaded files or the existing external link fallback.

## Out of scope for Phase 6

- SendPulse advanced workflows.
- Embedded identity verification and Dropbox Sign.
- TuneCore automation.
- Public or permanent file URLs.

## Phase 8 acceptance

- Didit is the identity provider for artist KYC.
- Artists can create a Didit verification session from `/artist/verification`.
- Didit webhooks update `identity_verifications`, `artist_profiles`, `legal_status_history`, `audit_logs` and `webhook_logs`.
- Admin can upload PDF contracts for artists from `/admin/contracts`.
- Admin can send uploaded contracts to signNow and store the signing URL.
- signNow webhooks update `artist_contracts`, artist contract status, legal history and audit logs.
- Release submission remains blocked until identity is verified and contract is signed or completed.

## Phase 9 acceptance

- Admin has a real operations Kanban for releases, tickets and contracts.
- Kanban state changes create audit logs and reuse existing workflow history where applicable.
- Reports show real metrics by date for leads, payments, artists, releases, tickets, contracts and verifications.
- Admin can export reports as CSV.
- Internal alerts surface real operational risks: paid release without release, release without files, pending legal, urgent tickets and failed/pending webhooks.
- Conversion dashboard shows visits to release submission funnel without demo data.
