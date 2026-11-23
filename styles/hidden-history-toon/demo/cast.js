// cast.js: the flat cartoon cast, drawn in Canvas2D and mapped onto camera-facing cards (yaw only) in the 3D set.
// Face ideas (lidded eyes, parametric mouths, brows carrying the emotion) after Lemo-Opuscar styles/scifi-toon/demo/chars.js (MIT); drawn here without boil.
// Canvas units: 640 × 1280, origin top-left, feet at y = 1250. A card is 0.875 m × 1.75 m by default.
import * as THREE from 'three';

export const INK = '#2a1e18', HEAD = '#f6ebdd', HEAD_S = '#e2cdb6', CW = 640, CH = 1280;
const TAU = Math.PI * 2;

// Expression presets. eyes: 'dot' | 'lid' (half-closed, smug) | 'shut' (laughing ∩) | 'wide' (whites, tiny pupils)
// brows: [leftLift, rightLift, tilt] in canvas units / radians; mouth: { k: 'smirk'|'open'|'o'|'clench'|'line'|'grin', w, o }
export const EXPR = {
  neutral: { eyes: 'dot', brows: [0, 0, 0], mouth: { k: 'line', w: 60 } },
  smug: { eyes: 'lid', brows: [4, 22, .12], mouth: { k: 'smirk', w: 74 } },
  laugh: { eyes: 'shut', brows: [26, 26, -.15], mouth: { k: 'open', w: 120, o: 1 }, tears: true },
  shocked: { eyes: 'wide', brows: [34, 34, -.2], mouth: { k: 'o', w: 40, o: .8 } },
  furious: { eyes: 'dot', brows: [-14, -14, .5], mouth: { k: 'clench', w: 96 }, flush: .5 },
  grin: { eyes: 'dot', brows: [12, 12, 0], mouth: { k: 'grin', w: 110 } },
  talk: { eyes: 'shut', brows: [26, 26, -.15], mouth: { k: 'o', w: 70, o: 1 } },          // laughing mid-word (mouth alternates with laugh)
  hot: { eyes: 'lid', brows: [-4, -4, -.35], mouth: { k: 'o', w: 46, o: .6 }, sweat: true, flush: .3 },
  sheepish: { eyes: 'dot', brows: [22, 22, -.4], mouth: { k: 'wobble', w: 80 }, sweat: true },
  worried: { eyes: 'dot', brows: [18, 18, -.35], mouth: { k: 'line', w: 50 } },
};

function P(g) { g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = INK; }
function blob(g, fill, lw, path) { g.beginPath(); path(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.stroke(); } }
const ell = (g, x, y, rx, ry, a = 0) => () => g.ellipse(x, y, rx, ry, a, 0, TAU);
function rrect(g, x, y, w, h, r) { return () => g.roundRect(x, y, w, h, r); }
function line(g, pts, lw) { g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.lineWidth = lw; g.stroke(); }
function curve(g, a, c, b, lw) { g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(...c, ...b); g.lineWidth = lw; g.stroke(); }
const darker = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };

