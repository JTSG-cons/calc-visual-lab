// The 12 lab panels as JSXGraph boards: drag points on the graphs; sliders stay as a keyboard backup.
import { COLORS as C } from "./plot.js";

const $ = (id) => document.getElementById(id);
const num = (id) => parseFloat($(id).value);
const f2 = (v) => (Math.abs(v) < 5e-5 ? 0 : v).toFixed(2);
const f3 = (v) => (Math.abs(v) < 5e-6 ? 0 : v).toFixed(3);
const f4 = (v) => (Math.abs(v) < 5e-7 ? 0 : v).toFixed(4);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- board helpers ---------- */
function makeBoard(id, [xmin, xmax, ymin, ymax]) {
  const axis = (dir) => ({
    strokeColor: C.axis, highlight: false, strokeWidth: 1,
    ticks: { strokeColor: C.grid, majorHeight: -1, minorTicks: 0, highlight: false, drawLabels: true,
      label: { strokeColor: C.label, fontSize: 11, highlight: false, offset: dir === "x" ? [-4, -12] : [-18, 0], anchorX: "middle" } },
  });
  return JXG.JSXGraph.initBoard(id, {
    boundingbox: [xmin, ymax, xmax, ymin], axis: true, keepAspectRatio: false,
    showCopyright: false, showNavigation: false, pan: { enabled: false }, zoom: { enabled: false },
    defaultAxes: { x: axis("x"), y: axis("y") },
  });
}
const curveStyle = (color, w = 3, dash = 0) => ({ strokeColor: color, strokeWidth: w, dash, highlight: false, fixed: true });
const lineStyle = (color, w = 2, dash = 0) => ({ strokeColor: color, strokeWidth: w, dash, highlight: false, fixed: true, straightFirst: true, straightLast: true });
const segStyle = (color, w = 1.5, dash = 2) => ({ strokeColor: color, strokeWidth: w, dash, highlight: false, fixed: true });
const dotStyle = (color, size = 4) => ({ name: "", size, fillColor: color, strokeColor: color, highlight: false, fixed: true, showInfobox: false });
const handle = (color) => ({ name: "", size: 6, fillColor: color, strokeColor: C.text, strokeWidth: 1.5, showInfobox: false, highlightFillColor: color, highlightStrokeColor: C.text });
const openDot = (color) => ({ name: "", size: 5, fillColor: C.bg, strokeColor: color, strokeWidth: 2, highlight: false, fixed: true, showInfobox: false });
const label = (b, x, y, text, color = C.label, size = 12) => b.create("text", [x, y, text], { fontSize: size, strokeColor: color, highlight: false, fixed: true });
// Function-valued coordinates for dependent points: P(() => x, () => y)
const P = (b, fx, fy, style) => b.create("point", [fx, fy], style);

/* ---------- lab runtime: build when visible, rebuild on theme change ---------- */
const labs = [];
function lab(ids, view, build, wire) {
  const L = { ids, view, build, board: null, boards: [], st: {}, built: false };
  // JSXGraph fixes its container's pixel size, so each board sits in a fluid wrapper we measure instead.
  const wraps = ids.map((id) => {
    const box = $(id), w = document.createElement("div");
    w.className = "jxg-wrap"; box.before(w); w.appendChild(box);
    return w;
  });
  const fit = () => ids.forEach((id, i) => { $(id).style.width = wraps[i].clientWidth + "px"; });
  L.make = () => {
    L.boards.forEach((b) => JXG.JSXGraph.freeBoard(b));
    fit();
    L.boards = ids.map((id, i) => makeBoard(id, Array.isArray(view[0]) ? view[i] : view));
    L.board = L.boards[0];
    L.st = build(L.boards, L) || {};
    L.built = true;
    L.update?.();
  };
  L.update = () => { if (L.built && L.st.update) L.st.update(); };
  wire?.(L);
  let lastW = 0;
  const ro = new ResizeObserver(() => {
    const w = wraps[0].clientWidth;
    if (!w || w === lastW) return;
    lastW = w;
    if (!L.built) return L.make();
    L.boards.forEach((b, i) => { b.resizeContainer(wraps[i].clientWidth, $(ids[i]).clientHeight); b.fullUpdate(); });
  });
  wraps.forEach((w) => ro.observe(w));
  labs.push(L);
  return L;
}
addEventListener("themechange", () => labs.forEach((L) => L.built && L.make()));

/* ======================= Chapter 1 ======================= */

