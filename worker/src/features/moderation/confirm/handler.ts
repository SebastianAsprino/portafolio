import { Elysia, t } from 'elysia';
import { env } from 'cloudflare:workers';
import { escapeHtml, htmlResponse, page, spriteToHtml } from '@shared';
import { getFishToModerate } from './query';

// GET solo muestra la confirmación: los escáneres de correo abren los links,
// así que la acción real va por POST (slice resolve).
export const confirm = new Elysia()
	.get('/moderate/:id', async ({ params, query }) =>
	{
		const action = query.action === 'approve' ? 'approve' : 'reject';
		const token = query.token ?? '';

		const result = await getFishToModerate(env, params.id, token);
		if (!result.ok) return htmlResponse(page('Error', `<p>${result.error}</p>`), result.status);

		const fish = result.data;
		const label = action === 'approve' ? 'Aprobar' : 'Rechazar';
		const color = action === 'approve' ? '#28af5f' : '#c63428';

		return htmlResponse(page(label, `
			<h2>${label} pez</h2>
			${spriteToHtml(fish.sprite)}
			<p>${escapeHtml(fish.creatorName)} · ${escapeHtml(fish.creatorUrl)}</p>
			<form method="post">
				<input type="hidden" name="action" value="${action}">
				<input type="hidden" name="token" value="${escapeHtml(token)}">
				<button style="background:${color}">${label}</button>
			</form>`));
	}, {
		query: t.Object({
			action: t.Optional(t.String()),
			token: t.Optional(t.String()),
		}),
	});
