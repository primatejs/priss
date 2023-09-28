import hljs from "highlight.js/lib/core";

import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import http from "highlight.js/lib/languages/http";
import plaintext from "highlight.js/lib/languages/plaintext";
import md from "highlight.js/lib/languages/markdown";
import handlebars from "highlight.js/lib/languages/handlebars";
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("http", http);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("md", md);
hljs.registerLanguage("hbs", handlebars);

import {Path} from "runtime-compat/fs";
import esbuild from "@primate/esbuild";
import liveview from "@primate/liveview";
import {svelte, markdown} from "@primate/frontend";

const encode_title = title => title.toLowerCase().replaceAll(" ", "-");

const parse_title_object = (section, entry) => entry.heading
  ? entry
  : Object.entries(entry).map(([subsection, titles]) =>
    titles.map(title =>
      ({title, link: `/${section}/${subsection}/${encode_title(title)}`})))
    .flat();

const get_sidebar = (pathname, sidebar) => {
  const [, section] = pathname.split("/");
  return sidebar[section]
    ?.flatMap(title => typeof title === "string"
      ? {title, link: `/${section}/${encode_title(title)}`}
      : parse_title_object(section, title))
    .map(line =>
      line.link === pathname ? {...line, current: true} : line
    );
};

const get_page = async (env, config, pathname) => {
  const {location} = env.config;
  const base = env.runpath(location.server, config.root);
  const html = await base.join(`${pathname}.md.html`);
  if (!await html.exists) {
    return undefined;
  }
  const toc = await base.join(`${pathname}.md.json`);

  const repo = `https://github.com/${config.theme.github}`;
  const content = (await html.text())
    .replace("%REPO%", repo)
    .replace("%PATHNAME%", pathname);
  const sidebar = get_sidebar(pathname, config.theme.sidebar);
  if (sidebar === undefined) {
    return {content, toc: await toc.json(), sidebar};
  }

  const positions = sidebar.map((page, i) => ({...page, i}));
  const headings = positions.filter(page => page.title === undefined);
  const position = positions.findIndex(page => page.link === pathname);
  const {heading} = headings.findLast(({i}) => position > i);
  const pages = sidebar.filter(page => page.title !== undefined);
  const i = pages.findIndex(page => page.link === pathname);
  const page = {
    previous: i > 0 ? pages[i - 1] : undefined,
    next: i < pages.length - 1 ? pages[i + 1] : undefined,
    heading,
  };
  return {content, toc: await toc.json(), sidebar, page};
};

const handle_blog = async (env, config, pathname) => {
  if (pathname.startsWith("/blog")) {
    const directory = env.root.join(config.root, "blog");
    if (await directory.exists) {
      if (pathname === "/blog") {
        const posts = await Promise.all((await directory.collect(/^.*json$/u))
          .map(async path => ({...await path.json(), link: path.base})));
        posts.sort((a, b) => b.epoch - a.epoch);
        return env.handlers.svelte("priss/BlogIndex.svelte", {
          app: config,
          posts,
        });
      }
      const base = pathname.slice(5);
      try {
        const meta = await directory.join(`${base}.json`).json();
        const {content, toc} = await get_page(env, config, pathname);
        return env.handlers.svelte("priss/BlogPage.svelte", {
          content, toc, meta, app: config,
        });
      } catch (error) {
        // ignore the error and let Primate show an error page
      }
    }
  }
  return undefined;
};

const path = new Path(import.meta.url).directory.directory.join("components");
export default config => {
  const {blog} = config;
  let env;

  return {
    name: "priss",
    load() {
      return [
        svelte(),
        esbuild({
          ignores: ["woff2", "jpg"],
        }),
        liveview(),
        markdown({
          directory: config.root,
          options: {
            hooks: {
              postprocess(html) {
                return html.replaceAll(/!!!\n(.*?)\n!!!/gus, (_, p1) =>
                  `<div class="box">${p1}</div>`);
              },
            },
            renderer: {
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
                const href = "%REPO%/edit/master/docs%PATHNAME%.md";
                const editThisPage = `
                  <a href="${href}" class="edit-this-page">
                    <svg class="icon" width="16" height="16">
                      <use xlink:href="#edit" />
                    </svg>
                    Edit this page on GitHub
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
            },
          },
        }),
      ];
    },
    async compile(app, next) {
      const {location} = app.config;
      {
        const to = Path.join(location.components, "priss");
        await app.stage(path, to, /^.*.svelte$/u);
      }
      {
        const to = Path.join(location.server, location.components, "priss");
        await app.stage(path, to, /^.*.js$/u);
      }

      return next(app);
    },
    async publish(app, next) {
      const {location} = app.config;
      const to = Path.join(location.client, location.components, "priss");
      await app.stage(path, to, /^.*.js$/u);
      env = app;
      return next(app);
    },
    async handle(request, next) {
      const {pathname} = request.url;

      if (blog) {
        const handler = await handle_blog(env, config, pathname);
        if (handler !== undefined) {
          return handler(env, {}, request);
        }
      }

      const page = await get_page(env, config, pathname);
      if (page !== undefined) {
        return env.handlers.svelte("priss/StaticPage.svelte",
          {...page, app: config})(env, {}, request);
      }
      return next({...request, config});
    },
  };
};
