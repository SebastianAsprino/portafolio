<script lang="ts">
	import { onMount } from "svelte";
	import { drawFishSprite } from "../lib/fish";

	export let sprite: number[][];
	export let scale = 4;

	let canvas: HTMLCanvasElement;

	$: if (canvas && sprite) drawFishSprite(canvas, sprite, scale);

	onMount(() => drawFishSprite(canvas, sprite, scale));
</script>

<canvas
	bind:this={canvas}
	style="image-rendering: pixelated; image-rendering: crisp-edges; display: block;"
></canvas>
