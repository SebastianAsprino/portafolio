import { keys, ok, type Bindings, type FishMeta, type Result } from '@shared';
import { getVerifiedPending, type ModerationAction } from '../pending';

// Aprobar mueve el pez de `pending:` a `fish:` (público); rechazar solo lo saca de la cola.
export async function resolveFish(
	env: Bindings,
	id: string,
	token: string,
	action: ModerationAction,
): Promise<Result<ModerationAction>>
{
	const pending = await getVerifiedPending(env, id, token);
	if (!pending.ok) return pending;

	const fish = pending.data;

	if (action === 'approve')
	{
		const meta: FishMeta = {
			id: fish.id,
			creatorName: fish.creatorName,
			creatorUrl: fish.creatorUrl,
			createdAt: fish.createdAt,
		};
		await env.FISH_KV.put(keys.fish(fish), JSON.stringify(fish), { metadata: meta });
	}

	await env.FISH_KV.delete(keys.pending(id));

	return ok(action);
}
