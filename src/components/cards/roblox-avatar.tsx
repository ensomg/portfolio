"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/**
 * The Roblox avatar, on a plate you can turn.
 *
 * Roblox does publish the real avatar mesh, but `avatar-3d` answers 403
 * "Invalid authentication data provided" to anyone without an account session,
 * so there is nothing to hand a renderer. This is the flat render standing in
 * a lit 3D space instead: it holds the same drag-to-turn gesture as the skin
 * beside it, and swaps itself for a mesh the day the endpoint opens up.
 */
export function RobloxAvatar({ image, className }: { image: string; className?: string }) {
  const plateRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const pose = useRef({ yaw: -16, pitch: 6, spin: true });

  useEffect(() => {
    const node = plateRef.current;
    if (!node) return;

    let frame = 0;
    let last = performance.now();

    const draw = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      if (pose.current.spin && !reduceMotion) {
        // A slow sway rather than a full turn: the render is flat, and spinning
        // it past ninety degrees would show it edge-on as a line.
        pose.current.yaw = Math.sin(now / 2600) * 20;
        pose.current.pitch = 6 + Math.sin(now / 3700) * 4;
      }
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
    // Clamped well short of edge-on, where a flat plate disappears.
    pose.current.yaw = Math.max(-58, Math.min(58, pose.current.yaw + (event.clientX - held.x) * 0.45));
    pose.current.pitch = Math.max(-32, Math.min(38, pose.current.pitch + (event.clientY - held.y) * 0.3));
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
      aria-label="Roblox avatar, drag to turn"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      className={`relative cursor-grab touch-none select-none active:cursor-grabbing ${className ?? ""}`}
      style={{ perspective: 700 }}
    >
      <div
        ref={plateRef}
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 size-full object-contain"
          style={{ transform: "translateZ(18px)" }}
        />
        {/* The ground it stands on, so turning the plate reads as depth rather
            than a picture being skewed. */}
        <div
          className="absolute inset-x-2 bottom-1 h-6 rounded-[50%] bg-black/45 blur-md"
          style={{ transform: "rotateX(78deg)" }}
        />
      </div>
    </div>
  );
}
