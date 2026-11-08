// Paper / chalkboard theme: Auto (follows the system) → Paper → Chalk.
// Fires a "themechange" event so canvases and JSXGraph boards can repaint.
import { refreshColors } from "./plot.js";

const KEY = "cvl-theme";
const ORDER = ["auto", "light", "dark"];
const NAMES = { auto: "Auto", light: "Paper", dark: "Chalk" };
const get = () => { try { return localStorage.getItem(KEY) || "auto"; } catch { return "auto"; } };

function apply(mode) {
  if (mode === "auto") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = mode;
  const btn = document.getElementById("theme-btn");
  if (btn) btn.textContent = `Theme: ${NAMES[mode]}`;
  refreshColors();
  dispatchEvent(new Event("themechange"));
}

export function initTheme() {
  apply(get());
  document.getElementById("theme-btn")?.addEventListener("click", () => {
    const next = ORDER[(ORDER.indexOf(get()) + 1) % ORDER.length];
    try { localStorage.setItem(KEY, next); } catch {}
    apply(next);
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (get() === "auto") apply("auto"); });
}

export const isDark = () => {
  const m = get();
  return m === "dark" || (m === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
};
