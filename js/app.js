// Page behavior: menu, progress bar, active nav link, reveal on scroll, countdown, 6-day plan, KaTeX.

const EXAM = new Date(2026, 10, 11); // 11 Nov 2026, local time

const PLAN = [
  { date: new Date(2026, 10, 5), title: "Limits and continuity", when: "Thu Nov 5 · evening, 2 h", items: ["§2.3 exercises 1–32, every second one", "§2.5 continuity", "Redo exam Q3 and Q4 without notes"] },
  { date: new Date(2026, 10, 6), title: "Derivative rules", when: "Fri Nov 6 · 16:00–17:30 + 1 h", items: ["Product, quotient, chain rule drills (§3.2 #1–34, §3.4 #1–30)", "§3.6 logarithmic differentiation, x^cos x type"] },
  { date: new Date(2026, 10, 7), title: "Implicit, related rates, max/min", when: "Sat Nov 7 · morning 2.5 h + afternoon 2 h", items: ["§3.5 implicit differentiation (exam Q6)", "§3.9 related rates", "§4.1 absolute max/min on [a, b] (exam Q7)"] },
  { date: new Date(2026, 10, 8), title: "MVT and the shape of a graph", when: "Sun Nov 8 · about 3 h", items: ["§4.2 Mean Value Theorem", "§4.3 critical points, increasing/decreasing (exam Q8)", "§4.4 L'Hôpital and §4.7 optimization if confirmed"] },
  { date: new Date(2026, 10, 9), title: "Chapter 1 + mock exam 1", when: "Mon Nov 9", items: ["1 h: domain, inverses, log rules", "Evening: last year's paper, 120 min, closed book"] },
  { date: new Date(2026, 10, 10), title: "Fix mistakes + mock exam 2", when: "Tue Nov 10", items: ["Redo every mistake from the mock", "Second practice paper", "Formula sheet only, then sleep by 23:00"] },
  { date: EXAM, title: "Exam day", when: "Wed Nov 11", items: ["Breakfast", "10 minutes with the formula sheet", "No new topics"], exam: true },
];

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function countdown() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((EXAM - today) / 86400000);
  const b = document.getElementById("days-left"), l = document.getElementById("days-label");
  if (days > 1) { b.textContent = days; l.textContent = "days to the exam · Nov 11"; }
  else if (days === 1) { b.textContent = "1"; l.textContent = "day to the exam · tomorrow"; }
  else if (days === 0) { b.textContent = "Today"; l.textContent = "is exam day. You've got this."; }
  else { b.textContent = "Done"; l.textContent = "exam finished on Nov 11"; }
}

function plan() {
  const saved = JSON.parse(localStorage.getItem("cvl-plan") || "{}");
  const today = new Date();
  const host = document.getElementById("days");
  PLAN.forEach((d, i) => {
    const el = document.createElement("article");
    el.className = "day reveal" + (d.exam ? " exam" : "") + (sameDay(d.date, today) ? " today" : "") + (saved[i] ? " done" : "");
    el.innerHTML = `<h3>${d.title}</h3><p class="when">${d.when}</p><ul>${d.items.map((t) => `<li>${t}</li>`).join("")}</ul>` +
      (d.exam ? "" : `<label><input type="checkbox" ${saved[i] ? "checked" : ""}> Done</label>`);
    const box = el.querySelector("input");
    if (box) box.addEventListener("change", () => {
      saved[i] = box.checked;
      localStorage.setItem("cvl-plan", JSON.stringify(saved));
      el.classList.toggle("done", box.checked);
    });
    host.appendChild(el);
  });
}

function nav() {
  const btn = document.getElementById("menu-btn"), menu = document.getElementById("nav");
  btn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
    menu.classList.remove("open"); btn.setAttribute("aria-expanded", false);
  }));
  const links = [...menu.querySelectorAll("a")];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => io.observe(s));

  const bar = document.getElementById("progress-bar");
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function reveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

function math() {
  const run = () => window.renderMathInElement && renderMathInElement(document.body, {
    delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "$$", right: "$$", display: true }],
    throwOnError: false,
  });
  if (window.renderMathInElement) run();
  else addEventListener("load", run);
}

document.getElementById("print-sheet").addEventListener("click", () => print());

countdown();
plan();
nav();
reveal();
math();
