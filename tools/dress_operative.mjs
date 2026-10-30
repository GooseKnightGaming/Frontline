// Dresses the operative (writes the base model build_operative.mjs animates).
// Inputs: Superhero_Male_FullBody (head and neck kept) and the Male_Ranger
// Body/Legs/Arms/Feet_Boots parts from Modular_Character_Outfits_-_Fantasy
// (Quaternius, CC0), glTF (Godot-Unreal)/Modular Parts. Textures:
// T_Ranger_Tactical.png from tools/recolour_outfit.py; hands 512 px; head 512 px.
// Dresses the operative: the Universal Base male's head and neck, in the
// Quaternius Fantasy pack's Ranger body, legs, arms and boots (same rig, CC0),
// recoloured as field kit. Writes /tmp/ual/dressed.glb for build.mjs.
import fs from 'fs';
import { NodeIO } from '@gltf-transform/core';
import { mergeDocuments, prune, unpartition } from '@gltf-transform/functions';
const io = new NodeIO();
const doc = await io.read('/tmp/ual/stage/Superhero_Male_FullBody.gltf');
const root = doc.getRoot();
const skin = root.listSkins()[0];
const names = skin.listJoints().map((j) => j.getName());
const jointIndex = new Map(names.map((n, i) => [n, i]));
const scene = root.listScenes()[0];

// 1. keep only the head and neck of the base body (a triangle stays if any
//    corner follows the head or neck, so it tucks in under the collar)
const hero = root.listNodes().find((n) => n.getName() === 'SuperHero_Male');
const prim = hero.getMesh().listPrimitives()[0];
const J = prim.getAttribute('JOINTS_0'), W = prim.getAttribute('WEIGHTS_0'), I = prim.getIndices();
const dom = [];
for (let v = 0; v < J.getCount(); v++) {
  const j = J.getElement(v, []), w = W.getElement(v, []);
  let b = 0; for (let k = 1; k < 4; k++) if (w[k] > w[b]) b = k;
  dom.push(names[j[b]]);
}
const keepBone = new Set(['Head', 'neck_01']);
const idx = I.getArray(), keep = [];
for (let t = 0; t < idx.length; t += 3) {
  if ([idx[t], idx[t + 1], idx[t + 2]].some((v) => keepBone.has(dom[v]))) keep.push(idx[t], idx[t + 1], idx[t + 2]);
}
I.setArray(idx instanceof Uint16Array ? new Uint16Array(keep) : new Uint32Array(keep));
console.log('head triangles kept', keep.length / 3, 'of', idx.length / 3);

// 2. the outfit parts, re-pointed at our skeleton by bone name
const PARTS = ['Male_Ranger_Body', 'Male_Ranger_Legs', 'Male_Ranger_Arms', 'Male_Ranger_Feet_Boots'];
for (const part of PARTS) {
  const src = await io.read(`/tmp/fant/parts/${part}.gltf`);
  const skinned = src.getRoot().listNodes().filter((n) => n.getMesh() && n.getSkin());
  const map = mergeDocuments(doc, src);
  for (const n of skinned) {
    const remap = n.getSkin().listJoints().map((j) => jointIndex.get(j.getName()));
    if (remap.some((x) => x === undefined)) throw new Error(part + ': a bone our skeleton lacks');
    const m = map.get(n);
    for (const p of m.getMesh().listPrimitives()) {
      const ja = p.getAttribute('JOINTS_0');
      const arr = ja.getArray().slice();
      for (let i = 0; i < arr.length; i++) arr[i] = remap[arr[i]];
      ja.setArray(arr);
      for (const s of ['TEXCOORD_1', 'TEXCOORD_2', 'TEXCOORD_3', 'COLOR_0', 'COLOR_1']) if (p.getAttribute(s)) p.setAttribute(s, null);
    }
    m.setSkin(skin);
    const parent = m.getParentNodes ? null : null;
    for (const sc of doc.getRoot().listScenes()) if (sc !== scene) { /* removed below */ }
    // detach from the part's own hierarchy and hang it on our scene
    for (const other of doc.getRoot().listNodes()) if (other.listChildren().includes(m)) other.removeChild(m);
    scene.addChild(m);
    m.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]);
    console.log(part, '->', m.getMesh().listPrimitives().map((p) => p.getMaterial().getName() + ':' + p.getAttribute('POSITION').getCount()).join(' '));
  }
  // the part's own skeleton and scene go
  for (const sc of src.getRoot().listScenes()) {
    const msc = map.get(sc);
    const kill = (nd) => { for (const c of nd.listChildren()) kill(c); nd.dispose(); };
    for (const c of msc.listChildren()) kill(c);
    msc.dispose();
  }
}

// 3. materials: painted textures only, Battlefront-style - no normal maps
const tex = (file) => doc.createTexture(file).setImage(fs.readFileSync(file)).setMimeType('image/png');
const ranger = tex('/tmp/fant/T_Ranger_Tactical.png');
const hands = tex('/tmp/fant/T_Regular_Male_Skin.png');
const head = tex('/tmp/fant/T_Head_Skin.png');
for (const mat of root.listMaterials()) {
  mat.setNormalTexture(null).setMetallicRoughnessTexture(null).setOcclusionTexture(null).setMetallicFactor(0);
  const n = mat.getName();
  if (/Ranger/.test(n)) mat.setBaseColorTexture(ranger).setRoughnessFactor(0.85);
  else if (/Regular_Male/.test(n)) mat.setBaseColorTexture(hands).setRoughnessFactor(0.7);
  else if (/Superhero_Male/.test(n)) mat.setBaseColorTexture(head).setRoughnessFactor(0.7);
}
await doc.transform(prune(), unpartition());
await io.write('/tmp/ual/dressed.glb', doc);
console.log('materials', root.listMaterials().map((m) => m.getName()).join(', '), '| scenes', root.listScenes().length, '| nodes', root.listNodes().length);
