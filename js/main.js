// ── L'INVITÉE D'HONNEUR — moteur du jeu ───────────────────────────
import * as THREE from '../lib/three.module.min.js';
import {
  NOMS, MESSAGE_FINAL, INTROS_NUITS, FRAGMENTS, FRAGMENTS_PAR_NUIT, FIN_NORMALE,
} from './lore.js';

const $ = (id) => document.getElementById(id);

// ══════════════════════════════════════════ AUDIO (tout généré, zéro fichier)
let ctx = null, ambGain = null;
function initAudio() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  // ambiance : souffle grave en boucle
  const dur = 2, buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    last = last * 0.97 + (Math.random() * 2 - 1) * 0.03; // bruit brun
    d[i] = last * 3;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
  ambGain = ctx.createGain(); ambGain.gain.value = 0;
  src.connect(lp); lp.connect(ambGain); ambGain.connect(ctx.destination);
  src.start();
}
function ambiance(on) { if (ambGain) ambGain.gain.linearRampToValueAtTime(on ? 0.5 : 0, ctx.currentTime + 1); }

function bip(freq, dur = 0.07, type = 'square', vol = 0.12) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(); o.stop(ctx.currentTime + dur);
}
function sonPorte() { bip(70, 0.25, 'sawtooth', 0.3); bip(45, 0.35, 'square', 0.2); }
function sonClic() { bip(900, 0.03, 'square', 0.06); }
function sonCam() { bip(1400, 0.05, 'square', 0.05); bip(700, 0.08, 'square', 0.04); }
function sonKnock() {
  if (!ctx) return;
  [0, 0.18, 0.36].forEach((t) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = 85;
    g.gain.setValueAtTime(0.5, ctx.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.12);
    o.connect(g); g.connect(ctx.destination);
    o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.15);
  });
}
function sonPas() { bip(120, 0.1, 'sine', 0.15); setTimeout(() => bip(100, 0.1, 'sine', 0.12), 260); }
function sonScreamer() {
  if (!ctx) return;
  const t = ctx.currentTime;
  // bruit blanc saturé
  const buf = ctx.createBuffer(1, ctx.sampleRate * 1.1, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
  const n = ctx.createBufferSource(); n.buffer = buf;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.7, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
  n.connect(ng); ng.connect(ctx.destination); n.start(t);
  // cri : deux dents de scie désaccordées qui montent
  [0, 7].forEach((det) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(110 + det, t);
    o.frequency.exponentialRampToValueAtTime(880 + det * 3, t + 0.55);
    o.frequency.exponentialRampToValueAtTime(220, t + 1.0);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 1.05);
  });
}
const JINGLE_NOTES = [523, 659, 784, 1047, 784, 659, 523, 659, 784, 659, 523];
function sonJingle(lent = false) {
  if (!ctx) return;
  const pas = lent ? 0.42 : 0.16;
  JINGLE_NOTES.forEach((f, i) => {
    const t = ctx.currentTime + i * pas;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = lent ? f * 0.5 : f;
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + pas * 2);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + pas * 2.1);
  });
  return JINGLE_NOTES.length * pas;
}
function sonCloche() {
  if (!ctx) return;
  [880, 1108, 1318].forEach((f, i) => {
    const t = ctx.currentTime + i * 0.5;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.25, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 1.5);
  });
}

function sonChanson() { // boîte à musique douce — la chanson de Lys
  if (!ctx) return;
  [523, 659, 784, 659, 523, 392, 523].forEach((f, i) => {
    const t = ctx.currentTime + i * 0.3;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.6);
  });
}
function sonAnnonce() { // ding-dong + voix effacée par le temps
  if (!ctx) return;
  [[660, 0], [524, 0.45]].forEach(([f, d]) => {
    const t = ctx.currentTime + d;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.75);
  });
  const t = ctx.currentTime + 1.0;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 1.4, ctx.sampleRate);
  const dd = buf.getChannelData(0);
  for (let i = 0; i < dd.length; i++) dd[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(i / 900));
  const n = ctx.createBufferSource(); n.buffer = buf;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.16, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
  n.connect(lp); lp.connect(g); g.connect(ctx.destination); n.start(t);
}
function sonCarillon() { // arpège clair de l'aire de jeux
  if (!ctx) return;
  [784, 988, 1175, 1568, 1175, 988, 784, 988].forEach((f, i) => {
    const t = ctx.currentTime + i * 0.1;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.07, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.2);
  });
}
function sonMurmure() {
  if (!ctx) return;
  const t = ctx.currentTime;
  const buf = ctx.createBuffer(1, ctx.sampleRate * 1.1, ctx.sampleRate);
  const dd = buf.getChannelData(0);
  for (let i = 0; i < dd.length; i++) dd[i] = (Math.random() * 2 - 1) * (0.4 + 0.6 * Math.sin(i / 400));
  const n = ctx.createBufferSource(); n.buffer = buf;
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 2;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.35, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 1.05);
  n.connect(bp); bp.connect(g); g.connect(ctx.destination); n.start(t);
}

// sons d'ambiance enregistrés (assets/sons/amb1..7.m4a)
const SONS_AMBIANCE = [];
for (let i = 1; i <= 7; i++) {
  const a = new Audio(`assets/sons/amb${i}.m4a`);
  a.preload = 'auto'; a.volume = 0.45;
  SONS_AMBIANCE.push(a);
}
function sonAmbianceAleatoire() {
  const a = SONS_AMBIANCE[Math.floor(Math.random() * SONS_AMBIANCE.length)];
  a.currentTime = 0;
  a.play().catch(() => {});
}

// ══════════════════════════════════════════ TEXTURES PROCÉDURALES
function texCanvas(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const texDamier = texCanvas(256, 256, (g) => {
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    g.fillStyle = (x + y) % 2 ? '#2a2a2e' : '#3d3d42';
    g.fillRect(x * 32, y * 32, 32, 32);
  }
});
texDamier.wrapS = texDamier.wrapT = THREE.RepeatWrapping;
const texBanniere = texCanvas(1024, 128, (g) => {
  g.fillStyle = '#5a1a1a'; g.fillRect(0, 0, 1024, 128);
  g.fillStyle = '#e8d9a0'; g.font = 'bold 72px Courier New'; g.textAlign = 'center';
  g.fillText('JOYEUX ANNIVERSAIRE', 512, 88);
});
const texEnseigne = texCanvas(512, 256, (g) => {
  g.fillStyle = '#101018'; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#e8b23a'; g.font = 'bold 96px Courier New'; g.textAlign = 'center';
  g.fillText('CHEZ', 256, 100);
  g.fillStyle = '#ffffff'; g.fillText('LYS', 256, 205);
});
const texDessin = texCanvas(256, 320, (g) => {
  g.fillStyle = '#e8e0cc'; g.fillRect(0, 0, 256, 320);
  g.strokeStyle = '#c46a2a'; g.lineWidth = 5;
  g.beginPath(); g.arc(90, 120, 30, 0, 7); g.stroke();        // tête lapine
  g.beginPath(); g.moveTo(75, 95); g.lineTo(70, 50); g.stroke(); // oreilles
  g.beginPath(); g.moveTo(105, 95); g.lineTo(110, 50); g.stroke();
  g.beginPath(); g.moveTo(90, 150); g.lineTo(90, 230); g.stroke();
  g.strokeStyle = '#3a5a8a';
  g.beginPath(); g.arc(180, 130, 24, 0, 7); g.stroke();       // petite silhouette
  g.beginPath(); g.moveTo(180, 154); g.lineTo(180, 225); g.stroke();
  g.beginPath(); g.moveTo(90, 190); g.lineTo(180, 190); g.stroke(); // mains
  g.fillStyle = '#444'; g.font = '26px Courier New'; g.textAlign = 'center';
  g.fillText('moi et papa', 128, 280);
  g.font = 'bold 30px Courier New'; g.fillText('M.', 210, 305);
});

