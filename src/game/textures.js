import { setMatrixText } from './matrix_font.js';
// FRONTLINE - textures, painted in code at start-up.
// No image files: every surface is drawn here, so it all belongs to the game.

// Small deterministic random, so the yard looks the same every time.
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function canvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
function speckle(g, w, h, n, col, alpha, size, r) {
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    g.globalAlpha = alpha * (0.4 + r() * 0.6);
    const s = size * (0.5 + r());
    g.fillRect(r() * w, r() * h, s, s);
  }
  g.globalAlpha = 1;
}
function blotches(g, w, h, n, col, alpha, rad, r) {
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, rr = rad * (0.4 + r());
    const gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, col.replace('A', String(alpha)));
    gr.addColorStop(1, col.replace('A', '0'));
    g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
}
function edgeDirt(g, w, h, strength) {
  const gr = g.createLinearGradient(0, h, 0, h * 0.55);
  gr.addColorStop(0, `rgba(40,32,24,${strength})`); gr.addColorStop(1, 'rgba(40,32,24,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
}

const PAINT = {
  concrete(g, w, h, r) {
    g.fillStyle = '#8d8b85'; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 30, 'rgba(60,58,52,A)', 0.18, 90, r);
    blotches(g, w, h, 20, 'rgba(170,168,160,A)', 0.12, 70, r);
    speckle(g, w, h, 5000, '#5d5b55', 0.35, 2, r);
    speckle(g, w, h, 3000, '#b0aea6', 0.3, 1.5, r);
    // slab joints
    g.strokeStyle = 'rgba(45,43,40,0.75)'; g.lineWidth = 3;
    g.strokeRect(1.5, 1.5, w - 3, h - 3);
    g.strokeStyle = 'rgba(160,158,150,0.35)'; g.lineWidth = 1;
    g.strokeRect(4, 4, w - 8, h - 8);
    // oil stains
    blotches(g, w, h, 4, 'rgba(30,28,26,A)', 0.25, 40, r);
  },
  concrete2(g, w, h, r) {
    g.fillStyle = '#a7a59e'; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 18, 'rgba(90,88,82,A)', 0.14, 70, r);
    speckle(g, w, h, 4000, '#7c7a74', 0.3, 1.6, r);
    g.strokeStyle = 'rgba(60,58,54,0.6)'; g.lineWidth = 2;
    for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(0, i * h / 2); g.lineTo(w, i * h / 2); g.stroke(); }
  },
  wall(g, w, h, r) {
    // concrete block courses
    g.fillStyle = '#7b7e80'; g.fillRect(0, 0, w, h);
    const bh = h / 8, bw = w / 4;
    for (let row = 0; row < 8; row++) {
      for (let col = -1; col < 5; col++) {
        const x = col * bw + (row % 2) * bw / 2, y = row * bh;
        const v = 110 + Math.floor(r() * 25);
        g.fillStyle = `rgb(${v},${v + 3},${v + 6})`;
        g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
      }
    }
    speckle(g, w, h, 3000, '#4f5254', 0.3, 1.6, r);
    edgeDirt(g, w, h, 0.35);
  },
  metal(g, w, h, r) {
    g.fillStyle = '#4b5057'; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 20, 'rgba(30,32,36,A)', 0.25, 60, r);
    g.strokeStyle = 'rgba(160,170,180,0.18)'; g.lineWidth = 1;
    for (let i = 0; i < 120; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 40 - 20, y + r() * 6 - 3); g.stroke(); }
    speckle(g, w, h, 1200, '#8a5a30', 0.25, 2, r);
  },
  grating(g, w, h) {
    g.fillStyle = '#23262a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5c636b';
    const s = w / 16;
    for (let i = 0; i < 16; i++) { g.fillRect(i * s, 0, s * 0.25, h); g.fillRect(0, i * s, w, s * 0.18); }
    g.strokeStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 4; g.strokeRect(0, 0, w, h);
  },
  rail(g, w, h, r) {
    g.fillStyle = '#d6a21c'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 900, '#6a4a10', 0.35, 2.5, r);
    blotches(g, w, h, 8, 'rgba(90,60,20,A)', 0.25, 30, r);
  },
  hazard(g, w, h) {
    g.fillStyle = '#1b1b1b'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e3b21f';
    const s = w / 4;
    for (let i = -4; i < 8; i++) {
      g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s + s / 2, 0); g.lineTo(i * s + s / 2 + h, h); g.lineTo(i * s + h, h); g.closePath(); g.fill();
    }
  },
  pooltile(g, w, h, r) {
    g.fillStyle = '#b8c6c8'; g.fillRect(0, 0, w, h);
    const n = 8, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const v = 200 + Math.floor(r() * 30);
      g.fillStyle = (y === 3 || y === 4) && x % 4 === 0 ? '#2f6f88' : `rgb(${v - 30},${v},${v + 8})`;
      g.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
    }
  },
  crate(g, w, h, r) {
    g.fillStyle = '#8a6a3e'; g.fillRect(0, 0, w, h);
    const pl = h / 5;
    for (let i = 0; i < 5; i++) {
      const v = 120 + Math.floor(r() * 30);
      g.fillStyle = `rgb(${v + 20},${v - 5},${v - 45})`;
      g.fillRect(0, i * pl + 2, w, pl - 4);
      g.strokeStyle = 'rgba(60,40,20,0.35)';
      for (let k = 0; k < 6; k++) { const y = i * pl + 4 + r() * (pl - 8); g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + r() * 6 - 3); g.stroke(); }
    }
    g.strokeStyle = '#5a4020'; g.lineWidth = w * 0.07; g.strokeRect(w * 0.035, h * 0.035, w * 0.93, h * 0.93);
    g.beginPath(); g.moveTo(w * 0.07, h * 0.07); g.lineTo(w * 0.93, h * 0.93); g.stroke();
    g.fillStyle = 'rgba(20,20,20,0.7)'; g.font = `bold ${Math.floor(h * 0.1)}px sans-serif`; g.textAlign = 'center';
    g.fillText('GHOST LOG.', w * 0.5, h * 0.58);
  },
  // (M6.18.10, Rhys: the van's crates had "Ghost Logistics" on them, "nothing to do with Ghost") the
  // railway's parcels: the same planks, stencilled for where they are going, and a number
  parcel(g, w, h, r) {
    PAINT.crate(g, w, h, r);
    // (over the old mark: two fresh planks)
    for (let i = 0; i < 2; i++) { g.fillStyle = i ? '#a5784a' : '#ad8150'; g.fillRect(w * 0.1, h * (0.45 + i * 0.1), w * 0.8, h * 0.095); }
    g.fillStyle = 'rgba(25,20,15,0.78)'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = `bold ${Math.floor(h * 0.1)}px 'Severia Sans Condensed', 'Arial Narrow', sans-serif`;
    g.fillText('\u0411\u0415\u041b\u042f\u0413\u041e\u0420\u0421\u041a', w * 0.5, h * 0.4);
    g.font = `bold ${Math.floor(h * 0.07)}px 'Severia Sans Condensed', 'Arial Narrow', sans-serif`;
    g.fillText('\u2116 ' + (1000 + Math.floor(r() * 8999)) + ' \u00b7 207', w * 0.5, h * 0.6);
  },
  // (M6.19.0) plain freight crates for the first drafts: no Ghost Logistics mark (Rhys: "nothing to do with Ghost")
  cargo(g, w, h, r) {
    PAINT.crate(g, w, h, r);
    for (let i = 0; i < 2; i++) { g.fillStyle = i ? '#a5784a' : '#ad8150'; g.fillRect(w * 0.1, h * (0.45 + i * 0.1), w * 0.8, h * 0.095); }
    g.fillStyle = 'rgba(25,20,15,0.6)'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = `bold ${Math.floor(h * 0.07)}px 'Severia Sans Condensed', 'Arial Narrow', sans-serif`;
    g.fillText('No ' + (100 + Math.floor(r() * 899)) + '  -  ' + (10 + Math.floor(r() * 80)) + ' KG', w * 0.5, h * 0.62);
  },
  barrel(g, w, h, r) {
    g.fillStyle = '#2d4f7a'; g.fillRect(0, 0, w, h);
    for (const y of [0.18, 0.5, 0.82]) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, y * h - 5, w, 10); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, y * h - 7, w, 2); }
    speckle(g, w, h, 900, '#8a5a30', 0.35, 2.5, r);
    edgeDirt(g, w, h, 0.45);
  },
  board(g, w, h) {
    g.fillStyle = '#e8e8e2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f6f88'; for (let i = 0; i < 8; i++) g.fillRect(i * w / 8, 0, w / 16, h);
  },
  // one rung per tile: the tile is about 0.4 m across the world
  ladder(g, w, h, r) {
    g.fillStyle = '#34393e'; g.fillRect(0, 0, w, h);   // shadowed wall behind the rungs
    // side rails
    g.fillStyle = '#7d848c'; g.fillRect(w * 0.06, 0, w * 0.1, h); g.fillRect(w * 0.84, 0, w * 0.1, h);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(w * 0.06, 0, w * 0.03, h); g.fillRect(w * 0.84, 0, w * 0.03, h);
    // the rung, with a highlight along the top
    g.fillStyle = '#9aa2ab'; g.fillRect(w * 0.06, h * 0.42, w * 0.88, h * 0.16);
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(w * 0.06, h * 0.42, w * 0.88, h * 0.04);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(w * 0.06, h * 0.55, w * 0.88, h * 0.03);
    speckle(g, w, h, 300, '#5a4a30', 0.3, 2, r);
  },
  fence(g, w, h) {
    g.fillStyle = '#15181b'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#8b939a'; g.lineWidth = 2;
    const s = w / 12;
    for (let i = -12; i < 24; i++) {
      g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s + h, h); g.stroke();
      g.beginPath(); g.moveTo(i * s, h); g.lineTo(i * s + h, 0); g.stroke();
    }
    g.fillStyle = '#2f6f88'; g.fillRect(0, h * 0.42, w, h * 0.16);
    g.fillStyle = '#fff'; g.font = `bold ${Math.floor(h * 0.12)}px sans-serif`; g.textAlign = 'center';
    g.fillText('RANGE', w / 2, h * 0.545);
  },
  target(g, w, h) {
    g.fillStyle = '#e9e4d6'; g.fillRect(0, 0, w, h);
    for (let i = 5; i >= 1; i--) { g.beginPath(); g.arc(w / 2, h / 2, i * w * 0.09, 0, Math.PI * 2); g.fillStyle = i % 2 ? '#1f1f1f' : '#e9e4d6'; g.fill(); }
    g.fillStyle = '#c02020'; g.beginPath(); g.arc(w / 2, h / 2, w * 0.045, 0, Math.PI * 2); g.fill();
  },
  // A door override panel, after Rhys's button sheet: dark steel plate,
  // hazard stripes, a guarded red button and a label strip.
  panel(g, w, h, r) {
    g.fillStyle = '#2a2e33'; g.fillRect(0, 0, w, h);
    g.save(); g.beginPath(); g.rect(w * 0.06, h * 0.06, w * 0.88, h * 0.62); g.clip();
    for (let i = -h; i < w + h; i += w * 0.12) {
      g.fillStyle = '#d8a520';
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + w * 0.06, 0); g.lineTo(i + w * 0.06 - h, h); g.lineTo(i - h, h); g.fill();
    }
    g.restore();
    g.fillStyle = '#1b1d20'; g.fillRect(w * 0.2, h * 0.14, w * 0.6, h * 0.46);
    const cx = w / 2, cy = h * 0.37;
    g.fillStyle = '#5a1010'; g.beginPath(); g.arc(cx, cy, w * 0.2, 0, Math.PI * 2); g.fill();
    const grad = g.createRadialGradient(cx - w * 0.05, cy - w * 0.05, 2, cx, cy, w * 0.17);
    grad.addColorStop(0, '#ff6b5a'); grad.addColorStop(1, '#b01818');
    g.fillStyle = grad; g.beginPath(); g.arc(cx, cy, w * 0.16, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0f1113'; g.fillRect(w * 0.1, h * 0.74, w * 0.8, h * 0.18);
    g.fillStyle = '#e8b423'; g.font = `bold ${Math.round(h * 0.1)}px sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('DOOR OVERRIDE', cx, h * 0.83);
    for (const [x, y] of [[0.05, 0.04], [0.95, 0.04], [0.05, 0.96], [0.95, 0.96]]) {
      g.fillStyle = '#6b7178'; g.beginPath(); g.arc(w * x, h * y, w * 0.02, 0, Math.PI * 2); g.fill();
    }
  },
  // Crate markings: plain timber, a Ghost Logistics stencil, and the usual
  // shipping marks. Drawn over whatever the plain crate painter does.
  crateMark(g, w, h, r, kind) {
    const plank = (y0, y1) => {
      g.fillStyle = `rgb(${142 + r() * 26 | 0},${106 + r() * 22 | 0},${62 + r() * 18 | 0})`;
      g.fillRect(0, y0, w, y1 - y0);
      for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(90,62,32,${0.05 + r() * 0.12})`; g.beginPath(); g.moveTo(0, y0 + r() * (y1 - y0)); g.bezierCurveTo(w / 3, y0 + r() * (y1 - y0), 2 * w / 3, y0 + r() * (y1 - y0), w, y0 + r() * (y1 - y0)); g.stroke(); }
    };
    for (let y = 0; y < h; y += h / 6) plank(y, y + h / 6 - 2);
    g.fillStyle = 'rgba(70,48,26,0.5)';
    for (let y = 0; y < h; y += h / 6) g.fillRect(0, y + h / 6 - 3, w, 3);
    g.strokeStyle = 'rgba(60,45,25,0.45)'; g.lineWidth = 6;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (kind === 'ghost') {
      g.fillStyle = 'rgba(30,30,32,0.75)'; g.font = `bold ${Math.round(h * 0.13)}px sans-serif`;
      g.fillText('GHOST LOGISTICS', w / 2, h * 0.36);
      g.font = `${Math.round(h * 0.09)}px sans-serif`; g.fillText('G-07  //  YARD 7', w / 2, h * 0.52);
      g.strokeStyle = 'rgba(30,30,32,0.6)'; g.lineWidth = 3; g.strokeRect(w * 0.2, h * 0.24, w * 0.6, h * 0.36);
    } else if (kind === 'upright') {
      g.fillStyle = 'rgba(30,30,32,0.7)'; g.font = `bold ${Math.round(h * 0.11)}px sans-serif`;
      g.fillText('THIS WAY UP', w / 2, h * 0.7);
      // two arrows, upside down as often as not
      const flip = r() > 0.5 ? 1 : -1, cy = h * 0.4;
      for (const ax of [w * 0.38, w * 0.62]) {
        g.beginPath();
        g.moveTo(ax, cy - flip * h * 0.14); g.lineTo(ax - h * 0.07, cy); g.lineTo(ax - h * 0.03, cy);
        g.lineTo(ax - h * 0.03, cy + flip * h * 0.14); g.lineTo(ax + h * 0.03, cy + flip * h * 0.14);
        g.lineTo(ax + h * 0.03, cy); g.lineTo(ax + h * 0.07, cy); g.closePath(); g.fill();
      }
    } else if (kind === 'fragile') {
      g.fillStyle = 'rgba(120,30,25,0.75)'; g.font = `bold ${Math.round(h * 0.12)}px sans-serif`;
      g.fillText('FRAGILE', w / 2, h * 0.3);
      g.fillStyle = 'rgba(30,30,32,0.6)'; g.font = `${Math.round(h * 0.09)}px sans-serif`;
      g.fillText('KEEP DRY', w / 2, h * 0.62);
      g.fillText(String(1000 + Math.floor(r() * 8999)), w / 2, h * 0.78);
    }
  },
  // The desert floor: pale sand with pebbles, scrub and wind streaks.
  desert(g, w, h, r) {
    g.fillStyle = '#b09a77'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${140 + r() * 60 | 0},${120 + r() * 50 | 0},${80 + r() * 40 | 0},${0.25 + r() * 0.5})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 3); }
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${90 + r() * 30 | 0},${100 + r() * 25 | 0},${60 + r() * 25 | 0},${0.2 + r() * 0.3})`; g.beginPath(); g.ellipse(r() * w, r() * h, 3 + r() * 9, 2 + r() * 6, r() * 3, 0, Math.PI * 2); g.fill(); }
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(160,145,110,${0.1 + r() * 0.2})`; g.fillRect(r() * w, r() * h, 40 + r() * 160, 2 + r() * 5); }
  },
  // Rock faces for the ridges and mesas: banded, cracked, sun-bleached.
  rock(g, w, h, r) {
    g.fillStyle = '#8c7a63'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8 + r() * 14) {
      g.fillStyle = `rgba(${90 + r() * 50 | 0},${76 + r() * 40 | 0},${58 + r() * 30 | 0},${0.35 + r() * 0.4})`;
      g.fillRect(0, y, w, 6 + r() * 12);
    }
    for (let i = 0; i < 120; i++) { g.strokeStyle = `rgba(50,42,32,${0.1 + r() * 0.25})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 30, y + r() * 40); g.stroke(); }
  },
  // Asphalt for the access road.
  asphalt(g, w, h, r) {
    g.fillStyle = '#3a3a3c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2000; i++) { g.fillStyle = `rgba(${90 + r() * 70 | 0},${90 + r() * 70 | 0},${92 + r() * 70 | 0},${0.06 + r() * 0.16})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
    for (let i = 0; i < 14; i++) { g.strokeStyle = `rgba(20,20,22,${0.2 + r() * 0.3})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * w; g.moveTo(x, 0); g.lineTo(x + (r() - 0.5) * 60, h); g.stroke(); }
    g.fillStyle = 'rgba(180,160,110,0.25)'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6);
  },
  // Hangar-door steel: tall vertical corrugations, a stripe of weathering
  // low down where the vehicles splash it.
  shutter(g, w, h, r) {
    g.fillStyle = '#6a7077'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) {
      const grad = g.createLinearGradient(x, 0, x + 16, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0.28)'); grad.addColorStop(0.5, 'rgba(255,255,255,0.12)'); grad.addColorStop(1, 'rgba(0,0,0,0.28)');
      g.fillStyle = grad; g.fillRect(x, 0, 16, h);
    }
    const dirt = g.createLinearGradient(0, h * 0.7, 0, h);
    dirt.addColorStop(0, 'rgba(90,75,50,0)'); dirt.addColorStop(1, 'rgba(90,75,50,0.5)');
    g.fillStyle = dirt; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(120,70,40,${0.05 + r() * 0.12})`; g.fillRect(r() * w, r() * h, 2 + r() * 5, 8 + r() * 30); }
  },
  // Olive canvas for truck tilts and covers: coarse weave, a few stains.
  tarp(g, w, h, r) {
    g.fillStyle = '#5b5a3a'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(0,0,0,${0.04 + r() * 0.05})`; g.fillRect(0, y, w, 1); }
    for (let x = 0; x < w; x += 3) { g.fillStyle = `rgba(255,255,220,${0.02 + r() * 0.03})`; g.fillRect(x, 0, 1, h); }
    for (let i = 0; i < 24; i++) {
      g.fillStyle = `rgba(30,28,15,${0.06 + r() * 0.1})`;
      g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 40, 6 + r() * 24, r() * 3, 0, Math.PI * 2); g.fill();
    }
  },
  // Rubber: near-black with a chunky tread.
  tyre(g, w, h, r) {
    g.fillStyle = '#1a1b1c'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 24) {
      g.fillStyle = '#0d0e0f';
      for (let x = 0; x < w; x += 32) g.fillRect(x + ((y / 24) % 2) * 16, y, 18, 12);
    }
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(90,90,90,${r() * 0.12})`; g.fillRect(r() * w, r() * h, 2, 2); }
  },
  // A human silhouette on tan card, with scoring rings on the chest, after
  // Rhys's reference sheet. Drawn for a tall target; square ones show the top.
  silhouette(g, w, h, r) {
    g.clearRect(0, 0, w, h);                // cut out: nothing round the figure
    const cx = w / 2;
    g.fillStyle = '#16181a';
    // head
    g.beginPath(); g.ellipse(cx, h * 0.12, w * 0.12, h * 0.075, 0, 0, Math.PI * 2); g.fill();
    // neck and shoulders into the torso
    g.beginPath();
    g.moveTo(cx - w * 0.06, h * 0.19);
    g.lineTo(cx + w * 0.06, h * 0.19);
    g.quadraticCurveTo(cx + w * 0.38, h * 0.22, cx + w * 0.4, h * 0.34);
    g.lineTo(cx + w * 0.36, h * 0.62);
    g.lineTo(cx + w * 0.22, h * 0.64);
    g.lineTo(cx + w * 0.2, h * 0.97);
    g.lineTo(cx - w * 0.2, h * 0.97);
    g.lineTo(cx - w * 0.22, h * 0.64);
    g.lineTo(cx - w * 0.36, h * 0.62);
    g.lineTo(cx - w * 0.4, h * 0.34);
    g.quadraticCurveTo(cx - w * 0.38, h * 0.22, cx - w * 0.06, h * 0.19);
    g.closePath(); g.fill();
    // scoring rings on the chest, and a smaller set on the head
    g.strokeStyle = 'rgba(235,228,210,0.85)'; g.lineWidth = Math.max(1, w * 0.008);
    for (let i = 1; i <= 5; i++) {
      g.beginPath(); g.ellipse(cx, h * 0.4, w * 0.055 * i, h * 0.042 * i, 0, 0, Math.PI * 2); g.stroke();
    }
    for (let i = 1; i <= 2; i++) {
      g.beginPath(); g.ellipse(cx, h * 0.12, w * 0.04 * i, h * 0.028 * i, 0, 0, Math.PI * 2); g.stroke();
    }
    g.fillStyle = '#c02020';
    g.beginPath(); g.arc(cx, h * 0.4, w * 0.018, 0, Math.PI * 2); g.fill();
    // a pale edge round the figure, so it reads against a dark wall
    g.globalCompositeOperation = 'destination-over';
    g.strokeStyle = 'rgba(210,200,175,0.9)'; g.lineWidth = w * 0.03;
    g.beginPath(); g.ellipse(cx, h * 0.12, w * 0.12, h * 0.075, 0, 0, Math.PI * 2); g.stroke();
    g.globalCompositeOperation = 'source-over';
  },
  water(g, w, h, r) {
    g.fillStyle = '#1d5b73'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = r() * w, y = r() * h, l = 8 + r() * 30;
      g.strokeStyle = `rgba(${150 + r() * 60},${210 + r() * 40},255,${0.08 + r() * 0.18})`;
      g.lineWidth = 1 + r() * 2;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - 3, x + l, y); g.stroke();
    }
  },
  sky(g, w, h) {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#3d6e9e');
    gr.addColorStop(0.42, '#86abc9');
    gr.addColorStop(0.5, '#c9d4d8');
    gr.addColorStop(0.56, '#a9b2b0');
    gr.addColorStop(1, '#5f6560');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // soft cloud bands
    const r = rng(9);
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = h * (0.12 + r() * 0.3), rw = 40 + r() * 140;
      const cg = g.createRadialGradient(x, y, 0, x, y, rw);
      cg.addColorStop(0, 'rgba(255,255,255,0.22)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = cg; g.fillRect(x - rw, y - rw * 0.4, rw * 2, rw * 0.8);
    }
  },
  // painted timber, for door frames: added last, so every older texture keeps its seed
  wood(g, w, h, r) {
    g.fillStyle = '#7a5634'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(50,30,15,0.28)';
    for (let k = 0; k < 60; k++) { const x = r() * w; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + r() * 12 - 6, h * 0.3, x + r() * 12 - 6, h * 0.7, x + r() * 8 - 4, h); g.stroke(); }
    blotches(g, w, h, 12, 'rgba(40,25,10,A)', 0.16, 60, r);
    speckle(g, w, h, 500, '#000', 0.1, 2, r);
  },
  // an ordinary interior door: four panels, painted wood, scuffed low down
  // a reinforced door (M6.9.19, Rhys: they looked like the lift's doors): dark
  // green-grey painted steel, two bolted cross-bars, a yellow-and-black kick plate
  armour(g, w, h, r) {
    g.fillStyle = '#3b4642'; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 30, 'rgba(20,26,24,A)', 0.25, 60, r);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6); g.fillRect(0, 0, 6, h); g.fillRect(w - 6, 0, 6, h);
    for (const y of [0.3, 0.62]) {
      g.fillStyle = '#2c3431'; g.fillRect(8, y * h, w - 16, h * 0.07);
      g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(8, y * h, w - 16, 2);
      g.fillStyle = '#87918c';
      for (let x = 22; x < w - 10; x += 38) { g.beginPath(); g.arc(x, y * h + h * 0.035, 3.2, 0, Math.PI * 2); g.fill(); }
    }
    const ky = h * 0.86;
    for (let x = -h; x < w + h; x += 26) { g.fillStyle = (Math.floor(x / 26) % 2) ? '#d9a514' : '#151515'; g.beginPath(); g.moveTo(x, ky); g.lineTo(x + 13, ky); g.lineTo(x + 13 + (h - ky), h); g.lineTo(x + (h - ky), h); g.fill(); }
    edgeDirt(g, w, h, 0.4);
  },
  door(g, w, h, r) {
    g.fillStyle = '#8b6a45'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(60,38,18,0.22)';
    for (let k = 0; k < 50; k++) { const x = r() * w; g.lineWidth = 1 + r(); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + r() * 6 - 3, h); g.stroke(); }
    const panel = (x0, y0, x1, y1) => {
      const pw = (x1 - x0) * w, ph = (y1 - y0) * h, px = x0 * w, py = y0 * h;
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(px, py, pw, ph);
      g.fillStyle = '#7d5d3b'; g.fillRect(px + 5, py + 5, pw - 10, ph - 10);
      g.fillStyle = 'rgba(255,235,200,0.14)'; g.fillRect(px + 5, py + ph - 7, pw - 10, 2); g.fillRect(px + pw - 7, py + 5, 2, ph - 10);
    };
    panel(0.14, 0.06, 0.46, 0.42); panel(0.54, 0.06, 0.86, 0.42);
    panel(0.14, 0.5, 0.46, 0.94); panel(0.54, 0.5, 0.86, 0.94);
    edgeDirt(g, w, h, 0.35);
    speckle(g, w, h, 700, '#000', 0.1, 2, r);
  },
  // ── M6.0.4, for Level 0: added last, so every older texture keeps its seed ──
  // red-brown brick in stretcher bond, each brick its own shade
  brick(g, w, h, r) {
    g.fillStyle = '#8b857b'; g.fillRect(0, 0, w, h);                 // mortar
    const rows = 16, bw = w / 8, bh = h / rows;
    for (let y = 0; y < rows; y++) for (let x = -1; x < 9; x++) {
      const ox = (y % 2) * bw / 2, k = 0.85 + r() * 0.3;
      const c = [142 * k, 74 * k, 54 * k].map((v) => Math.round(v));
      g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      g.fillRect(x * bw + ox + 2, y * bh + 2, bw - 4, bh - 4);
    }
    blotches(g, w, h, 20, 'rgba(40,25,18,A)', 0.12, 50, r);
    speckle(g, w, h, 900, '#000', 0.12, 2, r);
    edgeDirt(g, w, h, 0.25);
  },
  // warm painted plaster for the offices
  plaster(g, w, h, r) {
    g.fillStyle = '#d6cdbb'; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 30, 'rgba(120,100,70,A)', 0.07, 70, r);
    blotches(g, w, h, 20, 'rgba(255,250,235,A)', 0.08, 60, r);
    speckle(g, w, h, 600, '#6b5a40', 0.08, 2, r);
  },
  // office carpet: blue-grey with a fleck
  carpet(g, w, h, r) {
    g.fillStyle = '#4c5763'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 5000, '#6d7a88', 0.35, 2, r);
    speckle(g, w, h, 4000, '#2c343d', 0.35, 2, r);
    blotches(g, w, h, 12, 'rgba(20,25,30,A)', 0.1, 80, r);
  },
  // the face of a neighbouring building: storeys of windows, a few lit
  facade(g, w, h, r) {
    g.fillStyle = '#8f8a82'; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 20, 'rgba(60,55,50,A)', 0.12, 80, r);
    const cols = 4, rows = 4, cw = w / cols, rh = h / rows;
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const x0 = x * cw + cw * 0.18, y0 = y * rh + rh * 0.22, ww = cw * 0.64, wh = rh * 0.5;
      g.fillStyle = '#5a5650'; g.fillRect(x0 - 4, y0 - 4, ww + 8, wh + 10);        // frame
      const lit = r() < 0.22;
      const grd = g.createLinearGradient(x0, y0, x0 + ww, y0 + wh);
      grd.addColorStop(0, lit ? '#f0d9a0' : '#7f95a8'); grd.addColorStop(1, lit ? '#c99b5a' : '#27333f');
      g.fillStyle = grd; g.fillRect(x0, y0, ww, wh);
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x0 + ww / 2 - 1, y0, 2, wh);     // mullion
    }
    edgeDirt(g, w, h, 0.3);
  },
  // a mown lawn: green with lighter and darker stripes of mowing
  lawn(g, w, h, r) {
    g.fillStyle = '#4f7a3a'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += w / 8) { g.fillStyle = (x / (w / 8)) % 2 ? 'rgba(255,255,220,0.06)' : 'rgba(0,30,0,0.06)'; g.fillRect(x, 0, w / 8, h); }
    speckle(g, w, h, 7000, '#6b9a4c', 0.4, 2, r);
    speckle(g, w, h, 5000, '#2f4f24', 0.35, 2, r);
    blotches(g, w, h, 14, 'rgba(90,70,30,A)', 0.06, 60, r);
  },
  // a clipped hedge: dark leaves
  hedge(g, w, h, r) {
    g.fillStyle = '#2e4a24'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 9000, '#4d7236', 0.5, 3, r);
    speckle(g, w, h, 6000, '#1a2c14', 0.5, 3, r);
  },
  // a white tablecloth
  cloth(g, w, h, r) {
    g.fillStyle = '#ece8e0'; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 20, 'rgba(180,170,150,A)', 0.05, 60, r);
    speckle(g, w, h, 800, '#bfb6a6', 0.08, 2, r);
  },
  // a television screen, off: near-black with a faint sheen
  screen(g, w, h, r) {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#15181c'); gr.addColorStop(0.5, '#0b0d10'); gr.addColorStop(1, '#16191e');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  },
  // a painting: a landscape - sky, far hills, green fields, a river
  painting(g, w, h, r) {
    const sky = g.createLinearGradient(0, 0, 0, h * 0.55); sky.addColorStop(0, '#6f9ac2'); sky.addColorStop(1, '#d8c9a4');
    g.fillStyle = sky; g.fillRect(0, 0, w, h * 0.55);
    g.fillStyle = '#6f7f8a'; g.beginPath(); g.moveTo(0, h * 0.55); for (let x = 0; x <= w; x += w / 8) g.lineTo(x, h * (0.42 + 0.08 * Math.sin(x / w * 7 + r() * 0.5))); g.lineTo(w, h * 0.55); g.fill();
    g.fillStyle = '#5d7d3c'; g.fillRect(0, h * 0.55, w, h * 0.45);
    g.fillStyle = '#7d9a4a'; for (let i = 0; i < 6; i++) g.fillRect(r() * w, h * (0.6 + r() * 0.35), w * 0.3, h * 0.04);
    g.fillStyle = '#6c95b8'; g.beginPath(); g.moveTo(w * 0.35, h); g.quadraticCurveTo(w * 0.5, h * 0.7, w * 0.62, h * 0.56); g.lineTo(w * 0.66, h * 0.56); g.quadraticCurveTo(w * 0.58, h * 0.72, w * 0.5, h); g.fill();
  },
  // a woollen throw: deep red with a woven fleck
  fabric(g, w, h, r) {
    g.fillStyle = '#7a2a2a'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 5000, '#9a3a36', 0.4, 2, r);
    for (let y = 0; y < h; y += h / 16) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, y, w, 1.5); }
  },
  // (last, so the textures before it keep their seeds)
  // (M6.15.0, the casino) a gaming table's baize: deep green, faintly napped
  felt(g, w, h, r) {
    g.fillStyle = '#1f5a34'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 4000, '#2a6b40', 0.35, 2, r);
    speckle(g, w, h, 2500, '#174a2a', 0.35, 2, r);
  },
  // (M6.16.0, the casino's fittings - after felt, for the same reason)
  // near-white, to be tinted: leather, porcelain, glass bottles, laminate
  paint(g, w, h, r) {
    g.fillStyle = '#ecebe8'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 1500, '#d6d4cf', 0.25, 2, r);
    blotches(g, w, h, 10, 'rgba(200,198,190,A)', 0.08, 90, r);
  },
  // the casino's outside: pale stone in big panels
  cladding(g, w, h, r) {
    g.fillStyle = '#b8a888'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 6000, '#cdbf9f', 0.3, 2, r);
    speckle(g, w, h, 4000, '#9c8c6c', 0.25, 2, r);
    blotches(g, w, h, 16, 'rgba(110,95,70,A)', 0.08, 90, r);
    g.fillStyle = 'rgba(60,50,35,0.55)';
    for (let i = 0; i <= 2; i++) g.fillRect(0, i * h / 2 - 2, w, 4);
    for (let i = 0; i <= 2; i++) g.fillRect(i * w / 2 - 2, 0, 4, h);
  },
  // a bar top: cream marble with grey veins
  marble(g, w, h, r) {
    g.fillStyle = '#e6e0d4'; g.fillRect(0, 0, w, h);
    blotches(g, w, h, 18, 'rgba(190,180,165,A)', 0.2, 90, r);
    g.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) {
      g.strokeStyle = `rgba(110,105,100,${0.25 + r() * 0.3})`; g.beginPath();
      let x = r() * w, y = r() * h; g.moveTo(x, y);
      for (let k = 0; k < 12; k++) { x += (r() - 0.3) * 60; y += (r() - 0.5) * 50; g.lineTo(x, y); }
      g.stroke();
    }
  },
  // washroom tiles: small white squares, grey grout
  wctile(g, w, h, r) {
    g.fillStyle = '#9da3a6'; g.fillRect(0, 0, w, h);
    const n = 8, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const v = 228 + Math.floor(r() * 18);
      g.fillStyle = `rgb(${v},${v},${v - 4})`; g.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
    }
  },
  // a mirror: pale, the reflection does the rest
  mirror(g, w, h, r) {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#dfe6ea'); gr.addColorStop(1, '#b9c3c9');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  },
  // a roulette table's baize: the wheel's numbers in a grid, red and black, the zero green
  layout(g, w, h, r) {
    g.fillStyle = '#1f5a34'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 3000, '#2a6b40', 0.3, 2, r);
    const reds = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    const x0 = w * 0.16, y0 = h * 0.12, cw = (w * 0.76) / 12, ch = (h * 0.5) / 3;
    g.strokeStyle = '#e8e4d8'; g.lineWidth = 2;
    g.strokeRect(w * 0.06, y0, x0 - w * 0.06, ch * 3);
    // (M6.17.0, Rhys: the numbers spilled into their neighbours) sized to fit their boxes
    const fs = Math.floor(Math.min(ch * 0.36, cw * 0.4));
    g.fillStyle = '#e8e4d8'; g.font = `bold ${fs}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('0', (w * 0.06 + x0) / 2, y0 + ch * 1.5);
    for (let c = 0; c < 12; c++) for (let rr = 0; rr < 3; rr++) {
      const num = c * 3 + (3 - rr), x = x0 + c * cw, y = y0 + rr * ch;
      g.strokeRect(x, y, cw, ch);
      g.fillStyle = reds.has(num) ? '#b3261e' : '#141414';
      g.beginPath(); g.ellipse(x + cw / 2, y + ch / 2, cw * 0.38, ch * 0.3, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f2efe6'; g.fillText(String(num), x + cw / 2, y + ch / 2 + 1);
    }
    for (let k = 0; k < 3; k++) { g.strokeRect(x0 + k * cw * 4, y0 + ch * 3, cw * 4, ch * 0.6); g.fillStyle = '#e8e4d8'; g.fillText(['1st 12', '2nd 12', '3rd 12'][k], x0 + k * cw * 4 + cw * 2, y0 + ch * 3.3); }
    for (let k = 0; k < 6; k++) g.strokeRect(x0 + k * cw * 2, y0 + ch * 3.6, cw * 2, ch * 0.6);
  },
  // a slot machine's front: a lit game screen over three reels, a pay table, a coin tray
  // (M6.17.1, Rhys: "they shouldn't ALL be 'JACKPOT £25,000'") six games, SLOT_GAMES
  slotface(g, w, h, r) { paintSlot(g, w, h, r, SLOT_GAMES[0]); },
  slotface1(g, w, h, r) { paintSlot(g, w, h, r, SLOT_GAMES[1]); },
  slotface2(g, w, h, r) { paintSlot(g, w, h, r, SLOT_GAMES[2]); },
  slotface3(g, w, h, r) { paintSlot(g, w, h, r, SLOT_GAMES[3]); },
  slotface4(g, w, h, r) { paintSlot(g, w, h, r, SLOT_GAMES[4]); },
  slotface5(g, w, h, r) { paintSlot(g, w, h, r, SLOT_GAMES[5]); },
};

// the slot machines' games: each its own name, prize, colours, reels showing, pay table
export const SLOT_GAMES = [
  { title: 'JACKPOT', prize: '£ 25,000', hue: 285, reels: ['7', 'BAR', '♥'], pay: ['7 7 7 ... 500', 'BAR BAR BAR ... 100', 'ANY 3 ... 10'] },
  { title: 'LUCKY 7s', prize: '£ 5,000', hue: 0, reels: ['7', '7', '♣'], pay: ['7 7 7 ... 250', '7 7 ... 20', '7 ... 2'] },
  { title: 'DIAMOND RUSH', prize: '£ 10,000', hue: 195, reels: ['♦', '★', '♦'], pay: ['♦ ♦ ♦ ... 400', '★ ★ ★ ... 150', '♦ ♦ ... 5'] },
  { title: 'GOLD RUSH', prize: '£ 50,000', hue: 45, reels: ['$', '$', '$'], pay: ['$ $ $ ... 1000', 'BAR BAR BAR ... 80', '$ ... 2'] },
  { title: 'ROYAL FLUSH', prize: '£ 2,500', hue: 140, reels: ['♠', '♥', 'BAR'], pay: ['♠ ♠ ♠ ... 200', '♥ ♥ ♥ ... 100', 'ANY PAIR ... 3'] },
  { title: 'MEGA SPIN', prize: '£ 100,000', hue: 320, reels: ['★', 'BAR', '7'], pay: ['★ ★ ★ ... 2000', '7 7 7 ... 300', 'BAR BAR BAR ... 60'] },
];
function paintSlot(g, w, h, r, game) {
  g.fillStyle = '#120a1c'; g.fillRect(0, 0, w, h);
  // the top screen: the game's art
  const hue = game.hue;
  const sky = g.createLinearGradient(0, h * 0.04, 0, h * 0.36);
  sky.addColorStop(0, `hsl(${hue},80%,55%)`); sky.addColorStop(1, `hsl(${(hue + 60) % 360},85%,30%)`);
  g.fillStyle = sky; g.fillRect(w * 0.08, h * 0.04, w * 0.84, h * 0.32);
  for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.35})`; g.beginPath(); g.arc(w * (0.1 + r() * 0.8), h * (0.06 + r() * 0.28), 1 + r() * 3, 0, Math.PI * 2); g.fill(); }
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const tf = Math.floor(Math.min(h * 0.08, (w * 0.8) / (game.title.length * 0.62)));
  g.fillStyle = '#ffd84a'; g.font = `bold ${tf}px sans-serif`; g.fillText(game.title, w / 2, h * 0.16);
  g.fillStyle = '#fff'; g.font = `bold ${Math.floor(h * 0.045)}px sans-serif`; g.fillText(game.prize, w / 2, h * 0.27);
  // the reels, stopped where this one's last spin left them
  for (let k = 0; k < 3; k++) {
    const x = w * (0.12 + k * 0.265), y = h * 0.42;
    const rg = g.createLinearGradient(0, y, 0, y + h * 0.2); rg.addColorStop(0, '#9a9a9a'); rg.addColorStop(0.5, '#ffffff'); rg.addColorStop(1, '#9a9a9a');
    g.fillStyle = rg; g.fillRect(x, y, w * 0.23, h * 0.2);
    const s = game.reels[k];
    g.fillStyle = s === '7' ? '#c41e1e' : s === 'BAR' ? '#111' : s === '$' ? '#1e8a3a' : s === '★' ? '#d49a10' : s === '♥' || s === '♦' ? '#c8202a' : '#1a1a2a';
    g.font = `bold ${Math.floor(h * (s === 'BAR' ? 0.06 : 0.11))}px sans-serif`; g.fillText(s, x + w * 0.115, y + h * 0.105);
  }
  g.fillStyle = '#c41e1e'; g.fillRect(w * 0.08, h * 0.515, w * 0.84, 3);          // the pay line
  // credits
  g.fillStyle = '#000'; g.fillRect(w * 0.08, h * 0.6, w * 0.84, h * 0.045);
  g.fillStyle = '#ff5a3a'; g.font = `bold ${Math.floor(h * 0.03)}px monospace`;
  g.fillText('CREDIT ' + String(Math.floor(r() * 900 + 20) * 5).padStart(5, '0') + '   BET ' + [1, 2, 5, 10][Math.floor(r() * 4)], w / 2, h * 0.623);
  // the pay table, and the coin tray
  g.fillStyle = `hsl(${hue},40%,16%)`; g.fillRect(w * 0.08, h * 0.66, w * 0.84, h * 0.16);
  g.fillStyle = '#e8c860'; g.font = `${Math.floor(h * 0.03)}px sans-serif`;
  for (let k = 0; k < 3; k++) g.fillText(game.pay[k], w / 2, h * (0.69 + k * 0.045));
  g.fillStyle = '#0a0a0a'; g.fillRect(w * 0.2, h * 0.88, w * 0.6, h * 0.08);
}

