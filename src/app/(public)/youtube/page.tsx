import { PublicEventTracker } from "@/components/public/public-event-tracker";
import { YoutubeVideosSection } from "@/components/public/youtube-videos-section";
import { getPublicYoutubeVideos } from "@/lib/content/youtube";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "YouTube",
  description: "Últimos videos oficiales de AUM PRODZ.",
};

export default async function YoutubePage() {
  const videos = await getPublicYoutubeVideos(12);

  return (
    <>
      <PublicEventTracker eventName="page_view" page="/youtube" source="youtube" />
      <YoutubeVideosSection videos={videos} />
    </>
  );
}
