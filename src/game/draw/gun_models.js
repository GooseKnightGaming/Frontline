// FRONTLINE - weapons drawn in code (M6.29; the "weapon models beyond the four Quaternius ones" still to
// do): until now every gun on Rhys's sheet borrowed one of four models - a pistol, an assault rifle, a sniper
// rifle, a grenade launcher - so a pump shotgun, an SMG, a belt-fed machine gun, a rocket launcher and a laser
// all looked like an AR. Now those kinds are built here from simple parts, in the same low-poly, flat-shaded
// look as the Quaternius models, each at its own length off the sheet. Pistols, assault rifles, battle rifles,
// carbines and sniper rifles keep their models (they look the part already).
//
// A model is built pointing down -z, in metres, its middle 0.15 of its length ahead of the hand, centred
// up and down - the way weapons_view.js places a loaded model - so it drops into the same place.

import { ITEMS, FAMILIES, baseId } from '../../sim/arms/loadout.js';

// which shape a weapon takes, or null: keep its loaded model
export function gunShape(id) {
  const it = ITEMS[baseId(id)];
  if (!it) return null;
  const fam = it.family, kind = (it.kind || '').toLowerCase(), f = FAMILIES[fam];
  if (!f || f.kind !== 'gun') return null;
  if (fam === 'energy' || kind === 'energy' || it.energy || it.beam) return (it.length || (it.size === 'backup' ? 0.3 : 0.6)) < 0.4 ? 'beampistol' : 'beam';
  if (fam === 'shotgun') return 'shotgun';
  if (fam === 'smg') return kind === 'machine pistol' ? 'mpistol' : 'smg';
  if (/machine gun/.test(kind) || it.belt || baseId(id) === 'KR90') return /heavy/.test(kind) ? 'hmg' : 'lmg';
  if (fam === 'launcher') return /rocket/.test(kind) || it.lockOn || it.rocket ? 'rocket' : (it.mag || 1) >= 4 ? 'drum' : 'gl';
  return null;
}

// the parts, each [shape 'box' | 'cyl', [w, h, d] (a cylinder: [r, r, length]), [x, y, z] of its middle, material key]
// L: the weapon's real length. y is up from the bore's line; z negative is forward.
function parts(shape, L) {
  const P = [];
  const box = (w, h, d, x, y, z, m) => P.push(['box', [w, h, d], [x, y, z], m || 'metal']);
  const cyl = (r, len, x, y, z, m) => P.push(['cyl', [r, r, len], [x, y, z], m || 'metal']);
  const grip = (z, h, m) => box(0.032, h || 0.095, 0.042, 0, -0.06 - (h || 0.095) / 2 + 0.03, z, m || 'poly');
  switch (shape) {
    case 'shotgun': {
      // a pump: the barrel over its tube magazine, the forend round the tube, a wooden stock
      cyl(0.0125, L * 0.58, 0, 0.012, -L * 0.42);
      cyl(0.011, L * 0.46, 0, -0.016, -L * 0.36);
      box(0.046, 0.046, L * 0.17, 0, -0.012, -L * 0.42, 'wood');
      box(0.05, 0.072, L * 0.2, 0, -0.004, -L * 0.04);
      box(0.004, 0.012, 0.03, 0, 0.034, -L * 0.1);
      grip(0.02, 0.09, 'wood');
      box(0.042, 0.08, L * 0.32, 0, -0.035, L * 0.22, 'wood');
      box(0.044, 0.11, 0.02, 0, -0.045, L * 0.38, 'poly');
      break;
    }
    case 'smg': case 'mpistol': {
      const s = shape === 'mpistol' ? 0.8 : 1;
      box(0.05 * s, 0.075 * s, L * 0.48, 0, 0, -L * 0.08);
      cyl(0.011, L * 0.22, 0, 0.008, -L * 0.42);
      box(0.026, 0.15 * s, 0.038, 0, -0.1 * s, -L * 0.14, 'poly');        // the magazine, straight down
      grip(0.04, 0.09 * s);
      box(0.03, 0.05, 0.035, 0, -0.055, -L * 0.3, 'poly');                // a stubby foregrip
      if (shape === 'smg') { box(0.014, 0.04, L * 0.3, 0, 0.0, L * 0.22, 'metal'); box(0.03, 0.07, 0.02, 0, -0.01, L * 0.37, 'poly'); }
      box(0.008, 0.02, 0.06, 0, 0.045 * s, -L * 0.05);                    // the sight rail
      break;
    }
    case 'lmg': case 'hmg': {
      const h = shape === 'hmg' ? 1.25 : 1;
      box(0.07 * h, 0.09 * h, L * 0.34, 0, 0, -L * 0.02);
      cyl(0.016 * h, L * 0.52, 0, 0.01, -L * 0.48);
      box(0.05 * h, 0.03, L * 0.36, 0, 0.032 * h, -L * 0.44, 'poly');     // the barrel's heat shield
      box(0.012, 0.03, 0.12, 0, 0.065 * h, -L * 0.04);                    // the carry handle's top
      box(0.012, 0.03, 0.012, 0, 0.05 * h, -L * 0.04 - 0.055);
      box(0.012, 0.03, 0.012, 0, 0.05 * h, -L * 0.04 + 0.055);
      box(0.1 * h, 0.11 * h, 0.12, 0.03, -0.1 * h, -L * 0.06, 'drab');    // the ammunition box
      for (const sx of [-0.022, 0.022]) box(0.008, 0.008, L * 0.26, sx, -0.03, -L * 0.62);   // the bipod, folded
      grip(L * 0.08, 0.1);
      box(0.05, 0.085, L * 0.26, 0, -0.02, L * 0.3, 'poly');
      break;
    }
    case 'rocket': {
      cyl(0.048, L, 0, 0, -L * 0.15, 'drab');
      cyl(0.058, L * 0.1, 0, 0, -L * 0.62, 'drab');                       // the bell at the front
      cyl(0.054, L * 0.06, 0, 0, L * 0.33, 'metal');
      box(0.032, 0.11, 0.045, 0, -0.1, -L * 0.08, 'poly');                 // the grip and trigger
      box(0.03, 0.08, 0.04, 0, -0.085, -L * 0.3, 'poly');                  // the forward grip
      box(0.03, 0.05, 0.08, 0.06, 0.05, -L * 0.2, 'metal');                // the sight, on the left of the tube
      break;
    }
    case 'gl': {
      cyl(0.032, L * 0.42, 0, 0.005, -L * 0.42);
      box(0.06, 0.08, L * 0.24, 0, -0.005, -L * 0.1);
      grip(L * 0.04, 0.1);
      box(0.04, 0.075, L * 0.3, 0, -0.03, L * 0.22, 'poly');
      box(0.006, 0.05, 0.04, 0, 0.06, -L * 0.3);                           // the ladder sight
      break;
    }
    case 'drum': {
      // a revolving grenade launcher: the fat cylinder of rounds in the middle
      cyl(0.03, L * 0.36, 0, 0.012, -L * 0.48);
      cyl(0.075, 0.11, 0, -0.01, -L * 0.18, 'drab');
      box(0.05, 0.06, L * 0.18, 0, 0.0, L * 0.02);
      grip(L * 0.04, 0.1);
      box(0.035, 0.07, 0.04, 0, -0.05, -L * 0.38, 'poly');
      box(0.03, 0.065, L * 0.26, 0, -0.03, L * 0.26, 'poly');
      break;
    }
    case 'beam': case 'beampistol': {
      // the energy weapons: a smooth housing, a lens at the front, glowing coils down the sides
      const p = shape === 'beampistol';
      box(0.056, 0.085, L * (p ? 0.7 : 0.56), 0, 0, -L * (p ? 0.12 : 0.14), 'white');
      box(0.044, 0.05, L * 0.2, 0, 0.0, -L * (p ? 0.5 : 0.5), 'white');
      cyl(0.022, 0.03, 0, 0.0, -L * (p ? 0.62 : 0.62), 'glow');             // the lens
      for (const sx of [-0.031, 0.031]) box(0.006, 0.016, L * (p ? 0.4 : 0.36), sx, 0.012, -L * 0.16, 'glow');
      box(0.03, 0.03, L * 0.12, 0, -0.06, -L * 0.2, 'glow');                // the cell, under it
      grip(p ? 0.03 : L * 0.06, 0.09, 'poly');
      if (!p) box(0.044, 0.08, L * 0.26, 0, -0.02, L * 0.24, 'white');
      box(0.01, 0.02, 0.08, 0, 0.055, -L * 0.1, 'poly');
      break;
    }
    default: return null;
  }
  return P;
}

