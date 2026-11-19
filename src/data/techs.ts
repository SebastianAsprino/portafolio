// Catálogo único de tecnologías: de acá salen los filtros de /tecnologias, los
// íconos de las cards y los badges del detalle de cada proyecto.
//
// Los `stack` de portfolio.json usan nombres libres ("React 18", "Django 5.1"):
// cada uno tiene que caer en exactamente una tecnología, por su `label` o por
// uno de sus `aliases`. Si un proyecto usa un nombre que no está acá, el build
// falla (ver resolveTech) para que no quede un filtro que no matchea nada.
//
// `icon` dice de dónde baja el ícono scripts/stack-icons.ts; el sitio solo usa
// el archivo resultante en /public/stack-icons (ver iconPath).

export type TechCategory =
	| "lenguajes"
	| "frontend"
	| "backend"
	| "datos"
	| "infra"
	| "aws"
	| "herramientas"
	| "otros";

export type IconSource =
	/** Paquete tech-stack-icons, variante para fondo oscuro. */
	| { lib: string }
	/** Imagen raster (png/ico) del sitio oficial; se normaliza a PNG 64×64. */
	| { raster: string }
	/** SVG del sitio oficial o de simple-icons; `fill` para los monocromo. */
	| { svg: string; fill?: string }
	/** Paquete oficial AWS Architecture Icons: ruta del SVG dentro del zip. */
	| { aws: string }
	/** Dibujado a mano para conceptos sin logo (p. ej. REST). */
	| { inline: string };

export interface Tech {
	id: string;
	label: string;
	category: TechCategory;
	aliases?: string[];
	icon: IconSource;
}

export const CATEGORIES: { id: TechCategory; label: string }[] = [
	{ id: "lenguajes", label: "Lenguajes" },
	{ id: "frontend", label: "Frontend" },
	{ id: "backend", label: "Backend" },
	{ id: "datos", label: "Datos" },
	{ id: "infra", label: "Infra y deploy" },
	{ id: "aws", label: "AWS" },
	{ id: "herramientas", label: "Herramientas" },
	{ id: "otros", label: "Geo y multimedia" },
];

// Isotipo de Fiber: las tres líneas de su logo oficial (gofiber/docs,
// static/img/logo-dark.svg) sin el wordmark, que a 20px no se lee.
const FIBER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 57 200 200" fill="#00acd7"><path d="m213.77 115.41h-134.51l-10.76 15.27 142.78-.08z"/><path d="m209.02 147.06h-174.07l-11.07 15.21 182.65-.13z"/><path d="m204.27 178.7h-74.37l-10 15.27 81.88-.06z"/></svg>`;

// Shapely no tiene logo: un polígono en pixel art.
const SHAPELY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3 4 11 2.5 13.5 9.5 7 13.5 2.5 10z" fill="#82c8ff" fill-opacity=".2" stroke="#82c8ff" stroke-width="1.2" stroke-linejoin="round"/><g fill="#c8e8f8" shape-rendering="crispEdges"><path d="M2 3h2v2H2zM10 1.5h2v2h-2zM12.5 8.5h2v2h-2zM6 12.5h2v2H6zM1.5 9h2v2h-2z"/></g></svg>`;

// Llaves { } en pixel art, con el celeste del sitio.
const REST_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges" fill="#82c8ff"><path d="M4 2h2v1H5v4H4v1H3v1h1v1h1v4h1v1H4v-1H3v-3H2V8H1V7h1V6h1V3h1zM10 2h2v1h1v3h1v1h1v1h-1v1h-1v3h-1v1h-2v-1h1v-4h1V8h1V7h-1V6h-1V3h-1z"/></svg>`;

const AWS_ZIP_ROOT = "Architecture-Service-Icons_07312026";

