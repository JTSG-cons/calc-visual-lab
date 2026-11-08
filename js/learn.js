// Learn page: lesson menu, progress, step-by-step examples, practice links, and every lesson figure.
import { Plot, COLORS as C } from "./plot.js";
import { initTheme } from "./theme.js";

initTheme();
const redraws = [];
addEventListener("themechange", () => redraws.forEach((r) => r()));

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const f2 = (v) => (Math.abs(v) < 5e-4 ? "0" : v.toFixed(2));
const f3 = (v) => (Math.abs(v) < 5e-5 ? "0" : v.toFixed(3));
const safe = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

/* ---------- drawing helpers ---------- */
// Parametric curve (x(t), y(t)).
function param(p, fx, fy, t0, t1, { color = C.brand, width = 2.5, dash = null } = {}) {
  const ctx = p.ctx;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  for (let i = 0; i <= 300; i++) {
    const t = lerp(t0, t1, i / 300);
    const X = p.X(fx(t)), Y = p.Y(fy(t));
    i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
  }
  ctx.stroke(); ctx.restore();
}
// Equal x/y scale around (cx, cy), showing at least `half` units vertically.
function square(p, cx, cy, half) {
  const r = p.w / p.h;
  p.v = { xmin: cx - half * r, xmax: cx + half * r, ymin: cy - half, ymax: cy + half };
}
function rect(p, x, y, w, h, fill, stroke) {
  const ctx = p.ctx, X = p.X(x), Y = p.Y(y + h), W = p.X(x + w) - X, H = p.Y(y) - Y;
  ctx.save();
  if (fill) { ctx.fillStyle = fill; ctx.fillRect(X, Y, W, H); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.strokeRect(X, Y, W, H); }
  ctx.restore();
}
const title = (p, text, color = C.muted) => p.label(text, p.v.xmin, p.v.ymax, { color, dx: 40, dy: 22, size: 12 });

/* ---------- figures ---------- */
const MINI = {
  lin: { f: (x) => 0.7 * x + 0.5, v: [-3, 3, -2.5, 2.5] },
  sq: { f: (x) => x * x, v: [-2.5, 2.5, -1, 5] },
  cube: { f: (x) => x ** 3, v: [-2, 2, -4, 4] },
  sqrt: { f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), v: [-1, 5, -1, 2.6] },
  recip: { f: (x) => 1 / x, v: [-3, 3, -4, 4] },
  exp: { f: Math.exp, v: [-3, 2, -1, 6] },
  ln: { f: (x) => (x > 0 ? Math.log(x) : NaN), v: [-0.5, 5, -3, 2] },
  sin: { f: Math.sin, v: [-6.5, 6.5, -1.8, 1.8] },
};

