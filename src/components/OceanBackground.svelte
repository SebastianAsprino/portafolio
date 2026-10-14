<script>
	import { onMount } from "svelte";
	import { FISH_COLORS, API_URL } from "../lib/fish";

	let canvas;

	onMount(() => {
		const ctx = canvas.getContext("2d");

		const DEPTH = [
			{ t: 0.0, r: 28, g: 128, b: 178 },
			{ t: 0.08, r: 18, g: 96, b: 145 },
			{ t: 0.2, r: 11, g: 68, b: 112 },
			{ t: 0.38, r: 6, g: 46, b: 84 },
			{ t: 0.58, r: 3, g: 28, b: 56 },
			{ t: 0.75, r: 1, g: 16, b: 36 },
			{ t: 0.9, r: 0, g: 9, b: 22 },
			{ t: 1.0, r: 0, g: 4, b: 12 },
		];

		const BAYER = [
			[0, 8, 2, 10],
			[12, 4, 14, 6],
			[3, 11, 1, 9],
			[15, 7, 13, 5],
		];
		const bayer = (x, y) => BAYER[y & 3][x & 3] / 16.0;

		const RAYS = [
			{ xc0: 0.04, xc1: 0.3, hw0: 0.018, hw1: 0.075, b: 0.82 },
			{ xc0: 0.15, xc1: 0.42, hw0: 0.01, hw1: 0.042, b: 0.56 },
			{ xc0: 0.36, xc1: 0.63, hw0: 0.032, hw1: 0.115, b: 1.0 },
			{ xc0: 0.55, xc1: 0.8, hw0: 0.016, hw1: 0.06, b: 0.74 },
			{ xc0: 0.72, xc1: 0.94, hw0: 0.011, hw1: 0.042, b: 0.46 },
		];
		const RC = [182, 230, 255];
		const RAY_LEVELS = 5;
		const RAY_STRENGTH = [0, 0.13, 0.32, 0.56, 0.82];

		// La simulación avanza a 60 pasos/s sin importar el refresco de la pantalla;
		// en dispositivos táctiles se dibuja a 30 fps para ahorrar batería.
		const STEP_MS = 1000 / 60;
		const MIN_FRAME_MS = matchMedia("(pointer: coarse)").matches ? 1000 / 30 : 0;

		let VW = 0,
			VH = 0,
			img,
			depth,
			bg,
			peak,
			parts = [],
			causts = [];
		let maxFish = 32;
		let bgDirty = true;

		// Resolución virtual con el mismo aspecto que la pantalla, así los píxeles
		// quedan cuadrados en lugar de estirarse en celulares verticales.
		function virtualSize() {
			const w = canvas.clientWidth || window.innerWidth;
			const h = canvas.clientHeight || window.innerHeight;
			const vw = w < 600 ? Math.max(120, Math.round(w / 2.5)) : w < 1024 ? 320 : 480;
			return [vw, Math.max(60, Math.round((vw * h) / w))];
		}

		function buildDepth() {
			depth = new Uint8ClampedArray(VW * VH * 4);
			for (let vy = 0; vy < VH; vy++) {
				const t = vy / (VH - 1);
				let lo = DEPTH[0],
					hi = DEPTH[1];
				for (let i = 0; i < DEPTH.length - 1; i++) {
					if (t <= DEPTH[i + 1].t) {
						lo = DEPTH[i];
						hi = DEPTH[i + 1];
						break;
					}
				}
				const span = hi.t - lo.t;
				const alpha = span < 1e-6 ? 0 : (t - lo.t) / span;
				const isLayer = vy > 0 && vy % 11 === 0;
				for (let vx = 0; vx < VW; vx++) {
					const p = alpha > bayer(vx, vy) ? hi : lo;
					const idx = (vy * VW + vx) << 2;
					depth[idx] = isLayer ? p.r + 5 : p.r;
					depth[idx + 1] = isLayer ? p.g + 7 : p.g;
					depth[idx + 2] = isLayer ? p.b + 6 : p.b;
					depth[idx + 3] = 255;
				}
			}
		}

		// Fondo + rayos de luz; solo se recalcula cuando los rayos se mueven.
		function buildBackground() {
			bg.set(depth);
			// En 16:9 G === VW (igual que el diseño original). En vertical los rayos
			// se calculan sobre un ancho mayor y centrado para no quedar como líneas.
			const G = Math.max(VW, Math.sqrt((VW * VH * 16) / 9));
			for (let vy = 0; vy < VH; vy++) {
				const t = vy / (VH - 1);
				peak.fill(0);
				let minX = VW,
					maxX = -1;
				for (const r of RAYS) {
					const cx = VW / 2 + (r.xc0 + rayOff + t * (r.xc1 - r.xc0) - 0.5) * G;
					const hw = (r.hw0 + t * (r.hw1 - r.hw0)) * G;
					const x0 = Math.max(0, Math.ceil(cx - hw));
					const x1 = Math.min(VW - 1, Math.floor(cx + hw));
					for (let vx = x0; vx <= x1; vx++) {
						const dist = Math.abs(vx - cx);
						if (dist >= hw) continue;
						const n = 1 - dist / hw;
						const v = n * n * r.b;
						if (v > peak[vx]) peak[vx] = v;
					}
					if (x0 < minX) minX = x0;
					if (x1 > maxX) maxX = x1;
				}
				for (let vx = minX; vx <= maxX; vx++) {
					if (peak[vx] <= 0) continue;
					const scaled = peak[vx] * (RAY_LEVELS - 1);
					const lo = Math.floor(scaled);
					const lvl = Math.min(
						RAY_LEVELS - 1,
						scaled - lo > bayer(vx, vy) ? lo + 1 : lo,
					);
					if (lvl === 0) continue;
					const s = RAY_STRENGTH[lvl];
					const idx = (vy * VW + vx) << 2;
					bg[idx] = (bg[idx] + (RC[0] - bg[idx]) * s + 0.5) | 0;
					bg[idx + 1] = (bg[idx + 1] + (RC[1] - bg[idx + 1]) * s + 0.5) | 0;
					bg[idx + 2] = (bg[idx + 2] + (RC[2] - bg[idx + 2]) * s + 0.5) | 0;
				}
			}
			bgDirty = false;
		}

		function setup() {
			const oldVW = VW,
				oldVH = VH;
			[VW, VH] = virtualSize();
			if (VW === oldVW && VH === oldVH) return;

			canvas.width = VW;
			canvas.height = VH;
			img = ctx.createImageData(VW, VH);
			bg = new Uint8ClampedArray(VW * VH * 4);
			peak = new Float32Array(VW);
			buildDepth();
			bgDirty = true;

			maxFish = Math.min(32, Math.max(10, Math.round((VW * VH) / 4000)));
			if (oldVW) {
				for (const f of fishes) {
					f.x *= VW / oldVW;
					f.yBase = Math.max(24, Math.min(VH - 26, (f.yBase * VH) / oldVH));
				}
			}
			if (fishes.length > maxFish) fishes.length = maxFish;
			fillFish(false);

			const npart = Math.max(20, Math.round((45 * VW * VH) / (480 * 270)));
			parts = Array.from({ length: npart }, () => ({
				x: (Math.random() * VW) | 0,
				y: (Math.random() * VH) | 0,
				sz: Math.random() < 0.2 ? 2 : 1,
				period: 5 + ((Math.random() * 9) | 0),
				timer: (Math.random() * 12) | 0,
				alpha: 0.4 + Math.random() * 0.6,
			}));

			const NCAUST = 12;
			causts = Array.from({ length: NCAUST }, (_, i) => ({
				x: ((VW / NCAUST) * i + Math.random() * 14) | 0,
				y: (2 + Math.random() * 20) | 0,
				len: 5 + ((Math.random() * 12) | 0),
				period: 5 + ((Math.random() * 14) | 0),
				timer: (Math.random() * 14) | 0,
				on: Math.random() > 0.3,
			}));
		}

		// Cada sprite se compila una sola vez a listas planas de píxeles
		// (contorno + cuerpo con su color ya resuelto).
		const compiled = new WeakMap();
		function compileSprite(sp) {
			let c = compiled.get(sp);
			if (c) return c;
			const nR = sp.length;
			const nC = sp[0].length;
			const filled = (row, col) =>
				row >= 0 && row < nR && col >= 0 && col < nC && sp[row][col] !== 0;
			const outline = [];
			const body = [];
			for (let row = -1; row <= nR; row++) {
				for (let col = -1; col <= nC; col++) {
					if (filled(row, col)) {
						const [cr, cg, cb] = FISH_COLORS[sp[row][col] - 1] ?? FISH_COLORS[0];
						body.push(col, row, cr, cg, cb);
					} else if (
						filled(row - 1, col) ||
						filled(row + 1, col) ||
						filled(row, col - 1) ||
						filled(row, col + 1)
					) {
						outline.push(col, row);
					}
				}
			}
			c = { w: nC, outline: Int16Array.from(outline), body: Int16Array.from(body) };
			compiled.set(sp, c);
			return c;
		}

		let fishData = [];
		let spawnIndex = 0;

		function spawnFish(forceX, fd) {
			if (!fd) {
				fd = fishData[spawnIndex % fishData.length];
				spawnIndex++;
			}
			const sprite = compileSprite(fd.sprite);
			const dir = Math.random() < 0.5 ? 1 : -1;
			const x =
				forceX !== undefined ? forceX : dir === 1 ? -sprite.w - 1 : VW + 1;
			return {
				sprite,
				x,
				yBase: 24 + Math.random() * (VH - 50),
				dir,
				speed: 0.22 + Math.random() * 0.52,
				oscAmp: 1 + Math.random() * 3,
				oscFreq: 0.033 + Math.random() * 0.044,
				phase: Math.random() * Math.PI * 2,
				age: 0,
				scareTimer: 0,
				scareSpdBoost: 0,
				scareYVel: 0,
			};
		}

		const fishes = [];

		function fillFish(scatter) {
			if (!fishData.length) return;
			const target = Math.min(fishData.length * 2, maxFish);
			while (fishes.length < target) {
				fishes.push(spawnFish(scatter ? Math.random() * VW : undefined));
			}
		}

		function scareFish(cx, cy) {
			for (const fish of fishes) {
				const fx = fish.x + fish.sprite.w / 2;
				const fy = fish.yBase;
				const dx = fx - cx;
				const dy = fy - cy;
				const dist = Math.sqrt(dx * dx + dy * dy) || 1;
				const strength = Math.max(0, 1 - dist / (VW * 0.85));

				fish.dir = dx >= 0 ? 1 : -1;
				fish.scareTimer = (18 + Math.random() * 12) | 0;
				fish.scareSpdBoost = fish.speed * (1 + strength * 2.5);
				fish.scareYVel = (dy / dist) * strength * 0.9;
			}
		}

		function drawFish(d, fish) {
			const { w, outline, body } = fish.sprite;
			const ox = Math.round(fish.x);
			const oy = Math.round(
				fish.yBase +
					Math.sin(fish.phase + fish.age * fish.oscFreq) * fish.oscAmp,
			);
			const flip = fish.dir === -1;

			for (let k = 0; k < outline.length; k += 2) {
				const px = ox + (flip ? w - 1 - outline[k] : outline[k]);
				const py = oy + outline[k + 1];
				if (px < 0 || px >= VW || py < 0 || py >= VH) continue;
				const i = (py * VW + px) << 2;
				d[i] = 8;
				d[i + 1] = 10;
				d[i + 2] = 18;
			}

			for (let k = 0; k < body.length; k += 5) {
				const px = ox + (flip ? w - 1 - body[k] : body[k]);
				const py = oy + body[k + 1];
				if (px < 0 || px >= VW || py < 0 || py >= VH) continue;
				const i = (py * VW + px) << 2;
				d[i] = body[k + 2];
				d[i + 1] = body[k + 3];
				d[i + 2] = body[k + 4];
			}
		}

		let frame = 0,
			rayOff = 0,
			rayDir = 1;
		let rafId;

		function render() {
			if (bgDirty) buildBackground();
			const d = img.data;
			d.set(bg);

			for (const c of causts) {
				if (!c.on || c.y >= VH) continue;
				for (let i = 0; i < c.len; i++) {
					const cx = (c.x + i) % VW;
					const idx = (c.y * VW + cx) << 2;
					d[idx] = d[idx] + 55;
					d[idx + 1] = d[idx + 1] + 70;
					d[idx + 2] = d[idx + 2] + 45;
				}
			}

			for (const f of fishes) drawFish(d, f);

			for (const p of parts) {
				const a = p.alpha;
				for (let dy = 0; dy < p.sz; dy++) {
					for (let dx = 0; dx < p.sz; dx++) {
						const px = p.x + dx,
							py = p.y + dy;
						if (px >= 0 && px < VW && py >= 0 && py < VH) {
							const idx = (py * VW + px) << 2;
							d[idx] = d[idx] + (195 - d[idx]) * a;
							d[idx + 1] = d[idx + 1] + (228 - d[idx + 1]) * a;
							d[idx + 2] = 255;
						}
					}
				}
			}

			ctx.putImageData(img, 0, 0);
		}

		function update() {
			frame++;

			if (frame % 6 === 0) {
				rayOff += rayDir * 0.002;
				if (Math.abs(rayOff) > 0.045) rayDir *= -1;
				bgDirty = true;
			}

			for (const f of fishes) {
				f.age++;
				if (f.scareTimer > 0) {
					const t = f.scareTimer / 60;
					f.x += f.dir * (f.speed + f.scareSpdBoost * t);
					f.yBase = Math.max(24, Math.min(VH - 26, f.yBase + f.scareYVel * t));
					f.scareTimer--;
				} else {
					f.x += f.dir * f.speed;
				}
				const w = f.sprite.w;
				const gone = f.dir === 1 ? f.x > VW + w + 2 : f.x < -w - 2;
				if (gone) Object.assign(f, spawnFish());
			}

			for (const p of parts) {
				if (++p.timer >= p.period) {
					p.timer = 0;
					if (--p.y < 0) {
						p.y = VH - 1;
						p.x = (Math.random() * VW) | 0;
						p.alpha = 0.38 + Math.random() * 0.62;
					}
				}
			}

			for (const c of causts) {
				if (++c.timer >= c.period) {
					c.timer = 0;
					c.x = (c.x + (((Math.random() * 7) | 0) - 2) + VW) % VW;
					c.on = Math.random() > 0.22;
				}
			}
		}

		let last = performance.now(),
			acc = 0;

		function loop(now) {
			rafId = requestAnimationFrame(loop);
			const dt = now - last;
			if (dt < MIN_FRAME_MS - 2) return;
			last = now;
			// Tope para no "ponerse al día" de golpe al volver de una pestaña oculta.
			acc += Math.min(dt, 250);
			let stepped = false;
			while (acc >= STEP_MS) {
				update();
				acc -= STEP_MS;
				stepped = true;
			}
			if (stepped) render();
		}

		setup();
		rafId = requestAnimationFrame(loop);

		let resizeTimer;
		const onResize = () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(setup, 150);
		};
		window.addEventListener("resize", onResize);

		async function fetchFish() {
			fishData = [];
			let cur = undefined;
			try {
				do {
					const url = cur ? `${API_URL}/fish?cursor=${cur}` : `${API_URL}/fish`;
					const data = await fetch(url).then((r) => r.json());
					if (data.fish?.length) {
						const wasEmpty = fishes.length === 0;
						fishData.push(...data.fish);
						fillFish(wasEmpty);
					}
					cur = data.cursor;
				} while (cur);
			} catch {}
		}

		const onFishCreated = () => fetchFish();
		window.addEventListener("fish-created", onFishCreated);

		const onTap = (e) => {
			const rect = canvas.getBoundingClientRect();
			const cx = ((e.clientX - rect.left) / rect.width) * VW;
			const cy = ((e.clientY - rect.top) / rect.height) * VH;
			scareFish(cx, cy);
		};
		window.addEventListener("click", onTap);

		fetchFish();

		return () => {
			cancelAnimationFrame(rafId);
			clearTimeout(resizeTimer);
			window.removeEventListener("resize", onResize);
			window.removeEventListener("fish-created", onFishCreated);
			window.removeEventListener("click", onTap);
		};
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		/* Alto fijo aunque aparezca/desaparezca la barra del navegador móvil */
		height: 100lvh;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		-ms-interpolation-mode: nearest-neighbor;
		z-index: 0;
	}
</style>
