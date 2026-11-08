// Book-level question bank, modeled on Stewart's exercises (7th ed., §2.3–4.7).
// Every generator returns { q, a, hint, steps } with a numeric answer a. LaTeX uses \( \).

const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const nz = (a, b) => { let v; do v = R(a, b); while (v === 0); return v; };
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function frac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  return d === 1 ? `${n}` : `${n < 0 ? "-" : ""}\\tfrac{${Math.abs(n)}}{${d}}`;
}
const sgn = (v) => (v < 0 ? `- ${-v}` : `+ ${v}`);
const num = (v) => +v.toFixed(4);
const PI = Math.PI, E = Math.E;

export const TB = {};

/* ---------------- Chapter 2 ---------------- */

TB["2.3 Limits (book)"] = () => pick([
  () => { const a = nz(-3, 4);
    return { q: `\\(\\displaystyle\\lim_{h\\to0}\\frac{(${a}+h)^3-${a < 0 ? `(${a})` : a}^3}{h}\\)`, a: 3 * a * a,
      hint: `Expand \\((${a}+h)^3\\) with the binomial pattern, cancel, then divide by \\(h\\).`,
      steps: `\\((a+h)^3-a^3=3a^2h+3ah^2+h^3\\). Divide by \\(h\\): \\(3a^2+3ah+h^2\\to3a^2=${3 * a * a}\\).` }; },
  () => { const b = R(1, 4);
    return { q: `\\(\\displaystyle\\lim_{x\\to-${b}}\\frac{x+${b}}{x^3+${b ** 3}}\\)`, a: 1 / (3 * b * b),
      hint: `Sum of cubes: \\(x^3+b^3=(x+b)(x^2-bx+b^2)\\).`,
      steps: `Cancel \\((x+${b})\\): \\(\\dfrac{1}{x^2-${b}x+${b * b}}\\). At \\(x=-${b}\\): \\(\\dfrac1{${3 * b * b}}\\).` }; },
  () => { const a = nz(-4, 4);
    return { q: `\\(\\displaystyle\\lim_{x\\to${a}}\\frac{\\frac1x-\\frac1{${a}}}{x-${a < 0 ? `(${a})` : a}}\\)`, a: -1 / (a * a),
      hint: `Combine the top into one fraction: \\(\\frac1x-\\frac1a=\\frac{a-x}{ax}\\).`,
      steps: `\\(\\dfrac{a-x}{ax(x-a)}=-\\dfrac{1}{ax}\\to-\\dfrac1{a^2}=${frac(-1, a * a)}\\).` }; },
  () => { const [p, m, k] = pick([[4, 5, 9], [3, 5, 16], [6, 10, 64], [8, 10, 36], [5, 13, 144]]);
    return { q: `\\(\\displaystyle\\lim_{x\\to-${p}}\\frac{\\sqrt{x^2+${k}}-${m}}{x+${p}}\\)`, a: -p / m,
      hint: `Multiply top and bottom by the conjugate \\(\\sqrt{x^2+${k}}+${m}\\).`,
      steps: `Top becomes \\(x^2+${k}-${m * m}=x^2-${p * p}=(x-${p})(x+${p})\\). Cancel: \\(\\dfrac{x-${p}}{\\sqrt{x^2+${k}}+${m}}\\to\\dfrac{${-2 * p}}{${2 * m}}=${frac(-p, m)}\\).` }; },
  () => { const k = R(1, 5);
    return { q: `\\(\\displaystyle\\lim_{t\\to0}\\frac{\\sqrt{1+${k}t}-\\sqrt{1-${k}t}}{t}\\)`, a: k,
      hint: `Conjugate: multiply by \\(\\sqrt{1+${k}t}+\\sqrt{1-${k}t}\\).`,
      steps: `Top: \\((1+${k}t)-(1-${k}t)=${2 * k}t\\). So \\(\\dfrac{${2 * k}}{\\sqrt{1+${k}t}+\\sqrt{1-${k}t}}\\to\\dfrac{${2 * k}}{2}=${k}\\).` }; },
  () => { const a = nz(-4, 4); let b; do b = nz(-5, 5); while (b === a || b === -a);
    return { q: `\\(\\displaystyle\\lim_{x\\to${a}}\\frac{x^2 ${sgn(-(a + b))}x ${sgn(a * b)}}{x^2-${a * a}}\\)`, a: (a - b) / (2 * a),
      hint: `Factor both: the top has a factor \\((x ${sgn(-a)})\\), and \\(x^2-${a * a}=(x-${Math.abs(a)})(x+${Math.abs(a)})\\).`,
      steps: `\\(\\dfrac{(x ${sgn(-a)})(x ${sgn(-b)})}{(x ${sgn(-a)})(x ${sgn(a)})}=\\dfrac{x ${sgn(-b)}}{x ${sgn(a)}}\\to\\dfrac{${a - b}}{${2 * a}}=${frac(a - b, 2 * a)}\\).` }; },
  () => { const c = R(2, 5), p = R(1, 6);
    return { q: `\\(\\displaystyle\\lim_{x\\to-${p}^-}\\frac{${c}x+${c * p}}{|x+${p}|}\\)`, a: -c,
      hint: `For \\(x<-${p}\\), \\(x+${p}<0\\), so \\(|x+${p}|=-(x+${p})\\).`,
      steps: `\\(\\dfrac{${c}(x+${p})}{-(x+${p})}=-${c}\\) for every \\(x<-${p}\\), so the limit is \\(-${c}\\).` }; },
  () => { const a = R(1, 3);
    return { q: `\\(\\displaystyle\\lim_{x\\to${a * a}}\\frac{${a}-\\sqrt x}{${a * a}x-x^2}\\)`, a: 1 / (2 * a * a * a),
      hint: `Factor the bottom as \\(x(${a * a}-x)\\) and write \\(${a * a}-x=(${a}-\\sqrt x)(${a}+\\sqrt x)\\).`,
      steps: `\\(\\dfrac{${a}-\\sqrt x}{x(${a}-\\sqrt x)(${a}+\\sqrt x)}=\\dfrac1{x(${a}+\\sqrt x)}\\to\\dfrac1{${a * a}\\cdot${2 * a}}=${frac(1, 2 * a ** 3)}\\).` }; },
])();

TB["2.3 Trig limits (book)"] = () => pick([
  () => { const k = nz(1, 6), m = nz(1, 6);
    return { q: `\\(\\displaystyle\\lim_{x\\to0}\\frac{\\tan ${k}x}{\\sin ${m}x}\\)`, a: k / m,
      hint: `\\(\\tan u=\\frac{\\sin u}{\\cos u}\\); build \\(\\frac{\\sin ${k}x}{${k}x}\\) and \\(\\frac{${m}x}{\\sin ${m}x}\\).`,
      steps: `\\(\\dfrac{\\sin ${k}x}{${k}x}\\cdot\\dfrac{${m}x}{\\sin ${m}x}\\cdot\\dfrac{${k}}{${m}}\\cdot\\dfrac1{\\cos ${k}x}\\to ${frac(k, m)}\\).` }; },
  () => { const k = R(1, 6);
    return { q: `\\(\\displaystyle\\lim_{x\\to0}\\frac{1-\\cos ${k}x}{x^2}\\)`, a: (k * k) / 2,
      hint: `Multiply by \\(1+\\cos ${k}x\\): the top becomes \\(\\sin^2 ${k}x\\).`,
      steps: `\\(\\dfrac{\\sin^2 ${k}x}{x^2(1+\\cos ${k}x)}=\\left(\\dfrac{\\sin ${k}x}{${k}x}\\right)^2\\dfrac{${k * k}}{1+\\cos ${k}x}\\to\\dfrac{${k * k}}{2}\\).` }; },
  () => { const k = nz(1, 5);
    return { q: `\\(\\displaystyle\\lim_{\\theta\\to0}\\frac{\\sin ${k}\\theta}{\\theta+\\tan\\theta}\\)`, a: k / 2,
      hint: `Divide the top and the bottom by \\(\\theta\\).`,
      steps: `\\(\\dfrac{\\sin ${k}\\theta/\\theta}{1+\\tan\\theta/\\theta}\\to\\dfrac{${k}}{1+1}=${frac(k, 2)}\\).` }; },
  () => { const a = R(1, 4);
    return { q: `\\(\\displaystyle\\lim_{x\\to${a}}\\frac{\\sin(x-${a})}{x^2-${a * a}}\\)`, a: 1 / (2 * a),
      hint: `\\(x^2-${a * a}=(x-${a})(x+${a})\\); let \\(u=x-${a}\\to0\\).`,
      steps: `\\(\\dfrac{\\sin(x-${a})}{x-${a}}\\cdot\\dfrac1{x+${a}}\\to1\\cdot\\dfrac1{${2 * a}}\\).` }; },
  () => { const k = nz(1, 6), m = nz(1, 6);
    return { q: `\\(\\displaystyle\\lim_{x\\to0}\\sin(${k}x)\\cot(${m}x)\\)`, a: k / m,
      hint: `\\(\\cot u=\\frac{\\cos u}{\\sin u}\\).`,
      steps: `\\(\\dfrac{\\sin ${k}x}{\\sin ${m}x}\\cos ${m}x\\to${frac(k, m)}\\cdot1\\).` }; },
])();