const FIG = {
  mini: {
    setup(el) { const m = MINI[el.dataset.fn]; return { views: [{ xmin: m.v[0], xmax: m.v[1], ymin: m.v[2], ymax: m.v[3] }], m }; },
    draw([p], k, out, s) { p.clear(); p.fn(s.m.f, { color: C.ch1, width: 2.5 }); },
  },

  vlt: {
    canvases: 2,
    views: [{ xmin: -2.5, xmax: 2.5, ymin: -1, ymax: 5 }, { xmin: -1, xmax: 5, ymin: -2.6, ymax: 2.6 }],
    draw([a, b], k, out) {
      const xl = lerp(-2.2, 2.2, k), xr = lerp(-0.6, 4.6, k);
      a.clear(); title(a, "y = x²", C.ch1);
      a.fn((x) => x * x, { color: C.ch1, width: 3 });
      a.seg(xl, -1, xl, 5, { color: C.text, width: 1.5, dash: [5, 5] });
      a.dot(xl, xl * xl, C.ch1);
      b.clear(); title(b, "x = y²", C.ch4);
      b.fn((x) => (x >= 0 ? Math.sqrt(x) : NaN), { color: C.ch4, width: 3 });
      b.fn((x) => (x >= 0 ? -Math.sqrt(x) : NaN), { color: C.ch4, width: 3 });
      b.seg(xr, -2.6, xr, 2.6, { color: C.text, width: 1.5, dash: [5, 5] });
      const hits = xr > 0.02 ? 2 : xr >= -0.02 ? 1 : 0;
      if (xr >= -0.02) { b.dot(xr, Math.sqrt(Math.max(0, xr)), C.ch4); if (hits === 2) b.dot(xr, -Math.sqrt(xr), C.ch4); }
      out.innerHTML = `Left: <b>1 hit</b>, a function ✓ &nbsp;·&nbsp; Right: <b>${hits} hit${hits === 1 ? "" : "s"}</b>${hits === 2 ? ", not a function ✗" : ""}`;
    },
  },

  trans: {
    views: [{ xmin: -5, xmax: 6, ymin: -5, ymax: 5 }],
    draw([p], k, out) {
      const k1 = clamp(k * 3), k2 = clamp(k * 3 - 1), k3 = clamp(k * 3 - 2);
      const h = 2 * k1, a = lerp(1, -0.5, k2), kk = k3;
      p.clear();
      p.fn((x) => x * x, { color: C.muted, width: 2, dash: [5, 5], alpha: 0.7 });
      p.fn((x) => a * (x - h) ** 2 + kk, { color: C.ch1, width: 3 });
      p.dot(h, kk, C.ch1);
      const step = k3 > 0 ? "3. lift up 1" : k2 > 0 ? "2. flip and squash (a = −½)" : k1 > 0 ? "1. shift right 2" : "start: y = x²";
      out.innerHTML = `<b>${step}</b><br>y = ${a.toFixed(2)}(x − ${h.toFixed(2)})² + ${kk.toFixed(2)}`;
    },
  },

  expbase: {
    views: [{ xmin: -2.5, xmax: 2.5, ymin: -0.6, ymax: 5 }],
    draw([p], k, out) {
      const a = lerp(1.3, 4, k), m = Math.log(a);
      p.clear();
      p.fn(Math.exp, { color: C.muted, width: 1.5, dash: [4, 5], alpha: 0.6 });
      p.fn((x) => a ** x, { color: C.ch1, width: 3 });
      p.line(0, 1, m, { color: C.brand, width: 2 });
      p.dot(0, 1, C.ch3);
      const isE = Math.abs(a - Math.E) < 0.05;
      out.innerHTML = `a = <b>${a.toFixed(2)}</b> · slope at 0 = ln a = <b>${m.toFixed(3)}</b>${isE ? " · <b>this is e!</b>" : ""}`;
    },
  },

  inverse: {
    views: [{ xmin: -3, xmax: 5, ymin: -3, ymax: 5 }],
    draw([p], k, out) {
      const a = lerp(-2, 1.4, k), ea = Math.exp(a);
      p.clear();
      p.fn((x) => x, { color: C.muted, width: 1.5, dash: [6, 6] });
      p.fn(Math.exp, { color: C.ch1, width: 3 });
      p.fn((x) => (x > 0 ? Math.log(x) : NaN), { color: C.brand, width: 3, from: 0.001 });
      p.seg(a, ea, ea, a, { color: C.text, width: 1.5, dash: [3, 4] });
      p.dot(a, ea, C.ch1); p.dot(ea, a, C.brand);
      out.innerHTML = `On e^x: <b>(${f2(a)}, ${f2(ea)})</b> &nbsp;↔&nbsp; on ln x: <b>(${f2(ea)}, ${f2(a)})</b>`;
    },
  },

  approach: {
    views: [{ xmin: -0.4, xmax: 2.5, ymin: -0.3, ymax: 3.6 }],
    draw([p], k, out) {
      const d = Math.pow(10, lerp(0, -2.3, k));
      p.clear();
      p.fn((x) => x + 1, { color: C.ch2, width: 3 });
      [[1 - d, C.brand], [1 + d, C.ch3]].forEach(([x, c]) => {
        p.seg(0, x + 1, x, x + 1, { color: c, width: 1.2, dash: [3, 4] });
        p.seg(x, 0, x, x + 1, { color: c, width: 1.2, dash: [3, 4] });
        p.dot(x, x + 1, c);
      });
      p.dot(1, 2, C.ch2, { r: 6, open: true, glow: false });
      out.innerHTML = `f(${f3(1 - d)}) = <b>${f3(2 - d)}</b> &nbsp;·&nbsp; f(${f3(1 + d)}) = <b>${f3(2 + d)}</b> &nbsp;→ both approach <b>2</b>`;
    },
  },

  fail: {
    canvases: 3,
    views: [{ xmin: -2, xmax: 2, ymin: -0.5, ymax: 4 }, { xmin: -2, xmax: 2, ymin: -0.5, ymax: 6 }, { xmin: -0.5, xmax: 0.5, ymin: -1.6, ymax: 1.6 }],
    draw([a, b, c]) {
      a.clear(); title(a, "Jump", C.ch2);
      a.fn((x) => 1 + 0.4 * x, { color: C.ch2, width: 3, to: -0.001 });
      a.fn((x) => 3 - 0.4 * x, { color: C.ch2, width: 3, from: 0.001 });
      a.dot(0, 1, C.ch2, { open: true, glow: false }); a.dot(0, 3, C.ch2);
      b.clear(); title(b, "Blow-up", C.ch2);
      b.fn((x) => 1 / (x * x), { color: C.ch2, width: 3 });
      c.clear(); title(c, "Oscillation", C.ch2);
      c.fn((x) => Math.sin(1 / x), { color: C.ch2, width: 1.5 });
    },
  },

  laws: {
    views: [{ xmin: -0.3, xmax: 2.3, ymin: -0.4, ymax: 4.5 }],
    draw([p]) {
      p.clear();
      const f = (x) => x * x, g = (x) => 2 * Math.sqrt(Math.max(x, 0));
      p.seg(1, -0.4, 1, 4.5, { color: C.muted, width: 1, dash: [4, 5] });
      p.fn(f, { color: C.ch2, width: 3 });
      p.fn(g, { color: C.brand, width: 3, from: 0 });
      p.fn((x) => f(x) + g(x), { color: C.ch3, width: 3, from: 0 });
      p.dot(1, 1, C.ch2); p.dot(1, 2, C.brand); p.dot(1, 3, C.ch3);
      p.label("f → 1", 1, 1, { color: C.ch2, dx: 10, dy: 18 });
      p.label("g → 2", 1, 2, { color: C.brand, dx: 10, dy: 18 });
      p.label("f + g → 3", 1, 3, { color: C.ch3, dx: -82, dy: -6 });
    },
  },

  cancel: {
    views: [{ xmin: -0.5, xmax: 4.5, ymin: -3.5, ymax: 1.5 }],
    draw([p], k, out) {
      const after = k >= 0.5;
      p.clear();
      p.fn((x) => x - 3, { color: after ? C.ch1 : C.ch2, width: 3 });
      if (after) p.dot(2, -1, C.ch1, { r: 6 }); else p.dot(2, -1, C.ch2, { r: 6, open: true, glow: false });
      p.label(after ? "x − 3 at x = 2 is −1" : "hole: 0/0 at x = 2", 2, -1, { color: C.muted, dx: 12, dy: 20, size: 11 });
      out.innerHTML = after
        ? `<b>After:</b>  (x−2)(x−3)/(x−2) = x − 3, so the limit is <b>2 − 3 = −1</b>`
        : `<b>Before:</b>  substituting x = 2 gives 0/0, a hole at (2, −1)`;
    },
  },

  squeeze: {
    views: [{ xmin: -1.2, xmax: 1.2, ymin: -1.9, ymax: 1.9 }],
    draw([p], k, out) {
      const s = 1.2 * Math.pow(10, -2 * k);
      p.v = { xmin: -s, xmax: s, ymin: -1.3 * s * s, ymax: 1.3 * s * s };
      p.clear();
      p.fn((x) => x * x, { color: C.ch2, width: 2, dash: [6, 5] });
      p.fn((x) => -x * x, { color: C.ch2, width: 2, dash: [6, 5] });
      p.fn((x) => x * x * Math.cos(1 / x), { color: C.brand, width: 2 });
      p.dot(0, 0, C.ch1);
      out.innerHTML = `Zoom <b>${Math.round(Math.pow(10, 2 * k))}×</b> · the walls ±x² still pinch the curve to 0`;
    },
  },

  unit: {
    views: [{ xmin: -0.3, xmax: 1.4, ymin: -0.25, ymax: 1.25 }],
    draw([p], k, out) {
      const th = lerp(1.4, 0.04, k);
      square(p, 0.55, 0.5, 0.75);
      p.clear();
      param(p, Math.cos, Math.sin, 0, Math.PI / 2, { color: C.muted, width: 1.5 });
      p.seg(0, 0, Math.cos(th), Math.sin(th), { color: C.text, width: 1.5 });
      param(p, Math.cos, Math.sin, 0, th, { color: C.ch3, width: 5 });
      p.seg(Math.cos(th), 0, Math.cos(th), Math.sin(th), { color: C.brand, width: 4 });
      p.dot(Math.cos(th), Math.sin(th), C.text, { r: 4 });
      out.innerHTML = `θ = <b>${f3(th)}</b> · sin θ = <b>${f3(Math.sin(th))}</b> · sin θ / θ = <b>${(Math.sin(th) / th).toFixed(4)}</b>`;
    },
  },

  asym: {
    views: [{ xmin: -4.5, xmax: 4.5, ymin: -4, ymax: 7 }],
    draw([p]) {
      p.clear();
      p.seg(-1, -4, -1, 7, { color: C.ch4, width: 1.5, dash: [6, 5] });
      p.seg(1, -4, 1, 7, { color: C.ch4, width: 1.5, dash: [6, 5] });
      p.seg(-4.5, 2, 4.5, 2, { color: C.ch1, width: 1.5, dash: [6, 5] });
      p.fn((x) => (2 * x * x) / (x * x - 1), { color: C.ch2, width: 3 });
      p.label("x = 1", 1, 6.5, { color: C.ch4, dx: 6 });
      p.label("x = −1", -1, 6.5, { color: C.ch4, dx: -52 });
      p.label("y = 2", 4.4, 2, { color: C.ch1, dx: -44, dy: -6 });
    },
  },

  disc: {
    canvases: 3,
    views: [{ xmin: -0.5, xmax: 3, ymin: -0.5, ymax: 3.5 }, { xmin: -0.5, xmax: 3, ymin: -0.5, ymax: 3.5 }, { xmin: -1.5, xmax: 3, ymin: -4, ymax: 4 }],
    draw([a, b, c]) {
      a.clear(); title(a, "Removable", C.ch2);
      a.fn((x) => x + 1, { color: C.ch2, width: 3 });
      a.dot(1, 2, C.ch2, { open: true, glow: false }); a.dot(1, 0.8, C.ch4);
      b.clear(); title(b, "Jump", C.ch2);
      b.fn(() => 1, { color: C.ch2, width: 3, to: 1.4 }); b.fn(() => 2.5, { color: C.ch2, width: 3, from: 1.4 });
      b.dot(1.4, 1, C.ch2, { open: true, glow: false }); b.dot(1.4, 2.5, C.ch2);
      c.clear(); title(c, "Infinite", C.ch2);
      c.fn((x) => 1 / (x - 1), { color: C.ch2, width: 3 });
      c.seg(1, -4, 1, 4, { color: C.ch4, width: 1.2, dash: [5, 5] });
    },
  },

  ivt: {
    views: [{ xmin: -0.5, xmax: 4.5, ymin: -1.7, ymax: 1.7 }],
    draw([p], k, out) {
      const f = (x) => 0.15 * x ** 3 - 0.9 * x * x + 1.7 * x - 1;
      const N = lerp(f(0), f(4), lerp(0.04, 0.96, k));
      p.clear();
      p.band(0, 4, C.ch2, 0.06);
      p.seg(-0.5, N, 4.5, N, { color: C.ch3, width: 1.8, dash: [6, 5] });
      p.fn(f, { color: C.ch2, width: 3, from: 0, to: 4 });
      p.dot(0, f(0), C.text); p.dot(4, f(4), C.text);
      p.label("f(a)", 0, f(0), { dx: 8, dy: 18 }); p.label("f(b)", 4, f(4), { dx: -40, dy: -8 });
      const cs = [];
      for (let i = 0; i < 800; i++) {
        const x0 = (4 * i) / 800, x1 = (4 * (i + 1)) / 800;
        if ((f(x0) - N) * (f(x1) - N) <= 0) cs.push((x0 + x1) / 2);
      }
      const uniq = cs.filter((c, i) => i === 0 || c - cs[i - 1] > 0.02);
      uniq.forEach((c) => { p.dot(c, N, C.ch3, { r: 6 }); p.seg(c, N, c, -1.7, { color: C.ch3, width: 1, dash: [3, 4] }); });
      out.innerHTML = `N = <b>${f2(N)}</b> · the curve crosses at c ≈ <b>${uniq.map(f2).join(", ")}</b>`;
    },
  },

  secant: {
    views: [{ xmin: -1.5, xmax: 3.6, ymin: -1.5, ymax: 9 }],
    draw([p], k, out) {
      const h = lerp(2, 0.01, k), m = 2 + h;
      p.clear();
      p.line(1, 1, 2, { color: C.text, width: 1.5, dash: [5, 6], alpha: 0.5 });
      p.fn((x) => x * x, { color: C.ch2, width: 3 });
      p.line(1, 1, m, { color: C.brand, width: 2.5 });
      p.dot(1, 1, C.ch2); p.dot(1 + h, (1 + h) ** 2, C.brand);
      out.innerHTML = `h = <b>${f3(h)}</b> · secant slope = 2 + h = <b>${f3(m)}</b> → tangent slope <b>2</b>`;
    },
  },

  nodiff: {
    canvases: 3,
    views: [{ xmin: -2, xmax: 2, ymin: -0.6, ymax: 2 }, { xmin: -2, xmax: 2, ymin: -0.6, ymax: 2 }, { xmin: -2, xmax: 2, ymin: -1.6, ymax: 1.6 }],
    draw([a, b, c]) {
      a.clear(); title(a, "Corner |x|", C.ch2); a.fn(Math.abs, { color: C.ch2, width: 3 }); a.dot(0, 0, C.ch4);
      b.clear(); title(b, "Cusp x^(2/3)", C.ch2); b.fn((x) => Math.cbrt(x * x), { color: C.ch2, width: 3 }); b.dot(0, 0, C.ch4);
      c.clear(); title(c, "Vertical tangent x^(1/3)", C.ch2); c.fn(Math.cbrt, { color: C.ch2, width: 3 });
      c.seg(0, -1.6, 0, 1.6, { color: C.ch4, width: 1.5, dash: [5, 5] }); c.dot(0, 0, C.ch4);
    },
  },

  power: {
    views: [{ xmin: -2, xmax: 2, ymin: -4, ymax: 4 }],
    draw([p], k, out) {
      const x = lerp(-1.6, 1.6, k), h = 1e-4;
      const meas = ((x + h) ** 3 - (x - h) ** 3) / (2 * h);
      p.clear();
      p.fn((t) => t ** 3, { color: C.ch3, width: 3 });
      p.line(x, x ** 3, 3 * x * x, { color: C.brand, width: 2 });
      p.dot(x, x ** 3, C.ch3);
      out.innerHTML = `x = <b>${f2(x)}</b> · measured slope <b>${f3(meas)}</b> · power rule 3x² = <b>${f3(3 * x * x)}</b>`;
    },
  },

  sinslope: {
    views: [{ xmin: -0.3, xmax: 6.6, ymin: -1.6, ymax: 1.6 }],
    draw([p], k, out) {
      const x = lerp(0, 2 * Math.PI, k);
      p.clear();
      p.fn(Math.cos, { color: C.brand, width: 1.5, dash: [4, 5], alpha: 0.35 });
      p.fn(Math.sin, { color: C.ch3, width: 3 });
      p.fn(Math.cos, { color: C.brand, width: 3, from: 0, to: Math.max(0.001, x) });
      p.line(x, Math.sin(x), Math.cos(x), { color: C.ch3, width: 1.5, alpha: 0.8 });
      p.seg(x, Math.sin(x), x, Math.cos(x), { color: C.muted, width: 1, dash: [3, 4] });
      p.dot(x, Math.sin(x), C.ch3); p.dot(x, Math.cos(x), C.brand);
      out.innerHTML = `x = <b>${f2(x)}</b> · slope of sin x = <b>${f3(Math.cos(x))}</b> = cos x`;
    },
  },

  circle: {
    views: [{ xmin: -7, xmax: 7, ymin: -6.5, ymax: 6.5 }],
    draw([p], k, out) {
      const th = lerp(0.25, 2 * Math.PI - 0.25, k), x = 5 * Math.cos(th), y = 5 * Math.sin(th);
      square(p, 0, 0, 6.5);
      p.clear();
      param(p, (t) => 5 * Math.cos(t), (t) => 5 * Math.sin(t), 0, 2 * Math.PI, { color: C.ch3, width: 3 });
      if (Math.abs(y) > 0.05) p.line(x, y, -x / y, { color: C.brand, width: 2 });
      else p.seg(x, -6.5, x, 6.5, { color: C.brand, width: 2 });
      p.dot(x, y, C.ch3);
      out.innerHTML = `point (${f2(x)}, ${f2(y)}) · slope y′ = −x / y = <b>${Math.abs(y) > 0.05 ? f3(-x / y) : "vertical"}</b>`;
    },
  },

  lnslope: {
    views: [{ xmin: -0.2, xmax: 5.5, ymin: -2.2, ymax: 2.3 }],
    draw([p], k, out) {
      const x = lerp(0.25, 5, k);
      p.clear();
      p.fn((t) => (t > 0 ? Math.log(t) : NaN), { color: C.ch3, width: 3, from: 0.01 });
      p.line(x, Math.log(x), 1 / x, { color: C.brand, width: 2 });
      p.dot(x, Math.log(x), C.ch3);
      out.innerHTML = `x = <b>${f2(x)}</b> · slope = 1/x = <b>${f3(1 / x)}</b>`;
    },
  },

  ladder: {
    views: [{ xmin: -0.6, xmax: 6, ymin: -0.6, ymax: 5.6 }],
    draw([p], k, out) {
      const x = lerp(0.3, 4.9, k), y = Math.sqrt(25 - x * x);
      square(p, 2.6, 2.5, 3.1);
      p.clear();
      p.seg(0, 0, 0, 5.6, { color: C.muted, width: 6 });
      p.seg(-0.6, 0, 6, 0, { color: C.muted, width: 4 });
      p.seg(x, 0, 0, y, { color: C.ch3, width: 6 });
      p.dot(x, 0, C.brand, { r: 6 }); p.dot(0, y, C.ch4, { r: 6 });
      p.label(`x = ${f2(x)}`, x / 2, 0, { color: C.brand, dy: 24, align: "center" });
      p.label(`y = ${f2(y)}`, 0, y / 2, { color: C.ch4, dx: 10 });
      p.label("5 m", x / 2, y / 2, { color: C.ch3, dx: 12, dy: -6 });
      out.innerHTML = `dx/dt = <b>1</b> m/s · dy/dt = −x/y = <b>${f2(-x / y)}</b> m/s`;
    },
  },

  linear: {
    views: [{ xmin: 0, xmax: 8, ymin: 0, ymax: 3.5 }],
    draw([p], k, out) {
      const w = 3.6 * Math.pow(10, -2.2 * k), yr = Math.max(w * 0.45, 0.002);
      p.v = { xmin: 4 - w, xmax: 4 + w, ymin: 2 - yr, ymax: 2 + yr };
      p.clear();
      p.fn((x) => (x >= 0 ? Math.sqrt(x) : NaN), { color: C.ch3, width: 3 });
      p.fn((x) => 2 + (x - 4) / 4, { color: C.brand, width: 2, dash: [6, 4] });
      p.dot(4, 2, C.text, { r: 4 });
      const gap = Math.abs(Math.sqrt(4 + w) - (2 + w / 4));
      out.innerHTML = `window 4 ± ${w < 0.01 ? w.toExponential(1) : f3(w)} · biggest gap between curve and tangent ≈ <b>${gap < 1e-4 ? gap.toExponential(1) : gap.toFixed(4)}</b>`;
    },
  },

  growth: {
    views: [{ xmin: -0.2, xmax: 5, ymin: -0.3, ymax: 6 }],
    draw([p], k, out) {
      const r = lerp(-1, 1, k);
      p.clear();
      p.fn((t) => Math.exp(r * t), { color: r >= 0 ? C.ch1 : C.ch4, width: 3, from: 0 });
      p.dot(0, 1, C.text, { r: 4 });
      const note = Math.abs(r) < 0.02 ? "constant" : r > 0 ? `doubles every ln2/k = ${f2(Math.log(2) / r)}` : `half-life ln2/|k| = ${f2(Math.log(2) / -r)}`;
      out.innerHTML = `k = <b>${f2(r)}</b> · ${note}`;
    },
  },

  extint: {
    views: [{ xmin: -2.5, xmax: 2.8, ymin: -3, ymax: 5.5 }],
    draw([p], k, out) {
      const f = (x) => x ** 3 - 3 * x, b = lerp(-1.6, 2.5, k);
      p.clear();
      p.fn(f, { color: C.muted, width: 1.5, alpha: 0.4 });
      p.band(-2, b, C.ch4, 0.07);
      p.fn(f, { color: C.ch4, width: 3, from: -2, to: b });
      const cand = [-2, b, ...[-1, 1].filter((c) => c < b)];
      const vals = cand.map(f);
      const iMax = vals.indexOf(Math.max(...vals)), iMin = vals.indexOf(Math.min(...vals));
      [-1, 1].forEach((c) => c < b && p.dot(c, f(c), C.muted, { r: 4 }));
      p.dot(cand[iMax], vals[iMax], C.ch3, { r: 7 }); p.dot(cand[iMin], vals[iMin], C.brand, { r: 7 });
      p.label("abs max", cand[iMax], vals[iMax], { color: C.ch3 });
      p.label("abs min", cand[iMin], vals[iMin], { color: C.brand, dy: 22 });
      out.innerHTML = `On [−2, ${f2(b)}]: abs max <b>${f2(vals[iMax])}</b> at x = ${f2(cand[iMax])} · abs min <b>${f2(vals[iMin])}</b> at x = ${f2(cand[iMin])}`;
    },
  },

  cim: {
    views: [{ xmin: -0.3, xmax: 2.3, ymin: 1.6, ymax: 3.4 }],
    draw([p], k, out) {
      const f = (x) => (x * x + 3) / (1 + x), d = (x) => ((x + 3) * (x - 1)) / (1 + x) ** 2;
      const x = lerp(0, 2, k);
      p.clear();
      p.band(0, 2, C.ch4, 0.08);
      p.fn(f, { color: C.muted, width: 2, alpha: 0.5 });
      p.fn(f, { color: C.ch4, width: 3, from: 0, to: 2 });
      p.line(x, f(x), d(x), { color: C.brand, width: 1.5, alpha: 0.8 });
      p.dot(x, f(x), C.brand);
      [[0, 3, "f(0) = 3  max", "left", 8, -8], [1, 2, "f(1) = 2  min", "left", 8, 22], [2, 7 / 3, "f(2) = 7/3", "right", -8, -8]].forEach(([cx, cy, t, al, dx, dy]) => {
        p.dot(cx, cy, C.ch3, { r: 6 }); p.label(t, cx, cy, { color: C.ch3, align: al, dx, dy });
      });
      out.innerHTML = `f(${f2(x)}) = <b>${f2(f(x))}</b> · f′ = <b>${f2(d(x))}</b> ${Math.abs(d(x)) < 0.02 ? "(critical!)" : d(x) > 0 ? "rising" : "falling"}`;
    },
  },

  mvt: {
    views: [{ xmin: -0.4, xmax: 2.6, ymin: -1, ymax: 5 }],
    draw([p], k, out) {
      const f = (x) => x ** 3 - 2 * x * x + x, a = 0, b = lerp(0.5, 2.4, k);
      const m = (f(b) - f(a)) / (b - a), disc = 4 + 12 * m;
      const cs = disc < 0 ? [] : [(4 - Math.sqrt(disc)) / 6, (4 + Math.sqrt(disc)) / 6].filter((c) => c > a + 1e-6 && c < b - 1e-6);
      p.clear();
      p.band(a, b, C.ch4, 0.07);
      p.fn(f, { color: C.ch4, width: 3 });
      p.line(a, f(a), m, { color: C.brand, width: 1.2, dash: [5, 5], alpha: 0.5 });
      p.seg(a, f(a), b, f(b), { color: C.brand, width: 2.5 });
      p.dot(a, f(a), C.brand); p.dot(b, f(b), C.brand);
      cs.forEach((c) => { p.line(c, f(c), m, { color: C.orange, width: 2 }); p.dot(c, f(c), C.orange); });
      out.innerHTML = `[0, ${f2(b)}] · average slope <b>${f3(m)}</b> · f′(c) equals it at c = <b>${cs.map(f3).join(" and ") || "—"}</b>`;
    },
  },

  sign: {
    views: [{ xmin: -0.3, xmax: 1.6, ymin: -0.35, ymax: 0.6 }],
    draw([p], k, out) {
      const f = (x) => x ** 3 - 2 * x * x + x, d = (x) => (3 * x - 1) * (x - 1);
      const x = lerp(-0.25, 1.55, k), s = d(x);
      p.clear();
      p.band(1 / 3, 1, C.ch4, 0.07);
      p.fn(f, { color: C.ch1, width: 3, to: 1 / 3 });
      p.fn(f, { color: C.ch4, width: 3, from: 1 / 3, to: 1 });
      p.fn(f, { color: C.ch1, width: 3, from: 1 });
      p.dot(1 / 3, 4 / 27, C.ch3, { r: 6 }); p.dot(1, 0, C.ch3, { r: 6 });
      p.label("local max", 1 / 3, 4 / 27, { color: C.ch3, align: "center", dx: 0, dy: -12 });
      p.label("local min", 1, 0, { color: C.ch3, dy: 24 });
      p.line(x, f(x), s, { color: C.text, width: 1.5, alpha: 0.6 });
      p.dot(x, f(x), C.text, { r: 5 });
      out.innerHTML = `x = <b>${f2(x)}</b> · f′(x) = <b>${f3(s)}</b> → ${Math.abs(s) < 0.01 ? "critical point" : s > 0 ? "increasing ↗" : "decreasing ↘"}`;
    },
  },

  concave: {
    views: [{ xmin: -1.3, xmax: 3.4, ymin: -5, ymax: 3 }],
    draw([p], k, out) {
      const f = (x) => x ** 3 - 3 * x * x, d = (x) => 3 * x * x - 6 * x;
      const x = lerp(-1, 3, k), dd = 6 * x - 6;
      p.clear();
      p.fn(f, { color: C.ch2, width: 3, to: 1 });
      p.fn(f, { color: C.ch3, width: 3, from: 1 });
      p.line(x, f(x), d(x), { color: C.brand, width: 2 });
      p.dot(x, f(x), C.brand); p.dot(1, -2, C.text, { r: 6 });
      p.label("inflection (1, −2)", 1, -2, { color: C.muted, dx: 10, dy: 20, size: 11 });
      out.innerHTML = `f″(${f2(x)}) = <b>${f2(dd)}</b> → ${Math.abs(dd) < 0.05 ? "inflection point" : dd > 0 ? "concave up ∪, tangent below the curve" : "concave down ∩, tangent above the curve"}`;
    },
  },

  lhop: {
    views: [{ xmin: -1.5, xmax: 1.5, ymin: -2, ymax: 2 }],
    draw([p], k, out) {
      const w = 1.5 * Math.pow(10, -2 * k);
      p.v = { xmin: -w, xmax: w, ymin: -2.4 * w, ymax: 2.4 * w };
      p.clear();
      p.fn((x) => Math.sin(2 * x), { color: C.ch4, width: 3 });
      p.fn((x) => x, { color: C.brand, width: 3 });
      const x = w / 2;
      out.innerHTML = `at x = ${w / 2 < 0.01 ? (w / 2).toExponential(1) : f3(w / 2)}: sin(2x)/x = <b>${(Math.sin(2 * x) / x).toFixed(5)}</b> → 2 = slope ratio 2 / 1`;
    },
  },

  sketch: {
    views: [{ xmin: -1.3, xmax: 3.6, ymin: -5, ymax: 2.5 }],
    draw([p], k, out) {
      const f = (x) => x ** 3 - 3 * x * x, s = Math.min(4, Math.floor(k * 5));
      const steps = ["1. Intercepts: (0, 0) and (3, 0)", "2. f′ = 3x(x − 2): up, down, up", "3. Local max (0, 0), local min (2, −4)", "4. f″ = 6x − 6: concave down, then up; inflection (1, −2)", "5. Join it all smoothly"];
      p.clear();
      if (s >= 3) { p.band(-1.3, 1, C.ch2, 0.08); p.band(1, 3.6, C.ch3, 0.08); }
      if (s >= 1) {
        p.label("↗ increasing", -1.2, 1.5, { color: C.ch1, dx: 0, dy: 0 });
        p.label("↘ decreasing", 1, 1.5, { color: C.ch4, align: "center", dx: 0, dy: 0 });
        p.label("↗ increasing", 3.5, 1.5, { color: C.ch1, align: "right", dx: 0, dy: 0 });
        p.seg(0, -5, 0, 2.5, { color: C.muted, width: 1, dash: [3, 5] }); p.seg(2, -5, 2, 2.5, { color: C.muted, width: 1, dash: [3, 5] });
      }
      if (s >= 4) p.fn(f, { color: C.text, width: 3 });
      p.dot(0, 0, C.ch1); p.dot(3, 0, C.ch1);
      if (s >= 2) { p.dot(0, 0, C.ch3, { r: 7 }); p.dot(2, -4, C.ch3, { r: 7 }); p.label("max", 0, 0, { color: C.ch3, dy: -10 }); p.label("min", 2, -4, { color: C.ch3, dy: 22 }); }
      if (s >= 3) { p.dot(1, -2, C.brand, { r: 6 }); p.label("inflection", 1, -2, { color: C.brand }); }
      out.innerHTML = steps.slice(0, s + 1).map((t, i) => (i === s ? `<b>${t}</b>` : t)).join("<br>");
    },
  },

  box: {
    canvases: 2,
    views: [{ xmin: -1, xmax: 13, ymin: -1, ymax: 13 }, { xmin: -0.3, xmax: 6.3, ymin: -12, ymax: 150 }],
    draw([a, b], k, out) {
      const x = lerp(0.2, 5.8, k), V = (t) => t * (12 - 2 * t) ** 2;
      square(a, 6, 6, 7);
      a.ctx.clearRect(0, 0, a.w, a.h);
      rect(a, 0, 0, 12, 12, "rgba(194,65,45,0.10)", C.ch4);
      [[0, 0], [12 - x, 0], [0, 12 - x], [12 - x, 12 - x]].forEach(([cx, cy]) => rect(a, cx, cy, x, x, C.bg, C.muted));
      [[x, 0, x, 12], [12 - x, 0, 12 - x, 12], [0, x, 12, x], [0, 12 - x, 12, 12 - x]].forEach(([x1, y1, x2, y2]) => a.seg(x1, y1, x2, y2, { color: C.ch4, width: 1, dash: [4, 4] }));
      a.label(`x = ${f2(x)}`, 0, 12, { color: C.text, dx: 4, dy: 18 });
      b.clear(); title(b, "V(x) = x(12 − 2x)²", C.ch4);
      b.fn(V, { color: C.ch4, width: 3, from: 0, to: 6 });
      b.dot(x, V(x), C.brand); b.dot(2, 128, C.ch3, { r: 5 });
      b.label("max 128 at x = 2", 2, 128, { color: C.ch3, dx: 10, dy: 4 });
      out.innerHTML = `box ${f2(12 - 2 * x)} × ${f2(12 - 2 * x)} × ${f2(x)} cm · V = <b>${f2(V(x))}</b> cm³`;
    },
  },

  newton: {
    views: [{ xmin: -0.3, xmax: 3.4, ymin: -2.6, ymax: 8 }],
    draw([p], k, out) {
      const f = (x) => x * x - 2, n = Math.round(lerp(0, 4, k));
      p.clear();
      p.fn(f, { color: C.ch4, width: 3 });
      const xs = [3];
      for (let i = 0; i < n; i++) {
        const xi = xs[i], xn = xi - f(xi) / (2 * xi);
        p.seg(xi, 0, xi, f(xi), { color: C.muted, width: 1, dash: [3, 4] });
        p.seg(xi, f(xi), xn, 0, { color: C.brand, width: 2 });
        p.dot(xi, f(xi), C.brand, { r: 4 });
        xs.push(xn);
      }
      xs.forEach((x, i) => p.dot(x, 0, i === xs.length - 1 ? C.ch3 : C.text, { r: i === xs.length - 1 ? 6 : 4 }));
      p.seg(Math.SQRT2, -0.4, Math.SQRT2, 0.4, { color: C.ch1, width: 2 });
      out.innerHTML = xs.map((x, i) => `x<sub>${i}</sub> = ${x.toFixed(5)}`).join(" · ") + ` &nbsp;(√2 = 1.41421)`;
    },
  },
};

