"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useSmoothStageProgress } from "@/lib/use-scroll-progress";

/** Past this a screen is solid enough to be worth clicking. */
const REACHABLE = 0.6;

/** How an arriving screen comes in. Each reads as a different kind of motion. */
export type Approach =
  /** Nothing at the container: the screen's own pieces handle it. */
  | "none"
  /** A single plane gliding forward out of the dark. */
  | "depth"
  /** Turned in from the side, as though the room pivoted to face you. */
  | "swing"
  /** Thrown up from far behind and levelling out — faster, steeper, further. */
  | "rush";

export type StageLayer = {
  key: string;
  /** Stage progress across which this screen arrives. */
  enter: [number, number];
  /** Stage progress across which it leaves. Omitted for a screen that stays. */
  leave?: [number, number];
  /** Palette written to `<html data-zone>` while this screen holds the stage. */
  zone?: string;
  approach?: Approach;
  children: React.ReactNode;
};

type LayerMotion = {
  /** 0 before it arrives, 1 once it has landed. */
  enter: MotionValue<number>;
  /** 0 while it holds the screen, 1 once it is gone. */
  leave: MotionValue<number>;
};

const LayerContext = createContext<LayerMotion | null>(null);

/**
 * The arrival and departure of the screen a component sits on.
 *
 * Sections use this to come apart in their own way. A screen that leaves the
 * same way the last one did stops reading as a separate place.
 */
export function useStageLayer(): LayerMotion | null {
  return useContext(LayerContext);
}

/** A range that can never be reached, for a screen that never leaves. */
const NEVER: [number, number] = [2, 3];

function Layer({ layer, progress }: { layer: StageLayer; progress: MotionValue<number> }) {
  const reduceMotion = useReducedMotion();
  const [reachable, setReachable] = useState(false);

  const enter = useTransform(progress, layer.enter, [0, 1], { clamp: true });
  const leave = useTransform(progress, layer.leave ?? NEVER, [0, 1], { clamp: true });

  const approach = layer.approach ?? "depth";
  const forward = approach === "rush" ? -650 : approach === "swing" ? -240 : -300;
  const from = approach === "rush" ? 0.7 : approach === "swing" ? 0.82 : 0.86;
  const haze = approach === "rush" ? 18 : approach === "swing" ? 12 : 10;
  const tilt = approach === "rush" ? 14 : 0;
  const turn = approach === "swing" ? -38 : 0;

  const scale = useTransform(enter, [0, 1], [from, 1]);
  const z = useTransform(enter, [0, 1], [forward, 0]);
  const rotateX = useTransform(enter, [0, 1], [tilt, 0]);
  const rotateY = useTransform(enter, [0, 1], [turn, 0]);
  const blur = useTransform(enter, [0, 1], [haze, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  // The pieces carry their own exits, but the container fades on the way out
  // too: anything a section forgot to hand an exit to would otherwise sit on
  // the screen for the rest of the page.
  const fade = useTransform(() => enter.get() * (1 - leave.get()));
  const opacity = approach === "none" ? undefined : fade;

  // Thresholds, not per-frame styles: these cross twice in a whole scroll, so a
  // render is cheaper than writing pointer-events every frame.
  useMotionValueEvent(enter, "change", (value) => {
    setReachable(value > REACHABLE && leave.get() < 0.4);
  });
  useMotionValueEvent(leave, "change", (value) => {
    setReachable(value < 0.4 && enter.get() > REACHABLE);
  });

  // The palette belongs to whichever screen is holding the stage.
  useEffect(() => {
    const zone = layer.zone;
    if (!zone) return;

    const root = document.documentElement;
    const sync = () => {
      const holding = enter.get() > 0.5 && leave.get() < 0.5;
      if (holding) root.dataset.zone = zone;
      else if (root.dataset.zone === zone) delete root.dataset.zone;
    };

    sync();
    const stop = [enter.on("change", sync), leave.on("change", sync)];
    return () => {
      stop.forEach((off) => off());
      if (root.dataset.zone === zone) delete root.dataset.zone;
    };
  }, [enter, leave, layer.zone]);

  const style =
    approach === "none"
      ? { transformStyle: "preserve-3d" as const }
      : reduceMotion
        ? { opacity }
        : { opacity, scale, z, rotateX, rotateY, filter, transformStyle: "preserve-3d" as const };

  return (
    <motion.div
      style={style}
      aria-hidden={approach !== "none" && !reachable}
      className={
        "col-start-1 row-start-1 w-full max-w-5xl " + (reachable ? "" : "pointer-events-none")
      }
    >
      <LayerContext.Provider value={{ enter, leave }}>{layer.children}</LayerContext.Provider>
    </motion.div>
  );
}

/**
 * Every screen shares one viewport that stays pinned.
 *
 * Scrolling a section away and the next one up means each arriving screen is a
 * rectangle sliding into frame. Here the screens trade places in depth instead:
 * one comes apart on its own timings while the next comes forward out of the
 * dark behind it. Nothing moves vertically — the scroll is spent entirely on
 * the handover.
 */
export function Stage({ layers }: { layers: StageLayer[] }) {
  const progress = useSmoothStageProgress();

  return (
    <div className="relative min-h-[580dvh]">
      <div
        className="sticky top-0 grid h-dvh w-full place-items-center overflow-hidden px-3 sm:px-5"
        // One shared space, so the screens read as the same room rather than
        // separate pictures crossfading.
        style={{ perspective: 1400 }}
      >
        {layers.map((layer) => (
          <Layer key={layer.key} layer={layer} progress={progress} />
        ))}
      </div>
    </div>
  );
}
