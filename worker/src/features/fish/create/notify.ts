import { escapeHtml, signModerationToken, spriteToHtml, type Bindings, type Fish } from '@shared';

const RESEND_API_URL = 'https://api.resend.com/emails';

export async function sendModerationEmail(env: Bindings, fish: Fish, origin: string): Promise<void>
{
	const token = await signModerationToken(env.MODERATION_SECRET, fish.id);
	const link = (action: 'approve' | 'reject') =>
		`${origin}/moderate/${fish.id}?action=${action}&token=${token}`;

	const html = `
		<div style="font-family:monospace;background:#0b1a33;color:#e6edf7;padding:24px">
			<h2 style="margin:0 0 16px">Nuevo pez pendiente</h2>
			${spriteToHtml(fish.sprite)}
			<p><b>Nombre:</b> ${escapeHtml(fish.creatorName)}</p>
			<p><b>URL:</b> ${escapeHtml(fish.creatorUrl)}</p>
			<p style="margin-top:24px">
				<a href="${link('approve')}" style="background:#28af5f;color:#fff;padding:10px 18px;text-decoration:none;margin-right:12px">Aprobar</a>
				<a href="${link('reject')}" style="background:#c63428;color:#fff;padding:10px 18px;text-decoration:none">Rechazar</a>
			</p>
			<p style="font-size:12px;color:#8899aa">Si no haces nada, se descarta solo en 7 días.</p>
		</div>`;

	let res: Response;
	try
	{
		res = await sendEmail(env, `Nuevo pez: ${fish.creatorName}`, html);
	}
	catch (err)
	{
		// corre en waitUntil: un fallo de red no debe quedar como rechazo sin manejar
		console.error('resend error', err);
		return;
	}

	if (!res.ok) console.error('resend error', res.status, await res.text());
}

function sendEmail(env: Bindings, subject: string, html: string): Promise<Response>
{
	return fetch(RESEND_API_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: env.MODERATION_FROM,
			to: env.MODERATION_EMAIL,
			subject,
			html,
		}),
	});
}
