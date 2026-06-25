import { ArtistShell } from "@/components/artist/artist-shell";

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ArtistShell>{children}</ArtistShell>;
}
