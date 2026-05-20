import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Env = {
	Bindings: {
		FISH_KV: KVNamespace
	}
}

interface Fish {
	id: string
	sprite: number[][]
	creatorName: string
	creatorUrl: string
	createdAt: number
}

const app = new Hono<Env>()

app.use('*', cors())

app.post('/fish', async (c) => {
	const body = await c.req.json<Pick<Fish, 'sprite' | 'creatorName' | 'creatorUrl'>>()

	const fish: Fish = {
		id: crypto.randomUUID(),
		sprite: body.sprite,
		creatorName: body.creatorName,
		creatorUrl: body.creatorUrl,
		createdAt: Date.now(),
	}

	await c.env.FISH_KV.put(
		`fish:${fish.createdAt}:${fish.id}`,
		JSON.stringify(fish),
		{ metadata: fish },
	)

	return c.json(fish, 201)
})

app.get('/fish', async (c) => {
	const cursor = c.req.query('cursor')

	const result = await c.env.FISH_KV.list<Fish>({
		prefix: 'fish:',
		limit: 10,
		...(cursor ? { cursor } : {}),
	})

	return c.json({
		fish: result.keys.map((k) => k.metadata).filter(Boolean) as Fish[],
		cursor: result.list_complete ? null : result.cursor,
	})
})

export default app
