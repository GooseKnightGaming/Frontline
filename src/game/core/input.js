// FRONTLINE - settings and input.
// Chromebook-first: no mouse wheel, no second mouse button required, and
// nothing that fights the browser (Ctrl, Tab and the Search key are left
// alone). Every action can be rebound.

export const ACTIONS = [
  ['forward', 'Move forward'], ['back', 'Move back'], ['left', 'Move left'], ['right', 'Move right'],
  ['jump', 'Jump / vault / climb'], ['sprint', 'Sprint'], ['crouch', 'Crouch / dive'],
  ['interact', 'Interact'], ['reload', 'Reload'], ['firemode', 'Firing mode: auto / burst / single'], ['equipment', 'Equipment'], ['command', 'Command wheel'],
  ['aim', 'Aim / focus'], ['vision', 'Vision mode: normal / night vision (thermal, UV, EMF - coming)'],
  ['use1', 'Use Utility 1 (tap: throw / place / use; hold: set off what you placed)'], ['use2', 'Use Utility 2 (tap: throw / place / use; hold: set off what you placed)'],
  ['detonate', 'Set off placed charges (the kind in your hand)'],
  ['bash', 'Strike with the weapon'], ['map', 'Radar: range / off'],
  ['mapIn', 'Radar: closer'], ['mapOut', 'Radar: wider'],
  ['slot1', 'Primary'], ['slot2', 'Secondary'], ['slot3', 'Utility 1'], ['slot4', 'Utility 2'], ['slot5', 'Gear'],
];
export const DEFAULT_BINDINGS = {
  forward: ['KeyW', 'ArrowUp'], back: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  jump: ['Space'], sprint: ['ShiftLeft', 'ShiftRight'], crouch: ['KeyC'],
  interact: ['KeyE'], reload: ['KeyR'], firemode: ['Digit0'], equipment: ['KeyG'], command: ['KeyQ'],
  // (Rhys: "Z and X ... trigger them independently") Z and X use what is in
  // utility slots 1 and 2 without putting your weapon away; holding one sets off what you placed
  aim: ['AltLeft', 'AltRight'], vision: ['KeyV'], use1: ['KeyZ'], use2: ['KeyX'], detonate: [],
  bash: ['KeyF'], map: ['KeyM'], mapIn: ['Comma'], mapOut: ['Period'],
  slot1: ['Digit1'], slot2: ['Digit2'], slot3: ['Digit3'], slot4: ['Digit4'], slot5: ['Digit5'],
};
// Keys we refuse to bind: the browser or the operating system owns them.
export const FORBIDDEN = new Set(['Tab', 'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight', 'OSLeft', 'OSRight', 'Escape', 'F5', 'BrowserBack', 'BrowserForward', 'BrowserRefresh']);

export const DEFAULT_SETTINGS = {
  sensitivity: 1.0, invertY: false, fov: 75, crouchToggle: false,
  quality: 'medium', showFps: false, glitchHints: false, autoVault: 'waist', map: true, mapZoom: 1, bindings: DEFAULT_BINDINGS,
};
const KEY = 'frontline.settings.v1';

export function loadSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { s = {}; }
  const out = Object.assign({}, DEFAULT_SETTINGS, s);
  out.bindings = Object.assign({}, DEFAULT_BINDINGS, s.bindings || {});
  // M6.7.0: the view switch became vision modes (the view is in Settings now);
  // a key someone chose for the old one carries over
  if (out.bindings.view) { if (!(s.bindings && s.bindings.vision)) out.bindings.vision = out.bindings.view; delete out.bindings.view; }
  // M6.17.5: X uses utility slot 2 now (hold it to set off what you placed): an old
  // default "X sets off charges" gives way, so the two do not fight over the key
  if ((out.bindings.detonate || []).includes('KeyX') && (out.bindings.use2 || []).includes('KeyX')) out.bindings.detonate = out.bindings.detonate.filter((k) => k !== 'KeyX');
  return out;
}
export function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } }

// how high sprinting will take you over things on its own
export const AUTO_VAULT = { off: 0, waist: 1.3, high: 2.0 };

export function isChromebook() { return /\bCrOS\b/.test(navigator.userAgent || ''); }

