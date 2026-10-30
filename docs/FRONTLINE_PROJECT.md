# FRONTLINE — Project Book

*A complete account of the project, written so that anyone (or any assistant)
can pick it up cold. Current build: **M6.7.7**. Sister document:
`FRONTLINE_ROADMAP.md` (what is still to do) and `Frontline_Weapons.xlsx`
(the 98-weapon armoury). For the other game in this workspace, see
`TDR_PROJECT.md`.*

---

## 1. What Frontline is

A third- and first-person espionage game that runs in a browser, built by
**GooseKnight Gaming** (Rhys) with an AI assistant, over about a week of
sessions. It is hosted on GitHub Pages at
**gooseknightgaming.github.io/Frontline** and needs no installation.

You play a **Ghost** operative. The game so far is a training facility —
**Yard 7** (a walled compound in a high desert) and a **training course**
sixteen metres beneath it — which exists to teach and test the systems that
missions will later use.

**The feel being aimed at:** early-2000s low-to-mid-poly realism. Not cartoon,
not photoreal. Readable silhouettes, honest materials, restrained detail.

---

## 2. How it is built

- **Engine:** PlayCanvas 2.22.2, the open-source engine used from npm — *no
  PlayCanvas editor, no account, no cloud project*. Everything is code.
- **Language:** plain modern JavaScript, ES modules, no framework.
- **Build:** `npm install && node build.mjs` → `dist/` containing
  `index.html`, `controls.html`, `game.js` (about 2.5 MB) and `assets/`.
- **Deploy:** upload the contents of `dist/` to the repository root. GitHub
  Pages serves it. `game.js` is cache-busted with `?v=<version>`;
  `controls.html` carries the version too.
- **No build step is needed to play** — it is one script and some assets.

### The split that matters

`src/sim/` is **pure logic with no engine in it**: movement, weapons,
loadouts, the course, animation choice. It can be imported by Node and tested
without a browser, which is why there are 150-odd fast tests.

`src/game/` is **everything that touches PlayCanvas**: rendering, levels,
audio, input, the HUD, saves.

Keep that line. It is the reason the test suite is quick and the reason bugs
are usually found before a playtest.

---

## 3. File map

