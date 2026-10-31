// FRONTLINE - what you see through a sight (Rhys: "including when
// alt-aiming, if the scope has iron-sight or a reticule, that'd be nice to look
// through too"). Pure: a string of SVG for each kind (weapons_view.js
// scopeKind), drawn over the view; tested in node.
//   cross:   a long scope - black all round the lens, fine crosshairs with
//            thick posts at the edge, range marks below the centre
//   chevron: a marksman's 3x - the lens, a chevron whose tip is the aim, a
//            short line to hold below it
//   dot:     a 2x optic - a red dot where the round goes, and nothing else
export function scopeSvg(kind) {
  const open = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-50 -50 100 100" preserveAspectRatio="xMidYMid slice">';
  if (kind === 'dot') {
    return open + '<circle cx="0" cy="0" r="0.55" fill="#ff2a1a"/><circle cx="0" cy="0" r="1.1" fill="#ff2a1a" opacity="0.25"/></svg>';
  }
  const lens = 38;
  // everything outside the lens dark, a rim of shadow just inside it
  const mask = '<defs><mask id="lens"><rect x="-200" y="-200" width="400" height="400" fill="white"/><circle cx="0" cy="0" r="' + lens + '" fill="black"/></mask>' +
    '<radialGradient id="rim"><stop offset="0.82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></radialGradient></defs>' +
    '<rect x="-200" y="-200" width="400" height="400" fill="#050505" mask="url(#lens)"/><circle cx="0" cy="0" r="' + lens + '" fill="url(#rim)"/>';
  let marks = '';
  if (kind === 'cross') {
    const k = '#0a0a0a';
    marks += '<line x1="-' + lens + '" y1="0" x2="' + lens + '" y2="0" stroke="' + k + '" stroke-width="0.18"/>';
    marks += '<line x1="0" y1="-' + lens + '" x2="0" y2="' + lens + '" stroke="' + k + '" stroke-width="0.18"/>';
    // thick posts from the edge, stopping short of the middle
    for (const [x1, y1, x2, y2] of [[-lens, 0, -14, 0], [lens, 0, 14, 0], [0, lens, 0, 14]]) marks += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + k + '" stroke-width="1.2"/>';
    // range marks: dots along the lines
    for (let i = 1; i <= 4; i++) {
      for (const [x, y] of [[i * 3, 0], [-i * 3, 0], [0, i * 3]]) marks += '<circle cx="' + x + '" cy="' + y + '" r="0.35" fill="' + k + '"/>';
    }
  } else {
    // the chevron: its tip is where the round goes
    marks += '<path d="M -2.2 2.6 L 0 0 L 2.2 2.6" fill="none" stroke="#d81e14" stroke-width="0.45" stroke-linejoin="miter"/>';
    marks += '<line x1="0" y1="4" x2="0" y2="9" stroke="#0a0a0a" stroke-width="0.25"/>';
    for (const y of [5.5, 7, 8.5]) marks += '<line x1="-0.8" y1="' + y + '" x2="0.8" y2="' + y + '" stroke="#0a0a0a" stroke-width="0.2"/>';
    marks += '<circle cx="0" cy="0" r="' + (lens - 6) + '" fill="none" stroke="#0a0a0a" stroke-width="0.12" opacity="0.6"/>';
  }
  return open + mask + marks + '</svg>';
}