TB["2.5 Continuity constants (book)"] = () => pick([
  () => { const k = R(1, 3), p = R(1, 4);
    return { q: `Find \\(c\\) so that \\(f\\) is continuous everywhere: \\(f(x)=\\begin{cases}cx^2+${p}x & x<${k}\\\\ x^3-cx & x\\ge${k}\\end{cases}\\)`,
      a: (k ** 3 - p * k) / (k * k + k),
      hint: `Set the two pieces equal at \\(x=${k}\\) and solve for \\(c\\).`,
      steps: `\\(${k * k}c+${p * k}=${k ** 3}-${k}c\\Rightarrow ${k * k + k}c=${k ** 3 - p * k}\\Rightarrow c=${frac(k ** 3 - p * k, k * k + k)}\\).` }; },
  () => { const c = R(-2, 3), ask = pick(["a", "b"]);
    const a = (1 - 2 * c) / 2, b = (1 - 5 * c) / 2;
    const top = `x^2 ${c === 0 ? "" : sgn(c) + "x"} ${sgn(-(4 + 2 * c))}`;
    return { q: `Find \\(${ask}\\) so that \\(f\\) is continuous everywhere: \\(f(x)=\\begin{cases}\\dfrac{${top}}{x-2} & x<2\\\\ ax^2-bx+3 & 2\\le x<3\\\\ 2x-a+b & x\\ge3\\end{cases}\\)`,
      a: ask === "a" ? a : b,
      hint: `Two conditions: the pieces must meet at \\(x=2\\) and at \\(x=3\\). The first limit needs factoring.`,
      steps: `\\(${top}=(x-2)(x ${sgn(2 + c)})\\), so the left limit at 2 is \\(${4 + c}\\). At 2: \\(4a-2b+3=${4 + c}\\). At 3: \\(9a-3b+3=6-a+b\\Rightarrow10a-4b=3\\). Solving: \\(a=${frac(1 - 2 * c, 2)}\\), \\(b=${frac(1 - 5 * c, 2)}\\).` }; },
])();

TB["2.6 Limits at infinity (book)"] = () => pick([
  () => { const a = R(1, 5), b = nz(-6, 6);
    return { q: `\\(\\displaystyle\\lim_{x\\to\\infty}\\left(\\sqrt{${a * a}x^2 ${sgn(b)}x}-${a === 1 ? "" : a}x\\right)\\)`, a: b / (2 * a),
      hint: `Multiply and divide by the conjugate \\(\\sqrt{${a * a}x^2 ${sgn(b)}x}+${a === 1 ? "" : a}x\\), then divide by \\(x\\).`,
      steps: `\\(\\dfrac{${b}x}{\\sqrt{${a * a}x^2 ${sgn(b)}x}+${a}x}=\\dfrac{${b}}{\\sqrt{${a * a} ${sgn(b)}/x}+${a}}\\to\\dfrac{${b}}{${2 * a}}=${frac(b, 2 * a)}\\).` }; },
  () => { const m = R(2, 5), dir = pick([1, -1]);
    return { q: `\\(\\displaystyle\\lim_{x\\to${dir > 0 ? "" : "-"}\\infty}\\frac{\\sqrt{${m * m}x^6-x}}{x^3+1}\\)`, a: dir * m,
      hint: `\\(\\sqrt{x^6}=|x|^3\\), which is \\(-x^3\\) when \\(x<0\\).`,
      steps: `Divide by \\(x^3\\). For \\(x${dir > 0 ? ">" : "<"}0\\), \\(\\sqrt{x^6}=${dir > 0 ? "" : "-"}x^3\\), so the limit is \\(${dir > 0 ? "" : "-"}\\sqrt{${m * m}}=${dir * m}\\).` }; },
  () => { const p = R(1, 5), r = R(2, 5);
    return { q: `\\(\\displaystyle\\lim_{x\\to\\infty}\\frac{${p}-e^x}{${p + 1}+${r}e^x}\\)`, a: -1 / r,
      hint: `Divide top and bottom by \\(e^x\\); \\(e^{-x}\\to0\\).`,
      steps: `\\(\\dfrac{${p}e^{-x}-1}{${p + 1}e^{-x}+${r}}\\to-\\dfrac1{${r}}\\).` }; },
  () => { const k = nz(-6, 6);
    return { q: `\\(\\displaystyle\\lim_{x\\to\\infty}\\left(x-\\sqrt{x^2 ${sgn(k)}x}\\right)\\)`, a: -k / 2,
      hint: `Conjugate, then divide top and bottom by \\(x\\).`,
      steps: `\\(\\dfrac{${-k}x}{x+\\sqrt{x^2 ${sgn(k)}x}}\\to\\dfrac{${-k}}{2}\\).` }; },
  () => { const a = nz(-5, 6), b = R(2, 7);
    return { q: `\\(\\displaystyle\\lim_{x\\to-\\infty}\\frac{${a}x^3-x+4}{${b}x^3+2x^2-7}\\)`, a: a / b,
      hint: `Equal degrees: divide every term by \\(x^3\\).`,
      steps: `All lower terms vanish, leaving \\(\\dfrac{${a}}{${b}}\\).` }; },
])();

TB["2.8 Derivative by definition (book)"] = () => pick([
  () => { const c = R(1, 5), a = R(0, 4);
    return { q: `Use the definition of the derivative to find \\(f'(${a})\\) for \\(f(x)=\\dfrac{1}{x+${c}}\\).`, a: -1 / (a + c) ** 2,
      hint: `\\(\\frac1{a+h+c}-\\frac1{a+c}=\\frac{-h}{(a+h+c)(a+c)}\\).`,
      steps: `\\(\\dfrac{f(${a}+h)-f(${a})}{h}=\\dfrac{-1}{(${a + c}+h)(${a + c})}\\to-\\dfrac1{${(a + c) ** 2}}\\).` }; },
  () => { const [c, a] = pick([[0, 4], [1, 3], [5, 4], [2, 7], [3, 13]]);
    const s = Math.sqrt(a + c);
    return { q: `Use the definition to find \\(f'(${a})\\) for \\(f(x)=\\sqrt{x+${c}}\\).`, a: 1 / (2 * s),
      hint: `Multiply by the conjugate \\(\\sqrt{${a}+h+${c}}+\\sqrt{${a + c}}\\).`,
      steps: `\\(\\dfrac{h}{h(\\sqrt{${a + c}+h}+${s})}\\to\\dfrac1{${2 * s}}\\).` }; },
  () => { const k = R(1, 6), a = nz(-3, 3);
    return { q: `Use the definition to find \\(f'(${a})\\) for \\(f(x)=x^3-${k}x\\).`, a: 3 * a * a - k,
      hint: `\\((a+h)^3=a^3+3a^2h+3ah^2+h^3\\).`,
      steps: `The quotient is \\(3a^2+3ah+h^2-${k}\\to3(${a})^2-${k}=${3 * a * a - k}\\).` }; },
])();

/* ---------------- Chapter 3 ---------------- */

