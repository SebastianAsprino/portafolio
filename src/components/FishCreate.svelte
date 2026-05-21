<script lang="ts">
	import { onMount } from "svelte";
	import FishSprite from "./FishSprite.svelte";
	import { FISH_COLORS, DEFAULT_SPRITES, API_URL } from "../lib/fish";

	export let autoOpen = false;

	let N = 16;
	let grid: number[][] = makeGrid(N);
	let selected = 1;
	let tool: "pen" | "fill" | "erase" = "pen";
	let painting = false;
	let symmetry = false;
	let name = "";
	let url = "";
	let submitting = false;
	let done = false;
	let errorMsg = "";
	let open = false;

	let history: number[][][] = [];


	const TEMPLATES = ["pez 1", "pez 2", "pez 3", "mini"];

	function makeGrid(n: number): number[][] {
		return Array.from({ length: n }, () => new Array(n).fill(0));
	}

	function cloneGrid(g: number[][]): number[][] {
		return g.map((row) => [...row]);
	}

	function pushHistory() {
		history = [...history.slice(-30), cloneGrid(grid)];
	}

	function undo() {
		if (!history.length) return;
		grid = history[history.length - 1];
		history = history.slice(0, -1);
	}

	function onSizeChange() {
		pushHistory();
		const next = makeGrid(N);
		const rows = Math.min(grid.length, N);
		const cols = Math.min(grid[0]?.length ?? 0, N);
		for (let r = 0; r < rows; r++)
			for (let c = 0; c < cols; c++) next[r][c] = grid[r][c];
		grid = next;
	}

	function palColor(val: number): string {
		if (val === 0) return "transparent";
		const [r, g, b] = FISH_COLORS[val - 1] ?? [128, 128, 128];
		return `rgb(${r},${g},${b})`;
	}

	function paint(r: number, c: number) {
		if (r < 0 || r >= N || c < 0 || c >= N) return;
		const val = tool === "erase" ? 0 : selected;
		grid[r][c] = val;
		if (symmetry) {
			const mr = N - 1 - r;
			if (mr !== r) grid[mr][c] = val;
		}
		grid = grid;
	}

	function floodFill(r: number, c: number) {
		const target = grid[r][c];
		const fill = tool === "erase" ? 0 : selected;
		if (target === fill) return;
		pushHistory();
		const next = cloneGrid(grid);
		const stack: [number, number][] = [[r, c]];
		while (stack.length) {
			const [cr, cc] = stack.pop()!;
			if (cr < 0 || cr >= N || cc < 0 || cc >= N) continue;
			if (next[cr][cc] !== target) continue;
			next[cr][cc] = fill;
			stack.push([cr - 1, cc], [cr + 1, cc], [cr, cc - 1], [cr, cc + 1]);
		}
		grid = next;
	}

	function handleCellDown(r: number, c: number) {
		if (tool === "fill") {
			floodFill(r, c);
			return;
		}
		pushHistory();
		painting = true;
		paint(r, c);
	}

	function loadTemplate(idx: number) {
		pushHistory();
		const tpl = DEFAULT_SPRITES[idx];
		const rows = tpl.length;
		const cols = tpl[0]?.length ?? 0;
		N = Math.max(rows, cols) + 2;
		const next = makeGrid(N);
		const rOff = ((N - rows) / 2) | 0;
		const cOff = ((N - cols) / 2) | 0;
		for (let r = 0; r < rows; r++)
			for (let c = 0; c < cols; c++) next[r + rOff][c + cOff] = tpl[r][c];
		grid = next;
	}

	$: previewSprite = (() => {
		let r0 = N,
			r1 = -1,
			c0 = N,
			c1 = -1;
		for (let r = 0; r < N; r++)
			for (let c = 0; c < N; c++)
				if (grid[r][c]) {
					r0 = Math.min(r0, r);
					r1 = Math.max(r1, r);
					c0 = Math.min(c0, c);
					c1 = Math.max(c1, c);
				}
		if (r1 < 0) return null;
		return grid.slice(r0, r1 + 1).map((row) => row.slice(c0, c1 + 1));
	})();

	function close() {
		open = false;
	}

	let sizeHoldTimer: ReturnType<typeof setTimeout> | null = null;

	function changeSize(delta: number) {
		const next = Math.max(4, Math.min(40, N + delta));
		if (next === N) return;
		N = next;
		onSizeChange();
	}

	function startSizeHold(delta: number) {
		changeSize(delta);
		let delay = 500;
		const repeat = () => {
			changeSize(delta);
			delay = Math.max(50, delay * 0.8);
			sizeHoldTimer = setTimeout(repeat, delay);
		};
		sizeHoldTimer = setTimeout(repeat, 500);
	}

	function stopSizeHold() {
		if (sizeHoldTimer !== null) {
			clearTimeout(sizeHoldTimer);
			sizeHoldTimer = null;
		}
	}

	function touchAction(node: HTMLElement) {
		const doPaint = (x: number, y: number) => {
			const el = document.elementFromPoint(x, y) as HTMLElement | null;
			if (el?.dataset.row !== undefined)
				paint(+el.dataset.row, +el.dataset.col!);
		};
		const onTouchStart = (e: TouchEvent) => {
			e.preventDefault();
			const { clientX, clientY } = e.touches[0];
			const el = document.elementFromPoint(
				clientX,
				clientY,
			) as HTMLElement | null;
			if (el?.dataset.row === undefined) return;
			if (tool === "fill") {
				floodFill(+el.dataset.row, +el.dataset.col!);
				return;
			}
			pushHistory();
			painting = true;
			doPaint(clientX, clientY);
		};
		const onTouchMove = (e: TouchEvent) => {
			e.preventDefault();
			if (!painting || tool === "fill") return;
			doPaint(e.touches[0].clientX, e.touches[0].clientY);
		};
		node.addEventListener("touchstart", onTouchStart, { passive: false });
		node.addEventListener("touchmove", onTouchMove, { passive: false });
		return {
			destroy() {
				node.removeEventListener("touchstart", onTouchStart);
				node.removeEventListener("touchmove", onTouchMove);
			},
		};
	}

	function onKey(e: KeyboardEvent) {
		if (!open) return;
		if ((e.ctrlKey || e.metaKey) && e.key === "z") {
			e.preventDefault();
			undo();
		}
		if (e.key === "Escape") close();
	}

	onMount(() => {
		if (autoOpen) open = true;
		const openHandler = () => {
			done = false;
			open = true;
		};
		window.addEventListener("open-fish-creator", openHandler);
		return () => window.removeEventListener("open-fish-creator", openHandler);
	});

	function clearGrid() {
		pushHistory();
		grid = makeGrid(N);
	}

	async function submit() {
		if (!previewSprite) {
			errorMsg = "dibuja tu pez primero";
			return;
		}
		if (!name.trim() || !url.trim()) {
			errorMsg = "nombre y url son requeridos";
			return;
		}
		submitting = true;
		errorMsg = "";
		try {
			const res = await fetch(`${API_URL}/fish`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sprite: previewSprite,
					creatorName: name.trim(),
					creatorUrl: url.trim(),
				}),
			});
			if (!res.ok) throw new Error();
			window.dispatchEvent(new CustomEvent("fish-created"));
			done = true;
		} catch {
			errorMsg = "error al crear el pez, intenta de nuevo";
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:window on:mouseup={() => (painting = false)} on:keydown={onKey} />

{#if open}
	<div
		class="overlay"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		on:mousedown|self={close}
	>
		<div class="modal">
			<button class="close-btn" on:click={close} aria-label="cerrar">×</button>

			{#if done}
				<div class="done">
					{#if previewSprite}
						<FishSprite sprite={previewSprite} scale={6} />
					{/if}
					<p>tu pez ya nada en el océano</p>
					<div class="done-links">
						<a href="/peces">ver todos los peces</a>
						<button class="done-close" on:click={close}>cerrar</button>
					</div>
				</div>
			{:else}
				<div class="modal-body">
					<div class="col-left">
						<div class="canvas" use:touchAction style="--n:{N}">
							{#each grid as row, r}
								{#each row as val, c}
									<div
										class="cell"
										role="gridcell"
										tabindex="-1"
										data-row={r}
										data-col={c}
										style={val ? `background:${palColor(val)}` : ""}
										on:mousedown={() => handleCellDown(r, c)}
										on:mouseenter={() => {
											if (painting && tool !== "fill") paint(r, c);
										}}
									></div>
								{/each}
							{/each}
						</div>
					</div>

					<div class="col-right">
						<div class="controls-row">
							<button
								class="size-btn"
								on:mousedown={() => startSizeHold(-1)}
								on:mouseup={stopSizeHold}
								on:mouseleave={stopSizeHold}
								on:touchstart|preventDefault={() => startSizeHold(-1)}
								on:touchend={stopSizeHold}>−</button
							>
							<span class="size-label">{N}×{N}</span>
							<button
								class="size-btn"
								on:mousedown={() => startSizeHold(1)}
								on:mouseup={stopSizeHold}
								on:mouseleave={stopSizeHold}
								on:touchstart|preventDefault={() => startSizeHold(1)}
								on:touchend={stopSizeHold}>+</button
							>
							<button class="ctrl-btn" on:click={clearGrid}>limpiar</button>
							<button
								class="ctrl-btn"
								on:click={undo}
								disabled={!history.length}
								title="ctrl+z">deshacer</button
							>
						</div>

						<div class="tools-row">
							<button
								class="tool-btn"
								class:active={tool === "pen"}
								on:click={() => (tool = "pen")}>lápiz</button
							>
							<button
								class="tool-btn"
								class:active={tool === "fill"}
								on:click={() => (tool = "fill")}>relleno</button
							>
							<button
								class="tool-btn"
								class:active={tool === "erase"}
								on:click={() => (tool = "erase")}>borrar</button
							>
							<button
								class="tool-btn"
								class:active={symmetry}
								on:click={() => (symmetry = !symmetry)}>simetría</button
							>
						</div>

						<div class="tpl-row">
							<span class="section-label">plantillas</span>
							{#each TEMPLATES as t, i}
								<button class="tpl-btn" on:click={() => loadTemplate(i)}
									>{t}</button
								>
							{/each}
						</div>

						<div class="palette-section">
							<div class="palette-grid">
								{#each FISH_COLORS as col, i}
									<button
										class="pal-swatch"
										class:active={selected === i + 1 && tool !== "erase"}
										style="background:rgb({col[0]},{col[1]},{col[2]})"
										title="color {i + 1}"
										on:click={() => { selected = i + 1; if (tool === "erase") tool = "pen"; }}
									></button>
								{/each}
							</div>
						</div>

						<div class="preview-row">
							<span class="section-label">vista previa</span>
							{#if previewSprite}
								<FishSprite sprite={previewSprite} scale={4} />
							{:else}
								<span class="hint">dibuja en el lienzo</span>
							{/if}
						</div>

						<div class="fields">
							<input
								bind:value={name}
								placeholder="tu nombre"
								maxlength="40"
								disabled={submitting}
							/>
							<input
								bind:value={url}
								placeholder="https://tu-sitio.com"
								type="url"
								disabled={submitting}
							/>
							{#if errorMsg}<p class="error">{errorMsg}</p>{/if}
							<button
								class="submit"
								on:click={submit}
								disabled={submitting || !previewSprite}
							>
								{submitting ? "enviando..." : "dejar mi pez en el océano"}
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* ── overlay & modal ── */
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

	.modal {
		position: relative;
		width: 100%;
		max-width: 900px;
		height: 90vh;
		background: rgba(0, 10, 30, 0.96);
		border: 1px solid rgba(130, 200, 255, 0.2);
		overflow: hidden;
		color: #c8e8f8;
		font-family: monospace;
	}

	.close-btn {
		position: absolute;
		top: 0.6rem;
		right: 0.75rem;
		z-index: 2;
		background: transparent;
		border: none;
		color: rgba(200, 232, 248, 0.4);
		font-size: 1.5rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 0.2rem;
		font-family: monospace;
	}

	.close-btn:hover {
		color: #c8e8f8;
	}

	/* ── two-column layout ── */
	.modal-body {
		display: grid;
		grid-template-columns: 1fr 300px;
		height: 100%;
	}

	.col-left {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1.25rem 1rem 1.25rem 1.25rem;
		overflow: hidden;
		border-right: 1px solid rgba(130, 200, 255, 0.1);
	}

	.col-right {
		padding: 0.85rem 1rem 1rem;
		padding-top: 2.4rem;
		overflow-y: auto;
		scrollbar-width: none;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		min-height: 0;
	}

	.col-right::-webkit-scrollbar {
		display: none;
	}

	/* ── canvas ── */
	.canvas {
		display: grid;
		grid-template-columns: repeat(var(--n), 1fr);
		gap: 1px;
		background: rgba(130, 200, 255, 0.07);
		border: 1px solid rgba(130, 200, 255, 0.12);
		padding: 1px;
		/* square, constrained by both column width and modal height */
		width: min(100%, calc(90vh - 2.5rem));
		aspect-ratio: 1;
		user-select: none;
		touch-action: none;
		cursor: crosshair;
	}

	.cell {
		aspect-ratio: 1;
		background: #040b14;
	}

	.cell:hover {
		filter: brightness(1.6);
	}

	/* ── controls ── */
	.controls-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.size-label {
		font-size: 0.72rem;
		color: rgba(200, 232, 248, 0.45);
		white-space: nowrap;
		min-width: 36px;
		text-align: center;
	}

	.size-btn {
		background: transparent;
		border: 1px solid rgba(130, 200, 255, 0.2);
		color: rgba(200, 232, 248, 0.55);
		font-family: monospace;
		font-size: 1rem;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		user-select: none;
		line-height: 1;
	}

	.size-btn:hover {
		color: #c8e8f8;
		border-color: rgba(130, 200, 255, 0.5);
	}
	.size-btn:active {
		background: rgba(130, 200, 255, 0.1);
	}

	.ctrl-btn {
		background: transparent;
		border: 1px solid rgba(130, 200, 255, 0.2);
		color: rgba(200, 232, 248, 0.5);
		font-family: monospace;
		font-size: 0.7rem;
		padding: 2px 7px;
		cursor: pointer;
		white-space: nowrap;
	}

	.ctrl-btn:hover:not(:disabled) {
		color: #c8e8f8;
		border-color: rgba(130, 200, 255, 0.5);
	}
	.ctrl-btn:disabled {
		opacity: 0.25;
		cursor: default;
	}

	/* ── tools ── */
	.tools-row {
		display: flex;
		gap: 3px;
		flex-wrap: wrap;
	}

	.tool-btn {
		background: transparent;
		border: 1px solid rgba(130, 200, 255, 0.2);
		color: rgba(200, 232, 248, 0.45);
		font-family: monospace;
		font-size: 0.7rem;
		padding: 3px 9px;
		cursor: pointer;
		white-space: nowrap;
	}

	.tool-btn:hover {
		color: #c8e8f8;
		border-color: rgba(130, 200, 255, 0.45);
	}

	.tool-btn.active {
		color: #c8e8f8;
		border-color: rgba(130, 200, 255, 0.65);
		background: rgba(130, 200, 255, 0.1);
	}

	/* ── templates ── */
	.tpl-row {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-wrap: wrap;
	}

	.tpl-btn {
		background: transparent;
		border: 1px solid rgba(130, 200, 255, 0.13);
		color: rgba(200, 232, 248, 0.35);
		font-family: monospace;
		font-size: 0.65rem;
		padding: 2px 7px;
		cursor: pointer;
		white-space: nowrap;
	}

	.tpl-btn:hover {
		color: rgba(200, 232, 248, 0.65);
		border-color: rgba(130, 200, 255, 0.3);
	}

	/* ── section label ── */
	.section-label {
		font-size: 0.62rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: rgba(130, 200, 255, 0.4);
		white-space: nowrap;
	}

	/* ── palette grid 4×8 ── */
	.palette-section {
		display: flex;
		flex-direction: column;
	}

	.palette-grid {
		display: grid;
		grid-template-columns: repeat(8, 16px);
		grid-template-rows: repeat(4, 16px);
		gap: 2px;
	}

	.pal-swatch {
		width: 16px;
		height: 16px;
		border: 1px solid rgba(0, 0, 0, 0.25);
		cursor: pointer;
		padding: 0;
	}

	.pal-swatch:hover { filter: brightness(1.25); }

	.pal-swatch.active {
		outline: 2px solid #c8e8f8;
		outline-offset: 1px;
		z-index: 1;
	}

	/* ── preview ── */
	.preview-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.3rem;
	}

	.hint {
		font-size: 0.7rem;
		color: rgba(200, 232, 248, 0.22);
	}

	/* ── form ── */
	.fields {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	input {
		background: rgba(0, 10, 30, 0.6);
		border: 1px solid rgba(130, 200, 255, 0.2);
		color: #c8e8f8;
		font-family: monospace;
		font-size: 0.8rem;
		padding: 0.3rem 0.5rem;
		outline: none;
		width: 100%;
	}

	input:focus {
		border-color: rgba(130, 200, 255, 0.5);
	}
	input::placeholder {
		color: rgba(200, 232, 248, 0.28);
	}

	.error {
		font-size: 0.7rem;
		color: rgba(255, 120, 100, 0.8);
		margin: 0;
	}

	.submit {
		background: rgba(0, 10, 30, 0.72);
		border: 1px solid rgba(130, 200, 255, 0.35);
		color: #c8e8f8;
		font-family: monospace;
		font-size: 0.78rem;
		padding: 0.4rem 0.75rem;
		cursor: pointer;
		letter-spacing: 0.04em;
		width: 100%;
	}

	.submit:hover:not(:disabled) {
		border-color: rgba(130, 200, 255, 0.7);
	}
	.submit:disabled {
		opacity: 0.4;
		cursor: default;
	}

	/* ── done screen ── */
	.done {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.25rem;
		height: 100%;
		padding: 2rem;
		text-align: center;
	}

	.done p {
		font-size: 0.9rem;
		color: #c8e8f8;
	}

	.done-links {
		display: flex;
		gap: 1rem;
		align-items: center;
	}

	.done-links a {
		color: rgba(200, 232, 248, 0.65);
		font-family: monospace;
		font-size: 0.8rem;
		text-decoration: none;
	}

	.done-links a:hover {
		color: #c8e8f8;
	}

	.done-close {
		background: transparent;
		border: 1px solid rgba(130, 200, 255, 0.25);
		color: rgba(200, 232, 248, 0.55);
		font-family: monospace;
		font-size: 0.8rem;
		padding: 0.2rem 0.7rem;
		cursor: pointer;
	}

	.done-close:hover {
		color: #c8e8f8;
		border-color: rgba(130, 200, 255, 0.5);
	}

	/* ── mobile ── */
	@media (max-width: 640px) {
		.overlay {
			padding: 0;
		}

		.modal {
			height: 100dvh;
			max-width: 100%;
			border: none;
			border-top: 1px solid rgba(130, 200, 255, 0.2);
		}

		.modal-body {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
			overflow-y: auto;
			height: 100%;
		}

		.col-left {
			border-right: none;
			border-bottom: 1px solid rgba(130, 200, 255, 0.1);
			padding: 1rem;
		}

		.canvas {
			width: min(100%, calc(100dvh * 0.45));
		}

		.col-right {
			overflow-y: visible;
			padding-top: 1rem;
		}
	}
</style>
