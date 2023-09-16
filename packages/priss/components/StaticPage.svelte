<script>
  import Header from "./Header.svelte";
  import Sidebar from "./Sidebar.svelte";
  import OnThisPage from "./OnThisPage.svelte";

  export let content, toc, app, sidebar;

  const [{text: title}] = toc;
</script>
<Header {app} {title} />
<main>
{#if sidebar !== undefined}
  <Sidebar {sidebar} />
{/if}
<article>
{@html content}
</article>
<OnThisPage {toc}/>
</main>
