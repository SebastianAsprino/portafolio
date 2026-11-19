<script lang="ts">
	import { onMount } from "svelte";
	import { rybbitWidgetUrl, RYBBIT_INLINE_SIZE } from "../lib/rybbit";

	export let project: {
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
		rybbitWidget?: string;
	};
	export let icons: Record<string, string> = {};

	const BADGE_LIMIT = 4;

	let container: HTMLElement;
	let videoEl: HTMLVideoElement;
	let videoActive = false;

	onMount(() => {
		if (!project.video) return;

		const obs = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !videoActive) {
					videoActive = true;
					videoEl.src = project.video;
					obs.disconnect();
				}
			},
			{ threshold: 0.3 }
		);

		obs.observe(container);
		return () => obs.disconnect();
	});
</script>

<!-- El link del título se estira sobre toda la card (::after); así el iframe
     de Rybbit queda fuera del <a> y recibe sus propios clics. -->
<article class="card" bind:this={container}>
	<div class="media">
		{#if project.image[0]}
			<img
				src={project.image[0]}
				alt={project.name}
				loading="lazy"
				class:hidden={videoActive}
			/>
		{:else}
			<div class="placeholder" class:hidden={videoActive}></div>
		{/if}

		{#if project.video}
			<video
				bind:this={videoEl}
				autoplay
				muted
				loop
				playsinline
				class:visible={videoActive}
			></video>
		{/if}
	</div>

	<div class="meta-row">
		<span class="type">{project.type}</span>
		<span class="year">{project.year}</span>
	</div>

	<h3 class="name">
		<a href="/proyectos/{project.slug}" class="card-link">{project.name}</a>
	</h3>
	<p class="tagline">{project.tagline}</p>

	<div class="foot">
		<div class="badges">
			{#each project.stack.slice(0, BADGE_LIMIT) as tech}
				{#if icons[tech]}
					<img class="icon" src={icons[tech]} alt={tech} title={tech} width="24" height="24" loading="lazy" />
				{:else}
					<span class="badge">{tech}</span>
				{/if}
			{/each}
			{#if project.stack.length > BADGE_LIMIT}
				<span class="badge more">+{project.stack.length - BADGE_LIMIT}</span>
			{/if}
		</div>

		{#if project.rybbitWidget}
			<iframe
				class="live"
				src={rybbitWidgetUrl(project.rybbitWidget, "inline")}
				width={RYBBIT_INLINE_SIZE.width}
				height={RYBBIT_INLINE_SIZE.height}
				loading="lazy"
				title="Visitantes en vivo"
				scrolling="no"
			></iframe>
		{/if}
	</div>
</article>

<style>
	.card {
		position: relative;
		display: block;
		background: rgba(0, 10, 30, 0.72);
		border: 1px solid rgba(130, 200, 255, 0.18);
		backdrop-filter: blur(2px);
		padding: 0.95rem;
		color: #c8e8f8;
		font-family: var(--font-text);
		text-decoration: none;
		cursor: pointer;
		transition: border-color 0.15s;
	}

	.card:hover,
	.card:has(.card-link:focus-visible) {
		border-color: rgba(130, 200, 255, 0.45);
	}

	.card-link {
		color: inherit;
		text-decoration: none;
		outline: none;
	}

	.card-link::after {
		content: "";
		position: absolute;
		inset: 0;
	}

	.media {
		position: relative;
		aspect-ratio: 16 / 9;
		background: rgba(0, 8, 24, 0.9);
		margin-bottom: 0.75rem;
		overflow: hidden;
	}

	.media img,
	.media video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.placeholder {
		position: absolute;
		inset: 0;
		background: linear-gradient(160deg, rgba(3, 28, 56, 1) 0%, rgba(0, 6, 18, 1) 100%);
	}

	.media img.hidden,
	.placeholder.hidden {
		display: none;
	}

	.media video {
		display: none;
	}

	.media video.visible {
		display: block;
	}

	.meta-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.25rem;
	}

	.type {
		font-family: var(--font-pixel);
		font-size: 0.85rem;
		color: rgba(130, 200, 255, 0.55);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.year {
		font-family: var(--font-pixel);
		font-size: 0.85rem;
		color: rgba(200, 232, 248, 0.3);
	}

	.name {
		font-family: var(--font-pixel);
		font-size: 1.35rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
		color: #c8e8f8;
	}

	.tagline {
		font-size: 1.73rem;
		color: rgba(200, 232, 248, 0.55);
		margin-bottom: 0.6rem;
		line-height: 1.15;
	}

	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
	}

	/* Por encima del ::after del link para que no se lo coma. color-scheme
	   igual al del widget: si difieren, el navegador pinta un fondo opaco
	   detrás del iframe en vez de dejarlo transparente. */
	.live {
		position: relative;
		z-index: 1;
		display: block;
		flex-shrink: 0;
		border: 0;
		color-scheme: dark;
	}

	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
	}

	.icon {
		display: block;
		width: 24px;
		height: 24px;
		object-fit: contain;
		opacity: 0.9;
		flex-shrink: 0;
	}

	.badge {
		font-size: 1.44rem;
		color: rgba(130, 200, 255, 0.6);
		border: 1px solid rgba(130, 200, 255, 0.18);
		padding: 2px 6px;
		background: rgba(0, 10, 30, 0.5);
		white-space: nowrap;
	}

	.more {
		border-color: rgba(130, 200, 255, 0.08);
		color: rgba(200, 232, 248, 0.3);
	}
</style>
