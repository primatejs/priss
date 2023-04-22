import {marked} from "marked";
import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import bash from "highlight.js/lib/languages/bash";
import http from "highlight.js/lib/languages/http";
import plaintext from "highlight.js/lib/languages/plaintext";
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("http", http);
hljs.registerLanguage("plaintext", plaintext);

import {Path} from "runtime-compat/fs";
import svelte from "@primate/svelte";
import esbuild from "@primate/esbuild";

const getSidebar = (pathname, sidebar) => {
  const [, section] = pathname.split("/");
  return sidebar[section]
    .map(title => typeof title === "string"
      ? {title, link: `/${section}/${title.toLowerCase().replaceAll(" ", "-")}`}
      : title)
    .map(line =>
      line.link === pathname ? {...line, current: true} : line
    );
};

const path = new Path(import.meta.url).directory.directory.join("components");
export default config => {
  let app;

  return {
    load(_app) {
      app = _app;
      app.load(svelte({directory: path, entryPoints: [
        "StaticPage.svelte",
        "Homepage.svelte",
      ]}));
      app.load(esbuild());
    },
    async route(request, next) {
      const {pathname} = request.url;
      const repo = `https://github.com/${config.theme.github}`;
      // check if an .md file exists at this path
      const md = app.root.join(config.root, `${pathname}.md`);
      if (pathname === "/") {
        return app.handlers.svelte("Homepage.svelte", {app: config});
      }
      if (await md.exists) {
        const toc = [];
        const hooks = {
          postprocess(markdown) {
            return markdown.replaceAll(/!!!\n(.*?)\n!!!/gus, (_, p1) =>
              `<div class="box">${p1}</div>`);
          },
        };
        const renderer = {
          code(code, infostring) {
            const [language] = infostring.split(" ");
            const file = [...infostring
              .matchAll(/file=(?<file>.*)/ug)][0]?.groups.file;
            const top = file ? `<div class="filename">${file}</div>` : "";
            const {value} = hljs.highlight(code, {language});
            return `${top}<pre><code>${value}</code></pre>`;
          },
          heading(text, level) {
            const name = text.toLowerCase().replaceAll(/[?{}%]/gu, "")
              .replace(/[^\w]+/gu, "-");
            if (level > 1 || toc.length > 1) {
              toc.push({level, text, name});
            }
            const href = `${repo}/edit/master/docs${pathname}.md`;
            const editThisPage = `
              <a href="${href}" class="edit-this-page">
                <svg class="icon" width="16" height="16">
                  <use xlink:href="#edit" />
                </svg>
                Edit this page
              </a>
            `;

            return `
              <h${level}>
                ${text}
              </h${level}>
              <a name="${name}" class="anchor" href="#${name}">
                <span class="header-link"></span>
              </a>
              ${level === 1 ? editThisPage : ""}
            `;
          },
        };
        marked.use({renderer, hooks});
        const sidebar = getSidebar(pathname, config.theme.sidebar);
        const content = marked.parse(await md.file.read());
        return app.handlers.svelte("StaticPage.svelte",
          {content, toc, app: config, sidebar});
      }
      return next({...request, config});
    },
  };
};