// the materials, made once per app
let MATS = null;
function mats(pc) {
  if (MATS) return MATS;
  const m = (r, g, b, o) => { const x = new pc.StandardMaterial(); x.diffuse = new pc.Color(r, g, b); x.useMetalness = true; x.metalness = (o && o.metal) || 0.2; x.gloss = (o && o.gloss) || 0.35; if (o && o.glow) { x.emissive = new pc.Color(r, g, b); x.emissiveIntensity = 1.8; } x.update(); return x; };
  MATS = {
    metal: m(0.16, 0.17, 0.19, { metal: 0.7, gloss: 0.5 }),
    poly: m(0.07, 0.07, 0.08, { gloss: 0.25 }),
    wood: m(0.42, 0.26, 0.14, { gloss: 0.4 }),
    drab: m(0.3, 0.32, 0.22, { gloss: 0.3 }),
    white: m(0.82, 0.84, 0.86, { gloss: 0.6 }),
    glow: m(0.35, 0.95, 1.0, { glow: true }),
  };
  return MATS;
}

// the entity, or null if this weapon keeps its loaded model
export function buildGun(pc, id, length) {
  const shape = gunShape(id);
  const P = shape && parts(shape, length || 0.6);
  if (!P) return null;
  const M = mats(pc), root = new pc.Entity('gun_' + id);
  // centre it up and down (as a loaded model is), its middle at 0.15 of its length ahead of the hand (done by
  // the caller, as for a loaded one): first find the parts' extent
  let y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [, s, p] of P) {
    const hy = s[1] / 2, hz = s[2] / 2;
    y0 = Math.min(y0, p[1] - hy); y1 = Math.max(y1, p[1] + hy); z0 = Math.min(z0, p[2] - hz); z1 = Math.max(z1, p[2] + hz);
  }
  const cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  for (const [kind, s, p, mk] of P) {
    const e = new pc.Entity();
    e.addComponent('render', { type: kind === 'cyl' ? 'cylinder' : 'box', material: M[mk] || M.metal, castShadows: false });
    if (kind === 'cyl') { e.setLocalEulerAngles(90, 0, 0); e.setLocalScale(s[0] * 2, s[2], s[1] * 2); }
    else e.setLocalScale(s[0], s[1], s[2]);
    e.setLocalPosition(p[0], p[1] - cy, p[2] - cz);
    root.addChild(e);
  }
  return root;
}
export const _parts = parts;     // (for the tests)
