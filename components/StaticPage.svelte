<script>
  import Header from "./Header.svelte";
  import Sidebar from "./Sidebar.svelte";
  import OnThisPage from "./OnThisPage.svelte";

  export let content, toc, app, sidebar;
</script>
<Header {app}/>
<main>
<Sidebar {sidebar} />
<article>
{@html content}
</article>
<OnThisPage {toc}/>
</main>