const BASES = {
  sq: { f: (x) => x * x, name: "x²" }, abs: { f: Math.abs, name: "|x|" },
  sin: { f: Math.sin, name: "sin x" }, sqrt: { f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), name: "√x" },
};
lab(["b-transform"], [-6, 6, -5, 5], ([b], L) => {
  const base = () => BASES[$("t-base").value];
  const g = (x) => num("t-a") * base().f(num("t-b") * (x - num("t-h"))) + num("t-k");
  b.create("functiongraph", [(x) => base().f(x)], curveStyle(C.muted, 2, 2));
  b.create("functiongraph", [g], curveStyle(C.ch1, 3));
  const V = b.create("point", [num("t-h"), num("t-k")], handle(C.ch1));
  V.on("drag", () => {
    $("t-h").value = clamp(Math.round(V.X() * 10) / 10, -4, 4);
    $("t-k").value = clamp(Math.round(V.Y() * 10) / 10, -4, 4);
    L.update();
  });
  return { update() {
    ["a", "b", "h", "k"].forEach((n) => ($("o-" + n).textContent = num("t-" + n)));
    V.moveTo([num("t-h"), num("t-k")]);
    const h = num("t-h"), k = num("t-k"), sgn = (v) => (v === 0 ? "" : v > 0 ? ` − ${v}` : ` + ${-v}`);
    $("t-formula").textContent = `y = ${num("t-a")}·f(${num("t-b")}(x${sgn(h)}))${k === 0 ? "" : k > 0 ? " + " + k : " − " + -k},  f(x) = ${base().name}`;
    b.update();
  } };
}, (L) => ["t-a", "t-b", "t-h", "t-k", "t-base"].forEach((id) => $(id).addEventListener("input", L.update)));

lab(["b-inverse"], [-3, 5, -3, 5], ([b], L) => {
  b.create("functiongraph", [(x) => x], curveStyle(C.muted, 1.5, 2));
  const E = b.create("functiongraph", [Math.exp], curveStyle(C.ch1, 3));
  b.create("functiongraph", [(x) => Math.log(x), 0.001, 6], curveStyle(C.ch2, 3));
  const A = b.create("glider", [num("i-a"), Math.exp(num("i-a")), E], handle(C.ch1));
  const B = P(b, () => A.Y(), () => A.X(), dotStyle(C.ch2, 5));
  b.create("segment", [A, B], segStyle(C.text, 1.5, 2));
  label(b, 1.3, Math.exp(1.3) + 0.3, "e^x", C.ch1); label(b, 4.1, Math.log(4.1) + 0.35, "ln x", C.ch2);
  A.on("drag", () => { $("i-a").value = clamp(A.X(), -2, 1.4); L.st.read(); });
  return {
    read() { const a = A.X(), ea = A.Y(); $("o-ia").textContent = a.toFixed(2); $("i-read").innerHTML = `On e^x: <b>(${f2(a)}, ${f2(ea)})</b><br>On ln x: <b>(${f2(ea)}, ${f2(a)})</b>`; },
    update() { const a = num("i-a"); A.moveTo([a, Math.exp(a)]); b.update(); this.read(); },
  };
}, (L) => $("i-a").addEventListener("input", L.update));

/* ======================= Chapter 2 ======================= */

lab(["b-hole"], [-0.5, 4.5, -3.5, 1.5], ([b], L) => {
  const f = (x) => (x * x - 5 * x + 6) / (x - 2);
  const G = b.create("functiongraph", [(x) => x - 3], curveStyle(C.ch2, 3));
  b.create("segment", [[2, -3.5], [2, 1.5]], segStyle(C.muted, 1, 2));
  b.create("point", [2, -1], openDot(C.ch2));
  const d0 = Math.pow(10, num("h-d"));
  const R = b.create("glider", [2 + d0, -1 + d0, G], handle(C.ch3));
  const Lp = P(b, () => 4 - R.X(), () => 1 - R.X(), dotStyle(C.ch2, 5));
  label(b, 2.12, -1.35, "limit = −1, f(2) undefined", C.label, 11);
  R.on("drag", () => {
    if (R.X() < 2.001) R.moveTo([2.001, -0.999]);
    $("h-d").value = clamp(Math.log10(Math.abs(R.X() - 2)), -3, 0); L.st.read();
  });
  return {
    read() {
      const d = Math.abs(R.X() - 2);
      $("o-d").textContent = d < 0.01 ? d.toExponential(1) : d.toFixed(3);
      const rows = [d, d / 10, d / 100].map((e) => `<tr><td>${f4(2 - e)}</td><td>${f4(f(2 - e))}</td><td>${f4(2 + e)}</td><td>${f4(f(2 + e))}</td></tr>`).join("");
      $("h-table").innerHTML = `<tr><th>x ← 2</th><th>f(x)</th><th>x → 2</th><th>f(x)</th></tr>${rows}`;
    },
    update() { const d = Math.pow(10, num("h-d")); R.moveTo([2 + d, d - 1]); b.update(); this.read(); },
  };
}, (L) => $("h-d").addEventListener("input", L.update));

