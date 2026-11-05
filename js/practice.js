// Practice engine: random question generators for chapters 1–4, answer checking,
// hints, worked solutions, a timed mock exam, mastery tracking and a mistake log.

/* ---------- safe expression parser (numbers only, no eval) ---------- */
// Accepts: 1/3, -0.25, 2^3, sqrt(2), pi, e, ln(2), (1+2)/3, 3pi/2
function parseNum(src) {
  const s = String(src).toLowerCase().replace(/\s+/g, "").replace(/−/g, "-").replace(/π/g, "pi").replace(/√/g, "sqrt");
  if (!s) return NaN;
  let i = 0;
  const peek = () => s[i];
  const fns = { sqrt: Math.sqrt, ln: Math.log, sin: Math.sin, cos: Math.cos, tan: Math.tan, exp: Math.exp };
  function atom() {
    if (peek() === "(") { i++; const v = expr(); if (s[i] !== ")") throw 0; i++; return v; }
    const m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
    if (m) { i += m[0].length; return parseFloat(m[0]); }
    for (const name of Object.keys(fns)) {
      if (s.startsWith(name, i)) { i += name.length; const v = atom(); return fns[name](v); }
    }
    if (s.startsWith("pi", i)) { i += 2; return Math.PI; }
    if (s[i] === "e") { i++; return Math.E; }
    throw 0;
  }
  function power() { const b = atom(); if (peek() === "^") { i++; return Math.pow(b, unary()); } return b; }
  function unary() { if (peek() === "-") { i++; return -unary(); } if (peek() === "+") { i++; return unary(); } return power(); }
  function term() {
    let v = unary();
    while (i < s.length) {
      if (peek() === "*") { i++; v *= unary(); }
      else if (peek() === "/") { i++; v /= unary(); }
      else if (/[\d(a-z.]/.test(peek())) v *= unary(); // implicit multiply: 3pi, 2sqrt(3)
      else break;
    }
    return v;
  }
  function expr() {
    let v = term();
    while (peek() === "+" || peek() === "-") { const op = s[i++]; const t = term(); v = op === "+" ? v + t : v - t; }
    return v;
  }
  try { const v = expr(); return i === s.length ? v : NaN; } catch { return NaN; }
}

const close = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b)) + 1e-9;

/* ---------- helpers ---------- */
const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const nz = (a, b) => { let v; do v = R(a, b); while (v === 0); return v; };
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function frac(n, d) { // LaTeX for n/d, reduced
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  if (d === 1) return `${n}`;
  return `${n < 0 ? "-" : ""}\\tfrac{${Math.abs(n)}}{${d}}`;
}
const sgn = (v) => (v < 0 ? `- ${-v}` : `+ ${v}`); // "+ 3" / "- 3"
const coef = (v, x = "x") => (v === 1 ? x : v === -1 ? `-${x}` : `${v}${x}`);
function poly(cs) { // [a, b, c, d] for ax^3 + bx^2 + cx + d (highest first)
  const n = cs.length - 1;
  let out = "";
  cs.forEach((c, k) => {
    if (c === 0) return;
    const p = n - k;
    const body = p === 0 ? `${Math.abs(c)}` : `${Math.abs(c) === 1 ? "" : Math.abs(c)}x${p > 1 ? "^{" + p + "}" : ""}`;
    out += out ? (c < 0 ? " - " : " + ") + body : (c < 0 ? "-" : "") + body;
  });
  return out || "0";
}

/* ---------- question generators ----------
   Each returns { q, a (number) | choices+correct, hint, steps, unit? }  (q/hint/steps use \( \) LaTeX) */
const T = {};

T["1.1 Domain"] = () => {
  const a = R(1, 9);
  return pick([
    () => ({ q: `Find the smallest number in the domain of \\(f(x)=\\sqrt{x-${a}}\\).`, a, hint: `A square root needs the inside \\(\\ge 0\\).`, steps: `\\(x-${a}\\ge0 \\Rightarrow x\\ge ${a}\\). Smallest value: \\(${a}\\).` }),
    () => ({ q: `\\(f(x)=\\dfrac{1}{x+${a}}\\) is undefined at exactly one \\(x\\). Which?`, a: -a, hint: `The denominator cannot be 0.`, steps: `\\(x+${a}=0 \\Rightarrow x=-${a}\\).` }),
    () => ({ q: `The domain of \\(f(x)=\\ln(${a}-x)\\) is \\(x<c\\). Find \\(c\\).`, a, hint: `\\(\\ln\\) needs a positive input.`, steps: `\\(${a}-x>0 \\Rightarrow x<${a}\\), so \\(c=${a}\\).` }),
  ])();
};

T["1.3 Composition"] = () => {
  const a = nz(-4, 4), b = nz(-5, 5), x = R(-3, 3);
  const inner = a * x + b;
  return { q: `\\(f(x)=x^2\\), \\(g(x)=${coef(a)} ${sgn(b)}\\). Find \\((f\\circ g)(${x})\\).`, a: inner * inner, hint: `Work inside out: first \\(g(${x})\\), then square it.`, steps: `\\(g(${x})=${a}(${x}) ${sgn(b)}=${inner}\\), then \\(f(${inner})=${inner}^2=${inner * inner}\\).` };
};

