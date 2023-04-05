<script>
  import Icons from "./Icons.svelte";
  import Icon from "./Icon.svelte";

  export let app;
  const {theme} = app;

  const toggleColorScheme = () => {
    console.log("toggling!");
  }
</script>
<Icons />
<header>
  <a class="home" href="/">{app.title}</a>

  <div class="search"></div>

  <ul class="navbar">
    {#each theme.navbar as {link, label}}
    <li>
      <a href="{link}">{label}</a>
    </li>
    {/each}

    <div class="divider" />

    <a class="ic" href="https://github.com/{theme.github}">
      <Icon name="github" />
    </a>
    <a class="ic" on:click={toggleColorScheme}>
      <Icon name="sun" />
    </a>
  </ul>

</header>
