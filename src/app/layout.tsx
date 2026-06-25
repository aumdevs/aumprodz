import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getCurrentLocale } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://aumprodz.com"),
  title: {
    default: "AUM PRODZ Platform",
    template: "%s | AUM PRODZ",
  },
  description:
    "Plataforma profesional de AUM PRODZ para servicios digitales, artistas, pagos, operaciones y analítica interna.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "AUM PRODZ Platform",
    description:
      "Plataforma profesional de AUM PRODZ para servicios digitales, artistas, pagos, operaciones y analítica interna.",
    images: [
      {
        url: "/aum-prodz-logo.png",
        width: 1254,
        height: 1254,
        alt: "AUM PRODZ",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
