# Frontline - where the code is

Made from each file's opening comment by `python3 tools/code_map.py`. The rules (`src/sim/`) never draw; the game (`src/game/`) draws and plays them.

## `src/game/` - The game in the browser

| File | Lines | What it is |
|---|---|---|
| `main.js` | 2544 | the game in the browser: main.js starts it, builds the level you asked for, and runs it. |

## `src/game/core/` - Input, sound, music, voices, saves

| File | Lines | What it is |
|---|---|---|
| `audio.js` | 404 | sound, made in code. |
| `camsmooth.js` | 22 | camera height smoothing. The body moves in hard little steps (a stair, a crate edge); the eyes should not. The camera height follows the body on a critically damped spring: it speeds up and slows down smoothly instead of lunging a… |
| `input.js` | 191 | settings and input. Chromebook-first: no mouse wheel, no second mouse button required, and nothing that fights the browser (Ctrl, Tab and the Search key are left alone). Every action can be rebound. |
| `music.js` | 90 | music. |
| `saves.js` | 187 | saved games. |
| `severian.js` | 73 | Severian, from Rhys's reference (Severian.docx, Severian Cases.xlsx, the alphabet and romanisation sheet: his early draft, M6.20.12). The language's text lives here, kept apart from its English, exactly as Rhys spelled it - combin… |
| `spoken.js` | 178 | lines recorded rather than spoken by the browser (Rhys: "Still a significant delay between subtitle and audio"). The browser's speech can take a second or more to start; a recording plays the moment its words go up. Made with Pipe… |
| `trophies.js` | 46 | trophies: hidden achievements. Nothing lists what exists; you find out by earning one. Each save slot is its own run (Rhys: "each save slot is its own run"), so each slot has its own trophies, kept in the browser under the slot's … |
| `voice.js` | 235 | voices. |

## `src/game/draw/` - Drawing: the scene, people, weapons, vehicles, the HUD pictures

