// Rebuilds assets/characters/Operative.glb (run from a folder with
// @gltf-transform/core and @gltf-transform/functions installed).
//
// Inputs, from Rhys's zips (Quaternius, CC0):
//   Universal_Base_Characters_Standard_.zip   Base Characters/Godot - UE/Superhero_Male_FullBody.gltf (+ .bin, textures)
//   Universal_Animation_Library_Standard_.zip Unreal-Godot/UAL1_Standard.glb
//   Universal_Animation_Library_2_Standard_.zip Unreal-Godot/UAL2_Standard.glb
// Staging (/tmp/ual/stage): the body .gltf/.bin plus its textures resized
// (body 1024, normals 512, eyebrows 256/128, eyes 128/64), with the painted
// uniform (tools/paint_uniform.py) saved over T_Superhero_Male_Dark.png. Two
// textures are referenced as *_png.png: copy T_Hair_1_Normal.png and
// T_Eye_Normal.png to those names.
//
// What it does: strips unused UV sets and vertex colours; drops the roughness
// map; copies the chosen clips, keeping bone rotations and the hips' movement
// (scaled to this body's hip height) but not the mannequin's bone lengths.
// Builds assets/characters/Operative.glb: the Universal Base male body with a
// painted uniform, textures sized for a Chromebook, and the clips Frontline uses
// Builds assets/characters/Operative.glb: the Universal Base male body with a
// painted uniform, textures sized for a Chromebook, and the clips Frontline uses
// from the Universal Animation Library 1 and 2 (Quaternius, CC0).
import { NodeIO } from '@gltf-transform/core';
import { prune, dedup, resample, simplifyPrimitive, compactPrimitive, weldPrimitive } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
const io = new NodeIO();
const doc = await io.read('/tmp/ual/dressed.glb');     // made by tools/dress_operative.mjs
const root = doc.getRoot();
const buffer = root.listBuffers()[0];
// only what is drawn: one UV set, no vertex colours
for (const m of root.listMeshes()) for (const p of m.listPrimitives()) for (const s of ['TEXCOORD_1', 'TEXCOORD_2', 'TEXCOORD_3', 'COLOR_0', 'COLOR_1']) if (p.getAttribute(s)) p.setAttribute(s, null);
// fabric, not skin: no roughness map, one figure
for (const mat of root.listMaterials()) if (mat.getName() === 'MI_Superhero_Male') { mat.setMetallicRoughnessTexture(null); mat.setRoughnessFactor(0.85); mat.setMetallicFactor(0); mat.setName('MI_Operative'); }
const byName = new Map(root.listNodes().map((n) => [n.getName(), n]));
const WANT = {
  '/tmp/ual/ual1/UAL1_Standard.glb': ['Idle_Loop', 'Walk_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop', 'Crouch_Idle_Loop', 'Crouch_Fwd_Loop',
    'Swim_Idle_Loop', 'Swim_Fwd_Loop', 'Jump_Start', 'Jump_Loop', 'Jump_Land', 'Roll', 'Death01', 'Hit_Chest',
    'Pistol_Idle_Loop', 'Pistol_Aim_Neutral', 'Pistol_Shoot', 'Pistol_Reload', 'Punch_Jab', 'Punch_Cross',
    'Sword_Attack', 'Sword_Idle', 'Interact', 'Driving_Loop', 'Idle_Talking_Loop'],
  '/tmp/ual/ual2/UAL2_Standard.glb': ['ClimbUp_1m', 'LayToIdle', 'OverhandThrow', 'Hit_Knockback', 'Idle_FoldArms_Loop',
    'Sword_Regular_A', 'Sword_Regular_B', 'Melee_Hook'],
};
const bodyPelvis = byName.get('pelvis').getTranslation();
for (const [file, clips] of Object.entries(WANT)) {
  const src = await io.read(file);
  const srcPelvis = src.getRoot().listNodes().find((n) => n.getName() === 'pelvis').getTranslation();
  const k = bodyPelvis[2] / srcPelvis[2];       // the hips' height (Blender z-up under the root)
  for (const name of clips) {
    const a = src.getRoot().listAnimations().find((x) => x.getName() === name);
    if (!a) { console.log('MISSING', name); continue; }
    const out = doc.createAnimation(name);
    const inputs = new Map();
    for (const ch of a.listChannels()) {
      const node = byName.get(ch.getTargetNode().getName());
      const path = ch.getTargetPath();
      if (!node || path === 'scale') continue;
      const bone = node.getName();
      // bone lengths stay the body's own; only the hips (and root) move
      if (path === 'translation' && bone !== 'pelvis' && bone !== 'root') continue;
      const s = ch.getSampler();
      let inp = inputs.get(s.getInput());
      if (!inp) {
        inp = doc.createAccessor().setType('SCALAR').setArray(s.getInput().getArray().slice()).setBuffer(buffer);
        inputs.set(s.getInput(), inp);
      }
      let arr = s.getOutput().getArray().slice();
      if (path === 'translation' && bone === 'pelvis') for (let i = 0; i < arr.length; i++) arr[i] *= k;
      const outp = doc.createAccessor().setType(s.getOutput().getType()).setArray(arr).setBuffer(buffer);
      const smp = doc.createAnimationSampler().setInput(inp).setOutput(outp).setInterpolation(s.getInterpolation());
      out.addSampler(smp);
      out.addChannel(doc.createAnimationChannel().setTargetNode(node).setTargetPath(path).setSampler(smp));
    }
  }
}
// ── Clips the library does not have, made from parts of ones it does ──────
// Each part takes some bones from one clip, stretched to a shared length, and
// can be damped (amp < 1: every key pulled towards that bone's average pose).
const ARM = /^(clavicle|upperarm|lowerarm|hand|index|middle|pinky|ring|thumb)_/;
const LEG = /^(thigh|calf|foot|ball)_/;
const ual1 = await io.read('/tmp/ual/ual1/UAL1_Standard.glb');
const ual2 = await io.read('/tmp/ual/ual2/UAL2_Standard.glb');
const clipOf = (name) => ual1.getRoot().listAnimations().find((x) => x.getName() === name) ||
  ual2.getRoot().listAnimations().find((x) => x.getName() === name);