TB["3.1–3.2 Rules & tables (book)"] = () => pick([
  () => { const f = R(-4, 5), fp = nz(-4, 4), g = nz(-4, 5), gp = nz(-4, 4), x = R(1, 5);
    const which = pick(["prod", "quot"]);
    const tab = `\\(f(${x})=${f},\\ f'(${x})=${fp},\\ g(${x})=${g},\\ g'(${x})=${gp}\\)`;
    return which === "prod"
      ? { q: `Given ${tab}, find \\((fg)'(${x})\\).`, a: fp * g + f * gp, hint: `Product rule.`, steps: `\\(f'g+fg'=(${fp})(${g})+(${f})(${gp})=${fp * g + f * gp}\\).` }
      : { q: `Given ${tab}, find \\(\\left(\\dfrac fg\\right)'(${x})\\).`, a: (fp * g - f * gp) / (g * g), hint: `Quotient rule: \\(\\frac{f'g-fg'}{g^2}\\).`, steps: `\\(\\dfrac{(${fp})(${g})-(${f})(${gp})}{${g * g}}=${frac(fp * g - f * gp, g * g)}\\).` };
  },
  () => { const c = R(1, 9);
    return { q: `\\(y=\\dfrac{x^2+${c}}{\\sqrt x}\\). Find \\(y'(4)\\).`, a: 3 - c / 16,
      hint: `Split first: \\(y=x^{3/2}+${c}x^{-1/2}\\).`,
      steps: `\\(y'=\\tfrac32x^{1/2}-\\tfrac{${c}}2x^{-3/2}\\). At 4: \\(3-\\tfrac{${c}}{16}\\).` }; },
  () => { const a = R(0, 3);
    return { q: `\\(y=\\dfrac{e^x}{1+x}\\). Find \\(y'(${a})\\).`, a: (Math.exp(a) * a) / (1 + a) ** 2,
      hint: `Quotient rule; simplify the top to \\(xe^x\\).`,
      steps: `\\(y'=\\dfrac{e^x(1+x)-e^x}{(1+x)^2}=\\dfrac{xe^x}{(1+x)^2}\\). At \\(${a}\\): \\(${frac(a, (1 + a) ** 2)}e^{${a}}\\approx${num((Math.exp(a) * a) / (1 + a) ** 2)}\\).` }; },
  () => { const p = R(1, 3), s = nz(-4, 6), y0 = nz(-4, 6);
    return { q: `The parabola \\(y=ax^2+bx\\) has tangent line slope \\(${s}\\) at the point \\((${p},${y0})\\). Find \\(a\\).`, a: (s * p - y0) / (p * p),
      hint: `Two equations: it passes through the point, and \\(y'=2ax+b\\) equals ${s} there.`,
      steps: `\\(${p * p}a+${p}b=${y0}\\) and \\(${2 * p}a+b=${s}\\). Substitute \\(b=${s}-${2 * p}a\\): \\(${p * p}a+${p * s}-${2 * p * p}a=${y0}\\Rightarrow a=${frac(s * p - y0, p * p)}\\).` }; },
  () => { const a = R(1, 4);
    return { q: `Find the slope of the <b>normal</b> line to \\(y=x\\sqrt x\\) at \\(x=${a * a}\\).`, a: -1 / (1.5 * a),
      hint: `\\(y=x^{3/2}\\). The normal is perpendicular to the tangent: slope \\(-1/y'\\).`,
      steps: `\\(y'=\\tfrac32x^{1/2}=${1.5 * a}\\) at \\(x=${a * a}\\). Normal slope \\(-\\dfrac1{${1.5 * a}}\\approx${num(-1 / (1.5 * a))}\\).` }; },
])();

TB["3.3 Trig derivatives (book)"] = () => pick([
  () => { const [x, s] = pick([[PI / 3, "\\tfrac\\pi3"], [PI / 2, "\\tfrac\\pi2"], [0, "0"]]);
    return { q: `\\(f(x)=\\dfrac{\\sin x}{1+\\cos x}\\). Find \\(f'(${s})\\).`, a: 1 / (1 + Math.cos(x)),
      hint: `Quotient rule, then use \\(\\sin^2x+\\cos^2x=1\\).`,
      steps: `Top: \\(\\cos x(1+\\cos x)+\\sin^2x=1+\\cos x\\), so \\(f'=\\dfrac1{1+\\cos x}\\approx${num(1 / (1 + Math.cos(x)))}\\).` }; },
  () => { const n = 2 * R(5, 30), val = (n / 2) % 2 === 0 ? 2 ** n : -(2 ** n);
    return { q: `\\(y=\\cos 2x\\). Find \\(y^{(${n})}(0)\\). (You may type e.g. -2^${n}.)`, a: val,
      hint: `Each derivative multiplies by 2 and moves one step around the cycle \\(\\cos\\to-\\sin\\to-\\cos\\to\\sin\\).`,
      steps: `\\(y^{(n)}=2^n\\cdot(\\text{cycle term})\\). \\(${n}\\bmod4=${n % 4}\\), so \\(y^{(${n})}=${n % 4 === 0 ? "" : "-"}2^{${n}}\\cos2x\\), and at 0 that is \\(${val < 0 ? "-" : ""}2^{${n}}\\).` }; },
  () => ({ q: `Find the smallest \\(x\\) in \\((0,2\\pi)\\) where \\(f(x)=x+2\\sin x\\) has a horizontal tangent.`, a: (2 * PI) / 3,
      hint: `Solve \\(f'(x)=1+2\\cos x=0\\).`, steps: `\\(\\cos x=-\\tfrac12\\Rightarrow x=\\tfrac{2\\pi}3\\) or \\(\\tfrac{4\\pi}3\\). Smallest: \\(\\tfrac{2\\pi}3\\approx2.094\\).` }),
  () => { const [x, s] = pick([[PI / 2, "\\tfrac\\pi2"], [PI, "\\pi"]]);
    return { q: `Find the slope of the tangent to \\(y=x\\cos x\\) at \\(x=${s}\\).`, a: Math.cos(x) - x * Math.sin(x),
      hint: `Product rule: \\(\\cos x-x\\sin x\\).`, steps: `At \\(${s}\\): \\(\\approx${num(Math.cos(x) - x * Math.sin(x))}\\).` }; },
  () => { const k = R(1, 4);
    return { q: `\\(f(x)=${k}\\sec x\\). Find \\(f'\\!\\left(\\tfrac\\pi4\\right)\\).`, a: k * Math.SQRT2,
      hint: `\\((\\sec x)'=\\sec x\\tan x\\).`, steps: `\\(${k}\\sec\\tfrac\\pi4\\tan\\tfrac\\pi4=${k}\\sqrt2\\cdot1\\approx${num(k * Math.SQRT2)}\\).` }; },
])();