const texMurSale = texCanvas(256, 256, (g) => {
  g.fillStyle = '#4a4440'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(${20 + Math.random() * 30 | 0},${18 + Math.random() * 25 | 0},${16 + Math.random() * 22 | 0},${(0.06 + Math.random() * 0.12).toFixed(2)})`;
    g.fillRect(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 60, 6 + Math.random() * 40);
  }
  g.fillStyle = 'rgba(30,26,22,0.25)';
  for (let i = 0; i < 14; i++) {
    g.fillRect(Math.random() * 256, 0, 2 + Math.random() * 3, 80 + Math.random() * 176);
  }
});
texMurSale.wrapS = texMurSale.wrapT = THREE.RepeatWrapping;
const texMenu = texCanvas(512, 128, (g) => {
  g.fillStyle = '#141418'; g.fillRect(0, 0, 512, 128);
  g.fillStyle = '#c8b878'; g.font = 'bold 28px Courier New'; g.textAlign = 'left';
  g.fillText('MENU LYS ........ 5€90', 30, 42);
  g.fillText('MENU ENFANT ..... 3€50', 30, 80);
  g.fillStyle = '#8a7a4a'; g.font = '20px Courier New';
  g.fillText('+ jouet surprise', 300, 112);
});

// ══════════════════════════════════════════ THREE — BASE
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const sceneBureau = new THREE.Scene();
sceneBureau.background = new THREE.Color(0x04040a);
sceneBureau.fog = new THREE.Fog(0x000000, 6, 16);
const sceneResto = new THREE.Scene();
sceneResto.background = new THREE.Color(0x020503);
sceneResto.fog = new THREE.Fog(0x000000, 8, 26);

const camBureau = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 50);
camBureau.position.set(0, 1.55, 2.3);

addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camBureau.aspect = innerWidth / innerHeight;
  camBureau.updateProjectionMatrix();
  Object.values(salles).forEach((s) => {
    s.cam.aspect = innerWidth / innerHeight; s.cam.updateProjectionMatrix();
  });
});

const MAT = {
  mur: new THREE.MeshStandardMaterial({ map: texMurSale, roughness: 0.95 }),
  murBureau: new THREE.MeshStandardMaterial({ color: 0x3a3a44, roughness: 0.9 }),
  sol: new THREE.MeshStandardMaterial({ map: texDamier, roughness: 0.9 }),
  solGris: new THREE.MeshStandardMaterial({ color: 0x2c2c30, roughness: 0.95 }),
  metal: new THREE.MeshStandardMaterial({ color: 0x777788, roughness: 0.4, metalness: 0.6 }),
  bois: new THREE.MeshStandardMaterial({ color: 0x5a4630, roughness: 0.85 }),
  rouge: new THREE.MeshStandardMaterial({ color: 0x8a2a2a, roughness: 0.8 }),
};
const boite = (w, h, d, mat, x, y, z) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
};

// ══════════════════════════════════════════ LE BUREAU DU GÉRANT
let porteMeshG, porteMeshD, lumSpotG, lumSpotD, ventilo;
{
  const s = sceneBureau;
  // sol / plafond
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), MAT.solGris);
  sol.rotation.x = -Math.PI / 2; s.add(sol);
  const plafond = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), MAT.murBureau);
  plafond.rotation.x = Math.PI / 2; plafond.position.y = 3.2; s.add(plafond);
  // mur du fond + mur arrière
  s.add(boite(10, 3.2, 0.2, MAT.murBureau, 0, 1.6, -4));
  s.add(boite(10, 3.2, 0.2, MAT.murBureau, 0, 1.6, 4));
  // murs latéraux avec ouverture de porte (z de -0.3 à 1.3, hauteur 2.6)
  for (const cote of [-1, 1]) {
    const x = 5 * cote;
    s.add(boite(0.2, 3.2, 3.7, MAT.murBureau, x, 1.6, -2.15)); // segment avant
    s.add(boite(0.2, 3.2, 2.7, MAT.murBureau, x, 1.6, 2.65));  // segment arrière
    s.add(boite(0.2, 0.6, 1.6, MAT.murBureau, x, 2.9, 0.5));   // linteau
    // panneau de porte (coulisse du haut)
    const porte = boite(0.24, 2.6, 1.6, MAT.metal, x, 4.2, 0.5);
    s.add(porte);
    if (cote < 0) porteMeshG = porte; else porteMeshD = porte;
    // lumière de couloir
    const spot = new THREE.PointLight(0xffe8b0, 0, 5);
    spot.position.set(x * 0.86, 2.2, 0.5);
    s.add(spot);
    if (cote < 0) lumSpotG = spot; else lumSpotD = spot;
  }
  // bureau
  s.add(boite(3, 0.1, 1.3, MAT.bois, 0, 0.78, -1.4));
  s.add(boite(0.12, 0.78, 1.2, MAT.bois, -1.35, 0.39, -1.4));
  s.add(boite(0.12, 0.78, 1.2, MAT.bois, 1.35, 0.39, -1.4));
  // moniteur
  const ecran = boite(0.9, 0.6, 0.06, MAT.metal, -0.5, 1.2, -1.5);
  ecran.rotation.y = 0.3; s.add(ecran);
  const lueur = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x2a4a3a }),
  );
  lueur.position.set(-0.487, 1.2, -1.465); lueur.rotation.y = 0.3;
  s.add(lueur);
  // ventilateur
  ventilo = new THREE.Group();
  const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.3), MAT.metal);
  ventilo.add(pied);
  for (let i = 0; i < 3; i++) {
    const pale = boite(0.05, 0.26, 0.02, MAT.metal, 0, 0.32, 0);
    pale.geometry.translate(0, 0.1, 0);
    pale.rotation.z = (i * Math.PI * 2) / 3;
    pale.userData.pale = true;
    ventilo.add(pale);
  }
  ventilo.position.set(0.9, 0.95, -1.5);
  s.add(ventilo);
  // affiches
  const enseigne = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.8),
    new THREE.MeshStandardMaterial({ map: texEnseigne }),
  );
  enseigne.position.set(0, 2.1, -3.88); s.add(enseigne);
  const dessin = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.62),
    new THREE.MeshStandardMaterial({ map: texDessin }),
  );
  dessin.position.set(2, 1.7, -3.88); dessin.rotation.z = -0.06; s.add(dessin);
  // éclairage
  s.add(new THREE.AmbientLight(0x30303a, 0.7));
  const lampe = new THREE.PointLight(0xffd9a0, 8, 8);
  lampe.position.set(0.4, 1.5, -1.2);
  s.add(lampe);
  sceneBureau.userData.lampe = lampe;
}

// ══════════════════════════════════════════ LE RESTAURANT (7 salles)
const salles = {};
function faireSalle(cle, nom, ox, props) {
  const g = new THREE.Group();
  g.position.set(ox, 0, 0);
  const W = 10, D = 10, H = 3.4;
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(W, D),
    cle === 'salle' || cle === 'comptoir' ? MAT.sol : MAT.solGris);
  sol.rotation.x = -Math.PI / 2; g.add(sol);
  const plafond = new THREE.Mesh(new THREE.PlaneGeometry(W, D), MAT.mur);
  plafond.rotation.x = Math.PI / 2; plafond.position.y = H; g.add(plafond);
  g.add(boite(W, H, 0.2, MAT.mur, 0, H / 2, -D / 2));
  g.add(boite(W, H, 0.2, MAT.mur, 0, H / 2, D / 2));
  g.add(boite(0.2, H, D, MAT.mur, -W / 2, H / 2, 0));
  g.add(boite(0.2, H, D, MAT.mur, W / 2, H / 2, 0));
  const lum = new THREE.PointLight(0x9fb8a0, 4, 14);
  lum.position.set(0, H - 0.5, 0);
  g.add(lum);
  g.add(new THREE.AmbientLight(0x222826, 0.6));
  props(g);
  sceneResto.add(g);
  const cam = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 40);
  cam.position.set(ox + W / 2 - 0.8, H - 0.5, D / 2 - 0.8);
  cam.lookAt(ox, 1, 0);
  salles[cle] = { cle, nom, cam, ancre: new THREE.Vector3(ox, 0, 0), lum };
}

faireSalle('salle', 'CAM 1 — SALLE', 0, (g) => {
  for (const [tx, tz] of [[-2.5, -2], [2.5, -2], [-2.5, 2.2], [2.5, 2.2], [0, 0]]) {
    const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.72), MAT.metal);
    pied.position.set(tx, 0.36, tz); g.add(pied);
    const plateau = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.05), MAT.rouge);
    plateau.position.set(tx, 0.75, tz); g.add(plateau);
    // chaises renversées sur les tables
    const chaise = boite(0.4, 0.5, 0.4, MAT.bois, tx + 0.3, 1.05, tz);
    chaise.rotation.z = Math.PI; g.add(chaise);
  }
  const ens = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2),
    new THREE.MeshStandardMaterial({ map: texEnseigne }));
  ens.position.set(0, 2.2, -4.88); g.add(ens);
  // poubelle renversée, cartons, cône de sol mouillé
  const poubelle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.8), MAT.metal);
  poubelle.position.set(3.8, 0.3, 3.6); poubelle.rotation.z = Math.PI / 2.2; g.add(poubelle);
  g.add(boite(0.7, 0.5, 0.6, MAT.bois, -4, 0.25, 3.8));
  g.add(boite(0.5, 0.4, 0.5, MAT.bois, -3.4, 0.2, 4.1));
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, 10),
    new THREE.MeshStandardMaterial({ color: 0xb0a03a }));
  cone.position.set(2, 0.28, -3); g.add(cone);
});
faireSalle('comptoir', 'CAM 2 — COMPTOIR', 30, (g) => {
  g.add(boite(6, 1.1, 1, MAT.rouge, 0, 0.55, -1));
  g.add(boite(6, 0.08, 1.2, MAT.metal, 0, 1.14, -1));
  const menu = new THREE.Mesh(new THREE.PlaneGeometry(4, 1),
    new THREE.MeshStandardMaterial({ map: texMenu }));
  menu.position.set(0, 2.4, -4.88); g.add(menu);
  for (let i = 0; i < 3; i++) g.add(boite(0.45, 0.03, 0.32, MAT.rouge, -1.5 + i, 1.2, -1)); // plateaux
  g.add(boite(0.5, 0.45, 0.4, MAT.metal, -2, 1.4, -1)); // caisse
});
faireSalle('cuisine', 'CAM 3 — CUISINE', 60, (g) => {
  g.add(boite(7, 0.9, 1.2, MAT.metal, 0, 0.45, -3.5));
  g.add(boite(1.4, 1.3, 1.2, MAT.metal, -3, 0.65, 0));   // friteuse
  g.add(boite(1.4, 1.3, 1.2, MAT.metal, -1.2, 0.65, 0)); // friteuse
  g.add(boite(2.4, 2.2, 0.8, MAT.metal, 3, 1.1, -1));    // frigo
  for (let i = 0; i < 4; i++) {
    const casserole = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14), MAT.metal);
    casserole.position.set(-2 + i * 0.7, 2.4, 2); g.add(casserole);
  }
});
faireSalle('aire', 'CAM 4 — AIRE DE JEUX', 90, (g) => {
  // piscine à balles crevée
  g.add(boite(4, 0.5, 3, MAT.rouge, -2, 0.25, 1.5));
  const couleurs = [0x3a6ab0, 0xb0a03a, 0xb03a3a, 0x3ab06a];
  for (let i = 0; i < 26; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.13),
      new THREE.MeshStandardMaterial({ color: couleurs[i % 4], roughness: 0.6 }));
    b.position.set(-3.5 + Math.random() * 3.4, 0.56, 0.3 + Math.random() * 2.3);
    g.add(b);
  }
  // tubes
  const tubeMat = new THREE.MeshStandardMaterial({ color: 0x3a6a5a, roughness: 0.7 });
  const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 4, 12), tubeMat);
  t1.rotation.z = Math.PI / 2; t1.position.set(1.5, 2.2, -2); g.add(t1);
  const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 3, 12), tubeMat);
  t2.position.set(3.4, 1.5, -2); g.add(t2);
  const glissiere = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.4, 12), MAT.rouge);
  glissiere.rotation.z = 1.1; glissiere.position.set(1.2, 0.9, 2.6); g.add(glissiere);
});
faireSalle('anniv', 'CAM 5 — ANNIVERSAIRES', 120, (g) => {
  g.add(boite(4.6, 0.08, 1.4, MAT.bois, 0, 0.74, 0));
  g.add(boite(0.1, 0.74, 1.3, MAT.bois, -2.2, 0.37, 0));
  g.add(boite(0.1, 0.74, 1.3, MAT.bois, 2.2, 0.37, 0));
  // gâteau
  const gato1 = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.25),
    new THREE.MeshStandardMaterial({ color: 0xd8c8e8 }));
  gato1.position.set(0, 0.9, 0); g.add(gato1);
  const gato2 = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2),
    new THREE.MeshStandardMaterial({ color: 0xe8d8f0 }));
  gato2.position.set(0, 1.12, 0); g.add(gato2);
  for (let i = 0; i < 8; i++) {
    const bougie = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1),
      new THREE.MeshStandardMaterial({ color: 0xe8e0a0 }));
    const a = (i / 8) * Math.PI * 2;
    bougie.position.set(Math.cos(a) * 0.18, 1.27, Math.sin(a) * 0.18);
    g.add(bougie);
  }
  // cadeaux
  for (const [x, z, c] of [[-1.4, 0.3, 0x8a2a2a], [-1.0, -0.3, 0x2a5a8a], [1.3, 0.2, 0x8a7a2a]]) {
    g.add(boite(0.4, 0.32, 0.4, new THREE.MeshStandardMaterial({ color: c }), x, 0.94, z));
  }
  // ballons
  for (const [x, z, c] of [[-3, 2, 0xb04a4a], [3, 2.4, 0x4a6ab0], [-2.6, -2.6, 0xb0a04a]]) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.22),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }));
    b.position.set(x, 2.4, z); b.scale.y = 1.15; g.add(b);
  }
  const ban = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.75),
    new THREE.MeshStandardMaterial({ map: texBanniere }));
  ban.position.set(0, 2.6, -4.88); g.add(ban);
  // une chaise à part, décorée : la place de l'invitée
  g.add(boite(0.42, 0.9, 0.42, new THREE.MeshStandardMaterial({ color: 0x6a5a8a }), 0, 0.45, 1.3));
});
faireSalle('couloirG', 'CAM 6 — COULOIR GAUCHE', 150, (g) => {
  g.add(boite(0.2, 3.4, 10, MAT.mur, -1.6, 1.7, 0));
  g.add(boite(0.2, 3.4, 10, MAT.mur, 1.6, 1.7, 0));
  const dessin = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.75),
    new THREE.MeshStandardMaterial({ map: texDessin }));
  dessin.position.set(-1.48, 1.6, -1); dessin.rotation.y = Math.PI / 2; g.add(dessin);
});
faireSalle('couloirD', 'CAM 7 — COULOIR DROIT', 180, (g) => {
  g.add(boite(0.2, 3.4, 10, MAT.mur, -1.6, 1.7, 0));
  g.add(boite(0.2, 3.4, 10, MAT.mur, 1.6, 1.7, 0));
  g.add(boite(1.2, 0.4, 0.3, MAT.rouge, 1.4, 2.4, 0)); // panneau SORTIE
});
// caméras des couloirs : axées dans la longueur
salles.couloirG.cam.position.set(150, 2.6, 4.4); salles.couloirG.cam.lookAt(150, 1.2, -3);
salles.couloirD.cam.position.set(180, 2.6, 4.4); salles.couloirD.cam.lookAt(180, 1.2, -3);

// ══════════════════════════════════════════ LES MASCOTTES
function faireMascotte(cfg) {
  const g = new THREE.Group();
  const corps = new THREE.MeshStandardMaterial({ color: cfg.couleur, roughness: 0.85 });
  const second = new THREE.MeshStandardMaterial({ color: cfg.couleur2, roughness: 0.85 });
  // jambes
  g.add(boite(0.16, 0.5, 0.16, corps, -0.15, 0.25, 0));
  g.add(boite(0.16, 0.5, 0.16, corps, 0.15, 0.25, 0));
  // corps
  const buste = new THREE.Mesh(new THREE.CapsuleGeometry(0.33, 0.45, 6, 12), corps);
  buste.position.y = 1.0; g.add(buste);
  const ventre = new THREE.Mesh(new THREE.SphereGeometry(0.26), second);
  ventre.position.set(0, 0.95, 0.16); ventre.scale.set(1, 1.25, 0.55); g.add(ventre);
  // bras
  for (const c of [-1, 1]) {
    const bras = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.42, 4, 8), corps);
    bras.position.set(0.42 * c, 1.05, 0); bras.rotation.z = 0.25 * c; g.add(bras);
  }
  // tête
  const tete = new THREE.Group();
  tete.position.y = 1.68;
  const crane = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 16), corps);
  tete.add(crane);
  const museau = new THREE.Mesh(new THREE.SphereGeometry(0.14), second);
  museau.position.set(0, -0.06, 0.24); museau.scale.set(1.2, 0.8, 0.9); tete.add(museau);
  if (cfg.nez) {
    const nez = new THREE.Mesh(new THREE.SphereGeometry(0.07),
      new THREE.MeshStandardMaterial({ color: cfg.nez }));
    nez.position.set(0, 0.02, 0.32); tete.add(nez);
  }
  // yeux
  const yeux = [];
  for (const c of [-1, 1]) {
    const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.06),
      new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5,
      }));
    oeil.position.set(0.11 * c, 0.07, 0.26);
    tete.add(oeil); yeux.push(oeil);
    const pupille = new THREE.Mesh(new THREE.SphereGeometry(0.025),
      new THREE.MeshBasicMaterial({ color: 0x000000 }));
    pupille.position.set(0.11 * c, 0.07, 0.315); tete.add(pupille);
  }
  // oreilles
  if (cfg.oreilles === 'lapin') {
    for (const c of [-1, 1]) {
      const o = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.4, 4, 8), corps);
      o.position.set(0.14 * c, 0.5, 0);
      if (cfg.abimee && c > 0) { o.rotation.z = -1.5; o.position.set(0.24, 0.32, 0); }
      tete.add(o);
    }
  } else if (cfg.oreilles === 'souris') {
    for (const c of [-1, 1]) {
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.15), corps);
      o.position.set(0.24 * c, 0.26, 0); o.scale.z = 0.4; tete.add(o);
    }
  }
  if (cfg.toque) {
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.16),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e0 }));
    t1.position.y = 0.3; tete.add(t1);
    const t2 = new THREE.Mesh(new THREE.SphereGeometry(0.22),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e0 }));
    t2.position.y = 0.44; t2.scale.y = 0.7; tete.add(t2);
    const mous = boite(0.3, 0.05, 0.04,
      new THREE.MeshStandardMaterial({ color: 0x332a22 }), 0, -0.08, 0.29);
    tete.add(mous);
  }
  if (cfg.collerette) {
    const col = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xe8e8e0 }));
    col.position.y = 1.42; col.rotation.x = Math.PI / 2; g.add(col);
  }
  if (cfg.noeud) {
    const n = new THREE.Mesh(new THREE.SphereGeometry(0.09),
      new THREE.MeshStandardMaterial({ color: cfg.noeud }));
    n.position.set(0, 1.44, 0.22); n.scale.set(1.6, 0.8, 0.6); g.add(n);
  }
  if (cfg.abimee) {
    // rustines sombres, un œil éteint
    for (const [x, y, z] of [[0.2, 1.1, 0.26], [-0.15, 0.85, 0.28], [0.1, 1.72, 0.27]]) {
      g.add(boite(0.14, 0.12, 0.03,
        new THREE.MeshStandardMaterial({ color: 0x2a2226 }), x, y, z));
    }
    yeux[0].material = new THREE.MeshStandardMaterial({ color: 0x181818 });
  }
  g.add(tete);
  g.scale.setScalar(1.15);
  return { groupe: g, tete, yeux };
}

const CONFIG_MASCOTTES = {
  lys: {
    nom: NOMS.mascottes.lys, debut: 1,
    chemin: ['salle', 'comptoir', 'couloirG', 'PORTE_G'],
    intervalle: 8.5, agro: [0.42, 0.5, 0.55, 0.65, 0.8],
    visuel: { couleur: 0xe8e2da, couleur2: 0xf2ece4, oreilles: 'lapin', nez: 0xd08a9a, noeud: 0x4a6ab0 },
  },
  kiki: {
    nom: NOMS.mascottes.kiki, debut: 2,
    chemin: ['aire', 'salle', 'couloirD', 'PORTE_D'],
    intervalle: 6.5, agro: [0, 0.45, 0.55, 0.65, 0.8],
    visuel: { couleur: 0x8a8a92, couleur2: 0xc8b8c0, oreilles: 'souris', nez: 0x995566, noeud: 0xc05a7a },
  },
  gaston: {
    nom: NOMS.mascottes.gaston, debut: 3, camSeulement: true,
    chemin: ['cuisine', 'comptoir', 'couloirG', 'PORTE_G'],
    intervalle: 5.5, agro: [0, 0, 0.5, 0.6, 0.75],
    visuel: { couleur: 0x9a7a5a, couleur2: 0xe8e0d0, oreilles: 'aucune', toque: true },
  },
  premiere: {
    nom: NOMS.mascottes.premiere, debut: 4, gardienne: true,
    chemin: ['anniv', 'couloirD', 'PORTE_D'],
    intervalle: 4, agro: [0, 0, 0, 0.6, 0.8],
    visuel: { couleur: 0xb0989a, couleur2: 0xc0aaa8, oreilles: 'lapin', nez: 0x775560, abimee: true },
  },
};

const mascottes = {};
for (const [cle, cfg] of Object.entries(CONFIG_MASCOTTES)) {
  const m = faireMascotte(cfg.visuel);
  mascottes[cle] = {
    cle, ...cfg, ...m,
    pos: 0, minuteur: 0, minuteurPorte: 0, regard: 0, phase: Math.random() * 7,
  };
}

// ══════════════════════════════════════════ ÉTAT DU JEU
const CLE_SAUVEGARDE = 'inviteeDHonneurV1';
const DUREE_HEURE = 45;      // secondes réelles par heure de jeu
let sauvegarde = { nuit: 1, fragments: [] };
try {
  const s = JSON.parse(localStorage.getItem(CLE_SAUVEGARDE));
  if (s && s.nuit) sauvegarde = s;
} catch (e) { /* première partie */ }
function sauver() { localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(sauvegarde)); }

const etat = {
  ecran: 'menu',            // menu | jeu | mort | victoire | fin
  nuit: 1,
  temps: 0,                 // secondes écoulées dans la nuit
  energie: 100,
  porteG: false, porteD: false,
  lumG: false, lumD: false,
  camHaut: false, camActive: 'salle',
  jingleRecharge: 0,
  consoleRecharge: 0,
  morts: {},                // nb de défaites par nuit (difficulté adaptative)
  prochainSonAmb: 20,
  panne: false, panneT: 0, pannePhase: 0,
  screamer: null, screamerT: 0,
  regardCam: 0,             // pour texture regardée
  secoue: 0,
};

// ══════════════════════════════════════════ AIDES UI
function montrer(id, oui = true) { $(id).classList.toggle('hidden', !oui); }
function tousEcransCaches() {
  ['menu', 'ecran-fragments', 'nuit-intro', 'gameover', 'victoire', 'fin-normale', 'fin-secrete']
    .forEach((e) => montrer(e, false));
}
function majBoutons() {
  $('btn-porte-g').classList.toggle('actif', etat.porteG);
  $('btn-porte-d').classList.toggle('actif', etat.porteD);
  $('btn-lum-g').classList.toggle('actif', etat.lumG);
  $('btn-lum-d').classList.toggle('actif', etat.lumD);
}
function heureTexte() {
  const mins = Math.floor((etat.temps / DUREE_HEURE) * 60);
  const h = Math.floor(mins / 60), mn = mins % 60;
  return `0${h}:${String(mn).padStart(2, '0')}`;
}

// ══════════════════════════════════════════ PLACEMENT DES MASCOTTES
function placerMascotte(m) {
  const lieu = m.chemin[m.pos];
  const g = m.groupe;
  if (lieu === 'PORTE_G' || lieu === 'PORTE_D') {
    sceneBureau.add(g);
    const x = lieu === 'PORTE_G' ? -4.55 : 4.55;
    g.position.set(x, 0, 0.5);
    g.rotation.y = lieu === 'PORTE_G' ? Math.PI / 2 : -Math.PI / 2;
  } else {
    flashPlan(lieu);
    sceneResto.add(g);
    const a = salles[lieu].ancre;
    g.position.set(
      a.x + (Math.random() * 3 - 1.5),
      0,
      a.z + (Math.random() * 2.4 - 1.2),
    );
    if (lieu.startsWith('couloir')) g.position.set(a.x + (Math.random() * 1.4 - 0.7), 0, Math.random() * 2 - 1);
    g.rotation.y = Math.random() * 0.8 - 0.4;
    // face à la caméra de temps en temps, pour le malaise
    if (Math.random() < 0.45) g.lookAt(salles[lieu].cam.position.x, 0, salles[lieu].cam.position.z);
  }
}

function flashStatique(fort = false, ms = 220) {
  const el = $('statique');
  el.classList.add(fort ? 'fort' : 'cam');
  if (fort) setTimeout(() => el.classList.remove('fort'), ms);
}

// ══════════════════════════════════════════ DÉROULEMENT
function lancerNuit(n) {
  etat.nuit = n;
  etat.temps = 0; etat.energie = 100;
  etat.porteG = etat.porteD = etat.lumG = etat.lumD = false;
  etat.camHaut = false; etat.camActive = 'salle';
  etat.jingleRecharge = 0;
  etat.consoleRecharge = 0;
  etat.prochainSonAmb = 15 + Math.random() * 20;
  etat.panne = false; etat.pannePhase = 0;
  montrer('visage', false);
  etat.screamer = null;
  for (const m of Object.values(mascottes)) {
    m.pos = 0; m.minuteur = 0; m.minuteurPorte = 0; m.regard = 0;
    placerMascotte(m);
    m.groupe.visible = m.debut <= n;
  }
  lumSpotG.intensity = 0; lumSpotD.intensity = 0;
  sceneBureau.userData.lampe.intensity = 8;
  $('statique').classList.remove('cam', 'fort');
  $('teinte-cam').classList.remove('on');
  $('hud-nuit').textContent = `NUIT ${n}`;
  majBoutons();
  // carte d'intro
  tousEcransCaches();
  montrer('nuit-intro');
  $('nuit-intro').querySelector('.nuit-titre').textContent = `NUIT ${n}`;
  $('nuit-intro').querySelector('.nuit-heure').textContent = 'minuit → 06:00';
  $('nuit-intro').querySelector('.nuit-lore').textContent = INTROS_NUITS[n] || '';
  etat.ecran = 'intro';
  setTimeout(() => {
    if (etat.ecran !== 'intro') return;
    montrer('nuit-intro', false);
    montrer('hud');
    etat.ecran = 'jeu';
    ambiance(true);
  }, 4200);
}

function donnerFragment(idVoulu) {
  const restants = FRAGMENTS.filter((f) => !sauvegarde.fragments.includes(f.id));
  if (!restants.length) return null;
  let f = idVoulu ? FRAGMENTS.find((x) => x.id === idVoulu && !sauvegarde.fragments.includes(x.id)) : null;
  if (!f) f = restants[Math.floor(Math.random() * restants.length)];
  sauvegarde.fragments.push(f.id);
  sauver();
  return f;
}

function declencherScreamer(m) {
  if (etat.screamer) return;
  etat.ecran = 'screamer';
  etat.screamer = m; etat.screamerT = 0;
  etat.camHaut = false;
  $('teinte-cam').classList.remove('on');
  montrer('cam-ui', false);
  montrer('hud', false);
  sonScreamer();
  flashStatique(true, 900);
  // la mascotte surgit devant la caméra
  sceneBureau.add(m.groupe);
  m.groupe.visible = true;
}

function finirScreamer() {
  const m = etat.screamer;
  ambiance(false);
  etat.morts[etat.nuit] = (etat.morts[etat.nuit] || 0) + 1;
  etat.ecran = 'mort';
  tousEcransCaches();
  montrer('gameover');
  $('gameover').querySelector('h2').textContent = `${m.nom} T'A TROUVÉ`;
  const f = donnerFragment();
  const carte = $('frag-mort');
  if (f) {
    carte.classList.remove('hidden');
    carte.querySelector('.frag-titre').textContent = `FRAGMENT ${f.id}/12 — ${f.titre}`;
    carte.querySelector('.frag-texte').textContent = f.texte;
  } else carte.classList.add('hidden');
  etat.screamer = null;
}

function victoireNuit() {
  etat.ecran = 'victoire';
  ambiance(false);
  sonCloche();
  montrer('hud', false); montrer('cam-ui', false);
  $('teinte-cam').classList.remove('on');
  $('statique').classList.remove('cam');
  const nuitFinie = etat.nuit;
  if (nuitFinie >= 5) {
    sauvegarde.nuit = 5; sauver();
    const complet = sauvegarde.fragments.length >= FRAGMENTS.length;
    tousEcransCaches();
    if (complet) {
      montrer('fin-secrete');
      $('fin-secrete').querySelector('.fin-texte').textContent = MESSAGE_FINAL.join('\n');
      sonJingle(true);
    } else {
      montrer('fin-normale');
      $('fin-normale').querySelector('.fin-texte').textContent = FIN_NORMALE.join('\n');
    }
    etat.ecran = 'fin';
    return;
  }
  sauvegarde.nuit = Math.max(sauvegarde.nuit, nuitFinie + 1);
  const f = donnerFragment(FRAGMENTS_PAR_NUIT[nuitFinie]);
  sauver();
  tousEcransCaches();
  montrer('victoire');
  const carte = $('frag-nuit');
  if (f) {
    carte.classList.remove('hidden');
    carte.querySelector('.frag-titre').textContent = `FRAGMENT ${f.id}/12 — ${f.titre}`;
    carte.querySelector('.frag-texte').textContent = f.texte;
  } else carte.classList.add('hidden');
  $('btn-nuit-suivante').textContent = `NUIT ${nuitFinie + 1} →`;
}

// ══════════════════════════════════════════ IA DES MASCOTTES
function porteFermeePour(lieu) {
  return lieu === 'PORTE_G' ? etat.porteG : etat.porteD;
}
function ticIA(dt) {
  // difficulté adaptative : chaque défaite sur cette nuit radoucit un peu le jeu
  const morts = etat.morts[etat.nuit] || 0;
  const facteurAgro = 1 - Math.min(0.12 * morts, 0.35);
  const bonusGrace = Math.min(0.5 * morts, 1.5);

  for (const m of Object.values(mascottes)) {
    if (m.debut > etat.nuit) continue;
    const lieu = m.chemin[m.pos];
    const alaPorte = lieu.startsWith('PORTE');
    const agro = m.agro[etat.nuit - 1] * facteurAgro;

    if (alaPorte) {
      m.minuteurPorte += dt;
      if (porteFermeePour(lieu)) {
        if (m.minuteurPorte > 1.6) {
          sonKnock();
          m.pos = 0; m.minuteur = 0; m.minuteurPorte = 0;
          placerMascotte(m);
          etat.energie = Math.max(0, etat.energie - 1.5);
        }
      } else {
        const grace = Math.max(2.5, 6 - etat.nuit * 0.6) + bonusGrace;
        if (m.minuteurPorte > grace) declencherScreamer(m);
      }
      continue;
    }

    // la Première Lys : ne bouge que si on l'a trop regardée
    if (m.gardienne) {
      if (m.pos === 0) {
        if (etat.camHaut && etat.camActive === 'anniv') m.regard += dt;
        if (m.regard > 5.5) {
          m.minuteur += dt;
          if (m.minuteur > 2.5) {
            m.pos = 1; m.minuteur = 0; placerMascotte(m);
            sonPas(); if (etat.camHaut) flashStatique(true, 300);
          }
        }
        continue;
      }
      m.minuteur += dt;
      if (m.minuteur > 3.5) {
        m.pos++; m.minuteur = 0; m.minuteurPorte = 0; placerMascotte(m);
        sonPas();
      }
      continue;
    }

    // Gaston : ne bouge que quand les caméras sont levées
    if (m.camSeulement && !etat.camHaut) continue;

    m.minuteur += dt;
    if (m.minuteur >= m.intervalle) {
      m.minuteur = 0;
      const r = Math.random();
      if (r < agro) {
        m.pos = Math.min(m.pos + 1, m.chemin.length - 1);
        m.minuteurPorte = 0;
        // Gaston choisit son couloir au moment de quitter le comptoir
        if (m.cle === 'gaston' && m.pos === 2) {
          const cote = Math.random() < 0.5 ? 'G' : 'D';
          m.chemin[2] = `couloir${cote}`;
          m.chemin[3] = `PORTE_${cote}`;
        }
        placerMascotte(m);
        const nouveau = m.chemin[m.pos];
        if (nouveau.startsWith('couloir')) sonPas();
        if (etat.camHaut && (nouveau === etat.camActive || lieu === etat.camActive)) flashStatique(true, 260);
      } else if (r > 0.88 && m.pos > 0) {
        m.pos--; placerMascotte(m);
      }
    }
  }
}

function jouerJingle() {
  if (etat.jingleRecharge > 0 || etat.ecran !== 'jeu' || etat.panne) return;
  const duree = sonJingle(false);
  etat.jingleRecharge = 26;
  etat.energie = Math.max(0, etat.energie - 4);
  for (const m of Object.values(mascottes)) {
    if (m.debut > etat.nuit) continue;
    if (m.gardienne) { m.pos = 0; m.regard = Math.max(0, m.regard - 4); m.minuteur = 0; }
    else if (m.pos > 0) m.pos--;
    m.minuteurPorte = 0; m.minuteur = 0;
    placerMascotte(m);
  }
  $('btn-jingle').disabled = true;
}

// ══════════════════════════════════════════ CONSOLE DE HAUT-PARLEURS
// Le cœur du gameplay : chaque mascotte ne répond qu'au son de SON souvenir.
// Les fragments et les notes du gérant l'enseignent au joueur.
const CIBLES_SONS = {
  chanson: ['lys', 'premiere'],   // la chanson de Lys — apaise les deux lapines
  annonce: ['gaston'],            // l'annonce de fermeture — renvoie Gaston en cuisine
  carillon: ['kiki'],             // le carillon de l'aire de jeux — rappelle Kiki
};
function jouerSon(type) {
  if (etat.ecran !== 'jeu' || etat.panne || !etat.camHaut || etat.consoleRecharge > 0) return;
  ({ chanson: sonChanson, annonce: sonAnnonce, carillon: sonCarillon })[type]();
  etat.consoleRecharge = 10;
  etat.energie = Math.max(0, etat.energie - 2);
  for (const m of Object.values(mascottes)) {
    if (m.debut > etat.nuit) continue;
    if (m.chemin[m.pos] !== etat.camActive) continue;
    if (CIBLES_SONS[type].includes(m.cle)) {
      // le bon souvenir : elle retourne à sa place
      m.pos = 0; m.minuteur = 0; m.minuteurPorte = 0;
      if (m.gardienne) m.regard = 0;
      placerMascotte(m);
      flashStatique(true, 300);
    } else {
      // le mauvais son l'irrite : elle avance (mais jamais directement à la porte)
      m.pos = Math.min(m.pos + 1, m.chemin.length - 2);
      m.minuteur = 0;
      placerMascotte(m);
      sonPas();
      flashStatique(true, 300);
    }
  }
  ['son-chanson', 'son-annonce', 'son-carillon'].forEach((id) => { $(id).disabled = true; });
}
$('son-chanson').addEventListener('click', () => jouerSon('chanson'));
$('son-annonce').addEventListener('click', () => jouerSon('annonce'));
$('son-carillon').addEventListener('click', () => jouerSon('carillon'));
function majConsole() {
  const partie = salles[etat.camActive].nom.split('— ')[1] || '';
  $('con-salle').textContent = partie;
}

// ══════════════════════════════════════════ APPARITION DU VISAGE (assets/visage.jpg, optionnel)
let visageCharge = false;
{
  const img = document.querySelector('#visage img');
  fetch('assets/visage.jpg')
    .then((r) => { if (!r.ok) throw new Error('absent'); return r.blob(); })
    .then((b) => { img.src = URL.createObjectURL(b); visageCharge = true; })
    .catch(() => {});
}
function apparitionVisage() {
  if (!visageCharge || etat.ecran !== 'jeu') return;
  montrer('visage');
  flashStatique(true, 950);
  sonMurmure();
  setTimeout(() => montrer('visage', false), 950);
}

// ══════════════════════════════════════════ PANNE DE COURANT
function declencherPanne() {
  etat.panne = true; etat.panneT = 0; etat.pannePhase = 0;
  etat.porteG = etat.porteD = etat.lumG = etat.lumD = false;
  etat.camHaut = false;
  montrer('cam-ui', false);
  $('teinte-cam').classList.remove('on');
  $('statique').classList.remove('cam');
  majBoutons();
  sonPorte();
  sceneBureau.userData.lampe.intensity = 0.6;
  lumSpotG.intensity = 0; lumSpotD.intensity = 0;
}
function ticPanne(dt) {
  etat.panneT += dt;
  const lys = mascottes.lys;
  if (etat.pannePhase === 0 && etat.panneT > 3 + Math.random() * 4) {
    etat.pannePhase = 1; etat.panneT = 0;
    // Lys apparaît dans l'embrasure gauche, yeux luisants, et chante
    sceneBureau.add(lys.groupe);
    lys.groupe.visible = true;
    lys.groupe.position.set(-4.55, 0, 0.5);
    lys.groupe.rotation.y = Math.PI / 2;
    lys.yeux.forEach((o) => { if (o.material.emissive) o.material.emissiveIntensity = 2.5; });
    sonJingle(true);
  } else if (etat.pannePhase === 1 && etat.panneT > 6.5) {
    etat.pannePhase = 2; etat.panneT = 0;
    sceneBureau.userData.lampe.intensity = 0; // noir complet
  } else if (etat.pannePhase === 2 && etat.panneT > 2.2) {
    declencherScreamer(lys);
  }
}

// ══════════════════════════════════════════ BOUCLE PRINCIPALE
let regardX = 0, regardCible = 0;
addEventListener('pointermove', (e) => {
  regardCible = (e.clientX / innerWidth - 0.5) * 2; // -1 → 1
});

const horloge = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(horloge.getDelta(), 0.1);
  const t = horloge.elapsedTime;

  // animations permanentes
  ventilo.children.forEach((p) => { if (p.userData.pale) p.rotation.y += dt * 14; });
  for (const m of Object.values(mascottes)) {
    m.groupe.rotation.z = Math.sin(t * 0.8 + m.phase) * 0.02;
    m.tete.rotation.z = Math.sin(t * 0.5 + m.phase) * 0.06;
    m.tete.rotation.y = Math.sin(t * 0.3 + m.phase * 2) * 0.15;
    m.yeux.forEach((o) => {
      if (o.material.emissive && !etat.panne) {
        o.material.emissiveIntensity = 0.4 + Math.sin(t * 2 + m.phase) * 0.2;
      }
    });
  }

  if (etat.ecran === 'jeu') {
    // temps
    etat.temps += dt;
    $('hud-heure').textContent = heureTexte();
    if (etat.temps >= DUREE_HEURE * 6) { victoireNuit(); return rendre(); }

    // recharges jingle + console
    if (etat.jingleRecharge > 0) {
      etat.jingleRecharge -= dt;
      if (etat.jingleRecharge <= 0) $('btn-jingle').disabled = false;
    }
    if (etat.consoleRecharge > 0) {
      etat.consoleRecharge -= dt;
      if (etat.consoleRecharge <= 0) {
        ['son-chanson', 'son-annonce', 'son-carillon'].forEach((id) => { $(id).disabled = false; });
      }
    }

    // sons d'ambiance enregistrés, à intervalles aléatoires
    etat.prochainSonAmb -= dt;
    if (etat.prochainSonAmb <= 0) {
      sonAmbianceAleatoire();
      etat.prochainSonAmb = 25 + Math.random() * 30;
    }

    // néons des couloirs qui grésillent
    salles.couloirG.lum.intensity = Math.random() < 0.05 ? 1 + Math.random() * 5 : 4;
    salles.couloirD.lum.intensity = Math.random() < 0.05 ? 1 + Math.random() * 5 : 4;

    if (!etat.panne) {
      // énergie
      const usage = (etat.porteG ? 1 : 0) + (etat.porteD ? 1 : 0)
        + ((etat.lumG || etat.lumD) ? 1 : 0) + (etat.camHaut ? 1 : 0);
      etat.energie -= dt * (0.10 + 0.10 * usage);
      document.querySelectorAll('#hud-usage .pip').forEach((p, i) => p.classList.toggle('on', i < usage));
      if (etat.energie <= 0) { etat.energie = 0; declencherPanne(); }
      $('energie-pct').textContent = `${Math.ceil(etat.energie)}%`;
      $('energie-barre').style.width = `${etat.energie}%`;
      $('energie-barre').style.background = etat.energie < 25 ? '#c4453a' : etat.energie < 50 ? '#c4a03a' : '#7fc46a';

      ticIA(dt);

      // lumières de couloir : révèlent la mascotte à la porte
      lumSpotG.intensity = etat.lumG ? 6 : 0;
      lumSpotD.intensity = etat.lumD ? 6 : 0;
      for (const m of Object.values(mascottes)) {
        const lieu = m.chemin[m.pos];
        if (lieu === 'PORTE_G') m.groupe.visible = etat.lumG && !etat.porteG;
        else if (lieu === 'PORTE_D') m.groupe.visible = etat.lumD && !etat.porteD;
        else m.groupe.visible = m.debut <= etat.nuit;
      }
    } else {
      ticPanne(dt);
    }
  }

  if (etat.ecran === 'screamer') {
    etat.screamerT += dt;
    const m = etat.screamer;
    const p = Math.min(etat.screamerT / 0.55, 1);
    // la mascotte fonce sur la caméra
    const dir = new THREE.Vector3();
    camBureau.getWorldDirection(dir);
    const cible = camBureau.position.clone().add(dir.multiplyScalar(0.9));
    m.groupe.position.lerpVectors(
      new THREE.Vector3(m.groupe.position.x, 0, m.groupe.position.z),
      new THREE.Vector3(cible.x, -1.15, cible.z), p * 0.35,
    );
    m.groupe.lookAt(camBureau.position.x, 0.5, camBureau.position.z);
    m.tete.rotation.z = Math.sin(t * 60) * 0.22;
    etat.secoue = 0.06;
    if (etat.screamerT > 1.05) { finirScreamer(); return rendre(); }
  }

  // regard souris (bureau uniquement)
  regardX += (regardCible - regardX) * Math.min(dt * 6, 1);
  camBureau.rotation.y = -regardX * 1.05;
  camBureau.rotation.x = 0;
  if (etat.secoue > 0) {
    camBureau.rotation.y += (Math.random() - 0.5) * etat.secoue;
    camBureau.rotation.x += (Math.random() - 0.5) * etat.secoue;
    if (etat.ecran !== 'screamer') etat.secoue = Math.max(0, etat.secoue - dt * 0.2);
  }

  rendre();
});

