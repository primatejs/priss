import {Path} from "runtime-compat/fs";

const name = "primate.config.js";

export const exists = async () => {
  try {
    return (await Path.root()).join(name).exists;
  } catch (error) {
    return false;
  }
};