T["1.6 Inverse & logs"] = () => pick([
  () => { const a = nz(2, 6), b = R(-6, 6), y = R(-5, 10);
    return { q: `\\(f(x)=${a}x ${sgn(b)}\\). Find \\(f^{-1}(${y})\\).`, a: (y - b) / a, hint: `Solve \\(${a}x ${sgn(b)}=${y}\\) for \\(x\\).`, steps: `\\(x=\\dfrac{${y} ${sgn(-b)}}{${a}}=${frac(y - b, a)}\\).` }; },
  () => { const b = pick([2, 3, 5, 10]), k = R(2, 4);
    return { q: `Evaluate \\(\\log_{${b}} ${b ** k}\\).`, a: k, hint: `\\(${b}\\) to what power gives \\(${b ** k}\\)?`, steps: `\\(${b}^{${k}}=${b ** k}\\), so the answer is \\(${k}\\).` }; },
  () => { const a = R(2, 9);
    return { q: `Solve \\(e^{x}=${a}\\). Give \\(x\\) (you may type ln(${a})).`, a: Math.log(a), hint: `Take \\(\\ln\\) of both sides.`, steps: `\\(x=\\ln ${a}\\approx ${Math.log(a).toFixed(4)}\\).` }; },
  () => { const a = R(2, 6), b = R(2, 6);
    return { q: `Simplify \\(\\ln(e^{${a}}) + e^{\\ln ${b}}\\).`, a: a + b, hint: `\\(\\ln\\) and \\(e\\) cancel each other.`, steps: `\\(\\ln e^{${a}}=${a}\\) and \\(e^{\\ln ${b}}=${b}\\), total \\(${a + b}\\).` }; },
])();

T["2.3 Limits: factor"] = () => {
  const a = nz(-5, 5); let b; do b = nz(-6, 6); while (b === a);
  const B = -(a + b), C = a * b;
  return { q: `\\(\\displaystyle\\lim_{x\\to ${a}} \\frac{${poly([1, B, C])}}{x ${sgn(-a)}}\\)`, a: a - b, hint: `Plugging in gives 0/0. Factor the top: one factor is \\((x ${sgn(-a)})\\).`, steps: `\\(${poly([1, B, C])}=(x ${sgn(-a)})(x ${sgn(-b)})\\). Cancel, then plug in: \\(${a} ${sgn(-b)}=${a - b}\\).` };
};

T["2.3 Limits: rationalize"] = () => {
  const k = R(1, 6), c = k * k;
  return { q: `\\(\\displaystyle\\lim_{x\\to 0} \\frac{\\sqrt{x+${c}}-${k}}{x}\\)`, a: 1 / (2 * k), hint: `Multiply top and bottom by the conjugate \\(\\sqrt{x+${c}}+${k}\\).`, steps: `\\(\\dfrac{(x+${c})-${c}}{x(\\sqrt{x+${c}}+${k})}=\\dfrac{1}{\\sqrt{x+${c}}+${k}}\\to\\dfrac{1}{${2 * k}}\\).` };
};

T["2.3 Limits: plug in"] = () => {
  const a = R(-4, 4), p = nz(-3, 3), q = R(-5, 5);
  let dd; do dd = R(1, 5); while (a + dd === 0);
  return { q: `\\(\\displaystyle\\lim_{x\\to ${a}} \\frac{${coef(p)} ${sgn(q)}}{x ${sgn(dd)}}\\)`, a: (p * a + q) / (a + dd), hint: `The denominator is not 0 at \\(x=${a}\\), so just substitute.`, steps: `\\(\\dfrac{${p}(${a}) ${sgn(q)}}{${a} ${sgn(dd)}}=${frac(p * a + q, a + dd)}\\).` };
};

T["2.3 Squeeze & trig limits"] = () => pick([
  () => { const k = nz(1, 7), m = nz(1, 7);
    return { q: `\\(\\displaystyle\\lim_{x\\to0}\\frac{\\sin(${k}x)}{\\sin(${m}x)}\\)`, a: k / m, hint: `Use \\(\\lim_{t\\to0}\\frac{\\sin t}{t}=1\\) on top and bottom.`, steps: `\\(\\dfrac{\\sin ${k}x}{${k}x}\\cdot\\dfrac{${m}x}{\\sin ${m}x}\\cdot\\dfrac{${k}}{${m}}\\to ${frac(k, m)}\\).` }; },
  () => { const k = nz(2, 9);
    return { q: `\\(\\displaystyle\\lim_{x\\to0}\\frac{\\sin(${k}x)}{x}\\)`, a: k, hint: `Write it as \\(${k}\\cdot\\frac{\\sin ${k}x}{${k}x}\\).`, steps: `\\(${k}\\cdot 1=${k}\\).` }; },
  () => { const n = R(2, 4);
    return { q: `\\(\\displaystyle\\lim_{x\\to0} x^{${n}}\\cos\\!\\left(\\tfrac{1}{x}\\right)\\)`, a: 0, hint: `\\(\\cos\\) is between −1 and 1. Squeeze it.`, steps: `\\(-|x|^{${n}}\\le x^{${n}}\\cos(1/x)\\le |x|^{${n}}\\), both sides \\(\\to0\\), so the limit is 0.` }; },
])();