| File | Lines | What it is |
|---|---|---|
| `character.js` | 261 | the people you see: you in third person, every guard, hostage and passer-by. Drawn in code (Rhys: "I'd actually prefer the characters code-drawn rather than from asset-packs"): a low-poly body on a skeleton of joints (draw/puppet.… |
| `devices_view.js` | 66 | how the defence systems look (sim/world/devices.js): a camera body on its bracket, a turret head on its pedestal (or hung from a frame), a maglock's keypad through the door's jamb, a breaker panel, an alarm bell - each with a ligh… |
| `gun_models.js` | 157 | weapons drawn in code (M6.29; the "weapon models beyond the four Quaternius ones" still to do): until now every gun on Rhys's sheet borrowed one of four models - a pistol, an assault rifle, a sniper rifle, a grenade launcher - so … |
| `ladders.js` | 42 | a ladder you can see the rungs of. |
| `matrix_font.js` | 118 | a dot-matrix font (Rhys: the departures board "is a bit blurry - certain letters don't quite render properly"). Each letter drawn lamp by lamp, 5 wide and 7 high, capitals only (as such boards are): Latin, Cyrillic, and Severian's… |
| `minimap.js` | 165 | the minimap. |
| `props.js` | 50 | models placed in the world as scenery (vehicles, for now). |
| `puppet.js` | 322 | a person drawn in code: a smooth, rounded body on a skeleton of joints, as one skinned mesh (one draw for the whole body), coloured by vertex. The joints are moved by poses from src/sim/people/poses.js. |
| `render.js` | 873 | turns level data into a PlayCanvas scene. Static geometry is merged into one mesh per material (few draw calls, kind to a Chromebook). A cheap "baked" look comes from shading painted into the vertices: surfaces darken toward the g… |
| `scope.js` | 39 | what you see through a sight (Rhys: "including when alt-aiming, if the scope has iron-sight or a reticule, that'd be nice to look through too"). Pure: a string of SVG for each kind (weapons_view.js scopeKind), drawn over the view;… |
| `textures.js` | 760 | textures, painted in code at start-up. No image files: every surface is drawn here, so it all belongs to the game. |
| `vehicle_models.js` | 669 | vehicles, built in code. |
| `weapons_view.js` | 680 | the visible side of weapons: the thing in your hands, the targets on the range, grenades in the air, muzzle flashes and blasts. |

## `src/game/levels/` - The levels and what runs them

| File | Lines | What it is |
|---|---|---|
| `casino.js` | 1221 | Level 3, the Casino (Rhys: "can we set about building the Casino next please (including the smooth/circular walls?)"). |
| `casino_fit.js` | 1113 | the casino's second pass (Rhys's notes on M6.15.0). Its floors, holes, spiral stairs and pool; its walls smoothed out of the map's pixel staircases; and its furniture - gaming tables of every kind, chairs and stools, the bars, the… |
| `course.js` | 186 | the training course. |
| `factory.js` | 268 | Level 2, the Derelict Factory (Rhys: "I'm getting bored of the Riverside Hotel... let's build up some of the other maps"). |
| `hotel.js` | 2179 | Level 1: the Riverside Hotel, built from Rhys's map (maps/Frontline_Map_Riverside_Hotel.xlsx -> tools/map_to_json.py -> src/game/levels/maps/riverside.json). Built a floor at a time (the ground floor), the new systems added step b… |
| `hotel_intel.js` | 87 | the Riverside Hotel's intel (Rhys: "I would like some LORE in the rooms please"). Papers left lying about: not needed to finish, but each one says something about who is here and why - and some of it will matter later (the captain… |
| `hq.js` | 245 | Ghost HQ, under Yard 7 (Rhys: "Yard 7 is Ghost HQ - an underground laboratory and command centre (the briefing room, the trophy cabinet), a helipad, a van or chopper out to a level"). |
| `hq_security.js` | 138 | Yard 7's own security, and the day someone else takes it (Rhys's roadmap, "Hacking and control": "it works both ways - an enemy hack can turn Yard 7's own turrets on you, which is the first proper reason for a terminal room under … |
| `kit.js` | 1039 | the level kit (Rhys: "put together ALL the other levels I've asked for, so that I can play through the game and give pointers on each individual level"). |
| `mission0.js` | 473 | Level 0: the training mission. |
| `mission_runtime.js` | 2318 | running Level 0 in the game: the guards' bodies, the keycard, the terminal, breaching and bullet time, the hints, and the end. main.js calls in at a handful of points; the rules live in src/sim/play/mission.js. |
| `ranges.js` | 501 | the weapons half of the training course. |
| `train.js` | 1115 | Level 4, the Night Train (Rhys: "An intercity train that has underground sections. It travels between two fictional cities in a fictional country 'somewhere near the former USSR'... You're off duty, enjoying yourself... [it] defin… |
| `yard7.js` | 609 | Ghost Training Facility, "Yard 7". A grey-boxed container yard for learning to move: vault lane, climb wall, crouch duct, stairs and catwalk, a dive tower over a deep pool, drop platforms; the training course and the ranges beneat… |

## `src/game/levels/drafts/` - The first-draft levels (specs for the level kit)

| File | Lines | What it is |
|---|---|---|
| `airport.js` | 175 | Level 31, the Airport (first draft). From Rhys's location boards (part 2): "Airport - exteriors, interiors, props and furniture". Varnholm Airfield, after the last flight: the terminal - the check-in hall, security, the departure … |
| `archive.js` | 133 | Level 37, the Archive (first draft, M6.29). From Rhys's environment-pack concept sheet: "Library/Archive". The Halloran Library after dark: the Yellows are in, they have its security, and their safe-cracker is at the rare books va… |
| `arena.js` | 166 | Level 29, the Colosseum: Battle (first draft). From Rhys's location boards: "Colosseum / Arena - arena equipment, seating and spectators". Varnholm's old amphitheatre, the Arena Vetera: the oval of sand, its podium wall, two tiers… |
| `bank.js` | 101 | Level 6, the Bank (first draft). Rhys: "a bank with a vault". The Yellows are in the Merchants' Exchange Bank after hours, cutting their way to the vault - and in the vault, box 114, is a dossier with Ghost's name on it. |
| `barracks.js` | 112 | Level 41, the Barracks (first draft, M6.30). From Rhys's location boards (part 2): "training barracks". Camp Dravik, where the reds train their own special forces: four barrack huts round a parade ground, the mess hall, the armour… |
| `baths.js` | 145 | Level 25, the Swimming Baths (first draft). From Rhys's location boards: "Swimming Baths - pool area, changing rooms, pool equipment". The Corporation Baths, Varnholm: the big pool under its glass roof, the diving board at the dee… |
| `beachhead.js` | 187 | Level 18, the Beachhead (first draft): a battle map, from Rhys's sheet (maps/Frontline_Map_Beachhead_Prelim.xlsx, via tools/map_to_json.py -> src/game/levels/maps/beachhead.json). His Info tab: "Battle Map; 10 minute timer; 100 re… |
| `bunkers.js` | 156 | Level 28, Bunkers and Open Ground (first draft). From Rhys's location boards : "Bunkers and Open Space - bunker interiors, defences and fortifications, military equipment". The Kessel Line: an old defence line across a mountain va… |
| `campus.js` | 275 | Level 14, the Campus (first draft). Rhys (after M6.12.1): "a fictional campus based on [Edge Hill's] layout - renamed, no crest or real signage, rearranged where it helps play", built from his descriptions of each building; the wh… |
| `cemetery.js` | 107 | Level 7, the Cemetery and Crypt (first draft). Rhys: "a cemetery and crypt". The Yellows run their messages through a dead drop in the crypt under St Aldric's chapel; their courier, who dresses as a priest, keeps the cipher book d… |
| `city.js` | 247 | Level 21, the Busy City (first draft). Rhys (after M6.13.7): "Busy City; Desolated City; Post-Apocalyptic Nuclear Wasteland" - and (M8) vehicle missions. Varnholm's commercial district at midday: a grid of blocks, towers on them, … |
| `drop.js` | 106 | Level 17, the Drop (first draft). Rhys: "a sky-dive / paratrooper mission - or at least a mission that starts with a jump from a plane, a helicopter or the like". You start in the hold of a transport over the sea, its ramp down: w… |
| `embassy.js` | 124 | Level 40, the Embassy (first draft, M6.30: a level built round the disguise). The reds' embassy on Linden Row, the night of its autumn reception. You go in as one of them - in a red officer's uniform - and walk among them: from a … |
| `estate.js` | 130 | Level 8, the Housing Estate (first draft). Rhys: "several houses, tightly packed - terraced, detached and semis; ordinary houses and bungalows; a corner shop, garages... one an 'upside-down' house - bedrooms on the ground floor, k… |
| `facility.js` | 158 | Level 11, the Research Facility (first draft). Rhys: "maps/scenarios that justify the other Visions [IR, UV, EMF]" - and of a research facility, "a fantastic idea for all 3": thermal through the cold store's mist, UV for the lab's… |
| `factory_battle.js` | 75 | Level 19, the Factory: Battle (first draft). Rhys's factory sheet was always a battle map (maps/Frontline_Battle_Map_Factory.xlsx: "Valid Spawn Point for Ghost / for Yellow" in the corner rooms) - Level 2 played it as a mission un… |
| `fortress.js` | 115 | Level 16, the Fortress (first draft). Rhys: "a fortified compound bristling with automatic weapons and rockets - machine guns of every weight (SMGs, LMGs, mounted HMGs) and rocket launchers... walls, towers, gates and a yard to cr… |
| `index.js` | 41 | the first-draft levels, in play order. Each is a spec for level_kit.js; index.html?level=<id> plays one. Rhys may reorder them: their numbers are only labels. |
| `listening.js` | 158 | Level 35, the Listening Station (first draft, M6.28: a level built round hacking and control). Skarvik signals station, on the cliffs: the reds' ears. Its program, LANTERN, is what traced Ghost's hacks back to Yard 7 - and the arc… |
| `manor.js` | 183 | Level 9, the Manor House and its estate (first draft). Rhys (after M6.17.8): "the full estate - the house with its servants' quarters (back stairs, the servants' corridors... the kitchens below stairs), the family's rooms above, a… |
| `mine.js` | 135 | Level 10, the Mineshaft and the open pit (first draft). Rhys (after M6.17.8): "a working or abandoned mine - timbered tunnels, a cage lift down the shaft, ore carts on rails, a pumping station, and the open pit where it has been b… |
| `nightclub.js` | 132 | Level 30, the Neon Nightclub (first draft). From Rhys's location boards (part 2): "Neon Nightclub - exteriors, interiors, props and furniture, VIP". Club VELVET on the waterfront strip: the queue under its neon, the door; the danc… |
| `outpost.js` | 149 | Level 32, the Desert Outpost (first draft). From Rhys's location boards (part 2): "Desert Outpost - exteriors, interiors, props and equipment". Outpost Kharun, in a canyon in the Shael: a ring of sand-filled barriers round a compo… |
| `prison.js` | 184 | Level 27, the Mega-Prison (first draft). From Rhys's location boards: "Mega-Prison - cells and blocks, security". HMP Greyhallow: A Wing - four tiers of cells round a hall open to the roof, the galleries along the cell fronts, two… |
| `riverboat.js` | 147 | Level 20, the Riverboat Pursuit (the first vehicle mission; M8 begins). From Rhys's Riverside Hotel notes: the reds' leader "flees ... at the first sign of danger; the mission runs straight on into a Riverboat Pursuit (no extracti… |
| `ruins.js` | 217 | Level 22, the Desolated City (first draft). Rhys (after M6.13.7): "Desolated City". Drosk, two winters after the fighting moved on: nine blocks of a city nobody lives in - towers broken off at different heights, rubble down the st… |
| `sewers.js` | 84 | Level 5, the Sewers (first draft). Rhys: "a proper, full map set in the sewers, not just a partial of a different map". The reds have been moving guns under the city; a water engineer who found their depot has not come back up. |
| `shipyard.js` | 117 | Level 15, the Shipyard (first draft). Rhys (after M6.13.1): "a shipyard / battleship - something with massive closing blast doors that ordinary C5 cannot breach (a heavier charge, the controls, or a way round)". Varrow Naval Yard:… |
| `spaceport.js` | 179 | Level 33, the Space Port (first draft). From Rhys's location boards (part 2): "Space Port / small orbital station - exteriors, interiors, props and equipment". The Teskel launch complex on the coast: Pad 2 - the rocket on it, the … |
| `subway.js` | 129 | Level 34, the Subway (first draft). From Rhys's location boards (part 2): "Subway / Underground station - exteriors, interiors, props and furniture". Holm Street station, after the last train: the street with its two entrances, th… |
| `temple.js` | 145 | Level 26, the Ancient Temple (first draft). From Rhys's location boards: "Abandoned Ancient Temple - ruins and statues, archaeological props". The temple of Ix Tolun, in the jungle: a stepped pyramid - its Hall of Pillars inside, … |
| `testrange.js` | 71 | Level 39, Q's Test Range (first draft, M6.29; the roadmap's "breaching and hacking mechanics and training"). A short course of rooms in a disused warehouse Q Branch uses to try things out: each room one of the security systems, in… |
| `theatre.js` | 149 | Level 24, the Theatre (first draft). From Rhys's location boards: "Theatre - seating, stage / backstage, props and decor". The Grand, on Varnholm's Opera Street: the foyer with its box office and bar; the auditorium, two storeys h… |
| `tower.js` | 140 | Level 38, the Tower (first draft, M6.29). From Rhys's environment-pack concept sheet: "Office (modular)". Varn Dynamics' headquarters, three floors round a stair core: a front company for the reds' arms money. The lobby, the cafe,… |
| `vantage.js` | 112 | Level 12, the Assassination (first draft). Rhys: "work your way to a vantage point in one building and take aim at a senior Red/Yellow from there" - a target who keeps a routine, a second building in sight of the first, a marksman… |
| `ward.js` | 132 | Level 13, the drugged level (first draft; M6.19.6, Rhys: "The Ward is trippy - that's good. But it needs to be much better - I need MORE non-Euclidean Geometry!"). Rhys (after M6.17.8): "you have been drugged or poisoned, and the … |
| `wasteland.js` | 167 | Level 23, the Nuclear Wasteland (first draft). Rhys (after M6.13.7): "Post-Apocalyptic Nuclear Wasteland". The Vell valley, downwind of the Hesk power station: grey dust, dead trees, the old highway full of wrecks, a village nobod… |
| `yacht.js` | 161 | Level 36, the Megayacht (first draft, M6.29). From Rhys's environment-pack concept sheet: "Megayacht (onboard)". The Salt Crown, seventy metres of her, moored stern-in at the end of the Port Aurel marina - the arms broker Ilya Cor… |

