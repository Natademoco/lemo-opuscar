// Hidden History Toon — demo film "Ice in August". 1080×1920, 30 fps, ~28 s.
// Sets: frozen lake (x −100), the icehouse (origin) with the street behind it, the cut-away icehouse (x +100), a kitchen insert (x +200).
// ?shot=frame renders the style frame (the August interior, door open) at any t.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { makePost } from './post.js';
import { mulberry, lerp, clamp, seg, eo, ss } from '/core/lib.js';
import { W, H, planks, sawdust, ice, plaster, mat, godRay, dust, fall, signTex, bubbles, caption } from './world.js';
import { makeCard } from './cast.js';

const QS = new URLSearchParams(location.search);
const TL = await (await fetch('timeline.json')).json();
await document.fonts.load('900 66px Montserrat'); await document.fonts.load('800 34px Montserrat');

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const mixC = document.getElementById('mix'), gm = mixC.getContext('2d'), ov = document.getElementById('ov'), g2 = ov.getContext('2d');

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#3b2a1e', .035);
const camera = new THREE.PerspectiveCamera(44, W / H, .1, 400);
const post = makePost(renderer, scene, camera, W, H, { ssaa: 2 });
post.bloom.strength = .35; post.bloom.threshold = .95; post.bloom.radius = .55;
const GU = post.grade.material.uniforms;

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function adder(parent) {
  return (geo, m, x, y, z, o = {}) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = o.cast ?? true; me.receiveShadow = true; if (o.ry) me.rotation.y = o.ry; parent.add(me); return me; };
}
const group = () => { const g = new THREE.Group(); scene.add(g); return g; };
const R = mulberry(9);
const mound = (p, x, y, z, sx, sy, sz, m) => { const me = adder(p)(new THREE.SphereGeometry(1, 20, 12), m, x, y, z); me.scale.set(sx, sy, sz); return me; };

// ————————————————— the icehouse (origin): 6 m wide, 8 m deep, door in the back wall —————————————————
const SHED = group(), add = adder(SHED);
const WALL = mat(planks('#6e4a2e', { n: 7, seed: 11, rep: [3, 1] })), WALL2 = mat(planks('#5d3d25', { n: 7, seed: 12, rep: [4, 1] }));
const FLOOR = mat(sawdust('#b98a52', { rep: [5, 6] })), SAW = mat(sawdust('#c79a5e', { seed: 5, rep: [1.5, 1] }));
const BEAM = mat(planks('#4a3020', { n: 2, seed: 13 }));
const ICE = mat(ice(), { rough: .4, col: '#eefaff', emissive: '#7cc4dc', ei: .32 });   // pale inner glow stands in for translucency
const iceGeo = new RoundedBoxGeometry(.72, .5, .72, 3, .06);
add(new THREE.PlaneGeometry(8, 10).rotateX(-Math.PI / 2), FLOOR, 0, 0, -3, { cast: false });
add(box(.3, 4.2, 10), WALL, -3.15, 2.1, -3); add(box(.3, 4.2, 10), WALL, 3.15, 2.1, -3);
const DX0 = .7, DX1 = 2.3, DH = 2.6;
add(box(DX0 + 3.3, 4.2, .3), WALL2, (-3.3 + DX0) / 2, 2.1, -7.15);
add(box(3.3 - DX1, 4.2, .3), WALL2, (DX1 + 3.3) / 2, 2.1, -7.15);
add(box(DX1 - DX0, 4.2 - DH, .3), WALL2, (DX0 + DX1) / 2, DH + (4.2 - DH) / 2, -7.15);
add(box(.18, DH, .36), BEAM, DX0 - .09, DH / 2, -7.1); add(box(.18, DH, .36), BEAM, DX1 + .09, DH / 2, -7.1); add(box(DX1 - DX0 + .36, .2, .36), BEAM, (DX0 + DX1) / 2, DH + .1, -7.1);
add(box(8, .3, 10), WALL2, 0, 4.25, -3);
for (let z = -6.5; z <= 1; z += 1.5) add(box(6.4, .26, .26), BEAM, 0, 3.9, z);
const doorPivot = new THREE.Group(); doorPivot.position.set(DX1, 0, -7.0); SHED.add(doorPivot);
const leaf = new THREE.Mesh(box(1.6, 2.55, .1), WALL2); leaf.position.set(-.8, 1.28, 0); leaf.castShadow = leaf.receiveShadow = true; doorPivot.add(leaf);
for (let ix = 0; ix < 3; ix++) for (let iz = 0; iz < 5; iz++) for (let iy = 0; iy < 3; iy++) {
  if (iy === 2 && R() < .35) continue;
  const b = add(iceGeo, ICE, -2.55 + ix * .84 + (R() - .5) * .05, .27 + iy * .6, -6.2 + iz * .84); b.rotation.y = (R() - .5) * .06;
}
for (let iy = 0; iy < 3; iy++) add(box(2.5, .1, 4.3), SAW, -1.7, .55 + iy * .6, -4.5);
mound(SHED, -1.7, 1.7, -4.5, 1.35, .45, 2.3, SAW);
mound(SHED, -.75, .05, -1.9, .5, .28, .55, SAW); mound(SHED, -2.4, .05, -1.6, .7, .3, .5, SAW); mound(SHED, .6, .02, -3.6, .6, .18, .8, SAW);
add(iceGeo, ICE, 1.25, .25, -3.1).rotation.y = .5;
add(new THREE.CylinderGeometry(.03, .03, 1.5, 8), BEAM, 1.15, .75, -2.0).rotation.z = .35;
add(box(.3, .38, .04), new THREE.MeshStandardMaterial({ color: '#7d7a76', roughness: .5, metalness: .3 }), 1.42, .1, -2.0).rotation.z = .35;
// a block lowered onto the stack (shot 7), the bucket pouring sawdust (shot 8)
const newBlock = add(iceGeo, ICE, -1.0, 2.2, -2.2);
const bucket = add(new THREE.CylinderGeometry(.24, .18, .36, 20, 1, true), new THREE.MeshStandardMaterial({ color: '#8c8a86', roughness: .45, metalness: .5, side: THREE.DoubleSide }), -1.5, 3.1, -2.4);
bucket.rotation.z = 2.1;
const pourN = 500, pourPos = new Float32Array(pourN * 3), pourGeo = new THREE.BufferGeometry(); pourGeo.setAttribute('position', new THREE.BufferAttribute(pourPos, 3));
const pour = new THREE.Points(pourGeo, new THREE.PointsMaterial({ color: '#d9a865', size: .035 })); pour.frustumCulled = false; SHED.add(pour);
const pourMound = mound(SHED, -1.75, 1.75, -2.45, .5, .05, .5, SAW);
function pourAt(t) {
  const r = mulberry(4), sx = -1.72, sy = 2.95, sz = -2.42;
  for (let i = 0; i < pourN; i++) { const ph = (r() + t * 1.6) % 1, y = sy - ph * ph * 1.3 - ph * .1; pourPos[i * 3] = sx + (r() - .5) * .08 * (1 + ph * 2); pourPos[i * 3 + 1] = y; pourPos[i * 3 + 2] = sz + (r() - .5) * .08 * (1 + ph * 2); }
  pourGeo.attributes.position.needsUpdate = true;
}