T["2.5 Continuity"] = () => {
  const a = nz(-4, 4), b = nz(-5, 5), c = R(-3, 3);
  const left = a * c + b;
  return { q: `Find \\(k\\) so that \\(f\\) is continuous at \\(x=${c}\\): \\(f(x)=\\begin{cases}${coef(a)} ${sgn(b)} & x<${c}\\\\ x^2+k & x\\ge ${c}\\end{cases}\\)`, a: left - c * c, hint: `Make the two pieces meet: left value at \\(${c}\\) = right value at \\(${c}\\).`, steps: `Left: \\(${a}(${c}) ${sgn(b)}=${left}\\). Right: \\(${c * c}+k\\). So \\(k=${left}-${c * c}=${left - c * c}\\).` };
};

T["2.7 Derivative definition"] = () => {
  const a = nz(-3, 3), c = nz(-4, 4);
  return { q: `Using \\(f'(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}{h}\\), find \\(f'(${a})\\) for \\(f(x)=${coef(c, "x^2")}\\).`, a: 2 * c * a, hint: `Expand \\(${c}(${a}+h)^2\\), subtract \\(f(${a})\\), divide by \\(h\\).`, steps: `\\(\\dfrac{${c}[(${a}+h)^2-${a * a}]}{h}=${c}(${2 * a}+h)\\to ${2 * c * a}\\).` };
};

T["3.1 Power rule"] = () => {
  const a = nz(-4, 5), n = R(2, 5), b = nz(-6, 6), x = nz(-2, 2);
  return { q: `\\(f(x)=${a}x^{${n}} ${sgn(b)}x\\). Find \\(f'(${x})\\).`, a: a * n * x ** (n - 1) + b, hint: `\\(\\frac{d}{dx}x^n=nx^{n-1}\\).`, steps: `\\(f'(x)=${a * n}x^{${n - 1}} ${sgn(b)}\\), so \\(f'(${x})=${a * n}(${x})^{${n - 1}} ${sgn(b)}=${a * n * x ** (n - 1) + b}\\).` };
};

T["3.2 Product & quotient"] = () => pick([
  () => { const a = nz(-4, 4), x = R(-2, 2);
    return { q: `\\(f(x)=(x^2 ${sgn(a)})(x+1)\\). Find \\(f'(${x})\\).`, a: 2 * x * (x + 1) + (x * x + a), hint: `Product rule: \\((uv)'=u'v+uv'\\).`, steps: `\\(f'=2x(x+1)+(x^2 ${sgn(a)})\\). At \\(${x}\\): \\(${2 * x * (x + 1)}+${x * x + a}=${2 * x * (x + 1) + x * x + a}\\).` }; },
  () => { const a = R(1, 5), x = R(0, 3);
    return { q: `\\(f(x)=\\dfrac{x}{x+${a}}\\). Find \\(f'(${x})\\).`, a: a / (x + a) ** 2, hint: `Quotient rule: \\(\\left(\\frac uv\\right)'=\\frac{u'v-uv'}{v^2}\\).`, steps: `\\(f'=\\dfrac{(x+${a})-x}{(x+${a})^2}=\\dfrac{${a}}{(x+${a})^2}\\). At \\(${x}\\): \\(${frac(a, (x + a) ** 2)}\\).` }; },
  () => { const x = R(0, 2);
    return { q: `\\(f(x)=x e^{x}\\). Find \\(f'(${x})\\) (type e for \\(e\\)).`, a: (1 + x) * Math.exp(x), hint: `Product rule with \\(u=x\\), \\(v=e^x\\).`, steps: `\\(f'=e^x+xe^x=(1+x)e^x\\). At \\(${x}\\): \\(${1 + x}e^{${x}}\\approx${((1 + x) * Math.exp(x)).toFixed(4)}\\).` }; },
])();

T["3.3 Trig derivatives"] = () => pick([
  () => { const pts = [[0, "0"], [Math.PI / 6, "\\tfrac{\\pi}{6}"], [Math.PI / 3, "\\tfrac{\\pi}{3}"], [Math.PI / 2, "\\tfrac{\\pi}{2}"]]; const [x, s] = pick(pts);
    return { q: `\\(f(x)=x\\sin x\\). Find \\(f'(${s})\\).`, a: Math.sin(x) + x * Math.cos(x), hint: `Product rule; \\((\\sin x)'=\\cos x\\).`, steps: `\\(f'=\\sin x+x\\cos x\\). Evaluate at \\(${s}\\): \\(\\approx${(Math.sin(x) + x * Math.cos(x)).toFixed(4)}\\).` }; },
  () => { const n = R(5, 30), fs = ["\\cos x", "-\\sin x", "-\\cos x", "\\sin x"], vals = [0.5, -Math.sqrt(3) / 2, -0.5, Math.sqrt(3) / 2];
    return { q: `\\(u(x)=\\cos x\\). Find \\(u^{(${n})}\\!\\left(\\tfrac{\\pi}{3}\\right)\\).`, a: vals[n % 4], hint: `Derivatives of \\(\\cos x\\) repeat every 4. Find \\(${n} \\bmod 4\\).`, steps: `\\(${n}\\bmod4=${n % 4}\\), so \\(u^{(${n})}=${fs[n % 4]}\\). At \\(\\pi/3\\): \\(${["\\tfrac12", "-\\tfrac{\\sqrt3}{2}", "-\\tfrac12", "\\tfrac{\\sqrt3}{2}"][n % 4]}\\).` }; },
  () => { const a = nz(-4, 4);
    return { q: `\\(f(x)=${a}\\tan x\\). Find \\(f'(0)\\).`, a, hint: `\\((\\tan x)'=\\sec^2 x\\), and \\(\\sec 0=1\\).`, steps: `\\(f'(0)=${a}\\sec^2 0=${a}\\).` }; },
])();

