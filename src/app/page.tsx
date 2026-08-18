import { Bento } from "@/components/bento";
import { Stage } from "@/components/stage";
import { Zone } from "@/components/zone";
import { ScrollCue } from "@/components/scroll-cue";
import { AboutSection } from "@/components/about-section";
import { DomainsSection } from "@/components/domains-section";
import { LanyardProvider } from "@/lib/use-lanyard";
import { site } from "@/lib/site";

/**
 * Scrolling covers who I am and what I own. Projects are a click away rather
 * than a third screen you have to pass through to reach the end.
 *
 * The first two screens share one pinned viewport: the bento comes apart while
 * the introduction comes forward out of the depth behind it. Nothing slides up
 * from below until the stage has finished with the screen.
 */
export default function Home() {
  return (
    <>
      <main>
        <Stage
          front={
            <LanyardProvider discordId={site.lanyard.discordId}>
              <Bento />
            </LanyardProvider>
          }
          back={<AboutSection />}
        />

        <Zone name="domains">
          <section className="flex min-h-dvh w-full items-center justify-center px-3 py-16 sm:px-5">
            <DomainsSection />
          </section>
        </Zone>
      </main>

      <ScrollCue />
    </>
  );
}
