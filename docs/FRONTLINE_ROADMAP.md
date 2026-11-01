# Frontline — Roadmap
*Updated at M5.15.0. Everything asked for and not yet built, so nothing is lost.
What is done lives in FRONTLINE_HANDOVER.md.*

## Milestones
| | Milestone | State |
|---|---|---|
| M1 | Movement & Yard 7 | done |
| M2 | Weapons & range | done |
| M3 | Loadout, mods, gear, character | done (character still one model) |
| M4 | Training course | done |
| M5 | Systems & presentation — title, saves, radar, sound, music | done (small items left, below) |
| M6 | Enemies & dialogue | **current** — Level 0 and stage 1 in (M6.0.0) |
| M7 | Missions & Ghost HQ | |
| M8 | Vehicles | **started** (M6.20.0): driving, boats, the Riverboat Pursuit |
| M9 | Ragdoll | |

Version numbers are **M‹milestone›.‹feature›.‹patch›**.

## Finishing M5 (small)
- **Surface friction** (Rhys): dry brick, wet brick, smooth glass and metal
  should differ — how fast you can run up to something, whether a ledge can be
  caught at all, and how much you slide when you land. Materials already carry
  a name per surface, so each needs a grip figure and the movement code needs
  to read it.
- **Night vision / thermal / UV**: toggleable, screen tint, people as
  silhouettes, thermal sees one wall deep; flashbangs worse, daylight dazzles.
  A setting turns the tint off. Rhys's vision-mode sheet is the spec.
  **The radar is ready for it:** `sense()` in `src/sim/people/contacts.js` takes
  `{ thermal: true }` and reports `heat`, which the radar draws orange; the
  one-wall-deep rule goes in there. Rhys: what you see on thermal shows on the
  radar while you can see it, then fades to a last-known mark.
- **Firing modes**: 0 cycles auto → burst → single where a weapon has them.
- **Scope view** through optics; specialist night/thermal scopes.
- **Camera follows movement**: hold a direction and the view turns towards it.
- **Body clipping** when swimming, prone and on ladders.
- **Weapon stats sheet**, as a side document like the controls page.
- **Character in the pause menu**, showing the loadout.
- **Glass that breaks**: panes currently let rounds through but stay whole.
  Belongs with the physics sessions (ragdoll, trajectories, impact force).

## After the character swap (done in M5.16.0)
The operative is on the Universal rig. Still to do on the character:
- **Hair.** The zip has eight hairstyles "rigged to the head bone" in glTF;
  merging one in means re-pointing its skin at the body's skeleton.