// ————————————————— the street behind the icehouse (August, or snow in winter) —————————————————
const STREET = group(), adds = adder(STREET);
const DIRT = sawdust('#e0ae6a', { seed: 31, rep: [12, 10] });
const GROUND = new THREE.MeshStandardMaterial({ map: DIRT, roughness: 1 });
adds(new THREE.PlaneGeometry(40, 30).rotateX(-Math.PI / 2), GROUND, 0, -.01, -20, { cast: false });
const HOUSE = [];
for (const [x, w, h, c] of [[-6.5, 5, 6, '#f0b06a'], [.8, 6, 7.2, '#e9c48a'], [7.5, 5, 5.6, '#d98f5c'], [14, 6, 6.4, '#efc27c']]) {
  const hm = new THREE.MeshStandardMaterial({ map: plaster(c, { seed: x + 50 }), roughness: .9 }); adds(box(w, h, 4), hm, x, h / 2, -18); HOUSE.push(hm);
  const roof = adds(new THREE.CylinderGeometry(.01, w * .72, 1.8, 4, 1), mat(planks('#8a3f2a', { n: 9, seed: x + 60 })), x, h + .9, -18); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, .62);
  for (let wx = -1; wx <= 1; wx++) for (let wy = 0; wy < 2; wy++) adds(box(.8, 1.1, .1), new THREE.MeshStandardMaterial({ color: '#4a2c22', roughness: .6 }), x + wx * w * .3, 2 + wy * 2.4, -15.98);
  adds(box(1.1, 2.1, .1), new THREE.MeshStandardMaterial({ color: '#6e3a24' }), x + w * .3, 1.05, -15.97);
}
STREET.traverse(m => { if (m.isMesh && m.position.z < -15) m.castShadow = false; });   // the far houses must not shade the street the door looks onto
adds(new THREE.CylinderGeometry(.01, 5.4, 1.6, 4, 1), mat(planks('#5a3a22', { n: 12, seed: 41 })), 0, 5.2, -3).rotation.y = Math.PI / 4;
const signOver = adds(new THREE.PlaneGeometry(2.2, .7), new THREE.MeshStandardMaterial({ map: signTex([['ICE HOUSE', 165, 120]], { w: 1024, h: 330 }), roughness: .8 }), (DX0 + DX1) / 2, 3.25, -7.32);
signOver.rotation.y = Math.PI;

// ————————————————— the frozen lake (x −100) —————————————————
const LAKE = group(), addl = adder(LAKE), LX = -100;
const SNOW = new THREE.MeshStandardMaterial({ color: '#f4f8fc', roughness: .95 });
const ICESHEET = new THREE.MeshStandardMaterial({ map: (() => { const t = ice({ seed: 52 }); t.repeat.set(10, 10); return t; })(), color: '#e8f4fa', roughness: .5 });
addl(box(60, .3, 40), ICESHEET, LX, -.15, -21.4, { cast: false }); addl(box(60, .3, 40), ICESHEET, LX, -.15, 19.8, { cast: false });
addl(box(26, .3, 1.2), ICESHEET, LX - 17, -.15, -.8, { cast: false }); addl(box(26, .3, 1.2), ICESHEET, LX + 17, -.15, -.8, { cast: false });
addl(new THREE.PlaneGeometry(8, 1.2).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#174a5e', roughness: .15, metalness: .1 }), LX, -.12, -.8, { cast: false });
const floaters = [];
for (let i = 0; i < 9; i++) floaters.push(addl(new RoundedBoxGeometry(.78, .34, .78, 3, .06), ICE, LX - 3.6 + i * .86, -.05, -.8));
const gridTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 512; const g = cv.getContext('2d'); g.strokeStyle = 'rgba(30,60,80,.75)'; g.lineWidth = 6; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 512); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(512, i * 64); g.stroke(); } const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
addl(new THREE.PlaneGeometry(8, 8).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), LX, .005, -5.4, { cast: false });
const PINE = new THREE.MeshStandardMaterial({ color: '#2f5d4a', roughness: .9 }), TRUNK = new THREE.MeshStandardMaterial({ color: '#4a3020' });
for (let i = 0; i < 26; i++) {
  const x = LX - 22 + i * 1.8 + (R() - .5), z = -13.5 - R() * 5, s = .8 + R() * .9;
  addl(new THREE.CylinderGeometry(.08 * s, .1 * s, .6 * s, 6), TRUNK, x, .3 * s, z);
  for (let k = 0; k < 3; k++) addl(new THREE.ConeGeometry((.9 - k * .22) * s, 1.1 * s, 8), PINE, x, (.9 + k * .6) * s, z);
  addl(new THREE.ConeGeometry(.3 * s, .35 * s, 8), SNOW, x, 2.25 * s, z);
}
for (let i = 0; i < 9; i++) mound(LAKE, LX - 20 + i * 5, 0, -12.5 + (R() - .5) * 2, 2.6, .7 + R() * .4, 1.6, SNOW);
for (let i = 0; i < 5; i++) mound(LAKE, LX - 40 + i * 20, -2, -45, 14, 8 + R() * 5, 8, new THREE.MeshStandardMaterial({ color: '#dbe7f3', roughness: 1 }));
const snowLake = fall(LAKE, { box: new THREE.Box3(V(LX - 8, 0, -12), V(LX + 8, 7, 3)), n: 500, size: 5, v: .7 });

