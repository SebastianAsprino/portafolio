import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import StackIcon from "tech-stack-icons";
import type { IconName } from "tech-stack-icons";

const ICON_MAP: Record<string, string | null> = {
  typescript: "typescript",
  javascript: "js",
  react: "react",
  "react 18": "react",
  "next.js": "nextjs",
  "next.js 16": "nextjs",
  astro: "astro",
  "astro 5": "astro",
  sveltekit: "sveltejs",
  svelte: "sveltejs",
  "tailwind css": "tailwindcss",
  "framer motion": "framer",
  "radix ui": "radixui",
  "node.js": "nodejs",
  hono: "hono",
  elysia: null,
  bun: "bunjs",
  "elysia / bun": "bunjs",
  django: "django",
  "django rest framework": "django",
  "django 5.1": "django",
  go: "go",
  "go / fiber": "go",
  "fiber v2": "go",
  python: "python",
  rust: "rust",
  postgresql: "postgresql",
  "amazon dynamodb": "aws",
  sqlite: "sqlite",
  "sqlite / libsql": "sqlite",
  "libsql / turso": "sqlite",
  "drizzle orm": "drizzle",
  sequelize: "sequelize",
  "aws lambda": "aws",
  docker: "docker",
  "docker compose": "docker",
  "cloudflare pages": "cloudflare",
  "cloudflare workers": "cloudflare",
  cloudflare: "cloudflare",
  "cloudflare kv": "cloudflare",
  "github actions": "github",
  "pnpm / monorepo": "pnpm",
  "pnpm workspaces": "pnpm",
  pnpm: "pnpm",
  vite: "vitejs",
  vitest: "vitest",
  zod: "zod",
  stripe: "stripe",
  algolia: "algolia",
  sentry: "sentry",
  webassembly: "webassembly",
  turbopack: null,
  "nextauth.js": null,
  zustand: "zustand",
  "tanstack react query": "reactquery",
  "react router v6": "reactrouter",
  mysql: "mysql",
  "canvas api": null,
  "rest api": null,
  jwt: null,
  "gdal / geopandas": "python",
};

export function getIconName(tech: string): string | null {
  return ICON_MAP[tech.toLowerCase()] ?? null;
}

export function getIconSvg(
  tech: string,
  variant: "light" | "dark" | "grayscale" = "light"
): string | null {
  const name = getIconName(tech);
  if (!name) return null;
  try {
    return renderToStaticMarkup(
      createElement(StackIcon, { name: name as IconName, variant })
    );
  } catch {
    return null;
  }
}

export function buildIconMap(
  techs: string[],
  variant: "light" | "dark" | "grayscale" = "light"
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const tech of techs) {
    const svg = getIconSvg(tech, variant);
    if (svg) map[tech] = svg;
  }
  return map;
}
