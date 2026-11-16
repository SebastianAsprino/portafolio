// llms.txt (https://llmstxt.org): resumen en Markdown para LLMs y agentes.
// Se genera desde portfolio.json para que no quede desactualizado.
import type { APIRoute } from "astro";
import portfolio from "../data/portfolio.json";
import cv from "../data/cv.json";

const { about, contact, projects } = portfolio;
const { city, region, country } = about.location;

export const GET: APIRoute = ({ site }) => {
	const abs = (path: string) => new URL(path, site).href;
	const whatsapp = `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`;

	const projectLines = projects.map((p) => {
		const live = p.links.live ? ` Sitio: ${p.links.live}` : "";
		return `- [${p.name}](${abs(`/proyectos/${p.slug}/`)}): ${p.tagline}. ${p.type}, ${p.year}. Stack: ${p.stack.join(", ")}.${live}`;
	});

	const body = `# ${about.name}

> ${about.name} es desarrollador fullstack (${about.headline}) en ${city}, ${country}. Construye software de principio a fin: APIs, bases de datos, interfaces y despliegue. Disponible para ${contact.available_for}.

${about.name} is a fullstack software engineer based in ${city}, ${country}, available for freelance, contract and remote work.

- Ubicación: ${city}, ${region}, ${country}.
- Actualmente: ${about.currently}.
- Stack principal: ${cv.summary.stack}.
- Experiencia: ${cv.summary.intro}

## Contacto

- [Email](mailto:${contact.email}): ${contact.email}
- [WhatsApp](${whatsapp}): ${contact.whatsapp}
- [LinkedIn](${contact.linkedin})
- [GitHub](${contact.github})
- [X / Twitter](${contact.twitter})
- [Página de contacto](${abs("/contacto/")})

## Proyectos

${projectLines.join("\n")}

## Páginas

- [Inicio](${abs("/")}): resumen profesional y proyectos destacados.
- [Tecnologías](${abs("/tecnologias/")}): tecnologías usadas y en qué proyectos.
- [Contacto](${abs("/contacto/")}): canales de contacto y disponibilidad.

## Optional

- [Peces](${abs("/peces/")}): galería de peces pixel-art creados por visitantes del portafolio.
`;

	return new Response(body, {
		headers: { "Content-Type": "text/markdown; charset=utf-8" },
	});
};
