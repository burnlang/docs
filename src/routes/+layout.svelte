<script lang="ts">
  import '../app.css';
  import { afterNavigate } from '$app/navigation';
  import { asset, resolve } from '$app/paths';
  import { page } from '$app/state';
  import Search from '#lib/components/Search.svelte';
  import type { LayoutProps } from './$types';

  let { data, children }: LayoutProps = $props();

  let menuOpen = $state(false);
  let searchOpen = $state(false);
  let theme = $state<'light' | 'dark'>('light');
  let mac = $state(false);

  let home = $derived(page.params.slug === '');

  $effect(() => {
    theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    mac = /Mac|iPhone|iPad/.test(navigator.platform);
  });

  afterNavigate(() => {
    menuOpen = false;
  });

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }

  function onkeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !typing)) {
      event.preventDefault();
      searchOpen = true;
    }
  }

  async function onclick(event: MouseEvent) {
    const button = (event.target as HTMLElement).closest('.copy');
    if (!button) {
      return;
    }
    const code = button.closest('.code-block')?.querySelector('pre')?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(code.replace(/\n$/, ''));
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Failed';
    }
    setTimeout(() => (button.textContent = 'Copy'), 1500);
  }

  function current(href: string): boolean {
    return page.url.pathname === href || (href.endsWith('/') && page.url.pathname === href.slice(0, -1));
  }
</script>

<svelte:window {onkeydown} {onclick} />

<header>
  <div class="bar">
    <button class="menu" aria-label="Open the navigation" aria-expanded={menuOpen} onclick={() => (menuOpen = !menuOpen)}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </button>
    <a class="brand" href={resolve('/[...slug]', { slug: '' })}>
      <img src={asset('logo.svg')} alt="" width="22" height="22" />
      <span class="word">burn</span>
      <span class="slash">/</span>
      <span class="docs">docs</span>
    </a>
    <button class="search" onclick={() => (searchOpen = true)}>
      <span>Search the docs</span>
      <kbd>{mac ? '⌘' : 'Ctrl'} K</kbd>
    </button>
    <nav class="links" aria-label="Elsewhere">
      <a href="https://github.com/burnlang/burn">GitHub</a>
      <button class="theme" aria-label={theme === 'dark' ? 'Use the light theme' : 'Use the dark theme'} onclick={toggleTheme}>
        {#if theme === 'dark'}
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8" />
            <path
              d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
          </svg>
        {/if}
      </button>
    </nav>
  </div>
</header>

<div class="shell" class:home>
  <aside class:open={menuOpen}>
    <nav aria-label="Documentation">
      {#each data.nav as section (section.id)}
        <section>
          <h2>{section.title}</h2>
          <ul>
            {#each section.pages as link (link.slug)}
              <li>
                <a href={link.href} aria-current={current(link.href) ? 'page' : undefined}>{link.title}</a>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </nav>
  </aside>
  {#if menuOpen}
    <button class="scrim" aria-label="Close the navigation" onclick={() => (menuOpen = false)}></button>
  {/if}
  <main>
    {@render children()}
  </main>
</div>

<Search bind:open={searchOpen} />

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 30;
    background: var(--bg);
    border-bottom: 1px solid var(--rule);
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    height: var(--header-h);
    max-width: 1480px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    text-decoration: none;
    color: var(--ink);
  }

  .word {
    font-family: var(--display);
    font-weight: 700;
    font-size: 1.3rem;
    letter-spacing: -0.03em;
  }

  .slash {
    color: var(--rule);
    font-size: 1.2rem;
    margin: 0 -0.1rem;
  }

  .docs {
    color: var(--muted);
    font-size: 0.95rem;
  }

  .search {
    margin-left: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: min(280px, 34vw);
    padding: 0.35rem 0.45rem 0.35rem 0.75rem;
    font: inherit;
    font-size: 0.88rem;
    color: var(--faint);
    background: var(--surface);
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: text;
  }

  .search:hover {
    border-color: var(--rule);
  }

  .links {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    font-size: 0.92rem;
  }

  .links a {
    color: var(--muted);
    text-decoration: none;
  }

  .links a:hover {
    color: var(--ink);
  }

  .theme,
  .menu {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    color: var(--muted);
    background: none;
    border: 0;
    border-radius: 6px;
    cursor: pointer;
  }

  .theme:hover,
  .menu:hover {
    color: var(--ink);
  }

  .menu {
    display: none;
    margin-left: -6px;
  }

  .shell {
    display: flex;
    max-width: 1480px;
    margin: 0 auto;
  }

  aside {
    position: sticky;
    top: var(--header-h);
    flex: 0 0 var(--sidebar-w);
    height: calc(100vh - var(--header-h));
    overflow-y: auto;
    padding: 1.75rem 1.25rem 4rem 24px;
    scrollbar-width: thin;
  }

  .shell.home aside {
    display: none;
  }

  aside section + section {
    margin-top: 1.6rem;
  }

  aside h2 {
    margin: 0 0 0.35rem;
    font-family: var(--display);
    font-size: 0.95rem;
    font-weight: 650;
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  aside ul {
    list-style: none;
    margin: 0;
    padding: 0;
    border-left: 1px solid var(--rule);
  }

  aside a {
    display: block;
    margin-left: -1px;
    padding: 0.22rem 0 0.22rem 0.85rem;
    border-left: 2px solid transparent;
    color: var(--muted);
    font-size: 0.9rem;
    line-height: 1.4;
    text-decoration: none;
  }

  aside a:hover {
    color: var(--ink);
  }

  aside a[aria-current='page'] {
    color: var(--ink);
    font-weight: 500;
    border-left-color: var(--accent);
  }

  main {
    flex: 1;
    min-width: 0;
  }

  .scrim {
    display: none;
  }

  @media (max-width: 960px) {
    .bar {
      padding: 0 16px;
      gap: 0.75rem;
    }

    .menu {
      display: inline-flex;
    }

    .search {
      width: auto;
      flex: 1;
      max-width: 220px;
    }

    .search kbd {
      display: none;
    }

    .links a {
      display: none;
    }

    aside,
    .shell.home aside {
      display: block;
      position: fixed;
      z-index: 25;
      left: 0;
      top: var(--header-h);
      width: min(300px, 86vw);
      background: var(--bg);
      border-right: 1px solid var(--rule);
      padding-left: 20px;
      transform: translateX(-100%);
      visibility: hidden;
      transition:
        transform 0.2s ease,
        visibility 0.2s;
    }

    aside.open {
      transform: none;
      visibility: visible;
    }

    .scrim {
      display: block;
      position: fixed;
      inset: var(--header-h) 0 0 0;
      z-index: 20;
      border: 0;
      background: rgb(0 0 0 / 0.3);
    }
  }

  @media (max-width: 520px) {
    .docs,
    .slash {
      display: none;
    }

    .search span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
