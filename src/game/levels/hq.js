// FRONTLINE - Ghost HQ, under Yard 7 (Rhys: "Yard 7 is Ghost HQ - an underground laboratory and command
// centre (the briefing room, the trophy cabinet), a helipad, a van or chopper out to a level").
//
// A bunker hut in the yard, behind you and to the west where you start, with stairs down 12 m to the
// operations hall:
//   - the operations table: E for your assignments - every level, and how you go (van or helicopter)
//   - the trophy cabinet: what you have earned
//   - Logistics: a counter where anything unlocked can be drawn, as at the Quartermaster
//   - Q Branch: the inventor's bench (gadgets, to come)
//   - (M6.29) the server room, off the hall's north-east corner: the racks, the monitor wall (the
//     yard's systems, and whose they are), the CCTV desk, and the security console that locks an
//     intruder out (see hq_security.js) - and the hall's own two turrets, hung from its ceiling
// and a helipad in the yard. Coming back from a mission (index.html?at=hq) you arrive in the hall.

import { Crate } from '../../sim/arms/loadout.js';

// The plan is drawn as if the hall lay west of the stairs, then mirrored into the yard (X below) and moved 3 m
// south (Z), so the hut stands west of the ammo dump - clear ground, its door well back from the watchtower's
// ladder - and the hall runs east from the stairs, under the yard.
const MX = -27, X = (x) => MX - x, DZ = 3, Z = (z) => z + DZ;
const PLAN = {
  hall: { x0: -27, x1: -1.4, z0: 36, z1: 58 },
  shaft: { x0: -1, x1: 15, z0: 46, z1: 52.4 },     // the stairwell, yard to hall
  ops: [-14, 48],                                 // the operations table
  trophies: [-16, 36.9],                          // the trophy cabinet, along the north wall
  logistics: [-20, 56.6],                         // the counter, along the south wall
  q: [-4.5, 38.5],                                // Q Branch's bench
  server: { x0: -27, x1: -17.4, z0: 28, z1: 35.6 },  // the server room, north of the hall's far end
  serverDoor: [-26.2, -24.6],                     // its doorway in the hall's north wall
  console: [-24, 28.9],                         // the security console, against its north wall
  cctvDesk: [-19.8, 29.3],                        // the CCTV desk
};
const flip = (r) => ({ x0: X(r.x1), x1: X(r.x0), z0: Z(r.z0), z1: Z(r.z1) });
// where everything is, in the yard
export const HQ = {
  floor: -12,                                     // the hall's floor
  hall: flip(PLAN.hall),
  shaft: flip(PLAN.shaft),
  ops: [X(PLAN.ops[0]), Z(PLAN.ops[1])],
  trophies: [X(PLAN.trophies[0]), Z(PLAN.trophies[1])],
  logistics: [X(PLAN.logistics[0]), Z(PLAN.logistics[1])],
  q: [X(PLAN.q[0]), Z(PLAN.q[1])],
  training: [X(PLAN.hall.x0) - 0.4, Z(48)],          // (M6.31) the training screen: your skills
  caseBoard: [X(-5), Z(PLAN.hall.z1) - 0.6],         // (M6.31) the case board, on the south wall by the stairs' door
  server: flip(PLAN.server),
  console: [X(PLAN.console[0]), Z(PLAN.console[1])],
  cctvDesk: [X(PLAN.cctvDesk[0]), Z(PLAN.cctvDesk[1])],
  helipad: [-46, 28],                             // on the surface, north-west of the hut
  arrive: { pos: [X(-3), -12, Z(49.5)], yaw: -Math.PI / 2 },   // where you come back in: by the stairs, facing the hall
  // (M6.29) back to an intrusion: at the foot of the stairs, out of the hall turrets' sight
  arriveSafe: { pos: [X(5), -12, Z(51)], yaw: -Math.PI / 2 },
  // the hall's turrets, hung from its ceiling over the south side, looking north across it
  turrets: [{ id: 'hq-t1', pos: [X(-14), -12 + 3.55, Z(56.5)], yaw: 0 }, { id: 'hq-t2', pos: [X(-23), -12 + 3.55, Z(56.5)], yaw: 0 }],
};