function rendre() {
  if (etat.camHaut && etat.ecran === 'jeu') {
    renderer.render(sceneResto, salles[etat.camActive].cam);
  } else {
    renderer.render(sceneBureau, camBureau);
  }
}

// ══════════════════════════════════════════ ÉVÉNEMENTS UI
const CLES_CAMS = ['salle', 'comptoir', 'cuisine', 'aire', 'anniv', 'couloirG', 'couloirD'];
function majPlanActif() {
  document.querySelectorAll('#cam-plan [data-cam]').forEach((b) =>
    b.classList.toggle('actif', b.dataset.cam === etat.camActive));
  $('cam-nom').textContent = salles[etat.camActive].nom;
  majConsole();
}
function choisirCam(cle) {
  etat.camActive = cle;
  sonClic(); flashStatique(true, 140);
  majPlanActif();
  if (Math.random() < 0.04) apparitionVisage();
}
function basculerCam() {
  if (etat.ecran !== 'jeu' || etat.panne) return;
  etat.camHaut = !etat.camHaut;
  sonCam();
  flashStatique(true, 180);
  montrer('cam-ui', etat.camHaut);
  $('teinte-cam').classList.toggle('on', etat.camHaut);
  $('statique').classList.toggle('cam', etat.camHaut);
  majPlanActif();
  if (etat.camHaut && Math.random() < 0.05) apparitionVisage();
}
$('btn-cam').addEventListener('click', basculerCam);
document.querySelectorAll('#cam-plan [data-cam]').forEach((b) => {
  b.addEventListener('click', () => choisirCam(b.dataset.cam));
});
// une salle clignote sur le plan quand quelque chose y bouge
function flashPlan(cle) {
  const g = document.querySelector(`#cam-plan [data-cam="${cle}"]`);
  if (!g) return;
  g.classList.add('flash');
  setTimeout(() => g.classList.remove('flash'), 700);
}
$('btn-porte-g').addEventListener('click', () => {
  if (etat.ecran !== 'jeu' || etat.panne) return;
  etat.porteG = !etat.porteG; sonPorte(); majBoutons();
});
$('btn-porte-d').addEventListener('click', () => {
  if (etat.ecran !== 'jeu' || etat.panne) return;
  etat.porteD = !etat.porteD; sonPorte(); majBoutons();
});
$('btn-lum-g').addEventListener('click', () => {
  if (etat.ecran !== 'jeu' || etat.panne) return;
  etat.lumG = !etat.lumG; if (etat.lumG) etat.lumD = false;
  sonClic(); majBoutons();
});
$('btn-lum-d').addEventListener('click', () => {
  if (etat.ecran !== 'jeu' || etat.panne) return;
  etat.lumD = !etat.lumD; if (etat.lumD) etat.lumG = false;
  sonClic(); majBoutons();
});
$('btn-jingle').addEventListener('click', jouerJingle);
addEventListener('keydown', (e) => {
  if (etat.ecran !== 'jeu') return;
  const k = e.key.toLowerCase();
  if (e.code === 'Space') { e.preventDefault(); basculerCam(); return; }
  if (k >= '1' && k <= '7') {
    if (etat.camHaut) choisirCam(CLES_CAMS[+k - 1]);
    return;
  }
  switch (k) {
    case 'arrowleft':
      if (etat.camHaut) choisirCam(CLES_CAMS[(CLES_CAMS.indexOf(etat.camActive) + CLES_CAMS.length - 1) % CLES_CAMS.length]);
      else regardCible = Math.max(-1, regardCible - 0.3);
      break;
    case 'arrowright':
      if (etat.camHaut) choisirCam(CLES_CAMS[(CLES_CAMS.indexOf(etat.camActive) + 1) % CLES_CAMS.length]);
      else regardCible = Math.min(1, regardCible + 0.3);
      break;
    case 'a': $('btn-porte-g').click(); break;
    case 'p': $('btn-porte-d').click(); break;
    case 'z': $('btn-lum-g').click(); break;
    case 'm': $('btn-lum-d').click(); break;
    case 'j': jouerJingle(); break;
    default: break;
  }
});

