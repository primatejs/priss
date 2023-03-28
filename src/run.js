import args from "runtime-compat/args";
import * as commands from "./commands/exports.js";
import * as config from "./config.js";

const run2 = name => commands[name] ?? commands.help;
const run1 = async () => commands[await config.exists() ? "dev" : "create"];
const run = async name => name === undefined ? run1() : run2(name);

(await run(args[0]))();