TB["3.4 Chain rule (book)"] = () => pick([
  () => { const a = R(1, 4), b = R(2, 6), c = nz(-4, 5), d = nz(-4, 5);
    return { q: `\\(F(x)=f(g(x))\\), where \\(g(${a})=${b}\\), \\(g'(${a})=${c}\\), \\(f'(${b})=${d}\\), \\(f'(${a})=${d + 3}\\). Find \\(F'(${a})\\).`, a: c * d,
      hint: `\\(F'(a)=f'(g(a))\\,g'(a)\\). Only one of the \\(f'\\) values is the right one.`,
      steps: `\\(F'(${a})=f'(${b})\\cdot g'(${a})=(${d})(${c})=${c * d}\\).` }; },
  () => { const [k, m, f0] = pick([[4, 3, 7], [1, 3, 1], [9, 2, 8], [5, 4, 5], [7, 3, 3]]);
    const fp = R(1, 6), s = Math.sqrt(k + m * f0);
    return { q: `\\(h(x)=\\sqrt{${k}+${m}f(x)}\\), where \\(f(1)=${f0}\\) and \\(f'(1)=${fp}\\). Find \\(h'(1)\\).`, a: (m * fp) / (2 * s),
      hint: `\\(h'=\\dfrac{${m}f'(x)}{2\\sqrt{${k}+${m}f(x)}}\\).`,
      steps: `\\(\\sqrt{${k}+${m * f0}}=${s}\\), so \\(h'(1)=\\dfrac{${m}\\cdot${fp}}{${2 * s}}=${frac(m * fp, 2 * s)}\\).` }; },
  () => { const A = pick([2, 3]), B = pick([4, 5]), C = R(2, 5), D = R(2, 6), Ev = R(2, 7);
    const up = B + D * (A + C);
    return { q: `\\(F(x)=f\\big(x\\,f(x\\,f(x))\\big)\\), where \\(f(1)=${A}\\), \\(f(${A})=${B}\\), \\(f'(1)=${C}\\), \\(f'(${A})=${D}\\), \\(f'(${B})=${Ev}\\). Find \\(F'(1)\\).`, a: Ev * up,
      hint: `Let \\(u=x\\,f(x f(x))\\). Then \\(F'=f'(u)\\,u'\\), and \\(u'\\) needs the product rule and the chain rule again.`,
      steps: `At \\(x=1\\): \\(xf(x)=${A}\\), \\(f(${A})=${B}\\), so \\(u=${B}\\). \\(u'=f(xf(x))+x\\,f'(xf(x))\\,(f(x)+xf'(x))=${B}+${D}(${A}+${C})=${up}\\). \\(F'(1)=f'(${B})\\cdot${up}=${Ev * up}\\).` }; },
  () => { const k = R(1, 5);
    return { q: `\\(y=\\sin(\\cos ${k}x)\\). Find \\(y'\\!\\left(\\tfrac{\\pi}{${2 * k}}\\right)\\).`, a: -k,
      hint: `Two layers: \\(\\cos(\\cos ${k}x)\\cdot(-\\sin ${k}x)\\cdot${k}\\).`,
      steps: `At that point \\(${k}x=\\tfrac\\pi2\\): \\(\\cos(0)\\cdot(-1)\\cdot${k}=-${k}\\).` }; },
  () => { const k = R(1, 4);
    return { q: `\\(y=\\tan^2(${k}x)\\). Find \\(y'\\!\\left(\\tfrac{\\pi}{${4 * k}}\\right)\\).`, a: 4 * k,
      hint: `\\(y'=2\\tan(${k}x)\\sec^2(${k}x)\\cdot${k}\\).`,
      steps: `At \\(${k}x=\\tfrac\\pi4\\): \\(\\tan=1\\), \\(\\sec^2=2\\), so \\(2\\cdot1\\cdot2\\cdot${k}=${4 * k}\\).` }; },
  () => { const a = pick([4, 9, 16]), s = Math.sqrt(a);
    const v = (1 + 1 / (2 * s)) / (2 * Math.sqrt(a + s));
    return { q: `\\(y=\\sqrt{x+\\sqrt x}\\). Find \\(y'(${a})\\).`, a: v,
      hint: `Outside \\(\\sqrt{u}\\), inside \\(u=x+\\sqrt x\\), \\(u'=1+\\frac1{2\\sqrt x}\\).`,
      steps: `\\(y'=\\dfrac{1+\\frac1{2\\sqrt x}}{2\\sqrt{x+\\sqrt x}}\\). At ${a}: \\(\\dfrac{1+\\frac1{${2 * s}}}{2\\sqrt{${a + s}}}\\approx${num(v)}\\).` }; },
  () => { const n = pick([R(5, 30), 100 * R(1, 10), 1000]);
    return { q: `\\(f(x)=xe^{-x}\\). Find \\(f^{(${n})}(0)\\).`, a: (n % 2 ? 1 : -1) * n,
      hint: `Work out \\(f',f'',f'''\\) and spot the pattern: \\(f^{(n)}(x)=(-1)^n(x-n)e^{-x}\\).`,
      steps: `\\(f'=(1-x)e^{-x}\\), \\(f''=(x-2)e^{-x}\\), \\(f'''=(3-x)e^{-x}\\), so \\(f^{(n)}=(-1)^n(x-n)e^{-x}\\). At 0: \\((-1)^{${n}}(-${n})=${(n % 2 ? 1 : -1) * n}\\).` }; },
])();

// Formula answers: `ans` is the expected formula (checked at sample points), `tex` is how it is shown.
TB["3.4 Derivative formulas (book)"] = () => pick([
  () => { const n = R(2, 4), k = nz(-3, 3);
    return { q: `Find \\(f'(x)\\) for \\(f(x)=x^{${n}}e^{${k}x}\\).`, ans: `${n}x^${n - 1}e^(${k}x)+(${k})x^${n}e^(${k}x)`, tex: `x^{${n - 1}}e^{${k}x}(${n}${k < 0 ? "" : "+"}${k}x)`,
      hint: `Product rule, and \\((e^{${k}x})'=${k}e^{${k}x}\\).`, steps: `\\(f'=${n}x^{${n - 1}}e^{${k}x}+x^{${n}}\\cdot${k}e^{${k}x}=x^{${n - 1}}e^{${k}x}(${n}${k < 0 ? "" : "+"}${k}x)\\).` }; },
  () => { const a = R(1, 4), b = R(1, 5);
    const A = a === 1 ? "" : a;
    return { q: `Find \\(f'(x)\\) for \\(f(x)=\\cos(${A}x^2+${b})\\).`, ans: `-2(${a})x sin(${a}x^2+${b})`, tex: `-${2 * a}x\\sin(${A}x^2+${b})`,
      hint: `Chain rule: outside \\(\\cos u\\), inside \\(u=${a}x^2+${b}\\).`, steps: `\\(f'=-\\sin(${a}x^2+${b})\\cdot${2 * a}x\\).` }; },
  () => { const c = R(1, 9);
    return { q: `Find \\(f'(x)\\) for \\(f(x)=\\dfrac{x}{x^2+${c}}\\).`, ans: `(${c}-x^2)/(x^2+${c})^2`, tex: `\\dfrac{${c}-x^2}{(x^2+${c})^2}`,
      hint: `Quotient rule.`, steps: `\\(\\dfrac{(x^2+${c})-x\\cdot2x}{(x^2+${c})^2}=\\dfrac{${c}-x^2}{(x^2+${c})^2}\\).` }; },
  () => { const a = R(1, 3), b = R(1, 5), n = R(3, 6);
    const A = a === 1 ? "" : a;
    return { q: `Find \\(f'(x)\\) for \\(f(x)=(${A}x^2+${b})^{${n}}\\).`, ans: `${n}(${a}x^2+${b})^${n - 1}*2(${a})x`, tex: `${2 * a * n}x(${A}x^2+${b})^{${n - 1}}`,
      hint: `\\((u^n)'=nu^{n-1}u'\\).`, steps: `\\(${n}(${A}x^2+${b})^{${n - 1}}\\cdot${2 * a}x=${2 * a * n}x(${A}x^2+${b})^{${n - 1}}\\).` }; },
  () => ({ q: `Find \\(f'(x)\\) for \\(f(x)=e^{\\sin x}\\).`, ans: `e^(sin x)cos x`, tex: `e^{\\sin x}\\cos x`,
      hint: `\\((e^u)'=e^uu'\\).`, steps: `\\(f'=e^{\\sin x}\\cdot\\cos x\\).` }),
  () => { const c = R(1, 9);
    return { q: `Find \\(f'(x)\\) for \\(f(x)=\\sqrt{x^2+${c}}\\).`, ans: `x/sqrt(x^2+${c})`, tex: `\\dfrac{x}{\\sqrt{x^2+${c}}}`,
      hint: `\\(\\sqrt u=u^{1/2}\\), chain rule.`, steps: `\\(\\tfrac12(x^2+${c})^{-1/2}\\cdot2x=\\dfrac{x}{\\sqrt{x^2+${c}}}\\).` }; },
  () => ({ q: `Find \\(f'(x)\\) for \\(f(x)=x\\ln x-x\\).`, ans: `ln x`, tex: `\\ln x`,
      hint: `Product rule on \\(x\\ln x\\).`, steps: `\\(\\ln x+x\\cdot\\tfrac1x-1=\\ln x\\).` }),
  () => { const k = R(2, 5);
    return { q: `Find \\(f'(x)\\) for \\(f(x)=\\tan(${k}x)\\).`, ans: `${k}sec(${k}x)^2`, tex: `${k}\\sec^2(${k}x)`, points: [[0.05], [0.1], [0.13], [0.21], [0.27]],
      hint: `\\((\\tan u)'=\\sec^2u\\cdot u'\\).`, steps: `\\(f'=${k}\\sec^2(${k}x)\\).` }; },
])();

