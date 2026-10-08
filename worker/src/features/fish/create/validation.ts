import { t, type Static } from 'elysia';
import { FISH_COLORS, fail, ok, type Fish, type Result } from '@shared';

const MAX_SPRITE_SIZE = 40;
const MAX_NAME_LENGTH = 40;
const MAX_URL_LENGTH = 200;

const SPRITE_ERROR = 'sprite inválido';

// Forma del body: Elysia la valida antes de llegar al handler.
// El `error` va en cada nivel porque Elysia reporta el del schema más interno que falla.
export const createFishBody = t.Object({
	sprite: t.Array(
		t.Array(
			t.Integer({ minimum: 0, maximum: FISH_COLORS.length, error: SPRITE_ERROR }),
			{ minItems: 1, maxItems: MAX_SPRITE_SIZE, error: SPRITE_ERROR },
		),
		{ minItems: 1, maxItems: MAX_SPRITE_SIZE, error: SPRITE_ERROR },
	),
	creatorName: t.String({ maxLength: MAX_NAME_LENGTH, error: 'nombre inválido' }),
	creatorUrl: t.String({ maxLength: MAX_URL_LENGTH, error: 'url inválida' }),
});

export type CreateFishInput = Pick<Fish, 'sprite' | 'creatorName' | 'creatorUrl'>;

// Lo que el schema no expresa: filas parejas, al menos un pixel pintado.
function isPaintedRectangle(sprite: number[][]): boolean
{
	const cols = sprite[0].length;
	return sprite.every((row) => row.length === cols) && sprite.some((row) => row.some(Boolean));
}

// Solo http/https: la galería pinta creatorUrl como href, así que un javascript: sería XSS.
function normalizeUrl(raw: string): string | null
{
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
	try
	{
		const url = new URL(withScheme);
		if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
		return url.toString();
	}
	catch
	{
		return null;
	}
}

export function refineCreateFishInput(body: Static<typeof createFishBody>): Result<CreateFishInput>
{
	const creatorName = body.creatorName.trim();
	const creatorUrl = normalizeUrl(body.creatorUrl);

	if (!isPaintedRectangle(body.sprite)) return fail(400, SPRITE_ERROR);
	if (!creatorName) return fail(400, 'nombre inválido');
	if (!creatorUrl) return fail(400, 'url inválida');

	return ok({ sprite: body.sprite, creatorName, creatorUrl });
}