T["3.4 Chain rule"] = () => pick([
  () => { const a = nz(-3, 3), b = nz(-4, 4), n = R(2, 4), x = R(-1, 2);
    const in_ = a * x + b;
    return { q: `\\(f(x)=(${coef(a)} ${sgn(b)})^{${n}}\\). Find \\(f'(${x})\\).`, a: n * in_ ** (n - 1) * a, hint: `Outer: \\(u^{${n}}\\to ${n}u^{${n - 1}}\\). Then multiply by the inner derivative \\(${a}\\).`, steps: `\\(f'=${n}(${coef(a)} ${sgn(b)})^{${n - 1}}\\cdot ${a}\\). At \\(${x}\\): \\(${n}(${in_})^{${n - 1}}(${a})=${n * in_ ** (n - 1) * a}\\).` }; },
  () => { const k = nz(-3, 3);
    return { q: `\\(f(x)=e^{${k}x^2}\\). Find \\(f'(1)\\) (type e for \\(e\\)).`, a: 2 * k * Math.exp(k), hint: `\\((e^{u})'=e^{u}u'\\) with \\(u=${k}x^2\\).`, steps: `\\(f'=e^{${k}x^2}\\cdot ${2 * k}x\\). At 1: \\(${2 * k}e^{${k}}\\approx${(2 * k * Math.exp(k)).toFixed(4)}\\).` }; },
  () => { const a = R(1, 4);
    return { q: `\\(f(x)=\\sin\\!\\left(\\dfrac{x-${a}}{x+${a}}\\right)\\). Find \\(f'(${a})\\).`, a: (2 * a) / (4 * a * a), hint: `Chain + quotient rule. At \\(x=${a}\\) the inside is 0, so \\(\\cos(0)=1\\).`, steps: `Inner derivative \\(\\dfrac{${2 * a}}{(x+${a})^2}\\). At \\(${a}\\): \\(\\cos 0\\cdot\\dfrac{${2 * a}}{${4 * a * a}}=${frac(2 * a, 4 * a * a)}\\).` }; },
])();

T["3.5 Implicit"] = () => pick([
  () => { const r = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10]]); const [x, y] = Math.random() < 0.5 ? [r[0], r[1]] : [r[1], r[0]];
    return { q: `Find the slope of the tangent to \\(x^2+y^2=${r[2] ** 2}\\) at \\((${x},${y})\\).`, a: -x / y, hint: `Differentiate: \\(2x+2yy'=0\\).`, steps: `\\(y'=-\\dfrac{x}{y}=${frac(-x, y)}\\).` }; },
  () => ({ q: `Find \\(y'\\) at \\((1,1)\\) for \\(x^2+2y^3=3xy\\) (last year's Q6).`, a: 1 / 3, hint: `\\(2x+6y^2y'=3y+3xy'\\). Collect the \\(y'\\) terms.`, steps: `\\(y'=\\dfrac{3y-2x}{6y^2-3x}=\\dfrac{1}{3}\\) at \\((1,1)\\).` }),
  () => { const a = R(2, 6);
    return { q: `Find \\(y'\\) at \\((1,${a})\\) for \\(xy=${a}\\).`, a: -a, hint: `Product rule: \\(y+xy'=0\\).`, steps: `\\(y'=-\\dfrac{y}{x}=-${a}\\).` }; },
])();

T["3.6 Log differentiation"] = () => pick([
  () => { const a = R(2, 9);
    return { q: `\\(f(x)=\\ln(${a}x)\\). Find \\(f'(2)\\).`, a: 0.5, hint: `\\(\\ln(${a}x)=\\ln ${a}+\\ln x\\).`, steps: `\\(f'=\\dfrac{1}{x}\\), so \\(f'(2)=\\tfrac12\\). The ${a} disappears.` }; },
  () => { const a = R(1, 5), x = R(0, 3);
    return { q: `\\(f(x)=\\ln(x^2+${a})\\). Find \\(f'(${x})\\).`, a: (2 * x) / (x * x + a), hint: `\\((\\ln u)'=\\dfrac{u'}{u}\\).`, steps: `\\(f'=\\dfrac{2x}{x^2+${a}}\\). At \\(${x}\\): \\(${frac(2 * x, x * x + a)}\\).` }; },
  () => ({ q: `\\(f(x)=x^{x}\\). Find \\(f'(1)\\).`, a: 1, hint: `Take logs: \\(\\ln y=x\\ln x\\), then differentiate.`, steps: `\\(\\dfrac{y'}{y}=\\ln x+1\\), so \\(y'=x^x(\\ln x+1)\\). At 1: \\(1\\cdot(0+1)=1\\).` }),
  () => ({ q: `\\(f(x)=x^{\\cos x}\\) (last year's Q5). Find \\(f'(\\pi)\\). Hint: answer involves π.`, a: Math.pow(Math.PI, -1) * (-Math.sin(Math.PI) * Math.log(Math.PI) + Math.cos(Math.PI) / Math.PI), hint: `\\(\\ln y=\\cos x\\ln x\\Rightarrow \\frac{y'}{y}=-\\sin x\\ln x+\\frac{\\cos x}{x}\\).`, steps: `At \\(\\pi\\): \\(y=\\pi^{-1}\\), and \\(\\frac{y'}{y}=0-\\frac1\\pi\\). So \\(y'=-\\dfrac{1}{\\pi^2}\\approx-0.1013\\).` }),
])();