// ————————————————— the cut-away icehouse (x +100): walls of planks | sawdust | planks, the front sliced off at z = 0 —————————————————
const SEC = group(), addc = adder(SEC), SX = 100;
addc(new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: sawdust('#d7a35f', { seed: 61, rep: [10, 10] }), roughness: 1 }), SX, 0, -10, { cast: false });
const OUTER = mat(planks('#7a5232', { n: 8, seed: 62, rep: [2, 1] }), { emissive: '#ff5a1a', ei: 0 }), INNER = mat(planks('#6a4529', { n: 8, seed: 63, rep: [2, 1] }));
const SAWC = mat(sawdust('#d2a364', { seed: 64, rep: [1, 3] }));
const L0 = 2.5, L1 = 2.62, L2 = 3.17, L3 = 3.29, D = 5, HT = 3.6;   // inner face, sawdust start, sawdust end, outer face; depth; height
for (const s of [-1, 1]) {
  addc(box(L1 - L0, HT, D + .8), INNER, SX + s * (L0 + L1) / 2, HT / 2, -(D + .8) / 2);
  addc(box(L2 - L1, HT, D + .8), SAWC, SX + s * (L1 + L2) / 2, HT / 2, -(D + .8) / 2);
  addc(box(L3 - L2, HT, D + .8), OUTER, SX + s * (L2 + L3) / 2, HT / 2, -(D + .8) / 2);
}
addc(box(2 * L1, HT, .12), INNER, SX, HT / 2, -D - .06); addc(box(2 * L2, HT, .55), SAWC, SX, HT / 2, -D - .395); addc(box(2 * L3, HT, .12), OUTER, SX, HT / 2, -D - .73);
addc(box(2 * L3, .12, D + .8), INNER, SX, HT + .06, -(D + .8) / 2); addc(box(2 * L3, .45, D + .8), SAWC, SX, HT + .345, -(D + .8) / 2); addc(box(2 * L3 + .5, .14, D + 1.1), OUTER, SX, HT + .64, -(D + .8) / 2);
for (let ix = 0; ix < 6; ix++) for (let iz = 0; iz < 6; iz++) for (let iy = 0; iy < 4; iy++) addc(iceGeo, ICE, SX - 2.12 + ix * .85, .27 + iy * .62, -.42 - iz * .8);
for (let iy = 0; iy < 4; iy++) addc(box(4.9, .1, D), SAWC, SX, .57 + iy * .62, -D / 2);
const airMat = new THREE.MeshBasicMaterial({ map: bubbles({ rep: [1, 3] }), transparent: true, opacity: 0, depthWrite: false });
addc(new THREE.PlaneGeometry(L2 - L1, HT), airMat, SX + (L1 + L2) / 2, HT / 2, .004, { cast: false });
addc(new THREE.PlaneGeometry(L2 - L1, HT), airMat, SX - (L1 + L2) / 2, HT / 2, .004, { cast: false });
const arrowShape = (() => { const s = new THREE.Shape(), pts = []; for (let i = 0; i <= 20; i++) pts.push([-i * .06, Math.sin(i / 20 * Math.PI * 3) * .05]); s.moveTo(.18, 0); s.lineTo(0, .12); s.lineTo(0, .04); for (const [x, y] of pts) s.lineTo(x, y + .035); for (const [x, y] of pts.slice().reverse()) s.lineTo(x, y - .035); s.lineTo(0, -.04); s.lineTo(0, -.12); s.closePath(); return s; })();
const ARROWS = [];
for (let i = 0; i < 7; i++) { const a = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape), new THREE.MeshBasicMaterial({ color: '#ff6a1f', transparent: true, depthWrite: false, side: THREE.DoubleSide })); a.rotation.z = Math.PI; a.position.set(SX + 6, .4 + i * .45, .08); a.scale.setScalar(1.6); a.renderOrder = 8; SEC.add(a); ARROWS.push(a); }
const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff1c4', fog: false })); sunDisc.position.set(SX + 26, 16, -30); SEC.add(sunDisc);
const frost = dust(SEC, { box: new THREE.Box3(V(SX - 2.2, .2, -1), V(SX + 2.2, 2.6, .1)), n: 140, col: '#d9f6ff', size: 5, seed: 66 });

