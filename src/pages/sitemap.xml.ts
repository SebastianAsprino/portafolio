// Sitemap con las URLs canónicas (con barra final, igual que los canonical).
// Sin <lastmod>: Google lo ignora si no refleja cambios reales del contenido.
import type { APIRoute } from "astro";
import portfolio from "../data/portfolio.json";

const PATHS = [
	"/",
	"/tecnologias/",
	"/contacto/",
	...portfolio.projects.map((p) => `/proyectos/${p.slug}/`),
	"/peces/",
	"/crear-pez/",
];

export const GET: APIRoute = ({ site }) => {
	const urls = PATHS.map(
		(path) => `\t<url><loc>${new URL(path, site).href}</loc></url>`,
	).join("\n");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(xml, {
		headers: { "Content-Type": "application/xml; charset=utf-8" },
	});
};
