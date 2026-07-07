import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  Shield, Swords, Crosshair, HeartPulse, Sparkles, Star, Coins,
  FastForward, Skull, RotateCcw, Volume2, VolumeX, Users, Gem, Zap,
} from "lucide-react";

/* ============================================================
   1. DATOS — Roles, rarezas y la Brawler Dex completa
   ============================================================ */

const ROLES = {
  TANQUE: {
    label: "Tanque", icon: Shield, hp: 5600, atk: 235, interval: 1500, range: "melee",
    superName: "Golpe Sísmico", superDesc: "Aturde al enemigo más cercano",
  },
  DESTRUCTOR: {
    label: "Destructor", icon: Swords, hp: 3400, atk: 360, interval: 950, range: "melee",
    superName: "Furia Total", superDesc: "Daño masivo a todos los enemigos",
  },
  TIRADOR: {
    label: "Tirador", icon: Crosshair, hp: 2500, atk: 330, interval: 1200, range: "ranged",
    superName: "Disparo Letal", superDesc: "Gran daño al enemigo más débil",
  },
  APOYO: {
    label: "Apoyo", icon: HeartPulse, hp: 3100, atk: 230, interval: 1150, range: "ranged",
    superName: "Melodía Curativa", superDesc: "Cura a todo tu equipo",
  },
  CONTROLADOR: {
    label: "Controlador", icon: Sparkles, hp: 2900, atk: 270, interval: 1050, range: "ranged",
    superName: "Campo Tóxico", superDesc: "Envenena y ralentiza a los enemigos",
  },
};

const RARITIES = {
  ESPECIAL:      { label: "Especial",      color: "#56e05a", mult: 1.0 },
  SUPERESPECIAL: { label: "Superespecial", color: "#46b8ff", mult: 1.07 },
  EPICO:         { label: "Épico",         color: "#c955ff", mult: 1.14 },
  MITICO:        { label: "Mítico",        color: "#ff5e72", mult: 1.21 },
  LEGENDARIO:    { label: "Legendario",    color: "#ffe33e", mult: 1.3 },
};

const B = (name, rarity, role, c, emoji, superName, face) => ({ name, rarity, role, c, emoji, superName, face });

// face = configuración del retrato SVG: s piel, h sombrero (+hc/hc2 colores),
// e ojos, m boca, x extra (+xc color), proj tipo de proyectil especial
const BRAWLERS = [
  // Especial
  B("Shelly", "ESPECIAL", "DESTRUCTOR", "#b44be0", "🐚", "Súper Shell", { s: "#f2c39c", h: "hair", hc: "#a94fd8", m: "smirk" }),
  B("Colt", "ESPECIAL", "TIRADOR", "#4b9be0", "🔫", "Ráfaga de Balas", { s: "#f2c39c", h: "hair", hc: "#6e4426", m: "grin" }),
  B("Bull", "ESPECIAL", "TANQUE", "#8b6a3a", "🐂", "Embestida", { s: "#e0a878", e: "shades", m: "grr", x: "scar" }),
  B("Brock", "ESPECIAL", "TIRADOR", "#ff6b35", "🚀", "Lluvia de Cohetes", { s: "#9c6b45", h: "cap", hc: "#e05a2b", e: "shades", m: "grin" }),
  B("El Primo", "ESPECIAL", "TANQUE", "#37c837", "💪", "Codazo Volador", { s: "#e0a878", h: "lucha", hc: "#2b6fd8", hc2: "#37c837", m: "grr" }),
  B("Poco", "ESPECIAL", "APOYO", "#2fbfa0", "🎸", "Bis", { s: "#f7f2e7", h: "sombrero", hc: "#d94f37", hc2: "#e0b84b", e: "dot", m: "grin" }),
  B("Rosa", "ESPECIAL", "TANQUE", "#ff4fa0", "🌺", "Plantón", { s: "#9c6b45", h: "bun", hc: "#33262b", x: "blush", m: "grin" }),
  B("Barley", "ESPECIAL", "CONTROLADOR", "#e0b84b", "🍾", "Última Ronda", { s: "#e3c07a", h: "bowler", hc: "#3a2c1e", e: "dot", m: "flat", x: "stache", xc: "#3a2c1e" }),
  // Superespecial
  B("Nita", "SUPERESPECIAL", "DESTRUCTOR", "#e0644b", "🐻", "Oso Bruce", { s: "#e0a878", h: "ears", hc: "#7a4a2b", hc2: "#b8845c", m: "fangs", x: "blush" }),
  B("Jessie", "SUPERESPECIAL", "CONTROLADOR", "#ff8a3d", "🎒", "Torreta Scrappy", { s: "#f2c39c", h: "cap", hc: "#ff8a3d", x: "freckles", m: "smirk" }),
  B("Dynamike", "SUPERESPECIAL", "CONTROLADOR", "#ff3d3d", "🧨", "Barril Explosivo", { s: "#e0a878", h: "helmet", hc: "#8a8f9c", m: "flat", x: "beard", xc: "#d8d8d8" }),
  B("Tick", "SUPERESPECIAL", "CONTROLADOR", "#7a8aff", "⏲️", "Cabezazo", { s: "#8a97e8", h: "tuft", hc: "#33313f", e: "goggles", m: "grr" }),
  B("8-Bit", "SUPERESPECIAL", "TIRADOR", "#59d9ff", "🕹️", "Potenciador de Daño", { s: "#3b4b66", e: "pixel", m: "flat", x: "bolts" }),
  B("Rico", "SUPERESPECIAL", "TIRADOR", "#4be0c8", "🎱", "Superrebote", { s: "#c9d2e0", h: "tuft", hc: "#8a93a5", e: "dot", m: "smirk", x: "bolts" }),
  B("Darryl", "SUPERESPECIAL", "TANQUE", "#a56a2e", "🛢️", "Rodillo Tonel", { s: "#b07a3c", h: "helmet", hc: "#6b4218", e: "dot", m: "grr", x: "bolts" }),
  B("Penny", "SUPERESPECIAL", "TIRADOR", "#ffb63d", "💰", "Cañón Lola", { s: "#f2c39c", h: "bandana", hc: "#d94f37", e: "wink", m: "smirk", x: "freckles" }),
  B("Carl", "SUPERESPECIAL", "DESTRUCTOR", "#3db8ff", "⛏️", "Peonza", { s: "#f2c39c", h: "helmet", hc: "#3db8ff", e: "happy", m: "grin" }),
  B("Jacky", "SUPERESPECIAL", "TANQUE", "#ffaa3d", "🚧", "¡Topo a la Vista!", { s: "#f2c39c", h: "helmet", hc: "#ffaa3d", e: "wink", m: "grin", x: "blush" }),
  // Épico
  B("Piper", "EPICO", "TIRADOR", "#ff7ab8", "☂️", "Se Acabó", { s: "#9c6b45", h: "brim", hc: "#ff7ab8", hc2: "#ffd03d", e: "sleepy", m: "smirk", x: "blush" }),
  B("Pam", "EPICO", "APOYO", "#ffd03d", "🛠️", "Besito Sanador", { s: "#f2c39c", h: "hair", hc: "#e8b93d", m: "grin" }),
  B("Frank", "EPICO", "TANQUE", "#3de08a", "🔨", "Golpe Aturdidor", { s: "#5fd394", h: "flattop", hc: "#1e3a2e", e: "dot", m: "flat", x: "bolts" }),
  B("Bibi", "EPICO", "DESTRUCTOR", "#ff4b6e", "⚾", "Pompa Explosiva", { s: "#f2c39c", h: "cap", hc: "#e84360", m: "tongue", x: "blush" }),
  B("Bea", "EPICO", "TIRADOR", "#ffdd3d", "🐝", "Colmena de Hierro", { s: "#f2c39c", h: "ears", hc: "#1c1c24", hc2: "#ffdd3d", e: "goggles", m: "grin" }),
  B("Nani", "EPICO", "TIRADOR", "#ff9e3d", "🛰️", "Dron Pip", { s: "#ff9e3d", e: "cyclops", m: "flat", x: "bolts" }),
  B("Edgar", "EPICO", "DESTRUCTOR", "#b03dff", "🧣", "Salto Mortal", { s: "#f2c39c", h: "fringe", hc: "#2b2333", e: "sleepy", m: "flat" }),
  B("Griff", "EPICO", "TIRADOR", "#4bc96b", "💵", "Cerdito Hucha", { s: "#f2c39c", h: "hair", hc: "#4a3a2c", m: "grr" }),
  B("Grom", "EPICO", "CONTROLADOR", "#6e7aff", "💣", "Señal de Radio", { s: "#e0a878", h: "cap", hc: "#5a68d8", e: "sleepy", m: "flat" }),
  B("Fang", "EPICO", "DESTRUCTOR", "#ff5e3d", "👟", "Patada Voladora", { s: "#f2c39c", h: "bun", hc: "#1c1c24", m: "grin", x: "scar" }),
  // Mítico
  B("Mortis", "MITICO", "DESTRUCTOR", "#6e3dff", "🦇", "Enjambre de Murciélagos", { s: "#e9e2f2", h: "peak", hc: "#1c1428", m: "fangs" }),
  B("Tara", "MITICO", "CONTROLADOR", "#b84bff", "🔮", "Portal de Gravedad", { s: "#c9a06b", h: "hood", hc: "#8a3dd8", e: "sleepy", m: "flat", x: "gem", xc: "#4bffd4" }),
  B("Gene", "MITICO", "APOYO", "#4b6eff", "🧞", "Mano Mágica", { s: "#4b6eff", h: "tuft", hc: "#1c1c33", e: "happy", m: "grin", x: "stache", xc: "#1c1c33" }),
  B("Max", "MITICO", "APOYO", "#ffe03d", "🥤", "¡Vamos!", { s: "#f2c39c", h: "helmet", hc: "#ffd83d", e: "shades", m: "grin" }),
  B("Byron", "MITICO", "APOYO", "#6bd44b", "🧪", "Tratamiento Completo", { s: "#f2c39c", h: "bowler", hc: "#2b4a3c", e: "sleepy", m: "smirk", x: "stache", xc: "#4a3a2c" }),
  B("Squeak", "MITICO", "CONTROLADOR", "#4bffd4", "🫧", "Superpegote", { s: "#4be8c4", e: "dot", m: "tongue", x: "blush" }),
  B("Buzz", "MITICO", "DESTRUCTOR", "#ffcc3d", "🛟", "Torpedo Salvavidas", { s: "#e0a878", h: "mohawk", hc: "#1c1c24", m: "grr" }),
  B("Otis", "MITICO", "CONTROLADOR", "#ff4bd4", "🦑", "Silencio", { s: "#e8e2d6", h: "cap", hc: "#8c8798", e: "sleepy", m: "ooo" }),
  B("Cordelius", "MITICO", "DESTRUCTOR", "#8a4bff", "🍄", "Reino de las Sombras", { s: "#e9e2f2", h: "brim", hc: "#8a4bff", hc2: "#c9a8ff", m: "ooo", x: "freckles" }),
  B("Surge", "MITICO", "DESTRUCTOR", "#3de0ff", "⚡", "Sobrecarga", { s: "#3dc9e8", h: "mohawk", hc: "#ffe03d", e: "shades", m: "grin", x: "bolts" }),
  B("Melody", "MITICO", "DESTRUCTOR", "#ff6bd4", "🎤", "Interludio", { s: "#f2c39c", h: "bun", hc: "#ff6bd4", e: "wink", m: "grin", x: "blush" }),
  // Legendario
  B("Spike", "LEGENDARIO", "CONTROLADOR", "#6be04b", "🌵", "¡Ahí Quieto!", { s: "#6be04b", e: "button", m: "open", x: "spikes", xc: "#4bab37", proj: "spikeball" }),
  B("Crow", "LEGENDARIO", "CONTROLADOR", "#7a5cff", "🗡️", "Picado", { s: "#333d63", h: "spikyhood", hc: "#242c4d", m: "flat", x: "beak", xc: "#ffd24b", proj: "daggers" }),
  B("Leon", "LEGENDARIO", "DESTRUCTOR", "#4be06b", "🍃", "Bomba de Humo", { s: "#f2c39c", h: "hood", hc: "#4be06b", e: "covered", m: "smirk" }),
  B("Sandy", "LEGENDARIO", "CONTROLADOR", "#d9b96b", "🌪️", "Tormenta de Arena", { s: "#f2c39c", h: "hair", hc: "#d9b96b", e: "sleepy", m: "flat" }),
  B("Amber", "LEGENDARIO", "CONTROLADOR", "#ff8a3d", "🔥", "Fogonazo", { s: "#f2c39c", h: "hair", hc: "#ff8a3d", m: "grin" }),
  B("Meg", "LEGENDARIO", "TIRADOR", "#ff3d8a", "🦾", "Mecameg", { s: "#f2c39c", h: "helmet", hc: "#ff3d8a", e: "goggles", m: "grin", x: "freckles" }),
  B("Chester", "LEGENDARIO", "DESTRUCTOR", "#ff4b4b", "🃏", "¡Campanazo!", { s: "#f7f2e7", h: "jester", hc: "#ff4b4b", hc2: "#6e3dff", e: "wink", m: "grin" }),
  B("Kit", "LEGENDARIO", "APOYO", "#ffb84b", "🐱", "Achuchón", { s: "#ffb84b", h: "ears", hc: "#e09a2e", hc2: "#ffd8a0", e: "happy", m: "fangs", x: "whiskers" }),
];

