// FRONTLINE - the Riverside Hotel's intel (Rhys: "I would like some
// LORE in the rooms please"). Papers left lying about: not needed to finish,
// but each one says something about who is here and why - and some of it will
// matter later (the captain's deputy, who the hostages are, the laboratory,
// the helicopter). Read with E; the debrief counts what you found.
// room: the map label of the room it lies in (on a table if there is one).
// Pure data: no engine. Names are placeholders until Rhys settles them.

export const HOTEL_INTEL = [
  {
    id: 'delivery', room: 'Kitchen', kind: 'Delivery note',
    title: 'Delivery note - kitchen door',
    text: [
      'THE RIVERSIDE HOTEL  -  EST. 1962',
      'Goods in: 4 crates, marked TABLE LINEN. Weight on the docket: 38 kg each.',
      'Signed for: R. Arden (events). Not one of ours - Chef.',
      'Scrawled underneath: "Linen doesn\'t clank. Who is Arden?"',
    ],
  },
  {
    id: 'bartab', room: 'Bar', kind: 'Bar tab',
    title: 'Bar tab - Room 205',
    text: [
      'Room 205 - T. Ashdown. Two whiskies, then two more.',
      'On the back, in biro: "Man at the end of the bar says he flies helicopters for a living. Out of the city tonight, he says - from the ROOF. Asked him which company. He changed the subject."',
    ],
  },
  {
    id: 'memo', room: 'Estate Room (107)', kind: 'Manager\'s memo',
    title: 'Memo - from the General Manager',
    text: [
      'To all duty managers.',
      'The new CCTV is still playing up - the picture jumps and the clocks go wrong. The installer swears it is the wiring. I do not want to hear about it again until he has been back.',
      'The Estate Room safe: I have reset it to something I will not forget - the year we opened. If you cannot remember that, you should not be in the safe.',
      'The Balcony Suite key stays in the safe. Nobody goes up to 207 without me.',
    ],
  },
  {
    id: 'regcard', room: 'Room 104', kind: 'Registration card',
    title: 'Guest registration - Room 104',
    text: [
      'Name: Dr Imogen Hale.  Occupation: structural engineer.',
      'Purpose of stay: business - "bridge survey, the new river crossing".',
      'Arrived 8 July. Departing: 10 July.',
      'Reception note: asked twice whether the hotel has a back way out. Said she thought she was being followed from the station.',
    ],
  },
  {
    id: 'orders', room: 'Room 203', kind: 'Red orders',
    title: 'Standing orders (red, typed)',
    text: [
      'Hold the building until extraction. The aircraft lands on the roof at 23:30 and waits for no one but the captain.',
      'The three guests are the reason we are here. They are to be kept alive and kept apart.',
      'Night vision for officers and specialists. Torches for the rest. Nobody fires on the police unless they come inside.',
      'If the captain falls, Lieutenant Varga has command. Varga knows where the guests are to be taken.',
    ],
  },
  {
    id: 'notebook', room: 'Room 205', kind: 'Notebook page',
    title: 'A page torn from a reporter\'s notebook',
    text: [
      'T.A. - week 3.',
      'Money in through the shell firms (Pellow keeps the books - get him talking). Money out to a LABORATORY? A university one, up north. Biosciences. "Restricted floor."',
      'What does a red cell want with a university lab?',
      'Ask Hale about the bridge. Ask Pellow about the yellows - he went pale when I said the word.',
    ],
  },
  {
    id: 'ledger', room: 'Balcony Suite (Room 207)', kind: 'Ledger',
    title: 'Ledger - the Balcony Suite',
    text: [
      'Columns of figures in a neat hand - E. Pellow.',
      'Payments out: Arden Events Ltd. Northgate Freight. "Lab consumables" (three entries, large).',
      'A line underlined twice: "Yellows - their cut, or they come for it."',
      'In the margin: "If they take the hotel, the book goes in the safe. If they take the book, I am finished."',
    ],
  },
  {
    id: 'flightplan', room: 'Dining Table', kind: 'Flight plan',
    title: 'Flight plan (torn) - left in the penthouse',
    text: [
      'Departure: hotel roof, 23:30. Passengers: 1 (the captain) - then crossed out and written over: 1 + 3.',
      'Destination: blacked out. Fuel for two hundred miles.',
      'Pencilled on the corner: "If it goes wrong, Varga meets you at the second site."',
    ],
  },
];
