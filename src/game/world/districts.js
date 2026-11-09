// FRONTLINE - the districts (M7.1.0): a region you walk, between jobs. Varnholm first.
//
// Rhys (8 Nov 2026): "you absolutely should be able to walk around the world freely". A district is the region as a
// place: streets between city blocks, and on the blocks' fronts a door for every job there, its name on a sign above
// it. Walk up to one and press E, and its level loads. Yard 7's gate is where you came in, and the way home.
// The reds walk the streets in proportion to the region's heat (sim/play/world.js): none when it is cold, up to
// six at a manhunt. Trouble on the streets (an alarm, bodies) adds to the heat when you leave; a quiet walk changes
// nothing (so strolling about is no way to cool it).
//
// makeDistrict(region, { done, heat }) builds the spec, a kit level like the journeys:
// index.html?level=district&region=varnholm

import { REGIONS, PLACES } from './gazetteer.js';
import { DRAFTS } from '../levels/drafts/index.js';

const BW = 14, BH = 10, ST = 5;                 // a block's inside (squares), the streets' width
const COLS = 4, ROWS = 3;
const W = COLS * (BW + 2) + (COLS + 1) * ST, H = ROWS * (BH + 2) + (ROWS + 1) * ST;

export const DISTRICTS = {
  varnholm: {
    backdrop: 'city', mat: 'asphalt', hour: 19, minute: 30, gate: 'Yard 7',
    atmos: { fog: [0.42, 0.44, 0.5, 40, 220], ambient: [0.5, 0.5, 0.55] },
    about: 'The city on the Vell, at dusk. Every job Ghost has here is a door on these streets.',
    tints: [[0.62, 0.5, 0.42], [0.55, 0.56, 0.58], [0.7, 0.66, 0.56], [0.5, 0.42, 0.4], [0.6, 0.62, 0.66], [0.66, 0.58, 0.5]],
    folk: [
      ['A man selling chestnuts', 'Hot chestnuts! The reds took my brazier licence last week, so these are illegal chestnuts.'],
      ['A tram conductor, off shift', 'Opera Street, the docks, Holm Street, the old quarter. Every one of them has a red checkpoint now, and every one of them has a way round it.'],
      ['A woman with a pram', 'Keep your voice down. The baby is asleep and the patrol is not.'],
      ['A newsboy', 'Courier! Courier! Only paper in Varnholm the reds don\'t write!'],
    ],
  },
};

// the block (column, row) a cell rect: its inside x0..x1, y0..y1
const block = (c, r) => { const x0 = ST + 1 + c * (BW + 2 + ST), y0 = ST + 1 + r * (BH + 2 + ST); return { x0, y0, x1: x0 + BW - 1, y1: y0 + BH - 1 }; };

// every slot a job's door can take: each block's four fronts, the middle of each, then nearer the corners
function slots() {
  const out = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const b = block(c, r), mx = Math.floor((b.x0 + b.x1) / 2), my = Math.floor((b.y0 + b.y1) / 2);
    out.push({ side: 'S', x: mx, y: b.y1 + 1 }, { side: 'N', x: mx, y: b.y0 - 1 }, { side: 'E', x: b.x1 + 1, y: my }, { side: 'W', x: b.x0 - 1, y: my });
  }
  // and a second door on the long fronts, for a region with more jobs than blocks have sides
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const b = block(c, r);
    out.push({ side: 'S', x: b.x0 + 3, y: b.y1 + 1 }, { side: 'N', x: b.x1 - 3, y: b.y0 - 1 });
  }
  return out;
}

export function districtJobs(region) {
  return DRAFTS.filter((d) => PLACES[d.id] && PLACES[d.id].region === region && !d.battle).sort((a, b) => a.no - b.no);
}

