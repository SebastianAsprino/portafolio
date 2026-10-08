import { fail, keys, ok, verifyModerationToken, type Bindings, type Fish, type Result } from '@shared';

export type ModerationAction = 'approve' | 'reject';

// Paso común de confirm y resolve: el token del correo debe ser válido y el pez seguir en la cola.
export async function getVerifiedPending(env: Bindings, id: string, token: string): Promise<Result<Fish>>
{
	if (!(await verifyModerationToken(env.MODERATION_SECRET, id, token))) return fail(403, 'token inválido');

	const fish = await env.FISH_KV.get<Fish>(keys.pending(id), 'json');
	if (!fish) return fail(404, 'este pez ya fue moderado o expiró');

	return ok(fish);
}
