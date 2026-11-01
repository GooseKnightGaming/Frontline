// FRONTLINE - Yard 7's own security, and the day someone else takes it (Rhys's roadmap, "Hacking and
// control": "it works both ways - an enemy hack can turn Yard 7's own turrets on you, which is the
// first proper reason for a terminal room under Yard 7: ... screens showing camera feeds and turret
// status, and a console that can lock the systems out again").
//
// The yard's turrets (the two on the hangar frame) and the operations hall's (two, hung from its
// ceiling) are Ghost's: green, watching. An intrusion - after a mission on which the reds traced your
// hack back (they know where it came from now), or now and then out of the blue - hands them to the
// reds: red, and firing on you. Coming home to one you arrive at the foot of the stairs, out of the
// hall turrets' sight; the server room is across the hall. Its security console (hold E) locks the
// intruder out, and its CCTV desk shows the yard. Until then the operations table will not send you
// anywhere. A turret can be shot out, or put out a while with an EMP.

import { Device, stepDevice } from '../../sim/world/devices.js';
import { makeTarget } from '../../sim/arms/weapons.js';
import { deviceView } from '../draw/devices_view.js';

export const INTRUSION = {
  key: 'frontline.intrusion',     // sessionStorage: set when a mission's hack was traced; read on the way home
  chance: 0.08,                   // ... or, coming home from any mission, now and then
  lockout: 5,                     // seconds at the console to lock them out
  reach: 1.7,                     // how near the console you have to be
  damage: 0.8,                    // of a turret's round: Yard 7's own guns, set for intruders
};

// note it, on a mission, for the way home
export function markIntrusion(why) {
  try { sessionStorage.setItem(INTRUSION.key, why || 'traced'); } catch (e) { /* private window */ }
}
// on the way home: is one waiting? (taken: it happens once)
export function takeIntrusion(rand) {
  let why = null;
  try { why = sessionStorage.getItem(INTRUSION.key); sessionStorage.removeItem(INTRUSION.key); } catch (e) { /* private window */ }
  if (!why && (rand === undefined ? Math.random() : rand) < INTRUSION.chance) why = 'random';
  return why;
}

// the yard's systems, as devices: Ghost's, taken over (mode 'ours': on its side, nothing to fire on)
export function hqDevices(level) {
  const list = [];
  for (const t of (level.hq && level.hq.turrets) || []) list.push(new Device({ id: t.id, kind: 'turret', pos: t.pos, yaw: t.yaw, owner: 'ghost' }));
  (level.securityTurrets || []).forEach((t, i) => list.push(new Device({ id: 'yard-t' + (i + 1), kind: 'turret', pos: [t.pos[0], t.pos[1] - 0.35, t.pos[2]], yaw: Math.PI, owner: 'ghost' })));
  for (const d of list) { d.mode = 'ours'; d.hung = true; d.yard = d.id.startsWith('yard'); }
  return list;
}
export function hijack(devices) { for (const d of devices) if (!d.broken) { d.owner = 'red'; d.mode = 'on'; d.burst = 0; d.target = null; } }
export function lockOut(devices) { for (const d of devices) if (!d.broken) { d.owner = 'ghost'; d.mode = 'ours'; d.burst = 0; d.target = null; d.jammed = 0; } }

// what the board over the console shows
export function boardRows(devices, active, t) {
  const ok = devices.filter((d) => !d.broken).length, theirs = devices.filter((d) => !d.broken && d.owner !== 'ghost').length;
  if (active) return [['!! INTRUSION !!', (Math.floor(t * 2) % 2) ? 'RED' : ''], ['TURRETS', theirs + ' HOSTILE'], ['NETWORK', 'COMPROMISED'], ['LOCK OUT', 'HOLD E']];
  return [['YARD 7 SECURITY', 'GHOST'], ['TURRETS', ok + ' OK'], ['CAMERAS', 'OK'], ['NETWORK', 'SECURE']];
}

