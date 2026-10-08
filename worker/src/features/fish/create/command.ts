import { PENDING_PREFIX, fail, keys, ok, sha256, type Bindings, type Fish, type Result } from '@shared';
import type { CreateFishInput } from './validation';

const MAX_PENDING = 20;
const PENDING_TTL = 60 * 60 * 24 * 7;
const DUPLICATE_TTL = 60 * 60 * 24;

// Un pez nuevo no se publica: queda en la cola `pending:` hasta que se apruebe por correo.
export async function createFish(env: Bindings, input: CreateFishInput): Promise<Result<Fish>>
{
	// El ataque fue el mismo sprite repetido: bloqueamos duplicados durante un día.
	const spriteHash = await sha256(JSON.stringify(input.sprite));
	if (await env.FISH_KV.get(keys.spriteHash(spriteHash))) return fail(409, 'ese pez ya fue enviado');

	// Tope de la cola para que un flood no se convierta en un flood de correos.
	const pending = await env.FISH_KV.list({ prefix: PENDING_PREFIX, limit: MAX_PENDING });
	if (pending.keys.length >= MAX_PENDING) return fail(503, 'la pecera está llena, intenta más tarde');

	const fish: Fish = {
		id: crypto.randomUUID(),
		...input,
		createdAt: Date.now(),
	};

	await Promise.all([
		env.FISH_KV.put(keys.pending(fish.id), JSON.stringify(fish), { expirationTtl: PENDING_TTL }),
		env.FISH_KV.put(keys.spriteHash(spriteHash), '1', { expirationTtl: DUPLICATE_TTL }),
	]);

	return ok(fish);
}
