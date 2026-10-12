import GithubSlugger from 'github-slugger';
import { Marked, type Tokens } from 'marked';
import { createHighlighter, type LanguageRegistration } from 'shiki';
import burnGrammar from './burn.tmLanguage.json';
import bvmGrammar from './bvm.tmLanguage.json';
import type { Heading, NavSection, Page, PageLink, SearchEntry } from '#lib/types.ts';

const REPO = 'https://github.com/burnlang/docs';
const base = process.env.BASE_PATH ?? '';

const SECTIONS: Record<string, string> = {
  '': 'Introduction',
  language: 'Language',
  stdlib: 'Standard library',
  tooling: 'Tools',
  internals: 'How Burn works',
  bvm: 'The Burn VM'
};

const sources = import.meta.glob('/content/**/*.mdx', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const imageSources = import.meta.glob('/content/images/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const LANGS: Record<string, string> = {
  burn: 'burn',
  bn: 'burn',
  bvm: 'bvm',
  sh: 'shellscript',
  shell: 'shellscript',
  bash: 'shellscript',
  toml: 'toml',
  json: 'json',
  yaml: 'yaml',
  lua: 'lua',
  js: 'javascript',
  javascript: 'javascript',
  rust: 'rust',
  rs: 'rust'
};

const highlighter = await createHighlighter({
  themes: ['github-light', 'github-dark'],
  langs: [
    { ...(burnGrammar as unknown as LanguageRegistration), name: 'burn', aliases: ['bn'] },
    { ...(bvmGrammar as unknown as LanguageRegistration), name: 'bvm' },
    'shellscript',
    'toml',
    'json',
    'yaml',
    'lua',
    'javascript',
    'rust'
  ]
});

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseFrontMatter(src: string): { meta: Record<string, string>; body: string } {
  const meta: Record<string, string> = {};
  if (!src.startsWith('---\n')) {
    return { meta, body: src };
  }
  const end = src.indexOf('\n---', 4);
  for (const line of src.slice(4, end).split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) {
      meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return { meta, body: src.slice(src.indexOf('\n', end + 1) + 1) };
}

function routeOf(file: string): string {
  const slug = file.replace(/^\/content\//, '').replace(/\.mdx$/, '');
  return slug === 'index' ? '' : slug;
}

export function href(slug: string, hash = ''): string {
  return `${base}/${slug}${hash}`;
}

function resolveLink(target: string, file: string): string {
  if (/^([a-z]+:|#|\/)/i.test(target)) {
    return target;
  }
  const [path, hash] = target.split('#');
  const parts = file.replace(/^\/content\//, '').split('/');
  parts.pop();
  for (const seg of path.split('/')) {
    if (seg === '..') {
      parts.pop();
    } else if (seg !== '.' && seg !== '') {
      parts.push(seg);
    }
  }
  const joined = parts.join('/');
  const anchor = hash ? `#${hash}` : '';
  if (joined.endsWith('.mdx')) {
    return href(routeOf(`/content/${joined}`), anchor);
  }
  if (joined.startsWith('images/')) {
    return `${base}/${joined}`;
  }
  return target;
}

function highlight(code: string, lang: string): string {
  const name = LANGS[lang];
  const label = lang || 'text';
  const body = name
    ? highlighter.codeToHtml(code, {
        lang: name,
        themes: { light: 'github-light', dark: 'github-dark' },
        defaultColor: 'light'
      })
    : `<pre class="shiki plain"><code>${escapeHtml(code)}</code></pre>`;
  return `<div class="code-block"><div class="code-head"><span>${escapeHtml(label)}</span><button type="button" class="copy" aria-label="Copy code">Copy</button></div>${body}</div>`;
}

function render(file: string, body: string): { html: string; headings: Heading[] } {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(this: { parser: { parseInline(t: Tokens.Generic[]): string } }, token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        const text = stripTags(inner);
        const id = slugger.slug(text);
        if (token.depth >= 2 && token.depth <= 3) {
          headings.push({ depth: token.depth, text, id });
        }
        return `<h${token.depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true" tabindex="-1">#</a>${inner}</h${token.depth}>\n`;
      },
      code(token: Tokens.Code) {
        return highlight(token.text, (token.lang ?? '').trim().split(/\s+/)[0]);
      }
    },
    walkTokens(token) {
      if (token.type === 'link' || token.type === 'image') {
        token.href = resolveLink(token.href, file);
      }
    }
  });
  let html = marked.parse(body, { async: false }) as string;
  html = html
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/src="((?:\.\.?\/)+)?images\//g, `src="${base}/images/`)
    .replace(/<img (?![^>]*loading=)/g, '<img loading="lazy" ');
  return { html, headings };
}

function build(): Page[] {
  const pages: Page[] = [];
  for (const [file, src] of Object.entries(sources)) {
    const { meta, body } = parseFrontMatter(src);
    const slug = routeOf(file);
    const section = slug.includes('/') ? slug.slice(0, slug.indexOf('/')) : '';
    const { html, headings } = render(file, body);
    pages.push({
      slug,
      file: file.replace(/^\/content\//, ''),
      section,
      title: meta.title ?? slug,
      description: meta.description ?? '',
      order: Number(meta.order ?? 999),
      html,
      headings,
      text: stripTags(
        html
          .replace(/<a class="anchor"[^>]*>#<\/a>/g, '')
          .replace(/<div class="code-head">[\s\S]*?<\/div>/g, ' ')
      )
        .replace(/\s+/g, ' ')
        .trim(),
      editUrl: `${REPO}/edit/master/${file.replace(/^\//, '')}`
    });
  }
  pages.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  return pages;
}

export const pages = build();

export function sectionTitle(section: string): string {
  return SECTIONS[section] ?? section;
}

export function navigation(): NavSection[] {
  const sections: NavSection[] = [];
  for (const p of pages) {
    let s = sections.find((x) => x.id === p.section);
    if (!s) {
      s = { id: p.section, title: sectionTitle(p.section), pages: [] };
      sections.push(s);
    }
    s.pages.push({ slug: p.slug, title: p.title, href: href(p.slug) });
  }
  return sections;
}

export function ordered(): PageLink[] {
  return navigation().flatMap((s) => s.pages);
}

export function pageBySlug(slug: string): Page | undefined {
  return pages.find((p) => p.slug === slug);
}

export function searchIndex(): SearchEntry[] {
  return pages.map((p) => ({
    title: p.title,
    section: sectionTitle(p.section),
    href: href(p.slug),
    description: p.description,
    headings: p.headings.map((h) => ({ text: h.text, href: href(p.slug, `#${h.id}`) })),
    text: p.text
  }));
}

export const images: Record<string, string> = Object.fromEntries(
  Object.entries(imageSources).map(([path, svg]) => [path.slice(path.lastIndexOf('/') + 1), svg])
);
