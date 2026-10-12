<script lang="ts">
  import { resolve } from '$app/paths';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  let activeId = $state('');
  let copied = $state(false);

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

  async function copyInstall(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {}
  }
</script>

<svelte:head>
  <title>{data.home ? 'Burn documentation' : `${data.page.title} · Burn`}</title>
  <meta name="description" content={data.page.description} />
  <meta property="og:title" content={data.home ? 'Burn documentation' : data.page.title} />
  <meta property="og:description" content={data.page.description} />
</svelte:head>

{#if data.home}
  <div class="landing">
    <section class="intro">
      <div class="lede">
        <h1>Burn</h1>
        <p class="tagline">{data.page.description}</p>
        <div class="prose">{@html data.home.intro}</div>
        {#if data.home.install}
          <div class="install">
            <code>{data.home.install}</code>
            <button type="button" onclick={() => copyInstall(data.home!.install)}>{copied ? 'Copied' : 'Copy'}</button>
          </div>
        {/if}
        <p class="next-steps">
          <a class="primary" href={resolve('/[...slug]', { slug: 'getting-started' })}>Get started</a>
          <a href={resolve('/[...slug]', { slug: 'language/syntax' })}>Take the syntax tour</a>
        </p>
      </div>
      <div class="sample">{@html data.home.sample}</div>
    </section>

    <section class="map" aria-labelledby="map-title">
      <h2 id="map-title">The documentation</h2>
      <div class="columns">
        {#each data.home.sections as s (s.id)}
          <div class="area">
            <h3><a href={s.href}>{s.title}</a></h3>
            <p>{s.blurb}</p>
            <ul>
              {#each s.pages as p (p.slug)}
                <li><a href={p.href}>{p.title}</a></li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </section>

    <section class="more prose">
      {@html data.page.html}
    </section>
  </div>
{:else}
  <div class="page">
    <article class="prose">
      <p class="crumb">{data.section}</p>
      {@html data.page.html}
      <footer>
        <nav class="pager" aria-label="Previous and next page">
          {#if data.prev}
            <a class="prev" href={data.prev.href}><span>Previous</span>{data.prev.title}</a>
          {/if}
          {#if data.next}
            <a class="next" href={data.next.href}><span>Next</span>{data.next.title}</a>
          {/if}
        </nav>
        <p class="edit"><a href={data.page.editUrl}>Edit this page on GitHub</a></p>
      </footer>
    </article>
    {#if data.page.headings.length > 1}
      <aside class="toc" aria-label="On this page">
        <p class="toc-title">On this page</p>
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
{/if}

<style>
  .page {
    display: flex;
    justify-content: space-between;
    gap: 3rem;
    padding: 2.5rem 24px 5rem 3rem;
  }

  article {
    flex: 1;
    max-width: var(--measure);
  }

  .crumb {
    margin: 0 0 0.6rem;
    font-size: 0.85rem;
    color: var(--accent-ink);
    font-weight: 500;
  }

  .toc {
    position: sticky;
    top: calc(var(--header-h) + 2.5rem);
    align-self: flex-start;
    flex: 0 0 var(--toc-w);
    max-height: calc(100vh - var(--header-h) - 5rem);
    overflow-y: auto;
    font-size: 0.84rem;
    line-height: 1.4;
    scrollbar-width: thin;
  }

  .toc-title {
    margin: 0 0 0.6rem;
    font-weight: 600;
    color: var(--ink);
  }

  .toc ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .toc li a {
    display: block;
    padding: 0.22rem 0;
    color: var(--faint);
    text-decoration: none;
  }

  .toc li.sub a {
    padding-left: 0.9rem;
  }

  .toc li a:hover {
    color: var(--ink);
  }

  .toc li a.active {
    color: var(--accent-ink);
  }

  footer {
    margin-top: 4rem;
  }

  .pager {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding-top: 1.4rem;
    border-top: 1px solid var(--rule);
  }

  .pager a {
    font-family: var(--display);
    font-weight: 600;
    font-size: 1.08rem;
    color: var(--ink);
    text-decoration: none;
  }

  .pager a:hover {
    color: var(--accent-ink);
  }

  .pager span {
    display: block;
    margin-bottom: 0.15rem;
    font-family: var(--font);
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--faint);
  }

  .pager .next {
    grid-column: 2;
    text-align: right;
  }

  .edit {
    margin: 2rem 0 0;
    font-size: 0.85rem;
  }

  .edit a {
    color: var(--faint);
    text-decoration-color: var(--rule);
  }

  .landing {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px 5rem;
  }

  .intro {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
    gap: 4rem;
    align-items: center;
    padding: 5rem 0 4.5rem;
  }

  .intro h1 {
    margin: 0;
    font-family: var(--display);
    font-size: 4.6rem;
    font-weight: 750;
    line-height: 1;
    letter-spacing: -0.045em;
  }

  .tagline {
    margin: 1rem 0 1.25rem;
    font-family: var(--display);
    font-size: 1.45rem;
    font-weight: 500;
    line-height: 1.35;
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  .lede :global(.prose p) {
    color: var(--muted);
    margin: 0 0 1.6rem;
  }

  .install {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    max-width: 100%;
    padding: 0.6rem 0.6rem 0.6rem 0.9rem;
    background: var(--surface);
    border-radius: 6px;
  }

  .install code {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    white-space: nowrap;
    font-size: 0.8rem;
    scrollbar-width: none;
  }

  .install code::before {
    content: '$ ';
    color: var(--faint);
  }

  .install button {
    flex: 0 0 auto;
    padding: 0.2rem 0.6rem;
    font: 500 0.78rem var(--font);
    color: var(--muted);
    background: var(--bg);
    border: 1px solid var(--rule);
    border-radius: 4px;
    cursor: pointer;
  }

  .install button:hover {
    color: var(--ink);
  }

  .next-steps {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1.5rem;
    margin: 1.75rem 0 0;
  }

  .next-steps a {
    color: var(--ink);
    font-weight: 500;
    text-decoration: underline;
    text-decoration-color: var(--rule);
    text-underline-offset: 4px;
  }

  .next-steps a:hover {
    text-decoration-color: var(--accent);
  }

  .next-steps a.primary {
    padding: 0.55rem 1.1rem;
    color: #fff;
    background: var(--ink);
    border-radius: 6px;
    text-decoration: none;
  }

  :global(:root[data-theme='dark']) .next-steps a.primary {
    color: var(--bg);
  }

  .next-steps a.primary:hover {
    background: var(--accent-ink);
  }

  .sample :global(.code-block) {
    margin: 0;
    box-shadow: 0 1px 0 var(--rule), 0 24px 48px -28px rgb(60 30 10 / 0.35);
  }

  .sample :global(pre) {
    font-size: 0.84rem;
    padding: 1.3rem 1.4rem;
  }

  .map {
    padding: 3.5rem 0 1rem;
    border-top: 1px solid var(--rule);
  }

  .map h2 {
    margin: 0 0 2rem;
    font-family: var(--display);
    font-size: 1.6rem;
    font-weight: 650;
    letter-spacing: -0.015em;
  }

  .columns {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2.75rem 3rem;
  }

  .area h3 {
    margin: 0 0 0.4rem;
    font-family: var(--display);
    font-size: 1.15rem;
    font-weight: 650;
  }

  .area h3 a {
    color: var(--ink);
    text-decoration: none;
  }

  .area h3 a:hover {
    color: var(--accent-ink);
  }

  .area p {
    margin: 0 0 0.8rem;
    color: var(--muted);
    font-size: 0.92rem;
    line-height: 1.6;
  }

  .area ul {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 0.9rem;
  }

  .area li {
    padding: 0.18rem 0;
  }

  .area li a {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--rule);
    text-underline-offset: 3px;
  }

  .area li a:hover {
    text-decoration-color: var(--accent);
  }

  .more {
    max-width: var(--measure);
    padding-top: 1.5rem;
  }

  @media (max-width: 1240px) {
    .toc {
      display: none;
    }

    .page {
      padding-left: 3rem;
    }
  }

  @media (max-width: 960px) {
    .intro {
      grid-template-columns: minmax(0, 1fr);
      gap: 2.5rem;
      padding: 3rem 0;
    }

    .columns {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .page {
      padding: 2rem 24px 4rem;
    }
  }

  @media (max-width: 620px) {
    .landing {
      padding: 0 16px 4rem;
    }

    .intro h1 {
      font-size: 3.4rem;
    }

    .tagline {
      font-size: 1.2rem;
    }

    .columns {
      grid-template-columns: minmax(0, 1fr);
      gap: 2rem;
    }

    .page {
      padding: 1.5rem 16px 3rem;
    }

    .pager {
      grid-template-columns: minmax(0, 1fr);
      gap: 1.2rem;
    }

    .pager .next {
      grid-column: 1;
    }
  }
</style>
