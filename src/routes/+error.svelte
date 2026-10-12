<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>{page.status} · Burn</title>
</svelte:head>

<div class="error">
  <p class="code">{page.status}</p>
  <h1>{page.status === 404 ? 'This page does not exist' : 'Something went wrong'}</h1>
  <p>{page.error?.message ?? ''}</p>
  <p><a href={resolve('/[...slug]', { slug: '' })}>Back to the start page</a> or press <kbd>/</kbd> to search.</p>
</div>

<style>
  .error {
    max-width: 640px;
    padding: 4rem 2.5rem;
  }

  .code {
    margin: 0;
    font-size: 3.5rem;
    font-weight: 800;
    color: var(--accent);
  }

  h1 {
    margin: 0 0 1rem;
  }

  kbd {
    font-family: var(--mono);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 0 0.35rem;
  }
</style>
