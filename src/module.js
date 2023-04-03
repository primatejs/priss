import {marked} from "marked";
import {Path} from "runtime-compat/fs";
import svelte from "@primate/svelte";

export default config => async env => {
  const root = env.root.join(config.root);
  return {
    route: async (request, next) => {
      const {pathname} = request;
      // check if an .md file exists at this path
      const md = root.join(`${pathname}.md`);
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
        const content = marked.parse(await md.file.read());
        const path = new Path(import.meta.url).directory.directory
          .join("components");
        return svelte("StaticPage", {content, toc}, path);
      }
      return next(request);
    },
  };
};
