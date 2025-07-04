import { getUserPkgManager } from "@reliverse/runtime";

export const pm = await getUserPkgManager();

export const reliversePrompts = {
  name: "@reliverse/rempts",
  version: "1.6.0",
  description:
    "@reliverse/rempts is a powerful library that enables seamless, typesafe, and resilient prompts for command-line applications. Crafted with simplicity and elegance, it provides developers with an intuitive and robust way to build interactive CLIs.",
};
