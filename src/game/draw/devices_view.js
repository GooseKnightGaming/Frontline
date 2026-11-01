// FRONTLINE - how the defence systems look (sim/world/devices.js): a camera body on its bracket, a
// turret head on its pedestal (or hung from a frame), a maglock's keypad through the door's jamb, a
// breaker panel, an alarm bell - each with a light that says whose it is: red working for them, amber
// ignoring you, green yours, dark when off. Used by the missions and by Ghost HQ.
export function deviceView(pc, app, devices) {
  const devMat = (r, g, b, glow) => { const mt = new pc.StandardMaterial(); mt.diffuse = new pc.Color(r, g, b); mt.useMetalness = true; mt.metalness = glow ? 0 : 0.5; mt.gloss = 0.5; if (glow) { mt.emissive = new pc.Color(r, g, b); mt.emissiveIntensity = 2.5; } mt.update(); return mt; };
  const DEV_BODY = devMat(0.18, 0.19, 0.21), DEV_LIGHT = { on: devMat(1, 0.12, 0.08, true), friendly: devMat(1, 0.7, 0.1, true), ours: devMat(0.2, 1, 0.35, true), off: devMat(0.05, 0.05, 0.05) };
  const devPart = (parent, sx, sy, sz, x, y, z, m) => {
    const e = new pc.Entity(); e.addComponent('render', { type: 'box', material: m || DEV_BODY, castShadows: false });
    e.setLocalScale(sx, sy, sz); e.setLocalPosition(x, y, z); parent.addChild(e); return e;
  };
  for (const d of devices) {
    const e = new pc.Entity('device-' + d.id); e.setPosition(d.pos[0], d.pos[1], d.pos[2]); app.root.addChild(e);
    d.ent = e;
    const head = new pc.Entity(); e.addChild(head);
    if (d.kind === 'lock') {
      // a keypad, through the jamb: the same face on both sides, its light showing through
      head.setLocalEulerAngles(0, d.yaw * 180 / Math.PI, 0);
      const across = d.plane === 'x';            // the door's wall runs along z: the pad's thickness along x
      devPart(head, across ? 0.3 : 0.11, 0.18, across ? 0.11 : 0.3, 0, 0, 0);
      d.light = devPart(head, across ? 0.32 : 0.04, 0.035, across ? 0.04 : 0.32, 0, 0.055, 0, DEV_LIGHT.on);
    } else if (d.kind === 'lights') {
      // a grey breaker box on the wall
      devPart(head, 0.42, 0.55, 0.12, 0, 0, 0, devMat(0.45, 0.47, 0.5));
      d.light = devPart(head, 0.06, 0.06, 0.02, 0.13, 0.19, -0.065, DEV_LIGHT.on);
    } else if (d.kind === 'alarm') {
      // a red bell, high up, with its beacon
      devPart(head, 0.3, 0.3, 0.1, 0, 0, 0, devMat(0.7, 0.08, 0.06));
      devPart(head, 0.12, 0.12, 0.08, 0, 0, -0.08, devMat(0.25, 0.25, 0.27));
      d.light = devPart(head, 0.08, 0.06, 0.08, 0, 0.19, 0, DEV_LIGHT.on);
    } else if (d.kind === 'camera') {
      devPart(head, 0.16, 0.14, 0.34, 0, 0, -0.05);
      devPart(head, 0.1, 0.1, 0.04, 0, 0, -0.23, devMat(0.05, 0.08, 0.12));
      d.light = devPart(head, 0.035, 0.035, 0.02, 0.05, 0.05, -0.23, DEV_LIGHT.on);
    } else {
      devPart(head, 0.5, 0.32, 0.55, 0, 0, 0);
      devPart(head, 0.07, 0.07, 0.55, -0.1, -0.02, -0.5); devPart(head, 0.07, 0.07, 0.55, 0.1, -0.02, -0.5);
      d.light = devPart(head, 0.14, 0.06, 0.02, 0, 0.1, -0.28, DEV_LIGHT.on);
    }
    if (d.hung) devPart(e, 0.12, 0.6, 0.12, 0, 0.45, 0);      // hung from a frame overhead
    d.head = head;
  }
  // vision: what you see by - a pinhole camera (d.hidden) shows only to EMF
  const drawDevices = (vision) => {
    for (const d of devices) {
      if (!d.head) continue;
      if (d.hidden) { const show = vision === 'emf'; if (d.ent.enabled !== show) d.ent.enabled = show; }
      if (d.broken) { if (!d.slumped) { d.slumped = true; d.head.setLocalEulerAngles(48, d.facing * 180 / Math.PI, 14); d.light.render.material = DEV_LIGHT.off; } continue; }
      if (d.kind === 'camera' || d.kind === 'turret') d.head.setLocalEulerAngles(d.kind === 'camera' ? -22 : 0, d.facing * 180 / Math.PI, 0);
      else if (d.kind !== 'lock') d.head.setLocalEulerAngles(0, d.yaw * 180 / Math.PI, 0);
      const want = d.live ? DEV_LIGHT[d.mode] || DEV_LIGHT.on : DEV_LIGHT.off;
      if (d.light.render.material !== want) d.light.render.material = want;
    }
  };
  return { draw: drawDevices };
}