T["3.9 Related rates"] = () => pick([
  () => { const r = R(2, 10), k = R(1, 5);
    return { q: `A circle's radius grows at \\(${k}\\) cm/s. How fast is the area growing (cm²/s) when \\(r=${r}\\)? Type e.g. ${2 * r * k}pi.`, a: 2 * Math.PI * r * k, hint: `\\(A=\\pi r^2\\Rightarrow \\frac{dA}{dt}=2\\pi r\\frac{dr}{dt}\\).`, steps: `\\(2\\pi(${r})(${k})=${2 * r * k}\\pi\\approx${(2 * Math.PI * r * k).toFixed(2)}\\).` }; },
  () => { const t = pick([[3, 4, 5], [6, 8, 10]]), v = R(1, 4);
    return { q: `A ${t[2]} m ladder slides down a wall. Its bottom moves away at \\(${v}\\) m/s. How fast is the top falling when the bottom is ${t[0]} m from the wall? (answer as a positive speed)`, a: (t[0] * v) / t[1], hint: `\\(x^2+y^2=${t[2] ** 2}\\Rightarrow 2xx'+2yy'=0\\). When \\(x=${t[0]}\\), \\(y=${t[1]}\\).`, steps: `\\(y'=-\\dfrac{x x'}{y}=-\\dfrac{${t[0]}\\cdot${v}}{${t[1]}}\\). Speed \\(${frac(t[0] * v, t[1])}\\) m/s.` }; },
])();

T["4.1 Absolute extrema"] = () => {
  const p = R(-2, 2); let q; do q = R(-1, 3); while (q === p);
  const [lo, hi] = [Math.min(p, q) - 1, Math.max(p, q) + 1];
  // f'(x) = 3(x-p)(x-q)  ->  f = x^3 - 1.5(p+q)x^2 + 3pq x
  const f = (x) => x ** 3 - 1.5 * (p + q) * x * x + 3 * p * q * x;
  const cand = [lo, hi, p, q];
  const vals = cand.map(f);
  const want = pick(["maximum", "minimum"]);
  const ans = want === "maximum" ? Math.max(...vals) : Math.min(...vals);
  const B = -1.5 * (p + q), C = 3 * p * q;
  return { q: `Find the absolute ${want} value of \\(f(x)=x^3 ${sgn(B)}x^2 ${sgn(C)}x\\) on \\([${lo},${hi}]\\).`, a: ans, hint: `Candidates: endpoints and critical points. \\(f'(x)=3(x ${sgn(-p)})(x ${sgn(-q)})\\).`, steps: `Critical points \\(${p}, ${q}\\). Values: ${cand.map((c, i) => `\\(f(${c})=${+vals[i].toFixed(3)}\\)`).join(", ")}. The ${want} is \\(${+ans.toFixed(3)}\\).` };
};

T["4.2 Mean Value Theorem"] = () => {
  const a = 0, b = R(1, 4), k = nz(1, 3);
  // f = k x^2  -> average slope k b, c = b/2
  return { q: `\\(f(x)=${coef(k, "x^2")}\\) on \\([0,${b}]\\). Find the \\(c\\) promised by the Mean Value Theorem.`, a: b / 2, hint: `Solve \\(f'(c)=\\dfrac{f(${b})-f(0)}{${b}-0}\\).`, steps: `Average slope \\(=${k * b}\\). \\(f'(c)=${2 * k}c=${k * b}\\Rightarrow c=${frac(b, 2)}\\).` };
};

T["4.3 Critical points & shape"] = () => {
  const p = R(-3, 1); let q; do q = R(-1, 4); while (q <= p);
  const B = -1.5 * (p + q), C = 3 * p * q;
  const kind = pick(["max", "min"]);
  return { q: `\\(f(x)=x^3 ${sgn(B)}x^2 ${sgn(C)}x\\). At which \\(x\\) does \\(f\\) have a local ${kind === "max" ? "maximum" : "minimum"}?`, a: kind === "max" ? p : q, hint: `\\(f'(x)=3(x ${sgn(-p)})(x ${sgn(-q)})\\). Check where \\(f'\\) changes sign.`, steps: `\\(f'>0\\) before \\(${p}\\), \\(<0\\) between, \\(>0\\) after \\(${q}\\). Local max at \\(${p}\\), local min at \\(${q}\\).` };
};

T["4.4 L'Hôpital"] = () => pick([
  () => { const k = nz(1, 6);
    return { q: `\\(\\displaystyle\\lim_{x\\to0}\\frac{e^{${k}x}-1}{x}\\)`, a: k, hint: `0/0. Differentiate top and bottom.`, steps: `\\(\\dfrac{${k}e^{${k}x}}{1}\\to ${k}\\).` }; },
  () => ({ q: `\\(\\displaystyle\\lim_{x\\to0}\\frac{1-\\cos x}{x^2}\\)`, a: 0.5, hint: `Use L'Hôpital twice.`, steps: `\\(\\dfrac{\\sin x}{2x}\\to\\dfrac{\\cos x}{2}\\to\\tfrac12\\).` }),
  () => { const a = R(2, 6);
    return { q: `\\(\\displaystyle\\lim_{x\\to\\infty}\\frac{${a}x^2+1}{x^2-3x}\\)`, a, hint: `Divide top and bottom by \\(x^2\\) (or L'Hôpital twice).`, steps: `Leading coefficients: \\(${a}/1=${a}\\).` }; },
])();

