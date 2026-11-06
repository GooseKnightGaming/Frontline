// FRONTLINE - the gazetteer (M6.125.3): every level placed in the world, the first step to the semi-open world
// (Rhys, M6.20.8: "a van or chopper out to a level, or fast travel across a semi-open world"; 6 Nov: "I want it to
// become semi-open-worldy"). Data only for now: nothing in the game reads it yet. A world map, a region's hub or fast
// travel would start here. Each level's region is taken from its own words (its place and where); `guess: true`
// marks one the level does not say, placed by Claude for Rhys to confirm or move. test/gazetteer.test.mjs checks
// that every level has a region, so a new level must be placed.

export const REGIONS = {
  varnholm: { name: 'Varnholm', about: 'The city on the River Vell: the old quarter, the docks and the quay, Opera Street, the commercial district, Holm Street, and the hills above it (Hesk Hill, Kelder Abbey).' },
  kessin: { name: 'Kessin and its coast', about: 'The port of Kessin: the harbour and its pens, the quay, the goods yard, the airfield on the coast road, the cliffs and their coves, and Skarra rock and its lighthouse offshore.' },
  north: { name: 'The north', about: 'The Vashka hills and valley, the frontier at the Vashka Pass, Nordvik beyond it, the Arn valley and its bridges, Kessock\'s moor, ridge and peak, the Kaldberg pass, and Camp Ostrava in the far north.' },
  skarn: { name: 'The Skarn', about: 'The forest and the pass over it, Lake Orsa beyond, and the Skarn coast\'s piers.' },
  hollen: { name: 'Hollen and the Skerries', about: 'The capital of the General\'s south: the Mint, the Opera House, the Office of Press Standards, the house at Ravnsby, the coast road, and the Skerry islands offshore.' },
  morra: { name: 'Lake Morra', about: 'Where the peace was signed: the Ostberg house and Morra village.' },
  saren: { name: 'Port Saren and the Dry Coast', about: 'The smugglers\' port, Gull Cove, Cap Merrow above the sea, and the desert inland: Sand Hollow and the Bir Sahra well.' },
  lessar: { name: 'Lessar and the Vintners\' country', about: 'The banker\'s city: the racecourse, the courts, the old quarter, the mountain and its cable car, the common where the circus stands; and south of it the vineyards, the old quarry and the river.' },
  abroad: { name: 'Further afield', about: 'Ghost\'s work beyond the map: the Cerra jungle, the Shael\'s canyons, the Teskel launch complex, Drosk, the Severian coast, Port Aurel.' },
  elsewhere: { name: 'Nowhere on the map', about: 'Places that are not places: the Ward (you do not remember coming), and Q Branch\'s test range.' },
};