export function hqSecurity({ pc, app, level, player, audio, note }) {
  const HQ = level.hq;
  const devices = hqDevices(level);
  level.liveDevices = devices;                       // the EMP finds them here; the radar shows them
  for (const d of devices) {
    d.known = true;
    d.target = null;
    const r = 0.32;
    d.shot = makeTarget(level.world, [d.pos[0] - r, d.pos[1] - r, d.pos[2] - r], [d.pos[0] + r, d.pos[1] + r, d.pos[2] + r], { hp: 70, score: 0, respawn: 1e9 });
    d.shot.device = d;
  }
  const view = deviceView(pc, app, devices);
  // CCTV: the yard from the hangar frame, the hut's door, and the hall
  const F = HQ.floor;
  level.cctv = {
    cameras: [
      ...(level.securityTurrets || []).map((t, i) => ({ n: i + 1, label: 'Yard 7 - the apron ' + (i ? 'east' : 'west'), pos: [t.pos[0], t.pos[1] + 0.6, t.pos[2] + 0.6], look: [t.pos[0], 0.5, t.pos[2] + 18] })),
      { n: 3, label: 'Yard 7 - Ghost HQ\'s door', pos: [HQ.shaft.x0 + 3, 3.1, HQ.shaft.z0 - 6], look: [HQ.shaft.x0 + 11, 0.8, HQ.shaft.z0] },
      { n: 4, label: 'Ghost HQ - the operations hall', pos: [HQ.hall.x1 - 1, F + 3.5, HQ.hall.z0 + 1], look: [HQ.ops[0], F + 0.8, HQ.ops[1]] },
    ],
    console: [HQ.cctvDesk[0], F, HQ.cctvDesk[1]],
  };
  level.cctv.consoles = [level.cctv.console];
  const S = { active: false, why: null, holdT: 0, t: 0 };
  level.hqBoard = () => boardRows(devices, S.active, S.t);
  // a round's flash and line
  const mat = (() => { const m = new pc.StandardMaterial(); m.emissive = new pc.Color(1, 0.8, 0.4); m.diffuse = new pc.Color(0, 0, 0); m.useLighting = false; m.update(); return m; })();
  const tracer = new pc.Entity('hq-tracer'); tracer.addComponent('render', { type: 'box', material: mat, castShadows: false }); tracer.enabled = false; app.root.addChild(tracer);
  let tracerT = 0;
  const shoot = (dev, ev) => {
    const f = dev.facing, from = [dev.pos[0] - Math.sin(f) * 0.55, dev.pos[1] - 0.1, dev.pos[2] - Math.cos(f) * 0.55];
    const d = Math.hypot(from[0] - player.pos[0], from[1] - player.pos[1], from[2] - player.pos[2]);
    if (audio.shot) audio.shot({ family: 'rifle' }, Math.max(0.12, Math.min(1, 1.1 - d / 45)));
    const to = ev.to, len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
    tracer.enabled = true; tracerT = 0.05;
    tracer.setPosition((from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2); tracer.lookAt(to[0], to[1], to[2]); tracer.setLocalScale(0.02, 0.02, Math.max(0.1, len));
    if (ev.hit) player.damage(ev.damage * INTRUSION.damage, 'shot', from); else if (audio.whizz) audio.whizz();
  };
  const nearConsole = () => Math.abs(player.pos[1] - F) < 1.5 && Math.hypot(player.pos[0] - HQ.console[0], player.pos[2] - HQ.console[1]) < INTRUSION.reach;
  const api = {
    devices, state: S,
    get active() { return S.active; },
    // it begins: the reds have the yard's systems
    start(why) {
      S.active = true; S.why = why || 'random'; S.holdT = 0;
      hijack(devices);
      if (audio.siren) audio.siren(6);
      note(why === 'traced' ? 'INTRUSION - they traced your hack back to Yard 7, and they have its turrets. Get to the server room (across the hall, north-east corner) and lock them out at the security console.'
        : 'INTRUSION - someone has hacked Yard 7\'s security: its turrets are firing on anything that moves. Get to the server room (across the hall, north-east corner) and lock them out at the security console.', 9);
    },
    lockOut() {
      S.active = false; S.holdT = 0;
      lockOut(devices);
      if (audio.confirm) audio.confirm();
      note('Locked out. Yard 7\'s systems are Ghost\'s again.', 5);
    },
    // E held at the console, during an intrusion: its progress (0..1), or null
    progress() { return S.active && S.holdT > 0 ? Math.min(1, S.holdT / INTRUSION.lockout) : null; },
    tip() {
      if (!nearConsole()) return null;
      if (!S.active) return 'Security console  -  all of Yard 7\'s systems are Ghost\'s';
      return S.holdT > 0 ? 'Locking them out... ' + Math.round(100 * S.holdT / INTRUSION.lockout) + '%' : 'Hold E  Lock the intruder out';
    },
    tick(dt, held) {
      S.t += dt;
      if (tracerT > 0) { tracerT -= dt; if (tracerT <= 0) tracer.enabled = false; }
      if (S.active && held && nearConsole() && player.mode !== 'dead') { S.holdT += dt; if (S.holdT >= INTRUSION.lockout) api.lockOut(); }
      else S.holdT = 0;
      const you = { pos: player.pos, chest: [player.pos[0], player.pos[1] + 1.15, player.pos[2]], dead: player.mode === 'dead' };
      for (const d of devices) {
        if (d.shot.down && !d.broken) { d.broken = true; d.mode = 'off'; note('Turret shot out.', 2.5); }
        stepDevice(d, dt, { world: level.world, you, guards: [], shoot });
      }
      view.draw();
    },
  };
  return api;
}
