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

const B = (name, rarity, role, c, emoji, superName) => ({ name, rarity, role, c, emoji, superName });

// Emoji = arma/estilo del brawler; superName = su Súper real (localizada)
const BRAWLERS = [
  // Especial
  B("Shelly", "ESPECIAL", "DESTRUCTOR", "#b44be0", "🐚", "Súper Shell"),
  B("Colt", "ESPECIAL", "TIRADOR", "#4b9be0", "🔫", "Ráfaga de Balas"),
  B("Bull", "ESPECIAL", "TANQUE", "#8b6a3a", "🐂", "Embestida"),
  B("Brock", "ESPECIAL", "TIRADOR", "#ff6b35", "🚀", "Lluvia de Cohetes"),
  B("El Primo", "ESPECIAL", "TANQUE", "#37c837", "💪", "Codazo Volador"),
  B("Poco", "ESPECIAL", "APOYO", "#2fbfa0", "🎸", "Bis"),
  B("Rosa", "ESPECIAL", "TANQUE", "#ff4fa0", "🌺", "Plantón"),
  B("Barley", "ESPECIAL", "CONTROLADOR", "#e0b84b", "🍾", "Última Ronda"),
  // Superespecial
  B("Nita", "SUPERESPECIAL", "DESTRUCTOR", "#e0644b", "🐻", "Oso Bruce"),
  B("Jessie", "SUPERESPECIAL", "CONTROLADOR", "#ff8a3d", "🎒", "Torreta Scrappy"),
  B("Dynamike", "SUPERESPECIAL", "CONTROLADOR", "#ff3d3d", "🧨", "Barril Explosivo"),
  B("Tick", "SUPERESPECIAL", "CONTROLADOR", "#7a8aff", "⏲️", "Cabezazo"),
  B("8-Bit", "SUPERESPECIAL", "TIRADOR", "#59d9ff", "🕹️", "Potenciador de Daño"),
  B("Rico", "SUPERESPECIAL", "TIRADOR", "#4be0c8", "🎱", "Superrebote"),
  B("Darryl", "SUPERESPECIAL", "TANQUE", "#a56a2e", "🛢️", "Rodillo Tonel"),
  B("Penny", "SUPERESPECIAL", "TIRADOR", "#ffb63d", "💰", "Cañón Lola"),
  B("Carl", "SUPERESPECIAL", "DESTRUCTOR", "#3db8ff", "⛏️", "Peonza"),
  B("Jacky", "SUPERESPECIAL", "TANQUE", "#ffaa3d", "🚧", "¡Topo a la Vista!"),
  // Épico
  B("Piper", "EPICO", "TIRADOR", "#ff7ab8", "☂️", "Se Acabó"),
  B("Pam", "EPICO", "APOYO", "#ffd03d", "🛠️", "Besito Sanador"),
  B("Frank", "EPICO", "TANQUE", "#3de08a", "🔨", "Golpe Aturdidor"),
  B("Bibi", "EPICO", "DESTRUCTOR", "#ff4b6e", "⚾", "Pompa Explosiva"),
  B("Bea", "EPICO", "TIRADOR", "#ffdd3d", "🐝", "Colmena de Hierro"),
  B("Nani", "EPICO", "TIRADOR", "#ff9e3d", "🛰️", "Dron Pip"),
  B("Edgar", "EPICO", "DESTRUCTOR", "#b03dff", "🧣", "Salto Mortal"),
  B("Griff", "EPICO", "TIRADOR", "#4bc96b", "💵", "Cerdito Hucha"),
  B("Grom", "EPICO", "CONTROLADOR", "#6e7aff", "💣", "Señal de Radio"),
  B("Fang", "EPICO", "DESTRUCTOR", "#ff5e3d", "👟", "Patada Voladora"),
  // Mítico
  B("Mortis", "MITICO", "DESTRUCTOR", "#6e3dff", "🦇", "Enjambre de Murciélagos"),
  B("Tara", "MITICO", "CONTROLADOR", "#b84bff", "🔮", "Portal de Gravedad"),
  B("Gene", "MITICO", "APOYO", "#4b6eff", "🧞", "Mano Mágica"),
  B("Max", "MITICO", "APOYO", "#ffe03d", "🥤", "¡Vamos!"),
  B("Byron", "MITICO", "APOYO", "#6bd44b", "🧪", "Tratamiento Completo"),
  B("Squeak", "MITICO", "CONTROLADOR", "#4bffd4", "🫧", "Superpegote"),
  B("Buzz", "MITICO", "DESTRUCTOR", "#ffcc3d", "🛟", "Torpedo Salvavidas"),
  B("Otis", "MITICO", "CONTROLADOR", "#ff4bd4", "🦑", "Silencio"),
  B("Cordelius", "MITICO", "DESTRUCTOR", "#8a4bff", "🍄", "Reino de las Sombras"),
  B("Surge", "MITICO", "DESTRUCTOR", "#3de0ff", "⚡", "Sobrecarga"),
  B("Melody", "MITICO", "DESTRUCTOR", "#ff6bd4", "🎤", "Interludio"),
  // Legendario
  B("Spike", "LEGENDARIO", "CONTROLADOR", "#6be04b", "🌵", "¡Ahí Quieto!"),
  B("Crow", "LEGENDARIO", "CONTROLADOR", "#7a5cff", "🗡️", "Picado"),
  B("Leon", "LEGENDARIO", "DESTRUCTOR", "#4be06b", "🍃", "Bomba de Humo"),
  B("Sandy", "LEGENDARIO", "CONTROLADOR", "#d9b96b", "🌪️", "Tormenta de Arena"),
  B("Amber", "LEGENDARIO", "CONTROLADOR", "#ff8a3d", "🔥", "Fogonazo"),
  B("Meg", "LEGENDARIO", "TIRADOR", "#ff3d8a", "🦾", "Mecameg"),
  B("Chester", "LEGENDARIO", "DESTRUCTOR", "#ff4b4b", "🃏", "¡Campanazo!"),
  B("Kit", "LEGENDARIO", "APOYO", "#ffb84b", "🐱", "Achuchón"),
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
    emoji: brawler.emoji, superName: brawler.superName,
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
    emoji: tpl.emoji, role: tpl.role || "BOT", rarity: null, side: "enemy", slot,
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
    role: b.role, clone: true, range: role.range, interval: role.interval,
    hp: role.hp * 0.85 * scale, atk: role.atk * 0.9 * scale,
  };
}

