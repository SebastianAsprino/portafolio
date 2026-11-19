// Datos estructurados (JSON-LD, schema.org) del sitio. BaseLayout publica en
// todas las páginas un @graph con WebSite + Person; cada página agrega sus
// propios nodos (ProfilePage, ContactPage, CreativeWork, BreadcrumbList) que
// apuntan a esos dos por @id.
import portfolio from "../data/portfolio.json";
import { TECHS } from "../data/techs";

export const SITE = "https://asprino.dev";

const { about, contact, projects } = portfolio;
const { city, region, country, countryCode } = about.location;

export const PERSON_ID = `${SITE}/#person`;
export const WEBSITE_ID = `${SITE}/#website`;

export const LOCATION_LABEL = `${city}, ${country}`;

export type JsonLdNode = Record<string, unknown>;

const whatsappNumber = contact.whatsapp.replace(/\D/g, "");

export const person: JsonLdNode = {
	"@type": "Person",
	"@id": PERSON_ID,
	name: about.name,
	alternateName: "Sebastian Alejandro Asprino Ortiz",
	jobTitle: "Desarrollador Fullstack",
	description: about.bio,
	url: `${SITE}/`,
	image: `${SITE}/old/pfp.jpg`,
	email: `mailto:${contact.email}`,
	telephone: `+${whatsappNumber}`,
	address: {
		"@type": "PostalAddress",
		addressLocality: city,
		addressRegion: region,
		addressCountry: countryCode,
	},
	homeLocation: {
		"@type": "City",
		name: city,
		containedInPlace: { "@type": "Country", name: country },
	},
	worksFor: {
		"@type": "Organization",
		name: "My Little Venture",
		url: "https://mylittleventure.com/",
	},
	knowsAbout: TECHS.map((t) => t.label),
	knowsLanguage: ["es", "en"],
	sameAs: [contact.github, contact.linkedin, contact.twitter],
	contactPoint: {
		"@type": "ContactPoint",
		contactType: "freelance, contratos y trabajo remoto",
		email: contact.email,
		telephone: `+${whatsappNumber}`,
		url: `https://wa.me/${whatsappNumber}`,
		areaServed: [countryCode, "Worldwide"],
		availableLanguage: ["es", "en"],
	},
};

export const website: JsonLdNode = {
	"@type": "WebSite",
	"@id": WEBSITE_ID,
	url: `${SITE}/`,
	name: about.name,
	description: `Portafolio de ${about.name}, desarrollador fullstack en ${LOCATION_LABEL}.`,
	inLanguage: "es",
	publisher: { "@id": PERSON_ID },
	author: { "@id": PERSON_ID },
};

/** Página web genérica que pertenece al sitio y trata sobre la persona. */
export function webPage(
	type: "ProfilePage" | "ContactPage" | "CollectionPage" | "WebPage",
	url: string,
	name: string,
	description: string,
): JsonLdNode {
	return {
		"@type": type,
		"@id": `${url}#webpage`,
		url,
		name,
		description,
		inLanguage: "es",
		isPartOf: { "@id": WEBSITE_ID },
		about: { "@id": PERSON_ID },
		...(type === "ProfilePage" ? { mainEntity: { "@id": PERSON_ID } } : {}),
	};
}

export function breadcrumbs(items: { name: string; url: string }[]): JsonLdNode {
	return {
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.name,
			item: item.url,
		})),
	};
}

type Project = (typeof projects)[number];

/** Un proyecto del portafolio como CreativeWork del autor. */
export function projectWork(project: Project, url: string): JsonLdNode {
	const external = [project.links.live, project.links.repo].filter(Boolean);
	return {
		"@type": "CreativeWork",
		"@id": `${url}#work`,
		url,
		name: project.name,
		headline: project.tagline,
		description: project.description,
		genre: project.type,
		keywords: project.stack.join(", "),
		inLanguage: "es",
		...(project.image[0] ? { image: new URL(project.image[0], SITE).href } : {}),
		author: { "@id": PERSON_ID },
		creator: { "@id": PERSON_ID },
		...(external.length ? { sameAs: external } : {}),
	};
}
