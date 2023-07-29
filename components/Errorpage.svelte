<script>
  import {onMount} from "svelte";
  import Header from "./Header.svelte";

  export let data;
  let location = "";

  onMount(() => {
    location = window.location.pathname;
  });

  const {app} = data;
</script>
<Header {app}/>
<main>
<article>
  <h1>Page not found</h1>

  <p>
    The requested page <strong>{location}</strong> does not exist.
  </p>
</article>
</main>
