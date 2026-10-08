import { FISH_PREFIX, type Bindings, type Fish, type FishMeta } from '@shared';

export async function listFish(env: Bindings, cursor?: string): Promise<{ fish: Fish[]; cursor: string | null }>
{
	const result = await env.FISH_KV.list<FishMeta>({
		prefix: FISH_PREFIX,
		limit: 100,
		...(cursor ? { cursor } : {}),
	});

	const fish = await Promise.all(
		result.keys.map((k) => env.FISH_KV.get<Fish>(k.name, 'json')),
	);

	return {
		fish: fish.filter(Boolean) as Fish[],
		cursor: result.list_complete ? null : result.cursor,
	};
}