// the yard's ground, west of the pool, with a hole for the stairwell (it replaces the one solid slab)
export function hqGround(box, E, poolX0) {
  const S = HQ.shaft, x0 = S.x0 - 0.4, x1 = S.x1 + 0.4, z0 = S.z0 - 0.4, z1 = S.z1 + 0.4;
  box([-E, -6, -E], [x0, 0, E], 'concrete');
  box([x1, -6, -E], [poolX0, 0, E], 'concrete');
  box([x0, -6, -E], [x1, 0, z0], 'concrete');
  box([x0, -6, z1], [x1, 0, E], 'concrete');
}

export function buildHQ(level) {
  const { world, pieces, signs, crates } = level;
  const lights = level.lights || (level.lights = []);
  // in the yard as it is (the helipad)
  const put = (min, max, mat, opts) => {
    opts = opts || {};
    const p = { min, max, mat, uv: opts.uv || 'world', tag: opts.tag };
    if (opts.render !== false) pieces.push(p);
    if (opts.solid !== false) world.addSolid(min, max, opts.tag || mat, { noClimb: opts.noClimb, ghost: opts.ghost });
    return p;
  };
  const putSign = (x, y, z, yaw, text, sub, w, col) => signs.push({ pos: [x, y, z], yaw, w: w || 3.2, h: (w || 3.2) * 0.34, text, sub: sub || '', col: col || '#e8b423' });
  // on the plan, mirrored into the yard
  const box = (min, max, mat, opts) => put([X(max[0]), min[1], Z(min[2])], [X(min[0]), max[1], Z(max[2])], mat, opts);
  const sign = (x, y, z, yaw, text, sub, w, col) => putSign(X(x), y, Z(z), -yaw, text, sub, w, col);
  const light = (x, y, z, range, intensity) => lights.push({ pos: [X(x), y, Z(z)], range, intensity });
  const F = HQ.floor, S = PLAN.shaft, H = PLAN.hall;

  // ── the bunker hut over the stairs, with its doorway facing the yard ─────
  {
    const x0 = S.x0 - 0.4, x1 = S.x1 + 0.4, z0 = S.z0 - 0.4, z1 = S.z1 + 0.4, top = 3.4, dx0 = 11.9, dx1 = 14.6;
    box([x0, 0, z0], [dx0, top, S.z0], 'wall');                       // north, west of the doorway
    box([dx1, 0, z0], [x1, top, S.z0], 'wall');                       // north, east of it
    box([dx0, 2.5, z0], [dx1, top, S.z0], 'wall');                    // over it
    box([x0, 0, S.z1], [x1, top, z1], 'wall');                        // south
    box([x0, 0, S.z0], [S.x0, top, S.z1], 'wall');                    // west
    box([S.x1, 0, S.z0], [x1, top, S.z1], 'wall');                    // east
    box([x0 - 0.3, top, z0 - 0.3], [x1 + 0.3, top + 0.35, z1 + 0.3], 'metal');
    sign((dx0 + dx1) / 2, 3.05, z0 - 0.04, Math.PI, 'GHOST HQ', 'Stairs down', 2.4, '#e8b423');
    box([dx0 - 0.6, 0.0, z0 - 2.2], [dx1 + 0.6, 0.02, z0], 'hazard', { solid: false });   // the apron in front
    light((dx0 + dx1) / 2, 2.6, (S.z0 + S.z1) / 2, 10, 0.8);
  }

  // ── the stairwell: three flights down, switching back, 12 m ─────────────
  {
    const FX0 = 2.5, FX1 = 11.5, zm = (S.z0 + S.z1) / 2;
    // the shaft's walls below ground, and its floor at the bottom
    box([S.x0 - 0.4, F - 0.4, S.z0 - 0.4], [S.x1 + 0.4, F, S.z1 + 0.4], 'concrete2');
    box([S.x0 - 0.4, F, S.z0 - 0.4], [S.x1 + 0.4, 0, S.z0], 'wall');
    box([S.x0 - 0.4, F, S.z1], [S.x1 + 0.4, 0, S.z1 + 0.4], 'wall');
    box([S.x1, F, S.z0], [S.x1 + 0.4, 0, S.z1], 'wall');
    // the west wall, with the doorway into the hall at the bottom
    box([S.x0 - 0.4, F + 2.6, S.z0], [S.x0, 0, S.z1], 'wall');
    box([S.x0 - 0.4, F, S.z0], [S.x0, F + 2.6, 47.4], 'wall');
    box([S.x0 - 0.4, F, 51.0], [S.x0, F + 2.6, S.z1], 'wall');
    // the landing at the top (from the doorway), and floor over the rest of the shaft at yard level
    box([FX1, -0.4, S.z0], [S.x1, 0, S.z1], 'concrete2');
    box([S.x0, -0.4, zm], [FX1, 0, S.z1], 'concrete2');
    box([S.x0, -0.4, S.z0], [FX0, 0, zm], 'concrete2');
    // a rail along the stairs' open side at the top
    box([FX0, 0, zm - 0.05], [FX1, 1.1, zm + 0.05], 'rail', { render: false, noClimb: true });
    box([FX0, 1.0, zm - 0.04], [FX1, 1.1, zm + 0.04], 'rail', { solid: false });
    // a wall between the flights, so nothing drops through from one to the one below
    box([FX0 + 0.5, F, zm - 0.1], [FX1 - 0.5, -0.4, zm + 0.1], 'wall');
    const flight = (y0, y1, z0, z1, west) => {
      const n = Math.round((y0 - y1) / 0.22), run = (FX1 - FX0) / n;
      for (let i = 0; i < n; i++) {
        const y = y0 - (i + 1) * 0.22, x = west ? FX1 - (i + 1) * run : FX0 + i * run;
        box([x, y, z0], [x + run, y + 0.22, z1], 'concrete');
      }
    };
    const landing = (y, xa, xb) => box([xa, y - 0.25, S.z0], [xb, y, S.z1], 'concrete');
    flight(0, -4, S.z0, zm - 0.1, true);       landing(-4, S.x0, FX0 + 0.5);
    flight(-4, -8, zm + 0.1, S.z1, false);     landing(-8, FX1 - 0.5, S.x1);
    flight(-8, F, S.z0, zm - 0.1, true);
    for (const y of [-1.5, -5.5, -9.5]) light(7, y, zm, 12, 0.85);
  }

  // ── the operations hall ─────────────────────────────────────────────────
  {
    const top = F + 4;
    box([H.x0 - 0.4, F - 0.4, H.z0 - 0.4], [H.x1 + 0.4, F, H.z1 + 0.4], 'concrete2');              // floor
    box([H.x0 - 0.4, top, H.z0 - 0.4], [H.x1 + 0.4, top + 0.4, H.z1 + 0.4], 'metal');              // ceiling
    // north, with the server room's doorway at its west (on the plan) end
    const [sd0, sd1] = PLAN.serverDoor;
    box([H.x0 - 0.4, F, H.z0 - 0.4], [sd0, top, H.z0], 'wall');
    box([sd0, F + 2.4, H.z0 - 0.4], [sd1, top, H.z0], 'wall');
    box([sd1, F, H.z0 - 0.4], [H.x1 + 0.4, top, H.z0], 'wall');
    box([H.x0 - 0.4, F, H.z1], [H.x1 + 0.4, top, H.z1 + 0.4], 'wall');                             // south
    box([H.x0 - 0.4, F, H.z0], [H.x0, top, H.z1], 'wall');                                         // west
    // east: the shaft's own wall where they meet, a wall either side of it
    box([H.x1, F, H.z0], [H.x1 + 0.4, top, S.z0 - 0.4], 'wall');
    box([H.x1, F, S.z1 + 0.4], [H.x1 + 0.4, top, H.z1], 'wall');
    box([H.x1, F + 2.6, S.z0 - 0.4], [H.x1 + 0.4, top, S.z1 + 0.4], 'wall', { solid: false });
    for (const x of [-22, -14, -6]) for (const z of [41, 53]) light(x, top - 0.4, z, 13, 0.9);
    sign(-14, F + 3.3, H.z1 - 0.06, Math.PI, 'GHOST HQ', 'Operations', 3.6, '#e8b423');
    // (M6.31) the case board: a corkboard with its string, on the south wall
    box([-7.4, F + 1.0, H.z1 - 0.08], [-2.6, F + 2.6, H.z1], 'wood', { solid: false });
    box([-7.2, F + 1.1, H.z1 - 0.1], [-2.8, F + 2.5, H.z1 - 0.08], 'board', { solid: false });
    sign(-5, F + 2.95, H.z1 - 0.12, Math.PI, 'THE CASE', 'E at the board', 2.0, '#e05050');

    // the operations table: a lit map under glass, on a plinth
    const [ox, oz] = PLAN.ops;
    box([ox - 2.6, F, oz - 1.5], [ox + 2.6, F + 0.9, oz + 1.5], 'metal');
    box([ox - 2.7, F + 0.9, oz - 1.6], [ox + 2.7, F + 0.98, oz + 1.6], 'paper', { solid: false });
    for (let i = 0; i < 5; i++) box([ox - 2.2 + i * 1.1, F + 0.985, oz - 1.2], [ox - 2.2 + i * 1.1 + 0.04, F + 0.99, oz + 1.2], 'hazard', { solid: false });
    sign(ox, F + 2.5, oz - 1.62, Math.PI, 'OPERATIONS', 'E at the table: your assignments', 2.6, '#7fd07f');
    sign(ox, F + 2.5, oz + 1.62, 0, 'OPERATIONS', 'E at the table: your assignments', 2.6, '#7fd07f');
    // screens along the west wall
    for (const [z, t, sub] of [[42, 'THEATRE OF OPERATIONS', 'Severia and beyond'], [48, 'TRAINING', 'E here: your skills'], [54, 'GHOST', 'We were never here']]) {
      box([H.x0, F + 1.3, z - 2], [H.x0 + 0.12, F + 3.2, z + 2], 'metal');
      sign(H.x0 + 0.14, F + 2.25, z, Math.PI / 2, t, sub, 3.4, '#6cc4e8');
    }

    // the trophy cabinet: glass-fronted, along the north wall
    const [tx, tz] = PLAN.trophies;
    box([tx - 6, F, H.z0], [tx + 6, F + 0.5, tz + 0.2], 'wood');                                   // its plinth
    box([tx - 6, F + 2.3, H.z0], [tx + 6, F + 2.5, tz + 0.2], 'wood', { solid: false });            // its top
    for (const x of [tx - 6, tx - 2.05, tx + 1.95, tx + 5.9]) box([x, F + 0.5, H.z0], [x + 0.1, F + 2.3, tz + 0.2], 'wood', { solid: false });
    box([tx - 6, F + 0.5, H.z0], [tx + 6, F + 2.3, H.z0 + 0.08], 'felt', { solid: false });          // the lining behind
    box([tx - 6, F, H.z0], [tx + 6, F + 2.5, tz + 0.2], 'wood', { render: false });
    for (let y = F + 1.1; y < F + 2.3; y += 0.6) box([tx - 5.9, y, H.z0], [tx + 5.9, y + 0.04, tz + 0.15], 'metal', { solid: false });
    box([tx - 6, F + 0.5, tz + 0.2], [tx + 6, F + 2.3, tz + 0.23], 'glass', { solid: false });
    sign(tx, F + 2.95, tz + 0.3, 0, 'TROPHIES', 'E at the cabinet', 2.4, '#e8b423');

    // Logistics: a counter on the south side, kit on shelves behind it
    const [lx, lz] = PLAN.logistics;
    box([lx - 4, F, lz - 1.6], [lx + 4, F + 1.05, lz - 1.0], 'crate');
    box([lx - 4.1, F + 1.05, lz - 1.7], [lx + 4.1, F + 1.12, lz - 0.9], 'metal');
    box([lx - 4, F, H.z1 - 0.5], [lx + 4, F + 2.6, H.z1], 'metal');
    for (let y = F + 0.6; y < F + 2.6; y += 0.65) box([lx - 3.9, y, H.z1 - 1.0], [lx + 3.9, y + 0.05, H.z1 - 0.5], 'metal', { solid: false });
    for (let i = 0; i < 8; i++) box([lx - 3.6 + i * 0.9, F + 0.65 + (i % 3) * 0.65, H.z1 - 0.95], [lx - 3.0 + i * 0.9, F + 1.0 + (i % 3) * 0.65, H.z1 - 0.55], i % 2 ? 'cloth' : 'crate', { solid: false });
    sign(lx, F + 2.9, lz - 1.75, Math.PI, 'LOGISTICS', 'Anything unlocked - free', 2.6, '#e8b423');
    const q = new Crate('armoury', [], [X(lx), F + 0.5, Z(lz - 1.3)]);
    q.label = 'LOGISTICS'; q.infinite = true;
    crates.push(q);

    // Q Branch: the inventor's bench and his pegboard
    const [qx, qz] = PLAN.q;
    box([qx - 2.4, F, qz - 0.6], [qx + 2.4, F + 0.95, qz + 0.6], 'crate');
    box([qx - 2.5, F + 0.95, qz - 0.7], [qx + 2.5, F + 1.0, qz + 0.7], 'metal', { solid: false });
    box([qx - 2.4, F + 1.2, H.z0], [qx + 2.4, F + 2.9, H.z0 + 0.08], 'board', { solid: false });
    for (let i = 0; i < 6; i++) box([qx - 2 + i * 0.75, F + 1.0, qz - 0.3], [qx - 1.7 + i * 0.75, F + 1.0 + 0.12 + (i % 3) * 0.1, qz], i % 2 ? 'metal' : 'lamp', { solid: false });
    sign(qx, F + 3.3, H.z0 + 0.1, 0, 'Q BRANCH', 'E at the bench: gadgets', 2.4, '#6cc4e8');
  }

  // ── the server room (M6.29) ─────────────────────────────────────────────
  {
    const R = PLAN.server, top = F + 3.2, [sd0, sd1] = PLAN.serverDoor;
    box([R.x0 - 0.4, F - 0.4, R.z0 - 0.4], [R.x1 + 0.4, F, R.z1], 'concrete2');                    // floor
    box([R.x0 - 0.4, top, R.z0 - 0.4], [R.x1 + 0.4, top + 0.4, R.z1], 'metal');                    // ceiling
    box([R.x0 - 0.4, F, R.z0 - 0.4], [R.x1 + 0.4, top, R.z0], 'wall');                             // north
    box([R.x0 - 0.4, F, R.z0], [R.x0, top, R.z1], 'wall');                                         // west (on the plan)
    box([R.x1, F, R.z0], [R.x1 + 0.4, top, R.z1], 'wall');                                         // east
    box([sd1, top, R.z1], [R.x1 + 0.4, F + 4, R.z1 + 0.4], 'wall', { solid: false });               // over its wall to the hall's ceiling
    // the racks: two rows, their lights in strips down the front
    for (const z of [31.2, 33.6]) {
      box([-23.2, F, z - 0.45], [-18.2, F + 2.2, z + 0.45], 'metal');
      for (let x = -23; x < -18.4; x += 0.62) for (const y of [0.5, 1.1, 1.7]) box([x, F + y, z + 0.46], [x + 0.06, F + y + 0.03, z + 0.47], 'lamp', { solid: false });
      for (let x = -23; x < -18.4; x += 0.62) for (const y of [0.5, 1.1, 1.7]) box([x + 0.2, F + y, z - 0.47], [x + 0.26, F + y + 0.03, z - 0.46], 'screen', { solid: false });
    }
    // the security console and the CCTV desk, under the monitor wall
    const [cx, cz] = PLAN.console, [vx, vz] = PLAN.cctvDesk;
    box([cx - 1.2, F, cz - 0.5], [cx + 1.2, F + 0.82, cz + 0.4], 'metal');
    box([cx - 0.5, F + 0.82, cz - 0.42], [cx + 0.5, F + 0.9, cz - 0.1], 'hazard', { solid: false });   // its lockout key, under a yellow flap
    box([vx - 0.9, F, vz - 0.4], [vx + 0.9, F + 0.76, vz + 0.4], 'metal');
    for (const dx of [-0.42, 0.42]) box([vx + dx - 0.3, F + 0.78, vz - 0.05], [vx + dx + 0.3, F + 1.2, vz + 0.02], 'screen', { solid: false });
    for (let i = 0; i < 6; i++) box([R.x0 + 0.3 + i * 1.2, F + 1.4, R.z0], [R.x0 + 1.3 + i * 1.2, F + 2.0, R.z0 + 0.06], 'screen', { solid: false });
    sign(sd0 - 0.2 + (sd1 - sd0) / 2, F + 2.75, R.z1 + 0.06, 0, 'SERVER ROOM', 'Yard 7 security', 1.8, '#6cc4e8');
    // the status board over the console: the yard's systems, and whose they are (hq_security.js fills it)
    signs.push({ pos: [X(cx), F + 2.55, Z(R.z0 + 0.08)], yaw: 0, w: 3.6, h: 1.12, text: 'YARD 7 SECURITY', sub: '', col: '#7fd07f',
      board: () => (level.hqBoard ? level.hqBoard() : [['YARD 7 SECURITY', 'GHOST'], ['TURRETS', '4 OK'], ['CAMERAS', 'OK'], ['NETWORK', 'SECURE']]) });
    light(-22, top - 0.3, 31.8, 9, 0.75);
  }
  world.addZone([X(PLAN.server.x1), F - 0.5, Z(PLAN.server.z0)], [X(PLAN.server.x0), F + 3.2, Z(PLAN.server.z1)], 'hq_server', 'Ghost HQ - the server room');

  // ── the helipad, in the yard ────────────────────────────────────────────
  {
    const [px, pz] = HQ.helipad;
    put([px - 7, 0, pz - 7], [px + 7, 0.03, pz + 7], 'concrete2', { solid: false });
    put([px - 6.6, 0.03, pz - 6.6], [px + 6.6, 0.04, pz - 6.2], 'hazard', { solid: false });
    put([px - 6.6, 0.03, pz + 6.2], [px + 6.6, 0.04, pz + 6.6], 'hazard', { solid: false });
    put([px - 6.6, 0.03, pz - 6.6], [px - 6.2, 0.04, pz + 6.6], 'hazard', { solid: false });
    put([px + 6.2, 0.03, pz - 6.6], [px + 6.6, 0.04, pz + 6.6], 'hazard', { solid: false });
    // the H
    put([px - 2.2, 0.04, pz - 3], [px - 1.3, 0.05, pz + 3], 'hazard', { solid: false });
    put([px + 1.3, 0.04, pz - 3], [px + 2.2, 0.05, pz + 3], 'hazard', { solid: false });
    put([px - 1.3, 0.04, pz - 0.45], [px + 1.3, 0.05, pz + 0.45], 'hazard', { solid: false });
    put([px - 7.6, 0, pz - 7.6], [px - 7.4, 2.6, pz - 7.4], 'metal');
    putSign(px - 7.5, 2.2, pz - 7.38, 0, 'HELIPAD', 'Ghost Air', 1.6, '#e8b423');
  }
  // the name in the corner of the screen, down here
  const WH = HQ.hall, WS = HQ.shaft;
  world.addZone([WH.x0, F - 0.5, WH.z0], [WH.x1, F + 4, WH.z1], 'hq', 'Ghost HQ');
  world.addZone([WS.x0, F - 0.5, WS.z0], [WS.x1, -0.3, WS.z1], 'hq_stairs', 'Ghost HQ');
  level.hq = HQ;
}
