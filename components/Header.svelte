<script>
  import Icons from "./Icons.svelte";
  import Icon from "./Icon.svelte";

  export let app;
  const {theme} = app;

  let dark = false;

  const toggleColorScheme = () => {
    dark = !dark;
    document.body.classList.toggle("dark");
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
    <button class="ic" on:click={toggleColorScheme}>
      <Icon name={dark ? "sun": "moon"} />
    </button>
  </ul>

</header>
