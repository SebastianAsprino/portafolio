import type { Fish } from './types';

export const FISH_PREFIX = 'fish:';
export const PENDING_PREFIX = 'pending:';

export const keys = {
	fish: (fish: Pick<Fish, 'createdAt' | 'id'>) => `${FISH_PREFIX}${fish.createdAt}:${fish.id}`,
	pending: (id: string) => `${PENDING_PREFIX}${id}`,
	spriteHash: (hash: string) => `hash:${hash}`,
};
