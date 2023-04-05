<script>
  import Header from "./Header.svelte";
  import OnThisPage from "./OnThisPage.svelte";

  let nav = ["text0", "text1"];

  export let content, toc, app;
</script>
<Header {app}/>
<main>
<article>
{@html content}
</article>
<OnThisPage {toc}/>
</main>
