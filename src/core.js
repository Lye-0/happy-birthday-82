/* 82 WISHES — deterministic candle layout and celebration state. */
(function (root) {
  'use strict';
  const W = root.Wishes = root.Wishes || {};
  const TAU = Math.PI * 2;
  const RINGS = Object.freeze([
    Object.freeze({ count: 30, radius: 2.23, offset: .041 }),
    Object.freeze({ count: 24, radius: 1.73, offset: .103 }),
    Object.freeze({ count: 18, radius: 1.23, offset: .024 }),
    Object.freeze({ count: 10, radius: .69, offset: .135 })
  ]);
  const CANDLE_COUNT = 82;
  function random(seed = 82) {
    let a = seed >>> 0;
    return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  function makeCandles() {
    const rand = random(82082), out = [];
    RINGS.forEach((ring, r) => {
      for (let i = 0; i < ring.count; ++i) {
        const a = TAU * i / ring.count + ring.offset;
        const height = .77 + rand() * .20;
        out.push(Object.freeze({ id: out.length + 1, ring: r, angle: a, x: Math.cos(a) * ring.radius, z: Math.sin(a) * ring.radius, base: 1.93, height, y: 1.93 + height + .044, phase: rand() * TAU, scale: .92 + rand() * .2 }));
      }
    });
    if (out.length !== CANDLE_COUNT || new Set(out.map(x => x.id)).size !== CANDLE_COUNT) throw new Error('82本のろうそくを生成できませんでした。');
    return out;
  }
  class Celebration {
    constructor(candles = makeCandles()) { this.candles = candles; this.reset(); }
    reset() { this.state = 'lit'; this.elapsed = 0; this.extinguishAt = this.candles.map(() => Infinity); this.wind = [0, 0, -1]; this.finishedAt = Infinity; this.litCount = CANDLE_COUNT; }
    blow(cameraPosition) {
      if (this.state !== 'lit') return false;
      const h = Math.hypot(cameraPosition[0], cameraPosition[2]) || 1;
      const dx = cameraPosition[0] / h, dz = cameraPosition[2] / h;
      this.wind = [-dx, 0, -dz];
      const distances = this.candles.map(c => -(c.x * dx + c.z * dz));
      const lo = Math.min(...distances), hi = Math.max(...distances);
      this.extinguishAt = distances.map((d, i) => .44 + 1.22 * (d - lo) / (hi - lo) + .052 * Math.sin(i * 2.4) ** 2);
      this.finishedAt = Math.max(...this.extinguishAt);
      this.elapsed = 0; this.state = 'blowing'; return true;
    }
    update(dt) {
      if (!Number.isFinite(dt) || dt < 0) throw new RangeError('経過時間は0以上の有限数で指定してください。');
      if (this.state === 'lit') return;
      this.elapsed += Math.max(0, dt);
      this.litCount = this.extinguishAt.reduce((n, t) => n + (this.elapsed < t ? 1 : 0), 0);
      if (!this.litCount) this.state = 'celebrating';
    }
    candle(i) {
      if (!Number.isInteger(i) || i < 0 || i >= this.candles.length) throw new RangeError('ろうそくの番号が範囲外です。');
      const d = Number.isFinite(this.extinguishAt[i]) ? this.elapsed - this.extinguishAt[i] : -10;
      return { lit: d < 0, fuel: 1 - smooth(-.11, 0, d), gust: smooth(-.33, -.06, d) * (1 - smooth(.1, 1.25, d)), smokeAge: d, ember: d >= 0 ? Math.exp(-d * 1.5) : 0 };
    }
  }
  Object.assign(W, { TAU, RINGS, CANDLE_COUNT, random, clamp, smooth, lerp, makeCandles, Celebration });
  if (typeof module !== 'undefined' && module.exports) module.exports = W;
})(typeof window !== 'undefined' ? window : globalThis);
