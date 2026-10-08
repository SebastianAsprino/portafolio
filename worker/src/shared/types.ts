export type Bindings = {
	FISH_KV: KVNamespace;
	FISH_RATE_LIMITER: RateLimit;
	RESEND_API_KEY: string;
	MODERATION_SECRET: string;
	MODERATION_EMAIL: string;
	MODERATION_FROM: string;
};

// Tipa el `env` que se importa de 'cloudflare:workers' (Elysia no lo pasa por el contexto).
declare global
{
	namespace Cloudflare
	{
		interface Env extends Bindings {}
	}
}

export interface Fish
{
	id: string;
	sprite: number[][];
	creatorName: string;
	creatorUrl: string;
	createdAt: number;
}

export type FishMeta = Omit<Fish, 'sprite'>;

type ErrorStatus = 400 | 403 | 404 | 409 | 429 | 503;

// Lo que devuelven commands y queries: el handler decide cómo traducirlo a HTTP (JSON o HTML).
export type Result<T> =
	| { ok: true; data: T }
	| { ok: false; status: ErrorStatus; error: string };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = (status: ErrorStatus, error: string): Result<never> => ({ ok: false, status, error });