TB["3.5 Implicit formulas (book)"] = () => pick([
  () => { const k = R(3, 20);
    return { q: `\\(x^2+xy+y^2=${k}\\). Find \\(y'\\) in terms of \\(x\\) and \\(y\\).`, ans: `-(2x+y)/(x+2y)`, tex: `-\\dfrac{2x+y}{x+2y}`, vars: ["x", "y"],
      hint: `\\(2x+(y+xy')+2yy'=0\\).`, steps: `\\(y'(x+2y)=-(2x+y)\\Rightarrow y'=-\\dfrac{2x+y}{x+2y}\\).` }; },
  () => ({ q: `\\(x^3+y^3=6xy\\). Find \\(y'\\) in terms of \\(x\\) and \\(y\\).`, ans: `(2y-x^2)/(y^2-2x)`, tex: `\\dfrac{2y-x^2}{y^2-2x}`, vars: ["x", "y"],
      hint: `\\(3x^2+3y^2y'=6y+6xy'\\).`, steps: `\\(y'(3y^2-6x)=6y-3x^2\\Rightarrow y'=\\dfrac{2y-x^2}{y^2-2x}\\).` }),
  () => { const r = R(2, 9);
    return { q: `\\(x^2+y^2=${r * r}\\). Find \\(y''\\) in terms of \\(y\\) only (use the equation).`, ans: `-${r * r}/y^3`, tex: `-\\dfrac{${r * r}}{y^3}`, vars: ["y"],
      hint: `\\(y'=-x/y\\); differentiate again and replace \\(x^2+y^2\\) by ${r * r}.`, steps: `\\(y''=-\\dfrac{y-xy'}{y^2}=-\\dfrac{x^2+y^2}{y^3}=-\\dfrac{${r * r}}{y^3}\\).` }; },
  () => ({ q: `\\(e^{xy}=x+y\\). Find \\(y'\\) in terms of \\(x\\) and \\(y\\).`, ans: `(1-y e^(xy))/(x e^(xy)-1)`, tex: `\\dfrac{1-ye^{xy}}{xe^{xy}-1}`, vars: ["x", "y"],
      points: [[0.2, 0.3], [0.5, 0.1], [0.3, 0.7], [1.2, 0.4], [0.9, 1.3]],
      hint: `\\(e^{xy}(y+xy')=1+y'\\).`, steps: `\\(y'(xe^{xy}-1)=1-ye^{xy}\\Rightarrow y'=\\dfrac{1-ye^{xy}}{xe^{xy}-1}\\).` }),
])();

TB["3.5 Implicit (book)"] = () => pick([
  () => { const p = nz(-3, 3), q = nz(-3, 3), k = p * p + p * q + q * q;
    if (p + 2 * q === 0) return TB["3.5 Implicit (book)"]();
    return { q: `Find \\(y'\\) at \\((${p},${q})\\) on the curve \\(x^2+xy+y^2=${k}\\).`, a: -(2 * p + q) / (p + 2 * q),
      hint: `\\(2x+(y+xy')+2yy'=0\\).`,
      steps: `\\(y'=-\\dfrac{2x+y}{x+2y}=-\\dfrac{${2 * p + q}}{${p + 2 * q}}=${frac(-(2 * p + q), p + 2 * q)}\\).` }; },
  () => ({ q: `Find the slope of the tangent to the folium \\(x^3+y^3=6xy\\) at \\((3,3)\\).`, a: -1,
      hint: `\\(3x^2+3y^2y'=6y+6xy'\\).`, steps: `\\(y'=\\dfrac{2y-x^2}{y^2-2x}=\\dfrac{6-9}{9-6}=-1\\).` }),
  () => ({ q: `Find \\(y'\\) at \\((\\pi,\\pi)\\) on \\(\\sin(x+y)=2x-2y\\).`, a: 1 / 3,
      hint: `\\(\\cos(x+y)(1+y')=2-2y'\\); \\(\\cos2\\pi=1\\).`, steps: `\\(1+y'=2-2y'\\Rightarrow y'=\\tfrac13\\).` }),
  () => { const [p, q, r] = pick([[3, 4, 5], [4, 3, 5], [6, 8, 10], [5, 12, 13]]);
    return { q: `\\(x^2+y^2=${r * r}\\). Find \\(y''\\) at \\((${p},${q})\\).`, a: -(r * r) / q ** 3,
      hint: `\\(y'=-\\frac xy\\); differentiate again with the quotient rule, then use \\(x^2+y^2=${r * r}\\).`,
      steps: `\\(y''=-\\dfrac{y-xy'}{y^2}=-\\dfrac{x^2+y^2}{y^3}=-\\dfrac{${r * r}}{${q ** 3}}\\).` }; },
  () => { const p = nz(-3, 3), q = nz(-3, 3), k = p * p - p * q - q * q;
    if (p + 2 * q === 0) return TB["3.5 Implicit (book)"]();
    return { q: `Find \\(y'\\) at \\((${p},${q})\\) on \\(x^2-xy-y^2=${k}\\).`, a: (2 * p - q) / (p + 2 * q),
      hint: `\\(2x-(y+xy')-2yy'=0\\).`, steps: `\\(y'=\\dfrac{2x-y}{x+2y}=${frac(2 * p - q, p + 2 * q)}\\).` }; },
  () => ({ q: `Find \\(y'\\) at \\((0,1)\\) on \\(e^{xy}=x+y\\).`, a: 0,
      hint: `\\(e^{xy}(y+xy')=1+y'\\).`, steps: `At \\((0,1)\\): \\(1\\cdot(1+0)=1+y'\\Rightarrow y'=0\\).` }),
])();

TB["3.6 Logarithmic (book)"] = () => pick([
  () => ({ q: `\\(y=x^{\\sin x}\\). Find \\(y'\\!\\left(\\tfrac\\pi2\\right)\\).`, a: 1,
      hint: `\\(\\ln y=\\sin x\\ln x\\).`, steps: `\\(\\dfrac{y'}y=\\cos x\\ln x+\\dfrac{\\sin x}x\\). At \\(\\tfrac\\pi2\\): \\(y=\\tfrac\\pi2\\), \\(\\tfrac{y'}y=\\tfrac2\\pi\\), so \\(y'=1\\).` }),
  () => { const k = R(2, 5);
    return { q: `\\(y=x^{${k}x}\\). Find \\(y'(1)\\).`, a: k,
      hint: `\\(\\ln y=${k}x\\ln x\\).`, steps: `\\(\\dfrac{y'}y=${k}(\\ln x+1)\\). At 1: \\(y=1\\), so \\(y'=${k}\\).` }; },
  () => ({ q: `\\(y=(\\ln x)^x\\). Find \\(y'(e)\\).`, a: 1,
      hint: `\\(\\ln y=x\\ln(\\ln x)\\).`, steps: `\\(\\dfrac{y'}y=\\ln(\\ln x)+\\dfrac1{\\ln x}\\). At \\(e\\): \\(y=1\\), \\(\\tfrac{y'}{y}=0+1\\), so \\(y'=1\\).` }),
  () => { const b = pick([2, 3, 10]), c = R(1, 5), a = R(1, 3);
    return { q: `\\(f(x)=\\log_{${b}}(x^2+${c})\\). Find \\(f'(${a})\\). (Type ln as ln, e.g. 2/(5ln(3)).)`, a: (2 * a) / ((a * a + c) * Math.log(b)),
      hint: `\\((\\log_b u)'=\\dfrac{u'}{u\\ln b}\\).`, steps: `\\(\\dfrac{2x}{(x^2+${c})\\ln ${b}}\\) at ${a}: \\(\\dfrac{${2 * a}}{${a * a + c}\\ln ${b}}\\approx${num((2 * a) / ((a * a + c) * Math.log(b)))}\\).` }; },
  () => { const [x, s] = pick([[0, "0"], [PI / 3, "\\tfrac\\pi3"], [PI / 4, "\\tfrac\\pi4"]]);
    return { q: `\\(y=\\ln|\\sec x+\\tan x|\\). Find \\(y'(${s})\\).`, a: 1 / Math.cos(x),
      hint: `\\(\\dfrac{\\sec x\\tan x+\\sec^2x}{\\sec x+\\tan x}\\) simplifies nicely.`, steps: `Factor \\(\\sec x\\) from the top: \\(y'=\\sec x\\approx${num(1 / Math.cos(x))}\\).` }; },
  () => { const a = R(2, 4), b = R(1, 3);
    return { q: `\\(y=\\dfrac{x^{${a}}\\sqrt{x+3}}{(x+1)^{${b}}}\\). Use logarithmic differentiation to find \\(y'(1)\\).`,
      a: (2 / 2 ** b) * (a + 1 / 8 - b / 2),
      hint: `\\(\\ln y=${a}\\ln x+\\tfrac12\\ln(x+3)-${b}\\ln(x+1)\\).`,
      steps: `\\(\\dfrac{y'}y=\\dfrac{${a}}x+\\dfrac1{2(x+3)}-\\dfrac{${b}}{x+1}\\). At 1: \\(y=\\dfrac{2}{2^{${b}}}\\) and \\(\\tfrac{y'}y=${a}+\\tfrac18-\\tfrac{${b}}2\\), so \\(y'\\approx${num((2 / 2 ** b) * (a + 1 / 8 - b / 2))}\\).` }; },
])();

