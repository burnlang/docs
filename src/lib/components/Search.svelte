<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import type { SearchEntry } from '#lib/types.ts';
  import { tick } from 'svelte';

  interface Result {
    title: string;
    section: string;
    href: string;
    detail: string;
    score: number;
  }

  let { open = $bindable(false) }: { open?: boolean } = $props();

  let query = $state('');
  let entries: SearchEntry[] | null = $state(null);
  let active = $state(0);
  let input: HTMLInputElement | undefined = $state();

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function highlight(text: string, words: string[]): string {
    let out = escapeHtml(text);
    for (const w of words) {
      const re = new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      out = out.replace(re, '<mark>$1</mark>');
    }
    return out;
  }

  function excerpt(text: string, word: string): string {
    const i = text.toLowerCase().indexOf(word);
    if (i < 0) {
      return text.slice(0, 140);
    }
    const start = Math.max(0, i - 60);
    const end = Math.min(text.length, i + 100);
    return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
  }

  let results: Result[] = $derived.by(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!entries || words.length === 0) {
      return [];
    }
    const out: Result[] = [];
    for (const e of entries) {
      const title = e.title.toLowerCase();
      const description = e.description.toLowerCase();
      const text = e.text.toLowerCase();
      if (!words.every((w) => title.includes(w) || description.includes(w) || text.includes(w))) {
        continue;
      }
      let score = 0;
      for (const w of words) {
        if (title.includes(w)) score += title.startsWith(w) ? 12 : 8;
        if (description.includes(w)) score += 3;
        if (text.includes(w)) score += 1;
      }
      const heading = e.headings.find((h) => words.every((w) => h.text.toLowerCase().includes(w)));
      if (heading) {
        out.push({
          title: e.title,
          section: e.section,
          href: heading.href,
          detail: highlight(heading.text, words),
          score: score + 6
        });
      } else {
        const detail = words.every((w) => description.includes(w))
          ? e.description
          : excerpt(e.text, words.find((w) => text.includes(w)) ?? words[0]);
        out.push({ title: e.title, section: e.section, href: e.href, detail: highlight(detail, words), score });
      }
    }
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, 12);
  });

  $effect(() => {
    if (open) {
      if (!entries) {
        fetch(resolve('/search.json'))
          .then((r) => r.json())
          .then((data: SearchEntry[]) => (entries = data));
      }
      tick().then(() => input?.focus());
    }
  });

  $effect(() => {
    query;
    active = 0;
  });

  function close() {
    open = false;
    query = '';
  }

  function choose(r: Result) {
    close();
    goto(r.href);
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      active = Math.min(active + 1, results.length - 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      active = Math.max(active - 1, 0);
    } else if (event.key === 'Enter' && results[active]) {
      event.preventDefault();
      choose(results[active]);
    }
  }
</script>

{#if open}
  <div class="backdrop" role="presentation" onclick={close}>
    <div
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Search the documentation"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={onkeydown}
    >
      <div class="field">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input
          bind:this={input}
          bind:value={query}
          type="search"
          placeholder="Search the docs"
          aria-label="Search the docs"
          autocomplete="off"
          spellcheck="false"
        />
        <kbd>Esc</kbd>
      </div>
      {#if query && entries === null}
        <p class="empty">Loading…</p>
      {:else if query && results.length === 0}
        <p class="empty">Nothing found for “{query}”.</p>
      {:else if results.length > 0}
        <ul>
          {#each results as r, i (r.href)}
            <li>
              <a
                href={r.href}
                class:active={i === active}
                onmouseenter={() => (active = i)}
                onclick={(e) => {
                  e.preventDefault();
                  choose(r);
                }}
              >
                <span class="where">{r.title} <span class="sec">{r.section}</span></span>
                <span class="detail">{@html r.detail}</span>
              </a>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="empty">Type to search titles, headings and text.</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgb(20 16 12 / 0.4);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 12vh 16px 16px;
  }

  .dialog {
    width: min(620px, 100%);
    max-height: 72vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    border: 1px solid var(--rule);
    border-radius: 8px;
    box-shadow: 0 30px 60px -30px rgb(0 0 0 / 0.45);
    overflow: hidden;
  }

  .field {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--rule);
    color: var(--faint);
  }

  input {
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-size: 1.05rem;
  }

  input::-webkit-search-cancel-button {
    display: none;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0.35rem 0;
    overflow-y: auto;
  }

  li a {
    display: block;
    padding: 0.6rem 1rem 0.6rem calc(1rem - 2px);
    border-left: 2px solid transparent;
    color: var(--ink);
    text-decoration: none;
  }

  li a.active {
    background: var(--surface);
    border-left-color: var(--accent);
  }

  .where {
    display: block;
    font-weight: 500;
    font-size: 0.93rem;
  }

  .sec {
    margin-left: 0.4rem;
    font-weight: 400;
    font-size: 0.8rem;
    color: var(--faint);
  }

  .detail {
    color: var(--muted);
    font-size: 0.84rem;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .empty {
    margin: 0;
    padding: 1.2rem 1rem;
    color: var(--faint);
    font-size: 0.92rem;
  }
</style>
