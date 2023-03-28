import {Path} from "runtime-compat/fs";

const name = "priss.config.js";

//export const exists = () => Path.root.join(name).exists;
export const exists = async () => (await Path.root).join(name).exists;
