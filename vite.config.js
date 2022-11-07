import { sveltekit } from '@sveltejs/kit/vite';
import glslify from 'rollup-plugin-glslify';

const config = {
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