lab(["b-piece"], [-2.5, 2.5, -2.6, 1.6], ([b], L) => {
  b.create("functiongraph", [(x) => x - 1, -3, -0.001], curveStyle(C.ch2, 3));
  b.create("functiongraph", [(x) => Math.cos(Math.PI - x), 0.001, 3], curveStyle(C.ch1, 3));
  const hole = b.create("point", [0, -1], openDot(C.text));
  const yAxis = b.defaultAxes.y;
  const Cpt = b.create("glider", [0, num("p-c"), yAxis], handle(C.ch4));
  Cpt.on("drag", () => { $("p-c").value = clamp(Math.round(Cpt.Y() * 2) / 2, -2, 1); L.update(); });
  return { update() {
    const c = num("p-c");
    Cpt.moveTo([0, c]); hole.setAttribute({ visible: c !== -1 });
    $("o-c").textContent = c;
    const ok = c === -1;
    $("p-read").innerHTML = `Left limit: <b>−1</b><br>Right limit: <b>cos π = −1</b><br>f(0) = <b>${c}</b><br>` +
      (ok ? `<b>Continuous at 0</b>: all three match.` : `<b>Not continuous</b>: f(0) ≠ the limit (removable discontinuity).`);
    b.update();
  } };
}, (L) => $("p-c").addEventListener("input", L.update));

lab(["b-secant"], [-1.5, 3.6, -1.5, 9], ([b], L) => {
  const G = b.create("functiongraph", [(x) => x * x], curveStyle(C.ch2, 3));
  const Pp = b.create("point", [1, 1], dotStyle(C.ch2, 5));
  const Q = b.create("glider", [1 + num("s-h"), (1 + num("s-h")) ** 2, G], handle(C.brand));
  b.create("line", [[0, -1], [1, 1]], lineStyle(C.muted, 1.5, 2));
  b.create("line", [Pp, Q], lineStyle(C.brand, 2.5));
  label(b, 1.1, 0.4, "P(1, 1)", C.text);
  Q.on("drag", () => { $("s-h").value = clamp(Q.X() - 1, -2, 2); L.st.read(); });
  return {
    read() {
      let h = Q.X() - 1; if (Math.abs(h) < 0.005) h = h < 0 ? -0.005 : 0.005;
      $("o-sh").textContent = h.toFixed(3);
      $("s-read").innerHTML = `Secant slope = (f(1+h) − f(1)) / h = <b>${(2 + h).toFixed(3)}</b><br>Tangent slope (h → 0) = <b>2</b>`;
    },
    update() { let h = num("s-h"); if (Math.abs(h) < 0.005) h = h < 0 ? -0.005 : 0.005; Q.moveTo([1 + h, (1 + h) ** 2]); b.update(); this.read(); },
  };
}, (L) => {
  $("s-h").addEventListener("input", L.update);
  let anim = null;
  $("s-play").addEventListener("click", () => {
    cancelAnimationFrame(anim);
    const start = num("s-h") || 1.5, t0 = performance.now(), dur = reduceMotion ? 0 : 2500;
    const step = (t) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      $("s-h").value = start * Math.pow(1 - k, 3) + (start > 0 ? 0.005 : -0.005) * k;
      L.update();
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  });
});

lab(["b-squeeze"], [-1.2, 1.2, -1.9, 1.9], ([b], L) => {
  b.create("functiongraph", [(x) => x * x], curveStyle(C.ch2, 2, 2));
  b.create("functiongraph", [(x) => -x * x], curveStyle(C.ch2, 2, 2));
  b.create("functiongraph", [(x) => x * x * Math.cos(1 / x)], { ...curveStyle(C.brand, 2), numberPointsHigh: 2000 });
  b.create("point", [0, 0], dotStyle(C.ch1, 4));
  return { update() {
    const z = num("q-z"), s = 1.2 * Math.pow(10, -z);
    $("o-z").textContent = Math.round(Math.pow(10, z)) + "×";
    b.setBoundingBox([-s, 1.3 * s * s, s, -1.3 * s * s], false);
    b.fullUpdate();
  } };
}, (L) => $("q-z").addEventListener("input", L.update));

