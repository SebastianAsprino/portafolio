<script lang="ts">
	import type { ComponentProps } from "svelte";
	import ProjectCard from "./ProjectCard.svelte";
	import type { TechFilter, TechGroup } from "../lib/stack";

	type Project = ComponentProps<typeof ProjectCard>["project"];

	interface Props {
		projects: Project[];
		groups: TechGroup[];
		/** Id de proyecto → ids de catálogo de su stack. */
		techsByProject: Record<string, string[]>;
		/** Nombre en `stack` → ícono, para las cards. */
		icons: Record<string, string>;
	}

	let { projects, groups, techsByProject, icons }: Props = $props();

	const techById = $derived(
		new Map<string, TechFilter>(groups.flatMap((g) => g.techs.map((t) => [t.id, t] as const))),
	);

	let selected = $state<string[]>([]);
	let resultsEl: HTMLElement;

	const filtered = $derived(
		selected.length === 0
			? projects
			: projects.filter((p) => techsByProject[p.id].some((id) => selected.includes(id))),
	);

	function toggle(id: string) {
		selected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
	}

	function clear() {
		selected = [];
	}

	function showResults() {
		resultsEl.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	const plural = (n: number) => `${n} proyecto${n === 1 ? "" : "s"}`;
</script>

<div class="stack">
	<!-- Un solo bloque: una fila por categoría y, al pie, el estado del filtro. -->
	<section class="panel" aria-label="Filtrar proyectos por tecnología">
		<div class="rows">
			{#each groups as group (group.id)}
				<div class="row">
					<h2 id="group-{group.id}" class="row-title">{group.label}</h2>
					<ul class="chips" aria-labelledby="group-{group.id}">
						{#each group.techs as tech (tech.id)}
							{@const active = selected.includes(tech.id)}
							<li>
								<button
									type="button"
									class="chip"
									class:active
									aria-pressed={active}
									disabled={tech.count === 0}
									title={tech.count === 0
										? `${tech.label}: sin proyectos publicados todavía`
										: `${tech.label}: ${plural(tech.count)}`}
									onclick={() => toggle(tech.id)}
								>
									<img src={tech.icon} alt="" width="16" height="16" />
									<span>{tech.label}</span>
									{#if tech.count > 0}
										<span class="chip-count">{tech.count}</span>
									{/if}
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<div class="status" class:filtering={selected.length > 0}>
			<p class="status-count" aria-live="polite">
				{#if selected.length === 0}
					{plural(projects.length)}
					<span class="hint">· elegí tecnologías para filtrar; el número es en cuántos proyectos aparece</span>
				{:else}
					{filtered.length} de {plural(projects.length)} con
				{/if}
			</p>
			{#if selected.length > 0}
				<ul class="selected">
					{#each selected as id (id)}
						{@const tech = techById.get(id)}
						{#if tech}
							<li>
								<button
									type="button"
									class="selected-chip"
									aria-label="Quitar {tech.label}"
									onclick={() => toggle(id)}
								>
									<img src={tech.icon} alt="" width="14" height="14" />
									{tech.label}
									<span aria-hidden="true">×</span>
								</button>
							</li>
						{/if}
					{/each}
				</ul>
				<div class="status-actions">
					<button type="button" class="link-btn" onclick={clear}>limpiar</button>
					<button type="button" class="link-btn" onclick={showResults}>ver ↓</button>
				</div>
			{/if}
		</div>
	</section>

	<div class="results" bind:this={resultsEl}>
		{#each filtered as project (project.id)}
			<ProjectCard {project} {icons} />
		{/each}
	</div>
</div>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: 6px;
		height: 100%;
		overflow-y: auto;
		scrollbar-width: none;
	}

	.stack::-webkit-scrollbar {
		display: none;
	}

	.panel {
		background: rgba(0, 10, 30, 0.72);
		border: 1px solid rgba(130, 200, 255, 0.18);
		backdrop-filter: blur(2px);
	}

	.rows {
		padding: 0.35rem 0.9rem;
	}

	.row {
		display: grid;
		grid-template-columns: 8.5rem 1fr;
		align-items: start;
		gap: 0.75rem;
		padding: 0.5rem 0;
	}

	.row + .row {
		border-top: 1px dashed rgba(130, 200, 255, 0.1);
	}

	/* Alineado con la primera línea de chips. */
	.row-title {
		font-family: var(--font-pixel);
		font-size: 0.78rem;
		font-weight: 400;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #82c8ff;
		padding-top: 5px;
	}

	.chips {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 6px 3px 5px;
		background: rgba(0, 10, 30, 0.55);
		border: 1px solid rgba(130, 200, 255, 0.14);
		color: rgba(200, 232, 248, 0.82);
		font-family: var(--font-text);
		font-size: 0.75rem;
		line-height: 1;
		cursor: pointer;
		transition:
			border-color 0.1s,
			background 0.1s,
			transform 0.1s,
			box-shadow 0.1s;
	}

	.chip img {
		width: 16px;
		height: 16px;
		object-fit: contain;
		flex-shrink: 0;
	}

	/* Sombra dura de 2px: botón "levantado" estilo pixel art. */
	.chip:hover:not(:disabled) {
		border-color: rgba(130, 200, 255, 0.5);
		color: #e4f4ff;
		transform: translate(-1px, -1px);
		box-shadow: 2px 2px 0 rgba(130, 200, 255, 0.3);
	}

	.chip:focus-visible {
		outline: 2px solid #82c8ff;
		outline-offset: 1px;
	}

	.chip.active {
		background: rgba(130, 200, 255, 0.16);
		border-color: #82c8ff;
		color: #fff;
		transform: translate(1px, 1px);
		box-shadow: inset 2px 2px 0 rgba(0, 10, 30, 0.6);
	}

	.chip:disabled {
		cursor: default;
		opacity: 0.38;
	}

	.chip:disabled img {
		filter: grayscale(1);
	}

	/* Texto, no Pixelify: ahí el 5 se confunde con una S. */
	.chip-count {
		font-size: 0.68rem;
		line-height: 1;
		min-width: 1.4em;
		padding: 1px 3px;
		text-align: center;
		color: #82c8ff;
		background: rgba(130, 200, 255, 0.1);
		border: 1px solid rgba(130, 200, 255, 0.2);
	}

	.chip.active .chip-count {
		color: #00101f;
		background: #82c8ff;
		border-color: #82c8ff;
	}

	/* Pie del bloque: queda pegado abajo mientras se eligen filtros. */
	.status {
		position: sticky;
		bottom: 0;
		z-index: 2;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 12px;
		padding: 0.55rem 0.9rem;
		background: rgba(0, 10, 30, 0.95);
		border-top: 1px solid rgba(130, 200, 255, 0.18);
		font-family: var(--font-text);
		font-size: 0.8rem;
		color: rgba(200, 232, 248, 0.6);
	}

	.status.filtering {
		border-top-color: rgba(130, 200, 255, 0.45);
	}

	.status-count {
		color: #c8e8f8;
	}

	.hint {
		color: rgba(200, 232, 248, 0.5);
	}

	.selected {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		flex: 1;
	}

	.selected-chip {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 2px 6px 2px 4px;
		background: rgba(130, 200, 255, 0.14);
		border: 1px solid #82c8ff;
		color: #fff;
		font-family: var(--font-text);
		font-size: 0.75rem;
		line-height: 1;
		cursor: pointer;
	}

	.selected-chip img {
		width: 14px;
		height: 14px;
		object-fit: contain;
	}

	.selected-chip:hover span {
		color: #ff9a9a;
	}

	.status-actions {
		display: flex;
		gap: 14px;
		margin-left: auto;
	}

	.link-btn {
		background: none;
		border: none;
		padding: 0;
		font-family: var(--font-text);
		font-size: 0.8rem;
		color: rgba(130, 200, 255, 0.7);
		cursor: pointer;
	}

	.link-btn:hover,
	.link-btn:focus-visible {
		color: #82c8ff;
		text-decoration: underline;
	}

	.results {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
		scroll-margin-top: 6px;
	}

	@media (max-width: 640px) {
		.row {
			grid-template-columns: 1fr;
			gap: 0.4rem;
		}

		.row-title {
			padding-top: 0;
		}

		.results {
			grid-template-columns: 1fr;
		}
	}
</style>
