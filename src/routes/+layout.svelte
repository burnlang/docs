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

  $effect(() => {
    theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
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
  <button class="icon menu" aria-label="Open the navigation" aria-expanded={menuOpen} onclick={() => (menuOpen = !menuOpen)}>
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>
  <a class="brand" href={resolve('/[...slug]', { slug: '' })}>
    <img src={asset('logo.svg')} alt="" width="30" height="30" />
    <span>Burn</span>
    <span class="tag">docs</span>
  </a>
  <button class="search" onclick={() => (searchOpen = true)}>
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <span>Search</span>
    <kbd>/</kbd>
  </button>
  <nav class="links" aria-label="External links">
    <a href="https://github.com/burnlang/burn" class="icon" aria-label="Burn on GitHub">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
        />
      </svg>
    </a>
    <button class="icon" aria-label={theme === 'dark' ? 'Use the light theme' : 'Use the dark theme'} onclick={toggleTheme}>
      {#if theme === 'dark'}
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" stroke-width="2" />
          <path
            d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
        </svg>
      {/if}
    </button>
  </nav>
</header>

<div class="shell">
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
    height: var(--header-h);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 16px;
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--fg);
    font-weight: 700;
    font-size: 1.15rem;
    text-decoration: none;
  }

  .tag {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--accent-strong);
    background: var(--accent-soft);
    border-radius: 999px;
    padding: 0.05rem 0.5rem;
  }

  .search {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
    width: min(320px, 40vw);
    padding: 0.4rem 0.7rem;
    font: inherit;
    font-size: 0.9rem;
    color: var(--fg-soft);
    background: var(--bg-soft);
    border: 1px solid var(--border);
    border-radius: 9px;
    cursor: pointer;
  }

  .search span {
    flex: 1;
    text-align: left;
  }

  .search kbd {
    font-size: 0.72rem;
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 0 0.35rem;
  }

  .links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: var(--fg-soft);
    background: transparent;
    border: 0;
    border-radius: 8px;
    cursor: pointer;
  }

  .icon:hover {
    color: var(--fg);
    background: var(--bg-soft);
    text-decoration: none;
  }

  .menu {
    display: none;
  }

  .shell {
    display: flex;
    max-width: 1440px;
    margin: 0 auto;
  }

  aside {
    position: sticky;
    top: var(--header-h);
    flex: 0 0 var(--sidebar-w);
    height: calc(100vh - var(--header-h));
    overflow-y: auto;
    padding: 1.2rem 0.8rem 3rem 16px;
    border-right: 1px solid var(--border);
  }

  aside h2 {
    margin: 1.1rem 0 0.3rem;
    padding-left: 0.6rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--fg-soft);
  }

  aside section:first-child h2 {
    margin-top: 0;
  }

  aside ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  aside a {
    display: block;
    padding: 0.28rem 0.6rem;
    border-radius: 7px;
    color: var(--fg);
    font-size: 0.92rem;
    line-height: 1.4;
  }

  aside a:hover {
    background: var(--bg-soft);
    text-decoration: none;
  }

  aside a[aria-current='page'] {
    background: var(--accent-soft);
    color: var(--accent-strong);
    font-weight: 600;
  }

  main {
    flex: 1;
    min-width: 0;
  }

  .scrim {
    display: none;
  }

  @media (max-width: 900px) {
    .menu {
      display: inline-flex;
    }

    .search span {
      display: none;
    }

    .search {
      width: auto;
    }

    .search kbd {
      display: none;
    }

    .brand .tag {
      display: none;
    }

    aside {
      position: fixed;
      z-index: 25;
      left: 0;
      top: var(--header-h);
      width: min(300px, 85vw);
      background: var(--bg);
      transform: translateX(-100%);
      visibility: hidden;
      transition:
        transform 0.2s ease,
        visibility 0.2s;
    }

    aside.open {
      transform: none;
      visibility: visible;
      box-shadow: var(--shadow);
    }

    .scrim {
      display: block;
      position: fixed;
      inset: var(--header-h) 0 0 0;
      z-index: 20;
      border: 0;
      background: rgb(20 12 6 / 0.35);
    }
  }
</style>
