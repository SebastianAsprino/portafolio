#!/usr/bin/env bun
// Genera public/stack-icons/ a partir de src/data/techs.ts.
//
//   bun run stack-icons            baja solo los íconos que faltan
//   bun run stack-icons --force    los regenera todos
//
// Los rasters (png/ico) se normalizan a PNG 64×64 con ImageMagick (`magick`
// tiene que estar instalado; sharp no lee .ico). Los resultados se commitean:
// el build del sitio no baja nada.
import { $ } from "bun";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TECHS, iconPath, type Tech } from "../src/data/techs";

const ROOT = join(import.meta.dir, "..");
const OUT_DIR = join(ROOT, "public");
const CACHE = join(tmpdir(), "portafolio-stack-icons");
const AWS_ICONS_ZIP =
	"https://d1.awsstatic.com/onedam/marketing-channels/website/public/shared/architecture-icon-release/Icon-package_07312026.5846e92413caa21490223536cc97f1269e44fa92.zip";
const UA = "Mozilla/5.0 (compatible; portafolio-stack-icons)";

const force = process.argv.includes("--force");

type LibCatalog = Record<string, { svg: Record<"light" | "dark", string> }>;
const libCatalog: LibCatalog = JSON.parse(
	readFileSync(join(ROOT, "node_modules/tech-stack-icons/catalog.json"), "utf8"),
);

async function download(url: string): Promise<Buffer> {
	const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
	if (!res.ok) throw new Error(`${res.status} ${url}`);
	return Buffer.from(await res.arrayBuffer());
}

/** El SVG se carga con <img>: necesita xmlns y no le sirven width/height fijos. */
function normalizeSvg(svg: string, fill?: string): string {
	let out = svg.trim();
	if (!out.includes('xmlns="http://www.w3.org/2000/svg"')) {
		out = out.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
	}
	if (fill) out = out.replace("<svg", `<svg fill="${fill}"`);
	return out + "\n";
}

async function rasterToPng(buf: Buffer, dest: string): Promise<void> {
	mkdirSync(CACHE, { recursive: true });
	// La firma del .ico es débil: sin extensión, magick no siempre lo reconoce.
	const isIco = buf.subarray(0, 4).equals(Buffer.from([0, 0, 1, 0]));
	const src = join(CACHE, isIco ? "input.ico" : "input");
	writeFileSync(src, buf);
	// En un .ico, el frame más grande.
	const frames = (await $`magick identify -format "%w\n" ${src}`.text()).trim().split("\n");
	let best = 0;
	frames.forEach((w, i) => {
		if (Number(w) > Number(frames[best])) best = i;
	});
	await $`magick ${src}[${best}] -background none -resize 64x64 -gravity center -extent 64x64 PNG32:${dest}`;
}

async function awsSvg(path: string): Promise<string> {
	const zip = join(CACHE, "aws-icons.zip");
	if (!existsSync(zip)) {
		mkdirSync(CACHE, { recursive: true });
		console.log("  bajando paquete AWS Architecture Icons…");
		writeFileSync(zip, await download(AWS_ICONS_ZIP));
	}
	return $`unzip -p ${zip} ${path}`.text();
}

async function build(tech: Tech, dest: string): Promise<void> {
	const src = tech.icon;
	if ("lib" in src) {
		const entry = libCatalog[src.lib];
		if (!entry) throw new Error(`tech-stack-icons no tiene "${src.lib}"`);
		writeFileSync(dest, normalizeSvg(entry.svg.dark ?? entry.svg.light));
	} else if ("raster" in src) {
		await rasterToPng(await download(src.raster), dest);
	} else if ("svg" in src) {
		writeFileSync(dest, normalizeSvg((await download(src.svg)).toString("utf8"), src.fill));
	} else if ("aws" in src) {
		writeFileSync(dest, normalizeSvg(await awsSvg(src.aws)));
	} else {
		writeFileSync(dest, normalizeSvg(src.inline));
	}
}

mkdirSync(join(OUT_DIR, "stack-icons"), { recursive: true });
let failed = 0;
for (const tech of TECHS) {
	const dest = join(OUT_DIR, iconPath(tech));
	if (!force && existsSync(dest)) continue;
	try {
		await build(tech, dest);
		console.log(`✓ ${tech.id}`);
	} catch (err) {
		failed++;
		console.error(`✗ ${tech.id}: ${err instanceof Error ? err.message : err}`);
	}
}
if (failed) process.exit(1);