TB["3.9 Related rates (book)"] = () => pick([
  () => { const V = pick([50, 100, 200]), d = pick([10, 20, 50]), r = d / 2;
    return { q: `Air is pumped into a spherical balloon at \\(${V}\\text{ cm}^3/\\text{s}\\). How fast is the radius increasing when the diameter is \\(${d}\\) cm? (cm/s)`, a: V / (4 * PI * r * r),
      hint: `\\(V=\\tfrac43\\pi r^3\\Rightarrow V'=4\\pi r^2r'\\).`, steps: `\\(r'=\\dfrac{${V}}{4\\pi(${r})^2}=\\dfrac{${V}}{${4 * r * r}\\pi}\\approx${num(V / (4 * PI * r * r))}\\).` }; },
  () => { const Rr = pick([2, 3]), H = pick([4, 6]), Q = R(1, 4), h = R(2, H - 1);
    const v = (Q * H * H) / (PI * Rr * Rr * h * h);
    return { q: `A water tank is an inverted cone with base radius ${Rr} m and height ${H} m. Water flows in at ${Q} m³/min. How fast is the water level rising when the water is ${h} m deep? (m/min)`, a: v,
      hint: `Similar triangles: \\(r=\\tfrac{${Rr}}{${H}}h\\). Then \\(V=\\tfrac13\\pi r^2h\\) in terms of \\(h\\) only.`,
      steps: `\\(V=\\dfrac{\\pi ${Rr * Rr}}{3\\cdot${H * H}}h^3\\Rightarrow V'=\\dfrac{\\pi ${Rr * Rr}}{${H * H}}h^2h'\\). \\(h'=\\dfrac{${Q}\\cdot${H * H}}{\\pi\\cdot${Rr * Rr}\\cdot${h * h}}\\approx${num(v)}\\).` }; },
  () => { const L = pick([5, 6, 8]), m = 2, v = R(1, 3), ask = pick(["tip", "len"]);
    const a = ask === "tip" ? (v * L) / (L - m) : (v * m) / (L - m);
    return { q: `A street light is ${L} m high. A ${m} m tall person walks away from it at ${v} m/s. How fast is ${ask === "tip" ? "the tip of the shadow moving" : "the shadow getting longer"}? (m/s)`, a,
      hint: `Similar triangles: if \\(x\\) is the person's distance and \\(s\\) the shadow length, \\(\\dfrac{${L}}{x+s}=\\dfrac{${m}}{s}\\).`,
      steps: `\\(${L}s=${m}(x+s)\\Rightarrow s=\\dfrac{${m}}{${L - m}}x\\). Shadow length rate \\(s'=\\dfrac{${m}}{${L - m}}\\cdot${v}\\); tip rate \\(x'+s'=\\dfrac{${L}}{${L - m}}\\cdot${v}\\). Answer \\(\\approx${num(a)}\\).` }; },
  () => { const [x, y] = pick([[0.3, 0.4], [0.6, 0.8], [3, 4], [5, 12]]), va = pick([50, 60, 80]), vb = pick([40, 60, 90]);
    const z = Math.hypot(x, y), rate = -(x * va + y * vb) / z;
    return { q: `Car A drives west at ${va} km/h and car B north at ${vb} km/h, both toward the same intersection. How fast is the distance between them changing when A is ${x} km and B is ${y} km from it? (km/h, negative if shrinking)`, a: rate,
      hint: `\\(z^2=x^2+y^2\\Rightarrow zz'=xx'+yy'\\), with \\(x'=-${va}\\), \\(y'=-${vb}\\).`,
      steps: `\\(z=${num(z)}\\). \\(z'=\\dfrac{${x}(-${va})+${y}(-${vb})}{${num(z)}}=${num(rate)}\\).` }; },
])();

TB["3.10 Linear approximation (book)"] = () => pick([
  () => { const d = pick([0.1, 0.2, -0.1, -0.3, 0.5]);
    return { q: `Use a linear approximation of \\(\\sqrt[3]x\\) at \\(a=27\\) to estimate \\(\\sqrt[3]{${num(27 + d)}}\\).`, a: 3 + d / 27,
      hint: `\\(L(x)=3+\\tfrac1{27}(x-27)\\) because \\(f'(27)=\\tfrac13\\cdot27^{-2/3}=\\tfrac1{27}\\).`, steps: `\\(L(${num(27 + d)})=3+\\tfrac{${d}}{27}\\approx${num(3 + d / 27)}\\).` }; },
  () => { const d = pick([-0.2, -0.1, 0.3, 0.2]);
    return { q: `Use a linear approximation to estimate \\(\\sqrt{${num(100 + d)}}\\).`, a: 10 + d / 20,
      hint: `Use \\(a=100\\): \\(f'(100)=\\tfrac1{20}\\).`, steps: `\\(10+\\tfrac{${d}}{20}=${num(10 + d / 20)}\\).` }; },
  () => { const d = pick([-0.001, 0.002, -0.002]);
    return { q: `Use a linear approximation to estimate \\((${num(2 + d)})^4\\).`, a: 16 + 32 * d,
      hint: `At \\(a=2\\): \\(f(2)=16\\), \\(f'(2)=32\\).`, steps: `\\(16+32(${d})=${num(16 + 32 * d)}\\).` }; },
  () => { const d = pick([-0.015, 0.02, -0.04]);
    return { q: `Use a linear approximation to estimate \\(e^{${d}}\\).`, a: 1 + d,
      hint: `At \\(a=0\\): \\(L(x)=1+x\\).`, steps: `\\(1+(${d})=${num(1 + d)}\\).` }; },
])();

/* ---------------- Chapter 4 ---------------- */

TB["4.1 Closed interval (book)"] = () => pick([
  () => { const k = R(2, 4), want = pick(["maximum", "minimum"]);
    const f = (x) => x - k * Math.log(x), vals = [f(1), f(k), f(k + 2)];
    const ans = want === "maximum" ? Math.max(...vals) : Math.min(...vals);
    return { q: `Find the absolute ${want} value of \\(f(x)=x-${k}\\ln x\\) on \\([1,${k + 2}]\\).`, a: ans,
      hint: `\\(f'(x)=1-\\frac{${k}}{x}\\).`,
      steps: `Critical: \\(x=${k}\\). \\(f(1)=1\\), \\(f(${k})=${k}-${k}\\ln${k}\\approx${num(vals[1])}\\), \\(f(${k + 2})=${k + 2}-${k}\\ln${k + 2}\\approx${num(vals[2])}\\). The ${want} is \\(\\approx${num(ans)}\\).` }; },
  () => { const b = R(2, 4), want = pick(["maximum", "minimum"]);
    return { q: `Find the absolute ${want} value of \\(f(x)=xe^{-x}\\) on \\([0,${b}]\\).`, a: want === "maximum" ? 1 / E : 0,
      hint: `\\(f'(x)=e^{-x}(1-x)\\).`, steps: `Critical \\(x=1\\): \\(f(1)=e^{-1}\\approx0.3679\\). \\(f(0)=0\\), \\(f(${b})=${b}e^{-${b}}\\approx${num(b * Math.exp(-b))}\\). Max \\(e^{-1}\\), min 0.` }; },
  () => { const want = pick(["maximum", "minimum"]);
    return { q: `Find the absolute ${want} value of \\(f(t)=2\\cos t+\\sin 2t\\) on \\([0,\\tfrac\\pi2]\\).`, a: want === "maximum" ? (3 * Math.sqrt(3)) / 2 : 0,
      hint: `\\(f'=-2\\sin t+2\\cos2t\\); use \\(\\cos2t=1-2\\sin^2t\\).`,
      steps: `\\(1-2\\sin^2t=\\sin t\\Rightarrow(2\\sin t-1)(\\sin t+1)=0\\Rightarrow t=\\tfrac\\pi6\\). \\(f(\\tfrac\\pi6)=\\tfrac{3\\sqrt3}2\\approx2.598\\), \\(f(0)=2\\), \\(f(\\tfrac\\pi2)=0\\).` }; },
  () => { const want = pick(["maximum", "minimum"]);
    return { q: `Find the absolute ${want} value of \\(f(x)=\\dfrac{x}{x^2-x+1}\\) on \\([0,3]\\).`, a: want === "maximum" ? 1 : 0,
      hint: `Quotient rule: the top simplifies to \\(1-x^2\\).`, steps: `Critical \\(x=1\\) (\\(-1\\) is outside). \\(f(0)=0\\), \\(f(1)=1\\), \\(f(3)=\\tfrac37\\). Max 1, min 0.` }; },
  () => { const want = pick(["maximum", "minimum"]);
    return { q: `Find the absolute ${want} value of \\(f(x)=(x^2-1)^3\\) on \\([-1,2]\\).`, a: want === "maximum" ? 27 : -1,
      hint: `\\(f'=6x(x^2-1)^2\\).`, steps: `Critical: \\(-1,0,1\\). Values \\(f(-1)=0\\), \\(f(0)=-1\\), \\(f(1)=0\\), \\(f(2)=27\\). Max 27, min \\(-1\\).` }; },
  () => { const want = pick(["maximum", "minimum"]);
    return { q: `Find the absolute ${want} value of \\(f(x)=x^2e^{-x}\\) on \\([-1,3]\\).`, a: want === "maximum" ? E : 0,
      hint: `\\(f'=xe^{-x}(2-x)\\).`, steps: `Critical 0 and 2. \\(f(-1)=e\\approx2.718\\), \\(f(0)=0\\), \\(f(2)=4e^{-2}\\approx0.541\\), \\(f(3)=9e^{-3}\\approx0.448\\). Max \\(e\\), min 0.` }; },
])();

