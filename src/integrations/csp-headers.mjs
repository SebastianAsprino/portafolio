import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PLACEHOLDER = "{{CSP_SCRIPT_HASHES}}";
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

// Astro mete scripts inline en el HTML (hidratación de islands) que cambian
// entre versiones. En vez de permitir 'unsafe-inline', se calculan sus hashes
// después del build y se escriben en dist/_headers.
// Es una sola política para todo el sitio porque con el ClientRouter el
// documento no se recarga: rige la CSP de la primera página visitada.
export default function cspHeaders() {
	return {
		name: "csp-headers",
		hooks: {
			"astro:build:done": async ({ dir, logger }) => {
				const root = fileURLToPath(dir);
				const files = (await readdir(root, { recursive: true })).filter((f) =>
					f.endsWith(".html"),
				);

				const hashes = new Set();
				for (const file of files) {
					const html = await readFile(join(root, file), "utf8");
					for (const [, body] of html.matchAll(INLINE_SCRIPT)) {
						if (!body.trim()) continue;
						const digest = createHash("sha256").update(body).digest("base64");
						hashes.add(`'sha256-${digest}'`);
					}
				}

				const headersPath = join(root, "_headers");
				const headers = await readFile(headersPath, "utf8");
				if (!headers.includes(PLACEHOLDER)) {
					throw new Error(`${headersPath} no contiene ${PLACEHOLDER}`);
				}
				await writeFile(
					headersPath,
					headers.replaceAll(PLACEHOLDER, [...hashes].join(" ")),
				);
				logger.info(`CSP: ${hashes.size} hashes de scripts inline en _headers`);
			},
		},
	};
}
