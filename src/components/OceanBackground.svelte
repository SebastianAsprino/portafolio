<script>
	import { onMount } from "svelte";
	import { FISH_COLORS, API_URL } from "../lib/fish";

	let canvas;

	onMount(() => {
		const ctx = canvas.getContext("2d");

		const w = window.innerWidth;
		const VW = w < 600 ? 240 : w < 1024 ? 320 : 480;
		const VH = w < 600 ? 135 : w < 1024 ? 180 : 270;
		canvas.width = VW;
		canvas.height = VH;

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

		function depthColor(vx, vy) {
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
			const p = alpha > bayer(vx, vy) ? hi : lo;
			return [p.r, p.g, p.b];
		}

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

		function rayLevel(vx, vy, off) {
			const t = vy / (VH - 1);
			let peak = 0;
			for (const r of RAYS) {
				const cx = (r.xc0 + off + t * (r.xc1 - r.xc0)) * VW;
				const hw = (r.hw0 + t * (r.hw1 - r.hw0)) * VW;
				const dist = Math.abs(vx - cx);
				if (dist < hw) {
					const n = 1 - dist / hw;
					peak = Math.max(peak, n * n * r.b);
				}
			}
			if (peak <= 0) return 0;
			const scaled = peak * (RAY_LEVELS - 1);
			const lo = Math.floor(scaled);
			return Math.min(
				RAY_LEVELS - 1,
				scaled - lo > bayer(vx, vy) ? lo + 1 : lo,
			);
		}

		let fishData = [];
		let spawnIndex = 0;

		function spawnFish(forceX, fd) {
			if (!fd) {
				fd = fishData[spawnIndex % fishData.length];
				spawnIndex++;
			}
			const sprite = fd.sprite;
			const dir = Math.random() < 0.5 ? 1 : -1;
			const spriteW = sprite[0].length;
			const x =
				forceX !== undefined ? forceX : dir === 1 ? -spriteW - 1 : VW + 1;
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

		function scareFish(cx, cy) {
			for (const fish of fishes) {
				const fw = fish.sprite[0].length;
				const fx = fish.x + fw / 2;
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

		const fishes = [];

		function drawFish(d, fish) {
			const sp = fish.sprite;
			const nR = sp.length;
			const nC = sp[0].length;
			const ox = Math.round(fish.x);
			const oy = Math.round(
				fish.yBase +
					Math.sin(fish.phase + fish.age * fish.oscFreq) * fish.oscAmp,
			);
			const flip = fish.dir === -1;

			for (let row = -1; row <= nR; row++) {
				for (let col = -1; col <= nC; col++) {
					const sc = flip ? nC - 1 - col : col;
					const val =
						row >= 0 && row < nR && col >= 0 && col < nC && sc >= 0 && sc < nC
							? sp[row][sc]
							: 0;
					if (val !== 0) continue;
					let solid = false;
					for (const [dr, dc] of [
						[-1, 0],
						[1, 0],
						[0, -1],
						[0, 1],
					]) {
						const nr = row + dr,
							nc = col + dc;
						const nsc = flip ? nC - 1 - nc : nc;
						if (
							nr >= 0 &&
							nr < nR &&
							nc >= 0 &&
							nc < nC &&
							nsc >= 0 &&
							nsc < nC &&
							sp[nr][nsc] !== 0
						) {
							solid = true;
							break;
						}
					}
					if (!solid) continue;
					const px = ox + col,
						py = oy + row;
					if (px >= 0 && px < VW && py >= 0 && py < VH) {
						const i = (py * VW + px) << 2;
						d[i] = 8;
						d[i + 1] = 10;
						d[i + 2] = 18;
						d[i + 3] = 255;
					}
				}
			}

			for (let row = 0; row < nR; row++) {
				for (let col = 0; col < nC; col++) {
					const sc = flip ? nC - 1 - col : col;
					const val = sp[row][sc];
					if (val === 0) continue;
					const px = ox + col,
						py = oy + row;
					if (px < 0 || px >= VW || py < 0 || py >= VH) continue;
					const i = (py * VW + px) << 2;
					const [cr, cg, cb] = FISH_COLORS[val - 1] ?? FISH_COLORS[0];
					d[i] = cr;
					d[i + 1] = cg;
					d[i + 2] = cb;
					d[i + 3] = 255;
				}
			}
		}

		const NPART = 45;
		const parts = Array.from({ length: NPART }, () => ({
			x: (Math.random() * VW) | 0,
			y: (Math.random() * VH) | 0,
			sz: Math.random() < 0.2 ? 2 : 1,
			period: 5 + ((Math.random() * 9) | 0),
			timer: (Math.random() * 12) | 0,
			alpha: 0.4 + Math.random() * 0.6,
		}));

		const NCAUST = 12;
		const causts = Array.from({ length: NCAUST }, (_, i) => ({
			x: ((VW / NCAUST) * i + Math.random() * 14) | 0,
			y: (2 + Math.random() * 20) | 0,
			len: 5 + ((Math.random() * 12) | 0),
			period: 5 + ((Math.random() * 14) | 0),
			timer: (Math.random() * 14) | 0,
			on: Math.random() > 0.3,
		}));

		let frame = 0,
			rayOff = 0,
			rayDir = 1;
		let rafId;

		function tick() {
			const img = ctx.createImageData(VW, VH);
			const d = img.data;

			for (let vy = 0; vy < VH; vy++) {
				const isLayer = vy > 0 && vy % 11 === 0;
				for (let vx = 0; vx < VW; vx++) {
					let [r, g, b] = depthColor(vx, vy);
					if (isLayer) {
						r = Math.min(255, r + 5);
						g = Math.min(255, g + 7);
						b = Math.min(255, b + 6);
					}
					const lvl = rayLevel(vx, vy, rayOff);
					if (lvl > 0) {
						const s = RAY_STRENGTH[lvl];
						r = (r + (RC[0] - r) * s + 0.5) | 0;
						g = (g + (RC[1] - g) * s + 0.5) | 0;
						b = (b + (RC[2] - b) * s + 0.5) | 0;
					}
					const idx = (vy * VW + vx) << 2;
					d[idx] = r;
					d[idx + 1] = g;
					d[idx + 2] = b;
					d[idx + 3] = 255;
				}
			}

			for (const c of causts) {
				if (!c.on || c.y >= VH) continue;
				for (let i = 0; i < c.len; i++) {
					const cx = (c.x + i) % VW;
					const idx = (c.y * VW + cx) << 2;
					d[idx] = Math.min(255, d[idx] + 55);
					d[idx + 1] = Math.min(255, d[idx + 1] + 70);
					d[idx + 2] = Math.min(255, d[idx + 2] + 45);
				}
			}

			for (const f of fishes) drawFish(d, f);

			for (const p of parts) {
				for (let dy = 0; dy < p.sz; dy++) {
					for (let dx = 0; dx < p.sz; dx++) {
						const px = p.x + dx,
							py = p.y + dy;
						if (px >= 0 && px < VW && py >= 0 && py < VH) {
							const idx = (py * VW + px) << 2;
							const a = p.alpha;
							d[idx] = Math.min(255, (d[idx] + (195 - d[idx]) * a) | 0);
							d[idx + 1] = Math.min(
								255,
								(d[idx + 1] + (228 - d[idx + 1]) * a) | 0,
							);
							d[idx + 2] = 255;
							d[idx + 3] = 255;
						}
					}
				}
			}

			ctx.putImageData(img, 0, 0);

			frame++;

			if (frame % 6 === 0) {
				rayOff += rayDir * 0.002;
				if (Math.abs(rayOff) > 0.045) rayDir *= -1;
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
				const w = f.sprite[0].length;
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

			rafId = requestAnimationFrame(tick);
		}

		rafId = requestAnimationFrame(tick);

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
						const target = Math.min(fishData.length * 2, 32);
						while (fishes.length < target) {
							fishes.push(spawnFish(wasEmpty ? Math.random() * VW : undefined));
						}
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
			window.removeEventListener("fish-created", onFishCreated);
			window.removeEventListener("click", onTap);
		};
	});
</script>

<canvas bind:this={canvas}></canvas>

<style>
	canvas {
		position: fixed;
		inset: 0;
		width: 100vw;
		height: 100vh;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		-ms-interpolation-mode: nearest-neighbor;
		z-index: 0;
	}
</style>
