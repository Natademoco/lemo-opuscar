// world.js: the set kit. Painted textures made in code, god-ray shafts, dust motes, the one-word caption.
import * as THREE from 'three';
import { mulberry } from '/core/lib.js';

export const W = 1080, H = 1920;

// —— painted textures (Canvas2D → CanvasTexture). Bold, two or three tones, readable at phone size ——
function tex(w, h, draw, rep = [1, 1]) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
}
const shade = (hex, k) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return '#' + c.getHexString(); };

// Boards: n planks across the texture, grain streaks, dark seams, a knot or two. vertical = boards run up the texture
export function planks(base, { n = 6, seed = 1, rep = [1, 1], seam = .55 } = {}) {
  return tex(512, 512, (g, w, h) => {
    const r = mulberry(seed), pw = w / n;
    for (let i = 0; i < n; i++) {
      const k = .86 + r() * .26; g.fillStyle = shade(base, k); g.fillRect(i * pw, 0, pw, h);
      g.strokeStyle = shade(base, k * .8); g.lineWidth = 2;
      for (let j = 0; j < 7; j++) { const x = i * pw + 6 + r() * (pw - 12), a = r() * 6, f = 2 + r() * 3; g.beginPath(); for (let y = 0; y <= h; y += 16) g.lineTo(x + Math.sin(y / h * f * Math.PI + a) * 4, y); g.stroke(); }
      if (r() < .45) { const x = i * pw + pw * (.3 + r() * .4), y = r() * h; g.fillStyle = shade(base, k * .6); g.beginPath(); g.ellipse(x, y, 7, 11, 0, 0, 7); g.fill(); }
      g.fillStyle = shade(base, seam); g.fillRect(i * pw, 0, 4, h);
    }
  }, rep);
}
// Sawdust: warm speckle over a base, a few darker clumps
export function sawdust(base, { seed = 2, rep = [2, 2] } = {}) {
  return tex(256, 256, (g, w, h) => {
    const r = mulberry(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { g.fillStyle = shade(base, .7 + r() * .55); const s = 1 + r() * 3; g.fillRect(r() * w, r() * h, s, s * (.5 + r())); }
    for (let i = 0; i < 18; i++) { g.fillStyle = shade(base, .78); g.beginPath(); g.ellipse(r() * w, r() * h, 6 + r() * 10, 3 + r() * 5, r() * 3, 0, 7); g.fill(); }
  }, rep);
}
// Ice: pale cyan with white cracks, a frosted rim and bubbles
export function ice({ seed = 3 } = {}) {
  return tex(256, 256, (g, w, h) => {
    const r = mulberry(seed), gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f2fbfd'); gr.addColorStop(1, '#cbe9f1'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2.5;
    for (let i = 0; i < 5; i++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (r() - .5) * 70; y += (r() - .5) * 70; g.lineTo(x, y); } g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 30; i++) { g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 10; g.strokeRect(0, 0, w, h);
  });
}
// Plaster / stucco wall: mottled base with a darker band at the bottom
export function plaster(base, { seed = 4, rep = [1, 1] } = {}) {
  return tex(256, 256, (g, w, h) => {
    const r = mulberry(seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.fillStyle = shade(base, .9 + r() * .18); g.globalAlpha = .5; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 30, 6 + r() * 18, r() * 3, 0, 7); g.fill(); }
    g.globalAlpha = 1;
  }, rep);
}
export function mat(map, o = {}) { return new THREE.MeshStandardMaterial({ map, roughness: o.rough ?? .85, metalness: 0, color: o.col ?? '#ffffff', emissive: o.emissive ?? '#000000', emissiveIntensity: o.ei ?? 1, ...o.extra }); }