export const TECHS: Tech[] = [
	// Lenguajes
	{ id: "typescript", label: "TypeScript", category: "lenguajes", icon: { lib: "typescript" } },
	{ id: "python", label: "Python", category: "lenguajes", icon: { lib: "python" } },
	{ id: "go", label: "Go", category: "lenguajes", icon: { lib: "go" } },

	// Frontend
	{ id: "react", label: "React", category: "frontend", aliases: ["React 18"], icon: { lib: "react" } },
	{
		id: "nextjs",
		label: "Next.js",
		category: "frontend",
		aliases: ["Next.js 16"],
		icon: { raster: "https://nextjs.org/favicon.ico" },
	},
	{ id: "astro", label: "Astro", category: "frontend", icon: { lib: "astro" } },
	{
		id: "svelte",
		label: "Svelte / SvelteKit",
		category: "frontend",
		aliases: ["Svelte", "Svelte 5", "SvelteKit"],
		icon: { lib: "sveltejs" },
	},
	{ id: "tailwind", label: "Tailwind CSS", category: "frontend", icon: { lib: "tailwindcss" } },
	{
		id: "daisyui",
		label: "DaisyUI",
		category: "frontend",
		icon: { svg: "https://img.daisyui.com/images/daisyui/mark.svg" },
	},
	{ id: "zustand", label: "Zustand", category: "frontend", icon: { lib: "zustand" } },
	{ id: "canvas", label: "Canvas API", category: "frontend", icon: { lib: "html5" } },

	// Backend
	{ id: "nodejs", label: "Node.js", category: "backend", icon: { lib: "nodejs" } },
	{ id: "bun", label: "Bun", category: "backend", icon: { lib: "bunjs" } },
	{
		id: "elysia",
		label: "Elysia",
		category: "backend",
		icon: { raster: "https://elysiajs.com/assets/elysia.png" },
	},
	{ id: "hono", label: "Hono", category: "backend", icon: { lib: "hono" } },
	{
		id: "django",
		label: "Django",
		category: "backend",
		aliases: ["Django 5.1", "Django REST Framework"],
		icon: { lib: "django" },
	},
	{
		id: "fiber",
		label: "Fiber",
		category: "backend",
		aliases: ["Fiber v2"],
		icon: { inline: FIBER_ICON },
	},
	{ id: "rest", label: "REST API", category: "backend", icon: { inline: REST_ICON } },
	{ id: "jwt", label: "JWT", category: "backend", icon: { raster: "https://jwt.io/icon/192" } },
	{
		id: "authjs",
		label: "Auth.js",
		category: "backend",
		aliases: ["NextAuth.js"],
		icon: { raster: "https://authjs.dev/favicon-32x32.png" },
	},

	// Datos
	{ id: "postgresql", label: "PostgreSQL", category: "datos", icon: { lib: "postgresql" } },
	{
		id: "sqlite",
		label: "SQLite / LibSQL",
		category: "datos",
		aliases: ["SQLite", "LibSQL / Turso"],
		icon: { lib: "sqlite" },
	},
	{ id: "drizzle", label: "Drizzle ORM", category: "datos", icon: { lib: "drizzle" } },
	{ id: "surrealdb", label: "SurrealDB", category: "datos", icon: { lib: "surrealdb" } },
	{
		id: "minio",
		label: "MinIO",
		category: "datos",
		icon: {
			raster:
				"https://cdn.prod.website-files.com/681c8426519d8db8f867c1e8/681c8426519d8db8f867c1f2_favicon-32x32.png",
		},
	},

	// Infra y deploy
	{
		id: "docker",
		label: "Docker",
		category: "infra",
		aliases: ["Docker Compose"],
		icon: { lib: "docker" },
	},
	{ id: "cf-pages", label: "Cloudflare Pages", category: "infra", icon: { lib: "cloudflare" } },
	{
		id: "cf-workers",
		label: "Cloudflare Workers",
		category: "infra",
		icon: { raster: "https://workers.cloudflare.com/favicon.ico" },
	},
	{ id: "cf-kv", label: "Cloudflare KV", category: "infra", icon: { lib: "cloudflare" } },
	{
		id: "github-actions",
		label: "GitHub Actions",
		category: "infra",
		// github.com/features/actions solo expone el octocat como favicon.
		icon: {
			svg: "https://cdn.jsdelivr.net/npm/simple-icons@15.0.0/icons/githubactions.svg",
			fill: "#2088FF",
		},
	},

	{ id: "terraform", label: "Terraform", category: "infra", icon: { lib: "terraform" } },
	{
		id: "bitbucket-pipelines",
		label: "Bitbucket Pipelines",
		category: "infra",
		icon: { lib: "bitbucket" },
	},
	{ id: "dokploy", label: "Dokploy", category: "infra", icon: { svg: "https://dokploy.com/icon.svg" } },

	// AWS
	{
		id: "aws-lambda",
		label: "AWS Lambda",
		category: "aws",
		icon: { aws: `${AWS_ZIP_ROOT}/Arch_Compute/64/Arch_AWS-Lambda_64.svg` },
	},
	{
		id: "dynamodb",
		label: "Amazon DynamoDB",
		category: "aws",
		icon: { aws: `${AWS_ZIP_ROOT}/Arch_Databases/64/Arch_Amazon-DynamoDB_64.svg` },
	},
	{
		id: "s3",
		label: "Amazon S3",
		category: "aws",
		icon: { aws: `${AWS_ZIP_ROOT}/Arch_Storage/64/Arch_Amazon-Simple-Storage-Service_64.svg` },
	},
	{
		id: "sqs",
		label: "Amazon SQS",
		category: "aws",
		icon: { aws: `${AWS_ZIP_ROOT}/Arch_Application-Integration/64/Arch_Amazon-Simple-Queue-Service_64.svg` },
	},
	{
		id: "ses",
		label: "Amazon SES",
		category: "aws",
		icon: { aws: `${AWS_ZIP_ROOT}/Arch_Business-Applications/64/Arch_Amazon-Simple-Email-Service_64.svg` },
	},
	{
		id: "cognito",
		label: "Amazon Cognito",
		category: "aws",
		icon: { aws: `${AWS_ZIP_ROOT}/Arch_Security-Identity/64/Arch_Amazon-Cognito_64.svg` },
	},
	{
		id: "amplify",
		label: "AWS Amplify",
		category: "aws",
		icon: { aws: `${AWS_ZIP_ROOT}/Arch_Front-End-Web-Mobile/64/Arch_AWS-Amplify_64.svg` },
	},

	// Herramientas
	{
		id: "pnpm",
		label: "pnpm",
		category: "herramientas",
		aliases: ["pnpm workspaces"],
		icon: { lib: "pnpm" },
	},
	{ id: "vite", label: "Vite", category: "herramientas", icon: { lib: "vitejs" } },
	{ id: "vitest", label: "Vitest", category: "herramientas", icon: { lib: "vitest" } },
	{ id: "playwright", label: "Playwright", category: "herramientas", icon: { lib: "playwright" } },
	{
		id: "testing-library",
		label: "Testing Library",
		category: "herramientas",
		icon: { raster: "https://testing-library.com/img/octopus-128x128.png" },
	},
	{ id: "zod", label: "Zod", category: "herramientas", icon: { lib: "zod" } },
	{ id: "swagger", label: "Swagger", category: "herramientas", icon: { lib: "swagger" } },
	{ id: "scalar", label: "Scalar", category: "herramientas", icon: { svg: "https://scalar.com/favicon.svg", fill: "#e8e8e8" } },
	{
		id: "stripe",
		label: "Stripe",
		category: "herramientas",
		icon: {
			svg: "https://images.stripeassets.com/fzn2n1nzq965/1hgcBNd12BfT9VLgbId7By/01d91920114b124fb4cf6d448f9f06eb/favicon.svg",
		},
	},
	{ id: "algolia", label: "Algolia", category: "herramientas", icon: { lib: "algolia" } },
	{
		id: "resend",
		label: "Resend",
		category: "herramientas",
		icon: { raster: "https://resend.com/static/favicons/favicon-marketing.ico" },
	},
	{ id: "sentry", label: "Sentry", category: "herramientas", icon: { lib: "sentry" } },

	// Geo y multimedia
	{ id: "gdal", label: "GDAL", category: "otros", icon: { raster: "https://gdal.org/_static/favicon.png" } },
	{
		id: "geopandas",
		label: "GeoPandas",
		category: "otros",
		icon: { raster: "https://geopandas.org/_static/favicon.png" },
	},
	{
		id: "shapely",
		label: "Shapely",
		category: "otros",
		icon: { inline: SHAPELY_ICON },
	},
	{
		id: "leaflet",
		label: "Leaflet",
		category: "otros",
		icon: { svg: "https://leafletjs.com/docs/images/favicon.svg" },
	},
	{ id: "ffmpeg", label: "FFmpeg", category: "otros", icon: { raster: "https://ffmpeg.org/favicon.ico" } },
];

/** Ruta pública del ícono generado por scripts/stack-icons.ts. */
export function iconPath(tech: Tech): string {
	const ext = "raster" in tech.icon ? "png" : "svg";
	return `/stack-icons/${tech.id}.${ext}`;
}

const BY_NAME = new Map<string, Tech>();
for (const tech of TECHS) {
	for (const name of [tech.label, ...(tech.aliases ?? [])]) {
		const key = name.toLowerCase();
		const prev = BY_NAME.get(key);
		if (prev) throw new Error(`"${name}" está en ${prev.id} y en ${tech.id}`);
		BY_NAME.set(key, tech);
	}
}

/** Tecnología del catálogo para un nombre de `stack`. Falla si no existe. */
export function resolveTech(name: string): Tech {
	const tech = BY_NAME.get(name.toLowerCase());
	if (!tech) {
		throw new Error(
			`"${name}" no está en src/data/techs.ts: agregalo como tecnología o como alias.`,
		);
	}
	return tech;
}
