// FRONTLINE - the game in the browser: main.js starts it, builds the level you asked for, and runs it.
//
// Which level: index.html on its own is Yard 7; ?level=0 the training mission, 1 the Riverside Hotel,
// 2 the Derelict Factory, 3 the Casino, 4 the Night Train; ?level=<name> a first draft (levels/drafts/).
// ?test puts the game in the state the automated tests expect.
//
// Where things are:
//   src/sim/      the rules, with no drawing (tested in node): people/, world/, arms/, play/, vehicles/
//   src/game/     core/ (input, sound, voices, saves), draw/ (models, textures, the HUD's pictures),
//                 levels/ (each level, the level kit and its drafts, what runs a mission)
//
// boot() below, in order:
//   - the engine, the level, the light bake
//   - your body, props and vehicles
//   - your kit: what you carry and what it weighs
//   - what you know about who is about
//   - the training course
//   - doors and the Quartermaster's crates
//   - state
//   - HUD
//   - title screen and saved games
//   - credits
//   - loadout and classes before a mission; the class pick in battle
//   - the gear and trophy screens
//   - screens
//   - aiming and the camera
//   - the safe's dial, night vision
//   - keys, consoles, the lift's emergency stop
//   - the lift
//   - footsteps and the parachute
//   - every frame: the loop
//   - test hooks (used by the automated browser tests)
import { cameraGlitch, glitchSpot } from '../sim/world/safe.js';
import * as pc from 'playcanvas';
import { Player, P, forwardOf, followEye, shotOrigin, repackChute, chuteLabel, packGrip, CHUTE } from '../sim/people/player.js';
import { buildTraining } from './levels/yard7.js';
import { buildMission0 } from './levels/mission0.js';
import { buildHotel } from './levels/hotel.js';
import { buildFactory } from './levels/factory.js';
import { buildKitLevel } from './levels/kit.js';
import { DRAFTS } from './levels/drafts/index.js';
import { buildTrain } from './levels/train.js';
import { buildCasino } from './levels/casino.js';
import { setupMission } from './levels/mission_runtime.js';
import * as Trophies from './core/trophies.js';
import { buildScene, buildOperative } from './draw/render.js';
import { Operative, characterFill } from './draw/character.js';
import { placeProps } from './draw/props.js';
import { buildVehicle } from './draw/vehicle_models.js';
import { stateOf } from '../sim/people/anim.js';
import { SEAT } from '../sim/people/guard.js';
import { quickKey, Arsenal, WEAPONS } from '../sim/arms/weapons.js';
import { scopeKind } from './draw/weapons_view.js';
import { scopeSvg } from './draw/scope.js';
import { pulse as empPulse, EMP } from '../sim/arms/emp.js';
import { Loadout, ITEMS, FAMILIES, MODS, AMMO, SLOTS, SLOT_KEY, fits, modFits, loadEffect, itemWeight, CLASSES, classById, classAllows, ROUND_KG, statsOf, itemKind, withTags, cratePrompt } from '../sim/arms/loadout.js';
import * as Saves from './core/saves.js';
import { recordOutcome } from '../sim/play/story.js';
import { Course, movementSteps, weaponsSteps } from '../sim/play/course.js';
import * as Minimap from './draw/minimap.js';
import { drawPlan } from './draw/plan_map.js';
import { Tracker, sense, RADAR_RANGES, RADAR_NAMES, fade } from '../sim/people/contacts.js';
import { Audio } from './core/audio.js';
import { Music, pickTrack } from './core/music.js';
import { stepRanges } from './levels/ranges.js';
import { WeaponView, MODEL_BY_ID } from './draw/weapons_view.js';
import { CamSmoother } from './core/camsmooth.js';
import { FpsWatch, ResScaler } from '../sim/world/perf.js';
import { bakeWhen, BAKE_AFTER_FRAMES } from '../sim/world/bake.js';
import { holdLiftFor } from '../sim/people/hostage.js';
import { DoorMove } from '../sim/world/doors.js';
import { kickOpens } from '../sim/play/mission.js';
import { hqSecurity, takeIntrusion } from './levels/hq_security.js';
import { effects as skillEffects, SKILLS, pointsLeft, train as trainSkill, XP } from '../sim/play/skills.js';
import { CASE, CASE_NEEDS, FINAL, caseOpen, caseClosed, TRAILS, trailMark, trailDone, trailBegun } from '../sim/play/caseboard.js';
import { boardOf, describe as contractText, TERMS } from '../sim/play/contracts.js';
import { Input, ACTIONS, DEFAULT_BINDINGS, FORBIDDEN, loadSettings, saveSettings, keyLabel, isChromebook } from './core/input.js';
import { isTouchDevice, touchControls, retext } from './core/touch.js';

const VERSION = 'M6.105.0';
const $ = (id) => document.getElementById(id);
const TEST = /[?&]test\b/.test(location.search);
// Level 0, the training mission, is its own page load: index.html?level=0
const MISSION = /[?&]level=0\b/.test(location.search);
// Level 1, the Riverside Hotel (being built a floor at a time): index.html?level=1
const HOTEL = /[?&]level=1\b/.test(location.search);
// (Rhys: "let's build up some of the other maps") Level 2, the Derelict Factory
const FACTORY = /[?&]level=2\b/.test(location.search);
// (Rhys: "can we set about building the Casino next please") Level 3
const CASINO = /[?&]level=3\b/.test(location.search);
// (Rhys: the intercity train - "wrong place, wrong time") Level 4
const TRAIN = /[?&]level=4\b/.test(location.search);
// the first-draft levels, by name: index.html?level=sewers
const DRAFT_ID = (location.search.match(/[?&]level=([a-z][a-z0-9_]*)/i) || [])[1] || null;
const DRAFT = DRAFT_ID ? DRAFTS.find((d) => d.id === DRAFT_ID) || null : null;
const goDraft = (id) => { location.href = 'index.html?level=' + id + (TEST ? '&test' : ''); };
const ON_MISSION = MISSION || HOTEL || FACTORY || CASINO || TRAIN || !!DRAFT;
const goTrain = () => { location.href = 'index.html?level=4' + (TEST ? '&test' : ''); };
const goCasino = () => { location.href = 'index.html?level=3' + (TEST ? '&test' : ''); };
const goFactory = () => { location.href = 'index.html?level=2' + (TEST ? '&test' : ''); };
const goHotel = () => { location.href = 'index.html?level=1' + (TEST ? '&test' : ''); };
// back from a level: to Ghost HQ, under Yard 7 (index.html?at=hq puts you in its hall)
const AT_HQ = /[?&]at=hq\b/.test(location.search);
const goYard = () => { location.href = 'index.html?at=hq' + (TEST ? '&test' : ''); };
const goMission = () => { location.href = 'index.html?level=0' + (TEST ? '&test' : ''); };