// —— god-ray shaft: a tapered box from an opening along the light, additive, brightest where seen face-on (≈ thickness) ——
export function godRay(scene, { from, dir, w0 = 1, h0 = 2, grow = 1.6, len = 8, col = '#ffd9a0', amt = .35 }) {
  const geo = new THREE.BoxGeometry(1, 1, 1, 1, 1, 8); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i) + .5, s = 1 + (grow - 1) * z; p.setXYZ(i, p.getX(i) * w0 * s, p.getY(i) * h0 * s, z * len); }
  geo.computeVertexNormals();
  const m = new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, amt: { value: amt }, len: { value: len } },
    vertexShader: `varying vec3 vN, vV; varying float vZ; uniform float len;
      void main(){ vZ = position.z / len; vec4 mv = modelViewMatrix * vec4(position, 1.); vV = normalize(-mv.xyz); vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vN, vV; varying float vZ; uniform vec3 col; uniform float amt;
      void main(){ float f = pow(abs(dot(vN, vV)), 2.); float a = amt * f * pow(1. - vZ, 1.6) * smoothstep(0., .08, vZ); gl_FragColor = vec4(col * a, 1.); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
  });
  const mesh = new THREE.Mesh(geo, m); mesh.position.copy(from); mesh.lookAt(from.clone().add(dir)); mesh.renderOrder = 5; scene.add(mesh);
  return mesh;
}
// —— dust motes inside a box, drifting with t; additive round points ——
export function dust(scene, { box, n = 300, col = '#ffe6bf', size = 6, seed = 7 }) {
  const r = mulberry(seed), base = new Float32Array(n * 3), pos = new Float32Array(n * 3), ph = new Float32Array(n);
  for (let i = 0; i < n; i++) { base[i * 3] = box.min.x + r() * (box.max.x - box.min.x); base[i * 3 + 1] = box.min.y + r() * (box.max.y - box.min.y); base[i * 3 + 2] = box.min.z + r() * (box.max.z - box.min.z); ph[i] = r() * 6.28; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, size: { value: size } },
    vertexShader: `uniform float size; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = max(2., size * 10. / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 col; void main(){ float d = length(gl_PointCoord - .5); gl_FragColor = vec4(col * smoothstep(.5, .1, d) * .6, 1.); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
  });
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false; pts.renderOrder = 6; scene.add(pts);
  pts.update = t => { for (let i = 0; i < n; i++) { pos[i * 3] = base[i * 3] + Math.sin(t * .4 + ph[i]) * .08; pos[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * .3 + ph[i] * 2) * .1; pos[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * .35 + ph[i]) * .08; } geo.attributes.position.needsUpdate = true; };
  return pts;
}

// —— the caption: one word, white Montserrat Black, thin black outline, soft shadow, centred at 65 % height ——
export const CAP = { size: 66, y: .65 };
export function caption(g, word) {
  if (!word) return null;
  g.save(); g.font = `900 ${CAP.size}px Montserrat`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const x = W / 2, y = H * CAP.y;
  g.lineJoin = 'round'; g.lineWidth = CAP.size * .16; g.strokeStyle = '#000';
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 6; g.shadowOffsetY = 3; g.strokeText(word, x, y);
  g.shadowColor = 'transparent'; g.fillStyle = '#fff'; g.fillText(word, x, y);
  const m = g.measureText(word); g.restore();
  return { x0: x - m.width / 2, x1: x + m.width / 2, y0: y - CAP.size * .6, y1: y + CAP.size * .6 };
}

// —— falling particles (snow, sawdust): n points in a box, falling at speed v and wrapping; normal blending, lit-looking flat colour ——
export function fall(scene, { box, n = 400, col = '#ffffff', size = 7, v = .6, sway = .15, seed = 8 }) {
  const r = mulberry(seed), base = [], pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) base.push([box.min.x + r() * (box.max.x - box.min.x), r(), box.min.z + r() * (box.max.z - box.min.z), r() * 6.28]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(col) }, size: { value: size } },
    vertexShader: `uniform float size; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = max(2., size * 10. / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 col; void main(){ if (length(gl_PointCoord - .5) > .5) discard; gl_FragColor = vec4(col, 1.); }`,
    transparent: true, depthWrite: false,   // no depth: otherwise the ink pass rings every flake and snow turns into dark specks
  });
  const pts = new THREE.Points(geo, m); pts.frustumCulled = false; scene.add(pts);
  const hgt = box.max.y - box.min.y;
  pts.update = t => { for (let i = 0; i < n; i++) { const [x, y, z, p] = base[i]; pos[i * 3] = x + Math.sin(t * .8 + p) * sway; pos[i * 3 + 1] = box.min.y + ((y * hgt - t * v) % hgt + hgt) % hgt; pos[i * 3 + 2] = z + Math.cos(t * .7 + p) * sway; } geo.attributes.position.needsUpdate = true; };
  return pts;
}
// Text painted on a board (diegetic signs: calendars, labels)
export function signTex(lines, { w = 512, h = 512, bg = '#efe2c4', ink = '#2a1e18' } = {}) {
  return tex(w, h, g => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const [txt, y, size, col] of lines) { g.fillStyle = col || ink; g.font = `900 ${size}px Montserrat`; g.fillText(txt, w / 2, y); }
    g.strokeStyle = ink; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
  });
}
// Air pockets: rings with a highlight, on transparent ground (laid over a sawdust cut face)
export function bubbles({ seed = 21, rep = [1, 1] } = {}) {
  return tex(256, 256, (g, w, h) => {
    const r = mulberry(seed);
    for (let i = 0; i < 46; i++) { const x = r() * w, y = r() * h, s = 4 + r() * 9; g.fillStyle = 'rgba(255,250,235,.95)'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); g.strokeStyle = '#2a1e18'; g.lineWidth = 2.2; g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x - s * .35, y - s * .35, s * .3, 0, 7); g.fill(); }
  }, rep);
}