const CONTAINER_COLOURS = {
  blue: '#2f5d8a', grey: '#6e757b', orange: '#c2622a', green: '#3f6b46', red: '#8e2f2a', white: '#c9c9c1',
};
function paintContainer(g, w, h, base, r, id) {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  // corrugation
  const rib = w / 36;
  for (let i = 0; i < 36; i++) {
    const x = i * rib;
    const gr = g.createLinearGradient(x, 0, x + rib, 0);
    gr.addColorStop(0, 'rgba(0,0,0,0.28)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.14)');
    gr.addColorStop(0.6, 'rgba(255,255,255,0.05)'); gr.addColorStop(1, 'rgba(0,0,0,0.3)');
    g.fillStyle = gr; g.fillRect(x, 0, rib, h);
  }
  // frame rails
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, w, h * 0.06); g.fillRect(0, h * 0.93, w, h * 0.07);
  g.fillRect(0, 0, w * 0.015, h); g.fillRect(w * 0.985, 0, w * 0.015, h);
  // weathering
  blotches(g, w, h, 14, 'rgba(120,60,25,A)', 0.35, 26, r);
  for (let i = 0; i < 26; i++) { const x = r() * w, y = h * 0.06; g.fillStyle = 'rgba(100,50,20,0.22)'; g.fillRect(x, y, 2 + r() * 3, h * (0.1 + r() * 0.5)); }
  edgeDirt(g, w, h, 0.55);
  speckle(g, w, h, 1500, '#000', 0.12, 2, r);
  // stencil
  g.fillStyle = 'rgba(235,235,225,0.82)';
  g.font = `bold ${Math.floor(h * 0.1)}px sans-serif`;
  g.fillText('GHSU ' + id, w * 0.72, h * 0.2);
  g.font = `${Math.floor(h * 0.06)}px sans-serif`;
  g.fillText('MAX GR 30480 KG', w * 0.72, h * 0.29);
  g.fillText('TARE   2200 KG', w * 0.72, h * 0.36);
}

