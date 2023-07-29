<script>
  import Header from "./Header.svelte";

  export let data;

  const format = {"day": "2-digit", "month": "short", "year": "numeric"};
  const date = epoch => new Date(epoch).toLocaleDateString("en-AU", format);

  let {app, posts} = data;

</script>
<Header {app}/>
<main>
<article>
  <h1>Blog</h1>
  {#each posts as post}
  <h2>
    <a href="/blog/{post.link}">{post.title}</a> {date(post.epoch)}
  </h2>
  {/each}
</article>
</main>
