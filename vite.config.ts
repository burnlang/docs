import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ fallback: '404.html' }),
      paths: { base, relative: false },
      prerender: {
        handleHttpError: 'fail',
        handleMissingId: 'fail',
        handleUnseenRoutes: 'fail'
      }
    })
  ],
  server: { fs: { allow: ['content'] } }
});
