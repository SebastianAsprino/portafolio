import { Elysia } from 'elysia';
import { FishRoutes } from './fish';
import { ModerationRoutes } from './moderation';

export const Routes = new Elysia()
	.use(FishRoutes)
	.use(ModerationRoutes);
