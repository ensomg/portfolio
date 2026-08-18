"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * A Minecraft skin, standing up.
 *
 * The skin is one 64×64 sheet, and every face of every limb is a slice of it,
 * so the whole model is thirty-six divs sharing a single image — no renderer,
 * no mesh, nothing to download beyond the PNG itself. `image-rendering` has to
 * be pixelated or the browser smears sixteen-pixel faces into mush.
 */

/** Skin pixels per CSS pixel. */
const UNIT = 4.4;

type Face = "front" | "back" | "right" | "left" | "top" | "bottom";

type Box = {
  name: string;
  /** Size in skin pixels. */
  w: number;
  h: number;
  d: number;
  /** Centre offset from the hips, in skin pixels. Up is positive. */
  x: number;
  y: number;
  /** Top-left of this box's strip on the sheet. */
  u: number;
  v: number;
  /** Where the limb pivots from, for the idle swing. */
  pivot?: "shoulder" | "hip";
  /** Phase of the swing, so the limbs do not move as one. */
  swing?: number;
};

/**
 * The strip runs right, front, left, back across the sheet, with the top and
 * bottom caps on the row above it.
 */
function faceRect(box: Box, face: Face): { u: number; v: number; w: number; h: number } {
  const { w, h, d, u, v } = box;
  switch (face) {
    case "right":
      return { u, v: v + d, w: d, h };
    case "front":
      return { u: u + d, v: v + d, w, h };
    case "left":
      return { u: u + d + w, v: v + d, w: d, h };
    case "back":
      return { u: u + d + w + d, v: v + d, w, h };
    case "top":
      return { u: u + d, v, w, h: d };
    case "bottom":
      return { u: u + d + w, v, w, h: d };
  }
}

function faceTransform(box: Box, face: Face): string {
  const { w, h, d } = box;
  switch (face) {
    case "front":
      return `translateZ(${(d / 2) * UNIT}px)`;
    case "back":
      return `rotateY(180deg) translateZ(${(d / 2) * UNIT}px)`;
    case "right":
      return `rotateY(90deg) translateZ(${(w / 2) * UNIT}px)`;
    case "left":
      return `rotateY(-90deg) translateZ(${(w / 2) * UNIT}px)`;
    case "top":
      return `rotateX(90deg) translateZ(${(h / 2) * UNIT}px)`;
    case "bottom":
      return `rotateX(-90deg) translateZ(${(h / 2) * UNIT}px)`;
  }
}

function faceSize(box: Box, face: Face): { w: number; h: number } {
  switch (face) {
    case "front":
    case "back":
      return { w: box.w, h: box.h };
    case "right":
    case "left":
      return { w: box.d, h: box.h };
    case "top":
    case "bottom":
      return { w: box.w, h: box.d };
  }
}

const FACES: Face[] = ["front", "back", "right", "left", "top", "bottom"];

function buildBoxes(slim: boolean): Box[] {
  const arm = slim ? 3 : 4;
  const armX = 4 + arm / 2;

  return [
    { name: "head", w: 8, h: 8, d: 8, x: 0, y: 10, u: 0, v: 0 },
    { name: "torso", w: 8, h: 12, d: 4, x: 0, y: 0, u: 16, v: 16 },
    { name: "armR", w: arm, h: 12, d: 4, x: -armX, y: 0, u: 40, v: 16, pivot: "shoulder", swing: 0 },
    { name: "armL", w: arm, h: 12, d: 4, x: armX, y: 0, u: 32, v: 48, pivot: "shoulder", swing: 0.5 },
    { name: "legR", w: 4, h: 12, d: 4, x: -2, y: -12, u: 0, v: 16, pivot: "hip", swing: 0.5 },
    { name: "legL", w: 4, h: 12, d: 4, x: 2, y: -12, u: 16, v: 48, pivot: "hip", swing: 0 },
  ];
}

function BoxMesh({ box, skin }: { box: Box; skin: string }) {
  // A limb swings about its top edge, not its middle. Three nested layers keep
  // that honest: the seat holds the position, the joint holds the rotation, and
  // the body is pushed back down inside it. Putting the swing on the seat would
  // have the keyframes overwrite the position transform outright.
  const drop = box.pivot ? (box.h / 2) * UNIT : 0;

  return (
    <div
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        width: 0,
        height: 0,
        transformStyle: "preserve-3d",
        transform: `translate3d(${box.x * UNIT}px, ${-box.y * UNIT - drop}px, 0)`,
      }}
    >
      <div
        className="absolute"
        style={{
          left: 0,
          top: 0,
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          animation: box.pivot
            ? `mc-swing-${box.pivot} 3.4s ease-in-out ${(box.swing ?? 0) * -1.7}s infinite alternate`
            : undefined,
        }}
      >
        <div
          className="absolute"
          style={{
            left: 0,
            top: 0,
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `translateY(${drop}px)`,
          }}
        >
        {FACES.map((face) => {
          const rect = faceRect(box, face);
          const size = faceSize(box, face);
          return (
            <div
              key={face}
              className="absolute"
              style={{
                width: size.w * UNIT,
                height: size.h * UNIT,
                left: (-size.w / 2) * UNIT,
                top: (-size.h / 2) * UNIT,
                transform: faceTransform(box, face),
                backgroundImage: `url(${skin})`,
                backgroundSize: `${64 * UNIT}px ${64 * UNIT}px`,
                backgroundPosition: `${-rect.u * UNIT}px ${-rect.v * UNIT}px`,
                imageRendering: "pixelated",
                backfaceVisibility: "hidden",
              }}
            />
          );
          })}
        </div>
      </div>
    </div>
  );
}

export function MinecraftAvatar({
  skin,
  model,
  className,
}: {
  skin: string;
  model: "classic" | "slim";
  className?: string;
}) {
  const modelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // The pose is written straight to the node. Turning a model with React state
  // would re-render the whole body on every pointer move.
  const pose = useRef({ yaw: -22, pitch: 8, spin: true });

  useEffect(() => {
    const node = modelRef.current;
    if (!node) return;

    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      if (pose.current.spin && !reduceMotion) pose.current.yaw += delta * 14;
      node.style.transform = `rotateX(${pose.current.pitch}deg) rotateY(${pose.current.yaw}deg)`;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion]);

  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    pose.current.spin = false;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const held = drag.current;
    if (!held || held.id !== event.pointerId) return;
    pose.current.yaw += (event.clientX - held.x) * 0.55;
    // Clamped: letting it tip past vertical turns the model inside out.
    pose.current.pitch = Math.max(-35, Math.min(45, pose.current.pitch + (event.clientY - held.y) * 0.35));
    held.x = event.clientX;
    held.y = event.clientY;
  };

  const release = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    pose.current.spin = true;
  };

  return (
    <div
      role="img"
      aria-label="Minecraft skin, drag to turn"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      className={`relative cursor-grab touch-none select-none active:cursor-grabbing ${className ?? ""}`}
      style={{ perspective: 620 }}
    >
      <style>{`
        @keyframes mc-swing-shoulder {
          from { transform: var(--seat) rotateX(-13deg); }
          to   { transform: var(--seat) rotateX(13deg); }
        }
        @keyframes mc-swing-hip {
          from { transform: var(--seat) rotateX(11deg); }
          to   { transform: var(--seat) rotateX(-11deg); }
        }
      `}</style>
      <div
        ref={modelRef}
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {buildBoxes(model === "slim").map((box) => (
          <BoxMesh key={box.name} box={box} skin={skin} />
        ))}
      </div>
    </div>
  );
}
