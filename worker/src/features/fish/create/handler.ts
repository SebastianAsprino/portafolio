import { Elysia, status } from 'elysia';
import { env, waitUntil } from 'cloudflare:workers';
import { createFishBody, refineCreateFishInput } from './validation';
import { createFish } from './command';
import { sendModerationEmail } from './notify';

export const create = new Elysia()
	// onRequest corre antes del parseo y la validación, así que un flood de basura también cuenta.
	.onRequest(async ({ request }) =>
	{
		if (request.method !== 'POST' || new URL(request.url).pathname !== '/fish') return;

		const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
		const { success } = await env.FISH_RATE_LIMITER.limit({ key: ip });
		if (!success) return status(429, { error: 'demasiados peces, espera un momento' });
	})
	.post('/fish', async ({ body, request }) =>
	{
		const input = refineCreateFishInput(body);
		if (!input.ok) return status(input.status, { error: input.error });

		const result = await createFish(env, input.data);
		if (!result.ok) return status(result.status, { error: result.error });

		waitUntil(sendModerationEmail(env, result.data, new URL(request.url).origin));

		return status(202, { status: 'pending', id: result.data.id });
	}, { body: createFishBody });
