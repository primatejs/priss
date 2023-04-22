<script>
  import Header from "./Header.svelte";

  export let content, app;
</script>
<Header {app}/>
<main class="hero">
  <article>
  <h1>{app.title}</h1>
  <h2>{app.description}</h2>
  </article>
</main>