/* ======================= Chapter 3 ======================= */

const FNS = {
  cubic: { f: (x) => x ** 3 - 2 * x * x + x, d: (x) => 3 * x * x - 4 * x + 1, x: [-1, 2.5], y: [-4.5, 6], dy: [-1.5, 10], name: "x³ − 2x² + x", dn: "3x² − 4x + 1" },
  sin: { f: Math.sin, d: Math.cos, x: [-6.3, 6.3], y: [-1.6, 1.6], dy: [-1.6, 1.6], name: "sin x", dn: "cos x" },
  exp: { f: Math.exp, d: Math.exp, x: [-3, 2], y: [-0.6, 7.5], dy: [-0.6, 7.5], name: "e^x", dn: "e^x" },
  ln: { f: (x) => Math.log(x), d: (x) => 1 / x, x: [0.1, 5], y: [-3, 2], dy: [-0.5, 6], name: "ln x", dn: "1/x" },
};
lab(["b-f", "b-fp"], [[-1.2, 2.7, -4.5, 6], [-1.2, 2.7, -1.5, 10]], ([top, bot], L) => {
  const F = FNS[$("d-fn").value];
  const s = $("d-x"); s.min = F.x[0]; s.max = F.x[1]; s.value = clamp(num("d-x"), F.x[0], F.x[1]);
  top.setBoundingBox([F.x[0] - 0.2, F.y[1], F.x[1] + 0.2, F.y[0]], false);
  bot.setBoundingBox([F.x[0] - 0.2, F.dy[1], F.x[1] + 0.2, F.dy[0]], false);
  const G = top.create("functiongraph", [F.f, F.x[0] - 0.2, F.x[1] + 0.2], curveStyle(C.ch3, 3));
  bot.create("functiongraph", [F.d, F.x[0] - 0.2, F.x[1] + 0.2], curveStyle(C.brand, 3));
  const x0 = num("d-x");
  const A = top.create("glider", [x0, F.f(x0), G], handle(C.ch3));
  top.create("line", [[() => A.X() - 1, () => A.Y() - F.d(A.X())], A], lineStyle(C.brand, 2));
  const Bp = P(bot, () => A.X(), () => F.d(A.X()), dotStyle(C.brand, 5));
  bot.create("segment", [[() => A.X(), 0], Bp], segStyle(C.brand, 1.5, 2));
  label(top, F.x[0], F.y[1] - (F.y[1] - F.y[0]) * 0.08, "f(x) = " + F.name, C.ch3);
  label(bot, F.x[0], F.dy[1] - (F.dy[1] - F.dy[0]) * 0.1, "f′(x) = " + F.dn, C.brand);
  top.addChild(bot);
  A.on("drag", () => { $("d-x").value = clamp(A.X(), F.x[0], F.x[1]); L.st.read(); });
  return {
    read() { const x = A.X(); $("o-dx").textContent = x.toFixed(2); $("d-read").innerHTML = `f(${x.toFixed(2)}) = <b>${f2(F.f(x))}</b><br>slope f′(${x.toFixed(2)}) = <b>${f2(F.d(x))}</b>`; },
    update() { const x = num("d-x"); A.moveTo([x, F.f(x)]); top.update(); this.read(); },
  };
}, (L) => { $("d-x").addEventListener("input", L.update); $("d-fn").addEventListener("change", () => L.make()); });

