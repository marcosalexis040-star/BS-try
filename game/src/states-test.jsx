// Banco de pruebas: renderiza a Shelly en sus 7 estados de animación
import React from "react";
import { createRoot } from "react-dom/client";
import { ShellySprite } from "./app.jsx";

const T = 100000; // "ahora" arbitrario
const base = {
  name: "Shelly", alive: true, side: "ally", rarity: "ESPECIAL", color: "#b44be0",
  hp: 4200, maxHp: 5600, lastAttack: -1e9, lastHit: -1e9, lastSuper: -1e9,
};
const STATES = [
  ["IDLE", { ...base }, { walking: false, won: false }],
  ["MOVING", { ...base }, { walking: true, won: false }],
  ["BASIC ATTACK", { ...base, lastAttack: T - 80 }, { walking: false, won: false }],
  ["SUPER ATTACK", { ...base, lastSuper: T - 200 }, { walking: false, won: false }],
  ["HIT / HURT", { ...base, lastHit: T - 60 }, { walking: false, won: false }],
  ["DOWNED (KO)", { ...base, alive: false }, { walking: false, won: false }],
  ["VICTORY", { ...base }, { walking: false, won: true }],
];

function Cell({ label, u, opts }) {
  return (
    <div className="cell">
      <div className="unit ally fullbody" style={{ "--glow": "#56e05a" }}>
        <div className="unit-body">
          <ShellySprite u={u} t={T} won={opts.won} walking={opts.walking} size={120} />
        </div>
      </div>
      <span className="lbl">{label}</span>
    </div>
  );
}

createRoot(document.getElementById("test-root")).render(
  <div className="grid">
    {STATES.map(([label, u, opts]) => <Cell key={label} label={label} u={u} opts={opts} />)}
  </div>
);