T["4.7 Optimization"] = () => {
  const P = pick([20, 40, 60, 80, 100]);
  return pick([
    () => ({ q: `A rectangle has perimeter ${P} m. What is the largest possible area (m²)?`, a: (P / 4) ** 2, hint: `\\(A=x\\left(\\frac{${P}}{2}-x\\right)\\). Set \\(A'=0\\).`, steps: `\\(A'=${P / 2}-2x=0\\Rightarrow x=${P / 4}\\). A square: \\(A=${(P / 4) ** 2}\\).` }),
    () => ({ q: `Two positive numbers add up to ${P}. What is the largest possible product?`, a: (P / 2) ** 2, hint: `\\(P(x)=x(${P}-x)\\).`, steps: `\\(P'=${P}-2x=0\\Rightarrow x=${P / 2}\\). Product \\(${(P / 2) ** 2}\\).` }),
  ])();
};

// Conceptual multiple choice, in the style of last year's Q1
const MC = [
  { q: `If \\(f\\) is differentiable at \\(x_0\\), which must be true?`, choices: ["The limit of f at x₀ exists", "f has a vertical asymptote at x₀", "f′ is continuous at x₀", "f(x₀) = 0"], correct: 0, steps: `Differentiable ⇒ continuous ⇒ the limit exists and equals \\(f(x_0)\\).` },
  { q: `If \\(f\\) is continuous at \\(x_0\\), which must be true?`, choices: ["f is differentiable at x₀", "The limit of f at x₀ equals f(x₀)", "f′(x₀) exists", "f is increasing near x₀"], correct: 1, steps: `That is the definition of continuity. \\(|x|\\) at 0 is continuous but not differentiable.` },
  { q: `\\(f\\) is continuous on \\([0,8]\\), \\(f(0)=10\\), \\(f(8)=30\\). Which is guaranteed?`, choices: ["f(c) = 25 for some c in (0, 8)", "f′(c) = 2 for some c", "f has its maximum at x = 8", "f(c) = 40 for some c"], correct: 0, steps: `Intermediate Value Theorem: every value between 10 and 30 is hit. 40 is outside that range.` },
  { q: `\\(f\\) is differentiable on \\([0,8]\\), \\(f(0)=10\\), \\(f(8)=30\\). The MVT guarantees \\(f'(c)=\\,?\\) for some \\(c\\).`, choices: ["2", "2.5", "20", "3.75"], correct: 1, steps: `Average slope \\(\\dfrac{30-10}{8-0}=2.5\\).` },
  { q: `If \\(\\lim_{x\\to a}f(x)\\) exists, which must be true?`, choices: ["f is continuous at a", "f(a) is defined", "The left and right limits at a are equal", "f is differentiable at a"], correct: 2, steps: `A two-sided limit exists exactly when both one-sided limits exist and agree. \\(f(a)\\) need not even be defined.` },
  { q: `\\(f'(c)=0\\) means that at \\(x=c\\)…`, choices: ["f must have a local max or min", "the tangent line is horizontal", "f is not continuous", "f(c) = 0"], correct: 1, steps: `\\(f'(c)=0\\) is a horizontal tangent. It need not be an extremum: \\(x^3\\) at 0.` },
  { q: `A continuous function on a closed interval \\([a,b]\\)…`, choices: ["always has an absolute max and min", "is always differentiable", "always has a critical point", "is always increasing"], correct: 0, steps: `Extreme Value Theorem.` },
  { q: `If \\(f'(x)>0\\) on \\((a,b)\\), then on \\((a,b)\\) \\(f\\) is…`, choices: ["decreasing", "increasing", "concave up", "constant"], correct: 1, steps: `Positive slope means the graph goes up as \\(x\\) increases (increasing/decreasing test).` },
];
T["Concepts (multiple choice)"] = () => ({ ...pick(MC), hint: "Think of a counterexample for each wrong option." });

const TOPICS = Object.keys(T);
const CHAPTER = (t) => (t.startsWith("Concepts") ? "★" : t[0]);

/* ---------- state ---------- */
const KEY = "cvl-practice";
const store = JSON.parse(localStorage.getItem(KEY) || "{}");
store.topic ??= {};      // topic -> {seen, right}
store.mistakes ??= [];   // [{topic, q, steps, ...}]
store.total ??= { seen: 0, right: 0, streak: 0, best: 0 };
const save = () => localStorage.setItem(KEY, JSON.stringify(store));

/* ---------- rendering ---------- */
const $ = (id) => document.getElementById(id);
const tex = (el) => window.renderMathInElement && renderMathInElement(el, {
  delimiters: [{ left: "\\(", right: "\\)", display: false }], throwOnError: false,
});

let mode = "topic", current = null, answered = false, mock = null;

function mastery(topic) {
  const s = store.topic[topic];
  if (!s || !s.seen) return 0;
  return Math.round((s.right / s.seen) * 100);
}

function renderTopics() {
  const host = $("pr-topics");
  host.innerHTML = TOPICS.map((t) => {
    const m = mastery(t), s = store.topic[t];
    return `<button class="pr-topic ch${CHAPTER(t) === "★" ? "" : CHAPTER(t)}" data-t="${t}">
      <span>${t}</span><small>${s ? `${s.right}/${s.seen} · ${m}%` : "not started"}</small>
      <i style="width:${m}%"></i></button>`;
  }).join("");
  host.querySelectorAll(".pr-topic").forEach((b) => b.addEventListener("click", () => {
    mode = "topic"; setMode(); next(b.dataset.t);
    $("pr-card").scrollIntoView({ behavior: "smooth", block: "center" });
  }));
  $("pr-total").textContent = `${store.total.right}/${store.total.seen} correct`;
  $("pr-streak").textContent = `streak ${store.total.streak} · best ${store.total.best}`;
  $("pr-mist-count").textContent = store.mistakes.length;
}

