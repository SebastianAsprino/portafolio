import { CATEGORIES, TECHS, iconPath, resolveTech } from "../data/techs";

/** Nombre tal cual aparece en un `stack` → ruta de su ícono. */
export function buildIconMap(names: string[]): Record<string, string> {
	return Object.fromEntries(names.map((name) => [name, iconPath(resolveTech(name))]));
}

export interface TechFilter {
	id: string;
	label: string;
	icon: string;
	/** Proyectos que la usan; 0 = la conozco pero no hay proyecto publicado. */
	count: number;
}

export interface TechGroup {
	id: string;
	label: string;
	techs: TechFilter[];
}

/**
 * Datos de /tecnologias: las tecnologías agrupadas por categoría y, por
 * proyecto, los ids de catálogo de su stack (para filtrar sin depender de
 * cómo se escribió cada nombre).
 */
export function buildTechIndex(projects: { id: string; stack: string[] }[]) {
	const techsByProject: Record<string, string[]> = {};
	const counts = new Map<string, number>();
	for (const project of projects) {
		const ids = [...new Set(project.stack.map((name) => resolveTech(name).id))];
		techsByProject[project.id] = ids;
		for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
	}

	const groups: TechGroup[] = CATEGORIES.map((cat) => ({
		id: cat.id,
		label: cat.label,
		techs: TECHS.filter((t) => t.category === cat.id).map((t) => ({
			id: t.id,
			label: t.label,
			icon: iconPath(t),
			count: counts.get(t.id) ?? 0,
		})),
	}));

	return { groups, techsByProject };
}