export function keyLabel(code) {
  if (!code) return '-';
  const map = { Space: 'Space', ShiftLeft: 'L-Shift', ShiftRight: 'R-Shift', AltLeft: 'L-Alt', AltRight: 'R-Alt',
    ArrowUp: '\u2191', ArrowDown: '\u2193', ArrowLeft: '\u2190', ArrowRight: '\u2192', Enter: 'Enter', Backquote: '`', Comma: ',', Period: '.' };
  if (map[code]) return map[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}

export class Input {
  constructor(canvas, settings) {
    this.canvas = canvas;
    this.settings = settings;
    this.down = new Set();
    this.pressed = new Set();       // actions pressed since last frame
    this.mouse = { dx: 0, dy: 0, fire: false, aimButton: false, firePressed: false };
    this.yaw = 0; this.pitch = 0;
    this.locked = false;
    this.enabled = true;
    this.crouchLatched = false;
    this.capture = null;            // callback while rebinding a key
    this.onUnlock = null;
    this.debugPressed = false;
    this.touchMove = null;          // (M6.34) the touch stick: { x, z, sprint }

    window.addEventListener('keydown', (e) => this.keyDown(e), true);
    window.addEventListener('keyup', (e) => this.keyUp(e), true);
    window.addEventListener('blur', () => { this.down.clear(); this.mouse.fire = false; this.mouse.aimButton = false; });
    // the page hidden (a screenshot tool, another window): keys let go there never reach us
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.down.clear(); this.mouse.fire = false; this.mouse.aimButton = false; } });
    document.addEventListener('pointerlockchange', () => {
      const was = this.locked;
      this.locked = document.pointerLockElement === canvas;
      if (was && !this.locked && this.onUnlock) this.onUnlock();
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.locked) return;
      this.mouse.dx += e.movementX || 0; this.mouse.dy += e.movementY || 0;
    });
    canvas.addEventListener('mousedown', (e) => this.mouseDown(e));
    window.addEventListener('mouseup', (e) => this.mouseUp(e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  actionFor(code) {
    for (const [a, codes] of Object.entries(this.settings.bindings)) if (codes.includes(code)) return a;
    return null;
  }
  held(action) { return (this.settings.bindings[action] || []).some((c) => this.down.has(c)); }

  keyDown(e) {
    if (this.capture) {
      e.preventDefault(); e.stopPropagation();
      if (e.code === 'Escape') { const cb = this.capture; this.capture = null; cb(null); return; }
      if (FORBIDDEN.has(e.code)) return;
      const cb = this.capture; this.capture = null; cb(e.code);
      return;
    }
    if (e.code === 'Backquote') { this.debugPressed = true; e.preventDefault(); return; }
    const a = this.actionFor(e.code);
    // Alt on its own would focus the browser menu on some systems.
    if (a || e.code === 'AltLeft' || e.code === 'AltRight' || e.code === 'Space' || e.code.startsWith('Arrow')) {
      if (this.locked || a) e.preventDefault();
    }
    // held keys are always tracked (so a key already down when play starts
    // still counts); one-off presses only count while playing
    const fresh = !this.down.has(e.code);
    this.down.add(e.code);
    if (!this.enabled) return;
    if (fresh && a) this.pressed.add(a);

  }
  keyUp(e) {
    this.down.delete(e.code);
    if (this.actionFor(e.code)) e.preventDefault();
  }

  // Aim and fire, Chromebook-safe:
  //  - left click fires; right click (or holding the aim key) aims;
  //  - while the aim KEY is held, ANY click fires - because ChromeOS turns
  //    Alt + click into a right click, which would otherwise be "aim".
  mouseDown(e) {
    if (!this.locked) return;
    e.preventDefault();
    if (this.held('aim') || e.button === 0) { this.mouse.fire = true; this.mouse.firePressed = true; }
    else if (e.button === 2) this.mouse.aimButton = true;
  }
  mouseUp(e) {
    if (e.button === 2 && !this.held('aim')) this.mouse.aimButton = false;
    this.mouse.fire = false;
    if (e.button === 2) this.mouse.aimButton = false;
  }

  requestLock() {
    if (this.canvas.requestPointerLock) {
      try { const r = this.canvas.requestPointerLock({ unadjustedMovement: false }); if (r && r.catch) r.catch(() => this.canvas.requestPointerLock()); }
      catch (e) { this.canvas.requestPointerLock(); }
    }
  }

  // Build the sim input for this frame and clear one-shot presses.
  frame(extra) {
    const s = this.settings;
    const k = 0.0022 * s.sensitivity;
    if (this.mouse.dx || this.mouse.dy) this.lastLook = performance.now();     // when the mouse last moved
    this.yaw -= this.mouse.dx * k;
    this.pitch -= this.mouse.dy * k * (s.invertY ? -1 : 1);
    this.pitch = Math.max(-1.52, Math.min(1.52, this.pitch));
    this.mouse.dx = 0; this.mouse.dy = 0;
    const crouch = this.held('crouch');   // presses cycle stance in the simulation
    const out = {
      // (M6.34) the touch stick adds to the keys (touch.js)
      moveX: Math.max(-1, Math.min(1, (this.held('right') ? 1 : 0) - (this.held('left') ? 1 : 0) + (this.touchMove ? this.touchMove.x : 0))),
      moveZ: Math.max(-1, Math.min(1, (this.held('forward') ? 1 : 0) - (this.held('back') ? 1 : 0) + (this.touchMove ? this.touchMove.z : 0))),
      jump: this.held('jump'), jumpPressed: this.pressed.has('jump'),
      sprint: this.held('sprint') || !!(this.touchMove && this.touchMove.sprint), sprintPressed: this.pressed.has('sprint'), crouch,
      crouchCycle: true, crouchPressed: this.pressed.has('crouch'),
      aim: this.held('aim') || this.mouse.aimButton,
      fire: this.mouse.fire, firePressed: this.mouse.firePressed,
      visionPressed: this.pressed.has('vision'),
      interactPressed: this.pressed.has('interact'),
      reloadPressed: this.pressed.has('reload'),
      firemodePressed: this.pressed.has('firemode'),
      bashPressed: this.pressed.has('bash'),
      detonatePressed: this.pressed.has('detonate'),
      mapPressed: this.pressed.has('map'),
      mapInPressed: this.pressed.has('mapIn'), mapOutPressed: this.pressed.has('mapOut'),
      slotPressed: [1, 2, 3, 4, 5].find((n) => this.pressed.has('slot' + n)) || 0,
      strafePressed: this.pressed.has('right') ? 'right' : this.pressed.has('left') ? 'left' : null,
      debugPressed: this.debugPressed,
      autoVaultMax: AUTO_VAULT[s.autoVault] !== undefined ? AUTO_VAULT[s.autoVault] : AUTO_VAULT.waist,
      yaw: this.yaw, pitch: this.pitch,
    };
    Object.assign(out, extra || {});
    this.pressed.clear(); this.mouse.firePressed = false; this.debugPressed = false;
    return out;
  }
}