function show(qobj) {
  current = qobj; answered = false;
  $("pr-topic-label").textContent = qobj.topic;
  $("pr-q").innerHTML = qobj.q;
  $("pr-feedback").innerHTML = ""; $("pr-feedback").className = "pr-feedback";
  $("pr-hint-box").hidden = true; $("pr-hint-box").innerHTML = qobj.hint || "";
  $("pr-steps-box").hidden = true; $("pr-steps-box").innerHTML = qobj.steps || "";
  const isMC = Array.isArray(qobj.choices);
  $("pr-input-row").hidden = isMC;
  $("pr-choices").hidden = !isMC;
  if (isMC) {
    $("pr-choices").innerHTML = qobj.choices.map((c, i) => `<button class="pr-choice" data-i="${i}">${String.fromCharCode(65 + i)}. ${c}</button>`).join("");
    $("pr-choices").querySelectorAll(".pr-choice").forEach((b) => b.addEventListener("click", () => check(+b.dataset.i)));
  } else {
    $("pr-answer").value = ""; $("pr-answer").focus({ preventScroll: true });
  }
  $("pr-next").textContent = mock ? (mock.i + 1 < mock.qs.length ? "Next question" : "Finish exam") : "Next question";
  tex($("pr-card"));
}

function generate(topic) {
  const q = T[topic]();
  return { ...q, topic };
}

function next(topic) {
  if (mock) {
    if (mock.i + 1 >= mock.qs.length) return finishMock();
    mock.i++; $("pr-mock-pos").textContent = `Question ${mock.i + 1} of ${mock.qs.length}`;
    return show(mock.qs[mock.i]);
  }
  if (mode === "mistakes") {
    if (!store.mistakes.length) { $("pr-q").innerHTML = "No mistakes saved. Nice. Go back to topics or mixed practice."; return; }
    return show({ ...store.mistakes[0], retry: true });
  }
  const t = mode === "mixed" || !topic ? pick(TOPICS) : topic;
  show(generate(t));
}

function check(choice) {
  if (answered || !current) return;
  let ok;
  if (Array.isArray(current.choices)) {
    ok = choice === current.correct;
    $("pr-choices").querySelectorAll(".pr-choice").forEach((b, i) => {
      b.classList.toggle("right", i === current.correct);
      b.classList.toggle("wrong", i === choice && !ok);
      b.disabled = true;
    });
  } else {
    const v = parseNum($("pr-answer").value);
    if (Number.isNaN(v)) { $("pr-feedback").textContent = "I couldn't read that. Try a number like -1, 1/3, 2pi or sqrt(2)."; $("pr-feedback").className = "pr-feedback warn"; return; }
    ok = close(v, current.a);
  }
  answered = true;
  const t = current.topic;
  store.topic[t] ??= { seen: 0, right: 0 };
  if (!current.retry) { store.topic[t].seen++; store.total.seen++; }
  if (ok) {
    if (!current.retry) store.topic[t].right++;
    store.total.right += current.retry ? 0 : 1;
    store.total.streak++; store.total.best = Math.max(store.total.best, store.total.streak);
    if (current.retry) store.mistakes.shift();
  } else {
    store.total.streak = 0;
    if (!current.retry) store.mistakes.push({ topic: t, q: current.q, a: current.a, choices: current.choices, correct: current.correct, hint: current.hint, steps: current.steps });
    else store.mistakes.push(store.mistakes.shift()); // move to the back, try again later
  }
  if (mock) mock.right += ok ? 1 : 0;
  save();
  const ans = Array.isArray(current.choices) ? current.choices[current.correct] : `\\(${+current.a.toFixed(4)}\\)`;
  $("pr-feedback").innerHTML = ok ? `✓ Correct${current.retry ? ". Removed from your mistake log." : "."}` : `✗ Not quite. The answer is ${ans}.${current.retry ? "" : " Saved to your mistake log."}`;
  $("pr-feedback").className = "pr-feedback " + (ok ? "ok" : "bad");
  if (!ok || mock === null) $("pr-steps-box").hidden = ok; // show the working when wrong
  tex($("pr-feedback"));
  renderTopics();
}

/* ---------- mock exam ---------- */
const MOCK_PLAN = ["Concepts (multiple choice)", "Concepts (multiple choice)", "2.3 Limits: plug in", "2.3 Squeeze & trig limits", "3.3 Trig derivatives",
  "2.5 Continuity", "2.3 Limits: factor", "2.3 Limits: rationalize", "3.4 Chain rule", "3.6 Log differentiation", "3.5 Implicit", "4.1 Absolute extrema", "4.3 Critical points & shape"];

