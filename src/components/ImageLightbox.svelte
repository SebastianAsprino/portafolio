<script lang="ts">
	export let images: string[] = [];
	export let alt = "";

	let openIndex: number | null = null;
	let naturalWidth = 0;
	let naturalHeight = 0;
	let innerWidth = typeof window !== "undefined" ? window.innerWidth : 0;
	let innerHeight = typeof window !== "undefined" ? window.innerHeight : 0;

	function open(i: number) {
		naturalWidth = 0;
		naturalHeight = 0;
		openIndex = i;
	}

	function close() {
		openIndex = null;
	}

	function onLoad(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		naturalWidth = img.naturalWidth;
		naturalHeight = img.naturalHeight;
	}

	function onKey(e: KeyboardEvent) {
		if (openIndex === null) return;
		if (e.key === "Escape") close();
	}

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}

	$: scale = naturalWidth && naturalHeight
		? Math.min(
				2,
				(innerWidth * 0.9) / naturalWidth,
				(innerHeight * 0.9) / naturalHeight,
			)
		: 0;
	$: displayWidth = naturalWidth * scale;
	$: displayHeight = naturalHeight * scale;
</script>

<svelte:window on:keydown={onKey} bind:innerWidth bind:innerHeight />

<div class="image-grid">
	{#each images as src, i}
		<button class="thumb" on:click={() => open(i)} aria-label={`ampliar captura ${i + 1}`}>
			<img src={src} alt={`${alt} ${i + 1}`} loading="lazy" />
		</button>
	{/each}
</div>

{#if openIndex !== null}
	<div
		use:portal
		class="overlay"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		on:mousedown|self={close}
	>
		<button class="close-btn" on:click={close} aria-label="cerrar">×</button>
		<img
			class="lightbox-img"
			src={images[openIndex]}
			alt={`${alt} ${openIndex + 1}`}
			style={scale
				? `width:${displayWidth}px; height:${displayHeight}px;`
				: "max-width: 90vw; max-height: 90vh;"}
			on:load={onLoad}
		/>
	</div>
{/if}

<style>
	.image-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 6px;
	}

	.thumb {
		border: none;
		padding: 0;
		margin: 0;
		background: none;
		cursor: pointer;
		display: block;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		background: rgba(0, 8, 24, 0.9);
	}

	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		transition: opacity 0.15s;
	}

	.thumb:hover img {
		opacity: 0.85;
	}

	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 5, 15, 0.75);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
	}

	.lightbox-img {
		width: auto;
		height: auto;
		object-fit: contain;
		display: block;
		border: 1px solid rgba(130, 200, 255, 0.2);
		background: rgba(0, 8, 24, 0.9);
	}

	.close-btn {
		position: fixed;
		top: 1rem;
		right: 1.25rem;
		z-index: 1000;
		background: transparent;
		border: none;
		color: rgba(200, 232, 248, 0.6);
		font-size: 1.75rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 0.2rem;
		font-family: monospace;
	}

	.close-btn:hover {
		color: #c8e8f8;
	}

	@media (max-width: 640px) {
		.image-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
