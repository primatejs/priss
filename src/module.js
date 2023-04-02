import {Path, File} from "runtime-compat/fs";
import {marked} from "marked";
import html from "@primate/html";
import * as svelte from "svelte/compiler";

const c = new Path(import.meta.url).directory.directory.join("components");
for (const component of await c.list(filename => filename.endsWith(".svelte"))) {
  const file = await component.file.read();
  const compiled = svelte.compile(file, {generate: "ssr"}).js.code
    .replaceAll(".svelte", ".svelte.js");
  await File.write(`${component.path}.js`, compiled);
}

export default config => async env => {
  const root = env.root.join(config.root);
  return {
    route: async (request, next) => {
      const toc = [];
      const renderer = {
        heading(text, level) {
          const escaped = text.toLowerCase().replace(/[^\w]+/gu, "-");
          toc.push({level, text});

          return `
            <h${level}>
              <a name="${escaped}" class="anchor" href="#${escaped}">
                <span class="header-link"></span>
              </a>
              ${text}
            </h${level}>
          `;
        },
      };
      marked.use({renderer});

      const {pathname} = request;
      // check if an .md file exists at this path
      const md = root.join(`${pathname}.md`);
      if (await md.exists) {
        const content = marked.parse(await md.file.read());
        const {html: _html} = (await import(`${c.join("StaticPage.svelte.js")}`))
          .default.render({content, toc});
        return html`${_html}`;
      }
      if (pathname.startsWith("/blog/")) {
        const directory = env.root.join("content", "blog");
        const [,, filename] = pathname.split("/");
        const md = directory.join(`${filename}.md`);
        if (await md.exists) {
          return html`${marked.parse(await md.file.read())}`;
        }
        return "blog.post";
      }
      return next(request);
    },
  };
};
