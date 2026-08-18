import type { Transition } from "motion/react";

/**
 * Apple's fluid-interface springs, expressed in Motion's `bounce` + `duration`
 * API. `bounce: 0` is critically damped (damping 1.0) — the default for
 * anything that did not begin with a physical gesture. Reserve bounce for
 * motion that inherited momentum from a flick or a drag release.
 */

/** Move / reposition. Damping 1.0, response 0.4. */
export const springMove: Transition = { type: "spring", bounce: 0, duration: 0.4 };

/** Disclosure / drawer. Slightly quicker so a tap feels answered. */
export const springDisclosure: Transition = { type: "spring", bounce: 0, duration: 0.34 };

/** Momentum-carrying motion only. Damping ~0.8, response 0.4. */
export const springMomentum: Transition = { type: "spring", bounce: 0.2, duration: 0.4 };

/** Entrance of a translucent surface — it materializes rather than fades. */
export const springMaterialize: Transition = { type: "spring", bounce: 0, duration: 0.55 };

/** Reduced-motion equivalent: a short cross-fade, no displacement. */
export const crossFade: Transition = { duration: 0.2, ease: "easeOut" };