/* ---------- figure runtime ---------- */
function initFigure(el) {
  const def = FIG[el.dataset.fig];
  if (!def) return;
  const canvases = [...el.querySelectorAll("canvas")];
  const extra = def.setup ? def.setup(el) : {};
  const views = extra.views || def.views || [{ xmin: -5, xmax: 5, ymin: -5, ymax: 5 }];
  const plots = canvases.map((c, i) => new Plot(c, views[i] || views[0]));
  const slider = el.querySelector(".lf-k"), out = el.querySelector(".lf-out") || document.createElement("output");
  const draw = () => {
    plots.forEach((p, i) => { if (!def.keepView) p.v = { ...(views[i] || views[0]) }; });
    def.draw(plots, slider ? slider.value / 1000 : 0, out, extra);
  };
  if (slider) {
    slider.addEventListener("input", draw);
    // drag on the picture to move the slider
    if (canvases.length === 1 || el.dataset.fig === "box" || el.dataset.fig === "vlt") canvases.forEach((c) => {
      const drag = (e) => {
        if (e.type === "pointermove" && !e.buttons) return;
        const r = c.getBoundingClientRect();
        slider.value = Math.round(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * 1000);
        draw();
      };
      c.addEventListener("pointerdown", (e) => { c.setPointerCapture?.(e.pointerId); drag(e); });
      c.addEventListener("pointermove", drag);
    });
  }
  redraws.push(draw);
  const ro = new ResizeObserver(() => { plots.forEach((p) => p.resize()); draw(); });
  canvases.forEach((c) => ro.observe(c));
}
document.querySelectorAll(".lf[data-fig]").forEach(initFigure);

