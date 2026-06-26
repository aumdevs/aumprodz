import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { getRequestPathname } from "@/lib/i18n/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = await getRequestPathname();
  const hideFooter = pathname === "/servicios" || pathname.startsWith("/servicios/");

  return (
    <div className="public-site flex min-h-screen flex-col">
      <PublicHeader />
      <main className="min-h-0 flex-1">{children}</main>
      {hideFooter ? null : <PublicFooter />}
    </div>
  );
}
