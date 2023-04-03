<script>
  export let toc;
</script>

<aside>
<ul>
{#each toc as section}
<li>
  <a href="#{section.name}">{section.text}</a>
</li>
{/each}
</ul>
</aside>
