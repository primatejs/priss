import {writable} from "svelte/store";

let theme;

if (globalThis.localStorage !== undefined) {
  theme = writable(localStorage.getItem("theme") || "light");

  theme.subscribe(theme => localStorage.setItem("theme", theme));
}

export default theme;
