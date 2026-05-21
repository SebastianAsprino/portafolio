<script lang="ts">
	import { onMount } from "svelte";
	import FishSprite from "./FishSprite.svelte";
	import { API_URL, type ApiFish } from "../lib/fish";

	let fish: ApiFish[] = [];
	let cursor: string | null = null;
	let loading = true;
	let loadingMore = false;
	let error = false;

	async function loadPage(cur?: string) {
		const url = cur ? `${API_URL}/fish?cursor=${cur}` : `${API_URL}/fish`;
		const res = await fetch(url);
		if (!res.ok) throw new Error();
		return res.json() as Promise<{ fish: ApiFish[]; cursor: string | null }>;
	}

	onMount(async () => {
		try {
			const data = await loadPage();
			fish = data.fish;
			cursor = data.cursor;
		} catch {
			error = true;
		} finally {
			loading = false;
		}
	});

	async function loadMore() {
		if (!cursor || loadingMore) return;
		loadingMore = true;
		try {
			const data = await loadPage(cursor);
			fish = [...fish, ...data.fish];
			cursor = data.cursor;
		} finally {
			loadingMore = false;
		}
	}

	function formatDate(ts: number) {
		return new Date(ts).toLocaleDateString("es", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	}
</script>

{#if loading}
	<div class="status">cargando peces...</div>
{:else if error}
	<div class="status">no se pudo conectar al océano</div>
{:else if fish.length === 0}
	<div class="status">
		el océano está vacío — <a href="/crear-pez">sé el primero</a>
	</div>
{:else}
	<div class="grid">
		{#each fish as f (f.id)}
			<div class="card">
				<div class="sprite-wrap">
					<FishSprite sprite={f.sprite} scale={3} />
				</div>
				<div class="info">
					<a href={f.creatorUrl} target="_blank" rel="noopener" class="name"
						>{f.creatorName}</a
					>
					<span class="date">{formatDate(f.createdAt)}</span>
				</div>
			</div>
		{/each}
	</div>

	{#if cursor}
		<button class="more" on:click={loadMore} disabled={loadingMore}>
			{loadingMore ? "cargando..." : "ver más"}
		</button>
	{/if}
{/if}

<style>
	.status {
		color: rgba(200, 232, 248, 0.6);
		font-family: monospace;
		font-size: 0.85rem;
		padding: 2rem 0;
		text-align: center;
	}

	.status a {
		color: #c8e8f8;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
		gap: 6px;
	}

	.card {
		background: rgba(0, 10, 30, 0.72);
		border: 1px solid rgba(130, 200, 255, 0.18);
		backdrop-filter: blur(2px);
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.sprite-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 48px;
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.name {
		color: #c8e8f8;
		font-family: monospace;
		font-size: 0.8rem;
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.name:hover {
		text-decoration: underline;
	}

	.date {
		font-family: monospace;
		font-size: 0.7rem;
		color: rgba(200, 232, 248, 0.45);
	}

	.more {
		display: block;
		margin: 1rem auto 0;
		background: rgba(0, 10, 30, 0.72);
		border: 1px solid rgba(130, 200, 255, 0.28);
		color: #c8e8f8;
		font-family: monospace;
		font-size: 0.8rem;
		padding: 0.4rem 1.2rem;
		cursor: pointer;
		letter-spacing: 0.08em;
	}

	.more:hover:not(:disabled) {
		border-color: rgba(130, 200, 255, 0.6);
	}

	.more:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
