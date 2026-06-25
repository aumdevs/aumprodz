# AUM PRODZ Platform - Documento Oficial v2

Fecha: 2026-06-25  
Estado: alineado con el proyecto local actual  
Marca principal: AUM PRODZ

## 1. Objetivo del producto

AUM PRODZ Platform es una plataforma web para operar servicios digitales, artistas, pagos, contratos, verificaciones, reportes y contenido publico de AUM PRODZ.

El producto se divide en tres superficies:

- Web publica: presenta servicios, videos, contacto y acceso a artistas.
- Dashboard de artista: permite al artista gestionar perfil, verificacion, contrato, lanzamientos, pagos, seguridad, soporte y reportes.
- Admin / Super Admin: permite operar servicios, contenido, leads, WhatsApp, tickets, lanzamientos, pagos, contratos, verificaciones, archivos, reportes, permisos, webhooks y auditoria.

## 2. Idiomas oficiales

Idiomas soportados en toda la plataforma:

- `ht`: criollo haitiano, idioma por defecto para web publica y dashboard de artista.
- `es`: espanol, idioma fijo para admin y super admin.
- `en`: ingles.
- `fr`: frances.
- `pt`: portugues.

Regla oficial:

- La web publica y el dashboard de artista cargan en criollo haitiano por defecto.
- El usuario puede cambiar el idioma desde el selector visible.
- Admin y Super Admin siempre cargan en espanol, sin depender de navegador, IP o pais.
- El contenido CMS publico debe usar traducciones por entidad y campo. Si falta una traduccion, la plataforma cae a `ht`.

## 3. Arquitectura tecnica

Stack actual:

- Frontend y backend web: Next.js App Router.
- Base de datos y autenticacion: Supabase.
- Pagos y suscripciones: Stripe.
- Archivos privados de artistas: Cloudflare R2 o storage compatible.
- WhatsApp y automatizaciones: SendPulse.
- Identidad: Didit.
- Firma electronica: signNow.
- CMS de videos: tabla `youtube_videos`.
- CMS de servicios: tablas de servicios, paquetes, FAQs, CTAs, media y traducciones.
- Auditoria: `audit_logs`.

Flujo de despliegue oficial:

1. Desarrollo local en `/Users/bxndjy/Documents/Aum Prodz platform`.
2. Reemplazo del repo GitHub `aumdevs/aumprodz`.
3. Deploy automatico por Netlify conectado a `main`.
4. Dominio principal: `https://aumprodz.com`.

## 4. CMS de servicios

El CMS de servicios administra:

- Servicio principal: titulo, resumen, precio visible, duracion, mensaje de WhatsApp, orden y estado activo.
- Paquetes: nombre, descripcion, precio, duracion, caracteristicas, orden y visibilidad.
- FAQs: pregunta, respuesta, orden y visibilidad.
- CTAs: texto del boton, ubicacion, mensaje de WhatsApp, orden y visibilidad.
- Media: imagen, video, documento o enlace externo, con titulo y texto alternativo.
- Traducciones: por entidad, campo e idioma.

Tabla central de traducciones:

- `content_translations`
- Campos principales: `entity_type`, `entity_id`, `locale`, `field_name`, `value`.
- Idiomas permitidos: `ht`, `es`, `en`, `fr`, `pt`.

La web publica lee servicios desde Supabase cuando esta disponible. Si Supabase falla, conserva un fallback tecnico local para no dejar la pagina rota.

## 5. Permisos granulares

El admin se gobierna con roles y permisos. Super Admin ve todo. Otros roles solo ven las secciones permitidas.

Matriz oficial:

| Area | Permiso |
| --- | --- |
| Dashboard | Admin autenticado |
| Servicios y YouTube | `content.manage` |
| CMS completo de servicios | `service_catalog.manage` |
| Leads | `leads.manage` |
| Analytics | `analytics.read` |
| WhatsApp | `sendpulse.read` |
| Tickets | `tickets.manage` |
| Kanban | `operations.kanban` |
| Reportes | `analytics.read` |
| Exportar reportes | `reports.export` |
| Alertas | `alerts.read` |
| Artistas | `artists.read` |
| Lanzamientos | `releases.manage` |
| Archivos privados - escuchar/ver | `artist_files.listen` |
| Archivos privados - descargar | `artist_files.download` |
| Archivos privados - modificar | `artist_files.modify` |
| Pagos | `payments.read` |
| Productos y precios | `billing.manage` |
| Contratos - leer | `contracts.read` |
| Contratos - subir | `contracts.upload` |
| Contratos - enviar | `contracts.send` |
| Contratos - gestionar | `contracts.manage` |
| Identidad - leer estado | `identity.read_status` |
| Identidad - gestionar | `identity.manage` |
| Webhooks | `webhooks.read` |
| Equipo y permisos | `admins.create`, `roles.manage` |
| Ajustes | `settings.manage` |
| Historial | `audit_logs.read` |
| Reportes artisticos | `artist_reports.manage` |