// ————————————————— the kitchen insert (x +200): a block in a bowl turning to soup; the calendar on JUNE —————————————————
const KIT = group(), addk = adder(KIT), KX = 200;
addk(box(4, .1, 2.4), mat(planks('#8a5a34', { n: 6, seed: 71 })), KX, .9, 0);
addk(box(6, 4, .2), mat(plaster('#b9c98f', { seed: 72 })), KX, 2, -1.3);
addk(new THREE.PlaneGeometry(.9, 1.1), new THREE.MeshStandardMaterial({ map: signTex([['1806', 90, 64, '#8c2f2f'], ['JUNE', 280, 150], ['· · · · · · ·', 450, 60]], { w: 512, h: 620, bg: '#f6efe0' }), roughness: .8 }), KX - .2, 1.95, -1.18);
const bowlPts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; bowlPts.push(new THREE.Vector2(.05 + Math.sin(u * Math.PI / 2) * .42, u * .26)); }
addk(new THREE.LatheGeometry(bowlPts, 32), new THREE.MeshStandardMaterial({ color: '#e9e2d2', roughness: .35, side: THREE.DoubleSide }), KX - .2, .95, .1);
const soup = addk(new THREE.CircleGeometry(.4, 32).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#a9d4df', roughness: .1, emissive: '#3c7c90', emissiveIntensity: .2 }), KX - .2, 1.1, .1, { cast: false });
const cube = addk(new RoundedBoxGeometry(.3, .3, .3, 3, .05), ICE, KX - .2, 1.2, .1);
const steam = dust(KIT, { box: new THREE.Box3(V(KX - .5, 1.2, -.1), V(KX + .1, 1.9, .3)), n: 60, col: '#ffffff', size: 9, seed: 73 });
const kitLamp = new THREE.PointLight('#ffc27a', 0, 6, 1.5); kitLamp.position.set(KX - .8, 2.6, 1.2); kitLamp.castShadow = true; KIT.add(kitLamp);

// ————————————————— the light rig, shared; each shot sets its colour key —————————————————
const sun = new THREE.DirectionalLight('#ffd49a', 7.5); sun.castShadow = true; scene.add(sun, sun.target);
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 3;
const hemi = new THREE.HemisphereLight('#6a5a7e', '#3a2616', .6); scene.add(hemi);
const bounce = new THREE.PointLight('#ffb878', 6, 7, 1.6); bounce.position.set(.8, .6, -3.2); scene.add(bounce);
const ray = godRay(SHED, { from: V((DX0 + DX1) / 2, DH / 2, -7.2), dir: V(-4.6, -7.5, 15.8).normalize(), w0: DX1 - DX0, h0: DH, grow: 1.25, len: 9, col: '#ffcf8a', amt: .3 });
const motes = dust(SHED, { box: new THREE.Box3(V(.6, .3, -6.8), V(2.4, 2.6, -3.5)), n: 120, size: 4 });
const snowOut = fall(STREET, { box: new THREE.Box3(V(-2, 0, -14), V(5, 4, -7.4)), n: 260, size: 5, v: .5 });

const KEYS = {
  lake: { sun: '#ffe9c9', si: 3.0, sp: [18, 9, 24], hs: '#a9c4e8', hg: '#eef3fb', hi: 1.15, bg: '#bcd6f0', fog: '#dce9f7', fd: .012, warm: 0, sat: 1.05, rim: '#fff4dc', tint: '#f4f6ff', rk: .35 },
  shedW: { sun: '#d6e4ff', si: 4.6, sp: [4.2, 6.5, -17], hs: '#5a6a8c', hg: '#2e2e38', hi: 1.0, bounce: ['#b9cfff', 2.6], bg: '#e8eef6', fog: '#262a36', fd: .03, warm: -.1, sat: 1, rim: '#cfe0ff', tint: '#e8eeff', rk: .45, winter: true },
  sec: { sun: '#ffcf7a', si: 5.2, sp: [26, 16, -10], hs: '#f2c58a', hg: '#7a5a3a', hi: .8, bg: '#f2bd6c', fog: '#f0c080', fd: .008, warm: .4, sat: 1.12, rim: '#ffd08a', tint: '#fff2e0', rk: .5 },
  street: { sun: '#ffbf70', si: 5.6, sp: [7, 16, -12], hs: '#ffd9a0', hg: '#8a5a30', hi: .85, bg: '#f5c27a', fog: '#f4c48a', fd: .012, warm: .5, sat: 1.15, rim: '#ffd08a', tint: '#fff0dc', rk: .5 },
  shedA: { sun: '#ffd49a', si: 7.5, sp: [4.2, 7.5, -17], hs: '#6a5a7e', hg: '#3a2616', hi: .6, bounce: ['#ffb878', 6], bg: '#f6e2b8', fog: '#3b2a1e', fd: .035, warm: .35, sat: 1.12, rim: '#ffb466', tint: '#fff0de', rk: .55 },
  kit: { sun: '#ffd49a', si: 0, sp: [0, 10, 0], hs: '#7a5a48', hg: '#2a1a12', hi: .7, lamp: 9, bg: '#2a1a12', fog: '#2a1a12', fd: .02, warm: .4, sat: 1.1, rim: '#ffc27a', tint: '#ffe8d0', rk: .5 },
};
let KEY = KEYS.shedA;
function setKey(k, focus, span = 9) {
  KEY = KEYS[k];
  sun.color.set(KEY.sun); sun.intensity = KEY.si;
  if (k.startsWith('shed')) { sun.position.set(...KEY.sp); sun.target.position.set(-.4, 0, -1.2); }
  else { sun.position.copy(focus).add(V(...KEY.sp)); sun.target.position.copy(focus); }
  sun.target.updateMatrixWorld();
  Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 80 }); sun.shadow.camera.updateProjectionMatrix();
  hemi.color.set(KEY.hs); hemi.groundColor.set(KEY.hg); hemi.intensity = KEY.hi;
  bounce.intensity = KEY.bounce ? KEY.bounce[1] : 0; if (KEY.bounce) bounce.color.set(KEY.bounce[0]);
  kitLamp.intensity = KEY.lamp || 0;
  scene.background = new THREE.Color(KEY.bg); scene.fog.color.set(KEY.fog); scene.fog.density = KEY.fd;
  GU.amt.value = .42; GU.warm.value = KEY.warm; GU.contrast.value = .22; GU.sat.value = KEY.sat;
  // the street outside the door: snow in winter, baked dirt in August
  const w = !!KEY.winter; if ((GROUND.map === null) !== w) { GROUND.map = w ? null : DIRT; GROUND.needsUpdate = true; } GROUND.color.set(w ? '#f2f6fb' : '#ffffff');
  for (const hm of HOUSE) hm.color.set(w ? '#a8b6cc' : '#ffffff');
  // seen from inside the shed the outside is over-bright, like a sunlit doorway: glow instead of being lit from behind
  const inside = k.startsWith('shed');
  for (const m of [...HOUSE, GROUND]) { m.emissiveMap = m.map; m.emissive.set(w ? '#c9d6e8' : '#ffffff'); m.emissiveIntensity = inside ? (w ? .55 : 1.0) : 0; m.fog = !inside; m.needsUpdate = true; }
}
const SETS = { SHED, STREET, LAKE, SEC, KIT };
function show(...names) { for (const [n, g] of Object.entries(SETS)) g.visible = names.includes(n); }

