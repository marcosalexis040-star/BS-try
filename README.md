# BS-try

Proyecto de videojuego. Este repositorio incluye un **mini-juego jugable** con el
personaje Shelly y una herramienta integrada para **generar imágenes, videos y
animaciones con IA** para producir assets del juego.

## 🎮 Shelly Arena — `game/`

Un shooter top-down jugable en HTML5 (sin dependencias). Controlas a **Shelly**,
una heroína con escopeta, en una arena contra oleadas de enemigos.

- **Controles:** moverse con `WASD` / flechas, apuntar con el ratón, disparar con
  clic o `espacio`.
- **Mecánicas:** escopeta con dispersión de perdigones, munición + recarga,
  enemigos que te persiguen (dos tipos), puntuación, barra de vida y game over.

### Cómo jugar

Solo necesitas servir la carpeta `game/` con cualquier servidor estático:

```bash
cd game
npx serve .        # o: python3 -m http.server 8000
# abre http://localhost:8000 (o el puerto que indique)
```

### Los sprites de Shelly

Los sprites son **pixel-art original** generados por código (sin dependencias
externas, con un codificador PNG propio). El generador está en
`game/tools/gen_sprites.js` y produce el spritesheet y los frames sueltos:

```bash
node game/tools/gen_sprites.js
```

| Archivo | Contenido |
| --- | --- |
| `game/assets/shelly.png` | Spritesheet 128×40 (4 frames: idle, walk1, walk2, shoot) |
| `game/assets/shelly_idle.png` … `shelly_shoot.png` | Frames individuales 32×40 |
| `game/assets/shelly_preview.png` | Vista previa ampliada 6× del spritesheet |
| `game/assets/screenshot_gameplay.png` | Captura del juego en marcha |

> Los sprites son un diseño propio (heroína de cabello rosa con escopeta), no arte
> oficial de ningún juego.

## 🎨 Roster ilustrado (estilo suave) — `game/assets/characters/`

Personajes en **estilo 2D suave / dibujo** (ilustración vectorial SVG con
degradados y sombreado, al estilo del difunto *Disney Heroes: Battle Mode*).
Son **diseños originales** inspirados en cada arquetipo, no arte oficial.

| Personaje | Archetipo | Archivos |
| --- | --- | --- |
| **Shelly** | Heroína con escopeta | `characters/shelly.svg` · `shelly.png` |
| **Colt** | Pistolero de dos revólveres | `characters/colt.svg` · `colt.png` |
| **Spike** | Cactus | `characters/spike.svg` · `spike.png` |

Los SVG son la fuente editable; los PNG (fondo transparente) se generan para el
juego. Para regenerarlos:

```bash
node game/tools/render_svg.js   # exporta characters/*.png + roster_preview.png
```

> **Dirección del juego (en progreso):** una versión inspirada en *Disney Heroes:
> Battle Mode* donde los enemigos son robots / sombras de los brawlers, creados
> por **Sirius**, el brawler #100 (personaje original del proyecto).

## 🎬 Generación de video y animaciones con IA — `open-generative-ai/`

En la carpeta [`open-generative-ai/`](./open-generative-ai) está integrada una
copia de [Open Generative AI](https://github.com/Anil-matcha/Open-Generative-AI)
(licencia MIT), un estudio open-source de generación de medios con IA:

- **Image Studio** — text-to-image e image-to-image (50+ / 55+ modelos: Flux,
  Nano Banana, Midjourney, Seedream…).
- **Video Studio** — text-to-video e image-to-video (Kling, Sora, Veo,
  Wan 2.2, Seedance…).
- **Lip Sync / Cinema / Workflows / Agents** — video hablado con audio,
  pipelines por nodos y agentes.

Está construido con Next.js 15 / React 18 y usa la API de
[Muapi.ai](https://muapi.ai) como motor de generación (también admite inferencia
local con sd.cpp para imágenes, sin API key).

> Los paquetes de workspace (`studio`, `workflow-builder`, `agents`,
> `design-agent`), que en el repo original son submódulos git, ya están
> **incluidos directamente** en esta copia, por lo que no necesitas inicializar
> submódulos.

### Requisitos

- [Node.js](https://nodejs.org/) v18 o superior.
- Una [access key de Muapi.ai](https://muapi.ai/access-keys) para generar por API
  (opcional si solo usarás modelos locales de imagen).

### Cómo ejecutarlo

```bash
cd open-generative-ai

# Instalar dependencias y construir los paquetes de workspace (requerido)
npm install
npm run build:packages

# Iniciar UNO de los dos entornos:
npm run dev            # Versión web (Next.js) → http://localhost:3000
npm run electron:dev   # App de escritorio (Electron + Vite)
```

En el primer uso se te pedirá tu API key de Muapi (se guarda solo en el
`localStorage` del navegador; nunca se envía a otro servidor que no sea Muapi).

Consulta el [README completo](./open-generative-ai/README.md) y
[`project_knowledge.md`](./open-generative-ai/project_knowledge.md) del subproyecto
para más detalles de arquitectura, modelos disponibles y compilación de apps de
escritorio.
