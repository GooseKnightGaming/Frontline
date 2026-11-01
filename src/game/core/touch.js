// FRONTLINE - touch controls (M6.34; Rhys: "I still can't play it on my phone"). On a touch screen there is no
// mouse to capture and no keyboard: a stick on the left (where your thumb lands; pushed to its edge, you sprint),
// look by dragging anywhere on the right, and buttons for the rest. FIRE also looks as you drag it. Each button
// stands in for a key: it holds that action's first bound key in Input's `down` set while touched, and counts as a
// press - so everything the keyboard does (hold E, hold Z) works the same way.

export const isTouchDevice = () => {
  try {
    if (/[?&]touch=1/.test(location.search)) return true;
    if (/[?&]touch=0/.test(location.search)) return false;
    return (navigator.maxTouchPoints > 0 || 'ontouchstart' in window) && !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  } catch (e) { return false; }
};

// what each button does: [id, label, action ('fire' and 'menu' are special), where]
export const TOUCH_BUTTONS = [
  // round FIRE, bottom right (fits a phone on its side: nothing higher than ~200 px from the bottom on the right,
  // where the radar is)
  ['fire', 'FIRE', 'fire', 'right:24px;bottom:84px;width:84px;height:84px;font-size:15px;background:rgba(200,60,50,0.42)'],
  ['jump', 'JUMP', 'jump', 'right:14px;bottom:14px;font-size:11px'],
  ['crouch', 'DUCK', 'crouch', 'right:78px;bottom:10px;font-size:11px'],
  ['use', 'E', 'interact', 'right:142px;bottom:14px'],
  ['reload', 'R', 'reload', 'right:120px;bottom:80px'],
  ['aim', 'AIM', 'aim', 'right:120px;bottom:142px;font-size:11px', 'toggle'],
  ['bash', 'F', 'bash', 'right:182px;bottom:110px'],
  // along the top: the rest
  ['menu', 'II', 'menu', 'left:12px;top:12px;width:46px;height:46px'],
  ['swap', '1/2', 'swap', 'left:66px;top:12px;width:46px;height:46px;font-size:12px'],
  ['util1', 'Z', 'use1', 'left:118px;top:12px;width:46px;height:46px'],
  ['util2', 'X', 'use2', 'left:170px;top:12px;width:46px;height:46px'],
  ['mode', 'MODE', 'firemode', 'left:222px;top:12px;width:46px;height:46px;font-size:10px'],
  ['vision', 'V', 'vision', 'left:274px;top:12px;width:46px;height:46px'],
  ['map', 'MAP', 'map', 'left:326px;top:12px;width:46px;height:46px;font-size:10px'],
];
export const STICK = { radius: 56, sprintAt: 0.92, dead: 0.12 };
export const LOOK = 0.0055;          // radians a pixel of drag, before the sensitivity setting

// the stick's push (pixels from where the thumb landed) as a move: x right, z forward; sprint at its edge
export function stickMove(dx, dy) {
  const r = STICK.radius, l = Math.hypot(dx, dy), k = l > r ? r / l : 1;
  let x = (dx * k) / r, z = (-dy * k) / r;
  const m = Math.hypot(x, z);
  if (m < STICK.dead) { x = 0; z = 0; }
  return { x, z, sprint: m >= STICK.sprintAt && z > 0.5 };
}

