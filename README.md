# Burn documentation

The documentation of the [Burn programming language](https://github.com/burnlang/burn): the language, the standard
library, the toolchain, how Burn works in the background, and the Burn Virtual Machine.

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

## License

GPL-3.0, like Burn itself.
