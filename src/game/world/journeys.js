// FRONTLINE - the journeys (M7.0.0): the first time Ghost works in a region, you drive there for real.
//
// Rhys (8 Nov 2026): "Driven for real for the first mission in any of the ten regions of the world. Once the
// region is established as 'known', unlock fast-travel as a choice on the map." And: "you absolutely should be able
// to walk around the world freely" - so a journey is a road you can leave: get out of the van, walk the verge, go
// into the roadside stop halfway (somebody there knows the region), and drive on.
//
// makeJourney(region, to) builds a first-draft level spec (the kit's, like the Border Run's) for the road into
// `region`, ending where the job `to` begins. Reaching the end marks the region known (sim/play/world.js) and the
// job's own level loads. index.html?level=journey&region=north&to=pass
//
// Each region has its own road: Varnholm's suburbs, the Kessin coast road, the snow in the north's valleys, the
// Skarn's pines, Hollen's boulevards, the shore of Lake Morra, the Dry Coast's sand, the Vintners' hedgerows, and
// for further afield the road to the Kessin airfield, where a plane is waiting.

import { REGIONS } from './gazetteer.js';

const W = 150, H = 24;
const ROAD = [9, 14];                         // the road's rows (the carriageway and its verges)

// each region's road: its look, its stop, and what the person at the stop says
export const ROADS = {
  varnholm: {
    sides: 'city', backdrop: 'city', mat: 'asphalt', weather: null, hour: 17, minute: 40,
    atmos: { fog: [0.5, 0.52, 0.56, 40, 260], ambient: [0.55, 0.55, 0.58] },
    from: 'Yard 7', into: 'Varnholm', end: 'the city limits, east',
    stop: { name: 'a corner cafe', who: 'The woman behind the counter', says: 'Ghost? Never heard of them. Mind how you go in the old quarter after dark. The reds do their spot checks on the bridges.' },
  },
  kessin: {
    sides: 'coast', backdrop: 'hills', mat: 'asphalt', weather: 'wind', hour: 11, minute: 15,
    atmos: { fog: [0.62, 0.68, 0.74, 50, 300], ambient: [0.6, 0.62, 0.66] },
    from: 'the coast road', into: 'Kessin', end: 'the harbour road, east',
    stop: { name: 'a fish stall', who: 'A fisherman mending a net', says: 'Kessin? Everything comes in by the harbour and half of it goes out again at night. Keep off the quay after ten.' },
  },
  north: {
    sides: 'rock', backdrop: 'hills', mat: 'asphalt', weather: 'snow', hour: 9, minute: 30,
    atmos: { fog: [0.66, 0.69, 0.74, 40, 240], ambient: [0.55, 0.57, 0.62] },
    from: 'the valley road', into: 'the north', end: 'the valley head, east',
    stop: { name: 'a filling station', who: 'The pump attendant', says: 'Up the valley the reds stop everything with wheels. Chains on, papers ready, and do not argue with the turret.' },
  },
  skarn: {
    sides: 'forest', backdrop: 'woods', mat: 'grass', weather: 'snow', hour: 8, minute: 10,
    atmos: { fog: [0.7, 0.72, 0.76, 25, 180], ambient: [0.52, 0.54, 0.58] },
    from: 'the forest road', into: 'the Skarn', end: 'the forest edge, east',
    stop: { name: 'a forester\'s hut', who: 'An old forester', says: 'The Skarn swallows planes and lorries and men. If you lose the road, follow the river down. Never up.' },
  },
  hollen: {
    sides: 'city', backdrop: 'city', mat: 'asphalt', weather: null, hour: 14, minute: 0,
    atmos: { fog: [0.72, 0.68, 0.6, 60, 320], ambient: [0.66, 0.62, 0.56] },
    from: 'the south road', into: 'Hollen', end: 'the boulevard, east',
    stop: { name: 'a newspaper kiosk', who: 'The newsvendor', says: 'Every paper in Hollen says the same thing, and the General signs it. The Courier is the only one that does not, and you will not find it here.' },
  },
  morra: {
    sides: 'lake', backdrop: 'hills', mat: 'grass', weather: null, hour: 10, minute: 45,
    atmos: { fog: [0.7, 0.75, 0.8, 70, 360], ambient: [0.66, 0.68, 0.7] },
    from: 'the lake road', into: 'Lake Morra', end: 'Morra village, east',
    stop: { name: 'a boathouse', who: 'The boatman', says: 'The big houses on the far shore have their own police now. Very polite. They write down every boat.' },
  },
  saren: {
    sides: 'desert', backdrop: 'hills', mat: 'desert', weather: 'wind', hour: 15, minute: 20,
    atmos: { fog: [0.85, 0.78, 0.66, 60, 320], ambient: [0.72, 0.66, 0.56] },
    from: 'the Dry Coast road', into: 'Port Saren', end: 'the port road, east',
    stop: { name: 'a roadside well', who: 'A water seller', says: 'In Saren everything has a price and the customs men know all of them. Pay twice and nobody remembers your face.' },
  },
  lessar: {
    sides: 'vines', backdrop: 'hills', mat: 'grass', weather: null, hour: 12, minute: 30,
    atmos: { fog: [0.74, 0.76, 0.72, 70, 360], ambient: [0.68, 0.68, 0.64] },
    from: 'the vineyard road', into: 'Lessar', end: 'the old gate of Lessar, east',
    stop: { name: 'a wine shed', who: 'A vintner', says: 'Lessar runs on money that nobody counts out loud. The banks close at noon and open again at midnight, for some people.' },
  },
  abroad: {
    sides: 'airfield', backdrop: 'hills', mat: 'concrete', weather: 'wind', hour: 6, minute: 20,
    atmos: { fog: [0.6, 0.63, 0.68, 60, 320], ambient: [0.56, 0.58, 0.62] },
    from: 'the airfield road', into: 'the plane out', end: 'the plane, east',
    stop: { name: 'the guard hut', who: 'Ghost\'s ground man', says: 'She is fuelled and the pilot has the route. Wherever you are going, it is a long way, and you go alone from the other end.' },
  },
};

