// The 12 interactive labs. Each lab owns one or two Plots and a draw() that reads its controls.
import { Plot, COLORS as C } from "./plot.js";

const $ = (id) => document.getElementById(id);
const num = (id) => parseFloat($(id).value);
const f2 = (v) => (Math.abs(v) < 5e-5 ? 0 : v).toFixed(2);
const f4 = (v) => (Math.abs(v) < 5e-7 ? 0 : v).toFixed(4);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Register a lab: redraw on input and whenever its canvases change size (tab switch, resize).
function lab(plots, draw, inputs = []) {
  const redraw = () => draw();
  inputs.forEach((id) => $(id).addEventListener("input", redraw));
  const ro = new ResizeObserver(() => { plots.forEach((p) => p.resize()); redraw(); });
  plots.forEach((p) => ro.observe(p.c));
  return redraw;
}

/* ---------- Chapter 1 ---------- */

{
  const bases = {
    sq: { f: (x) => x * x, name: "x²" },
    abs: { f: (x) => Math.abs(x), name: "|x|" },
    sin: { f: Math.sin, name: "sin x" },
    sqrt: { f: (x) => (x >= 0 ? Math.sqrt(x) : NaN), name: "√x" },
  };
  const p = new Plot($("c-transform"), { xmin: -6, xmax: 6, ymin: -5, ymax: 5 });
  lab([p], () => {
    const a = num("t-a"), b = num("t-b"), h = num("t-h"), k = num("t-k");
    const base = bases[$("t-base").value];
    ["a", "b", "h", "k"].forEach((n) => ($("o-" + n).textContent = num("t-" + n)));
    p.clear();
    p.fn(base.f, { color: C.muted, width: 2, dash: [5, 5], alpha: 0.7 });
    p.fn((x) => a * base.f(b * (x - h)) + k, { color: C.ch1, width: 3 });
    const sign = (v, s) => (v === 0 ? "" : v > 0 ? ` − ${v}` : ` + ${-v}`);
    $("t-formula").textContent = `y = ${a}·f(${b}(x${sign(h)}))${k === 0 ? "" : k > 0 ? " + " + k : " − " + -k},  f(x) = ${base.name}`;
  }, ["t-a", "t-b", "t-h", "t-k", "t-base"]);
}

{
  const p = new Plot($("c-inverse"), { xmin: -3, xmax: 5, ymin: -3, ymax: 5 });
  lab([p], () => {
    const a = num("i-a"), ea = Math.exp(a);
    $("o-ia").textContent = a.toFixed(2);
    p.clear();
    p.fn((x) => x, { color: C.muted, width: 1.5, dash: [6, 6] });
    p.fn(Math.exp, { color: C.ch1, width: 3 });
    p.fn((x) => (x > 0 ? Math.log(x) : NaN), { color: C.brand, width: 3, from: 0.001 });
    p.seg(a, ea, ea, a, { color: C.text, width: 1.5, dash: [3, 4], alpha: 0.8 });
    p.dot(a, ea, C.ch1); p.dot(ea, a, C.brand);
    p.label("e^x", 1.25, Math.exp(1.25), { color: C.ch1 });
    p.label("ln x", 4.2, Math.log(4.2), { color: C.brand, dy: -10 });
    $("i-read").innerHTML = `On e^x: <b>(${a.toFixed(2)}, ${ea.toFixed(2)})</b><br>On ln x: <b>(${ea.toFixed(2)}, ${a.toFixed(2)})</b>`;
  }, ["i-a"]);
}

/* ---------- Chapter 2 ---------- */

{
  const f = (x) => (x * x - 5 * x + 6) / (x - 2);
  const p = new Plot($("c-hole"), { xmin: -0.5, xmax: 4.5, ymin: -3.5, ymax: 1.5 });
  lab([p], () => {
    const d = Math.pow(10, num("h-d"));
    $("o-d").textContent = d < 0.01 ? d.toExponential(1) : d.toFixed(3);
    p.clear();
    p.fn(f, { color: C.ch2, width: 3 });
    p.seg(2, -3.5, 2, 1.5, { color: C.muted, width: 1, dash: [4, 6], alpha: 0.6 });
    p.dot(2 - d, f(2 - d), C.brand, { r: 5 });
    p.dot(2 + d, f(2 + d), C.ch3, { r: 5 });
    p.dot(2, -1, C.ch2, { r: 6, open: true, glow: false });
    p.label("limit = −1, but f(2) is undefined", 2, -1, { color: C.muted, dx: 12, dy: 18, size: 11 });
    const rows = [d, d / 10, d / 100].map((e) =>
      `<tr><td>${f4(2 - e)}</td><td>${f4(f(2 - e))}</td><td>${f4(2 + e)}</td><td>${f4(f(2 + e))}</td></tr>`).join("");
    $("h-table").innerHTML = `<tr><th>x ← 2</th><th>f(x)</th><th>x → 2</th><th>f(x)</th></tr>${rows}`;
  }, ["h-d"]);
}