// o: { body, view: 'front'|'34', dir: ±1, expr, hat: 'cap'|'tophat'|null, hatCol, hair, arms: { l: [ang, len], r: [ang, len] }, prop: 'tongs'|null, scaleHead }
export function drawPerson(g, o) {
  P(g);
  const d = o.dir ?? 1, q = o.view === '34' ? 1 : 0, E = EXPR[o.expr || 'neutral'];
  const hx = 320, hy = 330, hrx = 175 * (o.scaleHead ?? 1), hry = 152 * (o.scaleHead ?? 1);
  const bx = 320, by0 = 470, by1 = 840, bw = 168;
  // legs + shoes
  for (const s of [-1, 1]) {
    const lx = bx + s * 38 + q * d * 8;
    line(g, [[lx, by1 - 20], [lx + s * 6, 1222]], 13);
    blob(g, INK, 0, ell(g, lx + s * 6 + d * 16 * (q ? 1 : s * .4), 1232, 34, 17));
  }
  // arms (behind/in front of body handled simply: drawn after the body)
  const body = o.body || '#2f6e9e';
  blob(g, body, 9, rrect(g, bx - bw / 2, by0, bw, by1 - by0, [60, 60, 46, 46]));
  // body shade: the side away from the key (key assumed camera-left unless o.keyDir)
  g.save(); g.beginPath(); g.roundRect(bx - bw / 2, by0, bw, by1 - by0, [60, 60, 46, 46]); g.clip();
  g.fillStyle = darker(body, .72); const kd = o.keyDir ?? -1; g.fillRect(kd < 0 ? bx + bw * .18 : bx - bw / 2, by0, bw * .32, by1 - by0); g.restore();
  blob(g, null, 9, rrect(g, bx - bw / 2, by0, bw, by1 - by0, [60, 60, 46, 46]));
  if (o.straps) for (const s of [-1, 1]) line(g, [[bx + s * 46, by0 + 8], [bx + s * 40, by0 + 200]], 8);
  if (o.collar) { blob(g, o.collar, 7, () => { g.moveTo(bx - 40, by0 + 4); g.lineTo(bx, by0 + 60); g.lineTo(bx + 40, by0 + 4); g.closePath(); }); }
  const arms = o.arms || { l: [.25, 300], r: [-.25, 300] }, hands = {};
  for (const [s, k] of [[-1, 'l'], [1, 'r']]) {
    const [a, L] = arms[k], sx = bx + s * (bw / 2 - 12), sy = by0 + 58;
    const ex = sx + Math.sin(a) * L * s * -1 + 0, ey = sy + Math.cos(a) * L;
    const mx = (sx + ex) / 2 + s * 18, my = (sy + ey) / 2;
    curve(g, [sx, sy], [mx, my], [ex, ey], 10);
    hands[k] = [ex, ey];
  }
  if (o.prop === 'tongs') { // ice tongs held in the right hand: two crossing iron arcs with a pivot
    const [x, y] = hands.r;
    g.strokeStyle = '#3b3633'; curve(g, [x - 10, y - 40], [x + 70, y + 60], [x + 20, y + 190], 12); curve(g, [x + 30, y - 40], [x - 50, y + 60], [x + 4, y + 190], 12);
    P(g); curve(g, [x - 10, y - 40], [x + 70, y + 60], [x + 20, y + 190], 3); blob(g, '#8a8580', 4, ell(g, x + 10, y + 50, 9, 9));
  }
  if (o.prop === 'saw') { // ice saw: a long toothed blade hanging from a T handle held in both hands
    const [x1, y1] = hands.l, [x2, y2] = hands.r, cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    blob(g, '#9a9590', 6, () => { g.moveTo(cx - 16, cy); g.lineTo(cx + 16, cy); g.lineTo(cx + 12, cy + 460); g.lineTo(cx - 12, cy + 460); g.closePath(); });
    g.lineWidth = 3; g.beginPath(); for (let y = cy + 20; y < cy + 455; y += 18) { g.moveTo(cx - 14, y); g.lineTo(cx - 24, y + 9); g.lineTo(cx - 13, y + 16); } g.stroke();
    blob(g, '#6b4a2e', 7, rrect(g, x1 - 20, cy - 14, x2 - x1 + 40, 28, 12));
  }
  if (o.prop === 'sign') { // a hand-painted board held in front of the chest with both hands
    blob(g, '#efe2c4', 8, rrect(g, 150, 480, 340, 220, 12)); g.textAlign = 'center';
    g.fillStyle = '#b8402f'; g.font = '900 62px Montserrat'; g.fillText('ICE', 320, 552);
    g.fillStyle = INK; g.font = '800 36px Montserrat'; g.fillText('FOR SALE IN', 320, 604); g.fillStyle = '#b8402f'; g.font = '900 52px Montserrat'; g.fillText('AUGUST', 320, 666); P(g);
  }
  if (o.prop === 'coins') { const [x, y] = hands.r; for (let i = 0; i < 3; i++) blob(g, '#e3b341', 5, ell(g, x + 4, y - 26 - i * 13, 24, 9)); }
  if (o.prop === 'fan') { const [x, y] = hands.r; blob(g, '#f2e6c8', 6, () => { g.moveTo(x, y); g.arc(x, y, 110, -Math.PI * .95, -Math.PI * .45); g.closePath(); }); for (let a = -.95; a <= -.45; a += .1) line(g, [[x, y], [x + Math.cos(a * Math.PI) * 108, y + Math.sin(a * Math.PI) * 108]], 3); }
  if (o.prop === 'block') { const [x1, y1] = hands.l, [x2] = hands.r; blob(g, '#d6f1f8', 8, rrect(g, x1 - 10, y1 - 110, x2 - x1 + 20, 130, 14)); line(g, [[x1 + 20, y1 - 80], [x1 + 70, y1 - 30]], 4); }
  let mouth = null;
  if (o.prop === 'bucket') { // a tin bucket held up in both hands and tipped left; its mouth is returned so the 3D pour can start there
    const [x, y] = hands.l, a = -2.0, bx0 = x - 20, by0 = y - 40; g.save(); g.translate(bx0, by0); g.rotate(a);   // tipped past horizontal: the mouth faces down-left
    blob(g, '#9aa0a6', 8, () => { g.moveTo(-70, -60); g.lineTo(70, -60); g.lineTo(52, 70); g.lineTo(-52, 70); g.closePath(); });
    blob(g, '#c99a5e', 6, ell(g, 0, -60, 70, 16)); line(g, [[-52, 20], [52, 20]], 4); g.restore();
    mouth = [bx0 + 60 * Math.sin(a), by0 - 60 * Math.cos(a)];   // the centre of the rim (0, −60) after the rotation
  }
  for (const k of ['l', 'r']) blob(g, HEAD, 7, ell(g, hands[k][0], hands[k][1], 22, 22));
  // head
  blob(g, E.flush ? '#f2b9a4' : HEAD, 0, ell(g, hx, hy, hrx, hry));
  g.save(); g.beginPath(); g.ellipse(hx, hy, hrx, hry, 0, 0, TAU); g.clip();
  // shade crescent on the side away from the key: fill the head in shade, then the lit part offset toward the key
  g.fillStyle = HEAD_S; g.fillRect(hx - hrx, hy - hry, hrx * 2, hry * 2);
  g.fillStyle = E.flush ? '#f2b9a4' : HEAD; g.beginPath(); g.ellipse(hx + kd * hrx * .16, hy - hry * .06, hrx * .96, hry, 0, 0, TAU); g.fill();
  g.restore();
  if (o.hair) { g.fillStyle = o.hair; g.beginPath(); g.ellipse(hx, hy - hry * .55, hrx * .95, hry * .55, 0, Math.PI, TAU); g.fill(); }
  blob(g, null, 9, ell(g, hx, hy, hrx, hry));
  // face
  const fx = hx + q * d * hrx * .26, fy = hy + 6, ex = 54 - q * 10;
  const eyeL = [fx - ex - q * d * 6, fy - 8], eyeR = [fx + ex - q * d * 6, fy - 8];
  for (const [i, [x, y]] of [eyeL, eyeR].entries()) {
    const s = i ? 1 : -1;
    if (E.eyes === 'dot') blob(g, INK, 0, ell(g, x, y, 11, 15));
    else if (E.eyes === 'lid') { blob(g, INK, 0, ell(g, x + d * 4, y + 4, 11, 9)); line(g, [[x - 18, y - 2], [x + 18, y - 4]], 7); }
    else if (E.eyes === 'shut') curve(g, [x - 20, y + 6], [x, y - 22], [x + 20, y + 6], 8);
    else if (E.eyes === 'wide') { blob(g, '#fff', 6, ell(g, x, y, 24, 28)); blob(g, INK, 0, ell(g, x, y, 5, 5)); }
    // brow
    const lift = E.brows[i], tl = E.brows[2] * s;
    g.save(); g.translate(x, y - 46 - lift); g.rotate(tl); line(g, [[-24, 0], [24, 0]], 11); g.restore();
  }
  if (E.tears) for (const [x, y] of [eyeL, eyeR]) blob(g, '#9fd8f2', 5, () => { g.moveTo(x + 8, y + 14); g.quadraticCurveTo(x + 26, y + 46, x + 10, y + 56); g.quadraticCurveTo(x - 4, y + 44, x + 8, y + 14); });
  // cheeks
  g.fillStyle = 'rgba(232,120,110,.35)'; for (const [x, y] of [eyeL, eyeR]) { g.beginPath(); g.ellipse(x + (x < fx ? -16 : 16), y + 44, 22, 13, 0, 0, TAU); g.fill(); }
  // mouth
  const m = E.mouth, my = fy + 70, mw = m.w;
  if (m.k === 'line') line(g, [[fx - mw / 2, my], [fx + mw / 2, my]], 8);
  if (m.k === 'smirk') curve(g, [fx - mw / 2, my + 4], [fx + 4, my + 10], [fx + mw / 2 + 6, my - 18], 8);
  if (m.k === 'grin' || m.k === 'open' || m.k === 'clench') {
    const h = m.k === 'open' ? 74 : m.k === 'grin' ? 44 : 36;
    g.save(); g.beginPath();
    if (m.k === 'clench') g.roundRect(fx - mw / 2, my - h / 2, mw, h, 10);
    else { g.moveTo(fx - mw / 2, my - 10); g.quadraticCurveTo(fx, my - 4, fx + mw / 2, my - 10); g.quadraticCurveTo(fx + mw / 2 - 4, my + h, fx, my + h); g.quadraticCurveTo(fx - mw / 2 + 4, my + h, fx - mw / 2, my - 10); g.closePath(); }
    g.fillStyle = '#5a1f22'; g.fill(); g.clip();
    g.fillStyle = '#fff'; g.fillRect(fx - mw, my - h, mw * 2, h * (m.k === 'clench' ? 1.5 : .62) + (m.k === 'grin' ? 6 : 0));
    if (m.k === 'clench') { g.lineWidth = 4; for (let i = 1; i < 5; i++) line(g, [[fx - mw / 2 + i * mw / 5, my - h], [fx - mw / 2 + i * mw / 5, my + h]], 4); line(g, [[fx - mw, my], [fx + mw, my]], 4); }
    if (m.k === 'open') { g.fillStyle = '#e46a7a'; g.beginPath(); g.ellipse(fx, my + h - 4, mw * .3, 20, 0, 0, TAU); g.fill(); }
    g.restore(); g.stroke(); g.lineWidth = 8; g.stroke();
  }
  if (m.k === 'o') blob(g, '#5a1f22', 8, ell(g, fx, my + 6, mw / 2, mw / 2 * 1.2));
  if (m.k === 'wobble') { g.beginPath(); g.moveTo(fx - mw / 2, my); for (let i = 1; i <= 8; i++) g.lineTo(fx - mw / 2 + i * mw / 8, my + (i % 2 ? -7 : 7)); g.lineWidth = 7; g.stroke(); }
  if (E.sweat) for (const [x, y, s] of [[hx + hrx * .78, hy - hry * .35, 1], [hx - hrx * .82, hy - hry * .1, .8]]) blob(g, '#9fd8f2', 5, () => { g.moveTo(x, y - 26 * s); g.quadraticCurveTo(x + 18 * s, y + 6 * s, x, y + 14 * s); g.quadraticCurveTo(x - 18 * s, y + 6 * s, x, y - 26 * s); });
  // hats
  if (o.hat === 'cap') {
    const c = o.hatCol || '#6b4a2e';
    blob(g, c, 9, () => { g.ellipse(hx + d * 6, hy - hry * .62, hrx * .98, hry * .5, d * -.06, Math.PI * 1.02, Math.PI * 1.98 + .0); g.closePath(); });
    blob(g, darker(c, .8), 9, () => { g.ellipse(hx + d * hrx * .35, hy - hry * .6, hrx * .62, 22, d * -.08, 0, TAU); });
    blob(g, c, 0, ell(g, hx, hy - hry * .64, hrx * .7, 18));
  }
  if (o.hat === 'tophat') {
    const c = o.hatCol || '#232028', w = hrx * 1.05, top = hy - hry - 210;
    blob(g, c, 9, rrect(g, hx - w / 2, top, w, 230, 10));
    blob(g, '#8c2f2f', 0, () => g.rect(hx - w / 2 + 5, top + 168, w - 10, 30));
    blob(g, c, 9, ell(g, hx, hy - hry + 22, w * .82, 24));
  }
  if (o.prop === 'blockUp') {   // a block of ice held overhead, resting on the cap; drawn last, the hands on top of it
    const [x1, y1] = hands.l, [x2] = hands.r;
    blob(g, '#d6f1f8', 8, rrect(g, x1 - 8, y1 - 150, x2 - x1 + 16, 158, 16)); line(g, [[x1 + 30, y1 - 120], [x1 + 90, y1 - 50]], 4); line(g, [[x2 - 60, y1 - 130], [x2 - 30, y1 - 100]], 4);
    for (const [hx2, hy2] of [hands.l, hands.r]) blob(g, HEAD, 7, ell(g, hx2, hy2, 22, 22));
  }
  return { hands, mouth };
}