Cada accion sensible debe registrar auditoria en `audit_logs`.

## 6. Admin oficial

Menu oficial del admin:

- Inicio del panel.
- Servicios publicados.
- Videos publicados.
- Personas interesadas.
- Estadisticas.
- Mensajes de WhatsApp.
- Calidad del asistente.
- Casos de soporte.
- Trabajo por estado.
- Reportes.
- Pendientes importantes.
- Cuentas de artistas.
- Verificaciones de identidad.
- Musica enviada.
- Archivos de artistas.
- Pagos y suscripciones.
- Contratos de artistas.
- Reportes artisticos.
- Conexiones automaticas.
- Equipo y permisos.
- Ajustes del sistema.
- Historial de cambios.

Reglas:

- El menu oculta secciones sin permiso.
- Las rutas tambien bloquean acceso desde servidor.
- Las pantallas vacias muestran estado vacio real.
- No se usan datos falsos para simular actividad.
- Las notificaciones del menu aparecen solo en secciones que reciben trabajo nuevo o requieren atencion.

## 7. Reportes artisticos

Los reportes artisticos inician por carga manual desde admin.

Datos minimos por reporte:

- Artista.
- Lanzamiento opcional.
- Cancion opcional.
- Plataforma.
- Periodo desde / hasta.
- Pais opcional.
- Reproducciones.
- Vistas.
- Ingresos.
- Moneda.
- Notas.
- Fecha de carga.

Tablas oficiales:

- `artist_report_periods`: agrupa cargas o periodos.
- `artist_report_entries`: contiene metricas reales por artista, lanzamiento y plataforma.

Reglas:

- Admin con `artist_reports.manage` puede cargar reportes.
- Admin puede exportar CSV si tiene `reports.export`.
- El artista solo ve sus propios reportes.
- Si no hay reportes, se muestra “sin reportes todavia”.

## 8. Identidad y contratos

Identidad:

- Proveedor oficial: Didit.
- Admin puede revisar estados con `identity.read_status`.
- Gestion de identidad requiere `identity.manage`.

Contratos:

- Proveedor oficial de firma: signNow.
- Admin sube contrato PDF con `contracts.upload`.
- Admin envia contrato a firmar con `contracts.send`.
- Admin ve contratos con `contracts.read`.
- El artista ve contratos por firmar y contratos firmados.
- El artista no borra contratos firmados; solo puede leer o descargar.

## 9. YouTube CMS

El CMS de YouTube administra:

- Titulo del video.
- Link de YouTube.
- Miniatura por URL o archivo.
- Orden.
- Estado activo.

La web publica muestra miniatura, titulo y boton “Ver video”. La imagen no debe abrir el video por si sola; el enlace oficial es el boton.

## 10. Seguridad de cuenta

Dashboard de artista:

- La seccion Seguridad permite cambiar contrasena pidiendo contrasena actual.
- Google Authenticator / 2FA queda como opcion preparada para configuracion.
- Se muestran datos de sesion activa cuando esten disponibles: dispositivo, IP o ultimo acceso.

## 11. Estado actual implementado localmente

Implementado en el proyecto local:

- Idiomas oficiales definidos en la capa i18n.
- Admin fijo en espanol por ruta.
- Web publica y artista con selector de idioma.
- CMS de servicios ampliado con paquetes, FAQs, CTAs, media y traducciones.
- Permisos granulares aplicados al menu admin y a rutas sensibles.
- Paginas nuevas: calidad del asistente, verificaciones de identidad, archivos de artistas y reportes artisticos.
- Reportes artisticos manuales con exportacion CSV.
- Dashboard de artista conectado a reportes reales.
- Documento oficial v2 y migracion de alineacion.

Pendiente operativo:

- Aplicar la migracion nueva en Supabase conectado por `.env.local`.
- Verificar roles reales de usuarios en la base.
- Probar flujos completos con datos reales: CMS, reportes, permisos, Didit, signNow, Stripe y SendPulse.

## 12. Migracion relacionada

Archivo de migracion:

`supabase/migrations/202606250008_i18n_service_cms_artist_reports.sql`

Incluye:

- `content_translations`.
- `artist_report_periods`.
- `artist_report_entries`.
- Permiso `artist_reports.manage`.
- Politicas RLS para lectura publica de traducciones CMS y lectura privada de reportes artisticos.
- Recarga de schema PostgREST con `notify pgrst, 'reload schema';`.

## 13. Criterio de aceptacion

La plataforma queda alineada cuando:

- `pnpm typecheck`, `pnpm lint` y `pnpm build` pasan.
- Admin abre en espanol.
- Publico y artista abren en criollo haitiano por defecto.
- El selector permite `ht`, `es`, `en`, `fr`, `pt`.
- Super Admin ve todo.
- Roles limitados solo ven y ejecutan lo permitido.
- El CMS publica servicios reales y sus traducciones.
- Reportes artisticos se cargan, se exportan y aparecen solo al artista correcto.
- No hay datos falsos en pantallas vacias.