// animation portes (chaque frame via CSS impossible → petit intervalle)
setInterval(() => {
  const cible = (ferme) => (ferme ? 1.75 : 4.2);
  for (const [mesh, ferme] of [[porteMeshG, etat.porteG], [porteMeshD, etat.porteD]]) {
    mesh.position.y += (cible(ferme) - mesh.position.y) * 0.25;
  }
}, 30);

// ── menu & écrans ──
function allerMenu() {
  tousEcransCaches();
  ambiance(false);
  etat.ecran = 'menu';
  montrer('menu');
  montrer('hud', false); montrer('cam-ui', false);
  $('teinte-cam').classList.remove('on');
  $('statique').classList.remove('cam', 'fort');
  const btn = $('btn-continuer');
  if (sauvegarde.nuit > 1) {
    btn.classList.remove('hidden');
    btn.textContent = `CONTINUER — NUIT ${Math.min(sauvegarde.nuit, 5)}`;
  } else btn.classList.add('hidden');
}
// ── cinématique d'ouverture ──
const TEXTES_CINE = [
  "CHEZ LYS a fermé ses portes il y a six ans.\nDu jour au lendemain. Personne n'a jamais vidé les lieux.",
  "La démolition est prévue lundi.\nIl ne reste qu'une formalité : cinq nuits de gardiennage.\nL'assurance l'exige.",
  "L'annonce disait :\n« Aucune tâche particulière. Rester dans le bureau.\nNe pas s'occuper des costumes. »",
  "Tu as signé sans poser de questions. Le salaire est bon.\nEt puis… qui refuserait de garder un restaurant vide ?",
  "En entrant, tu as remarqué que la salle d'anniversaire\nétait encore dressée. Gâteau. Cadeaux. Huit bougies.\n\nComme si quelqu'un allait venir.",
];
let cineEtape = 0, cineTimer = null, cineCallback = null;
function afficherEtapeCine() {
  const texte = TEXTES_CINE[cineEtape];
  const el = $('cinematique').querySelector('.cine-texte');
  el.textContent = '';
  let i = 0;
  clearInterval(cineTimer);
  cineTimer = setInterval(() => {
    el.textContent = texte.slice(0, ++i);
    if (i >= texte.length) clearInterval(cineTimer);
  }, 26);
}
function lancerCinematique(cb) {
  cineCallback = cb;
  cineEtape = 0;
  tousEcransCaches();
  montrer('cinematique');
  etat.ecran = 'cine';
  afficherEtapeCine();
}
function finirCinematique() {
  clearInterval(cineTimer);
  montrer('cinematique', false);
  const cb = cineCallback; cineCallback = null;
  if (cb) cb();
}
$('cinematique').addEventListener('click', (e) => {
  if (e.target.id === 'btn-passer') return;
  const el = $('cinematique').querySelector('.cine-texte');
  const texte = TEXTES_CINE[cineEtape];
  if (el.textContent.length < texte.length) {
    clearInterval(cineTimer);
    el.textContent = texte;                 // 1er clic : affiche tout
  } else if (++cineEtape < TEXTES_CINE.length) {
    afficherEtapeCine();                    // clic suivant : écran suivant
  } else {
    finirCinematique();
  }
});
$('btn-passer').addEventListener('click', finirCinematique);

