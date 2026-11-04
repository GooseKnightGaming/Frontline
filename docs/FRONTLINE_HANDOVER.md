# Frontline — Handover (M6.83.0)

## Start here
A browser espionage game in PlayCanvas, hosted on GitHub Pages
(gooseknightgaming.github.io/Frontline). Everything is in the GitHub repository
GooseKnightGaming/Frontline: source in `src/`, tests in `test/`, notes in `docs/`
(`docs/CODE_MAP.md` lists every file). `npm install && node build.mjs` builds the
game into the repository's root.

## M6.83.0 — epilogues for fifteen more; Varnholm's file closed
- Epilogues for fifteen of the first drafts (5 - 34) that had none: the Sewers, the Bank, the Cemetery, the Manor,
  the Mineshaft, the Assassination, the Drop, the Desolated City, the Theatre, the Baths, the Temple, the Prison, the
  Nightclub, the Airport, the Outpost. Forty-four levels have one.
- With the case closed and every trail stamped, the case board says so (VARNHOLM: FILE CLOSED), and the next
  success after it earns the trophy Varnholm: File Closed.

## M6.82.0 — the story so far
- The case board's THE STORY SO FAR: every first draft done (success or in part) that has an epilogue, in level
  order, with the epilogue the debrief gave it - one fold to open.
- Epilogues for fourteen more: the case (35 - 41 but the test range), the blight's, the Codex's and the river's
  steps that had none. Twenty-nine levels have one.

## M6.81.0 — Level 64, Kessin Airfield; THE FIVE on the board
- `drafts/airfield.js` (64): a jet on the apron with the chief from Drosk aboard taxis east, round and off west after
  180 s - ground it from the tower's cab (holdOn 'tower', as the Airport) or stop it; take the chief from Kessin
  alive (capture; the lounge); optionally the flight plan (the tower). The trophy Grounded.
- The case board's sixth trail, THE FIVE (lodge, mast, gazette, airfield; stamped EXPOSED); the mission list's group
  for 61 on is THE FIVE.

## M6.80.0 — the trails in the debrief and the mission list; the controls page
- The debrief has a row for each story trail the mission is a step of: "n of 4 on the case board", or the trail's
  stamp in its colour once every step is done.
- The mission list's story headings carry their stamps once done (THE CASE: CASE CLOSED; the trails: theirs).
- The controls page: following a man, taking a man alive, holding a place; the case board's trails and papers.
- `drafts/gazette.js` (63, the Varnholm Courier): the reds have come to wreck the city paper's presses. Start the
  press, hold the press hall 60 s (two waves in from Fleet Row), optionally get the three staff out. The trophy Stop
  Press (success: everything, the staff included).

## M6.79.0 — a place to hold, and waves; Level 62, the Hesk Hill Transmitter
- A reach (spec.reach) can have `hold: seconds` (and `after: <terminal id>`, `said`): the objective (kind 'reach')
  is done when you have been in it that long - the seconds add up, stepping out only pauses them - and only once the
  terminal is done ("not yet: ... first" once). Status "n of 90 s".
- Reserves with `wave: n` (kit: `g.wave`) come in with the siren like any reserve; if it has not called them, each
  wave comes in during the hold: wave 1 at its start, wave k at (k-1)/waves of the way through, straight for you.
- `drafts/mast.js` (62): after the lodge - patch Ghost's tape into Radio Varnholm's transmitter on Hesk Hill (the
  control room), then hold the transmitter hall for 90 s as three waves come up the hill (the gate, both sides, over
  the top); optionally bring out the night engineer (the studio). Out north.

## M6.78.0 — men to mark; Level 61, Ravensholt Lodge
- A new objective kind, `identify` (mission_runtime.js): `{ kind: 'identify', refs: [guard ids] }` - done when every
  one is marked (main.js's marking, M6.63: aim at him for 0.9 s within 70 m, through glass; or a tracker on him);
  failed if one is killed before he is marked. "n of 5 marked"; the radar's marker points at the nearest unmarked.
- `drafts/lodge.js` (61): a hunting lodge in snowy woods (backdrop 'woods', pines drawn in extra). Five chiefs:
  three at dinner in the great hall, one on the terrace, one in the study upstairs - mark them (the LR7 with an 8x
  scope, through the windows); take the seating plan (the study); optionally tap the telephone. The trophy Five
  Faces. The mission list's group MORE WORK (61 on).

## M6.77.0 — taking a man alive; Level 60, the Varna Star; THE HANDLER ends
- A new objective kind, `capture` (mission_runtime.js): `{ kind: 'capture', ref: <guard id> }` - done when he is tied
  (held up, then tied) or knocked out; failed if he is killed. The radar's marker follows him.
- `drafts/varna.js` (60): a coaster at the Varnholm quay, built from rows like the Dalmar Star (hold and engine room,
  main deck with the passenger saloon, the bridge deck). Take the handler alive (the saloon), copy the passenger
  list (the bridge), optionally disable the engines (the engine room). The ship's cook (a civilian), two papers.
- THE HANDLER is four missions (market, power, docks, varna; DISMISSED); the trophy Taken Alive.

## M6.76.0 — Levels 58 and 59, the handler's first two orders; THE HANDLER on the board
- `drafts/power.js` (58, Holm Power Station): lock out the grid controls (the control room, upstairs over the office
  block), take the blackout order (the shift office), optionally bring out the chief engineer (the turbine hall's
  store, maglocked - the sergeant's card). Three turbines, a switchyard, two of the station's own men (civilians).
- `drafts/docks.js` (59, the Docks Yard): two lorries with the Exchange's gold leave by the east gate at about 3 and
  4 minutes (wait 180 / 240 s), each on its own lane (y 21, y 24); stop both; take the loading list (the yard office);
  optionally stop the handler, riding in the first. A quay with deep water along the south side.
- The case board's fifth trail, THE HANDLER (market, power, docks - the ship to come; stamped DISMISSED). Trophies
  Lights On and The Gold Stays.

## M6.75.0 — following a man; Level 57, the Old Market
- A new objective kind, `tail` (mission_runtime.js): `{ kind: 'tail', ref: <guard id>, range: 40, near: 4, lose: 15,
  said }`. Keep within `range` m of him; closer than `near` for 3 s, his awareness of you past 0.7, or him alerted /
  fleeing - he has made you (failed); out of range for `lose` s - you have lost him (failed); at his route's last point
  (give it a long pause: `[x, y, 1e9]`, and he stays) - done. A hint as you start to lose him; the objective's status
  shows how far behind you are. The radar's objective marker follows him.
- `drafts/market.js`: after the Town Hall. Daylight, disguised as a red, pistol only. Follow the Controller through
  the market (a word at two stalls) to the Café Lindqvist's back room; take the handler's orders; optionally stop the
  handler. Four stallholders, two papers, an epilogue. The mission list's new group THE HANDLER (57 on).
- Tested in a browser by stepping the runtime (`FL.mission().tick`, and `objectives()` - new, for the tests): left
  behind, he is lost at ~73 s; at his last point, done. Caution: any guard's shout (raiseAlarm) brings the man you
  follow to 0.7 and a search - he wanders off his route and back, but it does not fail the tail.

## M6.74.0 — Level 56, Varnholm Town Hall; the forgers' trail ends
- `drafts/townhall.js`: the reds' Office of Movement in the old town hall: three storeys (the basement at -3.6, the
  ground, the first floor at 3.6), a grand stair up and a plain one down side by side in the stair hall. Take the
  quartermaster's ledger (first floor) and the confiscated passes (the basement vault, maglocked - the registrar's
  card); optionally restore the records in the registry. Two of the hall's own staff (civilians), three papers,
  an epilogue, snow.
- THE FORGERS is three missions now (mill, holm, townhall); the trophy Returned to Owner.

## M6.73.0 — Level 55, the Holm Bridge; the forgers on the board
- `drafts/holm.js`: after the mill. A road north-south over a river by its one bridge; the checkpoint's customs house
  and barrier hut at the north end, the guard hut and barracks at the south. You start disguised as a checkpoint
  inspector (pistol only). Stop the agent's car (it waits 150 s in the queue, then south over the bridge and off the
  map), copy the register, take the forged passes; out on foot, south-west. Two people in the queue (civilians), two
  papers, an epilogue.
- The case board's fourth trail, THE FORGERS (mill, holm; stamped NOT VALID); the trophy Not Valid; the mission
  list's last group is THE FORGERS (54 on).

## M6.72.0 — Level 54, Hollin Mill; the Archivist
- `drafts/mill.js`: the reds' forged papers come from a paper mill on a millrace. Jam the press (the press hall), take
  the printing plates (the engraver's shop, maglocked - a back door east), optionally bring the engraver, Mr Pell,
  out of the warehouse; out by the gate, south. One footbridge over the millrace; a drying loft over the press hall
  (a stair up); two printers (civilians); three papers; an epilogue; rain.
- Lanes between buildings are two squares wide: tidyRows fills a one-square slot between two walls (the first try's
  doors opened onto it, and the shop was walled in).
- The trophy The Archivist: every paper in every first draft read (filed with the save).

## M6.71.0 — the papers, filed; papers in five more
- Every paper read on a mission is kept with the save (saves.js `markPaper` / `loadPapers`, key
  `frontline.papers.<slot>`, cleared with the slot). The case board files them under PAPERS (n OF total): a
  mission a line, opened to read them again.
- Papers in the Shipyard (a notice in the mess), the Desolated City (Radio Drosk's last log), the Drop (a letter on
  a bunk), Bunkers (the duty book), the Fortress (the roll call). Thirty-six levels have papers.

## M6.70.0 — a patrol launch that goes round
- The Pilot (drive.js) skipped a point behind it within 30 m so a wide turn would not circle back - and on a short
  loop that skipped the whole return leg, and the boat ran into the bank. Now it skips one only when the point after
  it is ahead (a missed corner); with the next behind too, it turns round for it.
- A vehicle spec's `tune` (e.g. `{ turn: 1.7 }`) reaches the Drivable through the kit - its own handling over its
  kind's. Varnholm Lock's patrol launch turns tight and goes round the west reach (a boat's own turning circle is
  about 12.5 m across - wider than the reach).

## M6.69.0 — papers in six more
- The Swimming Baths (the bookings ledger, a note at reception), the Research Facility (the night rota, the gate
  log), the Mineshaft (the wage book), the Space Port (a memo to Halvorsen, the countdown checklist), the Ancient
  Temple (Calder's camp diary), the Desert Outpost (a letter home, Rask's orders). Thirty-one levels have papers.

## M6.68.0 — papers in six more
- The Bank (a note to Mr Osei, the counting room's tally), the Manor (a place card, the cook's list), the Sewers
  (the depot's shift log), the Assassination (Rusk's desk diary), the Busy City (a receipt at Caffe Corso, a Kessel
  invoice), the Estate (a card for Mrs Adeyemi). Twenty-five levels have papers now.

## M6.67.0 — more papers
- Papers in five more first drafts: the Mega-Prison (the governor's memo, the staff rota), the Theatre (a bar bill,
  Okafor's note), the Nightclub (the guest list), the Airport (a late flight plan, a card for Rourke), the Cemetery
  (Brother Teodor's rule). Each on a table that has nothing else on it (the intel test checks they lie on something).

## M6.66.0 — Level 53, Varnholm Lock; the river trail
- `drafts/lock.js`: the codes case from the Rooftops opens the reds' signal station at the lock. Send the stand-down
  (signal room, upstairs) and open the gates (control house, downstairs); out by Ghost's boat at the west jetty.
  The river crosses the map east-west; the two gate walkways (x 21 and x 34) are the only ways over. A moored patrol
  boat with its crew (a looping one had no room to turn on the reach - the Pilot skips waypoints within 6 m). The
  lock-keeper and his wife (civilians), two papers, an epilogue. Mist (fog 12 - 95 m).
- Room ops: the coordinates are the room's inside; its walls are one square out. Doors and windows go on the wall
  squares (the first try had them inside, and nothing was reachable).
- The case board's third trail, THE RIVER (pens, rooftops, lock; stamped RIVER OPEN); the trophy River Open; the
  mission list's last group is now THE RIVER.

## M6.65.0 — the overnight summary
- The roadmap lists what was done overnight (M6.43 - M6.64); the controls page names the vibration setting.

## M6.64.0 — vibration
- **Touch: vibration** (Settings, on by default; phones that allow `navigator.vibrate` - Android, not iPhones): a short
  buzz for each of your shots, a longer one when you are hit (`buzz()` in main.js).

## M6.63.0 — marking
- **Marking**: aim (AIM held) at one of theirs for 0.9 s and he is marked - `g.tracked`, as the Tracker gadget does:
  on your radar wherever he goes. Not a downed man, a Yellow, staff or the neutral. A note says so.

## M6.62.0 — Level 52, the Rooftops
- **Level 52, the Rooftops** (`drafts/rooftops.js`; built round the Grappling Line, issued as the mission's
  `requires`): four roofs in the old quarter, each its own floor (9, 12, 7 and 15 m), the buildings solid `J` on the
  street with their brick drawn in `extra`. Planks and ladders between the roofs (gaps in the parapets), or the line
  up any wall; rain on the roofs (wet: slippery). The courier and his men on the tallest roof, a marksman on the high
  one, patrols in the streets. Take the codes case; down the fire ladder to the van. Mission list: MORE WORK from 51.
- **Learned**: two floors within about a metre of each other's height confuse the nav (it takes a point's floor by
  its height) - roofs at 9 and 9, or 9 and 8.4, left one unreachable. Keep floors' heights well apart.

## M6.61.0 — Level 51, the Kessin Pens
- **Level 51, the Kessin Pens** (`drafts/pens.js`; built round swimming): the reds' patrol-boat base in Kessin
  harbour. A rebreather and silenced kit; in from the south quay, across a deep basin (`channel: 4.5`) while a patrol
  boat (a looping `boat` with a helmsman and a man on the bow) goes round; climb out through the gaps in the north
  rail at the pens - the boat shed (slips), the duty office (maglocked: the duty officer's card; the console, the
  radio, the patrol schedules), the workshop (an engineer), the barracks room (the codebook). A crane and a dog on the
  east quay. Copy the schedules; take the codebook; back into the water and south.

## M6.60.0 — trophies for reading, and for the Codex
- Trophies: Read Everything: <level> (every paper at a first draft read, the mission not failed), and Returned (the
  Villa Merrow done).
- Kit and weather: the Museum and St Brannoc's start you with a silenced MP2 and V-27C (quiet jobs); rain at St
  Brannoc's, wind on the Halvard ridge.

## M6.59.0 — more papers
- Two papers each at the Listening Station, the Megayacht, the Archive, the Tower, the Embassy and the Barracks (the
  case's levels): what they knew about LANTERN, Corwen's table, the courier's route, Varn's board, the cipher room and
  the strike company.

## M6.58.0 — papers to read
- **Intel in the first drafts** (a spec's `intel: [{ id, at, kind, title, text, h }]`, kit.js -> `level.intel`, read
  with E as at the Riverside Hotel; the debrief counts them): two papers each at Kaldberg, the Glasshouse, the Grain
  Terminal, the Dalmar Star, the Ministry, the Museum, St Brannoc's and the Villa Merrow - rotas, letters, diaries,
  log pages: who knew what. `test/intel.test.mjs` (each lies on a table).

## M6.57.0 — the objective marker; the list in its stories
- **Objective marker** (Settings, off by default): the nearest thing still to do (`objectivesLeft()`), on screen as a
  red diamond with its distance (and an arrow if it is a floor up or down); pinned to the screen's edge when it is
  off to the side or behind you. Hidden while the mission map is up.
- The mission list's story headings (see M6.56.0).

## M6.56.0 — Level 50, the Villa Merrow
- **Level 50, the Villa Merrow** (`drafts/villa.js`; the Codex's end): Count Merrow's winter party on the lake, snow
  falling. In disguise by the front gate; the hall, the salon, the terrace over the frozen lake (the Count and his
  bodyguards, guests - civilians - and a waiter), the kitchen, the library, the gatehouse (the console, the radio);
  upstairs the gallery (his collection in breakable cases, a laser, the catalogue), the bedrooms, and his study
  (maglocked, his keycard; a pinhole camera; the safe). Copy the bill of sale; take the catalogue; optionally stop the
  Count. Its own epilogue; the Codex trail's third step (RETURNED wants all three).
- The mission list is in its stories now: headings FIRST DRAFTS (5-34), THE CASE (35-42), THE BLIGHT (43-47),
  THE CODEX (48-50) - `GROUPS` in main.js's `drawDrafts`.

## M6.55.0 — the Embassy's guests; civilians get down
- The Embassy's reception has guests and a waiter now (civilians, below); and civilians who hear a loud shot within
  30 m get down and stay down (see M6.54.0).

## M6.54.0 — trails on the board
- The case board's trails are a list now (`TRAILS` in caseboard.js: id, title, steps, stamp, colour; marks
  '<trail>:<level>'; `trailSteps`, `trailDone`, `trailBegun`): THE BLIGHT (HARVEST SAVED), and THE CODEX - the
  museum and St Brannoc's - stamped RETURNED.
- **Civilians** (a first draft's `civilians: [{ id, at, yaw, title, tint, says }]`, kit.js -> `level.npcs`, kind
  'civilian'): people at their work - the hospital's night staff, the Ministry's clerks, the Embassy's guests. Solid; E talks to them (a
  line of their own, as a hint - no voice); F knocks one down, and the debrief counts it (Civilians knocked down).
  A loud shot within 30 m and they get down and stay down (`n.cower`: crouched, and begging if spoken to).

## M6.53.0 — Level 49, St Brannoc's
- **Level 49, St Brannoc's** (`drafts/hospital.js`; after the museum): the night curator who signed the Codex out is
  "recovering" under red guard in a hospital side room. In by the ambulance bay; the ground floor's corridor, the
  pharmacy, A&E, the porters' office (the reds' radio, the console); up the main stair to Ward 4 - its long corridor,
  the ward office (his case notes), the bays, and the side rooms (one door, maglocked: the guard sergeant's card).
  Bring Tobias Marle out; take the notes.

## M6.52.0 — the whistle; breakable display cases
- (See the whistle and `kit.pane` notes under M6.51.0.)

## M6.51.0 — Level 48, the Varnholm Museum
- **Level 48, the Varnholm Museum** (`drafts/museum.js`): a night heist. In by the loading dock at the back; the
  great hall (statues on plinths, drawn in `extra` on `J` squares), the east and west galleries (display cases - its
  own legend square, `c`: a stand and a glass box), lasers across both galleries and the special exhibition, the
  security office off the foyer (the console, the radio), upstairs the gallery round the hall, the curator's office
  (the loan register) and the special exhibition (maglocked; a pinhole camera) where the Halvard Codex sits on its
  plinth. Take the Codex; copy the register.
- **A spec's own breakable glass** (`kit.pane(min, max, tough)`, the window's code made a helper): the museum's
  display cases break as windows do - and shards fall to whatever is under them (`groundBelow`).
- **Whistle** (T, a binding `whistle`; WHISTLE on a touch screen): a little noise where you stand (a lure's, 0.45) -
  the nearest of them who hears it comes to look. Once in three seconds.

## M6.50.0 — Level 47, the Halvard Embankment; a turned start
- **Level 47, the Halvard Embankment** (`drafts/embankment.js`; after the Ministry): a long shot. You are on a ridge
  (its own floor, `R`, 3.2 m up, on a hill of rock) with an LR7 and an 8x scope; the Deputy Minister's car comes
  along the embankment road across the river, ~110 m off, after a minute and a half (a bodyguard beside the driver). A
  checkpoint, a watchtower with a marksman (a ladder up), men on the river wall, a footbridge they come over, a path
  up the ridge. Stop him; back down the ridge's back to the van. The blight's fifth (last) step on the board.
- **Fixed: a start facing anything but north could be turned on the first frame** - with drag-look (a touch screen,
  or a browser that refuses mouse capture) the mouse's moves on the menus (a click on Begin) were counted as a look.
  Going in now clears them, and a touch screen never takes the mouse's drags as looks (it has its own).

## M6.49.0 — the mission map
- **The mission map** (`src/game/draw/plan_map.js`; the roadmap's "mission maps"): B (a binding, `plan`; PLAN on a
  touch screen) puts up a floor plan of the floor you are on, drawn from the rows the level was built from
  (`level.plan` from kit.js - every first draft has one): walls, windows, doors, furniture, water, holes, outdoors on
  the ground floor; you (an arrow), what is still to do (`missionRt.objectivesLeft()`), the way out, the devices you
  know of. Over the game, not pausing it; redrawn five times a second. `test/plan.test.mjs`.
- **Text size** (Settings): Large makes the prompt, hints, objectives, zone and weapon name bigger (`body.bigtext`).
- The browser suite's door-prompt check waits up to 40 s (the test machine stalls there at times).

## M6.48.0 — Level 46, the Ministry of Supply
- **Level 46, the Ministry of Supply** (`drafts/ministry.js`; where the Dalmar Star's radio log led): by day, in
  disguise, in by the front door. The entrance hall (the security desk, its radio), the post room, the canteen (a
  medic), the back corridor; the open office and the laser-guarded records room on the first floor; up the back stair,
  the second floor - the conference room, the secretary's office, and the Deputy Minister's (maglocked, his keycard;
  its only door is from his secretary's). Copy the supply records; take the order that bought the blight. The
  blight's fourth step on the case board (HARVEST SAVED now wants all four).
- **The mission list's ticks**: each first draft's best result this run (`loadDone`/`markDone`, `frontline.done.N`,
  cleared with the slot) - a tick for a success, a half for a partial.

## M6.47.0 — touch auto-fire
- **Auto-fire** (touch only, Settings, off by default): the crosshair on a man of theirs who is already fighting you
  (`state === 'alert'`), and your gun fires - never at one who has not seen you (it would give you away), a Yellow,
  staff, or a man with his hands up. Let go of him and it stops (unless you are holding FIRE yourself).

## M6.46.0 — checkpoints
- **Retry from your checkpoint** (first drafts): a mission failed - you down, most often - with something done
  (terminals hacked, things taken) offers it on the debrief. The page reloads and those stay done (sessionStorage
  `frontline.checkpoint`, for half an hour); the guards and everything else start over. A hint says so.

## M6.45.0 — the blight on the board
- The case board's second case, **THE BLIGHT** (`BLIGHT` in caseboard.js): the Glasshouse, the Grain Terminal, the
  Dalmar Star, each kept as a mark ('blight:<level>') when its mission is done (not failed); shown once begun, steps
  not yet done as ? ? ?; HARVEST SAVED stamped when all three are. The marks never count as the first case's clues.
- **Panes drawn together** (for phones): a level's breakable panes were an entity each (the Glasshouse: 69 draw
  calls); now one merged mesh (`drawPanes` in render.js, pieces marked `pane`), rebuilt without a pane when it breaks.

## M6.44.0 — Level 45, the Dalmar Star
- **Level 45, the Dalmar Star** (`drafts/dalmar.js`; the blight's end, after the Grain Terminal): a bulk freighter
  at the Kessin docks an hour before she sails. Up the gangway to the main deck (cargo in rows, the superstructure
  aft), down the stair amidships to the hold (the blight's drums; the engine room aft of a bulkhead), up from the
  crew's mess to the bridge (the radio log, the console, the radio; a marksman on the bridge wings, a turret).
  Take the blight; copy the radio log; optionally stop Anselm Rook, its buyer. Its own epilogue in the debrief, and a
  trophy, Harvest Saved. (Case Closed and Tied Up Loose Ends are now Kaldberg's alone - `level.draft === FINAL`.)

## M6.43.0 — Level 44, the Grain Terminal
- **Level 44, the Grain Terminal** (`drafts/grain.js`; after the Glasshouse): the blight leaves tonight in a van from
  the grain terminal on the river. The van waits two minutes at the warehouse's loading door (sooner if its crew is
  shot at), then runs down to the quay road and east out of the gate (a `stop` objective; it takes about six seconds
  once it goes - be ready). Copy the manifest in the shipping office. The warehouse's stacks, four tall silos (a
  skyline you cannot see over), floodlights on the quay, a dog on the quay road, the wind off the river.

## M6.42.0 — Level 43, the Glasshouse
- **Level 43, the Glasshouse** (`drafts/glasshouse.js`; built round breaking glass and grip): Varn's research
  glasshouse at night, raining. The hall's walls nearly all windows (69 panes, every one breakable - a way through,
  and a noise), a steel catwalk round its roof (wet: slippery), the lab (a laser across the growing room), the server
  room (maglocked; the head of research's keycard), the office upstairs (the console, the radio), a dog on the grounds.
  Take the sample; copy the research server - which turns out to be a crop blight, bred to order.

## M6.41.0 — contracts
- **Contracts** (`src/sim/play/contracts.js`; on the case board at Ghost HQ, under the case): replay work, three at a
  time - a mission (any non-battle draft with objectives, not Kaldberg) and a way of doing it: Unseen, No kills,
  Against the clock (6-12 minutes), Headhunter (5 headshots), Hands on (3 takedowns), Sharpshooter (60%, 10+ rounds).
  Done - the mission a success, and done that way - it pays its experience (to the skills) and another takes its
  place. Seeded from the slot's count (`{ next, open, levels }` in `frontline.contracts.N`, cleared with the slot),
  so the board does not change until you act. The debrief lists what was paid. `test/contracts.test.mjs`.

## M6.40.0 — case closed; turning with the stick
- **Turn with the stick** (touch only, Settings, on by default; the roadmap's "camera follows movement"): walking
  sideways with the stick, the view eases round towards where you are going (1.1 rad/s at full push) - not when aiming,
  backing off, or within a second of a look.
- Kaldberg done (success): the board keeps a mark of its own (`CLOSED`, 'closed', in the slot's case list) and shows a
  red CASE CLOSED stamp - "The council at Kaldberg is finished. Ghost thanks you." `caseOpen` now counts only real
  clues (so the mark never makes a case). `caseClosed(have)`.

## M6.39.0 — difficulty
- **Difficulty** (Settings; `src/sim/play/difficulty.js`): Recruit, Operative (as it was), Veteran. It changes only what
  the other side does to you - the chance a round of theirs finds you (`hit`), what it does (`damage`, guns and dog
  bites), how quickly they make you out (`notice`), how long they take to fire once they have (`react`). Their fights
  with each other are untouched (`ctx.you.player`). Recruit 0.65 / 0.6 / 0.7 / 1.35; Veteran 1.25 / 1.35 / 1.25 / 0.8.
  The debrief names it when it is not Operative. `test/detect.test.mjs`.

## M6.38.0 — touch words
- On a touch screen what the game says names the buttons, not the keys (`touchWords`, `TOUCH_WORDS`, `retext` in
  touch.js): SPACE is JUMP, C is DUCK, SHIFT is a push of the stick to its edge, "Walk with W A S D" is the stick, and
  so on - in the prompt, the hint and the step line (a MutationObserver rewrites them as they are drawn).

## M6.37.0 — surface grip
- **Grip** (Rhys's "surface friction", Finishing M5): `GRIP`/`gripOf(tag, wet)` in player.js, by material - brick,
  concrete, rock 1; wood 0.9; marble and tile 0.7; steel 0.55; glass 0.3; ice 0.2; wet (rain or snow, under the open
  sky - `player.wet`, set from the weather's look upward) 0.7 of that. Underfoot (`player.underfoot`): you get going
  more slowly and stop less quickly (a sprint pulls up in 0.17 m on concrete, 0.30 on steel, 0.40 on wet steel). A wall
  you run at (`wallGrip`): under 0.5 (glass), no run-up. A ledge caught in mid-air: under 0.45 (glass, wet steel just
  holds), it slips from your fingers - you can still climb it from the ground.

## M6.36.0 — touch settings, aim assist
- **Touch settings** (shown only on a touch screen, `.touch-only`): look speed (`touchLook`), button size
  (`touchSize`: small / normal / large - each button scaled about its own screen corner, `touch.resize()`), aim assist
  (`touchAssist`, on by default).
- **Aim assist** (touch only): each frame a look straight down the aim (60 m); over a live enemy, `input.lookFriction`
  is 0.45 and a drag turns the view that much slower - easier to stay on him. No pull, no snap.

## M6.35.0 — phones, part two; Kaldberg's way in
- **Phones**: a touch device starts on low quality until you choose (no "quality" saved yet); the first touch in play
  asks for full screen and landscape (Android; iPhones ignore it). Short screens (`max-height: 520px`): smaller logo,
  the title's buttons two abreast, cards taller and tighter, the pause menu's badge smaller.
- **Kaldberg**: you began in the drive, nine metres from a dog's patrol - the alarm went within seconds. Now you come in
  through the pines at the south-west corner (a new brief line, "The way in"), and that dog works the east of the drive.

## M6.34.0 — touch controls, Kaldberg's ending
- **Touch controls** (`src/game/core/touch.js`; Rhys could not play on his phone): on a touch screen (`pointer: coarse`,
  or `?touch=1` to force it, `?touch=0` to refuse) there is no pointer lock - `input.requestLock` just says locked, and
  drag-look is on. A stick wherever your left thumb lands (left 42% of the screen; pushed to its edge, forward, you
  sprint), look by dragging on the right, FIRE (which looks as you drag it), JUMP, DUCK, E, R, AIM (a toggle), F; along
  the top II (the menu), 1/2, Z, X, MODE, V, MAP. Each button holds its action's first bound key in `input.down` and
  counts as a press, so hold-E and hold-Z work. Shown only while playing; "turn your phone sideways" in portrait. The
  radar is smaller and the weapon panel moves to the bottom middle (`body.touch`). `test/touch.test.mjs`.
- **Kaldberg's ending**: a draft's `epilogue: { success, partial }` heads its debrief. Trophies: Case Closed (Kaldberg
  done), Tied Up Loose Ends (a man questioned and tied there).

## M6.33.0 — firing modes, glass that breaks
- **Firing modes** (the roadmap's "0 cycles auto - burst - single"): `Arsenal.modesOf/modeOf/cycleMode/autoNow` in
  weapons.js. An automatic: auto, three-round bursts (its own rate between rounds, then a beat), single. A burst gun (the
  V-27C): bursts, single. Beams, launchers, pistols: one way. Remembered a weapon at a time; shown on the HUD by the
  weapon's name ([AUTO]); the key is 0 (a binding, `firemode`). Default modes are what each fired before.
- **Glass that breaks** (the roadmap's): every kit window (`W`) is a pane of its own (`level.panes`, `level.paneN`,
  its solid's `.pane`; drawn as a prop piece so it can vanish). A round of yours through it: ordinary glass shatters at
  the first, toughened at the third, bulletproof never. Broken: its solid `disabled` (rounds, looks and you go through -
  over the sill), a crash (heard by the guards, as a lure), shards falling either side. `test/glass.test.mjs`.

## M6.32.0 — questioning, the weapons sheet
- **Questioning** (the roadmap's "dialogue: 2-4 options an exchange"): a held-up man, E, is now an exchange (the `choose`
  overlay). Ask where his side are (radar, 25 s), where the thing you came for is (the radar's diamond on it, 45 s - the
  first undone objective's terminal, pickup, man or prisoner; `rt.toldWhere`), what security is live (every device of
  theirs marked known, pinholes too), or for his keycard. A coward answers three, most men two, a steady man one. Then
  "On the floor" ties him (a quiet non-lethal takedown, `g.tied`: the medic leaves him be), or leave him (he calls it in).
- **The weapons sheet** (`weapons.html`, the roadmap's "weapon stats sheet, as a side document like the controls page"):
  written by build.mjs from the catalogue itself (`tools/weapons_sheet.mjs`), so it never disagrees with the game. Every
  weapon a card - damage a shot and a second, reach, aimed and hip accuracy, steadiness as bars; magazine, reload, weight,
  trait, who carries it - with a search box and sorting; then attachments, grenades/charges/aid, gear and specials. From
  the title screen and the menu (Weapons sheet), and the controls page's foot. `test/weapons_sheet.test.mjs`.

## M6.31.0 — the case, Kaldberg, snow
- **The case** (`src/sim/play/caseboard.js`): eight clues, each from one thing done on one of the newer missions (Halden's
  research, LANTERN's logs, Corwen's files, Varn's mail, the embassy's cipher keys, the courier's microfilm, the training
  plans, the payload's orders) and brought home. The debrief lists any new clue ("The case"); they are kept in the save
  slot (`loadCase`/`addCase` in saves.js). **The board** in Ghost HQ's hall (THE CASE; E there) pins them up. Five of
  them and Ghost knows where the council meets - and the last mission opens in the mission list (until then, `? ? ?`).
  `test/caseboard.test.mjs` (every clue names a real level and a real terminal or pickup).
- **Level 42, Kaldberg** (`drafts/kaldberg.js`; the case's end): the reds' council in a hunting lodge in the pass, snow
  falling. Every system (cameras, pinholes, turrets on the drive, lasers on the gallery, two maglocks, the hall's lights,
  the alarm), dogs on the drive, a marksman relocating round the gallery, a shield at the study door, radio, engineer,
  medic, a reserve in the garage. Record the council from the gallery; take the strike order from the Chairman's study
  (his keycard opens it); stop the Chairman (optional); out by the helipad on the ridge.
- **Weather** (the roadmap's "weather ambience"): a level's `weather: 'rain' | 'wind' | 'snow'` - snow falls slowly and
  sways, and sounds as a light wind. Its sound (synthesised: filtered
  noise; duller and quieter indoors - anything over your head within 40 m), and rain falling round you when you are open
  to the sky. Rain at the Archive and the Tower, wind on the Listening Station's cliffs.
- **The training screen** in Ghost HQ's operations hall (its middle screen, now TRAINING): E there opens your skills.

## M6.30.0 — stealth tools, dogs, disguises, three more levels
- **Lockpicking, properly** (Rhys, M6.9.13): with the Lockpicks (gear), hold E at an ordinary locked door - 4 s (Hacker
  speeds it), quiet, and it is unlocked. Not maglocks, vaults, blast doors or reinforced doors.
- **Furniture with more to it** (kit.js `FURNISH`): shelves hold two lots a shelf in their own colours and heights; machines
  have a screen, a lamp and a vent on one face; beds a pillow and a blanket; sofas their arms. (Seen, not solid: the
  squares stand and stop as before.)
- **Guard dogs** (`src/sim/people/dog.js`; the roadmap's "dog handler"): a guard with `dog: true` has a dog at his heel.
  It smells you - within 9 m in the open, 3 m through a wall or a shut door - in the dark and through camouflage; barks
  (raising the alarm, the siren if it is live), runs at you and bites (11 a bite). It cannot open doors. Shoot it, or
  dart it to sleep; a dog whose handler is down stays by him. Drawn in code (a body of boxes, legs going as it runs,
  its tail); barks and bites are synthesised. In the Prison's yard, the Listening Station's fence and the Megayacht's
  pier. `test/dog.test.mjs`.
- **The Remote Camera** (`RCAM`, a utility; Rhys's "remote cameras"): thrown, it sticks where it lands, looking the way you
  threw it; with nothing else at hand, E looks through your cameras in turn (the CCTV view; E on to the next, move to stop).
  The Spy may carry it.
- **Disguises**: at a downed red's (or Yellow's) body, E takes his uniform. His side then barely make you out from a way
  off (`DISGUISE` in guard.js: 0.12 of what they would); within 3.5 m (an officer, 7) they look twice; crouching or running
  makes it worse; cameras of his side take four times as long. A shot (a suppressed one only if it hits someone), or one
  of them going for you, ends it.
- **Level 40, the Embassy** (`drafts/embassy.js`, built round the disguise): the reds' embassy on its reception night; you
  go in already in a red officer's uniform (`spec.startDisguise`), with a suppressed pistol, smoke and remote cameras. The
  reception hall, the cipher room and the ambassador's office (both maglocked) upstairs, the security room and archive
  below; a dog on the back gate. A trophy, **In Plain Sight**, for doing it with no one seeing through the disguise.
- **The Grappling Line** (Q Branch, `QGRAPPLE`): aiming, the jump key fires it at a ledge, a wall's top or a roof edge above you
  within 20 m that a body can stand on (`Player.grappleTarget`), and it takes you up and over (a traverse; the line drawn
  while it pulls).
- **Reserves** (`reserve: true` on a guard): not there at the start; the radio operator getting through, or the siren,
  calls them in - they come from where they are placed (the gate, the dock) straight for you. Four at the Listening
  Station's gate, two at the Tower's dock. (Not counted for "clear the place".)
- **The hold-up**: come up behind a guard who has not made you out, your gun on him from within 5 m, and he freezes,
  hands up ("Don't shoot!"). E questions him: every one of his side on your radar for 25 s, and his keycard if he carries
  one. Take him down then, or walk off (10 m) or keep your gun off him for 7 s, and he raises the alarm.
- **Level 41, the Barracks** (`drafts/barracks.js`; the boards' "training barracks"): Camp Dravik at first light - four
  barrack huts round a parade ground, the mess, the maglocked armoury, the headquarters hut (its planning office
  maglocked), the assault course and the range, a watchtower (a marksman, up its ladder), the guardroom at the gate (the
  radio, the security console, a four-man reserve). Mostly in the open, two dogs. Objectives: photograph the training
  plans, take the prototype rifle.
- **The Snake Camera** (Q Branch, `QSNAKE`; the roadmap's "peeking under or through" a door): crouched at a shut door, E
  slides a camera under it - the other side, through the CCTV view (the mouse looks about); E or moving stops it.

## M6.29.0 — smarter enemies: flanking and suppressing fire (the roadmap's "guards that flank ... suppress")
- **Flanking** (`Guard.flankStep`): a bold guard in a fight with you who loses sight of you waits 1.2 s, then goes round -
  to a point 5 m to one side of where you were (each man his own side, by his name), then on to where you were. No way
  round: he waits as before. Steady and cowardly men, rivals' fights, escorts and floor-holders do not.
- **Suppressing fire** (`Guard.suppress`): a steady guard keeps firing where you went to ground for 3 s - rounds into your
  cover (impact sounds) or past you (the whizz), never a hit.
- **Falling back**: a bold guard under 40% of his health in a fight with you falls back 7 m away from you, once ("Falling
  back!"), and fights on from there.
- **The Tracker** (`TRACKER`, a utility; Rhys's "trackers and remote cameras"): thrown and sticky - on a man, he is on your
  radar wherever he goes (`guard.tracked`); on the ground or a wall, anyone within 12 m of it is, for two minutes. The Spy
  may carry it; any run at Logistics.
- **The marksman** (`perches: [[x, y, floor], ...]` on a guard): after five rounds from one place he moves on to his next
  perch ("Moving!"), and fights from there. One each in the Facility, the Prison and the Listening Station.
- **Level 36, the Megayacht** (`drafts/yacht.js`; Rhys's environment-pack sheet, "Megayacht (onboard)"): the Salt Crown,
  moored at Port Aurel marina - the arms broker Ilya Corwen's. Four decks (lower: engine room, crew's mess and cabins,
  stores; main: aft deck, saloon, dining room, galley, foredeck; upper: the owner's suite, the panic room, the sky lounge,
  the bridge; the sun deck and its helipad), side decks round the superstructure, the gangway up from the pier. All of
  M6.28-29 in one place: her security from the bridge (cameras, a pinhole, a laser, two maglocks, two turrets, two light
  circuits, the alarm), Corwen's keycard, a radio operator, an engineer, a medic, a shield-bearer and a marksman on the
  sun deck. Objectives: Corwen's files (the panic room), Mara Quill (the crew's cabins), optionally Corwen.
- **Level 37, the Archive** (`drafts/archive.js`; the concept sheet's "Library/Archive"): the Halloran Library at night,
  the Yellows in it and holding its security (devices with `owner: 'yellow'`). The reading room with its gallery (a marksman
  up there), the rare books vault (maglocked, a laser across its approach, a pinhole inside), the stacks below (a Yellow
  turret) and the microfilm room. Objectives: the Halloran Codex, copy the microfilm, optionally free the night librarian.
- **Level 38, the Tower** (`drafts/tower.js`; the concept sheet's "Office (modular)"): Varn Dynamics, three floors round a
  stair core - the lobby, cafe, post room, loading dock and maglocked security office; open-plan offices; the boardroom,
  the maglocked server room (a turret) and Varn's maglocked office. Objectives: bug the boardroom, copy Varn's mail, take
  the prototype, optionally stop Varn (who carries the keycard).
- **Level 39, Q's Test Range** (`drafts/testrange.js`; the roadmap's "hacking mechanics and training"): five rooms in a
  row, one system each - a camera, a laser, two maglocks (a keycard on the man between them), a lighting panel, a turret
  and its terminal - each with a sign saying how to beat it, and the briefing walking through them. Three reds.
- **The skills tree** (`src/sim/play/skills.js`; M7's "Skills tree"): every mission and battle gives the run experience
  (more for success, for each objective done and each new trophy; the debrief says how much); every 300 is a skill point,
  spent in the menu's **Skills** tab between missions on ranks in eight skills - Hacker (hacking faster), Light Feet
  (quieter), Shadow (guards slower to make you out), Steady Hands (less spread), Quick Hands (faster reloads), Hard to Kill
  (less damage), Second Wind (stamina back faster), Breacher (harder kicks). Per run (`Saves.loadSkills/addXp`).
  `test/skills.test.mjs`.
- **Bullet drop** (M7's "bullet drop for long shots"; `Arsenal.traceDrop`): a round flies straight for its first 60 m,
  then in 60 m stretches bent down by gravity for the time each takes at its family's muzzle speed (`MUZZLE`): a rifle
  round falls about half a metre at 300 m - aim a little high. Beams fly straight. Range falloff counts from the muzzle.
- **The Rebreather** (`REBREATHER`, gear; M7's "diving gear"): no breath lost under water (`player.breathMul`). The Pilot may
  carry it; any run at Logistics.
- **Weapons drawn in code** (`src/game/draw/gun_models.js`; "weapon models beyond the four Quaternius ones"): shotguns
  (barrel over tube magazine, pump forend, wooden stock), SMGs and machine pistols, light and heavy machine guns (heat
  shield, carry handle, ammunition box, folded bipod), rocket launchers (a tube with its bell and sight), grenade
  launchers single-shot and revolving, and the energy weapons (white housing, a lens, glowing coils) - built from simple
  parts in the same flat low-poly look, at each weapon's own length, held and dropped as a loaded model is. Pistols,
  assault and battle rifles, carbines and sniper rifles keep their models.
- Tests: `devices.test.mjs`.

## M6.28.0 — hacking and control, the rest (Rhys: "keep building - use your imagination")
- **Three more devices** (`devices.js`): `lock` (a **maglock** on a door - its leaves become security doors no kick
  opens; a keypad on the jamb; locked while on, free once hacked; an EMP **burns it open for good**), `lights` (a
  lighting circuit over an area: out when disabled or taken - in the dark a guard sees only what is close (`darkFor` in
  guard.js; `ctx.dark` may be a test of the place), and **your screen goes dark there too** (`level.blackout`), night
  vision or thermal see), and `alarm` (while one is on and live, a shout or a camera sets off **the siren**: every guard
  of its side, anywhere, comes - `raiseAlarm(..., { everywhere: true })`; then not again for 45 s). The hack's choice now
  says what each answer does to that network (`modeSays`).
- **Cameras and turrets can be shot out** (a small target round each head; 12 hp and 70 hp).
- **Devices on the radar** once you know of them (seen from within 24 m, by EMF, or on a network you hacked): a
  triangle for a camera, a cross for a turret, a bar for a lock, a ring for lights, a dot for the alarm - coloured red /
  amber / green / grey (`minimap.js deviceBlip`).
- **The specialists** (the roadmap's): a guard with `role: 'engineer'` walks to a hacked network's terminal and puts it
  all back on after 6 s there; `role: 'radio'`, once he has seen you, calls every man of his side in after 6 s unless
  he is dropped first. One of each in the Facility and the Prison. A `role: 'medic'` goes to the nearest man knocked out (not killed) and
  brings him round after 5 s there (`Guard.revive`); one in the Facility and one in the Listening Station.
- **Q Branch** (Ghost HQ, E at his bench): sign out one gadget per run (`Saves.loadGadget/saveGadget`), carried on every
  mission as a Special: the Hacking Kit; the new **Long-Arm Relay** (hack from 10 m, in sight), **Loop Spoofer** (cameras
  take 3x as long), **Trace Scrambler** (traces 2.5x slower), **Skeleton Card** (a maglock's keypad, 2 s, no trace); the
  Quick Intel Device; Special Camouflage.
- **The server room under Yard 7** (off the operations hall's north-east corner): racks, a status board, a **CCTV desk**
  (the yard from the hangar frame, the HQ door, the hall) and the **security console**. Yard 7's turrets (the two on the
  hangar frame, and two new ones hung over the hall) are devices now, Ghost's (green). **An intrusion**
  (`hq_security.js`): after a mission on which you were **traced** (`markIntrusion`), or 8% of the time otherwise, you come
  home to the reds holding them - you arrive at the foot of the stairs, the hall's turrets fire on you, the operations
  table will not send you out; hold E at the security console (5 s) to lock them out. `FL.intrude()` starts one.
- **The debrief**: *Security hacked* (and whether you were traced), *Downed by their own turrets*; two trophies, **Ghost in
  the Machine** and **Not a Trace: <level>**.
- Facility: decontamination's two doors maglocked, the main and service corridors' lights, the alarm. Prison: the
  control room's door maglocked (the kit or the card at its keypad, or blow it), the hall's lights, the alarm.
- **Two more levels with security systems**: the **Space Port** (pad turrets, cameras in mission control and the hangar,
  the director's office maglocked, the blockhouse's lights and alarm, the range-safety console) and the **Airport**
  (cameras over the halls, the VIP lounge maglocked with Rourke's turret inside, the lounge's lights, the alarm, the
  security office's console). Both issue the kit and have an engineer and a radio operator.
- **Pinhole cameras** (`hidden: true`): no bracket, not drawn, not known - until EMF shows them. Two in the Facility.
- **Laser tripwires** (`kind: 'laser'`, `at`/`to` the squares at either end, `h` its height, 0.75 m): break the beam
  (`breaks` in devices.js: your body spans its height as you cross its line) and the alarm goes up where you are - and
  the siren, if the alarm is live. Prone under it, or over it, is safe. The beam is drawn only to night vision or UV;
  its emitters always. Two in the Facility, one in the Prison's lobby, one in the Space Port's back room.
- During an intrusion the radar's objective diamond points at the security console.
- **Level 35, the Listening Station** (`drafts/listening.js`, a new level built round all of this): Skarvik signals
  station, where LANTERN - the program that traces Ghost's hacks to Yard 7 - runs. Two networks: the **perimeter** (gate
  turrets, front cameras; the gatehouse console) and the **core** (cameras, two pinholes, three laser tripwires, the
  security office and the archive maglocked, two server-hall turrets, the corridor's and the hall's lights, the alarm;
  the security office's console). Major Vass, an engineer, a radio operator; sixteen reds. Objectives: wipe Ghost's file
  (the archive), turn LANTERN round (the mainframe), take the intercept log, optionally stop Vass. **Turn LANTERN round
  and that run is never intruded on again** (`downLantern`).
- **The Hacking Suit** (`HACKSUIT`, gear; the Spy may wear it): cameras cannot make you out at all (`camBlind`).
- The how-to page (`controls.html`) has a SECURITY SYSTEMS section.
- **The shield-bearer** (`shield: true` on a guard; the roadmap's "heavy with a shield"): a ballistic shield in front of
  him (a moving, shot-only solid, `Guard.placeShield`) stops rounds from the front - not his head over it, nor from the side
  or behind; drawn as a dark slab with a viewing slit. One in the Prison's hall, one in the Listening Station.
- **Keycards**: a guard with `card: <net>` drops one when he goes down; take it (E) and that network's maglocks open
  to it like the Skeleton Card (2 s, no trace). Officers carry them in the Facility, the Prison and the Listening Station.
- Fixed: kit.js had not passed `role` (or `card`) on to the guards it builds.
- **The EMP Grenade** (`EMPGREN`, a utility; the Spy may carry it; any run at Logistics): the EMP's pulse, thrown.
- **The service record** (the roadmap's "per match and over time"): each run (`Saves.loadRecord/addRecord`) adds up every
  mission and battle - missions and how they went, battles won, **K/D in battle**, casualties, knockouts, takedowns,
  accuracy, headshots, times spotted, security hacked, hostages rescued, favourite weapon, time in the field - shown
  above the trophies in the menu. A battle's debrief now gives its **K/D**.
- Device drawing moved to `src/game/draw/devices_view.js` (missions and HQ share it). Tests: `devices.test.mjs` (15),
  `hq.test.mjs` (11).

## M6.27.0 — hacking and control, first slice (Rhys chose it next; the roadmap's "Hacking and control")
- **Cameras and turrets** (`src/sim/world/devices.js`, pure): each belongs to a side (`owner`) and a network (`net`).
  A camera sweeps; seeing you for 1.1 s it calls the alarm (`raiseAlarm` from its place, an officer's reach: the
  guards near come to where you were), then not again for 9 s. A turret turns to the nearest it may fire on within
  its arc and fires bursts (hit chance falls with distance). Modes: `on` (for its owner), `off`, `friendly`
  (reprogrammed: ignores you), `ours` (taken over: fires on its owners). Lights show it: red, amber, green, dark.
- **Hacking**: a **security terminal** (`terminals[].net`) hacks its whole network (6 s); a **Hacking Kit** (a new
  Special, `HACKKIT`) hacks one device up close (9 s). Either ends in a choice: *Disable / Reprogram: ignore me /
  Take control*. A hack makes noise, and **the trace**: 8 s of hacking a network and its owners know where you are
  (the alarm, at the terminal or at you) - a terminal's 6 s is safe; two devices by kit are not.
- **The EMP** puts cameras and turrets out too.
- **Where**: the Research Facility (5 cameras, 2 turrets, the security terminal in the west office) and the Prison
  (5 cameras, a lobby turret, the security terminal in the control room); both issue the Hacking Kit
  (`spec.requires`, now passed by kit.js). Level specs: `devices: [{ id, kind, at: [x, y, floor], face, net }]`.
- Still to come from the roadmap's list: door locks, lights and alarms as devices; enemy hacks (Yard 7's own
  turrets turned on you, and a console under Yard 7 to lock them out); devices on the radar.
- `test/devices.test.mjs`.

## M6.26.0 — mission rewards, and the EMP (Rhys: the field/mission split "Seems right to me!")
- **Each of the sheet's 21 earnable Unlock weapons comes from completing one mission** (`src/sim/play/rewards.js`:
  REWARDS, a first pass for Rhys to change - each matched to its mission: the tranquilliser pistol at the hotel, the
  HMG at the Fortress, the EMP launcher at the airport, prototypes at the research station and the space port...).
  Complete it (success or partial; not failed, not withdrawn from a battle) and the debrief says *Weapon earned*; it
  is in the slot's armoury, at Logistics. Nothing says beforehand what a mission gives (like trophies). The HAS-L3
  and HLP-2 are class kit, available already.
- **The EMP** (`src/sim/arms/emp.js`): the VD-EMP's round hurts no one; within 12 m, for 12 s, guards' night vision
  and torches go dark (`Guard.jammed`: in the dark they see only close), turrets go blind and quiet (`turret.jammed`),
  engines die (`Drivable.stalled`). The note line says what went out. CCTV is unaffected (cameras only watch).
- `test/arsenal.test.mjs` covers both.

## M6.25.0 — the whole weapons sheet, and capturing weapons (Rhys: "Most new weapons are found/captured in the field. Some are from completing particular missions")
- **All 84 weapons on Rhys's sheet are in the game** (`docs/Frontline_Weapons.xlsx` -> `tools/import_weapons.py` ->
  `src/sim/arms/sheet.js`, which says not to edit it by hand; `loadout.js` adds them to ITEMS). Those already in by hand
  (the class kit: PX-19, HLP-2, V-19P, IM-8S, HAS-L3, KD-MR3, VX-40, RV-357, V-27C) keep their tuning. The top of the
  importer says how each column becomes the game's figures. Each entry keeps its maker, nickname, sheet family
  (`kind`) and role (shown as its trait).
- **Unlocks**: the sheet's *Standard* weapons (61) are `unlock: 'field'` - found or captured; its *Unlock* weapons (23:
  energy weapons, anti-materiel rifles, the HMG, the specials) are `unlock: 'mission'` - **which mission gives which
  is Rhys's to say** (none are earnable yet).
- **Who carries what** (`src/sim/arms/issue.js`): each side buys from its own makers - reds: Ironmark, Blackridge,
  Northstar; yellows: Kestrel, Rook & Vale; the Front: Veyra, Palisade. A guard's way of fighting (carbine, pistol,
  marksman, dmr, smg, lmg) picks the kind; his id picks which, steadily. Special weapons keep their part (the
  hotel's BR-12 breacher, the Yellow boss's revolver, the classes' kit, launchers, the HMG). `Guard.item` is what he
  carries and drops.
- **Bringing them home**: a weapon you take from a downed guard (`m.taken`) and bring out of a mission that did not
  fail is added to the slot's **armoury** (`Saves.addArmoury`, `frontline.armoury.<slot>`, carried in saves and codes,
  erased with the slot); the debrief lists *Weapons captured*. **Logistics and the Quartermaster** hand out every
  hand-made item and only those sheet weapons the run has brought home.
- **Non-lethal rounds**: the PA-9T tranquilliser pistol and KD-NL2 stun carbine (sheet damage 0) knock a man out,
  as fists do - never a kill, not even in the head (`nonLethal`).
- The crate's Primary/Secondary tabs go by the slot a weapon takes, so energy weapons and PDWs now appear.
- Still to come: the VD-EMP's pulse (it fires, but shuts nothing down yet); attachments per weapon (the sheet's
  Legend: still to decide); weapon models beyond the four Quaternius ones.
- `test/arsenal.test.mjs`.

## M6.24.0 — each save slot is its own run (Rhys)
- **Trophies are per slot** (`core/trophies.js`): kept under `frontline.trophies.<slot>`, earned into the slot this tab
  is playing (`Saves.currentSlot()`), carried in the save and its transfer code (`snapshot().trophies`) and put back
  when loaded. The old shared set (`frontline.trophies.v1`) moves to slot 1 the first time the game loads.
- **Erasing a slot ends its run**: the save, its story and its trophies (`Saves.clearSlot`).
- **New game starts a new run in the first empty slot** (`Saves.freeSlot()`); with all three in use, it opens Saved
  games to erase one first. Saving into another slot takes the run's story and trophies with it; pasting a transfer
  code into a slot replaces that slot's whole run.
- The slot list shows each save's trophy count.

## M6.23.0 — Ghost HQ, under Yard 7 (Rhys: "Yard 7 becomes Ghost HQ - an underground lab and command centre")
- **`src/game/levels/hq.js`**: a bunker hut in the yard (x -42..-26, z 49..55, west of the ammo dump, its door well
  back from the watchtower's ladder) and three switchback flights down 12 m to the operations hall (y -12, running
  east under the yard). The plan is drawn in its own coordinates and mirrored/moved into the yard by `X()`/`Z()`.
  `hqGround()` replaces the yard's one ground slab with four, leaving the stairwell's hole.
- **The operations table**: E opens **Assignments** (`#assign` in index.html) - the level buttons that were on the
  title screen (same ids), the first drafts, and *Going by: Van / Helicopter* (remembered in `frontline.ride`;
  cosmetic until the levels start you out of it).
- **The trophy cabinet**: E opens the pause menu's Trophies tab. **Logistics**: an infinite 'armoury' crate.
  **Q Branch**: a bench and a sign, gadgets to come. **Helipad**: painted in the yard at (-46, 28).
- **Coming back**: every "Back to ..." now reads *Back to Ghost HQ* and goes to `index.html?at=hq`: your save is
  loaded, moved to the hall (`HQ.arrive`) and saved, so Continue on the title screen carries on from there.
- The corner of the screen says *Ghost HQ* down there (world zones). `test/hq.test.mjs` walks a player down the
  stairs into the hall and back up, and checks the buttons moved.
- Weapons (Rhys): most new ones are found or captured in the field; some come from particular missions - which is
  which, Rhys will say. Noted in FRONTLINE_ROADMAP.md.

## M6.22.0 — people drawn in code (Rhys: "I'd actually prefer the characters code-drawn rather than from asset-packs")
- **Every person is drawn and animated in code** - you in third person, guards, hostages, passers-by. No more
  Quaternius body or animation library: `assets/characters/Operative.glb` (and `Swat.glb`) and the tools that made
  them are gone; the credits now name Quaternius for weapons and vehicles only.
- **Smooth, rounded bodies in the Quaternius manner** (Rhys: "make them look better... still look similar to the
  Quaternius assets"): `draw/puppet.js` builds lofted tubes and rounded blobs with averaged normals (smooth shading);
  each vertex follows one or two joints, blended over the elbows, knees, waist and neck, so the body bends rather
  than breaks. The head is one shape crown to chin, with hair, eyes, brows, ears, nose and mouth; a plate carrier with
  pouches and a pack, knee pads, a thigh pocket, gloves with thumbs, boots with soles. About 6,300 triangles.
- **`src/game/draw/puppet.js`**: a low-poly body (head with eyes, brows, nose, ears and hair; collar, vest and
  pouches, belt and buckle; sleeves, cuffs and gloves; trousers with a thigh pocket; boots with soles) on a
  17-joint skeleton, built as **one skinned mesh** - one draw per person, coloured by vertex. A faction's tint
  colours the uniform; `opts.colours` can dress anyone differently (skin, hair, top, legs, vest, belt, boots...).
- **`src/sim/people/poses.js`** (pure, tested in node): every clip the game asks for, written as joint angles
  over time - walking, jogging, sprinting and walking backwards; crouching and crouch-walking; treading water
  and the front crawl; jumps, landings, the roll; the fall on your back and slumps; hits; the pistol held low,
  aimed, fired, reloaded; jab and cross, knife slashes each way, the hook; reaching, sitting, talking, arms
  folded, climbing up, a ladder hand over hand, the prone creep, getting up, an overhand throw; strikes from a
  crouch. `anim.js` still chooses which; character.js blends between them.
- Hats, goggles and the weapon in hand are placed exactly as before (the head and hand are joints of the new body).
- Tests: `anim` checks every clip is written, every joint a number, and that the poses mean what they say
  (dead on his back, the crawl face down, a crouch low, loops wrapping, one-shots holding).

## M6.21.0 — housekeeping (Rhys: "the code needs housekeeping")
- **The source lives in the repository** (it had only been in a temporary workspace and handover zips):
  `src/`, `test/`, `tools/`, `maps/`, `build.mjs`, and these notes in `docs/`. The README is Frontline's.
- **Folders by what they do**: `src/sim/` into `people/`, `world/`, `arms/`, `play/`, `vehicles/`;
  `src/game/` into `core/`, `draw/`, `levels/` (the hand-built levels renamed for what they are:
  `yard7.js`, `course.js`, `ranges.js`, `mission0.js`, `hotel.js`, `factory.js`, `casino.js`, `train.js`,
  the level kit `kit.js`, its specs in `levels/drafts/`, the maps' data in `levels/maps/`). Every import
  and path rewritten by script.
- **Comments say what and why, not when**: release numbers taken out of over a thousand comment lines
  (the history is here, in the handover); Rhys's words kept where they explain a choice.
- **main.js** opens with what it is, where things are, and its sections in order, each marked in the code.
- **`docs/CODE_MAP.md`**: every file and what it is, remade by `python3 tools/code_map.py`.
- The game itself is unchanged: the built `game.js` came out byte-for-byte the same as M6.20.15's before
  the version number moved. All 746 node tests pass.

**Where it stands:** movement (walk, sprint, crouch, prone, vault, climb,
ladders, swimming, diving, dash, back-roll, peek over cover, parkour run-ups
and going over walls), ordinary hinged doors, weapons
(families, mods, range falloff, penetration, recoil and pull, auto-reload,
grenades, charges, medkits, melee), loadouts and crates, an animated operative,
a full training course (movement half and shooting galleries, turret bay,
transport back), an operative on the Universal rig with real crouch, swim,
climb and jump animations, title screen, three save slots with transfer
codes, a radar
that shows only what you know (three ranges, last-known positions),
synthesised sound, music, and Yard 7 as a free-play area.

**Tests** (all passing): `node test/sim.test.mjs` (89), `course` (27),
`weapons` (84), `anim` (9), `saves` (7), `contacts` (13), `mission0` (65), `detect` (13), `fight` (24), `voice` (13), `light` (13), `hotel` (113), `factory` (9), `casino` (90), `train` (12) — 581 in all, and
`python3 test/browser.test.py` (58 — slow: run at milestones, not every update; see "Working rhythm". Takes about ten minutes in the sandbox; run it in the background with
`python3 -m http.server 8099` serving `dist/`).

**Working rhythm (Rhys, M5.15.0):** upload → playtest → notes → update →
upload, quickly. Each update: make the changes, run the **Node suites only**
(about 30 s), build, and hand over `index.html`, `controls.html` and
`game.js`. The browser suite takes ten minutes or more in the sandbox (one
CPU, ~0.7 fps) and is for milestones or for something only a browser can
show. If it is run: start the server with `setsid nohup`, never leave a
timed-out Playwright run behind (stray headless browsers starve the CPU),
note that real key presses only reach the game on the normal page (not
`?test`), and put silent placeholder MP3s in `dist/assets/music` locally
(the music is not in the source pack) - then delete them before packaging.

**Sign facing, settled once:** yaw 0 faces +z, Math.PI faces -z,
-Math.PI/2 faces -x, Math.PI/2 faces +x. A sign must face its reader.

**Lessons worth keeping:**
- When a patch batch aborts, check what of it landed. Half-applied batches
  broke M5.3.0 — **and the door override**, which was reported as done in
  M5.0 but had never landed. Apply edits one at a time with a report of what
  did not match (`/tmp/fl/apply.py` pattern) rather than all-or-nothing.
- Materials used by level geometry must exist before the meshes are merged.
- With merged map-wide meshes, lights and small entities cost frames, not
  triangles: keep lights budgeted (`view.tickLights`).
- Walk every connection and fire at every target in a script after any level
  change — it finds sealed doors, hidden targets and overlapping rooms that a
  screenshot does not.
- Check new rooms do not overlap old ones: several bugs were one room's wall
  running through another.
- **Break a new feature on purpose and check its test fails.** In M5.15.0 the
  parkour tests let go of W as soon as you were 1.4 m up, so they could never
  grab and the "out of reach" test passed for the wrong reason. Too weak and
  too strong a kick must both fail something.
- **Coordinates written before a level was sunk go stale silently.** The
  weapons-half start point was still `[-89, 0, 0]` four releases after the
  course moved to −16 m, and put you on the crawl tunnel's roof. Starting
  points now live in the level (`level.weaponsStart`), next to what they
  point at.

## Credits that must stay
Music: Kevin MacLeod (incompetech.com), CC BY 4.0 — on the title screen.
Models: Quaternius and Kenney, CC0. Water sounds (CC0, OpenGameArt):
jasinski, transitking, Blender Foundation.

## Decisions
- **Code-first with the PlayCanvas *engine*** (open-source library, v2.22.2),
  bundled into our own `game.js`. The PlayCanvas website/Editor is not used.
  If what we build falls short of what the Editor could do, switching is on
  the table (Rhys: "better to switch halfway than paint a broken vehicle").
- **Hosted on GitHub Pages** like The Dungeon Remembers. Upload
  `index.html` + `game.js` (+ `README.md`) to a repo named `Frontline`.
  Later milestones will add an `assets/` folder (models are too big to embed).
- **Look:** "proper" but stylised — Star Wars Battlefront (2005): modest-poly
  models, painted textures, baked-looking light, fog. Not TDR's pixel style.
- **Inspirations:** Fallout, Battlefront I/II (2005), Rainbow Six, James Bond,
  Zelda (pre-2015), Metal Gear, Portal.
- **First person by default**; third person (V) exists with a stand-in figure.
- **Chromebook-first controls:** WASD/arrows, mouse or touchpad, Space
  jump/vault/climb, Shift sprint, **C crouch** (Ctrl is unusable — Ctrl+W
  closes the tab), E interact, R reload, G equipment, Q command wheel,
  **Alt or right-click aim**, V view, Esc pause (browser-owned).
  **Ctrl, Tab and the Search/Meta keys can never be bound.**
- **Aim/fire on Chromebooks:** left click fires; right click or holding Alt
  aims; *while Alt is held, any click fires* (ChromeOS turns Alt+click into a
  right click). Chromebooks are detected (`CrOS` in the user agent) and shown
  a note on the start screen.
- **Free where possible.** Assets: CC0 packs from Kenney and Quaternius
  (credit them anyway), shapes generated in code, ChatGPT images as concept
  art/textures. Blender is too laggy on Rhys's Chromebook — don't rely on it.
- **Working style:** Rhys prefers to hand over a big themed request ("build me
  a house") rather than twenty micro-steps. Work down it in priority order,
  finish and package each chunk, and say clearly where work stopped.

## Files
```
src/sim/world/world.js          collision world: boxes, water volumes, ladders, zones, raycast
src/sim/people/player.js         the operative's movement (pure logic, tested in node)
src/game/levels/yard7.js  Yard 7 layout (colliders + visuals from one description)
src/game/draw/textures.js      every texture painted in code (canvas)
src/game/draw/render.js        merged meshes per material, vertex "baked" shading,
                          sun/shadows/fog, vertex-colour sky dome, water, signs,
                          box stand-in operative
src/game/core/input.js         settings, bindings, Chromebook detection, aim/fire rules
src/game/core/camsmooth.js     camera height spring (tested in node)
src/game/main.js          boot, fixed 60 Hz loop, camera feel, HUD, menus, test hooks
src/index.html            page, HUD, start/pause/death screens, styles
build.mjs                 esbuild → dist/index.html + dist/game.js (2.4 MB)
src/sim/arms/weapons.js        weapons: ammo, spread, recoil, grenades, targets
src/game/draw/weapons_view.js  viewmodels (GLB), range targets, projectiles, effects
test/sim.test.mjs         movement + camera tests (node)
src/sim/arms/loadout.js        catalogue, slots, mods, gear, crates
src/sim/people/anim.js           which animation clip the body should play
src/game/draw/character.js     the animated operative (Quaternius rig)
test/weapons.test.mjs     weapon + loadout tests (node)
test/anim.test.mjs        7 animation-choice tests (node)
test/browser.test.py      browser tests (Playwright + Chromium)
src/sim/world/doors.js          ordinary hinged doors (SwingDoor): shut/open boxes, swing, drawing yaw
src/sim/people/guard.js          a guard: patrol, posts, senses, awareness, states, searching, shootable body, death
src/sim/world/nav.js            finding a way through a building: grid per floor, stairs links, A*
src/sim/world/drawcull.js       who is drawn: near, on your floor, or in plain sight (M6.13.5)
src/sim/play/story.js          the story so far: each mission's outcome, grade and rules (RULES)
src/sim/world/curves.js         curves for a box world: arc walls, the helical ramp, round floors, merged grid walls
src/sim/world/shapes.js         shapes that are not boxes: flat faces with holes (earcut), prisms, oriented boxes, sweeps, outlines of map squares, smoothing
src/sim/world/earcut.js         earcut 3.0.2 (Mapbox, ISC), vendored: cutting a flat face with holes into triangles
src/sim/people/factions.js       who is against whom (level.relations), each guard's foe (pickFoe), how the Yellows stand with you (Standing), what they say
src/game/draw/scope.js         the sight picture when aiming through a scope or a red dot (SVG)
src/game/levels/casino_fit.js    the casino's floors, spiral stairs, glass pool, smoothed walls and furniture (tables, chairs, bars, slots, washrooms)
test/detect.test.mjs      11 detection tests (node)
test/fight.test.mjs       13 combat tests (node): firing, accuracy, ranks, weapons, temperaments
src/game/core/voice.js         spoken lines: browser speech, recordings (RECORDED), Control (RADIO), the reds' radio (INTERCEPT)
src/sim/play/mission.js        a mission's rules: keycard, download, kicks, extraction, trophies
src/game/levels/mission0.js Level 0, Meridian House
src/game/levels/factory.js  Level 2, the Derelict Factory (Rhys's battle map, as a mission)
src/game/levels/casino.js   Level 3, the Casino: round (Rhys's preliminary map)
src/game/levels/mission_runtime.js the mission in the game: guards' bodies, prompts, E/F, bullet time, hints, end
src/game/core/trophies.js      hidden trophies, kept in the browser
test/mission0.test.mjs    20 Level 0 tests (node)
src/sim/people/contacts.js       what you know: senses (sight/heat/sound/near), Tracker memory, radar ranges
test/contacts.test.mjs    13 radar-knowledge tests (node)
test/browser_shots.py     screenshot tour
```
Build: `npm install && node build.mjs`. Tests: `node test/sim.test.mjs`,
`python3 test/browser.test.py`. The sandbox has Chromium for Playwright at
`/opt/pw-browsers`; launch with
`--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
**The sandbox renders 3D in software at ~2 fps**, so browser tests check the
input path directly and wait for frames; movement itself is tested in node.
`?test` in the URL skips the start screen and pointer lock and exposes
`window.FL` (`pose`, `drive`, `state`, `openMenu`, `third`, …).
The esbuild config marks `node:worker_threads` external (engine code for Node only).

## M6.20.15 — the arrival announcement confirmed; where things stand
- Rhys confirmed the arrival line ("That looks right"). Severian policy from him: where he has not supplied enough
  Severian, keep it in English (the attendants' lines, the newspaper) - do not invent.
- Rhys is away the week of 26 Oct, then his paid Claude plan ends: updates pause. Next, when he is back:
  Yard 7 as Ghost HQ (underground command centre, briefing room, trophy cabinet, helipad, van/chopper deploy,
  Assignment -> Loadout -> Mission -> Debrief), then the rest of his weapons sheet with unlocks; characters
  (B(ii)) when he drafts them.

## M6.20.14 — Rhys's place names; the arrival announcement
- Names (CANON): Наварежнон Ваътак (North Quay: ваътак north, наварежно quay), Хаон вен О̏стрел (Port Ȍstrel: хаон
  port, with the genitive вен), Новомир Сентраълы (Novomir Central: сентраълы central), Кирова, Белягорск,
  Алєйка Азвестя. On the board, the gates, the platforms, over the station door and at the terminus.
- The departure: Белягорск-е (Беляорск was a slip); re-recorded.
- The arrival: `PROVISIONAL.arriving` in severian.js - "лаксъскава Белягорск - Алєйка Азвестя. то̏ва древ
  виънеш." - built by me from Rhys's лаксъскава (welcome) and виънеш (terminates), то̏ва before its noun, the verb
  last; no "to" or "where" assumed. Recorded. Awaiting Rhys's yes or his own wording.

## M6.20.13 — Rhys's answers on Severian, in the station
- Words (severian.js CANON): пиятфо̏ма (no р - the long о̏ stands for it; numbers in digits; short form Пл.),
  лажах departures, остаъви leaving, древ train, жвԁ door(s), безпино safely, стайат stand, прешже please;
  corrected: обслувани (в), лошлъ (ъ), конє (є), мїлён.
- The board: ЛАЖАХ ... ОСТАЪВИ, Пл. n; the gate signs ПИЯТФО̏МА n.
- The 21:40's announcement, Rhys's: "древ васдат-оден и зорок до Беляорск-е ра веск. стайат безпино ѵ жвԁ,
  прешже." then the English (no platform in it now, as in his). Recorded from its IPA: tools/voices/sev_ipa.py
  (his alphabet / IPA reference as code: о̏ /ɔ/, ԏ /tʲ/, syllabic ѕ ѵ ԁ, ъ length, stress penultimate or the
  acute; Џ read /dʒ/ - unresolved in his notes) and gen_sev2.py (piper; models in /home/claude/tts).
- The kiosk: "џенъ звїечо̏р. чочԏ ко̏фиъ ѕ газети" the first time (recorded, his English voice speaking the IPA);
  English after (rt.kioskMet).
- The newspaper: English only for now (`englishOnly`), dated Tuesday, 8 November 2002 (Rhys: out of step on
  purpose); its Severian is the old placeholder, unused, until Rhys writes it.
- (Answered in M6.20.14.) Still open: the station attendants' lines in Severian; the newspaper.

## M6.20.12 — Rhys's Severian (early draft), first use
- Rhys's Severian.zip: Severian.docx (the language reference and game brief - its canon policy: never invent,
  mark anything new provisional, the case spreadsheet authoritative), Severian Cases.xlsx, the alphabet /
  romanisation / IPA sheet. Rhys: "If anything new needs adding, please ask me before you implement anything".
- `src/game/core/severian.js`: CANON - his established words, spelled exactly (О̏ = О + U+030F, never Ӧ); `negate()`
  - the established negative particle rule (ня / нє by the last vowel of the word before; /a/ counts front).
- In the station so far: the kiosk КО̏ФИЪ · ГАЗЕТИ; Platform 2 обслувани нє (not in service - not закворына);
  Port Ȍstrel in the English. Everything else Severian in the game is still the old placeholder.
- **Asked of Rhys, not done** (his answers decide): the platform word's spelling (Cyrillic пиятфо̏ма has no р, the
  romanisation Platfo"rma has); platform numbers on signs (digits?) and an abbreviation for the board; the board's
  "Departures" and "leaving"; the Cyrillic of Belyagorsk, Kirova, Port Ȍstrel, Novomir Central, Belyagorsk -
  Alyejka Azvestya; North Quay (my invention) keep or drop; whether to use his draft departure announcement
  (Drev vasdat-oden i zorok do Belyagorsk-e ra vesk) and what the arrival one is; the newspaper (his date
  Tuesday 8 November 2002 vs the game's Tuesday 3 November 2026 - 8 Nov 2002 was a Friday; title; stories);
  the kiosk line in Severian. Typos to confirm: obslubani / обслувани, loshl# / лошлы, конԑ (Ԑ is not in
  the alphabet), мїл(yo)н -> мїлён.
- Re-recording the announcer: tools/voices/gen_sev.py (piper, Russian phonemes) - once the text is settled.

## M6.20.11 — Rhys's notes on the classes: battles, the picker, fire, lasers, ammunition
- **A class on every fall** (Rhys: "not stuck as a basic trooper forevermore after your first death"): the battle kit was
  taken before the briefing's choice - it is now taken at Begin (`keepKit`), with `specials`. Down in a battle,
  `showClassPick()` (#class-pick): 1-7 or a click picks the class you go back in as (`S.nextCls`); `applyClass`.
- **Retreat** (Rhys: "Retreat should be treated differently than a Win or Loss"): `Battle.retreat()`, `result()`
  'retreat', `over`; holding E at your end of a battle before it is decided retreats; debrief "WITHDREW - a battle
  you leave is neither won nor lost", lines "withdrawn from ... no result"; graded 'failed' (nothing earned).
- **Comrades and enemies have classes**: every battle man is one of `BATTLE_MIX` (or the side's `classes`) - Trooper
  x3, Recon, Medic, Heavy, Spy, Pilot; not the experimental Jump Trooper - `g.cls`, armed with the class's
  `arms` (new ARMS: rv90s, launcher (rockets), im8s, v19p, hasl3), dropping its gun.
- **The picker, cut down** (Rhys: the list was "a bit TOO much"; "restrict what each class can have"): each class has
  `guns` (either weapon slot), `utility`, `gear` (`classAllows`); snipers only for the Recon, no shotguns for the
  Trooper or the Recon. Without a class, the mission's kit "As issued", unchangeable.
- **Jump Pack fuel**: a bar (#jet) above the stamina bar whenever it is not full.
- **KD-MR3 breaches**: `breach: true` - its blast takes doors off their hinges as C5 does.
- **Spare rounds can be put down** (Rhys: corpse ammo overencumbering you): `arsenal.dumpSpare(dry)` - every gun
  down to a full issue, the pouch emptied; "Leave your spare rounds here" in any crate (they stay in it), "Drop n
  spare rounds" in YOUR GEAR.
- **Fire** (Rhys: "a fire should linger, and anyone caught ... on fire for a little longer"): the incendiaries burn 10
  and 14 s; in the fire you catch (`t.onFire`, `arsenal.youOnFire`) and burn BURN.rate 20/s until BURN.after (4 s)
  after leaving it; `flames` events puff fire on whoever is alight.
- **The laser beam from the muzzle** (it came from your middle): `showBeam` starts at the muzzle flash's place.

## M6.20.10 — the class weapons, as Rhys's weapons sheet has them; lasers
- Rhys's **Frontline_Weapons.xlsx** (Weapons + Legend sheets: maker, designation, family, slot, damage, rpm, magazine,
  reserve, reload, range, penetration, recoil, spread, noise, unlock) is the plan for the whole arsenal; nothing on it
  but the class weapons is in the game yet (K7, PX9, LR7... are older and not on it). Still to decide (its Legend):
  unlocks by mission, attachments, one heat system for every energy weapon.
- From the sheet: PX-19 (27 dmg, 15 rounds), V-19P (a PDW, secondary-sized), **IM-8S is a compact semi-auto shotgun**
  (8 pellets of 10), RV-90S (the RV-90, suppressed: 90 dmg, 4 rounds, bolt pace), KD-MR3 "Multi-role Launcher"
  (234 dmg, 4 spare, 4.6 s reload).
- **Energy weapons** (family `energy`, `energy`/`beam`): the HAS-L3 Laser Carbine and HLP-2 Laser Pistol (`size:
  'backup'` - items may now give their own `size`). `mag` is heat: shots (0.1 s beam ticks) before it overheats
  (103 / 84); then it cools for `reload` s (4.0 / 3.4); idle 0.4 s, it cools by itself in 1.5 x that; R vents.
  No reserve, so no ammunition weight. HUD "HEAT n%" / "COOLING"; `beam` events draw a line (`wview.showBeam`);
  a whine instead of a bang (audio.shot).
- The Spy's V-19P carries a silencer (the sheet's is not quiet). The gear "Trauma Kit" is now **Haemostatic
  Dressings**; the Trauma Kit is the one-use utility (Room 201's).

## M6.20.9 — ammunition and mods weigh; Rhys's classes, and the kit they brought
- **Weight, more of it** (Rhys: carried ammo "that isn't in your current magazines" should weigh; "mods should also
  have some weight"): `ROUND_KG` per ammunition kind at real weights (9 mm / 5.56 12 g, rifle 25 g, shells 40 g,
  rockets 2.4 kg; `roundKg` per item - LR7X 115 g); `itemWeight(id, {count, reserve, mods, ammoKg})`;
  `Loadout.weight(arsenal)` counts what is actually left (reserve, grenades, the pouch). `MODS[*].kg`.
  `LOAD_FREE` 11, `LOAD_HEAVY` 26 (the standard kit is 10.3 kg with its spare rounds).
- **Classes** (`CLASSES` in loadout.js; Rhys: "B(i) to B(ii) with A(i) for a 'quick-select'"): Trooper, Recon, Heavy,
  Medic, Spy, Pilot, Jump Trooper (Experimental). A Class select heads the briefing's Loadout box: it fills the five
  slots (and their mods) and gives its Special while chosen; change any slot afterwards and you keep it. "Custom"
  is the mission's kit. `loadout.specials` is a list now (the mission's, then the class's); `special` is its first.
- **New guns**: PX19 (service pistol), HLP-2 (experimental long pistol), V-19P (PDW, quiet built in), IM-8S
  (compact carbine), HAS-L3 (automatic shotgun: `pellets: 8`, a `pellet` event each), RV-90S (integral silencer
  - `integral` refuses silencer mods - and `zooms: [4, 8]`: `,` and `.` while aiming, `arsenal.stepZoom`),
  KD-MR3 (family `launcher`: `fire` launches a `rocket` projectile - low gravity, `impact`, bursts on whatever it
  meets; `opts.lock` makes it `homing`). AMMO_ROCKET.
- **New utilities**: Service Grenade, Concussion Grenade (`blind` 2.6 - the blast event now carries `blind` -
  little damage), Sticky Incendiary (`sticky`: sticks to a target or a wall; `gas: 'fire'`), Neurotoxic Gas
  (`gas: 'nerve'`), Air-drop Incendiary / Illumination (`impact`; `flare`: a light for 30 s, `S.flares` in main),
  Landmine (`vehicleOnly` proximity), Health & Ammo Pack (`ammo`: a magazine more for each gun; usable at full
  health if there is room for rounds), Vehicle Repair Kit (`repair`, `endless`: by a vehicle, 3 s mends 15%).
- **Clouds** (`arsenal.clouds`, `stepClouds`): nerve 24 hp/s to anyone in it (the player 70% of that, nothing with a
  gas-mask `gas` trait), fire 20 hp/s (a mask does nothing); a fire on a stuck target follows him.
- **New gear**: Load-Bearing Webbing (`ammoCarry` 1.5 - start, crates and the pouch; `ammoKg` 0.5), Jump Pack
  (`jet`: `player.jetPack`; SPACE held in the air - `JET` in player.js: 2.2 s of thrust, about 10 m up, refills in
  14 s on the ground; a little steering; HUD "JUMP PACK n%").
- **Specials (family `perk`)**: Special Camouflage (`camo` 0.6 in `Guard.visibility` via `ctx.you.camo`, x0.75 more
  prone), Quick Intel Device (`hackSpeed` 2), Vehicle Targeting (`lockOn` 45 m: aiming a launcher, the vehicle
  nearest the sight's middle within 0.1 rad is `S.lock`, HUD "LOCKED ON"), Auto-Repair (2% of a driven vehicle's hp
  a second), Cushioned Landing (`fallMul` 0.3). Vehicles have `maxHp`.
- Tests: test/classes.test.mjs.

## M6.20.8 — any gun in either slot, weight, the loadout on the briefing, the Special slot
- **Any gun in either weapon slot** (Rhys: "any gun in any slot, yes please"): `SLOT_TAKES.backup` takes primaries
  too. Grenades and gear still go only where they go. `pickupSlot`, with both slots full, replaces the gun of the
  same size (the one in your hands if both are), else the one in your hands.
- **Weight** (Rhys: "guns have weight, and weight should affect you"): `kg` on each family, overridden per item
  (LR7X 13, KR-90 8, VR4 4.6 ...); throwables count `kg x count`. `itemWeight`, `Loadout.weight()`,
  `loadEffect(kg)`: free to 8 kg (the standard kit is 7.5), then up to 22 kg: speed to 78%, sprint drain to
  x1.9, footstep noise to x1.35. `player.load` (set every step from the loadout by `applyLoad` in main.js,
  so crates and pick-ups count at once).
- **The loadout on the briefing** (Rhys: "choose your loadout ... before hitting Begin"): a picker above Begin
  on every on-duty mission (not the Train, not `offDuty`, not `fixedKit`) - five selects, each item with its
  weight, and the total and what it costs you. The level's kit is the default; its mods stay only on an item
  left unchanged. Every item in the game is on the list for now: once Yard 7 has its unlocks, "available"
  becomes what you have earned.
- **The Special slot** (Rhys: a mission's required item "doesn't interfere with your loadout"): `loadout.special`,
  outside SLOTS; `gearTrait` reads gear then special. A level names it with `requires: 'PARACHUTE'`; a kit with
  the parachute in its gear slot (the Drop, the Casino) hands it over and wears lenses instead. Shown on the
  picker and in YOUR GEAR (with packed/unpacked). It weighs (the parachute 3 kg).

## M6.20.7 — mood boards, last part: the Space Port (33), the Subway (34)
- **Level 33, the Space Port** (`levels/spaceport.js`): the Teskel launch complex - Pad 2 with the rocket (solid,
  built in `extra`) and its gantry (three platforms P1-P3 at 8, 16, 24 m, a ladder between each, railed),
  mission control (consoles, the director's office, a viewing gallery MC over the room's back - G `noRoof`
  under it), the assembly hangar with a spaceplane. The payload's arming unit is a terminal (`verb: 'Pull'`).
- **Level 34, the Subway** (`levels/subway.js`): Holm Street station - the street and two entrance pavilions
  (stairs down inside them), the ticket hall (B1), the platforms (B2) either side of the track (the track bed
  T, 1.2 m lower), a train standing at the platforms (three cars as rooms on B2 over the track, doors both
  sides), a boarded crossing at the west end, the signal room. The device in the middle car (a terminal,
  `verb: 'Disarm'`).
- The agreed list of levels is done (5-34). Next, by the plan: the hub map.

## M6.20.6 — mood boards, part three: the Neon Nightclub (30), the Airport (31), the Desert Outpost (32)
- **Level 30, the Neon Nightclub** (`levels/nightclub.js`): Club VELVET - the dance floor (lit squares, coloured
  lights, a mirror ball), the stage, two bars, the VIP mezzanine open over the floor (rails 'q'/'k' with
  neon), Saint's booth, the office and store; the neon front. The DJ's desk is a terminal (`verb: 'Kill the
  power at'`).
- **Level 31, the Airport** (`levels/airport.js`): the terminal (check-in, security, lounge, the VIP lounge
  upstairs), the control tower (a ladder up its shaft to the cab), an airliner on its stand (its cabin P
  up the airstairs), the apron, taxiway and runway. **Rourke's jet**: a new `jet` vehicle kind and model
  (vehicle_models.js) - it waits, taxis out and takes off down the runway (`goal: 'escape'`); **`holdOn:
  'tower'`** - taking over the tower's ground control desk holds it where it is (counts as stopped).
- **Level 32, the Desert Outpost** (`levels/outpost.js`): Outpost Kharun in a canyon - HESCO barriers ('m'),
  the command post and its sandbagged roof (R), tents, the motor pool (two jeeps you can drive), the cell
  block (barred cells, the pilot's with a door), the dump (a terminal: `verb: 'Set a charge on'`), two
  watchtowers. A dust-brown `atmos`.
- **Lamps** hang under the storey above's floor too (the lounge under the mezzanine had none), and under its
  slab if that is lower than the walls' top (the arena's gate tunnels).
- The stair test: a stair against a wall must be reachable from beside its foot (the way finder decides).
  The manor's servants' stair foot moved one square in.

## M6.20.5 — mood boards, part two: the Mega-Prison (27), Bunkers and Open Ground (28), the Colosseum: Battle (29)
- **Level 27, the Mega-Prison** (`levels/prison.js`): A Wing - four tiers of cells round a hall open to the
  roof (holes 'O' on the upper tiers, G-1-2 `noRoof` over the hall), galleries with rails ('q' north-south, 'k'
  east-west), two bridges; barred cell fronts ('b': bars you see and shoot through, an unseen solid);
  the control room (a terminal: unlocks every vault door, Venn's cell 'V'), the governor's office, the
  yard and wall, towers up ladders. The stair foot faces were checked by the new test.
- **Level 28, Bunkers and Open Ground** (`levels/bunkers.js`): the Kessel Line - a zigzag **trench** as storey T
  1.7 m down (`outside.holes` takes the ground away over it; its earth sides built in `extra`, not across a
  stair's top), pillboxes on the ground with steps up out of the trench, the command bunker (B) with a
  blast door ('Q') opened from its comms room, the radar (a terminal: `verb: 'Plant a charge on'`), open
  meadow. Sandbags (its own 'w').
- **Level 29, the Colosseum: Battle** (`levels/arena.js`): a battle map built from an ellipse - the sand (G,
  `noRoof` row by row), the podium wall, two tiers (T1 2.4 m, T2 4.8 m, solid masonry under them from
  `extra`), the arcaded corridor, gate tunnels west (Ghost) and east (the reds), the hypogeum (B) with four
  trapdoor stairs. Curved walls: diagonal steps closed on the outside of the curve.

## M6.20.4 — mood boards, part one: the Theatre (24), the Swimming Baths (25), the Ancient Temple (26)
- **Level 24, the Theatre** (`levels/theatre.js`): the Grand - foyer, stalls (seats 's'), the circle and boxes
  (floor 1, holes 'O' over the stalls; G `noRoof` there so the auditorium is two storeys), the stage and
  backstage as storey **S** a metre up (its tall fly tower; a plinth under it), steps up at either side
  through ':' openings in the proscenium ('J' row). Daskova in the right-hand box; the manifest backstage.
- **Level 25, the Swimming Baths** (`levels/baths.js`): the pool ('~', `channel 2.4`, `surf 0.15`, `bedMat:
  'pooltile'` - over your head), the learner pool, the 3 m diving board (storey D up a ladder), the gallery
  (floor 1, its parapet 'a'), changing rooms, reception, the office upstairs, the plant room underneath.
  `atmos.water` lights the pool at night.
- **Level 26, the Ancient Temple** (`levels/temple.js`): Ix Tolun - a stepped pyramid (G base, terrace T1, the
  upper tier solid to T2, the shrine), the Hall of Pillars, the sanctum behind a **stone door** ('Q', skinned:
  `lockedText`), the tomb (B), the looters' camp, jungle. The **glyph wheel** is a terminal with `look:
  'stone'`, `verb: 'Turn'`, `doing: 'Turning'`.
- A test that every stair can be stepped onto (drafts2) - the baths' first stairs started against walls.

## M6.20.3 — the big settings: Busy City (21), Desolated City (22), Nuclear Wasteland (23)
- **Level 21, the Busy City** (`levels/city.js`): Varnholm's commercial district, a 4x3 grid of blocks (towers
  as solid facade boxes on 'J' squares), Kessel Tower (three storeys inside), the car park, Caffe Corso, the
  plaza. **Traffic**: vehicles with `traffic: true` drive their loop with no crew. **The courier's van** waits
  (`wait: 40` s - or goes at once if its crew is hurt) then drives out of the city (`goal: 'escape'`); a car and
  a jeep for you by the way in. Vehicles running into a man knock him down (drive.js, `downBy: 'vehicle'`).
  A vehicle on a path with no `at` starts at its first point; with no `yaw` it faces along its way.
- **Level 22, the Desolated City** (`levels/ruins.js`): Drosk, nine ruined blocks - broken-off towers, rubble
  heaps ('y'), burnt cars ('x'), the park, a flooded crater, the Yellows' camp (tents 'n', fire drums 'e').
  The Meridian hotel's shell (holes in its floor), Radio Drosk (the transmitter: a terminal), the shop where
  Corporal Takacs hides. Objectives: reach LANTERN's vehicle, take the black box, send it (hack).
- **Level 23, the Nuclear Wasteland** (`levels/wasteland.js`): the Vell valley by Hesk power station. Site 9
  (fence, watchtowers up ladders, the lab underground), the reactor hall and cooling towers, the village.
  **Radiation** (`spec.radiation: [{ at, r, rate }]`): the dose falls off with the square of the distance; the
  Geiger counter clicks (`audio.geiger`), harm a point at a time ('radiation sickness'), no healing while in it.
- **`spec.atmos`** (render.js): `{ fog: [r, g, b, start, end], ambient, sun: [r, g, b, intensity, pitch, yaw], sky }`
  - a level's own air.
- The drive tests drive every level's AI vehicles round their ways.

## M6.20.2 — insulated and non-insulated explosives (Rhys)
- `sympathy` (metres) on a charge makes it non-insulated: any blast with damage within that distance (or 0.8 of
  the blast's own radius, whichever is more) sets it off 0.14 s later - so a string of mines goes off one after
  another (weapons.js `detonate`, event `chained`). Remote and proximity mines: 6 m. `insulated` (C5): only
  your key sets it off. Guard rockets count (they go through `detonate`).

## M6.20.1 — Rhys's notes on Level 20 (and the Facility, the Assassination, the Mineshaft)
- **The freeze** ("Hit 1 FPS ... couldn't even close the page"): guards on the river planned routes to you across
  a kilometre of map - and a search with no answer (you on the water) ran to its limit, one a frame. Now a guard
  whose search finds nothing waits 4-6 s before he tries again (all levels), and a level can set `chaseMax`
  (metres: no route planned to anywhere further off; the river has 60) - the river's `navCap` is down to 40000.
- **Seeing yourself**: the operative sits in the driver's seat (the `Driving_Loop` clip; `SEAT` hips/feet from
  guard.js) in the chase view. The boat's seat moved onto its model's seat.
- **Steering**: the boat turns at 0.8 rad/s (was 1.25), the helm comes over at 2.8/s (was 6), and turns less
  at full speed. Cars 1.3, jeeps 1.35.
- **Collisions**: another vehicle is shoved aside (mostly sideways) and you glance off it; along a bank a boat
  keeps its way on and comes round alongside; a glancing blow turns it off; head-on it stops.
- **Sounds**: an engine (`audio.engine`: a rough note climbing with the revs, a boat's wash) for yours and the
  nearest other; `audio.board`/`unboard` getting in and out. No footsteps at the wheel.
- **Aiming**: the view turns with the boat, unless you hold right mouse (then it stays where you point it); left
  alone it comes round behind the boat. A shot within a few degrees of a man in sight goes to him.
- **Bodies**: a crew rides its boat whoever is driving - take a boat and its dead go with it (the helmsman's
  body moved off your seat). Crews are copied per build.
- The Pilot (AI helm) moves on from a point it has passed, and slows for sharp turns close by.
- **Facility**: the UV drops are laid on whatever is under them, and the trail goes round the stairwell, down
  the stairs and through the plant room (they had hung over the stairwell).
- **Assassination**: the consulate's back rooms (ground and first floor) had no front wall - a door in a stub
  you could walk round. Walls with doors now.
- **Mineshaft**: rock under the ramp's landing where it leaves the pit floor (the sky showed through).

## M6.20.0 — Vehicles begin (M8): driving, and Level 20, the Riverboat Pursuit
- **Driving** (`src/sim/vehicles/drive.js`, tested in `test/drive.test.mjs`): `Drivable` and `Pilot`. In main.js
  `vehicleNear`/`vehicleUse` (first in the E chain), the driven vehicle steps before the player (moveZ
  throttle, moveX steer, jump brake), the player rides the seat (player.js `driving` branch), a chase camera
  (8.5 m behind a boat, 7.5 a car), the prompt shows km/h. Your own vehicle is a `ghost` solid while you
  drive (bullets pass it, so you can shoot out and be shot).
- **Damage**: rounds into a vehicle (weapons.js `trace`) take half their damage off its hp; blasts within
  reach (rockets, grenades) take a lot (`world.vehicles`). Knocks over 9 m/s hurt it too.
- **Kit**: `spec.vehicles` (see the roadmap); crews are put aboard at build (`g.aboard`, their body solids
  `rider` - no vehicle is stopped by a rider); boats on paths do not foul each other. `testNavCap` lets a
  long level's reach test search further than its guards do in play.
- **Runtime**: AI vehicles step along their paths in drafts; crews ride at their offsets (the dead too);
  objective `'stop'` with `leftM` (metres still to go) in its status.
- **Level 20, the Riverboat Pursuit** (`levels/riverboat.js`): a kilometre of the River Vell, three bridges
  with parapets, warehouses, quays, the harbour basin and the ship. Ghost's speedboat at the hotel jetty;
  the captain's launch (helmsman, captain, bodyguard) away down the river at 12.5 m/s - about two minutes
  to the ship; a gunboat looping the middle reach; reds with rockets on the bridges and quays. Extract at
  the police launch, Kell Quay.

## M6.19.7 — Rhys's playthrough of Levels 5-19 on M6.19.6 (326 screenshots)

- **The open walls** (level_kit.js): the gap Rhys kept finding was at every corner where a wall run met a cross
  wall and carried on as a window, a door or another run - the half square past the cross wall was never
  built, a slit the storey's height. Now built. Found by reproducing his shots (his HUD's position and
  compass, read back off the screenshots) side by side with the build.
- **Lamps** only where a ceiling was built: none on a stair's steps (it hung at the ceiling over the stair's
  hole), none under the open sky ("floating lights"). Each stair has a light of its own over its middle.
- **Before building** (tidyRows, with the stairs known): no furniture on a stair's footprint (either floor);
  nothing standing in front of or behind a door; no door opening onto a stair's steps or its hole (moved
  along its wall).
- **Railings** round stairwells look like railings (two rails and posts; one unseen solid), not black slabs.
- **Night levels**: lamps on the outsides of the buildings' walls (their outsides were black shapes).
- **Glass** looks its kind: ordinary clear; toughened (`F.glassTough` 1-2, 'glassT') greener and cloudier;
  bulletproof (3+, 'glassB') deep green, more mirror, in a heavy steel frame.
- **Vehicles**: the van (`drawVan`) - body, bonnet, windscreen and side glass, bumpers, lights, wheels - and
  parked where it fits (it was through a wall at the Fortress); parked cars ('v') likewise.
- **A ladder up through several storeys** (the mine's shaft) has nothing built across it on the way.
- **Pickups** glow and slowly pulse; the cipher book is red-bound.
- **Thermal**: a body's heat in a body's shape - head, chest, hips, arms, legs, turned the way he faces.
- **The radar's diamond** after the objectives: it was given [x, y, z] for [x, z] (so it sat at z = 0).
- **No sprinting in the air** (falling, or under the canopy).
- **The Estate**: garage doors (a pair of up-and-over doors, 'shutter') across each lock-up; the houses' back
  room off the front room (its door had opened into the stair). **The Fortress**: the gate opens (a pair of
  gates, the passage through the wall behind), a postern in the east wall. **The Campus**: the Catalyst has
  storeys of its own (C1 the mezzanine at 3.2 m, 3 m under it; C2 upstairs at 7.0, the atrium open to it; C3
  the roof garden). **The Factory: Battle**: 14 a side (was 8), the locked doors unlocked, two lanes each
  through the halls round the core.
- Tests: drafts2.test.mjs now 30.

## M6.19.6 — Rhys's notes on M6.18.11 - M6.19.5 (310 screenshots): the kit's shared faults, then level by level

- **The kit, before a level is built** (level_kit.js `tidyRows`, once per spec; `spec.tidy: false` for a map
  drawn by Rhys): a wall drawn corner to corner (an arc, a slant) is filled in at each step - the corner-only
  touch let the outdoors into the building (no floor: the grass showed; no ceiling; no lamps: "missing
  walls", "mown grass under buildings"); a one-square slot between two walls is filled; a door that opens
  onto a wall, a hole or nothing in the air is moved along its wall to where it opens both ways, else
  walled up ("doors into non-existent rooms", "back doors out to the infinite void").
- **Windows** (`autoWindows`, spec/floor `windows: false` to stop it): an outside wall between a room and
  the outdoors gets one every third square; not underground, not on walls taller than 4.6 m. Kit glass is
  ordinary glass now (`tough: 0`; `F.glassTough` for bulletproof) - Rusk's office window was stopping rounds.
- **Slabs** (`slabBoxes`): floors and ceilings stop at an outside wall's face - they ran half a square past
  every outside wall, a ledge round every storey ("wonky buildings").
- **The ground** stops short under a building's own floor (no grass to show through or fight with it).
- **Underground** there is no outdoors: every non-wall square is inside (its ceiling, its lamps - the mine).
- **Stairwells**: railed round on the floor above but for the way off the top; where a stair goes down
  through the ground, the hole's sides lined ("weird gaps behind staircases").
- **Deep water**: iron ladders up its sides every so often (`F.waterLadders: false` to stop) - the Shipyard.
- New squares: `':'` an archway (an opening with no door: closes a building like a wall), `'J'` solid built
  by the spec (a plinth), `'l'` a street lamp (post and light).
- **Portals** may turn you (`to`, `turn`), work one way only (`heading`), a number of times (`times`), only
  once a pickup is taken (`on`), and say something (`said`).
- **The Sewers**: Canal Street's lamps, one over the steps down; brighter tunnels; the drafts' night ambient
  raised. **The Cemetery**: the mausoleums are rooms round a family tomb, not cupboards (and the graves no
  longer knock holes in them). **The Estate**: a number on every front door (odd north, the shop 1; even
  south - 7 and 11 and 22 where the objectives say), LINDEN STORES, the street sign. **The Campus**: the
  sports building's leak (the annex stair) closed, its doors where the rings are straight; teaching blocks'
  doors never onto a stair; BioSciences' lab door (reinforced) moved off the stair. **The Assassination**:
  Rusk in a white dress uniform; a named man's name shows under your sights; the glass gives. **The Ward**:
  the turning room (out of three of its doors you come back in through another, the room turned under
  you), the stairs that only go up (three times), a door standing on its own in the hall; the antidote now
  at the top of the stairs; 8 orderlies. **The Fortress**: the motor pool's open front an archway. **The
  Drop**: the helicopter pad is a pad - ring, H, lamps, windsock.
- **Systems**: thermal shows a body's heat through walls and doors (out to 40 m; drawn over everything).
  Battles: down is not a pause (the pointer stays locked); back in with the kit you deployed with, every
  magazine full. A guard's line that names a side is only said of that side (reds no longer call Ghost
  "Yellows", nor the Yellows call Ghost "reds").
- Tests: test/drafts2.test.mjs (19); kit, battle, train tests updated.

## M6.19.5 — battle mode: Level 18 the Beachhead (Rhys's sheet), Level 19 the Factory: Battle

- **Battle mode** (src/sim/play/battle.js, pure): two sides, a reserve each (100), a clock (600 s). Every man
  sent onto the field is paid for out of his side's reserve - you as well, each time you go back in. It
  ends at the clock (more men left, reserve + field, wins; level is a draw) or when a side has none in
  reserve and none on the field (Rhys's Info tab), or when you are down with none left to send.
  `RULES.battle` (story.js): win = success, draw = partial, lose = failed; debrief lines both sides'
  counts and yours; BATTLE WON / DRAWN / LOST; no trophies yet.
- **The field** (kit `spec.battle`: `{ you, timer, teams: { side: { name, short, faction, reserve, field,
  arms, spawns, lanes } } }`): each side a pool of guards (`field`, yours one fewer - you are one) that
  stands for the whole reserve. `Guard.revive(pos, yaw, push)` brings a fallen man back on, fresh, at his
  side's end (BATTLE.corpse s after he fell). A lane: points from his end to theirs; `g.push` (guard.js
  patrol) runs him to the next point by the nav, he holds it (BATTLE.hold), then on. They fight
  whoever of the other side they see (factions.js relations, worked out from the sides); Ghost's men
  are `side: 'ally'` (blue, on the radar as allies, not yours to command yet).
- **You down** (main.js death -> `missionRt.youDown()`): back in at your end after BATTLE.youBack s,
  kit as you deployed (`respawnYou` in the mission ctx); the step line counts it down.
- **Running water** (kit `spec.currents`): swimming in it carries you. **A fixed gun that swivels**
  (`level.cannons`): stand at it, E fires a shell (the rocket's blast) where you are looking; 8 s to load.
- **Level 18, the Beachhead** (beachhead.js, from src/game/levels/maps/beachhead.json - the xlsx through
  tools/map_to_json.py): a square 2 m; the river (fast: swim it and it carries you south), the sea; the
  reds' 8 m sea wall with a wall-walk (its diagonal steps filled so it is a wall, not posts), the gate
  and the two destructible barricades (reinforced: C5), the artillery bunker with the gun on its roof;
  Ghost's two gated walls and the bastion; the lower pier over the river's mouth (the only dry way
  over), the upper pier (its ladder on Ghost's side). Ghost east, the reds west - my call.
- **Level 19, the Factory: Battle** (factory_battle.js): factory.json as drawn, Ghost against the
  Yellows, each at its two corners (the sheet's spawn points), lanes round the ring corridors.
- Tests: test/battle.test.mjs (7); kit.test.mjs checks every lane point is reachable from its side's
  spawn and every spawn spot stands on something.

## M6.19.4 — first drafts 15-17, one new system each: the Shipyard (blast doors), the Fortress (machine guns and rockets), the Drop (a parachute start)

- **Blast doors** (doors.js `def.blastDoor`; kit 'Q'): reinforced, locked, `vault` - no charge or breaching
  round moves one (`breach` returns 'held'); a terminal opens it. **Ducts** (kit 'u'): crawl height
  (0.75 m; go prone), solid above - a way round for you, not the guards.
- **Machine guns and rockets** (guard.js ARMS `lmg` (drops the new KR-90 LMG: 90-round belt, slow
  reload), `hmg` (mounted - drops nothing), `rocket`): a rocket is a streak and, a moment later, a burst
  where it lands (weapons.js WEAPONS.ROCKET, through `arsenal.detonate`: it hurts you and anyone near).
- **A start in the air** (kit `start.alt`); the parachute from the gear slot as in the casino.
- **Level 15, the Shipyard** (shipyard.js): Varrow Naval Yard - the quay, workshop, containers, cranes,
  the dock control tower, the gatehouse; the cruiser Ardent alongside: gangway, main deck and turrets,
  the superstructure (bridge above, hatch down), the lower deck - engine room, mess, magazine, and the
  armoured citadel behind blast doors (the tower's terminal opens them; or the engine room's vent).
  Take the arming codes; optionally hack the dock controls, stop Captain Volkov. 16 reds.
- **Level 16, the Fortress** (fortress.js): Fort Kerreth - a 5 m curtain wall, four towers (HMGs on
  two), the wall-walk (ladders up inside each corner), the gate (two reinforced pairs), barracks, motor
  pool, armoury, command bunker; the culvert under the west wall (crawl). LMGs, HMGs, rockets. Take the
  launch keys; optionally hack the signals terminal, stop Commander Brask. 18 reds.
- **Level 17, the Drop** (drop.js): out of a transport's hold at 160 m over the sea; parachute down to
  Skarra's radar station. Hack the radar control, take the coastal defence plans, then the helicopter
  pad. 12 reds.

## M6.19.3 — first draft 14: the Campus, as one map

- **Level 14, the Campus** (levels/campus.js): Brookvale University - a fictional campus on Edge Hill's
  layout (from Rhys's campus map PDF and his building-by-building brief; renamed, no real signage), the
  whole of it on one 300 x 200 m map. Faculty of Education by the west lake (its Lakeside cafe nearest
  the water); Health, Social Care and Medicine (lower ground, ground with a cafe, first; training wards);
  BioSciences (four storeys; the CAVE; the third-floor pathogen lab behind a reinforced door); the long
  Business School (a gallery all along its first floor, over the ground floor); the curved Sport and
  Physical Activity building (two curved corridors each floor, rooms between, a stair each end, the
  annex up a half floor); the Students' Union (bar and dance venue, launderette, sandwich shop, shop);
  the Catalyst (ground, mezzanine round an atrium, first, second, the rooftop garden); the Hub (store
  below; shop, coffee counter, restaurant, hall, dining hall; upstairs two halves not joined - left
  with a bridge and the prayer room, right through to the Main Building); the Main Building; the old
  halls I, J, H, G; the Arts Centre (theatre, band and rehearsal rooms, lounge bar); Creative Edge
  (basement, open plan, rooftop garden off the first floor); the Sports Centre (pool and gym); the
  east lake, paths, car parks, the road. Take the pathogen sample, bring out Professor Qureshi
  (the Catalyst, floor 2); optionally hack the campus security terminal. 24 reds.
- Kit: walls built in runs (one box a straight run, not a post and stubs a square - the campus went
  from 21,000 pieces to 7,700); `decals` (flat ground strips - paths, roads) merged by row; storeys'
  floors computed first, a ceiling wherever no storey above floors it; upper storeys' nav grids only
  as big as what they floor; water on the ground storey holes the ground (lakes, pools);
  `pieceBudget`. The lift in the sports building, like the mine's cage, is still to come.

## M6.19.2 — first drafts 11-13: the Research Facility, the Assassination, the Ward; thermal, UV and EMF

- **Vision modes** (main.js V; runtime `visionShow`): V now steps through every mode the gear slot gives
  - night, **thermal**, **UV**, **EMF** - then normal. Thermal: the picture grey and flat, every living
  body a white glow (through mist and smoke), hot pipes and machines glowing. UV: violet, marks and
  traces glowing. EMF: dim, wiring and devices glowing. New gear: EMF Scanner (EMFSCAN) and the
  Multi-spectrum Visor (MULTIVIS: all four). Levels place what each shows with `kit.mark(kind, a, b)`
  (uv | emf | heat (warm) | mist - mist hidden to thermal; `until: <pickup>` lifts it).
- **Level 11, the Research Facility** (facility.js): Halden Research Station - labs, the cold store
  full of mist (thermal), Dr Brandt's blood trail from the chemistry lab to the plant room's
  crawlspace (UV), the shielded data room behind a door that looks like the wall, its cabling in the
  service corridor's ceiling (EMF); the plant room's pipes and boilers. Rescue Dr Ilse Brandt, take the
  sample case, hack the data terminal. 13 reds.
- **Level 12, the Assassination** (vantage.js): Market Square, Varnholm - the unfinished Halloran
  Building (four floors, its east face open), the square, the reds' consulate. Reach the vantage
  point, stop Colonel Rusk - he goes from his desk to his window and stands there (route points may
  give their own pause: [x, y, seconds]). LR7 marksman kit.
- **Level 13, the Ward** (ward.js) - the drugged level, not the real world (off duty, no Control, a
  pistol only): an endless corridor of identical wards (portals: step past an end and you are 30
  squares back), a cupboard that opens into a room far too big, whose door lets you out in the ward
  where you woke. Take the antidote and the loop breaks; the haze lifts; the way out is at the end.
  The picture swims (hue, blur) until then.
- Kit: `extract` (the way out apart from the way in), `portals`, `doorSkins` (a door dressed as wall),
  `offDuty`, `drugged`; patrol legs laid along the nav grid at build time (routes follow corridors);
  the default floor is the ground one. Guard routes take [x, y, pause].
- Tests: kit.test.mjs checks every patrol leg is clear of walls, and reachability via portals.

## M6.19.1 — first drafts 8-10: the Housing Estate, the Manor House, the Mineshaft

- **Level 8, the Housing Estate** (levels/estate.js, cell 1.2 m): Linden Row - one house plan
  stamped (hall and stair up one side, two rooms each side of a cross wall; mirrored for the south
  side): a terrace of five, semis, a three-storey end house and another (attics up a ladder from the
  back bedroom), two bungalows, the corner shop, lock-up garages, fenced back gardens and alleys.
  Number 7 is the upside-down house. Take the bomb plans (No. 7 upstairs), stop Ferris (No. 11's
  attic); optionally bring Mrs Adeyemi out of No. 22. 12 reds, afternoon.
- **Level 9, the Manor House** (manor.js): Ashcombe Park - the house (hall and grand stair, library,
  drawing and dining rooms, the servants' hall with back stairs down to the kitchens and cellars and
  up to the servants' corridor; bedrooms and the long gallery above), the gatehouse, drive, parterre,
  chapel, stables, walled kitchen garden, the forest and the gamekeeper's hut. Take the sales ledger,
  hack the butler's pantry terminal, take the prototype from the strongroom; optionally stop Harrow.
- **Level 10, the Mineshaft** (mine.js): Kessock Quarry - the yard, the open pit in three terraces
  (4 m each) to its floor at -16, ramps between them, the mine's haulage tunnel, ore chamber,
  pumping station and the shaft (a 16 m ladder up to the headframe; the cage lift is to come). Take
  the arms manifest, bring out Dr Mira Kovač. 14 Yellows.
- Kit: stairs may give their own nav ends (`navFoot`/`navHead`); a floor's `noRoof` rectangles;
  `outside.holes`; NavGrid `maxSteps` (level.navCap, 120000 for the drafts) - the pit's ramps cut
  each terrace, so the guards' way round is long.

## M6.19.0 — the level kit, and the first drafts begin: the Sewers, the Bank, the Cemetery and Crypt

Rhys (after M6.18.11): "Can you put together ALL the other levels I've asked for please, so that I can
play through the game and give pointers on each individual level?" His answers: every listed idea is a
level (mood-board places included); the order proposed (ready-now levels in threes, then one-system
levels, then battle mode, then vehicles, then the big settings and the mood boards); who/what/when is
Claude's call, notes after playing; almost all Ghost assignments (the Train off duty, the drugged level
outside the real world); the Campus as one map; self-contained levels now, the hub map after.
- **The kit** (src/game/levels/kit.js): `buildKitLevel(spec)` builds a level from a spec - floors as
  rows of characters (or `carve`d: rooms cut out of solid, walls put round them, doors and furniture
  after), one square `spec.cell` m (1.5). Walls, windows, doors (D, L locked, R reinforced, V vault),
  floors and ceilings (a ceiling wherever the storey above does not floor it), water channels, furniture
  and cover by letter (see the file's head), lamps per room, straight stairs (`stairs`) and ladders,
  ground holed where they go down, a backdrop (city blocks, woods, hills), the Ghost van at the way in,
  zones, guards, hostages, pickups, terminals (they open V doors), places to reach.
- **The draft rules** (story.js `draftRules`): objectives of kind clear / kill / take / hack / rescue /
  reach, some optional; settled when every required one is done or past doing; then back to the way in
  (hold E there to withdraw before). Runtime: `draftObjectives()`, pickups drawn and taken with E, the
  step line shows the next objective, the debrief lists them; trophies via `clearTrophies`.
- **Title screen**: "Levels 5 onward (first drafts)" opens a list; `index.html?level=<id>` plays one.
  The HUD reads "LEVEL n //". Specs in src/game/levels/, ordered in levels/index.js.
- **Level 5, the Sewers**: down the outfall steps off Canal Street; the main tunnel and its channel, the
  overflow chamber, the pump room, the reds' depot; bring out Dalia Brennan (water engineer), take the
  shipment manifest. 11 reds, dark (torches; NVG in your kit).
- **Level 6, the Bank**: the Merchants' Exchange Bank; Yellows mid-heist. Hack the security terminal
  (first floor) to open the vault, take the dossier from box 114; optionally bring out Mr Osei. 12.
- **Level 7, Cemetery and Crypt**: St Aldric's, night; graves, mausoleums, the chapel, the crypt below.
  Take the cipher book, stop "Brother Teodor". 10 Yellows.
- Also: the plain freight crate texture `cargo` (no Ghost mark); iron railings for the kit's 'f'.
- Tests: test/kit.test.mjs (every draft builds, everyone stands on something, every guard, hostage,
  pickup and terminal reachable from the way in by the guards' nav).

## M6.18.11 — signs right way round; the board inside its frame; the Minister seated; the hood's clean edge; the guard's coded call

Rhys's quick notes on M6.18.9-10 (with 46 screenshots): Belyagorsk's signs "printed backwards"; the nose
"jaggedy" from inside; the matrix board's numbers overhang it; the Minister should sit; and a hostage
guard "wouldn't make an announcement like that - he'd probably encode something in an otherwise calm
and peaceful message". Plus two I spotted: the cab desk offered "SPACE Climb"; its dials hung over black.
- **Signs** (render.js): one face drawn two-sided showed its back mirrored. Now every sign has two
  faces, each culled at the back (the second turned 180°), so it reads right from both sides.
  Belyagorsk's names face the train (yaw π).
- **The departures board**: its housing now frames the lamps (it was narrower than the sign); text
  inset 3 lamps; English "LEAVING" and "Pl." so the longest line (21:40 Belyagorsk LEAVING | Pl. 3)
  fits the 192 columns.
- **The Minister** (npc `sitting`; anim.js `pickClip` sitting → Driving_Loop held still; dead and
  sitting → slumped in the seat): in the bay's rear-facing seat, feet under the table; he no longer
  turns to face you.
- **The nose** (`nose`): faces across the windscreen's foot are cut along it (polygon clipping, the
  crossing found by halving) instead of being kept or dropped whole - a clean curved edge from the cab.
- **The guard's call** (voice `gpa`, new recording 4a091f5f): "Ladies and gentlemen, this is your guard
  speaking. This train is now under the control of the Front of Memory. Please comply with their
  instructions. Nobody needs to be a hero tonight - stay in your seats, and we will all get back in one
  piece. Would Inspector Pesak please come to the guard's van. Inspector Pesak to the guard's van. Thank
  you." No shot. After it, the hint decodes it: no Inspector Pesak - the railway's call for help (pesak:
  sand - their Inspector Sands).
- **The cab desk**: noClimb, a lighter grey.
- Tests: train.test.mjs 52.

## M6.18.10 — the rest of the journey passes; the guard calls from his van; the cab's view over the nose; the railway's parcels

Rhys on M6.18.9: clearing the six took ~156 s, "waiting around for 18mins is going to feel like AGES";
the nose "still looks weird from inside the driver's cab"; nothing makes you go to the guard's van
first; the van's crates say "Ghost Logistics". (Screenshots mentioned but not received - asked for.)
- **Skipping the rest** (level_train.js `TrainRun.skipAhead`, `RUN.skipShort` 400; mission_runtime.js
  `startSkip`/`skipTick`, `HIJACK.rest` 45): with all six down, sit in any seat (Coach 3 or 4 -
  `nearestSeat(seats, pos, coaches)`) or wait 45 s, and the screen fades; the train jumps on at top speed
  to 400 m short of where Belyagorsk is announced (about 2 minutes out), the clock moved on by the time
  that would have taken (eta stays consistent); "The rest of the journey passes quietly." Then the
  announcement, the arrival, the police, as before. The top line reads "The train is yours again".
- **The guard's call** (`HIJACK.call` 18 s after the hijack; `guardPA`, voice `gpa` = speaker 846
  through the tannoy filter, gen_staff2.py): "This is the guard. They have got me in the van, at the
  back. If anyone can hear this - please -", cut short, then a distant shot and a hint. Only if he is
  alive, not yet trusting you, fm_van alive and you are not already by him; it waits for the tannoy to
  be free (gives up after 30 s). Once called, the radar's diamond points at the guard until he joins.
- **The nose from the cab** (`nose`, `NOSE.deckTo` 0.55): through the cab window you looked down into
  the hollow shell and saw the track under a floating hood. Now a dark deck at the window's sill closes
  the hollow under the raked glass, and the shell's walls above it are laid inside (`inward`).
- **Parcels** (textures.js `PAINT.parcel`, render.js MATS `parcel`): the van's crates are stencilled
  БЕЛЯГОРСК and a parcel number, not Ghost Logistics. The HUD's zone label reads "OFF DUTY //" on the
  train (body.offduty), not "GHOST TRAINING //".
- Tests: train.test.mjs 48.

## M6.18.9 — the hood from the cab; the Minister's fuse only for a fight in first class; paid-for food that keeps you going; no running on the seats

Rhys on M6.18.8 (with 112 screenshots, M6.18.6-8): "what's going on with the nose now?"; is the van
"Б" standard?; the Minister died before he could do anything; he "accidentally" killed the guard;
the steward's "last" sandwich every time; is everything free?; food heals you though you can't have
been hurt yet; you can run along the tops of the seats. (Note to self, Rhys: when he mentions
screenshots and none arrive, ask for them at once.)
- **The nose** (level_train.js `nose`; render.js quads `inward`): M6.18.8's two-sided shell was dark
  from the cab and its tinted windscreen showed the hollow inside from outside. Now: the windscreen is
  opaque dark paint, faces outward (from inside, culled - the cab sees out); and the hood's upper faces
  (n.y > 0.15, ahead of the windscreen's start) are laid again as an inner skin - `inward` quads, wound
  to face in, lit with the outward normal - so from the cab you see the hood as from outside.
- **The van**: numbered 5 like the rest (Б was my shorthand for багажный).
- **The Minister's fuse** (HIJACK.fuse 15 s): burns only while a holder is alert AND sees you, or you
  (or the guard) are in Coach 1. The two holders are 'steady' (they keep their post).
- **The guard**: never a takedown target; killed by your shots → `level.hijack.guardKilledByYou`, a red
  line on the debrief ("The train's guard - killed by you"), and the grade at best partial.
- **Barks**: no "Yellows!" on the train (a line naming them is swapped for a plain one, or dropped).
- **Money** (mission_runtime.js `PRICES` coffee 15, tea 12, sandwich 30, paper 40 grosh; `pay`;
  `rt.grosh` 400 to start): the buffet and the kiosk charge; the steward has two sandwiches
  ("Cheese and pickle. Enjoy." / "- the last one." / "Sorry - that was the last sandwich.").
- **Food and drink** (player.js `buffs`): no healing. Coffee/tea: `awake` 10 min - sprinting drains
  stamina at 0.6, it returns 1.5x. A sandwich: `fed` 10 min - after damage, mending starts at half the
  delay, twice as fast.
- **Seats**: cushions 0.48 m (over the 0.45 m step), seats and backs `noClimb` - you walk the aisle.
- The cab desk's dials are small flat lights now.

## M6.18.8 — the guard as your ally; the Minister and the buffet's steward talk; the cab locked; the clock and the minutes agree; off duty means no Control

Rhys on M6.18.6-7: "Belyagorsk in 20 min" fell to 16 while the clock showed 21:41; the guard said he
was useless - he should thank you, ask you to help take the train back, give you his sidearm if you
are unarmed (no point if you have just picked one up), then fight beside you; no Ghost/Control on an
off-duty mission; the Front "were kind enough to open the reinforced door"; the nose invisible from
the cab; a hijacker appeared behind him, and a corpse hung out of the train's doors; the Minister
silent; no one in the buffet; "what are those blocks" in the locomotive; a concrete wall passing
through the train in the first tunnel. (His screenshots did not come through.)
- **ETA** (`TrainRun.eta()`): seconds to the platform by the physics (to top speed, on, braking);
  the top line shows ceil(eta/60) - it now falls one minute per minute.
- **The wall**: the Novomir tunnel's black end (across the line, 60 m in) is its own mover
  ('tunnelcap'), there only while the train stands; it had met the train as the station slid back.
- **Off duty** (`level.offDuty`): radio(), control() and intercept() say nothing.
- **The cab**: stays shut and locked at the hijack (they lock themselves in): breach it - the
  buffet man drops a BR-12.
- **Waking** (`seenByYou`, `wakeHijacker`): a hijacker you could see at the moment of the hijack
  (or within 2.5 m) appears only once you cannot. On the train a dead man falls along the aisle,
  kept within it (yaw to ±x, |z| ≤ 0.5).
- **The guard** (`level.allyGuard`, faction 'ally'; `level.relations`: red vs you and ally, ally vs
  red; factions.js `hostileTo` ignores the dormant): "Who are you? Stay back..." until he has seen one
  go down; then "Thank you... help me take this train back - safely." and, 4.6 s on, if you carry no
  gun: "Here - my sidearm..." (a PX9 and three magazines at your feet), else "You are armed already...";
  then the NPC is gone and the ally Guard stands in his place, armed with the van's rifle, `escort
  { lead, lag 2.2 }`: he follows you and fights them. His death is not yours to count.
- **The Minister** talks (st5, LibriTTS 687): before / held / saved. **The steward** (st6, 296) at the
  buffet counter's end: tea or a sandwich (health; the sandwich stamina too); after the hijack, "Not
  now - get down!" Recordings: tools/voices/gen_staff2.py.
- **The nose from the cab**: the cab sits inside the nose's shell, so it saw only the shell's backs
  (culled). The nose's parts are drawn two-sided (`twoSided`, render.js '^' variant: no culling,
  two-sided lighting); faces wholly under the windscreen are left out; the windscreen is a tinted
  glass ('tintglass': dark from outside, seen through from inside).
- **The locomotive**: the "blocks" are the traction equipment's cabinets - now with doors, handles,
  indicator lamps and "25 kV" plates; the cab desk has screens and lit dials, and a driver's seat.

## M6.18.7 — the hijack: the Front of Memory's six; the Minister held; the guard's pistol earned; the story branches

Rhys (before playing M6.18.6): the announcement's subtitle ran off the screen; the hijack just at
the end of the city tunnel, about 2 minutes in; 6 hijackers; the Minister killed is a partial result
that changes the next levels - **dead: the Front of Memory take Belyagorsk City and hold it (you deal
with them later); protected: the Front are rooted out and arrested, only a few loyalists left.**
- **The six** (level_train.js `hijackers`, `level.hijackers`): Guards (faction 'red' for the AI,
  `side: 'front'`, title "Front of Memory"; grey - the officer darker), `dormant` until the hijack
  (not stepped, not drawn, not on the radar, solids off, cannot be taken down). fm_cab (smg, at the
  controls), fm_engine (pistol, walks the engine room), fm_officer (smg) and fm_first (carbine,
  walks the aisle) in first class - `holds`: the two over the Minister - fm_buffet (shotgun: drops a
  BR-12 to breach with), fm_van (pistol, back to you as you come in from Coach 4, over the guard).
- **The hijack** (`HIJACK.at` 2100 m - the end of the city tunnel, ≈ 1.6-2 min after 21:40;
  mission_runtime.js `hijackNow`): they wake; the cab door unlocked and open; you are stood up and
  can no longer sit (`level.hijacked`); their man on the tannoy (voice fm1: LibriTTS 182, tannoy
  filter; `HIJACK_TALK.hijack`); the top line: the Minister held/safe/dead, the Front n of 6 down,
  minutes to Belyagorsk.
- **The Minister** (npc 'minister', `onTrain`, first class's front bay): `holders()` - the two `holds`
  still standing. A fight they are in (alert) burns `HIJACK.fuse` (10 s, cooling at half speed); at
  the 'approach' announcement, any holder standing kills him. `killMinister` → `level.hijack.minister`.
- **The guard** (npc 'trainguard', st4 voice, in the van): before he trusts you, "Who are you? Stay
  back..."; he trusts you once he has seen one of them go down (`seesNpc`, or fm_van, over him) -
  then "Here - take my pistol": a PX9 at your feet, three magazines. (Rhys: earned.)
- **The debrief** (story.js RULES.train): Protect Minister Dravets, the Front n of 6 down, Arrive.
  Arrived with him alive: success; dead: partial. `outcome.front`: 'rooted out' / 'holds Belyagorsk'
  - recorded with the save (`recordOutcome`) for the levels to come.
- **Subtitles**: #bark wraps (max min(900px, 88vw)); Severian and English on two lines.
- Not yet: passengers; the hijackers' own voices (they bark the reds' recorded lines); the Minister
  seated (he stands at his bay); the cab retaken / the train stopped by them.

## M6.18.6 — the end of the line: Belyagorsk - Alyejka Azvestya; seats only in Coach 3's seating; a solid nose; resolution that gives way

Rhys on M6.18.5: the train much better; he could stand inside the nose; E to sit was everywhere in
Coaches 3 and 4 and stole E from the gangway doors (seat only in Coach 3, in the seating, not by the
doors); add the destination - Belyagorsk - Alyejka Azvestya, the armed police waiting - about 15-20
minutes; then the hijack; no accolade for time on the train (events make you wait; the clock stays
on the debrief); and a massive frame-rate drop from Low to High.
- **The run** (level_train.js `RUN.arrive` 31 000 m, `decel` 0.6, `approach`; `TrainRun`): running →
  'approach' event (≈ 2.4 km / 80 s out: the announcement) → 'braking' (from v²/2a out, to stop exactly
  at the platform) → 'arrived'. About 18 minutes from 21:40. `run.moving`, `run.left`. ROUTE: an
  'arrival' section (30.4-33 km) with no countryside tiles. `?express` (main.js → buildTrain({express}))
  runs it 8× (≈ 2.3 min) to try the arrival.
- **Belyagorsk** (`arrivalStation`, `TERMINUS` - БЕЛЯГОРСК-АЛЕЙКА АЗВЕСТЯ, my Cyrillic for Rhys's
  "Alyejka Azvestya"): built where it stands when the train has stopped (the train's own
  coordinates); its mover's offset is what is left to run, hidden beyond 2.6 km. Platform on the
  doors' side, canopy on columns, the station's wall, the town either side (unlit), name boards,
  lamps (lights/signs `follow`). Solids (`level.arrivalSolids`) on only once arrived.
- **The police** (npcs kind 'police', `arrival`, `follow`; militia green, caps): along the platform
  by the coaches' doors, facing the train; drawn sliding in with the platform (runtime draws an npc
  with `follow` at home + offset); solid only on arrival; not talked to or knocked down.
- **The end** (mission_runtime.js trainTick): 'approach' → the announcer (sva, Severian then
  English: STAFF_TALK.arrive, recorded 68a0df59); 'arrive' → doors open, platform solid; step off
  (out of the train, onto the platform) → `rt.endHotel(outcome())` → RULES.train: arrived = success.
  The jeep hint is not shown on the train. No trophies on the train (`level.trainRun ? []`).
  Novomir's people's solids go when the train leaves (they stood invisible on Belyagorsk's platform).
- **Seats** (`inSaloon`, `nearestSeat`): only Coach 3, only between its vestibules (x0+2.3..x1-2.3).
- **The nose**: solid (12 stepped boxes, not drawn; under 1.9 m where the windscreen is, so the cab
  still sees out).
- **Resolution** (sim/perf.js `ResScaler`; main.js; render.js `ratioCap`/`ratioFloor`): a frame rate
  under 45 for 2 s brings the pixel ratio down 0.1, to no less than 0.8 (High/Medium) - never back up.
  High draws up to 1.5 pixels per screen pixel; Low 0.75 - the cause of the drop Rhys saw.

## M6.18.5 — the Night Train reshaped (one body, a lofted nose); the band off the doors; any seat, nearest first, again and again

Rhys on M6.18.4: the line's fence good; why a red bar across the coach doors; the train "looks
like a box with a beak added as an afterthought"; once stood up you should be able to sit again
until the hijack; E in Coach 3 should sit you in the nearest free seat, a tie going to port
(left, facing forward); and: does the journey ever end? (Not yet: the line runs on forever.)
- **The body** (level_train.js `BODY`, `sect`, `roofShell`, `loftQuads`): one section for the
  whole train - flat sides, a rounded roof (superellipse, p 8, crown 3.75 m). Every vehicle's
  flat roof box is now solid only; `roofShell` draws the rounded roof over it, ends closed.
- **The nose** (`NOSE.at(t)`, `nose`): lofted from that same section at the cab (t 0) to the tip
  (t 1, 10 m on): the roof rakes down (`top` = 1.02 + 2.73·(1-t)^1.9), it narrows
  (`w` = H·√(1-t^2.6)) and rounds (p 8 → 2.6). Rings resampled evenly round their outline
  (64 points; by angle, the flat sides got few, huge faces). Parts: the body (coach blue),
  the red band swept down the snout (a strip laid on the surface where the section passes its
  height), a yellow warning panel (rings t ≥ 0.86), and the windscreen - an overlay of the upper
  arc above a smooth rising edge line, dark paint: from inside, its faces turned outwards, it is
  culled, so the cab sees out through it. The cab's own front wall and window stay inside.
- **The band**: broken at each doorway (the coaches' `runs`).
- **Seats** (`level.seats`, `nearestSeat`): every seat in Coaches 3 and 4 - window and aisle,
  port and starboard, facing its row. E sits you in the nearest free one in the coach you are in;
  within 5 cm a port seat wins. Any time until `level.hijacked` (false for now). Still at the
  platform, sitting runs the clock on as before. `TrainRun.step`'s fast-forward never winds back.
- **Frame rate**: `level.noSunShadow` - the moon casts no shadows here (two extra drawings of the
  whole level every frame, under the station roof, for nothing).

## M6.18.4 — Severian's letters in the game's own fonts; a crisp lamp font on the board; plain English voices again; no walking off down the line

Rhys on M6.18.3: the city better; the board "a bit blurry - certain letters don't quite render";
not keen on the accented characters, but the announcer "perfect"; and: can the game render
Ȍ ȍ О̏ Ъ ъ Є є Ї і Ԏ ԏ Џ џ Ѕ ѕ Ѵ ѵ Ԁ ԁ (for the Severian language he is writing). His
screenshots: he walked down the line into the tunnel (sky through it) and fell off the world.
- **Fonts** (assets/fonts, OFL.txt): Noto Sans Regular/Bold/CondensedBold and Noto Serif
  Regular/Bold from the notofonts GitHub releases, subset (pyftsubset) to Latin + Latin
  Extended, Cyrillic + Cyrillic Supplement/Extended, the combining marks (U+0300-036F: the
  double grave U+030F is in no Google Fonts subset, hence the full fonts), punctuation;
  woff2, ~90 KB each. index.html declares them as 'Severia Sans' (400/700), 'Severia Sans
  Condensed' (700), 'Severia Serif' (400/700); the UI stack falls back to Severia Sans; the
  signs' canvases draw in Severia Sans Condensed; the paper in Severia Serif; a subtitle with
  any Cyrillic or combining mark is wrapped in `.sev` (Severia Sans) so a letter and its
  accent come from one font. main.js `fontsThenBoot` loads them before the level (≤4 s).
- **The board** (matrix_font.js): a 5×7 lamp font, capitals - Latin, Cyrillic, Є Џ Ѵ Ԁ Ԏ
  and the Latin look-alikes (І Ѕ Ј); accents two rows above from the NFD marks (diaeresis,
  double grave, breve, grave, acute). `matrixDots` sets text with it (no canvas: tested in
  node). Board 192×60 lamps, 6.4 × 2.0 m.
- **Voices**: inspectors and vendor back to st1/st2/st3 (LibriTTS English); the announcer
  stays sva (Severian then English). STAFF_SAY now only the announcement.
- **The line**: a fence past the platforms (`level.lineEnd` = XF + 24) - drawn either side
  of our own track (the train passes there), a station solid across all of it; the line's
  sides walled from the concourse to it (z -18.2 / 20.2); the tunnel lined and black at its end.
- **Frame rate**: `level.lampCap` (train: 5) caps the quality setting's lamp budget (10 on high).

## M6.18.3 — the Night Train: the street closed by buildings; a dot-matrix departures board; Severian accents; the announcement in Severian first; the frame rate

Rhys on M6.18.2: buildings standing in the street at about (-72, -60) and (-75, 73) - a
properly packed city; the departures board should be a matrix board, not a fixed sign;
everyone sounds English - they should have an accent; the announcement in Severian
before English (his own words for it, "Poyiz do vasdat-oden i zorok..."). He will write
a real Severian language to replace the placeholder Severian. His screenshots also
showed the debrief calling the train "Level 1 · Riverside Hotel", and ~20 fps in the train.
- **The street** (level_train.js `STREET`, `level.streetEnds`): runs z -47..59 only; at
  each end two blocks stand across it (solid). Its west side is solid, and blocks fill its
  station side beyond the station (solid), so you cannot walk off it into the buildings.
- **The departures board** (level_train.js `DEPARTURES`, `departures(run, en)`;
  textures.js `MATRIX`, `matrixDots`, `makeMatrixSign`; render.js redraws a sign with
  `board()` whenever its rows change): amber lamps in a 168×60 grid - the clock, the next
  four trains with their platforms; the 21:40 marked ОДХОДИ / DEPARTING in the last half
  minute, gone once she has left; Severian, every 7 seconds the English page.
- **Accents** (tools/voices/gen_sev.py, lines.json; `STAFF_SAY`): each line written out
  in Cyrillic as a Severian says the English ("Тикетс, плиз."), phonemised by the Russian
  rules. Inspectors and the kiosk: the Kazakh ISSAI model's two men (sv1 = M1 Iseke,
  sv2 = M2, sv3 = M1 slower and pitched down), the Russian phonemes mapped to the
  Kazakh model's own. The announcer: the Russian Irinia voice (sva), a two-tone chime,
  the tannoy filter. Models: piper v0.0.2 releases on GitHub (huggingface is blocked here).
  The old English voice files (st1-3, pa1) are gone.
- **The announcement**: Rhys's Severian placeholder, then English, in one recording;
  the subtitle shows both. Swap in his Severian: edit lines.json `depart`, regenerate,
  update `STAFF_TALK.depart`/`STAFF_SAY.depart` and spoken.js.
- **Frame rate**: the city's blocks are `unlit` (render.js: a material variant with
  `useLighting = false` - the lamps no longer shade the whole city); big movers are split
  into 60 m cells (`moverChunks`) so what is out of view is culled.
- **Debrief**: "Level 4 · The Night Train".

## M6.18.2 — the Night Train: an inspector at every gate; knocking one down; the kiosk's coffee and paper; sitting down; a dense city

Rhys on M6.18.1: an inspector at all four platforms, the wrong one redirecting you
to 3; you should be able to take one down, and the others turn on you; sitting in
the train should actually sit you, for at least a moment; coffee and a newspaper
from the kiosk, the paper in Cyrillic and Severian (not Russian or Ukrainian); a
densely packed city with no gaps. Settled: the insurgents are the Front of Memory
(Фронт Памени), dark grey; their grievance a stolen election and history erased.
- **Four gates** (level_train.js `level.gates[1..4]`, props `gate1..4`; npcs
  `inspector1..4`, voices st2 for 1/2, st1 for 3/4): each shut; at 1, 2 and 4
  "Show your ticket" gets `STAFF_TALK.wrong{n}` - the 21:40 is Platform 3. 3 opens.
- **Takedowns of staff** (mission_runtime.js `takedownNpc`, `kick`, `npcAlarm`,
  `gateNear`): F beside one knocks him down (his body falls, not solid). Another
  inspector who can see the body (`seesNpc`, 30 m, line of sight) shouts for the
  police (`level.police`, 8 s); still at the station when they come: "The station
  police arrested you at Novomir Central." (fail). A downed inspector's gate you
  open yourself (E).
- **The kiosk** (npc `vendor`, st3): E - a choice: a coffee (health and stamina
  back), the evening paper (`rt.read(NEWSPAPER)`: the Novomirski Vesnik's front
  page in Severian, a button for English), or nothing. `choose` no longer takes
  the pointer back if the answer opened something else (the paper).
- **Severian** (NEWSPAPER): a Slavic language of its own in Cyrillic, with its own
  letter Ӧ/ӧ ("пӧтуе"), West-Slavic-leaning words ("ктора", "же", "вшетко"), no
  і/ї/є/ґ/ъ. The test rejects common Russian words.
- **Sitting** (player.js `sit`/`stand`/`seated`, `P.seatEye 1.18`, `P.seatHold
  1.5 s`): E in Coach 3 sits you in your window seat (`level.yourSeat`); you are
  held there 1.5 s whatever you press, then any step, jump or crouch stands you
  up into the aisle. While seated the clock runs `RUN.sitPace` (20x) to 21:39:40;
  standing returns it to normal (`TrainRun.sit/unsit/fast`).
- **The city**: a grid of blocks around the station, shoulder to shoulder (about
  330, `level.cityBlocks`), clear only for the street, the line and the station.
- **Voices**: staff sets `staff` (st1), `staff2` (st2), `kiosk` (st3), `pa`.
- **The cab door** is now `build: 'reinforced'` (glass still): Rhys had kicked it
  open with F. Only a breach (charge or shotgun) opens it.

## M6.18.1 — the Night Train: a bullet nose and the view ahead; the city; four platforms; Cyrillic; the ticket inspector; the 21:40 leaves at 21:40

Rhys on M6.18.0: likes it so far; wants a "train-shaped" train - an aerodynamic
bullet nose, not a square British one - and to see out of the front window; a city
round the station, not a station in isolation; some sign of other platforms; the
signage in Cyrillic; someone to inspect your ticket at the platform gate; and asked
what the clock means (9 minutes? too long? too early?). Story answers: the VIP is a
Minister - Belyagorsk Province's representative; the hijackers a new faction, an
insurgency within Severia desperately unhappy with something; the armed guard
hands over his sidearm only once he has seen you do something that earns it (he
cannot tell a civilian "hero" or a hijacker from you otherwise); the ending: bring
the train safely into Belyagorsk, where the armed police are waiting.
- **The nose** (level_train.js `nose`, `NOSE`): the locomotive's front is a deep
  windscreen (1.75-3.05 m) under a visor, and below it a 7.5 m nose that closes to
  a rounded point - a lofted shell (rings of 14 points at 25 stations, joined face
  to face, every face turned outwards: slices had shown as steps), a red band, two
  headlamps. **The view ahead**: the cab door is glass (`mat: 'glass'`), the engine
  room is split either side of a way down the middle, the cab desk lower: from
  first class's front end you see through the gangway, the cab door and the
  windscreen to the track ahead (test: a clear line of sight).
- **The city** (all on the station's mover): the station's front up over the
  concourse (lit-window facade), a clock tower, the name across it; across the
  street a row of blocks, the road and its lamps; blocks along both sides of the
  line to the tunnel's mouth, 260 m out, a concrete portal over the tracks.
- **Four platforms**: 1 and 2 (an island, its side to our train fenced off) with
  a dark local train standing between them, 3 (ours), 4; a barrier gate and signs
  for each, a wider concourse and shed.
- **Cyrillic** (Rhys): every station sign in Severian Cyrillic with English under
  it: НОВОМИР-ЦЕНТРАЛЬНЫЙ, the board "21:40 БЕЛЯГОРСК ПЛАТФОРМА 3", ПЛАТФОРМА 1-4,
  КОФЕ · ГАЗЕТЫ. The coaches are numbered as Severian ones are: 1 (first class) at
  the front, 2 the buffet, 3 yours, 4; the van Б.
- **The ticket inspector** (level `npcs`, `ticketGate`; mission_runtime.js
  `npcs`, `npcBodies`, `talkNpc`, `gateOpen`): a railwayman in navy with a cap at
  Platform 3's gate, by his lectern. The gate (a solid, and a leaf drawn as a
  prop) is shut until you show him your ticket (E); as you come up he asks
  "Tickets, please."; then "The 21:40 to Belyagorsk. Coach 3. Have a good
  journey." People who are not guards: drawn with the operative's body, idle, and
  talked to; railway staff speak in their own colour (`#bark span.staff`).
- **The clock** (`TrainRun`, `RUN.departAt`): you arrive at 21:36 (the top line
  shows the time); the 21:40 leaves at 21:40 - half a minute before, the station
  announcement; at 21:40 the doors close with you aboard and it pulls away. Not
  aboard at 21:40: "You missed the 21:40 to Belyagorsk" - the mission fails.
  Aboard early: in Coach 3, E takes your seat and the clock runs on to 21:39:40.
- **Voices**: four new recorded lines - the inspector (`st1`, LibriTTS speaker
  512) and the announcer (`pa1`, 92, filtered to sound like a tannoy). spoken.js
  `SPOKEN_VOICES.staff/pa`, `setOfVoice`; `spokenVoice` honours `g.voice`.
- **Tests:** train 12 (+3: the inspector and his gate; the nose, the glass and the
  line of sight; the city; and the board/platform test now Cyrillic and four
  platforms, the run test now the clock - leave at 21:40, missed, sit). Each
  broken on purpose.

## M6.18.0 — Level 4, the Night Train (part one: the station, the train, the journey); the casino's doors; a breaching shotgun

Rhys, after M6.17.14: the train - an intercity with underground sections, between
two fictional cities in a fictional country "somewhere near the former USSR"; off
duty, travelling from the capital; it is hijacked, maybe with someone important
aboard; the objective a controlled takeover - retake the train, protect the VIP,
ideally the bystanders; unarmed at the start (a guard on the train or platform may
hand you his sidearm - he has a tip-off, or sees something "Ghost" in you, or you
earn his trust); it starts with arriving at the station, finding the platform and
boarding. Also: the casino's terminal should not just open the vault - or the
Tournament Room's locked doors should be reinforced so you still breach; and "If
it's labelled as a 'Breaching Shotgun', I expect it to be able to breach with a
similar effect as C5". Also sent his M6.17.12 screenshots (seen: the casino's
briefing still said "clear the reds out").
- **The Night Train** (`src/game/levels/train.js`, `index.html?level=4`, title
  button "Level 4: The Night Train"): Severia; Novomir Central, a terminus; the
  21:40 to Belyagorsk, service 207. You start in the street outside, unarmed
  (`startLoadout` all empty), at 21:31 on a November night.
  - **The station**: steps up into a concourse (departures board: "21:40
    BELYAGORSK PLATFORM 3", the 21:52 Kirova on 4, the 22:10 Port Ostrel on 1; a
    kiosk, benches), ticket barriers with a gap for each platform (signed),
    Platforms 3 and 4 under a train shed, then open platform with lamp posts;
    buffer stops; the far walls brick. All of it a **mover** (`id: 'station'`)
    with its own solids (`level.stationSolids`, tag `station`).
  - **The train** (`CARS`, `carriages()`): back to front, the guard's van, coaches
    D and C (standard, 2+2, table bays, racks), B (buffet: counter, urn, till,
    leaning tables), A (first class, 2+1 at tables), the locomotive (engine room,
    the cab's desk and windscreen; its door locked). 24 m coaches, 2.9 m wide,
    floor at 1.0 m (level with the platforms), windows both sides, a red band.
    Gangways between, with ordinary doors. Platform-side doors at both ends of
    each coach: open at the station (`level.trainDoors.hidden`, solids disabled;
    their leaves are `prop: 'trainDoors'` pieces - render's `tickProps` now hides
    a prop when `level[name].hidden` too).
  - **The run** (`TrainRun`): waits until you are aboard (`inTrain`); 12 s later
    the announcement, 22 s the doors close (solid, shown), 3 s more and it pulls
    out at 0.55 m/s/s to 30 m/s (108 km/h). The top line follows it ("Find your
    train..." / "Aboard the 21:40 - Coach C is yours" / "The doors are closing" /
    "On the 21:40 to Belyagorsk - in the tunnels - 108 km/h").
  - **The world moves, not the train**: the station mover slides back
    (`at: [-dist, 0, 0]`), its signs and lamps with it (render.js: a sign or light
    with `follow()` is moved each frame in `tickMovers`); its solids are switched
    off when it leaves. After it, tiles stream past (`streamTiles`: track 12 x 40
    m, tunnel 14 x 30 m, country 6 x 120 m; each a mover placed by track
    coordinate, out of sight below the world when not in its section). The line
    (`ROUTE`): station to 260 m, a tunnel under the city to 2.1 km, country to 9
    km, a tunnel through the hills to 10.6 km, country on. No baking (moving
    lights); two lights a coach.
  - **Not yet** (next parts): passengers, the VIP, the transport police officer
    and his sidearm, the hijack, retaking the train, sounds. Proposed plan in the
    roadmap; questions put to Rhys.
- **Casino doors** (level_casino.js): the Tournament Room's locked doors are
  reinforced (no kicking; C5 or the breaching shotgun); `def.vault` marks the
  Cash Vault's own, the only ones the terminal unlocks. The briefing now gives
  the real objectives (ledger; the Yellows optional; Clean Sweep a trophy) and
  the doors.
- **BR-12 Breaching Shotgun** (loadout.js `BR12`, `AMMO_SHELLS`; weapons.js
  `fire`; main.js `breachShot`): the first shotgun you can carry. A heavy slug
  (60, short reach), 5 rounds; a door within 3 m of where it hits comes off as
  C5 takes it (any door, reinforced too) - the event goes to the same door code
  as a charge's blast, without the blast. The reds' shotguns (`ARMS.shotgun`)
  now drop one. On the Quartermaster's shelf. Uses the carbine's model.
- **Tests:** train 9 (new: the street, unarmed; the board and the signs; a clear
  way from the concourse through the barrier into Coach C; the six vehicles and
  the aisle through them, the cab locked; the doors open and their leaves; the
  fit-out; the run's waiting, warning, closing and pulling away; the streaming -
  sections, coverage, the station and its signs and lamps sliding away; the
  runtime's side), casino 90 (+1), weapons 84 (+1). Each broken on purpose.

## M6.17.14 — the casino signed off: no mourning reds; the game carries on after the locket question

Rhys on M6.17.13: "Man down - the reds did this" with all three Yellows standing;
after the locket conversation the game stayed paused. "Other than those two
points, I'm happy with Casino." Asked what next: the non-Euclidean level and the
train ("wrong place, wrong time") as candidates.
- **Man down** (guard.js `perceive`): a dead body of another side is not a
  colleague - a Yellow seeing a dead red had shouted "Man down" (and raised the
  alarm). Now skipped.
- **Still paused** (mission_runtime.js `rt.choose`): the pointer takes a moment
  to come back after a click, and main.js's watch (pause if the pointer is free
  2 s after the last ask, `S.wantLock`) opened the pause menu. The answer now
  sets `S.wantLock = S.time` and asks again at 0.4 and 1.1 s, as Begin does.
- **Tests:** casino 89 (+2). Each broken on purpose.
- **Next (discussed with Rhys):** the train mission first (see roadmap), then
  the non-Euclidean level.

## M6.17.13 — keep the locket (or hand it over); a terminal to hack; CASINO in big red letters; reds off the coil (again)

Rhys on M6.17.12: "Begin" took a moment, then the frame rate read over 900, ~200,
then back to ~50; likes the coloured rails and the coil's "environmentals"; the two
reds still turned up on the coil - but not if you never meet the Yellows; the
security desk - players will expect to use terminals, and "staff only" is wrong
(the pool is for guests); take the locket for yourself, then when you talk to a
Yellow they ask, and you give it ("Just keeping it safe, all yours") or keep it
("It wasn't in there") - "beware of being caught out on that lie"; CASINO should
be big red Las Vegas lettering.
- **Frame-rate counter** (main.js): frames counted against `performance.now()`
  every half-second. It had been 1/dt of each frame, smoothed: after a stall the
  engine's catch-up frames (dt near 0) read as 1000 fps each. The stall itself on
  Begin is not found: most likely the first frames of the full scene (the GPU
  setting up its shaders) with the voices' preload and the music starting. Not
  measured on real hardware.
- **Reds and the coil, again** (guard.js): `pursuit` - the only thing that lets a
  searching red take the coil - had been set by losing sight of ANY foe; with
  the Yellows along, reds fought Yellows, lost them, and chased round the coil.
  Now only a fight with you (`fightingYou`, set while he sees his man) or being
  shot by you (`target.lastBy === 'you'`). Answering a shout is never a chase
  (no coil), about you or not.
- **Keep the locket** (factions.js `YellowJob`: stage `missing`, `give`, `giveUp`,
  `leave`; `LOCKET_CHOICES`; mission_runtime.js `takeLocket`, `askLocket`,
  `answerLocket`, `rt.choose`):
  - E at the locket takes it (`level.locket.by = 'you'`); any Yellow who could see
    the locket's place at that moment (10 m) is noted (`rt.locketSeenBy`).
  - teamed up, when they reach its place and see it empty (or the boss is on his
    way to it) they stop: stage `missing`, a hint that the boss wants a word.
  - talk to any of them while it is in your pocket (or first meet them with it):
    the boss asks ("did you see it?" / "Did you take my locket?"), and two buttons
    give your answer. The game waits (`S.dialog`: no pause menu, no input, guards
    still).
  - **"Just keeping it safe - all yours."**: theirs; they leave with it.
  - **"It wasn't in there."**: believed, unless one of them saw you take it -
    then "You lie to me? I watched you take it." and they turn on you. Believed,
    they leave empty-handed; it stays yours.
  - debrief's third line says which. New boss lines recorded (5, x3 voices).
- **The security terminal** (level_casino.js `level.terminals`; mission_runtime.js
  `terminalNear`, `hacked`): at the post's screen, hold E 6 s ("Hacking... n%";
  walk away and it starts again). It unlocks the Cash Vault's steel doors (another
  way in than the C5) and puts every red on the radar for 45 s (`level.revealT`,
  main.js tracker: `how 'intel'`). The sign: "Private floors - staff & VIPs".
- **CASINO** (level_casino.js `casinoLetters`, `LETTERS`): six letters on a 5 x 7
  grid of strokes, 1.5 m x 2.1 m, standing on the canopy on a steel rail with
  stays: deep red bodies, red neon faces, 157 warm bulbs down the strokes, a soft
  red light on the canopy. The I is a plain bar (with serifs it read "CASTNO").
  The flat CASINO panel and its two gold bars are gone. Seen in the browser.
- **Tests:** casino 87 (+4: the locket kept or given, believed or caught, and the
  story of it; the terminal and the sign; the letters; the frame-rate counter;
  and the reds' coil test now covers losing a Yellow and answering a shout).
  Each broken on purpose.

## M6.17.12 — the coil dressed (B); reds keep off it unless after you; Yellows quicker; their own way out

Rhys on M6.17.11 chose option B for the coil ("something more to it"), adding "I do
kinda like the coil corridor feeling of 'when did we actually ascend?'", and asked
whether B+C was reasonable (left to Claude: **C not done** - a steeper coil makes
the climb obvious, which is the feeling he likes, and it would move every floor's
way in, the nav links and the Yellows' runs: a rebuild for a worse result; A, the
east landings, stays on offer if the walk still drags). Notes: two reds on the coil
far from their posts (one from the restaurant/bar, one from the room before the
vault); no reds-down count on screen; Yellows slow to react to a red; with the
locket, the Yellows "glorched up through the ceiling, and THEN came down".
- **The coil, dressed** (level_casino.js `coilDressing`, `COIL`, `coilFloor`):
  - a 4 cm neon strip a metre up the inner (middle) wall wherever it is wall, in
    the colour of the floor the coil climbs to - 1 amber, 2 teal, 3 rose, 4 green,
    roof blue (tint x0.42: the neon glows at twice its tint and had paled to white).
    The colour changes as you pass a floor's way in: nothing counts the climb.
  - each floor named over its way in, on the outer wall, in its colour (GAMING
    FLOOR, LEVEL 1 Restaurant & Bar, LEVEL 2 Private Rooms, LEVEL 3, LEVEL 4, ROOF
    TERRACE Pool) - `sign.coil`.
  - along each turn, its own things: to 1, slot machines in pairs on the inner
    wall (no stools), benches and planters; to 2, benches and planters and a
    **security post** ~12 m before floor 2's way in (desk, screen, a waist-high
    steel barrier from the inner wall - cover - and a red SECURITY sign); to 3,
    pictures on the inner wall, benches and planters; to 4, vending machines and
    planters; to the roof, planters and a couple of pictures. 79 in all
    (`level.coil.items`). Benches and planters stay under the outer wall's window
    sills (1.0 m); the tall things are on the inner wall, only where it is solid.
  - none within 3.5 m of a way in or the outer doors; collision in rows of short
    boxes (`solidRow`) so none bulges into the walkway; the walkway kept clear
    between radii 26.85 and 28.45 (1.6 m at its narrowest by the boxes; the line
    the Yellows walk is 27.6). Seen in the browser.
- **Reds off the coil** (guard.js `navOpts`, `pursuit`, `raiseAlarm(..., opts)`):
  a red searching for a noise or a glimpse plans without the ramp (`noRamp`); only
  a pursuit takes it - a search straight out of a fight (`setState('search', ..,
  'lost')`), being shot by you, or answering a shout about you. A shout about a
  fight with the Yellows (`ctx.alarm(.., { rival })`) brings only men on that
  floor. Going home is always allowed. (A first try held every search to its
  floor; Level 0's guard searches up its stairs - so it is the coil that is kept
  from them, not floors.) No red with no way to the noise: `goTo` treats it as
  reached, he looks about and goes back.
- **Yellows quicker** (guard.js `SENSE.rivalFill` 3): another side's man in sight
  fills awareness three times as fast as you sneaking (10 m dead ahead ~0.3 s).
- **Their own way out** (factions.js `YellowJob.tick`): every Yellow had been given
  the boss's exit path, starting where the boss stood; one a floor below walked
  straight up to its start. Each now finds his own from where he is.
- **No reds-down count** on the casino's top line (the debrief still lists it).
- **Tests:** casino 83 (+5: the coil dressed - colours by floor, names, a turn
  each, the post, the walkway clear, nothing over a way in; reds and the coil
  (noise vs pursuit, shouts); Yellows noticing a red; own way out; no count on
  screen). Each broken on purpose.

## M6.17.11 — the reds back on the coil; the casino's objectives; a crate keeps your mods; first pushed by Claude

**From this release Claude pushes straight to `main` of GooseKnightGaming/Frontline**
(Rhys connected GitHub after M6.17.10): the built `index.html`, `game.js`,
`controls.html` and changed `assets/` - the commit message names the version.
A leftover test branch `claude-access-check` is in the repo (the session cannot
delete branches); Rhys will tidy it.

Rhys on M6.17.10: reds may follow up and down the coil and across floors, but
should start at their posts; Yellow lines "much better" but "incredibly calm",
one "Where did they go?" still after a red death; a red in the restaurant "became
invisible for a moment"; FPS down to ~20 at the start of the level; the coil is
a lot of spiralling corridor, and every floor is entered from the west (a full
turn per floor) - a counter-coil to the east?; the Yellows saw reds through the
Tournament Room's locked doors (and shot at the doors); the crate lost his
silencer; he ended up with 3 Lures; can his GPT images become textures (weapons
should look different); 2 of 3 Yellows "by my hand" - caught in an explosion;
new objectives (ledger main; team up optional; locket once teamed); clearing
the reds a trophy again.
- **Reds and the coil** (guard.js `navOpts()` now `null` for everyone): reds plan
  by the coil again. None starts or patrols on it (test: each red's start on a
  floor, off every link; every patrol corner off the coil; two quiet minutes,
  nobody on the coil or off his floor). The M6.17.9 stray was a red coming
  after the fighting, not a spawn. `opts.noRamp` stays in nav.js, unused.
- **"Where did they go?"** (factions.js): `g.lastFoe` remembers the man he was
  fighting after losing sight of him; if that man dies, he is still "down".
  `foeDown` noticed outside a fight is dropped (guard.js), not said later.
- **Calm voices**: the 53 shouted lines (ending "!") re-recorded: Piper
  length 0.85x, noise 0.85, pitched up 7% (faster), compressed and louder
  (`/home/claude/tts/gen_urgent.py`). 130 files replaced in `assets/voices`.
  Text-to-speech still cannot really shout.
- **Invisible for a moment** (drawcull.js): a guard drawn by the cheap test
  (near, or on your floor) had no "recently seen" time; stepping out of it (past
  8 m, or you on a stair) hid him until his sight check came round (up to ~10
  frames with 18 guards). Now drawn-by-cheap-test counts as seen (linger 1.2 s,
  was 0.6), and sight is checked to head, chest, hips and both shoulders
  (`sightPoints`), so a shelf or lamp across his head no longer hides him.
- **FPS at the start**: M6.17.10 fetched, decoded and scanned all 260 recordings
  in the first seconds. Now one every 0.15 s (`preloadSpoken(sets, gap)`); a line
  wanted sooner is fetched by `say()`. Best lead, not measured on real hardware.
- **Locked doors** (doors.js `shutBox`): a pair's leaves met with a 2 cm slit,
  and the officer in the Tournament Room stands on its line (x = 30). The latch
  edge now reaches 2 cm past: pairs overlap, singles tuck into the jamb. The
  Businessman's Suite pair had the same slit.
- **Crate mods** (loadout.js `Crate.store/takeMods/copies/modsOf`): a weapon
  put in a crate (swap or "None") keeps its mods, shown as "V-27C (silenced)",
  and goes back out with them; the Quartermaster (endless) keeps your mods for
  when you take that weapon again. Your slots list mods in the name too. Part-
  used boxes in a crate now read from the crate (`copies`), not `arsenal.stash`.
- **3 Lures** (weapons.js `canTakeBack`, `disarm`): one picked back up always went
  in the pouch, full or not. Now a full pouch says so ("Your pouch is full: no
  room to take it back") and the lure stays. The exact way Rhys got there was
  not reproduced.
- **Objectives** (story.js `casinoOutcome`, `casinoRules`): 1. Find the reds'
  ledger (main: success needs it); 2. Team up with the Yellows (optional,
  neutral if not); 3. Help the Yellows find their locket (only once teamed).
  Settled (the jeep ends it) = ledger + the errand over (locket taken, Yellows
  gone/turned/down, or never teamed). Grade: ledger = success; locket or any red
  down = partial; else failed. "Reds down: n of 15" is a neutral line. Top line:
  "Find the reds' ledger (the Cash Vault)" ... with the reds count. The runtime
  passes `job: job.stage`.
- **Clean Sweep: Casino** trophy (mission.js): every red down. `casinoTrophies`
  is now given the reds only (`targets`): it had been given every guard,
  Yellows too.
- **Blast deaths**: a Yellow killed by your blast (`target.downBy === 'blast'`)
  is "caught in your blast" (neutral), not "down by your hand".
- **Not done, asked**: the coil (options to Rhys: half-floor landings to the
  east, a livelier coil, or a steeper coil); textures from Rhys's images (needs
  the images; weapons share 4 models - different models are the real fix).
- **Tests:** casino 78 (+4: reds and the coil; the door slit; lost-sight foe
  down; drawing; objectives - replacing the noRamp test; the rules/trophy and
  ledger tests updated to the new objectives; build-time limit 5.6 s on this
  slower machine - M6.17.10's own build measures 4.4 s here), weapons 83 (+2:
  crate mods; pouch cap), voice 13 (+1: trickle). Each broken on purpose.

## M6.17.10 — a red down is down; the reds off the coil; the locket and ledger go when taken; what a crate's slot really holds; recorded guard lines

Rhys on M6.17.9: a stray red on the coil at (12.5, 0.4, 51.8) "shouldn't have
been on the coil"; when a red is killed in their sight the Yellows say "Lost
him" / "Where did he go?"; the locket and ledger stay after they are taken;
a crate says "C5 Charge - 2 carried" whether two are in the pouch, one is
placed, or none are left; "still a significant delay between subtitle and
audio"; the last red "followed us right up to the roof" unseen. New idea
(not Frontline): a rocket builder like Spaceflight Simulator -
`GOOSEKNIGHT_IDEAS.md`.
- **A foe down** (factions.js `pickFoe`, guard.js `think`): when the man a
  guard is fighting dies, `g.foeDown` is set; in 'alert', not seeing anyone,
  he says a `down` line (Yellows: "Got him." / "Red down." / "He is down. Stay
  sharp." / "That is one less."; reds: "Got one!" / "Yellow down!" / "He's
  down.") and stands down - a Yellow back to the escort, a red back to his
  post - instead of "lost" and a search. `PRIORITY` down/y_down 2.
- **The reds off the coil** (nav.js `findCells` `opts.noRamp`; guard.js
  `navOpts()`): ramp links are marked `ramp: true`; every path a red (or any
  non-Yellow) plans skips them - goTo and search alike. The coil is the only
  way from the ground floor up (floors G-1-2 and 3-4-RT are joined only by
  it; the stairs join 2, 2A and 3), so a red now keeps to the floors he
  starts on: one on the ground cannot come up after you and vice versa (no
  path = goTo treats it as reached; he searches where he can reach). No red
  post or patrol is on the coil (checked C1-C15). If Rhys wants reds to come
  up after him, give them the stairs (a stair link G-1, 1-2) rather than the
  coil.
- **Taken things go** (render.js): pieces with `prop` ('locket', 'ledger' -
  set by `kit.curve(..., { prop })` in casino_fit.js) are drawn as their own
  entities (`view.propEntities`), not merged into the room; `view.tickProps()`
  (each frame, from main.js) hides one when `level[name].taken`. The case and
  the counting table stay, empty. Seen in the browser.
- **What a slot really holds** (weapons.js `Arsenal.slotReadout(slot)`, main.js
  `mineDetail`): your five slots in a crate read "2 of 2 left", "1 of 2 left,
  1 placed", "none left, 2 placed", "none left"; a gun "18/18 in the magazine,
  72 spare". A pouch you put down in a crate shows as you left it (from
  `arsenal.stash`). The crate's own stock still shows the full item.
- **The delay**: browser speech (even with a local voice) can take a second or
  more to start. Every guard line and every Yellow line is now **recorded**
  (Piper TTS, LibriTTS voice, CC BY 4.0): `src/game/core/spoken.js` maps each line
  to an id (`SPOKEN`), which recordings each set has (`SPOKEN_SETS`), and
  `spokenVoice(g, yellowLine)` gives each man a fixed voice (the boss `yb`;
  other Yellows `yg1`/`yg2`; reds `r1`/`r2`). `voices.say(..., voiceId)` plays
  the recording with its words at once; the first time a line has not loaded,
  it is fetched and the browser says it. `preloadSpoken(['yellow','red'])` at
  mission start (reds only on a level without Yellows); nothing is asked for
  that is not there.
- **Assets changed:** 261 new `assets/voices/spoken_<voice>_<id>.mp3` (3.4 MB)
  and `assets/voices/CREDITS.txt`. Upload the `assets/voices` folder.
- **Tests:** casino 74 (+3: down lines and standing down; the reds' ways avoid
  the ramp, and cannot climb from the ground; the locket and ledger tagged,
  split from the merged room, hidden when taken, the case left), weapons 81
  (+1: the readout - full, one placed, both placed, spent, a gun), voice 12
  (+2: every line recorded in every voice that says it, credited; a recording
  plays with its words, fetched when not loaded, a red never fetches a Yellow
  line, preload asks only for real files). Each broken on purpose: 16 cases,
  each failed its test.

## M6.17.9 — the Yellows (and anyone) on the ramp and the stairs; a locket, not an Oreo

Rhys on M6.17.7/8: the Yellows ran outside before following upstairs, tried to
come in through the wall, and ran out again when he went up the coil; or went
into the central rooms to follow him "upstairs"; a red "glorched through the
wall ... dropping nearly a floor"; two collided at the top of the spiral
stairs and could not come down; "The vault is upstairs. Keep moving" sounds
like orders to a hostage, and was said on the vault's floor and above it;
after the locket they stayed put, or glorched through the floor; the locket
looks like an Oreo; the front doors opened again when he was far off (then
the Yellows appeared). Thermal ideas "awesome"; the chair-flip "works". New
ideas (roadmap): drugged and non-Euclidean, mineshaft and pit, a manor
estate with a forest, a train ("wrong place, wrong time"). Asked what is left
in the Riverside Hotel (answered from the roadmap).
- **The cause** (found with a node harness of the real casino: you walk the
  way to the vault, the three follow): the nav grid knows only floors. Anyone
  part way up the ramp (or a stair) was taken to the nearest floor cell -
  often the street outside the outer wall, or the floor below - so paths to
  you on the coil went outside; paths from a man on the coil began outside
  (the walk in, through the wall); the red's path did the same.
- **nav.js `find`** now: a point on a link's way (`onLink`: within 1.9 m of
  the ramp's line, 0.9 m of a stair's, at its height; `onFloor` within 0.15 m)
  is on that way. From one, the path runs along it to the end nearer where it
  is going; to one, from the end nearer where it comes from; on the same way,
  along it. Joined and left where the way leaves the floor (the coil runs
  level with the ground floor for ~65 m first: two Yellows had walked it all
  from its start). The old search is `findCells`. Everyone's paths use it.
- **Following** (guard.js): each stops at his own distance along the way too
  (all three had stood on the one spot), in single file (one slows behind the
  man in front), spread 0.75 m apart when standing (only on a floor); a man
  not near the shared way finds his own (two had followed a way found from
  where the third stood); never stops half way up a stair; does not "see" you
  across a floor unless on a floor himself; lands exactly on a floor at a
  stair's end. Pace rises with the gap (2.4 m/s + 1.2 per metre behind his
  place, to 5.4): about 1.5 m behind his place when you walk (it had settled
  10-13 m behind at a 3.8 jog).
- **The locket**: taken from within 1.8 m (you in front of the plinth had kept
  the boss waiting behind you for ever). After it, all three go down the coil
  and out of the front door (the harness: gone at ~230 s, nothing outside
  before the ground floor, nothing through a wall or floor).
- **What they say**: "{vault}" in the escort lines is now where the vault is
  from where he stands (`vaultWhere`: up on the second floor / on this floor
  / down / "This is it" inside); no "Keep moving".
- **The locket itself**: an open case with its lid up (away from the door),
  the locket standing in it - an upright oval (slices), a raised panel each
  side, its bail and chain looped over the lid; a soft gold glow (as metal it
  showed black in the dim vault), its rim glinting. Seen in the browser.
- **Not changed, explained**: the door at (36.9, 8, 52.6) and the front doors
  opening - the Yellows' own way out passes both (they open doors within 1 m).

**Tests:** `casino` 71 (6 new, the first four in the real casino: the whole
errand - never outside before the ground floor on the way out, never through
a wall or a floor, within 12 m on the coil 90% of the time, the locket taken,
gone; up and down the spiral, on the landing and back on the floor with you,
apart; stopped half way up the coil - short of you, apart, one left in the
Suite finding his own way through no wall; paths from mid-ramp stay on the
ramp; the vault line; the locket's shape). 543 in all. Ten sabotages, each
caught. No asset changes.

## M6.17.8 — people visible across a dark room; the Yellows the reds killed are not yours

Rhys, after M6.17.7: the research facility for all three visions - yes; and
somewhere hot-water and steam pipes make thermal worth using (roadmap, with
the visions). And a bundle of screenshots from the M6.17.4-6 runs (no notes
with them; most show what was already reported: the poker table, the Yellows
following, the debriefs). Two new things in them, fixed:
- **Black cut-outs**: people across the casino floor (18.23, 18.24, 10.59)
  came out as black silhouettes. The level is lit by its baked light; people
  only by the 8 lamps switched on nearest the camera and the scene's ambient,
  which on a night level is 0.15. Their materials' own ambient is now lifted
  to a daylight level's (character.js `fillFor`/`characterFill`, `FILL.target`
  0.42 luminance, at most x3; called in main.js once the scene is built; hats
  too). Daylight levels are unchanged (x1). Checked in the browser: the same
  guard at 11 m, red uniform with it, black without (`FL.characterFill`).
- **The debrief and the Yellows**: "The Yellows in the Businessman's Suite -
  1 of 3 down (1 killed)" with a cross, when the reds had shot the boss. Now
  only those down by your hand count against you ("... down by your hand");
  those the reds killed get their own line, neither tick nor cross ("1 killed
  by the reds"; story.js `lost`, from `target.lastBy`; a `neutral` line shows a dash).

**Tests:** `casino` 65 (2 new: the night fill, daylight untouched; the
debrief's count of Yellows by who killed them). 537 in all. Three sabotages,
each caught. No asset changes.

## M6.17.7 — the Yellows keep with you by the short way; the locket on show; voices on time

Rhys on M6.17.6: still a delay between subtitles and voices; the Yellow boss
walked through the Suite's poker table; "Lead on" said as in the metal; the
Yellows follow your exact steps, over tables, and finish your whole circuit
even when you have turned back to meet them - "they need to not do that" -
and are much slower than you; the boss ran ahead into a fight and died (fine
in theory); the locket and gold trolley nowhere to be seen (though his men
found it and left by the front door). New idea: maps for IR, UV and EMF
vision (roadmap).
- **Following** (guard.js `followLead`, `walkWay`, `walkable`, `stepTo`;
  `ESCORT`): no crumbs. Each Yellow goes straight at you while the floor between
  is open, stopping at his distance; otherwise along a nav way to where you
  are, one way shared by all three (`job.way`), grown as you step on in sight
  of its end and found afresh (at most every 1.2 s, one find a frame) once
  you are 2.5 m off it - so turning back means they cut across to you. Paces
  2.4 / 3.8 / 5.2 m/s by how far behind (you walk at 4.3). `walkable` tries
  his body's width against the real solids at knee and waist, not only the
  half-metre nav cells, and he leaves a point of the way early only if the
  next is in a clear line: no clipping a table's corner. `followTrail` and the
  trail (`job.record`) are gone; the way out is a found path walked the same way.
- **The boss at the back**: his men 2.4 and 3.4 m behind you, the boss 5 m;
  any of them spotting the locket sends the boss for it.
- **"After you. We are right behind you."** (was "Lead on" - a word a voice
  can read two ways).
- **The locket**: the gold trolley had been set down inside the vault's
  middle shelving (hidden). The trolley and a new plinth are now put on the
  first free floor (clear of every solid and 1.4 m from the door): inside the
  vault doors, the first thing you see. On the plinth at chest height, under
  its own lamp: an open velvet case, a 13 cm gold locket, a glowing rim
  (`locketGlint`). `level.locket.pos` is now 1.11 m above the floor.
- **Voices on time** (voice.js): a voice on the machine (`localService`) before
  Chrome's network voices ("Google UK English", a second or more to arrive);
  anything left waiting in the browser's speech queue is dropped before a new
  line (it was said late, behind the others); the speech engine is woken with
  a silent word as the mission loads (`warm`). The recordings were already on
  time (M6.17.6).
- **Roadmap**: places for thermal, UV and EMF vision.

**Tests:** `casino` 63 (4 new: round the card table, not over it; turning
back, they cut across rather than walk your circuit; they keep your pace; no
"Lead on", the locket big, lit and glinting, its plinth and the trolley clear
of everything), `voice` 10 (1 new: a local voice, the stale queue dropped,
woken on load); the errand test now has you walking at full pace with the
boss furthest back. 535 in all. Twelve sabotages, each caught. In a browser:
talk to a bodyguard, step away - all three on escort, the boss round the end
of the poker table (x 34.3, the table ends at 34.0), then fighting the reds.
No asset changes.

## M6.17.6 — the Yellows' errand; words and voices together; the MP2 and the Revolver; easing into the seat

Rhys on M6.17.5: a delay between words on screen and the voice; the MP2's
single shots don't feel like a machine gun; the Revolver not "revolvery"
(though different); the chair death's pose OK, but the jump from where he
stood to the chair wrong; the VX-40's scope "AWESOME"; the Yellow boss
shouting reds' lines ("Target engaged"), and "Yellow Boss" in red; the
Yellows to do more - speak to them and they leave the Suite, fight the reds,
follow you to the Cash Vault for a locket, and leave by the front door. A
new map idea: a housing estate (roadmap).
- **Words and voice together**: the browser's speech can take a second to
  start; the words now go up when it starts (`u.onstart`), or after 1.6 s if
  it never does (`SPEECH_WAIT`). The recordings open with up to half a second
  of silence (the radio's all ~0.4 s): played from where the sound starts
  (audio.js `leadingSilence`, measured when each loads). No asset changed.
- **The MP2**: `minBurst: 3` - the briefest press is three rounds; held it
  runs on as before; a lighter, quicker report.
- **The Revolver**: loaded a round at a time (0.5 s to open, 0.35 s a round,
  a click each - `reloadEach`, `roundIn`); a press mid-load fires what is in
  it and stops loading; a boom with a ring and the cylinder turning; the view
  kicks with the round (`onShot(strength)` from the weapon's recoil: the
  Revolver over twice a PX9's).
- **Into the seat**: no jump. He staggers back (the knock-back clip) from
  where he stood into the seat over 0.55 s, eased, turning as he goes, then
  sits slumped (`sinkIntoSeat`); the reach is 0.8 m (was 0.95).
- **The Yellows' voices**: their own lines (guard.js `YELLOW_LINES`, keys
  `y_*`, so none of the reds' recordings), only where Yellows are a side
  apart (the factory's are still the enemy); a red who sees Yellows calls
  them Yellows (`alertRival`), not intruders. Their names in gold (#bark
  span.yellow); "Yellow bodyguard".
- **The Yellows' errand** (factions.js `YellowJob`; Rhys's design): a word
  with them and they come out of the Suite with you - the boss nearest, his
  men behind - walking where you walk (a crumb every 0.6 m: guard.js
  `followTrail`), fighting any reds they see and taking up with you again
  after. When one of them comes within 7 m of the vault's locket (on the gold
  trolley) and can see it, the boss (or whoever is left) goes and takes it -
  "At last..." - and they leave: down the coil, out of the front door, along
  the street, gone. Turn them against you and the errand is off. Talking on
  the way: lines for the road (one tells you of the ledger). The debrief:
  how many got away with it.
- **The ramp for the nav grid**: links between each floor's way onto the
  ramp, walked along the coil (`navLinks` with `via` points; nav.js keeps
  them in the path and never smooths past a point at another height) - the
  Yellows' way out, and any guard's way between floors from now on.
- **Timing test**: the casino's build-time limit is 5 s (the sandbox itself
  has slowed: M6.17.5's own build measures 4.2-4.6 s here now).

**Tests:** `casino` 59 (4 new: the errand - following, the locket, leaving,
called off; the ramp's way up and out, along the band, never through the
wall; the Yellows' words and the reds' for them, gold names; words when
heard), `weapons` 80 (2 new: the MP2's least burst; the Revolver's loading),
and the seat test now checks the move into it. 530 in all. Fifteen
sabotages, each caught. In a browser: "E  Talk to the boss" - his line in
gold, the hint, all three on escort.

## M6.17.5 — the Yellows in the Suite; Z and X; the spiral stairs going down; sights; the ledger

Rhys on M6.17.4 (8 screenshots), twelve notes: hard to walk DOWN the spiral
stairs (head on the landing, or walking down the handrail); a guard by the
restaurant's bar walking into it; a red killed beside a stool should end up
sitting on it; a Yellow team of three in the Businessman's Suite - not
hostile to you, the reds hostile to you and them; talk to them, or attack
them and they turn (forgiving knock-outs and cross-fire strays); the boss
with an RV-357 called "Revolver", his men with sensible weapons; the
Revolver takes no attachments; crates to say only "Open crate"; Z and X to
use utility slots 1 and 2 without switching (tap to place, hold to set
off); something valuable among the vault's cash; scopes and mods visible,
and something to look through when aiming.
- **Spiral stairs, going down** (simulated from the floor above to the foot
  at three radii, walking and running): two causes.
  - You stepped up onto the handrail: going down, the rail of the tread two
    or three below stands under the 0.45 m step-up above your feet. A rail is
    never stepped onto now (player.js `moveH`: no step-up onto tag 'rail').
  - In by the post every tread's collision met every other: a body there was
    lifted onto the tread behind, hung on the corner of one a step higher,
    and then met the landing above with its head. The treads' collision
    starts 0.36 m out from the post (`STAIR.solidIn`) and a guard round the
    post (a cross of two boxes, `STAIR.postGuard` 0.22; a square's corners
    left too narrow a way past the rail) keeps you where a stair is walkable.
- **The guard by the bar**: the floor-1 patrol's north corner was C6's
  post, hard by the stools - the patrolling man shouldered into him and the
  stools every lap. C6 stands out in the room (32.5, 14); the corner is at
  (28, 16).
- **Dead on a stool**: the seats are recorded as they are placed
  (`level.seats`); a man going down within 0.95 m of a free one on his floor
  is left sitting in it (guard.js `seatFor`, `SEAT`): the operative's
  `Driving_Loop` (the only seated clip; its hips 0.56 m up and 0.32 m behind
  the feet, read from the rig) held still, slumped forward 14 degrees; the
  seat taken. Otherwise he falls as before.
- **The Yellows** (factions.js; level_casino.js `casinoYellowDefs`,
  `CASINO_RELATIONS`): the boss (officer, gold; the Revolver) behind the card
  table, two bodyguards (MP2s) by the door - in the Suite, behind its locked
  doors. Not counted among the reds (`objective: false`; "Reds down: n of
  15" is unchanged). Each guard now picks a foe (`pickFoe`, every 0.3 s): the
  nearest enemy guard he can see, or you (if his side is against you and he
  can see you nearer, or is already fighting you), or whoever last hurt him.
  Guards' rounds at each other hit 2.6x harder than at you; shouts bring only
  their own side; the radar shows a Yellow at peace as a yellow diamond and
  the detection arcs leave them out. Levels without `relations` work exactly
  as before (everyone against you only).
- **How they take you** (`Standing`): a stray round in a fire-fight with reds
  near them or you - "Watch your fire!" - forgiven twice in 40 s, not a
  third time; a round with no reds about, killing one, or a gun held on
  them ("Lower your weapon" at 2 s, they act at 5 s) turns all three on you,
  and the boss says so. A non-lethal takedown is forgiven; a blade is not.
- **Talking** (E beside one at peace): the boss, in turn - that they are not
  who you came for; the reds' books in the Cash Vault; that a ledger like
  that would finish the reds; to mind where you shoot. With the ledger in
  your hands, he says so. His men, a word each.
- **The Revolver** (`RV357`, "Revolver"): six heavy rounds (55), slow (0.5 s),
  a slow reload; `noMods`: no silencer, sight, grip or bigger cylinder fits.
- **Crates**: "E  Open crate" and "CRATE", whatever is in it (loadout.js
  `cratePrompt`); the Quartermaster keeps his name.
- **Z and X** (input.js `use1`/`use2`; weapons.js `quickUse`, `quickKey`):
  use what is in utility 1 / 2 without putting your weapon away - tap to
  throw a grenade, place a charge, mine or lure, or use a medkit; hold
  (0.45 s) to set off every one of that kind you placed. With nothing placed
  a press acts at once; with charges placed it waits to see tap or hold.
  X no longer detonates on its own (an old saved binding steps aside); the
  prompt says "tap Z to place another - hold Z to set them off".
- **The ledger**: on the Cash Vault's counting table (dark red, by the
  machine): "E  Take the ledger". The debrief has a line for it (optional:
  not needed to succeed), and one for the Yellows if any went down.
- **Sights**: the marksman rifles (LR7, LR7X, VX-40) carry their scopes,
  drawn on them (a fitted scope instead, never two). Aiming through one
  (weapons_view.js `scopeKind`; scope.js): the LR7s and the 8x - the view
  blacked out round the lens, fine crosshairs, thick posts, range dots; the
  VX-40 - a red chevron and holdover marks; a 2x optic - a red dot over the
  iron sights. Through a scope the weapon is not drawn.
- **Lamps**: unchanged (179). Bake times on his line: 1875 ms.

**Tests:** `casino` 55 (8 new: down every stair at three radii walking and
running - never lifted, stuck or on the rail, the post guarded; the bar post
and the patrol corner, every post and route point clear; dead in a seat, the
seat taken, the fall elsewhere; the Yellows - three, in the Suite, not
counted, their arms, the relations, none without them; who each goes for,
and a red firing at a Yellow; how they take strays, kills, takedowns and a
gun held on them; talking; the ledger), `weapons` 78 (6 new: a grenade from
Z with the gun kept, even the last; charges by tap and hold, the key's tap
and hold; a medkit, and Z / X bound with the old X stepping aside; the
Revolver; crates; sights and reticles). 524 in all. Twenty-one sabotages,
each caught. In a browser: the casino runs with the Yellows in the Suite,
calm, "E  Talk to the boss" beside him.

## M6.17.4 — repacking that holds steady; mods you can see and read

Rhys on M6.17.3 (16 screenshots): the parachute sometimes repacked on a
single press of E, sometimes took the proper 12 s hold - "it seems to change
its mind"; could a silencer be SEEN on a weapon, and YOUR GEAR say
"(silenced)", "(scoped)" and so on.
- **Repacking, two causes**:
  - Resume from the pause menu runs `deploy()`, which handed you a fresh
    parachute: open YOUR GEAR (in the pause menu), come back, and it was
    packed. Now only going in does (`if (!S.startedOnce)`).
  - A key the browser never saw let go of - E held while a screenshot was
    taken (his shots show the capture tool mid-hold) - stayed "held", and
    repacked with nobody holding it. A hold now counts only from a press made
    while repacking is on offer, and ends when E is up or the offer goes
    (player.js `packGrip`); keys are let go when the page is hidden
    (input.js `visibilitychange`); nothing repacks while a menu or crate is
    open; it runs on the real clock, not a sixtieth a frame.
- **Mods you can see** (weapons_view.js `attachmentsFor`, `dress`): a
  suppressor on the muzzle (a pistol's shorter and slimmer than a rifle's), a
  sight on top (the 8x long, the 2x short), a foregrip under the front, a
  longer magazine; on the weapon in your hands (rebuilt when its mods change)
  and on one lying on the floor.
- **Mods you can read** (loadout.js `MODS[].tag`, `modTags`, `withTags`): YOUR
  GEAR shows "V-27C Compact (silenced)", "LR7 Marksman (scoped 8x, silenced)"
  - and so does the prompt over a dropped weapon ("E Take the ... (leave your
  V-27C Compact (silenced))").
- **Found on the way**: a weapon you put down lost its mods - his V-27C,
  swapped for a guard's pistol and taken back, came back without its silencer
  (his screenshots: no Silencer under it). Dropped weapons keep their mods
  now, and bring them back when taken (mission_runtime.js `dropAt`, `put`).

**Tests:** `casino` 47 (1 new: a stuck key cannot repack; a fresh press
holds until let go or the offer goes; Resume does not repack; no repacking in
a menu; keys let go when hidden; real clock), `weapons` 72 (3 new: the tags
and YOUR GEAR; where each attachment is drawn and that the held and dropped
weapons are dressed; a dropped weapon keeps its mods). 510 in all. Ten
sabotages, each caught.

## M6.17.3 — the parachute packed by hand; sidearms with characters; the VX-40

Rhys on M6.17.2: YOUR GEAR should say whether the Parachute Pack is packed or
unpacked, and repacking should be something you DO, taking time; the V-27C and
the PX9 feel like reskins of the same basic gun; the casino's LR7 marksman to
carry a VX-40 (or another marksman rifle) instead; a new map idea - a
Fortress/Compound full of machine guns and rocket launchers (roadmap).
- **The parachute**: it no longer repacks itself. Once used it is
  *unpacked*: on the ground, keeping still, with nothing else E would do,
  "Hold E  Repack the parachute" - 12 s of holding (a rustle as you work;
  "Repacking the parachute 40% (hold E)"); let go or move and what you have
  done is kept. YOUR GEAR shows "Parachute Pack (packed)", "(unpacked)" or
  "(unpacked - repacking, 40%)" (player.js `repackChute`, `chuteLabel`).
  Falling with it unpacked: "Your parachute is not packed - repack it on the
  ground (hold E)". The casino briefing says so.
- **The sidearms** (loadout.js; a `trait` line under each in YOUR GEAR):
  - **PX9 Sidearm** - the full-size service pistol: 30 a round (was 26),
    good to 48 m (was 35), the tightest aim of any sidearm (0.0028), a stiffer
    kick, a press a round (0.2 s), slower to bring up (0.32 s).
  - **V-27C Compact** - a machine pistol: **three-round bursts** from one press
    (weapons.js `burst`/`burstGap`: the gun fires the rest itself, 55 ms
    apart; a reload, a weapon change or an empty magazine ends it), 19 a
    round, good only to 20 m, the burst spreads (`bloom`), quick to draw
    (0.12 s) and reload (1.1 s), steady on the move, little kick a round.
  - Each has its own report (audio.js: the compact snaps, the PX9 barks),
    and the V-27C is drawn smaller in your hand. Draw time is per weapon now
    (`draw`; 0.25 s where unset, as before).
- **VX-40 Marksman** (new): a semi-automatic marksman rifle - 58 a round,
  10-round magazine, 0.32 s between presses, 3x sight. The casino's marksman
  on the mezzanine (C12) carries one (guard.js `ARMS.dmr`: two or three
  quick rounds at a time, lighter than the LR7's) - and drops it.
- **Fortress/Compound**: written up in the roadmap's mission ideas with what
  it needs (LMG/HMG/launcher families, mounted guns, suppressing fire,
  breakable cover).

**Tests:** `weapons` 69 (4 new: one press, three rounds, then waits - the
PX9 one; the burst stops at an empty magazine and on a reload; the two
sidearms' characters, their draw times, traits shown, the burst fired by the
game; the VX-40 - semi-automatic, ten rounds, a guard's, the casino's
marksman's, held like a rifle), `casino` 46 (the parachute test rewritten:
unpacked, repacked only holding E, still, on the ground, not in the air or
open; progress kept; told while falling; wired; YOUR GEAR's label). 506 in
all. Ten sabotages, nine caught; the tenth (the burst's own stop at an empty
magazine) is a guard behind the empty-magazine check.

## M6.17.2 — the slit by floor 2's ramp doorway, the washrooms laid out by their walls, the parachute repacked

Rhys on M6.17.1 (25 screenshots): pleased with the round; a tiny gap at
~(52, 8, 31) through which you see into a washroom from the ramp; the WCs
still a little cramped, their sinks clipping out of the rooms; the parachute
failed to open the second time ("Killed by a fall"). Bake times on his
debug line: 2125 ms, and 3959 ms on another load.
- **The gap**: floor 2's doorway from the ramp (east) ran 0.3 m past the end
  of the east washroom's south wall where it meets the middle ring, leaving a
  5 cm slit between the ring's end and that wall. A ramp doorway in the middle
  ring now stops where a wall inside meets the ring (the map square 1.2 m in
  is a wall's): floor 2's doorway is 2.9 m, the slit gone. No other floor's
  doorway changed.
- **The washrooms** (`washroom`, rewritten): fittings had been set out by
  angle round the ring, as if every washroom were a slice of it - most are
  triangles and wedges, so the vanity stood across a wall and the cubicle's
  partitions ran through the walls. Now each fitting is a rectangle flush
  against the room's own wall (`placed.free`: the floor to the walls' faces),
  put only where all of it - and the space in front to use it - is inside the
  room, in no wall, clear of the other fittings and a step clear of the door.
  The cubicle goes as far from the door as it fits (a partition only on a
  side that is not already a wall), the basin as near the door as it fits
  (smaller in the smallest rooms if need be), the dryer on the wall beside
  it. Every washroom keeps over 45% of its floor free.
- **The parachute**: it was one per deployment, silently. Now a used one is
  repacked after 8 s on your feet (player.js `repackChute`, `CHUTE.repack`) -
  "Parachute repacked", with a rustle - and falling while it is still being
  repacked says "Your parachute is not repacked yet" instead of SPACE doing
  nothing.

**Tests:** `casino` 46 (3 new: no slit through the middle ring on any floor;
every washroom fitting inside its room and in no wall, room left to stand;
repacking - not in the air, not while open, after 8 s on the ground, told
while falling, wired into the game). 502 in all. Six sabotages, five caught; the sixth (dropping the
washroom's room-outline check) changes nothing - it is a guard behind the
wall check.

## M6.17.1 — C5 on the way, the staff door hung, rooms lit, six slot games, the ramp's top railed

Rhys on M6.17.0 (64 screenshots): still some jutty-out bits; the parachute
works and looks decent; C5 needed before the Poker Tournament Room; the
Tournament Room and the Businessman's Suite very dark; the casino's front
illuminations hard to see; the staff door needs a door; the slot machines
should show different results; the half-moon tables still a little
triangular; the WCs still need improving; the Quiet Room's seating should
fill its wall and be lit better; taking a downed red's weapon shouldn't
force-switch the one in your hands; another dead end at ~(6, 8, 32); the
pool's ladders' feet clip into the floor below; no GANTRY sign; a short rail
at ~(29, 23, 2.5) so you don't spiral up only to fall down again; the Cash
Vault unchecked (no C5).
- **Jutting bits**: the "dark slabs" seen from the ramp were the ground
  floor washrooms' partitions and tiles poking through the middle ring into
  the ramp's band. Everything fitted inside a ring room (washroom, Quiet
  Booth, Cash Vault, their spans, tiles, floor 2's small ceilings) now stops
  at the ring's inner face (`RING_FACE`; `roomOutline(cells, off, cap)`).
- **C5** (and the dead end at (6, 8, 32)): the nook at the west end of floor
  2's gallery is a maintenance store now - stacked crates, a MAINTENANCE sign,
  and a case of **C5** on them (`level.c5Crate`, two charges): picked up on the
  way to the Tournament Room and the Cash Vault.
- **Dark rooms**: the lamp grid fell where it fell, and some rooms off the
  halls got none. Every room inside the ring on the ground and second floors
  gets a lamp per ~30 squares (one more in the booths, the Tournament Room and
  the vault), spread as far apart as its floor allows. The Businessman's Booth
  has 4, the Tournament Room 7; no room is unlit.
- **The front at night**: uplighters round the building's foot (14, each a
  baked light washing the stone), two bands of light round the top, and four
  light strips up the front either side of the doors (in the solid strips
  between the windows).
- **The staff door**: moved round to due north (the wall runs square to the
  map there, so a leaf hangs true; the ramp passes 2.3 m over it). A steel
  door, opening either way (`level.staffDoor`). In the dead-end stub by the
  ramp's base: a locker and a bench with a box of **pistol rounds**.
- **Slot machines**: six games (textures.js `SLOT_GAMES`): JACKPOT £25,000,
  LUCKY 7s £5,000, DIAMOND RUSH £10,000, GOLD RUSH £50,000, ROYAL FLUSH
  £2,500, MEGA SPIN £100,000 - each its own colours, reels stopped on
  something different, its own pay table and credit display; no two
  neighbouring machines on the same game (materials `slotface`,
  `slotface1`-`5`).
- **Half-moon tables**: the outline's two back corners were joined in the
  wrong order, so it crossed itself - the "triangular" look. Fixed.
- **WCs**: a toilet with a rounded bowl, a seat, a cistern and flush, a paper
  holder; light cubicle partitions with chrome tops; a round basin set in the
  marble with an arched tap; a lit strip over the mirror; a hand dryer beside
  the vanity (the side away from the door); and lamps (above).
- **The Quiet Room**: the banquette runs from end to end of the curved wall
  (to the far side of its end squares, up to the walls; only a doorway's width
  spared at the door) - 22.6 m of a 25 m wall; brass wall lights over it every
  couple of metres; three lamps.
- **Weapons off downed reds** (loadout.js `pickupSlot`, `holdAfterPickup`):
  the weapon goes into an empty slot that fits it first, and you keep holding
  what you held - picking up a primary with your sidearm out leaves your
  sidearm out.
- **The pool's ladders**: kept a whole metre in from each end of their side,
  the one in the water standing on the tank's floor - no foot through the
  ceiling below.
- **The gantry's sign**: gone.
- **The ramp's top**: it ends in a 2.4 m level landing alongside the way onto
  the roof terrace, and a rail (posts, a top rail and a mid rail, solid)
  across the band at its end. Walk on and you stop at the rail.
- **Lamps**: 179 in the casino now (was 129) - watch the bake time on the
  debug line (2.0 s on M6.17.0).

**Tests:** `casino` 43 (9 new: the half-moon outline never crosses itself;
the staff door north, hung, clear inside, the pistol rounds reachable; the C5
in the nook, reachable, somewhere to stand; six slot games, neighbours
differ; every room lit, the Tournament Room and Businessman's Booth well;
the front's uplighters, bands and strips; the ramp's landing and rail -
walked along at three widths without falling; no GANTRY sign, nothing in
the ramp's band; the banquette fills its wall, sconces, every washroom's
dryer, the pool's ladders within the tank and not below its floor) and
`weapons` 65 (taking a weapon off a downed red keeps the one in your hands).
499 in all. Fifteen sabotages, each caught (moving the pool ladders back to the ends of their sides changes nothing on this map - the clamp is a guard; sinking their feet is caught).

## M6.17.0 — the casino kit and the parachute; a front, a staff door, the Quiet Booth and the Cash Vault

Rhys on M6.16.0 (58 screenshots): something at the dead end (24, 0, 3); the
shops samey (several noodle bars and launderettes), a sign half-clipped, and
"24 HR" shops you cannot go in; the slot machines' text back to front; comfy
seating along the Quiet Booth's curved wall; a sound for bullets through
bottles and wine glasses; roulette's numbers spilling into each other and the
wheel sitting on them; the baccarat tables too close; one of the kiosks not
reachable; gaps into the ground floor's central room that don't look right;
the WCs too crowded - one cubicle and a sink each; he likes the bars, still
crawls under the tables, likes the new spiral stairs but falls off them; the
sky too bright for near midnight; square tiling still jutting through walls;
a floating light; the pool too shallow to swim; the withdraw point far from
the jeep; the room at (30, 8, 6.8) is the Cash Vault; a proper front and front
doors; a casino kit (bare hands, a silenced V-27C, two lures, two smoke
grenades, a parachute pack); a point on the roof to jump off and parachute
down to the jeep (a taste before the parachute-start mission). Future idea:
an assassination mission (roadmap).
- **The dead end**: a **staff door** in the outer wall at the end of the
  passage under the ramp's first climb, out to the north side of the plaza (a
  canopy, a lamp, a STAFF sign). The passage's lamps had never been put up
  (`phiB + 2` was radians, past the end): lit now. The outer wall's doors are a
  list (`level.outerDoors`).
- **Shops**: 26 different names, each used once; signs only on the part of a
  front facing the street (the clipped one hung round a corner, behind the next
  side's building); no 24-hour shops - closed for the night: dim windows,
  mullions, a dark door. `level.shopSigns`.
- **Slot machines**: the face's u ran right to left as you faced it - flipped.
- **The Quiet Booth** (`quietBooth`): a plum banquette along the curved outer
  wall, broken at the door, low round tables with lamps in front.
- **Glassware** (world.js `shotOnly`, audio.js `glassware`): the bars' bottles
  and hanging glasses are bands bullets meet (and pass through: tough 0) and
  nobody walks into; a round through them plays a crack, a tinkle of pieces and
  a ring - from your gun or a guard's stray round.
- **Roulette**: at most 1.5 m across; the wheel in its own end; the layout stops
  short of it; the printed layout twice as wide (1024 px) and its numbers sized
  to their boxes.
- **Baccarat**: half-moons 1.35 m round, and half-moon tables side by side are
  pushed apart until both rows of chairs fit. **Chairs** are placed last
  (`placeChairs`), skipping any that would sit in a table, a wall, a fitting
  or another chair (neighbouring poker tables' chairs had been inside each other).
- **The kiosks**: neither had a way in. Doors added from the rooms beside them
  (`MAP_PATCH`, applied in code so Rhys's spreadsheet stays his). Also found: a
  smoothed wall square to the grid ran 0.1 m past its end into the doorway beside
  it - the west room's door was too narrow for a guard's route. Fixed for all.
- **Gaps into the central room**: the ground floor's middle-ring doorways onto
  the ramp's level start. Only the way in at the east and the one straight in
  from the main doors are kept; and any two loose wall ends facing each other
  across a gap get a lintel and a wood trim (`W.openings`).
- **WCs**: one cubicle and one basin each.
- **Spiral stairs**: the handrail is solid now (rail boxes along every tread's
  outer edge, waist high).
- **Sky** (render.js `NIGHT_SKY`): darker overhead, a low town glow - every night level.
- **Tiling**: the washroom tiles and the second floor's small ceilings follow
  the room's outline smoothed exactly where the walls are (`roomOutline`),
  points straightening carried out past a staircase drawn back to the wall's
  middle. **Floating light**: the ramp's last lamps hung over the roof terrace,
  where no wall is left - not put up.
- **The pool**: sunk 1.1 m into the roof (a tiled tank hanging into the fourth
  floor's ceiling, its lamps hung under it) - 2.3 m of water: you swim. The
  roof slab has a hole the pool's shape (`discBoxes`/`roundFloor` take outlines).
- **The jeep**: by the main doors; you start beside it and withdraw from it.
- **The Cash Vault** (`cashVault`, label added): a wall of safe-deposit boxes
  along the curved wall, steel shelving of banknote bundles, a counting table
  with its machine, gold bars on a trolley.
- **The front** (`frontage`): glass double doors, a curved canopy edged in
  light on brass columns, CASINO in lights over it, a red carpet between brass
  posts and ropes, planters, lamps under the canopy.
- **The casino kit** (`level.startLoadout`, loadout.js): no primary (bare
  hands); **V-27C Compact** (a new sidearm) with a silencer fitted; two **Lure
  Devices** (placed like a charge, set off the same way, from anywhere: an
  alarm's chirp three times, a noise the reds come to look at - weapons.js
  `lure`, mission_runtime hears it); two smoke grenades; the **Parachute Pack**
  (gear). The briefing says so.
- **The parachute** (player.js `CHUTE`, `parachute`/`chute`): falling with the
  pack, SPACE opens it: you sink at 3.4 m/s and glide the way you face (W on,
  S back, A/D slip); you land softly, or close it in water. One per deployment.
  A canopy over you (main.js `makeCanopy`). **The gantry**: a grating walkway
  from the roof terrace out over the plaza, south (a gap in both rings' glass,
  rails, a GANTRY sign) - jump, open, steer to the jeep.
- **Bake time** on Rhys's machine was 2.2 s for M6.16.0 (the debug line).

**Tests:** `casino` 34 (8 new: the kit; a lure is a noise, not a blast; off
the gantry, open, steer to within 9 m of the jeep unhurt - and hurt without
it; glassware met by bullets, not bodies; the booth, the vault, the kiosks and
the staff door reachable; the shops; the jeep at the start and the end, the
gap to the gantry, no floating lamps; roulette, baccarat spacing, tiles within
their walls) and extended (slot faces the right way round; a rail up every
stair; one cubicle and basin; chairs clear of every fitting on every floor;
swimming in the pool). 489 in all. Sixteen sabotages, each caught.

## M6.16.0 — the Casino, second pass: clockwise, windows, a neighbourhood, furnished

Rhys on M6.15.0: the circular walls and the coiling floor done very well; but
he expected the ramp to climb clockwise; windows to look out of, the lit ones
climbing with the coil; why does the edge of the map say "Range" - give the
casino a neighbourhood; the roof pool's ladders are blocked by its glass; an
invisible barrier at (5.5, 0, 43); the WC blocks and other buildings inside
need smoothing in (he drew them staggered); the chips and check-in kiosks
smoothed, their counter filling the whole front like the hotel's bar; proper
casino tables (not every table - the bar is a counter); chairs and stools;
an odd spot at (30, y, 30) on every floor, a gap seen from one side; the
ground floor bar more bar-ish, glasses on racks hanging round its ceiling;
slot machines more slot-machine-y; the WCs made WCs; he loves climbing under
the restaurant tables (kept); he doesn't like the spiral stairs; it seems they
can shoot him through bulletproof glass; screenshots of things that read
oddly (square tiling not quite covering a round room's ceiling).
- **Clockwise** (`RAMP_KEYS`, `casinoRamp` dir 1): east, south, west, north as
  the map is drawn. It starts level from the ground floor's way in (east) round
  to the main doors (south) - the doors open onto its foot - then climbs; the
  third floor a turn and three quarters on from the second (north), 5.75 turns.
- **The invisible barrier**: the solid base under the first climb was the
  ramp's own metre squares filled to the ground, reaching up to half a metre
  past the drawn base. Now drawn and collided as one (short pieces along the
  band, stopping just inside the drawn end; `level.rampFill`). Also found: the
  ring walls' collision (boxes round 1 m chords) bulged up to half a metre out
  of their faces on the diagonals - now 0.35 m chords, within a quarter of a
  metre all round (tested). The passage under the rest of the first turn is lit.
- **Windows** (`outerWall`, `WIN`): the outer wall is built whole, strip by
  strip; one strip in six starts a window three strips wide, a metre above the
  ramp beside it, its sill and head sloping with it - 311 of them, glazed,
  climbing every turn, lit at night by the ramp's lamps. The wall is a new pale
  stone (`cladding`), no longer the neighbouring-building texture with painted
  windows. A glass balustrade round the roof terrace.
- **The neighbourhood** (`neighbourhood`, `STREET`): the range's fence (and its
  RANGE sign) gone. A paved plaza with bollards and lamps (baked), a road all
  round with a dashed centre line, kerbed pavements with street lamps, and the
  city's blocks beyond - lit windows, shop signs, glowing shopfronts - closing
  the square in. Parked cars and the Ghost jeep by the plaza.
- **The roof pool** (`glassPool`): the map's glass round the pool had been
  built as a wall 2.4 m high a metre outside the pool. The glass is now the
  pool's own side (1.3 m, a marble coping), in the shape drawn (smoothed), the
  water that shape (no water outside it); a ladder up the outside of the glass
  at each A and one down into the water.
- **Smoothed walls** (`wallLines`, `buildWallLines`): the map's wall squares
  joined into lines - diagonally where they step - each from junction or door
  to the next, straightened and rounded (Douglas-Peucker, then filleted), a post
  where lines meet; ends next to the middle ring carried into it (there had
  been gaps). Doors stay square to the grid; lines end at their jambs. Glazed
  lines (G) plaster to 0.9, glass to 2.4; on the roof all glass.
- **Kiosks**: a counter square in a wall line (C between walls) makes the line
  a counter from its first glazed or counter square to its last - the Chips
  Counter and Check-in Desk are one curved counter each, marble-topped, under a
  glass screen with a gap to pass chips through.
- **The odd spot at the middle, the "square tiling"**: the round floors were
  polar wedge tiles, each its own lightmap patch squashed into a rectangle - a
  patchwork, and black where the wedges came to a point at (30, y, 30). Floors
  are now one flat face each (`roundFloor`, `flatPoly`, earcut), round holes
  cut for the stairs, and one lightmap **sheet** (bake.js `packLightmap`: faces
  laid out where they really are, so no seams inside). Curved walls and the
  ramp use sheets 12 m long too - the vertical banding of M6.15.0 is gone.
- **Spiral stairs** (`buildStair`): rebuilt - wedge treads with a nosing, a
  round post, a helical handrail and stringer, a baluster at every tread, a
  landing out to the hole's edge, a round hole with a curved balustrade round
  it (open across the landing). Eighteen steps a turn (3.6 m a turn: head-room
  close to the post); each set by where its landing must come out (along the
  walkway), the middle one by its foot (its walled room opens south). The
  mezzanine is one deck (`deck`), its outline the walkways', round holes.
- **Furniture** (`furnish`): the map's C squares in clumps, each told apart by
  where it is and the nearest label. Poker: ovals (round when square) with a
  padded rail, felt, chips, a dealer's place, red leather chairs round the true
  edge. Blackjack and baccarat: half-moons, chairs round the curve, chip tray
  and shoe. Roulette: a wheel at one end, the printed layout (`layout`),
  stools. Craps: a long tub with a high padded rail, dice. The private poker
  tournament table and the Businessman's Booth table: long ovals. The
  restaurant: round tables on a pedestal with tablecloths and six chairs - still
  room to crawl under. **The bars**: the ground floor's round bar - a panelled
  counter, marble top, brass foot rail, a round back bar of lit shelves of
  bottles, a gantry overhead hung with three rails of upside-down wine glasses,
  pendant lamps, stools all round; the first floor's an arc against the north
  wall with shelves of bottles behind and a glass rack. **Slot machines**: a
  cabinet, a lit face (game screen, three reels, pay table: `slotface`), a
  button deck, a glowing topper, a stool, backed onto the wall. **Washrooms**
  (`washroom`): tiled floors; cubicles along the outer wall (toilet, cistern,
  partitions, a door ajar), urinals in the gents, basins on a marble vanity
  under mirrors by the door. Chairs and stools are solid at seat height.
- **Bulletproof glass** (guard.js `shoot`): a guard sees through glass and a
  hit was rolled on sight alone. Now the round must get there: bulletproof
  glass or a wall in the way stops it (he sees it strike, holds fire a moment;
  ordinary glass a round can pierce does not). Cover now stops rounds too.
- **Engine**: a grid over the ground in the collision world (world.js
  `_index`/`_near`; raycast walks the squares along the ray) - the furnished
  casino has ~9,700 boxes; the answers are the same as looking at every solid
  (tested against `raycastAll`); people, hinged doors and targets, which move,
  are kept apart. The renderer takes triangles, per-piece `tint`, and new
  materials `paint`, `neon` (glows in its tint), `slotface`, `cladding`,
  `marble`, `wctile`, `mirror`, `layout` (painters added after `felt`, so older
  textures keep their seeds). Water may be any shape (`poly`).

**Tests:** `casino` 26 (15 new: clockwise; no invisible wall, ring boxes within
a quarter metre of their faces, (5.5, 43) walkable; windows a metre above the
ramp on every turn; round floors one face, the middle covered, holes open;
stairs 18 a turn, a landing to step off, down again; walls smoothed with every
map wall square covered and ends carried to the ring; the kiosks' counters;
every kind of table, chairs clear of tables and walls; crawl room under the
dining tables; the bars and their glassware and stools; slot machines backed
onto walls; washrooms; the pool's ladders up, over and in, dry beside it; the
neighbourhood walked round and closed in; the grid's answers), `fight` 24
(bulletproof glass stops his rounds, ordinary glass does not), `light` 13
(sheets are seamless; and the casino's baked meshes are built in node, with a
stand-in for the engine - the first baked run in Chromium failed where a
chunk's materials are packed into one lightmap, and only a browser had shown
it; `buildMergedMeshes` is exported for this). 481 in all. Fourteen
sabotages, each caught.

## M6.15.0 — Level 3: the Casino, round; the beret

Rhys on M6.14.0: the Derelict Factory is incredibly disorienting - brilliant;
enemies' hats sometimes clip through their heads (his screenshot: a sergeant's
beret round his forehead, the head through the top); the factory as a prelim
is great; build the Casino next, with its smooth, circular walls; once there
are a few maps he will play them all and say what he wants where.
- **The beret** (character.js): it was a flat disc at the brow - the skull
  came up through it. Now a soft dome over the crown on a headband, slumped to
  one side, badge kept. The cap, peaked cap and tactical cap were checked in
  close-ups: they sit right.
- **Level 3, the Casino** (`src/game/levels/casino.js`, `?level=3`, the title
  screen's "Level 3: Casino"). From Rhys's preliminary map
  (`maps/Frontline_Map_Casino__Prelim.xlsx` -> `src/game/levels/maps/casino.json`;
  map_to_json/draw_map now read "Roof Terrace" as RT). One square = 1 m:
  60 m across. Floors: G 0, 1 4, 2 8 (a hall two floors high), 2A 11.6 (the
  mezzanine: a cross of glass-walled walkways), 3 15.2, 4 19.2, RT 23.2.
  - **True curves**: the outer wall (r 29.5) and the middle wall (r 25.8),
    every floor, read off the map round the circle (`ringCode`: wall, glass,
    doorway). Drawn as smooth arcs (`arcWallQuads`); collided as boxes round
    short chords (`arcWallBoxes`), merged floor to floor. The renderer now takes
    free-form pieces (`p.quads`, render.js; the bake keeps them whole).
  - **The ramp** (Rhys: "one smooth ramp coiling up round the building"): the
    band between the two walls, `Ramp` (src/sim/world/curves.js) - a turn a floor,
    meeting G, 1 and 2 on the east and 3, 4 and the roof on the north (where
    the map puts its S marks), 5.25 turns in all, at least 3.6 m between turns.
    Drawn smooth; stood on as row-merged cells (1 m, steps of ~2 cm - the
    player walks it without a bump). Under its first, lowest stretch it is solid;
    the main entrance (south, the map's E) goes in under it at 3 m, along a
    passage to its foot on the east. The middle wall is open wherever the ramp
    meets a floor; its doors where nothing is beyond them at that height are
    walled up. Lamps along it.
  - **Inside**: walls from the map (`gridWallSegments`: straight runs merged,
    pixel staircases joined round their corners so there is no gap), doors,
    the gaming floor's tables in a new green felt, slot machines, the central
    bar, the cage, the first floor's bar and restaurant tables, the second
    floor's private room behind reinforced doors and galleries (small rooms
    ceilinged at 3.3 m under the mezzanine), floors 3 and 4 (empty on the map),
    the roof terrace's pool (raised, with ladders at its corners), lamps.
    Round floors (`discBoxes`, drawn as polar quads).
  - **Spiral stairs** (`spiralStair`): floor 2 up to the mezzanine (in the
    middle, and under its west and east arms - moved in from the map's spots,
    which are where the ramp comes in), and the mezzanine up to floor 3 (along
    its north and south arms, clear of the doorways). A landing off each top;
    rails round the holes in floor 3.
  - **Fifteen reds** (a placeholder garrison - the map's Guards and Info tabs
    are not filled in yet): tables, the central bar, the first floor, the
    private room (an officer), the hall, a marksman on the mezzanine, floor 3,
    the roof. Objective: clear them out (`RULES.casino`; the factory's rules
    are now `clearRules`), extraction at the plaza. Trophies `casinoTrophies`.
    Night (23:15), lit.
- **Engine fixes found on the way**: a pool counts as water only down to its
  bottom (player.js `waterInfo`, hostage.js `standable`) - the roof pool made
  the floors under it its deep end; `discBoxes` lost every row whose floor ran
  to the end of the scan; 10,000 collision boxes brought to ~5,200 (rings
  merged, walls merged, tables and decks in runs).

**Tests:** `casino` (new, 11): the map; quick to build (~0.6 s), ~5,200 boxes,
bakeable lamps; arc boxes follow the curve; a pixel-staircase wall has no
gaps; the ramp's heights and headroom; from the plaza in under the ramp, to its
foot and up all 5.25 turns to the roof without a fall; stepping off the ramp
into every floor; the main doors into the gaming floor; every spiral stair up
and off; the reds placed; doors hung; rules, trophies, the title screen. Five
sabotages, each caught. 463 in all. Checked in Chromium, live and baked (111 s
in the sandbox's software renderer - a factory's was 77 s, 1.1 s on Rhys's
machine): the round tower from the plaza, the gaming floor in felt, the ramp,
the hall under the mezzanine, the roof pool. Note: the curved walls show faint
vertical banding in the bake (each half-metre strip its own lightmap patch) -
to smooth later.

## M6.14.0 — Level 2: the Derelict Factory; hostages come down from the roof

Rhys on M6.13.8: took the hostages up to the roof and none would come back
down; bored of the Riverside Hotel after so many runs - build up some other
maps for variety (asked which first: **the Derelict Factory**).
- **The roof**: with more than one hostage, they bunched at the top of the
  ladder - each one's route said to step onto the exact top point first, and
  the shoving between them kept nudging each one off it, so none ever got
  there (one alone was fine). Now (hostage.js) a hostage within `LADDER_TAKE`
  (0.7 m) of a ladder's end takes it - onto it and climbing - one at a time
  (`ctx.crowd`: someone already on it, he waits), and the runtime leaves anyone
  climbing out of the shoving (as it already did for guards). Up works the same.
  (`if (!this.path) this.climbing = false` is a safety net the tests do not
  reach - the next step along clears it anyway.)
- **Level 2, the Derelict Factory** (`src/game/levels/factory.js`;
  `?level=2`; the title screen's "Level 2: Derelict Factory"). Rhys's battle
  map (`maps/Frontline_Battle_Map_Factory.xlsx` -> `src/game/levels/maps/factory.json`
  by `tools/map_to_json.py`), two floors of 60 x 60 squares at **1.5 m a
  square** (90 m across): brick walls, steel doors (L locked: kick; R the
  core's reinforced pairs: a charge), crates, machines and barrels for cover
  (the map's C), a lamp per room (74 in all) and skylights in the roof; midday.
  **Ladders only** between the floors (the map's A): each on the wall beside
  a hole in the floor above, a rail round the hole but the side you step off
  by; a nav link from its foot to that side (`factoryLadders`).
  **Eleven yellows** (Rhys's Info tab), in a yellow-tinted kit (YELLOW in the
  runtime; the bark says "Yellow"): two at each of their corners (NE, SW, both
  floors), two patrolling the ring of corridors each floor, three in the core
  (an officer, a shotgun, a marksman up top). You start in Ghost's NW corner.
  **Objective: flush the yellows out** (all killed or knocked out), then back
  to your way in; hold E there to withdraw before. Graded and recorded like
  the hotel - the runtime now reads each mission's rules from
  `RULES` (story.js: `riverside`, `factory`; `level.rules`). Trophies
  (`factoryTrophies`): No Casualties, Unseen, Sharpshooter (Rhys's ideas; No
  Witnesses is the objective itself). For now it is a mission; the battle mode
  his map was drawn for (two sides, reserves, a ten-minute timer) is to come.
- **Ladders from the top** (player.js): walking into a ladder's top from the
  floor above takes hold of it, turned to the wall, ready to go down - rather
  than dropping through the hatch (the hotel's roof hatch too).
- **Withdrawing** is offered only once you have left your way in (you start
  there - the prompt showed at once, in the hotel too).
- **Door hanging, faster**: `chooseSwing` rasterises a floor's walls onto its
  0.5 m grid once, shared by every door there (`hangDoors`' cache): the
  factory's 69 doors took 2.7 s, now the whole level builds in ~0.25 s.

**Tests:** `factory` (new, 9): the map; quick to build, lamps bakeable; the
start; the building shut all round; every ladder up and back down (by walking
into the hatch); the yellows, their routes and reach (upstairs by the
ladders); the core shut until a charge; every door hung with room; the
objective, grading, story and trophies. `hotel` +2: three hostages down the
roof ladder one at a time and on along the corridor, and up again. Sabotages:
the ladder-take, the top grab, the ladder links, half the walls - each caught.
452 in all. Checked in Chromium: Level 2 loads, bakes (77 s in the sandbox's
software renderer - expect a few seconds on a real GPU), the objective line,
the "last yellow down" hint, and MISSION SUCCESSFUL at the way in.

## M6.13.8 — objectives no longer end the mission; the story begins

Rhys on M6.13.7: what happened to the logo/banner?; everything else fine;
time to make mission objectives independent from mission completion; how do
perks work?; the game needs an actual storyline (with his notes: Persistently
Tracked Dimensions, the Glass Vein example, recoverable and devastating
losses, placeholder faction names, recurring characters); map ideas (a full
sewers map, busy city, desolated city, nuclear wasteland); vehicle missions
and a sky-dive start. Also a GPT_Images zip of story mood boards.
- **The logos**: the repo and the live site both have them (checked: the
  files are served; index.html is unchanged) - most likely a moment mid-deploy
  that the browser cached. Each logo now retries once, past the cache, if it
  fails to load (`onerror` in index.html).
- **Objectives independent of completion (the hotel)**: a hostage killed or
  the captain escaped no longer fails the mission - each is an outcome, said
  in a hint ("Tony Ashdown has been killed."). The mission ends at the Ghost
  jeep: by itself once everything is settled (`hotelSettled`: every hostage
  out or dead, the captain stopped or gone); before then, **hold E at the jeep
  for 1.5 s to withdraw** (the prompt says what is still undone). Graded
  (`grade`): success / **MISSION COMPLETE** (amber: something achieved) /
  failed (nothing achieved - "Withdrew with nothing achieved" - or your own
  death, as before). The debrief lists each hostage by name with their fate,
  and the captain's (`outcomeLines`). Trophies on a partial result too; Swift
  Extraction now needs every hostage out. Level 0 (training) still needs its
  file - unchanged.
- **The story is recorded**: `src/sim/play/story.js` (`hotelOutcome`,
  `recordOutcome`) - each slot keeps its story under its own key
  (`frontline.story.N`, `Saves.loadStory/saveStory`); the slot in play is
  remembered for the tab (`Saves.setCurrentSlot`, sessionStorage), so the
  mission page writes into the slot you deployed from; saves and transfer
  codes carry a copy (`snapshot().story`), put back when a save is loaded.
- **The cast in play**: H1 Dr Imogen Hale (she), H2 Tony Ashdown, H3 Elijah
  Pellow (`HOSTAGE_CAST`, level_hotel.js) - named in prompts, hints, debrief.
- Briefing: a "How it ends" paragraph. The frame-rate line no longer runs
  into the score (the score moves below it while it shows).
- Story notes, PTDs, Glass Vein, perk ideas, the new maps: FRONTLINE_ROADMAP.md.
  Mood boards in `maps/concepts/story/`.

**Tests:** `hotel` +3 (outcomes, settling, grading, the debrief's lines and
the story log; the runtime no longer fails on a hostage or the captain; the
hostages' names; trophies on a partial run), `saves` +1 (the story in a
snapshot, through a transfer code, one per slot; the slot in play). Four
sabotages, each caught. 441 in all. Checked in Chromium: a hostage killed,
the mission carries on ("Hostages safe: 0 of 3 (1 killed)"); withdrawing at
the jeep gives MISSION COMPLETE with each hostage's fate, and the story is
written into the slot deployed from.

## M6.13.7 — the ranges work again; Meridian's doors swing into the rooms

Rhys on M6.13.6: in Meridian House the doors that open outward into the
corridor need to open inward into their rooms; the ranges' targets stand back
up far too quickly, and a range is no longer counted as done once every target
is down; "Back to the start of this section" in Weapons Training put him on the
range's roof - and dropped into a range, the wrong side of the berm; the laser
turrets reactivated far too quickly; Ashdown and Pellow dressed for their jobs.
- **Ranges and turrets - one cause, a bug of mine since M6.13.3**: fixing the
  score (`|| 10` to `?? 10`) in `makeTarget`, the explaining comment went in
  the middle of the line, and `//` switched off everything after it: `down`,
  `downAt`, `respawn` and `lane`. Every target fell back to the default 4 s
  respawn (range targets and turrets are 1e6 - stay down), and lost its lane,
  so a cleared range was never counted. (Guards' and hostages' targets also
  came back to full hp after 4 s - their bodies stayed down.) Fixed; tests
  now check every field survives.
- **The section restart**: it had its own spot, [-88, 0, 9], from before the
  course went 16 m underground - now the top of the range. Where each section
  starts is now one table, `level.sectionStarts` (level_training.js), used by
  starting the course, the skip button and "Back to the start of this section";
  restarting the weapons half also puts the ranges' doors back (the link
  room's way out open, the rest shut).
- **Meridian's doors**: M6.13.6 hung each door into the "more enclosed" side,
  by how near the walls are - and a 3 m corridor is nearer-walled than an
  office, so 8 of 16 swung into the corridor. `chooseSwing` now floods the
  floor area out from each side of the doorway (a band just under the lintel,
  so over desks; walls and shut doors stop it; 0.5 m cells, capped) and hangs
  the door into the smaller - the room. Ties (both past the cap): the old
  nearest-walls rule. All 16 checked against the plans.
- **The cast**: Ashdown and Pellow dressed for their jobs - in the roadmap.

**Lesson:** never put a `//` comment inside a line that goes on; put it on its
own line above.

**Tests:** `weapons` +1 (a target keeps every field it is given; a range target
stays down a minute), `course` +2 (every Yard 7 range target and turret has its
lane and stays down; each section starts on the course floor, the weapons one
in the link room, and main.js has no positions of its own), `mission0` +2 (all
13 corridor doors into their rooms; a corridor-and-office world). Each
sabotaged - including putting the original bug back - fails. 437 in all.

## M6.13.6 — accolades on page 2; every level's doors like the hotel's

Rhys on M6.13.5: nice; accolades probably need to be on a "page 2" of the
debrief; the doors on the other levels and in Yard 7 also need to be gapless
and to work the same as the Riverside Hotel's; (another general thing he
could not recall).
- **Debrief, page 2**: page 1 is the result, objectives and stats; trophies
  and accolades are on page 2 (`#mend-p1` / `#mend-p2` in index.html), behind
  a button - "Trophies & accolades (2) - 2 new >" (`awardsButton`,
  mission.js) - and back ("< Back to the debrief"). Nothing earned: no button,
  no page 2. Back to Yard 7 and Play again on both pages.
- **Doors everywhere**: the hotel's doors got their seal (M6.12.3) and their
  one-way swing (M6.13.0) from its map; the hand-built doors elsewhere had
  neither. Now:
  - *Seal*: Meridian House's door helper draws every leaf out to its jambs
    and the lintel at 2.1, and the first leaf of the front pair carries the
    strip over the join; Yard 7's door (into the stairs corridor) to its
    opening (z +-0.5, 2.15).
  - *One way*: `hangDoors` / `chooseSwing` (doors.js) hang each door with no
    swing of its own into the more enclosed of its two sides (rays out from
    each side, their free lengths summed - into a room off a corridor, in
    from outside: the hotel's rule), and only to a side where the open leaf
    has clear wall to lie against. Run at the end of `buildMission0`,
    `buildTraining`, and `buildHotel` (it caught the hotel's cellar door,
    which the map does not hang). Meridian House: front and back doors swing
    in; server room, guard room and the commander's office swing into those
    rooms. Yard 7's door swings into the corridor (pushed from the link room;
    pulled from the stairs side, with the step back). Slip-through (hold E)
    already worked everywhere: it is the shared door code.
  - The course test that wanted the Yard 7 door to swing away from you from
    either side is now the one-way rule.
- (The course's blast doors are not hinged doors - solid blocks filling their
  openings - and are unchanged.)

**Tests:** `mission0` +5 (on all three levels, every hinged door hung one way
with room for its leaf; every shut door drawn to jambs, lintel and its pair,
with one strip over a pair's join; Meridian House's doors swing in and into
the rooms, and open the way they are hung from either side; `chooseSwing` on
a test world - a cabinet in one arc, both arcs blocked, a small room; the
debrief's page 2 and its button). Eight sabotages, each caught. 432 in all.
Checked in Chromium: the two debrief pages turn both ways (screenshots).

## M6.13.5 — nobody pops in from nowhere; the pilot speaks

Rhys on M6.13.4: nice; "an enemy spawn in behind me from absolutely
nowhere"; everything else fine - but audio for the Chopper Pilot, not just
subtitles; to clarify, the objectives are NOT yet optional?
- **The guard from nowhere**: nothing spawns mid-mission - he was there, not
  drawn. Bodies were drawn within 8 m, or 42 m on your own floor (feet within
  2.5 m); a guard on the stairs, or across a stairwell a floor away, was
  invisible until 8 m and then popped in. Now `DrawCull` (src/sim/world/drawcull.js)
  also draws anyone in plain sight - a clear line from your eye (or the
  camera you are watching) to his head or chest, glass and railings see-
  through. Two sight checks a frame, round robin; a guard once seen stays
  drawn 0.6 s (no flicker). The hostages use it too. Cost in the hotel: about
  0.3-0.5 ms a frame (19 guards). Someone behind a ceiling is still not drawn.
- **The pilot speaks**: the reds' radio is heard now, not only read -
  `INTERCEPT` in voice.js, played through Control's queue (nobody talks over
  anybody; each subtitle goes up as its line plays). Six lines: Red One
  "they're inside, roof now", the pilot's "two minutes", NEW "thirty seconds,
  Red One!" (`hurry` event from CaptainRun at 90 s, not if he is aboard), NEW
  "Got you, Red One. Hang on." when he is in the door, "time's up", "Red One
  is down". Voices are synthetic - Piper with the LibriTTS voice (CC BY 4.0;
  speakers 800 Red One, 375 the pilot) - filtered with ffmpeg to sound like a
  radio (300-3200 Hz, drive, hiss, squelch bursts, a rotor throb on the
  pilot). Files `assets/voices/intercept_*.mp3`, credited in CREDITS.txt.
  To make more: `pip install piper-tts`; the voice is at
  github.com/rhasspy/piper/releases/download/v0.0.2/voice-en-us-libritts-high.tar.gz
  (Hugging Face is blocked from the sandbox; GitHub is not).
- **Optional objectives**: not yet - still both required. The switch is in the
  roadmap, waiting on Rhys's go-ahead.
- Tidy: the step line's countdown reads `HELI.wait`; two stray `.orig` files
  (from the M6.13.4 restore) removed from the source pack.

**Tests:** `hotel` +5 (a guard in plain sight a floor down is drawn, not
through a slab; seen then lost lingers then goes; in the hotel nobody is
drawn through a ceiling; a guard in the road is drawn from the roof edge; the
thirty-second call comes once, not when he is aboard), `voice` +2 (every
overheard line has file, speaker, subtitle and credit; they preload, queue in
turn, subtitle names the speaker). Each broken on purpose fails. 427 in all.
Checked in Chromium: all six MP3s load and decode; Red One then the pilot,
in turn, subtitled; no errors.

## M6.13.4 — the roof holds, the radio call, a gun that falls

Rhys on M6.13.3: awesome; the rooftop guards still gathered round the top of
the ladder; overhear a radio call when the captain runs ("chopper waiting: 2
minutes"); killed in the chopper, the captain's pistol hung in mid-air;
remember the branching storyline (missions completable with objectives
failed - it changes the future).
- **Why the roof gathered**: not the slam (M6.13.2) but the shouts - one red
  shouting on the third floor (`raiseAlarm`) brought four of the five roof
  sergeants (their reach is in plan, a floor apart only shortening it), and
  the stim was by the roof door below them: they came to the ladder's top.
  Now a guard who `holdFloor`s - the roof's, set in `hotelReds` - does not
  answer a shout from another floor; he fights whoever comes up.
- **The radio**: when the captain runs - "Red One (radio): Bird, Red One -
  they're inside. Roof, now!" then the pilot: "Copy, Red One. Two minutes -
  then I'm gone." (`overheard`); and when it leaves without him, or with him
  down. The step line counts the two minutes down ("helicopter leaves in
  1:47").
- **The pistol**: a dead guard's gun was dropped at his own height. Now it
  falls to the floor under it (`groundBelow`, guard.js); the captain killed
  in the helicopter's door keeps his - it goes with him.
- **Branching**: the switch is written up in the roadmap, waiting on Rhys.

**Tests:** `hotel` +2 (a third-floor shout brings no roof guard, a roof shout
does; a gun from the helicopter's door rests on the roof, one on the first
floor on the first floor). Both broken on purpose fail. 420 in all.

## M6.13.3 — the captain keeps for the helicopter; the helicopter's two minutes; the score on purpose

Rhys on M6.13.2: awesome; on the roof the captain ran back DOWN the ladder to
the third floor instead of towards the chopper - on the roof he should make
for it, and may stop to shoot at you on the way; about 90 s from the slam to
taking off; the chopper should get its order when he spots you and wait about
two minutes - not on the roof by then, it goes without him; taken out on the
roof, it can go at once; and he likes the score (which he never asked for).
- **Why he went back down**: a guard who has already run, hit again, switched
  to "search" (guard.js, the hurt reaction) - he hunted you, then went home
  to his post on the third floor. One who has run now keeps running (state
  stays 'flee'). And on the roof `CaptainRun` holds him: state forced to
  'flee', pinned at his post while signalling, moved by the run itself.
- **He shoots on the roof**: seeing you within 25 m while signalling or walking
  to the rope ladder, he stops for 2.5 s to fire (`g.fight`), then runs on;
  not again for 6 s (`HELI.shoot`, `shootRest`).
- **Timing**: signal 35 s, spool 22 s - 88 s from the slam to lift-off (about
  95 s from his first running).
- **The helicopter's two minutes** (`HELI.wait` = 120, `since` counts from his
  running): not aboard by then, it leaves without him and he is **stranded**
  on the roof - neither escaped nor stopped: still to be taken down (a hint,
  the step line). Taken down on the roof (`onRoof`): it leaves at once. Taken
  down before the roof (after he ran): it waits out its two minutes, then
  leaves empty (`waitOut`). The briefing says so.
- **The score**: `makeTarget`'s `score: opts.score || 10` turned the guards'
  and hostages' 0 into 10 (0 is falsy) - so each guard down was 10 points by
  accident, and a hostage would have been too. Now `?? 10`, guards are worth
  10 on purpose, hostages 0. A proper mission score is in the roadmap.

**Tests:** `hotel` +5 (88 s slam to lift-off; hurt on the roof he still
boards and stays fleeing - with a player there, so the hit registers; the two
minutes and stranded; down on the roof it goes at once, down earlier it waits;
the score). Each broken on purpose fails. 418 in all.

## M6.13.2 — a round safe dial, time to catch the captain, a quiet slam

Rhys on M6.13.1: pretty good; an actual circular safe dial please; when the
captain runs there is really not much time to catch him; following him up,
everyone on the roof knows you are coming; the "Intel missed" line is for
testing - remove it later; ideas: a bank with a vault, a shipyard/battleship
with blast doors C5 cannot breach, trackers/remote cameras, EMP devices
(roadmap).
- **The dial** (`drawSafeUi` / `drawDial`): a canvas - knurled steel rim, a
  brushed face with 0-9 and ticks, a knob, a red marker at the top; the face
  turns smoothly (the short way) to the number set.
- **The captain's run was 32 s** from his first step to lift-off - through his
  own locked door in 2.2 s. Now about 73 s: he fumbles 4 s with the key at the
  roof door (`fumble` on the escape's open step - a chance to catch him there),
  runs at `escapeSpeed` = an ordinary hurry (2.2 m/s, was 3.1), climbs the
  ladder at 0.9 m/s (`rate`), waits 20 s at his post waving the helicopter in
  (`HELI.signal`, a new 'signal' stage), walks 2.0 m/s to the rope ladder,
  climbs it at 0.7, and sits 15 s in the door (was 8). A hint the moment he
  runs ("fleeing" event); the step line says "captain: RUNNING".
- **The roof knew you were coming**: his slam at the roof door was a noise
  (0.5) his own men investigated - all five roof sergeants came to search it,
  which put them round the hatch you climb out of. The slam is now only heard
  by you.
- **"Intel missed"** shows only with "Show frame rate & position" on (noted
  in the roadmap to remove before release).
- **Housekeeping**: the working copy had been rolled back to M6.13.0 between
  sessions; it was restored from the M6.13.1 package and today's edits
  re-applied - check `const VERSION` before starting work.

**Tests:** `hotel` +1 (over a minute from first step to lift-off, at least
3.5 s of fumbling at the door; the stages now begin with "fleeing"); both
broken on purpose fail. 413 in all. Browser: the dial, set to 7.

## M6.13.1 — intel on the furniture, not at the doors

Rhys on M6.13.0: the papers lay at the foot of the doorways (put them on
desks); he found four of the eight; everything else works; "reds" and
"yellows" will need proper names later (placeholders for now).
- **Why they were on the floor**: `tableSpot` looked for any wooden top at
  table height in the room's zone - which caught stair steps (the ledger lay
  on the Balcony Suite's stairs), and the zones stop short of the walls the
  real desks and bedside tables stand against, so most rooms found nothing and
  fell back to the floor nearest the label (by the door).
- **Now** the real tabletops are recorded as the furniture is built
  (`surface(piece, kind)` -> `level.surfaces`: desks, bedside tables, the
  restaurant's tables, coffee tables, the bar, the kitchen counters, the
  penthouse dining table; the roof plant as `ledge`). `tableSpot` takes one in
  the room (zone + 0.7 m, nothing solid between it and the room's label at head
  height), a desk first, then bedside, table, bar/counter, and lays the thing
  on a clear part of it (a fine grid, clear of the lamp; either way round).
  The guest rooms' bedside lamps moved to the back corner to leave room. The
  flight plan moved from the roof (no table, and the helicopter's label is past
  the parapet) to the **penthouse dining table**. Supplies use the same finder
  (Room 104's C5 now on its desk, the registration card on a bedside table).
- **Debrief**: under "Intel found", the rooms of the ones you missed.

**Tests:** `hotel`: every paper on a recorded tabletop (not under 0.35 m),
inside its edges; both supply cases on tables; the supplies test allows the
zone's 0.7 m. Offering no tabletops fails both. 412 in all. Browser: the
papers on Room 203's desk and Room 104's bedside table under night vision.

## M6.13.0 — Stop the Captain, intel in the rooms, one-way doors and slipping through, sticky C5

Rhys on M6.12.3: aiming much better; crouched, the peek-up still threw the
shot; "kissing cars", and every police car was number 14; the camera glitches
are very discreet (a hint toggle?); open-through-close in one move as an
option; doors IRL open one way; a hostage counted rescued from the SEWER under
the police zone; lore in the rooms; placing a C5 on a red killed him; a
hostage shoved off the embankment stood on the river; then: Stop the Captain.
- **Peeking**: aiming crouched lifts your eyes 0.54 m over half a second; the
  camera follows a moment behind (`followEye`), and the round started at the
  eyes' new height - above what the crosshair showed. Rounds now start where
  you see from (`shotOrigin`, `S.viewEye`, set where the camera is placed).
- **Cars**: `POLICE_CARS` places them by hand - two along the road, two on
  the hotel's kerb clear of both front doors; each its own roof number (14,
  22, 31, 47; `MATS.roofFor`).
- **Glitch hints**: Settings - "Camera glitch hints": a yellow ring round
  the spot each clue camera's number shows (`glitchSpot`, `#cctv-hint`). Off by default.
- **Doors**: hotel doors hang one way (`def.swingTo`): into the smaller of the
  two spaces they join (a bedroom off the corridor), in from the street.
  Pulling one towards you, you step back out of its swing (`stepClear`, at
  most 1.1 m). **Hold E** after opening: you walk on through in line with the
  opening and pull it (and its pair) shut behind you (`DoorMove`, `slipPath`;
  0.3 s hold; crouched or prone, slower). A tap still only opens. Other
  levels' doors are unchanged (no `swingTo`: they swing away from you).
  Hostages shoulder a stuck one-way door the way it hangs.
- **The sewer rescue**: the police zone (and the jeep's) is in plan AND at
  street level now (`inStreetZone`): -3.6 m under it does not count.
- **Shoves**: nobody is pushed into water or off a ledge (`standable`: floor
  under the feet, not in a water column) - guards included.
- **C5 on a person**: placing a charge is a look, not a blow (`probing` in
  `trace`: no damage, no setting off a charge nearby); on a person it sticks
  (`p.stuck`, `p.offset`) and rides on him; the blast is what kills.
- **Intel** (`hotel_intel.js`, placed by `tableSpot` - the supplies' table
  finder, now shared, matching zones by floor): eight papers - the kitchen's
  delivery note, a bar tab, the manager's memo (Estate Room), a registration
  card (Room 104 - on the floor: the table has the C5), the reds' standing
  orders (203), a reporter's notebook page (205), the ledger (the Balcony
  Suite), a flight plan by the helicopter. E reads one (a paper panel; E or a
  step away puts it down); the debrief counts them. They seed Rhys's later
  plans: the captain's deputy **Lieutenant Varga**, the three guests (an
  engineer **Dr Imogen Hale**, a reporter **T. Ashdown**, the bookkeeper **E.
  Pellow** - placeholders, and not yet tied to Hostages 1-3), a university
  biosciences lab's "restricted floor", the yellows, the 23:30 flight. And a
  second way into the safe: the letterhead's "EST. 1962" + the memo's "the
  year we opened".
- **Stop the Captain** (`src/sim/people/captain.js`, `CaptainRun`): after his
  escape (door, ladder, P13A) he walks to the rope ladder, climbs it (1.1
  m/s), sits in the open door while the rotors wind up (8 s - the last
  chance), then the helicopter lifts and flies north. Dead or knocked out
  before it lifts: **stopped** (shot on the ladder he falls to the roof; shot
  in the door he goes with it; either way it leaves empty after 4 s). Lifted
  with him: **escaped** - for now a mission failure ("The captain escaped by
  helicopter"), as both objectives are essential. **At 23:30** on the mission
  clock he goes anyway (his orders). Success now needs the hostages safe AND
  the captain stopped, then the jeep. Hints at each stage; the step line says
  where he is; the debrief ticks it (killed / knocked out / got away). He is
  drawn from the roof while on the ladder or in the door (`alwaysShow`).
  The briefing has an Objectives paragraph and an Intel one.

**Tests:** `weapons` +2 (the peeking origin; a C5 sticks, unhurt, follows,
the blast kills), `hotel` +11 (no kissing cars, none across the front doors,
four roof numbers; glitch spots; sewer not rescued; no shove into the river;
one-way from both sides, front doors in; hold-E slip, tap only opens; step
back when pulling; intel placed, the 1962 clue; the captain escapes / shot on
the ladder / shot in the door / leaves at 23:30). All twelve fixes broken on
purpose fail. 412 in all. Browser: cars spaced, the intel panel, the hint
ring on the CCTV, no page errors.

## M6.12.3 — drawn vehicles (police estates, the Ghost jeep), aiming, door gaps, hostages at the edges

Rhys on M6.12.1 and M6.12.2 (two zips of screenshots): draw better vehicles;
a "Bulletproof Jeep" rather than a mini-tank APC; going from hip-fire to aim,
the crosshair "jumps up just enough to now miss"; you can see straight through
the gaps round and between shut doors; hostages still stop at "invisible
lines"; out of the lift they stand in its doorway, so you cannot get back in,
and in the car you cannot speak to them or shove them; the captain was killed
before his ladder (fine); M6.12.2: the bars right, **he left the lift**.
- **Vehicles, drawn in code** (`vehicle_models.js`): a new `profile()` builder
  - a side profile (bumper, bonnet, waist, boot) with the wheel arches cut
  round out of its underside, pushed out to the width, shoulders bevelled;
  the cabin the same in glass with its sides leaning in, then roof, pillars and
  frames laid over it. **`policeCar`**: a British police estate, 4.65 x 1.8 m,
  white, Battenberg check down the doors and a stripe on the rear quarter, alloy
  wheels, black bumpers, lamps, plates, a roof number; the light bar is the
  runtime's, across the front of the roof at 1.5 m. **`armouredJeep`** (paint
  `ghost`): 4.7 m (5.2 with bull bar and spare), upright windscreen split by a
  steel bar, small windows in thick frames, black arch flares, bull bar and
  winch, snorkel, steps, roof rack, aerials. The Kenney prop is no longer
  placed (`assets/vehicles/police.glb` can stay or go); the APC model stays in
  the file, unused. `VEHICLE_SIZE` gives the solids; the cabin has its own box.
  Text says "the Ghost jeep" now (hints, step line, trophy, briefing).
- **Aiming**: aimed, the gun sat 22 degrees below the crosshair, so the eye
  went to the sights and the round went higher. `weapons_view.js`: each
  model's top edge is measured (`sightTop`); aimed, a gun is centred with its
  top just under the crosshair, straight down the line of sight, its back end
  24 cm from the eye (`adsPlace`). A scoped weapon (zoom) keeps its old place.
- **Door gaps**: the drawn leaf now reaches the frame - into the jamb, to the
  middle of a pair (with a strip over the join on one leaf), up to the lintel
  (`def.seal` in the hotel; render.js). The solid keeps its clearance.
- **Invisible lines**: the street-level nav grid stopped at x 4.5 and z -2;
  leading a hostage down the pavement beside the hotel, he went to the last
  spot where you were inside the grid and stood there (Rhys's 16.27 shot: you
  at x -0.2). `GROUND_NAV` now covers all of the outside: the road from x -20
  to 56, the far pavement, both side pavements to the river.
- **A* quicker** (`nav.js find`): flat typed arrays reused between searches
  (a generation stamp), links indexed by cell - the same routes, 2.5 times
  quicker (a third floor to the street: 35 ms to 13 ms here).
- **The lift doorway**: out of the car he stopped on the threshold - no
  longer "in the car", within 2.2 m of you, so idle. Now he never idles on the
  landing in front of the doors or in the doorway (`liftApron`, `clearOfLift`):
  he steps aside, to whichever side is nearer you and open floor. In a car
  standing at a floor, **E speaks to him** unless you are looking at a button,
  and **shoving works** - within the car's walls, in and out only through its
  open doorway (`carOk`); a moving car still shoves nobody.
- The captain: still "coming" (his helicopter is next on Rhys's list).

**Tests:** `hotel` +4 (down the west pavement and the far pavement, he
follows; out of the lift he is not in its doorway; the vehicles' sizes, the
street's cars and jeep, bars on roofs, the jeep solid; every hotel door drawn
to its frame, one strip per pair), `weapons` +1 (aimed sights on the
crosshair; scoped unchanged). Each broken on purpose fails. 399 in all.
Browser: the cars, the jeep, hip and aimed views, the double door under night
vision (no seams), no page errors.

## M6.12.2 — hostages that move, the lift again, cars to scale, the pouch

Rhys on M6.12.1: cursor oddities and a Chromebook blackout (not the game, as
far as can be told); cars looked like toys and the light bars were sideways;
he jumped when he spotted a guard; in the lift he was shoved through a wall,
and the hostage still would not get out; the ladder worked; **one hostage
turned to face him but would not move** - he had to kill him to end the
mission. He also sent a preliminary **beachhead battle map**
(`maps/Frontline_Map_Beachhead_Prelim.xlsx`; summarised in the roadmap).
- **A hostage that would not move**: the likeliest cause, a door that would
  not swing for him (he stood in its way) - he stopped at it every step,
  turning to face you. Now, after 1.2 s, he shoulders it open (`doorStuck`);
  locked doors still stop him. And `planTo`: a route from where he stands, or
  from the nearest open spot, or - you close by on his floor - straight to you.
- **The lift**: he makes for the car's corner furthest from you and never
  walks into you while you are both in it (the car is 1.2 x 1.3 m); getting
  out, nothing stops him (the "not into you" rule only applies inside). The
  lift test now has you step to the back of the car.
- **Cars**: Kenney's police car stretched to a real saloon (`props.js`
  `size: [w, h, l]`: 1.8 x 1.5 x 4.3 m); the light bars now run **across** the
  roof (they lay along it), sit on the model's own bar, and are bigger.
- **The pouch tops up the guns you carry** (every half second, as far as they
  hold) - Rhys's gear screenshots showed a K7 at 251 with 188 rifle rounds in
  the pouch.

**Tests:** `hotel` +2 (a hostage on the bed still comes to you; a door that
will not swing - he shoulders it, a locked one still stops him; the door rule
broken on purpose fails). 394 in all. Browser: the new cars on screen, bars
across, no page errors.

## M6.12.1 — four trophies at the hotel, not seven

Rhys: likes the trophies, but seven is a lot for one mission (five for
Meridian House is pushing it). The hotel keeps **Sharpshooter: Riverside,
Swift Extraction, Pacifist, Not a Scratch**; Going Down, Down the Drain and
Clean Sweep are retired (their tracking stays: `rodeLift`, `wentSewer`).
Meridian House: proposed dropping No Witnesses (to four) - awaiting Rhys.
Rhys also sent Edge Hill University's campus map (the sports building is
"19", the curved one) and asked whether the whole campus could be a map -
advised: a fictionalised campus based on its layout, not the real one by name.
Uploading folders to GitHub one by one was a chore: advised dragging the
`assets` folder itself onto the upload page (Chrome keeps the folders).
**Tests:** the trophy test now checks the four, and that the retired three
are not awarded. 392 in all.

## M6.12.0 — police cars (Kenney), a Ghost APC, light bars, trophies, hostage fixes

Rhys on M6.11.1 (uploaded Kenney's Car Kit, Prototype Kit and Racing Kit;
asked for an APC built in code; blues on the police cars; hotel trophies).
- **Police cars**: Kenney Car Kit `police.glb` + `Textures/colormap.png` in
  `assets/vehicles/` (CC0; `assets/vehicles/CREDITS.txt`, the kit's licence),
  placed by `props.js` (scaled to 4.0 m), along the road at the map's V pairs,
  each with a solid box. **Light bars** of our own on their roofs: two lamps,
  a double flash each, in turn, cars out of step - blues, as in Britain
  (`level.lightbars`, drawn and flashed in the runtime; glow only, no real
  light). The Kenney model's own bar is red and blue underneath ours.
- **The Ghost APC**, built in code (`vehicle_models.js` 'apc', paint 'ghost'):
  eight wheels behind armoured skirts, raked glacis, vision blocks, a turret
  with a cannon and smoke dischargers, a rear ramp; parked across the road west
  of the start (solid boxes; `apcZone` for the end).
- **Ladders, every one** a nav link where its foot and top are on known floors
  (Rhys went down the balcony ladder and the hostage went for the stairs): the
  roof hatch, the manhole, and the balcony ladder to the garden.
- **The lift**: in the car the hostage is not spoken to (the floor buttons
  have E); a following hostage left in the car when you get out **holds the
  doors** and comes out after you (he stayed put once they shut); nobody in
  the car is shoved (one was shoved through its wall).
- **Trophies for the hotel** (`hotelTrophies`, ids `hotel_*`): Sharpshooter:
  Riverside (every kill a headshot), Swift Extraction (under ten minutes,
  `HOTEL_PAR`), Pacifist (no casualties - takedowns only), Not a Scratch (all
  hostages out unhurt), Going Down (a hostage down in the lift), Down the Drain
  (a hostage out through the sewer), Clean Sweep (every red killed or taken
  down). No "Unseen" here (Rhys: you have to be seen).
- Roadmap: map ideas (beachhead, sewers map, his university's sports
  building); the locked rooms question.

**Tests:** `hotel` +1 (the trophies, one by one); the lift test now waits
until the doors have shut before you leave (broken on purpose: fails without
the hold). 392 in all. Browser: police cars and APC seen on screen, the cars'
model loads (4 props), no page errors or failed requests.
**Upload: `assets/vehicles/` (new folder: police.glb, Textures/colormap.png,
CREDITS.txt, KENNEY_CAR_KIT_LICENSE.txt).**

## M6.11.1 — hostages: lift, sewer, ladders, doors, shoving; out by the APC

Rhys on M6.11.0 (mission completed: 3 of 3 hostages). Notes and what was done:
1. Vehicles fine as placeholders; want proper ones (asked which packs).
2. Hostages looked like him (one model): now a pale civilian tint.
3. **A range target stood where each hostage was, and fell like one**:
   `weapons_view.buildTargets` drew every world target as a cut-out board
   unless it was a guard's; hostages are skipped now. The radar showed them as
   enemies: now allies (and forgotten once rescued or dead).
4. **Ammo cap**: a gun holds 1.5 x its standard reserve (K7: 270 + 30 in the
   magazine = 300). Rounds taken from a dropped gun that do not fit now go in
   the **pouch** (up to what it holds) instead of vanishing; "Full" if neither
   has room.
5. **The lift** (`Hostage.liftStep`, `holdLiftFor`): you in the car at his
   floor - he walks to the doors (by his route) and in (straight), stepping
   well clear of the doors; a boarding hostage **holds the doors** (and the
   lift does not leave) until he is in; in it with you he rides (main.js moves
   hostages in the car with it, and counts them for the doors' safety edge);
   you step out - he follows you out. (A doorway dither fixed: past the outside
   point, in line with the doorway, he goes on in.)
6. **Finding the stairs**: when you are where a route cannot start or end (a
   ladder, part-way up a flight, the car), he heads for where you **last stood
   on open floor** (`lastYou`).
7. Hostage 2 was in the bed in Room 206 (Rhys said #3): hostages are nudged to
   clear floor like the guards.
8. **Ladders and the sewer**: nav floors for the basement/sewer walkway and
   the cellar stairs' landing; links down the cellar stairs (dog-leg), **up the
   manhole ladder** and the roof ladder (`ladder: true`); a hostage on a steep
   link climbs in the ladder pose.
9. **Doors**: a following hostage opens an unlocked shut door he comes to
   (`blockedByDoor`); locked ones stop him (his route avoids them).
10. **Shoving** (`shove` in hostage.js, run in the runtime): freed hostages and
    guards push apart where they overlap; you push whoever is in front of where
    you are going (harder sprinting), never into a wall; **a guard shoved knows
    you are there**. `player.intent` = the way your keys take you.
11. **Not over at the street**: all hostages safe -> "Get back to the Ghost
    APC"; the mission ends when you reach it (`level.apcZone`; on the radar).

**Tests:** `hotel` +3 (riding the lift up with a hostage and out; the way
down the cellar stairs into the sewer and up the manhole; shoving). Broken on
purpose: lift boarding, shove's wall check. 391 in all. Browser: no boards
where hostages are, freed hostage HUD line, no page errors.

## M6.11.0 — the hostages (the first completable objective); crate boxes keep their counts

Rhys on M6.10.4: (1) fixing the utilities brought back the infinite-items
trick (swap a box out, swap it back in - full again); (2) the supply cases sat
on the floor in doorways - put them on a desk, by a bed; (3) hostages, so
there is at least one completable objective; (4) remember the Ghost APC and
the police cars.
1. **Boxes keep their counts in crates** (`Crate.takeCount`, `Crate.leave`):
   a box you leave in a crate keeps what was left in it (part-used boxes are
   remembered per item); taking one hands over a full box while there is one,
   then the part-used ones. Used both for swaps and for restocking the same
   item (main.js crate screen). Test: two full boxes and a spent one come out
   as 2, 2, 0. *(The crate screen does not yet show which boxes are part-used.)*
2. **Supply cases on the bedside tables**: the smallest wooden top at table
   height in the room with nothing on it (Room 104 and Room 201 - bedside
   tables); a smaller case.
3. **Hostages** (`src/sim/people/hostage.js`, pure; `hotelHostages`): Hostage 1
   (floor 1, behind the reinforced door P4 watches), 2 (floor 2, Room 206), 3
   (floor 3, with P12) - from the map's labels. Bound and seated; **hold E** to
   cut one loose (1.4 s); he **follows** (2.2 m back, hurrying past 6 m), by
   the nav grid - the lobby stairs and now the **suite stairs** (floor 2-3: a
   landing nav floor and two links); **E** tells him to wait / come on; he is
   a shootable target - **a hostage killed ends the mission** ("A hostage was
   killed"). Bring him into the **police zone** (the street by the police cars)
   and he is safe. **All three safe: mission successful** (the captain
   objective still "coming"; Level 0's trophies are not shown at the hotel).
   HUD line: "Hostages safe: n of 3 - k with you". Debrief: the objective
   ticked and "Hostages rescued n of 3".
   - Nav: the ground floor reaches out of the front doors to the street
     (z from -2). A hostage never re-plans or stops part-way up a flight (off
     the floors a fresh plan has nowhere to start - he froze on the suite stairs
     and then the lobby stairs until fixed).
4. **The street**: blocky stand-ins where the map's V squares are - four
   police cars (white body, dark cabin, a light bar) and the Ghost APC (west of
   the start). Solid: cover. `POLICE_ZONE` round the police cars.

**Tests:** `weapons` +1 (crate counts), `hotel` +3 (three hostages; Hostage 3
freed and following you from the third floor to the police cars, rescued;
wait / follow / shot dead) plus supplies on tables. Broken on purpose: the
crate rule and the no-re-plan-on-a-stair rule fail their tests. 388 in all.
Browser: a hostage freed by a held E, "Tell him to wait" prompt, HUD line,
following; no page errors. **Not yet seen on screen: the street vehicles**
(the sandbox screenshot timed out) **and a full escort out in the game.**

## M6.10.4 — C5 that kept going back to 0

Rhys on M6.10.3: restocking C5 with C5 and flashbangs carried together, his
C5 went back to 0 despite just having 2. His Your Gear screenshots showed it:
C5 in both utility slots (2 and 2), then flashbangs in utility 1 - and the C5
in utility 2 read 0.
- **Cause:** a second copy of an item is keyed `C5@utility2` while the first
  is in utility 1. Take the first out and the second's key becomes plain `C5`
  - which picked up the **spent first copy's** count (0), while its own (2)
  was dropped. **Fix:** `Arsenal.reset` now moves each slot's ammunition with
  the slot (`slotAmmo`, `noteSlots`), whatever its key becomes.
- **Restocking**: taking the same item into a slot that already holds it (a
  box of C5 into the C5 slot) used to be a like-for-like swap - handing you
  back your own empty box. Now `Arsenal.restock(slot)` adds the box's count
  and the crate gives up one box.
- Roadmap: Rhys's **lure** utility idea (draws enemies to it; pairs with
  proximity mines).

**Tests:** `weapons` +1 (Rhys's swap, then a restock; the slot-follows rule
broken on purpose fails it). 384 in all.

## M6.10.3 — the pouch, supplies in 104 and 201, goggles in third person

Rhys on M6.10.2 (two playthroughs): pretty good; torch light still edges out
of buildings a little (no longer bothered); pickups work; the captain died to
his first shot once, and the second time **ran off through the roof door**
(the escape works).
- **The pouch** (Rhys: swapping carbine - marksman - carbine lost his gathered
  ammunition). `Arsenal.stow(key)`: putting a gun down (a swap from a dropped
  gun or a crate) sends its loose rounds to the pouch by kind (capped as
  before); the magazine stays with the gun, so a gun you leave lies with what
  was in it. A dropped gun you take comes with **what it had**, not a fresh
  load, then the pouch tops it up (the pouch is restored after `reset`, which
  had already drained it into a fresh load). **Your gear** shows the pouch.
- **Supplies** (`hotelSupplies`, `SUPPLIES`): Room 104 - a case of **two C5
  charges**; Room 201 - a **Trauma Kit** (`MEDKIT_FULL`: one use, heals 100,
  0.3 s - an instant full restore), a glowing case. Placed on clear floor
  nearest the room's name on the map; opened like any crate.
- **Your goggles in third person**: `Operative.setGoggles`, worn when the gear
  slot holds night vision; a strap round the back of the head so they read from
  behind (seen in a sandbox screenshot).

**Tests:** `weapons` +1 (stow, the pouch through a carbine-marksman-carbine
swap, the trauma kit), `hotel` +1 (the two supply cases, in their rooms) - both
broken on purpose and seen to fail. 383 in all. Browser: no page errors.

## M6.10.2 — torch pools, hats on heads, weapons to pick up, the captain's door

Rhys on M6.10.1 (27 screenshots; out till 3 pm - "take as long as you need"):
1. Briefing far too long - later (Rhys).
2/7. **Torch beams still through walls; their glare hid the scene and the
   man.** The cone was wider than the one ray that clipped it (its sides went
   through walls and floors), its cap read as a solid white disc, and on his
   GPU it bloomed. **No cone now**: the beam is a soft pool of light (a radial
   texture, additive) laid flat on the first surface it hits (face from the
   hit point against the box's sides), sized by distance; the lens is a small
   dim glow, a little bigger when you look into it - never a bloom.
3. **Hats floating, off-centre**: placed 0.2 m straight up from the head
   bone, ignoring its tilt. Now along the bone's own up axis (found once,
   standing), 0.15 m (`HAT_UP`), rotated to face where he faces. Seen sitting
   on the head in a sandbox screenshot.
4/5. Goggles seen; cowards cowardly - good.
6. **The captain's door** (Rhys): P13 now has a planned way out (`escape`,
   `escapeStep` in guard.js; `level.captainEscape`): to the suite side of the
   reinforced roof door, **unlock and open it, through, slam and lock it**
   (a 'slam' event: heard, and a door sound), to the ladder, **climb** (1.3 m/s,
   ladder pose), out over the hatch, and across the roof to P13 A, where he
   cowers. Never through a locked door; locked when you get there (roof key or
   a charge). Test: simulated in the real hotel, with checks that he never
   crosses the door's line while it is locked and shut.
8. **Goggles vanished from corpses**: they were part of the hat, which is
   knocked off as a man falls. Now their own piece, staying on his head.
9. **Weapons dropped, universally** (Level 0 too): a downed man's gun lies
   beside him (what was left in his magazine plus one more). E: its rounds if
   you carry the same weapon; otherwise a swap into the slot in your hands (or
   the first that fits) - yours is left lying there. Taken weapons are noted
   (`m.taken`) for the Ghost HQ unlocks later. The shotgun drops a K7 (no
   shotgun item or model yet).
- The debrief said "Level 0 - Training Mission" at the hotel: fixed.

**Tests:** `hotel` +1 (the captain's escape; broken twice on purpose -
not opening, not locking - and seen to fail). 381 in all. Browser: P5's drop
taken (ammo), hat on P1's head, no page errors. **Not seen yet: the torch
pools on Rhys's GPU.**

## M6.10.1 — first playtest of the reds: lag, torches, cowards, prompts

Rhys on M6.10.0 (40 screenshots):
1. Windows bulletproof - fine (no spec). Left.
2. **Guards blinked out on the cameras** partway round: bodies were culled by
   *your* position (other floor / > 42 m). Now by the viewer: the camera's
   position while you watch one (mission_runtime `draw`).
3/6. **Torches were floating balls; their light went through walls and
   floors.** The real spot lights are gone (unshadowed, and the likely cause
   of 9). A torch is now a small body + lit lens **on the gun** - placed from
   the carried gun's own transform, along whichever of its axes points most
   the way he faces - with its beam a faint additive cone, **clipped by a
   raycast** at the first wall. Points at you when he has you - and then the
   cone is hidden and his lens flares instead (looking down a beam, the cone
   wrapped the camera and washed the screen out, white on night vision: seen
   in a sandbox screenshot, fixed before release).
4. **No goggles seen**: they sat inside the head. Bigger, further forward,
   lenses with a green glow (character.js, `#2aff5a` = emissive).
5. **Cowards did not run**: the flee spot was chosen from all open cells on
   the floor, often somewhere unreachable - the path failed and he "arrived"
   where he stood. Now `nav.reachableFar` floods out from him and takes the
   furthest reachable spot from you. **P13 runs at the first sign of
   trouble** (notes: "first sign") - `fleeOn: 'alert'`; P9 when hurt.
7. **Prompts**: "E Open the door" on locked/reinforced doors - the hotel now
   has a mission runtime, and `!missionRt` had switched the locked-door prompt
   off; and the plain door prompt never asked whether a door was locked. Fixed
   both (`lockedFor`). Reinforced now reads "Reinforced and locked - it takes
   a key, or a breaching charge". Lift buttons: aim tolerance 0.45 -> 0.62 rad.
8. **Lift stop**: as Rhys suggested - **the lift starts stopped** (out of
   service); reset it at the stop button in the machine room to use it (a way
   to bring hostages down later). Landing prompt says where the reset is.
9. **11 fps with two guards**: the spot lights (3, lighting the huge baked
   meshes) are gone; and `World.raycast` now rejects by the ray's bounding box
   first and calls the skip test only on hits - 3x cheaper (306 -> 101 us for
   a 30 m ray among ~3900 solids); 19 guards' thinking 0.98 -> 0.42 ms a frame
   in Node.
10. **Railing gaps bulletproof**: a railing's invisible stop is now
   `shootThrough` - it holds you, not a bullet or a guard's look.
11. P13 shot on floor 3 "came back on the roof": not so - P13A is not in yet;
   the roof has P14-P18 (sergeants). Told Rhys.

**Tests:** `hotel` +3 (the lift starts stopped; a hurt coward reaches a far
spot in the real hotel; railings let shots through), the lift tests reset the
stop first. 380 in all. Browser: loads, no page errors. **Not yet confirmed in
a screenshot: torches on the guns, goggles, beams clipped** - Rhys's playtest.

## M6.10.0 — the hotel's reds (Rhys's Guards tab)

Rhys on M6.9.28: the sewer is lit (baked light 520 ms, 49 fps). On to the guards.

- **The Guards tab** now comes through `tools/map_to_json.py` into
  `riverside.json` (`guards`: id, floor, post, patrol, rank, weapon, temper,
  notes). A post typed "17, 10" arrives from Sheets as a date: day = x,
  month = y. Posts come from the map's P squares where there is one (P10 had
  none in the tab).
- **`src/sim/people/hotel_guards.js`** (pure): `routeCells`, `mapPosts`,
  `orderRoute` (a ring walked clockwise/anticlockwise from the post - the
  shoelace sign on the sheet; a line walked to its end and back; every post on
  a shared route fills its gap, so P7 and P8 start across one ring),
  `corners`, `nightKit`, `hotelGuards`. **19 men** on G, 1, 2, 3 and the roof.
  P13A (the roof) is P13 later - his escape (coming).
- **New in the brain** (guard.js): `ARMS.shotgun` (one heavy round, short
  reach; carries the carbine's model for now), `RANKS.specialist` (an olive
  tactical cap), `TEMPER.cowardly` (answers only what is close; **runs the first
  time he is hurt** - to the far end of his round or the floor, then cowers,
  firing only if you come within 6 m; `flee`, `state 'flee'`, `nav.farFrom`).
- **In the dark** (`level.dark`, `DARK`): officers and specialists wear
  **night vision** (see as by day; a flashbang through them is 1.6 x worse);
  the rest carry a **torch** (they see only down the beam, ~24 degrees either
  side, to 22 m) - and anyone sees anything within 4 m. Torches are drawn as a
  glow ahead of the man at chest height, with **real spot beams for the 3
  nearest** (frame cost); goggles on the head of those who wear them.
- **Placing them** (`hotelReds`): nudged off furniture; facing: the next point
  of their round, the nearest door ("watches the door" - P4), the nearest pane
  ("window" - P5, P11), else the longest view from the post.
- **Nav** (`level.navFloors`, `navLinks`): G, 1, 2, 3, R plus the lobby
  stairs' half landings; links along the flights (landing ends 0.25 m inside
  the landing - the east flight's first tread is not landing). The suite stairs
  (2-3) and the roof ladder are not linked yet. NavGrid.build now buckets
  solids (4 m): 132 ms for the hotel.
- **The runtime**: `mission_runtime.js` takes the hotel too (`L0` =
  Level 0): bodies, guns, shots, takedowns, barks, detection arcs, hints
  'radar' and 'noticed'. The hotel's doors, keys, safe, cameras stay in
  main.js (the runtime's `interact`/`kick`/`onBlast` step aside; main kicks
  and blasts as before). Death: the debrief (objectives "coming").
- Briefing updated.

**Tests:** `hotel` +7 (19 men, floors, details, nobody inside furniture;
rounds: R2 clockwise, R3 anticlockwise, P7/P8 opposite, R6 there and back,
every leg a clear straight walk; route order (pure); night kit; paths between
floors; torch/NVG/none sight; flash through NVG; a coward runs, a bold man
does not; shotgun figures). Each broken on purpose and seen to fail. One walk
test now ignores people (a guard on his round is not a wall). 377 in all.
Browser: the hotel loads with 19 guards, no page errors. **Not yet seen in a
screenshot: the guards' bodies, torch glows and beams in place** - Rhys's
playtest is the first look.

## M6.9.28 — the baked lamps: the real cause, fixed (bake after the first frames)

Rhys ran `bakecheck.html` on his Chromebook (Intel UHD 600, ANGLE/Mesa):
**every variant works, 99%** - the engine bakes a lamp fine on his GPU. So the
fault was in our game, not his machine. Rechecking his exact spot (sewer,
x 22 z 41, looking south) in the sandbox: **dark there too** - the sandbox
views in M6.9.26 happened to be in a part of the sewer that baked right.

**Found by reading the baked lightmap texels** (a probe in the page: find the
nearest wall vertex, read its uv1, read that texel back from the lightmap):
- At start-up: the west wall by each west lamp lit (~250,200,130); the east
  wall by the south-east lamp **exactly 0**, by the middle one about a third.
- Not the shadows (`lampshadow=0`: identical), not clustered lighting
  (`cl=0`: identical), not the bounce fills (`fill=none` at boot: identical),
  not the inside-out east lamp fittings (fixed anyway - min before max).
- **Re-baking after the game was running** - with or without fills, shadowed
  or not, all lights or only the sewer's, per chunk or all at once - lit every
  wall, every time (and took ~0.2 s, not 12-27 s).
- **Baking twice at boot: still broken. Baking 3 frames in: right.**

So: **baked before the engine has drawn a frame, the bake silently leaves
lamps out** (which ones depends on where they are; the engine's lighting
state is not set up until it renders). This has likely affected every baked
level since baking began - the hotel's dark rooms at night (M6.9.18) look like
the same thing.

**Fix:** main.js bakes on the 3rd `frameend` (`bakeWhen`, `BAKE_AFTER_FRAMES`
in bake.js - pure, tested). `?bakemode=boot` gives the old way, to compare.
`FL.bakedLight` is now a getter (it is set late). Checked: the hotel bakes and
Rhys's spot is lit with live lamps switched off (baked light only); Meridian
House and Yard 7 bake with no page errors.

**Watch for:** Meridian House and the course's underground may now look
brighter/different - earlier tuning (bounce fill strength etc.) was done
against the broken bake. Rhys asked to say if anything is too bright.

Kept as comparison switches: `?lamps=live` (lamps not baked, lighting the
baked level live), `?cl=0`, `?lampshadow=0`, `?lampnob=0`, `?lmhdr=1`,
`?bakemode=boot`. `bakecheck.html` stays in the build (unchanged).

**Tests:** `light` +1 (the bake waits for frames; broken on purpose, fails).
`browser.test.py` gains "every sewer wall by a lamp is lit in the lightmap"
(reads the texels) - **not yet run as part of the full suite**. 370 Node tests.

## M6.9.27 — the Chromebook's lighting: narrowed to the bake itself

Rhys ran the four comparison addresses at one spot (sewer, x 22 z 41, looking
south), M6.9.26 - no other notes:

| address | result | baked light |
|---|---|---|
| `?level=1` | dark | 914-961 ms |
| `&lampshadow=0` | **still dark** | 667 ms |
| `&lmhdr=1` | **still dark** | 1302 ms |
| `&live` | **bright**: lit brick, lit walkway | - |

So on his Chromebook **the bake leaves the lamps out**, whatever the shadows
and whatever the lightmap's precision; the same lamps lighting live work. A
tell in his baked shots: the ceiling over the south end *is* lamp-lit - that
strip of the slab (x > 14.8, z 40.5-45) is centred outside `bakeRegion`, so it
is a live mesh. Live surfaces get the lamps; baked ones do not. In the sandbox
(software rendering) the same build bakes them fine - it is this GPU's path
through the engine's lightmapper.

Added, to settle it and to have the fix ready:
- **`bakecheck.html`** (+ `bakecheck.js`, built from
  `tools/bake_check/check.js`): a standalone page. One floor with a lamp baked
  into it, one with the same lamp live; it reads their brightness and says
  **BAKED LAMP WORKS / FAILS**, with links for no shadows / no filter / HDR, and
  the GPU's name and capabilities. Sandbox: works, 99%, all variants. On Rhys's
  Chromebook: if it **fails**, the engine's lightmapper cannot bake point
  lights on that GPU (an engine/driver matter - work round it); if it
  **works**, something in our scene (chunk sizes, the atlas, many lights)
  trips it - narrow it there.
- **`?lamps=live`**: the lamps are not baked; they light the baked level live
  (`affectLightmapped`), the sun/moon and everything else stays baked. In the
  sandbox it looks right and bakes quicker (6.6 s vs 22 s). This is the likely
  fallback: if the check fails on his machine, detect it (run the same probe
  bake at boot) and switch to this automatically. Cost: lamps light live
  (budget of 8 nearest, no shadows - they light through walls).
- Version M6.9.27. No test change (369); the page itself is the test, and must
  be run on the Chromebook.

## M6.9.26 — ladders you can walk away from; the baked-lamp darkness, dug into

Rhys on M6.9.25 (the hotel's specifics good so far):

1. **"Dig into the lighting issue anyway."** What was found:
   - **A controlled test** (`tools/bake_check/`: one floor lit by a baked
     omni lamp, one by the same lamp live, brightness read off the screen):
     with no shadows, baked and live match to the pixel. With the lamp's bake
     shadows on (our setting), the baked floor fell to ~60% from about 3 m
     out - **shadow acne**: surfaces met at a slant shadow themselves. A
     **normal offset** (0.05) on the shadow cures it, and real shadows still
     fall (a low wall still blacks out the floor behind it). Now applied to
     every baked lamp (`BAKE.lampShadowBias`, `BAKE.lampNormalOffset`;
     `light` test guards it). Walls beside a lamp suffer most - which is why
     rooms looked dark even with lamps in them.
   - **But in the game, in the sandbox, the sewer bakes bright either way** -
     with the offset, without it (`?lampnob=0`), even unshadowed
     (`?lampshadow=0`): pixel-identical screenshots, walls and floor well lit.
     Rhys's Chromebook shows the same spot dark. So the rest of the problem is
     **specific to his GPU**, not the level or the code path. Diagnostic flags
     for him to compare at one spot (sewer, x 22 z 41 looking south, no night
     vision): `?level=1` / `&lampshadow=0` (no shadows in the bake) /
     `&lmhdr=1` (floating-point lightmap instead of RGBM) / `&live` (no bake).
     Whichever is bright names the culprit: shadows in the bake on that GPU;
     lightmap precision; or the lightmapper itself.
   - **The north end of the sewer is lit through the ground** by the street
     lamps' bounce fills (`bounceFill`: soft, unshadowed, reach ~8 m from 3.3 m
     up). Left as it is (shadowing them would slow the bake; fixing their
     reach would dim the streets). If it matters later: shadow the fills of
     lights tagged `street`, or skip fills that reach below ground.
2. **Ladders: W with a ladder behind you climbed it** instead of walking off.
   Now (player.js, universal): W catches hold of a ladder you are already
   standing in only if your keys take you **towards its wall**; with it behind
   you, W walks you away. Walking into a ladder (front, side, or behind) still
   puts you on it, as before; backing down from the top is unchanged.
   `ladderVol` remembers which ladder you were in. controls.html says so.

**Tests:** `sim` +2 (off at the foot, ladder behind: W walks away, turned
back to it W climbs; walking into one from the side still grabs - the old rule
broken on purpose fails it), `light` +1 (the offset). 369 in all. Browser: the
hotel loads and bakes with `?lmhdr=1`, no page errors.

## M6.9.25 — the basement and the sewer

Rhys on M6.9.24: all good - "Sewer-Time!"

Built from the map's **B** sheet (`buildBasement`, level_hotel.js), which lines
up square for square with the floors above (B's stairs at (8,29) under G's).
`BUILT` now includes 'B'.
- **The ground's slab** is cut round two holes (`slabHoles`, `slabPieces` -
  pure): the manhole and the cellar stairs. Its underside (y -1) is the
  ceiling below. The road's asphalt is cut the same way.
- **The sewer** (`SEWER`: walkway -3.6, bed -4.5, water -4.0): walkways raised
  on the bed for every non-water square, the channel what is left; water in
  runs joined down the rows (4 volumes, `level.sewerWater`), half a metre deep
  - you **wade** (swimming needs 1.25 m). The C squares are a low wall along the
  west walkway's edge (1.0 m; chest high from the channel); its gaps get two
  iron treads down into the water, and the same rows on the east side
  (`level.sewerSteps`). Brick walls along the map's W squares, pipes, barred
  grilles at the north (in) and south (out) ends. Its surface has its own murky
  material, **moving south** (render.js `sewerWaterMat`, `flowing`; the plane's
  v runs +z, checked in the engine source).
- **The manhole** (`MANHOLE`): the map's A at (7,1) - an iron ladder up the
  north wall to an open manhole in the road ~4 m from the start, its lid
  beside it, the shaft lined.
- **The cellar door** (L at (6,25)): sturdy, locked, armour-skinned - a kick
  or a charge (`level.cellarDoors`).
- **The cellar** (`furnishCellar`): kegs (clear of the way in from the stairs -
  the first layout blocked it, found by the walk script), boiler and flue,
  hot-water cylinder, crate racks, the **MAINS - Isolated** board. Dark: the
  hotel's power is cut.
- **The cellar stairs** (`CELLAR_STAIR`, `buildCellarStairs`): a dog-leg in
  the bar's SW corner, squares x 8-9, rows 27-29: down going south to a half
  landing (-1.8), back down going north into the cellar. Closed in below.
  Railings on the floor's edge just outside the opening (over it, they caught
  heads coming up - found by the walk script). The back bar stops short of the
  opening. "CELLAR - Staff only" sign.
- **Lamps in the sewer** (the city's power is on; `level.sewerLamps`, lights
  tagged `sewer`): six caged bulkheads. **They barely show on the baked walls**
  in the sandbox's screenshots (they light the player and his weapon) - the
  same unexplained weakness as the hotel's baked room lamps at night
  (M6.9.19). The sewer and cellar are readable on night vision. If the bake is
  looked at, look at both. Note: the street lamps' light reaches the north end
  of the sewer through the slab (unshadowed baked lights).
- Zones: `sewer`, `sewer_south`, `basement`. Briefing: three ways in.

Known: in the bar the HUD says "Restaurant" (the bar shares the restaurant's
region on the map) - offered to Rhys, not changed.

**Tests:** `hotel` +7 (the slab's two holes; bar -> cellar -> back; the railed
opening and the back bar; the locked cellar door into the sewer; down and up
the manhole; wading across with the steps, the low wall; the cellar's contents,
the grilles, sewer lamps and none in the cellar). Each broken on purpose and
seen to fail. The old night test now ignores the sewer's (city) lamps.
366 in all. Browser: hotel loads with no page errors; screenshots of the
sewer, cellar and stairs taken.

## M6.9.24 — night vision goggles, worn

Rhys on M6.9.23 (all good otherwise; next the basement and sewer):

1. **"Gear: Polarised Lenses... since we're using Night Vision, shouldn't it be
   Night Vision Goggles?"** Yes. Cause: every level started from the same kit
   (`gear: 'LENSES'` in main.js), and V gave night vision whatever you wore.
   Now the level picks the gear (`level.startGear`, the hotel's is `NVG`,
   Lenses elsewhere); the item is called **Night Vision Goggles**; and V's
   night vision **needs goggles in the gear slot** (without: "No night vision:
   it needs Night Vision Goggles in your gear slot"). Swap them out at a crate
   and the view drops back to normal. Their flashbang penalty (flashResist
   -0.6) now applies **only while they are down** (`arsenal.gogglesDown`, set
   each frame from `S.vision`) - pushed up they are like wearing nothing.

controls.html: V explains the goggles; the stale second "V - first or third
person" row is now "Esc / P - pause; first or third person is in Settings".
**Tests:** `weapons` +1 (goggles up vs down against a flash; the name),
`hotel` +1 (the hotel's starting gear) - both broken on purpose and seen to
fail. 359 in all. One browser smoke load of `?level=1`: no page errors, gear
NVG.

## M6.9.23 — plain roofs opposite; the helicopter's way out; your gear on the pause menu

Rhys on M6.9.22 (all much better; near the chat's image limit - a new chat
next):

3. **Lit windows on the roofs of the buildings opposite**: the facade
   texture was on their tops too. Each block now has a plain concrete roof, a
   low lip round it, and one to three chimney stacks or vent housings
   (`buildCity`'s `block`, seeded).
5. **"If the captain escapes by chopper, surely there needs to be a gap"**:
   the north parapet has a gap in front of the map's VV squares
   (`buildRoof`'s `vvx`); beyond it the strip of roof over the third floor's
   front is railed at its edge (it drops to the balcony); the helicopter has
   moved over that strip, its side door open, and **a rope ladder** hangs
   from it to just above the roof (part of the 'heli_body' mover, so it bobs
   with it). Not climbable yet - for the captain's escape.
6. **Pause and check your gear** (asked before): the pause menu's **Your
   gear** (`tab-gear`, `drawGear`): each slot - its item, what is left (mag /
   reserve, or a count, and how many placed), its mods - and the keys you
   carry.

**Tests:** `hotel` +2 (the gap, the railed strip, the rope ladder; a plain
roof on every building opposite); the parapet test moved off the gap.
357 in all. Not run in a browser.

## M6.9.22 — room to get past the top of the roof ladder

Rhys on M6.9.21 (the helicopter, roof and ladder seen): "the parapet/rails
are too good/too close - I can't walk past them after getting up the
ladder". The parapet was centred on its squares like a wall, leaving 0.6 m
between the hatch and the parapet - less than a body. Now it stands right at
the roof's outer edge, 0.3 m thick, along each side of an edge square with
outside beyond it (`buildRoof`, `PT`): about 1.2 m at the ladder's top, and a
little more room all round the roof. Test: from the top of the ladder, walk
off along the edge (a thick parapet, on purpose, fails).

Also from Rhys, for the guards (on the roadmap): **torches** - hand-held for
guards with pistols, a weapon attachment for those with rifles; a guard needs
a torch only if he has no night vision (and the other way about); and a torch
attachment for the player's own weapons too.

## M6.9.21 — the roof, its ladder and the helicopter; the suite stairs' foot swung round

Rhys on M6.9.20: pretty good. The suite stairs felt tight to the wall at their
foot: "swing the foot round". The kitchenette counter stays mantleable; its
tap looked disconnected from the sink. Then the roof, the ladder and the
chopper. Noted for the guards: in the dark hotel they need night vision too
(on the roadmap).

- **The suite stairs' foot**: four steps come south out of the room to a
  square landing in the corner (closed in under, right back to the wall), the
  flight then turns east as before (`SUITE_STAIR.foot`). Railings up the
  foot's open side and the flight's room side, a handrail on the wall side.
- **The tap** stands behind the sink with a spout reaching over the bowl.
- **The roof** (`buildRoof`, Rhys's map 'R'): the C border is a parapet,
  1.05 m, with coping, not climbable - found as the C squares with outside
  beyond them (a flood fill from the map's edge stopped by C, A and W); the
  inner C squares are air-conditioning units with fan grilles; the W is a
  2.2 m screen wall. The roof surface is the third floor's ceiling (14.4 m).
- **The way up**: a ladder on a steel frame in the third floor's back room
  (behind the door that takes the Roof key), up through a hatch
  (`ROOF_HATCH`, a hole in the third floor's ceiling), out on to the roof's
  back extension; a curb and a rail on three sides of the hatch.
  `level.roofLadder`. The map's A stands as parapet at the roof's edge.
- **The enemy helicopter** (the map's VV) hovers beyond the north parapet,
  3.2 m up, bobbing, its rotor turning (`level.helicopter`, movers
  'heli_body' and 'heli_rotor'). Movers can now turn: a mover with `yaw()`
  is turned by `tickMovers`. Built of boxes, dark, a searchlight lens; no
  sound or behaviour yet.
- Not yet: the roof's guards (P13A-P18).

**Tests:** `hotel` +2 (up the ladder through the hatch on to the roof; the
parapet all round and not climbable, the plant, the helicopter beyond the
north edge with a turning rotor), the suite stairs test walks the new foot.
Leaving the hatch shut, on purpose, fails. 355 in all. Not run in a browser.

## M6.9.20 — the third floor: the Upper Balcony Suite

Rhys on M6.9.19: the darkness works much better; night vision works (the
outdoor bloom is as intended); the armoured doors' kick plates are right; the
camera code is hard to spot - "turn up the digit's brightness just a touch"
(backdrop brightness 1.28 -> 1.45, contrast 1.25). Then the third floor.

- `BUILT` is G, 1, 2, 3. **The Upper Balcony Suite** is the whole floor
  (Rhys's map): `penthouse()` - the **Empress bed**, a four-poster with a
  canopy and a padded headboard against the west wall (C rows 14-15); the
  **kitchenette**, a counter with fridge, sink and hob (C row 22) and a
  breakfast bar with stools (C row 26) - **the Roof key** lies on the bar
  (`level.keys` id 'roof'); the **dining table**, ten metres long, sixteen
  chairs and one at each end (C x 16-18, rows 21-27); the **corner sofa**
  with a glass table and a rug (C column 9 and row 33); plants by the long
  east window. `furnitureKind` gives the suite's C squares no kind of their
  own (it is furnished by `penthouse`).
- **Its balcony** (row 9): open to the sky behind glass balustrades (the
  `balcony` option again), loungers facing out, planters.
- **The stairs up from the Balcony Suite** (`suiteStairs`): the map's single
  "S" square cannot hold a stair a person fits, so one straight wooden flight
  of 24 steps runs along the suite's south wall (row 11), stepped on to at its
  west end from the room side, arriving at the east end of an opening in the
  third floor (railed on three sides, the rails just outside the opening so
  heads clear them). A handrail on the wall side and a railing on the room
  side (but at the foot). The Balcony Suite's lounge moved north to make room.
- **The reinforced door at the back** (15, 36) takes the Roof key; behind it
  the small room for the way up. **The roof ladder (the map's A) comes with
  the roof**: its square stands as wall until then (`rows3`).
- Not yet: guards P11-P13 and routes R11, R13; Hostage 3 at the dining table.

**Tests:** `hotel` +3 (up the suite's stairs to the third floor and back; the
suite's furniture, the Roof key on the bar, the door that takes it, no plain
cover blocks; the balcony open to the sky, the rest roofed, stepped out on
to). Leaving carpet over the opening, on purpose, fails. 353 in all. Not run
in a browser.

## M6.9.19 — the power is cut: night vision; X to detonate; armoured doors; the digit in the picture

Rhys on M6.9.18: the restaurant, and the whole hotel, still very dark with
the lights on - "either it needs brightening up, or the interior lights need
turning off completely [a reason to introduce Night Vision?]". We took the
second: it reads true (lights on but dark did not), and it gives night vision
a purpose. (Why the baked lamps lit so little at night was never found: by day
the ambient carried the rooms. If lights are wanted on again, look at the bake
first - `ROOM_LIGHT_NIGHT` is still there.)

1. **The hotel's power is cut** (`level.powerOut`): `addLight` places the
   fittings but no light; the lamp material is dark (render.js `lampMat`).
   The street lamps outside still burn; the lift and the cameras run on
   (emergency power, if anyone asks). The bake is quicker (20 lights).
   **Night vision**: V switches Normal / Night vision (`S.vision`;
   `drawVision`): a CSS filter on the canvas (brightened x4.2, green), with
   `#nv` over it (a dark edge, scan lines, a grain flicker). Watching the
   cameras at night shows grey infra-red instead.
2. **The camera digit is in the picture, not on it**: `#cctv-ghost` is now a
   small patch, masked to the shape of the number (an SVG mask), whose
   backdrop is brightened and shifted in hue - the pixels change slightly.
3. **X (eXplode) sets off placed charges** (`detonate` binding, rebindable);
   right mouse no longer does - on a Chromebook right-click is Alt, so it
   zoomed and detonated together.
4. **Reinforced doors look reinforced**: `armour` (textures.js): dark
   green-grey painted steel, two bolted cross-bars, a yellow-and-black kick
   plate. The lift's doors stay plain steel.

controls.html: V and X added, charges set off with X.
**Tests:** `hotel`: no lights inside with the power cut, the fittings still
there; reinforced doors in armour. 350 in all. Not run in a browser.

## M6.9.18 — lights that light the night; a smaller digit still

Rhys on M6.9.17 (screenshots: the sky good; the restaurant very dark, the
ceiling lights glowing but lighting little; bake 1639 ms):

2. **The rooms' lights lit very little at night**: by day the ambient (0.40)
   had been doing most of the lighting indoors. At night the ceiling lights
   are brighter and reach further (`ROOM_LIGHT_NIGHT`: 2.2, 12.5 m; by day
   0.85, 10 m), the night ambient is a little higher (0.15, 0.16, 0.22), and
   the street lamps are brighter (1.6, 14 m).
3. **The camera digits still too big**: 26 px (was 40), paler, a hairline
   colour split.

**Tests:** the night test also checks every room light is brighter at night.
350 in all. Not run in a browser; the next screenshots tell whether indoors is
now bright enough (or too bright).

## M6.9.17 — the hotel at night; the cameras behind the menu; a smaller digit

Rhys on M6.9.15/16: 1962 read off cameras 2, 4, 6, 8 as intended.

1. **The CCTV overlay (tear, digit, clock) showed over the pause menu**:
   `#cctv` now sits under the menus (z-index 15: over the HUD, under overlays).
3. **The digits were a little too big and obvious**: 40 px (was 72), paler,
   a slighter colour split.
4. Rhys asked about the riverbed "schmutz": silt and stones, the riverbed
   texture - "detritus" was the word.
5. **"Nocturnifying" the hotel** (22:47): `level.night` (set in
   `buildHotel`). render.js: a night sky dome and reflection cube
   (`NIGHT_SKY`, `skyColour(dirY, night)`: deep blue overhead, an orange town
   glow at the horizon); the sun becomes a faint blue moon (0.32); a dark
   blue ambient; dark fog drawn in (50-380 m); the river darker. The
   buildings opposite get a night facade (dark walls and glass, about a third
   of the windows lit) with a glow map so the lit windows shine
   (`facade_night`, `facade_glow` in textures.js; `matFor('facade')`). Every
   street lamp is now a light (`street: true` in `level.lights`), baked into
   the building and lit live nearby. Interiors keep their ceiling lights.
   **Watch the bake time**: 20 more lights in the bake (63 -> 83).

**Tests:** `hotel` +1 (night set; the night sky dark with a horizon glow;
every lamp post lit). 350 in all. **Not run in a browser** (a try timed out
in the sandbox) - the look of the night is untested: Rhys's screenshots will
tell whether it is too dark, too blue, or right.

## M6.9.16 — each mission its own date and time

Rhys: each mission happens on its own set date and rough time, the clock
running while you play (not carried across the campaign: authored story
moments need a predictable clock). The hotel, he left to us, "late-evening
feel": **9 July 2026, 22:47** (`MISSION_TIME` in level_hotel.js →
`level.missionTime`). The CCTV clock shows it, counting from when you begin
(`S.missionT`, real seconds while playing, not while paused), rolling on to
the next day past midnight. Test: the hotel is set late on 9 July 2026.
349 in all. Note: the hotel's sky and light are still daytime - making the
level look late-evening is a separate job, for when Rhys wants it.

## M6.9.15 — the code in the cameras, plainer; corner windows; the dial behind the menu

Rhys on M6.9.14:

1/3. **He could not read the code from the cameras** (the glitching seconds
   were too subtle; the cameras and code were random). Now **one code for
   this level, 1962** (`SAFE_CODE`), on **cameras 2, 4, 6 and 8**
   (`CLUE_CAMERAS`), every time. In a glitch (under half a second, every six
   to eight seconds) the camera's number **shows faintly in the picture**
   (`#cctv-ghost`: a large, pale digit with a slight colour split, in a spot
   of its own on each camera), with the tear line; the clock keeps time.
2. **The safe's dial showed over the pause menu**: hidden while a menu is up
   (`openMenu`, `drawSafeUi`), and back when you resume.
6. **The CCTV clock** is a made-up time, 23:40 on 01-10-2026 when you first
   watch, running on from there - set dressing, not a clue.
7. **Corner windows of the buildings opposite lit on one side, dark on the
   other.** The facade's windows were mapped on each wall separately. Now
   `wrapU` (render.js): the facade runs once round the block, left to right
   from outside, its repeat stretched a little so a whole number fits, so it
   meets itself at every corner.
5. Rhys will rewrite the briefings later; ours stand as placeholders.

**Tests:** `hotel`: the code is 1962 on cameras 2, 4, 6, 8; the facade meets
itself at all four corners of a block (mapping each wall on its own, on
purpose, fails). 349 in all. Not run in a browser.

## M6.9.14 — the safe's combination hides in the cameras

Rhys on M6.9.13: the safe works; the slip of paper did not (it looked blank,
lay out in the open, and E at it went to the CCTV console beside it). He
asked for the code to be deducible from the cameras - "something super subtle
that a trained spy would notice but an average person would think nothing
of". And: lockpicks and lockpicking, some day (on the roadmap).

- **No note.** Four of the nine cameras (chosen at random each time, like the
  code) carry one number of it each (`camera.clue`), in the cameras' own
  order, lowest first - so repeated numbers are fine. `cameraGlitch` (in
  `src/sim/world/safe.js`, pure): such a camera tears for about a third of a second
  every six to eight seconds; the others never do.
- **The feed now has a clock** (`#cctv-time`, "01-10-2026 23:40:..", running
  from when you first watch). In a glitch a pale tear line crosses the feed,
  the label jitters, and the clock's seconds read `0` and the number: a
  watcher who notices the seconds jump back can collect four of them.
- **The briefing**: nobody knows the combination, "though the staff say the
  cameras have been playing up ever since the manager had them put in"; the
  dial by ear and a breaching charge still work.

**Tests:** `hotel`: no note; four cameras spell the code in camera order;
each glitches briefly (under 8% of the time) and the others never (always
glitching, on purpose, fails). 348 in all. Not run in a browser.

## M6.9.13 — chained charges and mines; the safe and its key; a few fixes

Rhys on M6.9.12:

1. **Weapon ideas: remote and proximity mines; chainable explosives** (place
   several, then set them all off). `placeCharge`: with `chain` (C5, and the
   new REMOTE and PROXMINE), each press places another while any are left;
   right mouse (main.js → `Arsenal.detonateAll`) sets off every placed one of
   the kind in hand; with none left to place, fire does it too. **Remote
   Mine** (3, anti-personnel, no breach). **Proximity Mine** (3): arms after
   2.5 s (`armed` event, a click), then goes off 0.15 s after a target or
   guard comes within 1.8 m (`tripped`) - not for you. A prompt counts what
   you have placed. In the catalogue, so crates and Logistics list them.
2. **Third person in a moving lift: floating going down, sinking going up.**
   The car was drawn where it was at the latest step, the player between the
   last two steps. `Lift.drawY(alpha)` draws it between steps too
   (`lift.alpha` = `S.alpha`, set each frame).
3. **The balcony loungers face out** (their backs to the room).
4. **The first floor's emergency exit roof is railed all round**, but at the
   ladder (`buildRoofWalk`: railings down both ends).
5-7. **The Room 207 key is in the Estate Room safe** (Rhys: players would not
   look in Room 201). `src/sim/world/safe.js` (pure): a dial 0-9 turned a notch at
   a time, four numbers set in turn, checked at the end; a heavier click when
   the dial is on the number it waits for (a careful ear can crack it); a
   breaching charge within 1.8 m blows the door off. In the game: E at the
   safe works the dial (mouse or A/D turn it, E sets each number, W/S steps
   away; a dial panel on screen); the door is three movers (shut, swung open,
   blown off on the floor); the key inside can be taken once it is open. The
   combination is random each time, on **a note on the CCTV console**
   (`level.notes`, E to read). **The briefing** now tells of the locked suite,
   the key in the safe, and the three ways in (the note, the dial by ear, a
   charge), and that other locked doors give to a kick.

**Tests:** `weapons` +2 (a chain of three remote mines set off together; a
proximity mine: not before it arms, then on a target, never for you) and the
charge test reworked for chaining; `hotel` +3, one reworked (the key in the
safe, the doors, the note with the combination; the safe's dial both ways,
the heavy click, wrong and right codes, a blast; the lift drawn between
steps; loungers facing out and the roof railed but at the ladder). Each
undone on purpose fails. 348 in all. Not run in a browser.

## M6.9.12 — shoot over the barricades; one console; a double helping is a double helping

Rhys on M6.9.11: likes the second floor; the lift works exactly as intended.

2. **The barricades were "a little TOO barricade-y"**: still impassable, but
   you should be able to shoot over them. Now chest high (`BARRICADE_H` =
   1.35 m: under a standing eye, over a crouched one), no climbing, and the
   furniture is all within that height (nothing piled above that looks like
   cover and is not).
4. **The second floor's CCTV console got in the way of the lift's stop
   button**: one console, on the ground floor (`cameras` skips an unlabelled
   T above the ground).
6. **A double helping is a double helping** (Rhys: two smoke grenades in
   Utility 1 and two in Utility 2 are four, each pair with its own mods/fill;
   the same pistol as primary and secondary is two pistols, a magazine each).
   The arsenal keyed what you carry by item id, so a second copy merged into
   the first. Now `Loadout.keyOf(slot)`: the first slot holding an item keys
   it by its id as before, a second copy is `id@slot`; `keys()`,
   `slotOfKey()`, `baseId()`. The arsenal carries keys (own ammo, own mods
   via its slot's stats); the view, the hold table, model lookups and the
   mission's stats use `baseId`. Single copies are exactly as before.

**Tests:** `weapons` +2 (two pairs of smoke grenades: four, thrown from one
pair only, a fill on one only; two pistols: a magazine each, an extended
magazine on one, back to one copy after a swap); `hotel`: barricade height
(a standing shot clears it, nothing piled above it), one console and nothing
at the stop button. Each undone on purpose fails. 343 in all. Not run in a
browser.

## M6.9.11 — the hotel's second floor

Rhys: "crack on with Floor 2" (nothing particular in mind: built from his
map). `BUILT` is now G, 1, 2.

- **The stairs go on up**: the first floor has its own dog-leg to the second
  in the same well. Flights above the ground are slabs with an underside
  (`under()`), so the flights below keep their headroom; the railing across
  the foot of the next flight only on the top floor (`topFloor`); the floor
  patch along the well's north wall (Room 101, now also Room 201) on every
  floor above.
- **The lift** serves the second floor (automatic from `BUILT`).
- **The corridor is barricaded twice** ("artificial barricade", rows 18 and
  24): furniture piled wall to wall - wardrobes, a sofa, tables, mattresses
  leant on it, a chair upside down on top - over an unseen solid 2.55 m high,
  no climbing (`furnitureKind` → 'barricade', `furnish`).
- **Holes blown through walls** ("hole blown through wall", (9, 18) and
  (20, 24)), the way round the barricades: `blownHole` - the wall back to a
  ragged gap ~1.25 m wide and ~2 m high, broken edges, bent bars, scorching,
  rubble you walk over. The hole joins no room (`rooms` is given the inside
  less the holes), and bedroom furniture keeps clear of it (`bedrooms`'
  `clearOf`).
- **The Room 207 key** lies on the desk in Room 201 (locked, kickable).
  `level.keys`, drawn as a mover that goes when taken. The Balcony Suite's
  reinforced double doors take it (`door.needs`): "E Unlock it with the Room
  207 key"; without it, a charge. main.js `keyUse`/`keyTip`.
- **The Balcony Suite (207)**: a king bed, a TV, a lounge; its balcony (row 7)
  open to the sky (no ceiling), decked, behind a glass balustrade with a
  steel rail (`buildFloor`'s `balcony` option: glass squares round it that
  are not also windows of a room become balustrade), with loungers, a glass
  table for two, planters. The square at (9, 11) left clear for the stairs up
  to floor 3 (the map's "UP": a spiral, with floor 3).
- **The lift's emergency stop** ("Elevator Emergency STOP", behind the
  lobby's reinforced door): a red button, "E Emergency stop - the lift" /
  "E Reset the lift". `Lift.setStopped`: it finishes the trip it is on (so
  nobody is shut in between floors), opens there, and refuses calls ("The
  lift is out of service") till reset. Lift machinery cabinets in the room.
- **CCTV**: camera 9 on the second floor's lobby; the map's unlabelled T in
  the stop room is a second **console** (`level.cctv.consoles`; you can watch
  from either).
- Not yet: guards (P7-P10, route R7), Hostage 2 (Room 206).

**Tests:** `hotel` +7 (the stairs on up, and the ground floor's still clear;
the lift to the second floor; the barricades; through both holes, the rooms
kept apart; the key and the doors it opens, Room 201 locked; the suite and
its balcony; the emergency stop). Each undone on purpose fails. 341 in all.
Not run in a browser.

## M6.9.10 — "It held" on time; metal rails everywhere; a proper bath

Rhys on M6.9.9 (likes the suite; the safe will be used later):

1. **"It held" showed after the door was already open.** Two causes: the
   prompt put the locked-door tip ("Locked - F Kick it open") above the kick
   message, so a failed kick's "It held" was hidden while the door stayed
   shut and surfaced once a later kick opened it; and a successful kick never
   cleared it. Now the kick message comes first, and a kick that opens the
   door clears it (main.js `kickDoor`, Level 0's `kick` too).
3. **The sponge-looking yellow 'rail' material**, everywhere: `render.js`
   draws every 'rail' piece in the plain metal (`matFor`), so the lift's
   handrail, the safe's door, the fridge handles and Yard 7's rails all match.
   Pieces keep the name 'rail' (tests and levels unchanged).
4. **The bath had tiles floating on it**: its "water" was a pool-tile slab on
   top of a solid block. Now a tub: a white shell (base, sides, a rolled rim)
   round a sunken inside, still water (glass) part way up, an unseen solid
   for bumping into.

**Tests:** the suite test checks the tub (its sides, water below the rim, no
tiles on it); the old bath brought back on purpose fails it. 334 in all.
Not run in a browser.

## M6.9.9 — the Estate Room as a suite; your weapon at the console

Rhys on M6.9.8: the lift works nicely; likes the new stair railings.

1. **"Where'd my gun go?"** at the CCTV console (camera 7): M6.9.2 put your
   body at the console but took its weapon away (`opr.carry = null`), while
   the body still stood as if holding one. Now it keeps the weapon in hand as
   in third person (`wview.setThird(true, opr)` while watching), and gives it
   back to the first-person view when you stop (`stopCctv`).
4. **The Estate Room (107)** as the hotel's best suite (Rhys: open plan, a bed
   area, a bathroom area, an area with a safe). `estateSuite` in
   `level_hotel.js`, laid out from the room's real wall faces:
   - its C squares are now a **screen** (`furnitureKind` → 'partition'): a
     low panelled wall with frosted glass, joined like walls; it closes off
     the south-west corner, open at its west end;
   - **the bathroom** behind it: a double vanity with a marble top and long
     mirror, a WC, a freestanding roll-top bath with a mat, a walk-in shower;
   - **the dressing area** by the window, north of the screen: wardrobes, a
     **safe** on a plinth (keypad, wheel - `level.safes`, for when safes do
     something), a writing desk with chair and lamp. Guard P6 stands here;
   - **the bedroom**, east of the entrance: a king bed against the east wall
     (upholstered headboard, four pillows, a throw, a bench at its foot,
     bedside tables and lamps, a painting), a TV on a sideboard facing it, a
     sofa with armchairs and a coffee table by the window, a floor lamp,
     plants, a table for two, a drinks cabinet.
   The patrol loop (R6, rows 8 and 10) stays walkable.

**Tests:** `hotel` +2 (the suite's pieces and safe; walking in, the loop
clear, into the bathroom, to the safe); the first-floor test checks the
screen instead of the old meeting table. Undone on purpose (no suite; the
screen back to a table): each fails. 334 in all. Not yet run in a browser.

## M6.9.8 — the lift; Room 101's carpet

Rhys on M6.9.7: all good, but for one off-colour patch in Room 101's floor.

1. **Room 101's patch**: the strip put back along its wall over the stairwell
   (M6.9.7) had its concrete but no carpet - bare concrete showing. Carpeted
   now (`buildStairs`); a test walks the strip and fails on any bare floor.
2. **The lift** (Rhys's map: "Elevator (G, 1, 2)" at (21, 35), the lobby's
   south-east corner). `src/sim/world/lift.js` (pure): a car (moving floor, roof and
   door solids) serving a list of floors; sliding doors on each landing and on
   the car; calls queued in order; speeds up and slows to a stop; doors open
   4 s, and will not shut on anyone in the doorway (`step(dt, bodies)`);
   events for sound (`ding`, `doors`). Riders are not lifted by the floor
   (collision only resolves the way you came), so the game moves anyone the
   car `carries` by the distance it moved (main.js fixed step, and the tests'
   `liftStep`). `buildLift` in `level_hotel.js`: the shaft kept **inside its
   one square** (west and north walls on its edges, linings out to the
   lobby's east and south walls), so the floors above - cut over that square
   only (`holes`) - never reach into it; no wall squares taken in (that is
   what caused Room 101's gap). The car is about 1.25 m square inside: Rhys
   may want it wider. Doorway 0.9 m facing west, steel frame, a call button
   and a LIFT sign on each landing. **Controls:** E at a landing's call button;
   in the car, look at a floor's button on the panel by the door and press E
   (`buttonAt`, the nearest button within ~25° of where you look).
   **Serves only built floors** (`LIFT_FLOORS` ∩ `BUILT`): G and 1 now; add
   '2' to `BUILT` when floor 2 is built and its stop and shaft opening follow.
   "Elevator Emergency STOP" on floor 2 at (20, 37) is still to do.
   Drawing: new `level.movers` in `render.js` (`{ id, pieces, at() }`, an
   entity each, moved by `view.tickMovers()`), not baked; sounds
   `audio.liftDing()`, `audio.liftDoors()`.

**Tests:** `hotel` +4 (Room 101's carpet; the shaft clear of every floor
and wall and the car in its square; call, ride up, walk out, ride down;
shut landings and the doors' safety edge). Undone on purpose (the carpet;
the safety edge; carrying riders; the shaft past its square): each fails.
A door-animation bug found on the way (fully open doors crept shut every
other step). 332 in all. **Not yet run in a browser** (the sandbox's server
hung): Rhys's playtest is the first look.

## M6.9.7 — en-suites you can walk into; Room 101's floor; straight sloping rails

Rhys on M6.9.6:

1. **"Can you always add ?v=1 to a URL to update it?"** Mostly: a new query
   string makes the browser fetch the page again. The game's script is already
   stamped with its version by the build (`game.js?v=M6.9.7`), so a new build
   always loads fresh once the page itself does. Join extra settings with `&`
   (`index.html?level=1&v=2`); `?level=1?v=2` works too, by luck.
3. **A gap in Room 101's floor** along its wall over the stairwell: the well
   (M6.9.5) took in the wall squares round it, so the floor above lost the
   room-side half of the north wall's squares. That half is put back
   (`buildStairs`); a test walks the strip.
4. **The shower stood right behind each en-suite's way in.** Rearranged: the
   way in at the door's-wall end, the shower (tray, glass screen, a head) in the
   far corner, the basin and mirror on the inner wall, the toilet by the door's
   wall. A test runs a walker's lane through every en-suite's opening.
5. **The stepped stair railings** (M6.9.6) did not go down well. Pieces can now
   be sheared up along one axis (`slope: { axis, dy }` on a box, applied when
   the meshes are built), so each railing bar is one straight sloping bar a
   flight long. Collision is unchanged (the unseen wall along each railing).

**Tests:** `hotel` +3 (Room 101's floor strip; the en-suites' ways in; the
railing bars slope, one per flight). Undone on purpose (the floor strip; the
old en-suite layout): each fails. 328 in all.

## M6.9.6 — rooms that look lived in; cameras on the walls; smoother rails

Rhys on M6.9.5 (likes the stairwell, the rails, the fuller rooms):

1. **Save files and trophies** should pair up (a new game earns things for the
   first time again). Right now trophies are one record for the whole browser,
   and levels are reached from the title screen, outside any save. Planned with
   the move to levels flowing from Yard 7 - written into the roadmap.
2. **Shorter reinforced text**: "Reinforced - a kick won't open it" (at the
   door and after F).
3/4. **Camera 6 floated in the middle of the stairwell.** Cameras hung from
   the ceiling on a rod, and there is no ceiling over the stairwell. Every
   camera now sits on its wall: on the wall's real face (a square out, less
   half a wall - they had been 0.85 m short of it), on a bracket. Camera 6 is
   back against the lobby's west wall, over the landing. Whether its view is
   right, Rhys will judge (it may want moving).
5. **The sloping rails looked gappy**: each bar was drawn in 0.5 m flat pieces
   at different heights. Now 0.2 m pieces, each as tall as the slope climbs
   across it - one unbroken line.
6. **The rooms**: the TV looked like wood, the throw like grass, the picture
   like a mirror, and you could not watch the TV from bed. New textures (added
   at the end of the painter's list): `screen` (a dark TV screen), `painting`
   (a landscape - sky, hills, fields, a river), `fabric` (a red woollen throw,
   also the armchair). The TV now stands at the bed's foot, facing it. And as
   the rooms felt "weirdly spacious": an en-suite in the corner at the door's
   wall (toilet, basin and mirror, a shower tray with a glass screen), the
   wardrobe beside it, the desk by the bed's head, the armchair on the door's
   side. The layout mirrors itself so the door is always clear.

**Tests:** in `hotel`: every camera within 0.35 m of a wall; each bedroom's TV
at the bed's foot and facing it, a painting, a throw, a shower. Undone on
purpose (the old camera offset; the TV back at the side) - each fails.
325 in all.

## M6.9.5 — the stairs to the walls, camera 6 sees both; fuller rooms; a proper rail

Rhys on M6.9.4 (likes the stairs and the rooms):

1. **Levels should in the end flow from Yard 7** rather than the title
   screen - noted in the roadmap ("Levels flow from Yard 7"); fine for now.
2. **A reminder at a reinforced door.** On every level without its own
   mission hints: near a locked door the prompt reads "Locked - F Kick it
   open", or for a reinforced one "Locked, and reinforced - you can't kick it
   open. A breaching charge will."; kicking one says the same rather than
   trying (`kickDoor`, `S.kickText`). Room 103 upstairs has one (Hostage 1's).
3. **Bedrooms: wardrobes in the way, rooms a bit empty.** The cause of the
   first: rooms were measured square to square, but a wall stands half a
   square out, so everything sat 0.65 m off the walls. Now laid out from the
   real wall faces and from the door (`bedrooms`, in "u/v" from the bed's head
   to the door's wall): bed with headboard, pillows and a throw, bedside
   tables and lamps, a picture over the bed; the wardrobe on the door's wall
   at its far end, flush; a desk with a lamp and a chair; an armchair; a
   television on a low unit; a suitcase.
4. **The emergency rail looked like yellow sponge.** New `railing` helper:
   metal posts, a top bar and a middle bar (with an unseen solid wall along
   it), able to follow a flight of stairs. Used on the back roof and the stairs.
5. **No way through the rail to the ladder.** A gap in it at the ladder;
   back down on to the ladder (facing the building) as with every ladder.
6. **The stairs stood off the walls, and hid camera 6** (Rhys wants it to
   watch the lobby and the stairs). The stairs now run tight to the west and
   north walls (the well takes in the wall squares round it; walls there run
   up to the floor above, as no ceiling covers them). The full-height walls
   are gone: a low wall with a railing between the flights, a railing along
   the lobby side, railings round the opening above.

**Tests:** `hotel` +3: the stairs tight to the walls and camera 6's sight
lines to the lobby (centre and east end), the landing and the east flight;
the back roof's metal railing, and backing down the ladder through its gap
to the ground; the bedrooms (at least 24 pieces each, the wardrobe at least
1 m from the door). Undone on purpose: the old stair position, a full-height
wall (camera 6 fails), the rail without a gap - each fails. (Swapping which
end the wardrobe stands still passes - both ends are over 1 m from the door
now that it stands against the real wall.) 325 in all.

## M6.9.4 — the hotel's first floor and the stairs

Rhys on M6.9.3: "Fabuloso!" - so on up the building.

**The first floor**, from Rhys's "Floor 1" sheet by the same `buildFloor`:
the Estate Room (107) at the front (its C squares a meeting table with
chairs), rooms 101-106 down the middle, the lobby at the back, the locked
pair to the back. Each "Room nnn" gets a double bed with its head to the
wall across from the door (headboard, pillows, a bedside table and lamp
either side), a wardrobe by the door and a desk (`bedrooms`). Room names are
zones ("Riverside Hotel - Room 103"; zone ids now keep their numbers).
Hostage 1's square (room 103) is empty for now - hostages come later.
(A bug found on the way: `furnitureKind` looked rooms up with `||`, so the
first room - number 0, the Estate Room upstairs - never matched its name and
its table came out as crates. Now `??`; a test checks the Estate Room's table.)

**The stairs** (`buildStairs`, `STAIR` = squares x 8-9, rows 31-35 - where
Rhys marked S on both floors): a dog-leg in the lobby's west end. Up the west
half going north (10 steps of 0.18 m), a half landing across the north end,
up the east half coming back south, out on to the floor above at row 35. The
floor above is open over rows 31-34 (`buildFloor` now takes `ceilHoles` /
`floorHoles`, so neither the ceiling below nor the carpet above covers the
well). A wall down the middle and round the well (up past the floor above
as a parapet), a handrail, a rail across the open end above. Built one
storey at a time, so the floors above just add storeys.

**The back roof and the emergency ladder**: the first floor's locked back
doors open on to the flat roof over the ground floor's back corridor; a rail
round its edge and an iron ladder down the back of the hotel to the ground
("Emergency Escape" on the map).

**CCTV**: camera 8 (first-floor lobby) joins the other seven on the ground
floor's console; cameras from every floor are gathered into one list.

**To watch**: the bake roughly doubled with the second floor's lights
(sandbox 42 s → 87 s, so perhaps 4 s on the Chromebook). If it is too slow,
fewer lights per room upstairs is the first thing to try.

Not yet: the lift (marked at (21, 35) on G, 1 and 2), floors 2 and 3, the
roof, the basement and sewer, guards, hostages.

**Tests:** `hotel` +3: up the stairs from the lobby to the first floor and
back down; from the landing you cannot step off into the lobby (true with or
without the well's walls - the floor above stops you too; the walls are there
to make it an enclosed stairwell); the first floor (rooms and zones, six
beds, no floor over the well, the locked doors upstairs, the emergency
ladder). Camera test updated to eight. 322 in all.

## M6.9.3 — pairs give together; a fuller kitchen; camera zoom

Rhys on M6.9.2: "pretty good". His notes:

2. **Forcing one leaf of a locked pair should force both.** New
   `SwingDoor.breachWith(allDoors, from, how)`: breaches the door and any
   unforced door sharing its `def.pair`. Used for kicks and charges on every
   level (main.js and Level 0's mission code alike).
3. **Fill out the kitchen.** `kitchenPlan` / `fillKitchen` in
   `level_hotel.js`: every square against the kitchen's walls, not within a
   square of a door, gets a fitting - white units with steel tops and wall
   cupboards above (a stock pot or chopping board here and there), tall steel
   fridges in the corners, a range cooker with oven doors, rings and a hood.
   The worktops in the middle stay as they were.
4. **Zoom on the cameras**: hold aim (right mouse) to zoom in, smoothly; the
   help line says so.
5. **"Climb" and "Vault" showed while watching the cameras**: the prompt is
   blank while you watch.

**Tests:** `hotel` +2 (a locked pair forced together; the kitchen's plan -
enough fittings, fridges and a range, none in front of a door). The pairing
and the door clearance each undone on purpose: each test fails. 319 in all.

## M6.9.2 — ladders out of the river; the cameras pan

Rhys's walk round M6.9.1 (he likes the bar and the restaurant, and the CCTV):

1. **The river's ladders did nothing.** Only walking checked for ladders;
   swimming never did (my test had passed because it got out by climbing the
   wall's edge instead). `stepSwim` now checks too: swim into a ladder, facing
   it more or less, pressing forward, and you are on it (the prompt shows).
   The test now insists on getting onto the ladder itself, on both banks.
2. **Pan the cameras with the mouse.** While watching, the mouse turns the
   camera from where it points (up to about 70 degrees either way, down to
   the floor, a little up); each camera starts square again; when you stop
   watching you face the way you were.
3. **You were invisible on camera 7** (the one in the CCTV room): while
   watching, your own body stands at the console (without its weapon).
4. **"It held" stayed on screen for ever** after a kick that did not open a
   door: its timer only ran inside Level 0's mission code. It now wears off
   everywhere.
6. **The kitchen** now looks like one: white units with handles, a steel top,
   a hob with four rings under an extractor hood, a sink and tap, a pan rack.
7. **A hedge poked into the kitchen** (the stub closing the garden's corner
   crossed the kitchen's wall): moved clear of it; a test checks hedges against
   the kitchen's walls (by their inner faces).

**Tests:** `hotel` +1 (the hedge) and the ladder test tightened (both banks,
from swimming, onto the ladder itself); units and hood checked in the
kitchen. The swim-ladder check and the hedge each undone on purpose: each
test fails. 317 in all.

## M6.9.1 — the hotel's ground floor, as Rhys meant it

Rhys's walk round M6.9.0, point by point:

1. **It opened paused.** My doing: the hotel called the pause menu at the
   start so a click could lock the mouse. **Rule: no level ever opens on the
   pause menu.** It opens on a briefing card (Begin / Back to Yard 7), like
   Level 0.
2. **No world round it; you could fall off the edge.** A city now: blocks of
   buildings across the road, either side of the hotel (a side street to the
   east, an alley to the west), and beyond the far bank; an unseen fence round
   the whole (`buildCity`).
3. **A garden** (not an option on the map template): a mown lawn along the
   west side, x 4.5-10.9, z 26.5-63.4 (Rhys: roughly (4.5, 34) to (10, 63);
   it runs from the kitchen's way in to the river), hedged, a path from the
   back door, three trees, two benches (`buildGarden`; new `lawn`, `hedge`
   and `cloth` textures, added at the end of the painter's list so older
   textures keep their look).
4. **Floating lights**: street lamps without posts. Posts, and more lamps
   along both pavements and the embankment.
5. **A spot of light underwater**: the sun's glint on the underside of the
   water. The water loses its shine while you are under it.
6. **You could swim in, not out.** Iron ladders up both banks every 20 m.
7. **The Ts are CCTV cameras** (Rhys's labels said so): each now a camera
   high on the wall, looking into its room (outside ones look out across the
   street); the console is a desk of screens. **E at the console** shows
   camera 1, E again the next, after 7 back to you; moving (or firing) stops
   watching. A REC overlay with scanlines names the camera (`level.cctv`,
   `S.cctv` in main.js).
8. **Double doors opened one leaf.** The leaves of each double door are now a
   pair (`def.pair`): standing, E moves both; crouched or prone, only the one
   you pick - as in Meridian House.
9. **Restaurant tables**: a table with a white cloth to each square, a pedestal,
   and chairs on its open sides.
10. **The bar**: one counter over all its squares (dark wood, a top, a brass
    foot rail), and a back bar on the wall behind - shelves of bottles over a
    low cupboard. (First try: every C near the bar name became one counter
    across the restaurant; now the bar is only the run joined to the square
    nearest its name - the rest are tables.) The foyer's run of five is the concierge desk; its pair is a
    sofa. The kitchen's are steel worktops. (What a C becomes is decided by
    the room it is in and the nearest room name - `furnitureKind`.)
11. **Doors would not blow.** Kicks (F) and breaching charges only worked
    inside Level 0's mission code. Now every level has them (`kickDoor`,
    `blastDoors` in main.js); Level 0 keeps its own, with hints and bullet time.

**Tests:** `hotel` +7 (a city on every side and 40 s of walking at the edge
does not get you out; lamps on posts; ladders up both banks and swimming to
one gets you out; the garden and its back door; double doors paired, single
ones not; furniture by room; seven cameras in order and the console). Pairs,
the fence and the ladders each broken on purpose: each test fails. 316 in all.

## M6.9.0 — the Riverside Hotel's ground floor; metal that reflects

Rhys after M6.8.2: "seems fine" (Yard 7: 1.7 s bake with the underground
baked, 2.3 s with `?bake=all`, 60 fps on top of the crates either way).
Then: fold in reflective metals; start step 2, but **build the hotel straight
away and add the features there step by step** - Meridian House stays as it
is. Hostages first when the systems start.

**The hotel, from Rhys's spreadsheet.** `tools/map_to_json.py` turns
`maps/Frontline_Map_Riverside_Hotel.xlsx` into `src/game/levels/maps/riverside.json`
(each floor as rows of one-letter codes; room names, UP/DOWN, routes and
guard posts as labels). Rerun it whenever the map changes.
`src/game/levels/hotel.js` builds a floor from it (`buildFloor`):
- **1.5 m a square** (Rhys's scale note: one-square corridors widened), walls
  0.2 m thick (plaster) drawn along the middle of their squares and joined to their
  neighbours - a room four squares across is 6 m.
- Glass: a sill, a pane that stops you but not bullets, a header.
- Doors from runs of door squares: one leaf a square, two a double door; D
  ordinary, L locked (sturdy), R reinforced, E a way in (a pair of E is a
  glass double door).
- C cover and furniture (a row of C is one piece, 1 m high), T terminals.
- A ceiling over every inside square (worked out by flood from outside), a
  carpeted floor, and a ceiling light in every room (one every 6 m).
- Room names on the map become zones (the HUD shows "Riverside Hotel -
  Foyer", etc.).
- Outside: the main road north, the hotel, the embankment and the river south
  (swimmable), the far bank. Start by the Ghost APC across the road.
- Baked round the building (`bakeRegion`), the road and river live.

**Ground floor only.** No stairs yet (the map's stair squares are floor for
now), no guards, no hostages; the upper floors, the basement, the roof and
the lift come next. Reached by `index.html?level=1` or the title screen's
new button; no saving part-way; "Start again" reloads.

**Reflective metals** (Rhys, M6.8.2: a lamp post near-black from every side).
Metal shows almost only reflection, and there was nothing to reflect. A
16-pixel cube of the sky (blue above, the warm haze at the horizon, dust
below) is given to every metallic material (`makeSkyCube` in `render.js`);
the lighting of everything else is unchanged.

**Tests:** new `test/hotel.test.mjs` (7): the map converts (six floors, the
river), inside/outside and rooms, the doors (both pairs of front doors, the
kitchen way in, the locked CCTV doors), the ground floor builds (pieces,
doors, glass, lights, zones), a corridor wide enough, walking in through the
front doors, the sky colours. Door detection broken on purpose: three fail.
309 in all.

## M6.8.2 — Yard 7's underground baked

Rhys's playtest of M6.8.1: all good; four trophies in one run (Unseen, No
Witnesses, Sharpshooter, Quick Work). He compared Yard 7 live (left) and
`?bake` (right) side by side on M6.8.0:

- **Bake 6.4 s** for the whole yard (sandbox 131 s: about 20x the Chromebook).
- **The course: 31 fps baked, 15 live**, same spot. The open yard: about the
  same either way (48 vs 58, 52 vs 50). Looks: hard to tell apart, "baked is
  better". The sandbox's "shaded yard" did not happen on his machine.

So Yard 7 is now baked where it pays: `bakeBelow: -0.5` in
`level_training.js` bakes only pieces reaching underground (the course, the
galleries, the yard slab over them); containers, walls and towers stay live.
Coarser lightmaps there (`bakeDensity: 5`, `bakeMaxRes: 512`: plain
blockwork, a big place). Sandbox bake 48 s (was 131 s), so about 2.3 s on
the Chromebook - to confirm, on the debug line. `?bake=all` bakes the whole
yard at the same density, to compare; `?live` turns baking off.

Level 0 on M6.8.1: bake 1.7–2.2 s; indoors 13–24 fps (13 on the top floor by
the server room, a heavy view).

Rhys's two ChatGPT location boards are in `maps/concepts/` and summarised in
the roadmap ("Location ideas").

**Tests:** `light` reworked for Yard 7 (the underground baked, containers
live, nothing above ground baked, every lamp near something baked). 302.

## M6.8.1 — "Medic!" once; up through the chin is a headshot; the frame-rate notice

Rhys's playtest of M6.8.0, point by point:

1. **"Medic!" over and over.** Cause: finding a body is an urgent line, and
   urgent lines skip the mission's turn-taking (so the 12 s same-kind rule
   never applied); "Medic!" is the only recording for both a man down and a
   man knocked out, so the take-rotation had nothing to rotate to; and a guard
   who saw a heap of bodies shouted once for each. Fixed twice over: the same
   words are not said again within 8 s by anyone (`Voices.saidLately`), and a
   guard seeing several bodies at once shouts once.
2. **The frame-rate banner's buttons needed Esc, which opens the menu with
   the setting in it anyway.** It is now a notice, not a question: shown once
   for 8 s ("Low graphics quality may help: Esc, then Settings"), no clicks,
   and the Graphics quality row is outlined in the settings until changed.
3. **A guard shot up through the chin was barely hurt.** Cause: a guard is one
   box, and a headshot was judged only where the round went in - under the
   jaw is just below the head line, so it counted as a body hit (a rifle did
   22 of his 60). Now a round travelling upward counts if it reaches head
   height within 30 cm inside him (`reachesHead` in `weapons.js`); rounds
   coming down or level are judged as before.
4. **`?bake` looked the same as normal** - because it was tried on Level 0,
   which is baked anyway. `?bake` is for Yard 7 (`index.html?bake`). Level 0
   "looked decent" either way: good.
5. **Chromebook numbers from the screenshots:** bake 1.3–1.6 s (was 1.9 s);
   indoors 21–27 fps (was about 17), one long corridor view 11; outside
   16–32. The banner fired at 10 fps looking up at the glass front.

**Tests:** `weapons` +3 (head / chest; up through the chin but not coming
down or nearly level; a crouched rifle shot under the jaw kills), `voice` +2
(no repeat within 8 s across guards and across man-down / knocked-out; lines
with several takes still rotate), `detect` +1 (three bodies, one shout). Each
fix undone on purpose to see its test fail. 302 in all. Browser: the notice
shows, the setting is outlined, no errors.

## M6.8.0 — Meridian House's lighting reworked; Low Quality offered when frames struggle

Step 1 of the plan, continued ("Let's Get Baked"). No playtest notes on M6.7.7.

**Why Level 0 was dark, and what was done:**
- **The lightmaps were tiny.** PlayCanvas sizes a lightmap from the mesh's
  bounds; one map-wide mesh per material gave the building's plaster a single
  256-pixel map (about 4 px/m) - the blotches. New `src/sim/world/bake.js`: baked
  levels are cut into 24 m chunks, big faces into 12 m tiles, and each chunk
  is one entity whose materials share one lightmap, asking for ~8 px/m (cap
  1024). 28 baked meshes (not 20 map-wide ones, nor the 84 of a first try).
- **The stairwell had no lights.** Three wall lamps, one a floor, clear of
  the ceiling duct.
- **The top floor's ceiling was the metal roof**, and metal takes almost no
  baked light: a concrete skin under it (render only, 10.48-10.5 m).
- **Ceilings were barely lit by lamps hanging just below them**: a soft
  bounce fill under each lamp, baked only (no cost per frame), no shadows,
  short reach (`level.bakeFill`: `soft` default, `shadow`, `none`; `?fill=`
  in the address to compare). The engine's lightmap filter smooths speckle
  (`?lmfilter=0` to compare). Lamp fittings no longer shadow their ceilings.
- The ambient-occlusion bake that was suggested was tried on paper and
  dropped: it treats ambient as sky light, so it darkens interiors.

**Yard 7 and the course: tried, switched off.** Bake plan ready in
`level_training.js` (region round the yard and course, 40 m chunks), off by
default, `?bake` to try. Sandbox bake about 130 s (Meridian House 28),
likely several seconds on the Chromebook on every start (the yard is behind
the title screen); and the sunlit yard came out shaded. A one-cascade sun for
the bake made it 272 s and was taken back out. See the roadmap.

**Low Quality offer:** `src/sim/world/perf.js` `FpsWatch` - under 20 fps for about
8 s of play (not menus, not the first 6 s, not already on Low) shows a banner
once (`#lowq`): Switch to Low / Keep as it is. The answer is saved
(`settings.lowAsked`). Off under `?test`.

**Bake time:** sandbox 28 s, the same as M6.7.7 (the 84-mesh first try took
80 s; sharing a lightmap per chunk brought it back), so about 2 s on the
Chromebook again. The debug line shows it.

**Tests:** new `test/light.test.mjs` (9): tiling, lightmap packing (no
overlaps), sizing, every Meridian House chunk within the cap at ≥6 px/m, the
stairwell lit and the ceiling non-metal, Yard 7's plan covering all its
lights (and off by default), bounce fill, and the frame-rate watch. Each new
feature broken on purpose to see its test fail. 296 in all. Browser checked
in the sandbox: both levels load, no errors, the banner answers.

## M6.7.7 — guards keep out of the steel door; takedowns need a clear reach
Playtest of M6.7.6 (Rhys): guards phased through the locked reinforced door,
one sank through the stairs, and F-takedown worked through a door/wall.
- **Phasing through the door was M6.7.6's own doing.** Guards stopped opening a
  locked reinforced door, but `NavGrid` still counted every door as open and
  guards have no wall collision of their own, so they walked through the shut
  door. `NavGrid.syncDoors(doors)` now fills the cells across a locked,
  reinforced, unopened door; it is called each frame before guards step
  (`mission_runtime.js`), only rebuilds when a door's state changes, and the
  door opens to routes again once unlocked (keycard) or blown. Guards inside
  the server room cannot leave until then; outsiders cannot enter.
- **Sinking through the stairs:** the two nav links joining the floors were
  straight lines shallower than the steps (a step is 0.225 m up over 0.3125 m
  along), so on the upper half of a flight a guard's feet were up to 0.4 m
  inside the concrete. Links now run along the nosings. The test walks every
  point of every link and fails if any is inside a step.
- **Takedown through a wall:** `canBeTakenDown(you, world)` now ray-casts from
  your chest to his; a wall, shut door or pane of glass blocks it.
- **Debrief clock** now counts whole seconds (floor, not round): 4:59 always
  means Quick Work, 5:00 never does (the rule is `time < 300`, Rhys: strictly
  under five minutes).
- Tests: 58 in mission0 (stairs links, locked door as a wall), 23 in fight
  (takedown reach). Each fails on the old code.

## M6.7.6 — guards leave the steel door alone; crates stop restocking
- **A guard walking past opened the locked reinforced door** (`openDoors` did
  `d.unlock()` then `use()` on any door within 1 m). It now skips a locked
  reinforced door; an unlocked one opens for anyone. The guard-room door
  (locked, not reinforced) still opens for guards - say if that should change.
  (Shots are not blasts; they never opened it.)
- **Crate restock exploit:** swapping a utility out of a crate deleted its
  ammo, so swapping it back (or another type in) came full. `Arsenal.reset(
  loadout, { keep: true })` now remembers the count of a pouch put down
  (`this.stash`); used for finite crates only. The Quartermaster, the loadout
  screen and new missions still fill pouches, as before.

## M6.7.5 — only a charge takes a door off; the FLOOR 2 sign
- **Every blast within 2.4 m breached doors** (smoke, flash and frag included,
  and reinforced doors too). `detonate` now sets `breach: !!w.breach` on the
  blast event and `onBlast` ignores blasts without it: only C5 breaches.
  Frag and flashbang no longer blow ordinary doors either (only kick and
  charge were ever documented) - say if frags should.
- **FLOOR 2 sign:** the stairwell is open on its south side on every floor, so
  that sign never had a wall behind it (in M6.7.3 the duct's side wall backed
  it by accident). It is now at the same height as the others, x 25.3 (clear
  of the duct wall at x 24.4), hung from the ceiling on two thin rods. Floors
  0 and 1 signs still float in the open the same way: rods if they look odd.

## M6.7.4 — the FLOOR 2 sign, first attempt
- Lowered the sign out of the ceiling duct (it was at 9.4 m; the duct's floor
  is 9.15 m and its side wall cut through it). Left it floating: see M6.7.5.

## M6.7.3 — dividers are desk-coloured; guards hit on stairs
- The open-plan office partitions were `cont_grey` (shipping-container
  texture): now `wood` like the desks.
- **Guards shot on stairs sat in mid-air.** A fall is held part-way when
  something behind him "catches" him, but only walls were checked, not that the
  floor stayed level; on a stair it drops away. `Guard.levelRoom(yaw, world)`
  measures the level floor behind; a fall with uneven floor turns further
  (up to about 90 degrees) to fall along the step, or holds short of the drop.
- Accepted for now (Rhys): a guard's head can clip into a wall or door frame in
  a doorway pile-up. Real fix is the ragdoll milestone (M9).

## M6.7.2 — the smoke crate on the wrong floor
- `crateNear()` measured distance across the floor plan only, so the smoke
  grenades on the ground-floor break-room table could be opened from the floor
  above. It now needs the same floor (within 1.6 m vertically).

## M6.7.1 — front doors and a speed trophy
- **Glass front doors:** the door list was scanned in order and the first door
  within 1.6 m won, so the second leaf could hardly be picked. Now the nearest
  door wins; crouched, the one nearest the crosshair. Standing (walking in),
  both leaves of a pair (`def.pair === 'front'`) open or shut together;
  sneaking, only the chosen one.
- **Quick Work** trophy (hidden): finish in under five minutes, kills
  irrelevant (`Mission.trophies`, `time < 300`).

## M6.7.0 — a ceiling duct, smoke on a desk, V for vision
Playtest of M6.6.1–M6.6.2 (indoors still ~10–15 fps, outside 25–43).
- **The kitchenette duct still walked you past the server-room pair and the
  patrol** (Rhys) — the test proved they could not *see* you, but the route
  crossed the whole hall. Replaced by **a ceiling duct**: the comms room is
  beside the top of the stairs; climb its crate, climb up into the duct (its
  floor 1.95 m up, 1.3 m inside, 1.5 m wide on the long run), crouch west over
  the stairwell and south above the hall — guards walk underneath — into the
  server room, and drop through a hatch into the aisle between the racks.
  Leaving by the door, the two outside have their backs to you: takedowns.
  The floor duct, its wall openings and the patrol's U are gone (the loop is
  back); two ceiling lamps moved clear.
  *Found on the way (the crawl test, step by step):* the side walls ran to the
  lip, so the climb saw a wall to the ceiling ("too high"); the player came off
  the crate off-centre and caught the wall ends (the run widened); **the wall
  helper always leaves a lintel over an opening** (0.3 m), so the comms room's
  west wall, the stair enclosure's wall at x 28 and the server room's north
  wall are built by hand where the duct passes, at ceiling height.
- **Smoke grenades on the break-room table** (Rhys: find them like the
  keycard) — a box (the Crate mechanic: E, choose which slot to swap). The
  van's supply crate, which stood behind where you start, is gone.
- **V is for vision modes** (Rhys): night vision, thermal, UV, EMF, normal —
  only normal exists; V says so. **First or third person moved to Settings**
  ("View"; first by default, applied on deploy). A saved binding for the old
  view key carries over to vision (`loadSettings`).
- Tests (51 for Level 0): up the crate, into the duct, along it and down into
  the server room; guards' routes pass under the duct; the way from the
  stairs to the comms room out of the pair's sight; smoke on a ground-floor
  desk. In a browser: the vision message shows; no errors.
- **Casino map (preliminary)** received — see the roadmap. Its Info tab still
  holds the factory's text.

## M6.6.2 — a quiet way into the server room, and smoke on offer
Rhys chose two of the three options for making **Unseen** possible (very
difficult, not impossible): the service duct and smoke grenades.
- **The service duct** (level_mission0): from a low opening (0.75 m) in the
  kitchenette's west wall it runs west, turns north along the server room's
  south wall and comes in low beside the terminal. 1 m wide, 0.75 m high
  inside — prone only (you lie at 0.62 m; standing, you stop at the wall).
  A hint in the kitchenette explains it.
- **The operations-floor patrol** now walks a U — the north side, down the
  east side and back — instead of a loop round the server room: any duct had
  to cross the loop, and the quiet south side is the point of the route.
- **A supply crate by the van** (the Crate mechanic): smoke grenades (×2 in
  it), a spare flashbang and a charge; swap either utility slot for smoke if
  your plan calls for it. Guards cannot see through smoke (M6.4.1). A hint
  points it out at the start.
- One of the operations floor's cover crates sat in the duct's path (found by
  the crawl test stopping 1.7 m in); moved west.
- 4 tests (51 for Level 0): crawl from the kitchenette into the server room;
  standing you cannot get in; **the way from the top of the stairs to the
  kitchenette door is out of the server-room pair's sight** at every point;
  the supply crate offers smoke.

## M6.6.1 — guards take turns to talk
Playtest of M6.6.0. **Baked lighting on Rhys's Chromebook: the bake took
1.9 s; indoors went from 10–11 fps to 17** (outside 30–50), the game's code
still ~2 ms — drawing is still the indoor bottleneck, but much improved.
- **The chatter came thick and fast, repeated, and did not always fit.**
  Now guards take turns (mission_runtime `bark`): urgent calls (alert, hit,
  man down) always go through; anything else needs 2.2 s since any line, 6 s
  since that man last spoke, and 12 s since that kind of line. A line is never
  the same as the last of its kind (`lineFor(…, avoid)`; recorded takes
  likewise). **Once the building is on alert** (you have been seen, or shots,
  a kill or a breach), "Hm? Who's there?", "I'm going to take a look" and
  "Probably the pipes again" give way to alert versions (`ON_ALERT`:
  "Movement!", "Checking it.", "Clear here. Keep looking.").
- 2 tests (22 fight): no line repeats its predecessor; alert lines replace
  the easy-going ones.
- **Unseen may be impossible (Rhys).** Analysis: the keycard can be taken
  unseen (the security guard faces his desk: a takedown from behind), but the
  server room's only door is flanked by two guards facing the open hall the
  patrol sweeps. The one unseen line is a flashbang and two takedowns while
  they are blind — and the bang brings the patrol, who finds the bodies and
  raises the alarm. Options put to Rhys: a service duct into the server room,
  smoke in the kit, or a guard rotation that leaves a gap.

## M6.6.0 — baked lighting (step 1 of the plan), Level 0 first
The plan's first step: the original-Battlefront look Rhys wants, and the cure
for indoor frame rate (outside 28–34 fps, inside 10–11, the game's code only
2–3 ms of each frame: the live indoor lights).
- **How:** PlayCanvas's built-in lightmapper. `buildMergedMeshes(…, atlas)`
  lays out a second set of texture coordinates — every face its own patch,
  packed in rows (`packLightmap`), huge faces capped at 16 m. Level meshes are
  `lightmapped` (not glass, not the glowing lamps); the indoor lights and the
  sun are `bake: true, affectDynamic: true` — painted into the level once, and
  still lighting people as they move. `view.bakeLighting()` runs once after the
  scene is built: every indoor light on with a small (256) shadow map for the
  bake, lightmaps up to 1024, then the lights go back to lighting only people.
  **Any failure falls back to live light**; the debug line says which
  ("baked light N ms" or "LIVE light (bake failed)").
- **Level 0 only for now** (`level.bake`); Yard 7 and the course keep live
  light until this is proven on Rhys's Chromebook. **`?live`** in the address
  turns the bake off, to compare.
- In the sandbox (software rendering): the bake succeeded, no errors, 16.8 s
  (a real graphics chip should be many times faster — to be confirmed); the
  baked and live pictures are almost identical, which is the aim. The frame
  rate there barely moved (0.55 → 0.60): a software renderer is held up by
  other things, so the real measure is Rhys's debug line indoors.

## M6.5.1 — bodies fall across each other; lighter people to draw
Playtest of M6.5.0 (fine), with screenshots of the bodies.
- **Guards sat slumped on other guards** (the screenshots: piles at doors and
  corridors, where guards fall where the last one did). Only a **wall or a
  door** now makes a guard slump; a colleague on the floor does not — he
  twists a little to miss him if he can (±0.4 rad), and otherwise **falls
  across him**. Test: five shot on one spot in the open — none moved, none
  slumped.
- **Frame rate: it is the graphics.** Rhys's debug line read "10 fps (game
  code 2–4 ms of 100)": the game's own code uses 2–4 ms of each 100 ms frame.
  So people are now lighter to draw (`tools/build_operative.mjs`): the boots'
  fine buckles simplified (meshoptimizer, 9,172 → 2,954 triangles) and every
  unused vertex dropped (the head carried all 7,281 of the old body's; it
  uses 1,610). **27,024 → 16,432 vertices per person (−39%)**, the model
  3.64 → 3.05 MB. The two belts are genuinely different (6 cm apart) and
  stay. Checked close up: the boots look the same. **Re-upload
  `assets/characters/Operative.glb`.**
- **Next if still slow:** Settings → Quality → Low turns off the sun's shadows,
  halves the indoor lights and lowers the resolution; the fps there says which
  of those is the cost.

## M6.5.0 — takedowns, the debrief, and why the end screen never showed
Playtest of M6.4.0 and M6.4.1.
- **Takedowns** (M6 stage 4, Rhys: "F to takedown"): behind a guard (outside
  110° of where he looks), within 1.5 m, on his level, while he has not got
  you in his sights — or any side while he is blinded — the prompt reads
  **"F Take him down"**. Bare hands choke him out (a knockout); holding the
  knife kills. A scuffle heard only right beside you. `Guard.canBeTakenDown`,
  `takenDown(lethal)`; counted in the debrief.
- **The end screen was never seen — two causes.** (1) The extraction was a
  2.6 m circle on the building side of the van, unmarked: coming back round
  the far side you were outside it and nothing happened. Now the whole van
  (4.4 m round its middle), **reached with the file ends the mission by
  itself**, and a glowing ring marks it once the file is yours. (2) Ending the
  mission lets go of the mouse, and **letting go of the mouse always opened
  the pause menu — on top of the end screen**. It no longer does over another
  screen. Found by looking at a screenshot: the state check said the end
  screen was showing.
- **The debrief** (Rhys): replaces the end screen. MISSION SUCCESSFUL or
  **MISSION FAILED — why**; the objectives ticked or crossed; time,
  casualties, knockouts, takedowns, times spotted, **accuracy** (rounds that
  hit a person / rounds fired, per weapon), headshots, **favourite weapon**
  (the one that put most down, else the one fired most), doors breached;
  trophies and accolades.
- **Death on a mission ends it**: a failed debrief (no trophies), "Restart the
  mission" or back to Yard 7. **Why grenades did not come back:** the death
  screen's **Redeploy** revived you on the spot with whatever you had left —
  on the mission it now never appears; in Yard 7 it (and Respawn) give you
  your **starting kit** (`arsenal.reset(loadout)`, not the Quartermaster's
  larger restock).
- **Frame rate:** guards' thinking costs ~0.05 ms a frame, but route-finding
  (25–35 ms a route) spiked a frame to 114 ms when several planned at once.
  Now at most **one route in the building per frame**, and a guard re-plans
  at most once a second. The debug line now shows **"game code N ms of M"**:
  if N is small and M large, the slow part is the graphics, not the game.
- Tests: 20 fight (takedowns from behind / not in front / not once alert /
  any side when blinded; hands knock out, knife kills; the route ration),
  47 Level 0 (debrief figures; death fails the run, no trophies).
  Sabotage-checked: takedowns from the front fail.

## M6.4.1 — flashbangs blind guards; smoke hides you
Rhys: flashbangs alerted guards but did not disorient them. They didn't: a
blast carried `flash` and `smoke`, but guards only ever *heard* it.
- **Flashbang** (`Guard.flash`): a guard with a clear line to it (a wall
  spares him) is **blinded** for up to 4.5 s — `blind × √(1 − d / 9 m)`,
  ×0.55 if he was looking away — and **deafened** 30% longer (footsteps
  heard at 15%, gunfire at 30%). While blind he sees nothing, cannot shoot or
  walk, and staggers (the hit pose), crying out ("Flashbang! I'm blind!",
  "Argh — my eyes!"). When his sight returns he searches where it went off.
  An easy knockout.
- **Smoke**: guards cannot see through a cloud (a 4.5 m sphere, 18 s) — a
  sight line passing through it is blocked (`ctx.smokes`).
- 3 tests (16 in fight): blinded in front — at no moment sees you, no shots,
  staggering, then searches; a wall spares him, looking away helps; smoke
  hides you and its clearing reveals you. The first sabotage (a flashed
  guard who could still see) **passed** — two rules each stopped him — so the
  test now checks sight itself at every step; then it failed as it should.
  In a browser: blinded, staggering, the line spoken, no errors.
- How-to page: flashbangs and smoke.

## M6.4.0 — slumped against the wall, and three more trophies
Playtest of M6.3.3: bodies mostly looked right.
- **Slump against the wall, don't move the body** (Rhys). The death clip was
  measured in a browser (`FALL_CURVE`): for 0.7 s his knees buckle (head
  1.59 → 1.30 m, not moving back), then he topples — head 0.12 m back at
  0.77 s, 0.7 at 0.97, 1.0 at 1.07, lying 1.2 m back from 1.27 s. Now, with
  room behind him (allowing a twist of ±0.4 rad to miss another body), he falls
  full length; without it he **slumps against whatever caught him** — the clip
  is held (`slumpTime`) at the moment his head would reach it, 0.22 m short.
  **Bodies are never moved** any more. His hat drops in front of him when he
  slumps. What stops him: a wall at his hips or back, or a colleague lying
  there (`roomBehind`). Checked in a browser: slumped half-sitting against the
  shut secure door. Tests: five on one spot — the first falls full length,
  the rest slump, none moved; back to the door — slumps, head short of it; in
  the open — full length.
- **Three hidden trophies** (Rhys):
  - **Unseen** — the file downloaded before any guard **saw** you (a red
    alert). Guards wondering (amber) is allowed. "VERY DIFFICULT."
  - **No Witnesses** — every guard in the building killed or knocked out.
  - **Sharpshooter** — every kill a headshot (at least one kill; knockouts
    don't spoil it). Headshots are counted per kill (`target.headshot`).
- **Accolades:** the end screen now lists everything earned this run — new
  ones as **Trophy earned**, ones already held as **Accolade** (grey). It also
  shows headshots (of kills). Nothing is awarded before the mission is over.
- 8 new tests (45 for Level 0).

## M6.3.3 — sneaking works, bodies fall where there is room, a front and back door, credits
Playtest of M6.3.0–M6.3.2, with screenshots.
- **Guards were too aware to sneak up on** (Rhys: approached quietly from
  directly behind, they should not know until they see you or are told).
  Two causes: within 1.5 m a guard sensed you *whichever way he faced*; and
  hearing grew in a straight line with noise, so a crouch-walk carried 2.4 m.
  Now there is no sensing from behind, and hearing reach goes with the
  **square** of noise: a sprint still carries 16 m, a walk 4 m, a crouch-walk
  under half a metre. New test: creep from 3.3 m to 0.7 m behind him,
  crouched, then stand still behind him — nothing (sabotage-checked).
- **Bodies in heaps, and an arm through a shut door** (screenshots). The
  death clip falls **backwards** — measured in a browser: facing north, the
  head lands 1.2 m south. A guard now **chooses where he falls**
  (`settleFall`): his own facing first, then turning a little, then a lot,
  taking the first way with ~1.6 m clear behind him (no wall, door or other
  body); failing all, he is moved to clear ground nearby first. Tests: five
  shot on one spot fall clear of each other; one with his back to the shut
  server door falls away from it (both sabotage-checked).
- **Hats fall off** when a guard goes down, to the floor beyond his head
  (screenshot: they stayed upright in mid-air).
- **Two living guards stood inside each other** (screenshot): everyone
  answering an alarm went to the same spot. Now the first goes to it and the
  rest take places on two rings round it (1.6 m, then 3 m).
- **A proper front and back door** (Rhys). Front: a glazed entrance — fixed
  glass either side, a glass fanlight, a pair of glass doors (`frontDoors`).
  Back: the loading bay's shutter is down (slatted, "LOADING BAY"), with a
  **sturdy steel door** beside it (`backDoor`). Route tests open them first.
  Sixteen doors now.
- **Every door is drawn in its own material.** The renderer drew every door
  as the wooden one — the "reinforced" secure door had looked like an office
  door all along. Now wood, metal and glass as defined.
- **Dying restocks you** (Rhys): respawning in Yard 7 or on the course now
  refills everything (`restockAll`); a mission already restarts with full kit.
- **Credits** get a screen of their own from the title menu (music, voices,
  models, sound effects, with licences); the title keeps one line pointing to
  it. Checked in a browser: open and back.
- Tests: 40 for Level 0, 12 detection.

## M6.3.2 — the guards' own voices, and real sound effects
Rhys: his folder is `assets/voices`, not `assets/voice`. The game looks for
files by exact path, so it would have found none and quietly fallen back to
the synthetic voice: **the game now uses `assets/voices/`** to match the
repository. He sent six Kenney packs (all CC0); the voice lines he could not
find were there, prefixed `war_`.
- **Guards speak recorded lines** (Kenney, *Voiceover Pack*, male): "Target
  engaged!" / "Look out!" (spotting you), "Reloading!", "Medic!" (a
  colleague down), "Get down!" / "Cover me!" (shot at), "Call for backup!",
  "Go, go, go!", "Hold!". `RECORDED` entries now carry their own words, and
  `Voices.say` returns what was actually said, so **subtitles match the
  audio**. Lines without recordings stay synthetic. The female takes are kept
  in `assets_library/voices_female/` for female guards.
- **New behaviour to go with them:** a guard who raises the alarm asks for
  backup a moment later, and the first to answer (bold if possible) says he is
  coming; a steady guard says "Hold!" when he holds his station; **a round of
  yours that misses a guard by 1.4 m or less** makes him duck and shout, and
  sends him looking (he knows he is being shot at) — once per 6 s each.
- **Recorded sound effects** (`SFX` in audio.js; Kenney *Impact Sounds* and
  *RPG Audio*), each falling back to the synthesised sound until loaded:
  footsteps on **concrete, carpet and wood** (grating and water stay
  synthesised; Meridian House's upper floors are carpet via
  `level.surfaces`); bullets striking **metal, glass, wood** or anything else
  (yours, and the guards' misses); **punches and butt-strokes** that land; a
  **knife** slice and draw; a real **door opening** (Rhys disliked the
  synthesised one — the closing thud he liked stays).
- `test/voice.test.mjs` (5): every recorded line, radio call and effect has
  its file; subtitles for all; credits for VoiceBosch, Kurt and Kenney. In a
  browser, after Begin: 23 voice clips and 39 effects loaded, none failed.
- **Upload:** `assets/voices/` (9 new files, CREDITS updated) and
  `assets/sfx/` (39 new files and a CREDITS.txt).

## M6.3.1 — recorded voices: the handler on the radio
Rhys found CC-licensed voice packs on OpenGameArt (the Kenney pack to follow).
Nothing here could be listened to, so contents were identified by file name
where named, and otherwise by an offline speech recogniser (pocketsphinx)
checked against named files first — good on clear phrases, unreliable on
others. Only clips whose content is certain were used.
- **"Control" on the radio** (`RADIO` in voice.js; VoiceBosch, *Radio
  Soldier*, **CC BY-SA 4.0**): "Entering hostile territory." and "You're on
  your own. Good luck." at the start; "Enemy on the move." the first time a
  guard spots you ("Watch your six." after); "Tango down." for your first
  kill, "Target neutralised." after; "Good work, soldier." for a knockout;
  "Objective secured." and "Get to the extraction point." with the file;
  "Mission accomplished." at the end. Lines queue and play in turn, each once
  loaded, subtitled in blue as **Control**.
- **Guards hit and still standing** grunt (`RECORDED.hit`: Kurt, *Soldier
  Voice Acting*, wounded.ogg cut into three, **CC BY 3.0**) instead of the
  synthetic "Argh!". Their spoken lines stay synthetic: none of the packs has
  lines like "Hm? Who's there?".
- All recorded files are loaded as soon as the mission begins
  (`Voices.preload`); a line not yet loaded is spoken synthetically meanwhile.
- **Credits** on the title screen and in `assets/voice/CREDITS.txt` (a
  licence condition; the CC BY-SA files stay CC BY-SA). New
  `test/voice.test.mjs` (3): every named file exists, every radio call has a
  subtitle, the credits name both authors and licences.
- **Received and not used yet** (see FRONTLINE_ASSETS.md): Charlotte Duckett's
  female radio lines (for female guards), XCVG's "Officer down" and
  "Police, on the ground!" (a police faction), the Soviet-style march.
  **Not suitable:** Kurt's other packs (medieval-fantasy unit responses),
  the "Voice Samples" compilation (fantasy merchants), XCVG's longer clips
  (satire, some offensive), the A–Z letters.
- **Upload:** a new folder `assets/voice/` (15 files).

## M6.3.0 — ranks, weapons and temperaments
Playtest of M6.2.0: synthetic voices are fine for now. Rhys asked for ranks
(hats or uniform, still recognisably one side), different weapons, and some
guards readier to react and reinforce while others keep to their stations.
- **Ranks** (`RANKS` in guard.js): **guard** (a dark knit cap), **sergeant**
  (a maroon beret, worn to one side, with a badge), **officer** (a peaked
  cap: crown, band, visor, gold badge; and his uniform a shade darker). All
  one red uniform, so they read as one side. Hats are built in code from
  simple shapes (`makeHat` in character.js) and follow the head bone. An
  officer's shout carries 1.6× as far, a sergeant's 1.2×.
- **Weapons** (`ARMS`): **carbine** (bursts, 30 rounds, 9 damage, falls off
  past 8 m), **pistol** (1–2 shots, 12 rounds, 11 damage, falls off past
  6 m), **marksman rifle** (single slow shots, 5 rounds, 26 damage, sure out
  to 25 m, slower to react). Each carries the matching model (AR_1,
  Pistol_1, Sniper_1) and sounds like it.
- **Temperament** (`TEMPER`): **bold** guards answer an alarm from 1.5× as
  far and go wherever the trouble is, up or down the stairs; **steady**
  guards answer only from 0.6×, and hold their station for anything more
  than 7 m away or on another floor — turned to face it, weapon ready,
  until it comes to them or fades.
- `raiseAlarm()` moved into guard.js (testable), used by the runtime.
- **Who is who in Meridian House:** lobby — guard, carbine, bold; security —
  guard, pistol, steady (his CCTV desk); loading bay — guard, **marksman**,
  steady; open plan — guard, carbine, bold; first-floor corridor — sergeant,
  carbine, steady; server door — sergeant and guard, carbines, steady; the
  operations floor patrol — sergeant, carbine, bold; the guard room — two
  bold guards (carbine, pistol): the reinforcements; and a new **officer**,
  pistol, steady, at his desk in the **commander's office** (eleven guards).
- **Rhys, for later:** red-for-enemy is right for the training mission, but
  on true missions sides must be told apart by **uniform**, not colour.
- 5 tests (13 in fight): every guard has a rank, weapon and temperament and
  there is an officer, with three weapons and three hats in use; pistol
  slower than carbine, marksman slowest and hardest; marksman sure at range
  where a pistol is not; a steady guard holds his post where a bold one goes
  (sabotage-checked); an officer's shout brings more men, bold ones answer
  from further than steady ones. Hats checked on screen.

## M6.2.0 — stage 3: they shoot back, and they speak
Rhys, after M6.1.0: "it'll need enemies attacking you, AND actual audio
dialogue — not just subtitled text."
- **Guards fight** (`src/sim/people/guard.js`, `FIGHT`): alerted and able to see
  you, a guard waits **0.55 s** to react, then fires his carbine in bursts of
  3–5 rounds 0.11 s apart, 0.6–1.3 s between bursts; 30 to a magazine, a
  2.4 s reload ("Reloading!"). **9 damage** a hit (yours hit harder: a game
  you should win). Out of sight he stops shooting and, after 4 s, searches.
- **How well he shoots** (`hitChance`, tested): 0.6 at close range standing
  still in the open, falling past 8 m to a fifth at 36 m; crouched ×0.75,
  prone ×0.55; moving ×0.8, sprinting ×0.55; only half of you in view (eye
  or chest, not both) ×0.5; his first rounds less sure, settling over about
  1.5 s. A miss passes within a metre or so of you (further at range),
  snaps past, and marks whatever it strikes.
- **Shot by you and still standing**, he cries out and turns to find you.
- **Their guns**: the same carbine as yours, in their hands
  (`weapons_view.spawnModel`: built and turned like your own); slung when
  they fall. **Muzzle flashes and tracers**; their shots **heard by
  distance** (`audio.shot(w, far)`), and heard by other guards too.
- **Voices** (`src/game/core/voice.js`): lines are **spoken**, by the browser's
  own speech synthesis (built into Chrome and ChromeOS), as a stand-in for
  recordings. Each guard has his own voice, pitch and pace from his name, so
  he always sounds like himself; quieter with distance; only near you; an
  important line (an alert, a hit, "Man down!") cuts across chatter. Subtitles
  stay. **To replace a line with a recording:** put the files in
  `assets/voice/` and list them in `RECORDED` under the line's key — they
  then play instead, through the game's audio.
- **Lines** (`LINES` in guard.js): two to four ways of saying each thing —
  suspicious, search, nothing, alert, lost, manDown, wake, reload, hit,
  shotAt — picked at random.
- **Bug found in the browser, not by the Node tests:** a guard's miss called
  `addMark` with `hit.point`, which a raycast result does not have (it gives
  `t`, the distance) — every miss threw, and with it the rest of that
  frame's guard update, so no round ever seemed to land. The point is now
  worked out from `t`. Lesson: game-side code that Node cannot run needs one
  browser run before it ships.
- `test/fight.test.mjs`, 8: a reaction delay then a burst; a shaky hand
  misses near you; bursts, pauses, and the reload call; no firing through a
  shut door (sabotage-checked); none once down; the accuracy rules; shot
  from behind, he cries out and turns; every line has variants. In a browser:
  the security guard spotted you, raised his carbine and brought you from
  100 to 55 over eleven rounds, with no errors.
- **Still to come in stage 3:** taking cover, moving while fighting,
  factions as a table, and a difficulty setting.

## M6.1.0 — stage 2: the guards notice you
Rhys: M6.0.4 closes stage 1. Now detection.
- **Awareness** (`src/sim/people/guard.js`): each guard has 0–1, filled by what he
  sees and hears, fading after 1.5 s of nothing. **States:** *patrol* →
  *suspicious* (≥ 0.3: stops, turns to it, "Hm? Who's there?") → *search*
  (≥ 0.6, or still wondering after 2.5 s: walks to where you **were**, looks
  about for 6 s) → *return* (back to his post or route) — and *alert* (1.0
  while he can see you: faces you, weapon up, "There! Intruder!"; loses you
  for 4 s → searches your last known place). Fighting back is stage 3.
- **Sight:** 28 m; the middle of his view (±34°) counts fully, the edge
  (to ±60°) less; within 1.5 m he knows you're there whatever way he faces.
  A clear line from his eye to your eye or chest — glass does not block it,
  walls, shut doors, partitions and desks do. How easy you are to see:
  distance (far fades), standing 1 / crouched 0.55 / prone 0.3, still ×0.75,
  sprinting ×1.3. Standing 10 m in front of him: about a second.
- **Hearing:** your footsteps by the existing `player.noise` (still 0, prone
  0.05, crouch 0.15, walk 0.5, sprint 1) out to 16 m × noise; gunfire out to
  30 m × loudness (a silencer's 0.25 makes it 7.5 m); blasts (1.6); a kick
  (0.6); a strike (0.25). A wall dulls footsteps to half, a gunshot only to
  0.8; a floor between you smothers anything to 0.3. A sound alone makes him
  suspicious and sends him looking — never an alert: he has to see you.
- **A colleague on the floor** in view: "Man down!" (or "Hey — wake up!"
  for a knockout), a search there, and the alarm.
- **The alarm:** an alert, or a body found, sends every guard within 20 m on
  his floor (8 m through a floor) to search where you were seen.
- **Finding the way** (`src/sim/world/nav.js`): a 0.5 m grid per floor (the ground
  floor takes in the street and lot), cells open where a guard fits (checked
  a little slim, 0.4 m, so 1 m doorways pass on a 0.5 m grid), doors counted
  open (he opens them as he reaches them — even locked ones: he has the key),
  floors joined at the two flights; A* with no corner-cutting, then
  straightened wherever the walk is clear. Built once at mission start
  (~0.1 s); a path takes 25–35 ms.
- **On screen:** arcs round the crosshair for each guard noticing you, on
  his side, amber filling to red; what guards say as subtitles (only near
  you); the radar colours guards by state (amber wondering, red and ringed
  when alerted); a first-time hint; "Times spotted" on the end screen; the
  How-to page explains it.
- Guards take things in 15 times a second (every frame for ten sight lines
  would cost), and at once when there is a gunshot.
- **Level fix:** the two server-room guards stood facing the door they guard.
  They face out now.
- `test/detect.test.mjs`, 11, in the real building: seen in front (alert
  inside 2 s, with the shout); not from behind; a shut door hides you, open
  it and he sees you; crouched is slower; a sprint behind him heard and
  searched; a crouch-walk not heard; a shot heard 20 m away on the same floor
  but not two floors up; a silenced one not; a search through a shut door and
  back to his post; the alarm reaches his partner but not the lobby; a body
  found starts a search. Sabotage checked: sight through walls, and crouching
  that does not help, both fail tests.

## M6.0.4 — headshots, a building in a street, and doors that stay blown
Playtest of M6.0.3: the climbing and floor-hopping glitches are gone.
- **Headshots** (Rhys: shot a guard point-blank in the face and he lived). A
  person's target has a head: the top 0.3 m (`target.headY`, kept up to date
  as a guard walks). A **round** to the head that arrives with at least
  **15 damage** after range falloff (`HEADSHOT_KILL`) kills outright — every
  gun in the game qualifies up close, down to the MP2 (16); a weaker or spent
  round does triple. Fists, pistol-whips and rifle butts stay non-lethal to
  the head too. `target.headshot` is set on the kill.
- **"Isolated, no windows, and very very grey."** New painted textures
  (added last, so older ones keep their seeds): **brick**, **plaster**,
  **carpet**, **facade** (storeys of windows, a few lit).
  - Meridian House is **brick** outside with a stone band between storeys,
    **glazed windows** all round (2 m wide, sill 0.9 m, kept clear of doors and
    of where the inside walls meet the outside; the glass stops a body, not a
    round), **plaster** inside (inner walls, and a drawn-only lining on the
    outer walls' inside faces), **carpet** upstairs, and warm office light.
  - **Neighbours:** faced buildings across the road (with cornices) and round
    all sides of the lot; two more cars parked in the street (white and red —
    new civilian paints for the code-built vehicles).
- **The secure door said "Step out of the doorway" when you tried to shut
  it.** It had been blown open: a blown door was still treated as an open
  door (and still drawn hanging on its hinges). Now (Rhys): a door **blown by
  a charge** — any door — is off its hinges: gone from view, no prompt, never
  shut again (`breach(from, 'blast')`, `use()` → `'blown'`). A door opened
  **legitimately** (by hand or keycard) opens and shuts normally; a **kicked**
  door's latch is broken but it can be pushed shut.
- 7 tests (37 for Level 0): headshots with the PX9 and MP2 kill, a chest shot
  does not, a rifle butt to the head is still a knockout blow; the secure door
  shuts from anywhere beside it; a blasted door never answers E; a kicked one
  can be shut. Checked the MP2 test fails without the headshot rule.

## M6.0.3 — people are not furniture
Playtest of M6.0.2. Guards still do not detect you (expected: stage 2 is
next). Notes 2–4 were one bug:
- **A patrolling guard walked into Rhys and he ended up on the first floor,
  then the second, then the roof.** `moveV` landed you on the top of
  *whatever* you overlapped. A guard walking into you is an overlap, so you
  were lifted onto his head (1.8 m); standing there, your head was in the
  ceiling slab, so the same rule lifted you onto the floor above; and again.
  Now: **you only land on what you were above before the step, and only bump
  your head on what was above it**; anything else overlapping you moved into
  you, and **pushes you aside** the shortest way (`Player.pushOut`).
- **People are never stood on, stepped up onto, climbed or vaulted** (Rhys:
  "you should NOT be able to CLIMB people"). A guard's body is marked
  `person` (and `noClimb`); `groundBelow` also ignores people and disabled
  solids (it used to count dead guards' bodies).
- **Guards wait rather than walk into you** (`Guard.step(dt, blockers)`).
- 4 tests (30 for Level 0), with the real lobby guard: walked into, you stay
  on the floor and are pushed aside; he waits for you; no climb or vault is
  offered on a person; dropped onto one (in the open — indoors the rooms are
  too low to fit above a guard) you end up on the floor. Putting the old
  landing rule back reproduces the report exactly ("lifted to y=3.60").

## M6.0.2 — knocked out is not killed; a lighter Level 0
Playtest of M6.0.1: works as a training mission; better once guards detect
and fight back (stage 2 and 3). Notes:
- **Pistol-whips, rifle butts and fists are non-lethal** (Rhys): knock every
  guard out without stabbing or shooting anyone and you still earn **No
  Casualties**. The arsenal now records *how* each hit landed
  (`Arsenal.blow`: shot, blade, fist or bash); a round, a blade or a blast
  marks the target `lethalHit`. A guard who goes down is **knocked out** if
  nothing lethal ever touched him, **dead** otherwise — so shot and then
  clubbed down still counts as a casualty. The end screen shows **Knocked out**
  beside Enemy casualties.
- **Bug found on the way: a strike with a gun (F) did the bullet's damage.**
  `hitTarget` only knew the weapon, not how it was used. A pistol-whip or
  rifle butt now does 30 (two to knock a guard out), fists 14 (five).
- **10 fps on Rhys's machine.** All ten guards were animated and drawn every
  frame wherever they were, and each cast a shadow. Now a guard on another
  floor, or more than 42 m away, is neither drawn nor animated (he still walks
  his route), and guards cast no shadows. In the sandbox's software renderer
  (which mostly measures drawing) the lobby went from 0.65 to 0.75 fps; the
  saving in animation should show more on a Chromebook. If it is still slow,
  Settings → Quality → Low halves the indoor lights.
- 6 new tests (26 for Level 0): pistol-whip, rifle butt (two blows, 30 each),
  fists → knocked out; knife, bullet → casualty; shot-then-clubbed →
  casualty; ten knockouts still earn the trophy. Checked the rule fails when
  broken.

## M6.0.1 — Begin begins
Playtest of M6.0.0: the Trophies page is liked; the title-screen entry is
fine for now (see the roadmap: levels should later be reached from Yard 7).
- **The mission was unplayable: Begin captured the mouse but left the
  briefing on screen.** `deploy()` hides every overlay it knew about (title,
  start, menu, save slots) and not the two new ones. It now hides the
  briefing and the end screen too. Missed because the browser run used
  `?test`, which skips the briefing: **a new browser test clicks Begin on
  the real page** and checks the briefing goes and play starts. Lesson: when
  adding a screen, test the way into it and out of it as a player would.
- **Hints covered the middle of the screen.** They sit top left now, under
  the objective line, smaller (13 px, 360 px wide); the opening hint is
  shorter (the briefing already says the rest).

## M6.0.0 — Level 0: the training mission (M6 stage 1: guards exist)
Rhys: the first encounter belongs on **Level 0** — a training mission, but a
*mission*, not part of Yard 7 — where the rest of the game is learnt properly.
His brief: infiltrate an occupied office building; retrieve a file from a
private-network computer in a reinforced, heavily guarded room. Three floors
(his change to the first plan): the second floor only by the stairs from the
first; the server room in the middle of a larger room; other rooms round it.
And a place to learn **breaching**, with a moment of **bullet time**.
Hidden trophy: **No Casualties**.

- **A level of its own.** `index.html?level=0` builds `buildMission0()`
  instead of Yard 7 (`src/game/levels/mission0.js`). The title screen has
  **Level 0: Training Mission**; a mission is one page load from the van to
  the end, so leaving (end screen, pause menu) reloads into Yard 7. A
  briefing screen comes first (it is also the click Chrome needs before it
  will capture the mouse). Missions are not saved part-way (`saveNow` is off).
- **Meridian House** (40 × 20 m, floors 3.6 m apart, all axis-aligned):
  - *Ground*: lobby with reception desk, security office (**the keycard**,
    CCTV desk), stairs, toilets, corridor, storage, break room, loading bay.
  - *First*: open-plan office (desk clusters with partitions: cover), stairs,
    manager's office, meeting room, **IT office** (a network map on the wall
    says where the server is).
  - *Second*, only via the stairs: commander's office, comms room, the
    **operations floor**, and in its middle the **server room** — reinforced
    walls, a reinforced locked door, racks and the **private-network
    terminal**; the **guard room** (locked: the breaching lesson) and a
    kitchenette.
  - Outside: the street and the van you arrive in (and leave by), cars and
    skips round the back, buildings across the road.
  - **Three ways in**: the front doors; the loading bay's roller door; the
    **fire escape** — a ladder up the street side to a landing, then vault in
    through a first-floor window.
  - Thirteen ordinary hinged doors, thirty lights, one stair shaft with two
    flights (a 2 m walkway between them on the first floor).
- **Guards** (`src/sim/people/guard.js`): ten reds — lobby, security office,
  loading bay, open plan, first-floor corridor, two at the server door, one
  patrolling the operations floor, two in the guard room. They patrol routes
  or stand at posts looking about; their bodies are shootable targets (the
  range system), so weapons, blasts and **the radar's knowledge rule** work
  with no extra code. Shot down, they die and stay down. **They do not
  notice you yet** (stage 2). Drawn as the operative's own model, loaded
  once and shared, in a **red-tinted** copy of the uniform. Not yet carrying
  weapons.
- **The mission** (`src/sim/play/mission.js`, `src/game/levels/mission_runtime.js`):
  take the keycard (E); use it on the server door (E); **hold E** at the
  terminal to download (4 s; progress kept if you let go); then back to the
  van (E). The objective line, the radar's diamond, and the end screen (time,
  enemy casualties, doors breached, trophies earned) follow it.
- **Breaching.** **F at a shut door kicks it** (on a mission): an ordinary
  door gives 80% of the time, a sturdy one 45%, a reinforced one never; a
  failed kick is noise ("It held"). **A breaching charge** (C5 — the mission
  kit swaps frag for C5) blows any door within 2.4 m: ordinary ones fly open,
  the reinforced one is blown off entirely. **A successful breach gives 1.5 s
  of bullet time** at a quarter speed — the whole simulation, not your view —
  with a desaturated screen and a deep swell.
- **Hints**, each once, where they belong: the start, the radar (the first
  time you sense someone), the keycard, the IT office's map, the fire escape,
  the guard room's locked door, the server door (with or without the card),
  the terminal, and "get out" once you have the file.
- **Trophies** (`src/game/core/trophies.js`): hidden achievements, kept in the
  browser across save slots. Nothing lists what exists; the end screen
  announces a new one; **Pause → Trophies** shows only those earned. The first:
  **No Casualties** — complete Level 0 without killing anyone.
- **A movement fix found on the way:** looking for a ledge took the highest
  solid in a 2.35 m slice in front of you — at a window, the wall *above* it
  — so no window lower than that could be vaulted through. The ledge is now
  the top of what stands in front of you, stacked from the ground up; anything
  above a gap is ignored (the room-above check still decides if you fit).
- `Operative` models are cached per URL and shared; `opts.tint` recolours the
  clothing on a copy of its material.
- **Tests:** `test/mission0.test.mjs`, 20: every way in walked (front, loading
  bay, fire escape and window vault), both flights climbed, the walkway to the
  first-floor corridor, no way to the second floor from outside, the doors and
  locks, kicks and charges, guards (placement clear of furniture, patrols,
  moving bodies, death), the download, extraction and the trophy. Checked the
  front-door test fails when the doors are walled up. In a browser: the level
  loads with no errors, and a scripted run takes the keycard, opens the server
  door, downloads, kicks the guard-room door into bullet time, leaves by the
  van and earns the trophy.

## M5.18.0 — real clothes (shipped together with M5.17.1)
The operative is **dressed**, not painted. The Quaternius **Modular Character
Outfits – Fantasy** pack (CC0, Rhys) is made for the same Universal skeleton
(rest positions within 3.4 cm, the main bones much closer), so its parts fit
and move with every clip unchanged.
- **What he wears:** the Male **Ranger** body (a jacket with a collar and two
  belts), legs (trousers), arms (sleeves, with bare hands in the pack's
  regular-male skin) and boots (buckled). Only the **head and neck** of the
  Universal Base body are kept (any triangle touching the head or neck bones,
  so it tucks under the collar).
- **Recoloured as field kit** (`tools/recolour_outfit.py`): the ranger's
  greens become two tones of dark field cloth, leather goes near-black brown,
  metal stays grey. Only the *local* fold shading is kept, so the pack's
  painted folds and light survive — the **original Battlefront look Rhys
  wants: painted models, baked lighting**.
- **No normal or roughness maps** on anything now: the painted texture does
  the work, as in Battlefront, and the model is lighter to draw.
- **How it is made:** `tools/recolour_outfit.py` (texture) →
  `tools/dress_operative.mjs` (head + parts, re-pointed at our skeleton by
  bone name; `mergeDocuments`, then `unpartition` for one buffer) →
  `tools/build_operative.mjs` (clips, as before). `Operative.glb` is 3.64 MB
  (boots are the heaviest part at 10k vertices).
- `tools/paint_uniform.py` is retired but kept: painting by bone region is a
  quick way to recolour bodies.
- Checked in a browser from the side, front, back and running: no gaps at
  the neck or waist, nothing poking through.
- **Still in the pack, unused:** the Ranger hood and shoulder guard, the
  Peasant outfit (shirt, trousers, shoes — civilians?), and female versions of
  both. Only the male glTF parts were unpacked.

## M5.17.1 — the weapon faces forward; strikes from a crouch
Playtest of M5.17.0: slinging on ladders works; the punches, pistol-whip,
rifle-butt and knife slashes are liked. The ladder climb stays as it is for
now (no real ladder clip exists in the library).
- **Weapons were reversed in third person.** The held weapon points down its
  local −z (as on the camera in first person), but it was given the body's
  rotation, which includes a 180° turn because the body model faces +z. It
  now takes the look direction without the extra half-turn. Checked side-on
  and from behind.
- **Punching (and every strike) from a crouch** no longer stands you up. Five
  new clips made by `composite()`: the strike's upper body (spine up) on
  `Crouch_Idle_Loop`'s hips and legs — `Crouch_Punch_Jab`, `Crouch_Punch_Cross`,
  `Crouch_Sword_Regular_A`, `Crouch_Sword_Regular_B`, `Crouch_Melee_Hook`.
  Lying prone, no strike animation plays (it would stand you up).
- Rhys's art direction, restated: **original Star Wars Battlefront** — painted
  models and baked lighting. Plan for clothing: shells made from the body
  itself (pushed out, smoothed) plus painted textures with the shading baked
  in; usable pieces from the Quaternius Fantasy outfit pack where better.

## M5.17.0 — a ladder climb, a crawl, strikes you can see, a hand that holds
Playtest of M5.16.0: swimming and the other movements are right. Notes:
- **"You've literally painted his naked body"** — yes: the pack has no
  clothes. The paint is now **flat cloth**: shading only at the broadest
  scale (no abs or chest showing through), a soft crease pattern, and
  clothing a body does not have — **knee pads, chest pockets, cuffs**. Still a
  stand-in; real clothes need a Quaternius outfit pack on the same rig (see
  the roadmap).
- **The prone crawl looked like swimming.** New clip **`Crawl_Loop`**: the
  swimming body with every stroke damped right down (arms to 30%, legs to 35%
  around their average pose), so it lies on its front, head up, arms forward,
  and creeps.
- **The ladder looked very odd** (it looped `ClimbUp_1m`). New clip
  **`Ladder_Loop`**, made from two others: the front crawl's **arms** (upright,
  they reach overhead and pull down — hand over hand) on the walk's **legs**
  (damped a little). Both are built by `tools/build_operative.mjs`
  (`composite()`), since the library has neither.
- **Weapons sat at the wrist.** Held in the palm now: 60% of the way from the
  wrist (`hand_r`) to the knuckles (`middle_01_r`).
- **Weapons faced the other way on ladders.** On a ladder, swimming and while
  hauling yourself up, both hands are busy: the weapon is **slung** (hidden)
  and comes back when you are done — or when you switch to first person.
- **Melee did nothing in third person.** The body only reacted to gunfire.
  Now every swing and bash plays a strike, restarting for each blow:
  - **combat knife**: `Sword_Regular_A` then `Sword_Regular_B` — a slash
    one way, then back (note 8);
  - **fists**: `Punch_Jab` then `Punch_Cross` (note 8);
  - **striking with a gun** (F): `Melee_Hook`.
  Not from a ladder or while swimming.
- Checked side-on in a browser (the chase camera never shows a side view, so
  `opr.viewTurn` turns the drawn body for tests): ladder, crawl, knife,
  punch and grip. 9 animation tests, including strikes alternating and
  restarting.

## M5.16.0 — the character swap
The operative is now the **Universal Base Character** (male) on Quaternius's
**65-bone Universal rig**, animated from the **Universal Animation Library 1
and 2** (all CC0). Every future guard and civilian can share this rig.
**Upload `assets/characters/Operative.glb`** with this release; `Swat.glb`
is no longer used and can be deleted from the repository.

- **The model** (`assets/characters/Operative.glb`, 2.35 MB) is built by
  `tools/build_operative.mjs`: the body, 30 clips, textures cut from 2048 to
  1024 (body), 512 (normals) and smaller, the roughness map dropped (fabric
  gets one figure), unused UV sets and vertex colours stripped.
- **A painted uniform.** The base body is bare apart from shorts, so
  `tools/paint_uniform.py` paints a plain dark tactical suit onto its texture:
  suit, a darker vest panel front and back, belt, gloves, boots, stitch lines
  where parts meet; face and ears left as skin. Each part of the texture is
  chosen by the bone its triangles follow (hands → gloves, feet and lower calf
  → boots, and so on), so it fits the model exactly. A stand-in until real
  uniforms are made from Rhys's sheets. The operative is shaven-headed: the
  body ships with eyebrows only (hairstyles are in the zip, not yet fitted).
- **Clips** (all in the model): idle, walk, jog, sprint, crouch idle and
  crouch walk, swim idle and front crawl, jump start/loop/land, roll, death,
  hit, pistol idle/aim/shoot/reload, jab, cross, sword attack and idle,
  interact, `ClimbUp_1m`, `LayToIdle`, overhand throw, knockback — and, for
  later, driving, talking and folded-arms idles (vehicles, dialogue, guards).
- **Only bone rotations and the hips' movement are taken from the clips**;
  the mannequin's bone lengths differ from the body's by up to 4.5 cm, and
  copying them would reshape the body. Hip movement is scaled to this body's
  hip height.
- **What plays when** (`src/sim/people/anim.js`, tested against the model file):
  - walk under 2.6 m/s, **jog** to 5.4 (your normal walk speed is really a
    jog), **sprint** above; each paced so the feet do not slide;
  - **crouch** and **prone** are real poses now — no more squashing the body
    to two-thirds height. Prone uses the front-crawl stroke lying on the
    floor (there is no crawl clip), nearly still when you are;
  - **swimming**: treading water upright when still, front crawl when moving,
    each at its own height so the head sits at the waterline;
  - **climbing, vaulting and going over walls** play `ClimbUp_1m`, timed to
    the move; **ladders** loop it slowly;
  - **in the air**: jump start rising, jump loop falling; a dive rolls;
  - **backwards** plays the walk, jog or crouch cycle in reverse (the rig has
    no back clips; `Walk_Back`, `Jog_Back`, `Crouch_Back` are reversed copies);
  - **sideways** turns the body towards where it is going (up to 90°,
    smoothly) and plays the forward cycle — there are no strafe clips. The
    weapon turns with it. A back roll is the forward roll, body turned round;
  - **death** plays the death clip and holds its last frame — the old
    topple-over-by-86° is gone.
- The blend into a new clip always runs at full speed; a near-still clip (lying
  prone) would otherwise have taken seconds to blend into.
- **Checked in a browser** by measuring bone heights, not just by eye:
  standing head 1.55 m / hips 0.91; crouched 0.83 / 0.49; prone 0.15 / 0.07;
  and screenshots of standing, running sideways, crouch, prone, swimming and
  a climb onto a container.

## M5.15.1 — a quieter door
Playtest of M5.15.0: parkour works, the radar is good.
- **The door-opening sound was cartoonish**: a rising sawtooth "creak". Now
  it is what a door makes: the handle, the latch clicking free, and a soft
  low rush of air as the leaf swings. **The shutting thud is unchanged**
  (Rhys liked it).

## M5.15.0 — parkour, a proper door, a radar that only knows what you know
Playtest notes on M5.14.0, answered in order.

- **Note 1 — a door, and a pointer to the range.** Dropping through the grate
  left the stairs staring at you through a 4.8 m gap, and the ranges (through
  the south opening, on your right) were easy to miss. The gap at x −84 is now
  a wall with an **ordinary hinged door** — 1 m wide, wooden frame, painted
  four-panel leaf, a handle on each face — not a course-style barrier.
  **E opens and shuts it**; it swings *away* from you (or the other way if you
  are standing where it would go), and it will not shut on you ("Step out of
  the doorway"). A rifle round goes through it like a thin wall (tough 2).
  Signs: **WEAPONS RANGE → turn right** beside the door, **WEAPONS RANGE** over
  the south opening, and on the stairs side **through the door, then left**.
  The door shuts again when a course run starts.
  *How it works:* `src/sim/world/doors.js`. Collision is boxes, so a door is in one
  of two places — across the doorway or flat against the wall — and only the
  swing between them is drawn (a pivot entity in `render.js`, turned by
  `door.yaw()`).
- **Notes 2–5 — the void round the stairwell.** The desert's hole was cut to
  x −80..−61, z −4.6..7.6, but the stairwell's shell is only x −74.4..−60,
  z −3.6..3.6. The difference was exactly the three strips reported. The hole
  is now the shell's outline; a test samples every half metre of all three
  strips (and fails with 378 bad samples on the old numbers).
- **Note 6 — parkour.** M5.14.0's jump-and-grab was in, but it reached only
  about 3.0 m against a standing climb of 2.35 m, so it could not be felt. Now:
  - **Over at a run:** sprint at a *thin* wall (≤ 0.7 m) and press SPACE — you
    go over and drop down the far side, if the drop is 3.3 m or less;
    otherwise you stop on top. Walking up and pressing SPACE still puts you on
    top. Prompt: "SPACE Over".
  - **Run-up:** sprint at anything too high to reach from the ground and
    SPACE kicks you a step up it (`P.wallKick` 7.7, apex ~1.4 m), then the air
    grab does the rest: about **3.3 m** is reachable, 4.0 m is not. Needs a
    quarter-second of run-up and enough stamina to finish (a kick you cannot
    follow with a grab is not offered). Prompt: "SPACE Run up". Two quick
    footfalls on the wall as it happens.
  - Traversals are now made of **legs** (a climb up, then a drop down the far
    side) so the body clears the wall instead of passing through it.
  - **A parkour lane in Yard 7**, beside the vault lane at x ≈ 16.5: 1.80 m and
    2.50 m walls, 3.00 m and 3.30 m blocks (with a crate to step down), and a
    4.00 m wall you cannot get up. Height labels as on the vault lane. Two
    scatter crates moved out of its way.
  - Eight tests, including one that runs the real lane end to end.
- **Notes 7–9 — the radar.**
  - **Three ranges:** close 15 m, normal 46 m, wide 100 m. **`,` closer,
    `.` wider; M steps close → normal → wide → off → close.** Saved; both
    keys rebindable. The range is written at the bottom of the dial.
  - **It shows what you know** (Rhys: "the radar should show what *you*
    know"). A contact is on it while you sense it: **seen** (in front of you,
    about 120° across, line of sight, glass does not hide), **heard** (a
    turret firing, through walls, within 40 m — drawn as a ring), or **close
    by** (2.5 m, any direction). Goggles that see heat will report `heat`,
    drawn orange; the goggles themselves are still to build.
  - **Last known positions:** lose a contact and it stays where you last knew
    it was, as a fading outline, for 20 seconds. Downed targets are forgotten
    at once; a course start or a transport clears it. Crates and the objective
    are Ghost's own information and always show.
  - Until M5.14.0 every target showed through every wall. That was never
    information the operative had.
- **Found on the way:** "Skip the movement section" (and starting at the
  weapons half) put you at `[-89, 0, 0]` — pre-sink coordinates — and you
  settled on the crawl tunnel's roof at −6.2 m, outside the building. Now
  `level.weaponsStart`, tested.
- **How-to and controls pages:** parkour and doors added; two stale lines
  corrected (crouch-jumping went in M5.13.0; prone *can* sprint).
- `world.raycast` takes an optional `skip(solid)`, so sight looks through
  glass where a bullet might not.

## M5.14.0 — jump and grab, and a tidier yard
- **Jump and grab**: in the air, moving forward, you now catch a ledge without
  holding SPACE, and haul yourself up — arms out, as Rhys put it. The mid-air
  reach went from 1.5 m to **2.0 m above the feet**, so a run-up and a jump
  will catch a 2.59 m container lip that you cannot climb from standing.
  Two tests: the catch, and that a 4.2 m wall is still beyond you.
- The **jump trench** is 0.8 m narrower (far edge at x -178).
- **The TO THE START panel is gone** — the stairs are the way in now.
- **A rail at the head of the stairs**, along the side of the opening where
  there are no treads, and the rest of the shaft's roof is floored: that was
  the void round the teleport room.
- **The yard's place-name signs are gone** (Vault Lane, Crouch Duct, Catwalk,
  Crawl Pipe, Dive Tower, Drop Test, Vehicle Dock, Ghost Logistics and the
  YARD 7 repeats), with the phantom posts left over from the old welcome
  board. **Kept**: the height markers, and labels on things you use (the
  Quartermaster, the crates, the penetration lanes). **Every sign in the
  training course stays.**

## M5.13.1 — the perimeter gap, and a prompt that followed you downstairs
- **The ring of void round the outside of the wall** was the desert's hole
  being 64 m from centre while the wall stands at 61 — a 3 m gap all round.
  The hole is now exactly the yard (61 m) plus the stairwell's shell, so the
  floor meets the wall on every side. Checked by sampling inside and out.
- **The TO THE START panel answered from the stairs below it.** Both the
  prompt and the press now require you to be within 1.5 m of its own height,
  so it only works at yard level.

## M5.13.0 — movement changes, and the last of the sand
- **"Press C again to stand up" never showed**: that step (and the drop) judged
  height in absolute metres — "above 6 m" — which stopped being true when the
  course sank. They now measure against the course's own marks. A test covers
  it, since this will bite again if anything else moves.
- **You can sprint while prone**: a quick shuffle at 1.9 m/s — faster than
  crawling (1.1), slower than a crouched walk (2.1), and it costs stamina.
- **Crouch-jumping is gone.** SPACE from a crouch or from prone stands you up
  instead; from prone under a low roof it settles for a crouch. Two old tests
  asserting the crouch-jump were retired and replaced.
- The TO THE START sign was back to front; the corridor sign that was half
  inside a wall is gone.
- **The desert now reaches right up to the stairwell's shell** on the west
  side — the gap between the yard wall and the hole's edge was the void you
  could see from the walkway.
- **The road out has a gap cut through the ridge line** instead of running
  into a dune.

## M5.12.1 — deep enough, and a stairwell that works
- **COURSE_DY is now -16, not -12.** The crate hall is 13.6 m tall, so at -12
  its roof still stood above ground and the desert slab cut through it — the
  "sand over the catwalk". Anything sunk must clear the tallest thing in it.
- **The desert's hole** now reaches west to x -80, taking in the stairwell
  shaft (the sand over the stairs).
- **The stairwell is rebuilt**: a shaft 14 x 6.4 m with **four flights**
  turning back on themselves (0 to -4 to -8 to -12 to -16) and **landings
  spanning the whole shaft** at each end. The first version had gaps beside
  the landings and open shaft beyond them — a twelve-metre fall either way.
  Walked end to end: yard gateway, four flights, corridor west, link room,
  no damage.
- The shaft's east side is walled below the gateway (the opening at
  (-60.7, 5.4)); the top of the shaft south of the landing is floored at yard
  level, so the stairs are the only way down; signs pulled out of the walls.
- **Course tests carry `DY`** — now -16. Change both together.

## M5.12.0 — the course goes underground
- **The sand in odd places was the desert floor**: one slab from -900 to 900 at
  y -0.2, which sat *above* the pool's surface and *inside* the course's floor
  slabs, showing through as panels. It is now a **ring** clear of the
  facility's footprint (64 m) and lower (-0.9 to -0.5).
- **The whole training course now sits 12 m below the yard.** Both builders
  write at ground level and then sink everything they added:
  `mark(level)` remembers the counts, `sinkAll(level, marks, from, dy)` moves
  the pieces, solids, signs, lights, ladders, zones, targets, crates and marks
  added since. **Each builder must sink only its own marks** — the first
  version shifted the shared `marks` twice and put the movement course at -24.
- **A stairwell** runs from the yard's west gateway down three flights to -12,
  into a corridor west to the link room under the crawl drop — so the course
  is reachable on foot as well as by the transport panel.
- The welcome board and its slab are gone; **YARD 7** signs are dotted round
  the inside of the perimeter wall under the walkway.
- Course tests take `DY = -12` — worth knowing if the course ever moves again.

## M5.11.0 — a place, and things to look at
- **Where Yard 7 is: a high desert plateau.** Beyond the wall there is now a
  desert floor to the horizon, a ring of stepped ridges (210-330 m out), three
  mesas on the skyline, a radio mast, a water tower, and the dirt-and-asphalt
  access road running north from the hangar doors. All non-solid and far away.
  New textures: `desert`, `rock`, `asphalt`. **Fog pushed back** from 45-190 m
  to 120-850 m and warmed, or none of it would be visible.
- **Ladders have rungs** (`src/game/draw/ladders.js`): two stiles, a rung every
  30 cm and wall brackets, in **iron, escape-yellow or timber**. Every ladder
  in the yard, the course and the pool uses it. The old test looked for the
  flat ladder pieces; it now checks what matters — that the climbing column is
  clear of anything solid.
- **Crates vary**: plain timber, GHOST LOGISTICS stencil, THIS WAY UP (arrows
  either way up) and FRAGILE / KEEP DRY with a number. Used across the yard
  and the ammunition dump.
- **The Quartermaster has tabs**: Primary, Secondary, Utility, Gear, Mods,
  Ammunition, each counting its stock; Restock everything sits above them.
- **Watchtower is 12 m** (taller than the dive tower, as it should be) and its
  sign is gone, as is the VEHICLE BAY sign.
- **The gangway has a fence on the outer side** as well as the inner railing.

## M5.10.0 — Quartermaster, gangway, watchtower, security turrets
- **Yard 7's crates are gone** (Logistics weapons/mods/ordnance/gear and both
  ammo drops). The course keeps its own.
- **The Quartermaster** at (-7, 49): a counter under a canopy with shelving
  behind. It is a crate with `infinite: true`: it offers **everything
  unlocked** (until unlocking exists, every item, mod and ammunition type —
  34), taking from it removes nothing and nothing goes back, and a **Restock
  everything** button fills every carried weapon and pouch
  (`arsenal.restockAll`). Outfits will join the list when outfits exist.
- **Ammunition dump** beside it: pallets of stacked ammo boxes, sandbags, one
  collision box for the lot.
- **Perimeter gangway** 5 m up round the inside of the wall, 1 m wide, on
  brackets, with an unclimbable railing (`noClimb`) broken at **seven
  ladders** (kept clear of the floodlight posts every 24 m). The south run
  stops either side of the hangar doors. Every ladder is verified climbable.
- **Watchtower** at (-40, 40): four legs with cross-bracing, a 7 m platform
  with a waist-high wall, a roof, a lamp, and a ladder on the south face.
- **Security turrets** on the hangar frame: Ghost's own, green-eyed, sweeping
  the apron, never firing on Ghost or its allies (`wview.buildSecurity`).
  When enemies exist they will be the ones in their sights.
- Ladder volumes on the gangway start 8 cm in front of the rungs — the test
  "the climbing column stands clear of the ladder itself" caught the overlap.

## M5.9.1 — saves remember the course; rear-side panels; hangar doors
- **Why doors stopped opening, instructions vanished and turrets ignored
  you:** the save recorded your position but not the course, so Continue
  after a save made mid-course put you back inside it with no course running.
  Saves now store `course: { part, at }`; loading one restarts that course and
  advances it to the saved step, opening every door behind you. Browser test
  added (save four steps in, reload, same step, door 1 open).
- **Turrets and moving targets run whether or not a course is active**
  (`stepRanges` moved out of the course block).
- **Door override panels**: one per door, **set into the wall on the door's
  rear side** (the side you come back from) — not floating in the doorway.
  The override still works from either side as a safety valve if an objective
  ever fails to open a door, but only the rear shows a panel.
- The crawl-duct door moved to x -117.85, flush with the tunnel mouth.
- **Training-course entry** in Yard 7 is now a small panel in the gateway wall
  at (-65, 0.5, 5.95).
- **Vehicles**: all vehicle materials draw both faces (a leaning hull's side
  could wind the wrong way and vanish — the truck tilt did); the 4×4's spare
  wheel now stands upright on the tailgate (`cylZ`).
- **Hangar doors** in the south wall behind the dock (x 26–50): steel frame,
  two ribbed leaves, VEHICLE BAY sign, keep-clear apron. New `shutter` texture.

## M5.9.0 — vehicles built in code
Rhys wants vehicles that look right to *drive*: early-2000s low-mid-poly
realism, not the cartoon packs. No CC0 pack matched, so they are built in code.
- **`src/game/draw/vehicle_models.js`**: a small mesh builder (`quad`, `tri`,
  `hull` — an eight-cornered box whose sides can lean — `box`, `cylX`,
  `cylY`) and painted materials (olive and sand paint with panel lines, rivets,
  dust and chips; canvas; tread; glass; chrome; lit head and tail lamps).
- Three vehicles, each **one mesh per material** (about 8 draw calls) with the
  **wheels as separate entities** (`root.wheels`) so they can spin and steer:
  - `personnelTruck` — 6×6: sloping bonnet, raked windscreen, side windows,
    grille, mirrors, fenders, bed with a canvas tilt over hoops, spare wheel,
    fuel tank, exhaust stack, tail lamps. ~7 m.
  - `lightUtility` — 4×4 with roll cage, seats, spare wheel. ~4.4 m.
  - `motorcycle` — raked forks, tank, seat, exhaust, mudguards. ~2 m.
- **The dock** now holds two olive trucks and a sand 4×4 under the shed (nose
  out, facing the yard), a sand truck parked outside, and three motorcycles.
  Collision is the level's invisible boxes as before.
- **The Kenney and Quaternius vehicles are retired** to `assets_library/`
  (not shipped). `props.js` remains for any future scenery model.
- Lesson: a cylinder cap built from degenerate quads has no normal and renders
  white — caps use proper triangles (`tri`).
- **For driving (M8)**: spin `root.wheels[i]` about x by distance / radius,
  steer the front pair about y; the body is already one entity to move.

## M5.8.1 — Quaternius vehicles converted; a tank by the dock
- Rhys's five OBJ packs (Quaternius low-poly, coloured by material, no
  textures) converted to GLB with `obj2gltf` + `gltf-pipeline`: **43 models** —
  cars, taxis, police, SUVs, sports cars, an ambulance, buses, a bicycle,
  traffic lights, cones and signs, trains (cargo, high-speed, steam), boats
  (cruise ship, lifeboat, sail ship, viking boat) and **four tanks**.
- **`assets_library/vehicles/`** holds them (prefixed `q_`), outside
  `assets/`, so they are **not** copied into the build — 6.7 MB we are not
  using yet. Move one into `assets/vehicles/` to use it.
- `q_Tank` now stands just past the vehicle dock at (40, 45.5). Its length runs
  along its own x-axis, so it is placed with no turn and its collision box
  (7.2 × 3.5 × 4.2) agrees with it. When placing a converted model, check which
  axis is its length first.

## M5.8.0 — real vehicles in the dock
- **Kenney Car Kit** (CC0) vehicles replace the box-built trucks: `truck` and
  `truck-flat` under the shed, an `suv` and a `delivery` van parked outside.
  Also extracted for later: `van`, `police`, `ambulance`. They live in
  `assets/vehicles/`, and **reference `Textures/colormap.png`** — keep that
  sub-folder or they load untextured.
- **`src/game/draw/props.js`** places scenery models: loads each once, measures it,
  scales it to a real length (Kenney models are toy-sized, about 3 units),
  stands it on the ground and turns it. **Collision stays the level's own
  box** (drawn invisible), so a prop is cover without needing a mesh collider.
- `build.mjs` now copies `assets/` recursively (`cpSync`), because the vehicle
  textures sit in a sub-folder.
- Motorcycles are still box-built: neither Kenney kit has one.

## M5.7.1 — door override, turrets you can recognise, the way back
- **The door override never existed**: `doorNear()` was part of an M5.0 batch
  that aborted. It is now in: E within 1.6 m of any part of a shut door opens
  it (measured to the door's nearest point — a wide door's panel is metres
  from its middle). Prompt: *E Door override*.
- **Door panels** use a painted `panel` texture after Rhys's button sheet:
  steel plate, hazard stripes, a guarded red button, DOOR OVERRIDE label.
- **Turrets look like turrets**: a ceiling arm, a turning head with twin
  barrels and a red eye, and a thin **laser** while it has you (aimed at the
  chest and stopped short of you, so it never fills the view). It sweeps when
  it cannot see you; the eye dims while reloading. **Destroyed**: the laser
  goes out, the eye goes dark, it bursts and smokes and slumps nose-down.
- **Frame rate**: every target had grown two stand entities; static stands are
  now merged level geometry and only sliding targets get their own. Draw calls
  about 83 in the yard and 95 in a gallery.
- **The way back**: a TRAINING COURSE panel in Yard 7 by the gateway
  (-57.4, 5.4) runs the same fade-and-move back to the start of the course.
- **Resuming from the title carries straight on** — course, step and doors
  intact — instead of reloading a save (`S.startedOnce`).
- **"Backup" is now "Secondary"** everywhere a player reads it (the internal
  slot key stays `backup`, so saves are unaffected).

## M5.7.0 — vehicle dock, staged transport
- **Yard 7's weapons range is gone** — the training galleries and the
  penetration booth supersede it. Its three tests went with it.
- **Vehicle dock** in its place (x 28–52, z 4–40): an open shed on posts over
  marked bays, **two personnel trucks** (cab, bed, canvas tilt, wheels) in bays
  one and three, **three support motorcycles** on a marked pad, a fuel point
  and a tyre rack. Props for now — solid, so they are cover — until vehicles
  arrive in M8. New painted materials: `tarp` (olive canvas) and `tyre`.
- **The transport** is now staged: press E → the screen fades to black (0.6 s)
  → you are moved while it is black (held 0.5 s, and you cannot move) → it
  fades back in the yard (0.7 s). `S.transport` drives it.
- **Crate labels can face any way** (`crate(..., face)` takes '+z', '-z',
  '+x', '-x'); the transport room's AMMUNITION label now faces the room.

## M5.6.3 — corner leaning
- **Crouched and aiming, face-on to a wall near its edge, you lean out round
  it.** `player.cornerLean()` checks for a wall within 1.1 m ahead, then tries
  leaning 0.3 / 0.45 / 0.6 m to each side for a spot where the head is clear
  and the view goes on past the edge; it adds 0.15 m of margin when there is
  room. `player.lean` (−1..1) eases in and out (`P.leanRate`), and
  `leanOffset()` moves the eye — and so the camera and every shot, which come
  from `eyePos` — without moving the body, which stays behind the wall.
- Works alongside the peek over cover; any stance change cancels both.
- 5 new tests: leans past an edge, picks the open side, no lean in the middle
  of a long wall or with nothing in front, the body never moves, and a round
  fired from the lean hits a target round the corner.
- Controls page updated.

## M5.6.2 — cut-out targets, turret sight, impassable barriers
- **Targets are cut-out figures**: the silhouette texture has a transparent
  background and the target is a plane with `alphaTest`, so you see the shape
  of a person rather than a board. The **stand stays put** (base plate and
  upright are separate entities); only the figure hinges over.
- **Targets fall the way they are hit**: `hitTarget` sets `t.fall` from the
  round's direction, and a blast knocks them away from where it went off.
- **The turrets' short range was two bugs**: they checked the *old* bay's
  coordinates to decide whether you were in their room, and they looked out
  from *inside their own target box*, so their line of sight hit themselves.
  Both fixed (`level.turretBay`, and the look starts 0.8 m out). **The
  safe-corner test had been passing for the same wrong reason** — it now looks
  from outside the housing too, and the corner is still genuinely safe.
- **Ghost barriers** (`ghost: true` on a solid): they block bodies but not
  bullets — `world.raycast` skips them. One sits over every firing line and
  over the penetration booth, up to 2.6–4 m, so nobody can jump from the bench
  over the wire, whatever they try. Tested with sprint-jumps, repeated jumps
  and crouch-jumps along the whole bench.
- The AMMUNITION sign in the alcove is gone.

## M5.6.1 — silhouettes, panels, course polish
- **Silhouette targets**: every target is now a human figure on tan card with
  scoring rings on the chest and head, painted in code (`PAINT.silhouette`,
  256×512) after Rhys's reference sheet.
- **Door control panels**: a small lit panel beside every door on both sides.
  E near a shut door opens it (this worked already; now there is something to
  see).
- **Catwalk**: ends at x -126 (was -122), leaving 6.6 m before the door;
  a rail across the end forces the vault; **posts and cross-braces** hold it up.
- **New course step** after the crawl: *Press C again to stand up.* Weapon
  steps now explain the slots — sidearm in backup (2), carbine in primary (1),
  grenades in utility (3) — so a greyed-out slot makes sense.
- **Penetration booth**: the thin-wall lane is bulletproof glass with a board
  over the target's chest, so you can see whether you hit; the bench has wire.
- **Final ammunition crate** has its own alcove in the transport room.
- Signs fixed: VAULT THE RAIL and RETURN TO YARD 7.

## M5.6.0 — penetration, and the frag alcove
- **Thin walls and glass grades.** Each weapon has a `pen` figure (pistols 1,
  DE50 2, MP2 1, K7 2, VR4 3, LR7 3, LR7X 4) and a surface can have a `tough`
  figure: **glass 1, thin wall 2, toughened glass 3**. No toughness means it
  cannot be shot through — ordinary walls and **bulletproof glass**. A round
  that beats a surface carries on through it (`Arsenal.trace` finds the exit
  face and continues), keeping 85% of its force through glass, 60% through a
  thin wall, 50% through toughened glass, and raising a `pierce` event.
  Surfaces take `{ tough, glass }` as options to `addSolid`.
- **Penetration booth** in Yard 7 at (14, 44): four lanes — glass, thin wall,
  toughened, bulletproof — each with a target behind it.
- **The frag alcove was a sealed box** outside the bay. Rebuilt at x -254 as
  asked, open to the bay through a cut in its north wall, and walked to.
- Glass does not break yet — rounds pass through and it stays whole.

## M5.5.1 — turret bay redesigned
- **The turret bay is rebuilt and bigger** (x -268 to -246.8, z 30 to 76 — it
  had to clear the sniper gallery's east wall at x = -246, which the first
  attempt overlapped, and that overlap was why one turret could not be hit).
  You enter behind a **baffle** that genuinely blocks both turrets' view, then
  work forward across three staggered low walls. Turrets sit high on the far
  wall at (-264, 73) and (-251, 73).
- **Tests now assert both halves of the design**: every turret must be hittable
  from behind the cover provided, and no turret may see into the safe corner.
- **The frag crate** has a proper alcove in the bay's west wall at (-259.8,
  10.2), reachable from inside the bay.
- **Signs** at the turret door and the baffle were facing away; turned. The
  second, oversized sign clipping the wall is gone.
- **The transport** now sits at the far end past the turrets, and fades to
  black and back rather than blinking you across the facility.
- **Turret damage, for the record**: 1.6 per shot, one shot every 0.12 s, 26
  shots to a burst (≈42 damage), then 3.2 s reloading. Standing in the open
  it takes about **16 seconds of constant exposure to kill you**, and health
  regenerates 5/s after 5 s clear — punishing, not lethal, as intended.

## M5.5.0 — menus, extraction, sound tuning
- **Menu backdrop**: on the title and saved-games screens the camera leaves the
  player and drifts in a slow circle over the yard, the dive tower or the
  range (changing every 26 s), with the HUD and viewmodel hidden and the
  overlay made translucent.
- **Music carries across the pause menu** — only returning to the title changes
  the track. **Title theme is now Black Vortex** (Rhys asked for something
  epic); Burn The World Waltz is kept as `opening`.
- **The frag crate has its own alcove** off the bay's east wall, sign facing
  back at the player.
- **The long walk home is gone.** After the turrets there is a short room with
  a **RETURN TO YARD 7 panel** (E) that puts you at the yard gateway and ends
  the course, plus an ammunition crate. The old corridors (170 m of nothing)
  are deleted, which also removed the void gap at (-252, 63.5) and the wall
  that blocked (-72, 100).
- **Sound**: the rifle sounded like a drum — the report is now a very short
  bright crack with only a brief body behind it. Metal footsteps rang like a
  bell; the tone is gone, leaving a dull rattle.
- **Sound credits (CC0, but recorded here for the release notes):**
  swimstroke1 — jasinski, "Beach Ocean Waves"; swimstroke2 — transitking,
  "Water Waves"; watersplash2 — Blender Foundation, "Water Splash (Yo Frankie)".
  All from OpenGameArt, CC0.

## M5.4.2 — turret hitbox, recorded water, better vault sound
- **The turrets could not be hit**: each had a solid metal housing box drawn at
  exactly the same place as its target box, so every shot stopped on the
  housing. The housing is now render-only; the target box is what stops a
  bullet. A test now fires at each turret from behind each piece of cover.
- **Recorded sounds can now be used alongside the made-up ones**:
  `audio.loadSample()` fetches and decodes once, `playSample()` uses it, and
  anything that asks before it has arrived falls back to the synthesised
  version. First用: Rhys's water from OpenGameArt — `watersplash2` for entering
  water, `swimstroke1/2` alternating while swimming.
- **Vaulting and mantling** used the metal footstep, which rang like a chime.
  Now cloth and boots: a scrape into a soft thud, heavier for a full climb.
- **Licence note:** the OGA sound files need their author and licence recording
  before release; ask Rhys for the page they came from.

## M5.4.1 — sound actually wired, music, radar turn fixed
**M5.3.0 was broken and should not be used.** An edit batch aborted halfway, so
main.js called `audio.*` with no import and no instance: every movement event
(jump, vault, climb, ladder, land) threw and froze the loop, and the sound
settings were missing. Lesson recorded: **when a patch batch aborts, check what
of it did land** — a half-applied batch is worse than none.
- Sound is now properly wired (see M5.3.0 notes for what it covers), with
  volume sliders for sound and music, and a browser test that calls every
  sound and pushes every movement event through the handler, so this class of
  break cannot ship again.
- **Music** (`src/game/core/music.js`): streamed, one track at a time, cross-faded.
  `pickTrack()` chooses by situation — title, course, range, yard, tension,
  action, chase, briefing, complex, battle, loop, death. Tracks re-encoded to
  96 kbps (79 MB → 22 MB). **All by Kevin MacLeod (incompetech.com), CC BY
  4.0 — the credit is on the title screen and must stay.**
- **Radar turn was backwards**: contacts and the rim letters rotated *with* the
  player instead of against. Facing west now puts north on your right. The
  compass text was correct all along.
- **Gallery signs** in the alcoves faced away; turned round.
- **The grenade crate was sealed inside an alcove** by the bay's own wall (that
  is why the grenades vanished and the turret bay looked walled off). It now
  stands inside the bay, with its sign on the wall.

## M5.3.0 — radar, sound, and course fixes
- **Radar, not a minimap** (Rhys's note): circular, you always point up, the
  world turns around you, a lit wedge shows your field of view, three range
  rings, cardinal letters riding the rim. Contacts: allies (chevron, blue),
  enemies (red square — standing targets stand in until there are real ones),
  things of interest (grey), objective (yellow diamond, **pinned to the rim**
  when off the edge so it still points the way). Walls and crates are no longer
  drawn. That also fixes the backwards "me" marker.
- **Sound, made in code** (`src/game/core/audio.js`): every sound is synthesised at
  the moment it plays, so a suppressed weapon really is a different sound (the
  crack is removed and the action is left) rather than a second recording.
  Covers gunfire by family, dry fire, reloads, melee, impacts (flesh vs hard,
  quieter with distance), target falls, footsteps by surface (concrete, metal,
  wood, water) paced by stride and stance, landings, splashes, swimming,
  explosions and the flashbang ring, grenade throws and bounces, turret motor
  while tracking plus a lock-on, pick-ups, hurt, death, step-complete chime and
  UI clicks. A volume slider is in Settings. `audio.start()` is called on the
  first click (browsers require it) and the whole thing fails safe: no audio
  device means silence, not an error.
- **Grenade bay → turrets was walled off**: the bunker's side walls sealed the
  corridor. The bunker moved west, leaving the east side as the way through,
  with the door and a sign on it.
- **Alcoves**: each gallery's weapon crate and sign now sit in a recess off the
  corridor, out of the firing line and facing the right way.
- **Stamina in the debug line** (it had been lost in a failed patch).

## M5.2 — minimap and compass
- **`src/game/draw/minimap.js`** draws a 170 px map from the level's own collision
  boxes, so it cannot disagree with the world. North up, your arrow turns.
  Shows walls, doors (amber shut / dark open), crates (green, gear blue),
  standing targets (red) and a ring for the current objective (the course
  step's zone). `heading(yaw)` gives the compass reading under it.
- **M toggles it** (rebindable, `map` action), with a Settings switch; the
  state is saved. Redrawn about eight times a second, not every frame.
- Classification lives in `classOf(solid)`: floors, kerbs, rails, ladders and
  hazard strips are skipped, so the map shows walls and furniture only.
- **Browser suite**: screenshots inside the tests now use `snap()`, which
  swallows a timeout. The sandbox renderer had grown slow enough that a
  screenshot could exceed 30 s and stall the whole run — that was the "flaking
  on time" Rhys asked about, and it is now harmless.

## M5.1 — performance
Frame rate had fallen from ~60 to 20-50. Two causes, both from the course:
- **99 indoor lights, all on at once.** Level geometry is merged into a few
  map-wide meshes, so every enabled light touches every mesh. `view.tickLights`
  now switches on only the nearest few (10 high / 7 medium / 4 low quality),
  refreshed five times a second. Outdoors, none are on.
- **56 signs × 3 objects each.** A sign was two planes plus a backing box;
  it is now one double-sided panel (`cull = CULLFACE_NONE`), and signs beyond
  70 m are switched off (`view.tickSigns`). Sign textures are 256 px, not 512.
**Result: draw calls 189 → 90 in the yard, 133 → 76 in a gallery.**
Worth remembering: with merged map-wide meshes, lights and small entities are
what costs, not triangles. If it slows again, check `FL.view.lamps.filter(l =>
l.e.enabled).length` and `FL.app.stats.drawCalls.total` first.

## M5.0 — playtest 17
- **The bunker glass was opaque** because `mats.glass` was created *after* the
  meshes that use it, so it had been built with a default material. Glass and
  the strip lights are now made before `buildMergedMeshes`. (Lesson: any
  material used by level geometry must exist before the merge.)
- **Wire means wire:** the bench under it is `noClimb` too, so the firing line
  cannot be climbed, vaulted or mantled at any point (34 noClimb solids).
- **Weapon crates** moved back against the corridor wall (z 12.9), out of the
  firing line, with smaller labels.
- **The grenade bay link had no north wall** — that was the void at
  (-252.8, 12.3). Walled.
- **Moving targets run on their own clock** (`S.rangeT`), which advances only
  while playing, so pausing freezes them and unpausing carries on.
- **Doors have a button on both sides:** `doorNear()` finds a shut door within
  2.2 m and E opens it, so you can go back through the course.
- **Stamina**: any stamina above zero is enough to start an action; the cost
  can take you into the red (floor -30), where you are winded — 55% speed, no
  sprinting or dashing — until it climbs back to zero. The bar turns red and
  shows the red portion; the debug line reports the figure.
- **Back to the start** of the weapons section puts you at (-88, 0, 9).
- 1-4 weapon switching is mentioned in the rifle step.

## M4.9 — playtest 16
- **The sniper door**: `wdoor3` was at x -247, *outside* the firing corridor
  (which ends at -246), so the corridor's own west wall blocked the way
  whatever the door did. The wall is gone and the door sits at -245.8, inside
  the corridor. Verified by walking it and by tracing the step chain.
- **Back to the start** restarts the section you are on: the movement course
  from its spawn, the weapons course at the pistol firing line with the
  targets and crates restocked.
- **A target-killability check** is worth keeping: it fires at every target
  from its own lane at several moments of a mover's travel. Two lessons from
  writing it — aim at the centre (targets on posts are only 0.7 m tall), and
  refill the magazine between shots, or the test runs dry and reports
  everything as unhittable.
- Rhys's texture sheets are logged in FRONTLINE_ROADMAP.md with what is needed
  to use them (individual square exports, tiling where appropriate).

## M4.8 — playtest 15
- **Void gaps beside the corridor** (x -84.8 and -125.6): the corridor had no
  south wall except where a gallery opened. It is now walled between the
  galleries, generated from the gallery x-ranges.
- **Wire along the firing line:** a waist-high fence with posts and a coil on
  top, marked `noClimb` — `findLedge` refuses anything with that flag, so wire
  can be neither vaulted nor climbed. (First version was chest-high and
  blocked the view; it is now 1.32 m, so you shoot over it.)
- **Range falls off** (`best` per weapon: PX9 35 m, DE50 45, MP2 60, K7 120,
  VR4 150, LR7 400, LR7X 600). Past that, damage drops by 80% of the overshoot,
  floor 12%. So a pistol cannot clear the sniper gallery — Rhys's point 8,
  which is a weapons matter, not a ragdoll one. Bullet *drop* is still to do.
- **The instruction now updates on the drop** into the weapons wing: the crouch
  and drop steps have position tests as well as zones, and there is a backstop
  in main.js — if the course still thinks you are learning to move while you
  are in the weapons wing (z > 10), it moves on.
- **Doors:** traced the whole chain in the new layout (every range opens its own
  door correctly); the failure Rhys saw was in the pre-gallery M4.6 layout.
- Browser tests now take ~5 minutes in the software renderer: run them in the
  background and tail the log.

## M4.7 — proper shooting galleries
Rebuilt the ranges to Rhys's reference art: you walk **along a covered firing
corridor** (z 12-16) and each range opens to the **south** as a scene you look
out at, instead of a hall you walk through with targets in the way.
- `gallery(x0, x1, deep, opts)` builds: ground and side walls, a **berm** of
  three stepped blocks at the back, a **bench** along the firing line, an
  **overhang**, **lane numbers** 1-3, barriers and sandbag stacks, and lights
  both over the line and down the range.
- `gtarget()` places a target facing the line, optionally on a **post** (so
  they sit at different heights) or on a visible **rail** for the movers.
- Layout: pistol (26 m deep), rifle (32 m, three movers), sniper (74 m, a
  mover and two bunkers), then the grenade bay and turret bay off the west
  end, and a way home east at z 100 and north to the yard gateway.
- **A route script** (`/tmp` during the session, worth keeping in test/) walks
  every connection and raycasts every target from the firing line. It found:
  the corridor with no opening from the link, the bunker's back wall spanning
  the whole bay, the home corridor running **through** the sniper gallery, the
  turret bay sealed at its near wall, targets hidden behind their own berm and
  barriers (5 of 7 on the sniper range), and the yard gateway walled off by
  the new corridor. All fixed; every target is now visible from its lane.

## M4.6 — playtest 14
- **FRONTLINE_ROADMAP.md** added: every suggestion not yet built, by size.
- **Door and trench jitter:** the junction panels reached into the side walls
  and roofs. They now stop at the inside faces, so nothing overlaps.
- **Doors fill their openings:** `door(x, z0, z1, y0, y1, tag)` — the platform
  hop door is the full 12 m of its gap, not 6 m of it.
- **Vaulting any rail counts:** the vault marker covers the whole lower floor
  (it was only the left-hand strip).
- **The shaft's lower crate is gone**, so the landing is not blocked.
- **No door between the drop and the pistol range** (wdoor0 removed).
- **Targets fall away from the shooter**: each records `fall` (+1 for the
  course ranges, -1 for Yard 7's, which is fired from the other end).
- **Moving targets are now drawn where they have slid to** — the collision was
  moving, the model was not, so nothing appeared to move.
- **The rifle range leads on properly:** its far wall has the doorway, with a
  short link south into the sniper range, and its east wall is open to the
  pistol range.
- **The exit corridor ran straight through the grenade bay.** It now leaves the
  turret bay southward at z 124 and runs east at z 132, then north to the yard.
  The yard gateway is wider (±3.4 m) and the walkway reaches it.
- 'Click to shoot' added to the first range instruction.
- **A route script** (walk each connection and report where it stops) is the
  quickest way to catch this class of bug — worth keeping.

## M4.5 — playtest 13
- **The pause on starting** was the browser refusing a mouse capture made too
  soon after the last one was released. `deploy()` now retries at 400 ms and
  1.1 s, and the watchdog waits 2 s after a capture was asked for before it
  decides you are paused.
- **The drop into the weapons wing** is now a walled shaft with two crates to
  step down, so it does no damage; the step advances and `wdoor0` opens on
  landing (verified by simulation: lands at y 2.5, full health, step
  'pistol-get', door open).
- **Targets fall away from the shooter:** a target records which way it faces
  (`axis`) and rotates about X or Z to match — the pistol range's were falling
  sideways.
- **Course crates restock** when a course starts (`c.stock`), so the pistol
  crate is no longer empty on a second run.
- **Pistol and rifle ranges need 80%**, not 90%: with five targets, "90%"
  meant all five, which is not what it says.
- MIND THE GAP moved clear of the wall it was inside.

## Still outstanding: see FRONTLINE_ROADMAP.md

## (old running list)
Nightvision/thermal tinting and silhouettes; the mod bench view (Rhys has
concept art); ragdoll (needs ammo.js, its own sessions); dialogue/NPCs; range
rework beyond the course (bunkered/moving targets in Yard 7 itself); skills
tree; command wheel; vehicles and parachutes; firing modes; scope views;
weapon stats sheet; tactical takedowns; character in the pause menu; body
clipping in water and prone; the camera turning to follow movement;
one-item-per-crate in the field; 2D art from Rhys to replace painted textures.

## M4.4 — playtest 12
- **Title screen:** New game (starts the course — a new player should be taught
  by default), Weapons training only, Skip to Yard 7. Starting a course no
  longer pauses: `deploy()` is called straight from the click, because pointer
  lock needs the user's gesture and a `setTimeout` broke the chain.
- **Jitter either side of the trench and at the doors:** section shells were
  overlapping their neighbours by 0.4 m, so two surfaces fought for the same
  space. Shells now butt exactly and the bulkheads fill the joints; doors moved
  0.9 m clear of each junction.
- **Ladders can be taken from behind or the side:** the grab no longer needs
  you to be facing them, and getting on turns you to face the wall.
- **Catwalk:** the crate hall and vault hall are taller (8.2 / 6.2), so you
  stand upright on it; the ladder at the end is gone and a **rail across the
  end** forces the vault.
- **Signs** in the crouch/crawl tunnel moved to the centre line and raised; the
  tunnel has an end wall with MIND THE GAP on it.
- **The grate drops you inside the weapons wing:** its roof has an opening cut
  under the grate (it used to land you on top of the roof).
- **Range targets face down the range** (`axis: 'x'` for the halls that run
  east-west) — they were side-on.
- **Range doors were walled over:** `hall()` now takes openings for its near,
  west, far and east walls (`gap`, `gapW`, `gapS`, `gapE`), which is what was
  stopping progress after clearing the pistol range. **Mind the parameter
  order: gap/gapS are x ranges, gapW/gapE are z ranges** — mixing them up built
  a wall across half the map.

## M4.3 — course rebuilt, sealed properly (playtest 11)
- **The void gaps had one cause:** each section sealed only along its own
  length, so wherever two sections differed in width or height the leftover
  area was open. `level_tutorial.js` now declares the course as a list of boxes
  (`S`) and **generates bulkheads at every junction**: the opening is the
  intersection of the two cross-sections, and the four areas around it are
  walled. No hand-placed end caps, so a later change cannot reopen a hole.
- The crawl tunnel is one section with a `hole` for the grate.
- **Sprint and vault** now works: the catwalk runs on into the vault hall (the
  old capWest wall was the "solid wall at the end of the catwalk"), its walls
  turn into railings, and there is a ladder back up for another go. door3 is
  gone with it.
- **Weapons wing:** the link room's south wall and the pistol hall's north wall
  both sealed the corridor; both now have the mouth cut through, so the
  weapons-only start is no longer a black box.
- **Title screen** has **New game (straight to Yard 7)** again (it had been
  renamed away), and starting a course no longer leaves the pause state set.
- **Mods can be taken off** in a crate: fitted parts are listed under their
  slot and clicking one returns it to the crate.
- **The pool steps down** from about 4 m under the boards to 6 m at the far
  end, with ladders at the near corners.
- The stray Logistics sign at (-32, -51) is gone.

## M4.2 — course fixes (playtest 10)
- **Doors stayed visible when open** — the cause of the "barrier that isn't
  there". Doors are now their own entities (`view.doorEntities`,
  `view.showDoor`), excluded from the merged static mesh, and `syncDoors()`
  hides an open one.
- **Sealed geometry:** `section()` builds floor, roof, both walls and optional
  end caps with a 0.4 m overlap, and `seal()` fills the step between sections of
  different height. The entrance has a back wall.
- **The trench:** the render-only slab that was z-fighting is gone, and the
  ladder moved to the near side (−180.6, z 3.6) so a missed jump can be retried.
  It also had to clear the floor slab's overhang, or you climbed into it.
- **The 5 m platform and the catwalk** were sitting over their own ladders and
  crates; both moved clear so you can step off the top.
- **Skip movement** now also moves you to the weapons start; **Weapons
  training only** opens `wdoor0` so the link room is not a sealed box.
- **Yard gateway cleared:** the west floodlight post and the containers within
  7 m of z=0 are skipped.
- **Ammunition** can be taken without the matching weapon: what will not fit
  goes into `arsenal.spare` (three crates' worth per kind), and picking up a
  weapon empties the right pouch into it (`useSpareFor`).
- **Mods have their own crate** at Logistics; weapon crates carry weapons only.
- **Aiming down the sights** now sits the weapon lower, below the middle of the
  screen, so you can see where the shot lands.

## M4.1 — the weapons half, and indoor lighting
- **`src/game/levels/ranges.js`** — five roofed, walled areas south of the
  movement course, reached by dropping through the crawl grate:
  pistol range (five small plates, 10-35 m), rifle range (silhouettes, three
  of them moving on tracks), sniper range (68 m long, a mover, and two in
  bunkers showing only their heads), grenade bay (four behind reinforced glass
  with an open vent at their feet), and the turret bay.
- **Turrets** (`stepRanges`): they watch, take 0.6 s to settle on you, fire a
  26-round burst at 1.6 damage a shot, then reload for 3.2 s — the window to
  lean out. They cannot see through the low walls, and there is a safe corner
  by the door where they will not fire.
- **Moving targets** slide along a track and their collision follows; a downed
  one stops.
- **Steps** (`weaponsSteps`): take the weapon from its crate, then clear the
  range — 90% for pistol and rifle, all of them for sniper, grenade and
  turrets. Single-item crates (PX9, K7, LR7, FRAG), which is also the "one
  weapon per crate" rule Rhys wants in the field.
- **Title screen** offers Training course (both halves) or Weapons training
  only; the pause menu gains Skip weapons training.
- **Indoor lighting:** `level.lights` → omni lights (41 of them, no shadows)
  with emissive strip fittings, placed down every hall. Interiors read as lit
  rooms rather than caves; draw calls still 45.
- **Course tests now 11**, including: a range door opens only at the right
  fraction, moving targets move and their collision follows, the turret bay
  has a safe corner and low cover, and the way out reaches Yard 7.

## M4.0 — the training course (movement half)
Built to Rhys's outline: a corridor of rooms that lets out into Yard 7.
- **`src/sim/play/course.js`** — `Course` walks a list of steps; a step is done when
  you reach its zone (or its `test` passes), which opens the doors it names and
  shows the next instruction. `skipSection('movement')` and `skipAll()` open
  everything they pass. `movementSteps()` holds the eight steps.
- **`src/game/levels/course.js`** — the geometry, built into the same world as
  the yard (x −198 to −60), so there is no level switching: room and jump
  trench (with a ladder out, since a miss must not be a dead end), ladder to a
  platform and a 2.4 m hop, a crate climb to a catwalk, a catwalk whose walls
  become vaultable railings over a short drop, and a tunnel that goes
  stand → crouch → prone, ending at a grate that drops you out. A covered walk
  leads east to **a new gateway cut in the yard's west wall**.
- **In game:** the current step shows under the zone line (`#step`); the pause
  menu gains Skip movement training / Skip the whole course; the title screen
  offers **Training course** or **Straight to Yard 7**. Starting the course
  empties your loadout (it is a movement course).
- **7 course tests**, including: doors stay shut until earned, the trench has a
  way out, skipping opens every door, every marked area is somewhere you can
  actually stand (this caught a floor covering the jump trench and two markers
  buried in geometry), and the course connects to the yard.
- **Next:** the weapons half (pistol/rifle/sniper/grenade ranges, 90% to open
  each door) and the turret section that teaches crouch-peeking. The interiors
  are also rather dark — they need some light.

## M3.7 — playtest 9
- **Grenades looked like guns because they were.** The pack's `Grenade_1/2/3`
  are grenade *launchers* (1.8 m long); only `Grenade` (16 cm) is a grenade.
  All throwables now use `Grenade.glb`, and the launchers are kept for the
  rocket/launcher weapons Rhys wants later.
- **Empty slots are selectable:** 1 or 2 on an empty primary/backup puts you in
  bare hands, so you can punch without dropping a working weapon. Running out
  of ordnance falls back to primary, then backup.
- **F strikes with the weapon** (`bash`): 30 damage with a gun, 14 bare, quiet
  (noise 0.25) — pistol-whipping, usable with a full magazine.
- **Noise figures** for actions: a shot is scaled by the weapon (auto 1.0,
  sniper 1.1, single 0.75, × the silencer's 0.25), a throw 0.3, a blast 1.6.
  `arsenal.lastNoise` decays and shows in the debug line beside movement noise.
- **Weapons pull as they climb** (`pull` per weapon: K7 0.55 right, VR4 0.9,
  MP2 −0.8 left, PX9 0.1) and settle back when you stop firing; mouse-look
  overrides at any time.
- **Third-person shots follow the crosshair** (`aimDir()` raycasts from the
  camera and aims the weapon at what it hits).
- **Death screen:** Redeploy / Save / Quit to title, and dying autosaves.
- **Prone → crouch** when there is no room to stand.
- **Mods can clash:** `group` (barrel/optic/fill) plus an explicit `clashes`
  list — the foregrip and extended magazine will not share a weapon.
- **Pool extended to z = −10**; the outside range sign turned flat to the wall.

## Rhys's list still outstanding (in rough order of size)
Tutorial course; dialogue/NPCs; range rework (bunkers, silhouettes on tracks,
turret section); skills tree; command wheel; vehicles (motorcycle first, with
A/D steer, W/S, Space hop, E to mount); firing modes (0 to cycle auto/burst/
single); scope views through optics; NVG/IR as toggleable tinted vision with
silhouettes and see-through-one-wall; weapon stats sheet (as a side document);
modding seen on the weapon in a crate view; one item per crate in the field;
tactical takedowns; character shown in the pause menu; body clipping in
water/prone/ladders; crate-stair judder; the camera turning to follow movement.

## M3.6 — playtest 8 (part one)
- **New game** empties every slot and gives full magazines (`t-new` clears the
  loadout and wipes `arsenal.ammo` before `reset`).
- **Ammunition** (`AMMO` in loadout.js: AMMO_PISTOL/RIFLE/SNIPER, with the
  families each feeds). `arsenal.canTakeAmmo/takeAmmo` fill the reserve of
  anything carried that takes them, capped at 1.5× the weapon's own reserve.
  Three ammo crates: beside the range, at (-20,-8) and (12,30).
- **Placed charges:** `chargeNear` + **E** makes one safe and returns it to your
  pouch; a bullet landing within 0.45 m sets it off (`shotCharge`) — so an
  enemy's charge can be shot out.
- **Bullet marks:** `wview.addMark` works out which face was hit from the
  solid's bounds and lays a small dark disc 12 mm proud of it; 60 at a time,
  fading from 60% of a 14 s life. **Not yet eyeballed in play** — worth a look.
- **Shift+S** is a backward dodge-roll (`player.rolling`, Roll clip), since a
  backwards sprint reads badly.
- **Signage stripped** to place names only (Rhys's list), plus a WEAPONS RANGE
  sign on the outside wall at x=27. Height signs kept.
- **controls.html is versioned**: `{{VER}}` is substituted at build time and the
  in-game links open `controls.html?v=<version>`.

## Deferred, and roughly what each needs
- **Tutorial course** (Rhys's biggest ask): a staged area with skip options
  (all / movement only / weapons only / none). Needs an objective system
  (trigger volumes, a current-step HUD line, a per-step gate) plus a second
  level layout. **This is the next milestone.**
- **Range rework:** bunkered targets, silhouettes on tracks, and a turret
  section that fires in cycles and forces you behind cover.
- **An NPC in Yard 7** with 2-4 dialogue options per exchange (needs a
  conversation system and a talking character).
- Shotguns, launchers, and less-lethal weapons/ammo; parachutes; vehicles;
  breaching; hacking.

## M3.5 — playtest 7
- **Ladder** facing corrected (the body was turned away); **C lets go without
  cycling the stance** (`prevCrouch` is set on release).
- **Sideways sprint:** holding Shift with A/D keeps a strafing run (×0.82 of a
  forward sprint), so a dash can be held into a sprint.
- **The one-armed climb** (an unfortunate silhouette) is gone — traverses use
  the neutral pose until there is a proper mantle clip.
- **Flashbangs:** blindness is now `max(0, facing)` — dead on blinds fully,
  side-on barely, looking away not at all; the white burst is still seen.
- **Medkits and charges are used, not thrown:** `useAid` heals (refused at full
  health, costs `useTime`), `placeCharge` sticks a charge to what you are
  looking at within 3.2 m and a second press sets off everything placed.
- **Bare hands:** with an empty slot or only gear, the fire button throws a
  punch (14 damage, 1.5 m).
- **New gear to test with:** Night Vision (flashResist −0.6 — a flash through
  them is worse), Thermal Goggles, UV Goggles, Tinted Visor (weak resist, so it
  is not a substitute for polarised lenses). **Any slot can be set to None**
  from a crate.
- **Controls moved out of the game** to `src/controls.html` → `dist/controls.html`,
  opened in a tab from the title and the pause menu. The pause menu's own
  button is now "Key bindings".
- **Logos:** the badge version heads the pause menu and the controls page
  (`assets/ui/frontline_badge.png`); the GooseKnight helmeted-goose wordmark
  signs the title screen (`assets/ui/gooseknight.png`).
- **Not done, and why:** a real ragdoll needs a physics engine (ammo.js, ~1 MB
  wasm, plus joint setup) — the death topple stands in. Parachutes, vehicles,
  breaching, hacking and their training areas are new systems, each worth its
  own milestone.

## M3.4 — title screen, saves, logo, death topple
- **Logo:** Rhys's ChatGPT hero version (globe + operative + red crosshair),
  trimmed, black made transparent, 820 px, `assets/ui/frontline_logo.png`
  (409 kB). Menu: Continue (hidden with no saves) / New game / Saved games /
  Settings / How to play / Buy me a cuppa (ko-fi.com/gooseknight).
- **`src/game/core/saves.js`** — three slots in localStorage plus **transfer codes**
  (`FL1.<base64url>.<crc>`, whitespace forgiven, checksum refuses a typo, a
  newer save version refused politely). A save holds name, playtime, score,
  the loadout with its mods, what has been found, position and facing.
  Autosave every 20 s into the current slot; Save game / Title screen in the
  pause menu. 6 node tests.
- **Death topple** (playtest-5 note 21, and Rhys's ragdoll question): no physics
  engine, but `player.deathFace` records whether the killing blow came from in
  front or behind (blasts pass their position), and the body rotates ±86° over
  ~0.6 s and stays there — face down from behind, on its back from the front.
- **Crates** moved to z **-54** (Rhys meant negative), sign turned to face them,
  and the spawn pointer reworded.
- **Accounts:** not built. GitHub Pages is static hosting, so real accounts need
  a server. Codes cover cross-device for now; a free backend (e.g. a hosted
  database with anonymous sign-in) is the upgrade path if wanted later.

## M3.3 — playtest 6
- **Muzzle flash** was a plane in front of the camera, so it filled the screen.
  It is now a few centimetres across, sits at the end of the barrel
  (`REAL_LENGTH * 0.95` ahead of the grip) and only shows for guns.
- **Crates were never missing:** they are at Logistics (-28/-32/-36, z 54),
  which is *behind* the spawn (0,0,30 facing -z). Added a sign at the spawn
  pointing back to them.
- **Locked in with no menu:** Esc and P now both pause from a keydown handler
  (Esc exits pointer lock before the page sees it in some browsers), a crate
  closes first if one is open, and a watchdog opens the menu if the mouse is
  free while playing.
- **Camera clipping:** the camera is pushed back toward the eye if it would sit
  inside a solid — fixes seeing through walls, floors, the pool sides and the
  duct/pipe roofs in third person (note 13 from playtest 5).
- **Ladder climbing** faces the wall (`poseFor().faceWall`, using the ladder's
  own facing) and uses the walk cycle paced by climb speed; idles when still.
  The rig has no climbing clip, so this is the nearest honest approximation.
- **Stair smoothing** loosened to 0.17 s, with the spring stiffening sooner
  with vertical speed (|vy|/1.6) so jumps stay tight — both tested.
- Still open from playtest 5: two-handed vault/climb (17) and prone-vs-supine
  death by damage direction (21); both need clips the rig does not have.

## M3.2 — playtest 5 (Rhys's 23 notes)
**Fixed:** (9,10) reload never finished — `Arsenal.step` looked the refill up in
the old `WEAPONS` table, so catalogue weapons (K7 etc.) reloaded forever;
(2,12,14,23) the catalogue ids had no `HOLD`/`REAL_LENGTH` entry, so every one
fell back to the pistol's pose and size — hence giant floating weapons, guns in
place of grenades and a phantom pistol; (5) opening a crate released the mouse,
which opened the pause menu behind it (`onUnlock` now ignores it while a crate
is open); (6) a plain jump no longer tumbles; (7) a dash steps aside
(Run_Left/Right) instead of rolling; (8) a *deliberate* leap — sprinting or
falling fast from over ~2.5 m — dives (`diving` in `stateOf`); (16) a climb is
tested before the airborne case, so stepping off a ladder no longer rolls;
(3,4,22) prone and swimming pitch **+**86/+78 (face down); the old negative
values laid the body on its back; (20) Death plays once then freezes;
(11) blasts now show: fire and dust for frags, a white burst plus a screen
flash for flashbangs (visible even if you were looking away), and a cloud that
hangs for the fill's duration, tinted for CS (green) and phosphorous (orange);
(15) the crates moved to Logistics at (-28..-36, 54); (19) firing shake ×0.45;
(1) a mouse jump over 2.2 rad in one frame is ignored.
**Third-person weapon:** parented to the operative's root and placed at the
hand's position each frame, level with the body — the bone's own rotation is
unpredictable and chasing it wasted a session.
**Still open (Rhys):** (13) duct/pipe roof clips in third person (camera inside
geometry — needs a camera collision pass or double-sided interiors);
(17) vault/climb use one hand (rig has no two-handed mantle; Interact is the
closest clip); (18) crate-stair smoothing still wanted; (21) prone vs supine by
damage direction (needs a second death clip or ragdoll); the smoke sphere is a
placeholder and reads as a large soft ball up close.
**Asked for and not started:** a GooseKnight motion-graphic title for Frontline
and a Frontline logo (Rhys has not drawn the logo yet). The Dungeon Remembers's
intro (`gooseknight/render_intro.py`, `tdr_logo_600.png`) is the model to follow.

## M3.1 — the operative (animated character)
- **`assets/characters/Swat.glb`** (1.8 MB): Quaternius Swat from the Ultimate
  Animated Character Pack, converted from glTF. 24 clips on a 68-node rig.
- **`src/sim/people/anim.js`** picks the clip from the player's state (pure, tested):
  idle / Idle_Gun / Idle_Sword / Idle_Gun_Pointing / Idle_Gun_Shoot, Walk vs
  Run by speed with playback paced to it, Run_Back/Left/Right by direction,
  Run_Shoot, Roll for jumps and dashes, Interact for vaults/climbs, Death and
  HitRecieve overriding everything. **The rig has no crouch, prone, swim or
  climb clips**, so those borrow Walk/Idle and `poseFor()` bends the body
  instead (crouch squashes to 0.66, prone and swimming pitch it flat).
- **`src/game/draw/character.js`** loads the model, measures it and scales it to
  1.8 m, assigns every clip by name, and finds the right hand. **Two gotchas:
  the bones use dots (`Wrist.R`, not `Wrist_R`), and the model ships holding
  its own pistol**, which is disabled so the carried weapon is the only one.
- The weapon is parented to `Wrist.R` with the bone's scale undone; **its angle
  in the grip still needs tuning** (currently -90 on X, 2 cm up, 4 cm forward).
- The box stand-in remains as a fallback until the model finishes loading.
- Next for the cast: guards using the same class, and blending between clips.

## M3.0 — loadout, families, mods, gear and crates
- **`src/sim/arms/loadout.js`** holds the catalogue and the rules. Five slots
  (primary, backup, utility1, utility2, gear) that take items **by size**:
  `SLOT_TAKES` lets a backup-sized item ride in the primary slot, so two
  sidearms are legal, and both utility slots take any utility item, so double
  C5 is legal. Gear is worn, not held (key 5 selects nothing).
- **Families** (`FAMILIES`): knife, pistol, smg, rifle, shotgun, sniper,
  grenade, charge, aid, gear. **Items**: KNIFE; PX9 / V99 / DE50 sidearms;
  K7 / VR4 rifles, MP2 smg, LR7 / LR7X snipers; FRAG / FLASH / SMOKE, C5,
  MEDKIT; gear GASMASK / LENSES / INTEL / LOCKKIT / MEDGEAR / DEMOKIT.
  Designations are invented rather than real trademarks, but the numbers
  follow the real trade-offs (DE50: 62 damage, 7 rounds, heavy kick).
- **Mods** (`MODS`, `statsOf`): SILENCER (quieter, −10% damage), SCOPE2,
  SCOPE8, GRIP, EXTMAG, and grenade fills FILL_CS / FILL_WP (phosphorous adds
  damage to a smoke). One optic and one fill at a time — fitting a second
  returns the first, which the crate keeps.
- **Crates** (`Crate`): weapon, ordnance, gear and range-issue crates in the
  yard by a LOGISTICS sign. **E** opens a panel: click a slot, then an item.
  What you swap out stays in the crate. `arsenal.reset(loadout)` re-reads what
  you carry (and caps the magazine if a mod shrank it).
- **The arsenal runs off the loadout** when given one (`opts.loadout`);
  `def(id)` resolves an item's stats through its slot's mods. The old
  `give()/WEAPONS` path still works, which is why the earlier tests still pass.
- **Automatic reload**: pulling the trigger on an empty weapon with ammo in
  reserve starts a reload (event `autoreload`) — switching weapons is quicker.
- **Gear effects**: LENSES cut flashbang blindness by 85% (`gearTrait`).
  GASMASK, INTEL, LOCKKIT, MEDGEAR, DEMOKIT are defined but do nothing yet —
  they need gas, a compass, locks, healing and charges to exist first.
- **Viewmodels follow the catalogue** (`modelFor`), and a weapon picked up
  mid-game has its model made on the spot.
- **Browser tests now run against a local http server** (`python3 -m
  http.server 8099` in dist/), because GLB models cannot load from file://.

## Not yet: the loadout screen at Ghost HQ Logistics (there is no HQ yet), and
## picking up a weapon a downed enemy dropped (there are no enemies yet).

## M2.3 — peeking over cover
Crouched + aiming + on your feet + headroom above: `player.peek` eases 0→1
(`P.peekRate` 5.5) and `eyeHeight` rises from `crouchEye` 0.98 to
`P.peekEye` 1.52, so the eye — and therefore every shot, since weapons fire
from `player.eyePos` — clears chest-high cover. **The body does not grow**
(`this.h` stays at crouch height), so you remain a small target, and
`peekRoom()` refuses when something is directly overhead. Any stance change
cancels it. Four tests cover: blocked crouched → clear while peeking → blocked
again on release; body height unchanged; no peek under a roof; stance change
cancels.

## M2.2 — the range actually works
- **The walled-off deep range:** extending the lanes to 20 m and 35 m in M2.0
  left the old 10 m back wall standing, so the mid and far targets were sealed
  behind it (visible, unreachable, unshootable). Wall removed; the side walls
  now run in one piece from the gateway to the backstop (they used to overlap,
  which would have flickered).
- **Staggered target rows:** the near row sat directly in front of the mid row,
  so a near board permanently shielded the one behind it. Near row at
  x = rx±8/±4/0, mid at rx-10/-2/+6, far at rx-6/+2 — no lane is ever blocked.
- Two new tests: every target is reachable by a clear ray from its own lane,
  and the range can be walked end to end.

## M2.1 — playtest 4 fixes
- **The range was sealed** (the M2.0 sign said open, the 2.8 m fence was not):
  now a 4 m gateway with posts and a hazard lintel, and the fence texture says
  RANGE instead of RESTRICTED. The fence either side still can't be climbed.
- **Ladder prompt** only shows when pressing W would actually put you on: it
  needs a straight-on facing (dot > 0.6), room in the ladder's column, and
  feet more than 1 m below the top.
- **Dash in either key order:** `input.strafePressed` reports a fresh left or
  right press, so Shift-then-D and D-then-Shift both dash.
- **Third person:** the weapon was parented to the camera, so it floated in
  space. It now hangs off the stand-in body at hand height (the arm box is
  squashed and would distort it), and view sway/kick/muzzle flash are skipped
  in that mode. **This stays rough until a rigged character with hands
  arrives** — the proper fix is a hand bone to attach to.

## M2.0 — weapons and the range
- **Five weapons** (`WEAPONS` in weapons.js), all given at the start in
  training: KNIFE (melee, 1.9 m reach), PISTOL (15+60, 0.16 s), RIFLE (30+180,
  0.085 s, auto), SNIPER (5+25, 1.25 s, 4x zoom), GRENADE (3, 3 s fuse, 7.5 m
  blast) and FLASHBANG (2, 1.8 s, 9 m, 4.5 s blind). `Arsenal` holds ammo,
  cooldowns, reloads, recoil, spread bloom and projectiles; `selectSlot(n)`
  maps keys 1-5 and cycles the two throwables in slot 5.
- **Accuracy:** base spread, tighter when aiming, wider when moving, plus bloom
  from rapid fire (bloom counts ×0.3 when aiming). Deterministic RNG so spread
  is testable. Recoil kicks the camera pitch (`S.recoilKick`) and decays.
- **Hitscan** through `world.raycast`; a solid tagged `target` carries a
  `.target` object (`makeTarget`), with hp, score, and a pop-back-up timer.
  Ten targets on the range at 10/20/35 m worth 10/25/50.
- **Grenades** are simulated projectiles with gravity and bouncing; blasts fall
  off with distance, are blocked by geometry (a raycast from the blast), can
  damage the thrower, and flashbangs blind based on whether you face them
  (`player.lookDir()`).
- **A dropped target stops blocking bullets:** solids now honour `s.disabled`
  in hit/hits/raycast.
- **Viewmodels:** six CC0 Quaternius GLBs in `assets/weapons/` (~490 KB total,
  converted from glTF with gltf-pipeline; the knife is a Dagger via obj2gltf).
  **These packs are not in metres and do not agree on which way a weapon
  points**, so `weapons_view.js` measures each model's bounding box, turns its
  longest axis to face forward, centres it on the grip and scales it to a real
  length (`REAL_LENGTH`). Hold positions per weapon in `HOLD` (hip and aimed).
  Sway, kick, reload dip, muzzle flash, target pop-down, grenades in flight.
- **HUD:** weapon name, ammo (or grenade count), score, hit marker, white
  flashbang overlay. No changes to the health presentation.
- **Note:** models load over http only — opening index.html from disk shows the
  game with invisible weapons. The build must be played from GitHub Pages.
  The dist is now a folder: index.html + game.js + assets/weapons/.
- **Still to do:** Rhys to judge viewmodel placement/feel (sizes are derived,
  not hand-placed); no weapon sounds yet; the "find a weapon to unlock a lane"
  rule is not wired (training gives everything); no reload/fire animations
  beyond the procedural kick.

## M1.5 — playtest 3 changes
- **Collision epsilon (bug):** `World.hit/hits` now ignore surfaces that merely
  touch (1e-4). The container-stack ladder was dead because its climbing
  column sat flush against the container and a 1e-15 overlap counted as a
  collision. Both ladder volumes were also moved clear of the ladder rungs
  (you could see through them).
- **Three stances** (`player.stance` 0/1/2; `setStance` refuses when there is
  no room; `crouching` stays as "not standing"). C cycles stand → crouch →
  prone → stand; holding C and releasing is a plain crouch. Prone: 0.62 m
  tall, eye 0.42, 1.1 m/s, noise 0.05, no sprint; jumping from prone stands
  you up. New **crawl pipe** in the yard (x=-20, 0.75 m clearance).
- **Sideways dash:** tap sprint while stepping left/right — 9.5 m/s for
  0.22 s, 25 stamina, 0.9 s cooldown, not prone (`dashT`, `dashCd`).
- **Ladders** centre you and force standing; entry from above still needs S.
- **Traverse path** is now one quadratic curve through the corner instead of
  two eased legs (no kick halfway through a vault or crate climb).
- **Duct flicker:** the roof panel overlapped the side panels (z-fighting);
  boxes now meet edge to edge. Worth remembering for future level pieces.
- **Two input bugs:** a tap between frames could be lost (one-off presses are
  now held in `S.pend` until a simulation step consumes them), and one tap
  could fire on every catch-up step in a slow frame (now cleared after the
  first step). Both only showed up at the 2 fps of the software renderer, but
  would bite on a slow machine.
- **Ladder texture** remapped (0.42 m per rung tile) — it was stretched.
- HUD shows CROUCHED / PRONE; the crouch-toggle setting is gone (the cycle
  replaces it); How to Move covers stances, prone, dash and crouch-jump.
- Note: the stance cycle is verified by the node tests and a direct trace; the
  browser test only checks that a C tap reaches the game, because key events
  can take several seconds to arrive at 2 fps.

## M1.3 — cache busting
Rhys's Chromebook kept serving an old `game.js` after an update (and GitHub's
CDN holds files for ~10 minutes too). `build.mjs` now reads `VERSION` out of
main.js and writes `<script src="game.js?v=M1.3">` into dist/index.html, plus
a no-cache meta tag. Every build therefore asks for an address no cache has
seen. **Bump `VERSION` in src/game/main.js with each release** — the label in
the bottom-right corner is how Rhys checks which build is live.
Also worth remembering: a downloaded file arrives as `game (1).js` if the old
one is still in Downloads, and uploading that name leaves the real `game.js`
untouched on the site.

## M1.2 — playtest 2 changes
- **Ladders centre you** on both axes when you get on.
- **Sprint-vaulting setting** (`settings.autoVault`: off / waist 1.3 m /
  high 2 m → `input.autoVaultMax`, `AUTO_VAULT` in input.js). Not while
  crouch-sprinting.
- **Crouch-jump:** jumping works while crouched (5.8 m/s, a little lower).
  **Pressing** crouch mid-air while rising kills the upward speed (a held
  crouch from before the jump does not — `prevCrouch` edge detection).
- **Crouch-sprint:** Shift while crouched, 3.6 m/s (crouch 2.1, walk 4.3,
  sprint 7.2), stamina drain ×0.75.
- **Noise:** `player.noise` each step — still 0, crouch 0.15, crouch-sprint
  0.4, swim 0.3, walk 0.5, sprint 1 (for listening guards in a later
  milestone; shown in the debug overlay).
- **Smoothness, properly:** (1) the drawn position is interpolated between
  the last two 60 Hz steps (`S.prevPos`, `S.alpha`), removing stutter when
  the screen's rate differs; (2) the camera height follows the body on a
  critically damped spring (`CamSmoother`), 0.13 s on stairs, tightening to
  0.018 s at 3 m/s+ vertical speed, instant for jumps over 1.6 m. Tested:
  at most 0.07 m per frame on stairs, 0.12 m sprinting up crates, <0.08 m lag
  in a jump.
- **Healing:** 5 per second after 5 s without damage (empty to full ~20 s).

## M1.1 — playtest 1 changes
- **No health bar.** Injury shows on screen: a red vignette that closes in as
  health drops (`#blood`), fine spatter at the edges that only gets heavy near
  death (`#splat`, painted once in index.html), a heartbeat pulse under 35,
  and the colour drains below 60 (CSS `saturate` on the canvas). The stamina
  bar only appears while stamina is below full.
- **Slow recovery** (since retuned in M1.2).
- **Smooth stairs:** the sim still steps; the camera soaks up small height
  changes while walking (`S.stepOff`, eased out).
- **Sprint-vaulting:** sprinting at anything ≤ 1.3 m (`autoTraverseMax`)
  vaults or climbs it with no key press, faster, and hands the sprint speed
  back afterwards — a staircase of crates can be run up. Low climbs cost 4
  stamina. Walking still needs Space; nothing higher is auto-climbed.
- **Ladders:** W always up, S always down (looking down no longer reverses),
  no sideways. Space steps onto a platform beside you when one is in reach
  (checked facing the wall, then to either side) — e.g. the 6 m tower
  platform; with nothing there Space does nothing. C lets go. At the top the
  climb hands over to a smooth step-off, and W no longer re-grabs the ladder
  from the platform (only within 1 m of the top). You can back onto a ladder
  from a platform (S while facing the wall); entering snaps you into the
  ladder's column.
- **Signs** have the same face on the back.
- **Texture orientation:** side faces now map u left-to-right as seen from
  outside (right = up × normal) and v downward — container stencils and the
  RESTRICTED fence read correctly.
- Held keys are tracked even while paused/deploying, so a key already down
  when play starts counts.

## Movement numbers (`P` in player.js)
Walk 4.3 m/s, sprint 7.2, crouch 2.1, crouch-sprint 3.6, prone 1.1, aiming ×0.6, backwards ×0.8, wading ×0.6.
Jump 6.6 m/s with gravity 21 → apex ~1.04 m. Step-up 0.45 m.
Standing height 1.8 (eye 1.64), crouched 1.15 (eye 0.98). Radius 0.32.
**Vault**: rise ≤ 1.25 m and depth ≤ 0.7 m (walls, rails — crates are climbed),
works mid-air too. **Climb**: ledge ≤ 2.35 m from standing; mid-air grab
reach 1.5 m above the feet (a standing jump reaches ~2.5 m); from water 2.0 m.
A 2.59 m container needs a crate. **Falls**: impact over 11.5 m/s hurts at
9 per m/s (3 m safe, 6 m ≈ −40, 9 m ≈ −71, 12 m ≈ −98, 15 m fatal); holding
crouch on landing ×0.8; water ≥ 0.9 m deep cancels it. **Stamina** 100: sprint
−12/s, regen 20/s after 0.8 s, jump −8, climb −10, exhausted until 25.
**Swimming** 3.0 (fast 4.6); float at the surface; dive with C or by looking
down and swimming; Space rises; breath 25 s, then −12/s; refills 10/s.
**Ladders** 3.2 m/s (see M1.1 above). **Health** regenerates 5/s after 5 s without damage.
Falling below −40 kills (safety net).

## Yard 7 (level_training.js)
120 × 120 m yard with 5 m walls (invisible collision up to 60 m so nothing
climbed leads out). Spawn (0,0,30) facing north.
- **Vault lane** (x=10): 0.8 / 1.05 / 1.25 vault, 1.7 / 2.2 climb, 2.59
  container with a crate beside it.
- **Crouch duct** (x=−12): 1.25 m clearance for 15 m.
- **Stairs → catwalk** (x=−30): up to 5.18 m, grated catwalk east with
  vaultable railings, a two-high stack, a crate up to a three-high stack,
  ladder down its east face, "DROP 7.8 m" sign.
- **Dive tower** (28–32, −38–−34): platforms at 6 and 12 m, side-by-side
  boards over the **pool** (20–40, −30–−14, 4.65 m deep, surface −0.35),
  ladder on the west face with a rail gap at the top.
- **Drop test** (x −39…−21, z −30): 3/6/9/12 m blocks with crate stairs.
- **Weapons range** (40, 35): walled, gate 2.8 m (unclimbable) — "LOCKED
  until you find a weapon in the field".
- Container rows along the north and west walls, floodlight posts, scattered
  crates and barrels, signage throughout.

## Rendering notes
One merged mesh per material (~64 draw calls at medium). Vertex shading darkens
surfaces near the ground (cheap baked look). Sun with PCF shadows (quality
low = off, medium = 1024/1 cascade, high = 2048/2 cascades), linear fog, ACES
tone mapping, sRGB. The sky is a vertex-coloured dome (a textured sphere had
seams). Railings are an invisible thin collider plus visible posts/bars.
Under water: blue fog + screen tint. Signs are canvas textures on planes.

## Asset packs
**See FRONTLINE_ASSETS.md** for the full inventory (Rhys's Drive zips have
meaningless names; that file is the key). The one that matters most: the
Quaternius **Ultimate Animated Character Pack** (`drive-download-…154123Z`) —
11 characters including **Swat**, all on one 62-bone rig with 24 shared
animations (Idle, Idle_Gun, Walk, Run, Run_Back/Left/Right, Run_Shoot,
Gun_Shoot, Roll, Death, HitRecieve…). No crouch/prone/swim/climb clips, so
those need blending or custom work on the same rig.

## Asset packs first delivered (superseded by FRONTLINE_ASSETS.md)
- **Kenney — Modular Buildings** (GLB/FBX/OBJ, 108 pieces): building kit.
- **Quaternius — Downtown City MegaKit** (224 MB; glTF/FBX): city buildings,
  street props. Large — upload only the parts needed.
- **Quaternius — Modular SciFi MegaKit** (47 MB; glTF/FBX/OBJ): interiors —
  good for research facilities / Ghost HQ.
- **Quaternius — Universal Base Characters** (123 MB; glTF/FBX): rigged
  (65-bone) male/female bodies + hairstyles. **No animations included** —
  Quaternius's separate *Universal Animation Library* (CC0) is made for this
  rig and would give idle/walk/run/jump/etc.
- **Quaternius — Guns** (20 guns: AR ×6, SMG ×2, pistol ×3, sniper ×3,
  crossbow ×2, grenades ×4; glTF/FBX/OBJ) — two identical copies uploaded.
- **Quaternius — Modular Parts** (58 parts) — two identical copies.
- Smaller sets: ships/vehicles ("Base", "Bomber_1/2"…, 37 models), medieval
  weapons (Arrow, Axe…, 24), sci-fi guns (Lightning Gun, LongPistol…, 7).

## Next: Milestone 3 — loadout, crates and the cast
Rhys's brief, agreed:
- **Five slots, by size not by category:** 1 primary, 1 backup, 2 "utility"
  slots (throwables, but also breaching charges, medkits, anything countable or
  not), 1 gear/tech. A weapon carries its own size, so two pistols, or a
  double helping of C5, are legal loadouts.
- **Loadout chosen at Ghost HQ Logistics before a mission**; crates in the
  field (weapon crates and gear crates, opened with **E**) let you change your
  mind, and **what you swap out stays in the crate**. In the game proper you
  can also take a weapon a downed enemy dropped.
- **Weapon families with real variants** (pistols: Px9, P99, Desert Eagle…),
  sharing family behaviour and differing in damage, magazine, rate and kick —
  needs a little research into real characteristics.
- **Weapon mods**, found in crates, fitted at Logistics or at specific places
  in the field: scope power, silencers, and grenade fills (smoke, CS, red
  phosphorous).
- **Automatic reload** when the weapon in your hands runs dry and you have
  ammo, but it takes time — switching weapons may be the better option.
- **Gear that changes the rules:** gas mask (immune to gas, muffled hearing),
  polarised lenses (flashbangs barely land), intel device (marks seen enemies),
  specialist kits (lockpicks, medical, demolition).
- **The cast:** replace the box stand-in with the Quaternius **Soldier/Swat**
  character and its 24 shared animations; that also fixes the third-person
  weapon hold properly (attach to a hand bone).

## Earlier notes (Milestone 2 — weapons & the range)
1. Bring in the Quaternius guns as viewmodels (first-person hands/weapon).
2. Weapon system: fire, recoil, reload, ammo, aim-down-sights, hit detection
   (raycast against the world + targets), impacts.
3. Unlock rule: the range lane for a weapon opens once it has been found;
   the range gate becomes a proper door; pop-up targets, scoring.
4. Sound: footsteps by surface, jump/land, splash, gunfire.
5. Replace some grey-box pieces with Kenney/Quaternius models where they fit.
Then Milestone 3: the first Red patrol (sight, alert states, search, combat),
and Mission Zero (briefing → loadout → objective → extraction → report).
