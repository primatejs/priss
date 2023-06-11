<script>
  import Header from "./Header.svelte";

  export let data;

  const {content, app} = data;
</script>
<Header {app}/>
<main class="hero">
  <article>
    <img src="/logo.svg" />
    <h1>{app.title}</h1>
    <h2>{app.description}</h2>
    <div class="buttons">
      <a href="/guide/getting-started" class="primary">Read guide</a>
      <a href="https://github.com/primatejs/app" class="secondary">Template repo</a>
    </div>
  </article>
</main>
