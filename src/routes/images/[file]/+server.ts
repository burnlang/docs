import { error } from '@sveltejs/kit';
import { images } from '#lib/server/content.ts';
import type { EntryGenerator, RequestHandler } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => Object.keys(images).map((file) => ({ file }));

export const GET: RequestHandler = ({ params }) => {
  const svg = images[params.file];
  if (!svg) {
    error(404, 'No such image');
  }
  return new Response(svg, { headers: { 'content-type': 'image/svg+xml' } });
};
