import { vitePreprocess } from '@astrojs/svelte';

export default {
  preprocess: vitePreprocess({
    typescript: true, // Habilita TypeScript explícitamente
  }),
};