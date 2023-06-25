<script>
  import {onMount} from "svelte";
  import Header from "./Header.svelte";
  import Sidebar from "./Sidebar.svelte";
  import OnThisPage from "./OnThisPage.svelte";

  export let data;

  let {content, toc, app, sidebar} = data;

  const loadPage = async (pathname, add) => {
    const data = await fetch(`/static-page?pathname=${pathname}`);
    const page = await data.json();
    content = page.content;
    toc = page.toc;
    sidebar = page.sidebar;
    if (add) {
      history.pushState({}, "", pathname);
    }
  };

  onMount(() => {
    window.addEventListener("popstate", async () => {
      await loadPage(window.location.pathname);
    });
    window.addEventListener("click", async event => {
      const {target} = event;
      if (target.tagName === "A") {
        const current = window.location.pathname;
        const url = new URL(target.href);
        const next = url.pathname;
        // hosts must match
        if (url.host === window.location.host) {
          event.preventDefault();
          // pathname must differ
          if (current !== next) {
            await loadPage(next, true);
          }
        }
      }
    });
  });
</script>
<Header {app}/>
<main>
{#if sidebar !== undefined}
  <Sidebar {sidebar} />
{/if}
<article>
{@html content}
</article>
<OnThisPage {toc}/>
</main>
