import { escapeHtml, signModerationToken, spriteToHtml, type Bindings, type Fish } from '@shared';

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

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: env.MODERATION_FROM,
			to: env.MODERATION_EMAIL,
			subject: `Nuevo pez: ${fish.creatorName}`,
			html,
		}),
	});

	if (!res.ok) console.error('resend error', res.status, await res.text());
}
