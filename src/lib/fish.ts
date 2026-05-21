export type RGB = [number, number, number];

// Valores 1-32 mapean directamente a estos colores. 0 = vacío/transparente.
// Los primeros 8 forman una paleta coherente de "pez naranja" para que
// los DEFAULT_SPRITES se vean correctamente con los colores originales.
export const FISH_COLORS: RGB[] = [
	// fila 1 – paleta pez naranja (compatibles con DEFAULT_SPRITES)
	[220, 105, 20],  //  1 naranja        (cuerpo)
	[255, 170, 80],  //  2 naranja claro  (vientre)
	[165, 65, 15],  //  3 naranja oscuro (aleta)
	[28, 22, 32],  //  4 negro          (ojo)
	[248, 230, 195],  //  5 crema          (brillo)
	[70, 25, 5],  //  6 muy oscuro     (sombra)
	[230, 190, 40],  //  7 amarillo       (banda)
	[255, 255, 255],  //  8 blanco         (reflejo)
	// fila 2 – rojos, rosas, violetas
	[185, 95, 15],  //  9 ámbar
	[198, 52, 40],  // 10 rojo
	[160, 25, 25],  // 11 rojo oscuro
	[255, 100, 60],  // 12 coral
	[220, 80, 140],  // 13 rosa
	[255, 155, 195],  // 14 rosa claro
	[175, 65, 205],  // 15 violeta
	[80, 35, 155],  // 16 morado
	// fila 3 – azules, cianes, verdes
	[30, 70, 185],  // 17 azul profundo
	[70, 115, 220],  // 18 azul
	[130, 180, 230],  // 19 azul claro
	[195, 220, 245],  // 20 azul pálido
	[55, 195, 225],  // 21 cian
	[25, 160, 155],  // 22 turquesa
	[40, 175, 95],  // 23 verde
	[15, 120, 60],  // 24 verde oscuro
	// fila 4 – lima, tierra, grises
	[130, 210, 80],  // 25 lima
	[218, 188, 32],  // 26 amarillo vivo
	[195, 155, 90],  // 27 arena
	[100, 60, 30],  // 28 marrón
	[200, 200, 205],  // 29 plata
	[110, 110, 115],  // 30 gris
	[55, 55, 60],  // 31 gris oscuro
	[245, 235, 205],  // 32 crema suave
];

export const DEFAULT_SPRITES: number[][][] = [
	[
		[0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 9, 3, 3, 3, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 3, 3, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
		[3, 0, 0, 1, 1, 1, 7, 1, 1, 7, 1, 1, 7, 1, 1, 1, 1, 1, 5, 0, 0, 0],
		[3, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0],
		[3, 3, 1, 1, 1, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 8, 1, 1, 1],
		[3, 3, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0],
		[3, 0, 0, 1, 1, 1, 7, 1, 1, 7, 1, 1, 7, 1, 1, 1, 1, 1, 5, 0, 0, 0],
		[0, 0, 0, 0, 3, 3, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 9, 3, 3, 3, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	],
	[
		[0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 9, 9, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 9, 3, 9, 0, 0, 0, 0, 0, 0],
		[0, 0, 9, 3, 1, 3, 9, 0, 0, 0, 0, 0],
		[0, 3, 3, 1, 5, 1, 3, 1, 0, 0, 0, 0],
		[0, 3, 1, 1, 2, 1, 1, 1, 1, 0, 0, 0],
		[3, 3, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0],
		[3, 3, 1, 1, 1, 1, 1, 1, 4, 8, 1, 0],
		[3, 3, 1, 1, 2, 1, 1, 1, 1, 1, 0, 0],
		[0, 3, 1, 1, 2, 1, 1, 1, 1, 0, 0, 0],
		[0, 3, 3, 1, 5, 1, 3, 1, 0, 0, 0, 0],
		[0, 0, 9, 3, 1, 3, 9, 0, 0, 0, 0, 0],
		[0, 0, 0, 9, 3, 9, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 9, 9, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0],
	],
	[
		[0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 3, 0, 0, 9, 1, 1, 1, 9, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 3, 3, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[3, 0, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
		[3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 8, 1, 1],
		[3, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
		[0, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 3, 0, 0, 9, 1, 1, 1, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 9, 9, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	],
	[
		[0, 9, 9, 0],
		[1, 1, 4, 1],
		[0, 1, 1, 0],
	],
];

export interface ApiFish
{
	id: string;
	sprite: number[][];
	creatorName: string;
	creatorUrl: string;
	createdAt: number;
}

export const API_URL = 'https://portafolio.asprinosebastian.workers.dev';
// export const API_URL = 'http://localhost:8787';

export function drawFishSprite(
	canvas: HTMLCanvasElement,
	sprite: number[][],
	scale = 4,
): void
{
	const nR = sprite.length;
	const nC = sprite[0]?.length ?? 0;
	canvas.width = nC * scale;
	canvas.height = nR * scale;
	const ctx = canvas.getContext('2d')!;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for (let r = 0; r < nR; r++)
	{
		for (let c = 0; c < nC; c++)
		{
			const val = sprite[r][c];
			if (!val) continue;
			const [cr, cg, cb] = FISH_COLORS[val - 1] ?? [128, 128, 128];
			ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
			ctx.fillRect(c * scale, r * scale, scale, scale);
		}
	}
}