/* ---------- lesson menu, progress, steps, practice links ---------- */
const lessons = [...document.querySelectorAll(".lesson")];
const done = safe.get("cvl-learn", {});
const toc = document.getElementById("toc");

function renderProgress() {
  const n = lessons.filter((l) => done[l.id]).length;
  document.getElementById("learn-progress").innerHTML = `<b>${n}/${lessons.length}</b> lessons understood<span class="lp-bar"><i style="width:${(n / lessons.length) * 100}%"></i></span>`;
  toc.querySelectorAll("a[data-id]").forEach((a) => a.classList.toggle("done", !!done[a.dataset.id]));
}

let html = "";
document.querySelectorAll(".ch-title").forEach((h) => {
  const ch = h.id.replace("ch", "");
  html += `<p class="toc-ch ch${ch}"><a href="#${h.id}">${h.textContent.replace("Chapter ", "Ch ")}</a></p><ul>`;
  lessons.filter((l) => l.classList.contains("ch" + ch)).forEach((l) => {
    html += `<li><a href="#${l.id}" data-id="${l.id}"><span class="toc-n">${l.dataset.num}</span>${l.querySelector("h3").textContent}</a></li>`;
  });
  html += "</ul>";
});
toc.innerHTML = `<details open class="toc-wrap"><summary>Lessons</summary>${html}</details>`;