export function makeTextures(pc, device) {
  const tex = {};
  const upload = (c, repeat) => {
    const t = new pc.Texture(device, {
      width: c.width, height: c.height, format: pc.PIXELFORMAT_SRGBA8,
      mipmaps: true, minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR, magFilter: pc.FILTER_LINEAR,
      addressU: repeat ? pc.ADDRESS_REPEAT : pc.ADDRESS_CLAMP_TO_EDGE,
      addressV: repeat ? pc.ADDRESS_REPEAT : pc.ADDRESS_CLAMP_TO_EDGE,
      anisotropy: 4,
    });
    t.setSource(c);
    return t;
  };
  let seed = 1;
  for (const name of Object.keys(PAINT)) {
    const size = name === 'sky' || name === 'layout' ? [1024, 512] : name === 'silhouette' || name === 'door' ? [256, 512] : [512, 512];   // (M6.17.0) the roulette layout, long
    const [c, g] = canvas(size[0], size[1]);
    PAINT[name](g, size[0], size[1], rng(seed++ * 977));
    tex[name] = upload(c, true);
  }
  // the buildings opposite at night (M6.9.17): dark walls and glass, about a
  // third of the windows lit - and a glow map, black but for those windows
  {
    const r = rng(4242), cols = 4, rows = 4, lit = [];
    for (let i = 0; i < cols * rows; i++) lit.push(r() < 0.34 ? 0.6 + r() * 0.4 : 0);
    const draw = (g, w, h, glow) => {
      g.fillStyle = glow ? '#000' : '#3a3836'; g.fillRect(0, 0, w, h);
      if (!glow) blotches(g, w, h, 20, 'rgba(10,10,12,A)', 0.2, 80, rng(77));
      const cw = w / cols, rh = h / rows;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const x0 = x * cw + cw * 0.18, y0 = y * rh + rh * 0.22, ww = cw * 0.64, wh = rh * 0.5, L = lit[y * cols + x];
        if (!glow) { g.fillStyle = '#26241f'; g.fillRect(x0 - 4, y0 - 4, ww + 8, wh + 10); }
        if (L) {
          const grd = g.createLinearGradient(x0, y0, x0, y0 + wh);
          grd.addColorStop(0, 'rgba(255,214,150,' + L + ')'); grd.addColorStop(1, 'rgba(220,150,80,' + L + ')');
          g.fillStyle = grd; g.fillRect(x0, y0, ww, wh);
        } else if (!glow) { g.fillStyle = '#121822'; g.fillRect(x0, y0, ww, wh); }
        g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x0 + ww / 2 - 1, y0, 2, wh);       // mullion
      }
    };
    for (const [key, glow] of [['facade_night', false], ['facade_glow', true]]) {
      const [c, g] = canvas(512, 512); draw(g, 512, 512, glow); tex[key] = upload(c, true);
    }
  }
  let n = 4101;
  // the three marked crates
  for (const kind of ['ghost', 'upright', 'fragile']) {
    const [c, g] = canvas(512, 512);
    PAINT.crateMark(g, 512, 512, rng(seed++ * 17), kind);
    tex['crate_' + kind] = upload(c, true);
  }
  for (const [k, col] of Object.entries(CONTAINER_COLOURS)) {
    const [c, g] = canvas(1024, 512);
    paintContainer(g, 1024, 512, col, rng(seed++ * 31), String(n++) + '7' + (seed % 10));
    tex['cont_' + k] = upload(c, true);
  }
  return tex;
}

