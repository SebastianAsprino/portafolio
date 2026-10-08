import { Elysia, t } from 'elysia';
import { env } from 'cloudflare:workers';
import { htmlResponse, page } from '@shared';
import { resolveFish } from './command';

export const resolve = new Elysia()
	.post('/moderate/:id', async ({ params, body }) =>
	{
		const action = body.action === 'approve' ? 'approve' : 'reject';

		const result = await resolveFish(env, params.id, body.token ?? '', action);
		if (!result.ok) return htmlResponse(page('Error', `<p>${result.error}</p>`), result.status);

		return htmlResponse(page('Listo', `<p>pez ${result.data === 'approve' ? 'aprobado 🐟' : 'rechazado'}</p>`));
	}, {
		parse: 'urlencoded',
		body: t.Object({
			action: t.Optional(t.String()),
			token: t.Optional(t.String()),
		}),
	});