// level id -> { region, guess? }
export const PLACES = {
  sewers: { region: 'varnholm', guess: true }, bank: { region: 'varnholm', guess: true }, cemetery: { region: 'varnholm' },
  estate: { region: 'varnholm', guess: true }, manor: { region: 'varnholm', guess: true }, mine: { region: 'north' },
  facility: { region: 'kessin', guess: true }, vantage: { region: 'varnholm' }, ward: { region: 'elsewhere' },
  campus: { region: 'varnholm', guess: true }, shipyard: { region: 'kessin', guess: true }, fortress: { region: 'north' },
  drop: { region: 'kessin' }, beachhead: { region: 'abroad' }, factory_battle: { region: 'varnholm' },
  riverboat: { region: 'varnholm' }, city: { region: 'varnholm' }, ruins: { region: 'abroad' }, wasteland: { region: 'varnholm' },
  theatre: { region: 'varnholm' }, baths: { region: 'varnholm' }, temple: { region: 'abroad' }, prison: { region: 'north', guess: true },
  bunkers: { region: 'north' }, arena: { region: 'varnholm' }, nightclub: { region: 'varnholm' }, airport: { region: 'varnholm' },
  outpost: { region: 'abroad' }, spaceport: { region: 'abroad' }, subway: { region: 'varnholm' }, listening: { region: 'kessin', guess: true },
  yacht: { region: 'abroad' }, archive: { region: 'varnholm', guess: true }, tower: { region: 'varnholm', guess: true },
  testrange: { region: 'elsewhere' }, embassy: { region: 'varnholm' }, barracks: { region: 'north', guess: true },
  kaldberg: { region: 'north' }, glasshouse: { region: 'varnholm' }, grain: { region: 'varnholm' }, dalmar: { region: 'kessin' },
  ministry: { region: 'varnholm' }, embankment: { region: 'north', guess: true }, museum: { region: 'varnholm' },
  hospital: { region: 'varnholm' }, villa: { region: 'morra', guess: true }, pens: { region: 'kessin' }, rooftops: { region: 'varnholm' },
  lock: { region: 'varnholm' }, mill: { region: 'varnholm' }, holm: { region: 'varnholm' }, townhall: { region: 'varnholm' },
  market: { region: 'varnholm' }, power: { region: 'varnholm' }, docks: { region: 'varnholm' }, varna: { region: 'varnholm' },
  lodge: { region: 'north' }, mast: { region: 'varnholm' }, gazette: { region: 'varnholm' }, airfield: { region: 'kessin' },
  pass: { region: 'north' }, nordvik: { region: 'north' }, council: { region: 'north' }, arnbridge: { region: 'north' },
  camp: { region: 'north' }, relays: { region: 'north' }, light: { region: 'kessin' }, ball: { region: 'varnholm' },
  counting: { region: 'kessin' }, harbour: { region: 'kessin' }, battery: { region: 'kessin' }, cove: { region: 'kessin' },
  cottage: { region: 'kessin' }, wrongbridge: { region: 'north' }, hunt: { region: 'north' }, northhq: { region: 'north' },
  borderrun: { region: 'north' }, funfair: { region: 'varnholm' }, observatory: { region: 'north' }, cathedral: { region: 'varnholm' },
  monastery: { region: 'varnholm' }, express: { region: 'north' }, studio: { region: 'varnholm' }, safehouse: { region: 'varnholm', guess: true },
  railhotel: { region: 'varnholm' }, garage: { region: 'varnholm' }, crash: { region: 'skarn' }, fennick: { region: 'skarn' },
  lake: { region: 'skarn' }, bakery: { region: 'hollen' }, censor: { region: 'hollen' }, paperrun: { region: 'hollen' },
  opera: { region: 'hollen' }, veyestate: { region: 'hollen' }, drivesouth: { region: 'hollen' }, hollen: { region: 'hollen' },
  skerries: { region: 'hollen' }, seafort: { region: 'hollen' }, battery2: { region: 'hollen' }, mint: { region: 'hollen' },
  goodsyard: { region: 'kessin' }, pier: { region: 'skarn' }, treaty: { region: 'morra' }, clocktower: { region: 'morra' },
  signing: { region: 'morra' }, customs: { region: 'saren' }, oldtown: { region: 'saren' }, smugcove: { region: 'saren' },
  airstrip: { region: 'saren' }, capmerrow: { region: 'saren' }, caravan: { region: 'saren' }, racecourse: { region: 'lessar' },
  dancourt: { region: 'lessar' }, cablecar: { region: 'lessar' }, witnessflat: { region: 'lessar' }, motorcade: { region: 'lessar' },
  courthouse: { region: 'lessar' }, quarry: { region: 'lessar' }, vineyard: { region: 'lessar' }, oldbridge: { region: 'lessar' },
  bigtop: { region: 'lessar' }, winterquarters: { region: 'lessar', guess: true }, lastshow: { region: 'lessar' },
};

export const regionOf = (id) => (PLACES[id] ? PLACES[id].region : null);
export const levelsIn = (region) => Object.keys(PLACES).filter((id) => PLACES[id].region === region);
