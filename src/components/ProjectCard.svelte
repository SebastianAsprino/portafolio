<script lang="ts">
	import { onMount } from "svelte";

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

<a href="/proyectos/{project.slug}" class="card" bind:this={container}>
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

	<h3 class="name">{project.name}</h3>
	<p class="tagline">{project.tagline}</p>

	<div class="badges">
		{#each project.stack.slice(0, BADGE_LIMIT) as tech}
			{#if icons[tech]}
				<span class="icon" title={tech}>{@html icons[tech]}</span>
			{:else}
				<span class="badge">{tech}</span>
			{/if}
		{/each}
		{#if project.stack.length > BADGE_LIMIT}
			<span class="badge more">+{project.stack.length - BADGE_LIMIT}</span>
		{/if}
	</div>
</a>

<style>
	.card {
		display: block;
		background: rgba(0, 10, 30, 0.72);
		border: 1px solid rgba(130, 200, 255, 0.18);
		backdrop-filter: blur(2px);
		padding: 0.75rem;
		color: #c8e8f8;
		font-family: monospace;
		text-decoration: none;
		cursor: pointer;
		transition: border-color 0.15s;
	}

	.card:hover {
		border-color: rgba(130, 200, 255, 0.45);
	}

	.media {
		position: relative;
		aspect-ratio: 16 / 9;
		background: rgba(0, 8, 24, 0.9);
		margin-bottom: 0.6rem;
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
		font-size: 0.62rem;
		color: rgba(130, 200, 255, 0.55);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.year {
		font-size: 0.62rem;
		color: rgba(200, 232, 248, 0.3);
	}

	.name {
		font-size: 0.88rem;
		font-weight: bold;
		margin-bottom: 0.2rem;
		color: #c8e8f8;
	}

	.tagline {
		font-size: 0.72rem;
		color: rgba(200, 232, 248, 0.55);
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
	}

	.icon {
		display: inline-flex;
		width: 18px;
		height: 18px;
		opacity: 0.85;
		flex-shrink: 0;
	}

	.icon :global(div) {
		width: 100%;
		height: 100%;
		display: flex;
	}

	.icon :global(svg) {
		width: 100%;
		height: 100%;
	}

	.badge {
		font-size: 0.6rem;
		color: rgba(130, 200, 255, 0.6);
		border: 1px solid rgba(130, 200, 255, 0.18);
		padding: 1px 5px;
		background: rgba(0, 10, 30, 0.5);
		white-space: nowrap;
	}

	.more {
		border-color: rgba(130, 200, 255, 0.08);
		color: rgba(200, 232, 248, 0.3);
	}
</style>