export function makeDistrict(region, opts = {}) {
  const R = DISTRICTS[region];
  if (!R) return null;
  const reg = REGIONS[region] || { name: region };
  const done = opts.done || {}, heat = opts.heat || 0;
  const jobs = districtJobs(region), S = slots();
  const entrances = jobs.slice(0, S.length).map((d, i) => ({ to: d.id, no: d.no, title: d.title, ...S[i] }));
  const ops = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const b = block(c, r); ops.push(['room', b.x0, b.y0, b.x1, b.y1]); }
  // the reds on the streets: one for every 12 points of heat, to six, walking the long streets
  const reds = [];
  const nReds = Math.min(6, Math.floor(heat / 12));
  for (let i = 0; i < nReds; i++) {
    const row = i % (ROWS + 1), y = row * (BH + 2 + ST) + 2, x0 = 4 + (i * 13) % (W - 30);
    reds.push({ id: 'pat' + i, at: [x0, y, 'G'], route: [[x0, y], [Math.min(W - 4, x0 + 26), y]], arms: i % 3 === 2 ? 'smg' : 'carbine' });
  }
  // a few people at the corners
  const civilians = R.folk.map(([title, line], i) => ({ id: 'folk' + i, at: [ST + 1 + (i % COLS) * (BW + 2 + ST) - 2, ST + 1 + (1 + (i % ROWS)) * (BH + 2 + ST) - 3, 'G'], yaw: 0, title, tint: [1.0 + 0.1 * (i % 2), 0.95, 0.9], says: [line] }));
  return {
    id: 'district', no: 0, title: reg.name, place: reg.name, district: { region, entrances },
    where: reg.name + ', ' + String(R.hour).padStart(2, '0') + ':' + String(R.minute).padStart(2, '0') + '. ' + R.about,
    brief: [
      ['The streets', 'Walk the city, or take the van. Every job Ghost has in ' + reg.name + ' is a <b>door</b> on these streets, its name on a sign above it: walk up and press <b>E</b>, and you go in. Signs in <b>green</b> are jobs already done.'],
      ['The reds', nReds ? '<b>' + nReds + ' patrol' + (nReds === 1 ? '' : 's') + '</b> on the streets tonight: the city is ' + (heat >= 70 ? 'in a manhunt' : heat >= 40 ? 'hunting Ghost' : 'watching') + '. Trouble here (an alarm, bodies) makes it worse.' : 'No patrols tonight: nobody in ' + reg.name + ' is looking for Ghost.'],
      ['Home', '<b>' + R.gate + '</b>\'s gate, west, where you came in: back to Ghost HQ.'],
    ],
    time: { date: [1, 5, 2027], hour: R.hour, minute: R.minute }, night: R.hour >= 19 || R.hour < 6, faction: 'red',
    startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
    atmos: R.atmos,
    extractName: R.gate + '\'s gate', extract: { x: 2, y: Math.floor(H / 2), floor: 'G' },
    outside: { backdrop: R.backdrop, mat: R.mat, margin: 12 },
    windows: false,
    floors: {
      G: {
        y: 0, wallH: 9, wall: 'paint', wallTint: [0.4, 0.37, 0.33], floor: 'concrete', ceil: 'concrete2', lampPower: 0, lampColour: [1, 0.9, 0.75], lampEvery: 99, noLamps: true,
        carve: { size: [W, H], ops, after: [] },
      },
    },
    extra(kit) {
      const { box, level, mid, CELL: C } = kit;
      // each block a facade of its own colour: a skin a hand's breadth out from its walls, and a cornice
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const b = block(c, r), t0 = R.tints[(c * 3 + r * 5) % R.tints.length], t = t0.map((v) => v * 0.62);   // (darker: the lamps light them pale)
        const x0 = (b.x0 - 0.5) * C - 0.12, x1 = (b.x1 + 1.5) * C + 0.12, z0 = (b.y0 - 0.5) * C - 0.12, z1 = (b.y1 + 1.5) * C + 0.12;
        box([x0, 0, z0], [x1, 9.2, z0 + 0.02], 'paint', { tint: t, solid: false });
        box([x0, 0, z1 - 0.02], [x1, 9.2, z1], 'paint', { tint: t, solid: false });
        box([x0, 0, z0], [x0 + 0.02, 9.2, z1], 'paint', { tint: t, solid: false });
        box([x1 - 0.02, 0, z0], [x1, 9.2, z1], 'paint', { tint: t, solid: false });
        box([x0 - 0.2, 9.2, z0 - 0.2], [x1 + 0.2, 9.6, z1 + 0.2], 'concrete2', { tint: [t[0] * 0.8, t[1] * 0.8, t[2] * 0.8], solid: false });
      }
      // the jobs' doors: a door on the front, its sign over it (green when done), a lamp
      for (const e of entrances) {
        const off = 0.5 * C + 0.11, cxw = mid(e.x), czw = mid(e.y);
        const face = e.side === 'S' ? [cxw, czw + off] : e.side === 'N' ? [cxw, czw - off] : e.side === 'E' ? [cxw + off, czw] : [cxw - off, czw];
        const yaw = e.side === 'S' ? 0 : e.side === 'N' ? Math.PI : e.side === 'E' ? Math.PI / 2 : -Math.PI / 2;
        const out = e.side === 'S' ? [0, 1] : e.side === 'N' ? [0, -1] : e.side === 'E' ? [1, 0] : [-1, 0];
        const along = out[0] ? [0, 1] : [1, 0];
        const p = (a, o) => [face[0] + along[0] * a + out[0] * o, face[1] + along[1] * a + out[1] * o];
        const [a0, b0] = p(-0.6, 0.02), [a1, b1] = p(0.6, 0.1);
        box([Math.min(a0, a1), 0, Math.min(b0, b1)], [Math.max(a0, a1), 2.3, Math.max(b0, b1)], 'wood', { tint: done[e.to] === 'success' ? [0.3, 0.42, 0.3] : [0.42, 0.28, 0.2], solid: false });
        const [sx, sz] = p(0, 0.14);
        level.signs.push({ pos: [sx, 3.0, sz], yaw, w: Math.max(2.4, Math.min(5.2, e.title.length * 0.2)), h: 0.7, text: e.title.toUpperCase(), sub: 'Level ' + e.no, col: done[e.to] === 'success' ? '#24452a' : done[e.to] === 'partial' ? '#5a4a1a' : '#3a2018' });
        const [lx, lz] = p(0, 0.8);
        level.lights.push({ pos: [lx, 3.6, lz], range: 7, intensity: 0.75, color: [1, 0.85, 0.6] });
        const [ex, ez] = p(0, 1.1);
        e.pos = [ex, 0, ez];
      }
      // the street lamps, along every street
      for (let x = 2; x < W; x += 9) for (let k = 0; k <= ROWS; k++) level.lights.push({ pos: [mid(x), 5, mid(k * (BH + 2 + ST) + 2)], range: 14, intensity: 0.8, color: [1, 0.88, 0.7], street: true });
      // Yard 7's gate, west
      level.signs.push({ pos: [mid(1), 3.4, mid(Math.floor(H / 2)) - 2.6], yaw: Math.PI / 2, w: 3, h: 0.8, text: R.gate.toUpperCase(), sub: 'Ghost HQ', col: '#24304a', free: true });
      level.district = { region, entrances };
    },
    vehicles: [{ id: 'ghostvan', kind: 'car', model: 'lightUtility', paint: 'grey', at: [3, Math.floor(H / 2) + 3], yaw: -Math.PI / 2, hp: 900 }],
    start: { x: 2, y: Math.floor(H / 2), floor: 'G', yaw: -Math.PI / 2 },
    zones: [{ id: 'city', label: reg.name + (heat >= 15 ? ' - heat: ' + (heat >= 70 ? 'MANHUNT' : heat >= 40 ? 'HUNTED' : 'WATCHED') : ''), at: [0, 0, W - 1, H - 1] }],
    guards: reds,
    civilians,
    objectives: [],
  };
}

export const DISTRICT_SIZE = { W, H };