$('btn-nouvelle').addEventListener('click', () => {
  initAudio(); sonClic();
  lancerCinematique(() => lancerNuit(1));
});
$('btn-continuer').addEventListener('click', () => {
  initAudio(); sonClic();
  lancerNuit(Math.min(sauvegarde.nuit, 5));
});
$('btn-fragments').addEventListener('click', () => {
  initAudio(); sonClic();
  const liste = $('liste-fragments');
  liste.innerHTML = '';
  for (const f of FRAGMENTS) {
    const div = document.createElement('div');
    if (sauvegarde.fragments.includes(f.id)) {
      div.className = 'frag trouve';
      div.innerHTML = `<div class="t">FRAGMENT ${f.id}/12 — ${f.titre}</div><div class="x">${f.texte}</div>`;
    } else {
      div.className = 'frag verrou';
      div.textContent = `FRAGMENT ${f.id}/12 — ???`;
    }
    liste.appendChild(div);
  }
  tousEcransCaches(); montrer('ecran-fragments');
});
$('btn-fermer-fragments').addEventListener('click', allerMenu);
$('btn-reessayer').addEventListener('click', () => { sonClic(); lancerNuit(etat.nuit); });
$('btn-nuit-suivante').addEventListener('click', () => { sonClic(); lancerNuit(etat.nuit + 1); });
for (const id of ['btn-menu-1', 'btn-menu-2', 'btn-menu-3', 'btn-menu-4']) {
  $(id).addEventListener('click', () => { sonClic(); allerMenu(); });
}

allerMenu();

// hook de debug (inspection console)
window.__jeu = { etat, mascottes, salles, lancerNuit };