// (M6.18.3, Rhys: "shouldn't it be a matrix board, rather than a stationary sign?") a dot-matrix
// board: rows of text set in a grid of lamps, each lit or dark. matrixDots: which lamps are lit.
export const MATRIX = { cols: 192, rows: 60, line: 12, px: 4 };
// (M6.18.3) set in the board's own lamp font (matrix_font.js), not a screen font squeezed small - which blurred
export function matrixDots(rows, cols, nrows) {
  cols = cols || MATRIX.cols; nrows = nrows || MATRIX.rows;
  const lit = new Uint8Array(cols * nrows);
  rows.forEach((r, i) => {
    const y = i * MATRIX.line;
    // a row: [left, right] - the right part set flush right (the platform)
    const [l, rt] = Array.isArray(r) ? r : [r, ''];
    setMatrixText(lit, cols, nrows, l, 3, y);
    if (rt) setMatrixText(lit, cols, nrows, rt, cols - 3, y, true);
  });
  return lit;
}
export { setMatrixText };
export function makeMatrixSign(pc, device, s) {
  const { cols, rows: nr, px } = MATRIX, W = cols * px, H = nr * px;
  const [c, g] = canvas(W, H);
  const t = new pc.Texture(device, { width: W, height: H, format: pc.PIXELFORMAT_SRGBA8, mipmaps: true,
    minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR, magFilter: pc.FILTER_LINEAR, anisotropy: 4 });
  const draw = (rows) => {
    const lit = matrixDots(rows);
    g.fillStyle = '#0b0c0d'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < nr; y++) for (let x = 0; x < cols; x++) {
      g.fillStyle = lit[y * cols + x] ? (s.col || '#ffb326') : '#1d1a14';
      g.beginPath(); g.arc(x * px + px / 2, y * px + px / 2, px * 0.38, 0, Math.PI * 2); g.fill();
    }
    t.setSource(c);
  };
  return { t, draw };
}
export function makeSignTexture(pc, device, s) {
  const W = 256, H = Math.round(256 * s.h / s.w);
  const [c, g] = canvas(W, H);
  g.fillStyle = '#16191d'; g.fillRect(0, 0, W, H);
  g.fillStyle = s.col; g.fillRect(0, 0, W, Math.max(6, H * 0.07));
  g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = 3; g.strokeRect(4, 4, W - 8, H - 8);
  g.fillStyle = s.col; g.textAlign = 'center';
  let size = Math.floor(H * (s.sub ? 0.36 : 0.52));
  g.font = `bold ${size}px 'Severia Sans Condensed', 'Arial Narrow', 'Roboto Condensed', Arial, sans-serif`;
  while (g.measureText(s.text).width > W * 0.9 && size > 10) { size -= 2; g.font = `bold ${size}px 'Severia Sans Condensed', 'Arial Narrow', 'Roboto Condensed', Arial, sans-serif`; }
  g.fillText(s.text, W / 2, s.sub ? H * 0.5 : H * 0.68);
  if (s.sub) {
    g.fillStyle = '#c9ced4';
    let ss = Math.floor(H * 0.15);
    g.font = `${ss}px 'Severia Sans', Arial, sans-serif`;
    while (g.measureText(s.sub).width > W * 0.92 && ss > 8) { ss -= 1; g.font = `${ss}px 'Severia Sans', Arial, sans-serif`; }
    g.fillText(s.sub, W / 2, H * 0.8);
  }
  const t = new pc.Texture(device, { width: W, height: H, format: pc.PIXELFORMAT_SRGBA8, mipmaps: true,
    minFilter: pc.FILTER_LINEAR_MIPMAP_LINEAR, magFilter: pc.FILTER_LINEAR, anisotropy: 4 });
  t.setSource(c);
  return t;
}
