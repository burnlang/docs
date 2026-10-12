# Burn documentation

The documentation of the [Burn programming language](https://github.com/burnlang/burn): the language, the standard
library, the toolchain, how Burn works in the background, and the Burn Virtual Machine.

Read it at **https://burnlang.github.io/docs/**.

## Layout

```text
content/
├── index.mdx            the start page
├── getting-started.mdx
├── standards.mdx
├── migration.mdx
├── language/            the language reference
├── stdlib/              the standard library
├── tooling/             the command line, projects, editors and the other tools
├── internals/           how Burn works in the background
├── bvm/                 the Burn Virtual Machine
└── images/              diagrams (SVG)
```

Every page is Markdown with a short front matter:

```text
---
title: Enums
description: Plain enums, enums whose variants carry data, and how to take them apart.
order: 13
---
```

`order` sets the position of the page in the navigation. Links between pages are relative and point at the `.mdx`
file, like `[enums](../language/enums.mdx#variants-with-data)`, so they work on GitHub as well.

## Writing

- Every `burn` code block should be a complete program that runs with the current release and prints what the text
  says, unless it is clearly a fragment.
- Keep lines at most 120 characters, except in tables.
- Diagrams are hand-written SVG in `content/images/`, in the colors of the Burn logo, on a light card so they also
  read on dark backgrounds.

## The website

The site is a [SvelteKit](https://svelte.dev/docs/kit) app in `src/` that turns `content/` into static pages:

- every page is prerendered, so the result in `build/` is plain HTML that any static host serves;
- Burn code is highlighted with the TextMate grammar of the VS Code extension (`src/lib/server/burn.tmLanguage.json`),
  bvm assembly with a small grammar of its own;
- links between pages and to headings are checked while building: a broken link or a missing `#anchor` fails the
  build;
- search runs in the browser over `search.json`, built from the pages (press `/` or Ctrl+K).

```sh
npm install
npm run dev        # http://localhost:5173, reloads when content/ changes
npm run check      # type-check the site
npm run build      # write the static site to build/
npm run preview    # serve build/
```

Set `BASE_PATH` when the site is served from a subpath: `BASE_PATH=/docs npm run build` for GitHub Pages. Pushes to
`master` deploy it there.

## License

GPL-3.0, like Burn itself.
