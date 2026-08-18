"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

/**
 * The real Roblox avatar mesh.
 *
 * Roblox serves the avatar as a plain OBJ with one texture atlas, which is
 * about the simplest thing a renderer can be handed — so this stays a bare
 * three.js scene rather than pulling in a scene graph library on top of it.
 * Dragging turns the model; releasing hands it back to the idle turntable.
 */
export function RobloxMesh({
  obj,
  texture,
  className,
  onFailed,
}: {
  obj: string;
  texture: string | null;
  className?: string;
  onFailed?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";

    scene.add(new THREE.AmbientLight(0xffffff, 1.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(2, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.6);
    rim.position.set(-3, 1, -4);
    scene.add(rim);

    // The turntable is a parent of the model so the model keeps whatever
    // centring it was given rather than fighting the rotation.
    const turntable = new THREE.Group();
    scene.add(turntable);

    let disposed = false;
    let frame = 0;
    const pose = { yaw: -0.35, pitch: 0.06, spin: true };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const loadTexture = () =>
      new Promise<THREE.Texture | null>((resolve) => {
        if (!texture) return resolve(null);
        new THREE.TextureLoader().setCrossOrigin("anonymous").load(
          texture,
          (loaded) => {
            loaded.colorSpace = THREE.SRGBColorSpace;
            loaded.flipY = false;
            resolve(loaded);
          },
          undefined,
          () => resolve(null),
        );
      });

    (async () => {
      try {
        const [group, map] = await Promise.all([
          new OBJLoader().loadAsync(obj),
          loadTexture(),
        ]);
        if (disposed) return;

        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshLambertMaterial({
              map: map ?? undefined,
              color: map ? 0xffffff : 0x9aa4b2,
            });
          }
        });

        // Sit the model on the origin and frame it, whatever scale it arrives in.
        const box = new THREE.Box3().setFromObject(group);
        const size = box.getSize(new THREE.Vector3());
        const centre = box.getCenter(new THREE.Vector3());
        group.position.sub(centre);
        turntable.add(group);

        const span = Math.max(size.x, size.y, size.z) || 1;
        camera.position.set(0, 0, span * 2.6);
        camera.lookAt(0, 0, 0);

        setReady(true);
      } catch {
        if (!disposed) onFailed?.();
      }
    })();

    let last = performance.now();
    const draw = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      if (pose.spin) pose.yaw += delta * 0.42;
      turntable.rotation.y = pose.yaw;
      turntable.rotation.x = pose.pitch;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    let drag: { id: number; x: number; y: number } | null = null;
    const canvas = renderer.domElement;

    const down = (event: PointerEvent) => {
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
      pose.spin = false;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const move = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      pose.yaw += (event.clientX - drag.x) * 0.01;
      pose.pitch = Math.max(-0.6, Math.min(0.6, pose.pitch + (event.clientY - drag.y) * 0.008));
      drag.x = event.clientX;
      drag.y = event.clientY;
    };
    const up = (event: PointerEvent) => {
      if (drag?.id !== event.pointerId) return;
      drag = null;
      pose.spin = true;
      canvas.style.cursor = "grab";
    };

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          const material = child.material;
          if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
      canvas.remove();
    };
  }, [obj, texture, onFailed]);

  return (
    <div
      role="img"
      aria-label="Roblox avatar, drag to turn"
      className={`relative touch-none select-none ${className ?? ""}`}
      data-ready={ready}
    >
      <div ref={hostRef} className="size-full" />
    </div>
  );
}
