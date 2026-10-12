import { error } from '@sveltejs/kit';
import { installCommand, ordered, pageBySlug, pages, sectionSummaries, sectionTitle } from '#lib/server/content.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => pages.map((p) => ({ slug: p.slug }));

function homeParts(html: string): { intro: string; sample: string; rest: string } {
  let rest = html.replace(/<p align="center">[\s\S]*?<\/p>\s*/, '').replace(/<h1[\s\S]*?<\/h1>\s*/, '');
  const intro = rest.match(/<p>[\s\S]*?<\/p>/)?.[0] ?? '';
  rest = rest.replace(intro, '');
  const sample = rest.match(/<div class="code-block"[\s\S]*?<\/pre><\/div>/)?.[0] ?? '';
  rest = rest.replace(sample, '');
  rest = rest.replace(/<h2 id="where-to-go-next"[\s\S]*$/, '');
  return { intro, sample, rest };
}

export const load: PageServerLoad = ({ params }) => {
  const page = pageBySlug(params.slug);
  if (!page) {
    error(404, 'This page does not exist');
  }
  const list = ordered();
  const i = list.findIndex((l) => l.slug === page.slug);
  const home = page.slug === '' ? homeParts(page.html) : null;
  return {
    page: {
      slug: page.slug,
      title: page.title,
      description: page.description,
      html: home ? home.rest : page.html,
      headings: page.headings,
      editUrl: page.editUrl
    },
    home: home ? { intro: home.intro, sample: home.sample, install: installCommand(), sections: sectionSummaries() } : null,
    section: sectionTitle(page.section),
    prev: i > 0 ? list[i - 1] : null,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : null
  };
};