lab(["b-chain"], [-2.6, 2.6, -1.4, 1.4], ([b], L) => {
  const meters = [{ key: "g", label: "inner rate  du/dx = 2x", max: 6 }, { key: "f", label: "outer rate  dy/du = cos(x²)", max: 1.2 }, { key: "y", label: "total  dy/dx = product", max: 6 }];
  $("ch-meters").innerHTML = meters.map((m) => `<div class="meter">${m.label}: <output id="mv-${m.key}"></output><div class="bar"><i id="mb-${m.key}"></i></div></div>`).join("");
  const setBar = (key, v, max) => { const w = (Math.min(Math.abs(v), max) / max) * 50, bar = $("mb-" + key); bar.style.left = (v >= 0 ? 50 : 50 - w) + "%"; bar.style.width = w + "%"; $("mv-" + key).textContent = f2(v); };
  const G = b.create("functiongraph", [(t) => Math.sin(t * t)], { ...curveStyle(C.ch3, 3), numberPointsHigh: 1600 });
  const A = b.create("glider", [num("ch-x"), Math.sin(num("ch-x") ** 2), G], handle(C.ch3));
  const slope = () => Math.cos(A.X() ** 2) * 2 * A.X();
  b.create("line", [[() => A.X() - 1, () => A.Y() - slope()], A], lineStyle(C.brand, 2));
  A.on("drag", () => { $("ch-x").value = clamp(A.X(), -2.5, 2.5); L.st.read(); });
  return {
    read() { const x = A.X(); $("o-cx").textContent = x.toFixed(2); setBar("g", 2 * x, 6); setBar("f", Math.cos(x * x), 1.2); setBar("y", slope(), 6); },
    update() { const x = num("ch-x"); A.moveTo([x, Math.sin(x * x)]); b.update(); this.read(); },
  };
}, (L) => $("ch-x").addEventListener("input", L.update));

lab(["b-implicit"], [-1.5, 2.5, -1.5, 2], ([b], L) => {
  const F = (x, y) => x * x + 2 * y ** 3 - 3 * x * y;
  const curve = b.create("implicitcurve", [F], { strokeColor: C.ch3, strokeWidth: 3, highlight: false, fixed: true });
  let A;
  try { A = b.create("glider", [1, 1, curve], handle(C.ch3)); } catch { A = b.create("point", [1, 1], dotStyle(C.ch3, 5)); }
  const slope = () => { const x = A.X(), y = A.Y(); return (3 * y - 2 * x) / (6 * y * y - 3 * x); };
  const tan = b.create("line", [[() => A.X() - 1, () => A.Y() - slope()], A], lineStyle(C.brand, 2.5));
  const txt = b.create("text", [() => A.X() + 0.08, () => A.Y() + 0.18, () => `(${f2(A.X())}, ${f2(A.Y())}) · slope ${Number.isFinite(slope()) ? f3(slope()) : "vertical"}`], { fontSize: 12, strokeColor: C.text, highlight: false, fixed: true });
  return { update() { tan.setAttribute({ visible: $("im-tan").checked }); txt.setAttribute({ visible: $("im-tan").checked }); b.update(); } };
}, (L) => $("im-tan").addEventListener("change", L.update));

/* ======================= Chapter 4 ======================= */

lab(["b-extrema"], [-0.3, 2.3, 1.6, 3.4], ([b], L) => {
  const f = (x) => (x * x + 3) / (1 + x), d = (x) => ((x + 3) * (x - 1)) / (1 + x) ** 2;
  b.create("functiongraph", [f, -0.3, 2.3], curveStyle(C.muted, 2, 2));
  const G = b.create("functiongraph", [f, 0, 2], curveStyle(C.ch4, 3));
  const A = b.create("glider", [num("e-x"), f(num("e-x")), G], handle(C.ch2));
  b.create("line", [[() => A.X() - 1, () => A.Y() - d(A.X())], A], lineStyle(C.ch2, 1.5));
  const cand = [[0, 3, "f(0) = 3 max"], [1, 2, "f(1) = 2 min"], [2, 7 / 3, "f(2) = 7/3"]].map(([x, y, t]) => [b.create("point", [x, y], dotStyle(C.ch3, 5)), label(b, x === 2 ? x - 0.42 : x + 0.05, y + 0.09, t, C.ch3)]);
  A.on("drag", () => { $("e-x").value = clamp(A.X(), 0, 2); L.st.read(); });
  return {
    read() { const x = A.X(), m = d(x); $("o-ex").textContent = x.toFixed(2); $("e-read").innerHTML = `f(${x.toFixed(2)}) = <b>${f2(f(x))}</b><br>f′ = <b>${f2(m)}</b>, ${Math.abs(m) < 0.01 ? "flat (critical point)" : m > 0 ? "rising" : "falling"}`; },
    update() { const x = num("e-x"); A.moveTo([x, f(x)]); cand.forEach(([p, t]) => { p.setAttribute({ visible: $("e-cand").checked }); t.setAttribute({ visible: $("e-cand").checked }); }); b.update(); this.read(); },
  };
}, (L) => { $("e-x").addEventListener("input", L.update); $("e-cand").addEventListener("change", L.update); });

