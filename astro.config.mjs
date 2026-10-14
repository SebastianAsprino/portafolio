import { defineConfig } from 'astro/config';

import svelte from "@astrojs/svelte";
import cspHeaders from "./src/integrations/csp-headers.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte(), cspHeaders()]
});