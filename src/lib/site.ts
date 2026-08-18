export const site = {
  name: "ensomg",
  title: "ensomg",
  description: "Personal site of ensomg — I work on cheapz.xyz.",
  url: "https://ensomg.com",
  photo: "/profile-photo-placeholder.svg",
  photoAlt: "Profile portrait",
  work: { label: "cheapz.xyz", href: "https://cheapz.xyz" },
  interests: [
    { label: "HTML", href: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
    { label: "Python", href: "https://www.python.org/" },
    { label: "Node.js", href: "https://nodejs.org/" },
  ],
  /**
   * Hand-picked projects. While this is empty the Projects panel falls back to
   * the most recently pushed public repos on GitHub.
   */
  projects: [] as { name: string; description?: string; href: string }[],
  /**
   * The longer introduction, shown on the second screen. Rewrite these in your
   * own words whenever you like — nothing else reads them.
   */
  about: [
    "I run two things. cheapz.xyz sells Roblox Robux for less than everywhere else. luminalabs.com.tr builds websites by hand — clean, simple, modern, with no template underneath them.",
    "Everything else is small tools I build because I wanted them to exist, a GitHub account I keep pushing to, and a pile of domains I keep buying.",
  ],
  /**
   * Sites I worked on that are not mine. Fill these in and the screen writes
   * itself; while it is empty the section says so rather than inventing work.
   */
  contributions: [
    { name: "craftulus.com.tr", href: "https://www.craftulus.com.tr/" },
    { name: "luminalabs.com.tr", href: "https://www.luminalabs.com.tr/" },
    { name: "cheapz.xyz", href: "https://www.cheapz.xyz/" },
    { name: "frig.best", href: "https://www.frig.best/" },
    { name: "netiva.com.tr", href: "https://www.netiva.com.tr/" },
    { name: "hunk.com.tr", href: "https://www.hunk.com.tr/" },
  ] as { name: string; href: string; role?: string; description?: string }[],

  /** The two things I run. */
  companies: [
    {
      name: "cheapz.xyz",
      href: "https://cheapz.xyz",
      description: "Roblox Robux, cheap.",
    },
    {
      name: "luminalabs.com.tr",
      href: "https://luminalabs.com.tr",
      description: "Handmade websites — clean, simple, modern.",
    },
  ],
  /** Domains I hold. Ordered by how much they actually get used. */
  domains: [
    "ensomg.com",
    "luminalabs.com.tr",
    "ensomg.online",
    "ensomg.fun",
    "ensomg.shop",
    "cheapz.xyz",
    "raven.best",
    "boostify.wtf",
    "steampeak.lol",
    "vibecoderz.lol",
    "wearepirates.lol",
    "nesine.lol",
    "onlyfanz.lol",
    "europol.cv",
  ],
  location: "Akfırat, Göçbeyli Bv No:1, 34959 Tuzla/İstanbul",
  map: { lat: 40.9251836, lon: 29.417775, zoom: 15 },
  github: { label: "@ensomg on GitHub", href: "https://github.com/ensomg", handle: "ensomg" },
  x: { label: "@ensomg0 on X", href: "https://x.com/ensomg0", handle: "ensomg0" },
  discord: { label: "@ensomg on Discord", href: "https://discord.com/users/852629327891660881" },
  lanyard: {
    discordId: "852629327891660881",
    spotifyHref:
      "https://open.spotify.com/user/31nfajr6sunfjjdgy4oplhfun6qa?si=5fab1a28655c4dee",
  },
} as const;

export type Site = typeof site;