lab(["b-mvt"], [-0.7, 2.6, -1.6, 5], ([b], L) => {
  const f = (x) => x ** 3 - 2 * x * x + x;
  const G = b.create("functiongraph", [f], curveStyle(C.ch4, 3));
  const A = b.create("glider", [num("m-a"), f(num("m-a")), G], handle(C.ch2));
  const B = b.create("glider", [num("m-b"), f(num("m-b")), G], handle(C.ch2));
  const m = () => (B.Y() - A.Y()) / (B.X() - A.X());
  b.create("segment", [A, B], segStyle(C.ch2, 2.5, 0));
  const cs = () => { const disc = 4 + 12 * m(); if (!(B.X() - A.X() > 0.05) || disc < 0) return []; return [(4 - Math.sqrt(disc)) / 6, (4 + Math.sqrt(disc)) / 6].filter((c) => c > A.X() && c < B.X()); };
  [0, 1].forEach((i) => {
    const cx = () => cs()[i];
    const Cp = P(b, () => (cx() ?? NaN), () => (cx() !== undefined ? f(cx()) : NaN), dotStyle(C.orange, 5));
    b.create("line", [[() => (cx() ?? NaN) - 1, () => (cx() !== undefined ? f(cx()) - m() : NaN)], Cp], lineStyle(C.orange, 2));
  });
  [A, B].forEach((pt) => pt.on("drag", () => { $("m-a").value = clamp(A.X(), -0.5, 2); $("m-b").value = clamp(B.X(), -0.3, 2.4); L.st.read(); }));
  return {
    read() {
      $("o-ma").textContent = A.X().toFixed(2); $("o-mb").textContent = B.X().toFixed(2);
      if (!(B.X() - A.X() > 0.05)) { $("m-read").innerHTML = "Move b to the right of a."; return; }
      const c = cs();
      $("m-read").innerHTML = `Average slope = <b>${f2(m())}</b><br>` + (c.length ? `f′(c) = ${f2(m())} at c = <b>${c.map(f2).join(" and ")}</b>` : "No c found (check a < b)");
    },
    update() { A.moveTo([num("m-a"), f(num("m-a"))]); B.moveTo([num("m-b"), f(num("m-b"))]); b.update(); this.read(); },
  };
}, (L) => ["m-a", "m-b"].forEach((id) => $(id).addEventListener("input", L.update)));

lab(["b-sign"], [-0.3, 1.6, -0.35, 0.6], ([b], L) => {
  const f = (x) => x ** 3 - 2 * x * x + x, d = (x) => (3 * x - 1) * (x - 1);
  b.create("functiongraph", [f, -1, 1 / 3], curveStyle(C.ch1, 3));
  b.create("functiongraph", [f, 1 / 3, 1], curveStyle(C.ch4, 3));
  b.create("functiongraph", [f, 1, 3], curveStyle(C.ch1, 3));
  const all = b.create("functiongraph", [f, -0.3, 1.6], { strokeOpacity: 0, highlight: false, fixed: true });
  const T = b.create("glider", [0.1, f(0.1), all], handle(C.text));
  b.create("line", [[() => T.X() - 1, () => T.Y() - d(T.X())], T], lineStyle(C.text, 1.5, 2));
  const ext = [b.create("point", [1 / 3, 4 / 27], dotStyle(C.ch3, 5)), b.create("point", [1, 0], dotStyle(C.ch3, 5)),
    label(b, 0.18, 0.2, "local max (1/3, 4/27)", C.ch3), label(b, 1.03, -0.06, "local min (1, 0)", C.ch3)];
  let out = $("g-read");
  if (!out) { out = document.createElement("p"); out.className = "readout"; out.id = "g-read"; $("g-ext").closest("label").after(out); }
  T.on("drag", () => L.st.read());
  return {
    read() { const x = T.X(), s = d(x); out.innerHTML = `test point x = <b>${f2(x)}</b>: f′(x) = <b>${f3(s)}</b> → ${Math.abs(s) < 0.01 ? "critical point" : s > 0 ? "increasing ↗" : "decreasing ↘"}`; },
    update() { ext.forEach((e) => e.setAttribute({ visible: $("g-ext").checked })); b.update(); this.read(); },
  };
}, (L) => $("g-ext").addEventListener("change", L.update));

/* ---------- chapter tabs ---------- */
document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  const ch = tab.dataset.ch;
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
  document.querySelectorAll(".chapter").forEach((c) => { c.hidden = c.dataset.ch !== ch; });
}));

// for tests
window.__labs = labs;
