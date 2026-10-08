import { Elysia, t } from 'elysia';
import { env } from 'cloudflare:workers';
import { listFish } from './query';

export const list = new Elysia()
	.get('/fish', ({ query }) => listFish(env, query.cursor), {
		query: t.Object({ cursor: t.Optional(t.String()) }),
	});