## `src/sim/people/` - People: you, guards, hostages, what they know

| File | Lines | What it is |
|---|---|---|
| `anim.js` | 154 | which animation the body should be playing. |
| `captain.js` | 169 | stopping the captain (Rhys: "time for the 'Stop the Captain' objective"). The Riverside Hotel's captain (P13) runs for his helicopter: through the roof door he locks behind him, up the ladder, across the roof to his post (P13A) - … |
| `contacts.js` | 70 | what you know about who is around you. |
| `dog.js` | 123 | the guard dog (M6.30; the roadmap's specialists: "a dog handler"). A dog keeps at its handler's heel. It does not see as a man does - it smells: you, near enough, it knows about, in the dark, in camouflage, round a corner (a close… |
| `factions.js` | 266 | who is against whom (Rhys: in the casino's Businessman's Suite "a Yellow Team of 3: Boss, and his two bodyguards. They are NOT naturally hostile towards YOU. Reds are naturally hostile to You AND Yellows ... You can therefore talk… |
| `guard.js` | 1278 | a guard (M6). Stage 1: he exists. Stage 2: he notices you. |
| `hostage.js` | 390 | hostages (the Riverside Hotel: "found, freed, escorted to the police, kept alive"). A hostage sits bound where the reds left him. E frees him (a moment's work, standing over him); then he follows you - the stairs, the corridors, o… |
| `hotel_guards.js` | 143 | the Riverside Hotel's reds, from Rhys's map. The Guards tab says who each man is (rank, weapon, temperament, notes); the floor sheets say where he stands (his P square) and the squares he walks (his route, R2, R3...). This turns b… |
| `player.js` | 1015 | the operative's body. Pure simulation: no graphics, no browser. Input goes in, a new state comes out, so every rule here can be tested exactly. |
| `poses.js` | 364 | how a body moves, written in code: every clip the game asks for (by the names anim.js picks), as joint angles over time. Pure: no drawing (draw/puppet.js turns poses into a moving body). |

## `src/sim/world/` - The world: shapes, doors, lifts, paths, light

| File | Lines | What it is |
|---|---|---|
| `bake.js` | 164 | planning the light bake (pure logic, no engine: tested in node). |
| `curves.js` | 268 | curved building (Rhys: "the Casino next please - including the smooth/circular walls"). The collision world is boxes, which keeps it exact and cheap; a curve is drawn as a true curve (quads, see render.js) and stood on or walked i… |
| `devices.js` | 225 | defence systems: cameras and turrets, and hacking them (Rhys's roadmap, "Hacking and control": "Defence systems - turrets, cameras, door locks, lights, alarms - can be taken over at a terminal or with a hacking kit: take control (… |
| `doors.js` | 330 | ordinary doors: a leaf on a hinge, opened and shut with E. |
| `drawcull.js` | 71 | who gets drawn (Rhys: "an enemy spawn in behind me from absolutely nowhere"). Nobody spawns mid-mission: the guard was there all along, just not drawn. Bodies were drawn only within 8 m, or within 42 m on your own floor - so a gua… |
| `earcut.js` | 687 | earcut 3.0.2 (https://github.com/mapbox/earcut), vendored for the casino's floors. ISC License - Copyright (c) 2024, Mapbox. Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is h… |
| `lift.js` | 199 | a lift: a car in a shaft, serving a list of floors, with sliding doors on every landing and on the car (the Riverside Hotel's lift at (21, 35)). |
| `nav.js` | 349 | finding a way through a building (for guards). |
| `perf.js` | 43 | noticing a struggling frame rate (pure logic, tested in node). Rhys plays in Low Quality on a Chromebook; a new player on a slow machine would not know the setting exists. If the frame rate stays low for a while in play (not in me… |
| `safe.js` | 62 | a safe with a combination dial (Rhys: "a 4-digit number that has to be cycled to, like a proper circular-tumbler safe - or blow the door off"). |
| `shapes.js` | 333 | shapes that are not boxes (the casino's second pass: round floors with round holes, smooth walls, oval tables, chairs turned to face them). Drawn as faces (render.js: quads and triangles, each with where it really is for the light… |
| `world.js` | 205 | collision world. Everything solid is an axis-aligned box. That keeps movement exact, cheap on a Chromebook, and testable without a graphics card. Water and ladders are volumes the player can be inside. |

## `src/sim/arms/` - Weapons and loadouts

| File | Lines | What it is |
|---|---|---|
| `emp.js` | 25 | an electromagnetic pulse (the sheet's VD-EMP "Blackout" launcher): it hurts no one, but for a while, within its reach, electronics stop - a guard's night vision or torch goes dark, a turret goes blind and quiet, an engine dies. Pu… |
| `issue.js` | 45 | what each side's guards carry, from Rhys's weapons sheet (sheet.js). |
| `loadout.js` | 623 | what you carry. |
| `sheet.js` | 116 | Rhys's weapons sheet (docs/Frontline_Weapons.xlsx), in the game's terms. WRITTEN BY tools/import_weapons.py - change the sheet and run that, not this file. (How the sheet's columns become these figures: the top of tools/import_wea… |
| `weapons.js` | 1022 | weapons (simulation only: no graphics, fully testable). Five basic weapons for training: knife, pistol, assault rifle, sniper, grenades and flashbangs. Everything here is deliberately simple; the feel gets tuned later. |

## `src/sim/play/` - Missions, story, the training course, battles

| File | Lines | What it is |
|---|---|---|
| `battle.js` | 107 | battle mode (Rhys's Beachhead sheet: "Battle Map; 10 minute timer; 100 reserve units per team; ends at the timer or when one team has zero in reserve AND zero in the field"). Two sides, each with a reserve: every man sent onto the… |
| `course.js` | 115 | the training course: one step at a time, with doors that open when you have shown you can do the thing. |
| `mission.js` | 198 | a mission: objectives, what you have found, how it ended. Pure logic. The level says where things are; this says what they mean. |
| `rewards.js` | 37 | the weapons a mission gives you for completing it (Rhys: "Most new weapons are found/captured in the field. Some are from completing particular missions"). |
| `skills.js` | 53 | the skills tree (M6.29; the roadmap's M7 "Skills tree"). Each run earns experience from its missions and battles; every so much experience is a skill point, spent at Ghost HQ (the training board by the operations table, or the men… |
| `story.js` | 201 | the story so far (Rhys: "time to make Mission Objectives independent from Mission Completion"). |

## `src/sim/vehicles/` - Driving

| File | Lines | What it is |
|---|---|---|
| `drive.js` | 211 | driving (the start of M8: "the Riverboat Pursuit, vehicle missions"). |
