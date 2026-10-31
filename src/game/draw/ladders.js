// FRONTLINE - a ladder you can see the rungs of.
//
// Two stiles and a rung every 30 cm, in one of three finishes. The climbing
// volume is added by the caller (world.addLadder); this is only what you see.

export const LADDER_STYLES = {
  iron:   { stile: 'metal', rung: 'metal' },        // galvanised grey
  yellow: { stile: 'rail', rung: 'rail' },          // escape-route yellow
  wood:   { stile: 'crate', rung: 'crate' },        // timber
};

// box: the level's own box(min, max, mat, opts). face: which way the climber
// stands, [±1, 0] or [0, ±1]. The ladder's back sits on the wall at x/z.
export function drawLadder(box, x, z, face, y0, y1, style) {
  const s = LADDER_STYLES[style] || LADDER_STYLES.iron;
  const opts = { solid: false };
  const t = 0.05;             // how far it stands off the wall
  const halfW = 0.28;         // half the width between the stiles
  const out = 0.1;            // depth of the stiles
  if (face[0]) {
    const x0 = face[0] > 0 ? x : x - out, x1 = face[0] > 0 ? x + out : x;
    for (const sz of [-halfW, halfW]) box([x0, y0, z + sz - 0.035], [x1, y1, z + sz + 0.035], s.stile, opts);
    for (let y = y0 + 0.25; y < y1; y += 0.3) {
      box([x0 + t * 0.4, y, z - halfW], [x1 - t * 0.2, y + 0.045, z + halfW], s.rung, opts);
    }
    // the brackets that hold it to the wall
    for (let y = y0 + 0.6; y < y1; y += 2.2) {
      const bx0 = face[0] > 0 ? x - 0.12 : x, bx1 = face[0] > 0 ? x : x + 0.12;
      for (const sz of [-halfW, halfW]) box([bx0, y, z + sz - 0.03], [bx1, y + 0.06, z + sz + 0.03], s.stile, opts);
    }
  } else {
    const z0 = face[1] > 0 ? z : z - out, z1 = face[1] > 0 ? z + out : z;
    for (const sx of [-halfW, halfW]) box([x + sx - 0.035, y0, z0], [x + sx + 0.035, y1, z1], s.stile, opts);
    for (let y = y0 + 0.25; y < y1; y += 0.3) {
      box([x - halfW, y, z0 + t * 0.4], [x + halfW, y + 0.045, z1 - t * 0.2], s.rung, opts);
    }
    for (let y = y0 + 0.6; y < y1; y += 2.2) {
      const bz0 = face[1] > 0 ? z - 0.12 : z, bz1 = face[1] > 0 ? z : z + 0.12;
      for (const sx of [-halfW, halfW]) box([x + sx - 0.03, y, bz0], [x + sx + 0.03, y + 0.06, bz1], s.stile, opts);
    }
  }
}
