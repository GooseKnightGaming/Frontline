// FRONTLINE - touch controls (src/game/core/touch.js, M6.34): the stick's arithmetic, and every button standing for
// an action the keyboard has.
import { stickMove, STICK, TOUCH_BUTTONS } from '../src/game/core/touch.js';
import { DEFAULT_BINDINGS } from '../src/game/core/input.js';
import { readFileSync } from 'fs';
let n = 0, bad = 0;
const ok = (c, m) => { n++; if (!c) { bad++; console.log('FAIL', m); } };
const near = (a, b) => Math.abs(a - b) < 1e-6;
let m = stickMove(0, 0); ok(m.x === 0 && m.z === 0 && !m.sprint, 'at rest');
m = stickMove(3, -2); ok(m.x === 0 && m.z === 0, 'a twitch is nothing');
m = stickMove(0, -STICK.radius / 2); ok(near(m.z, 0.5) && near(m.x, 0) && !m.sprint, 'half forward walks');
m = stickMove(0, -STICK.radius * 3); ok(near(m.z, 1) && m.sprint, 'pushed to the edge (and past it) sprints');
m = stickMove(STICK.radius * 2, 0); ok(near(m.x, 1) && !m.sprint, 'right, at the edge: no sprint sideways');
m = stickMove(0, STICK.radius); ok(near(m.z, -1) && !m.sprint, 'back: no sprint');
const special = new Set(['fire', 'menu', 'swap', 'aim']);
for (const [id, , action] of TOUCH_BUTTONS) ok(special.has(action) || DEFAULT_BINDINGS[action], 'button ' + id + ' is a real action: ' + action);
const ids = TOUCH_BUTTONS.map((b) => b[0]); ok(new Set(ids).size === ids.length, 'button ids unique');
for (const a of ['fire', 'jump', 'crouch', 'interact', 'reload', 'menu']) ok(TOUCH_BUTTONS.some((b) => b[2] === a), 'has ' + a);
const inp = readFileSync(new URL('../src/game/core/input.js', import.meta.url), 'utf8');
ok(/this\.touchMove \? this\.touchMove\.x/.test(inp) && /this\.touchMove && this\.touchMove\.sprint/.test(inp), 'the stick reaches the input frame');
const main = readFileSync(new URL('../src/game/main.js', import.meta.url), 'utf8');
ok(/isTouchDevice\(\) && !TEST/.test(main) && /touch\.tick\(\)/.test(main), 'wired in main');
// (M6.36) the settings: look speed, button size, aim assist
const tsrc = readFileSync(new URL('../src/game/core/touch.js', import.meta.url), 'utf8');
ok(/input\.settings\.touchLook/.test(tsrc) && /input\.lookFriction/.test(tsrc) && /touchSize/.test(tsrc), 'touch reads its settings');
ok(/input\.lookFriction = fr/.test(main) && /settings\.touchAssist !== false/.test(main), 'aim assist set each frame');
const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
for (const id of ['set-tlook', 'set-tsize', 'set-tassist']) ok(html.includes('id="' + id + '"') && main.includes("$('" + id + "')"), 'setting ' + id);
console.log(bad ? `${bad} of ${n} FAILED` : `ALL ${n} PASSED`);
if (bad) process.exit(1);
