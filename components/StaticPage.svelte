<script>
  import Header from "./Header.svelte";
  import Aside from "./Aside.svelte";

  let nav = ["text0", "text1"];

  export let content, toc;
</script>
<Header {nav}/>
<main>
<article>
{@html content}
</article>
<Aside {toc}/>
</main>
