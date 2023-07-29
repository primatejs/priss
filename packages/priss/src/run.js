import args from "runtime-compat/args";
import * as commands from "./commands/exports.js";
import * as config from "./config.js";

const command = name => commands[name] ?? commands.help;
const serveOrCreateConfig = async () => commands[await config.exists() ? "dev" : "create"];
const run = name => name === undefined ? serveOrCreateConfig() : command(name);

(await run(args[0]))();