export function touchControls(input, opts) {
  const { active, onMenu, swap } = opts;
  const root = document.createElement('div');
  root.id = 'touch';
  root.style.cssText = 'position:fixed;inset:0;z-index:4;display:none;touch-action:none;user-select:none;-webkit-user-select:none';
  const btnCss = 'position:absolute;width:58px;height:58px;border-radius:50%;border:2px solid rgba(255,255,255,0.45);background:rgba(20,26,32,0.38);color:#fff;font:700 13px sans-serif;display:flex;align-items:center;justify-content:center;touch-action:none;letter-spacing:1px;';
  const els = {};
  for (const [id, label, , where] of TOUCH_BUTTONS) {
    const b = document.createElement('div'); b.className = 'tbtn'; b.dataset.id = id; b.textContent = label;
    b.style.cssText = btnCss + where; root.appendChild(b); els[id] = b;
  }
  const base = document.createElement('div'), knob = document.createElement('div');
  base.style.cssText = 'position:absolute;width:' + STICK.radius * 2 + 'px;height:' + STICK.radius * 2 + 'px;border-radius:50%;border:2px solid rgba(255,255,255,0.35);background:rgba(20,26,32,0.25);display:none;pointer-events:none';
  knob.style.cssText = 'position:absolute;width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.45);display:none;pointer-events:none';
  root.appendChild(base); root.appendChild(knob);
  const turn = document.createElement('div');
  turn.textContent = 'Turn your phone sideways - Frontline plays in landscape.';
  turn.style.cssText = 'position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);padding:10px 16px;background:rgba(13,16,20,0.85);color:#e8b423;font:600 14px sans-serif;border-radius:6px;display:none;pointer-events:none;text-align:center;max-width:80vw';
  root.appendChild(turn);
  document.body.appendChild(root);

  const S = { stick: null, look: new Map(), held: new Map(), aimOn: false };
  const code = (action) => ((input.settings.bindings[action] || [])[0]) || ('Touch_' + action);
  const press = (action) => { const c = code(action); input.down.add(c); input.pressed.add(action); };
  const release = (action) => { input.down.delete(code(action)); };
  const showStick = (x, y, kx, ky) => {
    base.style.display = knob.style.display = 'block';
    base.style.left = (x - STICK.radius) + 'px'; base.style.top = (y - STICK.radius) + 'px';
    knob.style.left = (kx - 26) + 'px'; knob.style.top = (ky - 26) + 'px';
  };

  const down = (e) => {
    if (e.pointerType === 'mouse' && !opts.mouseToo) return;
    e.preventDefault();
    const id = e.pointerId, btn = e.target.closest && e.target.closest('.tbtn');
    try { root.setPointerCapture(id); } catch (err) { /* ok */ }
    if (btn) {
      const def = TOUCH_BUTTONS.find((d) => d[0] === btn.dataset.id), action = def[2];
      btn.style.background = 'rgba(232,180,35,0.55)';
      if (action === 'menu') { onMenu(); return; }
      if (action === 'swap') { swap(); return; }
      if (action === 'fire') { input.mouse.fire = true; input.mouse.firePressed = true; S.look.set(id, { x: e.clientX, y: e.clientY }); S.held.set(id, { btn, action }); return; }
      if (def[4] === 'toggle') { S.aimOn = !S.aimOn; input.mouse.aimButton = S.aimOn; btn.style.borderColor = S.aimOn ? '#e8b423' : 'rgba(255,255,255,0.45)'; return; }
      press(action); S.held.set(id, { btn, action });
      return;
    }
    if (e.clientX < window.innerWidth * 0.42 && !S.stick) {
      S.stick = { id, x: e.clientX, y: e.clientY }; showStick(e.clientX, e.clientY, e.clientX, e.clientY);
      return;
    }
    S.look.set(id, { x: e.clientX, y: e.clientY });
  };
  const move = (e) => {
    const id = e.pointerId;
    if (S.stick && S.stick.id === id) {
      const dx = e.clientX - S.stick.x, dy = e.clientY - S.stick.y, l = Math.hypot(dx, dy), k = l > STICK.radius ? STICK.radius / l : 1;
      showStick(S.stick.x, S.stick.y, S.stick.x + dx * k, S.stick.y + dy * k);
      input.touchMove = stickMove(dx, dy);
      e.preventDefault(); return;
    }
    const lk = S.look.get(id);
    if (lk) {
      // in pixels, scaled so a drag means the same on a small screen and a big one
      const sc = LOOK / 0.0022;
      input.mouse.dx += (e.clientX - lk.x) * sc; input.mouse.dy += (e.clientY - lk.y) * sc;
      lk.x = e.clientX; lk.y = e.clientY; e.preventDefault();
    }
  };
  const up = (e) => {
    const id = e.pointerId;
    if (S.stick && S.stick.id === id) { S.stick = null; input.touchMove = null; base.style.display = knob.style.display = 'none'; }
    S.look.delete(id);
    const h = S.held.get(id);
    if (h) {
      S.held.delete(id); h.btn.style.background = '';
      if (h.action === 'fire') input.mouse.fire = false; else release(h.action);
    }
    for (const b of Object.values(els)) if (![...S.held.values()].some((q) => q.btn === b) && b.dataset.id !== 'fire') b.style.background = '';
    if (!S.held.size) els.fire.style.background = 'rgba(200,60,50,0.42)';
  };
  root.addEventListener('pointerdown', down);
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerup', up);
  root.addEventListener('pointercancel', up);
  root.addEventListener('contextmenu', (e) => e.preventDefault());

  const letGo = () => {
    for (const h of S.held.values()) if (h.action === 'fire') input.mouse.fire = false; else release(h.action);
    S.held.clear(); S.look.clear(); S.stick = null; input.touchMove = null;
    base.style.display = knob.style.display = 'none';
  };
  return {
    root, els, state: S,
    // shown only while you are playing (not over a menu, a crate, a question)
    tick() {
      const on = !!active();
      if ((root.style.display === 'block') !== on) { root.style.display = on ? 'block' : 'none'; if (!on) letGo(); }
      if (on) { const tall = window.innerHeight > window.innerWidth; if ((turn.style.display === 'block') !== tall) turn.style.display = tall ? 'block' : 'none'; }
    },
    letGo,
  };
}
