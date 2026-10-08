import { Elysia } from 'elysia';
import { create } from './create/handler';
import { list } from './list/handler';

export const FishRoutes = new Elysia()
	.use(create)
	.use(list);