// Genera las 3 olas: robots de Brawl Stars mezclados al azar con clones oscuros
function generateWaves(squadNames) {
  const scrappy = () => ({
    name: "Scrappy Bot", initials: "SB", color: "#9ba7c9", role: "BOT", emoji: "🤖",
    range: "melee", interval: 1350, hp: 3200, atk: 195,
  });
  const shooter = () => ({
    name: "Robot Tirador", initials: "RT", color: "#6bd0ff", role: "BOT", emoji: "🎯",
    range: "ranged", interval: 1250, hp: 2800, atk: 275,
  });
  const boxer = () => ({
    name: "Robot Boxeador", initials: "RB", color: "#ff8a5c", role: "BOT", emoji: "🥊",
    range: "melee", interval: 1600, hp: 6200, atk: 330,
  });
  const boss = () => ({
    name: "MECHA BOSS", initials: "MB", color: "#ff4b5c", role: "BOSS", emoji: "👾",
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
                    <span className="dex-avatar"><i>{b.emoji}</i></span>
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
                {b.emoji}
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
      addFx(g, { type: "shot", x: a.x, y: a.y - 4, x2: b.x, y2: b.y - 4, color: u.color, ttl: 320 });
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
      sub: u.superName || role.superName, emoji: u.emoji, color: u.color, until: g.t + 1250,
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
            {g.banner.emoji && <span className="banner-emoji">{g.banner.emoji}</span>}
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
];

function MineDecor({ wave }) {
  return (
    <div className="decor" style={{ transform: `translateX(${-(wave - 1) * 12}%)` }} aria-hidden="true">
      <div className="rails" />
      {DECOR.map((d, i) => (
        <span key={i} className={"deco " + d.t}
          style={{ left: d.x + "%", top: d.y + "%", "--s": d.s || 1, animationDelay: (d.d || 0) + "s" }} />
      ))}
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
      <div className="unit-hp">
        <i style={{ width: Math.max(0, (u.hp / u.maxHp) * 100) + "%" }} />
      </div>
      <div className="unit-body">
        <span className="unit-emoji">{u.emoji || "🤖"}</span>
        {stunned && <span className="stun-stars" aria-hidden="true">✦ ✦ ✦</span>}
      </div>
      <span className="unit-name">{u.name}</span>
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
            <span key={f.id} className={f.type === "shot" ? "fx-shot" : "fx-bigshot"}
              style={{ "--x0": f.x + "%", "--y0": f.y + "%", "--x1": f.x2 + "%", "--y1": f.y2 + "%", "--c": f.color }} />
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
        <i>{u.emoji}</i>
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
