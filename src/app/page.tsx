import { Bento } from "@/components/bento";
import { Stage } from "@/components/stage";
import { ScrollCue } from "@/components/scroll-cue";
import { AboutSection } from "@/components/about-section";
import { ContributionsSection } from "@/components/contributions-section";
import { AccountsSection } from "@/components/accounts-section";
import { DomainsSection } from "@/components/domains-section";
import { LanyardProvider } from "@/lib/use-lanyard";
import { site } from "@/lib/site";

/**
 * Scrolling covers who I am, what I worked on, where I play and what I own.
 * Projects are a click away rather than another screen you have to pass through
 * to reach the end.
 *
 * Every screen shares one pinned viewport and hands over in depth, and each one
 * arrives and leaves its own way: the bento tumbles apart through three
 * dimensions, the introduction is swept sideways, the contributions rise away,
 * the accounts drop off the bottom. Nothing slides up from below — the scroll is
 * spent entirely on the handovers.
 */
export default function Home() {
  return (
    <>
      <main>
        <Stage
          layers={[
            {
              key: "bento",
              // The panels carry their own drifts, so the stage leaves the
              // container alone here.
              enter: [-1, 0],
              approach: "none",
              children: (
                <LanyardProvider discordId={site.lanyard.discordId}>
                  <Bento />
                </LanyardProvider>
              ),
            },
            {
              key: "about",
              enter: [0.12, 0.261],
              leave: [0.348, 0.467],
              approach: "depth",
              children: <AboutSection />,
            },
            {
              key: "contributions",
              enter: [0.391, 0.511],
              leave: [0.598, 0.717],
              approach: "swing",
              children: <ContributionsSection />,
            },
            {
              key: "accounts",
              enter: [0.641, 0.761],
              leave: [0.848, 0.946],
              approach: "depth",
              children: <AccountsSection />,
            },
            {
              key: "domains",
              enter: [0.87, 0.989],
              zone: "domains",
              approach: "rush",
              children: <DomainsSection />,
            },
          ]}
        />
      </main>

      <ScrollCue />
    </>
  );
}
