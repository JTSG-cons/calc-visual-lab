// Small animation helpers. Everything respects "reduce motion".
export const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // easeInOutCubic

// Animate a range input from its current value along `path(t)` (t: 0..1, returns 0..1 of the range).
// mode "once" plays 0→1; "pingpong" plays 0→1→0. Returns a stop function.
export function animateRange(input, { path = (t) => t, dur = 5000, mode = "once", onFrame, onEnd } = {}) {
  const min = parseFloat(input.min || 0), max = parseFloat(input.max || 100);
  let raf = 0, t0 = 0, stopped = false;
  const total = mode === "pingpong" ? dur * 2 : dur;
  const step = (now) => {
    if (stopped) return;
    if (!t0) t0 = now;
    const u = Math.min(1, (now - t0) / total);
    const t = mode === "pingpong" ? (u < 0.5 ? u * 2 : 2 - u * 2) : u;
    input.value = min + (max - min) * path(ease(t));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    onFrame?.();
    if (u < 1) raf = requestAnimationFrame(step); else { stopped = true; onEnd?.(); }
  };
  raf = requestAnimationFrame(step);
  return () => { stopped = true; cancelAnimationFrame(raf); onEnd?.(); };
}

// Play / pause button wired to animateRange.
export function playButton(host, input, opts) {
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "play-btn"; btn.textContent = "▶ Play";
  btn.setAttribute("aria-label", "Play animation");
  let stop = null;
  const end = () => { stop = null; btn.textContent = "▶ Play"; btn.classList.remove("on"); };
  const play = () => {
    if (stop) { const s = stop; stop = null; s(); return; }
    btn.textContent = "❚❚ Pause"; btn.classList.add("on");
    stop = animateRange(input, { ...opts, onEnd: end });
  };
  btn.addEventListener("click", play);
  ["pointerdown", "keydown"].forEach((ev) => input.addEventListener(ev, () => stop && stop()));
  host.appendChild(btn);
  return { play, button: btn, get playing() { return !!stop; } };
}

// Run fn once, the first time el is mostly on screen.
export function onFirstView(el, fn, threshold = 0.55) {
  if (reduced) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { io.disconnect(); fn(); }
  }), { threshold });
  io.observe(el);
}

// Gentle fade-up for blocks as they scroll in.
export function revealOnScroll(selector) {
  if (reduced) return;
  const els = [...document.querySelectorAll(selector)];
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  els.forEach((el) => { el.classList.add("will-reveal"); io.observe(el); });
}

// Count a number up inside an element (keeps any suffix such as "/33").
export function countUp(el, to, { dur = 900, suffix = "" } = {}) {
  if (reduced || !Number.isFinite(to)) { el.textContent = to + suffix; return; }
  const t0 = performance.now();
  const step = (now) => {
    const u = Math.min(1, (now - t0) / dur);
    el.textContent = Math.round(to * ease(u)) + suffix;
    if (u < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