- **Clothes are in** (M5.18.0: the Fantasy pack's Ranger parts, recoloured).
  Next: **faction looks** by recolouring the same parts (police blue, militia
  khaki, a red-faction uniform) — `tools/recolour_outfit.py` takes a palette;
  the **Peasant** parts for civilians; the **hood** for night work; hair for
  anyone not wearing one.
- **A female operative**: `Superhero_Female_FullBody` is on the same rig, and
  the clips will play on it unchanged.
- **Strafe and back clips** (none in the library). The crawl and ladder
  climb are made from parts of other clips (M5.17.0) — hand-made clips would
  be better if they ever exist; `LayToIdle` for getting up from prone;
  `Jump_Land` and `OverhandThrow` are in the model but not wired yet.
- **Guards** use the same model and the same `pickClip()`.

## Unlocking
The Quartermaster offers "everything unlocked"; today that is everything.
When missions exist, `unlocked()` in main.js becomes the player's record of
what has been earned — weapons, gear, mods and outfits.

How weapons are earned (Rhys, 31 Oct 2026): **most new weapons are found or
captured in the field** - picked up on a mission and kept once you get home;
**some come from completing particular missions**. Done in M6.25.0: the sheet's
Standard weapons are carried by the enemy and kept once brought home; its Unlock
weapons are mission rewards - M6.26.0: a first pass in `src/sim/play/rewards.js`
(one per mission), for Rhys to change as he likes.

## Factions: told apart by uniform (Rhys, M6.3.0)
The red uniforms are right for Level 0 — a trainee must be able to tell. On
**true missions**, sides are recognised by **uniform design** (cut, kit,
insignia, headgear), not by colour: police look like police, militia like
militia, and a red-faction soldier like a soldier. The rank hats (M6.3.0) are
the start of that vocabulary.

## Voices: where to find real ones (Rhys asked, M6.3.0)
- **Kenney Voiceover Pack** (CC0, kenney.nl / OpenGameArt): male and female
  lines including "Reloading", "Cover me!", "Watch my back!", "Look out!",
  "Get down!", "Sniper!", "Hold!", "Target engaged", "Go go go!" — drop
  straight into `RECORDED` in voice.js.
- **Freesound.org**: filter by licence (CC0, or CC-BY with credit); check
  each file.
- **OpenGameArt.org**: voice packs of varying licence; check each.
- For lines nobody has recorded: friends reading a script, or a TTS tool
  whose terms allow game use.

## Factions and hackable systems (Rhys, M5.11)
**Three sides, not two:** **reds** (your primary enemy), **yellows** (hostile
to reds but not your friends — militia, police, a rival service, a crime
family), and **Ghost and allies**. Every person, turret, camera and door
belongs to one of them, and that ownership can change hands mid-mission. It
wants building in early: the turret code already asks "may I fire on this?",
so it needs to ask "whose is this, and whose are you?" instead.

**Hacking and control.** Defence systems — turrets, cameras, door locks,
lights, alarms — can be taken over at a terminal or with a hacking kit:
- take control (fire on their owners), reprogram (ignore you), or disable;
- a hack takes time and makes noise, and can be interrupted or traced;
- **it works both ways** — an enemy hack can turn Yard 7's own turrets on you,
  which is the first proper reason for a **terminal room under Yard 7**:
  a stair down from the yard to a small server room, screens showing camera
  feeds and turret status, and a console that can lock the systems out again.
This also gives the EMP weapons, the hacking suit and Q's gadgets a purpose,
and gives the UV/thermal goggles something to look for.
**Started in M6.27.0**: cameras and turrets with owners and networks; security
terminals and the Hacking Kit; disable / reprogram / take control; noise and the
trace; the EMP puts them out (`src/sim/world/devices.js`). In the Research
Facility and the Prison. **M6.28.0: the rest** - maglocks, lights, the alarm's
siren, devices on the radar, shooting them out, the engineer and the radio
operator, Q Branch's gadgets, and the server room under Yard 7 with its intrusions
(traced on a mission? they come for Yard 7). Still open: a hacking range in the
training course; the hacking suit. (Done since: pinhole cameras for EMF, laser
tripwires for night vision and UV, the EMP grenade, the medic, Level 35 the
Listening Station.)

## Debrief and statistics (Rhys, M6.5.0)
The mission debrief exists (result, objectives, time, casualties, knockouts,
takedowns, spotted, accuracy, headshots, favourite weapon, breaches,
trophies). Still wanted: **hostages rescued** (when missions have them),
other mission-specific outcomes, and for **battle maps**: **K/D ratio**,
**accuracy** (shots effective / shots fired — already counted per weapon),
**favourite weapon** (already worked out), per match and over time.

## Smarter enemies, specialised roles (Rhys, M6.5.0 — eventually)
Guards that flank, use cover properly, suppress, fall back, and
coordinate; occasional **specialists** (M6.28: the engineer, the radio operator
and the medic are in) — a marksman who relocates, a medic
who revives knocked-out men, a heavy with a shield, a dog handler, an
engineer who re-locks doors or re-arms turrets, a radio operator who calls in
reinforcements (stop him first).

## The plan (agreed after M6.5.1), in order
1. **Baked lighting** — IN for Level 0 (M6.6.0; reworked M6.8.0: chunked
   lightmaps at ~8 px/m, stairwell lamps, a ceiling under the metal roof,
   bounce fill, a one-time Low Quality offer). Measured on the Chromebook in
   M6.6.0: indoor fps 10–11 → ~17, bake 1.9 s. **To confirm with M6.8.0:**
   **Confirmed on the Chromebook (M6.8.0):** bake 1.3–1.6 s (was 1.9);
   indoors 21–27 fps (was ~17; one corridor view 11); outside 16–32.
   Rhys: "looked decent". (His `?bake` test was on Level 0, which is baked
   anyway - `?bake` is for Yard 7: `index.html?bake`.)
   **Yard 7: IN (M6.8.2)** - the underground only (course, galleries, the
   slabs over them), coarser lightmaps (5 px/m, cap 512). Rhys's M6.8.0 test
   of the whole yard (`?bake`): 6.4 s to bake, the course 31 fps baked
   against 15 live, the open yard about the same either way - so the yard
   stays live. Sandbox: 131 s whole yard → 48 s now, so about 2.3 s on the
   Chromebook (to confirm). `?bake=all` bakes the whole yard to compare.
   (History below.) **Was still to do: Yard 7 and the course.** Tried in M6.8.0 and switched off
   (`?bake` turns it on to try): about 130 s in the sandbox, too long when
   the yard also loads behind the title screen, and the sunlit yard came out
   shaded (cause not found; a one-cascade sun for the bake made it slower
   still, 272 s, and was taken back out). Next attempt: bake only the
   underground course and galleries (all 92 lights are down there - the
   frame-rate cost) and leave the open yard on live sun; or bake after the
   title screen, while the briefing is up.
   The look Rhys wants (original Battlefront: painted
   models, baked lighting) and the cure for indoor frame rate (outside 28–34
   fps, inside 10–11, the game's code only 2–3 ms: the live indoor lights).
   PlayCanvas has a built-in lightmapper (`app.lightmapper.bake`); level
   meshes need a second UV set packed per face; bake once at load, then drop
   the live lights for level geometry and keep light for moving people.
2. **The hotel's new systems** — **Rhys (after M6.8.2): build the hotel
   straight away and add them step by step there; Meridian House stays as it
   is.** M6.9.0: the ground floor; M6.9.4: the first floor and the stairs. M6.9.8: the lift (G and 1; floor 2 joins when built). Next: the floors above, then
   hostages first, then the rest — hostages (free, escort, protect), cowardly
   guards (flee), shotgun guards, specialists, paired patrols, a scripted
   escape to a helicopter, a lift, basement and sewer. Test in Level 0 where
   they fit.
3. **Riverside Hotel** as Level 1 for now (Rhys will imagine others; it may
   move later). Corridors widened to 1.5–2 m. Ends as the helicopter lifts off
   until M8 (vehicles) adds the Riverboat Pursuit.
4. **Factions and ally AI.**
5. **Battle mode and the Derelict Factory**, built at 1.5 m per square.
6. **PvP battle mode**: 2–12 players, no AI. Needs a server — GitHub Pages
   only serves files. Recommended: an authoritative Node.js WebSocket server
   (e.g. Colyseus) on a small host (Fly.io, Render, Railway — check current
   free tiers); `src/sim/` can run on it unchanged. Firebase suits lobbies,
   accounts and results, not the shooting itself.

## Levels flow from Yard 7 (Rhys, M6.9.4)
For now the levels are on the title screen (fine while building). In the end
they should flow from Yard 7: deploy from the yard (the van / a briefing
room), come back to it after the debrief - the title screen's level buttons
then go.
**Tied to that: each save its own run** (Rhys, M6.9.5). Today trophies are
one record for the whole browser (`trophies.js`, a single localStorage key),
and the levels are reached from the title screen, outside any save. When the
levels flow from Yard 7, trophies, level progress and records belong to the
save slot: a new game starts clean, with nothing carried over from other
runs (a separate "all-time" record could still be kept for the title
screen, if wanted).

## Location ideas (Rhys, M6.8.1: two ChatGPT concept boards, kept in `maps/concepts/`)
Mood boards, not usable assets - a wish-list of settings, each with interior
and prop ideas. Part 1: generic house, theatre, swimming baths, derelict
factory, abandoned ancient temple, mega-prison, sewers, bunkers and open
ground, colosseum/arena, "something mysterious". Part 2: neon nightclub,
university campus, training barracks, research facility, airport, desert
outpost, space port / small orbital station, subway station. Several fit
plans already made (the Derelict Factory map; the hotel's sewer; Yard 7 is a
desert outpost of sorts). Modular building: each needs a kit of walls,
floors, props and textures - see "Art received" for what exists.

## Rhys's maps (received after M6.5.1; kept in `maps/`, drawn with `tools/draw_map.py`)
Drawn in the map template (one square = 1 m; north up).
**Riverside Hotel — mission (and battle map).** Reds hold a riverside hotel
with **3 hostages**; the police call in Ghost. Five levels: basement, ground
(foyer, restaurant, kitchen annex, bar, CCTV, stairs and a lift), first
(hotel rooms with locked doors, a hostage behind a reinforced door watched by
P4), second, third (a penthouse: kitchen, dining, the officer's spiral patrol,
a hostage held by P12, a marksman pacing the glass), and the roof (parapet
cover, five guards, the helicopter). Ways in: front doors (north), the kitchen
entrance (west), a **sewer tunnel into the basement**. ~16 × 38 m on the river.
20 reds. The leader (P13) **flees to the roof and the helicopter** at the
first sign of danger; the mission runs straight on into a **Riverboat
Pursuit** (no extraction). Evening, overcast.
*Needs first:* **hostages** (found, freed, escorted to the police van, kept
alive), **cowardly** guards (flee at the first wound or sign of danger),
**specialists**, guards with **shotguns**, **paired patrols** (P7 and P8 keep
pace), a scripted **escape** (running to the roof, a helicopter taking off),
a basement and a sewer, a working lift, and the boat chase (vehicles, M8).
*Scale notes:* many corridors are 1 square wide — widen to at least 1.5–2 m
so two people can pass and the camera fits; otherwise the proportions read
right for a boutique hotel.
**Derelict Factory — battle map.** (BUILT as Level 2 in M6.14.0 - as a mission: flush the eleven yellows out; as a battle, Level 19, in M6.19.5.) Yellows dug in; Ghost flushes them out.
Two floors, ~60 × 60 m, four-way symmetrical: corner spawns, rooms and
corridors, a reinforced central core with ladders. A 10-minute timer; **100
reserve units a side**; it ends at the timer or when a side has none left in
reserve or in the field. Midday, sunny.
*Needs first:* a **battle mode** — two sides fighting (Ghost allies as well
as enemies: ally AI and factions), respawning from reserves, the timer and
the win conditions, spawn points, scores (K/D, accuracy — already counted).
*Scale notes:* with 1 m corridors it will feel cramped for a firefight;
building it at 1.5 m per square (about 90 × 90 m) would let it breathe.

**Casino (preliminary, after M6.6.2).** (BUILT as Level 3 in M6.15.0 - round walls and the coiling ramp as Rhys described; a placeholder garrison and objective until the map's Info and Guards tabs are filled in. Rhys will play the maps and say what he wants where. M6.16.0, his notes: the ramp clockwise, windows climbing with it, a neighbourhood round it, smoothed walls and kiosks, proper gaming tables, chairs and stools, bars, slot machines, washrooms, new spiral stairs, a glass-sided roof pool. M6.17.0: a front, a staff door, the Quiet Booth, the Cash Vault, a deep pool, the casino kit (V-27C, lures, smoke, parachute) and a gantry to parachute from. Still to come: the Info and Guards tabs; floors 3 and 4 are empty on the map.) A round building ~60 m across,
drawn pixel-circular (build it with true curves). Levels G, 1, 2, 2A (a
mezzanine), 3, 4, roof terrace. Ground: the gaming floor — poker, roulette,
blackjack, craps, baccarat, a round central bar, the cage. Upper floors: a
private room behind reinforced doors, glass viewing galleries over the floor, a
central core with stairs. **The "stairs" round the outside are meant as one
smooth ramp coiling up round the building — slopes, no steps** (Rhys). Needs:
curved walls, a proper ramp (sloped floors — the engine has only level boxes
and steps today). Its Info tab still holds the factory's text: to fill in.

## Vision modes (Rhys, M6.7.0)
V cycles vision: **normal, night vision, thermal, UV, EMF**. Only normal
exists; the key is reserved. First/third person is in Settings.

## Battle maps (Rhys, M5.13)
Self-contained arenas, separate from the training facility: usable for
multiplayer, as templates for missions, and some built only for one or the
other. They want the **geometry-at-angles** work first (real places are not
all right angles) and a **level format** — the yard is written in code, which
is fine for one place and unwieldy for twenty. The natural order is: angles,
then a way to describe a map as data, then the first arena.

## M6 — the guard, in four stages, on Level 0
Level 0 (M6.0.0) is where every guard feature is built and tested: Rhys's
training mission in Meridian House.
1. ~~**Guards exist**~~ — M6.0.0: ten reds patrol and stand posts, can be shot,
   die, show on the radar only when sensed.
2. ~~**He notices you**~~ — M6.1.0: sight, hearing, awareness, suspicious →
   search (where you *were*, through doors and up stairs) → return, and
   alert with the alarm spreading. Still to add: **light and shadow**
   (a dark corner should hide you), and guards talking to each other.
3. ~~**He fights**~~ — M6.2.0: he shoots (reaction, bursts, reloads, fair
   accuracy), carries a carbine, is heard, and **speaks** (browser speech as
   a stand-in; recordings replace lines via `RECORDED` in voice.js). Still to
   do here: **taking cover** and moving under fire (the nav grid can find
   cover: an open cell with no line to you), **factions** as a table (red,
   yellow, ghost), a **difficulty** setting, and **recorded voices**.
 Weapons in hand (models), shoots with fair accuracy, moves to cover, reloads, calls
   out. **Factions** go in here: every guard, turret and door has a side.
4. ~~**Takedowns**~~ — M6.5.0: F behind an unaware (or blinded) guard; hands
   knock out, a knife kills. Still to add: a takedown animation pair, dragging
   and hiding bodies, knocked-out guards waking. Knockouts by fists, pistol-whip and
   rifle butt already count as non-lethal (M6.0.2); knocked-out guards may
   later wake, or be found by their friends.
**Reaching missions (Rhys, M6.0.1):** the title-screen button is fine for
now, but levels should be reached **from Yard 7 itself** — a mission board
or briefing room (the start of Ghost HQ), deploying from there, and the end
screen bringing you back to the yard.
**Level 0 still wants:** guards carrying weapons (models); CCTV in the
security office (with hacking); the hood from the Fantasy pack for night
work; more trophies (Unseen, No Witnesses and Sharpshooter arrived in M6.4.0;
ideas: under a time, only the fire escape, no charges used, a speed run); the loading-bay roller door as a real door;
office furniture with textures of its own (brick, plaster, carpet and
facades arrived in M6.0.4); ceiling tiles; glass that breaks.

## M6 — Enemies & dialogue (the next big step)
- **The radar already works on knowledge** (M5.15.0): a guard only appears
  while you see, hear or are right next to them, and leaves a fading
  last-known mark. A guard should add itself as a contact with a `loud`
  figure from its footsteps and voice, and the same `sense()` can run the
  other way round for the guard's own sight.
- A guard: patrols, sight cones, hearing (the noise figures are already there),
  alert states, search, combat, taking cover.
- **Tactical takedown**: quiet and unseen, from behind — lethal and
  non-lethal. **Taught in a mission, not in training**: it needs a person to
  creep up on, and plastic targets will not do.
- **Dialogue**: 2–4 options per exchange; one NPC in Yard 7 to start.
- **Weapons taken from downed enemies.**
- Uniform variety from Rhys's sheets (Ghost Squad, police, military, criminal,
  civilian); the 21 Quaternius characters share one skeleton and animations.
- **Command wheel** and squad orders.

## Having no mission plans is fine (and normal)
Missions come last, not first: the systems teach you what the game is good at,
and the missions are written to use them. What is already in place suggests the
shape — noise and sight lines, cover and peeking, loadout choices with real
trade-offs, penetration, non-lethal options, vehicles, hacking. A mission is
then: a place, a reason to go, a way in, something that goes wrong, and a way
out. When the first guard exists, one small mission ("get in, photograph the
manifest, get out without being seen") will teach us more than any document.

## M7 — Missions & Ghost HQ
- **Ghost HQ**: Logistics loadout screen, departments as places, briefing,
  After Action Report. Q, the inventor, as the gadget department.
- **Mission maps** — which needs **geometry at angles** first (below).
- One item per crate in the field; pre-modded weapons in crates.
- **Breaching and hacking** mechanics and training.
- **Parachutes** and training. **Diving gear** (rebreathers, closed-circuit).
- **Bullet drop** for long shots (range falloff is already in).
- **Skills tree.** (Started in M6.29.0: experience, points, eight skills of up to three ranks.)
- **Player accounts / server saves**: codes cover cross-device for now.

## M8 — Vehicles
**Started in M6.20.0.** `src/sim/vehicles/drive.js`: `Drivable` (car, jeep, boat - arcade handling, a moving solid,
damage from knocks, rounds and blasts; a boat keeps to the water and settles when wrecked) and `Pilot` (an
AI helmsman along a path, looping or not). Levels declare `vehicles: [...]` (kit: id, kind, at, yaw, model,
paint, hp, path, speed, loop, crew, goal 'escape'); the objective kind `'stop'` is done when the vehicle is
wrecked or its driver is down, failed when it gets away. E gets in and out; W/S throttle, A/D steer, SPACE
brakes, a chase camera, you can shoot while driving. **Level 20, the Riverboat Pursuit** is the first
vehicle mission. Still to come: land-vehicle missions (cars and jeeps in the big city levels), the
motorcycle, fuel, vehicle training in Yard 7.

Motorcycle first (A/D steer, W/S, Space hop, E to mount, speedometer and fuel
gauge), then vehicle training. **The vehicle dock in Yard 7 is ready for them**:
two personnel trucks and three support motorcycles stand there as props, built
from boxes. **Vehicles are built in code** (`vehicle_models.js`): personnel truck,
light 4×4 and motorcycle, with separate wheels ready to spin and steer. More
types can be added the same way (APC, jeep, pickup, boat). The Kenney and
Quaternius packs are kept in `assets_library/` as reference. Other packs
received and waiting: **Kenney Watercraft** (boats, for maritime missions),
**Kenney Racing Kit** (barriers, banners, fences, flags), **Kenney Prototype
Kit** (greybox shapes, floor buttons, animals). The asset sheets cover civilian, police,
military, air and sea.

## The physics block (Rhys, M6.0.4): done together, not piecemeal
**Shatter physics** (glass that breaks: the windows of Meridian House and
Yard 7's penetration booth let rounds through but stay whole), **vehicle
controls** (M8), **bullet trajectory physics** (drop over distance, beyond
today's range falloff), and **ragdolls** (M9). They share one foundation — a
physics engine (ammo.js) with impacts and forces — so they want the same
run of sessions.

## M9 — Ragdoll
ammo.js, a jointed skeleton, tuning. Replaces the death topple. Several
sessions back to back.

## Geometry at angles
Collision is axis-aligned boxes, so walls cannot sit at 30°. **Visual-only**
(rotated mesh, staircase collision) works today but is lumpy underfoot;
**proper** oriented boxes touch every movement routine and want a session.
Needed before any real mission map. **Rhys's target: turns in 10° steps (and
45°), ideally 5°** — the low-poly style forgives the facets. Oriented boxes at
any angle cover all of these at once.

## Parkour, later
The run-up and going over walls are in (M5.15.0). Still to come: wall-running
sideways, a climb up between two close walls, swinging on bars, and a proper
climbing animation once the character swap brings `ClimbUp_1m`. **Surface
friction** (above) should feed the run-up: wet brick shortens it, glass
refuses it.

## Doors
Ordinary hinged doors exist (`SwingDoor`, M5.15.0), one so far. For missions
they want: **locks** (key, keycard, hacked, picked), **faction ownership**,
kicking one in, peeking under or through, and sound through a shut door
being quieter. Doors in walls along x as well as z are already supported.

## Weapons & gear wanted
More of every family (pistols, rifles, snipers, SMGs, machine guns, shotguns, a
revolver, RPGs and launchers — the pack's `Grenade_1/2/3` are launchers).
Mods: 4x scope, iron sights, laser sight, red dot/reflex. **EMP** grenade,
charge and mine. **Laser rifle** with heat instead of ammunition. Skins and
suits. **Mod bench view** (Rhys has concept art). The Nullus division sheet
(plasma rifle, railgun, cloaking, exo suit) for much later.

## Sound still to come
Recorded voices to replace the browser's speech (see voice.js `RECORDED`); vehicle engines and weather ambience are
better recorded. Everything else is generated in code already.

## Art received, waiting to be used
Rhys's sheets cover doors, hazard tape, walkways, lights, barriers, props,
fencing and signage; vision modes; weapon attachments; scuba and gas masks;
environment backdrops; uniforms for every faction; civilian clothing; weapon
skins; bars and casinos; lived-in bases and towns; flags and insignia (factions,
nations, causes); scientists; hacking and EMP; the radar design; the player
characters in plain clothes and alternate outfits; Q; the Nullus division.
**To use a texture**, it needs exporting as its own square image (tiling where
it repeats) — then it replaces a painted-in-code texture one material at a time.


## Noted during M6.7.x (Rhys)
- **Environment packs** (a concept sheet Rhys had mocked up, not yet in the
  source): Casino, Library/Archive, Megayacht (onboard), Office (modular),
  Restaurant/Diner, and an "additional environment assets" sheet (doors,
  windows, stairs and railings, elevators, lighting, signs, vending machines,
  ATM, fire safety, HVAC, barrels and crates, pallets, bins, benches, fences
  and barriers, CCTV, traffic and road, materials, decals). For Riverside
  Hotel and later levels: the Casino and Restaurant packs fit a hotel best.
- **Baked lighting:** M6.6.0 already bakes Level 0 (see its entry). The upper
  floors and the stairwell still read very dark in play, and Rhys plays in Low
  Quality Mode on a Chromebook (10-25 fps indoors; game code is only ~2-3 ms
  of the frame, so it is the graphics). Extending the bake to Yard 7 and the
  course, brightening the dark areas, and a "suggest Low Quality when the
  frame rate stays low" prompt are all open.
- **Signs on floors 0 and 1** hang in the open at the stairwell mouth: rods
  like the FLOOR 2 sign if they look odd.
- **Guard-room door:** locked but not reinforced, so guards can still open it;
  and frag/flashbang blasts no longer breach doors. Both are one-line changes
  if Rhys wants them otherwise.
- **Ragdoll (M9):** head clipping in doorway pile-ups is accepted until then.


## Noted by Rhys (M6.9.13)

- **Lockpicks and lockpicking**, properly: a tool and a skill for locked doors (and perhaps the safe), alongside kicking and charges.
- **Clock-glitch puzzles, banked for a future level** (Rhys liked both once explained):
  (a) the M6.9.14 version: in a camera's glitch its clock's seconds jump to a digit of a code;
  (b) Rhys's reading: a camera glitches only when its clock hits a certain time (e.g. every :09), so the pattern over time gives the digit.
- **Mission dates**: each mission has its own story date and rough start time (the hotel: 9 July 2026, 22:47); the campaign opens around 7 July 2026.
- **Guards in the dark** (Rhys, M6.9.20): where the guards work in the dark (the hotel, power cut), they need night vision too - or torches. Gives play: goggles dazzled by a flashbang or sudden light; a torch gives a guard away.
- **Torches** (Rhys, M6.9.21): hand-held for guards carrying pistols, a weapon attachment (mod) for those with rifles; a guard needs a torch only if he has no night vision, and the other way about. The torch attachment is also a mod for the player's own weapons.

## Utility idea (Rhys, M6.10.3): a lure
A utility that **emits a sound, light or signal that draws nearby enemies to
it**. It does no harm itself - its use is in combination: a proximity mine
beside it, a takedown from cover as they come to look, or simply clearing a
corridor. Name to be decided. Fits the guard brain as it stands: a lure is a
noise (or a light, for the torch-carriers) that keeps going - guards already
investigate noises and walk to them.

## A founding principle (Rhys, after M6.11.0): outcomes branch, they do not fail
**One of the two major principles that make Frontline different.** Certain
events do not fail a mission: they send the story down a different path.
- **For now** (Riverside Hotel as it is being built): rescuing all three
  hostages AND stopping the captain stay **essential** - a hostage killed ends
  the mission, as M6.11.0 does.
- **Later**: these become **objectives, not essentials**, and what happens
  carries forward:
  - **Kill the captain** here and **his deputy takes over**; **leave him alive**
    and **you will see him again**.
  - **Which hostages survive and which die** can decide **what perks you get
    later in the game**.
- So, when the campaign structure exists: a mission records its outcomes
  (each hostage saved or lost; the captain killed, captured, escaped...) into
  a persistent story state that later missions read - who appears, who leads
  the enemy, which perks are on offer - rather than ending on "Mission failed".
  Death of the player is still a failure; most other things are a branch.
- Design with this in mind from here on: avoid building outcomes as hard
  pass/fail switches where a recorded result would do (the hotel's
  `rescued()` count and the captain's fate are already per-hostage and per-man,
  so they can be saved as story state later).

## Map ideas for later (Rhys, after M6.11.1)
- **A beachhead battle**, in the manner of Battlefront II's Kashyyyk map:
  an assault from the water onto a defended shore. **Rhys's preliminary map:
  `maps/Frontline_Map_Beachhead_Prelim.xlsx`** (after M6.12.1): "Beach Head &
  Piers - Under Attack", a battle map, midday and sunny; 64 x 62 squares of
  1 m; three floors, **8 m floor to floor**. A fast-flowing channel runs
  down the middle (x 22-35) into the sea along the south edge (rows 58+), with
  a **lower pier** at its mouth. West bank: a fortified line - walls with
  barricades (C), doors, an artillery bunker, ladders (A) up to firing
  positions (P) on the first floor, a corner building. East bank: a curved
  fortification with barricades-with-gates (B) and destructible barricades.
  **Rules (Info tab): a 10-minute timer; 100 reserve units a team; ends when
  the timer runs out, or when one team has none left in reserve and none in
  the field.** Needs systems Frontline does not have yet: two teams of soldiers
  fighting each other (allies as well as enemies), reinforcement counts and
  respawning, destructible barricades, artillery.
  **Sides (Rhys):** the West bank against the East bank (working names - new
  names wanted); **you pick which side you are on each time.**
- **A proper, fleshed-out Sewers map** (the hotel's sewer was the taster).
- **A map laid out like Rhys's university sports building** - and perhaps the
  whole campus. Rhys sent Edge Hill University's campus overview map (2022;
  the sports building is "19", the curved one). Approach agreed in principle:
  a **fictional campus based on its layout** - renamed, no crest or real
  signage, rearranged where it helps play - not the real university by name.
  Interiors need Rhys's own sketches/memory (the overview map has none).

## The hotel's other locked rooms (Rhys, after M6.11.1): what to put in them
Not more equipment. Options he listed: extra ammunition, lore/intel (not
essential, useful later), tchotchkes and knick-knacks, plans, blueprints,
files, cash. Proposal sent with M6.12.0 - his choice decides.
**M6.13.0:** lore/intel went in first (eight papers, `hotel_intel.js`). The
names in them (Varga, Hale, Ashdown, Pellow) are placeholders for Rhys; tying
them to Hostages 1-3, and what each survivor brings later (perks), is his call.
Next candidates for the locked rooms: cash, plans/blueprints, knick-knacks.
Names still to settle (Rhys, M6.13.0): the **reds** and the **yellows** are placeholders.

## The campus map - Rhys's brief (after M6.12.1)
A **fictional campus based on Edge Hill University's layout** (renamed, no
crest or real signage). Rhys cannot draw the interiors, so they are built from
his descriptions below; Claude drafts each building in the map-spreadsheet
style for Rhys to correct. **Leave out most of the halls of residence** (too
"one way", too like other domestic places) - except the **old halls (I, J, H,
G)**, which belong with buildings 1 and 2. Numbers are the campus map's; where
Rhys's memory and the map's list differ, the map's number is noted.
- **10 - Faculty of Education (Lakeside):** ground, first, second floors; a
  **cafe on the ground floor nearest the lake**; plenty of stairways.
- **9 - Health, Social Care and Medicine:** a medical feel - trainee nurses'
  hospital prep. **Lower ground/basement**, ground (small cafe), first floor.
- **Business School (map: 16; Rhys said 15):** very **long**, stairways at both
  ends; ground floor and a **mezzanine first floor looking down on the ground
  floor** all along.
- **BioSciences (map: 15; Rhys said 14):** ground to third floor. Ground: advanced
  technology, including a **CAVE** (3D computer-augmented virtual
  environment). **Third floor: the pathogen lab, restricted access.**
- **5 / 6a - The Arts Centre and Performance Studio:** a university **theatre**
  with rooms for band practice and rehearsal, and a **lounge bar**.
- **19 - Sport and Physical Activity (the curved building):** ground and first
  floor; **two parallel curved corridors on each floor**, one above the other;
  **stairs at each end and a lift** between; an **annex** on the straight part
  (nearest building 21) up **a half-floor** (mezzanine-like, but not).
- **3 - Students' Union (ground floor):** the **student bar with a dance venue**
  attached, a **launderette**, a sandwich shop, the **stationery and gift shop**.
- **22 - The Catalyst (library):** **big and open** - ground, mezzanine, first,
  second, third floor with a **large rooftop garden**.
- **2 - The Hub:** spacious. Basement: the shop's storage. Ground: the shop in
  a corner, a coffee counter in the middle, a small restaurant on the right, a
  moderate hall on the left, a large dining hall in the centre. First floor,
  right: small rooms connecting through from 2 to 1. First floor, upper left:
  a large open space and a **bridge** to more space, a prayer room and toilets.
  **The first floor's left and right sides do not connect.**
- **1 - Main Building:** flows from the old halls to the Hub; ground, first,
  second floors - the **old lecturers' rooms**.
- **I, J, H, G - the old halls:** ground: access, professors' offices, large
  social spaces; first and second: rooms with communal kitchens, bathrooms,
  shower blocks, common rooms.
- **23 - Creative Edge:** largely open-plan creative space; basement, ground,
  first floor, and a **small rooftop garden off the first floor**.
- **24 - The Sports Centre:** swimming pool and gym.
- Everything else on the campus map: skipped (or outdoor scenery only).

## Ideas from Rhys after M6.13.1
- **Remove before release:** the debrief's "Intel missed" line (now shown only
  with "Show frame rate & position" on) - players should find the intel themselves.
- **Locations:** a **bank with a vault**; a **shipyard / battleship** - something
  with massive closing **blast doors that ordinary C5 cannot breach** (a
  heavier charge, the controls, or a way round).
- **Location (after M6.13.6):** a **cemetery and crypt**.
- **Utilities:** **trackers and remote cameras** - placed, they report the
  enemies in that area; or stuck to one person, his exact whereabouts (the
  sticky C5 of M6.13.0 is the start of the "stick it on someone" mechanic).
  **EMP devices** - knock out cameras, automated defences (turrets), terminals
  and anything else electrical that is not EMP-proofed.

## The cast: people who are not Ghost Operative #1 (Rhys, after M6.13.6)
Everyone is drawn with the one operative model for now. Each person is
already a separate body, so swapping a model per person is a small job; the
work is finding models (ideally on the same rig, so the animations carry
over). Who is who, as Rhys decides it - write it here as it comes:
- **Riverside Hotel, the three hostages** (Rhys, after M6.13.6):
  - **H1, Room 103: Dr Imogen Hale** - the structural engineer (her own room
    is 104, next door). A woman, in smart-casual clothes.
  - **H2, Room 206: Tony Ashdown** - the reporter (his room is 205, next door).
  - **H3, Upper Balcony Suite: Elijah Pellow** - who keeps the books (his
    ledger is in the Balcony Suite below).
  (Which of H2/H3 is Ashdown and which Pellow is Claude's reading of the
  intel - swap them if Rhys says so.)
  - Rhys (after M6.13.6): Ashdown and Pellow **dressed for their jobs** - a
    reporter's clothes, a bookkeeper's.
- Still to cast: the captain, Varga, the pilot, the reds and yellows by rank,
  the police.

## A mission score (Rhys liked it, after M6.13.2)
The SCORE on screen began as the training range's, carried in the save; in
the hotel it was only counting guards by accident (M6.13.3 made that 10 a
guard on purpose, hostages 0). A proper mission score could add objectives,
hostages unhurt, intel, stealth (not spotted), headshots and time - shown in
the debrief, perhaps with a best per mission. Rhys's call on what counts.

## Branching outcomes - DONE for the hotel in M6.13.8
The Riverside Hotel now ends at the Ghost jeep however it went; a hostage
killed or the captain escaped is an outcome, not a failure. Graded: success
(everything), complete with losses (something), failed (nothing achieved, or
your own death). Each outcome - every hostage by name and fate, the captain's
fate - goes into the slot's story (`src/sim/play/story.js`, `Saves.loadStory`),
ready for later missions to read. Level 0 (training) still needs its file.

## The story (Rhys, after M6.13.7) - to be written, with its branches
- **Rhys: "Given that I want it to be a branching storyline from your
  successes and failures, I kinda need an actual storyline."** Mood boards:
  `maps/concepts/story/` (17 images - control rooms, an evidence wall,
  archives, a bunker HQ, red-lit vaults; "Consequence"; "Living Ghost";
  "Operative"; "Intel"; "Sides" - this last one looks like a real news
  photograph: a reference for feel only, never for use in the game).
- **Persistently Tracked Dimensions (PTDs)** - what the story keeps, and
  what later missions read:
  1. **Ghost's Understanding** - which theories are believed, which leads
     become available, what briefings recommend.
  2. **Operational Reputation** - whether Ghost sees you as reliable,
     reckless, compassionate, ruthless, unpredictable...
  3. **Faction Relationships** - who shares intelligence, gives help,
     obstructs you, or turns hostile.
  4. **Available Resources** - which equipment, support and extraction
     options Logistics can provide.
  5. **Surviving people and evidence** - who can return, testify, support,
     betray you, or reveal new information.
  6. **World condition** - which facilities, routes, organisations and
     settlements still exist.
  7. (Maybe) your relationships with individual characters.
  **The PTDs interact - and the game need not tell you which consequence
  you are triggering.**
- **Glass Vein** (Rhys's example of a mission's outcomes):
  - A: **Core secured** - Ghost gets the research: Intelligence gains a new
    lead, Logistics can study the recovered technology, and a faction that
    wanted the Core (or wanted it destroyed) may retaliate.
  - B: **Core compromised** - Ghost loses control: the campaign goes on, but
    an adversary may get the research - and the improved technology - instead.
  - C: **Core destroyed** - for now, the hard Game Over.
  **Some losses are recoverable; others are apocalyptically devastating.**
- **Names**: "reds", "yellows", "blues" are placeholders for proper
  organisations, and the reds of one level are not necessarily the reds of
  another. **There should be recurring characters** (the captain if he
  escapes; Varga; the hostages who live).
- **Perks** (asked after M6.13.7): what a hostage brought out alive gives -
  ideas, in the PTD terms: Dr Hale (structural engineer) - plans of later
  buildings, their weak walls and ways in (Understanding / Resources); Tony
  Ashdown (reporter) - sources and leads, a reputation that travels
  (Understanding / Reputation / Factions); Elijah Pellow (bookkeeper) - the
  money trail: who pays whom, and funds for Logistics (Resources / Factions).

## More map and mission ideas (Rhys, after M6.13.7)
- **A full Sewers map** (already listed - Rhys's own words again: "a proper,
  full map set in the sewers, not just a partial of a different map").
- **Busy City**; **Desolated City**; **Post-Apocalyptic Nuclear Wasteland**.
- **Vehicle-based missions**; a **sky-dive / paratrooper mission** - or at
  least a mission that starts with a jump from a plane, a helicopter or the
  like.

## Branching outcomes - the switch (Rhys, after M6.13.3: "remember")
For testing, the hotel still needs every objective (all three hostages AND
the captain stopped) and fails on a hostage killed or the captain escaping.
The plan for the switch, when Rhys says: the mission ends at the jeep
whatever happened - a dead hostage or an escaped captain no longer fails it -
and the debrief records each outcome (which hostages lived, captain killed /
knocked out / escaped / stranded) into the save, for later missions to read:
the captain escaped -> you meet him again; killed -> Lieutenant Varga takes
over; each surviving hostage -> what they bring (perks). Failure stays for
your own death (and perhaps for leaving with nothing done).



## Future mission ideas (Rhys)
- **Assassination** (M6.17.0 notes): work your way to a vantage point in one
  building and take aim at a senior Red/Yellow from there. Needs: a target who
  keeps a routine (arrives, stands at a window, leaves), a second building in
  sight of the first, a marksman rifle in the kit, and an exit once the shot is
  taken (the alarm it raises).
- **Parachute start** (earlier notes): the casino's gantry and the parachute
  pack (M6.17.0) are its first taste.
- **Housing Estate** (M6.17.5 notes): several houses, tightly packed -
  terraced, detached and semis; ordinary houses and bungalows; a corner shop,
  garages. Most a standard two-up two-down (or another common plan), one an
  "upside-down" house - bedrooms on the ground floor, kitchen and dining room
  upstairs. Heights vary: two floors, two and an attic, three. Needs: a
  house generator (plans as data: rooms per floor, stairs, doors, windows,
  roof type - pitched, hipped, flat bungalow - and the loft as a floor), the
  street (back alleys, gardens with fences to climb, garages), and the
  hotel's room-by-room furnishing reused for living rooms, kitchens and
  bedrooms.
- **Fortress / Compound** (M6.17.2 notes): a fortified compound bristling with
  automatic weapons and rockets - machine guns of every weight (SMGs, LMGs,
  mounted HMGs) and rocket launchers. Needs, in the order they would be built:
  new weapon families in loadout.js (`lmg`: big magazine, heavy, slow to bring
  up and reload, steady prone/mounted; `hmg`: emplaced, not carried - a guard
  or you on it, a firing arc; `launcher`: one rocket, a slow projectile with a
  blast, the pack's Grenade_1/2/3 launcher models); guard ARMS for each
  (suppressing fire: long bursts at where you were, not only at you); mounted
  guns as fixtures (an HMG nest, sandbags, a turret's arc - the training
  course's turret bay is the start of this); cover that breaks (a rocket
  through a thin wall or sandbags); walls, towers, gates and a yard to cross -
  the routes in around the guns, not through them.
- **Drugged: the level turns non-Euclidean** (Rhys, after M6.17.8, setting
  open): you have been drugged or poisoned, and the place stops adding up -
  a corridor longer inside than out, a door that opens back into the room you
  left, stairs that climb to the floor you started on, a room that is a
  different room each time you look away, windows onto the wrong view. Can be
  done here: portals (a doorway that draws, and walks you into, somewhere
  else - a second camera rendering the far side), rooms swapped while out of
  sight (the level is code; swapping a room's contents is cheap), and loops
  (a corridor whose end teleports you, seamlessly, to its start). The effect
  wears off as the drug does - the way out is finding the antidote, or
  waiting it out while not getting caught. Pairs with the "wrong place, wrong
  time" missions below.
- **Mineshaft** (Rhys, after M6.17.8): a working or abandoned mine - timbered
  tunnels, a cage lift down the shaft, ore carts on rails, a pumping station,
  and the open pit where it has been bored down: a gigantic gaping hole, its
  sides terraced with haul roads spiralling down (the casino's coil, outside
  and enormous). Needs: dark (torches, night vision, thermal for the warm
  machinery), a working lift, rail carts, falls to fear.
- **Manor House and its estate** (Rhys, after M6.17.8): the full estate - the
  house with its servants' quarters (back stairs, the servants' corridors and
  bells, the kitchens below stairs), the family's rooms above, a library,
  gallery, chapel, cellars; the grounds: gardens, stables, a gatehouse, a
  walled kitchen garden, outbuildings; and a private forest behind it (the
  first real woodland: cover, paths, a gamekeeper's hut). The back stairs and
  servants' passages are the hidden way through the house.
- **A train** (Rhys, after M6.17.8): the station you board at (concourse,
  platforms, footbridge, ticket barriers, the crowd), then the train itself -
  carriages to move through (a long thin level), the roof, the gaps between
  carriages, the guard's van, the engine; a moving world outside the windows.
  Possibly one of the **"wrong place, wrong time" missions**: not a mission
  at all - you just happened to be there when it went bad (a hijack, someone
  on board being hunted), with only what you were carrying.
- **Places for the other visions** (M6.17.6 notes: "We also need
  maps/scenarios that justify the other Visions [IR, UV, EMF]"). Each vision
  needs somewhere it is the best way through, not just a filter:
  - **Thermal (IR)**: a refinery or chemical works at night in a smoke-filled
    fire (people only show as heat through smoke and steam), or a jungle or
    reed-bed camp where guards lie in cover; warm engines and bonnets tell you
    which vehicles have just arrived; a recently fired gun barrel glows;
    footprints on a cold floor fade over seconds - a trail to follow; a body
    still warm says how long ago someone passed.
  - **UV**: a crime scene or safehouse sweep - blood wiped from a floor,
    cleaned-up fingerprints on a keypad (the worn keys give the code), a
    marked route on walls in invisible ink left by an informant, forged
    banknotes in a vault (the casino's counting room could use this), a
    tagged courier whose handprints show which doors he went through.
  - **EMF**: a bugged embassy or a corporate tower - hidden cameras and
    microphones in walls (find and cut them before you talk to a contact),
    wiring in the walls leading to a hidden safe or a panic room, live
    tripwires and pressure plates, a phone in a guard's pocket, a server
    room behind a false wall, a car bomb under a vehicle; guards' radios show
    which are in contact (take the quiet ones first).
  - One map could use all three: a **research facility** (Rhys: "a fantastic
    idea for all 3") - thermal through the
    cold-store mist, UV for the lab's spill trail to the missing scientist,
    EMF for the shielded room where the data is kept.
  - **Pipes and steam** (Rhys, after M6.17.7: somewhere "the hot-water pipes
    / steam pipes are useful, prompting the Thermal/IR usage"): a boiler house,
    a hospital or hotel basement plant room, a power station, a district-heating
    tunnel, a laundry, a ship's engine room. On thermal the hot pipes show
    where they run through walls and floors - a map of the building's insides:
    follow the warm line to a hidden room, a crawlspace, the boiler a saboteur
    must reach. Steam leaks and vents fill corridors (blind in normal vision;
    on thermal people show through it, but so does the steam's heat near a
    vent - a glare to look past). Valves to shut or open: vent a corridor
    full of steam as cover, scald a guard post, or cool a pipe so it stops
    hiding a body's heat behind it. Guards warming hands by a pipe glow
    brighter. Lagging (insulation) hides a pipe's heat - and anything behind it.
    It could be a wing of the research facility (its plant room), or its own
    mission.

## Noted at M6.17.10
- Casino: the reds now keep off the coil, so they cannot change between the
  ground floors and the upper ones (the coil is the only way). If they should
  come up after you, give the building a staff stair (G-1-2) for them.
- Other GooseKnight game ideas (the rocket builder) are in `GOOSEKNIGHT_IDEAS.md`.

## Noted at M6.17.11 (Rhys)
- **The coil** is ~1 km of corridor (5.75 turns, 173 m a turn), every floor entered
  from the west. Options put to Rhys: (a) half-floor landings on the east side -
  where the coil is 2 m above a floor, short stairs down to it and up to the next,
  so you can get off every half turn; (b) a livelier coil - windows out over the
  city, alcoves, a security post before the vault floor, colour by floor, cut-outs
  over the atrium, cover; (c) a steeper coil, half a turn per floor, so floors
  alternate west and east. A second, counter-clockwise coil in the same band
  cannot work: the two would cross twice a turn with ~2 m headroom.
- **Weapons that look different**: five pistols share one model, three
  automatics another, three rifles a third, every utility the grenade. The fix is
  more models (free CC0 packs), with per-weapon finishes meanwhile. Rhys's images
  can become surface textures (walls, floors, carpets), not 3D models.
- (M6.17.12) The coil got option B (dressing). C (steeper) declined: Rhys likes not
  noticing the climb. A (east half-landings) remains the shortcut if it still drags.
- (M6.17.13) Terminals are now expected wherever a desk has a screen (Rhys): the
  casino's security post hacks the vault doors open and shows the reds. More to
  come: download intel, cameras, alarms off. Lying to the Yellows about the locket
  could have later consequences (Ghost hears of it; the Yellows remember).

## Next levels (discussed after M6.17.13)
- **The train** ("wrong place, wrong time", not a Ghost assignment) first. The
  moving part can be done the old way: the train stands still and the world
  outside it moves (scenery, tunnels, stations streaming past), so walking,
  shooting and guards work as they do now. A platform/station stage, then the
  train under way; carriages to fight through, roof optional. Builds toward M8
  (vehicles) and gives M7 a mission that is not handed out by Ghost.
- **The drugged / non-Euclidean level** after: impossible spaces by seamless
  swaps of identical rooms out of sight (no portal rendering needed): corridors
  that loop, rooms bigger inside, stairs back to where you started, doors that
  open somewhere else; plus screen effects for the drug. Heavy on level design.

## The Night Train - the plan (M6.18.0 onward)
Rhys's brief: an intercity between two fictional cities (Severia: Novomir -
Belyagorsk), underground sections; off duty and unarmed; hijacked, someone
important aboard; retake the train, protect the VIP, ideally the bystanders; an
armed guard may hand you his sidearm; it starts at the station.
1. **Done (M6.18.0)**: the station, the train, boarding, the run (the world moves).
2. **The people**: passengers in their seats (and some standing, in the buffet),
   reacting to trouble (duck, cower, flee down the train); the transport police
   officer (on the platform, then aboard) and the reasons he might hand you his
   sidearm; the VIP in first class with an aide or bodyguard.
3. **The hijack**: in the city tunnel or at an unscheduled stop, the hijackers
   take the cab and the van, close the ends, announce themselves; the VIP is their
   aim; passengers held. Ambient sounds: the rails, the tunnels' roar.
4. **The takeover**: fight forward coach by coach (tight, with civilians in the
   way), free the cab, stop or control the train; outcomes (VIP, passengers,
   the officer, how it ended), trophies, the debrief.
5. Later: the roof (in the open stretches), a bridge, a passing train.

### Rhys's answers (after M6.18.0)
- **The VIP**: a Minister of Severia - Belyagorsk Province's representative.
- **The hijackers**: a new faction to the player - an insurgency within Severia,
  desperately unhappy with something that has happened, or is proposed, or failed
  to happen (to settle: what, and their name and colour).
- **The armed guard**: you earn his sidearm. He cannot tell you from a civilian
  "hero" or a hijacker until he sees you do something that proves it.
- **The ending**: bring the train safely into Belyagorsk, where the armed police
  are waiting.
- Done in M6.18.1: bullet nose, the view ahead, the city, four platforms, Cyrillic,
  the ticket inspector, the 21:40 by the clock.

### Settled after M6.18.1 (Rhys)
- **The insurgents**: the **Front of Memory** (Фронт Памени, *Front Pameni*), in
  **dark grey** (Ghost is black). Their grievance: Belyagorsk Province's election
  was stolen, and its history is being erased (the 1952 monument to the Mountain
  Fighters taken down this week).
- **The Minister**: **Tamash Dravets**, Minister for Belyagorsk Province, on the
  21:40 tonight to open a hospital there tomorrow (the evening paper says so).
- **The journey** (to build): about 15-20 real minutes, Novomir to Belyagorsk,
  hijack included; today the line runs on without end.
- Done in M6.18.2: an inspector at every gate (the wrong one sends you to 3); a
  takedown of railway staff, a witness and the police; the kiosk's coffee and the
  evening paper in Severian; sitting in your seat; a densely built city.
- Done in M6.18.3: the street closed by buildings; a dot-matrix departures board;
  Severian-accented voices; the announcement in Severian, then English.
- Done in M6.18.4: the game's own fonts (every Severian letter Rhys listed renders, the
  double grave too); the board's lamp font; plain English voices (the announcer Severian).
- Done in M6.18.5: one body for the train, a lofted aerodynamic nose; the band off the doors;
  sit in the nearest free seat (port wins a tie), again until the hijack.
- Done in M6.18.6: the journey's end - Belyagorsk - Alyejka Azvestya, ~18 minutes, the armed police
  on the platform; a success when you step off. No time accolade on the train (Rhys).
- Done in M6.18.7: the hijack - six of the Front of Memory out of the tunnel, the Minister held in
  first class, the guard's pistol earned; Minister dead = partial.
- **The branch (Rhys)**: Minister killed → the Front of Memory take Belyagorsk City and make it their
  stronghold - you have to deal with them in later levels. Minister protected → the Front are rooted
  out and arrested; a few loyalists hold on - rarely seen again. (Saved as `outcome.front`.)
- Done in M6.18.10: the 18 minutes a ceiling - with the six down, the rest of the journey passes (sit,
  or wait 45 s); the guard's cut-off call from the van; the cab's view over the nose; parcels, not Ghost's.
- Done in M6.18.11: signs readable both ways; the board framed; the Minister seated; the hood's clean
  edge; the guard's calm, coded call ("Inspector Pesak to the guard's van").
- **Next for the train**: Rhys's broad notes (M6.18.9 onwards); passengers; the Front's own voices.
- **To come from Rhys**: a real Severian language - to replace the placeholder Severian
  in the paper, the signs, the board and the announcement.

## The first drafts (Rhys, after M6.18.11: "ALL the other levels") - the plan and where it stands
Built with the level kit (src/game/levels/kit.js), a spec each in src/game/levels/. Order agreed:
1. Ready now, in threes: **Sewers (5), Bank (6), Cemetery and Crypt (7)** - M6.19.0; **Housing
   Estate (8), Manor House (9), Mineshaft (10)** - M6.19.1; **Research Facility (11),
   Assassination (12), the Ward (13)** - M6.19.2; **the Campus (14)** - M6.19.3; Research Facility (IR/UV/EMF + plant room),
   Assassination, the drugged non-Euclidean level (not the real world); the Campus as one map.
2. One new system each: **Shipyard (15), Fortress (16), the Drop (17)** - M6.19.4.
3. Battle mode: **the Beachhead (18), the Factory: Battle (19)** - M6.19.5. Rhys's notes on 5-19 fixed in M6.19.6 and M6.19.7
   (the kit's shared faults first; classes to choose before a battle and on each death: Rhys, later).
4. Vehicles: the Riverboat Pursuit, vehicle missions.
5. Big settings: **Busy City (21), Desolated City (22), Nuclear Wasteland (23)** - M6.20.3.
6. The mood boards: **theatre (24), swimming baths (25), ancient temple (26)** - M6.20.4; **mega-prison (27),
   bunkers (28), colosseum (29, a battle)** - M6.20.5; **neon nightclub (30), airport (31), desert outpost (32)** -
   M6.20.6; **space port (33), subway (34)** - M6.20.7. The list is done.
7. Loadouts: **any gun in either slot, weight, the briefing's loadout picker, the Special slot** - M6.20.8;
   **ammunition and mod weight, Rhys's seven classes (quick-select presets with a Special each), their kit** - M6.20.9.
   The class weapons as Rhys's weapons sheet has them, and energy weapons (heat) - M6.20.10. Rhys's notes on them
   (a class on every fall in battle, retreat, classes for everyone, restricted lists, fire, ammo dumping) - M6.20.11. The rest of the sheet
   (84 weapons, ten makers) - in, M6.25.0: captured in the field, or (to assign) from missions.
   Characters (B(ii): one signature item or trick each) - Rhys to draft, later.
Then the **hub map** (Rhys: after the levels exist) - each level a place you find in it. Rhys (M6.20.8):
Yard 7 is Ghost HQ - an underground laboratory and command centre (the briefing room, the trophy cabinet),
a helipad, a van or chopper out to a level (or fast travel across a semi-open world). Structure (Rhys, M6.20.9: "happy with
the Hub Structure"): Yard 7 the hub; Assignment -> Loadout -> Mission -> Debrief; the van or chopper fast travel;
the Train off duty between assignments; the Ward a story event. Battles: B(i) now, B(ii) later, classes as
quick-selects (done, M6.20.9).
Almost all are Ghost assignments; the Train is off duty; the drugged level is outside the real world.
**Remind Rhys:** the real Severian language, when he has it, replaces the placeholder Severian.