| File | Lines | What it holds |
|---|---|---|
| `src/sim/player.js` | ~790 | All movement: walking, sprinting, crouch, prone and the prone shuffle, jumping, vaulting, climbing, ladders, swimming and diving, dashing, the backward roll, peeking over cover, leaning round corners, jump-and-grab, parkour (run-up, going over walls), stamina, breath, fall damage, noise |
| `src/sim/doors.js` | 115 | Ordinary hinged doors: where the leaf is for collision (shut or open), which way it swings, and its turn for drawing |
| `src/sim/guard.js` | ~330 | A guard: patrol routes and posts; sight, hearing, awareness and states (suspicious, search, return, alert); walking found paths and opening doors; a shootable body; death or knockout |
| `src/game/voice.js` | ~90 | Spoken lines: the browser's speech synthesis, a voice per speaker, recordings take over where listed |
| `src/sim/nav.js` | ~170 | Finding a way through a building: a grid per floor, stairs as links, A*, straightened paths |
| `src/sim/mission.js` | ~90 | A mission's rules: keycard, download, kicking odds, extraction, hidden trophies |
| `src/game/level_mission0.js` | ~330 | Level 0: Meridian House, three floors, ten guards |
| `src/game/mission_runtime.js` | ~230 | The mission in the game: guards' bodies, prompts, E and F, bullet time, hints, the end screen |
| `src/game/trophies.js` | ~30 | Hidden trophies, kept in the browser |
| `src/sim/contacts.js` | 90 | What you know: senses (sight, heat, sound, close by), a memory with fading last-known positions, the radar's three ranges |
| `src/sim/weapons.js` | 558 | `Arsenal`: firing, spread, recoil and pull, reloads (including automatic), grenades and charges, medkits, melee and bare hands, penetration through glass and thin walls, range falloff, targets |
| `src/sim/loadout.js` | 250 | The item catalogue (`ITEMS`), mods (`MODS`), ammunition (`AMMO`), slots and what fits where, `Loadout` and `Crate` |
| `src/sim/world.js` | 117 | Collision: axis-aligned boxes, ladders, zones, water, raycasting (with an optional skip, so sight looks through glass). Solids can be `noClimb`, `ghost` (blocks bodies, not bullets), `tough` (penetrable) or `glass` |
| `src/sim/course.js` | 115 | The training course as a list of steps with tests and the doors each opens |
| `src/game/level_hotel.js` | ~230 | Level 1, the Riverside Hotel, built from `src/game/maps/riverside.json` (Rhys's spreadsheet, via `tools/map_to_json.py`): 1.5 m a square, thin walls along the squares, doors from runs of door squares (double doors paired), furniture by room (restaurant tables, the bar, kitchen steel, the concierge desk), CCTV cameras and console, ceilings, a light per room, room names as zones; the city round it, the garden, river ladders |
| `src/sim/bake.js` | ~150 | Planning the light bake: big faces cut into tiles, the level cut into chunks (one lightmap per chunk, shared by its materials), the lightmap layout, the size each chunk asks for (pixels per metre), bounce fill. Pure |
| `src/sim/perf.js` | ~30 | Noticing a frame rate that stays low, to offer Low Quality once. Pure |
| `src/sim/anim.js` | ~150 | Chooses an animation clip from the player's state for the Universal rig: which clip, how fast, and how far the body turns for sideways movement. Pure |
| `src/game/main.js` | 1010 | Boot, the 60 Hz loop, HUD, crate and Quartermaster panels, title screen, saves, transport, door override, radar, music selection |
| `src/game/render.js` | 393 | Materials, merged static meshes (chunked when baked), the light bake, sky, water, signs, doors as separate entities, indoor lights with a budget |
| `src/game/level_training.js` | 560 | Yard 7: walls, containers, vault lane, ducts, catwalk, pool and dive tower, drop test, penetration booth, vehicle dock, Quartermaster, gangway, watchtower, hangar doors, the desert beyond |
| `src/game/level_tutorial.js` | 186 | The movement course, written at ground level then sunk (`COURSE_DY = -16`) |
| `src/game/level_weapons.js` | 477 | The shooting galleries, grenade bay, turret bay, transport bay and the stairwell down from the yard |
| `src/game/weapons_view.js` | 490 | Viewmodels, target models, turrets, blasts, bullet marks, tracers |
| `src/game/vehicle_models.js` | 282 | Vehicles built in code: personnel truck, light 4×4, motorcycle |
| `src/game/textures.js` | 435 | Every texture painted in code |
| `src/game/audio.js` | 245 | Sound synthesised at the moment it plays, plus recorded samples |
| `src/game/character.js` | ~125 | The animated operative: the Universal Base Character in a painted uniform (`Operative.glb`), reversed and looping clip copies, the body turn |
| `tools/recolour_outfit.py`, `tools/dress_operative.mjs`, `tools/build_operative.mjs` | | How `Operative.glb` is made from Rhys's zips: the outfit recoloured as field kit, the head dressed in the Ranger parts, then the clips |
| `src/game/minimap.js` | ~140 | The radar and compass: draws what you know — seen, heard, heat, remembered |
| `src/game/saves.js` | 113 | Three slots, transfer codes |
| `src/game/music.js` | 90 | Streamed music, chosen by situation |
| `src/game/props.js`, `ladders.js`, `camsmooth.js`, `input.js` | small | Scenery models, ladder geometry, camera spring, input and bindings |

---

## 4. What the game does today

**Movement.** Walk, sprint (including sideways and a prone shuffle), crouch,
prone, jump, vault, climb, mantle, ladders (grabbable from any side), swim,
dive, dash sideways, roll backwards, peek over cover, lean round corners,
jump-and-grab a ledge in mid-air, and **parkour**: sprint at a thin wall and
go over it, or run a step up anything up to about 3.3 m. Stamina can go negative, leaving you winded.
Falls hurt from about three metres. Noise depends on stance and speed.

**Weapons.** Families with real trade-offs; mods that clash; ammunition
carried separately and pooled for weapons you have not found yet; damage
falling off past a weapon's useful range; penetration of glass and thin walls
by weapon; recoil that climbs and pulls; automatic reload; grenades (frag,
flash with real blinding, smoke); charges you place, make safe or shoot;
medkits; melee with a weapon or bare hands.

**Doors.** Ordinary hinged doors open and shut with E and swing away from you
(one so far, between the link room and the stairs). The course's barrier
doors are separate: they open as you complete steps.

**Loadout.** Five slots by size, not category: primary, secondary, two
utility, gear. Crates swap kit; the Quartermaster in Yard 7 hands out anything
unlocked, free, with tabs and a restock button.

**The training course.** A movement half (walk, jump a trench, ladders and a
platform hop, crate climb, sprint-and-vault, crouch-and-crawl, drop through a
grate) and a weapons half (four shooting galleries with pop-up, moving and
bunkered targets, a grenade bay behind bulletproof glass, and a turret bay
that teaches peeking from cover). Steps open doors as they are completed, and
progress is saved.

**Yard 7.** A free-play compound: containers, vault lane, ducts and pipes, a
catwalk, a parkour lane, a pool with a dive tower, a drop test, a penetration booth (glass,
thin wall, toughened, bulletproof), a vehicle dock, a perimeter gangway with
seven ladders, a watchtower, hangar doors with friendly security turrets.

**Level 0 — the training mission.** Its own page (`index.html?level=0`, or
the title screen). An occupied office block, three floors, three ways in, a
keycard, a reinforced server room, breaching (kick or charge) with bullet time,
ten patrolling guards, hints, an end screen, and hidden trophies.

**Presentation.** Title screen with a drifting camera over the yard, three
save slots with transfer codes, a radar that shows only what you know (three
ranges on `,` `.` and M; seen, heard and remembered contacts) and compass, synthesised sound effects,
streamed music chosen by situation, painted textures throughout.

---

## 5. Testing — the most valuable habit in the project

```
node test/sim.test.mjs        87 movement tests
node test/course.test.mjs     25 training-course tests (incl. the door and the desert)
node test/weapons.test.mjs    47 weapon tests
node test/anim.test.mjs        9 animation tests (checked against the model file)
node test/saves.test.mjs       6 save tests
node test/contacts.test.mjs   13 radar-knowledge tests
node test/mission0.test.mjs   51 Level 0 tests
node test/detect.test.mjs     12 detection tests (sight, hearing, searching, the alarm)
node test/fight.test.mjs      20 combat tests (firing, accuracy, being shot, ranks, weapons, temperaments, flashbangs, smoke, takedowns, route rationing) (ways in, stairs, doors, guards, the mission)
python3 test/browser.test.py  58 browser tests    (needs dist/ served; milestones only)
```

The browser suite needs a server:
`cd dist && python3 -m http.server 8099`, then run it. It takes five to eight
minutes in a software renderer, so run it in the background and tail the log.

**Beyond the suites, two scripted checks have repeatedly found what eyes
missed** and are worth writing again for any new level:

1. **Walk every connection.** Put a player at each junction, walk in a
   straight line, print where they stop. This found sealed doors, a corridor
   running through another room, a wall across half the map, and several
   twelve-metre falls.
2. **Shoot every target from its own lane.** This found five of seven sniper
   targets hidden behind their own scenery, and turrets that could not be hit
   because their housings were solid.

---

## 6. Lessons the hard way

- **When a batch of edits aborts part-way, check what landed.** A half-applied
  batch shipped M5.3.0 broken: the game called sound functions that were never
  imported, and every jump, vault and climb froze it. Apply edits one at a
  time and report the ones that do not match.
- **Materials used by level geometry must exist before the meshes are merged**,
  or they are built with a default (the bulletproof glass was opaque for a
  release because of this).
- **No level opens on the pause menu** (Rhys, M6.9.0). Start with a title,
  a briefing or a start card - something with a button to click, which is
  what the mouse lock needs.
- **Bake the light after the engine has drawn a frame, never before** (M6.9.28).
  Baked at start-up, lamps were silently left out of the lightmaps - some walls
  black, others fine - and it looked like a GPU fault for three releases. Read
  the lightmap's own texels to tell a bake fault from a look fault.
- **A metallic material takes almost no baked light.** Metalness removes the
  diffuse colour, and a lightmap only brightens diffuse, so Meridian House's
  metal roof gave the top floor a black ceiling whatever lit it (M6.8.0).
  Surfaces meant to be lit from inside want a non-metal skin.
- **The engine sizes a lightmap from the mesh's bounds**, not its area: one
  map-wide mesh per material gave the building's plaster 256 pixels for
  everything (about 4 px/m, the blotches). Chunk baked levels and ask for a
  size (`src/sim/bake.js`). Bake time follows chunks × lights, so each chunk
  shares one lightmap across its materials (84 meshes → 28).
- **With merged, map-wide meshes, lights and small entities cost frames, not
  triangles.** 99 always-on lights and three objects per target halved the
  frame rate; a light budget and merged stands fixed it.
- **Check new rooms do not overlap old ones.** Several bugs were one room's
  wall running through another: the turret bay over the sniper gallery, the
  home corridor through the grenade bay.
- **Anything sunk underground must clear the tallest thing in it.** The course
  at −12 m still had a roof above ground, so the desert sliced through it.
- **A single constant beats a hundred edits.** `COURSE_DY` moves the whole
  course; the tests carry a matching constant.
- **Sign facing, settled once:** yaw 0 faces +z, π faces −z, −π/2 faces −x,
  +π/2 faces +x. A sign must face its reader.
- **Break a new feature on purpose and check a test fails.** Done for
  M5.15.0's parkour, desert and radar tests; it caught a parkour test that
  could never have failed.
- **Put starting points in the level, next to what they point at.** A
  hard-coded `[-89, 0, 0]` outlived the course's move to −16 m by four
  releases.
- **Test a new screen the way a player meets it.** M6.0.0's briefing worked
  under `?test` (which skips it) and trapped every real player.
- **Collision should only resolve the way you came.** Landing on "whatever
  you overlap" was fine while nothing moved; the first moving body (a guard)
  lifted the player through three floors.
- **Game-side code needs one browser run before it ships.** M6.2.0's guard
  shots passed every Node test and threw on every miss in the browser.
- **When two rules guard the same thing, test each one.** A flashed guard's
  blindness passed its sabotage because a second rule also stopped him.
- **Look at the screen, not only the state.** The end screen was "showing" —
  under the pause menu.
- **Tests must measure what matters, not what is convenient.** Two tests
  passed for years-long-in-project reasons that were wrong: a turret
  "could not see" the safe corner because the ray started inside its own
  housing. Check the test can fail.

---

## 7. Conventions

- **Versions:** `M<milestone>.<feature>.<patch>`. Milestones: M1 movement and
  Yard 7 · M2 weapons and range · M3 loadout, mods, gear, character ·
  M4 training course · M5 systems and presentation · M6 enemies and dialogue ·
  M7 missions and Ghost HQ · M8 vehicles · M9 ragdoll.
- **Prose in code and UI:** plain British English, no jargon, comments explain
  *why* rather than restating the code.
- **Geometry is axis-aligned** because collision is axis-aligned boxes. Angled
  walls need oriented boxes — a prerequisite for mission maps and arenas.

---

## 8. Assets and credits (these must stay)

- **Models:** Quaternius (Universal Base Character, Modular Character Outfits – Fantasy and Universal Animation Library for the operative; weapons) and Kenney (Car Kit) —
  CC0. `assets_library/` holds unused packs (43 converted Quaternius vehicles,
  Kenney watercraft, racing and prototype kits) which are not shipped.
- **Music:** **Kevin MacLeod (incompetech.com), CC BY 4.0** — twelve tracks.
  All credits are on the **Credits** screen (title menu); this is a licence
  condition — keep it complete when adding anything.
- **Voices:** VoiceBosch, *Radio Soldier* (CC BY-SA 4.0) and Kurt, *Soldier
  Voice Acting* (CC BY 3.0), OpenGameArt — credited on the title screen and
  in `assets/voices/CREDITS.txt`.
- **Sound:** water recordings from OpenGameArt, CC0 — jasinski
  (*Beach Ocean Waves*), transitking (*Water Waves*), Blender Foundation
  (*Water Splash, Yo Frankie*). Everything else is synthesised in code.
- **Animation:** the Universal Animation Library 1 and 2 (Quaternius, CC0),
  in use since M5.16.0.
- **Art sheets:** many produced with ChatGPT for reference (vision modes,
  uniforms, vehicles, modular buildings, flags, buttons, targets). They are
  pictures, not models: they guide what to build or source.

---

## 9. The fiction

**Ghost** is a covert service; the player is one of its operatives. Yard 7 is
its training facility, isolated on a high desert plateau. **Nullus** is
Ghost's black-operations research division — the research facilities,
containment vaults and experimental weapons — which is where the energy
weapons come from and why they can only be stolen.

Three sides are planned, not two: **reds** (the primary enemy), **yellows**
(hostile to the reds but not friends of yours) and **Ghost and its allies**.
Every person, turret, camera and door will belong to one of them, and
ownership can change hands mid-mission — which is what makes hacking matter.

**Q** is Ghost's inventor and gadget department. **The Quartermaster** issues
kit. Weapons come from nine invented manufacturers, each with a house style.

---

## 10. Where to pick up

In order of what unblocks the most:

1. ~~**The character swap.**~~ Done in M5.16.0. What is left of it (hair,
   real uniforms, a female operative) is on the roadmap. It gave crouch,
   swimming, climbing and a proper jump — but it is built for the Universal
   Base Characters' skeleton, not the current Swat model's. Switching the
   player over also settles the rig every NPC will share.
2. **Guards** (M6): they exist (M6.0.0), notice you (M6.1.0) and shoot
   back and speak (M6.2.0). Next: cover and moving under fire, factions,
   then takedowns (stage 4).
3. **Dialogue**, once there is someone to talk to.
4. **Weapons from the spreadsheet** — a dozen at a time, whenever a session
   needs a gentle start.

Longer term: angled geometry, then a level format as data, then battle maps
and missions; vehicles; ragdoll with ammo.js; glass that shatters; night,
thermal and UV vision; the mod bench; Ghost HQ.

---

## 11. Uploading a build

The repository root should contain:

```
index.html   controls.html   game.js
assets/
  ui/          3 images        weapons/     9 .glb
  characters/  Operative.glb   music/       12 .mp3
  voices/      14 .mp3 + 9 .ogg + CREDITS.txt
  sfx/         42 recordings + CREDITS.txt
  sfx/         3 .mp3          vehicles/    (kept, unused)
```

GitHub's web upload cannot create folders: use **Add file → Create new file**
and type `assets/music/placeholder.txt` to make the path, then upload into it.


## Where to pick up (M6.9.23)
The Riverside Hotel (`src/game/level_hotel.js`) is built floor by floor from
`src/game/maps/riverside.json` (converted from Rhys's spreadsheet by
`tools/map_to_json.py`): G, 1, 2, 3 and the roof; the basement and sewer,
the guards, the hostages and the captain's escape are next (README "Pick up
here"). Pure logic for its new systems lives in `src/sim/` (`lift.js`,
`safe.js`); the tests in `test/hotel.test.mjs` walk every stair, ladder,
hole and lift with the real player physics - keep doing that for every new
way through.
