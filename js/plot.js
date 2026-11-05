// Small canvas plotter: world coordinates, grid, curves, points, labels.
export const COLORS = {
  ch1: "#2dd4bf", ch2: "#a78bfa", ch3: "#fbbf24", ch4: "#fb7185",
  brand: "#60a5fa", text: "#e7ecf7", muted: "#9aa6c4", orange: "#fb923c",
};

function niceStep(range) {
  const raw = range / 8;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

function fmt(v, step) {
  const d = Math.max(0, -Math.floor(Math.log10(step)));
  return Number(v.toFixed(d)).toString();
}

export class Plot {
  constructor(canvas, view) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.v = { ...view };
    this.resize();
  }

  resize() {
    const r = this.c.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    this.w = Math.max(1, r.width);
    this.h = Math.max(1, r.height);
    this.c.width = Math.round(this.w * d);
    this.c.height = Math.round(this.h * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0);
  }

  X(x) { return ((x - this.v.xmin) / (this.v.xmax - this.v.xmin)) * this.w; }
  Y(y) { return this.h - ((y - this.v.ymin) / (this.v.ymax - this.v.ymin)) * this.h; }
  toX(px) { return this.v.xmin + (px / this.w) * (this.v.xmax - this.v.xmin); }

  clear() {
    const { ctx, v } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.lineWidth = 1;
    ctx.font = "11px Inter, sans-serif";
    const sx = niceStep(v.xmax - v.xmin), sy = niceStep(v.ymax - v.ymin);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.fillStyle = COLORS.muted;
    ctx.beginPath();
    for (let x = Math.ceil(v.xmin / sx) * sx; x <= v.xmax; x += sx) { ctx.moveTo(this.X(x), 0); ctx.lineTo(this.X(x), this.h); }
    for (let y = Math.ceil(v.ymin / sy) * sy; y <= v.ymax; y += sy) { ctx.moveTo(0, this.Y(y)); ctx.lineTo(this.w, this.Y(y)); }
    ctx.stroke();
    // axes
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.beginPath();
    const ax = Math.min(Math.max(this.Y(0), 0), this.h), ay = Math.min(Math.max(this.X(0), 0), this.w);
    ctx.moveTo(0, ax); ctx.lineTo(this.w, ax);
    ctx.moveTo(ay, 0); ctx.lineTo(ay, this.h);
    ctx.stroke();
    // tick labels
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    for (let x = Math.ceil(v.xmin / sx) * sx; x <= v.xmax; x += sx) {
      if (Math.abs(x) < sx / 2 || this.X(x) < 14 || this.X(x) > this.w - 14) continue;
      ctx.fillText(fmt(x, sx), this.X(x), Math.min(ax + 4, this.h - 14));
    }
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let y = Math.ceil(v.ymin / sy) * sy; y <= v.ymax; y += sy) {
      if (Math.abs(y) < sy / 2 || this.Y(y) < 10 || this.Y(y) > this.h - 10) continue;
      ctx.fillText(fmt(y, sy), Math.max(ay - 5, 26), this.Y(y));
    }
  }

  fn(f, { color = COLORS.brand, width = 2.5, from = this.v.xmin, to = this.v.xmax, dash = null, alpha = 1 } = {}) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha;
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    const n = Math.max(200, Math.round(this.w * 1.5));
    let pen = false, lastY = null;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      const y = f(x);
      if (!Number.isFinite(y) || Math.abs(y) > 1e6) { pen = false; continue; }
      const py = this.Y(y);
      if (pen && lastY !== null && Math.abs(py - lastY) > this.h * 2) pen = false;
      if (pen) ctx.lineTo(this.X(x), py); else ctx.moveTo(this.X(x), py);
      pen = true; lastY = py;
    }
    ctx.stroke();
    ctx.restore();
  }

  seg(x1, y1, x2, y2, { color = COLORS.text, width = 2, dash = null, alpha = 1 } = {}) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.globalAlpha = alpha;
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); ctx.moveTo(this.X(x1), this.Y(y1)); ctx.lineTo(this.X(x2), this.Y(y2)); ctx.stroke();
    ctx.restore();
  }

  // Line through (x0, y0) with slope m, across the whole view.
  line(x0, y0, m, opts) {
    this.seg(this.v.xmin, y0 + m * (this.v.xmin - x0), this.v.xmax, y0 + m * (this.v.xmax - x0), opts);
  }

  dot(x, y, color = COLORS.text, { r = 5, open = false, glow = true } = {}) {
    const { ctx } = this;
    ctx.save();
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 12; }
    ctx.beginPath(); ctx.arc(this.X(x), this.Y(y), r, 0, Math.PI * 2);
    if (open) { ctx.fillStyle = "#0b1020"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = color; ctx.stroke(); }
    else { ctx.fillStyle = color; ctx.fill(); }
    ctx.restore();
  }

  label(text, x, y, { color = COLORS.text, align = "left", dx = 8, dy = -8, size = 12 } = {}) {
    const { ctx } = this;
    ctx.save();
    ctx.font = `600 ${size}px Inter, sans-serif`;
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = "bottom";
    ctx.fillText(text, this.X(x) + dx, this.Y(y) + dy);
    ctx.restore();
  }

  band(x1, x2, color, alpha = 0.12) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = color; ctx.globalAlpha = alpha;
    ctx.fillRect(this.X(x1), 0, this.X(x2) - this.X(x1), this.h);
    ctx.restore();
  }

  // Zero set of F(x, y) by marching squares.
  implicit(F, { color = COLORS.brand, width = 2.5, cells = 220 } = {}) {
    const { ctx, v } = this;
    const nx = cells, ny = Math.round(cells * (this.h / this.w));
    const dx = (v.xmax - v.xmin) / nx, dy = (v.ymax - v.ymin) / ny;
    const val = [];
    for (let j = 0; j <= ny; j++) {
      val.push([]);
      for (let i = 0; i <= nx; i++) val[j].push(F(v.xmin + i * dx, v.ymin + j * dy));
    }
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = "round";
    ctx.beginPath();
    const lerp = (a, b) => a / (a - b);
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const a = val[j][i], b = val[j][i + 1], c = val[j + 1][i + 1], d = val[j + 1][i];
        const x0 = v.xmin + i * dx, y0 = v.ymin + j * dy;
        const pts = [];
        if (a * b < 0) pts.push([x0 + lerp(a, b) * dx, y0]);
        if (b * c < 0) pts.push([x0 + dx, y0 + lerp(b, c) * dy]);
        if (d * c < 0) pts.push([x0 + lerp(d, c) * dx, y0 + dy]);
        if (a * d < 0) pts.push([x0, y0 + lerp(a, d) * dy]);
        for (let k = 0; k + 1 < pts.length; k += 2) {
          ctx.moveTo(this.X(pts[k][0]), this.Y(pts[k][1]));
          ctx.lineTo(this.X(pts[k + 1][0]), this.Y(pts[k + 1][1]));
        }
      }
    }
    ctx.stroke();
    ctx.restore();
  }
}
