<script lang="ts">
  import { asset, resolve } from '$app/paths';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const BLURBS: Record<string, string> = {
    language: 'Variables, types, functions, match, structs, enums, generics, null safety and everything else.',
    stdlib: 'Built-in functions and the modules for math, strings, files, processes, JSON, HTTP and time.',
    tooling: 'The command line, projects and packages, testing, the REPL, formatting, editors and native builds.',
    internals: 'What happens in the background: the compiler, values in memory, reference counting and bvm.',
    bvm: 'The Burn Virtual Machine: its assembly, instructions, linking, archives, mixins and embedding.'
  };

  let home = $derived(data.page.slug === '');
  let activeId = $state('');

  $effect(() => {
    const ids = data.page.headings.map((h) => h.id);
    const elements = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => e !== null);
    if (elements.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          if (item.isIntersecting) {
            activeId = item.target.id;
            break;
          }
        }
      },
      { rootMargin: '-70px 0px -70% 0px' }
    );
    for (const e of elements) {
      observer.observe(e);
    }
    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <title>{home ? 'Burn documentation' : `${data.page.title} · Burn`}</title>
  <meta name="description" content={data.page.description} />
  <meta property="og:title" content={home ? 'Burn documentation' : data.page.title} />
  <meta property="og:description" content={data.page.description} />
</svelte:head>

{#if home}
  <section class="hero">
    <img src={asset('logo.svg')} alt="Burn logo" width="96" height="96" />
    <h1>Burn</h1>
    <p class="lead">{data.page.description}</p>
    <div class="actions">
      <a class="button primary" href={resolve('/[...slug]', { slug: 'getting-started' })}>Get started</a>
      <a class="button" href={resolve('/[...slug]', { slug: 'language/syntax' })}>Language tour</a>
      <a class="button" href="https://github.com/burnlang/burn">GitHub</a>
    </div>
  </section>
  <section class="cards" aria-label="Sections">
    {#each data.sections as s (s.id)}
      <a class="card" href={s.href}>
        <h2>{s.title}</h2>
        <p>{BLURBS[s.id] ?? ''}</p>
        <span class="more">{s.count} pages →</span>
      </a>
    {/each}
  </section>
{/if}

<div class="page" class:home>
  <article class="prose">
    {#if !home}
      <p class="crumb">{data.section}</p>
    {/if}
    {@html data.page.html}
    <footer>
      <a class="edit" href={data.page.editUrl}>Edit this page on GitHub</a>
      <nav class="pager" aria-label="Previous and next page">
        {#if data.prev}
          <a class="prev" href={data.prev.href}><span>Previous</span>{data.prev.title}</a>
        {:else}
          <span></span>
        {/if}
        {#if data.next}
          <a class="next" href={data.next.href}><span>Next</span>{data.next.title}</a>
        {/if}
      </nav>
    </footer>
  </article>
  {#if data.page.headings.length > 1}
    <aside class="toc" aria-label="On this page">
      <h2>On this page</h2>
      <ul>
        {#each data.page.headings as h (h.id)}
          <li class:sub={h.depth === 3}>
            <a href="#{h.id}" class:active={activeId === h.id}>{h.text}</a>
          </li>
        {/each}
      </ul>
    </aside>
  {/if}
</div>

<style>
  .page {
    display: flex;
    gap: 2.5rem;
    padding: 2rem 2.5rem 4rem;
  }

  .page.home {
    padding-top: 0.5rem;
  }

  article {
    flex: 1;
    max-width: 820px;
  }

  .crumb {
    margin: 0 0 0.4rem;
    font-size: 0.82rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--accent-strong);
  }

  .toc {
    position: sticky;
    top: calc(var(--header-h) + 2rem);
    align-self: flex-start;
    flex: 0 0 var(--toc-w);
    max-height: calc(100vh - var(--header-h) - 4rem);
    overflow-y: auto;
    font-size: 0.86rem;
  }

  .toc h2 {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-soft);
  }

  .toc ul {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 1px solid var(--border);
  }

  .toc li a {
    display: block;
    padding: 0.2rem 0 0.2rem 0.8rem;
    margin-left: -1px;
    border-left: 2px solid transparent;
    color: var(--fg-soft);
    line-height: 1.35;
  }

  .toc li.sub a {
    padding-left: 1.6rem;
  }

  .toc li a:hover {
    color: var(--fg);
    text-decoration: none;
  }

  .toc li a.active {
    color: var(--accent-strong);
    border-left-color: var(--accent);
  }

  footer {
    margin-top: 3rem;
    padding-top: 1.2rem;
    border-top: 1px solid var(--border);
  }

  .edit {
    font-size: 0.88rem;
  }

  .pager {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1.2rem;
  }

  .pager a {
    flex: 1;
    max-width: 48%;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--fg);
    font-weight: 600;
  }

  .pager a:hover {
    border-color: var(--accent);
    text-decoration: none;
  }

  .pager span {
    display: block;
    font-size: 0.78rem;
    font-weight: 400;
    color: var(--fg-soft);
  }

  .pager .next {
    text-align: right;
    margin-left: auto;
  }

  .hero {
    text-align: center;
    padding: 3.5rem 16px 2rem;
    background: radial-gradient(ellipse at top, var(--accent-soft), transparent 70%);
  }

  .hero h1 {
    margin: 0.6rem 0 0.4rem;
    font-size: 3rem;
    letter-spacing: -0.02em;
  }

  .lead {
    max-width: 640px;
    margin: 0 auto 1.6rem;
    font-size: 1.15rem;
    color: var(--fg-soft);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.7rem;
  }

  .button {
    padding: 0.6rem 1.2rem;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--bg);
    color: var(--fg);
    font-weight: 600;
  }

  .button:hover {
    border-color: var(--accent);
    text-decoration: none;
  }

  .button.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }

  :global(:root[data-theme='dark']) .button.primary {
    color: #1a0f08;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 1rem;
    padding: 1rem 2.5rem 1rem;
    max-width: 1120px;
  }

  .card {
    display: flex;
    flex-direction: column;
    padding: 1.1rem 1.2rem;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-soft);
    color: var(--fg);
  }

  .card:hover {
    border-color: var(--accent);
    text-decoration: none;
  }

  .card h2 {
    margin: 0 0 0.4rem;
    font-size: 1.05rem;
  }

  .card p {
    flex: 1;
    margin: 0 0 0.8rem;
    font-size: 0.9rem;
    color: var(--fg-soft);
  }

  .more {
    font-size: 0.85rem;
    color: var(--accent-strong);
    font-weight: 600;
  }

  @media (max-width: 1200px) {
    .toc {
      display: none;
    }
  }

  @media (max-width: 700px) {
    .page {
      padding: 1.4rem 16px 3rem;
    }

    .cards {
      padding: 1rem 16px;
    }

    .hero h1 {
      font-size: 2.4rem;
    }

    .pager {
      flex-direction: column;
    }

    .pager a {
      max-width: none;
    }
  }
</style>