const RARITY_ORDER = ["ESPECIAL", "SUPERESPECIAL", "EPICO", "MITICO", "LEGENDARIO"];

const initialsOf = (name) => {
  const words = name.split(/[\s-]+/).filter(Boolean);
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/* ============================================================
   2. MOTOR DE COMBATE — unidades, olas y simulación por ticks
   ============================================================ */

const TICK = 100;            // ms reales por tick
const ENERGY_PER_ATTACK = 16;
const ENERGY_PER_HIT = 8;

const ALLY_SLOTS = [
  { x: 30, y: 42 }, { x: 22, y: 22 }, { x: 21, y: 62 },
  { x: 12, y: 32 }, { x: 11, y: 54 },
];
const ENEMY_SLOTS = [
  { x: 70, y: 42 }, { x: 78, y: 22 }, { x: 79, y: 62 },
  { x: 88, y: 32 }, { x: 89, y: 54 },
];
const BOSS_SLOT = { x: 78, y: 38 };

let UID = 1;

function makeAlly(brawler, slot) {
  const role = ROLES[brawler.role];
  const mult = RARITIES[brawler.rarity].mult;
  const maxHp = Math.round(role.hp * mult);
  return {
    uid: UID++, name: brawler.name, initials: initialsOf(brawler.name),
    emoji: brawler.emoji, superName: brawler.superName, face: brawler.face,
    color: brawler.c, role: brawler.role, rarity: brawler.rarity,
    side: "ally", slot, boss: false, clone: false,
    maxHp, hp: maxHp, atk: Math.round(role.atk * mult),
    interval: role.interval, range: role.range,
    cd: 300 + Math.random() * 700, energy: 0, alive: true,
    stunUntil: 0, slowUntil: 0, poisonUntil: 0, poisonDps: 0, poisonTickAt: 0,
    lastAttack: -1e9, lastHit: -1e9, lastHeal: -1e9, bornAt: 0, lastSmash: 0,
  };
}

function makeEnemy(tpl, slot, bornAt) {
  const maxHp = Math.round(tpl.hp);
  return {
    uid: UID++, name: tpl.name, initials: tpl.initials, color: tpl.color,
    emoji: tpl.emoji, face: tpl.face, bot: tpl.bot,
    role: tpl.role || "BOT", rarity: null, side: "enemy", slot,
    boss: !!tpl.boss, clone: !!tpl.clone,
    maxHp, hp: maxHp, atk: Math.round(tpl.atk),
    interval: tpl.interval, range: tpl.range,
    cd: 600 + Math.random() * 900, energy: 0, alive: true,
    stunUntil: 0, slowUntil: 0, poisonUntil: 0, poisonDps: 0, poisonTickAt: 0,
    lastAttack: -1e9, lastHit: -1e9, lastHeal: -1e9, bornAt, lastSmash: bornAt,
  };
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function darkClone(scale, exclude) {
  const pool = BRAWLERS.filter((b) => !exclude.includes(b.name));
  const b = pick(pool);
  const role = ROLES[b.role];
  return {
    name: "Dark " + b.name, initials: initialsOf(b.name), color: b.c, emoji: b.emoji,
    face: b.face, role: b.role, clone: true, range: role.range, interval: role.interval,
    hp: role.hp * 0.85 * scale, atk: role.atk * 0.9 * scale,
  };
}

// Genera las 3 olas: robots de Brawl Stars mezclados al azar con clones oscuros
function generateWaves(squadNames) {
  const scrappy = () => ({
    name: "Scrappy Bot", initials: "SB", color: "#9ba7c9", role: "BOT", emoji: "🤖", bot: "scrappy",
    range: "melee", interval: 1350, hp: 3200, atk: 195,
  });
  const shooter = () => ({
    name: "Robot Tirador", initials: "RT", color: "#6bd0ff", role: "BOT", emoji: "🎯", bot: "shooter",
    range: "ranged", interval: 1250, hp: 2800, atk: 275,
  });
  const boxer = () => ({
    name: "Robot Boxeador", initials: "RB", color: "#ff8a5c", role: "BOT", emoji: "🥊", bot: "boxer",
    range: "melee", interval: 1600, hp: 6200, atk: 330,
  });
  const boss = () => ({
    name: "MECHA BOSS", initials: "MB", color: "#ff4b5c", role: "BOSS", emoji: "👾", bot: "boss",
    range: "ranged", interval: 1750, hp: 16500, atk: 400, boss: true,
  });

  const w1 = [scrappy(), scrappy(), scrappy()];
  if (Math.random() < 0.35) w1[pick([0, 1, 2])] = darkClone(0.75, squadNames);

  const w2 = [boxer(), shooter(), shooter()];
  if (Math.random() < 0.45) w2[pick([1, 2])] = darkClone(1.0, squadNames);

  const w3 = [boss(), darkClone(1.2, squadNames), darkClone(1.2, squadNames)];

  return [w1, w2, w3];
}

function posOf(u) {
  if (u.side === "ally") return ALLY_SLOTS[u.slot];
  if (u.boss) return BOSS_SLOT;
  return ENEMY_SLOTS[u.slot];
}

/* ============================================================
   3. SONIDO — pequeño sintetizador WebAudio (sin assets)
   ============================================================ */

let actx = null;
function playTone(freq, dur, type = "square", vol = 0.04, slide = 0) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, actx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), actx.currentTime + dur);
    g.gain.setValueAtTime(vol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination);
    o.start();
    o.stop(actx.currentTime + dur);
  } catch (e) { /* audio no disponible */ }
}
const SFX = {
  hit: () => playTone(160, 0.08, "square", 0.03),
  shot: () => playTone(620, 0.1, "square", 0.025, -300),
  super: () => { playTone(220, 0.4, "sawtooth", 0.05, 660); playTone(110, 0.4, "square", 0.04, 220); },
  heal: () => { playTone(520, 0.15, "triangle", 0.05); setTimeout(() => playTone(780, 0.2, "triangle", 0.05), 120); },
  click: () => playTone(840, 0.06, "triangle", 0.04),
  win: () => [392, 523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.25, "triangle", 0.06), i * 140)),
  lose: () => [330, 262, 196].forEach((f, i) => setTimeout(() => playTone(f, 0.3, "sawtooth", 0.04), i * 200)),
};