// ————————————————— cast —————————————————
const HERO = { body: '#2f6e9e', straps: true, hat: 'cap', hatCol: '#6b4a2e', view: '34', dir: -1 };
const hero = makeCard(scene, { ...HERO, expr: 'smug', prop: 'tongs', arms: { l: [.55, 250], r: [-.15, 290] }, keyDir: 1 });
const RIVAL = { body: '#2a2830', collar: '#f3efe6', hat: 'tophat', view: '34', dir: -1, h: 1.7 };
const rival = makeCard(scene, { ...RIVAL, expr: 'laugh', arms: { l: [.1, 280], r: [2.4, 230] }, keyDir: 1 });
const folk = [
  makeCard(scene, { body: '#b8402f', hair: '#3a2a1e', expr: 'neutral', view: '34', dir: 1, h: 1.62 }),
  makeCard(scene, { body: '#4f7a3a', hat: 'cap', hatCol: '#3b3a40', expr: 'neutral', view: '34', dir: 1, h: 1.7 }),
  makeCard(scene, { body: '#8a5aa8', hair: '#c9772f', expr: 'neutral', view: '34', dir: -1, h: 1.55 }),
  makeCard(scene, { body: '#c48a2e', hair: '#1f1a18', expr: 'neutral', view: 'front', dir: 1, h: 1.66 }),
];
const CARDS = [hero, rival, ...folk];
const place = (c, x, y, z) => { c.mesh.visible = true; c.mesh.position.set(x, y, z); return c; };

