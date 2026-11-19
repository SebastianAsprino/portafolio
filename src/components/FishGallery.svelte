<script lang="ts">
	import { onMount, onDestroy, tick } from "svelte";
	import FishSprite from "./FishSprite.svelte";
	import { fetchFishPage, type ApiFish } from "../lib/fish";

	let fish: ApiFish[] = [];
	let cursor: string | null = null;
	let loading = true;
	let loadingMore = false;
	let error = false;
	let sentinel: HTMLDivElement;
	let observer: IntersectionObserver | null = null;

	async function loadMore() {
		if (!cursor || loadingMore) return;
		loadingMore = true;
		try {
			const data = await fetchFishPage(cursor);
			fish = [...fish, ...data.fish];
			cursor = data.cursor;
			if (!cursor) {
				observer?.disconnect();
				observer = null;
			} else {
				await tick();
				if (observer && sentinel) {
					observer.unobserve(sentinel);
					observer.observe(sentinel);
				}
			}
		} catch (err) {
			// se reintenta la próxima vez que el sentinel entre en pantalla
			console.error("no se pudo cargar más peces:", err);
		} finally {
			loadingMore = false;
		}
	}

	function findScrollParent(el: Element): Element | null {
		let parent = el.parentElement;
		while (parent) {
			const { overflowY } = getComputedStyle(parent);
			if (overflowY === "auto" || overflowY === "scroll") return parent;
			parent = parent.parentElement;
		}
		return null;
	}

	onMount(async () => {
		try {
			const data = await fetchFishPage();
			fish = data.fish;
			cursor = data.cursor;
		} catch {
			error = true;
		} finally {
			loading = false;
		}

		if (!cursor) return;

		await tick();

		const scrollRoot = findScrollParent(sentinel);
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) loadMore();
			},
			{ root: scrollRoot, rootMargin: "200px" },
		);
		observer.observe(sentinel);
	});

	onDestroy(() => {
		observer?.disconnect();
	});

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
{/if}

<div bind:this={sentinel} class="sentinel"></div>

<style>
	.status {
		color: rgba(200, 232, 248, 0.6);
		font-family: var(--font-text);
		font-size: 1.02rem;
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
		font-family: var(--font-text);
		font-size: 0.96rem;
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.name:hover {
		text-decoration: underline;
	}

	.date {
		font-family: var(--font-text);
		font-size: 0.84rem;
		color: rgba(200, 232, 248, 0.45);
	}

	.sentinel {
		height: 1px;
	}
</style>
