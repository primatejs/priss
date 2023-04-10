import {marked} from "marked";
import {Path} from "runtime-compat/fs";
import svelte from "@primate/svelte";

const path = new Path(import.meta.url).directory.directory.join("components");
export default config => ({
  load() {
    return svelte(path);
  },
  async route({request, env}, next) {
    const {pathname} = request;
    // check if an .md file exists at this path
    const md = env.root.join(config.root).join(`${pathname}.md`);
    if (await md.exists) {
      const toc = [];
      const renderer = {
        heading(text, level) {
          const name = text.toLowerCase().replace(/[^\w]+/gu, "-");
          toc.push({level, text, name});

          return `
            <h${level}>
              <a name="${name}" class="anchor" href="#${name}">
                <span class="header-link"></span>
              </a>
              ${text}
            </h${level}>
          `;
        },
      };
      marked.use({renderer});
      const app = config;
      const content = marked.parse(await md.file.read());
      return env.handlers.svelte("StaticPage.svelte", {content, toc, app});
    }
    return next({request, env});
  },
});
