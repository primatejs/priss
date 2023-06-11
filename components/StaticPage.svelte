<script>
  import Header from "./Header.svelte";
  import Sidebar from "./Sidebar.svelte";
  import OnThisPage from "./OnThisPage.svelte";

  export let data;

  const {content, toc, app, sidebar} = data;
</script>
<Header {app}/>
<main>
{#if sidebar !== undefined}
  <Sidebar {sidebar} />
{/if}
<article>
{@html content}
</article>
<OnThisPage {toc}/>
</main>
