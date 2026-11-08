// Home page: theme, Today dashboard, 6-day plan, menu, progress bar, KaTeX, print.
import { initTheme } from "./theme.js";

const EXAM = new Date(2026, 10, 11); // 11 Nov 2026, local time
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };

const PLAN = [
  { date: new Date(2026, 10, 5), title: "Limits and continuity", when: "Thu Nov 5 · evening, 2 h", items: ["§2.3 exercises 1–32, every second one", "§2.5 continuity", "Redo exam Q3 and Q4 without notes"] },
  { date: new Date(2026, 10, 6), title: "Derivative rules", when: "Fri Nov 6 · 16:00–17:30 + 1 h", items: ["Product, quotient, chain rule drills (§3.2 #1–34, §3.4 #1–30)", "§3.6 logarithmic differentiation, x^cos x type"] },
  { date: new Date(2026, 10, 7), title: "Implicit, related rates, max/min", when: "Sat Nov 7 · morning 2.5 h + afternoon 2 h", items: ["§3.5 implicit differentiation (exam Q6)", "§3.9 related rates", "§4.1 absolute max/min on [a, b] (exam Q7)"] },
  { date: new Date(2026, 10, 8), title: "MVT and the shape of a graph", when: "Sun Nov 8 · about 3 h", items: ["§4.2 Mean Value Theorem", "§4.3 critical points, increasing/decreasing (exam Q8)", "§4.4 L'Hôpital and §4.7 optimization if confirmed"] },
  { date: new Date(2026, 10, 9), title: "Chapter 1 + mock exam 1", when: "Mon Nov 9", items: ["1 h: domain, inverses, log rules", "Evening: last year's paper, 120 min, closed book"] },
  { date: new Date(2026, 10, 10), title: "Fix mistakes + mock exam 2", when: "Tue Nov 10", items: ["Clear everything in Review due", "Book-level mock exam (60 min)", "Formula sheet only, then sleep by 23:00"] },
  { date: EXAM, title: "Exam day", when: "Wed Nov 11", items: ["Breakfast", "10 minutes with the formula sheet", "No new topics"], exam: true },
];

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const $ = (id) => document.getElementById(id);

/* ---------- Today dashboard ---------- */
function dashboard() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((EXAM - today) / 86400000);
  $("days-left").textContent = days > 0 ? days : days === 0 ? "Today" : "Done";
  $("days-label").textContent = days > 1 ? "days to the exam · Wed 11 Nov" : days === 1 ? "day to the exam · tomorrow" : days === 0 ? "is exam day. Good luck." : "the exam was on 11 Nov";

  let item = PLAN.find((d) => sameDay(d.date, today)), lbl = "Today's plan";
  if (!item && today < PLAN[0].date) { item = PLAN[0]; lbl = "Plan starts"; }
  if (!item) { item = PLAN[PLAN.length - 1]; lbl = "Exam day"; }
  $("today-box").innerHTML = `<p class="lbl">${lbl} · ${item.when}</p><h3>${item.title}</h3><ul>${item.items.map((t) => `<li>${t}</li>`).join("")}</ul>`;

  // practice accuracy by chapter
  const pr = read("cvl-practice", {});
  const byCh = { 1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [0, 0] };
  Object.entries(pr.topic || {}).forEach(([t, v]) => { const c = t[0]; if (byCh[c]) { byCh[c][0] += v.right; byCh[c][1] += v.seen; } });
  const names = { 1: "Functions", 2: "Limits", 3: "Derivatives", 4: "Applications" };
  $("acc").innerHTML = Object.entries(byCh).map(([c, [r, n]]) => {
    const pct = n ? Math.round((100 * r) / n) : 0;
    return `<li><span>Ch ${c} · ${names[c]}</span><span class="num">${n ? `${r}/${n} · ${pct}%` : "not started"}</span><span class="bar"><i style="width:${pct}%"></i></span></li>`;
  }).join("");
  $("st-answered").textContent = (pr.total && pr.total.seen) || 0;

  // reviews due (FSRS store written by practice.js)
  const fs = read("cvl-fsrs", { cards: {} }), now = Date.now();
  const due = Object.values(fs.cards || {}).filter((c) => new Date(c.card.due).getTime() <= now).length;
  $("due-n").textContent = due; $("st-due").textContent = due;
  $("review-btn").hidden = due === 0;

  // lessons understood + continue
  const learned = read("cvl-learn", {});
  const nLearned = Object.values(learned).filter(Boolean).length;
  $("st-lessons").textContent = `${nLearned}/33`;
  fetch("learn.html").then((r) => r.text()).then((html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const next = [...doc.querySelectorAll(".lesson")].find((l) => !learned[l.id]);
    if (!next) { $("continue-btn").textContent = "All lessons done · start a mock exam"; $("continue-btn").href = "#practice"; return; }
    $("continue-btn").textContent = `Continue: §${next.dataset.num} ${next.querySelector("h3").textContent}`;
    $("continue-btn").href = `learn.html#${next.id}`;
  }).catch(() => {});
}

/* ---------- 6-day plan ---------- */
function plan() {
  const saved = read("cvl-plan", {});
  const today = new Date();
  const host = $("days");
  PLAN.forEach((d, i) => {
    const el = document.createElement("article");
    el.className = "day" + (d.exam ? " exam" : "") + (sameDay(d.date, today) ? " today" : "") + (saved[i] ? " done" : "");
    el.innerHTML = `<h3>${d.title}</h3><p class="when">${d.when}</p><ul>${d.items.map((t) => `<li>${t}</li>`).join("")}</ul>` +
      (d.exam ? "" : `<label><input type="checkbox" ${saved[i] ? "checked" : ""}> Done</label>`);
    el.querySelector("input")?.addEventListener("change", (e) => {
      saved[i] = e.target.checked;
      try { localStorage.setItem("cvl-plan", JSON.stringify(saved)); } catch {}
      el.classList.toggle("done", e.target.checked);
    });
    host.appendChild(el);
  });
}

/* ---------- navigation ---------- */
function nav() {
  const btn = $("menu-btn"), menu = $("nav");
  btn.addEventListener("click", () => { const o = menu.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { menu.classList.remove("open"); btn.setAttribute("aria-expanded", false); }));
  const links = [...menu.querySelectorAll('a[href^="#"]')];
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));
  const bar = $("progress-bar");
  const onScroll = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%"; };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
}

function math() {
  const run = () => window.renderMathInElement && renderMathInElement(document.body, {
    delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "$$", right: "$$", display: true }], throwOnError: false,
  });
  if (window.renderMathInElement) run(); else addEventListener("load", run);
}

initTheme();
$("print-sheet").addEventListener("click", () => print());
dashboard();
addEventListener("practice-updated", dashboard);
plan();
nav();
math();
