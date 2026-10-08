import { Elysia, status } from 'elysia';
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker';
import { cors } from '@elysiajs/cors';
import { Routes } from './features';

export default new Elysia({ adapter: CloudflareAdapter })
	.use(cors())
	// El frontend lee `error` del JSON: los errores de Elysia se devuelven con esa misma forma.
	.onError(({ code, error }) =>
	{
		if (code === 'VALIDATION') return status(400, { error: typeof error.customError === 'string' ? error.customError : 'datos inválidos' });
		if (code === 'PARSE') return status(400, { error: 'json inválido' });
	})
	.use(Routes)
	// Requerido por el adapter de Cloudflare.
	.compile();
