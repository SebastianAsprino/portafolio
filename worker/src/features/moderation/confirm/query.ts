import type { Bindings, Fish, Result } from '@shared';
import { getVerifiedPending } from '../pending';

export const getFishToModerate = (env: Bindings, id: string, token: string): Promise<Result<Fish>> =>
	getVerifiedPending(env, id, token);
