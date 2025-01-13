import { detect, getNpmVersion } from "detect-package-manager";

export const pm = await detect();
export const pmv = await getNpmVersion(pm);
export const pkg = {
  name: "@reliverse/prompts",
  version: "1.4.5",
  description:
    "@reliverse/prompts is a powerful library that enables seamless, typesafe, and resilient prompts for command-line applications. Crafted with simplicity and elegance, it provides developers with an intuitive and robust way to build interactive CLIs.",
};
