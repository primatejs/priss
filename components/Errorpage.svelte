<script>
  import Header from "./Header.svelte";

  export let data;

  const {app} = data;
</script>
<Header {app}/>
<article>
  <h1>Page not found</h1>

  <p>
    This page does not exist.
  </p>
</article>