function startMock() {
  const mins = 45;
  mock = { qs: MOCK_PLAN.map(generate), i: 0, right: 0, end: Date.now() + mins * 60000 };
  $("pr-mock-bar").hidden = false;
  $("pr-mock-pos").textContent = `Question 1 of ${mock.qs.length}`;
  setMode("mock");
  show(mock.qs[0]);
  const tick = () => {
    if (!mock) return;
    const left = Math.max(0, mock.end - Date.now());
    $("pr-mock-time").textContent = `${Math.floor(left / 60000)}:${String(Math.floor((left % 60000) / 1000)).padStart(2, "0")} left`;
    if (left <= 0) return finishMock();
    setTimeout(tick, 1000);
  };
  tick();
}

function finishMock() {
  const { right, qs } = mock;
  mock = null;
  $("pr-mock-bar").hidden = true;
  const pct = Math.round((right / qs.length) * 100);
  $("pr-q").innerHTML = `<b>Mock exam finished: ${right}/${qs.length} (${pct}%).</b><br>${pct >= 85 ? "Exam-ready. Keep it warm with mixed practice." : pct >= 60 ? "Close. Clear your mistake log, then try another mock." : "Go topic by topic on the weakest bars below, then retry."}`;
  $("pr-input-row").hidden = true; $("pr-choices").hidden = true;
  $("pr-feedback").innerHTML = ""; $("pr-steps-box").hidden = true; $("pr-hint-box").hidden = true;
  setMode("topic");
}

function setMode(m = mode) {
  mode = m;
  document.querySelectorAll(".pr-mode").forEach((b) => b.classList.toggle("active", b.dataset.m === mode));
}

/* ---------- wire up ---------- */
document.querySelectorAll(".pr-mode").forEach((b) => b.addEventListener("click", () => {
  if (mock && b.dataset.m !== "mock") { if (!confirm("Leave the mock exam?")) return; mock = null; $("pr-mock-bar").hidden = true; }
  if (b.dataset.m === "mock") return startMock();
  setMode(b.dataset.m);
  next(current && mode === "topic" ? current.topic : null);
}));
$("pr-check").addEventListener("click", () => check());
$("pr-answer").addEventListener("keydown", (e) => { if (e.key === "Enter") (answered ? next(current?.topic) : check()); });
$("pr-next").addEventListener("click", () => next(current?.topic));
$("pr-hint").addEventListener("click", () => { $("pr-hint-box").hidden = false; });
$("pr-show").addEventListener("click", () => { if (mock && !answered) return; $("pr-steps-box").hidden = false; });
$("pr-reset").addEventListener("click", () => {
  if (!confirm("Reset all practice progress and the mistake log?")) return;
  localStorage.removeItem(KEY); location.reload();
});

renderTopics();
addEventListener("load", () => next("2.3 Limits: factor"));

/* ---------- textbook exercise checklist (from the lecture slides) ---------- */
const BOOK = [
  ["1.1 Four ways to represent a function", 10, "3, 4, 7–10, 31–37, 57–61"],
  ["1.2 Catalog of essential functions", 23, "1–7, 10–14"],
  ["1.3 New functions from old", 36, "1–3, 9–16, 31–36, 50, 51"],
  ["1.6 Inverse functions and logarithms", 58, "3–8, 21–26, 35–42, 63–72"],
  ["2.1 Tangent and velocity problems", 82, "3–5"],
  ["2.2 The limit of a function", 87, "1–9, 19–26, 29–38"],
  ["2.3 Limit laws", 99, "1–32, 37–48"],
  ["2.5 Continuity (no slides)", 118, "pick odd numbers 1–45"],
  ["2.8 Derivative as a function (no slides)", 154, "pick odd numbers 1–40"],
  ["3.1 Polynomials and exponentials", 174, "3–26, 33–38, 45–48, 51–54"],
  ["3.2 Product and quotient rules", 184, "1–34, 43–48"],
  ["3.3 Trigonometric derivatives", 191, "1–16, 21–24, 39–42"],
  ["3.4 Chain rule", 198, "1–30, 47–54, 59–67"],
  ["3.5 Implicit differentiation", 209, "5–22, 25–30, 35–38, 49–58"],
  ["3.6 Logarithmic functions (no slides)", 218, "pick odd numbers 1–50"],
  ["3.9 Related rates", 244, "1–4, 6–10, 12–20"],
  ["4.1 Maximum and minimum values (no slides)", 274, "pick odd numbers 29–62"],
  ["4.2 Mean Value Theorem (no slides)", 284, "pick odd numbers 1–25"],
  ["4.3 How derivatives affect the shape (no slides)", 290, "pick odd numbers 1–45"],
];
const BKEY = "cvl-book";
const bdone = JSON.parse(localStorage.getItem(BKEY) || "{}");
$("pr-book").innerHTML = BOOK.map(([name, page, ex], i) => `
  <label class="bk ${bdone[i] ? "done" : ""}"><input type="checkbox" data-i="${i}" ${bdone[i] ? "checked" : ""}>
  <span><b>${name}</b><small>Exercises ${ex} · book p.${page} · PDF p.${page + 32}</small></span></label>`).join("");
$("pr-book").querySelectorAll("input").forEach((box) => box.addEventListener("change", () => {
  bdone[box.dataset.i] = box.checked;
  localStorage.setItem(BKEY, JSON.stringify(bdone));
  box.closest(".bk").classList.toggle("done", box.checked);
  $("pr-book-count").textContent = `${Object.values(bdone).filter(Boolean).length}/${BOOK.length} sections done`;
}));
$("pr-book-count").textContent = `${Object.values(bdone).filter(Boolean).length}/${BOOK.length} sections done`;

// for tests in the console
window.__practice = { parseNum, T, TOPICS, get current() { return current; } };