// the side scenery, as carve ops: north strip rows 1 - 7, south strip rows 16 - 22 (the road between)
function sideOps(kind) {
  const ops = [], after = [];
  const N = [1, 7], S = [16, 22];
  const skipStop = (x0, x1) => x1 >= 64 && x0 <= 82;          // the stop stands at x 66 - 80, north
  if (kind === 'city') {
    for (let x = 6; x < W - 12; x += 13) {
      if (!skipStop(x, x + 8)) { ops.push(['room', x, 2, x + 8, 6]); after.push(['cells', [[x + 4, 7]], 'D']); }
      ops.push(['room', x + 3, 17, x + 11, 21]); after.push(['cells', [[x + 7, 16]], 'D']);
    }
  } else if (kind === 'rock') {
    after.push(['room', 0, 0, W - 1, 1, 'J'], ['room', 0, 22, W - 1, 23, 'J']);
    for (let x = 8; x < W - 8; x += 11) after.push(['cells', [[x, 4 + (x % 3)], [x + 5, 18 + (x % 3)]], 'r']);
  } else if (kind === 'forest') {
    for (let x = 4; x < W - 4; x += 4) for (const y of [2, 5, 18, 21]) if (!(y < 8 && skipStop(x, x))) after.push(['cells', [[x + ((y * 3) % 3), y]], 't']);
  } else if (kind === 'coast') {
    after.push(['room', 0, 18, W - 1, 23, '~']);
    for (let x = 6; x < W - 10; x += 16) if (!skipStop(x, x + 6)) { ops.push(['room', x, 3, x + 6, 6]); after.push(['cells', [[x + 3, 7]], 'D']); }
    for (let x = 10; x < W - 6; x += 12) after.push(['cells', [[x, 16]], 'r']);
  } else if (kind === 'lake') {
    after.push(['room', 0, 0, W - 1, 4, '~']);
    for (let x = 6; x < W - 6; x += 5) after.push(['cells', [[x, 18 + (x % 4)]], 't']);
    for (let x = 14; x < W - 20; x += 30) { ops.push(['room', x, 18, x + 6, 21]); after.push(['cells', [[x + 3, 17]], 'D']); }
  } else if (kind === 'desert') {
    after.push(['room', 0, 19, W - 1, 23, '~']);
    for (let x = 5; x < W - 5; x += 9) after.push(['cells', [[x, 3 + (x % 4)], [x + 4, 16 + (x % 2)]], 'r']);
  } else if (kind === 'vines') {
    for (const y of [2, 4, 6, 17, 19, 21]) for (let x = 3; x < W - 3; x += 20) if (!(y < 8 && skipStop(x, x + 14))) after.push(['room', x, y, x + 14, y, 'h']);
  } else if (kind === 'airfield') {
    after.push(['room', 0, 0, W - 1, 1, 'f']);
    for (let x = 10; x < W - 30; x += 24) { ops.push(['room', x, 17, x + 10, 21]); after.push(['cells', [[x + 5, 16]], 'D']); }
  }
  return { ops, after };
}

