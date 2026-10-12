import { error } from '@sveltejs/kit';
import { navigation, ordered, pageBySlug, pages, sectionTitle } from '#lib/server/content.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => pages.map((p) => ({ slug: p.slug }));

export const load: PageServerLoad = ({ params }) => {
  const page = pageBySlug(params.slug);
  if (!page) {
    error(404, 'This page does not exist');
  }
  const list = ordered();
  const i = list.findIndex((l) => l.slug === page.slug);
  let html = page.html;
  if (page.slug === '') {
    html = html.replace(/<p align="center">[\s\S]*?<\/p>\s*/, '').replace(/<h1[\s\S]*?<\/h1>\s*/, '');
  }
  return {
    page: {
      slug: page.slug,
      title: page.title,
      description: page.description,
      html,
      headings: page.headings,
      editUrl: page.editUrl
    },
    section: sectionTitle(page.section),
    sections:
      page.slug === ''
        ? navigation()
            .filter((s) => s.id !== '')
            .map((s) => ({ id: s.id, title: s.title, href: s.pages[0].href, count: s.pages.length }))
        : [],
    prev: i > 0 ? list[i - 1] : null,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : null
  };
};
