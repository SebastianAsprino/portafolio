# Portafolio — asprino.dev

Portafolio personal de Sebastian Asprino, Fullstack Software Engineer. Sitio estático con los proyectos,
el stack técnico y los datos de contacto, sobre un fondo de océano en pixel art animado en `<canvas>`.
Los visitantes pueden dibujar su propio pez, que aparece nadando en el océano después de una
moderación por correo.

Producción: <https://asprino.dev>

## Características

- **Proyectos** (`/` y `/proyectos/[slug]`): tarjetas con preview en imagen/video y una página de
  detalle por proyecto, generadas desde `src/data/portfolio.json`.
- **Tecnologías** (`/tecnologias`): filtro de proyectos por tecnología, agrupado por categoría y con
  cuántos proyectos usan cada una. Sale del catálogo `src/data/techs.ts`.
- **Contacto** (`/contacto`).
- **Océano interactivo** (`OceanBackground.svelte`): degradado por profundidad con dithering Bayer,
  rayos de luz, partículas y peces que huyen al hacer clic; bucle con paso de tiempo fijo.
- **Crea tu pez** (`/crear-pez`) y **galería** (`/peces`): editor de pixel art con paleta de 32 colores
  que envía el sprite a un Cloudflare Worker; el pez queda pendiente hasta aprobarlo desde un correo.
- **Seguridad**: cabeceras CSP sin `unsafe-inline` para scripts (los hashes de los scripts inline se
  calculan al final del build), HSTS, `frame-ancestors 'none'`, COOP/CORP/COEP y `security.txt`.
- SEO: Open Graph, Twitter cards y `robots.txt`.

## Stack

| Parte    | Tecnologías                                                                                   |
| -------- | --------------------------------------------------------------------------------------------- |
| Sitio    | [Astro 7](https://astro.build) (estático, `ClientRouter`), [Svelte 5](https://svelte.dev), TypeScript |
| Íconos   | `tech-stack-icons` y favicons oficiales, bajados a `public/stack-icons/` con `bun run stack-icons` |
| Fuentes  | Pixelify Sans (títulos) y VT323 (texto), servidas desde el sitio con Fontsource               |
| API      | Cloudflare Workers + [Elysia](https://elysiajs.com), Workers KV, Rate Limiting binding        |
| Correo   | [Resend](https://resend.com) para los avisos de moderación                                    |
| Tooling  | [Bun](https://bun.sh), `sharp` y `ffmpeg` para optimizar medios                               |

## Arquitectura

```text
.
├── src/
│   ├── pages/            # rutas: index, proyectos/[slug], tecnologias, contacto, crear-pez, peces
│   ├── layouts/          # BaseLayout (meta, analítica, ClientRouter) y BentoLayout
│   ├── components/       # islas Svelte: OceanBackground, FishCreate, FishGallery, ProjectCard, ...
│   ├── data/             # portfolio.json (proyectos), cv.json (resumen) y techs.ts (catálogo de tecnologías)
│   ├── lib/
│   │   ├── fish.ts        # paleta, sprites por defecto, cliente de la API de peces
│   │   └── stack.ts       # nombre en `stack` → ícono, e índice de filtros de /tecnologias
│   └── integrations/
│       └── csp-headers.mjs # hook astro:build:done que escribe los hashes CSP en dist/_headers
├── public/               # estáticos: _headers, security.txt, robots.txt, imágenes y videos de proyectos
├── scripts/              # optimización de medios y stack-icons.ts (baja los íconos del catálogo)
└── worker/               # API de peces (Cloudflare Worker)
    └── src/
        ├── features/
        │   ├── fish/        # create (validación, cola, correo) y list (paginado)
        │   └── moderation/  # confirm (GET, página de confirmación) y resolve (POST, aprobar/rechazar)
        └── shared/          # tipos, claves KV, HMAC, escape de HTML
```

### Flujo de un pez

1. `FishCreate.svelte` envía `POST /fish` con el sprite, nombre y URL.
2. El worker limita a 3 envíos por minuto por IP, valida el cuerpo (tamaño del sprite, colores,
   solo URLs `http(s)`), rechaza sprites duplicados durante 24 h y guarda el pez en la cola
   `pending:` de KV (expira en 7 días, máximo 20 pendientes).
3. Se envía un correo con links firmados con HMAC-SHA256. El `GET` solo muestra una confirmación (los
   escáneres de correo abren los links); la acción real es un `POST`.
4. Al aprobar, el pez pasa a `fish:` y aparece en `GET /fish`, que consumen la galería y el océano.

## Desarrollo

Requiere [Bun](https://bun.sh).

```sh
bun install
bun run dev          # http://localhost:4321
bun run typecheck    # tsc --noEmit
bun run build        # sitio estático en dist/ (+ hashes CSP en dist/_headers)
bun run preview
```

Por defecto el sitio usa la API de producción. Para apuntar a un worker local, copia `.env.example` a
`.env` y define `PUBLIC_FISH_API_URL=http://localhost:8787` (también hay que permitir ese origen en
`connect-src` de `public/_headers` si se prueba con la CSP activa).

### Worker

```sh
cd worker
bun install
cp .dev.vars.example .dev.vars   # completar RESEND_API_KEY y MODERATION_SECRET
bun run dev                      # wrangler dev en http://localhost:8787
bun run typecheck
```

### Medios

Coloca imágenes o videos en `scripts/` y ejecuta:

```sh
bun run convert:webp            # imágenes → .webp 1280x720 (sharp)
bun run scripts/convert-webm.ts # videos → .webm 1280x720 (requiere ffmpeg/ffprobe)
```

Ambos aceptan `--delete` para borrar el original.

### Tecnologías

Cada nombre que aparece en el `stack` de un proyecto tiene que estar en `src/data/techs.ts`, como
`label` o en `aliases` de una tecnología; si no, el build falla. Para agregar una, se suma al catálogo
con su categoría y de dónde sale el ícono (`lib` de `tech-stack-icons`, `raster`/`svg` del sitio
oficial, `aws` del paquete de Architecture Icons o `inline`) y se corre:

```sh
bun run stack-icons           # baja solo los íconos que faltan a public/stack-icons/
bun run stack-icons --force   # los regenera todos (requiere ImageMagick para los .ico/.png)
```

## Despliegue

- **Sitio**: `bun run build` y publicar `dist/` en Cloudflare (Pages o Workers con assets estáticos);
  `dist/_headers` aplica las cabeceras de seguridad.
- **Worker**: `cd worker && bun run deploy`. Los secretos se cargan una sola vez con
  `wrangler secret put RESEND_API_KEY` y `wrangler secret put MODERATION_SECRET`; el resto de la
  configuración (KV, rate limiter, remitente) está en `worker/wrangler.toml`.

## Integración continua

`.github/workflows/ci.yml` corre en cada push a `main` y en cada pull request: typecheck y build del
sitio, y typecheck del worker.
