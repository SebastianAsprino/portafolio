/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv
{
	/** URL base del worker de peces; si falta se usa la de producción. */
	readonly PUBLIC_FISH_API_URL?: string;
}

interface ImportMeta
{
	readonly env: ImportMetaEnv;
}
