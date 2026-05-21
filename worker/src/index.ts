import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Env = {
	Bindings: {
		FISH_KV: KVNamespace;
	};
};

interface Fish
{
	id: string;
	sprite: number[][];
	creatorName: string;
	creatorUrl: string;
	createdAt: number;
}

type FishMeta = Omit<Fish, 'sprite'>;

const app = new Hono<Env>();

app.use('*', cors());

app.post('/fish', async (c) =>
{
	const body = await c.req.json<Pick<Fish, 'sprite' | 'creatorName' | 'creatorUrl'>>();

	const fish: Fish = {
		id: crypto.randomUUID(),
		sprite: body.sprite,
		creatorName: body.creatorName,
		creatorUrl: body.creatorUrl,
		createdAt: Date.now(),
	};

	const meta: FishMeta = {
		id: fish.id,
		creatorName: fish.creatorName,
		creatorUrl: fish.creatorUrl,
		createdAt: fish.createdAt,
	};

	await c.env.FISH_KV.put(
		`fish:${fish.createdAt}:${fish.id}`,
		JSON.stringify(fish),
		{ metadata: meta },
	);

	return c.json(fish, 201);
});

app.get('/fish', async (c) =>
{
	const cursor = c.req.query('cursor');

	const result = await c.env.FISH_KV.list<FishMeta>({
		prefix: 'fish:',
		limit: 100,
		...(cursor ? { cursor } : {}),
	});

	const fish = await Promise.all(
		result.keys.map((k) => c.env.FISH_KV.get<Fish>(k.name, 'json')),
	);

	return c.json({
		fish: fish.filter(Boolean) as Fish[],
		cursor: result.list_complete ? null : result.cursor,
	});
});

export default app;