// ————————————————— shots: one per clause, ~2 s, each opening on a move that eases out —————————————————
const WT = (s, n = 0) => TL.words.filter(w => w[1].replace(/[^\w']/g, '').toLowerCase() === s)[n][0];
const LINE = id => TL.lines.find(l => l.id === id).t;
const END = TL.dur;
const cam = (p0, p1, l0, l1, u) => { camera.position.lerpVectors(p0, p1, u); camera.lookAt(new THREE.Vector3().lerpVectors(l0, l1, u)); };
let FOCUS = V(0, 1, 0), APER = 2.2;
const talk = t => (TL.env3[Math.floor((t - LINE('l3')) * 30)] || 0) > .35;

const SHOTS = [
  { t: 0, f(t, u) {   // He sliced a frozen lake — frame 0 is the act; low-angle fast push
    show('LAKE'); setKey('lake', V(LX, 0, -2));
    const up = Math.sin(t * 9) > 0;
    place(hero, LX + .8, .03 * Math.abs(Math.sin(t * 9)), -2.3).set({ ...HERO, prop: 'saw', expr: 'neutral', arms: up ? { l: [.6, 200], r: [.6, 200] } : { l: [.75, 240], r: [.75, 240] }, keyDir: 1 });
    cam(V(LX + 2.6, .45, .9), V(LX + 1.9, .7, -.4), V(LX + .7, 1.1, -2.3), V(LX + .75, 1.15, -2.3), eo(u)); FOCUS = V(LX + .8, 1.2, -2.3); APER = 2.4;
  } },
  { t: WT('into'), f(t, u) {   // into blocks — pull-back reveal: the grid, the channel of floating blocks
    show('LAKE'); setKey('lake', V(LX, 0, -2));
    place(hero, LX + .8, 0, -2.3).set({ ...HERO, prop: 'saw', expr: 'neutral', arms: { l: [.6, 200], r: [.6, 200] }, keyDir: 1 });
    cam(V(LX + 2.2, 2.2, .6), V(LX + 4.5, 7.8, 6.5), V(LX + .3, .4, -2.2), V(LX - .2, 0, -2.8), eo(u)); FOCUS = V(LX, 0, -2.4); APER = .8;
  } },
  { t: WT('swore'), f(t, u) {   // swore he'd sell it in August — the sign; grin snaps on "August"
    show('LAKE'); setKey('lake', V(LX, 0, -2));
    place(hero, LX + .8, 0, -2.3).set({ ...HERO, prop: 'sign', expr: t < WT('august') ? 'smug' : 'grin', arms: { l: [.5, 180], r: [.5, 180] }, keyDir: 1 });
    cam(V(LX + 2.6, 1.15, .9), V(LX + 2.2, 1.25, .1), V(LX + .75, .7, -2.3), V(LX + .75, .78, -2.3), eo(u)); FOCUS = V(LX + .8, 1.6, -2.3); APER = 2.6;
  } },
  { t: LINE('l2'), blur: .2, f(t, u) {   // The whole town laughed at him — whip-pan to the shore; laughs snap on "laughed"
    show('LAKE'); setKey('lake', V(LX, 0, -8));
    const lf = t < WT('laughed') ? 'neutral' : 'laugh';
    folk.forEach((c, i) => place(c, LX - 1.0 + i * .62, 0, -8.6 - (i % 2) * .5).set({ expr: lf, arms: lf === 'laugh' ? { l: [-.4, 260], r: [2.8, 200] } : { l: [.25, 300], r: [-.25, 300] }, keyDir: 1 }));
    place(rival, LX + 1.55, 0, -8.3).set({ expr: lf, arms: { l: [.1, 280], r: [2.4, 230] }, keyDir: 1 });
    const w = eo(seg(t, LINE('l2'), LINE('l2') + .35)), a = lerp(-.9, 0, w);
    camera.position.set(LX + .3, 1.35, -3.6 + u * .35); camera.lookAt(LX + .3 + Math.sin(a) * 6, 1.25 - u * .05, -3.6 - Math.cos(a) * 6);
    FOCUS = V(LX, 1.3, -8.6); APER = 1.8;
  } },
  { t: LINE('l3'), f(t, u) {   // "Ice, in August?" — low-angle push on the rival; mouth from the voice
    show('LAKE'); setKey('lake', V(LX, 0, -8));
    place(rival, LX + 1.55, 0, -8.3).set({ expr: talk(t) ? 'talk' : 'laugh', arms: { l: [-.3, 260], r: [2.9, 210] }, keyDir: 1 });
    folk.forEach((c, i) => place(c, LX - 1.0 + i * .62, 0, -8.6 - (i % 2) * .5).set({ expr: 'laugh', arms: { l: [-.4, 260], r: [2.8, 200] } }));
    cam(V(LX + 2.6, .6, -5.4), V(LX + 2.3, .75, -6.1), V(LX + 1.6, .9, -8.3), V(LX + 1.6, 1.0, -8.3), eo(u)); FOCUS = V(LX + 1.55, 1.4, -8.3); APER = 2.8;
  } },
  { t: WT("it'll"), f(t, u) {   // It'll be soup by June! — the block melting in a bowl, the calendar on JUNE
    show('KIT'); setKey('kit', V(KX, 1, 0), 3);
    const m = ss(seg(t, WT("it'll") - .1, WT('june') + .6)); cube.scale.set(1 - m * .55, Math.max(.05, 1 - m * .9), 1 - m * .55); cube.position.y = 1.1 + .15 * cube.scale.y; cube.rotation.y = m * .4; soup.position.y = 1.06 + m * .06;
    cam(V(KX + .35, 1.85, 2.0), V(KX + .1, 1.72, 1.5), V(KX - .2, 1.45, -.5), V(KX - .2, 1.48, -.55), eo(u)); FOCUS = V(KX - .2, 1.2, .1); APER = 3.2;
  } },
  { t: LINE('l4'), f(t, u) {   // So he stacked it in a wooden shed — winter key; a block lowered onto the stack; orbit
    show('SHED', 'STREET'); setKey('shedW', V(0, 0, -3));
    const d = eo(seg(t, LINE('l4'), LINE('l4') + 1.1)); newBlock.visible = true; newBlock.position.set(-1.0, lerp(2.6, 1.98, d), -2.2);
    place(hero, -.15, 0, -1.6).set({ ...HERO, prop: null, expr: 'neutral', arms: { l: [2.2 - d * .5, 260], r: [2.2 - d * .5, 260] }, keyDir: 1 });
    const a = lerp(.75, .45, eo(u)); camera.position.set(-1 + Math.sin(a) * 4.2, lerp(1.9, 1.65, u), -2.2 + Math.cos(a) * 4.2); camera.lookAt(-.4, 1.4, -2.6);
    FOCUS = V(-.5, 1.5, -2); APER = 2;
  } },
  { t: WT('and', 1), f(t, u) {   // and buried it in sawdust — the pour; tilt down following it
    show('SHED', 'STREET'); setKey('shedW', V(0, 0, -3));
    newBlock.visible = true; newBlock.position.set(-1.0, 1.98, -2.2); bucket.visible = true; pour.visible = true; pourAt(t);
    const g = eo(seg(t, WT('buried'), WT('sawdust') + .6)); pourMound.visible = true; pourMound.scale.set(.5 + g * .15, .05 + g * .32, .5 + g * .15);
    place(hero, .3, 0, -1.3).set({ ...HERO, prop: null, expr: 'smug', arms: { l: [2.7, 230], r: [2.5, 230] }, keyDir: 1 });
    cam(V(.4, 3.0, .4), V(.6, 2.2, .2), V(-1.6, 3.0, -2.4), V(-1.6, 1.9, -2.4), eo(u)); FOCUS = V(-1.6, 2.3, -2.4); APER = 2.2;
  } },
  { t: LINE('l5'), f(t, u) {   // Wait. Sawdust? — hard stop on the mound, slow push into the silence
    show('SHED', 'STREET'); setKey('shedW', V(0, 0, -3)); hemi.intensity = 1.5; bounce.intensity = 4; bounce.position.set(-1.1, 2.6, -1.6); GU.sat.value = .85;
    newBlock.visible = true; newBlock.position.set(-1.0, 1.98, -2.2); pourMound.visible = true; pourMound.scale.set(.65, .37, .65);
    cam(V(-.9, 2.65, -.55), V(-1.05, 2.55, -.85), V(-1.7, 2.0, -2.4), V(-1.72, 2.0, -2.4), u); FOCUS = V(-1.72, 2.05, -2.4); APER = 3.2;
  } },
  { t: LINE('l6'), f(t, u) {   // You see, sawdust is packed with tiny pockets of trapped air — crane down past the roof into the cut-away
    show('SEC'); setKey('sec', V(SX, 0, -3), 10);
    const c = eo(seg(t, LINE('l6'), WT('tiny') + .2));
    cam(V(SX + 1.5, 11, 5), V(SX + 2.65, 1.8, 3.2), V(SX + .5, 3.6, -2.5), V(SX + 2.7, 1.7, 0), c); FOCUS = V(SX + 2.7, 1.7, 0); APER = c > .8 ? 2 : 1;
    airMat.opacity = ss(seg(t, WT('pockets'), WT('air') + .2));
  } },
  { t: WT('and', 2), f(t, u) {   // and trapped air barely passes heat — arrows from the sun die in the sawdust
    show('SEC'); setKey('sec', V(SX, 0, -3), 10); airMat.opacity = 1;
    ARROWS.forEach((a, i) => { const p = ((t - WT('and', 2)) * .9 + i * .23) % 1, x = lerp(SX + 6.5, SX + 2.75, p), inSaw = clamp((SX + L3 - x) / (L2 - L1 + .12)); a.visible = true; a.position.x = x; a.material.opacity = (1 - inSaw) * ss(p * 6); a.scale.setScalar(1.6 * (1 - inSaw * .6)); });
    cam(V(SX + 4.4, 1.9, 2.9), V(SX + 4.0, 1.8, 2.3), V(SX + 3.4, 1.6, 0), V(SX + 3.25, 1.6, 0), eo(u)); FOCUS = V(SX + 3.2, 1.6, .1); APER = 1.6;
  } },
  { t: LINE('l7'), f(t, u) {   // The sun cooks the walls — wide; the outer boards glow hot
    show('SEC'); setKey('sec', V(SX, 0, -3), 10); airMat.opacity = 1;
    OUTER.emissiveIntensity = .55 * ss(seg(t, WT('cooks'), WT('walls') + .2));
    ARROWS.forEach((a, i) => { const p = ((t - LINE('l7')) * .9 + i * .23) % 1; a.visible = true; a.position.x = lerp(SX + 9, SX + L3, p); a.material.opacity = ss(p * 6) * (1 - ss((p - .85) / .15)); a.scale.setScalar(1.6); });
    cam(V(SX + 7.5, 3.4, 9.5), V(SX + 6.2, 3.0, 8.2), V(SX + 2, 1.8, -2), V(SX + 1.6, 1.8, -2), eo(u)); FOCUS = V(SX + 1.5, 1.8, -1); APER = .6;
  } },
  { t: WT('but'), f(t, u) {   // but the cold stays locked inside — push into the ice, frost glinting
    show('SEC'); setKey('sec', V(SX, 0, -3), 10); airMat.opacity = 1; OUTER.emissiveIntensity = .55;
    cam(V(SX + 1.7, 1.7, 5.2), V(SX + 2.2, 1.5, 4.0), V(SX + 2.0, 1.3, -1), V(SX + 2.3, 1.25, -1), eo(u)); FOCUS = V(SX + 1.8, 1.3, -.4); APER = 1.6;
  } },
  { t: LINE('l8'), f(t, u) {   // So in August, when the whole town was melting — aerial descent; the colour key turns hot
    show('SHED', 'STREET'); setKey('street', V(1, 0, -10), 14); doorPivot.rotation.y = 0;
    folk.forEach((c, i) => place(c, [.85, 2.25, .3, 2.8][i], 0, [-10.9, -10.6, -9.5, -9.3][i]).set({ expr: 'hot', arms: { l: [.15, 300], r: [-.15, 300] }, keyDir: -1 }));
    place(rival, 1.55, 0, -8.5).set({ expr: 'hot', prop: 'fan', arms: { l: [.15, 300], r: [2.5, 200] }, keyDir: -1 });
    cam(V(1.5, 9.5, -15.2), V(1.5, 2.4, -13.6), V(1.5, 0, -9.6), V(1.5, 1.05, -8), eo(u)); FOCUS = V(1.5, 1, -10); APER = u > .6 ? 1.2 : .3;
  } },
  { t: WT('he', 2), f(t, u) {   // he opened the door — inside, the door swings and the August light floods in
    show('SHED', 'STREET'); setKey('shedA', V(0, 0, -3));
    const o = eo(seg(t, WT('opened'), WT('opened') + .55)); doorPivot.rotation.y = o * 1.3; ray.material.uniforms.amt.value = .3 * o; motes.visible = o > .3;
    place(hero, -.2, 0, -1.1).set({ ...HERO, expr: 'smug', prop: 'tongs', arms: { l: [.55, 250], r: [-.15, 290] }, keyDir: 1 });
    place(rival, 1.35, 0, -8.1).set({ expr: 'hot', prop: 'fan', arms: { l: [.15, 300], r: [2.5, 200] }, keyDir: 1 });
    cam(V(-1.25, 1.3, 2.6), V(-1.0, 1.22, 2.1), V(.75, 1.2, -4.2), V(.75, 1.2, -4.2), eo(u)); FOCUS = V(-.2, 1.3, -1.1); APER = 2.2;
  } },
  { t: WT('and', 3), f(t, u) {   // and the first in line was the man who laughed when — the queue; sheepish snaps on "laughed"; cut mid-sentence (the loop)
    show('SHED', 'STREET'); setKey('street', V(1, 0, -9), 10); doorPivot.rotation.y = 1.3;
    place(hero, 1.5, 0, -6.55).set({ ...HERO, view: 'front', expr: 'smug', prop: 'block', arms: { l: [2.0, 200], r: [2.0, 200] }, keyDir: -1 });
    place(rival, 1.55, 0, -8.15).set({ expr: t < WT('laughed') ? 'hot' : 'sheepish', prop: 'coins', arms: { l: [.15, 300], r: [1.9, 200] }, keyDir: -1 });
    folk.slice(0, 3).forEach((c, i) => place(c, 2.4 + i * .9, 0, -8.8 - i * .55).set({ expr: 'hot', keyDir: -1, arms: { l: [.15, 300], r: [-.15, 300] } }));
    cam(V(-1.8, 1.55, -13.0), V(-.7, 1.62, -11.7), V(1.8, 1.25, -7.8), V(1.6, 1.4, -8.2), eo(u)); FOCUS = V(1.55, 1.5, -8.15); APER = 2.4;
  } },
];
SHOTS.forEach((s, i) => s.t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t : END);
const shotAt = t => { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t) i++; return i; };

function reset() {
  CARDS.forEach(c => c.mesh.visible = false);
  newBlock.visible = bucket.visible = pour.visible = pourMound.visible = false;
  airMat.opacity = 0; OUTER.emissiveIntensity = 0; ARROWS.forEach(a => a.visible = false);
  doorPivot.rotation.y = 1.0; ray.material.uniforms.amt.value = .12; motes.visible = true; bounce.position.set(.8, .6, -3.2);
  cube.scale.set(1, 1, 1); cube.position.y = 1.2; soup.position.y = 1.06;
}
function draw(i, t) {
  reset();
  if (QS.get('shot') === 'frame') SHOTS[14].f(WT('opened') + 1.5, 1);
  else { const s = SHOTS[i]; s.f(t, clamp((t - s.t) / (s.t1 - s.t))); }
  snowOut.visible = !!KEY.winter; snowLake.update(t); snowOut.update(t); motes.update(t); frost.update(t); steam.update(t);
  floaters.forEach((b, j) => { b.position.y = -.05 + Math.sin(t * 2 + j) * .015; b.rotation.y = Math.sin(t * .7 + j) * .05; });
  for (const c of CARDS) if (c.mesh.visible) c.face(camera, KEY.tint, 1, KEY.rim, KEY.rk);
  post.dof.focus = camera.position.distanceTo(FOCUS); post.dof.aper = APER; post.dof.maxCoc = 16; post.dof.ink.far = 34; post.dof.ink.k = .0028;
  post.composer.render();
}
const XF = .1;   // 3-frame cross-dissolve centred on each cut (the whip-pan shot enters with motion blur instead)
function render(t) {
  const i = shotAt(t), s = SHOTS[i];
  gm.clearRect(0, 0, W, H); mixC.style.opacity = 0;
  if (s.blur && t < s.t + s.blur) {   // whip-pan: average sub-frames into the mix layer
    const n = 5; for (let k = 0; k < n; k++) { draw(i, Math.max(s.t, t - k / 30 / n * 2.4)); gm.globalAlpha = 1 / (k + 1); gm.drawImage(renderer.domElement, 0, 0); }
    gm.globalAlpha = 1; mixC.style.opacity = 1;
  } else if (i > 0 && t < s.t + XF / 2) {   // just after a cut: the outgoing shot fades out over the incoming one
    draw(i - 1, t); gm.drawImage(renderer.domElement, 0, 0); mixC.style.opacity = 1 - (t - (s.t - XF / 2)) / XF; draw(i, t);
  } else if (i + 1 < SHOTS.length && t > s.t1 - XF / 2 && !SHOTS[i + 1].blur) {   // just before a cut: the incoming shot fades in
    draw(i + 1, t); gm.drawImage(renderer.domElement, 0, 0); mixC.style.opacity = (t - (s.t1 - XF / 2)) / XF; draw(i, t);
  } else draw(i, t);
  // caption: the word being spoken, cut on its first syllable, cleared in pauses
  g2.clearRect(0, 0, W, H); window.__cap = null;
  if (QS.has('nocap')) return;
  if (QS.get('shot') === 'frame') { window.__cap = { text: 'sawdust.', ...caption(g2, 'sawdust.') }; return; }
  let w = null; for (const x of TL.words) { if (x[0] <= t) w = x; else break; }
  const L = w && TL.lines.find(l => w[0] >= l.t - .01 && w[0] <= l.t + l.dur);
  if (w && L && t < L.t + L.dur + .05) window.__cap = { text: w[1], ...caption(g2, w[1]) };
}
window.render = render; window.DUR = END;
window.TEXTS = () => window.__cap ? [{ id: 'cap', ...window.__cap, pass: true }] : [];
render(0);
window.READY = true;
