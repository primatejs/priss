<script>
  import Header from "./Header.svelte"

  let nav = ["text0", "text1"];

  export let content;
</script>
<Header nav={nav} />
{@html content}