{
  const p = new Plot($("c-piece"), { xmin: -2.5, xmax: 2.5, ymin: -2.6, ymax: 1.6 });
  lab([p], () => {
    const c = num("p-c");
    $("o-c").textContent = c;
    p.clear();
    p.fn((x) => x - 1, { color: C.ch2, width: 3, to: -0.001 });
    p.fn((x) => Math.cos(Math.PI - x), { color: C.brand, width: 3, from: 0.001 });
    const ok = c === -1;
    if (!ok) p.dot(0, -1, C.text, { r: 6, open: true, glow: false });
    p.dot(0, c, ok ? C.ch1 : C.ch4, { r: 6 });
    $("p-read").innerHTML = `Left limit: <b>−1</b><br>Right limit: <b>cos π = −1</b><br>f(0) = <b>${c}</b><br>` +
      (ok ? `<b>Continuous at 0</b>: all three match.` : `<b>Not continuous</b>: f(0) ≠ the limit (removable discontinuity).`);
  }, ["p-c"]);
}

{
  const p = new Plot($("c-secant"), { xmin: -1.5, xmax: 3.6, ymin: -1.5, ymax: 9 });
  let anim = null;
  const draw = lab([p], () => {
    let h = num("s-h");
    if (Math.abs(h) < 0.005) h = h < 0 ? -0.005 : 0.005;
    $("o-sh").textContent = h.toFixed(3);
    const a = 1, m = ((a + h) ** 2 - 1) / h;
    p.clear();
    p.line(1, 1, 2, { color: C.text, width: 1.5, dash: [5, 6], alpha: 0.5 });
    p.fn((x) => x * x, { color: C.ch2, width: 3 });
    p.line(1, 1, m, { color: C.brand, width: 2.5 });
    p.dot(1, 1, C.ch2); p.dot(1 + h, (1 + h) ** 2, C.brand);
    p.label("P(1, 1)", 1, 1, { dx: 10, dy: 18 });
    $("s-read").innerHTML = `Secant slope = (f(1+h) − f(1)) / h = <b>${m.toFixed(3)}</b><br>Tangent slope (h → 0) = <b>2</b>`;
  }, ["s-h"]);
  $("s-play").addEventListener("click", () => {
    cancelAnimationFrame(anim);
    const start = num("s-h") || 1.5, t0 = performance.now(), dur = reduceMotion ? 0 : 2500;
    const step = (t) => {
      const k = dur ? Math.min(1, (t - t0) / dur) : 1;
      $("s-h").value = start * Math.pow(1 - k, 3) + (start > 0 ? 0.005 : -0.005) * k;
      draw();
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  });
}

{
  const p = new Plot($("c-squeeze"), { xmin: -1.2, xmax: 1.2, ymin: -1.9, ymax: 1.9 });
  lab([p], () => {
    const z = num("q-z"), s = 1.2 * Math.pow(10, -z);
    $("o-z").textContent = Math.round(Math.pow(10, z)) + "×";
    p.v = { xmin: -s, xmax: s, ymin: -1.3 * s * s, ymax: 1.3 * s * s };
    p.clear();
    p.fn((x) => x * x, { color: C.ch2, width: 2, dash: [6, 5] });
    p.fn((x) => -x * x, { color: C.ch2, width: 2, dash: [6, 5] });
    p.fn((x) => x * x * Math.cos(1 / x), { color: C.brand, width: 2 });
    p.dot(0, 0, C.ch1, { r: 5 });
  }, ["q-z"]);
}

/* ---------- Chapter 3 ---------- */

{
  const fns = {
    cubic: { f: (x) => x ** 3 - 2 * x * x + x, d: (x) => 3 * x * x - 4 * x + 1, x: [-1, 2.5], y: [-4.5, 6], dy: [-1.5, 10], name: "x³ − 2x² + x", dn: "3x² − 4x + 1" },
    sin: { f: Math.sin, d: Math.cos, x: [-6.3, 6.3], y: [-1.6, 1.6], dy: [-1.6, 1.6], name: "sin x", dn: "cos x" },
    exp: { f: Math.exp, d: Math.exp, x: [-3, 2], y: [-0.6, 7.5], dy: [-0.6, 7.5], name: "e^x", dn: "e^x" },
    ln: { f: (x) => (x > 0 ? Math.log(x) : NaN), d: (x) => (x > 0 ? 1 / x : NaN), x: [0.1, 5], y: [-3, 2], dy: [-0.5, 6], name: "ln x", dn: "1/x" },
  };
  const top = new Plot($("c-f"), { xmin: -1, xmax: 2.5, ymin: -1, ymax: 1 });
  const bot = new Plot($("c-fp"), { xmin: -1, xmax: 2.5, ymin: -1, ymax: 1 });
  const slider = $("d-x");
  const setRange = () => {
    const F = fns[$("d-fn").value];
    slider.min = F.x[0]; slider.max = F.x[1];
    slider.value = Math.min(Math.max(num("d-x"), F.x[0]), F.x[1]);
  };
  const draw = lab([top, bot], () => {
    const F = fns[$("d-fn").value], x = num("d-x"), y = F.f(x), m = F.d(x);
    $("o-dx").textContent = x.toFixed(2);
    top.v = { xmin: F.x[0] - 0.2, xmax: F.x[1] + 0.2, ymin: F.y[0], ymax: F.y[1] };
    bot.v = { xmin: F.x[0] - 0.2, xmax: F.x[1] + 0.2, ymin: F.dy[0], ymax: F.dy[1] };
    top.clear(); bot.clear();
    top.fn(F.f, { color: C.ch3, width: 3 });
    top.line(x, y, m, { color: C.brand, width: 2 });
    top.dot(x, y, C.ch3);
    top.label("f(x) = " + F.name, F.x[0] - 0.1, F.y[1], { dx: 6, dy: 22, color: C.ch3 });
    bot.fn(F.d, { color: C.brand, width: 3 });
    bot.seg(x, 0, x, m, { color: C.brand, width: 1.5, dash: [3, 4] });
    bot.dot(x, m, C.brand);
    bot.label("f′(x) = " + F.dn, F.x[0] - 0.1, F.dy[1], { dx: 6, dy: 22, color: C.brand });
    $("d-read").innerHTML = `f(${x.toFixed(2)}) = <b>${f2(y)}</b><br>slope f′(${x.toFixed(2)}) = <b>${f2(m)}</b>`;
  }, ["d-x"]);
  $("d-fn").addEventListener("change", () => { setRange(); draw(); });
  const drag = (e) => {
    if (e.type === "pointermove" && !e.buttons) return;
    const r = top.c.getBoundingClientRect();
    const F = fns[$("d-fn").value];
    slider.value = Math.min(Math.max(top.toX(e.clientX - r.left), F.x[0]), F.x[1]);
    draw();
  };
  top.c.addEventListener("pointerdown", drag);
  top.c.addEventListener("pointermove", drag);
  setRange();
}

{
  const p = new Plot($("c-chain"), { xmin: -2.6, xmax: 2.6, ymin: -1.4, ymax: 1.4 });
  const meters = [
    { key: "g", label: "inner rate  du/dx = 2x", max: 6 },
    { key: "f", label: "outer rate  dy/du = cos(x²)", max: 1.2 },
    { key: "y", label: "total  dy/dx = product", max: 6 },
  ];
  $("ch-meters").innerHTML = meters.map((m) =>
    `<div class="meter">${m.label}: <output id="mv-${m.key}"></output><div class="bar"><i id="mb-${m.key}"></i></div></div>`).join("");
  const setBar = (key, v, max) => {
    const w = (Math.min(Math.abs(v), max) / max) * 50, bar = $("mb-" + key);
    bar.style.left = (v >= 0 ? 50 : 50 - w) + "%";
    bar.style.width = w + "%";
    $("mv-" + key).textContent = f2(v);
  };
  lab([p], () => {
    const x = num("ch-x"), u = x * x, g = 2 * x, fo = Math.cos(u), y = Math.sin(u);
    $("o-cx").textContent = x.toFixed(2);
    p.clear();
    p.fn((t) => Math.sin(t * t), { color: C.ch3, width: 3 });
    p.line(x, y, fo * g, { color: C.brand, width: 2 });
    p.dot(x, y, C.ch3);
    setBar("g", g, 6); setBar("f", fo, 1.2); setBar("y", fo * g, 6);
  }, ["ch-x"]);
}

{
  const F = (x, y) => x * x + 2 * y ** 3 - 3 * x * y;
  const p = new Plot($("c-implicit"), { xmin: -1.5, xmax: 2.5, ymin: -1.5, ymax: 2 });
  lab([p], () => {
    p.clear();
    p.implicit(F, { color: C.ch3, width: 3 });
    if ($("im-tan").checked) {
      p.line(1, 1, 1 / 3, { color: C.brand, width: 2.5 });
      p.label("slope 1/3", 1, 1, { color: C.brand, dx: 12, dy: 22 });
    }
    p.dot(1, 1, C.brand);
    p.label("(1, 1)", 1, 1, { dx: -48, dy: -8 });
  }, ["im-tan"]);
}

/* ---------- Chapter 4 ---------- */

{
  const f = (x) => (x * x + 3) / (1 + x);
  const d = (x) => ((x + 3) * (x - 1)) / (1 + x) ** 2;
  const p = new Plot($("c-extrema"), { xmin: -0.3, xmax: 2.3, ymin: 1.6, ymax: 3.4 });
  lab([p], () => {
    const x = num("e-x"), y = f(x), m = d(x);
    $("o-ex").textContent = x.toFixed(2);
    p.clear();
    p.band(0, 2, C.ch4, 0.08);
    p.fn(f, { color: C.muted, width: 2, alpha: 0.5 });
    p.fn(f, { color: C.ch4, width: 3, from: 0, to: 2 });
    p.line(x, y, m, { color: C.brand, width: 1.5, alpha: 0.8 });
    p.dot(x, y, C.brand);
    if ($("e-cand").checked) {
      [[0, 3, "f(0) = 3  max"], [1, 2, "f(1) = 2  min"], [2, 7 / 3, "f(2) = 7/3"]].forEach(([cx, cy, t]) => {
        p.dot(cx, cy, C.ch3, { r: 6 });
        p.label(t, cx, cy, { color: C.ch3, align: cx === 2 ? "right" : "left", dx: cx === 2 ? -8 : 8, dy: cx === 1 ? 22 : -8 });
      });
    }
    const dir = Math.abs(m) < 0.01 ? "flat (critical point)" : m > 0 ? "rising" : "falling";
    $("e-read").innerHTML = `f(${x.toFixed(2)}) = <b>${f2(y)}</b><br>f′ = <b>${f2(m)}</b>, ${dir}`;
  }, ["e-x", "e-cand"]);
}

{
  const f = (x) => x ** 3 - 2 * x * x + x;
  const p = new Plot($("c-mvt"), { xmin: -0.7, xmax: 2.6, ymin: -1.6, ymax: 5 });
  lab([p], () => {
    const a = num("m-a"), b = num("m-b");
    $("o-ma").textContent = a.toFixed(2); $("o-mb").textContent = b.toFixed(2);
    p.clear();
    p.fn(f, { color: C.ch4, width: 3 });
    if (b - a < 0.05) { $("m-read").innerHTML = "Move b to the right of a."; return; }
    p.band(a, b, C.ch4, 0.07);
    const m = (f(b) - f(a)) / (b - a);
    p.line(a, f(a), m, { color: C.brand, width: 1.5, dash: [6, 6], alpha: 0.5 });
    p.seg(a, f(a), b, f(b), { color: C.brand, width: 2.5 });
    p.dot(a, f(a), C.brand); p.dot(b, f(b), C.brand);
    const disc = 4 + 12 * m;
    const cs = disc < 0 ? [] : [(4 - Math.sqrt(disc)) / 6, (4 + Math.sqrt(disc)) / 6].filter((c) => c > a && c < b);
    cs.forEach((c) => { p.line(c, f(c), m, { color: C.orange, width: 2 }); p.dot(c, f(c), C.orange); });
    $("m-read").innerHTML = `Average slope = <b>${f2(m)}</b><br>` +
      (cs.length ? `f′(c) = ${f2(m)} at c = <b>${cs.map(f2).join(" and ")}</b>` : "No c found (check a < b)");
  }, ["m-a", "m-b"]);
}

{
  const f = (x) => x ** 3 - 2 * x * x + x;
  const p = new Plot($("c-sign"), { xmin: -0.3, xmax: 1.6, ymin: -0.35, ymax: 0.6 });
  lab([p], () => {
    p.clear();
    p.band(1 / 3, 1, C.ch4, 0.07);
    p.fn(f, { color: C.ch1, width: 3, to: 1 / 3 });
    p.fn(f, { color: C.ch4, width: 3, from: 1 / 3, to: 1 });
    p.fn(f, { color: C.ch1, width: 3, from: 1 });
    if ($("g-ext").checked) {
      p.dot(1 / 3, 4 / 27, C.ch3, { r: 6 });
      p.label("local max (1/3, 4/27)", 1 / 3, 4 / 27, { color: C.ch3, dx: -10, align: "center", dy: -12 });
      p.dot(1, 0, C.ch3, { r: 6 });
      p.label("local min (1, 0)", 1, 0, { color: C.ch3, dy: 24 });
    }
  }, ["g-ext"]);
}

/* ---------- Chapter tabs ---------- */

document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
  const ch = tab.dataset.ch;
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
  document.querySelectorAll(".chapter").forEach((c) => {
    const show = c.dataset.ch === ch;
    c.hidden = !show;
    c.classList.toggle("show", show);
  });
}));
