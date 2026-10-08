const toHex = (buf: ArrayBuffer) =>
	[...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function sha256(data: string): Promise<string>
{
	return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data)));
}

async function hmac(secret: string, data: string): Promise<string>
{
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign'],
	);
	return toHex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
}

function timingSafeEqual(a: string, b: string): boolean
{
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

// Firma de los links de aprobar/rechazar que van en el correo.
export const signModerationToken = (secret: string, fishId: string) => hmac(secret, fishId);

export async function verifyModerationToken(secret: string, fishId: string, token: string): Promise<boolean>
{
	return timingSafeEqual(token, await hmac(secret, fishId));
}
