import { Bento } from "@/components/bento";
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
 * The page has one piece of scroll-driven motion: the footage behind it fading
 * to black. The sections themselves hold still — planes each sliding on their
 * own timing fight both the scroll and each other.
 */
export default function Home() {
  return (
    <>
      <main>
        <section className="flex min-h-dvh w-full items-center justify-center px-3 py-6 sm:px-5 sm:py-10">
          <div className="w-full max-w-5xl">
            <LanyardProvider discordId={site.lanyard.discordId}>
              <Bento />
            </LanyardProvider>
          </div>
        </section>

        <section className="flex min-h-dvh w-full items-center justify-center px-3 py-16 sm:px-5">
          <AboutSection />
        </section>

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
