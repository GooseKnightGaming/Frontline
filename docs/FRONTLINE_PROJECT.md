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

Every source file, with what it is, is listed in **`docs/CODE_MAP.md`** (made from the files' own opening
comments by `python3 tools/code_map.py`). In short:

| Folder | What is in it |
|---|---|
| `src/sim/people/` | You (`player.js`: all movement), guards, the captain, hostages, what you know (`contacts.js`), factions, choosing animation clips |
| `src/sim/world/` | Collision (`world.js`), shapes, curved walls, doors, lifts, finding paths (`nav.js`), planning the light bake, frame-rate watching |
| `src/sim/arms/` | Firing and everything about weapons (`weapons.js`); the catalogue, mods, ammunition, loadouts and classes (`loadout.js`) |
| `src/sim/play/` | A mission's rules, the story's branches, the training course, battles |
| `src/sim/vehicles/` | Driving |
| `src/game/main.js` | Starts the game, builds the level, runs every frame; its opening comment lists its sections in order |
| `src/game/core/` | Input and bindings, sound (made in code), music, voices and recorded lines, saves, trophies, Severian |
| `src/game/draw/` | The scene and its materials (`render.js`), textures painted in code, the operative, weapons in your hands, vehicles, the radar, scopes, ladders, props |
| `src/game/levels/` | Each hand-built level (`yard7.js`, `course.js`, `ranges.js`, `mission0.js`, `hotel.js`, `factory.js`, `casino.js`, `train.js`), the level kit (`kit.js`) and its first drafts (`drafts/`), what runs a mission (`mission_runtime.js`), Rhys's maps as data (`maps/`) |

Comments in the code say what a thing does and why (Rhys's words where they decided it); which release
did what is in `FRONTLINE_HANDOVER.md`, not in the code.

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
  size (`src/sim/world/bake.js`). Bake time follows chunks × lights, so each chunk
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

The repository is the whole project: source, tests, tools, notes, and the built game at its root, which
GitHub Pages serves. `node build.mjs` writes `index.html`, `controls.html`, `game.js` and the bake check
straight into the root; `assets/` is already there. Run the node tests, build, commit, push to `main`
(Rhys is happy for releases to go straight to main).


## Where to pick up (M6.9.23)
The Riverside Hotel (`src/game/levels/hotel.js`) is built floor by floor from
`src/game/levels/maps/riverside.json` (converted from Rhys's spreadsheet by
`tools/map_to_json.py`): G, 1, 2, 3 and the roof; the basement and sewer,
the guards, the hostages and the captain's escape are next (README "Pick up
here"). Pure logic for its new systems lives in `src/sim/` (`lift.js`,
`safe.js`); the tests in `test/hotel.test.mjs` walk every stair, ladder,
hole and lift with the real player physics - keep doing that for every new
way through.
