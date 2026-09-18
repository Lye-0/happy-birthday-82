/* Deterministic confetti pool: a generous first wave, then a lingering shower. */
(function (root) {
  'use strict';
  const W = root.Wishes = root.Wishes || {};
  const CONFETTI = Object.freeze({ count: 690, startDelay: .18, duration: 13.5 });

  function makeConfettiParticles(seed = 8298) {
    const rng = W.random(seed);
    return Array.from({ length: CONFETTI.count }, (_, i) => {
      const side = i % 2 ? 1 : -1;
      const burst = i < CONFETTI.count / 2;
      return Object.freeze({
        // Half arrives in a dense first wave; the remainder replenishes the shower.
        delay: burst ? rng() * .28 : .65 + rng() * 3.4,
        x: burst ? side * (1.65 + rng() * 3.8) : (rng() - .5) * 10.8,
        y: burst ? 4.1 + rng() * 2.8 : 5.2 + rng() * 3,
        z: -3.1 + rng() * 6,
        vx: burst ? -side * (.65 + rng() * 1.15) : (rng() - .5) * .75,
        lift: burst ? .4 + rng() * .9 : rng() * .25,
        fall: .68 + rng() * .53,
        phase: rng() * W.TAU,
        spin: (rng() > .5 ? 1 : -1) * (1.4 + rng() * 2.6),
        sway: .10 + rng() * .21,
        size: .029 + rng() * .03,
        aspect: .46 + rng() * .52
      });
    });
  }

  function sampleConfetti(p, age) {
    // A tiny positive scale avoids a singular model matrix for invisible pieces.
    const hidden = () => ({ visible: false, position: [0, -5, 0], scale: [.00001, .00001, .00001], rotation: [0, 0, 0] });
    if (!Number.isFinite(age) || age < p.delay || age >= CONFETTI.duration) return hidden();
    const t = age - p.delay;
    const drift = 1 - Math.exp(-t * .75);
    const x = p.x + p.vx * drift + Math.sin(t * 1.9 + p.phase) * p.sway;
    const y = p.y + p.lift * (1 - Math.exp(-t * 2)) - p.fall * t;
    const z = p.z + Math.sin(t * 1.25 + p.phase) * .28;
    const fade = W.smooth(0, .12, t) * W.smooth(-.45, .18, y) * (1 - W.smooth(11.8, CONFETTI.duration, age));
    if (fade <= .001) return hidden();
    const size = p.size * fade;
    return {
      visible: true,
      position: [x, y, z],
      scale: [size, size, size * p.aspect],
      rotation: [p.phase + t * p.spin, t * .9, Math.sin(t * 1.7 + p.phase) * .85]
    };
  }

  Object.assign(W, { CONFETTI, makeConfettiParticles, sampleConfetti });
  if (typeof module !== 'undefined' && module.exports) module.exports = W;
})(typeof window !== 'undefined' ? window : globalThis);
