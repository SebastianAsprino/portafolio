<script lang="ts">
	import ProjectCard from "./ProjectCard.svelte";

	type Project = {
		id: string;
		name: string;
		slug: string;
		tagline: string;
		type: string;
		year: string;
		stack: string[];
		image: string[];
		video: string;
		featured: boolean;
		private: boolean;
		links: { live: string | null; repo: string | null };
		highlights: string[];
	};

	export let projects: Project[];
	export let allIcons: Record<string, string>;
	export let stackCategories: Record<string, string[]>;

	let selected = new Set<string>();

	$: filtered =
		selected.size === 0
			? projects
			: projects.filter((p) => p.stack.some((t) => selected.has(t)));

	function toggle(tech: string) {
		const next = new Set(selected);
		if (next.has(tech)) next.delete(tech);
		else next.add(tech);
		selected = next;
	}

	function clear() {
		selected = new Set();
	}

	const CAT_LABELS: Record<string, string> = {
		frontend: "UI",
		backend: "BE",
		data: "DB",
		infra: "Infra",
		tools: "Util",
		other: "Otros",
	};
</script>

<div class="search">
	<div class="filters">
		{#each Object.entries(stackCategories) as [cat, techs]}
			<div class="filter-row">
				<span class="cat">{CAT_LABELS[cat] ?? cat}</span>
				<div class="tags">
					{#each techs as tech}
						<button
							class="tag"
							class:active={selected.has(tech)}
							on:click={() => toggle(tech)}
							title={tech}
						>
							{#if allIcons[tech]}
								<span class="tag-icon">{@html allIcons[tech]}</span>
							{/if}
							<span>{tech}</span>
						</button>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#if selected.size > 0}
		<div class="filter-status">
			<span class="count"
				>{filtered.length} proyecto{filtered.length !== 1 ? "s" : ""}</span
			>
			<button class="clear-btn" on:click={clear}>limpiar</button>
		</div>
	{/if}

	<div class="results">
		{#if filtered.length === 0}
			<p class="empty">sin proyectos con ese stack</p>
		{:else}
			{#each filtered as project (project.id)}
				<ProjectCard {project} icons={allIcons} />
			{/each}
		{/if}
	</div>
</div>

<style>
	.search {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		height: 100%;
		overflow-y: auto;
		scrollbar-width: none;
	}

	.search::-webkit-scrollbar {
		display: none;
	}

	.filters {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.filter-row {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.cat {
		font-size: 0.58rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(130, 200, 255, 0.35);
		width: 36px;
		flex-shrink: 0;
		padding-top: 3px;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
		flex: 1;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		background: rgba(0, 10, 30, 0.5);
		border: 1px solid rgba(130, 200, 255, 0.13);
		color: rgba(200, 232, 248, 0.55);
		font-family: monospace;
		font-size: 0.62rem;
		padding: 2px 5px;
		cursor: pointer;
		transition: all 0.1s;
	}

	.tag:hover {
		border-color: rgba(130, 200, 255, 0.38);
		color: #c8e8f8;
	}

	.tag.active {
		border-color: rgba(130, 200, 255, 0.65);
		background: rgba(130, 200, 255, 0.07);
		color: #c8e8f8;
	}

	.tag-icon {
		display: inline-flex;
		width: 11px;
		height: 11px;
	}

	.tag-icon :global(div) {
		width: 100%;
		height: 100%;
		display: flex;
	}

	.tag-icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.filter-status {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.2rem 0;
		border-top: 1px solid rgba(130, 200, 255, 0.08);
		border-bottom: 1px solid rgba(130, 200, 255, 0.08);
	}

	.count {
		font-size: 0.68rem;
		color: rgba(200, 232, 248, 0.45);
		font-family: monospace;
	}

	.clear-btn {
		font-size: 0.62rem;
		color: rgba(130, 200, 255, 0.5);
		background: none;
		border: none;
		cursor: pointer;
		font-family: monospace;
		padding: 0;
	}

	.clear-btn:hover {
		color: rgba(130, 200, 255, 0.9);
	}

	.results {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}

	.empty {
		font-size: 0.78rem;
		color: rgba(200, 232, 248, 0.35);
		font-family: monospace;
		padding: 0.5rem 0;
		grid-column: 1 / -1;
	}

	@media (max-width: 640px) {
		.results {
			grid-template-columns: 1fr;
		}
	}
</style>
