// Safe math parser (no eval). Reads MathLive's ascii-math output and plain typing:
//   (1)/(3)   -(3)/(4)t^(-(5)/(4))   2sqrt(3)   3x^2cos (x^3)   sin ^2x   root(3)(x)   log _3x   e^(sin x)
// compile(src, vars) -> f(...values) or throws. Variables are single letters listed in `vars`.

const FUNCS = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  sec: (x) => 1 / Math.cos(x), csc: (x) => 1 / Math.sin(x), cot: (x) => 1 / Math.tan(x),
  arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  sinh: Math.sinh, cosh: Math.cosh, tanh: Math.tanh,
  ln: Math.log, log: Math.log10, exp: Math.exp, sqrt: Math.sqrt, abs: Math.abs,
};
const NAMES = Object.keys(FUNCS).concat(["root", "pi"]).sort((a, b) => b.length - a.length);

function tokenize(src) {
  const s = String(src)
    .replace(/\\left|\\right|\\,|\\;|\\!/g, "")
    .replace(/\\cdot|\\times|·|×/g, "*").replace(/−|–/g, "-").replace(/π|\\pi/g, "pi").replace(/√/g, "sqrt")
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)").replace(/\\/g, "").replace(/[{]/g, "(").replace(/[}]/g, ")")
    .toLowerCase();
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) { const m = /^\d*\.?\d+(e[+-]?\d+)?|^\d+\.?/.exec(s.slice(i)); out.push({ t: "num", v: parseFloat(m[0]) }); i += m[0].length; continue; }
    if ("+-*/^()_|!,".includes(c)) { out.push({ t: c }); i++; continue; }
    if (/[a-z]/.test(c)) {
      const name = NAMES.find((n) => s.startsWith(n, i));
      if (name) { out.push(name === "pi" ? { t: "const", v: Math.PI } : { t: "fn", v: name }); i += name.length; continue; }
      out.push(c === "e" ? { t: "e" } : { t: "var", v: c }); i++; continue;
    }
    throw new Error(`Unexpected character "${c}"`);
  }
  return out;
}

// Builds a closure tree: each node is (env) => number.
function parse(tokens, vars) {
  let i = 0;
  const peek = () => tokens[i], take = () => tokens[i++];
  const startsFactor = (t) => t && (t.t === "num" || t.t === "var" || t.t === "e" || t.t === "const" || t.t === "fn" || t.t === "(" || t.t === "|");

  function expr() {
    let left = term();
    while (peek() && (peek().t === "+" || peek().t === "-")) {
      const op = take().t, right = term(), l = left;
      left = op === "+" ? (e) => l(e) + right(e) : (e) => l(e) - right(e);
    }
    return left;
  }
  function term() {
    let left = unary();
    for (;;) {
      const t = peek();
      if (t && (t.t === "*" || t.t === "/")) { take(); const r = unary(), l = left; left = t.t === "*" ? (e) => l(e) * r(e) : (e) => l(e) / r(e); }
      else if (startsFactor(t)) { const r = power(), l = left; left = (e) => l(e) * r(e); }   // implicit multiplication
      else return left;
    }
  }
  function unary() {
    if (peek() && peek().t === "-") { take(); const u = unary(); return (e) => -u(e); }
    if (peek() && peek().t === "+") { take(); return unary(); }
    return power();
  }
  function power() {
    const base = postfix();
    if (peek() && peek().t === "^") { take(); const ex = unary(); return (e) => Math.pow(base(e), ex(e)); }
    return base;
  }
  function postfix() {
    let p = primary();
    while (peek() && peek().t === "!") { take(); const q = p; p = (e) => { let n = Math.round(q(e)), r = 1; while (n > 1) r *= n--; return r; }; }
    return p;
  }
  // argument of a function written without brackets: "sin x", "ln 3", "cos 2x" -> a run of powered factors
  function bareArg() {
    let a = power();
    while (peek() && startsFactor(peek()) && peek().t !== "fn") { const r = power(), l = a; a = (e) => l(e) * r(e); }
    return a;
  }
  function primary() {
    const t = take();
    if (!t) throw new Error("Incomplete expression");
    if (t.t === "num") return () => t.v;
    if (t.t === "const") return () => t.v;
    if (t.t === "e") return () => Math.E;
    if (t.t === "var") {
      if (!vars.includes(t.v)) throw new Error(`Unknown letter "${t.v}"`);
      return (e) => e[t.v];
    }
    if (t.t === "(") { const v = expr(); if (!peek() || take().t !== ")") throw new Error("Missing )"); return v; }
    if (t.t === "|") { const v = expr(); if (!peek() || take().t !== "|") throw new Error("Missing |"); return (e) => Math.abs(v(e)); }
    if (t.t === "fn") {
      if (t.v === "root") { // root(n)(x)
        const n = primary(), x = primary();
        return (e) => { const k = n(e), v = x(e); return v < 0 && k % 2 === 1 ? -Math.pow(-v, 1 / k) : Math.pow(v, 1 / k); };
      }
      let base = null, pw = null;
      if (t.v === "log" && peek() && peek().t === "_") { take(); base = primary(); }
      if (peek() && peek().t === "^") { take(); pw = unary(); }            // sin^2 x
      const arg = peek() && peek().t === "(" ? primary() : bareArg();
      const fn = FUNCS[t.v];
      let g = base ? (e) => Math.log(arg(e)) / Math.log(base(e)) : (e) => fn(arg(e));
      if (pw) { const h = g, p = pw; g = (e) => (p(e) === -1 && ["sin", "cos", "tan"].includes(t.v) ? NaN : Math.pow(h(e), p(e))); }
      return g;
    }
    throw new Error(`Unexpected "${t.t}"`);
  }
  const root = expr();
  if (i < tokens.length) throw new Error(`Unexpected "${tokens[i].t}"`);
  return root;
}

export function compile(src, vars = []) {
  let s = String(src).trim();
  if (s.includes("=")) s = s.slice(s.lastIndexOf("=") + 1);          // "y' = ..." or "f'(x)=..."
  if (!s) throw new Error("Empty answer");
  const fn = parse(tokenize(s), vars);
  return (...vals) => fn(Object.fromEntries(vars.map((v, k) => [v, vals[k]])));
}

export function parseNum(src) {
  try { const v = compile(src, [])(); return typeof v === "number" ? v : NaN; } catch { return NaN; }
}
