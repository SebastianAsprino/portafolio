import { Elysia } from 'elysia';
import { confirm } from './confirm/handler';
import { resolve } from './resolve/handler';

export const ModerationRoutes = new Elysia()
	.use(confirm)
	.use(resolve);
