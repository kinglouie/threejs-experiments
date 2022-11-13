import { sveltekit } from '@sveltejs/kit/vite';
import glslify from 'rollup-plugin-glslify';

const config = {
  server: {
    port: 4000
  },
	plugins: [
    sveltekit(),
    glslify()
  ],
	css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "src/variables.scss" as *;',
      },
    },
  },
};

export default config;