export function makeJourney(region, to) {
  const R = ROADS[region];
  if (!R) return null;
  const reg = REGIONS[region] || { name: region };
  const nm = reg.name.replace(/^The /, 'the ');                  // mid-sentence
  const side = sideOps(R.sides);
  const sx = 70;                                                // the stop's door, on the road
  return {
    id: 'journey', no: 0, title: 'The Road to ' + (R.into === 'the plane out' ? 'the Plane' : R.into), place: R.from,
    journey: { region, to },
    where: 'On the road from Yard 7 into ' + nm + '. ' + String(R.hour).padStart(2, '0') + ':' + String(R.minute).padStart(2, '0') + '.',
    brief: [
      ['The road', 'Ghost has not worked in <b>' + nm + '</b> before. You <b>drive there</b> in the van: get in (E), and take the road east. Once you have arrived, the region is <b>known</b>, and after this the map table in Ghost HQ can send you straight there.'],
      ['On the way', 'There is <b>' + R.stop.name + '</b> halfway, on the north side of the road. Stop if you like. Somebody there knows the region. Nobody is looking for you yet.'],
      ['Objectives', '<b>Drive into ' + nm + '</b> (' + R.end + ').'],
    ],
    time: { date: [1, 5, 2027], hour: R.hour, minute: R.minute }, night: false, faction: 'red', weather: R.weather || undefined,
    startLoadout: { primary: null, backup: 'V27C', utility1: 'SMOKE', utility2: 'FLASH', gear: 'LENSES', mods: { backup: ['SILENCER'] } },
    atmos: R.atmos,
    extractName: R.end, extract: { x: W - 3, y: 12, floor: 'G' },
    outside: { backdrop: R.backdrop, mat: R.mat, margin: 12 },
    windows: R.sides === 'city' || R.sides === 'coast' || R.sides === 'lake' ? undefined : false,
    floors: {
      G: {
        y: 0, wallH: 3.2, wall: R.sides === 'desert' ? 'plaster' : 'paint', wallTint: R.sides === 'city' ? [0.75, 0.72, 0.66] : [0.82, 0.8, 0.74], floor: 'wood', ceil: 'plaster',
        lampPower: 0.6, lampColour: [1, 0.92, 0.8], lampEvery: 4,
        carve: { size: [W, H], ops: side.ops.concat([['room', 66, 3, 74, 7]]), after: side.after.concat([
          ['cells', [[sx, 8]], 'D'], ['cells', [[68, 4]], 'K'], ['cells', [[72, 6], [67, 6]], 'T'],
        ]) },
      },
    },
    extra(kit) {
      const { box, level, mid, CELL: C } = kit;
      // the carriageway: tarmac, its centre line, and the verges
      box([0, 0.005, ROAD[0] * C], [W * C, 0.03, (ROAD[1] + 1) * C], 'asphalt', { tint: [0.32, 0.32, 0.34], solid: false });
      for (let x = 2; x < W - 2; x += 3) box([x * C, 0.03, 11.95 * C], [(x + 1.4) * C, 0.04, 12.05 * C], 'paint', { tint: [0.95, 0.92, 0.7], solid: false });
      // the region's sign at the end of the road, and the stop's
      level.signs.push({ pos: [mid(W - 6), 3.2, mid(8)], yaw: -Math.PI / 2, w: 3.6, h: 0.8, text: (R.into === 'the plane out' ? 'KESSIN AIRFIELD' : reg.name.toUpperCase()), sub: R.into === 'the plane out' ? 'Departures' : 'Welcome', col: '#24304a' });
      level.signs.push({ pos: [mid(70), 2.8, mid(8)], yaw: 0, w: 3.2, h: 0.6, text: R.stop.name.replace(/^an? /, '').toUpperCase(), col: '#3a2a1a' });
      for (let x = 10; x < W; x += 16) level.lights.push({ pos: [mid(x), 4.5, mid(8)], range: 12, intensity: 0.7, color: [1, 0.9, 0.75], street: true });
      if (R.sides === 'airfield') {
        // the plane at the end of the apron: a fuselage, its wings and tail (not to be got into: the end is the door)
        // on the apron south of the road, clear of it
        box([(W - 18) * C, 0.6, 18.4 * C], [(W - 6) * C, 3.0, 20.6 * C], 'metal', { tint: [0.8, 0.82, 0.84] });
        box([(W - 14) * C, 1.4, 15.6 * C], [(W - 11) * C, 1.7, 23.6 * C], 'metal', { tint: [0.76, 0.78, 0.8] });
        box([(W - 18) * C, 3.0, 19.1 * C], [(W - 17) * C, 5.2, 19.9 * C], 'metal', { tint: [0.7, 0.72, 0.74] });
      }
    },
    vehicles: [{ id: 'ghostvan', kind: 'car', model: 'lightUtility', paint: 'grey', at: [6, 12], yaw: -Math.PI / 2, hp: 900 }],
    start: { x: 3, y: 11, floor: 'G', yaw: -Math.PI / 2 },
    reach: [{ id: 'edge', name: R.end, at: [W - 8, ROAD[0] - 1, W - 1, ROAD[1] + 1] }],
    zones: [
      { id: 'stop', label: 'The road - ' + R.stop.name, at: [66, 3, 74, 7] },
      { id: 'road', label: 'The road into ' + nm, at: [0, 0, W - 1, H - 1] },
    ],
    guards: [],
    civilians: [{ id: 'local', at: [69, 5, 'G'], yaw: 0, title: R.stop.who, tint: [1.1, 1.0, 0.9], says: [R.stop.says] }],
    objectives: [{ id: 'o1', kind: 'reach', ref: 'edge', text: 'Drive into ' + nm + ' (' + R.end + ')' }],
  };
}

// every region a job can be in has a road, except nowhere
export const JOURNEY_REGIONS = Object.keys(ROADS);
