# Frontline — start here (handover pack, M6.12.2)

A browser espionage game by **GooseKnight Gaming** (Rhys), built with an AI
assistant. Live at **gooseknightgaming.github.io/Frontline**. Current build:
**M6.12.2**.

## What is in this pack
| File | What it is |
|---|---|
| `README_START_HERE.md` | This file |
| `FRONTLINE_PROJECT.md` | **Read first.** What the game is, how it is built, the file map, what works, testing, the lessons learnt, the fiction, where to pick up |
| `FRONTLINE_ROADMAP.md` | Everything asked for and not yet built |
| `FRONTLINE_HANDOVER.md` | The full change history, newest first: every release and why |
| `FRONTLINE_ASSETS.md` | Every asset pack received, what is in it, what is used |
| `Frontline_Weapons.xlsx` | The armoury: 98 weapons, statted, with a legend |
| `frontline_source.zip` | The complete source: `src/`, `test/`, `tools/`, `maps/` (Rhys's map spreadsheets), `build.mjs`, `assets/` |
| `Frontline_Map_Template.xlsx` | The blank map template (Google Sheets): one square = 1 m, colour codes, guards tab |
| `build/` | The current build, ready to upload: `index.html`, `controls.html`, `game.js`, `bakecheck.html`, `bakecheck.js`, `assets/` |

The Dungeon Remembers (Rhys's other game) is **not** in this pack.

## Where things stand
- **Yard 7** (training compound) and the **training course** beneath it are
  done: movement incl. parkour, weapons, loadouts, doors, radar (shows only
  what you know), saves, sound, music.
- **The operative**: Quaternius Universal Base Character on the 65-bone
  Universal rig, dressed in the Fantasy pack's Ranger outfit recoloured as
  field kit, animated from the Universal Animation Library 1 and 2.
- **Level 0 — Training Mission** (M6): Meridian House, a three-floor office
  block held by the reds. Keycard, reinforced server room, breaching (kick or
  charge) with bullet time, ten guards, hints, end screen, hidden trophies
  (No Casualties, Unseen, No Witnesses, Sharpshooter — hidden until earned).
- **Guards notice you** (M6.1.0, stage 2): sight, hearing, awareness,
  searching where you were, the alarm.
- **Guards shoot back and speak** (M6.2.0, stage 3): bursts, reloads, fair
  accuracy, carbines in hand; lines spoken by the browser's speech.
- **Ranks, weapons and temperaments** (M6.3.0): guard / sergeant / officer by
  hat; carbine, pistol, marksman; bold responders and steady station-keepers.
- **Takedowns and the debrief** (M6.5.0).
- **Baked lighting** (M6.6.0, reworked M6.8.0): Meridian House is baked -
  chunked lightmaps, a lit stairwell, a proper top-floor ceiling, soft bounce
  fill. Yard 7's underground (course, galleries) is baked
  too since M6.8.2; the open yard stays live-lit. A one-time notice pointing to Low Quality when the
  frame rate struggles.
- **Level 1 — Riverside Hotel** (M6.9.0, being built from Rhys's map a floor
  at a time): `index.html?level=1`, or the title screen. **Built so far**:
  the basement and the sewer (a way in by the manhole), ground to third floors and the roof, the stairs, the lift (G, 1, 2), the
  city, river and garden, the CCTV console and nine cameras. It is **night**
  (9 July 2026, 22:47) and the hotel's **power is cut**: night vision (V).
  The Estate Room safe (combination 1962, hidden in camera glitches 2, 4, 6,
  8 - or crack it by ear, or blow it) holds the Room 207 key; the Roof key is
  on the third floor's breakfast bar; the enemy helicopter hovers off the
  roof with a rope ladder. **No guards or hostages yet.**
- **Next: the agreed plan** (roadmap, "The plan"): 1 baked lighting (the course), 2 the
  hotel's new systems, 3 Riverside Hotel (Rhys's map, in `maps/`), 4 factions
  and ally AI, 5 battle mode and the Derelict Factory (his other map),
  6 PvP (needs a server).

## Pick up here (the next chat)
Say: "Frontline handover, M6.12.2. Read README_START_HERE.md, then carry on."
Next on the hotel, in order (Rhys agreed this order):
1. ~~The basement and the sewer~~ - done in M6.9.25 (lighting fixed M6.9.28).
2. ~~The guards~~ - in M6.10.0, first playtest fixes in M6.10.1 (torches on
   the guns, goggles, cowards that run, prompts, the lift starting stopped,
   frame rate). Rhys's second look at them is due.
3. ~~The hostages~~ - in, M6.11.0 (free, follow, wait, to the police cars; a death ends it). Lift, sewer, ladders, doors and shoving added in M6.11.1; the mission ends back at the APC.
4. **The enemy captain's escape** by the helicopter (P13 runs to the roof -
   P13A - the gap in the north parapet and the rope ladder are there).
