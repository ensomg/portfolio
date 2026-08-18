export type Theme = {
  id: string;
  label: string;
  /** Swatch shown in the picker. */
  dot: string;
  /** Whether the palette is dark, for anything that has to know. */
  dark: boolean;
  /** Background clip. Falls back to the shared one until a file exists. */
  video: string;
  /** Soundtrack. `null` means this theme plays nothing. */
  track: string | null;
};

const FALLBACK_VIDEO = "/bg.mp4";

/** One track for every theme, for now. Point a theme at its own file to split them. */
const SHARED_TRACK = "/track.mp3";

/**
 * Every theme owns a palette, a clip and a track. Files are looked up by name
 * under `public/` — drop `bg-candy.mp4` in and Candy starts using it, no code
 * change. Anything missing falls back to the shared clip, and a missing clip
 * falls back to the gradient field.
 */
export const themes: Theme[] = [
  {
    id: "dark",
    label: "Dark",
    dot: "#8ab4ff",
    dark: true,
    video: FALLBACK_VIDEO,
    track: SHARED_TRACK,
  },
  {
    id: "candy",
    label: "Candy",
    dot: "#f07ab5",
    dark: false,
    video: "/bg-candy.mp4",
    track: SHARED_TRACK,
  },
  {
    id: "matcha",
    label: "Matcha",
    dot: "#6ba368",
    dark: false,
    video: "/bg-matcha.mp4",
    track: SHARED_TRACK,
  },
  {
    id: "sunset",
    label: "Sunset",
    dot: "#f08a4b",
    dark: false,
    video: "/bg-sunset.mp4",
    track: SHARED_TRACK,
  },
  {
    id: "midnight",
    label: "Midnight",
    dot: "#6f9bf0",
    dark: true,
    video: "/bg-midnight.mp4",
    track: SHARED_TRACK,
  },
];

export const themeIds = themes.map((theme) => theme.id);
export const defaultTheme = "dark";

export function getTheme(id: string | undefined): Theme {
  return themes.find((theme) => theme.id === id) ?? themes[0];
}