TB["4.2 Mean Value Theorem (book)"] = () => pick([
  () => { const b = R(2, 5);
    return { q: `Find the \\(c\\) that satisfies the MVT for \\(f(x)=\\sqrt x\\) on \\([0,${b * b}]\\).`, a: (b * b) / 4,
      hint: `\\(\\frac{1}{2\\sqrt c}=\\frac{f(${b * b})-f(0)}{${b * b}}\\).`, steps: `Average slope \\(\\tfrac{${b}}{${b * b}}=\\tfrac1{${b}}\\). \\(2\\sqrt c=${b}\\Rightarrow c=${frac(b * b, 4)}\\).` }; },
  () => { const b = R(2, 4);
    return { q: `Find the \\(c\\) that satisfies the MVT for \\(f(x)=x^3-x\\) on \\([0,${b}]\\).`, a: b / Math.sqrt(3),
      hint: `Average slope \\(=\\frac{f(${b})-f(0)}{${b}}\\); solve \\(3c^2-1=\\) that.`, steps: `Average slope \\(${b * b - 1}\\). \\(3c^2=${b * b}\\Rightarrow c=\\tfrac{${b}}{\\sqrt3}\\approx${num(b / Math.sqrt(3))}\\).` }; },
  () => { const b = R(2, 9);
    return { q: `Find the \\(c\\) that satisfies the MVT for \\(f(x)=\\dfrac1x\\) on \\([1,${b}]\\).`, a: Math.sqrt(b),
      hint: `Average slope \\(\\frac{1/${b}-1}{${b}-1}\\) simplifies to \\(-\\frac1{${b}}\\).`, steps: `\\(-\\dfrac1{c^2}=-\\dfrac1{${b}}\\Rightarrow c=\\sqrt{${b}}\\approx${num(Math.sqrt(b))}\\).` }; },
  () => { const b = R(1, 3);
    return { q: `Find the \\(c\\) that satisfies the MVT for \\(f(x)=e^{x}\\) on \\([0,${b}]\\).`, a: Math.log((Math.exp(b) - 1) / b),
      hint: `Solve \\(e^c=\\frac{e^{${b}}-1}{${b}}\\).`, steps: `\\(c=\\ln\\dfrac{e^{${b}}-1}{${b}}\\approx${num(Math.log((Math.exp(b) - 1) / b))}\\).` }; },
])();

TB["4.3 Shape & inflection (book)"] = () => pick([
  () => ({ q: `Find the x-coordinate of the inflection point of \\(f(x)=xe^{-x}\\).`, a: 2,
      hint: `\\(f''(x)=e^{-x}(x-2)\\).`, steps: `\\(f'=e^{-x}(1-x)\\), \\(f''=e^{-x}(x-2)\\), sign changes at \\(x=2\\).` }),
  () => { const ask = pick(["min", "infl"]);
    return { q: ask === "min" ? `Find the x-coordinate of the local minimum of \\(f(x)=x^2\\ln x\\).` : `Find the x-coordinate of the inflection point of \\(f(x)=x^2\\ln x\\).`,
      a: ask === "min" ? Math.exp(-0.5) : Math.exp(-1.5),
      hint: `\\(f'=x(2\\ln x+1)\\), \\(f''=2\\ln x+3\\).`,
      steps: ask === "min" ? `\\(2\\ln x+1=0\\Rightarrow x=e^{-1/2}\\approx0.6065\\).` : `\\(2\\ln x+3=0\\Rightarrow x=e^{-3/2}\\approx0.2231\\).` }; },
  () => { const ask = pick(["minval", "infl"]);
    return { q: ask === "minval" ? `Find the local minimum <b>value</b> of \\(f(x)=x^4-4x^3\\).` : `\\(f(x)=x^4-4x^3\\) has inflection points at \\(x=0\\) and \\(x=c>0\\). Find \\(c\\).`,
      a: ask === "minval" ? -27 : 2,
      hint: `\\(f'=4x^2(x-3)\\), \\(f''=12x(x-2)\\).`,
      steps: ask === "minval" ? `\\(f'\\) changes \\(-\\to+\\) only at 3 (not at 0). \\(f(3)=81-108=-27\\).` : `\\(f''=0\\) at 0 and 2, and changes sign at both, so \\(c=2\\).` }; },
  () => ({ q: `On \\([0,2\\pi]\\), at which \\(x\\) does \\(f(x)=x+2\\cos x\\) have a local maximum?`, a: PI / 6,
      hint: `\\(f'=1-2\\sin x\\), \\(f''=-2\\cos x\\).`, steps: `\\(\\sin x=\\tfrac12\\Rightarrow x=\\tfrac\\pi6,\\tfrac{5\\pi}6\\). \\(f''(\\tfrac\\pi6)<0\\): local max at \\(\\tfrac\\pi6\\approx0.5236\\).` }),
  () => { const k = pick([3, 12, 27]), c = Math.sqrt(k / 3);
    return { q: `\\(f(x)=\\dfrac{x^2}{x^2+${k}}\\). Find the positive x-coordinate of an inflection point.`, a: c,
      hint: `\\(f'=\\dfrac{${2 * k}x}{(x^2+${k})^2}\\). Differentiate again and solve \\(f''=0\\).`,
      steps: `\\(f''=\\dfrac{${2 * k}(${k}-3x^2)}{(x^2+${k})^3}=0\\Rightarrow x^2=${k / 3}\\Rightarrow x=${num(c)}\\).` }; },
])();

