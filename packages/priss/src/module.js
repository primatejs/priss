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
import liveview from "@primate/liveview";

const encodeTitle = title => title.toLowerCase().replaceAll(" ", "-");

const parseTitleObject = (section, entry) => entry.heading
  ? entry
  : Object.entries(entry).map(([subsection, titles]) =>
    titles.map(title =>
      ({title, link: `/${section}/${subsection}/${encodeTitle(title)}`})))
    .flat();

const getSidebar = (pathname, sidebar) => {
  const [, section] = pathname.split("/");
  return sidebar[section]
    ?.flatMap(title => typeof title === "string"
      ? {title, link: `/${section}/${encodeTitle(title)}`}
      : parseTitleObject(section, title))
    .map(line =>
      line.link === pathname ? {...line, current: true} : line
    );
};

const getPage = async (root, config, pathname) => {
  const md = root.join(config.root, `${pathname}.md`);

  if (await md.exists) {
    const repo = `https://github.com/${config.theme.github}`;
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
        const caption = [...infostring
          .matchAll(/caption=(?<caption>.*)/ug)][0]?.groups.caption;
        const top = caption ? `<div class="caption">${caption}</div>` : "";
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
    return {content, toc, sidebar};
  }
};

const handleBlog = async (app, config, pathname) => {
  if (pathname.startsWith("/blog")) {
    const directory = app.root.join(config.root, "blog");
    if (await directory.exists) {
      if (pathname === "/blog") {
        const posts = await Promise.all((await directory.collect(/^.*json$/u))
          .map(async path => ({...await path.json(), link: path.base})));
        return app.handlers.svelte("priss/BlogIndex.svelte", {
          app: config,
          posts,
        });
      } else {
        const base = pathname.slice(5);
        try {
          const meta = await directory.join(`${base}.json`).json();
          const {content, toc} = await getPage(app.root, config, pathname);
          return app.handlers.svelte("priss/BlogPage.svelte", {
            content, toc, meta, app: config,
          });
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
  return undefined;
}

const path = new Path(import.meta.url).directory.directory.join("components");
export default config => {
  const {blog} = config;
  let app;

  return {
    name: "priss",
    async init(app$) {
      app = app$;
    },
    load() {
      return [
        svelte(),
        esbuild(),
        liveview(),
      ];
    },
    async compile(app, next) {
      const build = app.build.paths;
      await app.copy(path, build.components.join("priss"), /^.*.svelte$/u);
      await app.copy(path, build.server.join("priss"));

      return next(app);
    },
    async publish(app, next) {
      const build = app.build.paths;
      await app.copy(path, build.client.join(app.config.build.app, "priss"));
      return next(app);
    },
    async handle(request, next) {
      const {pathname} = request.url;

      if (blog) {
        const handler = await handleBlog(app, config, pathname);
        if (handler !== undefined) {
          return handler(app, {}, request);
        }
      }

      const page = await getPage(app.root, config, pathname);
      if (page !== undefined) {
        const {content, toc, sidebar} = page;
        return app.handlers.svelte("priss/StaticPage.svelte",
          {content, toc, app: config, sidebar})(app, {}, request);
      }
      return next({...request, config});
    },
  };
};
