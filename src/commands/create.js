import {Path} from "runtime-compat/fs";
import package_json from "../../package.json" assert {type: "json"};
const name = "primate.config.js";

const space = 2;
const configModule = async () => {
  try {
    // will throw if cannot find a package.json up the filesystem hierarchy
    await Path.root();
  } catch (error) {
    const rootConfig = JSON.stringify({
      name: "priss-app",
      private: true,
      dependencies: {
        priss: `^${package_json.version}`,
      },
      scripts: {
        dev: "npm i && npx primate",
        serve: "npm i && npx primate serve",
      },
      type: "module",
    }, null, space);
    await Path.resolve().join("package.json").file.write(rootConfig);
  }
};

const configApp = async () => {
  const root = (await Path.root()).join(name);
  if (!await root.exists) {
    await root.file.write("");
  }
};

export default async () => {
  // create a package.json if not exists
  await configModule();
  // create a priss.config.js if not exists
  await configApp();
};