TB["4.4 L'Hôpital (book)"] = () => pick([
  () => { const k = R(1, 5);
    return { q: `\\(\\displaystyle\\lim_{x\\to0}\\frac{e^{${k}x}-1-${k}x}{x^2}\\)`, a: (k * k) / 2,
      hint: `0/0 twice.`, steps: `\\(\\dfrac{${k}e^{${k}x}-${k}}{2x}\\to\\dfrac{${k * k}e^{${k}x}}{2}\\to\\dfrac{${k * k}}2\\).` }; },
  () => ({ q: `\\(\\displaystyle\\lim_{x\\to0}\\frac{\\tan x-x}{x^3}\\)`, a: 1 / 3,
      hint: `L'Hôpital, then use \\(\\sec^2x-1=\\tan^2x\\).`, steps: `\\(\\dfrac{\\sec^2x-1}{3x^2}=\\dfrac{\\tan^2x}{3x^2}\\to\\tfrac13\\).` }),
  () => { const a = R(1, 4), b = R(1, 3);
    return { q: `\\(\\displaystyle\\lim_{x\\to\\infty}\\left(1+\\frac{${a}}{x}\\right)^{${b}x}\\)`, a: Math.exp(a * b),
      hint: `Form \\(1^\\infty\\): take \\(\\ln\\): \\(${b}x\\ln(1+\\tfrac{${a}}x)\\).`, steps: `\\(\\ln y=\\dfrac{${b}\\ln(1+${a}/x)}{1/x}\\to${a * b}\\), so the limit is \\(e^{${a * b}}\\).` }; },
  () => ({ q: `\\(\\displaystyle\\lim_{x\\to0^+}x^x\\)`, a: 1,
      hint: `Form \\(0^0\\): \\(\\ln y=x\\ln x=\\frac{\\ln x}{1/x}\\).`, steps: `\\(\\dfrac{1/x}{-1/x^2}=-x\\to0\\), so \\(\\ln y\\to0\\) and \\(y\\to e^0=1\\).` }),
  () => ({ q: `\\(\\displaystyle\\lim_{x\\to0}\\frac{x-\\sin x}{x^3}\\)`, a: 1 / 6,
      hint: `Three rounds of L'Hôpital.`, steps: `\\(\\dfrac{1-\\cos x}{3x^2}\\to\\dfrac{\\sin x}{6x}\\to\\tfrac16\\).` }),
  () => { const a = R(2, 7), b = R(2, 7);
    return { q: `\\(\\displaystyle\\lim_{x\\to1}\\frac{x^{${a}}-1}{x^{${b}}-1}\\)`, a: a / b,
      hint: `0/0: differentiate top and bottom.`, steps: `\\(\\dfrac{${a}x^{${a - 1}}}{${b}x^{${b - 1}}}\\to${frac(a, b)}\\).` }; },
  () => ({ q: `\\(\\displaystyle\\lim_{x\\to0}\\left(\\frac1x-\\frac1{e^x-1}\\right)\\)`, a: 0.5,
      hint: `Form \\(\\infty-\\infty\\): common denominator first.`, steps: `\\(\\dfrac{e^x-1-x}{x(e^x-1)}\\to\\dfrac{e^x-1}{e^x-1+xe^x}\\to\\dfrac{e^x}{2e^x+xe^x}\\to\\tfrac12\\).` }),
  () => { const k = R(1, 5);
    return { q: `\\(\\displaystyle\\lim_{x\\to0^+}(1+\\sin ${k}x)^{1/x}\\)`, a: Math.exp(k),
      hint: `\\(\\ln y=\\frac{\\ln(1+\\sin ${k}x)}{x}\\).`, steps: `\\(\\dfrac{${k}\\cos ${k}x/(1+\\sin ${k}x)}{1}\\to${k}\\), so the limit is \\(e^{${k}}\\).` }; },
])();

TB["4.7 Optimization (book)"] = () => pick([
  () => { const P = pick([1200, 2400, 600, 800]);
    return { q: `A farmer has ${P} m of fencing to fence a rectangle beside a straight river (no fence along the river). What is the largest area (m²)?`, a: (P * P) / 8,
      hint: `Sides \\(x,y,x\\) with \\(2x+y=${P}\\). Maximize \\(A=x(${P}-2x)\\).`, steps: `\\(A'=${P}-4x=0\\Rightarrow x=${P / 4}\\), \\(y=${P / 2}\\). \\(A=${(P * P) / 8}\\).` }; },
  () => { const [V, x] = pick([[4, 2], [32, 4], [108, 6], [256, 8]]);
    return { q: `An open-top box with a square base must hold ${V} cm³. What is the smallest possible surface area (cm²)?`, a: 3 * x * x,
      hint: `Base \\(x\\times x\\), height \\(h=\\frac{${V}}{x^2}\\). \\(S=x^2+4xh=x^2+\\frac{${4 * V}}x\\).`, steps: `\\(S'=2x-\\dfrac{${4 * V}}{x^2}=0\\Rightarrow x^3=${2 * V}\\Rightarrow x=${x}\\). \\(S=${x * x}+${(4 * V) / x}=${3 * x * x}\\).` }; },
  () => { const m = nz(-3, 3), c = nz(-6, 6);
    return { q: `Find the x-coordinate of the point on the line \\(y=${m}x ${sgn(c)}\\) closest to the origin.`, a: (-m * c) / (1 + m * m),
      hint: `Minimize the squared distance \\(D=x^2+(${m}x ${sgn(c)})^2\\).`, steps: `\\(D'=2x+2${m}(${m}x ${sgn(c)})=0\\Rightarrow x=\\dfrac{${-m * c}}{${1 + m * m}}\\).` }; },
  () => { const r = R(2, 9);
    return { q: `Find the largest area of a rectangle inscribed in a semicircle of radius ${r}.`, a: r * r,
      hint: `Corner at \\((x,\\sqrt{${r * r}-x^2})\\); \\(A=2x\\sqrt{${r * r}-x^2}\\).`, steps: `Maximum at \\(x=\\tfrac{${r}}{\\sqrt2}\\), giving \\(A=${r * r}\\).` }; },
  () => { const k = R(2, 6), ask = pick(["r", "S"]);
    return { q: `A closed cylindrical can must hold \\(${2 * k ** 3}\\pi\\) cm³. ${ask === "r" ? "What radius (cm) minimizes the material used?" : "What is the smallest possible surface area? (type e.g. 54pi)"}`, a: ask === "r" ? k : 6 * PI * k * k,
      hint: `\\(h=\\frac{V}{\\pi r^2}\\); \\(S=2\\pi r^2+2\\pi rh=2\\pi r^2+\\frac{2V}{r}\\).`, steps: `\\(S'=4\\pi r-\\dfrac{2V}{r^2}=0\\Rightarrow r^3=\\dfrac{V}{2\\pi}=${k ** 3}\\Rightarrow r=${k}\\), \\(h=${2 * k}\\), \\(S=${6 * k * k}\\pi\\).` }; },
  () => { const a = pick([1, 2, 3, 5]);
    return { q: `Find the minimum distance from the point \\((0,${a})\\) to the parabola \\(y=x^2\\).`, a: Math.sqrt(a - 0.25),
      hint: `Minimize \\(D=x^2+(x^2-${a})^2\\); use \\(u=x^2\\).`, steps: `\\(D=u+(u-${a})^2\\), \\(D'=1+2(u-${a})=0\\Rightarrow u=${a - 0.5}\\). \\(D=${a - 0.5}+\\tfrac14\\Rightarrow\\) distance \\(\\sqrt{${a - 0.25}}\\approx${num(Math.sqrt(a - 0.25))}\\).` }; },
])();

TB["4.9 Antiderivatives (book)"] = () => pick([
  () => { const a = R(1, 4), b = nz(-5, 5), c = nz(-6, 6), C0 = R(-5, 9);
    return { q: `Find \\(f(x)\\) if \\(f'(x)=${3 * a}x^2 ${b < 0 ? "-" : "+"} ${Math.abs(2 * b)}x ${c < 0 ? "-" : "+"} ${Math.abs(c)}\\) and \\(f(0)=${C0}\\).`,
      ans: `${a}x^3+(${b})x^2+(${c})x+(${C0})`, tex: `${a}x^3 ${b < 0 ? "-" : "+"} ${Math.abs(b)}x^2 ${c < 0 ? "-" : "+"} ${Math.abs(c)}x ${C0 < 0 ? "-" : "+"} ${Math.abs(C0)}`,
      hint: `Reverse the power rule term by term, add \\(C\\), then use \\(f(0)\\).`, steps: `\\(f=${a}x^3${b < 0 ? "-" : "+"}${Math.abs(b)}x^2${c < 0 ? "-" : "+"}${Math.abs(c)}x+C\\), and \\(f(0)=C=${C0}\\).` }; },
  () => { const C0 = R(-3, 6);
    return { q: `Find \\(f(x)\\) if \\(f'(x)=\\cos x+e^x\\) and \\(f(0)=${C0}\\).`, ans: `sin x+e^x+(${C0 - 1})`, tex: `\\sin x+e^x ${C0 - 1 < 0 ? "-" : "+"} ${Math.abs(C0 - 1)}`,
      hint: `\\(\\int\\cos x=\\sin x\\), \\(\\int e^x=e^x\\); careful: \\(e^0=1\\).`, steps: `\\(f=\\sin x+e^x+C\\); \\(f(0)=0+1+C=${C0}\\Rightarrow C=${C0 - 1}\\).` }; },
  () => { const k = R(2, 4), C0 = R(0, 5);
    return { q: `Find \\(f(x)\\) for \\(x>0\\) if \\(f'(x)=\\dfrac{${k}}{x}+\\sqrt x\\) and \\(f(1)=${C0}\\).`, ans: `${k}ln x+(2/3)x^(3/2)+(${C0}-2/3)`, tex: `${k}\\ln x+\\tfrac23x^{3/2}+${C0}-\\tfrac23`,
      hint: `\\(\\int\\frac1x=\\ln x\\), \\(\\int x^{1/2}=\\tfrac23x^{3/2}\\).`, steps: `\\(f=${k}\\ln x+\\tfrac23x^{3/2}+C\\); \\(f(1)=\\tfrac23+C=${C0}\\).` }; },
])();
