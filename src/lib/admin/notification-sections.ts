export const adminNotificationSections = [
  "/admin/leads",
  "/admin/sendpulse",
  "/admin/tickets",
  "/admin/reports",
  "/admin/alerts",
  "/admin/artists",
  "/admin/verifications",
  "/admin/releases",
  "/admin/files",
  "/admin/payments",
  "/admin/contracts",
  "/admin/artist-reports",
  "/admin/webhooks",
  "/admin/audit",
] as const;

export type AdminNotificationSectionPath =
  (typeof adminNotificationSections)[number];

export function getAdminNotificationSectionPath(pathname: string) {
  return adminNotificationSections.find(
    (section) => pathname === section || pathname.startsWith(`${section}/`),
  );
}