/* ============================================================
   4. COMPONENTE PRINCIPAL
   ============================================================ */

export default function App() {
  const [screen, setScreen] = useState("select"); // select | battle
  const [squad, setSquad] = useState([]);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  mutedRef.current = muted;

  const sfx = (k) => { if (!mutedRef.current) SFX[k](); };

  const toggleSelect = (b) => {
    sfx("click");
    setSquad((s) => {
      if (s.find((x) => x.name === b.name)) return s.filter((x) => x.name !== b.name);
      if (s.length >= 5) return s;
      return [...s, b];
    });
  };

  return screen === "select" ? (
    <SelectScreen
      squad={squad} onToggle={toggleSelect}
      muted={muted} onMute={() => setMuted((m) => !m)}
      onStart={() => { sfx("super"); setScreen("battle"); }}
    />
  ) : (
    <BattleScreen
      squad={squad} sfx={sfx}
      muted={muted} onMute={() => setMuted((m) => !m)}
      onExit={() => setScreen("select")}
    />
  );
}

/* ------------------------------------------------------------
   Pantalla 1: Brawler Dex + selección de squad
   ------------------------------------------------------------ */

function SelectScreen({ squad, onToggle, onStart, muted, onMute }) {
  const grouped = useMemo(
    () => RARITY_ORDER.map((r) => ({ rarity: r, list: BRAWLERS.filter((b) => b.rarity === r) })),
    []
  );
  const ready = squad.length === 5;

  return (
    <div className="screen select-screen">
      <header className="select-header">
        <div className="logo-block">
          <span className="logo-top">BRAWL STARS</span>
          <h1 className="logo-main">SQUAD BATTLER</h1>
        </div>
        <p className="select-sub">Elige 5 brawlers para tu squad y limpia las 3 olas del Mecha Boss.</p>
        <div className="role-legend">
          {Object.entries(ROLES).map(([key, r]) => {
            const Icon = r.icon;
            return (
              <span key={key} className="role-chip" title={r.superDesc}>
                <Icon size={13} strokeWidth={2.75} aria-hidden="true" /> {r.label}
              </span>
            );
          })}
        </div>
        <button className="icon-btn sound-corner" onClick={onMute} aria-label={muted ? "Activar sonido" : "Silenciar"}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </header>

      <main className="dex">
        {grouped.map(({ rarity, list }) => (
          <section key={rarity} className="dex-group">
            <h2 className="dex-rarity" style={{ "--rc": RARITIES[rarity].color }}>
              <Gem size={13} strokeWidth={2.75} aria-hidden="true" />
              {RARITIES[rarity].label}
            </h2>
            <div className="dex-grid">
              {list.map((b) => {
                const sel = squad.findIndex((x) => x.name === b.name);
                const RoleIcon = ROLES[b.role].icon;
                const full = squad.length >= 5 && sel < 0;
                return (
                  <button
                    key={b.name}
                    className={"dex-card" + (sel >= 0 ? " selected" : "") + (full ? " locked" : "")}
                    style={{ "--rc": RARITIES[b.rarity].color, "--bc": b.c }}
                    onClick={() => onToggle(b)}
                    title={`${ROLES[b.role].label} — Súper "${b.superName}": ${ROLES[b.role].superDesc}`}
                  >
                    {sel >= 0 && <span className="pick-badge">{sel + 1}</span>}
                    <span className="dex-avatar"><BrawlerFace f={b.face} size={42} /></span>
                    <span className="dex-name">{b.name}</span>
                    <span className="dex-role"><RoleIcon size={11} strokeWidth={3} aria-hidden="true" />{ROLES[b.role].label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <footer className="squad-bar">
        <div className="squad-slots">
          {[0, 1, 2, 3, 4].map((i) => {
            const b = squad[i];
            return b ? (
              <button key={i} className="slot filled" style={{ "--bc": b.c, "--rc": RARITIES[b.rarity].color }}
                onClick={() => onToggle(b)} title={`Quitar a ${b.name}`}>
                <BrawlerFace f={b.face} size={36} />
              </button>
            ) : (
              <span key={i} className="slot empty">?</span>
            );
          })}
        </div>
        <span className={"squad-count" + (ready ? " done" : "")}>
          <Users size={15} strokeWidth={2.75} aria-hidden="true" /> {squad.length}/5 brawlers
        </span>
        <button className={"battle-btn" + (ready ? " ready" : "")} disabled={!ready} onClick={onStart}>
          ¡A BATALLAR!
        </button>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------
   Pantalla 2: Batalla (arena + zona de control)
   ------------------------------------------------------------ */

function newBattle(squad) {
  const names = squad.map((b) => b.name);
  // Cuerpo a cuerpo al frente, distancia atrás
  const sorted = [...squad].sort((a, b) => {
    const m = (x) => (ROLES[x.role].range === "melee" ? 0 : 1);
    return m(a) - m(b);
  });
  const waves = generateWaves(names);
  return {
    t: 0,
    allies: sorted.map((b, i) => makeAlly(b, i)),
    enemies: waves[0].map((tpl, i) => makeEnemy(tpl, i, 0)),
    waves, wave: 1,
    phase: "banner",
    banner: { kind: "wave", title: "OLA 1", sub: "¡Que empiece el combate!", color: "#ffe33e", until: 1100 },
    walkUntil: 0, result: null, fx: [], shakeUntil: 0,
    gold: 0, stars: 0,
  };
}

function BattleScreen({ squad, sfx, muted, onMute, onExit }) {
  const gRef = useRef(null);
  if (!gRef.current) gRef.current = newBattle(squad);
  const [, setFrame] = useState(0);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(1);
  speedRef.current = speed;

  const addFx = (g, fx) => g.fx.push({ id: UID++, born: g.t, ttl: 700, ...fx });

  // Genera vectores aleatorios para las partículas de impacto (fijados al crearse
  // para que no cambien entre re-renders)
  const makeParts = (n, color) =>
    Array.from({ length: n }, () => {
      const ang = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * (n > 8 ? 55 : 30);
      return {
        dx: Math.cos(ang) * dist, dy: Math.sin(ang) * dist - 8,
        c: Math.random() < 0.35 ? "#fff" : color,
        s: 4 + Math.random() * 5, d: Math.random() * 0.1,
      };
    });

  const applyDamage = (g, target, amount, opts = {}) => {
    if (!target.alive) return;
    target.hp -= amount;
    target.lastHit = g.t;
    if (target.side === "ally") target.energy = Math.min(100, target.energy + ENERGY_PER_HIT);
    const p = posOf(target);
    addFx(g, {
      type: "dmg", x: p.x + (Math.random() * 6 - 3), y: p.y - 11 - Math.random() * 5,
      text: Math.round(amount), color: opts.color || (target.side === "enemy" ? "#facc15" : "#ff5e72"),
      big: !!opts.big,
    });
    addFx(g, {
      type: "spark", x: p.x, y: p.y - 4, ttl: 650,
      parts: makeParts(opts.big ? 13 : 5, opts.sparkColor || opts.color || "#ffd34d"),
    });
    if (target.hp <= 0) {
      target.hp = 0; target.alive = false;
      addFx(g, { type: "ko", x: p.x, y: p.y, ttl: 900 });
      addFx(g, { type: "spark", x: p.x, y: p.y, ttl: 900, parts: makeParts(14, "#ff8a5c") });
    }
  };

  const doAttack = (g, u, target) => {
    const dmg = u.atk * (0.9 + Math.random() * 0.2);
    u.lastAttack = g.t;
    u.cd = u.interval * (g.t < u.slowUntil ? 1.5 : 1);
    if (u.side === "ally") u.energy = Math.min(100, u.energy + ENERGY_PER_ATTACK);
    if (u.range === "ranged") {
      const a = posOf(u), b = posOf(target);
      // ángulo aprox. en pantalla (la arena es ~2x más ancha que alta)
      const rot = Math.atan2((b.y - a.y) * 0.5, b.x - a.x) * 180 / Math.PI;
      const kind = u.face?.proj || (u.boss ? "orb" : u.side === "enemy" ? "streak"
        : u.role === "CONTROLADOR" || u.role === "APOYO" ? "orb" : "streak");
      addFx(g, { type: "shot", kind, rot, x: a.x, y: a.y - 4, x2: b.x, y2: b.y - 4, color: u.color, ttl: 320 });
      sfx("shot");
    } else {
      sfx("hit");
    }
    applyDamage(g, target, dmg, { sparkColor: u.color });
  };

  // ---- Súper por rol: el corazón estilo Disney Heroes ----
  const castSuper = (u) => {
    const g = gRef.current;
    if (!u.alive || u.energy < 100 || g.result || g.phase !== "fight") return;
    const role = ROLES[u.role];
    u.energy = 0;
    sfx("super");
    g.phase = "banner";
    g.banner = {
      kind: "super", title: `¡SÚPER DE ${u.name.toUpperCase()}!`,
      sub: u.superName || role.superName, face: u.face, color: u.color, until: g.t + 1250,
    };

    const foes = g.enemies.filter((e) => e.alive);
    const pals = g.allies.filter((a) => a.alive);
    const D = 1300; // el banner pausa el combate; extendemos los efectos con su duración

    if (u.role === "TANQUE") {
      const target = foes[0];
      if (target) {
        target.stunUntil = g.t + 3200 + D;
        applyDamage(g, target, u.atk * 1.6, { big: true });
        const p = posOf(target);
        addFx(g, { type: "stun", x: p.x, y: p.y - 13, ttl: 3200 + D });
      }
    } else if (u.role === "DESTRUCTOR") {
      g.shakeUntil = g.t + 600 + D;
      foes.forEach((e) => {
        applyDamage(g, e, u.atk * 2.1, { big: true });
        const p = posOf(e);
        addFx(g, { type: "slash", x: p.x, y: p.y, color: u.color, ttl: 600 + D });
      });
    } else if (u.role === "TIRADOR") {
      const target = foes.reduce((min, e) => (e.hp < min.hp ? e : min), foes[0]);
      if (target) {
        const a = posOf(u), b = posOf(target);
        addFx(g, { type: "bigshot", x: a.x, y: a.y - 4, x2: b.x, y2: b.y - 4, color: u.color, ttl: 450 + D });
        applyDamage(g, target, u.atk * 4.2, { big: true });
        g.shakeUntil = g.t + 350 + D;
      }
    } else if (u.role === "APOYO") {
      sfx("heal");
      pals.forEach((a) => {
        const heal = a.maxHp * 0.42;
        a.hp = Math.min(a.maxHp, a.hp + heal);
        a.lastHeal = g.t;
        const p = posOf(a);
        addFx(g, { type: "dmg", x: p.x, y: p.y - 11, text: "+" + Math.round(heal), color: "#58e058" });
        addFx(g, { type: "healfx", x: p.x, y: p.y, ttl: 900 + D });
      });
    } else if (u.role === "CONTROLADOR") {
      foes.forEach((e) => {
        e.poisonUntil = g.t + 6000 + D;
        e.slowUntil = g.t + 6000 + D;
        e.poisonDps = u.atk * 0.38;
        e.poisonTickAt = g.t + 1000 + D;
        const p = posOf(e);
        addFx(g, { type: "poisonfx", x: p.x, y: p.y, ttl: 6000 + D });
      });
    }
    setFrame((f) => f + 1);
  };

  // ---- Tick de simulación ----
  useEffect(() => {
    const id = setInterval(() => {
      const g = gRef.current;
      const dt = TICK * speedRef.current;
      g.t += dt;
      g.fx = g.fx.filter((f) => g.t - f.born < f.ttl);

      if (g.result) { setFrame((f) => f + 1); return; }

      if (g.phase === "banner") {
        if (g.t >= g.banner.until) { g.banner = null; g.phase = "fight"; }
        setFrame((f) => f + 1); return;
      }

      if (g.phase === "walk") {
        if (g.t >= g.walkUntil) {
          g.wave += 1;
          g.enemies = g.waves[g.wave - 1].map((tpl, i) => makeEnemy(tpl, i, g.t));
          const isBossWave = g.wave === 3;
          g.phase = "banner";
          g.banner = isBossWave
            ? { kind: "boss", title: "¡MECHA BOSS!", sub: "Ola final — sobrevive", color: "#ff4b5c", until: g.t + 1400 }
            : { kind: "wave", title: `OLA ${g.wave}`, sub: "¡Siguen llegando!", color: "#ffe33e", until: g.t + 1000 };
        }
        setFrame((f) => f + 1); return;
      }

      // Fase de combate
      const everyone = [...g.allies, ...g.enemies];
      for (const u of everyone) {
        if (!u.alive) continue;
        // Veneno del Controlador
        if (g.t < u.poisonUntil && g.t >= u.poisonTickAt) {
          u.poisonTickAt += 1000;
          applyDamage(g, u, u.poisonDps, { color: "#c955ff" });
        }
        if (!u.alive) continue;
        if (g.t < u.stunUntil) continue; // aturdido: no ataca
        u.cd -= dt * (g.t < u.slowUntil ? 0.75 : 1);
        if (u.cd > 0) continue;

        const foes = (u.side === "ally" ? g.enemies : g.allies).filter((e) => e.alive);
        if (!foes.length) continue;
        // Cuerpo a cuerpo golpea al más cercano (el primero); a distancia varía objetivo
        const target = u.range === "melee" ? foes[0] : pick(foes);
        doAttack(g, u, target);

        // Súper del jefe: MEGA PISOTÓN en área
        if (u.boss && g.t - u.lastSmash > 7000) {
          u.lastSmash = g.t;
          g.shakeUntil = g.t + 500;
          const p = posOf(u);
          addFx(g, { type: "slash", x: p.x, y: p.y, color: "#ff4b5c", ttl: 600 });
          g.allies.filter((a) => a.alive).forEach((a) => applyDamage(g, a, u.atk * 0.7));
        }
      }

      // ¿Fin de ola / batalla?
      if (!g.allies.some((a) => a.alive)) {
        g.result = "defeat";
        sfx("lose");
      } else if (!g.enemies.some((e) => e.alive)) {
        if (g.wave < 3) {
          g.phase = "walk";
          g.walkUntil = g.t + 1600;
        } else {
          const survivors = g.allies.filter((a) => a.alive).length;
          g.stars = survivors >= 5 ? 3 : survivors >= 3 ? 2 : 1;
          g.gold = 100 + survivors * 25 + g.stars * 45;
          g.result = "victory";
          sfx("win");
        }
      }
      setFrame((f) => f + 1);
    }, TICK);
    return () => clearInterval(id);
  }, []);

  const g = gRef.current;
  const retry = () => { sfx("click"); gRef.current = newBattle(squad); setFrame((f) => f + 1); };
  const shaking = g.t < g.shakeUntil;

  return (
    <div className="screen battle-screen">
      {/* ---- Zona de combate ---- */}
      <div className={"arena" + (shaking ? " shake" : "") + (g.phase === "walk" ? " walking" : "")}>
        <div className="arena-floor" style={{ backgroundPositionX: `${-(g.wave - 1) * 420}px` }} />
        <MineDecor wave={g.wave} />
        <div className="arena-vignette" />

        <div className="hud">
          <span className="map-chip"><Gem size={13} strokeWidth={3} aria-hidden="true" /> ATRAPAGEMAS</span>
          <div className="wave-pips" aria-label={`Ola ${g.wave} de 3`}>
            {[1, 2, 3].map((w) => (
              <span key={w} className={"pip" + (w < g.wave ? " done" : w === g.wave ? " now" : "")}>{w}</span>
            ))}
            <span className="wave-label">OLA {g.wave}/3</span>
          </div>
          <div className="hud-actions">
            <button className={"icon-btn" + (speed === 2 ? " active" : "")}
              onClick={() => { sfx("click"); setSpeed((s) => (s === 1 ? 2 : 1)); }}
              aria-label="Velocidad x2" title="Velocidad x2">
              <FastForward size={17} /> <b>x{speed}</b>
            </button>
            <button className="icon-btn" onClick={onMute} aria-label={muted ? "Activar sonido" : "Silenciar"}>
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <button className="icon-btn" onClick={() => { sfx("click"); onExit(); }} title="Cambiar squad">
              <Users size={17} />
            </button>
          </div>
        </div>

        {g.allies.map((u) => <UnitSprite key={u.uid} u={u} t={g.t} walking={g.phase === "walk"} />)}
        {g.enemies.map((u) => <UnitSprite key={u.uid} u={u} t={g.t} walking={false} />)}
        <FxLayer fx={g.fx} t={g.t} />

        {g.banner && g.t < g.banner.until && (
          <div className={"banner banner-" + g.banner.kind} style={{ "--bc": g.banner.color }}>
            <div className="banner-burst" />
            {g.banner.face && <span className="banner-face"><BrawlerFace f={g.banner.face} size={82} /></span>}
            <span className="banner-sub">{g.banner.kind === "super" ? "★ HABILIDAD DEFINITIVA ★" : "— BRAWL —"}</span>
            <strong className="banner-title">{g.banner.title}</strong>
            <span className="banner-sub2">{g.banner.sub}</span>
          </div>
        )}

        {g.result === "victory" && <ResultOverlay win g={g} onRetry={retry} onExit={onExit} sfx={sfx} />}
        {g.result === "defeat" && <ResultOverlay win={false} g={g} onRetry={retry} onExit={onExit} sfx={sfx} />}
      </div>

      {/* ---- Zona de control: tarjetas del squad ---- */}
      <div className="control-zone">
        {g.allies.map((u) => (
          <BrawlerCard key={u.uid} u={u} t={g.t} onSuper={() => castSuper(u)} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Sprites, FX, tarjetas y overlays
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   Retratos SVG — caras cartoon paramétricas (sin <defs> para
   evitar colisiones de IDs entre instancias)
   ------------------------------------------------------------ */

const INK = "#141024";

function FaceHat({ f }) {
  const hc = f.hc || "#333", hc2 = f.hc2 || INK;
  switch (f.h) {
    case "hair":
      return <path d="M11 33 Q9 12 32 11 Q55 12 53 33 Q49 18 32 19 Q15 18 11 33 Z" fill={hc} stroke={INK} strokeWidth="2" />;
    case "fringe":
      return (<g>
        <path d="M11 33 Q9 12 32 11 Q55 12 53 33 Q49 18 32 19 Q15 18 11 33 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <path d="M32 15 Q52 15 50 38 L39 35 Q45 22 31 20 Z" fill={hc} stroke={INK} strokeWidth="1.5" />
      </g>);
    case "peak":
      return <path d="M12 31 Q12 12 32 12 Q52 12 52 31 Q45 19 32 27 Q19 19 12 31 Z" fill={hc} stroke={INK} strokeWidth="2" />;
    case "mohawk":
      return (<g>
        <path d="M12 30 Q12 15 32 14 Q52 15 52 30 Q46 20 32 20 Q18 20 12 30 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <path d="M24 17 Q32 1 40 17 Q32 9 24 17 Z" fill={hc} stroke={INK} strokeWidth="2" />
      </g>);
    case "hood":
      return (<g>
        <path d="M29 10 L32 1 L36 9 Z" fill={hc} stroke={INK} strokeWidth="1.5" />
        <path d="M9 42 Q6 9 32 8 Q58 9 55 42 Q51 23 32 23 Q13 23 9 42 Z" fill={hc} stroke={INK} strokeWidth="2" />
      </g>);
    case "spikyhood":
      return (<g>
        <path d="M9 42 Q6 9 32 8 Q58 9 55 42 Q51 23 32 23 Q13 23 9 42 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <path d="M18 15 L14 5 L24 11 Z M29 10 L32 0 L37 10 Z M41 11 L50 5 L46 15 Z" fill={hc} stroke={INK} strokeWidth="1.5" />
      </g>);
    case "sombrero":
      return (<g>
        <path d="M20 20 Q22 5 32 5 Q42 5 44 20 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <ellipse cx="32" cy="20" rx="26" ry="6.5" fill={hc} stroke={INK} strokeWidth="2" />
        <rect x="22" y="15" width="20" height="4" rx="2" fill={hc2} />
      </g>);
    case "bowler":
      return (<g>
        <path d="M19 21 Q21 7 32 7 Q43 7 45 21 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <rect x="13" y="19" width="38" height="5" rx="2.5" fill={hc} stroke={INK} strokeWidth="2" />
      </g>);
    case "brim":
      return (<g>
        <path d="M18 18 Q20 4 32 4 Q44 4 46 18 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <ellipse cx="32" cy="18" rx="27" ry="7.5" fill={hc} stroke={INK} strokeWidth="2" />
        <circle cx="14" cy="16" r="4" fill={hc2} stroke={INK} strokeWidth="1.5" />
      </g>);
    case "cap":
      return (<g>
        <path d="M17 24 Q18 7 33 8 Q47 9 47 24 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <path d="M45 18 Q58 18 56 26 L45 24 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <circle cx="32" cy="8" r="2.5" fill={hc} stroke={INK} strokeWidth="1.5" />
      </g>);
    case "helmet":
      return (<g>
        <path d="M13 30 Q13 7 32 7 Q51 7 51 30 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <rect x="13" y="25" width="38" height="5" rx="2.5" fill={INK} opacity="0.3" />
        <circle cx="32" cy="14" r="2" fill="#fff" opacity="0.5" />
      </g>);
    case "lucha":
      return (<g>
        <path d="M13 46 Q7 7 32 7 Q57 7 51 46 Q48 26 32 26 Q16 26 13 46 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <path d="M28 12 L32 6 L36 12 L32 17 Z" fill={hc2} stroke={INK} strokeWidth="1.5" />
      </g>);
    case "ears":
      return (<g>
        <circle cx="16" cy="15" r="6.5" fill={hc} stroke={INK} strokeWidth="2" />
        <circle cx="48" cy="15" r="6.5" fill={hc} stroke={INK} strokeWidth="2" />
        <circle cx="16" cy="15" r="3" fill={hc2} />
        <circle cx="48" cy="15" r="3" fill={hc2} />
        <path d="M12 32 Q12 14 32 13 Q52 14 52 32 Q47 20 32 20 Q17 20 12 32 Z" fill={hc} stroke={INK} strokeWidth="2" />
      </g>);
    case "flattop":
      return (<g>
        <rect x="14" y="7" width="36" height="13" rx="3" fill={hc} stroke={INK} strokeWidth="2" />
        <path d="M14 20 L50 20 L48 24 L16 24 Z" fill={hc} opacity="0.7" />
      </g>);
    case "bun":
      return (<g>
        <circle cx="32" cy="9" r="6" fill={hc} stroke={INK} strokeWidth="2" />
        <path d="M12 31 Q11 13 32 12 Q53 13 52 31 Q48 18 32 19 Q16 18 12 31 Z" fill={hc} stroke={INK} strokeWidth="2" />
      </g>);
    case "bandana":
      return (<g>
        <path d="M12 27 Q32 17 52 27 L52 33 Q32 23 12 33 Z" fill={hc} stroke={INK} strokeWidth="2" />
        <path d="M50 28 L60 24 L57 33 Z" fill={hc} stroke={INK} strokeWidth="1.5" />
      </g>);
    case "tuft":
      return <path d="M29 15 Q26 3 34 5 Q31 9 37 11 Q33 14 35 16 Z" fill={hc} stroke={INK} strokeWidth="1.5" />;
    case "jester":
      return (<g>
        <path d="M23 18 L10 4 L30 13 Z" fill={hc} stroke={INK} strokeWidth="1.5" />
        <path d="M41 18 L54 4 L34 13 Z" fill={hc2} stroke={INK} strokeWidth="1.5" />
        <circle cx="10" cy="5" r="3" fill={hc2} stroke={INK} strokeWidth="1.5" />
        <circle cx="54" cy="5" r="3" fill={hc} stroke={INK} strokeWidth="1.5" />
        <path d="M14 24 Q22 14 32 15 Q42 14 50 24 Z" fill={hc} stroke={INK} strokeWidth="2" />
      </g>);
    default:
      return null;
  }
}

function FaceEyes({ f }) {
  switch (f.e) {
    case "dot":
      return (<g>
        <circle cx="24.5" cy="33" r="2.6" fill={INK} />
        <circle cx="39.5" cy="33" r="2.6" fill={INK} />
        <path d="M18 27 L29 30 M46 27 L35 30" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </g>);
    case "button":
      return (<g>
        <circle cx="24" cy="32" r="4.2" fill={INK} />
        <circle cx="40" cy="32" r="4.2" fill={INK} />
        <circle cx="25.5" cy="30.5" r="1.3" fill="#fff" />
        <circle cx="41.5" cy="30.5" r="1.3" fill="#fff" />
      </g>);
    case "covered":
      return (<g>
        <path d="M12 31 Q32 39 52 31 L52 22 Q32 15 12 22 Z" fill="#12291c" opacity="0.92" />
        <ellipse cx="24" cy="28.5" rx="2.8" ry="4" fill="#eafff2" />
        <ellipse cx="40" cy="28.5" rx="2.8" ry="4" fill="#eafff2" />
      </g>);
    case "shades":
      return (<g>
        <rect x="13" y="26.5" width="38" height="10" rx="4.5" fill={INK} />
        <path d="M17 29 Q22 27.5 27 29" stroke="#8ad0ff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M37 29 Q42 27.5 47 29" stroke="#8ad0ff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </g>);
    case "goggles":
      return (<g>
        <path d="M13 31 L51 31" stroke={INK} strokeWidth="3.5" />
        <circle cx="24" cy="32" r="7.5" fill="#cfeaff" stroke={INK} strokeWidth="3" />
        <circle cx="40" cy="32" r="7.5" fill="#cfeaff" stroke={INK} strokeWidth="3" />
        <circle cx="24.5" cy="32.5" r="2.4" fill={INK} />
        <circle cx="40.5" cy="32.5" r="2.4" fill={INK} />
      </g>);
    case "cyclops":
      return (<g>
        <circle cx="32" cy="31" r="8.5" fill="#fff" stroke={INK} strokeWidth="2.5" />
        <circle cx="32" cy="32" r="3.6" fill={INK} />
        <path d="M22 22 L42 22" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>);
    case "sleepy":
      return (<g>
        <path d="M18 32 Q24 29 29 32" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M35 32 Q40 29 46 32" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="24" cy="34" r="2" fill={INK} />
        <circle cx="40" cy="34" r="2" fill={INK} />
      </g>);
    case "happy":
      return (<g>
        <path d="M19 33 Q24 27 29 33" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M35 33 Q40 27 45 33" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>);
    case "wink":
      return (<g>
        <ellipse cx="24" cy="33" rx="5" ry="6" fill="#fff" stroke={INK} strokeWidth="1.5" />
        <circle cx="25.5" cy="34" r="2.4" fill={INK} />
        <path d="M17 26 L29 29.5" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M35 33 Q40 29.5 45 33" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>);
    case "pixel":
      return (<g>
        <rect x="15" y="24" width="34" height="17" rx="2.5" fill="#10141f" stroke={INK} strokeWidth="2" />
        <rect x="21" y="28" width="6" height="8" fill="#7ce8ff" />
        <rect x="37" y="28" width="6" height="8" fill="#7ce8ff" />
      </g>);
    default: // angry
      return (<g>
        <ellipse cx="24" cy="33" rx="5.2" ry="6.2" fill="#fff" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="40" cy="33" rx="5.2" ry="6.2" fill="#fff" stroke={INK} strokeWidth="1.5" />
        <circle cx="25.6" cy="34.4" r="2.5" fill={INK} />
        <circle cx="38.4" cy="34.4" r="2.5" fill={INK} />
        <path d="M17 25.5 L29 29.5" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M47 25.5 L35 29.5" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      </g>);
  }
}

function FaceMouth({ f }) {
  if (f.x === "beak") return null; // el pico ocupa la zona de la boca
  switch (f.m) {
    case "open":
      return (<g>
        <ellipse cx="32" cy="45.5" rx="6.2" ry="6.8" fill="#5e1220" stroke={INK} strokeWidth="1.5" />
        <ellipse cx="32" cy="49.5" rx="3.6" ry="2.6" fill="#ff6b7a" />
      </g>);
    case "smirk":
      return <path d="M25 46 Q33 50 41 43.5" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
    case "fangs":
      return (<g>
        <path d="M23 44 Q32 50 41 44" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M25 45 L27.5 50 L30 45.6 Z M39 45 L36.5 50 L34 45.6 Z" fill="#fff" stroke={INK} strokeWidth="1" />
      </g>);
    case "grr":
      return (<g>
        <rect x="22" y="42" width="20" height="7" rx="3" fill={INK} />
        <path d="M24 43.5 L40 43.5 L40 47 L24 47 Z" fill="#fff" />
        <path d="M28 43.5 L28 47 M32 43.5 L32 47 M36 43.5 L36 47" stroke={INK} strokeWidth="1.2" />
      </g>);
    case "flat":
      return <path d="M26 45.5 L38 45.5" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />;
    case "ooo":
      return <circle cx="32" cy="45.5" r="3.2" fill={INK} />;
    case "tongue":
      return (<g>
        <path d="M24 43.5 Q32 49 40 43.5" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M30 46 Q32 51 36 46 Q33 45.4 30 46 Z" fill="#ff6b7a" stroke={INK} strokeWidth="1.2" />
      </g>);
    default: // grin
      return (<g>
        <path d="M23 43 Q32 52 41 43 Z" fill={INK} />
        <path d="M26 43.6 Q32 46.5 38 43.6 L37 45.6 Q32 47.6 27 45.6 Z" fill="#fff" />
      </g>);
  }
}

function FaceExtra({ f }) {
  const xc = f.xc || INK;
  switch (f.x) {
    case "spikes": {
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      return (<g>
        {angles.map((a) => (
          <path key={a} d="M32 6.5 L27.5 15.5 L36.5 15.5 Z" fill={xc} stroke={INK} strokeWidth="1.5"
            transform={`rotate(${a} 32 35)`} />
        ))}
      </g>);
    }
    case "beak":
      return <path d="M25 35.5 L39 35.5 L32 48.5 Z" fill={xc} stroke={INK} strokeWidth="2" strokeLinejoin="round" />;
    case "stache":
      return <path d="M20 41.5 Q26 38 32 41.5 Q38 38 44 41.5 Q38 45 32 42.6 Q26 45 20 41.5 Z" fill={xc} stroke={INK} strokeWidth="1" />;
    case "beard":
      return <path d="M17 39 Q19 58 32 58 Q45 58 47 39 Q41 48 32 48 Q23 48 17 39 Z" fill={xc} stroke={INK} strokeWidth="1.5" />;
    case "bolts":
      return (<g>
        <rect x="7" y="32" width="6" height="4.5" rx="1.5" fill="#8a93a5" stroke={INK} strokeWidth="1.5" />
        <rect x="51" y="32" width="6" height="4.5" rx="1.5" fill="#8a93a5" stroke={INK} strokeWidth="1.5" />
      </g>);
    case "blush":
      return (<g opacity="0.55">
        <circle cx="19" cy="40" r="3.4" fill="#ff7a8a" />
        <circle cx="45" cy="40" r="3.4" fill="#ff7a8a" />
      </g>);
    case "freckles":
      return (<g fill={INK} opacity="0.5">
        <circle cx="20" cy="39" r="1" /><circle cx="24" cy="41" r="1" /><circle cx="28" cy="39.5" r="1" />
        <circle cx="36" cy="39.5" r="1" /><circle cx="40" cy="41" r="1" /><circle cx="44" cy="39" r="1" />
      </g>);
    case "scar":
      return <path d="M42 37 L47 43 M46.5 38 L42.5 42.5" stroke={INK} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />;
    case "whiskers":
      return (<g stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
        <path d="M8 36 L18 38 M8 42 L18 41.5" />
        <path d="M56 36 L46 38 M56 42 L46 41.5" />
      </g>);
    case "gem":
      return <path d="M32 17 L36 21.5 L32 26 L28 21.5 Z" fill={xc} stroke={INK} strokeWidth="1.5" />;
    default:
      return null;
  }
}

function BrawlerFace({ f, size = 44 }) {
  if (!f) return null;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="face-svg" aria-hidden="true">
      {f.x === "spikes" && <FaceExtra f={f} />}
      <circle cx="32" cy="35" r="21" fill={f.s} stroke={INK} strokeWidth="2.5" />
      <path d="M11 35 Q13 53 32 55 Q51 53 53 35 Q50 51 32 51.5 Q14 51 11 35 Z" fill={INK} opacity="0.14" />
      <FaceHat f={f} />
      {f.x !== "spikes" && <FaceExtra f={f} />}
      <FaceEyes f={f} />
      <FaceMouth f={f} />
    </svg>
  );
}

// Robots: cuerpo metálico con placas superpuestas, remaches y ojo ciclope rojo
function BotFace({ kind = "scrappy", size = 44 }) {
  const boss = kind === "boss";
  const plate = boss ? "#5e4a5e" : "#9aa3b5";
  const plateDark = boss ? "#452e45" : "#7d8699";
  const plateLight = boss ? "#7a5f7a" : "#b8c0cf";
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="face-svg" aria-hidden="true">
      {kind === "scrappy" && (<g>
        <path d="M32 10 L32 4" stroke={INK} strokeWidth="2" />
        <circle cx="32" cy="3.5" r="2.5" fill="#ff4b5c" stroke={INK} strokeWidth="1.5" />
      </g>)}
      {kind === "shooter" && (<g>
        <path d="M46 12 L52 4" stroke={INK} strokeWidth="2" />
        <circle cx="53" cy="3.5" r="3" fill="#6bd0ff" stroke={INK} strokeWidth="1.5" />
      </g>)}
      {boss && (
        <path d="M14 14 L6 2 L22 9 Z M50 14 L58 2 L42 9 Z" fill={plateDark} stroke={INK} strokeWidth="2" />
      )}
      <rect x="12" y="10" width="40" height="44" rx="11" fill={plate} stroke={INK} strokeWidth="2.5" />
      <rect x="16" y="13.5" width="32" height="19" rx="7" fill={plateLight} stroke={INK} strokeWidth="1.8" />
      <rect x="16" y="35" width="32" height="15.5" rx="6" fill={plateDark} stroke={INK} strokeWidth="1.8" />
      {/* remaches */}
      <g fill={INK} opacity="0.55">
        <circle cx="17.5" cy="15.5" r="1.4" /><circle cx="46.5" cy="15.5" r="1.4" />
        <circle cx="17.5" cy="48.5" r="1.4" /><circle cx="46.5" cy="48.5" r="1.4" />
      </g>
      {/* ojo(s) */}
      {boss ? (<g className="bot-eye">
        <path d="M17 22 L30 25 L30 31 L17 28 Z" fill="#ff2d3f" stroke={INK} strokeWidth="1.5" />
        <path d="M47 22 L34 25 L34 31 L47 28 Z" fill="#ff2d3f" stroke={INK} strokeWidth="1.5" />
        <path d="M19 24.5 L28 26.8" stroke="#ffb3ba" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M45 24.5 L36 26.8" stroke="#ffb3ba" strokeWidth="1.6" strokeLinecap="round" />
      </g>) : (<g className="bot-eye">
        <circle cx="32" cy="23" r="8.2" fill="#2b2f3a" stroke={INK} strokeWidth="2" />
        <circle cx="32" cy="23" r="5.6" fill="#ff2d3f" opacity="0.45" />
        <circle cx="32" cy="23" r="3.8" fill="#ff2d3f" />
        <circle cx="33.4" cy="21.6" r="1.4" fill="#ffb3ba" />
      </g>)}
      {kind === "boxer" && (
        <rect x="18" y="36.5" width="28" height="9" rx="4" fill="#d97a54" stroke={INK} strokeWidth="1.8" />
      )}
      {/* rejilla */}
      <g stroke={INK} strokeWidth="1.6" opacity="0.6">
        <path d="M26 40 L26 46 M32 40 L32 46 M38 40 L38 46" />
      </g>
      {boss && (
        <circle cx="32" cy="43" r="4.5" fill="#ff2d3f" stroke={INK} strokeWidth="1.8" className="bot-eye" />
      )}
    </svg>
  );
}

// Decoración de la mina: gemas, vagonetas, arbustos, barriles, cajas y rocas.
// Posiciones fijas sobre una capa al 150% de ancho que hace parallax entre olas.
const DECOR = [
  { t: "cart", x: 3, y: 8 }, { t: "cart", x: 112, y: 62 },
  { t: "gem", x: 14, y: 62, s: 1 }, { t: "gem", x: 38, y: 24, s: 0.8, d: 0.4 },
  { t: "gem", x: 47, y: 76, s: 1.25, d: 0.8 }, { t: "gem", x: 70, y: 14, s: 0.9, d: 0.2 },
  { t: "gem", x: 64, y: 86, s: 1.1, d: 0.6 }, { t: "gem", x: 91, y: 44, s: 0.85, d: 1 },
  { t: "gem", x: 107, y: 72, s: 1.2, d: 0.3 }, { t: "gem", x: 126, y: 22, s: 0.9, d: 0.7 },
  { t: "gem", x: 139, y: 58, s: 1, d: 0.5 },
  { t: "bush", x: 29, y: 5 }, { t: "bush", x: 55, y: 91 }, { t: "bush", x: 82, y: 4 },
  { t: "bush", x: 101, y: 88 }, { t: "bush", x: 134, y: 84 },
  { t: "barrel", x: 22, y: 88 }, { t: "barrel", x: 86, y: 91 },
  { t: "barrel", x: 113, y: 8 }, { t: "barrel", x: 143, y: 10 },
  { t: "crate", x: 5, y: 66 }, { t: "crate", x: 74, y: 90 },
  { t: "rock", x: 10, y: -3 }, { t: "rock", x: 44, y: -4 }, { t: "rock", x: 96, y: -3 },
  { t: "rock", x: 130, y: -4 }, { t: "rock", x: 26, y: 101 }, { t: "rock", x: 66, y: 102 },
  { t: "rock", x: 120, y: 101 },
  // manchas y grietas que rompen la monotonía del suelo
  { t: "stain", x: 20, y: 40, s: 1.3 }, { t: "stain", x: 46, y: 68, s: 1 },
  { t: "stain", x: 72, y: 30, s: 1.5 }, { t: "stain", x: 98, y: 60, s: 1.1 },
  { t: "stain", x: 125, y: 38, s: 1.4 }, { t: "stain", x: 58, y: 14, s: 0.9 },
  { t: "crack", x: 33, y: 52 }, { t: "crack", x: 62, y: 78, s: 1.3 },
  { t: "crack", x: 88, y: 20, s: 1.1 }, { t: "crack", x: 118, y: 82, s: 0.9 },
  { t: "crack", x: 12, y: 74, s: 1.2 },
];

function MineDecor({ wave }) {
  return (
    <div className="decor" style={{ transform: `translateX(${-(wave - 1) * 12}%)` }} aria-hidden="true">
      <div className="rails" />
      {DECOR.map((d, i) => {
        const style = { left: d.x + "%", top: d.y + "%", "--s": d.s || 1, animationDelay: (d.d || 0) + "s" };
        if (d.t === "crack") {
          return (
            <svg key={i} className="deco crack" style={style} viewBox="0 0 64 26" width="64" height="26">
              <path d="M2 14 L15 9 L23 17 L35 10 L45 16 L62 11" stroke="rgb(10 8 16 / 0.5)"
                strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 17 L27 24 M35 10 L38 3" stroke="rgb(10 8 16 / 0.38)"
                strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </svg>
          );
        }
        return <span key={i} className={"deco " + d.t} style={style} />;
      })}
    </div>
  );
}

function UnitSprite({ u, t, walking }) {
  const p = posOf(u);
  const attacking = t - u.lastAttack < 350;
  const hurt = t - u.lastHit < 260;
  const healed = t - u.lastHeal < 700;
  const stunned = t < u.stunUntil;
  const poisoned = t < u.poisonUntil;
  const entering = t - u.bornAt < 550 && u.side === "enemy";
  const glow = u.side === "ally" ? RARITIES[u.rarity].color
    : u.boss ? "#ff4b5c" : u.clone ? "#a24bff" : "#8aa0c8";
  const cls = [
    "unit", u.side, u.boss ? "boss" : "", u.clone ? "clone" : "",
    u.alive ? "" : "dead",
    attacking ? (u.side === "ally" ? "lunge-r" : "lunge-l") : "",
    hurt ? "hurt" : "", healed ? "healed" : "", stunned ? "stunned" : "",
    poisoned ? "poisoned" : "", entering ? "entering" : "", walking && u.alive ? "strut" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={cls}
      style={{ left: p.x + "%", top: p.y + "%", zIndex: Math.round(p.y), "--bc": u.color, "--glow": glow }}>
      <div className="unit-tag">
        <span className="unit-name">{u.name}</span>
        <span className="unit-hp">
          <i style={{ width: Math.max(0, (u.hp / u.maxHp) * 100) + "%" }} />
        </span>
      </div>
      <div className="unit-body">
        {u.face ? <BrawlerFace f={u.face} size={u.boss ? 76 : 44} />
          : <BotFace kind={u.bot} size={u.boss ? 76 : 44} />}
        {stunned && <span className="stun-stars" aria-hidden="true">✦ ✦ ✦</span>}
      </div>
      <span className="unit-shadow" aria-hidden="true" />
    </div>
  );
}

function FxLayer({ fx, t }) {
  return (
    <div className="fx-layer" aria-hidden="true">
      {fx.map((f) => {
        if (f.type === "spark") {
          return (
            <span key={f.id} className="fx-sparks" style={{ left: f.x + "%", top: f.y + "%" }}>
              {f.parts.map((p, i) => (
                <i key={i} style={{
                  "--dx": p.dx + "px", "--dy": p.dy + "px",
                  width: p.s + "px", height: p.s + "px",
                  background: p.c, boxShadow: `0 0 8px ${p.c}`,
                  animationDelay: p.d + "s",
                }} />
              ))}
            </span>
          );
        }
        if (f.type === "dmg") {
          return (
            <span key={f.id} className={"fx-dmg" + (f.big ? " big" : "")}
              style={{ left: f.x + "%", top: f.y + "%", color: f.color }}>
              {f.text}
            </span>
          );
        }
        if (f.type === "shot" || f.type === "bigshot") {
          return (
            <span key={f.id}
              className={(f.type === "shot" ? "fx-shot" : "fx-bigshot") + (f.kind ? " k-" + f.kind : "")}
              style={{
                "--x0": f.x + "%", "--y0": f.y + "%", "--x1": f.x2 + "%", "--y1": f.y2 + "%",
                "--c": f.color, "--rot": (f.rot || 0) + "deg",
              }} />
          );
        }
        if (f.type === "slash") {
          return <span key={f.id} className="fx-slash" style={{ left: f.x + "%", top: f.y + "%", "--c": f.color }} />;
        }
        if (f.type === "healfx") {
          return <span key={f.id} className="fx-heal" style={{ left: f.x + "%", top: f.y + "%" }}>✚</span>;
        }
        if (f.type === "poisonfx") {
          return <span key={f.id} className="fx-poison" style={{ left: f.x + "%", top: f.y + "%" }}>◉ ◉</span>;
        }
        if (f.type === "ko") {
          return <span key={f.id} className="fx-ko" style={{ left: f.x + "%", top: f.y + "%" }}>✶ KO ✶</span>;
        }
        if (f.type === "stun") {
          return <span key={f.id} className="fx-stun" style={{ left: f.x + "%", top: f.y + "%" }}>★</span>;
        }
        return null;
      })}
    </div>
  );
}

function BrawlerCard({ u, t, onSuper }) {
  const ready = u.alive && u.energy >= 100;
  const RoleIcon = ROLES[u.role].icon;
  return (
    <button
      className={"card" + (ready ? " ready" : "") + (u.alive ? "" : " dead")}
      style={{ "--bc": u.color, "--rc": RARITIES[u.rarity].color }}
      onClick={onSuper}
      disabled={!ready}
      aria-label={ready ? `Activar Súper de ${u.name}` : u.name}
      title={`Súper "${u.superName}": ${ROLES[u.role].superDesc}`}
    >
      <span className="card-avatar">
        <BrawlerFace f={u.face} size={38} />
        <em className="card-role"><RoleIcon size={11} strokeWidth={3} aria-hidden="true" /></em>
      </span>
      <span className="card-name">{u.name}</span>
      <span className="bar hp-bar" role="img" aria-label={`Vida ${Math.round(u.hp)} de ${u.maxHp}`}>
        <i style={{ width: (u.hp / u.maxHp) * 100 + "%" }} />
      </span>
      <span className="bar sp-bar" role="img" aria-label={`Súper ${Math.round(u.energy)}%`}>
        <i style={{ width: u.energy + "%" }} />
      </span>
      {ready && <span className="super-tag"><Zap size={12} strokeWidth={3} aria-hidden="true" /> ¡SÚPER LISTO!</span>}
      {!u.alive && <span className="ko-tag"><Skull size={14} aria-hidden="true" /></span>}
    </button>
  );
}

function ResultOverlay({ win, g, onRetry, onExit, sfx }) {
  return (
    <div className={"result " + (win ? "win" : "lose")}>
      <div className="result-card">
        {win ? (
          <>
            <div className="stars">
              {[1, 2, 3].map((s) => (
                <Star key={s} size={54} strokeWidth={1.5}
                  className={"star" + (s <= g.stars ? " on" : "")}
                  style={{ animationDelay: `${s * 0.22}s` }} />
              ))}
            </div>
            <h2 className="result-title">¡VICTORIA!</h2>
            <p className="result-sub">Las 3 olas han caído. ¡Squad imparable!</p>
            <div className="gold"><Coins size={20} strokeWidth={2.5} aria-hidden="true" /> +{g.gold} de oro</div>
          </>
        ) : (
          <>
            <Skull size={62} className="lose-skull" strokeWidth={1.75} />
            <h2 className="result-title">¡DERROTA!</h2>
            <p className="result-sub">Tu squad cayó en la ola {g.wave}. ¡La revancha te espera!</p>
          </>
        )}
        <div className="result-actions">
          <button className="battle-btn ready" onClick={onRetry}>
            <RotateCcw size={17} strokeWidth={3} aria-hidden="true" /> REINTENTAR
          </button>
          <button className="ghost-btn" onClick={() => { sfx("click"); onExit(); }}>Cambiar squad</button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