5. Then the other new systems one by one (roadmap): lockpicking, torches as
   a mod, the clock-glitch puzzle variants for a future level, and so on.
Check early: **the torch pools** (M6.10.2: no more cones) and **the hotel's frame rate with the reds in** (M6.10.0 fell to
10-18 fps on Rhys's Chromebook; M6.10.1 took out the torch spot lights and made
rays 3x cheaper - his numbers decide what next), and whether the torches on the
guns, the goggles and the fleeing cowards read right on screen.

## How to work (Rhys's rhythm)
Upload → playtest → notes → update → upload, **quickly**. Each update:
1. Make the changes; answer each playtest note point by point, with the cause.
2. Run the **Node suites only** (about 30 s):
   `for t in sim course weapons anim saves contacts mission0 detect fight voice light hotel; do node test/$t.test.mjs | tail -1; done`
   (380 tests). Break new features on purpose to check their tests can fail.
3. Bump the version in `src/game/main.js` (`M‹milestone›.‹feature›.‹patch›`),
   `npm install && node build.mjs` → `dist/`.
4. Update `FRONTLINE_HANDOVER.md` (new entry at the top) and, as needed, the
   project book and roadmap.
5. Hand over `index.html`, `game.js`, `controls.html` — plus any asset that
   changed, **saying which folder it goes in** (e.g. `assets/characters/`).

The **browser suite** (`python3 test/browser.test.py`, needs
`cd dist && python3 -m http.server 8099`) takes 10+ minutes in the sandbox
(one CPU, software rendering): milestones only. When using a browser in the
sandbox: start the server with `setsid nohup`, never leave a timed-out
Playwright run behind (stray browsers starve the CPU), remember real key
presses only reach the game on the normal page (not `?test`), test new
screens the way a player meets them, and put silent placeholder MP3s in
`dist/assets/music` locally — then delete them before packaging.

## Uploading a build (GitHub web)
The repository root holds `index.html`, `controls.html`, `game.js` and
`assets/` (`ui/`, `weapons/`, `characters/Operative.glb`, `sfx/`, `music/` —
the 12 music tracks live only in the repository, not in the source). A file in
a subfolder is uploaded from inside that folder (Add file → Upload files).

## Rebuilding the operative
`tools/recolour_outfit.py` → `tools/dress_operative.mjs` →
`tools/build_operative.mjs` (needs `@gltf-transform/core` and `functions`).
They need Rhys's original zips (Universal Base Characters, Universal
Animation Library 1 and 2, Modular Character Outfits – Fantasy), which are
too large for this pack: ask for them again if the model has to change.
`assets/characters/Operative.glb` is already built.

## Credits (must stay)
Models: Quaternius and Kenney (CC0). Voices: VoiceBosch (CC BY-SA 4.0), Kurt (CC BY 3.0), via OpenGameArt; Kenney (CC0). Sound effects: Kenney (CC0). Music: Kevin MacLeod (incompetech.com),
CC BY 4.0. Everything is credited on the Credits screen (title menu): keep it complete. Water sounds: OpenGameArt (CC0).