function boot() {
  // ── the engine, the level, the light bake ───────────────────────────────────
  const canvas = $('app');
  const settings = loadSettings();
  if (settings.textSize === 'large') document.body.classList.add('bigtext');      // (M6.49)
  { const pm = document.getElementById('planmap'); if (pm) document.body.appendChild(pm); }    // (M6.49) the map over the game, under the touch buttons
  // (M6.35) a phone or tablet starts on low quality (until you choose otherwise): its graphics are a fraction of a
  // laptop's, and a smooth game matters more than a pretty one
  try { if (isTouchDevice() && !TEST && !/"quality"/.test(localStorage.getItem('frontline.settings.v1') || '')) settings.quality = 'low'; } catch (e) { /* private mode */ }
  const app = new pc.Application(canvas, {
    graphicsDeviceOptions: { antialias: true, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: TEST },
  });
  app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  app.setCanvasResolution(pc.RESOLUTION_AUTO);
  window.addEventListener('resize', () => app.resizeCanvas());

  const level = DRAFT ? buildKitLevel(DRAFT) : MISSION ? buildMission0() : HOTEL ? buildHotel() : FACTORY ? buildFactory() : CASINO ? buildCasino() : TRAIN ? buildTrain({ express: /[?&]express\b/.test(location.search) }) : buildTraining();
  const player = new Player(level.world);
  // ?live: live lighting instead of baked, to compare
  if (/[?&]live\b/.test(location.search)) level.bake = false;
  // ?bake: bake a level that is not baked by default (Yard 7), to try it
  if (/[?&]bake\b/.test(location.search)) level.bake = true;
  if (/[?&]bake=all\b/.test(location.search)) level.bakeBelow = undefined;
  // ?fill=shadow|soft|none, ?lmfilter=0: bake options, for comparing
  const fillQ = location.search.match(/[?&]fill=(shadow|soft|none)\b/);
  if (fillQ) level.bakeFill = fillQ[1];
  if (/[?&]lmfilter=0\b/.test(location.search)) level.bakeFilter = false;
  // ?cl=0: the engine's clustered lighting off - lights the older
  // way, bake included; a diagnostic for the Chromebook's dark baked lamps
  if (/[?&]cl=0\b/.test(location.search)) app.scene.clusteredLightingEnabled = false;
  const view = buildScene(pc, app, level, settings);
  // people lit up to a daylight level's ambient on dark levels (not black cut-outs across a big room)
  { const a = app.scene.ambientLight; characterFill(pc, [a.r, a.g, a.b]); }
  // The light bake: only once the engine has drawn a few frames.
  // Baked before the first frame (as it was until now), the engine's lighting
  // is not yet set up and the bake silently leaves lamps out - whole walls of
  // the sewer, and the hotel's rooms at night, came out dark. Baking again
  // before a frame did not help; baking after one did, every time.
  // ?bakemode=boot bakes the old way, to compare.
  const bakeMode = bakeWhen(location.search);
  let bakedLight = null;
  if (level.bake && bakeMode === 'boot') bakedLight = view.bakeLighting();
  if (level.bake && bakeMode === 'late') {
    let frames = 0;
    const once = () => { if (++frames < BAKE_AFTER_FRAMES) return; app.off('frameend', once); bakedLight = view.bakeLighting(); };
    app.on('frameend', once);
  }
  // ── your body, props and vehicles ───────────────────────────────────────────
  const body = buildOperative(pc, app);      // box stand-in, used until the model loads
  body.enabled = false;
  const opr = new Operative(pc, app, null);
  placeProps(pc, app, level.props);
  const vehicleEntities = (level.vehicles || []).map((v) => buildVehicle(pc, app, v));
  // the things you (or they) can drive: drawn where they are, each frame
  const drivables = level.drivables || [];
  const driveEnts = drivables.map((v) => buildVehicle(pc, app, { type: v.model || (v.kind === 'boat' ? 'speedboat' : 'lightUtility'), pos: v.pos, yaw: v.yaw * 180 / Math.PI, paint: v.paint || (v.kind === 'boat' ? 'white' : 'olive') }));
  const drawDrivables = () => drivables.forEach((v, i) => {
    const e = driveEnts[i]; e.setPosition(v.pos[0], v.pos[1], v.pos[2]);
    // (a boat noses up as it speeds, and leans into a turn)
    const pitchUp = v.kind === 'boat' ? Math.min(6, Math.abs(v.speed) * 0.35) : 0, roll = (v.kind === 'boat' ? 8 : 2) * v.steer * Math.min(1, Math.abs(v.speed) / 10);
    e.setEulerAngles(pitchUp, v.yaw * 180 / Math.PI, roll);
    v.spin = (v.spin || 0) + v.speed * 0.016 * 140;
    for (const w of e.wheels || []) w.setLocalEulerAngles(-v.spin, 0, 0);
  });
  // engines: yours while you drive; the nearest other one running, louder as it comes closer
  const engineSounds = () => {
    const live = S.playing && !S.menu;
    const me = player.driving;
    audio.engine('you', me ? Math.min(1, Math.abs(me.speed) / me.K.max + 0.08) : 0, live && me && !me.wrecked ? 0.16 : 0, me && me.kind === 'boat');
    let best = null, bd = 70;
    for (const v of drivables) {
      if (v === me || !v.driver || v.wrecked) continue;
      const d = Math.hypot(v.pos[0] - player.pos[0], v.pos[2] - player.pos[2]);
      if (d < bd) { bd = d; best = v; }
    }
    audio.engine('other', best ? Math.min(1, Math.abs(best.speed) / best.K.max + 0.08) : 0, live && best ? 0.14 * (1 - bd / 70) : 0, best && best.kind === 'boat');
  };
  // E beside one you could drive: in; E at the wheel: out (beside the driver's door, or wherever there is room)
  const vehicleNear = () => drivables.find((v) => !v.driver && !v.wrecked && Math.hypot(v.pos[0] - player.pos[0], v.pos[2] - player.pos[2]) < v.K.size[2] / 2 + 1.6 && Math.abs(v.pos[1] - player.pos[1]) < 2.2) || null;
  function vehicleUse() {
    if (player.driving) {
      const v = player.driving, dry = (q) => player.free(q, player.h) && !level.world.waterColumn(q[0], q[2]);
      const spot = v.exitSpot(dry) || v.exitSpot((q) => player.free(q, player.h));      // (out of a boat: onto the bank if it is alongside, else into the water)
      if (!spot) { audio.deny(); return true; }
      v.driver = null; v.solid.ghost = false; player.driving = null;
      player.pos = spot; player.vel = [0, 0, 0]; if (player.settle) player.settle();
      audio.unboard(); audio.engine('you', 0, 0); return true;
    }
    const v = vehicleNear();
    if (!v || player.mode !== 'walk' && player.mode !== 'swim') return false;
    v.driver = 'you'; v.solid.ghost = true; player.driving = v; player.stance = 0; player.crouching = false;
    input.yaw = v.yaw; audio.board(v.kind === 'boat'); return true;
  }
  opr.enabled = false;

  const cam = new pc.Entity('camera');
  cam.addComponent('camera', {
    clearColor: new pc.Color(0.55, 0.64, 0.72), fov: settings.fov, nearClip: 0.05, farClip: 800,
    toneMapping: pc.TONEMAP_ACES, gammaCorrection: pc.GAMMA_SRGB,
  });
  app.root.addChild(cam);

  const audio = new Audio(settings);
  const music = new Music(settings);
  const mapCanvas = $('map');
  const mapCtx = mapCanvas.getContext('2d');
  const input = new Input(canvas, settings);
  input.yaw = player.yaw;

  // ── your kit: what you carry and what it weighs ─────────────────────────────
  // Training kit: a sensible starting loadout. Everything else is in the
  // crates by the Logistics sign.
  // on the mission: a fixed kit for now (a loadout screen comes with Ghost HQ) -
  // breaching charges instead of frag
  // a level may bring its own kit (the casino: Rhys's choice), mods fitted
  const kit0 = Object.assign({}, level.startLoadout || { primary: 'K7', backup: 'PX9', utility1: ON_MISSION ? 'C5' : 'FRAG', utility2: 'FLASH', gear: level.startGear || 'LENSES' });
  // (Rhys: a mission that needs an item "grants you a 'Special' slot
  // specifically for that item (e.g. Parachute Pack) which doesn't interfere
  // with your loadout otherwise") - a level names it in `requires`; a kit that
  // put the parachute in the gear slot hands it over, and wears lenses instead
  let special = level.requires || null;
  // (M6.29) the gadget Q Branch signed out to this run: a Special on every mission
  const qGadget = ON_MISSION ? Saves.loadGadget(Saves.currentSlot()) : null;
  if (!special && kit0.gear && ITEMS[kit0.gear] && ITEMS[kit0.gear].chute) { special = kit0.gear; kit0.gear = 'LENSES'; }
  const loadout = new Loadout(Object.fromEntries(Object.entries(kit0).filter(([k]) => k !== 'mods')));
  loadout.special = special;
  if (qGadget && ITEMS[qGadget] && qGadget !== special) loadout.specials.push(qGadget);
  for (const [slot, mods] of Object.entries(kit0.mods || {})) for (const m of mods) loadout.fit(slot, m);
  // what you carry weighs on you
  // rounds, grenades and mods count - what is actually left of them - and the
  // gear and specials that change how you move: the Jump Pack, Cushioned Landing
  const applyLoad = () => {
    player.load = loadEffect(loadout.weight(arsenal));
    player.jetPack = !!loadout.gearTrait('jet');
    player.fallMul = loadout.gearTrait('fallMul');
    { const b = loadout.gearTrait('breathMul'); player.breathMul = b === undefined ? 1 : b; }
  };
  let missionRt = null;
  const arsenal = new Arsenal(level.world, { loadout });
  // (M6.29) the run's skills (sim/play/skills.js): their multipliers, on you and your weapons
  const applySkills = (n) => { const fx = skillEffects(Saves.loadSkills(n)); player.skills = fx; arsenal.skills = fx; };
  applySkills(Saves.currentSlot());
  applyLoad();
  const wview = new WeaponView(pc, app, cam, arsenal);
  wview.buildTargets(level.world, view.tex);
  // (M6.29) Ghost HQ's security: Yard 7's turrets as devices of its own (and an intrusion to lock out);
  // anywhere else, the old watching turrets
  const hqNote = (text, secs) => { S.noteText = text; S.noteT = secs || 3; };
  const hqSec = level.hq && !ON_MISSION ? hqSecurity({ pc, app, level, player, audio, note: hqNote }) : null;
  if (!hqSec) wview.buildSecurity(level.securityTurrets);
  let score = 0, hitMark = 0, blindFlash = 0;
  let openCrate = null, crateSlot = 'primary';
  let course = null;
  // ── what you know about who is about ────────────────────────────────────────
  // what you know about who is about: fed by your senses, shown on the radar
  const tracker = new Tracker();

  // ── the training course ──────────────────────────────────────────────────
  function syncDoors() {
    for (const tag of Object.keys(view.doorEntities || {})) {
      const shut = level.world.solids.some((s) => s.tag === tag && !s.disabled);
      view.showDoor(tag, !shut);
    }
  }
  function startCourse(part) {
    const steps = part === 'weapons' ? weaponsSteps(level)
      : movementSteps(level.marks, true).concat(weaponsSteps(level));
    course = new Course(level.world, steps);
    course.part = part || 'full';
    tracker.clear();
    // every door shut to begin with
    for (const s of level.world.solids) if (/^w?door\d/.test(s.tag || '')) s.disabled = false;
    for (const list of Object.values(level.groups || {})) for (const t of list) { t.down = false; t.hp = t.maxHp; }
    // put the course's crates back as they were (you may have emptied them)
    for (const c of level.crates || []) if (c.stock) c.items = c.stock.slice();
    player.reset();
    const st = level.sectionStarts[part === 'weapons' ? 'weapons' : 'movement'];
    player.pos = st.pos.slice(); player.vel = [0, 0, 0]; player.settle();
    input.yaw = st.yaw; input.pitch = 0;
    // ordinary doors start shut, like everything else on the course
    for (const d of level.swingDoors || []) { d.set(false, d.side); d.swing = 0; }
    // starting at the weapons half: the way out of the link room is already open
    if (part === 'weapons') for (const s of level.world.solids) if (s.tag === 'wdoor0') s.disabled = true;
    for (const sl of SLOTS) loadout.put(sl, null);
    arsenal.ammo = {}; arsenal.reset(loadout);
    showStep();
    syncDoors();
    S.menu = false;
  }
  function endCourse(toYard) {
    course = null;
    $('step').style.display = 'none';
    if (toYard) {
      player.reset(); input.yaw = 0; input.pitch = 0;
      setTimeout(syncDoors, 0);
      for (const s of level.world.solids) if (/^w?door\d/.test(s.tag || '')) s.disabled = true;
    }
  }
  function showStep() {
    const t = course && course.text;
    $('step').style.display = t ? 'block' : 'none';
    $('step').textContent = t || '';
    $('btn-skip-move').style.display = course && course.section === 'movement' ? 'block' : 'none';
    $('btn-skip-weap').style.display = course && course.section === 'weapons' ? 'block' : 'none';
  }
  $('btn-skip-move').onclick = () => {
    if (course) {
      course.skipSection('movement');
      // and take you to where the weapons half starts
      // the link room, where the weapons half begins (not the crawl tunnel's roof above it)
      const st = level.sectionStarts.weapons;
      player.reset(); player.pos = st.pos.slice(); player.vel = [0, 0, 0]; player.settle();
      input.yaw = st.yaw; input.pitch = 0;
      showStep(); syncDoors();
    }
    deploy();
  };
  $('btn-skip-weap').onclick = () => { if (course) { course.skipSection('weapons'); showStep(); if (course.done) endCourse(true); } deploy(); };
  $('btn-skip-all').onclick = () => { if (course) course.skipAll(); endCourse(true); deploy(); };

  // ── doors and the Quartermaster's crates ────────────────────────────
  // A shut door within reach, measured to its nearest part (a wide door's
  // panel is metres from its middle). Its panel works from either side.
  function doorNear() {
    let best = null, bestD = 1.6;
    for (const s of level.world.solids) {
      if (s.disabled || !/^w?door\d+$/.test(s.tag || '')) continue;
      if (player.pos[1] + 1 < s.min[1] - 0.5 || player.pos[1] > s.max[1]) continue;
      const nx = Math.max(s.min[0], Math.min(player.pos[0], s.max[0]));
      const nz = Math.max(s.min[2], Math.min(player.pos[2], s.max[2]));
      const d = Math.hypot(nx - player.pos[0], nz - player.pos[2]);
      if (d < bestD) { bestD = d; best = s.tag; }
    }
    return best;
  }
  // an ordinary door within reach
  // a lock the picks will open: an ordinary locked door - not a maglock, a vault, a blast door or a reinforced one
  const PICK_SECS = 4;
  const pickable = (d) => !!(d && d.locked && !d.open && !d.blown && !d.def.maglock && !d.def.vault && !d.def.blastDoor && d.def.build !== 'reinforced' && !d.def.lockedText);
  function swingDoorNear() {
    // The nearest door in reach - not the first in the list, which made the
    // second of a pair of doors almost impossible to pick. Crouched,
    // the one your crosshair is closest to wins; standing, the closest.
    let best = null, bestScore = Infinity;
    const look = player.lookDir();
    for (const d of level.swingDoors || []) {
      if (d.blown || !d.near(player.pos)) continue;          // a blown door is gone
      const c = d.centre, dx = c[0] - player.pos[0], dz = c[2] - player.pos[2];
      const dist = Math.hypot(dx, dz) || 1e-6;
      const score = player.stance === 1 ? 1 - (dx * look[0] + dz * look[2]) / (dist * (Math.hypot(look[0], look[2]) || 1)) : dist;
      if (score < bestScore) { bestScore = score; best = d; }
    }
    return best;
  }
  // Doors give to kicks and charges on every level, not only in a mission
  // (Rhys: the hotel's doors would not blow). Level 0 keeps its own
  // (hints, bullet time); this is the plain version.
  function kickDoor() {
    const d = swingDoorNear();
    if (!d || d.open || d.blown) return false;
    if (d.def.build === 'reinforced') {                   // say so, rather than kick in vain
      S.kickText = "Reinforced - a kick won't open it"; S.kickMsg = 2.5;
      return true;
    }
    S.kickText = 'It held';
    audio.bash();
    player.noise = Math.max(player.noise || 0, 0.8);
    if (kickOpens(d, Math.random() / ((player.skills && player.skills.breacher) || 1))) { d.breachWith(level.swingDoors, player.pos, 'kick'); audio.door(false); S.kickMsg = 0; }   // no stale 'It held' once it gives
    else { S.kickMsg = 1.2; audio.hitHard(1); }
    return true;
  }
  function blastDoors(ev) {
    if (!ev.breach) return;                           // only a breaching charge takes a door off
    for (const sf of level.safes || []) if (sf.safe && sf.safe.blast(ev.pos, sf.inside, true)) { if (S.cracking === sf) S.cracking = null; }
    for (const d of level.swingDoors || []) {
      if (d.blown) continue;
      const c = d.centre;
      if (Math.hypot(c[0] - ev.pos[0], c[1] - ev.pos[1], c[2] - ev.pos[2]) < 2.4) d.breachWith(level.swingDoors, ev.pos, 'blast');
    }
  }
  function crateNear() {
    let best = null, bestD = 2.6;
    for (const c of level.crates || []) {
      // on the same floor: 2.6 m sideways used to count from any storey above or below
      if (Math.abs((c.pos[1] || 0) - player.pos[1]) > 1.6) continue;
      const d = Math.hypot(c.pos[0] - player.pos[0], c.pos[2] - player.pos[2]);
      if (d < bestD) { bestD = d; best = c; }
    }
    return best;
  }
  // Everything the Quartermaster (and Logistics) can hand out: every weapon, piece of gear,
  // mod and kind of ammunition - except Rhys's sheet weapons this run has not yet brought
  // home (captured in the field, or earned from a mission: Saves.loadArmoury).
  const gunSize = (id) => {
    const it = ITEMS[id], f = it && FAMILIES[it.family];
    return f && (f.kind === 'gun' || f.kind === 'melee') ? (it.size || f.size) : null;
  };
  const QM_TABS = [
    // by the slot a weapon takes (a PDW or a laser pistol is a secondary; a big pistol may be a primary)
    ['primary', 'Primary', (id) => gunSize(id) === 'primary'],
    ['secondary', 'Secondary', (id) => gunSize(id) === 'backup'],
    ['utility', 'Utility', (id) => ITEMS[id] && ['grenade', 'charge', 'aid'].includes(ITEMS[id].family)],
    ['gear', 'Gear', (id) => ITEMS[id] && ITEMS[id].family === 'gear'],
    ['mods', 'Mods', (id) => !!MODS[id]],
    ['ammo', 'Ammunition', (id) => !!AMMO[id]],
  ];
  let qmTab = 'primary';
  function unlocked() {
    const home = new Set(Saves.loadArmoury(slotNo));
    return Object.keys(ITEMS).filter((id) => !ITEMS[id].sheet || home.has(id)).concat(Object.keys(MODS), Object.keys(AMMO));
  }
  function showCrate(c) {
    openCrate = c;
    if (c.infinite) { c.items = unlocked(); qmTab = 'primary'; }
    if (document.pointerLockElement) document.exitPointerLock();
    $('crate').style.display = 'flex';
    drawCrate();
  }
  function closeCrate() { openCrate = null; $('crate').style.display = 'none'; if (S.playing && !TEST) input.requestLock(); }
  function label(id) { return (ITEMS[id] || MODS[id] || AMMO[id] || { name: id }).name; }
  function detail(id) {
    if (AMMO[id]) return AMMO[id].rounds + ' rounds \u00b7 ' + AMMO[id].families.join(', ');
    const it = ITEMS[id];
    if (!it) { const m = MODS[id]; return m ? m.note : ''; }
    if (it.mag) return `${it.damage} dmg  ${it.mag} rounds  ${it.reload}s reload`;
    if (it.count) return `${it.count} carried` + (it.damage ? `  ${it.damage} dmg` : '') + (it.heals ? `  heals ${it.heals}` : '');
    if (it.range) return `${it.damage} dmg  ${it.range} m reach`;
    return it.note || '';
  }
  // your own slots: what is actually left in them, not what they hold when full
  function mineDetail(slot, id) {
    const r = arsenal.slotReadout && arsenal.slotReadout(slot);
    if (!r) return detail(id);
    const it = ITEMS[id];
    if (r.mag !== undefined) return `${it.damage} dmg  ${r.text}`;
    return r.text + (it && it.damage ? `  ${it.damage} dmg` : '') + (it && it.heals ? `  heals ${it.heals}` : '');
  }
  function drawCrate() {
    const c = openCrate;
    if (!c) return;
    $('crate-title').textContent = c.infinite && c.label ? c.label : 'CRATE';
    // your five slots
    const mine = $('crate-mine');
    mine.innerHTML = '';
    for (const slot of SLOTS) {
      const id = loadout.get(slot);
      const row = document.createElement('div');
      row.className = 'slot' + (slot === crateSlot ? ' on' : '');
      row.onclick = () => { crateSlot = slot; drawCrate(); };
      const slotName = { primary: 'PRIMARY', backup: 'SECONDARY', utility1: 'UTILITY 1', utility2: 'UTILITY 2', gear: 'GEAR' }[slot] || slot;
      row.innerHTML = `<span class="sn">${slotName}</span>` +
        `<span class="si">${id ? withTags(label(id), loadout.mods[slot]) : '<i>empty</i>'}</span>` +
        `<span class="sd">${id ? mineDetail(slot, id) : ''}</span>`;
      mine.appendChild(row);
      // fitted parts, each one clickable to take off again
      for (const m of loadout.mods[slot] || []) {
        const off = document.createElement('div');
        off.className = 'fitted';
        off.innerHTML = `<span>${label(m)}</span><b>remove</b>`;
        off.onclick = (e) => {
          e.stopPropagation();
          if (loadout.unfit(slot, m)) { c.items.push(m); arsenal.reset(loadout); drawCrate(); }
        };
        mine.appendChild(off);
      }
    }
    // what is in the crate
    const box = $('crate-items');
    box.innerHTML = '';
    // every slot can be emptied
    const none = document.createElement('button');
    none.className = 'item';
    none.innerHTML = '<b>\u2014 None \u2014</b><span>Carry nothing in this slot</span>';
    none.onclick = () => { const out = loadout.put(crateSlot, null); c.store(out); arsenal.reset(loadout, { keep: !c.infinite }); drawCrate(); };
    box.appendChild(none);
    const items = c.items.slice().sort();
    const nth = {};       // which copy of each item this row is
    for (const id of items) {
      const isMod = !!MODS[id], isAmmo = !!AMMO[id];
      if (c.infinite) {
        const tab = QM_TABS.find((t) => t[0] === qmTab);
        if (tab && !tab[2](id)) continue;      // another tab's stock
      }
      const ok = isAmmo ? arsenal.canTakeAmmo(id) : isMod ? modFits(id, loadout.get(crateSlot)) : fits(id, crateSlot);
      const b = document.createElement('button');
      b.className = 'item' + (ok ? '' : ' no');
      // (M6.17.10/11) a pouch you put down here is as full as you left it; a weapon keeps its mods
      const copy = c.copies ? (c.copies(id)[nth[id] = (nth[id] === undefined ? 0 : nth[id] + 1)] || {}) : {};
      const it = ITEMS[id], kept = copy.count !== undefined && it && copy.count < it.count ? copy.count : null;
      const said = kept === null ? detail(id) : (kept > 0 ? `${kept} of ${it.count} left` : 'none left') + (it.damage ? `  ${it.damage} dmg` : '');
      const name = copy.mods && copy.mods.length ? withTags(label(id), copy.mods) : label(id);
      b.innerHTML = `<b>${name}</b><span>${said}</span>`;
      b.onclick = () => {
        if (isAmmo) {
          const got = c.infinite ? arsenal.restockAll() : arsenal.takeAmmo(id);
          if (!got) return;
          if (!c.infinite) c.items.splice(c.items.indexOf(id), 1);
          drawCrate();
          return;
        }
        if (isMod) {
          if (!modFits(id, loadout.get(crateSlot))) return;
          const dropped = loadout.fit(crateSlot, id);
          if (!c.infinite) {
            c.items.splice(c.items.indexOf(id), 1);
            if (typeof dropped === 'string') c.items.push(dropped);
          }
        } else if (c.infinite) {
          // drawn from stock that never runs out: nothing goes back on the shelf
          if (!fits(id, crateSlot)) return;
          c.swap(loadout, crateSlot, id);
        } else {
          // (Rhys) the same thing again into its slot: a restock, not a
          // like-for-like swap (which handed you back your own empty box)
          const slotAmmo = arsenal.ammo[loadout.keyOf(crateSlot)];
          if (loadout.get(crateSlot) === id && slotAmmo && slotAmmo.count !== undefined) {
            // what was left in the box you take, full or part-used
            const n = c.takeCount(id);
            slotAmmo.count += n;
            arsenal.events.push({ type: 'ammo', id, rounds: n });
            c.items.splice(c.items.indexOf(id), 1);
            drawCrate();
            return;
          }
          if (arsenal.stow) arsenal.stow(loadout.keyOf(crateSlot));     // its loose rounds to your pouch
          // a box keeps its count, in the crate and out of it
          const isCount = ITEMS[id] && ITEMS[id].count !== undefined;
          const leftIn = slotAmmo && slotAmmo.count !== undefined ? slotAmmo.count : undefined, outId = loadout.get(crateSlot);
          const takes = isCount ? c.takeCount(id) : undefined;
          const r = c.swap(loadout, crateSlot, id);
          if (!r.ok) return;
          if (outId && leftIn !== undefined) c.leave(outId, leftIn);
          arsenal.reset(loadout, { keep: true });
          const na = arsenal.ammo[loadout.keyOf(crateSlot)];
          if (takes !== undefined && na && na.count !== undefined) na.count = takes;
          drawCrate();
          return;
        }
        arsenal.reset(loadout, { keep: !c.infinite });
        drawCrate();
      };
      box.appendChild(b);
    }
    if (c.infinite) {
      const bar = document.createElement('div');
      bar.className = 'qm-tabs';
      for (const [key, label, test] of QM_TABS) {
        const t = document.createElement('button');
        t.className = 'qm-tab' + (key === qmTab ? ' on' : '');
        t.textContent = label + ' (' + c.items.filter(test).length + ')';
        t.onclick = () => { qmTab = key; audio.click(); drawCrate(); };
        bar.appendChild(t);
      }
      box.insertBefore(bar, box.firstChild);
    }
    // (Rhys) leave the rounds you have gathered beyond a full issue - they weigh
    {
      const extra = arsenal.dumpSpare(true), n = Object.values(extra).reduce((a, b) => a + b, 0);
      if (n > 0) {
        const kg = Object.entries(extra).reduce((t, [k, r]) => t + (ROUND_KG[k] || 0) * r * (loadout.gearTrait('ammoKg') || 1), 0);
        const lv = document.createElement('button');
        lv.className = 'item';
        lv.innerHTML = '<b>Leave your spare rounds here</b><span>' + n + ' rounds beyond a full issue (' + kg.toFixed(1) + ' kg)</span>';
        lv.onclick = () => { const got = arsenal.dumpSpare(); if (!c.infinite) for (const k of Object.keys(got)) if (!c.items.includes(k)) c.items.push(k); audio.pickup(); drawCrate(); };
        box.insertBefore(lv, box.firstChild);
      }
    }
    // the Quartermaster also restocks everything you carry in one go
    if (c.infinite) {
      const rs = document.createElement('button');
      rs.className = 'item';
      rs.innerHTML = '<b>Restock everything</b><span>Full magazines, full reserves, full pouches - free</span>';
      rs.onclick = () => { arsenal.restockAll(); audio.pickup(); drawCrate(); };
      box.insertBefore(rs, box.firstChild);
    }
    $('crate-note').textContent = c.infinite
      ? 'Anything you have unlocked, free. Pick a slot, then what goes in it.'
      : c.kind === 'mods'
      ? 'Pick the slot, then the part. One optic, one barrel and one fill at a time.'
      : c.kind === 'ammo'
      ? 'Take what fits what you are carrying. Rounds go straight into your reserve.'
      : c.kind === 'gear'
      ? 'One piece of gear at a time. What you leave stays here.'
      : 'Click a slot, then something to put in it. What you swap out stays in the crate.';
  }
  $('crate-close').onclick = closeCrate;

  // ── state ────────────────────────────────────────────────────────────────
  const S = {
    playing: false, menu: false, third: settings.view === 'third', debug: settings.showFps,
    eye: P.eye, bob: 0, bobAmp: 0, dip: 0, prevPos: null, alpha: 1, fov: settings.fov, hurt: 0, time: 0,
    acc: 0, fps: 0, frames: 0, dragLook: false, pend: {},
  };

  // ── HUD ──────────────────────────────────────────────────────────────────
  $('ver').textContent = VERSION;
  $('map-wrap').style.display = settings.map ? 'block' : 'none';
  $('ver2').textContent = VERSION;

  // ── title screen and saved games ─────────────────────────────────────────
  let slotNo = Saves.currentSlot(), playtime = 0;
  // story: how each mission ended, kept per slot (Saves.loadStory)
  const gameState = () => ({ name: 'Operative', playtime, score, story: Saves.loadStory(slotNo), trophies: Trophies.raw(slotNo), armoury: Saves.loadArmoury(slotNo),
    loadout, found: Object.keys(arsenal.owned), place: player.pos.slice(), yaw: input.yaw,
    course: course && !course.done ? { part: course.part || 'full', at: course.at } : null });
  function applySave(s) {
    if (!s) return false;
    applySkills(slotNo);
    // a save (or a transfer code) brings its story with it
    if (s.story && !Saves.loadStory(slotNo)) Saves.saveStory(slotNo, s.story);
    if (s.trophies && !Trophies.earned(slotNo).length) Trophies.restore(slotNo, s.trophies);
    if (s.armoury && !Saves.loadArmoury(slotNo).length) Saves.saveArmoury(slotNo, s.armoury);
    for (const k of Object.keys(s.loadout.slots || {})) loadout.put(k, s.loadout.slots[k], (s.loadout.mods || {})[k]);
    arsenal.reset(loadout);
    score = s.score || 0; playtime = s.playtime || 0;
    if (s.course) {
      startCourse(s.course.part === 'weapons' ? 'weapons' : undefined);
      while (course && !course.done && course.at < s.course.at) course.advance();
      showStep(); syncDoors();
    } else if (course) { endCourse(false); }
    if (s.place) { player.pos = s.place.slice(); player.vel = [0, 0, 0]; player.settle(); }
    if (typeof s.yaw === 'number') input.yaw = s.yaw;
    return true;
  }
  function saveNow(n) {
    if (ON_MISSION) return;          // a mission is not saved part-way: it runs start to finish
    if (n !== undefined && n !== slotNo) {
      // saving this run into another slot: its story and trophies go with it
      const story = Saves.loadStory(slotNo), have = Trophies.raw(slotNo), arms = Saves.loadArmoury(slotNo);
      slotNo = n;
      Saves.clearSlot(n);
      if (story) Saves.saveStory(n, story);
      Trophies.restore(n, have);
      Saves.saveArmoury(n, arms);
    }
    Saves.setCurrentSlot(slotNo);
    Saves.saveSlot(slotNo, Saves.snapshot(gameState()));
  }
  function showTitle() {
    S.musicT = 9;
    if (course) { $('btn-skip-all').style.display = 'none'; }
    S.playing = false;
    S.wantLock = 0;
    show('title', true); show('start', false); show('menu', false); show('slots', false);
    S.menu = true;
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    $('t-continue').style.display = (S.startedOnce || Saves.listSlots().some(Boolean)) ? 'block' : 'none';
  }
  function drawSlots() {
    const list = $('slot-list');
    list.innerHTML = '';
    Saves.listSlots().forEach((s, i) => {
      const d = Saves.describe(s);
      const row = document.createElement('div');
      row.className = 'slot' + (i === slotNo ? ' on' : '');
      row.innerHTML = '<span class="st">' + (i + 1) + '. ' + d.title + '</span><span class="sm">' + d.detail + '</span>';
      const act = document.createElement('button');
      act.textContent = s ? 'Load' : 'Save here';
      act.onclick = () => {
        if (s) { slotNo = i; Saves.setCurrentSlot(i); applySave(s); deploy(); }
        else { saveNow(i); drawSlots(); $('slot-msg').textContent = 'Saved to slot ' + (i + 1) + '.'; }
      };
      const del = document.createElement('button');
      del.textContent = s ? 'Erase' : '\u2014';
      del.disabled = !s;
      del.onclick = () => { Saves.clearSlot(i); drawSlots(); };
      row.appendChild(act); row.appendChild(del);
      list.appendChild(row);
    });
    $('slot-code').value = '';
  }
  $('t-continue').onclick = () => {
    // back from the title mid-game: carry straight on, nothing to reload
    if (S.startedOnce) { deploy(); return; }
    const saved = Saves.listSlots(); const i = saved.findIndex(Boolean);
    if (i >= 0) { slotNo = i; Saves.setCurrentSlot(i); applySave(saved[i]); }
    deploy();
  };
  // a new game is a new run, in a slot of its own: the first empty one (or, with
  // all three in use, the saved games, to erase one first)
  $('t-new').onclick = () => {
    const free = Saves.freeSlot();
    if (free < 0) {
      show('title', false); show('slots', true); drawSlots();
      $('slot-msg').textContent = 'All three slots hold a game. Erase one to start a new game in it.';
      return;
    }
    slotNo = free; Saves.clearSlot(free); Saves.setCurrentSlot(free);
    startCourse(); deploy(); saveNow();
  };
  $('t-weapons').onclick = () => { startCourse('weapons'); deploy(); };
  $('t-fresh').onclick = () => {
    // empty slots, full ammunition, clean slate
    for (const s of SLOTS) loadout.put(s, null);
    arsenal.ammo = {};
    arsenal.reset(loadout);
    player.reset(); input.yaw = player.yaw; score = 0; playtime = 0; S.chute = { used: false, repack: 0 };
    deploy();
  };
  $('t-load').onclick = () => { show('title', false); show('slots', true); drawSlots(); };
  $('t-settings').onclick = () => { show('title', false); openMenu(); tab('settings'); };
  $('t-howto').onclick = () => window.open('controls.html?v=' + VERSION, '_blank');
  $('t-arms').onclick = () => window.open('weapons.html?v=' + VERSION, '_blank');
  $('t-kofi').onclick = () => window.open('https://ko-fi.com/gooseknight', '_blank');
  document.querySelectorAll('.btn-title').forEach((b) => { b.onclick = () => { show('slots', false); showTitle(); }; });
  $('slot-copy').onclick = () => {
    $('slot-code').value = Saves.exportCode(Saves.snapshot(gameState()));
    $('slot-code').select();
    try { document.execCommand('copy'); $('slot-msg').textContent = 'Code copied. Paste it into Frontline on the other device.'; }
    catch (e) { $('slot-msg').textContent = 'Select the code above and copy it.'; }
  };
  $('slot-paste').onclick = () => {
    const r = Saves.importCode($('slot-code').value);
    if (!r.ok) { $('slot-msg').textContent = r.why; return; }
    Saves.clearSlot(slotNo);                 // the run that was in this slot gives way to the code's
    Saves.saveStory(slotNo, r.data.story || null);
    Trophies.restore(slotNo, r.data.trophies || {});
    Saves.saveArmoury(slotNo, r.data.armoury || []);
    Saves.saveSlot(slotNo, r.data);
    applySave(r.data);
    drawSlots();
    $('slot-msg').textContent = 'Loaded into slot ' + (slotNo + 1) + '.';
  };
  $('btn-save').onclick = () => { saveNow(); show('menu', false); show('slots', true); drawSlots(); $('slot-msg').textContent = 'Saved to slot ' + (slotNo + 1) + '.'; };
  $('btn-title').onclick = () => { if (ON_MISSION) { goYard(); return; } saveNow(); showTitle(); };
  $('t-mission').onclick = () => { saveNow(); goMission(); };
  if ($('t-hotel')) $('t-hotel').onclick = () => { saveNow(); goHotel(); };
  if ($('t-factory')) $('t-factory').onclick = () => { saveNow(); goFactory(); };
  if ($('t-casino')) $('t-casino').onclick = () => { saveNow(); goCasino(); };
  if ($('t-train')) $('t-train').onclick = () => { saveNow(); goTrain(); };
  // the first drafts: a list of their own
  if ($('t-drafts')) {
    const list = $('drafts-list');
    // (M6.31) the last of them, Kaldberg, only once the case is made (the board at Ghost HQ)
    const drawDrafts = () => {
      const open = caseOpen(Saves.loadCase(slotNo)) || TEST;
      // (M6.48) how each has gone so far: a tick for a success, a half for less
      const done = Saves.loadDone(slotNo), clues = Saves.loadCase(slotNo).filter((id) => CASE.some((c) => c.id === id)).length;
      const grades = Saves.loadGrades(slotNo);
      const mark = (id) => (done[id] === 'success' ? '  \u2713' : done[id] === 'partial' ? '  \u00bd' : '') + (grades[id] ? '  ' + grades[id] : '');      // (M6.90) and its best grade
      // (M6.56) in their stories: a heading where each begins
      const GROUPS = [[5, 'FIRST DRAFTS'], [35, 'THE CASE'], [43, 'THE BLIGHT'], [48, 'THE CODEX'], [51, 'THE RIVER'], [54, 'THE FORGERS'], [57, 'THE HANDLER'], [61, 'THE FIVE'], [65, 'THE NORTH'], [68, 'THE CAMPS'], [71, 'MORE WORK'], [72, 'THE COAST'], [76, 'HOLLIS'], [79, 'THE COLONEL'], [82, 'MORE WORK']];
      // (M6.80) a story's heading carries its trail's stamp once the trail is done
      const haveCase = Saves.loadCase(slotNo), stampOf = (title) => { if (title === 'THE CASE' && caseClosed(haveCase)) return ' <span style="color:#c0392b;border:2px solid #c0392b;padding:0 5px;margin-left:6px;letter-spacing:2px">CASE CLOSED</span>'; const t = TRAILS.find((q) => q.title === title); return t && trailDone(t, haveCase) ? ' <span style="color:' + t.colour + ';border:2px solid ' + t.colour + ';padding:0 5px;margin-left:6px;letter-spacing:2px">' + t.stamp + '</span>' : ''; };
      const head = (no) => { const g = GROUPS.find((q) => q[0] === no); return g ? '<div style="grid-column:1/-1;margin:12px 0 2px;letter-spacing:3px;color:var(--amber);font-size:12px;text-align:left">' + g[1] + stampOf(g[1]) + '</div>' : ''; };
      list.innerHTML = DRAFTS.map((d) => head(d.no) + (d.id === FINAL && !open ? '<button class="btn" disabled>Level ' + d.no + ': ? ? ?  (the case is not made yet - ' + clues + ' of ' + CASE_NEEDS + ' clues)</button>'
        : '<button class="btn" data-id="' + d.id + '">Level ' + d.no + ': ' + d.title + mark(d.id) + '</button>')).join('');
      list.querySelectorAll('button[data-id]').forEach((b) => { b.onclick = () => { saveNow(); goDraft(b.dataset.id); }; });
    };
    drawDrafts();
    $('t-drafts').onclick = () => { drawDrafts(); show('assign', false); show('drafts', true); };
    $('drafts-back').onclick = () => { show('drafts', false); show('assign', true); };
  }
  // ── Ghost HQ: the assignments at the operations table, and how you go ─────
  // (the level buttons live here, not on the title screen: you choose your next
  // assignment in the HQ). The van or the helicopter is remembered for now; the
  // levels will start you out of it.
  const RIDE_KEY = 'frontline.ride';
  const ride = () => { try { return localStorage.getItem(RIDE_KEY) === 'heli' ? 'heli' : 'van'; } catch (e) { return 'van'; } };
  const drawRide = () => { $('ride-van').classList.toggle('on', ride() === 'van'); $('ride-heli').classList.toggle('on', ride() === 'heli'); };
  for (const r of ['van', 'heli']) $('ride-' + r).onclick = () => { try { localStorage.setItem(RIDE_KEY, r); } catch (e) { /* private window */ } drawRide(); };
  function openAssignments() {
    S.menu = true;
    if (document.pointerLockElement) document.exitPointerLock();
    drawRide();
    show('assign', true);
  }
  $('assign-back').onclick = () => { show('assign', false); deploy(); };
  // (M6.29) Q Branch: his gadgets, one signed out to this run at a time
  const Q_GADGETS = ['HACKKIT', 'QRELAY', 'QSPOOF', 'QSCRAMBLE', 'QSKELETON', 'QSNAKE', 'QGRAPPLE', 'QID', 'CAMO'];
  function drawQ() {
    const have = Saves.loadGadget(slotNo), list = $('q-list');
    list.innerHTML = '';
    for (const id of [null].concat(Q_GADGETS)) {
      const b = document.createElement('button');
      b.className = 'btn' + ((have || null) === id ? ' on' : '');
      b.innerHTML = id ? ITEMS[id].name + (ITEMS[id].q ? ' <i>(new)</i>' : '') + '<span>' + (ITEMS[id].note || '') + '</span>' : 'Nothing<span>Go with what the mission and your class give you.</span>';
      b.onclick = () => { Saves.saveGadget(slotNo, id); audio.confirm(); drawQ(); };
      list.appendChild(b);
    }
  }
  // (M6.31) the case board: what the missions have turned up, and what is still to find
  function openCase() {
    S.menu = true;
    if (document.pointerLockElement) document.exitPointerLock();
    const have = Saves.loadCase(slotNo), lvl = (id) => (DRAFTS.find((d) => d.id === id) || {});
    $('case-list').innerHTML = CASE.map((c) => have.includes(c.id)
      ? '<div class="rec-row" style="display:block"><b>' + c.title + '</b> <span style="opacity:0.7">(Level ' + lvl(c.level).no + ', ' + lvl(c.level).title + ')</span><br>' + c.text + '</div>'
      : '<div class="rec-row" style="display:block;opacity:0.45">? ? ?  <span>(something at Level ' + lvl(c.level).no + ', ' + lvl(c.level).title + ')</span></div>').join('')
      + (caseClosed(have) ? '<div style="margin:14px auto 4px;width:max-content;padding:6px 18px;border:4px double #c0392b;color:#c0392b;font:700 26px/1 \'Courier New\',monospace;letter-spacing:6px;transform:rotate(-6deg)">CASE CLOSED</div><p style="text-align:center;opacity:0.8">The council at Kaldberg is finished. Ghost thanks you.</p>' : '')
      + '<p style="margin-top:10px">' + (caseClosed(have) ? '' : caseOpen(have) ? '<b>The case is made: the council meets at Kaldberg. Level 42 is on the operations table.</b>' : 'Find ' + (CASE_NEEDS - have.length) + ' more, and Ghost will know where the council meets.') + '</p>';
    // (M6.45) the second case: the blight's trail, once it is begun
    for (const tr of TRAILS) {
      if (!trailBegun(tr, have)) continue;
      $('case-list').innerHTML += '<h3 style="margin:18px 0 6px;letter-spacing:3px;color:var(--amber);font-size:13px">' + tr.title + '</h3>'
        + tr.steps.map((b) => have.includes(trailMark(tr, b.level))
          ? '<div class="rec-row" style="display:block"><b>' + b.title + '</b> <span style="opacity:0.7">(Level ' + lvl(b.level).no + ')</span><br>' + b.text + '</div>'
          : '<div class="rec-row" style="display:block;opacity:0.45">? ? ?  <span>(Level ' + lvl(b.level).no + ', ' + lvl(b.level).title + ')</span></div>').join('')
        + (trailDone(tr, have) ? '<div style="margin:12px auto 4px;width:max-content;padding:5px 16px;border:4px double ' + tr.colour + ';color:' + tr.colour + ';font:700 22px/1 \'Courier New\',monospace;letter-spacing:5px;transform:rotate(-4deg)">' + tr.stamp + '</div>' : '');
    }
    // (M6.100) the grades: how many missions at each, best first
    const gr = Saves.loadGrades(slotNo), gcount = { S: 0, A: 0, B: 0, C: 0 };
    for (const k of Object.keys(gr)) if (gcount[gr[k]] !== undefined) gcount[gr[k]]++;
    if (Object.keys(gr).length) $('case-list').innerHTML += '<h3 style="margin:18px 0 6px;letter-spacing:3px;color:var(--amber);font-size:13px">GRADES</h3><p style="margin:0 0 6px">' + ['S', 'A', 'B', 'C'].map((g) => '<b style="font-size:18px">' + g + '</b> &times; ' + gcount[g]).join(' &nbsp; ') + ' <span style="opacity:0.7">(of ' + DRAFTS.filter((d) => !d.battle).length + ' missions)</span></p>';
    // (M6.82) the story so far: how each mission done ended (its epilogue, as the debrief told it), in order
    const doneMap = Saves.loadDone(slotNo), told = DRAFTS.filter((d) => d.epilogue && (doneMap[d.id] === 'success' || doneMap[d.id] === 'partial'));
    if (told.length) {
      $('case-list').innerHTML += '<h3 style="margin:18px 0 6px;letter-spacing:3px;color:var(--amber);font-size:13px">THE STORY SO FAR</h3>'
        + '<details class="rec-row" style="display:block"><summary><b>' + told.length + (told.length === 1 ? ' mission' : ' missions') + '</b> <span style="opacity:0.7">(open to read)</span></summary>'
        + told.map((d) => '<div style="margin:8px 0 0 10px"><b>Level ' + d.no + ', ' + d.title + '</b>' + (doneMap[d.id] === 'partial' ? ' <span style="opacity:0.6">(in part)</span>' : '') + '<br><span style="opacity:0.85">' + (d.epilogue[doneMap[d.id]] || d.epilogue.success) + '</span></div>').join('') + '</details>';
    }
    // (M6.83) every trail stamped (and the case closed): Varnholm's file, closed
    if (caseClosed(have) && TRAILS.every((tr) => trailDone(tr, have))) $('case-list').innerHTML += '<div style="margin:18px auto 6px;width:max-content;padding:6px 18px;border:4px double var(--amber);color:var(--amber);font:700 20px/1 \'Courier New\',monospace;letter-spacing:5px;transform:rotate(-3deg)">VARNHOLM: FILE CLOSED</div><p style="text-align:center;opacity:0.85">The case and every story on the board, every one of them done. Ghost thanks you, and has nothing left in Varnholm to ask of you. Yet.</p>';
    // (M6.71) the papers read, filed: each mission's, opened to read again
    const papers = Saves.loadPapers(slotNo), filed = DRAFTS.filter((d) => d.intel && d.intel.length && (papers[d.id] || []).length);
    if (filed.length) {
      const total = DRAFTS.reduce((t, d) => t + (d.intel || []).length, 0), got = filed.reduce((t, d) => t + d.intel.filter((q) => papers[d.id].includes(q.id)).length, 0);
      $('case-list').innerHTML += '<h3 style="margin:18px 0 6px;letter-spacing:3px;color:var(--amber);font-size:13px">PAPERS (' + got + ' OF ' + total + ')</h3>'
        + filed.map((d) => '<details class="rec-row" style="display:block"><summary><b>Level ' + d.no + ', ' + d.title + '</b> <span style="opacity:0.7">(' + d.intel.filter((q) => papers[d.id].includes(q.id)).length + ' of ' + d.intel.length + ')</span></summary>'
          + d.intel.filter((q) => papers[d.id].includes(q.id)).map((q) => '<div style="margin:6px 0 0 10px"><b>' + q.title + '</b><br>' + q.text.map((t) => '<span style="opacity:0.85">' + t + '</span>').join('<br>') + '</div>').join('') + '</details>').join('');
    }
    // (M6.41) and the contracts: replay work, three at a time
    const levels = DRAFTS.filter((d) => !d.battle && d.id !== FINAL && d.objectives && d.objectives.length).map((d) => d.id);
    const b = boardOf(Saves.loadContracts(slotNo), levels);
    b.state.levels = levels; Saves.saveContracts(slotNo, b.state);
    $('case-list').innerHTML += '<h3 style="margin:18px 0 6px;letter-spacing:3px;color:var(--amber);font-size:13px">CONTRACTS</h3>'
      + '<p style="opacity:0.75;margin:0 0 8px">Replay work. Do one - the mission a success, and done the way it asks - and it pays experience; another takes its place.</p>'
      + b.contracts.map((c) => '<div class="rec-row" style="display:block"><b>' + TERMS[c.term].name + '</b> &middot; Level ' + lvl(c.level).no + ', ' + lvl(c.level).title + '<br>' + contractText(c) + ' <span style="color:var(--amber)">(+' + c.xp + ' experience)</span></div>').join('');
    show('casebd', true);
  }
  $('case-back').onclick = () => { show('casebd', false); deploy(); };
  function openQ() {
    S.menu = true;
    if (document.pointerLockElement) document.exitPointerLock();
    drawQ();
    show('qbranch', true);
  }
  $('q-back').onclick = () => { show('qbranch', false); deploy(); };
  // ── credits ─────────────────────────────────────────────────────────────────
  // the credits: everyone whose work is in the game (a licence condition, and fair)
  $('t-credits').onclick = () => { show('title', false); show('credits', true); };
  $('credits-back').onclick = () => { show('credits', false); show('title', true); };
  if (HOTEL) {
    // a briefing, never a pause menu, to start (no level opens paused)
    document.querySelector('#briefing .brief-card').innerHTML = `
      <h2>LEVEL 1 &middot; RIVERSIDE HOTEL</h2>
      <p class="brief-where">A riverside hotel, taken by the reds. Being built, a floor at a time.</p>
      <p><b>So far</b> &mdash; every floor: the basement (the bar's cellar), the foyer, the restaurant and bar, the kitchen, the CCTV room (its console shows the cameras), the guest rooms, the Estate Room, the Balcony Suite and the Upper Balcony Suite above it, the roof; the lift, the garden, the streets round about - and the sewer under them.</p>
      <p><b>Ways in</b> &mdash; the front doors; the kitchen door at the side; or the open manhole in the road beside the Ghost jeep: the sewer runs under the hotel to a locked door into its cellar, and the cellar stairs come up behind the bar.</p>
      <p><b>Locked doors</b> &mdash; the Balcony Suite (Room 207, second floor) is locked, and its doors are reinforced. The manager keeps its key in the safe in the Estate Room on the first floor. Nobody knows the combination - though the staff say the cameras have been playing up ever since the manager had them put in. A careful ear at the dial may not need it, and a breaching charge will take the safe's door off. Other locked doors give to a kick.</p>
      <p><b>The reds</b> &mdash; nineteen of them, every floor to the roof. With the power cut, the officers and specialists wear night vision; the rest carry torches - you will see those coming, and they see only where their beams fall. Bold ones come running to trouble; steady ones hold their posts; a coward runs the first time he is hurt.</p>
      <p><b>Objectives</b> &mdash; bring the three hostages out to the police cars alive, and <b>stop the captain</b>: if he is alarmed he runs for the helicopter over the roof, and at 23:30 he goes anyway. Once he runs, the helicopter waits two minutes for him and no longer. Dead or knocked out, he is stopped; once his helicopter lifts with him in it, he has escaped. Then back to the Ghost jeep.</p>
      <p><b>How it ends</b> &mdash; at the Ghost jeep, however it went. A hostage lost or the captain escaped does not end the mission: it changes what comes after, and Ghost will remember. Once nothing more can be done, reaching the jeep ends it; before then, hold E at the jeep to withdraw. Only your own death fails it outright.</p>
      <p><b>Intel</b> &mdash; papers left about the rooms say more about who is here and why. None of it is needed; all of it may matter later.</p>
      <button class="btn primary" id="b-begin">Begin</button>
      <button class="btn" id="b-yard">Back to Ghost HQ</button>`;
  }
  if (FACTORY) {
    document.querySelector('#briefing .brief-card').innerHTML = `
      <h2>LEVEL 2 &middot; DERELICT FACTORY</h2>
      <p class="brief-where">A derelict factory, midday. The yellows have been bunkered down in here for a while.</p>
      <p><b>The building</b> &mdash; two floors, ninety metres across, the same from every side: rooms in the corners, a ring of corridors round the middle, and in the middle a core behind reinforced doors. The floors are joined only by ladders - eight of them, each through a hatch in the floor above.</p>
      <p><b>The yellows</b> &mdash; eleven. Two in each of their corners (the north-east and the south-west), on both floors; two walking the ring of corridors on each floor; three in the core, one of them up top with a rifle. Bold ones come running; steady ones hold their ground.</p>
      <p><b>Doors</b> &mdash; most give with E; locked ones give to a kick. The core's are reinforced: a breaching charge opens them.</p>
      <p><b>Objective</b> &mdash; flush the yellows out: every one of them killed or knocked out. Then back to your way in, the north-west corner, where you start.</p>
      <p><b>How it ends</b> &mdash; at your way in, however it went: once the last yellow is down, reaching it ends the mission; before then, hold E there to withdraw. Only your own death fails it outright.</p>
      <p class="brief-note">Drawn by Rhys as a battle map - two sides, reserves and a ten-minute timer. That mode is still to come; for now, it is a mission.</p>
      <button class="btn primary" id="b-begin">Begin</button>
      <button class="btn" id="b-yard">Back to Ghost HQ</button>`;
  }
  if (TRAIN) {
    document.querySelector('#briefing .brief-card').innerHTML = `
      <h2>LEVEL 4 &middot; THE NIGHT TRAIN</h2>
      <p class="brief-where">Novomir Central, Severia. 21:36, a cold November night. You are off duty.</p>
      <p><b>Where</b> &mdash; Severia's capital, Novomir; its great terminus, Novomir Central. Your ticket is for the 21:40 intercity to Belyagorsk - service 207, overnight, east across the country, under the city first and later under the hills.</p>
      <p><b>Your kit</b> &mdash; none. You are travelling as anyone travels: no weapon, no gear.</p>
      <p><b>What to do</b> &mdash; find your platform on the departures board (the signs are in Severian - Cyrillic - with English beneath), show your ticket at the gate, and board. Coach 3 is yours. The train leaves at 21:40 by the station clock, with you or without you; aboard early, take your seat and wait.</p>
      <p class="brief-note">Also aboard tonight, in first class: the Minister for Belyagorsk Province, Tamash Dravets. Belyagorsk - Alyejka Azvestya is about eighteen minutes from 21:40.</p>
      <button class="btn primary" id="b-begin">Begin</button>
      <button class="btn" id="b-yard">Back to Ghost HQ</button>`;
  }
  if (CASINO) {
    document.querySelector('#briefing .brief-card').innerHTML = `
      <h2>LEVEL 3 &middot; CASINO</h2>
      <p class="brief-where">A round casino, sixty metres across, near midnight. The reds have taken it.</p>
      <p><b>The building</b> &mdash; round, and built round: the ground floor's gaming floor (poker, roulette, blackjack, baccarat, craps, the central bar, the cage) in its ring of rooms; the first floor's bar and restaurant; the second floor's private room behind reinforced doors and its viewing galleries, in a hall two floors high with a cross of glass walkways - the mezzanine - over it, reached by spiral stairs; the third and fourth floors; and the roof terrace with its pool.</p>
      <p><b>The ramp</b> &mdash; round the outside, between the outer wall and the next, one smooth ramp coils up the whole building, clockwise, a turn a floor. The main doors, south, open onto its level start; it climbs from there, meeting each floor on its way up. A staff door on the north side lets you into the passage under its first climb.</p>
      <p><b>Your kit</b> &mdash; no rifle tonight: a silenced V-27C (three-round bursts: deadly close, poor at range), two lure devices (place them, then set them off from wherever you are: a noise the reds will go and look at), two smoke grenades, and a parachute pack. A maintenance gantry runs out from the roof terrace over the plaza: jump, then SPACE to open the parachute, and steer down to the jeep. Once used it is unpacked: on the ground, keep still and hold E to repack it - it takes a while.</p>
      <p><b>The reds</b> &mdash; fifteen, on every floor and on the roof.</p>
      <p><b>Objectives</b> &mdash; find the reds' <b>ledger</b> in the Cash Vault, on the second floor, behind the Tournament Room's reinforced doors and the vault's own. Optionally, <b>team up with the Yellows</b> in the Businessman's Suite on the ground floor, and help them find their boss's locket in the vault - or keep it. Then back to the jeep, by the main doors, where you start. Hold E there to withdraw before. Clearing every red out is a trophy, not the job.</p>
      <p><b>Doors</b> &mdash; reinforced doors take a breaching charge (C5) or a breaching shotgun. The security post on the ramp has a terminal: hack it to open the vault's own doors.</p>
      <p class="brief-note">Built from Rhys's preliminary map: its layout, so it can be walked and marked up. The story and the guards are placeholders until the map's Info and Guards tabs are filled in.</p>
      <button class="btn primary" id="b-begin">Begin</button>
      <button class="btn" id="b-yard">Back to Ghost HQ</button>`;
  }
  if (DRAFT) {
    document.querySelector('#briefing .brief-card').innerHTML = '<h2>LEVEL ' + DRAFT.no + ' &middot; ' + DRAFT.title.toUpperCase() + '</h2>' +
      '<p class="brief-where">' + DRAFT.where + '</p>' + DRAFT.brief.map(([k, v]) => '<p><b>' + k + '</b> &mdash; ' + v + '</p>').join('') +
      '<p class="brief-note">A first draft, to play and mark up: the place, who is in it and what to do may all change with Rhys\'s notes.</p>' +
      '<button class="btn primary" id="b-begin">Begin</button><button class="btn" id="b-yard">Back to Ghost HQ</button>';
  }
  // ── loadout and classes before a mission; the class pick in battle ──────────
  // (Rhys: "choose your loadout from your available weapons before
  // hitting 'Begin'") - on any mission you go into on duty; a kit you were
  // given and that you change keeps its mods only where the item is unchanged
  const PICK = ON_MISSION && !TRAIN && !level.offDuty && !level.fixedKit;
  // the class you go in as - kept for a battle, where you choose again each time you fall
  S.cls = null;
  const applyClass = (cls, kit) => {
    S.cls = cls;
    const base = cls ? cls.kit : kit0;
    if (kit !== false) for (const sl of SLOTS) loadout.put(sl, base[sl] || null, (base.mods || {})[sl] || []);
    loadout.specials = [special, cls && cls.special, qGadget && ITEMS[qGadget] ? qGadget : null].filter((id, i, a) => id && a.indexOf(id) === i);
  };
  if (PICK) {
    const names = { primary: 'Primary', backup: 'Secondary', utility1: 'Utility 1', utility2: 'Utility 2', gear: 'Gear' };
    const box = document.createElement('div');
    box.className = 'kit-pick';
    // (Rhys: the list was "a bit TOO much") a class, and what it may carry; or the kit the
    // mission issues, as it is
    const opts = (slot) => {
      const allow = classAllows(S.cls, slot);
      const ids = allow ? allow.filter((id) => ITEMS[id] && fits(id, slot) && id !== special) : [loadout.get(slot)].filter(Boolean);
      return ['<option value="">(nothing)</option>'].concat(ids.map((id) => '<option value="' + id + '">' + ITEMS[id].name + ' &middot; ' + itemWeight(id).toFixed(1) + ' kg</option>')).join('');
    };
    box.innerHTML = '<h3>Loadout</h3>'
      + '<label><span>Class</span><select data-class="1"><option value="">As issued &mdash; this mission\'s kit</option>'
      + CLASSES.map((c) => '<option value="' + c.id + '">' + c.name + (c.tag ? ' (' + c.tag + ')' : '') + '</option>').join('') + '</select></label>'
      + '<div class="kit-role" id="kit-role"></div>'
      + SLOTS.map((sl) => '<label><span>' + names[sl] + '</span><select data-slot="' + sl + '"></select></label>').join('')
      + '<div id="kit-special"></div>'
      + '<div class="kit-weight" id="kit-weight"></div>';
    const card = document.querySelector('#briefing .brief-card');
    card.insertBefore(box, $('b-begin'));
    const kitShow = () => {
      for (const sel of box.querySelectorAll('select[data-slot]')) {
        sel.innerHTML = opts(sel.dataset.slot); sel.value = loadout.get(sel.dataset.slot) || ''; sel.disabled = !S.cls;
      }
      $('kit-role').textContent = S.cls ? S.cls.role : 'The kit this mission issues. Choose a class to change it.';
      $('kit-special').innerHTML = loadout.specials.map((id) => '<label><span>Special</span><b>' + ITEMS[id].name + '</b><i>'
        + (id === special ? 'issued for this mission' : id === qGadget ? 'from Q Branch - ' + (ITEMS[id].note || '') : ITEMS[id].note || '') + '</i></label>').join('');
      arsenal.ammo = {}; arsenal.reset(loadout); applyLoad();
      const e = loadEffect(loadout.weight(arsenal));
      $('kit-weight').innerHTML = '<b>Weight</b> ' + e.kg.toFixed(1) + ' kg &middot; ' + e.label
        + (e.over > 0 ? ' <span>(' + Math.round((1 - e.speed) * 100) + '% slower, tires ' + Math.round((e.drain - 1) * 100) + '% sooner, louder)</span>' : ' <span>(no penalty)</span>');
    };
    box.querySelector('select[data-class]').onchange = (ev) => { applyClass(classById(ev.target.value)); kitShow(); };
    box.querySelectorAll('select[data-slot]').forEach((sel) => {
      sel.onchange = () => {
        const slot = sel.dataset.slot, id = sel.value || null, base = S.cls ? S.cls.kit : kit0;
        loadout.put(slot, id, id && id === base[slot] ? (base.mods || {})[slot] : []);
        kitShow();
      };
    });
    kitShow();
  }
  $('b-begin').onclick = () => { applyLoad(); deploy(); if (missionRt) missionRt.begin(); };
  $('b-yard').onclick = goYard;
  $('mend-yard').onclick = goYard;
  $('mend-again').onclick = () => location.reload();
  $('btn-trophies').onclick = () => tab('trophies');
  $('btn-skills').onclick = () => tab('skills');
  // (M6.29) the skills tree: experience from missions buys ranks - trained between missions, not on one
  function drawSkills() {
    const st = Saves.loadSkills(slotNo), left = pointsLeft(st), canTrain = !ON_MISSION;
    const toNext = XP.perPoint - ((st.xp || 0) % XP.perPoint);
    $('skill-sum').innerHTML = 'Experience <b>' + (st.xp || 0) + '</b> &middot; skill points to spend: <b>' + left + '</b> &middot; the next in ' + toNext
      + (canTrain ? '' : '<br><i>Train between missions - at Ghost HQ, or in Yard 7.</i>');
    const list = $('skill-list'); list.innerHTML = '';
    for (const [id, s] of Object.entries(SKILLS)) {
      const r = (st.ranks || {})[id] || 0, row = document.createElement('div');
      row.className = 'skill-row';
      row.innerHTML = '<span class="sk"><b>' + s.name + '</b><i>' + s.about + '</i></span><span class="pips">' + '\u25cf'.repeat(r) + '\u25cb'.repeat(s.ranks - r) + '</span>';
      const b = document.createElement('button'); b.className = 'btn'; b.textContent = r >= s.ranks ? 'Full' : 'Train';
      b.disabled = !canTrain || r >= s.ranks || left <= 0;
      b.onclick = () => { const next = trainSkill(Saves.loadSkills(slotNo), id); if (!next) return; Saves.saveSkills(slotNo, next); applySkills(slotNo); audio.confirm(); drawSkills(); };
      row.appendChild(b); list.appendChild(row);
    }
  }
  $('btn-gear').onclick = () => tab('gear');
  // (Rhys: "choose your New Class upon every death") down in a battle: 1-7 (or a click) picks
  // the class you go back in as; nothing pressed, you go back in as you were
  function showClassPick() {
    const el = $('class-pick');
    S.picking = true; S.nextCls = undefined;
    const draw = () => {
      const cur = S.nextCls !== undefined ? S.nextCls : S.cls;
      el.innerHTML = '<h3>Back in as</h3>' + CLASSES.map((c, i) => '<div class="cp' + (cur && cur.id === c.id ? ' on' : '') + '" data-i="' + i + '"><b>' + (i + 1) + '</b> ' + c.name
        + '<span>' + [c.kit.primary, c.kit.backup].filter(Boolean).map((id) => ITEMS[id].name).join(' + ') + (c.special ? ' &middot; ' + ITEMS[c.special].name : '') + '</span></div>').join('')
        + '<p>Press 1-' + CLASSES.length + ' to choose; your kit is that class\'s.</p>';
      el.querySelectorAll('.cp').forEach((d) => { d.onclick = () => { S.nextCls = CLASSES[+d.dataset.i]; draw(); }; });
    };
    S.drawClassPick = draw;
    draw(); el.style.display = 'block';
  }
  window.addEventListener('keydown', (e) => {
    if (!S.picking) return;
    const n = /^Digit(\d)$/.exec(e.code);
    if (n && +n[1] >= 1 && +n[1] <= CLASSES.length) { S.nextCls = CLASSES[+n[1] - 1]; if (S.drawClassPick) S.drawClassPick(); e.preventDefault(); }
  });
  // ── the gear and trophy screens ─────────────────────────────────────────────
  // what you are carrying (Rhys: pause and check your gear) - each
  // slot, its mods, what is left in it
  function drawGear() {
    const names = { primary: 'Primary', backup: 'Secondary', utility1: 'Utility 1', utility2: 'Utility 2', gear: 'Gear' };
    const lo = arsenal.loadout, rows = [];
    for (const slot of ['primary', 'backup', 'utility1', 'utility2', 'gear']) {
      const key = lo ? lo.keyOf(slot) : null;
      if (!key) { rows.push('<div><b style="color:#e8b423">' + names[slot] + '</b> &nbsp; <span style="opacity:0.5">empty</span></div>'); continue; }
      const d = arsenal.def(key) || {}, a = arsenal.ammo[key];
      const modList = (lo.mods || {})[slot] || [];
      let left = '';
      if (a && a.mag !== undefined) left = a.mag + ' / ' + (a.reserve !== undefined ? a.reserve : a.spare !== undefined ? a.spare : '');
      else if (a && a.count !== undefined) left = a.count + ' left';
      const placed = arsenal.liveCharges ? arsenal.liveCharges(key).length : 0;
      // (Rhys: the Parachute Pack "should say (packed) or (unpacked) alongside it")
      const state = d.chute ? ' &nbsp; <span style="opacity:0.75">(' + chuteLabel(S.chute) + ')</span>' : '';
      rows.push('<div style="margin:6px 0"><b style="color:#e8b423">' + names[slot] + '</b> &nbsp; ' + withTags(d.name || key, modList) + state
        + (left ? ' &nbsp; <span style="opacity:0.75">' + left + '</span>' : '')
        + (d.trait ? '<div style="opacity:0.6;font-size:12px;margin-left:12px">' + d.trait + '</div>' : '')
        + (placed ? ' &nbsp; <span style="opacity:0.75">(' + placed + ' placed)</span>' : '')
        + '</div>');
    }
    for (const sp of (lo && lo.specials) || []) {
      const d = ITEMS[sp] || {};
      const state = d.chute ? ' &nbsp; <span style="opacity:0.75">(' + chuteLabel(S.chute) + ')</span>' : '';
      rows.push('<div style="margin:6px 0"><b style="color:#e8b423">Special</b> &nbsp; ' + (d.name || sp) + state
        + (d.note ? '<div style="opacity:0.6;font-size:12px;margin-left:12px">' + d.note + '</div>' : '') + '</div>');
    }
    if (lo) { const e = loadEffect(lo.weight(arsenal)); rows.push('<div style="margin-top:10px"><b style="color:#e8b423">Weight</b> &nbsp; ' + e.kg.toFixed(1) + ' kg &nbsp; <span style="opacity:0.75">' + e.label + '</span></div>'); }
    // rounds in your pouch, for guns you are not carrying (yet)
    const pouch = Object.entries(arsenal.spare || {}).filter(([, n]) => n > 0).map(([k, n]) => ((AMMO[k] || {}).name || k) + ' ' + n);
    if (pouch.length) rows.push('<div style="margin-top:10px"><b style="color:#e8b423">Pouch</b> &nbsp; ' + pouch.join(', ') + '</div>');
    const keys = (level.keys || []).filter((k) => k.taken).map((k) => k.label);
    if (keys.length) rows.push('<div style="margin-top:10px"><b style="color:#e8b423">Keys</b> &nbsp; ' + keys.join(', ') + '</div>');
    // and, anywhere, a way to put down the rounds you have gathered beyond a full issue
    const extra = arsenal.dumpSpare(true), nx = Object.values(extra).reduce((a, b) => a + b, 0);
    if (nx > 0) rows.push('<button class="btn" id="dump-ammo" style="margin-top:12px">Drop ' + nx + ' spare rounds (down to a full issue)</button>');
    $('gear-list').innerHTML = rows.join('');
    if ($('dump-ammo')) $('dump-ammo').onclick = () => { arsenal.dumpSpare(); applyLoad(); audio.click(); drawGear(); };
  }
  // only what you have earned: nothing says what else there is
  function drawTrophies() {
    const have = Trophies.earned(slotNo);
    // (M6.28) the run's service record, over every mission and battle
    const rec = Saves.loadRecord(slotNo), sum = Saves.recordSummary(rec), rw = (k, v) => '<div class="rec-row"><span>' + k + '</span><b>' + v + '</b></div>';
    const hrs = Math.floor((rec.secs || 0) / 3600), mins = Math.floor(((rec.secs || 0) % 3600) / 60);
    $('record-list').innerHTML = (rec.missions || rec.battles) ? rw('Missions', (rec.missions || 0) + (rec.missions ? ' (' + (rec.won || 0) + ' successful, ' + (rec.partial || 0) + ' complete, ' + (rec.failed || 0) + ' failed)' : ''))
      + (rec.battles ? rw('Battles', rec.battles + ' (' + (rec.battlesWon || 0) + ' won)') + rw('K/D in battle', sum.kd === null ? (rec.deaths ? '0' : 'never fallen') : sum.kd.toFixed(2)) : '')
      + rw('Enemy casualties', rec.kills || 0) + rw('Knocked out', rec.knockouts || 0) + rw('Takedowns', rec.takedowns || 0)
      + rw('Accuracy', sum.accuracy === null ? 'no shots fired' : Math.round(sum.accuracy * 100) + '% (' + rec.shotsHit + ' of ' + rec.shotsFired + ')')
      + rw('Headshots', rec.headshots || 0) + rw('Times spotted', rec.spotted || 0)
      + (rec.hacked ? rw('Security hacked', rec.hacked + (rec.traced ? ' (traced ' + rec.traced + ')' : '')) : '')
      + (rec.rescued ? rw('Hostages rescued', rec.rescued) : '')
      + rw('Favourite weapon', sum.fav === 'knife' ? 'Knife' : sum.fav && ITEMS[sum.fav] ? ITEMS[sum.fav].name : '\u2014')
      + rw('Time in the field', hrs ? hrs + ' h ' + mins + ' min' : mins + ' min')
      : '<p>No missions yet.</p>';
    $('trophy-list').innerHTML = have.length
      ? have.map((t) => '<div class="trophy"><b>' + t.name + '</b><i>' + t.about + '</i></div>').join('')
      : '<p>None yet.</p>';
  }
  $('btn-dead-save').onclick = () => { saveNow(); show('dead', false); show('slots', true); drawSlots(); $('slot-msg').textContent = 'Saved to slot ' + (slotNo + 1) + '.'; };
  $('btn-dead-title').onclick = () => { saveNow(); show('dead', false); showTitle(); };
  if (isChromebook()) $('cb-note').style.display = 'block';

  function hud() {
    // No health bar: the screen tells you. Blood creeps in from the edges as
    // you are hurt, the colour drains near the end, and it all clears slowly.
    const hurt = Math.max(0, Math.min(1, (100 - player.health) / 75));
    const beat = player.health < 35 && player.mode !== 'dead' ? 0.12 * (0.5 + 0.5 * Math.sin(S.time * 6.5)) : 0;
    $('blood').style.opacity = Math.min(1, hurt * 0.9 + beat).toFixed(3);
    $('splat').style.opacity = Math.min(0.85, hurt * hurt * 0.85 + beat * 0.5).toFixed(3);
    $('blood').style.setProperty('--spread', (62 - hurt * 30).toFixed(1) + '%');
    const sat = player.health >= 60 ? 1 : 0.25 + 0.75 * (player.health / 60);
    const filt = sat < 0.999 ? `saturate(${sat.toFixed(2)})` : '';
    if ($('app').style.filter !== filt) $('app').style.filter = filt;
    // weapon panel
    const w = arsenal.weapon, am = arsenal.ammoNow;
    // (M6.33) the firing mode, where it has more than one
    const fms = w ? arsenal.modesOf() : [];
    $('w-name').textContent = w ? w.name + (fms.length > 1 ? '  [' + arsenal.modeOf().toUpperCase() + ']' : '') : '';
    // an energy weapon: its heat, not its rounds
    $('w-ammo').textContent = !am ? '\u2014' : am.count !== undefined ? String(am.count)
      : w && w.energy ? (arsenal.reloading > 0 ? 'COOLING' : 'HEAT ' + Math.round((1 - am.mag / w.mag) * 100) + '%')
      : arsenal.reloading > 0 ? 'RELOADING' : am.mag + ' / ' + am.reserve;
    $('w-ammo').style.color = am && am.mag === 0 && arsenal.reloading <= 0 ? '#e05050' : '#e6eaee';
    $('score').textContent = score ? 'SCORE ' + score : '';
    $('hitmark').style.opacity = hitMark > 0 ? 1 : 0;
    let stance = player.mode === 'swim' ? '' : player.stance === 2 ? 'PRONE' : player.stance === 1 ? 'CROUCHED' : '';
    if (S.lock) stance = 'LOCKED ON' + (stance ? '  ' + stance : '');
    // (Rhys: the Jump Pack "should show its fuel % all the while it's NOT at 100%, similar to your Stamina Bar")
    const jetShow = !!player.jetPack && player.jetFuel !== undefined && player.jetFuel < 0.999;
    $('jet').style.display = jetShow ? 'block' : 'none';
    if (jetShow) { $('jet-fill').style.width = (player.jetFuel * 100) + '%'; $('jet').querySelector('.lbl').textContent = 'JUMP PACK  ' + Math.round(player.jetFuel * 100) + '%'; }
    $('stance').textContent = stance;
    $('stance').style.opacity = stance ? 1 : 0;
    const stShow = player.stamina < P.staminaMax - 0.5 || player.exhausted;
    $('vitals').style.opacity = stShow ? 1 : 0;
    $('st-fill').style.width = (player.stamina / P.staminaMax * 100) + '%';
    $('st-fill').style.opacity = player.exhausted ? 0.45 : 1;
    const uw = player.underwater;
    $('br').style.display = uw || player.breath < P.breathMax - 0.05 ? 'block' : 'none';
    $('br-fill').style.width = (player.breath / P.breathMax * 100) + '%';
    $('br-fill').style.background = player.breath < 6 ? '#e05050' : '#6cc4e8';
    const atExtract = level.extract && !openCrate &&
      Math.hypot(level.extract.pos[0] - player.pos[0], level.extract.pos[2] - player.pos[2]) < 2.4;
    const atEntry = level.courseEntry && !openCrate &&
      Math.abs(player.pos[1] - (level.courseEntry.pos[1] || 0)) < 1.5 &&
      Math.hypot(level.courseEntry.pos[0] - player.pos[0], level.courseEntry.pos[2] - player.pos[2]) < 2.4;
    const charge = !openCrate && !atExtract && arsenal.chargeNear(player.pos, 1.8);
    const dr = !openCrate && !charge && !atExtract && doorNear();
    const sd = !openCrate && !charge && !atExtract && !dr && swingDoorNear();
    const near = !openCrate && !charge && !dr && !sd && crateNear();
    const cc = level.cctv;
    const atConsole = cc && S.cctv == null && atAConsole(cc);
    // (Rhys: "E Open the door" on locked and reinforced doors) the
    // hotel has a mission runtime now, which had switched these off; and the
    // plain door prompt below never asks whether the door is locked
    const lockedFor = (d) => d && d.locked && !d.open && !d.blown ? d.def.lockedText ? d.def.lockedText : (d.needs && hasKey(d.needs) ? 'E  Unlock it with the ' + keyLabel(d.needs)
      : d.def.maglock ? 'A security door  -  maglocked: hack the security system, or blow it' : d.def.blastDoor ? 'A blast door  -  no charge will move it: its controls will' : d.def.vault && DRAFT ? 'The vault door  -  locked; the security terminal opens it' : d.def.build === 'reinforced' ? 'Reinforced and locked  -  ' + (d.needs ? 'it takes a key, or a breaching charge' : 'a breaching charge will open it') : 'Locked  -  F  Kick it open') : null;
    const ldoor = !MISSION && swingDoorNear();
    // (M6.30, Rhys: "lockpicks and lockpicking, properly") with the lockpicks, an ordinary locked door can be picked
    const lockedTip = loadout.gearTrait('picks') && pickable(ldoor) ? (S.pickT > 0 ? 'Picking the lock...  ' + Math.round(S.pickT / PICK_SECS * 100) + '%' : 'Hold E  Pick the lock   (F  Kick it open)') : lockedFor(ldoor);
    const vn = !player.driving && vehicleNear();
    const mp = (player.driving ? (player.driving.kind === 'boat' ? 'Boat' : 'Driving') + '  ' + player.driving.kmh + ' km/h' + (player.driving.wrecked ? '  -  WRECKED' : '') + '   -   W/S throttle, A/D steer, SPACE brake, E to get out' : null) ||
      (vn ? (vn.kind === 'boat' ? 'E  Take the helm' : 'E  Get in and drive') : null) || (missionRt && missionRt.prompt()) || (atConsole ? 'E  Watch the CCTV cameras' : null) || (hqSec && hqSec.tip()) || hqTip() || keyTip() || intelTip() || noteTip() || safeTip() || stopTip() || liftTip() || lockedTip || chargeTip();
    if (S.visionMsg > 0) S.visionMsg -= 1 / 60;
    S.repackShown = false;                  // set below if repacking is what E would do now
    drawSafeUi();
    drawIntel();
    drawVision();
    $('prompt').textContent = S.cctv != null ? '' : S.visionMsg > 0 ? (S.visionNo ? 'No vision modes: they need goggles (night vision, thermal, UV) or a scanner in your gear slot' : 'Vision: ' + ({ normal: 'Normal', night: 'Night vision', thermal: 'Thermal', uv: 'UV', emf: 'EMF' })[S.vision || 'normal']) : S.noteT > 0 ? S.noteText : S.kickMsg > 0 ? (S.kickText || 'It held') : S.chuteMsg > 0 ? 'Parachute repacked' : mp ? mp : atExtract ? 'E  Return to Yard 7'
      : atEntry ? 'E  Go to the training course'
      : dr ? 'E  Door override'
      : sd ? (S.doorMsg > 0 ? 'Step out of the doorway' : lockedFor(sd) || (sd.open ? 'E  Shut the door' : 'E  Open the door  (hold E: slip through and shut it)'))
      : charge ? (arsenal.canTakeBack(charge) ? 'E  Make safe and take back' : 'Your pouch is full: no room to take it back')
      // (Rhys: "'E - Open Breaching Charges' ... should just say 'Open Crate' so that the
      // contents are a mystery") - what is in it is for opening it to find out; only the
      // Quartermaster, who is a station rather than a box, keeps his name
      : near ? cratePrompt(near) : player.prompt ? player.prompt
      : S.repackOffer ? ((S.repackShown = true), S.chute.repack > 0 ? 'Repacking the parachute  ' + Math.floor(100 * S.chute.repack / CHUTE.repack) + '%  (hold E)' : 'Hold E  Repack the parachute') : '';
    const z = level.world.zoneAt(player.pos[0], player.pos[1], player.pos[2]);
    $('zone').textContent = z ? z.label : DRAFT ? DRAFT.title : MISSION ? 'Meridian House' : HOTEL ? 'Riverside Hotel' : FACTORY ? 'Derelict Factory' : CASINO ? 'Casino' : TRAIN ? 'Night Train' : 'Yard 7';
    $('uw').style.opacity = uw ? 1 : 0;
    $('hurt').style.opacity = Math.min(1, S.hurt);
    $('crosshair').className = input.frameAim ? 'aim' : '';
    if (S.debug) {
      const sp = Math.hypot(player.vel[0], player.vel[2]);
      $('debug').style.display = 'block';
      $('score').style.top = (($('debug').offsetHeight || 22) + 18) + 'px';     // (Rhys: the line ran into the score) the score goes below it
      $('debug').textContent = `${S.fps.toFixed(0)} fps (game code ${(S.jsMs || 0).toFixed(1)} ms of ${(1000 / Math.max(1, S.fps)).toFixed(0)})${bakedLight ? (bakedLight.ok ? ' | baked light ' + bakedLight.ms + ' ms' : ' | LIVE light (bake failed)') : ''} | ${player.mode}${player.crouching ? ' crouch' : ''}${player.sprinting ? ' sprint' : ''} | ` +
        `x ${player.pos[0].toFixed(1)} y ${player.pos[1].toFixed(2)} z ${player.pos[2].toFixed(1)} | ${sp.toFixed(1)} m/s | stance ${player.stance} | ` +
        `stamina ${player.stamina.toFixed(0)}${player.exhausted ? ' (winded)' : ''} | ` +
        `noise ${Math.max(player.noise, arsenal.lastNoise || 0).toFixed(2)} (move ${player.noise.toFixed(2)}, act ${(arsenal.lastNoise || 0).toFixed(2)}) | breath ${player.breath.toFixed(0)}`;
    } else { $('debug').style.display = 'none'; $('score').style.top = ''; }
  }

  // ── screens ──────────────────────────────────────────────────────────────
  function show(id, on) { $(id).style.display = on ? 'flex' : 'none'; }
  canvas.addEventListener('mousedown', () => audio.start());
  window.addEventListener('keydown', () => audio.start());
  function deploy() {
    // a fresh parachute each time you go in - (Rhys: it "got
    // fully repacked on just one press") going in, not coming back from the
    // pause menu: Resume runs this too, and had repacked it for you
    if (!S.startedOnce) S.chute = { used: false, repack: 0 };
    // (M6.50) going in: no mouse movement left over from the menus (a click on Begin turned the view)
    S.lastYaw = undefined; input.mouse.dx = 0; input.mouse.dy = 0;      // (and nothing the mouse did on the menus)
    wview.setThird(S.third, body);                  // first or third person, as Settings says
    audio.start();
    S.musicT = 9;
    $('btn-skip-all').style.display = course ? 'block' : 'none';
    if (course) { showStep(); syncDoors(); }
    show('start', false); show('menu', false); show('title', false); show('slots', false);
    show('briefing', false); show('mend', false); S.menu = false;
    S.playing = true;
    S.startedOnce = true;
    S.wantLock = S.time;
    if (!TEST) {
      input.requestLock();
      // Chrome refuses a capture made too soon after the last one was released,
      // so try again a moment later before anything decides we are paused
      setTimeout(() => { if (S.playing && !S.menu && !openCrate && !S.dialog && !input.locked && !S.dragLook) input.requestLock(); }, 400);
      setTimeout(() => { if (S.playing && !S.menu && !openCrate && !S.dialog && !input.locked && !S.dragLook) input.requestLock(); }, 1100);
    }
  }
  $('btn-deploy').onclick = deploy;
  $('btn-resume').onclick = deploy;
  $('btn-respawn').onclick = () => {
    if (ON_MISSION) { location.reload(); return; }       // a mission starts again from the van (full kit)
    // back on your feet with your starting kit: dying again and again should
    // not leave you worse off each time (Rhys)
    arsenal.reset(loadout);
    if (course && !course.done) {
      // back to the beginning of the part you are on
      const section = course.section;
      const first = course.steps.findIndex((s) => s.section === section);
      if (first >= 0) course.at = first;
      if (section === 'weapons') {
        for (const list of Object.values(level.groups || {})) for (const t of list) { t.down = false; t.hp = t.maxHp; }
        for (const c of level.crates || []) if (c.stock) c.items = c.stock.slice();
        // the ranges' doors as at the start of the section: the way
        // out of the link room open, the rest shut until you earn them
        for (const s of level.world.solids) if (/^wdoor\d/.test(s.tag || '')) s.disabled = s.tag === 'wdoor0';
      }
      // (Rhys: it put him on the range's roof) the section's own start
      const st = level.sectionStarts[section === 'weapons' ? 'weapons' : 'movement'];
      player.reset(); player.pos = st.pos.slice(); player.vel = [0, 0, 0]; player.settle();
      input.yaw = st.yaw;
      input.pitch = 0;
      showStep(); syncDoors();
    } else { player.reset(); input.yaw = player.yaw; input.pitch = 0; }
    deploy();
  };
  $('app').addEventListener('click', () => { if (S.playing && !input.locked && !S.menu && !TEST && player.mode !== 'dead') input.requestLock(); });
  // (not over another screen: the mission's debrief lets go of the mouse too -
  // and the pause menu used to cover it, which is why Rhys never saw it)
  input.onUnlock = () => { if (player.mode !== 'dead' && !openCrate && !S.menu && !S.dialog) openMenu(); };
  // (M6.34) a touch screen: no mouse to capture - the screen is the controls (core/touch.js)
  let touch = null;
  if (isTouchDevice() && !TEST) {
    S.touch = true; S.dragLook = true; input.locked = true;
    input.requestLock = () => { input.locked = true; };
    touch = touchControls(input, {
      active: () => S.playing && !S.menu && !openCrate && !S.dialog && player.mode !== 'dead',
      onMenu: () => { if (S.playing && !S.menu) openMenu(); },
      swap: () => { const prim = loadout && loadout.keyOf('primary'); input.pressed.add(arsenal.current && arsenal.current === prim ? 'slot2' : 'slot1'); },
    });
    document.body.classList.add('touch');
    retext(['prompt', 'hint', 'step']);           // (M6.38) the keys it names, as buttons
  }
  document.addEventListener('pointerlockerror', () => {
    // some browsers (or embedded pages) refuse mouse capture: fall back to drag-to-look
    S.dragLook = true; input.locked = true;
    $('lock-note').style.display = 'block';
  });
  document.addEventListener('mousemove', (e) => {
    // (a touch screen looks by its own drags: touch.js)
    if (S.dragLook && !S.touch && e.buttons && S.playing && !S.menu) { input.mouse.dx += e.movementX || 0; input.mouse.dy += e.movementY || 0; }
  });
  window.addEventListener('keydown', (e) => {
    if (!S.playing) return;
    if (e.code === 'KeyP' || e.code === 'Escape') {
      if (openCrate) { closeCrate(); return; }
      if (S.menu) deploy(); else openMenu();
    }
  });
  // if the mouse comes free for any reason and nothing is showing, pause
  setInterval(() => {
    const settled = S.time - (S.wantLock || 0) > 2;
    if (settled && S.playing && !S.menu && !openCrate && !S.dialog && !TEST && !input.locked && !S.dragLook && player.mode !== 'dead') openMenu();
  }, 400);

  function openMenu() {
    S.menu = true;
    if ($('safe-ui')) $('safe-ui').style.display = 'none';     // the safe's dial waits behind the menu
    if (document.pointerLockElement) document.exitPointerLock();
    tab('main');
    show('menu', true);
  }
  function tab(name) {
    for (const t of ['main', 'controls', 'settings', 'howto', 'trophies', 'gear', 'skills']) $('tab-' + t).style.display = t === name ? 'block' : 'none';
    if (name === 'trophies') drawTrophies();
    if (name === 'skills') drawSkills();
    if (name === 'gear') drawGear();
    if (name === 'controls') drawBindings();
    if (name === 'settings') drawSettings();
  }
  for (const t of ['controls', 'settings']) $('btn-' + t).onclick = () => tab(t);
  $('btn-howto').onclick = () => window.open('controls.html?v=' + VERSION, '_blank');
  $('btn-arms').onclick = () => window.open('weapons.html?v=' + VERSION, '_blank');
  document.querySelectorAll('.btn-back').forEach((b) => { b.onclick = () => tab('main'); });

  function drawBindings() {
    const list = $('bind-list');
    list.innerHTML = '';
    for (const [action, label] of ACTIONS) {
      const row = document.createElement('div'); row.className = 'bind-row';
      const name = document.createElement('span'); name.textContent = label; row.appendChild(name);
      for (let slot = 0; slot < 2; slot++) {
        const b = document.createElement('button');
        b.className = 'key';
        b.textContent = keyLabel(settings.bindings[action][slot]);
        b.onclick = () => {
          b.textContent = 'press a key...'; b.classList.add('wait');
          input.capture = (code) => {
            if (code) {
              // a key can only do one thing: take it off anything else first
              for (const a of Object.keys(settings.bindings)) settings.bindings[a] = settings.bindings[a].map((c) => (c === code ? undefined : c));
              const arr = settings.bindings[action].slice(); arr[slot] = code;
              settings.bindings[action] = arr;
              for (const a of Object.keys(settings.bindings)) settings.bindings[a] = settings.bindings[a].filter((c, i) => c || i < 2);
              saveSettings(settings);
            }
            drawBindings();
          };
        };
        row.appendChild(b);
      }
      list.appendChild(row);
    }
  }
  $('btn-bind-reset').onclick = () => { settings.bindings = JSON.parse(JSON.stringify(DEFAULT_BINDINGS)); saveSettings(settings); drawBindings(); };

  function drawSettings() {
    $('set-sens').value = settings.sensitivity; $('set-sens-v').textContent = settings.sensitivity.toFixed(2);
    $('set-fov').value = settings.fov; $('set-fov-v').textContent = settings.fov;
    $('set-invert').checked = settings.invertY;
    $('set-diff').value = settings.difficulty || 'operative';
    $('set-wp').checked = !!settings.waypoint;
    $('set-text').value = settings.textSize || 'normal';
    $('set-tlook').value = settings.touchLook; $('set-tlook-v').textContent = (+settings.touchLook).toFixed(2);
    if ($('set-tturn')) $('set-tturn').checked = settings.touchTurn !== false;
    if ($('set-tbuzz')) $('set-tbuzz').checked = settings.touchBuzz !== false;
    if ($('set-tauto')) $('set-tauto').checked = !!settings.touchAutoFire;
    $('set-tsize').value = String(settings.touchSize); $('set-tassist').checked = settings.touchAssist !== false;

    $('set-quality').value = settings.quality;
    $('set-fps').checked = settings.showFps;
    $('set-glitch').checked = !!settings.glitchHints;
    $('set-view').value = settings.view === 'third' ? 'third' : 'first';
    $('set-autovault').value = settings.autoVault;
    $('set-map').checked = settings.map !== false;
    $('set-vol').value = settings.volume === undefined ? 0.7 : settings.volume;
    $('set-vol-v').textContent = Math.round((settings.volume === undefined ? 0.7 : settings.volume) * 100) + '%';
    $('set-music').value = settings.music === undefined ? 0.35 : settings.music;
    $('set-music-v').textContent = Math.round((settings.music === undefined ? 0.35 : settings.music) * 100) + '%';
  }
  $('set-text').onchange = (e) => { settings.textSize = e.target.value; saveSettings(settings); document.body.classList.toggle('bigtext', settings.textSize === 'large'); };
  $('set-wp').onchange = (e) => { settings.waypoint = e.target.checked; saveSettings(settings); };      // (M6.57)
  $('set-diff').onchange = (e) => { settings.difficulty = e.target.value; saveSettings(settings); };      // (M6.39)
  // (M6.36) touch settings
  $('set-tlook').oninput = (e) => { settings.touchLook = +e.target.value; $('set-tlook-v').textContent = settings.touchLook.toFixed(2); saveSettings(settings); };
  $('set-tsize').onchange = (e) => { settings.touchSize = +e.target.value; saveSettings(settings); if (touch) touch.resize(); };
  $('set-tauto').onchange = (e) => { settings.touchAutoFire = e.target.checked; saveSettings(settings); };
  $('set-tbuzz').onchange = (e) => { settings.touchBuzz = e.target.checked; saveSettings(settings); };
  $('set-tturn').onchange = (e) => { settings.touchTurn = e.target.checked; saveSettings(settings); };
  $('set-tassist').onchange = (e) => { settings.touchAssist = e.target.checked; saveSettings(settings); };
  $('set-sens').oninput = (e) => { settings.sensitivity = +e.target.value; $('set-sens-v').textContent = settings.sensitivity.toFixed(2); saveSettings(settings); };
  $('set-fov').oninput = (e) => { settings.fov = +e.target.value; $('set-fov-v').textContent = settings.fov; saveSettings(settings); };
  $('set-invert').onchange = (e) => { settings.invertY = e.target.checked; saveSettings(settings); };

  $('set-quality').onchange = (e) => { const row = e.target.closest('.set'); if (row) row.classList.remove('pick'); settings.quality = e.target.value; view.applyQuality(settings.quality); saveSettings(settings); };
  $('set-autovault').onchange = (e) => { settings.autoVault = e.target.value; saveSettings(settings); };
  $('set-vol').oninput = (e) => { audio.start(); audio.setVolume(+e.target.value); $('set-vol-v').textContent = Math.round(e.target.value * 100) + '%'; saveSettings(settings); };
  $('set-music').oninput = (e) => { music.setVolume(+e.target.value); $('set-music-v').textContent = Math.round(e.target.value * 100) + '%'; saveSettings(settings); };
  $('set-map').onchange = (e) => { settings.map = e.target.checked; saveSettings(settings); $('map-wrap').style.display = settings.map ? 'block' : 'none'; };
  $('set-view').onchange = (e) => { settings.view = e.target.value; S.third = settings.view === 'third'; wview.setThird(S.third, body); saveSettings(settings); };
  $('set-fps').onchange = (e) => { settings.showFps = e.target.checked; S.debug = settings.showFps; saveSettings(settings); };
  // (Rhys: the glitches can be very discreet) a ring where each camera's glitch shows
  $('set-glitch').onchange = (e) => { settings.glitchHints = e.target.checked; saveSettings(settings); };

  // back on your feet with your starting kit (Rhys: redeploying kept what you had used up)
  $('btn-redeploy').onclick = () => { arsenal.reset(loadout); player.reset(); input.yaw = player.yaw; input.pitch = 0; show('dead', false); deploy(); };

  // ── aiming and the camera ───────────────────────────────────────────
  // Where the crosshair is pointing. In third person the camera sits off to
  // one side, so we aim at whatever it is looking at, not straight ahead.
  // ── the safe's dial, night vision ───────────────────────────────────────────
  // the dial, while you work it: the numbers either side, what you have set
  function drawSafeUi() {
    let el = $('safe-ui');
    if (!S.cracking || S.menu) { if (el) el.style.display = 'none'; return; }      // (not over the pause menu)
    if (!el) {
      el = document.createElement('div'); el.id = 'safe-ui';
      el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-38%);background:rgba(10,12,14,0.88);color:#eee;padding:14px 22px;border:1px solid #e8b423;font:16px monospace;text-align:center;z-index:30;letter-spacing:2px';
      // (Rhys: an actual circular dial) drawn on a canvas, turned to the number set
      el.innerHTML = '<div style="color:#e8b423;margin-bottom:6px">SAFE DIAL</div><canvas id="safe-dial" width="240" height="240" style="width:200px;height:200px;display:block;margin:0 auto"></canvas>'
        + '<div id="safe-slots" style="margin:8px 0 4px;font-size:18px"></div><div id="safe-msg" style="color:#e05050;min-height:0"></div>'
        + '<div style="font-size:12px;opacity:0.75;letter-spacing:0">mouse or A / D to turn &middot; E to set the number &middot; W / S to step away</div>';
      document.body.appendChild(el);
    }
    const sd = S.cracking.safe, d = sd.dial;
    // the face turns smoothly to the number, the short way round
    if (S.dialShown === undefined) S.dialShown = d;
    let diff = d - S.dialShown; while (diff > 5) diff -= 10; while (diff < -5) diff += 10;
    S.dialShown += diff * Math.min(1, 0.25);
    if (Math.abs(diff) < 0.01) S.dialShown = d;
    drawDial($('safe-dial'), S.dialShown);
    $('safe-slots').textContent = [0, 1, 2, 3].map((i) => (i < sd.entered.length ? '\u25CF' : i === sd.entered.length ? '\u25CB' : '\u00B7')).join(' ');
    if (S.safeMsg > 0) S.safeMsg -= 1 / 60;
    $('safe-msg').textContent = S.safeMsg > 0 ? 'The handle will not turn' : '';
    el.style.display = 'block';
  }
  // A combination dial: brushed steel, a knurled rim, 0-9 round it, the number
  // under the red marker at the top is the one set. `at` may be fractional (turning).
  function drawDial(cv, at) {
    if (!cv) return;
    const g = cv.getContext('2d'), W = cv.width, c = W / 2, R = W * 0.46;
    g.clearRect(0, 0, W, W);
    // the bezel
    g.beginPath(); g.arc(c, c, R, 0, Math.PI * 2);
    const bz = g.createLinearGradient(0, 0, W, W); bz.addColorStop(0, '#5a5f66'); bz.addColorStop(1, '#1d2024');
    g.fillStyle = bz; g.fill();
    g.save(); g.translate(c, c); g.rotate(-at / 10 * Math.PI * 2);
    // the knurled rim
    for (let k = 0; k < 60; k++) { g.rotate(Math.PI * 2 / 60); g.fillStyle = k % 2 ? '#3a3e44' : '#6c727a'; g.fillRect(-2, -R * 0.98, 4, R * 0.1); }
    // the face
    g.beginPath(); g.arc(0, 0, R * 0.84, 0, Math.PI * 2);
    const fc = g.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R * 0.84); fc.addColorStop(0, '#b9bec6'); fc.addColorStop(1, '#6b7178');
    g.fillStyle = fc; g.fill();
    // ticks and numbers
    g.fillStyle = '#15171a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold ' + Math.round(R * 0.2) + 'px monospace';
    for (let n = 0; n < 10; n++) {
      const a = n / 10 * Math.PI * 2;
      g.save(); g.rotate(a); g.fillRect(-1.5, -R * 0.82, 3, R * 0.12); g.restore();
      // the numbers are printed on the face, so they turn with it
      g.save(); g.rotate(a); g.translate(0, -R * 0.56); g.fillText(String(n), 0, 0); g.restore();
      for (let m = 1; m < 5; m++) { g.save(); g.rotate(a + m / 50 * Math.PI * 2); g.fillRect(-0.8, -R * 0.82, 1.6, R * 0.06); g.restore(); }
    }
    // the knob in the middle
    g.beginPath(); g.arc(0, 0, R * 0.26, 0, Math.PI * 2);
    const kb = g.createRadialGradient(-R * 0.08, -R * 0.08, 2, 0, 0, R * 0.26); kb.addColorStop(0, '#9aa0a8'); kb.addColorStop(1, '#2c3035');
    g.fillStyle = kb; g.fill();
    g.fillStyle = '#1a1c1f'; g.fillRect(-R * 0.04, -R * 0.24, R * 0.08, R * 0.2);     // its grip line
    g.restore();
    // the fixed marker at the top
    g.beginPath(); g.moveTo(c, c - R * 0.86); g.lineTo(c - 9, c - R - 8); g.lineTo(c + 9, c - R - 8); g.closePath();
    g.fillStyle = '#e04040'; g.fill();
  }

  // night vision: the picture brightened and turned green, grain and
  // a dark edge over it; the cameras at night show as grey infra-red
  function drawVision() {
    const watching = S.cctv != null, nv = S.vision === 'night' && !watching && S.playing;
    const ir = watching && level.night;
    // thermal: the world cold and grey, anything warm white-hot (drawn by the runtime); UV:
    // violet, the marks glowing; EMF: dark, the wiring and devices green
    const vm = !watching && S.playing ? S.vision : 'normal';
    // drugged: the colours drift and the edges swim, until the antidote is taken
    const dr = level.drugged && S.playing && !(level.pickups || []).some((q) => q.id === level.drugged.until && q.taken);
    if (dr && !nv && vm === 'normal' && !ir) {
      const t = performance.now() / 1000;
      const df = 'hue-rotate(' + Math.round(Math.sin(t * 0.21) * 70) + 'deg) saturate(' + (1.5 + Math.sin(t * 0.37) * 0.4).toFixed(2) + ') blur(' + (0.6 + Math.sin(t * 0.53) * 0.5).toFixed(2) + 'px) contrast(1.1)';
      canvas.style.filter = df; const ov0 = $('nv'); if (ov0) ov0.style.display = 'none'; return;
    }
    const f = nv ? 'brightness(4.2) contrast(1.25) grayscale(1) sepia(1) hue-rotate(58deg) saturate(2.6)' : ir ? 'grayscale(1) brightness(2.4) contrast(1.2)'
      : vm === 'thermal' ? 'grayscale(1) brightness(2.2) contrast(0.55)' : vm === 'uv' ? 'brightness(1.6) sepia(1) hue-rotate(215deg) saturate(3.2)' : vm === 'emf' ? 'brightness(1.4) contrast(1.2) saturate(0.35)'
      // (M6.28) where the lights have been hacked out: dark for you too (night vision or thermal sees)
      : !watching && S.playing && level.blackout && level.blackout(player.eyePos) ? 'brightness(0.3) saturate(0.5)' : '';
    if (canvas.style.filter !== f) canvas.style.filter = f;
    const ov = $('nv');
    if (ov) ov.style.display = nv ? 'block' : 'none';
  }

  // ── keys, consoles, the lift's emergency stop ─────────────────
  function atAConsole(cc) {
    return (cc.consoles || [cc.console]).some((k) => Math.abs(player.pos[1] - k[1]) < 1.5 && Math.hypot(k[0] - player.pos[0], k[2] - player.pos[2]) < 1.8);
  }
  function hasKey(id) { return (level.keys || []).some((k) => k.id === id && k.taken); }
  function keyLabel(id) { const k = (level.keys || []).find((q) => q.id === id); return k ? k.label : 'key'; }
  function keyNear() {
    return (level.keys || []).find((k) => !k.taken && (!k.safe || k.safe.open) && Math.abs(player.pos[1] - k.pos[1]) < 1.6 && Math.hypot(k.pos[0] - player.pos[0], k.pos[2] - player.pos[2]) < 1.4);
  }
  function keyTip() { const k = keyNear(); return k ? 'E  Take the ' + k.label : null; }
  // the sight picture: drawn once per kind, shown or hidden
  function drawScope(kind) {
    if (S.scopeKind === kind) return;
    S.scopeKind = kind;
    let el = $('scope');
    if (!el) { el = document.createElement('div'); el.id = 'scope'; el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:4;display:none'; document.body.appendChild(el); }
    el.innerHTML = kind === 'none' ? '' : scopeSvg(kind);
    el.style.display = kind === 'none' ? 'none' : 'block';
    $('crosshair').style.visibility = kind === 'none' ? '' : 'hidden';
  }
  // charges you have placed: how many, and how to set them off
  function chargeTip() {
    // placed from Z / X as well as by hand: how many, and the key that sets them off
    const inHand = arsenal.weapon && arsenal.weapon.kind === 'placeable' ? arsenal.current : null;
    for (const [n, slot] of [[1, 'utility1'], [2, 'utility2']]) {
      const k = loadout.keyOf(slot), w = k && arsenal.def(k);
      if (!w || w.kind !== 'placeable') continue;
      if (k !== inHand && !((S.quickTipT || 0) > 0 && S.quickTipSlot === slot)) continue;
      const live = arsenal.liveCharges(k).length;
      if (!live) continue;
      const key = keyLabel((settings.bindings['use' + n] || [])[0] || '') || ('slot ' + (n + 2));
      const left = (arsenal.ammo[k] || {}).count || 0;
      return live + ' placed' + (left > 0 && w.chain ? '  -  tap ' + key + ' to place another' : '') + '  -  hold ' + key + ' to set ' + (live > 1 ? 'them' : 'it') + ' off';
    }
    return null;
  }
  // a note you can read (the safe's combination)
  function noteNear() {
    return (level.notes || []).find((n) => Math.abs(player.pos[1] - n.pos[1]) < 1.6 && Math.hypot(n.pos[0] - player.pos[0], n.pos[2] - player.pos[2]) < 1.3);
  }
  // (Rhys: lore in the rooms) intel: papers to read, counted in the debrief
  function intelNear() {
    return (level.intel || []).find((n) => Math.abs(player.pos[1] - n.floorY) < 1.2 && Math.hypot(n.pos[0] - player.pos[0], n.pos[2] - player.pos[2]) < 1.4);
  }
  function intelTip() {
    const n = intelNear();
    if (!n) return null;
    return S.readingIntel === n ? 'E  Put it down' : 'E  Read: ' + n.kind.toLowerCase() + (n.found ? '  (read)' : '');
  }
  function drawIntel() {
    let el = $('intel-ui');
    const it = S.readingIntel;
    if (it && (S.menu || !S.playing || Math.hypot(it.pos[0] - player.pos[0], it.pos[2] - player.pos[2]) > 2.2 || Math.abs(player.pos[1] - it.floorY) > 1.5)) S.readingIntel = null;
    if (!S.readingIntel) { if (el) el.style.display = 'none'; return; }
    if (!el) {
      el = document.createElement('div'); el.id = 'intel-ui';
      el.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,86vw);max-height:70vh;overflow:auto;background:#e9e4d6;color:#1d1c19;padding:20px 24px 16px;border-left:6px solid #e8b423;box-shadow:0 10px 40px rgba(0,0,0,0.7);font:15px/1.5 Georgia,serif;z-index:30';
      document.body.appendChild(el);
    }
    const all = level.intel || [], got = all.filter((q) => q.found).length;
    const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    el.innerHTML = '<div style="font:12px monospace;letter-spacing:3px;color:#8a6d12;margin-bottom:6px">INTEL &middot; ' + esc(it.kind.toUpperCase()) + '</div>' +
      '<div style="font:bold 18px Georgia,serif;margin-bottom:10px">' + esc(it.title) + '</div>' +
      it.text.map((t) => '<p style="margin:0 0 9px;color:#1d1c19">' + esc(t) + '</p>').join('') +
      '<div style="font:12px monospace;color:#555;margin-top:10px;display:flex;justify-content:space-between"><span>Intel found: ' + got + ' of ' + all.length + '</span><span>E or step away to put it down</span></div>';
    el.style.display = 'block';
  }
  function noteTip() {
    const n = noteNear();
    if (!n) return null;
    return S.reading === n ? n.text : 'E  Read the note';
  }
  // the safe: E at it to work the dial, or to take what is inside
  function safeNear() {
    return (level.safes || []).find((sf) => sf.safe && Math.abs(player.pos[1] - sf.pos[1]) < 1 && Math.hypot(sf.pos[0] - player.pos[0], sf.pos[2] - player.pos[2]) < 1.1);
  }
  function safeTip() {
    const sf = safeNear();
    if (!sf || S.cracking) return null;
    if (sf.safe.open) return sf.safe.blown ? 'The safe door is gone' : 'The safe is open';
    return 'E  Work the dial';
  }
  function atStop() {
    const st = level.liftStop;
    return st && level.lift && Math.abs(player.pos[1] - st.pos[1]) < 1 && Math.hypot(st.pos[0] - player.pos[0], st.pos[2] - player.pos[2]) < 1.3;
  }
  function stopTip() { return atStop() ? (level.lift.stopped ? 'E  Reset the lift (it is stopped)' : 'E  Emergency stop - the lift') : null; }
  function keyUse() {
    const k = keyNear();
    if (k) { k.taken = true; audio.confirm(); return true; }
    const iv = intelNear();
    if (iv) {
      if (S.readingIntel === iv) S.readingIntel = null;
      else { S.readingIntel = iv; if (!iv.found) { iv.found = true; if (level.draft && iv.id && ON_MISSION) Saves.markPaper(Saves.currentSlot(), level.draft, iv.id); audio.pickup ? audio.pickup() : audio.click(); } else audio.click(); }
      return true;
    }
    const n = noteNear();
    if (n) { S.reading = S.reading === n ? null : n; audio.click(); return true; }
    const sf = safeNear();
    if (sf && !sf.safe.open) { S.cracking = sf; S.crackYaw = input.yaw; audio.click(); return true; }
    if (atStop()) { level.lift.setStopped(!level.lift.stopped); audio.click ? audio.click() : audio.confirm(); return true; }
    const d = swingDoorNear();
    if (d && d.locked && !d.open && d.needs && hasKey(d.needs)) {
      // unlock it - and the other of a pair - and open it
      for (const o of level.swingDoors) if (o === d || (d.def.pair && o.def.pair === d.def.pair)) { o.unlock(); o.use(player.pos, player.box()); }
      audio.door(true);
      return true;
    }
    return false;
  }

  // ── Ghost HQ's stations ─────────────────────────────────────────
  // At the operations table, E for your assignments; at the trophy cabinet, E
  // to look at what you have earned. (Logistics is a crate, like the Quartermaster.)
  function hqStation() {
    const hq = level.hq;
    if (!hq || ON_MISSION || S.cctv != null || Math.abs(player.pos[1] - hq.floor) > 1.5) return null;
    const [ox, oz] = hq.ops, [tx, tz] = hq.trophies;
    const dx = Math.max(0, Math.abs(player.pos[0] - ox) - 2.6), dz = Math.max(0, Math.abs(player.pos[2] - oz) - 1.5);
    if (Math.hypot(dx, dz) < 1.3) return 'ops';
    if (Math.abs(player.pos[0] - tx) < 6 && player.pos[2] - tz < 2 && player.pos[2] > tz - 0.6) return 'trophies';   // (not through the wall, from the server room)
    if (Math.hypot(player.pos[0] - hq.training[0], player.pos[2] - hq.training[1]) < 2.2) return 'skills';
    if (Math.hypot(player.pos[0] - hq.caseBoard[0], player.pos[2] - hq.caseBoard[1]) < 2.2) return 'case';
    const [qx, qz] = hq.q;
    if (Math.max(0, Math.abs(player.pos[0] - qx) - 2.4) + Math.max(0, Math.abs(player.pos[2] - qz) - 0.6) < 1.2) return 'q';
    return null;
  }
  function hqTip() {
    const at = hqStation();
    return at === 'ops' ? 'E  Assignments' : at === 'trophies' ? 'E  The trophy cabinet' : at === 'case' ? 'E  The case board  (' + Saves.loadCase(slotNo).filter((id) => CASE.some((c) => c.id === id)).length + ' clues; contracts)' : at === 'skills' ? 'E  Training: your skills' + (pointsLeft(Saves.loadSkills(slotNo)) > 0 ? '  (points to spend)' : '') : at === 'q' ? 'E  Q Branch' + (Saves.loadGadget(slotNo) && ITEMS[Saves.loadGadget(slotNo)] ? '  (signed out: ' + ITEMS[Saves.loadGadget(slotNo)].name + ')' : '') : null;
  }
  function hqUse() {
    const at = hqStation();
    if (!at) return false;
    if (at === 'ops' && hqSec && hqSec.active) { audio.deny(); S.noteText = 'Not with Yard 7 in their hands: lock the intruder out first (the server room, the security console)'; S.noteT = 4; return true; }
    audio.confirm();
    if (at === 'ops') openAssignments();
    else if (at === 'q') openQ();
    else if (at === 'skills') { openMenu(); tab('skills'); }
    else if (at === 'case') openCase();
    else { openMenu(); tab('trophies'); }
    return true;
  }

  // ── the lift ────────────────────────────────────────────────────
  // In the car: look at a floor's button and press E. On a landing: E calls it.
  function liftTip() {
    const lift = level.lift;
    if (!lift || S.cctv != null) return null;
    if (lift.carries(player.pos)) {
      const b = lift.buttonAt(player.eyePos, aimDir());
      const going = lift.moving ? 'Going to the ' + lift.def.floors[lift.target].label.toLowerCase() : null;
      if (lift.stopped && !lift.moving) return 'The lift has been stopped';
      if (!b) return going || 'Look at a button to choose a floor';
      if (!lift.moving && b.i === lift.at) return 'E  ' + b.label + '  (you are here: doors)';
      return 'E  ' + b.label + (going ? '   -   ' + going : '');
    }
    const i = lift.landingNear(player.pos);
    if (i < 0) return null;
    if (!lift.moving && lift.at === i && lift.wantOpen) return null;                // it is here and open: walk in
    if (lift.stopped && !(lift.at === i && !lift.moving)) return 'The lift is out of service (stopped - its reset is in the machine room)';
    if (lift.target === i || lift.queue.includes(i)) return 'The lift is on its way';
    return 'E  Call the lift';
  }
  function liftUse() {
    const lift = level.lift;
    if (!lift) return false;
    if (lift.carries(player.pos)) {
      const b = lift.buttonAt(player.eyePos, aimDir());
      if (!b) return false;
      lift.call(b.i); audio.confirm();
      return true;
    }
    const i = lift.landingNear(player.pos);
    if (i < 0) return false;
    lift.call(i); audio.confirm();
    return true;
  }

  // (Rhys: crouched, aiming lifts you to peek - and the shot went
  // high) peeking raises your eyes half a metre over half a second, and the
  // camera follows them a moment behind; a shot from the eyes' new height
  // passed over what the crosshair showed. A round starts where you SEE from.
  function shotEye() { return shotOrigin(player.eyePos, S.viewEye); }
  function aimDir() {
    const eye = player.eyePos;
    if (!S.third && !player.driving) return player.lookDir();
    const c = cam.getPosition(), f = cam.forward;
    const from = [c.x, c.y, c.z], dir = [f.x, f.y, f.z];
    const r = level.world.raycast(from, dir, 300, (q) => !!q.vehicle && q.vehicle === player.driving);
    const at = r ? [from[0] + dir[0] * r.t, from[1] + dir[1] * r.t, from[2] + dir[2] * r.t]
      : [from[0] + dir[0] * 300, from[1] + dir[1] * 300, from[2] + dir[2] * 300];
    const d = [at[0] - eye[0], at[1] - eye[1], at[2] - eye[2]];
    const len = Math.hypot(d[0], d[1], d[2]) || 1;
    // (Rhys: "very difficult to aim a weapon AND steer a boat") at the wheel, a shot near enough on a man
    // goes to him: within a few degrees of the crosshair (more when aiming), in sight, the nearest to it
    if (player.driving) {
      const cone = lastInput && lastInput.aim ? 0.09 : 0.055;
      let best = null, ba = cone;
      for (const g of level.guards || []) {
        if (g.dead || (g.target && g.target.down) || g.side === 'ally') continue;
        const c = [g.pos[0] - from[0], g.pos[1] + 1.25 - from[1], g.pos[2] - from[2]], cl = Math.hypot(c[0], c[1], c[2]);
        if (cl > 140 || cl < 2) continue;
        const a = Math.acos(Math.max(-1, Math.min(1, (c[0] * dir[0] + c[1] * dir[1] + c[2] * dir[2]) / cl)));
        if (a >= ba) continue;
        const e2 = [g.pos[0] - eye[0], g.pos[1] + 1.25 - eye[1], g.pos[2] - eye[2]], el = Math.hypot(e2[0], e2[1], e2[2]);
        const block = level.world.raycast(eye, [e2[0] / el, e2[1] / el, e2[2] / el], el - 0.6, (q) => q.person || q.target || q.shootThrough || (q.vehicle && q.vehicle === player.driving));
        if (block) continue;
        best = e2.map((x) => x / el); ba = a;
      }
      if (best) return best;
    }
    return [d[0] / len, d[1] / len, d[2] / len];
  }

  const tmp = new pc.Vec3();
  const camY = new CamSmoother();
  // where to draw the body: between the last two simulation steps, so motion
  // is smooth whatever the screen's refresh rate
  function renderPos() {
    const a = player.pos, b = S.prevPos;
    if (!b || Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 2) return a.slice();
    const t = S.alpha;
    return [b[0] + (a[0] - b[0]) * t, b[1] + (a[1] - b[1]) * t, b[2] + (a[2] - b[2]) * t];
  }
  function placeCamera(dt, inp) {
    const rp = renderPos();
    const targetEye = player.mode === 'swim' ? P.eye : player.eyeHeight;
    S.eye = followEye(S.eye, targetEye, dt);
    const speed = Math.hypot(player.vel[0], player.vel[2]);
    const walking = player.onGround && player.mode === 'walk' && speed > 0.5;
    S.bobAmp += ((walking ? (player.sprinting ? 0.055 : 0.03) : 0) - S.bobAmp) * Math.min(1, dt * 8);
    S.bob += dt * (speed * 1.9 + 0.1);
    S.dip = Math.max(0, S.dip - dt * 0.9);
    // stairs and crate edges: the body steps, the eyes glide
    const bodyY = camY.update(dt, rp[1], player.mode === 'traverse' ? 0 : player.vel[1]);
    const swimBob = player.mode === 'swim' && !player.underwater ? Math.sin(S.time * 2.1) * 0.05 : 0;
    const eyeY = bodyY + S.eye + Math.abs(Math.sin(S.bob)) * S.bobAmp - S.bobAmp * 0.5 - S.dip + swimBob;
    const f = forwardOf(input.yaw);
    const side = Math.cos(S.bob) * S.bobAmp * 0.35;
    const lean = player.leanOffset();
    let px = rp[0] + f[2] * side * -1 + lean[0], py = eyeY, pz = rp[2] + f[0] * side + lean[1];
    // recoil pushes the view up, and a blast shakes it
    S.recoilKick = Math.max(0, (S.recoilKick || 0) - dt * 0.35);
    // the muzzle settles back down, and back straight, on its own
    if (S.recoilPull) {
      const back = Math.sign(S.recoilPull) * Math.min(Math.abs(S.recoilPull), dt * 0.22);
      input.yaw -= back * 0.55;
      S.recoilPull -= back;
    }
    const shake = wview.shake > 0 ? wview.shake * 0.02 : 0;
    // On the title and saved-games screens the camera drifts over the yard
    // rather than standing at the spawn point staring at a wall.
    const onMenuScreen = !TEST && (getComputedStyle($('title')).display !== 'none' ||
      getComputedStyle($('slots')).display !== 'none');
    S.menuCam = onMenuScreen;
    if (onMenuScreen) {
      // nothing of the player's kit belongs on a menu
      $('hud').style.display = 'none';
      for (const k of Object.keys(wview.held)) wview.held[k].enabled = false;
      if (opr) opr.enabled = false;
      body.enabled = false;
      const t = S.time * 0.035;
      const views = [
        { c: [0, 0, 6], r: 46, h: 16, look: [0, 2, 0] },          // the yard
        { c: [30, 0, -26], r: 30, h: 13, look: [30, 1, -26] },    // the dive tower and pool
        { c: [38, 0, 22], r: 34, h: 15, look: [40, 1, 16] },      // the range
      ];
      const v = views[Math.floor(S.time / 26) % views.length];
      const a = t * 2;
      cam.setPosition(v.c[0] + Math.cos(a) * v.r, v.h, v.c[2] + Math.sin(a) * v.r);
      cam.lookAt(v.look[0], v.look[1], v.look[2]);
      cam.camera.fov = 55;
      return;
    }
    if ((S.cctv != null && level.cctv) || S.snakeCam) {
      // watching a camera: its view, nothing of your own kit
      // (Rhys: pan with the mouse; and you were invisible on camera 7)
      // (M6.30) or Q's snake camera, under a door
      const c = S.snakeCam || level.cctv.cameras[S.cctv];
      for (const k of Object.keys(wview.held)) wview.held[k].enabled = false;
      const home = S.cctvHome || { yaw: input.yaw, pitch: input.pitch };
      if (opr && opr.ready) {
        opr.enabled = true; body.enabled = false;
        opr.update(dt, stateOf(player, arsenal, lastInput), [rp[0], rp[1], rp[2]], home.yaw);
        // your weapon stays in your hands at the console (Rhys: on camera
        // 7 you held nothing, in a pose for holding something); back to the
        // camera when you stop watching
        const held = wview.held[arsenal.current];
        if (held && held.parent !== opr.root) wview.setThird(true, opr);
        opr.carry = held || null;
      } else {
        body.enabled = true; body.setPosition(rp[0], rp[1], rp[2]); body.setEulerAngles(0, home.yaw * 180 / Math.PI, 0);
      }
      const ref = S.cctvRef || home;
      const d = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
      const dl = Math.hypot(d[0], d[1], d[2]) || 1;
      const yaw = Math.atan2(-d[0], -d[2]) + Math.max(-1.2, Math.min(1.2, input.yaw - ref.yaw));
      const pitch = Math.max(-1.3, Math.min(0.35, Math.asin(d[1] / dl) + (input.pitch - ref.pitch)));
      cam.setPosition(c.pos[0], c.pos[1], c.pos[2]);
      cam.lookAt(c.pos[0] - Math.sin(yaw) * Math.cos(pitch), c.pos[1] + Math.sin(pitch), c.pos[2] - Math.cos(yaw) * Math.cos(pitch));
      // hold aim (right mouse) to zoom in; the mouse turns slower when zoomed
      const zoomIn = !!(lastInput && lastInput.aim);
      S.cctvFov = (S.cctvFov || 75) + ((zoomIn ? 22 : 75) - (S.cctvFov || 75)) * Math.min(1, dt * 8);
      cam.camera.fov = S.cctvFov;
      // the feed's clock - and, on a camera that has been playing up, a
      // moment's glitch now and then in which its seconds are wrong
      const mt = level.missionTime || { date: [9, 7, 2026], hour: 22, minute: 47 };
      const now = mt.hour * 3600 + mt.minute * 60 + (S.missionT || 0);
      const g = cameraGlitch(c, performance.now() / 1000);
      const hh = Math.floor(now / 3600) % 24, mm = Math.floor(now / 60) % 60, ss = Math.floor(now) % 60;
      const two = (n) => String(n).padStart(2, '0');
      const day = mt.date[0] + Math.floor(now / 86400);           // (past midnight, the next day - within the month will do)
      $('cctv-time').textContent = two(day) + '-' + two(mt.date[1]) + '-' + mt.date[2] + '  ' + two(hh) + ':' + two(mm) + ':' + two(ss);
      // in the glitch, its number, faint, somewhere in the picture (each camera its own spot)
      const gh = $('cctv-ghost');
      gh.style.display = g ? 'block' : 'none';
      // the hint ring: always round the spot this camera's glitch shows in
      const hr = $('cctv-hint'), hintOn = !!settings.glitchHints && c.clue != null;
      hr.style.display = hintOn ? 'block' : 'none';
      if (hintOn) { const sp = glitchSpot(c); hr.style.left = 'calc(' + sp[0] + '% + 15px)'; hr.style.top = 'calc(' + sp[1] + '% + 20px)'; }
      if (g) {
        // not printed on the lens: the picture itself goes a little off in the
        // shape of the number (Rhys)
        const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='60' height='80'><text x='30' y='66' font-family='monospace' font-weight='bold' font-size='76' text-anchor='middle' fill='white'>" + c.clue + "</text></svg>";
        const url = 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")';
        gh.style.webkitMaskImage = url; gh.style.maskImage = url;
        const sp = glitchSpot(c); gh.style.left = sp[0] + '%'; gh.style.top = sp[1] + '%';
      }
      const tear = $('cctv-tear');
      tear.style.display = g ? 'block' : 'none';
      if (g) tear.style.top = (20 + (Math.floor(performance.now() / 40) * 37) % 60) + '%';
      $('cctv-label').style.transform = g ? 'translateX(' + (Math.random() * 6 - 3).toFixed(1) + 'px)' : '';
      return;
    }
    $('hud').style.display = '';
    let pitch = input.pitch + S.recoilKick * 0.9 + (shake ? (Math.random() - 0.5) * shake : 0);
    if (shake) { input.yaw += (Math.random() - 0.5) * shake * 0.5; }
    if (player.mode === 'traverse') pitch -= 0.12 * Math.sin(Math.PI * Math.min(1, player.traverse.t / player.traverse.dur));

    if (player.driving) {
      // at the wheel: the camera behind and above, turned with the mouse
      const v = player.driving, cp = Math.cos(pitch), sp = Math.sin(pitch);
      const dir = [-Math.sin(input.yaw) * cp, sp, -Math.cos(input.yaw) * cp];
      const dist = v.kind === 'boat' ? 8.5 : 7.5, o = [v.pos[0], v.pos[1] + (v.kind === 'boat' ? 2.2 : 2.4), v.pos[2]];
      const back = [-dir[0], -dir[1] + 0.25, -dir[2]];
      const hit = level.world.raycast(o, back, dist, (q) => !!q.vehicle);
      const dd = hit ? Math.max(1.2, hit.t - 0.3) : dist;
      px = o[0] + back[0] * dd; py = o[1] + back[1] * dd; pz = o[2] + back[2] * dd;
      for (const k of Object.keys(wview.held)) wview.held[k].enabled = false;
      // (Rhys: "can't see myself") you, in the driver's seat: hips on the seat, feet ahead of them
      const st = v.K.seat, c = Math.cos(v.yaw), sn = Math.sin(v.yaw), fz = st[2] - SEAT.feet;
      const at = [v.pos[0] + st[0] * c + fz * sn, v.pos[1] + st[1] - SEAT.hips + 0.04, v.pos[2] - st[0] * sn + fz * c];
      const live = opr.ready;
      opr.enabled = live; body.enabled = !live;
      if (live) {
        const sst = stateOf(player, arsenal, lastInput); sst.sitting = true; sst.dead = false; sst.mode = 'walk';
        opr.update(dt, sst, at, v.yaw);
        opr.carry = null;
      } else { body.setPosition(at[0], at[1], at[2]); body.setEulerAngles(0, v.yaw * 180 / Math.PI, 0); body.setLocalScale(1, 0.7, 1); }
    } else if (S.third) {
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const dir = [-Math.sin(input.yaw) * cp, sp, -Math.cos(input.yaw) * cp];
      const o = [rp[0], bodyY + 1.6, rp[2]];
      const back = [-dir[0], -dir[1], -dir[2]];
      const hit = level.world.raycast(o, back, 3.4);
      const dist = hit ? Math.max(0.4, hit.t - 0.25) : 3.2;
      px = o[0] + back[0] * dist + Math.cos(input.yaw) * 0.45;
      py = o[1] + back[1] * dist + 0.25;
      pz = o[2] + back[2] * dist - Math.sin(input.yaw) * 0.45;
      // the real operative once it has loaded; the box stand-in until then
      const live = opr.ready;
      opr.enabled = live;
      if (live) {
        const st = stateOf(player, arsenal, lastInput);
        if (S.strike && S.strike.t > 0) { st.strike = S.strike; S.strike.t -= dt; }
        opr.setGoggles(!!loadout.gearTrait('nightSight'));      // your goggles, seen in third person
        opr.update(dt, st, [rp[0], bodyY, rp[2]], input.yaw);
        const held = wview.held[arsenal.current];
        if (held && held.parent !== opr.root) wview.setThird(true, opr);
        opr.carry = held || null;
      }
      body.enabled = !live;
      body.setPosition(rp[0], bodyY, rp[2]);
      body.setEulerAngles(0, input.yaw * 180 / Math.PI, 0);
      body.setLocalScale(1, player.stance === 2 ? 0.34 : player.stance === 1 ? 0.64 : 1, 1);
      const swing = walking ? Math.sin(S.bob) * 0.6 : 0;
      body.parts.legL.setLocalEulerAngles(swing * 50, 0, 0);
      body.parts.legR.setLocalEulerAngles(-swing * 50, 0, 0);
      body.parts.armL.setLocalEulerAngles(-swing * 40, 0, 0);
      body.parts.armR.setLocalEulerAngles(swing * 40, 0, 0);
    } else { body.enabled = false; opr.enabled = false; }

    // keep the camera out of walls, floors and the pool sides
    const eye = [player.pos[0], bodyY + S.eye * 0.8, player.pos[2]];
    const r = 0.14;
    if (level.world.hit([px - r, py - r, pz - r], [px + r, py + r, pz + r])) {
      const d = [eye[0] - px, eye[1] - py, eye[2] - pz];
      const len = Math.hypot(d[0], d[1], d[2]) || 1;
      for (let t = 0.12; t <= 1.0; t += 0.12) {
        const qx = px + d[0] * t, qy = py + d[1] * t, qz = pz + d[2] * t;
        if (!level.world.hit([qx - r, qy - r, qz - r], [qx + r, qy + r, qz + r])) { px = qx; py = qy; pz = qz; break; }
      }
    }
    cam.setPosition(px, py, pz);
    // where your eyes are drawn, in first person: shots start here
    S.viewEye = S.third || player.driving ? null : [px, py, pz];
    cam.setEulerAngles(pitch * 180 / Math.PI, input.yaw * 180 / Math.PI, 0);
    const zoom = inp && inp.aim && arsenal.weapon && arsenal.weapon.zoom ? arsenal.weapon.zoom : 1;
    const wantFov = zoom > 1 ? settings.fov / zoom
      : settings.fov + (player.sprinting ? 7 : 0) - (inp && inp.aim ? 20 : 0);
    S.fov += (wantFov - S.fov) * Math.min(1, dt * 9);
    cam.camera.fov = S.fov;
    // the camera is under water if the eye is below the surface
    const w = level.world.waterColumn(px, pz);
    view.setUnderwater(!!(w && py < w.max[1] && py > w.min[1]));
    $('uw').style.opacity = view.underwater ? 1 : 0;
    tmp.set(px, py, pz);
    view.tick(dt, S.time, tmp);
  }

  // ── footsteps and the parachute ─────────────────────────────────────────────
  // what you are walking on, as far as sound is concerned
  // what a round strikes, for the sound it makes
  function surfaceOf(solid) {
    const t = (solid && solid.tag) || '';
    if (solid && solid.glass) return 'glass';
    if (/metal|grating|rail|cont|ladder|turret/.test(t)) return 'metal';
    if (/wood|crate|board|door/.test(t)) return 'wood';
    return 'generic';
  }
  function surfaceUnder() {
    if (player.mode === 'swim') return 'water';
    const g = level.world.groundBelow(player.pos[0], player.pos[1] + 0.2, player.pos[2], 0.3);
    const s2 = level.world.solids.find((q) => !q.disabled && Math.abs(q.max[1] - g) < 0.06 &&
      player.pos[0] > q.min[0] - 0.3 && player.pos[0] < q.max[0] + 0.3 &&
      player.pos[2] > q.min[2] - 0.3 && player.pos[2] < q.max[2] + 0.3);
    const tag = (s2 && s2.tag) || '';
    if (/grating|metal|rail|ladder|target/.test(tag)) return 'metal';
    if (/crate|board|wood/.test(tag)) return 'wood';
    // floors a level says are carpeted (Meridian House's offices)
    for (const z of level.surfaces || []) {
      if (player.pos[0] >= z.min[0] && player.pos[0] <= z.max[0] && player.pos[2] >= z.min[2] && player.pos[2] <= z.max[2] &&
          player.pos[1] >= z.min[1] - 0.1 && player.pos[1] <= z.max[1]) return z.kind;
    }
    return 'concrete';
  }
  function footsteps(dt) {
    if (player.driving) return;                    // at the wheel: the engine, not your feet
    if (player.mode === 'swim') {
      S.swimT = (S.swimT || 0) + dt;
      if (S.swimT > 0.6 && Math.hypot(player.vel[0], player.vel[2]) > 0.6) { S.swimT = 0; audio.swim(); }
      return;
    }
    if (!player.onGround || player.mode !== 'walk') return;
    const speed = Math.hypot(player.vel[0], player.vel[2]);
    if (speed < 0.6) return;
    S.stepDist = (S.stepDist || 0) + speed * dt;
    const stride = player.sprinting ? 2.1 : player.stance === 2 ? 1.1 : player.stance === 1 ? 1.3 : 1.7;
    if (S.stepDist > stride) { S.stepDist = 0; audio.step(surfaceUnder(), player.sprinting); }
  }
  // the parachute: carried while the gear slot holds the pack and it
  // has not been used this deployment; a canopy over you while it is open
  let canopy = null;
  const makeCanopy = () => {
    const e = new pc.Entity('canopy');
    const mat = new pc.StandardMaterial(); mat.diffuse = new pc.Color(0.22, 0.25, 0.18); mat.cull = pc.CULLFACE_NONE; mat.update();
    const line = new pc.StandardMaterial(); line.diffuse = new pc.Color(0.1, 0.1, 0.1); line.update();
    // seven cells in an arc, wider than it is deep, with lines down to the harness
    for (let i = -3; i <= 3; i++) {
      const a = i * 0.21, c = new pc.Entity();
      c.addComponent('render', { type: 'box', material: mat, castShadows: true });
      c.setLocalPosition(Math.sin(a) * 3.4, Math.cos(a) * 3.4 - 3.4 + 4.3, 0);
      c.setLocalEulerAngles(0, 0, -a * 180 / Math.PI);
      c.setLocalScale(0.74, 0.12, 1.5);
      e.addChild(c);
      for (const zz of [-0.6, 0.6]) {
        const l = new pc.Entity(), top = [Math.sin(a) * 3.4, Math.cos(a) * 3.4 - 3.4 + 4.24, zz], bot = [0, 1.35, 0];
        l.addComponent('render', { type: 'box', material: line, castShadows: false });
        const len = Math.hypot(top[0] - bot[0], top[1] - bot[1], top[2] - bot[2]);
        l.setLocalPosition((top[0] + bot[0]) / 2, (top[1] + bot[1]) / 2, (top[2] + bot[2]) / 2);
        e.addChild(l);
        l.setLocalScale(0.012, 0.012, len);
        // turn the line from the harness up to its cell
        const yawL = Math.atan2(top[0] - bot[0], top[2] - bot[2]) * 180 / Math.PI, pitchL = -Math.atan2(top[1] - bot[1], Math.hypot(top[0] - bot[0], top[2] - bot[2])) * 180 / Math.PI;
        l.setLocalEulerAngles(pitchL, yawL, 0);
      }
    }
    e.enabled = false;
    app.root.addChild(e);
    return e;
  };
  function tickParachute() {
    S.chute = S.chute || { used: false, repack: 0 };
    const hasPack = !!loadout.gearTrait('chute');
    // repacked by hand: hold E, standing still on the ground, with nothing else to use E on
    const still = player.mode === 'walk' && Math.hypot(player.vel[0], player.vel[2]) < 0.3;
    // a hold that began with a press while repacking was on offer: a
    // key the browser never saw let go of (a screenshot taken mid-hold) cannot
    // repack it on its own. Real time, not a sixtieth a frame.
    S.packGrip = S.packGrip || {};
    const holding = packGrip(S.packGrip, input.held('interact') && !TEST || !!S.testHoldE, !!S.repackShown && S.playing && !S.menu && !openCrate);
    const pk = hasPack ? repackChute(S.chute, { holding, still, onGround: player.onGround, open: player.chute }, Math.min(0.1, S.frameDt || 1 / 60)) : null;
    if (pk === 'repacked') { S.chuteMsg = 2.5; audio.burst({ length: 0.25, from: 700, to: 400, gain: 0.12, q: 0.6 }); }
    if (pk === 'packing' && (S.packRustle = (S.packRustle || 0) - 1 / 60) <= 0) { S.packRustle = 0.45 + Math.random() * 0.4; audio.burst({ length: 0.18, from: 2200, to: 900, gain: 0.05, q: 0.5 }); }
    S.repackOffer = hasPack && S.chute.used && player.onGround && !player.chute && still;
    if (S.chuteMsg > 0) S.chuteMsg -= 1 / 60;
    player.chuteRepacking = hasPack && S.chute.used;
    if (!player.chute) player.parachute = hasPack && !S.chute.used;
    if (player.chute && !canopy) canopy = makeCanopy();
    if (canopy) {
      canopy.enabled = !!player.chute;
      if (player.chute) { canopy.setPosition(player.pos[0], player.pos[1], player.pos[2]); canopy.setEulerAngles(0, player.yaw * 180 / Math.PI + 90, 0); }
    }
  }
  function handleEvents() {
    tickParachute();
    for (const ev of player.events) {
      if (ev.type === 'chute') { if (ev.open) { S.chute.used = true; S.chute.repack = 0; audio.burst({ length: 0.5, from: 300, to: 900, gain: 0.25, q: 0.6 }); } else audio.burst({ length: 0.3, from: 500, to: 160, gain: 0.15, q: 0.6 }); }
      if (ev.type === 'dash') { S.dip = 0.06; audio.step(surfaceUnder(), true); }
      if (ev.type === 'land') { S.dip = Math.min(0.28, Math.max(0, (ev.speed - 3) * 0.02)); audio.land(ev.speed); }
      if (ev.type === 'splash') audio.splash(ev.speed > 8);
      if (ev.type === 'jump') audio.step(surfaceUnder(), false);
      if (ev.type === 'vault') audio.vault(false);
      if (ev.type === 'climb' || ev.type === 'over') audio.vault(true);
      // a run-up: two quick footfalls on the wall
      if (ev.type === 'wallkick') { audio.step(surfaceUnder(), true); setTimeout(() => audio.step(surfaceUnder(), true), 110); }
      if (ev.type === 'hurt') { S.hurt = Math.min(1, 0.35 + ev.amount / 40); S.lastHurt = S.time; if (ev.amount > 3) audio.hurt(); buzz(Math.min(120, 30 + ev.amount * 3)); }
      if (ev.type === 'died') {
        audio.died();
        const why = { fell: 'The fall was too much.', drowned: 'You ran out of air.', bitten: 'The dog got you.' }[ev.why] || 'Operative down.';
        $('dead-why').textContent = why;
        // (Rhys: "Battle - autopauses upon death?") a battle: back in shortly - the game goes on, no menu
        if (missionRt && missionRt.youDown && missionRt.youDown()) { showClassPick(); /* back in at your end */ }
        // on a mission, death ends it: the debrief, not a redeploy
        else if (missionRt) { if (document.pointerLockElement) document.exitPointerLock(); missionRt.fail(ev.why === 'fell' ? 'Killed by a fall' : ev.why === 'drowned' ? 'Drowned' : ev.why === 'radiation' ? 'Radiation sickness' : 'Killed in action'); }
        else { if (document.pointerLockElement) document.exitPointerLock(); saveNow(); show('dead', true); }
      }
    }
    player.events.length = 0;
  }

  // ── every frame: the loop ───────────────────────────────────────────
  const DT = 1 / 60;
  const fpsWatch = new FpsWatch();
  const resScaler = new ResScaler();
  // A notice, not a question (Rhys: you have to press Esc to click it,
  // and Esc already opens the menu with the setting in it). Shown once, for
  // eight seconds; the setting row is picked out the next time the menu opens.
  const showLowQ = () => {
    $('lowq').style.display = 'flex'; S.lowqT = 8;
    settings.lowAsked = true; saveSettings(settings);
    const row = $('set-quality') && $('set-quality').closest('.set');
    if (row) row.classList.add('pick');
  };
  const answerLowQ = (yes) => {
    $('lowq').style.display = 'none';
    settings.lowAsked = true;
    if (yes) { settings.quality = 'low'; view.applyQuality('low'); if ($('set-quality')) $('set-quality').value = 'low'; }
    saveSettings(settings);
  };
  let lastInput = null;
  app.on('update', (dt) => {
    const jsStart = performance.now();
    dt = Math.min(dt, 0.1);
    S.time += dt; S.frames++;
    if (S.playing && !S.menu) { playtime += dt; S.saveT = (S.saveT || 0) + dt; if (S.saveT > 20) { S.saveT = 0; saveNow(); } }
    // (Rhys: after Begin, "the framerate jumped right up to over 900 then down to
    // ~200") frames counted against the clock, half a second at a time: the engine's catch-up
    // frames after a stall (a dt of nearly nothing) had read as 1000 fps each
    S.fpsN = (S.fpsN || 0) + 1;
    { const nowMs = performance.now(); if (!S.fpsAt) S.fpsAt = nowMs; if (nowMs - S.fpsAt >= 500) { S.fps = S.fpsN * 1000 / (nowMs - S.fpsAt); S.fpsN = 0; S.fpsAt = nowMs;
      // a frame rate held low: fewer pixels drawn, a step at a time (src/sim/world/perf.js ResScaler)
      if (S.playing && !S.menu && !S.dialog) { if (app.graphicsDevice.maxPixelRatio !== resScaler.ratio) resScaler.reset(app.graphicsDevice.maxPixelRatio, view.ratioFloor); const r = resScaler.sample(S.fps); if (r !== null) app.graphicsDevice.maxPixelRatio = r; }
    } }
    if (!missionRt && S.kickMsg > 0) S.kickMsg -= dt;
    if (S.noteT > 0) S.noteT -= dt;
    // flares burn out; the Pilot's Auto-Repair mends what he drives
    if (S.flares) S.flares = S.flares.filter((f) => { f.left -= dt; f.e.light.intensity = 2.2 * Math.min(1, f.left / 3) * (0.9 + Math.random() * 0.2); if (f.left > 0) return true; f.e.destroy(); return false; });
    { const ar = loadout.gearTrait('autoRepair'), v = player.driving; if (ar && v && !v.wrecked) v.hp = Math.min(v.maxHp || v.hp, v.hp + (v.maxHp || 400) * ar * dt); }    // "It held" wears off (it stayed up for ever outside Level 0)
    // a struggling frame rate: offer Low Quality, once (src/sim/world/perf.js)
    if (!TEST && fpsWatch.step(dt, { quality: settings.quality, paused: !S.playing || S.menu || !!openCrate, asked: settings.lowAsked })) showLowQ();
    if (S.lowqT > 0 && (S.lowqT -= dt) <= 0) $('lowq').style.display = 'none';
    S.hurt = Math.max(0, S.hurt - dt * 1.6);
    const active = S.playing && !S.menu && !openCrate && !S.dialog && !S.transport && (input.locked || TEST) && player.mode !== 'dead';
    input.enabled = active;
    if (active && !TEST) {
      const inp = input.frame();
      // ignore an absurd mouse jump (entering the window can report one)
      if (S.lastYaw !== undefined && Math.abs(inp.yaw - S.lastYaw) > 2.2) { input.yaw = S.lastYaw; inp.yaw = S.lastYaw; }
      // (M6.40; the roadmap's "camera follows movement") on a touch screen, walking sideways with the stick the view
      // eases round towards where you are going - unless you have looked in the last second (Settings: Touch: turn with the stick)
      if (touch && settings.touchTurn !== false && input.touchMove && inp.moveZ >= -0.2 && Math.abs(inp.moveX) > 0.25 && !inp.aim &&
          performance.now() - (input.lastLook || 0) > 1000 && player.mode === 'walk') {
        input.yaw -= inp.moveX * 1.1 * dt; inp.yaw = input.yaw;
      }
      // A tap must never be lost: if this frame runs no simulation step (a very
      // short frame), the press waits for the next one.
      for (const k of ['jumpPressed', 'crouchPressed', 'sprintPressed', 'interactPressed', 'visionPressed', 'firePressed', 'bashPressed', 'detonatePressed']) {
        if (S.pend[k]) { inp[k] = true; S.pend[k] = false; }
      }
      input.frameAim = inp.aim;
      // working a safe's dial: the mouse (or A and D) turns it, E
      // sets each number, a step away stops; you stand still meanwhile
      if (S.cracking) {
        const sf = S.cracking, sd = sf.safe, NOTCH = 0.12;
        let turn = 0;
        while (input.yaw <= S.crackYaw - NOTCH) { S.crackYaw -= NOTCH; turn++; }    // mouse right: clockwise, up
        while (input.yaw >= S.crackYaw + NOTCH) { S.crackYaw += NOTCH; turn--; }
        if (inp.strafePressed === 'right') turn++;
        if (inp.strafePressed === 'left') turn--;
        for (let i = 0; i < Math.abs(turn); i++) sd.turn(Math.sign(turn));
        for (const ev of sd.events.splice(0)) if (ev.type === 'click') audio.tumbler(ev.on);
        if (inp.interactPressed) {
          const r = sd.set();
          if (r === 'open') { audio.confirm(); audio.door(true); S.cracking = null; }
          else if (r === 'wrong') { audio.deny(); S.safeMsg = 1.6; }
          else audio.click();
        }
        if (inp.moveZ || inp.jumpPressed || inp.fire) S.cracking = null;
        // the view stays put; you do not walk off
        input.yaw = S.crackYaw; inp.yaw = S.crackYaw;
        inp.moveX = 0; inp.moveZ = 0; inp.interactPressed = false; inp.firePressed = false; inp.fire = false; inp.jumpPressed = false; inp.strafePressed = null;
        if (!S.cracking) { $('safe-ui') && ($('safe-ui').style.display = 'none'); }
      }
      if (S.reading && !noteNear()) S.reading = null;
      // V: vision modes (Rhys: night vision, thermal, UV, EMF, normal) - only
      // normal exists yet. First or third person is in Settings now.
      if (inp.visionPressed) {
        // vision modes: normal and night vision so far. Night vision
        // needs goggles in the gear slot (Rhys)
        // and thermal, UV and EMF: V steps through whichever the gear slot gives, then normal
        const modes = ['normal'].concat(loadout.gearTrait('nightSight') ? ['night'] : [], loadout.gearTrait('heatSight') ? ['thermal'] : [], loadout.gearTrait('uvSight') ? ['uv'] : [], loadout.gearTrait('emfSight') ? ['emf'] : []);
        if (modes.length < 2) S.visionNo = true;
        else { S.vision = modes[(modes.indexOf(S.vision) + 1) % modes.length]; S.visionNo = false; }
        audio.click();
        S.visionMsg = 1.8;
        // a weapon slung on a ladder in third person comes back to hand in first
        if (!S.third && opr.carry) { opr.carry.enabled = true; opr.carry = null; }
      }
      if (inp.slotPressed) arsenal.selectSlot(inp.slotPressed);
      // (Rhys's Heavy: "lock-on to nearby enemy vehicles with the KD-MR3 ... highly effective
      // but very limited range") aiming a launcher, with Vehicle Targeting: the vehicle nearest the
      // middle of the sight, within range and a few degrees, is locked on to
      {
        const reach = loadout.gearTrait('lockOn');
        const wl = arsenal.weapon;
        let best = null, bestA = 0.1;
        if (reach && wl && wl.launcher && inp.aim) {
          const e = shotEye(), d = aimDir();
          for (const v of level.world.vehicles || []) {
            if (v.wrecked || v === player.driving) continue;
            const to = [v.pos[0] - e[0], v.pos[1] + 0.8 - e[1], v.pos[2] - e[2]], dist = Math.hypot(to[0], to[1], to[2]);
            if (dist > reach || dist < 3) continue;
            const ang = Math.acos(Math.max(-1, Math.min(1, (to[0] * d[0] + to[1] * d[1] + to[2] * d[2]) / dist)));
            if (ang < bestA) { bestA = ang; best = v; }
          }
        }
        if (best && best !== S.lock) audio.click();
        S.lock = best;
      }
      // the radar: M steps close -> normal -> wide -> off -> close; , and . zoom
      // aiming down a variable sight: , and . step it in and out, not the radar
      if (inp.aim && (inp.mapInPressed || inp.mapOutPressed) && arsenal.stepZoom(inp.mapInPressed ? 1 : -1)) { inp.mapInPressed = inp.mapOutPressed = false; }
      if (inp.mapPressed || inp.mapInPressed || inp.mapOutPressed) {
        let z = settings.mapZoom === undefined ? 1 : settings.mapZoom;
        if (inp.mapPressed) {
          if (!settings.map) { settings.map = true; z = 0; }
          else if (z < RADAR_RANGES.length - 1) z++;
          else settings.map = false;
        } else {
          settings.map = true;
          z = Math.max(0, Math.min(RADAR_RANGES.length - 1, z + (inp.mapOutPressed ? 1 : -1)));
        }
        settings.mapZoom = z; saveSettings(settings); S.mapT = 1;
        $('map-wrap').style.display = settings.map ? 'block' : 'none';
      }
      // (M6.52) a whistle: a little noise where you are - the nearest of them who hears it comes to look (once in
      // three seconds; not much use once they are already after you)
      if (inp.whistlePressed && (S.whistleT || 0) <= S.time && player.mode !== 'dead') {
        S.whistleT = S.time + 3; audio.whistle();
        if (missionRt && missionRt.hear) missionRt.hear({ type: 'lure', pos: player.pos.slice(), noise: 0.45 });
      }
      // (M6.49) the mission map: B (or PLAN) shows the floor plan of where you are
      if (inp.planPressed) {
        if (!level.plan) { S.noteText = 'No map of this place'; S.noteT = 2; }
        else { S.plan = !S.plan; audio.click(); }
      }
      const cctv = level.cctv;
      // back to your own eyes, facing the way you were before you sat down
      const stopCctv = () => {
        S.cctv = null; S.snakeCam = null; $('cctv').style.display = 'none';
        if (!S.third) wview.setThird(false);              // the weapon back from the body to your view
        if (S.cctvHome) { input.yaw = S.cctvHome.yaw; input.pitch = S.cctvHome.pitch; player.yaw = input.yaw; S.cctvHome = null; }
      };
      if ((S.cctv != null || S.snakeCam) && (inp.moveX || inp.moveZ || inp.jumpPressed || inp.fire)) stopCctv();
      // (M6.30) the remote cameras: E steps on to the next, and past the last back to your own eyes
      const viewRemote = (i) => {
        const cams = level.remoteCams || [];
        if (i >= cams.length) { stopCctv(); return; }
        if (!S.snakeCam) { S.cctvHome = { yaw: input.yaw, pitch: input.pitch }; S.cctvRef = { yaw: input.yaw, pitch: input.pitch }; }
        S.snakeCam = cams[i]; S.remoteI = i;
        $('cctv').style.display = 'block'; $('cctv-label').textContent = cams[i].label.toUpperCase() + '   (' + (i + 1) + ' / ' + cams.length + ')   E next, move to stop';
        audio.confirm();
      };
      if (inp.interactPressed && S.snakeCam && S.snakeCam.label && /^Remote/.test(S.snakeCam.label)) viewRemote((S.remoteI || 0) + 1);
      else if (inp.interactPressed && S.snakeCam) { stopCctv(); audio.confirm(); }
      else if (inp.interactPressed && cctv && cctv.cameras.length && (S.cctv != null ||
          atAConsole(cctv))) {
        if (S.cctv == null) S.cctvHome = { yaw: input.yaw, pitch: input.pitch };
        S.cctv = S.cctv == null ? 0 : S.cctv + 1;
        S.cctvRef = { yaw: input.yaw, pitch: input.pitch };          // the mouse turns each camera from where it points
        if (S.cctv >= cctv.cameras.length) stopCctv();
        else { $('cctv').style.display = 'block'; $('cctv-label').textContent = cctv.cameras[S.cctv].label.toUpperCase() + '   (' + (S.cctv + 1) + ' / ' + cctv.cameras.length + ')'; }
        audio.confirm();
      } else if (inp.interactPressed && level.extract && !S.transport &&
          Math.hypot(level.extract.pos[0] - player.pos[0], level.extract.pos[2] - player.pos[2]) < 2.4) {
        // press E: the screen goes dark first; you are moved only once it is
        // black, and it comes back up in the yard
        audio.confirm();
        S.transport = { t: 0, moved: false, to: 'yard' };
      } else if (inp.interactPressed && level.courseEntry && !S.transport &&
          Math.abs(player.pos[1] - (level.courseEntry.pos[1] || 0)) < 1.5 &&
          Math.hypot(level.courseEntry.pos[0] - player.pos[0], level.courseEntry.pos[2] - player.pos[2]) < 2.4) {
        audio.confirm();
        S.transport = { t: 0, moved: false, to: 'course' };
      } else if (inp.interactPressed && hqUse()) {
        // Ghost HQ: the operations table, the trophy cabinet
      } else if (inp.interactPressed && vehicleUse()) {
        // in at the wheel, or out
      } else if (inp.interactPressed && keyUse()) {
        // a key, a door it opens, the lift's emergency stop
      } else if (inp.interactPressed && liftUse()) {
        // a floor's button in the lift, or the call button on a landing
      } else if (inp.interactPressed && missionRt && missionRt.interact()) {
        // the mission took it: a keycard, a locked door, the van
      } else if (inp.interactPressed) {
        const ch = arsenal.chargeNear(player.pos, 1.8);
        const d = !ch && doorNear();
        const sd = !ch && !d && swingDoorNear();
        if (ch) arsenal.disarm(ch, player);
        // (M6.30) Q's snake camera: crouched at a shut door, E slides it under - a look at the other side
        else if (sd && !sd.open && player.stance > 0 && loadout.gearTrait('snakeCam')) {
          const c = sd.centre, n = sd.n, side = Math.sign(c[n] - player.pos[n]) || 1;
          const pos = c.slice(); pos[n] += side * 0.3; pos[1] = sd.def.y0 + 0.12;
          const look = pos.slice(); look[n] += side * 6; look[1] = sd.def.y0 + 0.9;
          S.snakeCam = { pos, look, label: 'Snake camera - under the door' };
          S.cctvHome = { yaw: input.yaw, pitch: input.pitch }; S.cctvRef = { yaw: input.yaw, pitch: input.pitch };
          $('cctv').style.display = 'block'; $('cctv-label').textContent = 'SNAKE CAMERA  -  UNDER THE DOOR   (E, or move, to stop)';
          audio.confirm();
        }
        else if (sd) {
          const b = player.box();
          const r = sd.use(player.pos, b);
          if (r === 'blocked') { audio.deny(); S.doorMsg = 1.2; } else audio.door(r === 'opened');
          // walking in (standing): both leaves of a double door go together;
          // sneaking (crouched or prone): only the one you chose
          if (sd.def.pair && player.stance === 0 && (r === 'opened' || r === 'shut')) {
            for (const o of level.swingDoors) if (o !== sd && o.def.pair === sd.def.pair && !o.blown && o.open !== sd.open) o.use(player.pos, b);
          }
          // opened: a one-way door pulled towards you - a step back
          // out of its swing; and keep E held to slip on through and shut it
          if (r === 'opened') {
            const pair = sd.def.pair ? level.swingDoors.filter((o) => o !== sd && o.def.pair === sd.def.pair && o.open) : [];
            const back = sd.stepClear(player.pos, 0.3);
            S.doorMove = new DoorMove(sd, pair, back && player.free(back, player.h) ? back : null);
          }
        } else if (d) {
          for (const s of level.world.solids) if (s.tag === d || s.tag === d + '_top') s.disabled = true;
          syncDoors(); audio.confirm();
        } else { const c = crateNear(); if (c) showCrate(c); else if ((level.remoteCams || []).length) viewRemote(0); }
      }
      if (inp.reloadPressed) arsenal.reload();
      if (inp.firemodePressed) arsenal.cycleMode();
      // firing: a single press for everything except the rifle, which holds
      // a burst, once begun, fires its rounds by itself
      const wantFire = arsenal.burstLeft > 0 || (arsenal.autoNow ? inp.fire : inp.firePressed);
      // F at a shut door on a mission is a kick; anywhere else, a strike
      if (inp.bashPressed) { if (!((missionRt && missionRt.kick()) || (!MISSION && kickDoor()))) arsenal.bash(player.eyePos, aimDir()); }
      else if (wantFire && player.mode !== 'dead' && player.mode !== 'traverse') {
        const moving = Math.hypot(player.vel[0], player.vel[2]) > 1.2 || !player.onGround;
        arsenal.fire(shotEye(), aimDir(), { aim: inp.aim, moving, on: player, fresh: !!inp.firePressed, lock: S.lock || null });
      }
      // X (eXplode) with a charge in hand: set off every one of them you have placed
      // (Rhys: on a Chromebook right-click is Alt, so it zoomed and set
      // them off together - it was M6.9.13's right mouse)
      const w0 = arsenal.weapon;
      if (inp.detonatePressed && w0 && w0.kind === 'placeable') arsenal.detonateAll();
      // Z and X: what is in utility slots 1 and 2, used without switching to it
      S.quick = S.quick || {};
      if (S.quickTipT > 0) S.quickTipT -= dt;
      for (const [n, slot] of [[1, 'utility1'], [2, 'utility2']]) {
        const st = S.quick[slot] = S.quick[slot] || {};
        const qk = loadout.keyOf(slot), qw = qk && arsenal.def(qk);
        const holdable = !!(qw && qw.kind === 'placeable' && arsenal.liveCharges(qk).length);
        const act = quickKey(st, input.held('use' + n) && !TEST && player.mode !== 'dead' && player.mode !== 'traverse', dt, holdable);
        if (act) { const r = arsenal.quickUse(slot, shotEye(), aimDir(), { aim: inp.aim, on: player, player }, act); if (r && r.placed) { S.quickTipT = 5; S.quickTipSlot = slot; } }
      }
      if (inp.debugPressed) S.debug = !S.debug;
      S.acc += dt * (missionRt ? missionRt.timeScale() : 1);     // bullet time: less time, same steps
      S.missionT = (S.missionT || 0) + dt;                       // the mission's clock: runs while you play
      let steps = 0;
      while (S.acc >= DT && steps < 8) {
        S.prevPos = player.pos.slice();
        if (level.lift) {
          // the car carries whoever stands in it (the floor coming up would not)
          const riding = level.lift.carries(player.pos);
          // hostages ride it too, and keep its doors from shutting on them
          const hs = (level.hostages || []).filter((h) => h.alive && h.state !== 'rescued');
          const hRide = hs.filter((h) => level.lift.carries(h.pos));
          holdLiftFor(level.lift, hs, player.pos);
          const dy = level.lift.step(DT, [player.box()].concat(hs.map((h) => h.box())));
          if (riding && dy) player.pos[1] += dy;
          if (dy) for (const h of hRide) { h.pos[1] += dy; h.rodeLift = true; h.moveBody(); }
        }
        // a step back from a door you pulled, or slipping through one
        if (S.doorMove) {
          const dm = S.doorMove;
          const res = dm.step(DT, player, input.held('interact') && !TEST || !!S.testHoldE);
          if (res === 'through') { S.doorMove = null; }
          else if (res) S.doorMove = null;
          else if (dm.moving) { inp.moveX = 0; inp.moveZ = 0; inp.jumpPressed = false; inp.sprint = false; }
        }
        // at the wheel: W/S throttle (and reverse), A/D steer, SPACE the brake
        if (player.driving) {
          if (player.mode === 'dead') { player.driving.driver = null; player.driving.solid.ghost = false; player.driving = null; }
          else {
            const v = player.driving, y0 = v.yaw;
            v.step(DT, { throttle: inp.moveZ || 0, steer: inp.moveX || 0, brake: !!inp.jump });
            // (Rhys: "very difficult to aim a weapon AND steer") the view turns with the boat - unless you
            // are aiming (right mouse): then it holds where you point it, whatever the boat does; and with the
            // mouse left alone a moment it comes round behind the boat again
            if (!inp.aim) {
              input.yaw += v.yaw - y0;
              if (performance.now() - (input.lastLook || 0) > 1500 && Math.abs(v.speed) > 2) {
                let d = v.yaw - input.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
                input.yaw += d * Math.min(1, DT * 1.2);
              }
            }
          }
        }
        applyLoad();                              // crates, pick-ups and drops change it
        // (M6.30) Q's grappling line: aiming, the jump key fires it at what you aim at - and up you go
        if (inp.aim && inp.jumpPressed && player.mode === 'walk' && loadout.gearTrait('grapple')) {
          const t = player.grappleTarget(aimDir(), 20);
          if (t) { player.grapple(t); inp.jumpPressed = false; audio.lockOn && audio.lockOn(); }
          else { S.noteText = 'The grapple needs a ledge or a roof edge above you, within 20 m'; S.noteT = 1.5; inp.jumpPressed = false; }
        }
        player.step(DT, inp);
        // one-off presses count once, not once per catch-up step
        inp.jumpPressed = false; inp.firePressed = false;
        inp.crouchPressed = false; inp.sprintPressed = false; inp.bashPressed = false;
        inp.interactPressed = false; inp.visionPressed = false;
        S.acc -= DT; steps++;
      }
      if (steps === 8) S.acc = 0;
      if (steps === 0) {
        for (const k of ['jumpPressed', 'crouchPressed', 'sprintPressed', 'interactPressed', 'visionPressed', 'firePressed']) {
          if (inp[k]) S.pend[k] = true;
        }
      }
      S.alpha = Math.min(1, S.acc / DT);
      lastInput = inp;
    } else if (!TEST) {
      input.frame();   // swallow stray input while paused
    }
    // the ranges and turrets run whenever you are playing - course or not -
    // and hold still while you are not
    if (active) S.rangeT = (S.rangeT || 0) + dt;
    stepRanges(level, player, arsenal, active ? dt : 0, S.rangeT || 0);
    S.aimNow = { aim: !!(lastInput && lastInput.aim), dir: aimDir() };      // for the Yellows: is a gun held on them?
    // (M6.63) marking: aim at one of theirs for a second and he is marked - on your radar wherever he goes, as a
    // tracker would have him (not one who is already down, nor a Yellow or one of the staff)
    if (S.playing && !S.menu && lastInput && lastInput.aim && level.guards && level.guards.length) {
      const h = level.world.raycast(player.eyePos, S.aimNow.dir, 70, (q) => q.glass || q.shootThrough);
      const g = h && h.solid && h.solid.target && h.solid.target.guard;
      if (g && !g.dead && !g.tracked && g.faction !== 'yellow' && g.faction !== 'staff' && !g.neutral && g.side !== 'ally') {
        if (S.markG !== g) { S.markG = g; S.markT = 0; }
        S.markT += dt;
        if (S.markT > 0.9) { g.tracked = true; S.markG = null; S.noteText = 'Marked: ' + (g.name || 'he') + ' is on your radar now'; S.noteT = 1.6; audio.click(); }
      } else S.markG = null;
    } else S.markG = null;
    if (missionRt) missionRt.tick(dt, active ? dt * missionRt.timeScale() : 0, active);
    if (hqSec) {
      if (hqSec.pending && S.playing && !S.menu) { hqSec.start(hqSec.pending); hqSec.pending = null; }
      hqSec.tick(active ? dt : 0, (input.held('interact') && !TEST) || !!S.testHoldE);
    }
    // picking a lock: E held at it, with the lockpicks (quiet; a kick is not)
    {
      const d = active && !MISSION && loadout.gearTrait('picks') ? swingDoorNear() : null;
      if (pickable(d) && ((input.held('interact') && !TEST) || !!S.testHoldE)) {
        S.pickT = (S.pickT || 0) + dt * ((player.skills && player.skills.hacker) || 1);
        if (S.pickT >= PICK_SECS) { d.unlock(); S.pickT = 0; audio.confirm(); S.noteText = 'Picked - the door is unlocked, and nobody heard a thing'; S.noteT = 2.5; }
      } else S.pickT = 0;
    }
    if (course) {
      const was = course.text;
      if (course.section === 'movement' && player.pos[2] > 10) course.skipSection('movement');
      course.update(player, arsenal, dt);
      if (course.text !== was) { showStep(); syncDoors(); audio.stepDone(); }
      const tracking = (level.turrets || []).some((t) => !t.down && t.turret && t.turret.canSee);
      if (tracking !== S.turretSeen) { S.turretSeen = tracking; audio.turretTrack(tracking); if (tracking) audio.lockOn(); }
      if (course.done) endCourse(false);
      course.events.length = 0;
    }
    if (active) footsteps(dt);
    if ((S.vision === 'night' && !loadout.gearTrait('nightSight')) || (S.vision === 'thermal' && !loadout.gearTrait('heatSight')) || (S.vision === 'uv' && !loadout.gearTrait('uvSight')) || (S.vision === 'emf' && !loadout.gearTrait('emfSight'))) S.vision = 'normal';   // goggles swapped out at a crate
    arsenal.gogglesDown = S.vision === 'night';
    arsenal.step(dt * (missionRt ? missionRt.timeScale() : 1), player);
    hitMark = Math.max(0, hitMark - dt * 3);
    for (const ev of arsenal.events) {
      if (ev.type === 'blast') { if (missionRt && MISSION) missionRt.onBlast(ev); else blastDoors(ev); }
      // the breaching shotgun's round at a door: as a charge, without the bang's damage
      if (ev.type === 'breachShot') { const b = { breach: true, pos: ev.pos }; if (missionRt && MISSION) missionRt.onBlast(b); else blastDoors(b); }
      if (missionRt && (ev.type === 'shot' || ev.type === 'blast' || ev.type === 'bash' || ev.type === 'lure')) missionRt.hear(ev);
      // a lure chirps where it lies; glassware a round passes through shatters and rings
      // (M6.30) a remote camera, come to rest: one more to look through
      if (ev.type === 'rcam') {
        const a = ev.aim, l = Math.hypot(a[0], a[2]) || 1, pos = [ev.pos[0], ev.pos[1] + 0.15, ev.pos[2]];
        (level.remoteCams = level.remoteCams || []).push({ pos, look: [pos[0] + a[0] / l * 8, pos[1] - 0.4, pos[2] + a[2] / l * 8], label: 'Remote camera ' + (level.remoteCams.length + 1) });
        S.noteText = 'Remote camera placed - E (with nothing else at hand) looks through it'; S.noteT = 3; audio.confirm();
      }
      // (M6.29) a tracker: on a man, he is on your radar for good; on the ground, all round it for two minutes
      if (ev.type === 'tracker') {
        const who = ev.on && ev.on.guard;
        if (who) { who.tracked = true; S.noteText = 'Tracker on him: he is on your radar wherever he goes'; }
        else { (level.trackers = level.trackers || []).push({ pos: ev.pos.slice(), until: S.time + 120 }); S.noteText = 'Tracker placed: anyone within 12 m of it shows on your radar'; }
        S.noteT = 3; audio.confirm();
      }
      if (ev.type === 'lure') audio.lure(Math.hypot(ev.pos[0] - player.pos[0], ev.pos[1] - player.pos[1], ev.pos[2] - player.pos[2]));
      // (M6.33) a window pane a round goes through: ordinary glass shatters, toughened at its third - and the noise
      if (ev.type === 'pierce' && ev.solid && ev.solid.pane && !ev.solid.pane.hidden) {
        const pn = ev.solid.pane, dist = Math.hypot(ev.point[0] - player.pos[0], ev.point[2] - player.pos[2]);
        pn.hits++;
        if (pn.hits >= pn.takes) {
          pn.hidden = true; ev.solid.disabled = true;
          audio.glassware(dist); audio.glassware(dist * 0.6);
          if (missionRt && MISSION) missionRt.hear({ type: 'lure', pos: pn.pos, noise: 0.9 });
          shards(pn.pos);
        } else audio.glassware(dist);
      }
      if (ev.type === 'pierce' && ev.solid && ev.solid.glassware) audio.glassware(Math.hypot(ev.point[0] - player.pos[0], ev.point[2] - player.pos[2]));
      if (missionRt && ev.type === 'shot') missionRt.fired(ev);
      if (ev.type === 'shot') { buzz(10); audio.shot(arsenal.weapon); if (ev.hit) { if (ev.hit.target) audio.hitFlesh(); else audio.hitHard(ev.hit.dist, surfaceOf(ev.hit.solid)); } }
      // a blow that lands: a punch or a butt thuds; a knife slices
      if ((ev.type === 'swing' || ev.type === 'bash') && ev.hit && ev.hit.target) {
        if (ev.type === 'swing' && !ev.fists) audio.knife(true); else audio.punch();
      }
      if (ev.type === 'draw' && arsenal.weapon && arsenal.weapon.kind === 'melee') audio.drawKnife();
      if (ev.type === 'empty') audio.dryFire();
      if (ev.type === 'firemode') audio.click();
      if (ev.type === 'reload') audio.reload('start');
      if (ev.type === 'reloaded' || ev.type === 'autoreload') audio.reload('done');
      if (ev.type === 'roundIn') audio.roundIn();                 // a round into the revolver's cylinder
      if (ev.type === 'bash' || ev.type === 'swing') {
        audio.bash();
        // and the body strikes, in third person: fists punch, a knife slashes,
        // a gun is swung as a hook
        const w = arsenal.weapon;
        const kind = ev.fists || !w ? 'punch' : w.kind === 'melee' ? 'knife' : ev.type === 'bash' ? 'bash' : 'knife';
        S.strike = { kind, n: ((S.strike && S.strike.n) || 0) + 1, t: 0.55 };
      }
      if (ev.type === 'throw') audio.throwArc();
      // a flare: a light where it fell, for as long as it burns
      if (ev.type === 'flare') {
        const fe = new pc.Entity('flare');
        fe.addComponent('light', { type: 'omni', color: new pc.Color(1, 0.86, 0.72), intensity: 2.2, range: 22, castShadows: false, affectDynamic: true, affectLightmapped: true });
        fe.setPosition(ev.pos[0], ev.pos[1] + 0.6, ev.pos[2]);
        app.root.addChild(fe);
        S.flares = (S.flares || []).concat([{ e: fe, left: ev.secs || 30 }]);
      }
      if (ev.type === 'noVehicle') { S.noteText = 'No damaged vehicle near enough to mend'; S.noteT = 2; audio.deny(); }
      if (ev.type === 'repair') { audio.confirm(); S.noteText = 'Mending it... ' + Math.round(ev.vehicle.hp / (ev.vehicle.maxHp || ev.vehicle.hp) * 100) + '%'; S.noteT = 2.5; }
      if (ev.type === 'zoomStep') { S.noteText = 'Scope ' + ev.zoom + 'x'; S.noteT = 1.2; audio.click(); }
      if (ev.type === 'stuck') audio.bounce();
      if (ev.type === 'beam') wview.showBeam(ev.from, ev.to);
      if (ev.type === 'flames' && !(ev.you && !S.third)) wview.addBlast({ pos: ev.pos, radius: 1.1, smoke: 0.9, gas: 'fire', damage: 0 });
      if (ev.type === 'overheat') { audio.deny(); S.noteText = 'Overheated  -  it has to cool'; S.noteT = 1.5; }
      if (ev.type === 'cooled' || ev.type === 'vent') audio.click();
      if (ev.type === 'bounce') audio.bounce();
      if (ev.type === 'aid' || ev.type === 'found' || ev.type === 'ammo') audio.pickup();
      if (ev.type === 'placed' || ev.type === 'disarmed') audio.confirm();
      if (ev.type === 'pouchFull') audio.deny();
      if (ev.type === 'armed' || ev.type === 'tripped') audio.click();
      if (ev.type === 'draw') audio.click();
      if (ev.type === 'turret') audio.turretShot();
      if (ev.type === 'shot') {
        wview.onShot(arsenal.weapon && arsenal.weapon.recoil ? Math.max(1, arsenal.weapon.recoil / 0.03) : 1);
        S.recoilKick = (S.recoilKick || 0) + arsenal.weapon.recoil * 0.45;
        S.recoilPull = (S.recoilPull || 0) + (arsenal.weapon.pull || 0) * arsenal.weapon.recoil * 0.5;
        if (ev.hit && ev.hit.solid) wview.addMark(ev.hit.point, ev.hit.solid, ev.dir);
      }
      if (ev.type === 'pellet' && ev.hit && ev.hit.solid && !ev.hit.target) wview.addMark(ev.hit.point, ev.hit.solid, ev.dir);   // a shotgun's other pellets
      if (ev.type === 'swing') wview.onSwing();
      if (ev.type === 'target') { hitMark = 1; if (ev.killed) { score += ev.target.score; audio.targetDown(); } }
      if (ev.type === 'blast') {
        // an EMP: night vision, torches, turrets and engines out a while, in its reach
        if (ev.emp) {
          const hit = empPulse(ev.pos, { guards: level.guards || [], turrets: level.turrets || [], vehicles: level.world.vehicles || [], devices: level.liveDevices || [] });
          if (hit.guards + hit.turrets + hit.vehicles + (hit.cameras || 0) + (hit.lights || 0) + (hit.alarm || 0) + (hit.locks || 0)) { S.noteT = 3; S.noteText = 'EMP: ' + [hit.guards && hit.guards + ' night vision or torches', hit.cameras && hit.cameras + ' cameras', hit.turrets && hit.turrets + ' turrets', hit.vehicles && hit.vehicles + ' engines', hit.lights && 'the lights', hit.alarm && 'the alarm'].filter(Boolean).join(', ') + ' out for ' + EMP.secs + ' s' + (hit.locks ? '; ' + (hit.locks === 1 ? 'a maglock' : hit.locks + ' maglocks') + ' burnt out - open for good' : ''); }
        }
        wview.onBlast(ev.flash ? 0.4 : 1); wview.addBlast(ev); if (ev.flash) blindFlash = 1;
        audio.blast(Math.hypot(ev.pos[0] - player.pos[0], ev.pos[1] - player.pos[1], ev.pos[2] - player.pos[2]), ev.flash);
      }
    }
    arsenal.events.length = 0;
    // through the sight: a scope's reticle filling the view, or a red dot
    const sk = !S.third && lastInput && lastInput.aim && player.mode !== 'dead' ? scopeKind(arsenal.weapon) : 'none';
    const zoomNow = (arsenal.weapon && arsenal.weapon.zoom) || 1;
    const scoped = (sk === 'cross' || sk === 'chevron') && S.fov < settings.fov / zoomNow * 1.25;
    drawScope(scoped ? sk : sk === 'dot' ? 'dot' : 'none');
    wview.tick(dt, {
      scoped,
      aim: !!(lastInput && lastInput.aim), turn: [input.yaw - (S.lastYaw || input.yaw), input.pitch - (S.lastPitch || input.pitch)],
      bob: S.bobAmp * 40, bobPhase: S.bob,
    });
    S.lastYaw = input.yaw; S.lastPitch = input.pitch;
    // the map and compass, a few times a second
    S.musicT = (S.musicT || 0) + dt;
    if (S.musicT > 1.5) {
      S.musicT = 0;
      const underFire = (level.turrets || []).some((t) => !t.down && t.turret && t.turret.firing) ||
        (S.time - (S.lastHurt || -99) < 6);
      // pausing does not change the music: only leaving for the title does
      const onTitle = getComputedStyle($('title')).display !== 'none';
      music.play(pickTrack({ playing: S.playing && !onTitle, dead: player.mode === 'dead',
        section: course && !course.done ? course.section : null, underFire }));
    }
    S.mapT = (S.mapT || 0) + dt;
    // What you know is kept up to date whether the radar is showing or not:
    // turning it on should not reveal anything you had not noticed.
    if (S.mapT > 0.12) {
      const since = Math.min(S.mapT, 1);
      S.mapT = 0;
      const step = course && course.step;
      const zone = step && step.zone;
      // hostiles: standing targets and turrets count as enemies until there are real ones
      const me = { eye: player.eyePos, yaw: input.yaw };
      const found = [];
      (level.world.targets || []).forEach((t, i) => {
        if (t.device) return;          // a camera or turret: on the radar as a device, below
        if (t.down || (t.guard && t.guard.dormant) || (t.hostage && (t.hostage.state === 'dead' || t.hostage.state === 'rescued'))) { tracker.forget('t' + i); return; }
        // the guard rota from a hacked terminal: every red on the radar while it lasts
        const tracked = t.guard && !t.guard.dead && (t.guard.tracked || (level.trackers || []).some((k) => k.until > S.time && Math.hypot(k.pos[0] - t.centre[0], k.pos[1] - t.centre[1], k.pos[2] - t.centre[2]) < 12));
        const how = sense(level.world, me, { pos: t.centre, solid: t.solid, loud: t.turret && t.turret.firing ? 1 : 0 }) || (tracked ? 'intel' : null) ||
          (level.revealT > 0 && t.guard && t.guard.faction === 'red' && !t.guard.dead ? 'intel' : null);
        // a hostage is a friend on the radar, not an enemy
        if (how) found.push({ id: 't' + i, kind: t.hostage || (t.guard && t.guard.side === 'ally') ? 'ally' : t.guard && t.guard.neutral ? 'neutral' : 'enemy', pos: t.centre, how, state: t.guard ? t.guard.state : null });
      });
      if (level.revealT > 0) level.revealT -= since;
      tracker.update(since, found);
      if (settings.map) {
        const range = RADAR_RANGES[settings.mapZoom === undefined ? 1 : settings.mapZoom] || Minimap.MAP_RANGE;
        const contacts = [];
        for (const k of tracker.list()) contacts.push({ kind: k.kind, pos: k.pos, how: k.how, state: k.state, live: k.live, fade: fade(k) });
        // Ghost's own kit is on the plan: crates are always known
        for (const c of level.crates || []) {
          const d = Math.hypot(c.pos[0] - player.pos[0], c.pos[2] - player.pos[2]);
          if (d < range) contacts.push({ kind: 'interest', pos: c.pos, live: true });
        }
        // (M6.29) your trackers on the ground
        for (const k of level.trackers || []) if (k.until > S.time && Math.hypot(k.pos[0] - player.pos[0], k.pos[2] - player.pos[2]) < range) contacts.push({ kind: 'interest', pos: k.pos, live: true });
        // (M6.28) the defence systems you know of: their colour whose they are, their shape what
        for (const d of level.liveDevices || []) {
          if (!d.known || Math.hypot(d.pos[0] - player.pos[0], d.pos[2] - player.pos[2]) >= range) continue;
          contacts.push({ kind: 'device', device: d.kind, mode: d.live ? d.mode : 'off', pos: d.pos, live: true });
        }
        Minimap.draw(mapCtx, 170, level, player, {
          yaw: input.yaw, contacts, range,
          label: RADAR_NAMES[settings.mapZoom === undefined ? 1 : settings.mapZoom] + '  ' + range + ' m',
          objective: zone ? [(zone[0][0] + zone[1][0]) / 2, (zone[0][2] + zone[1][2]) / 2] : missionRt ? missionRt.objectivePos() : hqSec && hqSec.active ? level.hq.console : null,
        });
      }
      const h = Minimap.heading(input.yaw);
      $('compass').textContent = h.name + '  ' + h.deg + '\u00b0';
    }
    for (const d of level.swingDoors || []) d.step(dt);
    if (view.tickSwingDoors) view.tickSwingDoors();
    if (view.tickProps) view.tickProps();
    // (M6.57) the objective marker (Settings, off by default): the nearest thing still to do, on screen, with its
    // distance; at the screen's edge when it is behind you or off to the side
    {
      const wp = $('waypoint');
      let show = false;
      if (settings.waypoint && S.playing && !S.menu && missionRt && missionRt.objectivesLeft && !S.plan) {
        const left = missionRt.objectivesLeft();
        if (left.length) {
          let best = left[0], bd = Infinity;
          for (const q of left) { const d = Math.hypot(q[0] - player.pos[0], q[1] - player.pos[1], q[2] - player.pos[2]); if (d < bd) { bd = d; best = q; } }
          const sp = new pc.Vec3();
          const p3 = new pc.Vec3(best[0], best[1] + 1.2, best[2]);
          cam.camera.worldToScreen(p3, sp);
          const W = window.innerWidth, H = window.innerHeight, f = cam.forward, toward = (p3.x - cam.getPosition().x) * f.x + (p3.y - cam.getPosition().y) * f.y + (p3.z - cam.getPosition().z) * f.z;
          let x = sp.x, y = sp.y;
          // behind you: at the side it is nearer, half way up (clear of the radar and the touch buttons)
          if (toward < 0) { x = sp.x > W / 2 ? 36 : W - 36; y = H * 0.42; }
          x = Math.max(36, Math.min(W - 36, x)); y = Math.max(160, Math.min(H * 0.6, y));
          wp.style.left = x + 'px'; wp.style.top = y + 'px';
          wp.querySelector('span').textContent = Math.round(bd) + ' m' + (Math.abs(best[1] - player.pos[1]) > 2.5 ? (best[1] > player.pos[1] ? ' \u2191' : ' \u2193') : '');
          show = true;
        }
      }
      if ((wp.style.display === 'block') !== show) wp.style.display = show ? 'block' : 'none';
    }
    // (M6.49) the mission map, while it is up (redrawn a few times a second)
    {
      const pm = $('planmap'), on = !!(S.plan && level.plan && S.playing && !S.menu);
      if ((pm.style.display === 'block') !== on) pm.style.display = on ? 'block' : 'none';
      if (on && (S.planT = (S.planT || 0) - dt) <= 0) {
        S.planT = 0.2;
        const w = window.innerWidth, h = window.innerHeight;
        if (pm.width !== w || pm.height !== h) { pm.width = w; pm.height = h; }
        drawPlan(pm.getContext('2d'), w, h, level.plan, player.pos[1], {
          you: { x: player.pos[0], z: player.pos[2], yaw: input.yaw }, top: S.touch ? 64 : 0,
          objectives: missionRt && missionRt.objectivesLeft ? missionRt.objectivesLeft() : [],
          out: level.extraction ? [level.extraction.pos[0], level.extraction.pos[2]] : null,
          devices: (level.liveDevices || []).filter((d) => d.known).map((d) => ({ x: d.pos[0], y: d.floorY !== undefined ? d.floorY : d.pos[1] - 2.2, z: d.pos[2] })),
        });
      }
    }
    if (touch) {
      touch.tick();
      // (M6.36) aim assist: over an enemy, the view slows (a look straight out from the eye, 60 m)
      let fr = 1, autoAt = false;
      if ((settings.touchAssist !== false || settings.touchAutoFire) && S.playing && !S.menu && !S.dialog) {
        const h = level.world.raycast(player.eyePos, aimDir(), 60, (q) => q.glass || q.shootThrough);
        const tg = h && h.solid && h.solid.target;
        if (settings.touchAssist !== false && tg && !tg.down && (tg.guard ? !tg.guard.dead && tg.guard.faction !== 'staff' && !tg.guard.neutral : true)) fr = 0.45;
        // (M6.47) auto-fire (Settings, off by default): only at a man of theirs already fighting you - never one who
        // has not seen you (it would give you away), never a Yellow, never staff
        const g = tg && tg.guard;
        autoAt = !!(settings.touchAutoFire && g && !g.dead && !tg.down && g.state === 'alert' && g.faction !== 'yellow' && g.faction !== 'staff' && !g.neutral && !g.heldUp);
      }
      input.lookFriction = fr;
      if (autoAt && arsenal.weapon && arsenal.weapon.kind === 'gun') { if (!S.autoFiring) input.mouse.firePressed = true; input.mouse.fire = true; S.autoFiring = true; }
      else if (S.autoFiring) { S.autoFiring = false; if (!touch.state.held.size || ![...touch.state.held.values()].some((q) => q.action === 'fire')) input.mouse.fire = false; }
    }
    if (level.lift) level.lift.alpha = S.alpha;     // drawn in step with you
    if (level.helicopter) level.helicopter.t += dt;   // its rotor turns, it bobs
    if (view.tickMovers) view.tickMovers();
    if (level.lift) for (const ev of level.lift.events.splice(0)) { if (ev.type === 'ding') audio.liftDing(); else audio.liftDoors(); }
    S.doorMsg = Math.max(0, (S.doorMsg || 0) - dt);
    if (missionRt) missionRt.draw(dt);
    wview.tickTargets(dt, player.eyePos);
    // (M6.33) a broken pane's shards, falling
    if (S.shards && S.shards.length) {
      for (const k of S.shards) {
        k.t += dt; k.v[1] -= 9.8 * dt;
        k.p[0] += k.v[0] * dt; k.p[1] += k.v[1] * dt; k.p[2] += k.v[2] * dt;
        if (k.p[1] < k.floor) { k.p[1] = k.floor; k.v = [0, 0, 0]; }
        k.e.setPosition(k.p[0], k.p[1], k.p[2]); k.e.rotate(k.spin * dt, k.spin * 0.7 * dt, 0);
        if (k.t > 6) k.e.destroy();
      }
      S.shards = S.shards.filter((k) => k.t <= 6);
    }
    // (M6.30) weather: rain or wind - its sound, duller indoors; rain falling about you where you are open to the sky
    if (level.weather && S.playing) {
      S.wxT = (S.wxT || 0) - dt;
      if (S.wxT <= 0) {
        S.wxT = 0.3;
        const up = level.world.raycast(player.eyePos, [0, 1, 0], 40, (q) => q.person || q.target);
        S.wxOpen = !up;
        player.wet = (level.weather === 'rain' || level.weather === 'snow') && S.wxOpen;      // (M6.36) wet underfoot
      }
      audio.weather && audio.weather(level.weather === 'snow' ? 'wind' : level.weather, level.weather === 'rain' ? 0.13 : level.weather === 'snow' ? 0.06 : 0.1, S.wxOpen);
      if (level.weather === 'rain' || level.weather === 'snow') {
        const snow = level.weather === 'snow';
        if (!S.rain) {
          const m = new pc.StandardMaterial(); m.diffuse = snow ? new pc.Color(0.95, 0.96, 1) : new pc.Color(0.7, 0.75, 0.82); m.emissive = snow ? new pc.Color(0.6, 0.62, 0.66) : new pc.Color(0.25, 0.27, 0.3); m.opacity = snow ? 0.85 : 0.35; m.blendType = pc.BLEND_NORMAL; m.depthWrite = false; m.update();
          S.rain = [];
          for (let i = 0; i < (snow ? 110 : 70); i++) {
            const e = new pc.Entity('rain'); e.addComponent('render', { type: 'box', material: m, castShadows: false }); if (snow) e.setLocalScale(0.035, 0.035, 0.035); else e.setLocalScale(0.012, 0.5, 0.012);
            app.root.addChild(e); S.rain.push({ e, x: (Math.random() - 0.5) * 16, y: Math.random() * 12, z: (Math.random() - 0.5) * 16, ph: Math.random() * 6 });
          }
        }
        const c = player.eyePos;
        for (const r of S.rain) {
          r.y -= dt * (snow ? 1.4 : 11); if (snow) { r.ph += dt; r.x += Math.sin(r.ph * 1.3) * dt * 0.4; }
          if (r.y < -3) { r.y = 9 + Math.random() * 3; r.x = (Math.random() - 0.5) * 16; r.z = (Math.random() - 0.5) * 16; }
          if (r.e.enabled !== !!S.wxOpen) r.e.enabled = !!S.wxOpen;
          if (S.wxOpen) r.e.setPosition(c[0] + r.x, c[1] + r.y, c[2] + r.z);
        }
      }
    } else if (S.rain || (audio.wx && !level.weather)) { audio.weather && audio.weather(null); }
    // (M6.30) the grappling line, from your hands to where it holds, while it takes you up
    {
      const tr = player.traverse;
      if (!S.lineEnt) {
        const m = new pc.StandardMaterial(); m.diffuse = new pc.Color(0.1, 0.1, 0.1); m.update();
        S.lineEnt = new pc.Entity('grapple-line'); S.lineEnt.addComponent('render', { type: 'box', material: m, castShadows: false }); S.lineEnt.enabled = false; app.root.addChild(S.lineEnt);
      }
      const on = !!(tr && tr.kind === 'grapple' && tr.t < tr.legs[0].dur + 0.1);
      if (S.lineEnt.enabled !== on) S.lineEnt.enabled = on;
      if (on) {
        const a = [player.pos[0], player.pos[1] + 1.25, player.pos[2]], b = tr.line, len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
        S.lineEnt.setPosition((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); S.lineEnt.lookAt(b[0], b[1], b[2]); S.lineEnt.setLocalScale(0.015, 0.015, Math.max(0.1, len));
      }
    }
    wview.tickSecurity(dt);
    wview.tickBlasts(dt);
    wview.tickMarks(dt);
    // a flashbang lights the place up even if you were not looking at it
    blindFlash = Math.max(0, blindFlash - dt * 2.2);
    $('blind').style.opacity = Math.min(1, Math.max(arsenal.blind / 1.2, blindFlash * 0.7)).toFixed(3);
    // the transport: fade out (0.6 s), move you while black, hold (0.5 s), fade in (0.7 s)
    if (S.transport) {
      const tr = S.transport;
      tr.t += dt;
      let k;
      if (tr.t < 0.6) k = tr.t / 0.6;
      else if (tr.t < 1.1) {
        k = 1;
        if (!tr.moved) {
          tr.moved = true;
          tracker.clear();          // somewhere new: nothing known yet
          if (tr.to === 'course') startCourse();       // the start of the movement course
          else {
            player.reset();
            player.pos = level.extract.to.slice(); player.vel = [0, 0, 0]; player.settle();
            input.yaw = level.extract.yaw; input.pitch = 0;
            if (course) { course.skipAll(); endCourse(false); }
          }
        }
      } else if (tr.t < 1.8) k = 1 - (tr.t - 1.1) / 0.7;
      else { k = 0; S.transport = null; }
      $('fade').style.opacity = Math.max(0, Math.min(1, k)).toFixed(3);
      $('fade').style.display = k > 0 ? 'block' : 'none';
    }
    wview.tickProjectiles();
    if (player.pos[1] < -40) { player.damage(1000, 'fell'); }
    S.frameDt = dt;
    handleEvents();
    drawDrivables(); engineSounds();
    placeCamera(dt, lastInput);
    hud();
    S.jsMs = (S.jsMs || 0) * 0.9 + (performance.now() - jsStart) * 0.1;
  });

  app.start();
  view.applyQuality(settings.quality);
  $('loading').style.display = 'none';
  if (MISSION) {
    missionRt = setupMission({ pc, app, level, player, input, audio, S, $, tracker, canvas, wview, settings, arsenal,
      endMission() {
        S.playing = false; S.menu = true;
        $('class-pick').style.display = 'none'; S.picking = false;
        if (document.pointerLockElement) document.exitPointerLock();
        $('step').style.display = 'none';
        show('mend', true);
      } });
    $('btn-respawn').textContent = 'Restart the mission';
    $('btn-title').textContent = 'Leave the mission (back to Ghost HQ)';
    $('btn-save').style.display = 'none';
    document.body.classList.add('mission');
    if (!TEST) { show('briefing', true); S.menu = true; }
  } else if (HOTEL || FACTORY || CASINO || TRAIN || DRAFT) {
    if (level.offDuty) document.body.classList.add('offduty');
    // (Rhys: "stuck as a basic trooper forevermore after your first death") the kit is taken as you
    // deployed with it (it was taken before the briefing's choice), and you choose a class again each time you fall
    const battleKit = { slots: Object.assign({}, loadout.slots), mods: JSON.parse(JSON.stringify(loadout.mods || {})), specials: loadout.specials.slice() };
    const keepKit = () => { battleKit.slots = Object.assign({}, loadout.slots); battleKit.mods = JSON.parse(JSON.stringify(loadout.mods || {})); battleKit.specials = loadout.specials.slice(); };
    const beginWas = $('b-begin').onclick;
    $('b-begin').onclick = () => { keepKit(); beginWas(); };
    if (DRAFT) { document.body.classList.add('draft'); document.body.style.setProperty('--zpre', '"LEVEL ' + DRAFT.no + '  //  "'); }
    // the reds are in: their brains, bodies and guns from Level 0's
    // runtime; the hotel's doors, keys, safe and cameras stay with main.js
    missionRt = setupMission({ pc, app, level, player, input, audio, S, $, tracker, canvas, wview, settings, arsenal,
      // (Rhys: objectives independent of completion) how it ended, into
      // the story of the slot you deployed from - for the missions after it
      // a battle: back in at your side's end, with your kit as you deployed with it
      // (Rhys: "respawn with full ammo") the kit you started with, as you started with it: whatever you
      // picked up is left behind, every magazine and pouch full again (classes to choose from come later)
      respawnYou() {
        if (S.nextCls !== undefined) { applyClass(S.nextCls); keepKit(); S.nextCls = undefined; }
        $('class-pick').style.display = 'none'; S.picking = false;
        for (const sl of SLOTS) loadout.put(sl, battleKit.slots[sl], battleKit.mods[sl]);
        loadout.specials = battleKit.specials.slice();
        arsenal.ammo = {}; arsenal.slotAmmo = {}; arsenal.stash = {};
        arsenal.reset(loadout); player.reset(); input.yaw = player.yaw; input.pitch = 0;
      },
      recordOutcome(o, result) { Saves.saveStory(slotNo, recordOutcome(Saves.loadStory(slotNo) ? { story: Saves.loadStory(slotNo) } : {}, o, result).story); },
      endMission() {
        S.playing = false; S.menu = true;
        if (document.pointerLockElement) document.exitPointerLock();
        $('step').style.display = 'none';
        show('mend', true);
      } });
    $('btn-respawn').textContent = 'Start again';
    $('btn-title').textContent = 'Leave (back to Ghost HQ)';
    $('btn-save').style.display = 'none';
    if (!TEST) { show('briefing', true); S.menu = true; }
  } else {
    // back from a level: your save, moved to Ghost HQ's hall, so Continue carries on from there
    if (AT_HQ && level.hq) {
      const saved = Saves.listSlots()[slotNo];
      if (saved) applySave(saved);
      // (M6.29) an intrusion waiting: at the foot of the stairs, out of the hall turrets' sight
      const why = hqSec ? takeIntrusion(undefined, slotNo) : null;
      const at = why ? level.hq.arriveSafe : level.hq.arrive;
      player.pos = at.pos.slice(); player.vel = [0, 0, 0];
      input.yaw = player.yaw = at.yaw; input.pitch = 0;
      if (why) hqSec.pending = why;
      saveNow();
      try { history.replaceState(null, '', location.pathname + (TEST ? '?test' : '')); } catch (e) { /* file:// */ }
    }
    if (!TEST) showTitle();
  }

  // ── test hooks (used by the automated browser tests) ────────────────────
  // (M6.64) a touch screen's buzz (Settings: Touch: vibration; phones that can): a shot of yours, a hit on you
  function buzz(ms) { if (S.touch && settings.touchBuzz !== false && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* not allowed */ } } }
  // (M6.33) the shards of a broken pane: a handful of glints, falling to the floor either side of the sill
  let shardMat = null;
  function shards(pos) {
    if (!shardMat) { shardMat = new pc.StandardMaterial(); shardMat.diffuse = new pc.Color(0.7, 0.85, 0.9); shardMat.emissive = new pc.Color(0.25, 0.3, 0.32); shardMat.opacity = 0.6; shardMat.blendType = pc.BLEND_NORMAL; shardMat.depthWrite = false; shardMat.update(); }
    S.shards = S.shards || [];
    const gb = level.world.groundBelow(pos[0], pos[1] - 0.2, pos[2], 0.1), floor = gb > -Infinity ? gb : pos[1] - 1.65;      // (a window's sill, a case's stand)
    for (let i = 0; i < 16; i++) {
      const e = new pc.Entity('shard'); e.addComponent('render', { type: 'box', material: shardMat, castShadows: false });
      const sz = 0.03 + Math.random() * 0.07; e.setLocalScale(sz, 0.004, sz * (0.5 + Math.random()));
      app.root.addChild(e);
      const p = [pos[0] + (Math.random() - 0.5) * 1.2, pos[1] + (Math.random() - 0.5) * 1.1, pos[2] + (Math.random() - 0.5) * 1.2];
      S.shards.push({ e, p, v: [(Math.random() - 0.5) * 2.4, Math.random() * 1.2, (Math.random() - 0.5) * 2.4], floor, spin: 200 + Math.random() * 400, t: 0 });
    }
  }
  window.FL = {
    app, pc, player, level, view, input, settings, S, characterFill, hqSec,
    intrude(why) { if (hqSec) hqSec.start(why || 'test'); return !!hqSec; },
    openCase() { if (typeof openCase === 'function') openCase(); },      // (M6.71) for the tests: the case board
    pose(pos, yaw, pitch) { player.seated = null; player.pos = pos.slice(); player.vel = [0, 0, 0]; player.mode = 'walk'; player.traverse = null; input.yaw = yaw || 0; input.pitch = pitch || 0; player.yaw = input.yaw; },
    drive(inp, seconds) {
      const n = Math.round(seconds / DT);
      let prev = false;
      for (let i = 0; i < n; i++) {
        const x = Object.assign({ moveX: 0, moveZ: 0, sprint: false, crouch: false, aim: false, yaw: input.yaw, pitch: input.pitch }, typeof inp === 'function' ? inp(i * DT) : inp);
        x.jumpPressed = !!x.jump && !prev; prev = !!x.jump;
        input.yaw = x.yaw; input.pitch = x.pitch;
        player.step(DT, x);
        lastInput = x;
        S.prevPos = null; S.alpha = 1;
      }
      handleEvents();
    },
    third(on) { S.third = on; },
    arsenal, wview, loadout, opr, Minimap, audio, music, score() { return score; },
    startCourse, endCourse, course() { return course; },
    Saves, showTitle, drawSlots, saveNow, applySave, gameState, slot() { return slotNo; },
    crates: level.crates, showCrate, closeCrate, crateNear, drawCrate,
    setSlot(s) { crateSlot = s; drawCrate(); },
    openMenu, deploy, tab, get bakedLight() { return bakedLight; }, fpsWatch, answerLowQ, showLowQ,
    mission() { return missionRt; }, guards: level.guards || [],
    tracker, doors: level.swingDoors || [], drivables: level.drivables || [], vehicleUse, vehicleNear,
    state() { return { pos: player.pos.slice(), mode: player.mode, health: player.health, breath: player.breath, stamina: player.stamina, underwater: view.underwater, prompt: player.prompt }; },
  };
}

// the signs are drawn onto canvases once, at the start: the game's own fonts (Severian's
// letters) are fetched first - but never waited for more than a few seconds
const fontsThenBoot = () => {
  const want = ['700 32px "Severia Sans Condensed"', '400 16px "Severia Sans"', '700 16px "Severia Sans"', '400 16px "Severia Serif"'];
  const ready = document.fonts && document.fonts.load ? Promise.all(want.map((f) => document.fonts.load(f, '\u0410\u0500\u050e'))) : Promise.resolve();
  let started = false; const go = () => { if (!started) { started = true; boot(); } };
  ready.then(go, go); setTimeout(go, 4000);
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fontsThenBoot); else fontsThenBoot();
