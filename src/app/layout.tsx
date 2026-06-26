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
    default: "AUM PRODZ - Digital Mission Control",
    template: "%s | AUM PRODZ",
  },
  description:
    "Digital Mission Control for Haitian creators, artists, YouTubers and real businesses: services, web, image, YouTube, Artist OS and digital operations.",
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
    title: "AUM PRODZ - Digital Mission Control",
    description:
      "Premium digital platform for Haitian creators, artists, YouTubers and real businesses with international vision.",
    images: [
      {
        url: "/aum-prodz-podcast-hero.png",
        width: 1672,
        height: 941,
        alt: "AUM PRODZ podcast recording studio with microphone and laptop",
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
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem("aum-theme");
                const theme = stored === "light" || stored === "dark" ? stored : "dark";
                document.documentElement.classList.toggle("light", theme === "light");
                document.documentElement.classList.toggle("dark", theme !== "light");
              } catch (_) {
                document.documentElement.classList.add("dark");
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
