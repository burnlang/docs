export interface Heading {
  depth: number;
  text: string;
  id: string;
}

export interface Page {
  slug: string;
  file: string;
  section: string;
  title: string;
  description: string;
  order: number;
  html: string;
  headings: Heading[];
  text: string;
  editUrl: string;
}

export interface PageLink {
  slug: string;
  title: string;
  href: string;
}

export interface NavSection {
  id: string;
  title: string;
  pages: PageLink[];
}

export interface SearchEntry {
  title: string;
  section: string;
  href: string;
  description: string;
  headings: { text: string; href: string }[];
  text: string;
}