// One card per character. Textures are cached by pose key, so changing expression is a texture swap (the expression snap).
// Grounding: the drawing's shoes sit on y = 0; a hidden twin with thickened alpha casts the shadow (stick legs alone cast almost nothing,
// so the shadow seemed to start at the body); a soft contact shadow lies on the ground just behind the feet.
const FEET = 1250, BLOB = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(.55, 'rgba(0,0,0,.6)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(cv); })();
export function makeCard(scene, o) {
  const H = o.h ?? 1.75, Wd = H * CW / CH, foot = H * (CH - FEET) / CH;
  const geo = new THREE.PlaneGeometry(Wd, H); geo.translate(0, H / 2 - foot, 0);
  const mat = new THREE.MeshBasicMaterial({ alphaTest: .5, side: THREE.DoubleSide, transparent: false });
  // rim light: a second texture (alpha = rim mask) adds the key's colour along the edges that face the key, just inside the ink line
  const U = { rimMap: { value: null }, rimCol: { value: new THREE.Color(0, 0, 0) } };
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, U);
    sh.fragmentShader = 'uniform sampler2D rimMap; uniform vec3 rimCol;\n' + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n diffuseColor.rgb += texture2D(rimMap, vMapUv).a * rimCol;');
  };
  const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = false; scene.add(mesh);
  const shMat = new THREE.MeshBasicMaterial({ alphaTest: .5, side: THREE.DoubleSide, colorWrite: false, depthWrite: false });
  const shadow = new THREE.Mesh(geo, shMat); shadow.castShadow = true; mesh.add(shadow);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(Wd * .8, Wd * .42).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: BLOB, color: '#000', transparent: true, opacity: .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  contact.position.set(0, .003, -Wd * .08); contact.renderOrder = 2; mesh.add(contact);
  const cache = new Map();
  const card = {
    mesh, contact, opts: { ...o }, anchor: null, H, Wd,
    set(p = {}) {
      Object.assign(card.opts, p);
      const key = JSON.stringify(card.opts);
      if (!cache.has(key)) {
        const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
        const info = drawPerson(cv.getContext('2d'), card.opts);
        const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
        // rim mask = drawing shifted 11 px from the key side, minus the drawing shifted 32 px: a band inside the outline facing the key
        const rm = document.createElement('canvas'); rm.width = CW; rm.height = CH; const r = rm.getContext('2d'), kd = card.opts.keyDir ?? -1;
        r.drawImage(cv, -kd * 11, 0); r.globalCompositeOperation = 'destination-out'; r.drawImage(cv, -kd * 32, 0);
        r.globalCompositeOperation = 'destination-in'; r.drawImage(cv, 0, 0);
        // shadow twin: the drawing's alpha thickened by 9 px in every direction
        const sm = document.createElement('canvas'); sm.width = CW; sm.height = CH; const sg = sm.getContext('2d');
        for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; sg.drawImage(cv, Math.cos(a) * 9, Math.sin(a) * 9); }
        cache.set(key, { tx, rt: new THREE.CanvasTexture(rm), st: new THREE.CanvasTexture(sm), mouth: info.mouth });
      }
      const c = cache.get(key);
      if (mat.map !== c.tx) { mat.map = c.tx; U.rimMap.value = c.rt; shMat.map = c.st; mat.needsUpdate = shMat.needsUpdate = true; }
      card.anchor = c.mouth;
      return card;
    },
    // yaw toward the camera; tint = how the key light colours the drawing
    face(camera, tint = '#ffffff', k = 1, rim = '#000000', rk = 1) {
      const p = mesh.position; mesh.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
      mat.color.set(tint).multiplyScalar(k); U.rimCol.value.set(rim).multiplyScalar(rk);
    },
    // a point of the drawing (canvas px) in world space, for props that leave the card (the pour)
    point(camera, cx, cy) {
      card.face(camera); mesh.updateMatrixWorld();
      return mesh.localToWorld(new THREE.Vector3((cx / CW - .5) * Wd, (FEET - cy) / CH * H, 0));
    },
  };
  return card.set();
}
