// Widget de visitantes en vivo de Rybbit (https://rybbit.com/docs/embeds/widget).
// Es un iframe autocontenido: no se le puede meter CSS, solo se personaliza por
// parámetros de URL. Requiere `frame-src` en la CSP de public/_headers.

const RYBBIT_ORIGIN = "https://rybbit.asprino.dev";

// Mismo celeste que los bordes y labels del sitio: rgba(130, 200, 255).
const ACCENT = "82c8ff";

// Tamaños medidos con el widget renderizado. Si Rybbit cambia su CSS, revisar.
export const RYBBIT_INLINE_SIZE = { width: 184, height: 28 };
export const RYBBIT_CARD_SIZE = { width: 260, height: 230 };

type Variant = "inline" | "card";

export function rybbitWidgetUrl(siteId: string, variant: Variant): string {
	const params = new URLSearchParams({ variant, theme: "dark", accent: ACCENT });
	if (variant === "card") {
		// Ventana de 24 h para que el gráfico tenga barras; países fuera porque
		// el tráfico es local y la lista vacía solo ocupa alto.
		params.set("minutes", "1440");
		params.set("chart", "true");
		params.set("countries", "false");
	}
	return `${RYBBIT_ORIGIN}/widget/${encodeURIComponent(siteId)}?${params}`;
}
