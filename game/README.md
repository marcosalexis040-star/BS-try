# Brawl Stars: Squad Battler

Prototipo jugable estilo *Disney Heroes: Battle Mode* ambientado en el universo de
Brawl Stars. Todo el juego vive en un único componente de React y se compila a un
solo archivo HTML autocontenido (React, Lucide, Tailwind y la fuente Lilita One
quedan embebidos — sin CDNs).

## Cómo jugar

1. **Brawler Dex**: elige 5 de los 47 brawlers, agrupados por rareza
   (Especial → Legendario). Cada rol define sus estadísticas y su Súper:
   - **Tanque** — mucha vida; su Súper aturde al enemigo más cercano.
   - **Destructor** — daño cuerpo a cuerpo; Súper de daño masivo en área.
   - **Tirador** — daño a distancia; Súper de gran daño al enemigo más débil.
   - **Apoyo** — cura a todo el equipo con su Súper.
   - **Controlador** — su Súper envenena y ralentiza a todos los enemigos.
2. **Combate automático** en 3 olas (robots de práctica, tiradores/boxeadores y
   un Mecha Boss con clones oscuros aleatorios). Los ataques básicos cargan la
   barra amarilla de Súper; cuando brilla la tarjeta, haz clic para activarla.
3. **Victoria** con 3 estrellas y oro, botón de reintentar y velocidad x2.

## Desarrollo

```bash
cd game
npm install
node build.mjs        # genera dist/squad-battler.html
```

`build.mjs` empaqueta `src/app.jsx` con esbuild, compila `src/styles.css` con
Tailwind y embebe la fuente (`lilita-latin.b64`) en un único HTML listo para
publicarse como Artifact.
