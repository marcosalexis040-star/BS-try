# BS-try

Proyecto de videojuego. Este repositorio incluye una herramienta integrada para
**generar imágenes, videos y animaciones con IA** que puedes usar para producir
assets del juego (fondos, sprites, cinemáticas, animaciones, lip-sync, etc.).

## 🎬 Generación de video y animaciones — `open-generative-ai/`

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
