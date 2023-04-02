<script>
  export let toc;
</script>

<aside>
<ul>
{#each toc as section}
<li>{section.text}</li>
{/each}
</aside>