lessons.forEach((l) => {
  const h = l.querySelector("h3");
  const bar = document.createElement("div");
  bar.className = "lesson-head";
  bar.innerHTML = `<span class="lnum">§${l.dataset.num}</span><label class="got"><input type="checkbox" ${done[l.id] ? "checked" : ""}> I understand this</label>`;
  h.before(bar);
  bar.querySelector("input").addEventListener("change", (e) => { done[l.id] = e.target.checked; safe.set("cvl-learn", done); renderProgress(); });
});
renderProgress();

document.querySelectorAll(".ex").forEach((ex) => {
  const items = [...ex.querySelectorAll(".steps li")], btn = ex.querySelector(".next-step");
  let shown = 0;
  const update = () => {
    items.forEach((li, i) => li.classList.toggle("shown", i < shown));
    btn.textContent = shown < items.length ? `Show next step (${shown + 1}/${items.length})` : "All steps shown · hide";
  };
  btn.addEventListener("click", () => { shown = shown < items.length ? shown + 1 : 0; update(); });
  update();
});

document.querySelectorAll("a.try[data-t]").forEach((a) => {
  const t = a.dataset.t;
  a.href = `index.html?t=${encodeURIComponent(t)}#practice`;
  a.textContent = `Practise this: ${t} →`;
});

// active lesson in the menu
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    toc.querySelectorAll("a[data-id]").forEach((a) => a.classList.toggle("active", a.dataset.id === e.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
lessons.forEach((l) => io.observe(l));

// mobile menu + progress bar
const btn = document.getElementById("menu-btn"), menu = document.getElementById("nav");
btn.addEventListener("click", () => { const o = menu.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
const bar = document.getElementById("progress-bar");
const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%"; };
addEventListener("scroll", onScroll, { passive: true }); onScroll();
if (matchMedia("(max-width: 860px)").matches) toc.querySelector("details").open = false;

// math
const renderMath = () => window.renderMathInElement && renderMathInElement(document.body, {
  delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "$$", right: "$$", display: true }], throwOnError: false,
});
if (window.renderMathInElement) renderMath(); else addEventListener("load", renderMath);
