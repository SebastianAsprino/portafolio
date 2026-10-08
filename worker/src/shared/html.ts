import { FISH_COLORS } from './palette';

export function escapeHtml(s: string): string
{
	return s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

// Tabla HTML con bgcolor: es lo único que Gmail/Outlook renderizan de forma fiable (sin SVG ni canvas).
export function spriteToHtml(sprite: number[][], cell = 8): string
{
	const rows = sprite.map((row) =>
		`<tr>${row.map((v) =>
		{
			const bg = v ? `rgb(${FISH_COLORS[v - 1].join(',')})` : '#0b1a33';
			return `<td width="${cell}" height="${cell}" style="width:${cell}px;height:${cell}px;padding:0;background:${bg}"></td>`;
		}).join('')}</tr>`,
	).join('');
	return `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;line-height:0">${rows}</table>`;
}

export function page(title: string, body: string): string
{
	return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
		<title>${escapeHtml(title)}</title>
		<style>body{font-family:monospace;background:#0b1a33;color:#e6edf7;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px}
		button{font:inherit;padding:10px 18px;border:0;color:#fff;cursor:pointer}</style>
		</head><body><main>${body}</main></body></html>`;
}

// Se construye por request: el adapter de Cloudflare no admite Response creados antes de arrancar.
export function htmlResponse(body: string, status = 200): Response
{
	return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
