// FRONTLINE - models placed in the world as scenery (vehicles, for now).
//
// Each is loaded once, measured, scaled to a real length, stood on the ground
// and turned to face the way the level asks. Their collision is the level's own
// boxes: a prop is only something to look at.

export function placeProps(pc, app, props) {
  const byModel = {};
  for (const p of props || []) (byModel[p.model] = byModel[p.model] || []).push(p);
  for (const [model, list] of Object.entries(byModel)) {
    const asset = new pc.Asset('prop-' + model, 'container', { url: 'assets/vehicles/' + model + '.glb' });
    asset.once('load', () => {
      for (const p of list) {
        const e = asset.resource.instantiateRenderEntity({ castShadows: true });
        const holder = new pc.Entity('prop');
        holder.addChild(e);
        app.root.addChild(holder);
        // measure it as it comes, then scale its length to the real one
        let min = null, max = null;
        for (const r of e.findComponents('render')) for (const mi of r.meshInstances) {
          const b = mi.aabb, c = b.center, h = b.halfExtents;
          const lo = [c.x - h.x, c.y - h.y, c.z - h.z], hi = [c.x + h.x, c.y + h.y, c.z + h.z];
          if (!min) { min = lo; max = hi; } else for (let i = 0; i < 3; i++) { min[i] = Math.min(min[i], lo[i]); max[i] = Math.max(max[i], hi[i]); }
        }
        if (!min) continue;
        const long = Math.max(max[0] - min[0], max[2] - min[2]) || 1;
        const s = (p.length || 5) / long;
        // (Rhys: the cars looked like toys) p.size [width, height,
        // length] stretches each way to real proportions; otherwise one scale
        const alongZ = (max[2] - min[2]) >= (max[0] - min[0]);
        let sx = s, sy = s, sz = s;
        if (p.size) {
          const [w, h, l] = p.size;
          const wide = alongZ ? max[0] - min[0] : max[2] - min[2], len = alongZ ? max[2] - min[2] : max[0] - min[0];
          const sw = w / (wide || 1), sl = l / (len || 1);
          sy = h / ((max[1] - min[1]) || 1);
          if (alongZ) { sx = sw; sz = sl; } else { sx = sl; sz = sw; }
        }
        e.setLocalScale(sx, sy, sz);
        // centred over its spot, sitting on the ground
        e.setLocalPosition(-(min[0] + max[0]) / 2 * sx, -min[1] * sy, -(min[2] + max[2]) / 2 * sz);
        holder.setPosition(p.pos[0], p.pos[1] || 0, p.pos[2]);
        holder.setEulerAngles(0, p.yaw || 0, 0);
      }
    });
    asset.once('error', () => { /* a missing model leaves the collision box as it is */ });
    app.assets.add(asset);
    app.assets.load(asset);
  }
}