const durOf = (a) => Math.max(...a.listSamplers().map((sm) => { const t = sm.getInput().getArray(); return t[t.length - 1]; }));
const srcPelvis1 = ual1.getRoot().listNodes().find((n) => n.getName() === 'pelvis').getTranslation();
const k1 = bodyPelvis[2] / srcPelvis1[2];
function meanQuat(arr) {
  const m = [0, 0, 0, 0];
  for (let i = 0; i < arr.length; i += 4) {
    const s = (arr[i] * arr[0] + arr[i + 1] * arr[1] + arr[i + 2] * arr[2] + arr[i + 3] * arr[3]) < 0 ? -1 : 1;
    for (let j = 0; j < 4; j++) m[j] += s * arr[i + j];
  }
  const l = Math.hypot(...m) || 1; return m.map((v) => v / l);
}
function composite(name, parts) {
  const D = durOf(clipOf(parts[0].clip));
  const out = doc.createAnimation(name);
  for (const part of parts) {
    const a = clipOf(part.clip), scale = D / durOf(a);
    for (const ch of a.listChannels()) {
      const bone = ch.getTargetNode().getName(), path = ch.getTargetPath();
      const node = byName.get(bone);
      if (!node || path === 'scale' || !part.bones(bone)) continue;
      if (path === 'translation' && bone !== 'pelvis' && bone !== 'root') continue;
      const smp0 = ch.getSampler();
      const times = Float32Array.from(smp0.getInput().getArray(), (t) => t * scale);
      let arr = smp0.getOutput().getArray().slice();
      const amp = typeof part.amp === 'function' ? part.amp(bone) : (part.amp === undefined ? 1 : part.amp);
      if (path === 'rotation' && amp < 1) {
        const m = meanQuat(arr);
        for (let i = 0; i < arr.length; i += 4) {
          const sgn = (arr[i] * m[0] + arr[i + 1] * m[1] + arr[i + 2] * m[2] + arr[i + 3] * m[3]) < 0 ? -1 : 1;
          const q = [0, 1, 2, 3].map((j) => m[j] + (sgn * arr[i + j] - m[j]) * amp);
          const l = Math.hypot(...q) || 1;
          for (let j = 0; j < 4; j++) arr[i + j] = q[j] / l;
        }
      }
      if (path === 'translation' && bone === 'pelvis') for (let i = 0; i < arr.length; i++) arr[i] *= k1;
      const inp = doc.createAccessor().setType('SCALAR').setArray(times).setBuffer(buffer);
      const outp = doc.createAccessor().setType(smp0.getOutput().getType()).setArray(arr).setBuffer(buffer);
      const smp = doc.createAnimationSampler().setInput(inp).setOutput(outp).setInterpolation(smp0.getInterpolation());
      out.addSampler(smp);
      out.addChannel(doc.createAnimationChannel().setTargetNode(node).setTargetPath(path).setSampler(smp));
    }
  }
}
// A ladder: upright, the front crawl's arms reach overhead and pull down to
// the hip - hand over hand - while the walk's legs step.
composite('Ladder_Loop', [
  { clip: 'Swim_Fwd_Loop', bones: (b) => ARM.test(b), amp: 0.85 },
  { clip: 'Walk_Loop', bones: (b) => !ARM.test(b), amp: (b) => (LEG.test(b) ? 0.8 : 0.5) },
]);
// A crawl on your front: the swimming body, with every stroke cut right down,
// so it creeps rather than swims.
composite('Crawl_Loop', [
  { clip: 'Swim_Fwd_Loop', bones: () => true, amp: (b) => (ARM.test(b) ? 0.3 : LEG.test(b) ? 0.35 : 1) },
]);

// Strikes from a crouch: the upper body from the strike, the hips and legs
// from the crouch, so a punch or a slash does not stand you up.
const UPPER = /^(spine_0[123]|neck_01|Head|clavicle|upperarm|lowerarm|hand|index|middle|pinky|ring|thumb)/;
for (const strike of ['Punch_Jab', 'Punch_Cross', 'Sword_Regular_A', 'Sword_Regular_B', 'Melee_Hook']) {
  composite('Crouch_' + strike, [
    { clip: strike, bones: (b) => UPPER.test(b) },
    { clip: 'Crouch_Idle_Loop', bones: (b) => !UPPER.test(b) },
  ]);
}

// Lighter to draw (Rhys: 10 fps, the graphics taking ~96 of every 100 ms):
// the boots' fine buckles simplified to about a fifth, and every vertex the
// model no longer uses dropped (the head kept all of the old body's).
await MeshoptSimplifier.ready;
for (const m of root.listMeshes()) for (const p of m.listPrimitives()) {
  if (/Boots/.test(m.getName())) {
    weldPrimitive(p);
    simplifyPrimitive(p, { simplifier: MeshoptSimplifier, ratio: 0.2, error: 0.02, lockBorder: false });
  }
  compactPrimitive(p);
}

await doc.transform(resample(), dedup(), prune());
await io.write('/tmp/fl/assets/characters/Operative.glb', doc);
console.log('clips', root.listAnimations().map((a) => a.getName()).join(' '));
